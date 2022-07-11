<template>
  <div style="width: 100%;">
    <v-card
      style="background: rgb(35,36,79);
background: linear-gradient(45deg, rgba(35,36,79,1) 0%, rgba(57,116,146,1) 100%);"
      id="info-box"
      height="500px"
    >
      <v-card-title
        style="background: #07288D;color:white;opacity:1"
        class="text-h5  font-weight-bold"
      >
        {{ "Y3自動化產線" }}
        <span class="ml-2 text-overline">{{ "(6臺設備)" }}</span>
        <v-spacer />
        <span class="caption">
          {{ date }}
        </span>
      </v-card-title>
      <v-card-text>
        <v-row no-gutters justify="center">
          <v-col cols="3">
            <div style="height:350px;margin-top:20px" class=" align-center">
              <v-row no-gutters justify="center">
                <v-col cols="12">
                  <span class="text-h5" style="color:#E0E0E0">
                    {{ $t("currentShift") + "OEE" }}
                  </span>
                  <v-divider class="mt-2" color="white" />
                </v-col>
                <v-col cols="7">
                  <div id="OEEPieChart" style="height:350px"></div>
                </v-col>
                <v-col cols="5" class="mt-16">
                  <v-row no-gutters>
                    <v-col cols="12" class="text-truncate">
                      <div
                        class="mt-2 text-h6 font-weight-black"
                        style="width:100%;text-align:left;color:white"
                      >
                        {{ "時間稼動" }}
                        <v-progress-linear
                          :value="utilization"
                          :indeterminate="indeterminate"
                          color="blue darken-1"
                          striped
                          rounded
                          height="25"
                        >
                          <span style="color:white">
                            <strong>{{ Math.ceil(utilization) }}%</strong>
                          </span>
                        </v-progress-linear>
                      </div>
                    </v-col>
                    <v-col cols="12" class="text-truncate">
                      <div
                        class="text-h6 font-weight-black"
                        style="width:100%;text-align:left;color:white"
                      >
                        {{ "產能效率" }}
                        <v-progress-linear
                          :value="performance"
                          color="blue darken-1"
                          :indeterminate="indeterminate"
                          striped
                          rounded
                          height="25"
                        >
                          <span style="color:white">
                            <strong>{{ Math.ceil(performance) }}%</strong>
                          </span>
                        </v-progress-linear>
                      </div>
                    </v-col>
                    <v-col cols="12" class="text-truncate">
                      <div
                        class="text-h6 font-weight-black"
                        style="width:100%;text-align:left;color:white"
                      >
                        {{ "良品率" }}
                        <v-progress-linear
                          :value="yieldValue"
                          color="blue darken-1"
                          :indeterminate="indeterminate"
                          striped
                          rounded
                          height="25"
                        >
                          <span style="color:white">
                            <strong>{{ Math.ceil(yieldValue) }}%</strong>
                          </span>
                        </v-progress-linear>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </v-col>
          <v-col cols="1" align="center">
            <v-divider vertical dark />
          </v-col>
          <v-col cols="8">
            <v-row>
              <v-col md="12">
                <div style="text-align:center">
                  <v-chip outlined color="white">
                    <span class="text-h5" style="text-align:center">
                      {{ "輸送帶" }}
                    </span>
                  </v-chip>
                </div>
                <v-progress-linear
                  color="white lighten-2"
                  buffer-value="0"
                  stream
                  height="25"
                >
                </v-progress-linear>
                <!-- <v-card class="pa-2" outlined tile>
              .col-md-6 .offset-md-3
            </v-card> -->
              </v-col>
            </v-row>
            <v-row justify="center" style="margin-top:-20px">
              <v-col cols="2">
                <v-row>
                  <v-col cols="12">
                    <MachineStatusCard
                      :machineData="GetMachine('DR001')"
                      height="40px"
                    />
                  </v-col>
                  <v-col cols="12">
                    <MachineStatusCard
                      :machineData="machineList.find(x => x.no == 'NXV600A-1')"
                      height="70px"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="5" align-self="center">
                <v-row>
                  <v-col cols="5">
                    <MachineStatusCard
                      :machineData="machineList.find(x => x.no == 'NH500A-1')"
                      height="200px"
                    />
                  </v-col>
                  <v-col cols="5">
                    <MachineStatusCard
                      :machineData="machineList.find(x => x.no == 'NH500A-2')"
                      height="200px"
                    />
                  </v-col>
                  <v-col cols="2" align="center">
                    <v-divider dark vertical />
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="5" align-self="center">
                <v-row>
                  <v-col cols="5">
                    <MachineStatusCard
                      :machineData="machineList.find(x => x.no == 'NH500A-3')"
                      height="200px"
                    />
                  </v-col>
                  <v-col cols="5">
                    <MachineStatusCard
                      :machineData="machineList.find(x => x.no == 'NH500A-4')"
                      height="200px"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import moment from "moment";
import mqtt from "mqtt";
import MachineStatusCard from "~/components/machine/MachineStatusCard.vue";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    data: {},
    trayData: []
    // height: null
  },
  data() {
    return {
      indeterminate: false,
      dataPoints: [],
      utilization: 0,
      performance: 0,
      yieldValue: 0,
      model: 0,
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
      machineList: [],
      itemPerPage: 6,
      totalData: [],
      chart: null,
      timerId: null,
      OEE: null,
      date: null
    };
  },
  components: {
    MachineStatusCard
  },

  methods: {
    GetMachine(no) {
      //console.log(this.machineList);
      //console.log(this.machineList.find(x => x.no == no));
      return this.machineList.find(x => x.no == no);
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    renderData(dataPoints) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");

      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("OEEPieChart", {
          theme: "light2", // "light1", "light2", "dark1", "dark2"
          backgroundColor: "transparent",
          // exportEnabled: true,
          // animationEnabled: true,
          title: {
            verticalAlign: "center",
            text: this.OEE.toString() + " %",
            fontSize: 36,
            fontColor: "white"
          },
          animationDuration: 10,
          explodeOnClick: false,
          data: [
            {
              type: "doughnut",
              startAngle: -90,

              showInLegend: false,

              toolTipContent: `<b>OEE : {text}%</b>`,
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
    async getOEEData() {
      await this.sleep(1);
      this.indeterminate = true;
      let OEEData = {};
      let dataPoints = [];
      const token = this.$store.state.authUser.token;
      const dates = [
        moment().format("YYYY-MM-DD"),
        moment().format("YYYY-MM-DD")
      ];
      this.$axios
        .$get(
          `/OEE/GetTotalMachineOEE?startTime=${dates[0]}&endTime=${dates[0]}&lineNo=L01`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          OEEData = res.data;
          this.utilization = OEEData.utilization * 100;
          this.performance = OEEData.performance * 100;
          this.yieldValue = OEEData.yield * 100;
          this.OEE =
            OEEData.utilization * OEEData.performance * OEEData.yield * 100;
          this.OEE = Math.floor(this.OEE * 100) / 100;

          if (this.OEE == 0) {
            dataPoints = [{ y: 100, color: "grey", text: "0" }];
          } else {
            dataPoints = [
              { y: this.OEE, color: "#2894FF", text: this.OEE.toString() },
              { y: 100 - this.OEE, color: "grey", text: this.OEE.toString() }
            ];
          }
          //   console.log(this.dataPoints);
          this.renderData(dataPoints);
          this.date = new Date().toISOString().substr(0, 10);
          this.indeterminate = false;
          this.timerId = setTimeout(this.getOEEData, 1000 * 60);
        })
        .catch(({ response }) => {
          // this.loading = false;
          this.timerId = setTimeout(this.getOEEData, 1000 * 60);
        });
    },
    getMachineImg(machineNo) {
      let img = null;
      if (this.machineList != undefined) {
        img = this.machineList.find(x => x.no == machineNo).img;
      }
      return img;
    },
    getMachineName(machineNo) {
      let img = null;

      if (this.machineList != undefined) {
        img = this.machineList.find(x => x.no == machineNo).name;
      }
      return img;
    },
    getMachineStatus(machineNo) {
      let status = "disconnect";

      let data = this.machineData.find(x => x.machineNo == machineNo);
      // console.log(data);
      if (data != undefined) {
        status = data.data.status;
      }
      return status;
    }
  },

  beforeDestroy() {
    // clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    //console.log(this.intervalID);
  },
  deactivated() {
    clearTimeout(this.timerId);
  },
  mounted() {
    clearTimeout(this.timerId);
    if (this.mqttClient.connted) {
      this.mqttDisconnected();
    }

    this.machineList = this.data;
    this.date = new Date().toISOString().substr(0, 10);
    this.getOEEData();
  },
  activated() {
    clearTimeout(this.timerId);
    if (this.mqttClient.connted) {
      this.mqttDisconnected();
    }

    this.machineList = this.data;
    this.date = new Date().toISOString().substr(0, 10);
    this.getOEEData();
  },
  created() {},
  watch: {
    data() {
      clearTimeout(this.timerId);
      if (this.mqttClient.connted) {
        this.mqttDisconnected();
      }

      this.machineList = this.data;
    }
  },
  head() {
    return {};
  }
};
</script>
<style></style>
