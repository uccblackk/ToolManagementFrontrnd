<template>
  <v-row justify="center">
    <v-col cols="5">
      <div style="width:100%;text-align:right">
        <!-- <v-progress-circular
          :rotate="-90"
          :size="140"
          :width="20"
          :value="OEE"
          color="primary"
        >
          <span class="text-h5 font-weight-bold">
            {{ OEE + " %" }}
          </span>
        </v-progress-circular> -->
        <div id="OEEPieChart" style="height:18vh"></div>
      </div>
    </v-col>
    <v-col cols="4">
      <div class="mt-2" style="width:100%;text-align:left">
        {{ "時間稼動" }}
        <v-progress-linear
          :value="utilization"
          color="primary"
          striped
          rounded
          height="25"
        >
          <template v-slot:default="{ value }">
            <span v-if="value > 40" style="color:white">
              <strong>{{ Math.ceil(utilization) }}%</strong>
            </span>
            <span v-else>
              <strong>{{ Math.ceil(utilization) }}%</strong>
            </span>
          </template>
        </v-progress-linear>
      </div>
      <div style="width:100%;text-align:left">
        {{ "產能效率" }}
        <v-progress-linear
          :value="performance"
          color="primary"
          striped
          rounded
          height="25"
        >
          <template v-slot:default="{ value }">
            <span v-if="value > 40" style="color:white">
              <strong>{{ Math.ceil(performance) }}%</strong>
            </span>
            <span v-else>
              <strong>{{ Math.ceil(performance) }}%</strong>
            </span>
          </template>
        </v-progress-linear>
      </div>
      <div style="width:100%;text-align:left">
        {{ "良品率" }}
        <v-progress-linear
          :value="yieldValue"
          color="primary"
          striped
          rounded
          height="25"
        >
          <template v-slot:default="{ value }">
            <span v-if="value > 40" style="color:white">
              <strong>{{ Math.ceil(yieldValue) }}%</strong>
            </span>
            <span v-else>
              <strong>{{ Math.ceil(yieldValue) }}%</strong>
            </span>
          </template>
        </v-progress-linear>
      </div>
    </v-col>
  </v-row>
</template>
<script>
import moment from "moment";

export default {
  props: {
    oeeData: {},
    dates: null
  },
  data() {
    return {
      chart: null,
      skill: 65,
      utilization: 0,
      performance: 0,
      yieldValue: 0,
      OEE: 0,
      search: "",
      isDescending: true,
      isLoading: 1,
      page: 1,
      pageCount: 0,
      itemsPerPage: 3,
      errorCodeData: {},
      machineStatusData: [],
      percentData: [],
      statusArr: ["1", "2", "5", "7"],
      pieDataPoint: [
        { label: "1", y: 0, color: "#01B468", status: this.$t("status1") },
        { label: "2", y: 0, color: "red", status: this.$t("status2") },
        { label: "5", y: 0, color: "#FFBB77", status: this.$t("status5") },
        { label: "7", y: 0, color: "black", status: this.$t("status7") }
      ],
      dataPoints: [],
      pastData: [],
      pieHeight: null,
      pieWidth: null,
      barHeight: null,
      barWidth: null,
      headers: [
        {
          text: this.$t("No"),
          align: "left",
          sortable: true,
          value: "sn",
          filterable: false,
          width: "5%"
        },
        {
          text: this.$t("error") + this.$t("No"),
          value: "label",
          align: "left",

          width: "10%"
        },
        {
          text: this.$t("alarmOccurCount"),
          value: "y",
          align: "left",
          sortable: true,
          width: "10%"
        }
      ]
    };
  },

  methods: {
    transData() {
      // console.log(this.data.map(e => e.machineId));
      this.dataPoints = [];
      const token = this.$store.state.authUser.token;
      const id = this.id;

      // console.log(this.data);

      if (this.data == undefined) {
        return;
      }

      let selectStartDate = new Date(this.dates[0] + " 00:00:00");
      let selectEndDate = new Date(this.dates[1] + " 23:59:59");
      //console.log(this.data);
      if (this.data.length >= 2) {
        for (let i = 2; i < this.data.length; i++) {
          let lastDateTime = null;
          let nextDateTime = null;
          if (i > 1) {
            if (this.data[i - 1] != null) {
              lastDateTime = new Date(this.data[i - 1].time);
            }
          }
          //console.log(this.data.length);

          if (i < this.data.length - 1) {
            // console.log(k);
            // console.log(i);
            if (this.data[i + 1] != null) {
              nextDateTime = new Date(this.data[i + 1].time);
            }
          }
          let item = null;

          let startTime = new Date();
          let endTime = new Date();
          let actualStartTime = new Date(this.data[i].time);
          if (
            actualStartTime >= selectStartDate &&
            actualStartTime <= selectEndDate
          ) {
            //首段加上過去狀態
            if (i == 2) {
              item = this.getItem(
                selectStartDate,
                new Date(this.data[i].time),
                new Date(this.data[1].time),
                new Date(this.data[i].time),
                this.data[1].status
              );
              //this.dataPoints.push(item);
            }
            // console.log(new Date(this.data[i].time).days);
            // console.log(lastDateTime.days);
            if (lastDateTime != null && this.data[i - 1].status != null) {
              if (
                new Date(this.data[i].time).toISOString().substr(0, 10) !=
                lastDateTime.toISOString().substr(0, 10)
              ) {
                let dataDate = new Date(this.data[i].time);
                item = this.getItem(
                  new Date(
                    dataDate.getFullYear(),
                    dataDate.getMonth(),
                    dataDate.getDate(),
                    0,
                    0,
                    0
                  ),
                  new Date(this.data[i].time),
                  new Date(this.data[i - 1].time),
                  new Date(this.data[i].time),
                  this.data[i - 1].status
                );
                this.dataPoints.push(item);
              }
            }
            //  console.log(nextDateTime);
            if (nextDateTime != null) {
              if (
                new Date(this.data[i].time).toISOString().substr(0, 10) !=
                nextDateTime.toISOString().substr(0, 10)
              ) {
                // console.log(nextDateTime);
                let dataDate = new Date(this.data[i].time);
                item = this.getItem(
                  new Date(this.data[i].time),
                  new Date(
                    dataDate.getFullYear(),
                    dataDate.getMonth(),
                    dataDate.getDate(),
                    23,
                    59,
                    59
                  ),
                  new Date(this.data[i].time),
                  nextDateTime,
                  this.data[i].status
                );

                this.dataPoints.push(item);
                continue;
              }
            } else {
              // 若當前數據為最後一筆數據
              //該日期不等於所選日期區間的最後一天
              // 則將該日期用
              if (
                new Date(this.data[i].time).toISOString().substr(0, 10) !=
                selectEndDate.toISOString().substr(0, 10)
              ) {
                let dataDate = new Date(this.data[i].time);
                item = this.getItem(
                  new Date(this.data[i].time),
                  new Date(
                    dataDate.getFullYear(),
                    dataDate.getMonth(),
                    dataDate.getDate(),
                    23,
                    59,
                    59
                  ),
                  new Date(this.data[i].time),
                  new Date(),
                  this.data[i].status
                );

                this.dataPoints.push(item);
                continue;
              } else {
                //該日期為所選日期區間的最後一天
                // 則下一筆數據可能不選擇的日期區間內,需要取得並繪出,圖面上的結束時間為選擇日期區間最後一天的23:59:59
                //且該數據確實為該設備的最新一筆數據,this.data[0]最新數據=null
                if (this.data[0].status == null) {
                  let dataDate = new Date(this.data[i].time);
                  item = this.getItem(
                    new Date(this.data[i].time),
                    new Date(),
                    new Date(this.data[i].time),
                    new Date(),
                    this.data[i].status
                  );
                  this.dataPoints.push(item);
                  continue;
                } else {
                  let dataDate = new Date(this.data[i].time);
                  item = this.getItem(
                    new Date(this.data[i].time),
                    new Date(
                      dataDate.getFullYear(),
                      dataDate.getMonth(),
                      dataDate.getDate(),
                      23,
                      59,
                      59
                    ),
                    new Date(this.data[i].time),
                    new Date(this.data[0].time),
                    this.data[i].status
                  );
                  this.dataPoints.push(item);
                  continue;
                }
              }
            }

            startTime = new Date(this.data[i].time);
            if (i == this.data.length - 1) {
              endTime = new Date();
              //  console.log(endTime);
            } else {
              endTime = new Date(this.data[i + 1].time);
            }

            item = this.getItem(
              startTime,
              endTime,
              actualStartTime,
              endTime,
              this.data[i].status
            );

            this.dataPoints.push(item);
          }
        }

        let dateArray = [];
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
          //console.log(dateArray);

          for (let k = 0; k < dateArray.length; k++) {
            let existData = this.data.find(
              x =>
                new Date(x.time) >= dateArray[k].startDate &&
                new Date(x.time) <= dateArray[k].endDate
            );
            if (existData == undefined) {
              if (this.data.length != 1) {
                //小於所選開始時間的最新一筆資料
                let statusData = this.data.filter(
                  x => new Date(x.time) <= dateArray[k].startDate
                );
                let statusDetail = statusData[statusData.length - 1];

                if (
                  statusDetail.status != null &&
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
                  this.dataPoints.push(item);
                } else if (this.data.length >= 3) {
                  if (
                    dateArray[k].startDate.toISOString() >
                    new Date(
                      new Date(this.data[2].time).getFullYear(),
                      new Date(this.data[2].time).getMonth(),
                      new Date(this.data[2].time).getDate(),
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

                    this.dataPoints.push(item);
                  } else if (this.data[1].status != null) {
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

                      new Date(this.data[1].time),
                      new Date(this.data[2].time),
                      statusDetail.status
                    );
                    //console.log(item);
                    this.dataPoints.push(item);
                  }
                } else if (this.data[1].status != null) {
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

                    new Date(this.data[1].time),
                    new Date(this.data[0].time),
                    statusDetail.status
                  );
                  //console.log(item);
                  this.dataPoints.push(item);
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
                endTime.setDate(new Date(dateArray[k].startDate).getDate() + 1);
                let item = this.getItem(
                  dateArray[k].startDate,
                  endTime,

                  new Date(this.data[1].time),
                  new Date(),
                  this.data[1].status
                );
                //console.log(item);
                this.dataPoints.push(item);
              }
            }
          }
        }
      }
      //console.log(this.pieDataPoint);
      // console.log(this.pieDataPoint.find(x => x.y != 0));
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
          this.pieDataPoint[0].y += diff.asSeconds();
          break;
        case "5":
          color = "#FFBB77";
          this.pieDataPoint[2].y += diff.asSeconds();
          break;
        case "7":
          color = "black";
          this.pieDataPoint[3].y += diff.asSeconds();
          break;
        case "2":
          color = "red";
          this.pieDataPoint[1].y += diff.asSeconds();
          break;
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
        label3: this.$t("status" + status),
        label5: "N/A",
        label6: `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`
      };

      return item;
    },
    renderData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      console.log(this.OEE);
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("OEEPieChart", {
          theme: "light2", // "light1", "light2", "dark1", "dark2"
          // exportEnabled: true,
          // animationEnabled: true,
          title: {
            verticalAlign: "center",
            text: this.OEE.toString() + " %",
            fontSize: 24,
            fontColor: "black"
          },
          animationDuration: 10,
          explodeOnClick: false,
          data: [
            {
              type: "doughnut",
              startAngle: -90,

              showInLegend: false,

              toolTipContent: `<b>OEE : {text}%</b>`,
              dataPoints: this.dataPoints
            }
          ]
          // height: 50
        });
      } else {
        this.chart.options.data[0].dataPoints = this.dataPoints;
      }
      setTimeout(() => {
        this.chart.render();
      }, 200);
    }
  },
  mounted() {
    // this.transData();
    // this.renderData();
    //   this.renderProportionChart();
    // console.log(this.width);
    // console.log(this.height);
    if (this.oeeData.utilization > 1) {
      this.oeeData.utilization = 1;
    }

    if (this.oeeData.performance > 1) {
      this.oeeData.performance = 1;
    }

    if (this.oeeData.yield > 1) {
      this.oeeData.yield = 1;
    }

    this.utilization = this.oeeData.utilization * 100;
    this.performance = this.oeeData.performance * 100;
    this.yieldValue = this.oeeData.yield * 100;
    this.OEE =
      this.oeeData.utilization *
      this.oeeData.performance *
      this.oeeData.yield *
      100;
    this.OEE = Math.floor(this.OEE * 10) / 10;
    if (this.OEE == 0) {
      this.dataPoints = [{ y: 100, color: "grey", text: "0" }];
    } else {
      this.dataPoints = [
        { y: this.OEE, color: "#2894FF", text: this.OEE.toString() },
        { y: 100 - this.OEE, color: "grey", text: this.OEE.toString() }
      ];
    }
    //   console.log(this.dataPoints);
    this.renderData();
  },
  created() {
    //  console.log(this.oeeData);
  },
  watch: {
    oeeData() {
      // console.log(this.oeeData);
      // this.isLoading = 1;
      // this.machineStatusData = this.data;
      // this.getParetoDataPoints();
      // this.renderProportionChart();
    }
  },
  head() {
    return {};
  }
};
</script>
