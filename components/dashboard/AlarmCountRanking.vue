<template>
  <v-row>
    <v-col cols="12" md="12" lg="5">
      <v-card class="mx-auto" :loading="isLoading == 1">
        <template slot="progress">
          <v-progress-linear
            color="primary"
            height="5"
            indeterminate
          ></v-progress-linear>
        </template>
        <v-card-title>
          <span class="text-h6">
            {{ $t("alarmOccurCount") + $t("ranking") }}
          </span>
          <v-spacer></v-spacer>
          <span class="text-subtitle-1">
            {{ dates[0] }}
          </span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div style="width: 100%; height: auto">
            <div
              id="alarmCountBarChart"
              style="width:100%; height: 30vh"
              ref="alarmCountBar"
            ></div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="3">
      <v-card class="mx-auto" :loading="isLoading == 1">
        <template slot="progress">
          <v-progress-linear
            color="primary"
            height="5"
            indeterminate
          ></v-progress-linear>
        </template>
        <v-card-title>
          <span class="text-h5">
            {{ $t("alarmOccurCount") + $t("proportion") }}
          </span>
          <v-spacer></v-spacer>
          <span class="text-subtitle-1">
            {{ dates[0] }}
          </span>
        </v-card-title>

        <v-divider></v-divider>
        <v-card-text>
          <div style="width: 100%; height: auto">
            <div
              id="alarmCountPieChart"
              style="width:100%; height: 30vh"
              ref="alarmCountPie"
            ></div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="4">
      <v-card id="info-box">
        <v-card-title>
          <span class="text-h5">
            {{ $t("alarmOccurCount") }}
          </span>
          <v-spacer></v-spacer>
          <span class="text-subtitle-1">
            {{ dates[0] }}
          </span>
        </v-card-title>

        <v-divider></v-divider>
        <v-card-text>
          <div style="width: 100%; height: auto">
            <div style="height:29.8vh">
              <v-data-table
                dense
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
                <!-- <template v-slot:top>
                  <v-text-field
                    v-model="search"
                    :label="$t('search')"
                    class="mx-4"
                  ></v-text-field>
                </template> -->
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
// import "default-passive-events";
export default {
  props: {
    data: {},
    dates: null,
    isLoading: null
  },
  data() {
    return {
      search: "",
      isDescending: true,
      page: 1,
      pageCount: 0,
      itemsPerPage: 8,
      errorCodeData: {},
      alarmStatusData: [],
      percentData: [],
      statusArr: ["1", "2", "5", "7"],
      dataPoints: [],
      pastData: [],
      chart: null,
      chart1: null,
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
    getParetoDataPoints(alarmStatusData) {
      // console.log(this.data.map(e => e.machineId));
      let dataPoints = [];
      if (this.data == undefined) {
        return;
      }
      let errorCode = alarmStatusData.map(function(x) {
        return x.errorCode;
      });

      //console.log(errorCode);
      // console.log(JSON.stringify(this.uniques(errorCode)));
      let errorCodeData = this.uniques(errorCode);
      //console.log(errorCode);
      for (let i = 0; i < errorCodeData.length; i++) {
        if (errorCodeData[i] != null) {
          var item = {
            label: errorCodeData[i],
            y: alarmStatusData.filter(x => x.errorCode == errorCodeData[i])
              .length
          };
          dataPoints.push(item);
        } else {
          var item = {
            label: this.$t("other"),
            y: alarmStatusData.filter(x => x.errorCode == errorCodeData[i])
              .length
          };
          dataPoints.push(item);
        }
      }
      // console.log(this.dataPoints);
      dataPoints.sort(function(a, b) {
        return b.y - a.y;
      });
      return dataPoints;
    },
    renderProportionChart(dataPoints) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");

      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("alarmCountPieChart", {
          theme: "light2", // "light1", "light2", "dark1", "dark2"
          //exportEnabled: true,
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
              dataPoints: dataPoints
            }
          ]
          // height: 50
        });
      } else {
        this.chart.options.data[0].dataPoints = dataPoints;
      }

      this.chart.render();
    },
    renderParetoChartData(dataPoints) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");

      var dps = [];
      var yValue,
        yTotal = 0,
        yPercent = 0;

      for (var i = 0; i < dataPoints.length; i++) yTotal += dataPoints[i].y;

      for (var i = 0; i < dataPoints.length; i++) {
        yValue = dataPoints[i].y;
        yPercent += (yValue / yTotal) * 100;
        dps.push({
          label: dataPoints[i].label,
          y: yPercent
        });
      }

      if (this.chart1 == null) {
        this.chart1 = new CanvasJS.Chart("alarmCountBarChart", {
          // animationEnabled: true,
          // animationDuration: 50,
          //exportEnabled: true,
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

        this.chart1.addTo("data", {
          type: "line",
          axisYType: "secondary",
          yValueFormatString: '0.##"%"',
          indexLabel: "{y}",
          indexLabelFontColor: "#C24642",
          dataPoints: dps
        });
      } else {
        this.chart1.options.data[0].dataPoints = dataPoints;
        this.chart1.options.data[1].dataPoints = dps;
      }

      this.chart1.render();

      this.chart1.axisY[0].set("maximum", yTotal, false);
      this.chart1.axisY2[0].set("maximum", 105, false);
      this.chart1.axisY2[0].set("interval", 25);
      //   console.log(chart.data);
    },
    uniques(arr) {
      var a = [];
      for (var i = 0, l = arr.length; i < l; i++)
        if (a.indexOf(arr[i]) === -1 && arr[i] !== "") a.push(arr[i]);
      return a;
    }
  },
  mounted() {},
  created() {},
  watch: {
    data() {
      let alarmStatusData = this.data.filter(x => x.status == "2");
      // console.log(this.alarmStatusData);
      let dataPoints = this.getParetoDataPoints(alarmStatusData);
      this.dataPoints = dataPoints;
      this.renderParetoChartData(dataPoints);
      this.renderProportionChart(dataPoints);
    }
  },
  head() {
    return {};
  }
};
</script>
<style>
* {
  touch-action: none;
}
</style>
