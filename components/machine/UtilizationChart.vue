<template>
  <div style="width: 100%; height: auto">
    <div
      id="machineUtilizationChart"
      style="width:100%; height: 50vh"
      ref="utilizationChart"
    ></div>
  </div>
</template>
<script>
import moment from "moment";

export default {
  props: {
    data: {},
    dates: null
  },
  data() {
    return {
      chart: null,
      percentData: [],
      statusArr: ["1", "2", "5", "7"],
      dataPoints: [],
      pastData: [],
      height: null,
      width: null
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
              if (this.data[1].status != null) {
                item = this.getItem(
                  selectStartDate,
                  new Date(this.data[i].time),
                  new Date(this.data[1].time),
                  new Date(this.data[i].time),
                  this.data[1].status
                );
              }
              //  console.log(item);
              if (item != null) {
                this.dataPoints.push(item);
              }
            }
            // console.log(new Date(this.data[i].time).days);
            // console.log(lastDateTime.days);
            if (lastDateTime != null && this.data[i - 1].status != null) {
              // console.log(lastDateTime + lastDateTime.getDay());
              // console.log(
              //   new Date(this.data[i].time) +
              //     new Date(this.data[i].time).getDay()
              // );
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
              // if (
              //   new Date(this.data[i].time).toISOString().substr(0, 10) !=
              //   selectEndDate.toISOString().substr(0, 10)
              // ) {
              //   let dataDate = new Date(this.data[i].time);
              //   item = this.getItem(
              //     new Date(this.data[i].time),
              //     new Date(
              //       dataDate.getFullYear(),
              //       dataDate.getMonth(),
              //       dataDate.getDate(),
              //       23,
              //       59,
              //       59
              //     ),
              //     new Date(this.data[i].time),
              //     new Date(),
              //     this.data[i].status
              //   );

              //   this.dataPoints.push(item);
              //   continue;
              // } else {
              //該日期為所選日期區間的最後一天
              // 則下一筆數據可能不選擇的日期區間內,需要取得並繪出,圖面上的結束時間為選擇日期區間最後一天的23:59:59
              //且該數據確實為該設備的最新一筆數據,this.data[0]最新數據=null
              if (
                new Date(this.data[i].time).toISOString().substr(0, 10) ==
                new Date().toISOString().substr(0, 10)
              ) {
                //若沒有該時間以外沒有最新一筆資料的時間, 代表當前區間內的最後一筆資料是最新的狀態, 需要延伸此狀態
                //console.log(this.data);
                let dataDate = new Date(this.data[i].time);
                console.log(new Date(this.data[i].time).toLocaleTimeString());
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
                //console.log(this.data[0].id);
                let end = new Date();
                if (this.data[0].id != null) {
                  end = new Date(this.data[0].time);
                }
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
                  end,
                  this.data[i].status
                );
                //console.log(this.data);
                this.dataPoints.push(item);
                continue;
              }
              //}
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
          // console.log(selectEndDate.getTime());
          // console.log(selectStartDate.getTime());
          // console.log(diff);
          for (let i = 0; i <= diff.months() * 30 + diff.days(); i++) {
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
            //console.log(dateArray[k].startDate);
            //console.log(this.data);
            if (existData == undefined) {
              if (this.data.length != 1) {
                //小於所選開始時間的最新一筆資料
                let statusData = this.data.filter(
                  x => new Date(x.time) <= dateArray[k].startDate
                );
                statusData.sort(function(a, b) {
                  return a.time.localeCompare(b.time);
                });
                //大於所選結束時間的最新一筆資料
                let nextStatusData = this.data.filter(
                  x => new Date(x.time) > dateArray[k].endDate
                );
                nextStatusData.sort(function(a, b) {
                  return a.time.localeCompare(b.time);
                });
                let nextStatus = nextStatusData[0];
                let statusDetail = statusData[statusData.length - 1];
                //console.log(statusData);
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
                  console.log("0");
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
                    dateArray[k].startDate >
                    new Date(
                      new Date(this.data[2].time).getFullYear(),
                      new Date(this.data[2].time).getMonth(),
                      new Date(this.data[2].time).getDate(),
                      0,
                      0,
                      0
                    )
                  ) {
                    let status = statusDetail.status;
                    console.log("1");
                    let endTime = new Date(
                      dateArray[k].startDate.getFullYear(),
                      dateArray[k].startDate.getMonth(),
                      dateArray[k].startDate.getDate(),
                      0,
                      0,
                      0
                    );
                    let endDate = new Date();
                    if (nextStatus != undefined) {
                      endDate = new Date(nextStatus.time);
                    }
                    endTime.setDate(
                      new Date(dateArray[k].startDate).getDate() + 1
                    );
                    if (dateArray[k].startDate > new Date()) {
                      //continue;

                      endTime = dateArray[k].startDate;
                      status = "";
                      endDate = new Date(statusDetail.time);
                    }
                    //console.log(dateArray[k].startDate);
                    //console.log(nextStatusData);
                    let item = this.getItem(
                      dateArray[k].startDate,
                      endTime,

                      new Date(statusDetail.time),
                      endDate,
                      status
                    );

                    this.dataPoints.push(item);
                  } else if (this.data[1].status != null) {
                    console.log("2");
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
                  } else if (
                    dateArray[k].endDate < new Date(this.data[2].time)
                  ) {
                    console.log("8");
                    let status = "";

                    let item = this.getItem(
                      dateArray[k].startDate,
                      dateArray[k].startDate,

                      dateArray[k].startDate,
                      dateArray[k].startDate,
                      status
                    );
                    //console.log(item);
                    this.dataPoints.push(item);
                  }
                } else if (this.data[1].status != null) {
                  console.log("9");
                  let status = statusDetail.status;
                  let endTime = new Date(
                    dateArray[k].startDate.getFullYear(),
                    dateArray[k].startDate.getMonth(),
                    dateArray[k].startDate.getDate(),
                    0,
                    0,
                    0
                  );
                  let endDate = new Date(this.data[0].time);
                  if (this.data[0].id == null) {
                    endDate = new Date();
                  }
                  endTime.setDate(
                    new Date(dateArray[k].startDate).getDate() + 1
                  );
                  if (dateArray[k].startDate > new Date()) {
                    //continue;
                    endTime = dateArray[k].startDate;
                    status = "";
                  }
                  //console.log("100");
                  let item = this.getItem(
                    dateArray[k].startDate,
                    endTime,

                    new Date(this.data[1].time),
                    endDate,
                    status
                  );
                  //console.log(item);
                  this.dataPoints.push(item);
                } else if (
                  this.data[1].status == null &&
                  this.data.length == 2
                ) {
                  let item = this.getItem(
                    dateArray[k].startDate,
                    dateArray[k].startDate,

                    dateArray[k].startDate,
                    dateArray[k].startDate,
                    ""
                  );
                  //console.log(item);
                  this.dataPoints.push(item);
                }
              } else {
                console.log("4");
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
            } else {
            }
          }
        }
      }
      console.log(this.dataPoints);
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
      //console.log(moment(actualEndTime).format("YYYY/MM/DD HH:mm:ss"));
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
      // let chart = null;
      // if (this.width != null) {
      //   this.chart = new CanvasJS.Chart("machineUtilizationChart", {
      //     animationEnabled: true,
      //     animationDuration: 50,
      //     exportEnabled: true,
      //     dataPointMaxWidth: 50,
      //     dataPointMinWidth: 0.1,
      //     zoomType: "xy",
      //     axisX: {
      //       interval: 1,
      //       valueFormatString: "YYYY/M/DD",
      //       intervalType: "day",
      //       labelFontSize: 12
      //     },
      //     zoomEnabled: true,
      //     axisY: { minimum: 0, maximum: 24, interval: 1 },
      //     legend: { cursor: "pointer" },
      //     data: [
      //       {
      //         type: "rangeBar",
      //         toolTipContent:
      //           "<b>{label1} ~ {label2}</b><br/><b>狀態</b> : {label3}<br/><b>加工程式</b> : {label5} <br/><b>持續持間</b> : {label6} ",
      //         dataPoints: this.dataPoints
      //       }
      //     ],
      //     height: this.height,
      //     width: this.width
      //   });
      // } else {
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("machineUtilizationChart", {
          animationEnabled: true,
          animationDuration: 50,
          exportEnabled: true,
          dataPointMaxWidth: 50,
          dataPointMinWidth: 0.1,
          zoomType: "xy",
          axisX: {
            interval: 1,
            valueFormatString: "YYYY/M/DD",
            intervalType: "day",
            labelFontSize: 12
          },
          zoomEnabled: true,
          axisY: { minimum: 0, maximum: 24, interval: 1 },
          legend: { cursor: "pointer" },
          data: [
            {
              type: "rangeBar",
              toolTipContent:
                "<b>{label1} ~ {label2}</b><br/><b>狀態</b> : {label3}<br/><b>加工程式</b> : {label5} <br/><b>持續持間</b> : {label6} ",
              dataPoints: this.dataPoints
            }
          ]
          // height: 300
        });
        // }
      } else {
        this.chart.options.data[0].dataPoints = this.dataPoints;
      }
      setTimeout(() => {
        this.chart.render();
      }, 200);
    }
  },
  mounted() {
    //console.log("mounted");
    this.points = this.data;
    this.transData();
    this.renderData();
    // const {
    //   width,
    //   height
    // } = this.$refs.utilizationChart.getBoundingClientRect();
    // this.width = width;
    // this.height = height;
  },
  activated() {
    //console.log("activated");
  },
  created() {},
  watch: {
    data() {
      this.transData();
      this.renderData();
    }
  },
  head() {
    return {};
  }
};
</script>
<style>
.echarts {
  width: 1000px;
  height: 400px;
}
</style>
