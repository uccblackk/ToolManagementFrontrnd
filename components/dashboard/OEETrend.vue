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
        {{ "OEE" + $t("trend") }}
        <v-spacer />
        <span class="caption">
          {{ dates[0] + "~" + dates[1] }}
        </span>
      </v-card-title>

      <v-card-text>
        <div
          id="OEETrendChart"
          style="height:20vh;margin-top:-10px"
          ref="OEETrendChart"
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
      timerId: null,
      loading: false,
      dates: [],
      oeeData: [],
      height: null,
      machineData: [],
      dataPoints: [],
      mqttData: [],
      mqttClient: {},
      runningCount: 0,
      idleCount: 0,
      errorCount: 0,
      disconnectCount: 0,
      dataTableHeight: 0,
      mounted: 0,
      chart: null,
      intervalID: null
    };
  },
  methods: {
    transData() {
      this.dataPoints = [];
    },
    renderData(oeeData) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");

      let interval = 10;
      if (oeeData.find(x => x.y > 10) == undefined) {
        interval = 1;
      }
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("OEETrendChart", {
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
            interval: interval,
            suffix: "%",
            gridThickness: 0
          },
          zoomEnabled: true,

          legend: { cursor: "pointer" },
          data: [
            {
              color: "#0080FF",
              xValueFormatString: "YYYY/MM/DD",
              type: "splineArea",
              toolTipContent: "{x}<br><b>OEE:</b> {y}%",
              dataPoints: oeeData
            }
          ]
        });
      } else {
        this.chart.options.data[0].dataPoints = oeeData;
      }

      // console.log(this.percentData);
      this.chart.render();
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async GetOEEData() {
      await this.sleep(1);
      const token = this.$store.state.authUser.token;
      //   console.log(this.dates);
      this.loading = true;
      let oeeData = [];
      let totalData = [];
      this.$axios
        .$get(
          `/OEE/GetTotalWeekMachineOEE?startDate=${this.dates[0]}&endDate=${this.dates[1]}&areaNo=${this.areaNo}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          totalData = res.data;
          for (let i = 0; i < totalData.length; i++) {
            //console.log(totalData[i]);
            let utilization = totalData[i].utilization;
            let performance = totalData[i].performance;
            let yieldValue = totalData[i].yield;
            if (utilization > 1) {
              utilization = 1;
            }
            if (performance > 1) {
              performance = 1;
            }
            if (yieldValue > 1) {
              yieldValue = 1;
            }
            let OEE = utilization * performance * yieldValue * 100;
            // console.log(OEE);
            let startTime = new Date(totalData[i].startTime);
            let item = {
              x: new Date(
                startTime.getFullYear(),
                startTime.getMonth(),
                startTime.getDate()
              ),
              y: OEE
            };
            oeeData.push(item);
          }
          this.renderData(oeeData);
          this.dates = [
            moment().format("YYYY-MM-DD"),
            moment().format("YYYY-MM-DD")
          ];
          this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
            .add(-6, "days")
            .format("YYYY-MM-DD");
          //console.log(this.totalData);
          this.loading = false;
          // console.log(this.totalData);
          // this.transData();
          // this.renderData();
          this.timerId = setTimeout(this.GetOEEData, 1000 * 60 * 10);
        })
        .catch(({ response }) => {
          this.loading = false;
          this.timerId = setTimeout(this.GetOEEData, 1000 * 60 * 10);
        });
    }
  },
  beforeDestroy() {
    //clearInterval(this.intervalID);
    clearTimeout(this.timerId);
  },
  mounted() {
    clearTimeout(this.timerId);
    //console.log("mounted");
    this.mounted = 1;
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
      .add(-6, "days")
      .format("YYYY-MM-DD");
    //十分鐘更新一次
    // this.intervalID = setInterval(this.GetOEEData, 1000 * 60 * 10);
    this.GetOEEData();
  },

  created() {},
  activated() {
    clearTimeout(this.timerId);
    if (this.chart != null) {
      this.chart.render();
    }
    this.mounted = 1;
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
      .add(-6, "days")
      .format("YYYY-MM-DD");
    //十分鐘更新一次
    // this.intervalID = setInterval(this.GetOEEData, 1000 * 60 * 10);
    this.GetOEEData();
  },
  deactivated() {
    clearTimeout(this.timerId);
  },
  watch: {
    areaNo() {
      //  console.log("watch");
      clearTimeout(this.timerId);
      this.GetOEEData();
    }
  },
  head() {
    return {};
  }
};
</script>
<style></style>
