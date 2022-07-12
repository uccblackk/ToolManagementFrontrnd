<template>
  <v-hover v-slot:default="{ hover }" open-delay="200">
    <v-card
      max-width="400"
      class="transition-swing"
      height="auto"
      :elevation="hover ? 6 : 2"
    >
      <div class="text-right mx-2">
        <!-- <v-icon v-if="showDelete" small @click="deleteMachine()"
          >mdi-close</v-icon
        > -->
      </div>
      <div class="text-center mt-n0" style="text-align:center;width:100%">
        <v-row no-gutters>
          <div style="text-align:center;width:100%">
            <v-avatar
              v-if="machine.img == null"
              color="grey darken-1 white--text text-h5"
              class="mt-1"
              size="150"
              dark
            >
              <span class="text-truncate" style="max-width: 140px;">
                {{ machine.name }}
              </span>
            </v-avatar>
            <v-img
              v-if="machine.img != null"
              class="mt-1"
              :src="machine.img"
              width="auto"
              height="150px"
              contain
            ></v-img>
          </div>
        </v-row>
        <v-row no-gutters>
          <div style="text-align:center;width:100%">
            <v-btn text @click="redirectToDetail()">
              {{ machine.name }}
            </v-btn>
          </div>
        </v-row>

        <v-tooltip v-if="machine.maintenanceData.length > 0" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-chip small v-bind="attrs" v-on="on" class="success">
              {{ $t("maintenance") + $t("ing") }}
            </v-chip>
          </template>
          {{ machine.maintenanceData[0].content }}
        </v-tooltip>
      </div>
      <v-divider class="mx-4"></v-divider>
      <v-card-subtitle>
        <v-row no-gutters>
          <v-col md="12">
            <span class="font-weight-black" style="color: #0080FF	">{{
              machine.areaName
            }}</span>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col md="2">
            <span style="color: gray">{{ $t("brand") }}:</span>
          </v-col>
          <v-col md="4">
            <span style="color: gray">{{ machine.brand }}</span>
          </v-col>
          <v-col md="2">
            <span style="color: gray">{{ $t("series") }}:</span>
          </v-col>
          <v-col md="4">
            <span style="color: gray">{{ machine.series }}</span>
          </v-col>
          <v-col md="2">
            <span style="color: gray">{{ $t("type") }}:</span>
          </v-col>
          <v-col md="4">
            <span style="color: gray">{{ machine.type }}</span>
          </v-col>
        </v-row>
      </v-card-subtitle>
    </v-card>
  </v-hover>
</template>
<script>
import mqtt from "mqtt";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    machineData: {},
    showDelete: false
  },
  data() {
    return {
      dispatchStartDate: null,
      lotNo: null,
      lotTooltip: "",
      machine: {},
      mqttData: {},
      mqttClient: {},
      moData: [],
      planQty: null,
      outQty: null,
      lotInfo: null,
      value: 0
    };
  },
  created() {
    this.machine = this.machineData;

    this.showDeleteButton = this.showDelete;
    this.mqttMSG();
  },
  methods: {
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
    getLot() {
      //  console.log(this.machineData);

      if (this.machineData.lotWipData != undefined) {
        this.dispatchStartDate = this.machineData.lotWipData.dispatchStartDate;
        const token = this.$store.state.authUser.token;
        let type = "partNo";
        this.$axios
          .get(`/Lot/Get?id=${this.machineData.lotWipData.lotId}`, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            this.moData = res.data.data != null ? res.data.data : [];
            this.lotNo = this.moData.lotNo;
            this.lotInfo = this.$t("lot") + "：" + this.moData.lotNo;
          });
      } else {
        this.lotInfo = "無任務";
      }
    },
    getMachineStatus() {
      let status = "disconnect";
      status = this.mqttData.status;
      return status;
    },
    redirectToJobReport() {
      this.$router.push(
        `/jobReport/jobReport/${this.lotNo}?date=${this.dispatchStartDate}`
      );
    },
    redirectToDetail() {
      this.$router.push(`/machine/${this.machine.id}`);
      // this.updateTabItem({
      //   text: this.machine.name,
      //   to: `/machine/${this.machine.id}`
      // });
    },
    updateTabItem(sublink) {
      let linkData = {
        text: sublink.text,
        to: sublink.to
      };
      this.$store.commit("updateTabItem", linkData);
    },
    deleteMachine() {
      const token = this.$store.state.authUser.token;
      const axios = this.$axios;
      const self = this;
      this.$swal({
        title: this.machine.name,
        text: `${this.$t("deleteConfirm")} ?`,
        showCancelButton: true,
        confirmButtonText: this.$t("confirm"),
        cancelButtonText: this.$t("cancel"),
        icon: "question"
      }).then(
        function(dismiss) {
          if (!dismiss.value) {
            return;
          }
          axios
            .delete(`/machine/delete/${self.machine.id}`, {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              if (res.data.isSuccess) {
                this.$swal(
                  self.machine.name,
                  self.$t("deleteSuccess"),
                  "success"
                );
                self.machine = {};
                self.$emit("delete", self.machine);
              } else {
                this.$swal(self.machine.name, self.$t("deleteFailed"), "error");
              }
            });
        },
        function() {}
      );
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
        clean: true,
        username: setting.mqtt.username,
        password: setting.mqtt.password
      };

      // mqtt连接
      if (!this.mqttClient.connted) {
        this.mqttClient = mqtt.connect(setting.mqtt.url, options);
        this.mqttClient.on("connect", e => {
          console.log("连接成功:");
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
          console.log("连接失败:", error);
        });
      }
    }
  },
  beforeDestroy() {
    //斷線
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
    this.machine = this.machineData;
    if (this.machineData.lotWipData != undefined) {
      this.value =
        (parseFloat(this.machineData.lotWipData.outQty) /
          parseFloat(this.machineData.lotWipData.planQty)) *
        100;
      if (this.machineData.lotWipData.outQty == null) {
        this.lotTooltip =
          "0 / " +
          this.machineData.lotWipData.planQty +
          " (出站數量/預計生產數量)";
      } else {
        this.lotTooltip =
          parseFloat(this.machineData.lotWipData.outQty) +
          " / " +
          this.machineData.lotWipData.planQty +
          " (出站數量/預計生產數量)";
      }
    }
    this.showDeleteButton = this.showDelete;
    this.getLot();
    this.mqttMSG();
  },
  deactivated() {
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
<style></style>
