<template>
  <v-hover v-slot:default="{ hover }" open-delay="100">
    <v-card
      :elevation="hover ? 10 : 2"
      class="transition-swing"
      @click="redirectToDetail()"
      :style="getStatusStyle()"
      height="100%"
    >
      <v-expand-transition>
        <div
          v-if="hover"
          class="d-flex transition-fast-in-fast-out white darken-2 v-card--reveal text-h2 white--text"
          style="height: 100%;"
        ></div>
      </v-expand-transition>

      <v-system-bar
        style="background:black;color:white;opacity:0.6"
        class="text-h7  font-weight-bold text-truncate"
      >
        <v-icon color="white" v-if="lotInfo != ''">
          mdi-information-outline
        </v-icon>
        <div class="text-truncate" style="color:white">
          {{ $t(statusString) + " >" }}

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <span v-on="on" v-bind="attrs" text color="primary" x-small>{{
                lotInfo
              }}</span>
            </template>
            <span>{{ lotTooltip }}</span>
          </v-tooltip>
        </div>
      </v-system-bar>

      <v-progress-linear
        v-if="lotInfo != ''"
        :value="value"
        height="2"
      ></v-progress-linear>
      <v-progress-linear
        v-else
        color="grey lighten-1"
        height="2"
        value="0"
      ></v-progress-linear>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12">
            <v-img
              v-if="machine != undefined"
              align="center"
              justify="center"
              :class="marginTop"
              :src="machine.img"
              width="auto"
              :max-height="height"
              contain
            ></v-img>
          </v-col>
          <v-col cols="12">
            <div
              v-if="machine != undefined"
              class="text-center text-h6 text-truncate"
              style="color:white"
            >
              {{ machine.name }}
            </div></v-col
          >
        </v-row>
      </v-card-text>
    </v-card>
  </v-hover>
</template>
<script>
import mqtt from "mqtt";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    machineData: {},
    height: null,
    marginTop: null
  },
  data() {
    return {
      statusString: "status7",
      lotTooltip: "",
      machine: {},
      mqttData: {},
      mqttClient: {},
      moData: [],
      planQty: null,
      outQty: null,
      lotInfo: null,
      value: 0,
      timerId: null
    };
  },
  watch: {
    machineData() {
      this.machine = this.machineData;
    }
  },
  created() {
    //   this.machine = this.machineData;

    this.showDeleteButton = this.showDelete;
    this.getMachineData();
    this.mqttMSG();
  },
  methods: {
    getStatusStyle() {
      let style =
        "background: rgb(45,46,59);background: linear-gradient(234deg, rgba(45,46,59,1) 0%, rgba(69,70,88,1) 47%, rgba(83,85,106,1) 100%);";
      if (this.mqttData.status == "1") {
        this.statusString = "status1";
        style =
          "background: rgb(3,108,32);background: linear-gradient(234deg, rgba(3,108,32,1) 0%, rgba(7,158,43,1) 53%, rgba(75,195,45,1) 100%)";
      } else if (this.mqttData.status == "2") {
        this.statusString = "status2";
        style =
          "background: rgb(124,5,5);background: linear-gradient(234deg, rgba(124,5,5,1) 0%, rgba(163,25,25,1) 50%, rgba(255,10,10,1) 100%);";
      } else if (this.mqttData.status == "5") {
        this.statusString = "status5";
        style =
          "background: rgb(113,89,0);background: linear-gradient(234deg, rgba(113,89,0,1) 0%, rgba(176,148,21,1) 47%, rgba(242,220,49,1) 100%);";
      } else if (this.mqttData.status == "7") {
        this.statusString = "status7";
        style =
          "background: rgb(45,46,59);background: linear-gradient(234deg, rgba(45,46,59,1) 0%, rgba(69,70,88,1) 47%, rgba(83,85,106,1) 100%);";
      }
      return style;
    },
    getUser() {
      //console.log(this.machineData);
      if (this.machineData.lotWipData != undefined) {
        return (
          this.$t("operator") + "：" + this.machineData.lotWipData.userName
        );
      } else {
        return "無使用者";
      }
    },
    getMachineData() {
      const token = this.$store.state.authUser.token;
      let total_Data = [];
      if (this.machineData == undefined) return;
      console.log(this.machineData);
      this.$axios
        .get(`/Machine/` + this.machineData.id, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machine = res.data.data != null ? res.data.data : [];
          this.getLot();
          this.timerId = setTimeout(this.getMachineData, 10000);
        });
    },
    getLot() {
      //  console.log(this.machineData);

      if (this.machine.lotWipData != undefined) {
        const token = this.$store.state.authUser.token;
        let type = "partNo";
        this.$axios
          .get(`/Lot/Get?id=${this.machine.lotWipData.lotId}`, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            this.moData = res.data.data != null ? res.data.data : [];

            this.lotInfo = this.moData.lotNo;
            this.value =
              (parseFloat(this.machine.lotWipData.outQty) /
                parseFloat(this.machine.lotWipData.planQty)) *
              100;
            if (this.machine.lotWipData.outQty == null) {
              this.lotTooltip =
                "0 / " +
                this.machine.lotWipData.planQty +
                " (出站數量/預計產量)";
            } else {
              this.lotTooltip =
                parseFloat(this.machine.lotWipData.outQty) +
                " / " +
                this.machine.lotWipData.planQty +
                " (出站數量/預計產量)";
            }
          });
      } else {
        this.lotInfo = "";
      }
    },
    getMachineStatus() {
      let status = "disconnect";
      status = this.mqttData.status;
      return status;
    },
    redirectToDetail() {
      this.$router.push(`/machine/${this.machine.id}`);
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
    mqttMSG() {
      const options = {
        connectTimeout: 40000,
        clientId: this.uuid(),
        clean: true
      };
      if (this.machine == undefined) return;
      // mqtt连接
      if (!this.mqttClient.connted) {
        this.mqttClient = mqtt.connect(setting.mqtt.url, options);
        this.mqttClient.on("connect", e => {
          // console.log("连接成功:");
          this.mqttClient.subscribe(
            `${setting.mqtt.customer}/D200/tc/${this.machine.no}/EqInfo/GetStatus`,
            { qos: 0 },
            error => {
              if (!error) {
                //  console.log("订阅成功");
              } else {
                //  console.log("订阅失败");
              }
            }
          );
        });
        // 接收消息处理
        this.mqttClient.on("message", (topic, message) => {
          const mqttData = JSON.parse(message.toString());
          this.mqttData = mqttData.data;
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          //  console.log("连接失败:", error);
        });
      }
    }
  },
  beforeDestroy() {
    //斷線
    clearTimeout(this.timerId);
    this.mqttClient.unsubscribe(
      `${setting.mqtt.customer}/D200/tc/${this.machine.no}/EqInfo/GetStatus`,
      error => {
        //   console.log("取消訂閱");
        if (error) {
          //  console.log("Unsubscribe error", error);
        }
      }
    );
    this.mqttClient.end();
    this.mqttClient = {
      connected: false
    };
  },
  mounted() {},
  beforeDestroy() {
    clearTimeout(this.timerId);
    if (this.mqttClient.connected) {
      this.mqttClient.unsubscribe(
        `${setting.mqtt.customer}/D200/tc/${this.machine.no}/EqInfo/GetStatus`,
        error => {
          //   console.log("取消訂閱");
          if (error) {
            //  console.log("Unsubscribe error", error);
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
    //console.log("activated");
    this.machine = this.machineData;

    this.showDeleteButton = this.showDelete;
    this.getMachineData();
    this.mqttMSG();
  },
  deactivated() {
    clearTimeout(this.timerId);
    if (this.mqttClient.connected) {
      this.mqttClient.unsubscribe(
        `${setting.mqtt.customer}/D200/tc/${this.machine.no}/EqInfo/GetStatus`,
        error => {
          //   console.log("取消訂閱");
          if (error) {
            //  console.log("Unsubscribe error", error);
          }
        }
      );
      this.mqttClient.end();
      this.mqttClient = {
        connected: false
      };
    }
  }
};
</script>
<style>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  left: 0;
  justify-content: center;
  opacity: 0.3;
  position: absolute;
  width: 100%;
}
</style>
