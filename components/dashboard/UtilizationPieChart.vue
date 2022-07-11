<template>
  <div style="width: 100%;">
    <v-card id="info-box">
      <v-card-title class="text-h5 font-weight-bold">
        {{ $t("utilityDistribution") }}
        <v-spacer />
        <span class="caption">
          {{ date }}
        </span>
      </v-card-title>

      <v-card-text>
        <div
          id="UtilizationPieChart"
          style="height:20vh;margin-top:-10px"
          ref="utilizationPieChart"
        >
          <span v-if="dataPoints.length == 0">無資料</span>
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
    data: {}

    // height: null
  },
  data() {
    return {
      height: null,
      machineData: [],
      dataPoints: [],
      mqttData: [],
      mqttClient: {},
      runningCount: 0,
      idleCount: 0,
      errorCount: 0,
      chart: null,
      disconnectCount: 0,
      dataTableHeight: 0,
      machineList: [],
      date: null
    };
  },
  methods: {
    transData() {
      this.dataPoints = [];
    },
    renderData(dataPoints) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("UtilizationPieChart", {
          theme: "light2", // "light1", "light2", "dark1", "dark2"
          // exportEnabled: true,
          // animationEnabled: true,
          animationDuration: 10,
          legend: {
            fontSize: 14
          },

          data: [
            {
              type: "doughnut",
              startAngle: 60,

              // showInLegend: "true",
              // legendText: "{label}",
              //innerRadius: 60,
              showInLegend: true,
              legendText: `{label}：{y} ${this.$t("pcs")}`,

              indexLabelFontSize: 18,
              indexLabel: "{label} - #percent% ",
              toolTipContent: `<b>{label}:</b> {y} ${this.$t(
                "pcs"
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
    updateDataTableHeight() {
      this.dataTableHeight = this.$refs.parentDiv.clientHeight;
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
      let machineData = [];
      let dataPoints = [];
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
          this.date = new Date().toISOString().substr(0, 10);
          const mqttData = JSON.parse(message.toString());
          //  console.log(this.machineList.find(x => x.no == mqttData.MachineNo));

          if (
            this.machineList.find(x => x.no == mqttData.machineNo) != undefined
          ) {
            let pos = machineData
              .map(x => x.machineNo)
              .indexOf(mqttData.machineNo);
            if (pos == -1) {
              machineData.push(mqttData);
            } else {
              machineData.splice(pos, 1);
              machineData.push(mqttData);
            }
            // console.log(this.machineData);

            let statusString = "";
            let colorString = "";
            let yValue = 0;
            dataPoints = [];

            yValue = machineData.filter(x => x.data.status === "1").length;
            statusString = "加工中";
            colorString = "#01B468";
            this.runningCount = yValue;
            if (yValue > 0) {
              dataPoints.push({
                y: yValue,
                label: statusString,
                color: colorString
              });
            }

            yValue = machineData.filter(x => x.data.status === "2").length;
            statusString = "異常";
            colorString = "red";
            this.errorCount = yValue;
            if (yValue > 0) {
              dataPoints.push({
                y: yValue,
                label: statusString,
                color: colorString
              });
            }

            yValue = machineData.filter(x => x.data.status === "5").length;
            statusString = "閒置";
            colorString = "#FFBB77";
            this.idleCount = yValue;
            if (yValue > 0) {
              dataPoints.push({
                y: yValue,
                label: statusString,
                color: colorString
              });
            }

            yValue = machineData.filter(x => x.data.status === "7").length;
            statusString = "斷線";
            colorString = "gray";
            this.disconnectCount = yValue;
            if (yValue > 0) {
              dataPoints.push({
                y: yValue,
                label: statusString,
                color: colorString
              });
            }

            //  console.log(this.machineData);
            //  console.log(this.dataPoints);
          }
          this.renderData(dataPoints);
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          console.log("连接失败:", error);
        });
      }
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

  beforeDestroy() {
    // console.log("destory");
    if (this.mqttClient.connted) {
      this.mqttDisconnected();
    }
  },
  mounted() {
    if (this.mqttClient.connted) {
      this.mqttDisconnected();
    }
    if (this.chart != null) {
      this.chart.render();
    }
    this.machineList = this.data;
    this.date = new Date().toISOString().substr(0, 10);
    this.mqttMSG();
  },

  created() {
    // console.log(this.machineList);
    //console.log(this.areaNo);
  },
  activated() {
    if (this.mqttClient.connted) {
      this.mqttDisconnected();
    }
    if (this.chart != null) {
      this.chart.render();
    }
    this.machineList = this.data;
    this.date = new Date().toISOString().substr(0, 10);
    this.mqttMSG();
  },
  deactivated() {
    if (this.mqttClient.connted) {
      this.mqttDisconnected();
    }
  },
  watch: {
    data() {
      if (this.mqttClient.connted) {
        this.mqttDisconnected();
      }
      this.machineList = this.data;
      this.mqttMSG();
      //  console.log(this.machineList);
    }
  },
  head() {
    return {};
  }
};
</script>
<style></style>
