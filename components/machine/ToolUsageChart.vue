<template>
  <v-row justify="center">
    <v-col cols="12">
      <div style="width:100%;text-align:center">
        <!-- <v-progress-circular
          :rotate="-90"
          :size="140"
          :width="20"
          :value="OEE"
          color="primary"
        >
          <span class="text-h5 font-weight-bold">
            {{ OEE + " %" }}
          </span>
        </v-progress-circular> -->
        <div id="ToolUsageChart" style="height:18vh"></div>
        <div class="font-weight-black">
          <span>{{ useCount + " / " + totalCount }}</span>
        </div>
        <div style="font-size:12px;color:grey">
          <span>{{ " (已使用/總數量)" }}</span>
        </div>
      </div>
    </v-col>
  </v-row>
</template>
<script>
import moment from "moment";

export default {
  props: {
    data: {}
  },
  data() {
    return {
      useCount: 0,
      totalCount: 0,
      chart: null,
      skill: 65,
      utilization: 0,
      performance: 0,
      yieldValue: 0,
      OEE: 0,
      search: "",
      isDescending: true,
      isLoading: 1,
      page: 1,
      pageCount: 0,
      itemsPerPage: 3,
      errorCodeData: {},
      machineStatusData: [],
      percentData: [],
      statusArr: ["1", "2", "5", "7"],
      pieDataPoint: [
        { label: "1", y: 0, color: "#01B468", status: this.$t("status1") },
        { label: "2", y: 0, color: "red", status: this.$t("status2") },
        { label: "5", y: 0, color: "#FFBB77", status: this.$t("status5") },
        { label: "7", y: 0, color: "black", status: this.$t("status7") }
      ],
      dataPoints: [],
      pastData: [],
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
    renderData(toolUsage, dataPoints) {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      // console.log(this.OEE);
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("ToolUsageChart", {
          theme: "light2", // "light1", "light2", "dark1", "dark2"
          // exportEnabled: true,
          // animationEnabled: true,
          title: {
            verticalAlign: "center",
            text: toolUsage.toString() + " %",
            fontSize: 24,
            fontColor: "black"
          },
          animationDuration: 10,
          explodeOnClick: false,
          data: [
            {
              type: "doughnut",
              startAngle: -90,

              showInLegend: false,

              toolTipContent: `<b>${this.$t("usage")} : {text}%</b>`,
              dataPoints: dataPoints
            }
          ]
          // height: 50
        });
      } else {
        //console.log(dataPoints);
        this.chart.options.title.text = toolUsage.toString() + " %";
        this.chart.options.data[0].dataPoints = dataPoints;
      }
      setTimeout(() => {
        this.chart.render();
      }, 200);
    },
    update() {
      this.useCount = 0;
      this.totalCount = Object.keys(this.data).length;
      var dataPoints = [{ y: 100, color: "grey", text: "0" }];
      Object.keys(this.data).forEach(key => {
        //console.log(key); // 001, 002, 003
        // console.log(this.data[key]); // { name: 'Casper', ... }
        if (this.data[key] != null) {
          this.useCount++;
        }
      });
      var toolUsage = (this.useCount / Object.keys(this.data).length) * 100;
      toolUsage = Math.floor(toolUsage * 10) / 10;
      //console.log(toolUsage);
      if (toolUsage != 0) {
        dataPoints = [
          { y: toolUsage, color: "#2894FF", text: toolUsage.toString() },
          { y: 100 - toolUsage, color: "grey", text: toolUsage.toString() }
        ];
      }
      this.renderData(toolUsage, dataPoints);
    }
  },
  mounted() {
    // console.log(Object.keys(this.data).length);
    // var useCount = 0;
    this.update();
  },
  created() {
    //  console.log(this.oeeData);
  },
  watch: {
    data() {
      // console.log(this.data);
      this.update();
      // this.isLoading = 1;
      // this.machineStatusData = this.data;
      // this.getParetoDataPoints();
      // this.renderProportionChart();
    }
  },
  head() {
    return {};
  }
};
</script>
