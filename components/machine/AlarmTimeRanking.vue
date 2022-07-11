<template>
  <v-row>
    <v-col cols="12" md="12" lg="5">
      <v-card class="mx-auto">
        <v-card-title>
          <span class="text-h7">
            {{ $t("alarmOccurTime") + $t("ranking") }}
          </span>
          <v-spacer></v-spacer>
          <!-- <span class="text-subtitle-1">
            {{ dates[0] + " ~ " + dates[1] }}
          </span> -->
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div style="width: 100%; height: auto">
            <div
              id="alarmTimeBarChart"
              style="width:100%; height: 400px"
              ref="alarmTimeBar"
            ></div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="3">
      <v-card id="info-box">
        <v-card-title>
          <span class="text-h7">
            {{ $t("alarmOccurTime") + $t("proportion") }}
          </span>
          <v-spacer></v-spacer>
          <!-- <span class="text-subtitle-1">
            {{ dates[0] + " ~ " + dates[1] }}
          </span> -->
        </v-card-title>

        <v-divider></v-divider>
        <v-card-text>
          <div style="width: 100%; height: auto">
            <div
              id="alarmTimePieChart"
              style="width:100%; height: 400px"
              ref="alarmTimePie"
            ></div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="4">
      <v-card id="info-box">
        <v-card-title>
          <span class="text-h7">
            {{ $t("alarmOccurTime") }}
          </span>
          <v-spacer></v-spacer>
          <!-- <span class="text-subtitle-1">
            {{ dates[0] + " ~ " + dates[1] }}
          </span> -->
        </v-card-title>

        <v-divider></v-divider>
        <v-card-text>
          <div style="width: 100%; height: auto">
            <div style="height:400px">
              <v-data-table
                :headers="headers"
                :items="dataPoints"
                :loading="isLoading == 1"
                loading-text="Loading... Please wait"
                :items-per-page="itemsPerPage"
                :sort-by="['y']"
                :sort-desc.sync="isDescending"
                class="elevation-1"
                @page-count="pageCount = $event"
                :page.sync="page"
                :search="search"
                hide-default-footer
              >
                <template v-slot:top>
                  <v-text-field
                    v-model="search"
                    :label="$t('search')"
                    class="mx-4"
                  ></v-text-field>
                </template>
                <template v-slot:item.sn="{ item }">
                  {{ dataPoints.indexOf(item) + 1 }}
                </template>
              </v-data-table>
              <div class="text-center pt-2">
                <v-pagination
                  :total-visible="7"
                  v-model="page"
                  :length="pageCount"
                ></v-pagination>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
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
      alarmTimeBarChart: null,
      alarmTimePieChart: null,
      search: "",
      isDescending: true,
      isLoading: 1,
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      errorCodeData: {},
      statusData: [],
      percentData: [],
      statusArr: ["1", "2", "5", "7"],
      dataPoints: [],
      pastData: [],
      barHeight: null,
      barWidth: null,
      pieHeight: null,
      pieWidth: null,
      proportionChart: null,
      status: [],
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
          text: this.$t("alarmOccurTime") + " (" + this.$t("seconds") + ")",
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
      this.status = [];
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
                  this.data[i - 1].status,
                  this.data[i - 1].errorCode
                );
                this.status.push(item);
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
                  this.data[i].status,
                  this.data[i].errorCode
                );

                this.status.push(item);
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
                  this.data[i].status,
                  this.data[i].errorCode
                );

                this.status.push(item);
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
                    this.data[i].status,
                    this.data[i].errorCode
                  );
                  this.status.push(item);
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
                    this.data[i].status,
                    this.data[i].errorCode
                  );
                  this.status.push(item);
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
              this.data[i].status,
              this.data[i].errorCode
            );

            this.status.push(item);
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
                  let item = this.getItem(
                    dateArray[k].startDate,
                    new Date(),

                    new Date(statusDetail.time),
                    new Date(),
                    statusDetail.status,
                    statusDetail.errorCode
                  );
                  // console.log("X");
                  this.status.push(item);
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
                      statusDetail.status,
                      statusDetail.errorCode
                    );

                    this.status.push(item);
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
                      statusDetail.status,
                      statusDetail.errorCode
                    );
                    //console.log(item);
                    this.status.push(item);
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
                    statusDetail.status,
                    statusDetail.errorCode
                  );
                  //console.log(item);
                  this.status.push(item);
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
                  this.data[1].status,
                  this.data[1].errorCode
                );
                //console.log(item);
                this.status.push(item);
              }
            }
          }
        }
      }
    },
    getItem(
      startTime,
      endTime,
      actualStartTime,
      actualEndTime,
      status,
      errorCode
    ) {
      // console.log(startTime);
      // console.log(endTime);
      const diffDay = Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24);
      // console.log(diffDay);
      const diff = moment.duration(
        actualEndTime.getTime() - actualStartTime.getTime()
      );
      const startHour =
        startTime.getHours() * 3600 +
        startTime.getMinutes() * 60 +
        startTime.getSeconds();
      const endHour =
        diffDay * 86400 +
        endTime.getHours() * 3600 +
        endTime.getMinutes() * 60 +
        endTime.getSeconds();
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
      let item = {
        x: new Date(
          startTime.getFullYear(),
          startTime.getMonth(),
          startTime.getDate()
        ),
        startTime: startTime,
        endTime: endTime,
        status: status,
        y: endHour - startHour,
        color: color,
        errorCode: errorCode
      };

      return item;
    },

    getParetoDataPoints() {
      // console.log(this.data.map(e => e.machineId));
      //console.log(this.status);
      this.dataPoints = [];
      if (this.data == undefined) {
        return;
      }
      // 1.整理errorCode清單(過濾重複)
      let errorCode = this.status
        .filter(x => x.status == 2)
        .map(function(x) {
          return x.errorCode;
        });
      this.errorCodeData = this.uniques(errorCode);
      let errorTimeData = [];
      //  console.log(this.statusData);
      // 2.整理各errorCode的持續時間
      for (let i = 0; i < this.errorCodeData.length; i++) {
        let errorTime = 0;
        for (let j = 0; j < this.status.length; j++) {
          if (
            this.status[j].status == "2" &&
            this.status[j].errorCode == this.errorCodeData[i]
          ) {
            errorTime += this.status[j].y;
          }
        }
        if (this.errorCodeData[i] != null) {
          this.dataPoints.push({
            label: this.errorCodeData[i],
            y: errorTime
          });
        } else {
          this.dataPoints.push({
            label: this.$t("other"),
            y: errorTime
          });
        }
      }
      this.dataPoints.sort(function(a, b) {
        return b.y - a.y;
      });
      this.isLoading = 0;
    },
    renderProportionChart() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      //let chart = null;
      // if (this.pieWidth != null) {
      //   chart = new CanvasJS.Chart("alarmTimePieChart", {
      //     theme: "light2", // "light1", "light2", "dark1", "dark2"
      //     exportEnabled: true,
      //     // animationEnabled: true,

      //     data: [
      //       {
      //         type: "doughnut",
      //         startAngle: 60,
      //         // showInLegend: "true",
      //         // legendText: "{label}",
      //         //innerRadius: 60,
      //         indexLabelFontSize: 17,
      //         indexLabel: "{label} - #percent% ",
      //         toolTipContent: `<b>{label}:</b> {y} ${this.$t(
      //           "seconds"
      //         )} (#percent%)`,
      //         dataPoints: this.dataPoints
      //       }
      //     ],

      //     height: this.pieHeight,
      //     width: this.pieWidth
      //   });
      // } else {
      if (this.alarmTimePieChart == null) {
        this.alarmTimePieChart = new CanvasJS.Chart("alarmTimePieChart", {
          theme: "light2", // "light1", "light2", "dark1", "dark2"
          exportEnabled: true,
          // animationEnabled: true,

          data: [
            {
              type: "doughnut",
              startAngle: 60,
              // showInLegend: "true",
              // legendText: "{label}",
              //innerRadius: 60,
              indexLabelFontSize: 17,
              indexLabel: "{label} - #percent% ",
              toolTipContent: `<b>{label}:</b> {y} ${this.$t(
                "seconds"
              )} (#percent%)`,
              dataPoints: this.dataPoints
            }
          ]
        });
      } else {
        this.alarmTimePieChart.options.data[0].dataPoints = this.dataPoints;
      }
      // }
      setTimeout(() => {
        this.alarmTimePieChart.render();
      }, 200);
      //chart.render();
      //console.log(this.proportionChart);
    },
    renderParetoChartData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      // let chart = null;
      // if (this.barWidth != null) {
      //   chart = new CanvasJS.Chart("alarmTimeBarChart", {
      //     // animationEnabled: true,
      //     // animationDuration: 50,
      //     exportEnabled: true,
      //     // dataPointMaxWidth: 50,
      //     // dataPointMinWidth: 0.1,
      //     // zoomType: "xy",

      //     zoomEnabled: true,
      //     axisY: {
      //       lineColor: "#4F81BC",
      //       tickColor: "#4F81BC",
      //       labelFontColor: "#4F81BC",
      //       gridThickness: 0
      //     },
      //     axisY2: {
      //       title: "Percent",
      //       suffix: "%",
      //       gridThickness: 0,
      //       lineColor: "#C0504E",
      //       tickColor: "#C0504E",
      //       labelFontColor: "#C0504E"
      //     },
      //     legend: { cursor: "pointer" },
      //     data: [
      //       {
      //         type: "column",
      //         toolTipContent: `<b>{label}:</b> {y} ${this.$t("seconds")}`,
      //         color: "#FFB367",
      //         dataPoints: this.dataPoints
      //       }
      //     ],
      //     height: this.barHeight,
      //     width: this.barWidth
      //   });
      // } else {
      if (this.alarmTimeBarChart == null) {
        this.alarmTimeBarChart = new CanvasJS.Chart("alarmTimeBarChart", {
          // animationEnabled: true,
          // animationDuration: 50,
          exportEnabled: true,
          // dataPointMaxWidth: 50,
          // dataPointMinWidth: 0.1,
          // zoomType: "xy",

          zoomEnabled: true,
          axisY: {
            lineColor: "#4F81BC",
            tickColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            gridThickness: 0
          },
          axisY2: {
            title: "Percent",
            suffix: "%",
            gridThickness: 0,
            lineColor: "#C0504E",
            tickColor: "#C0504E",
            labelFontColor: "#C0504E"
          },
          legend: { cursor: "pointer" },
          data: [
            {
              type: "column",
              toolTipContent: `<b>{label}:</b> {y} ${this.$t("seconds")}`,
              color: "#FFB367",
              dataPoints: this.dataPoints
            }
          ]
        });
      } else {
        this.alarmTimeBarChart.options.data[0].dataPoints = this.dataPoints;
      }
      // }
      setTimeout(() => {
        this.alarmTimeBarChart.render();
      }, 200);
      this.alarmTimeBarChart.render();
      var dps = [];
      var yValue,
        yTotal = 0,
        yPercent = 0;

      for (var i = 0; i < this.alarmTimeBarChart.data[0].dataPoints.length; i++)
        yTotal += this.alarmTimeBarChart.data[0].dataPoints[i].y;

      for (
        var i = 0;
        i < this.alarmTimeBarChart.data[0].dataPoints.length;
        i++
      ) {
        yValue = this.alarmTimeBarChart.data[0].dataPoints[i].y;
        yPercent += (yValue / yTotal) * 100;
        dps.push({
          label: this.alarmTimeBarChart.data[0].dataPoints[i].label,
          y: yPercent
        });
      }
      this.alarmTimeBarChart.addTo("data", {
        type: "line",
        axisYType: "secondary",
        yValueFormatString: '0.##"%"',
        indexLabel: "{y}",
        indexLabelFontColor: "#C24642",
        dataPoints: dps
      });
      this.alarmTimeBarChart.axisY[0].set("maximum", yTotal, false);
      this.alarmTimeBarChart.axisY2[0].set("maximum", 105, false);
      this.alarmTimeBarChart.axisY2[0].set("interval", 25);
      //console.log(chart.data);
    },
    uniques(arr) {
      var a = [];
      for (var i = 0, l = arr.length; i < l; i++)
        if (a.indexOf(arr[i]) === -1 && arr[i] !== "") a.push(arr[i]);
      return a;
    }
  },
  mounted() {
    // console.log("mounted");
    this.isLoading = 1;
    this.statusData = this.data;
    // console.log(this.statusData);
    this.transData();
    this.getParetoDataPoints();
    this.renderParetoChartData();
    this.renderProportionChart();
    // const { width, height } = this.$refs.alarmTimeBar.getBoundingClientRect();
    // const pieDiv = this.$refs.alarmTimePie.getBoundingClientRect();
    // this.barWidth = width;
    // this.barHeight = height;
    // this.pieWidth = pieDiv.width;
    // this.pieHeight = pieDiv.height;
    //console.log(aa);
    // console.log(this.height);
  },
  created() {},

  watch: {
    data() {
      //console.log("watch");
      // this.isLoading = 1;
      this.statusData = this.data;
      // console.log(this.statusData);
      this.transData();
      this.getParetoDataPoints();
      this.renderParetoChartData();
      this.renderProportionChart();
    }
  },
  head() {
    return {};
  }
};
</script>
<style></style>
