<template>
  <div style="width: 100%;">
    <v-card id="info-box" :loading="loading">
      <template slot="progress">
        <v-progress-linear
          color="primary"
          height="5"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-card-title class="text-h5 font-weight-bold">
        {{ $t("Utilization") + $t("trend") }}
        <v-spacer />
        <span class="caption">
          {{ dates[0] + "~" + dates[1] }}
        </span>
      </v-card-title>

      <v-card-text>
        <div
          id="UtilizationTrendChart"
          style="height:230px"
          ref="UtilizationTrendChart"
        ></div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import moment from "moment";
import mqtt from "mqtt";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    areaNo: {}
  },
  data() {
    return {
      statusArr: ["1", "2", "5", "7"],
      height: null,
      machineData: [],

      mqttData: [],
      mqttClient: {},
      runningCount: 0,
      idleCount: 0,
      errorCount: 0,
      disconnectCount: 0,
      dataTableHeight: 0,
      dates: [],
      percentData: [],
      chart: null,
      loading: false,
      intervalID: null,
      timerId: null
    };
  },
  methods: {
    transData(totalData) {
      // console.log(this.data.map(e => e.machineId));
      let dataPoints = [];
      let totalPercentData = [];
      const token = this.$store.state.authUser.token;
      const id = this.id;

      let dateArray = [];
      let selectStartDate = new Date(this.dates[0] + " 00:00:00");
      let selectEndDate = new Date(this.dates[1] + " 23:59:59");

      // console.log(this.data);

      // if (this.data == undefined) {
      //   return;
      // }
      let percentData = [];
      if (totalData != undefined) {
        totalData.forEach(data => {
          selectStartDate = new Date(this.dates[0] + " 00:00:00");
          selectEndDate = new Date(this.dates[1] + " 23:59:59");
          dataPoints = [];
          let machineStatusData = data.machineStatus;
          // console.log(machineStatusData[0]);
          if (machineStatusData.length >= 2) {
            for (let i = 2; i < machineStatusData.length; i++) {
              let lastDateTime = null;
              let nextDateTime = null;
              //  console.log(machineStatusData[i]);
              if (i > 1) {
                if (machineStatusData[i - 1] != null) {
                  lastDateTime = new Date(machineStatusData[i - 1].time);
                }
              }
              //console.log(data.length);
              let k = machineStatusData.length - 1;

              if (i < k) {
                // console.log(k);
                // console.log(i);
                if (machineStatusData[i + 1] != null) {
                  nextDateTime = new Date(machineStatusData[i + 1].time);
                }
              }
              let item = null;

              let startTime = new Date();
              let endTime = new Date();
              let actualStartTime = new Date(machineStatusData[i].time);
              if (
                actualStartTime >= selectStartDate &&
                actualStartTime <= selectEndDate
              ) {
                //首段加上過去狀態
                if (i == 2) {
                  item = this.getItem(
                    selectStartDate,
                    new Date(machineStatusData[i].time),
                    new Date(machineStatusData[1].time),
                    new Date(machineStatusData[i].time),
                    machineStatusData[1].status
                  );
                  //dataPoints.push(item);
                }
                // console.log(new Date(data[i].time).days);
                // console.log(lastDateTime.days);
                if (
                  lastDateTime != null &&
                  machineStatusData[i - 1].status != null
                ) {
                  if (
                    new Date(machineStatusData[i].time)
                      .toISOString()
                      .substr(0, 10) != lastDateTime.toISOString().substr(0, 10)
                  ) {
                    let dataDate = new Date(machineStatusData[i].time);
                    item = this.getItem(
                      new Date(
                        dataDate.getFullYear(),
                        dataDate.getMonth(),
                        dataDate.getDate(),
                        0,
                        0,
                        0
                      ),
                      new Date(machineStatusData[i].time),
                      new Date(machineStatusData[i - 1].time),
                      new Date(machineStatusData[i].time),
                      machineStatusData[i - 1].status
                    );
                    dataPoints.push(item);
                  }
                }
                //  console.log(nextDateTime);
                if (nextDateTime != null) {
                  if (
                    new Date(machineStatusData[i].time)
                      .toISOString()
                      .substr(0, 10) != nextDateTime.toISOString().substr(0, 10)
                  ) {
                    // console.log(nextDateTime);
                    let dataDate = new Date(machineStatusData[i].time);
                    item = this.getItem(
                      new Date(machineStatusData[i].time),
                      new Date(
                        dataDate.getFullYear(),
                        dataDate.getMonth(),
                        dataDate.getDate(),
                        23,
                        59,
                        59
                      ),
                      new Date(machineStatusData[i].time),
                      nextDateTime,
                      machineStatusData[i].status
                    );

                    dataPoints.push(item);
                    continue;
                  }
                } else {
                  // 若當前數據為最後一筆數據
                  //該日期不等於所選日期區間的最後一天
                  // 則將該日期用
                  if (
                    new Date(machineStatusData[i].time)
                      .toISOString()
                      .substr(0, 10) !=
                    selectEndDate.toISOString().substr(0, 10)
                  ) {
                    let dataDate = new Date(machineStatusData[i].time);
                    item = this.getItem(
                      new Date(machineStatusData[i].time),
                      new Date(
                        dataDate.getFullYear(),
                        dataDate.getMonth(),
                        dataDate.getDate(),
                        23,
                        59,
                        59
                      ),
                      new Date(machineStatusData[i].time),
                      new Date(),
                      machineStatusData[i].status
                    );

                    dataPoints.push(item);
                    continue;
                  } else {
                    //該日期為所選日期區間的最後一天
                    // 則下一筆數據可能不選擇的日期區間內,需要取得並繪出,圖面上的結束時間為選擇日期區間最後一天的23:59:59
                    //且該數據確實為該設備的最新一筆數據,this.data[0]最新數據=null
                    if (machineStatusData[0].status == null) {
                      let dataDate = new Date(machineStatusData[i].time);
                      item = this.getItem(
                        new Date(machineStatusData[i].time),
                        new Date(),
                        new Date(machineStatusData[i].time),
                        new Date(),
                        machineStatusData[i].status
                      );
                      dataPoints.push(item);
                      continue;
                    } else {
                      //該日期為所選日期區間的最後一天
                      // 下一筆數據可能不選擇的日期區間內,需要取得並繪出,圖面上的結束時間為選擇日期區間最後一天的23:59:59
                      //且該數據確實為該設備的最新一筆數據,this.data[0]最新數據!=null
                      let dataDate = new Date(machineStatusData[i].time);
                      item = this.getItem(
                        new Date(machineStatusData[i].time),
                        new Date(
                          dataDate.getFullYear(),
                          dataDate.getMonth(),
                          dataDate.getDate(),
                          23,
                          59,
                          59
                        ),
                        new Date(machineStatusData[i].time),
                        new Date(machineStatusData[0].time),
                        machineStatusData[i].status
                      );
                      dataPoints.push(item);
                      continue;
                    }
                  }
                }

                startTime = new Date(machineStatusData[i].time);
                if (i == machineStatusData.length - 1) {
                  endTime = new Date();
                  //  console.log(endTime);
                } else {
                  endTime = new Date(machineStatusData[i + 1].time);
                }

                item = this.getItem(
                  startTime,
                  endTime,
                  actualStartTime,
                  endTime,
                  machineStatusData[i].status
                );

                dataPoints.push(item);
              }
            }
            dateArray = [];
            // selectStartDate = new Date(this.dates[0] + " 00:00:00");
            // selectEndDate = new Date(this.dates[1] + " 23:59:59");
            if (this.dates.length > 0) {
              const diff = moment.duration(
                selectEndDate.getTime() - selectStartDate.getTime()
              );
              for (let i = 0; i <= diff.days(); i++) {
                selectStartDate = new Date(this.dates[0] + " 00:00:00");
                selectStartDate.setDate(selectStartDate.getDate() + i);
                let startDate = new Date(
                  selectStartDate.getFullYear(),
                  selectStartDate.getMonth(),
                  selectStartDate.getDate(),
                  0,
                  0,
                  0
                );

                selectStartDate.setDate(selectStartDate.getDate() + 1);
                let endDate = new Date(
                  selectStartDate.getFullYear(),
                  selectStartDate.getMonth(),
                  selectStartDate.getDate(),
                  0,
                  0,
                  0
                );

                dateArray.push({ startDate: startDate, endDate: endDate });
              }
            }
            // if (data.name == "CNC02") {
            // console.log(dateArray);
            // }

            for (let k = 0; k < dateArray.length; k++) {
              let existData = machineStatusData.find(
                x =>
                  new Date(x.time) >= dateArray[k].startDate &&
                  new Date(x.time) <= dateArray[k].endDate
              );

              if (existData == undefined) {
                if (machineStatusData.length != 1) {
                  //小於所選開始時間的最新一筆資料
                  let statusData = machineStatusData.filter(
                    x => new Date(x.time) <= dateArray[k].startDate
                  );
                  let statusDetail = statusData[statusData.length - 1];
                  //console.log(statusData);
                  if (
                    dateArray[k].startDate.toISOString() ==
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      new Date().getDate(),
                      0,
                      0,
                      0
                    ).toISOString()
                  ) {
                    let item = this.getItem(
                      dateArray[k].startDate,
                      new Date(),

                      new Date(statusDetail.time),
                      new Date(),
                      statusDetail.status
                    );
                    // console.log("X");
                    dataPoints.push(item);
                  } else if (machineStatusData.length >= 3) {
                    if (
                      dateArray[k].startDate.toISOString() >
                      new Date(
                        new Date(machineStatusData[2].time).getFullYear(),
                        new Date(machineStatusData[2].time).getMonth(),
                        new Date(machineStatusData[2].time).getDate(),
                        0,
                        0,
                        0
                      ).toISOString()
                    ) {
                      let endTime = new Date(
                        dateArray[k].startDate.getFullYear(),
                        dateArray[k].startDate.getMonth(),
                        dateArray[k].startDate.getDate(),
                        0,
                        0,
                        0
                      );

                      endTime.setDate(
                        new Date(dateArray[k].startDate).getDate() + 1
                      );
                      //console.log(endTime);
                      let item = this.getItem(
                        dateArray[k].startDate,
                        endTime,

                        new Date(statusDetail.time),
                        new Date(),
                        statusDetail.status
                      );

                      dataPoints.push(item);
                    } else if (machineStatusData[1].status != null) {
                      let endTime = new Date(
                        dateArray[k].startDate.getFullYear(),
                        dateArray[k].startDate.getMonth(),
                        dateArray[k].startDate.getDate(),
                        0,
                        0,
                        0
                      );
                      endTime.setDate(
                        new Date(dateArray[k].startDate).getDate() + 1
                      );
                      let item = this.getItem(
                        dateArray[k].startDate,
                        endTime,

                        new Date(machineStatusData[1].time),
                        new Date(machineStatusData[2].time),
                        statusDetail.status
                      );
                      //console.log(item);
                      dataPoints.push(item);
                    }
                  } else if (machineStatusData[1].status != null) {
                    let endTime = new Date(
                      dateArray[k].startDate.getFullYear(),
                      dateArray[k].startDate.getMonth(),
                      dateArray[k].startDate.getDate(),
                      0,
                      0,
                      0
                    );
                    endTime.setDate(
                      new Date(dateArray[k].startDate).getDate() + 1
                    );
                    let item = this.getItem(
                      dateArray[k].startDate,
                      endTime,

                      new Date(machineStatusData[1].time),
                      new Date(machineStatusData[0].time),
                      statusDetail.status
                    );
                    //console.log(item);
                    dataPoints.push(item);
                  }
                } else {
                  let endTime = new Date(
                    dateArray[k].startDate.getFullYear(),
                    dateArray[k].startDate.getMonth(),
                    dateArray[k].startDate.getDate(),
                    0,
                    0,
                    0
                  );
                  endTime.setDate(
                    new Date(dateArray[k].startDate).getDate() + 1
                  );
                  let item = this.getItem(
                    dateArray[k].startDate,
                    endTime,

                    new Date(machineStatusData[1].time),
                    new Date(),
                    machineStatusData[1].status
                  );
                  //console.log(item);
                  dataPoints.push(item);
                }
              }
            }
            // console.log(dateArray);
            // console.log(this.dataPoints);

            for (let k = 0; k < dateArray.length; k++) {
              let detailPercentData = [];
              for (let j = 0; j < this.statusArr.length; j++) {
                var dp = dataPoints.filter(
                  x =>
                    new Date(x.startTime) >= new Date(dateArray[k].startDate) &&
                    new Date(x.endTime) <= new Date(dateArray[k].endDate) &&
                    x.status == this.statusArr[j]
                );
                let diffMin = 0;

                // console.log(dateArray[k]);
                for (let i = 0; i < dp.length; i++) {
                  const diffDay = Math.floor(
                    (dp[i].endTime - dp[i].startTime) / 1000 / 60 / 60 / 24
                  );
                  const start =
                    dp[i].startTime.getHours() * 60 +
                    dp[i].startTime.getMinutes() +
                    dp[i].startTime.getSeconds() / 60;
                  const end =
                    diffDay * 1440 +
                    dp[i].endTime.getHours() * 60 +
                    dp[i].endTime.getMinutes() +
                    dp[i].endTime.getSeconds() / 60;
                  diffMin +=
                    Math.floor(end * 100) / 100 - Math.floor(start * 100) / 100;
                }
                let color = "red";
                //console.log(e.status + ". " + startHour + "~" + endHour);
                switch (this.statusArr[j]) {
                  case "1":
                    color = "#01B468";
                    break;
                  case "5":
                    color = "#FFBB77";
                    break;
                  case "7":
                    color = "black";
                    break;
                  case "2":
                    color = "red";
                    break;
                }

                let item = {
                  x: new Date(
                    new Date(dateArray[k].startDate).getFullYear(),
                    new Date(dateArray[k].startDate).getMonth(),
                    new Date(dateArray[k].startDate).getDate()
                  ),
                  startTime: dateArray[k].startTime,
                  endTime: dateArray[k].endTime,
                  status: this.statusArr[j],
                  name: this.$t("status" + this.statusArr[j]),
                  y: diffMin,
                  color: color
                  // label: dateArray[k].startDate
                };
                // console.log(item);
                detailPercentData.push(item);
              }
              percentData.push(detailPercentData);
            }
          }
        });
      }
      //   console.log(percentData);

      for (let k = 0; k < dateArray.length; k++) {
        let time = [0, 0, 0, 0];
        for (let i = 0; i < this.statusArr.length; i++) {
          percentData.forEach(data => {
            let detail = data.filter(
              x => x.x.toISOString() == dateArray[k].startDate.toISOString()
            );
            // console.log(data[i].x);
            // console.log(dateArray[k].startDate);
            // if (
            //   data[i].x.toISOString() == dateArray[k].startDate.toISOString()
            // ) {
            //   console.log(data[i].x);
            // }
            if (detail.length > 0) {
              time[i] += detail[i].y;
              //   console.log(detail);
            }
            //
          });
          let color = "red";
          //console.log(e.status + ". " + startHour + "~" + endHour);
          switch (this.statusArr[i]) {
            case "1":
              color = "#01B468";
              break;
            case "5":
              color = "#FFBB77";
              break;
            case "7":
              color = "black";
              break;
            case "2":
              color = "red";
              break;
          }
          let item = {
            x: new Date(
              new Date(dateArray[k].startDate).getFullYear(),
              new Date(dateArray[k].startDate).getMonth(),
              new Date(dateArray[k].startDate).getDate()
            ),
            status: this.statusArr[i],
            name: this.$t("status" + this.statusArr[i]),
            y: time[i],
            color: color
            // label: dateArray[k].startDate
          };
          totalPercentData.push(item);
        }
      }

      return totalPercentData;
      //  console.log(this.percentData);
    },
    getItem(startTime, endTime, actualStartTime, actualEndTime, status) {
      // console.log(startTime);
      // console.log(endTime);
      const diffDay = Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24);
      // console.log(diffDay);
      const diff = moment.duration(
        actualEndTime.getTime() - actualStartTime.getTime()
      );
      const startHour =
        startTime.getHours() +
        startTime.getMinutes() / 60 +
        startTime.getSeconds() / 3600;
      const endHour =
        diffDay * 24 +
        endTime.getHours() +
        endTime.getMinutes() / 60 +
        endTime.getSeconds() / 3600;
      let color = "red";
      //console.log(e.status + ". " + startHour + "~" + endHour);
      switch (status) {
        case "1":
          color = "#01B468";
          break;
        case "5":
          color = "#FFBB77";
          break;
        case "7":
          color = "black";
          break;
        case "2":
          color = "red";
          break;
      }
      let statusString = "";
      if (status != null) {
        statusString = this.$t("status" + status);
      }

      let item = {
        x: new Date(
          startTime.getFullYear(),
          startTime.getMonth(),
          startTime.getDate()
        ),
        startTime: startTime,
        endTime: endTime,
        status: status,
        y: [startHour, endHour],
        color: color,
        label1: moment(actualStartTime).format("YYYY/MM/DD HH:mm:ss"),
        label2: moment(actualEndTime).format("YYYY/MM/DD HH:mm:ss"),
        label3: statusString,
        label5: "N/A",
        label6: `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`
      };

      return item;
    },
    renderData(totalPercentData) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      // let chart = null;
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("UtilizationTrendChart", {
          animationEnabled: true,
          animationDuration: 50,
          // exportEnabled: true,

          dataPointMaxWidth: 30,
          dataPointMinWidth: 0.1,
          zoomType: "y",
          axisX: {
            interval: 1,
            valueFormatString: "YYYY/M/DD",
            intervalType: "day",
            labelFontSize: 12
          },
          axisY: {
            interval: 10,
            suffix: "%",
            gridThickness: 0
          },
          zoomEnabled: true,

          legend: { cursor: "pointer" },
          data: [
            {
              xValueFormatString: "YYYY/MM/DD",
              type: "stackedColumn100",
              toolTipContent: "{x}<br><b>{name}:</b> #percent% ({y} min)",
              dataPoints: totalPercentData
            }
          ]
        });
      } else {
        this.chart.options.data[0].dataPoints = totalPercentData;
      }

      // console.log(this.percentData);
      this.chart.render();
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async GetUtilizationData() {
      await this.sleep(1);
      let totalPercentData = [];
      const token = this.$store.state.authUser.token;
      this.percentData = [];
      let totalData = [];
      this.loading = true;
      //   console.log(this.dates);
      this.$axios
        .$get(
          `/MachineStatus/GetAllMachineStatus?startTime=${this.dates[0]}&endTime=${this.dates[1]}&areaNo=${this.areaNo}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          totalData = res.data;
          // console.log(this.totalData);
          totalPercentData = this.transData(totalData);
          this.renderData(totalPercentData);
          this.dates = [
            moment().format("YYYY-MM-DD"),
            moment().format("YYYY-MM-DD")
          ];
          this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
            .add(-6, "days")
            .format("YYYY-MM-DD");
          this.loading = false;

          this.timerId = setTimeout(this.GetUtilizationData, 10000);
        })
        .catch(({ response }) => {
          this.loading = false;
          this.timerId = setTimeout(this.GetUtilizationData, 10000);
        });
    }
  },
  beforeDestroy() {
    // clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    //console.log(this.intervalID);
  },
  mounted() {
    clearTimeout(this.timerId);
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
      .add(-6, "days")
      .format("YYYY-MM-DD");
    //三十秒更新一次
    // this.intervalID = setInterval(this.GetUtilizationData, 10000);
    this.GetUtilizationData();
  },
  watch: {
    areaNo() {
      clearTimeout(this.timerId);
      this.GetUtilizationData();
    }
  },
  created() {},
  activated() {
    clearTimeout(this.timerId);
    if (this.chart != null) {
      this.chart.render();
    }
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
      .add(-6, "days")
      .format("YYYY-MM-DD");
    this.GetUtilizationData();
  },
  deactivated() {
    clearTimeout(this.timerId);
    // console.log(this.intervalID);
  },
  head() {
    return {};
  }
};
</script>
<style></style>
