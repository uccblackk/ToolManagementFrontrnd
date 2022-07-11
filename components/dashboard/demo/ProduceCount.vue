<template>
  <div style="width: 100%;">
    <v-card id="info-box">
      <v-card-title class="text-h5 font-weight-bold">
        {{ $t("CurrentShiftProduceCount") }}
        <v-spacer />
        <span class="caption">
          {{ date }}
        </span>
      </v-card-title>

      <v-card-text>
        <div style="text-align:center;height:230px;color:black">
          <v-row no-gutters>
            <v-col cols="12" class="text-h1 font-weight-black mt-5">
              {{ reportCount }}
              <span class="text-h5">{{ " 件" }}</span>
            </v-col>
            <v-col cols="12" class="text-h6  mt-5">
              <v-row no-gutters>
                <v-col cols="12">
                  <div style="text-align:right;color:#6C6C6C">
                    <span style="font-size:14px">{{
                      $t("expected") + $t("produce") + $t("count")
                    }}</span>
                    {{ cycleCount + " 件" }}
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-progress-linear
                    rounded
                    striped
                    height="20"
                    color="blue lighten-1"
                    :value="value"
                  >
                    <template v-slot:default="{ value }">
                      <span v-if="value > 40" style="color:white">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </span>
                      <span v-else>
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </span>
                    </template>
                  </v-progress-linear>
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
  },
  data() {
    return {
      value: 0.0,
      cycleCount: 0,
      reportCount: 0,
      loading: false,
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
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    GetRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    },
    async getOEEData() {
      await this.sleep(1);
      this.loading = true;
      let OEEData = [];

      const token = this.$store.state.authUser.token;
      const dates = [
        moment().format("YYYY-MM-DD"),
        moment().format("YYYY-MM-DD")
      ];

      this.reportCount = 12 * this.GetRandomInt(10, 15);
      this.cycleCount = 12 * this.GetRandomInt(15, 20);
      if (this.cycleCount != 0) {
        this.value =
          Math.floor((this.reportCount / this.cycleCount) * 100) / 100;
        this.value = this.value * 100;
      } else {
        this.value = 0;
      }

      // console.log(this.OEEData);
      this.date = new Date().toISOString().substr(0, 10);
      this.loading = false;
      this.timerId = setTimeout(this.getOEEData, 1000 * 5);
    }
  },
  beforeDestroy() {
    //clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    //console.log(this.intervalID);
  },
  mounted() {
    clearTimeout(this.timerId);
    this.getOEEData();
    this.date = new Date().toISOString().substr(0, 10);
  },
  deactivated() {
    clearTimeout(this.timerId);
  },
  activated() {
    clearTimeout(this.timerId);
    this.getOEEData();
    this.date = new Date().toISOString().substr(0, 10);
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
