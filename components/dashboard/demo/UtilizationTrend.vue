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
        {{ $t("Utilization") + $t("trend") }}
        <v-spacer />
        <span class="caption">
          {{ dates[0] + "~" + dates[1] }}
        </span>
      </v-card-title>

      <v-card-text>
        <div
          id="UtilizationTrendChart"
          style="height:230px"
          ref="UtilizationTrendChart"
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
      statusArr: ["1", "2", "5", "7"],
      height: null,
      machineData: [],

      mqttData: [],
      mqttClient: {},
      runningCount: 0,
      idleCount: 0,
      errorCount: 0,
      disconnectCount: 0,
      dataTableHeight: 0,
      dates: [],
      percentData: [],
      chart: null,
      loading: false,
      intervalID: null,
      timerId: null
    };
  },
  methods: {
    GetRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    },
    transData() {
      // console.log(this.data.map(e => e.machineId));
      let dataPoints = [];
      let totalPercentData = [];
      const token = this.$store.state.authUser.token;
      const id = this.id;

      let dateArray = [];
      let selectStartDate = new Date(this.dates[0] + " 00:00:00");
      let selectEndDate = new Date(this.dates[1] + " 23:59:59");

      // console.log(this.data);

      // if (this.data == undefined) {
      //   return;
      // }
      let percentData = [];

      for (let k = 0; k < 7; k++) {
        let time = [0, 0, 0, 0];
        for (let i = 0; i < this.statusArr.length; i++) {
          let color = "red";
          //console.log(e.status + ". " + startHour + "~" + endHour);
          switch (this.statusArr[i]) {
            case "1":
              color = "#01B468";
              break;
            case "5":
              color = "#FFBB77";
              break;
            case "7":
              color = "black";
              break;
            case "2":
              color = "red";
              break;
          }
          let item = {
            x: moment(this.dates[0], "YYYY-MM-DD")
              .add(k, "days")
              .toDate(),
            status: this.statusArr[i],
            name: this.$t("status" + this.statusArr[i]),
            y: this.GetRandomInt(1000, 3000),
            color: color
            // label: dateArray[k].startDate
          };
          totalPercentData.push(item);
        }
      }

      return totalPercentData;
      //  console.log(this.percentData);
    },
    getItem(startTime, endTime, actualStartTime, actualEndTime, status) {
      // console.log(startTime);
      // console.log(endTime);
      const diffDay = Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24);
      // console.log(diffDay);
      const diff = moment.duration(
        actualEndTime.getTime() - actualStartTime.getTime()
      );
      const startHour =
        startTime.getHours() +
        startTime.getMinutes() / 60 +
        startTime.getSeconds() / 3600;
      const endHour =
        diffDay * 24 +
        endTime.getHours() +
        endTime.getMinutes() / 60 +
        endTime.getSeconds() / 3600;
      let color = "red";
      //console.log(e.status + ". " + startHour + "~" + endHour);
      switch (status) {
        case "1":
          color = "#01B468";
          break;
        case "5":
          color = "#FFBB77";
          break;
        case "7":
          color = "black";
          break;
        case "2":
          color = "red";
          break;
      }
      let statusString = "";
      if (status != null) {
        statusString = this.$t("status" + status);
      }

      let item = {
        x: new Date(
          startTime.getFullYear(),
          startTime.getMonth(),
          startTime.getDate()
        ),
        startTime: startTime,
        endTime: endTime,
        status: status,
        y: [startHour, endHour],
        color: color,
        label1: moment(actualStartTime).format("YYYY/MM/DD HH:mm:ss"),
        label2: moment(actualEndTime).format("YYYY/MM/DD HH:mm:ss"),
        label3: statusString,
        label5: "N/A",
        label6: `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`
      };

      return item;
    },
    renderData(totalPercentData) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      // let chart = null;
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("UtilizationTrendChart", {
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
            interval: 10,
            suffix: "%",
            gridThickness: 0
          },
          zoomEnabled: true,

          legend: { cursor: "pointer" },
          data: [
            {
              xValueFormatString: "YYYY/MM/DD",
              type: "stackedColumn100",
              toolTipContent: "{x}<br><b>{name}:</b> #percent% ({y} min)",
              dataPoints: totalPercentData
            }
          ]
        });
      } else {
        this.chart.options.data[0].dataPoints = totalPercentData;
      }

      // console.log(this.percentData);
      this.chart.render();
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async GetUtilizationData() {
      await this.sleep(1);
      let totalPercentData = [];
      const token = this.$store.state.authUser.token;
      this.percentData = [];
      let totalData = [];
      this.loading = true;
      //   console.log(this.dates);
      this.$axios
        .$get(
          `/MachineStatus/GetAllMachineStatus?startTime=${this.dates[0]}&endTime=${this.dates[1]}&areaNo=${this.areaNo}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          totalData = res.data;
          // console.log(this.totalData);
          totalPercentData = this.transData(totalData);
          this.renderData(totalPercentData);
          this.dates = [
            moment().format("YYYY-MM-DD"),
            moment().format("YYYY-MM-DD")
          ];
          this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
            .add(-6, "days")
            .format("YYYY-MM-DD");
          this.loading = false;

          this.timerId = setTimeout(this.GetUtilizationData, 10000);
        })
        .catch(({ response }) => {
          this.loading = false;
          this.timerId = setTimeout(this.GetUtilizationData, 10000);
        });
    }
  },
  beforeDestroy() {
    // clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    //console.log(this.intervalID);
  },
  mounted() {
    clearTimeout(this.timerId);
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
      .add(-6, "days")
      .format("YYYY-MM-DD");
    this.renderData(this.transData());
    //三十秒更新一次
    // this.intervalID = setInterval(this.GetUtilizationData, 10000);
    // this.GetUtilizationData();
  },
  watch: {
    areaNo() {
      clearTimeout(this.timerId);
      // this.GetUtilizationData();
    }
  },
  created() {},
  activated() {
    clearTimeout(this.timerId);
    if (this.chart != null) {
      this.chart.render();
    }
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dates[0] = moment(this.dates[0], "YYYY-MM-DD")
      .add(-6, "days")
      .format("YYYY-MM-DD");
    //  this.GetUtilizationData();
  },
  deactivated() {
    clearTimeout(this.timerId);
    // console.log(this.intervalID);
  },
  head() {
    return {};
  }
};
</script>
<style></style>
