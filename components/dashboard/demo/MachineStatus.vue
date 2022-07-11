<template>
  <div style="width: 100%;">
    <v-card id="info-box" height="308px">
      <v-card-title class="text-h5 font-weight-bold">
        {{ $t("machineUtilization") }}
        <span class="ml-2 text-overline">{{
          "(" + machineList.length + "臺設備)"
        }}</span>
        <v-spacer />
        <span class="caption">
          {{ date }}
        </span>
      </v-card-title>

      <v-card-text>
        <v-carousel
          light
          cycle
          height="230px"
          hide-delimiter-background
          show-arrows-on-hover
          v-model="model"
        >
          <v-carousel-item v-for="(data, i) in totalData" :key="i">
            <div class="text-center mt-n0">
              <v-row>
                <v-col v-for="(detail, idx) in data" :key="idx" cols="2">
                  <v-row no-gutters>
                    <v-col>
                      <div style="text-align:center">
                        <v-avatar
                          v-if="detail.img == null"
                          color="grey darken-1 white--text text-h5"
                          class="mt-1"
                          size="120"
                          dark
                        >
                          <span class="text-truncate" style="max-width: 110px;">
                            {{ detail.name }}
                          </span>
                        </v-avatar>
                      </div>
                      <v-img
                        v-if="detail.img != null"
                        class="mt-1"
                        :src="detail.img"
                        width="auto"
                        height="120px"
                        contain
                      ></v-img>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-btn text>
                        <span
                          @click="redirectToDetail(detail.id)"
                          class="font-weight-black text-h6"
                        >
                          {{ detail.name }}
                        </span>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-img
                        v-if="detail.status == '1'"
                        :src="require('@/assets/images/machine/status/Run.jpg')"
                        width="100%"
                        height="30"
                        contain
                      ></v-img>
                      <v-img
                        v-else-if="detail.status == '5'"
                        :src="
                          require('@/assets/images/machine/status/Stop.jpg')
                        "
                        width="100%"
                        height="30"
                        contain
                      ></v-img>
                      <v-img
                        v-else-if="detail.status == '2'"
                        :src="
                          require('@/assets/images/machine/status/EmergencyStop.jpg')
                        "
                        width="100%"
                        height="30"
                        contain
                      ></v-img>
                      <v-img
                        v-else
                        :src="
                          require('@/assets/images/machine/status/Disconnect.jpg')
                        "
                        width="100%"
                        height="30"
                        contain
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </v-carousel-item>
        </v-carousel>
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
    data: {}
    // height: null
  },
  data() {
    return {
      statusArr: ["1", "2", "5", "7"],
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
      date: null,
      timerId: null
    };
  },
  methods: {
    redirectToDetail(id) {
      this.$router.push(`/machine/${id}`);
    },
    getMachineStatus(machineNo) {
      let status = "1";
      let value = Math.random();

      if (value > 0.5) {
        status = "5";
      }

      // let data = this.machineData.find(x => x.machineNo == machineNo);
      // // console.log(data);
      // if (data != undefined) {
      //   status = data.data.status;
      // }
      return status;
    },
    uuid() {
      var d = Date.now();
      if (
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
      ) {
        d += performance.now(); //use high-precision timer if available
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
    },
    GetRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    },
    mqttMSG() {
      const options = {
        connectTimeout: 40000,
        clientId: this.uuid(),
        clean: true
      };

      // mqtt连接
      if (!this.mqttClient.connted) {
        this.mqttClient = mqtt.connect(setting.mqtt.url, options);
        this.mqttClient.on("connect", e => {
          console.log("连接成功:");
          this.mqttClient.subscribe(
            `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
            { qos: 0 },
            error => {
              if (!error) {
                console.log("订阅成功");
              } else {
                console.log("订阅失败");
              }
            }
          );
        });
        // 接收消息处理
        this.mqttClient.on("message", (topic, message) => {
          //    console.log(message.toString());
          const mqttData = JSON.parse(message.toString());
          this.date = new Date().toISOString().substr(0, 10);
          let pos = this.machineData
            .map(x => x.machineNo)
            .indexOf(mqttData.machineNo);
          if (pos == -1) {
            this.machineData.push(mqttData);
          } else {
            this.machineData.splice(pos, 1);
            this.machineData.push(mqttData);
          }
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          console.log("连接失败:", error);
        });
      }
    },
    getMachineData() {
      let total_Data = [];
      let detail = [];
      for (let i = 0; i < this.machineList.length; i++) {
        this.machineList[i].status = this.statusArr[this.GetRandomInt(0, 3)];
        detail.push(this.machineList[i]);
        if (
          (i + 1) % this.itemPerPage == 0 ||
          i + 1 == this.machineList.length
        ) {
          total_Data.push(detail);
          detail = [];
        }

        // console.log(detail);
      }
      this.totalData = total_Data;
      this.timerId = setTimeout(this.getMachineData, 1000 * 5);
    },
    mqttDisconnected() {
      //斷線
      this.mqttClient.unsubscribe(
        `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
        error => {
          console.log("取消訂閱");
          if (error) {
            console.log("Unsubscribe error", error);
          }
        }
      );
      this.mqttClient.end();
      this.mqttClient = {
        connected: false
      };
    }
  },
  activated() {
    if (this.mqttClient.connted) {
      // this.mqttDisconnected();
    }
    this.machineList = this.data;
    this.date = new Date().toISOString().substr(0, 10);
    let detail = [];
    let total_Data = [];
    for (let i = 0; i < this.machineList.length; i++) {
      detail.push(this.machineList[i]);
      if ((i + 1) % this.itemPerPage == 0 || i + 1 == this.machineList.length) {
        total_Data.push(detail);
        detail = [];
      }

      // console.log(detail);
    }
    this.totalData = total_Data;
    //this.mqttMSG();
  },
  deactivated() {
    // this.mqttDisconnected();
  },
  beforeDestroy() {
    clearTimeout(this.timerId);
    // this.mqttDisconnected();
  },
  mounted() {
    // this.getMachineData();
  },

  created() {
    if (this.mqttClient.connted) {
      //  this.mqttDisconnected();
    }
    this.machineList = this.data;
    this.date = new Date().toISOString().substr(0, 10);
    this.getMachineData();
  },
  watch: {
    data() {
      if (this.mqttClient.connted) {
        //this.mqttDisconnected();
      }
      this.machineList = this.data;
      let detail = [];
      let total_Data = [];
      for (let i = 0; i < this.machineList.length; i++) {
        detail.push(this.machineList[i]);
        if (
          (i + 1) % this.itemPerPage == 0 ||
          i + 1 == this.machineList.length
        ) {
          total_Data.push(detail);
          detail = [];
        }

        // console.log(detail);
      }
      this.totalData = total_Data;
      //this.mqttMSG();
      //  console.log(this.machineList);
    }
  },
  head() {
    return {};
  }
};
</script>
<style></style>
