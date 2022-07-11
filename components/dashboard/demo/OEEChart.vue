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
        {{ $t("currentShift") + "OEE" }}
        <v-spacer />
        <span class="caption">
          {{ date }}
        </span>
      </v-card-title>

      <v-card-text>
        <div style="height:20vh;margin-top:-10px" class=" align-center">
          <v-row no-gutters justify="center">
            <v-col cols="5">
              <div id="OEEPieChart" style="height:18vh">
                <!-- <v-progress-circular
                  :rotate="-90"
                  :size="170"
                  :width="20"
                  :value="OEE"
                  color="primary"
                >
                  <span class="text-h5 font-weight-bold">
                    {{ OEE + " %" }}
                  </span>
                </v-progress-circular> -->
              </div>
            </v-col>
            <v-col cols="4">
              <v-row no-gutters>
                <v-col cols="12" class="text-truncate">
                  <div
                    class="mt-2 text-h7 font-weight-black"
                    style="width:100%;text-align:left"
                  >
                    {{ "時間稼動" }}
                    <v-progress-linear
                      :value="utilization"
                      color="blue darken-1"
                      striped
                      rounded
                      height="2vh"
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
                </v-col>
                <v-col cols="12" class="text-truncate">
                  <div
                    class="text-h7 font-weight-black"
                    style="width:100%;text-align:left"
                  >
                    {{ "產能效率" }}
                    <v-progress-linear
                      :value="performance"
                      color="blue darken-1"
                      striped
                      rounded
                      height="2vh"
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
                </v-col>
                <v-col cols="12" class="text-truncate">
                  <div
                    class="text-h7 font-weight-black"
                    style="width:100%;text-align:left"
                  >
                    {{ "良品率" }}
                    <v-progress-linear
                      :value="yieldValue"
                      color="blue darken-1"
                      striped
                      rounded
                      height="2vh"
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
            </v-col>
          </v-row>
        </div>
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
    // height: null
  },
  data() {
    return {
      chart: null,
      loading: false,
      skill: 65,
      utilization: 0,
      performance: 0,
      yieldValue: 0,
      OEE: 0,
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
      intervalID: null,
      timerId: null,
      date: null
    };
  },
  methods: {
    GetRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    },
    renderData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");

      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("OEEPieChart", {
          theme: "light2", // "light1", "light2", "dark1", "dark2"
          // exportEnabled: true,
          // animationEnabled: true,
          title: {
            verticalAlign: "center",
            text: this.OEE.toString() + " %",
            fontSize: 28,
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
        this.chart.options.title.text = this.OEE.toString() + " %";
        this.chart.options.data[0].dataPoints = this.dataPoints;
      }
      this.chart.render();
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async getOEEData() {
      await this.sleep(1);
      let OEEData = {};
      this.loading = true;
      const token = this.$store.state.authUser.token;
      const dates = [
        moment().format("YYYY-MM-DD"),
        moment().format("YYYY-MM-DD")
      ];

      this.utilization = this.GetRandomInt(80, 100);

      this.performance = this.GetRandomInt(80, 100);

      this.yieldValue = this.GetRandomInt(80, 100);
      this.OEE =
        (this.utilization * this.performance * this.yieldValue) / 10000;
      this.OEE = Math.floor(this.OEE * 100) / 100;

      this.dataPoints = [
        { y: this.OEE, color: "#2894FF", text: this.OEE.toString() },
        { y: 100 - this.OEE, color: "grey", text: this.OEE.toString() }
      ];

      //   console.log(this.dataPoints);
      this.renderData();
      this.date = new Date().toISOString().substr(0, 10);
      this.loading = false;
      this.timerId = setTimeout(this.getOEEData, 1000 * 5);
    }
  },
  beforeDestroy() {
    // clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    //console.log(this.intervalID);
  },
  mounted() {
    // 每一分鐘更新一次單元數據
    // this.intervalID = setInterval(this.getOEEData, 1000 * 60);
    clearTimeout(this.timerId);
    if (this.chart != null) {
      this.chart.render();
    }
    this.getOEEData();
    this.date = new Date().toISOString().substr(0, 10);
  },
  activated() {
    clearTimeout(this.timerId);
    if (this.chart != null) {
      this.chart.render();
    }
    this.getOEEData();
    this.date = new Date().toISOString().substr(0, 10);
  },
  deactivated() {
    clearTimeout(this.timerId);
  },
  created() {},
  watch: {
    areaNo() {
      clearTimeout(this.timerId);
      this.getOEEData();
    }
  },
  head() {
    return {};
  }
};
</script>
<style></style>
