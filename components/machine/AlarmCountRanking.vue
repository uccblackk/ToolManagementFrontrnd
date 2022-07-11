<template>
  <v-row>
    <v-col cols="12" md="12" lg="5">
      <v-card class="mx-auto">
        <v-card-title>
          <span class="text-h7">
            {{ $t("alarmOccurCount") + $t("ranking") }}
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
              id="alarmCountBarChart"
              style="width:100%; height: 400px"
              ref="alarmCountBar"
            ></div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="3">
      <v-card id="info-box">
        <v-card-title>
          <span class="text-h7">
            {{ $t("alarmOccurCount") + $t("proportion") }}
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
              id="alarmCountPieChart"
              style="width:100%; height: 400px"
              ref="alarmCountPie"
            ></div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="4">
      <v-card id="info-box">
        <v-card-title>
          <span class="text-h7">
            {{ $t("alarmOccurCount") }}
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
      alarmCountPieChart: null,
      alarmCountBarChart: null,
      search: "",
      isDescending: true,
      isLoading: 1,
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      errorCodeData: {},
      alarmStatusData: [],
      percentData: [],
      statusArr: ["1", "2", "5", "7"],
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
    getParetoDataPoints() {
      // console.log(this.data.map(e => e.machineId));
      this.dataPoints = [];
      if (this.data == undefined) {
        return;
      }
      let errorCode = this.alarmStatusData.map(function(x) {
        return x.errorCode;
      });

      //console.log(errorCode);
      // console.log(JSON.stringify(this.uniques(errorCode)));
      this.errorCodeData = this.uniques(errorCode);
      //console.log(errorCode);
      for (let i = 0; i < this.errorCodeData.length; i++) {
        if (this.errorCodeData[i] != null) {
          var item = {
            label: this.errorCodeData[i],
            y: this.alarmStatusData.filter(
              x => x.errorCode == this.errorCodeData[i]
            ).length
          };
          this.dataPoints.push(item);
        } else {
          var item = {
            label: this.$t("other"),
            y: this.alarmStatusData.filter(
              x => x.errorCode == this.errorCodeData[i]
            ).length
          };
          this.dataPoints.push(item);
        }
      }
      //console.log(this.dataPoints);
      this.dataPoints.sort(function(a, b) {
        return b.y - a.y;
      });

      this.isLoading = 0;
    },
    renderProportionChart() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");

      // let chart = null;
      // if (this.barWidth != null) {
      //   chart = new CanvasJS.Chart("alarmCountPieChart", {
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
      //           "number"
      //         )} (#percent%)`,
      //         dataPoints: this.dataPoints
      //       }
      //     ],
      //     height: this.pieHeight,
      //     width: this.pieWidth
      //   });
      // } else {
      if (this.alarmCountPieChart == null) {
        this.alarmCountPieChart = new CanvasJS.Chart("alarmCountPieChart", {
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
                "number"
              )} (#percent%)`,
              dataPoints: this.dataPoints
            }
          ]
          // height: 50
        });
      } else {
        this.alarmCountPieChart.options.data[0].dataPoints = this.dataPoints;
      }
      //  }
      setTimeout(() => {
        this.alarmCountPieChart.render();
      }, 200);
      //this.alarmCountPieChart.render();
    },
    renderParetoChartData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      // let chart = null;
      // if (this.barWidth != null) {
      //   chart = new CanvasJS.Chart("alarmCountBarChart", {
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
      //         color: "#FFB367",
      //         dataPoints: this.dataPoints
      //       }
      //     ],
      //     height: this.barHeight,
      //     width: this.barWidth
      //   });
      // } else {
      if (this.alarmCountBarChart == null) {
        this.alarmCountBarChart = new CanvasJS.Chart("alarmCountBarChart", {
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
              color: "#FFB367",
              dataPoints: this.dataPoints
            }
          ]
        });
      } else {
        this.alarmCountBarChart.options.data[0].dataPoints = this.dataPoints;
      }
      // }

      setTimeout(() => {
        this.alarmCountBarChart.render();
      }, 200);
      this.alarmCountBarChart.render();
      var dps = [];
      var yValue,
        yTotal = 0,
        yPercent = 0;

      for (
        var i = 0;
        i < this.alarmCountBarChart.data[0].dataPoints.length;
        i++
      )
        yTotal += this.alarmCountBarChart.data[0].dataPoints[i].y;

      for (
        var i = 0;
        i < this.alarmCountBarChart.data[0].dataPoints.length;
        i++
      ) {
        yValue = this.alarmCountBarChart.data[0].dataPoints[i].y;
        yPercent += (yValue / yTotal) * 100;
        dps.push({
          label: this.alarmCountBarChart.data[0].dataPoints[i].label,
          y: yPercent
        });
      }
      this.alarmCountBarChart.addTo("data", {
        type: "line",
        axisYType: "secondary",
        yValueFormatString: '0.##"%"',
        indexLabel: "{y}",
        indexLabelFontColor: "#C24642",
        dataPoints: dps
      });
      this.alarmCountBarChart.axisY[0].set("maximum", yTotal, false);
      this.alarmCountBarChart.axisY2[0].set("maximum", 105, false);
      this.alarmCountBarChart.axisY2[0].set("interval", 25);
      //   console.log(chart.data);
    },
    uniques(arr) {
      var a = [];
      for (var i = 0, l = arr.length; i < l; i++)
        if (a.indexOf(arr[i]) === -1 && arr[i] !== "") a.push(arr[i]);
      return a;
    }
  },
  mounted() {
    this.isLoading = 1;
    this.alarmStatusData = this.data.filter(x => x.status == "2");
    // console.log("mouted");
    this.getParetoDataPoints();
    this.renderParetoChartData();
    this.renderProportionChart();
    // const { width, height } = this.$refs.alarmCountBar.getBoundingClientRect();
    // const pieDiv = this.$refs.alarmCountPie.getBoundingClientRect();
    // this.barWidth = width;
    // this.barHeight = height;
    // this.pieWidth = pieDiv.width;
    // this.pieHeight = pieDiv.height;
    // console.log(this.width);
    // console.log(this.height);
  },
  created() {},
  watch: {
    data() {
      this.isLoading = 1;
      this.alarmStatusData = this.data.filter(x => x.status == "2");
      //console.log(this.alarmStatusData);
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
