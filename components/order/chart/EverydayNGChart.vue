<template>
  <v-layout row wrap style="width: 100%">
    <v-flex xs12 class="pa-2 mt-2">
      <div style="width: 100%; height: auto">
        <div
          id="EverdayNGChart"
          style="width: 100%; height: 600px"
          ref="EverdayNGChart"
        ></div>
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
import * as math from "mathjs";
export default {
  props: {
    data: [],
    opData: {}
  },
  data() {
    return {
      chart: null,
      memsurement: [],
      searchResult: [],
      NGDataPoints: [],
      orderDataPoints: [],
      dataPoints: [],
      standardValue: 0,
      upperLimit: 0,
      lowerLimit: 0,
      midValue: 0,
      meanValue: 0,
      value: [],
      stdValue: 0,
      ca: 0,
      cp: 0,
      cpk: 0,
      names: [],
      currentName: ""
    };
  },
  methods: {
    onSearch() {
      this.searchResult = this.memsurement;
      const currentName = this.currentName;
      if (this.searchResult.length > 0) {
        this.searchResult = this.searchResult.filter(item => {
          return item.name == currentName;
        });
      }
      this.transData();
      this.renderData();
    },
    transData() {
      this.NGDataPoints = [];
      this.orderDataPoints = [];
      if (this.data == undefined || this.data.length == 0) {
        return;
      }
      //  console.log(this.data);
      //console.log(this.data[0].doneData[this.opData.opNo]);
      let NGCount = 0;
      let totalCount = 0;
      this.data.forEach(lotOp => {
        NGCount = lotOp.ngData[this.opData.opNo];
        totalCount = lotOp.totalLotOpCount;
        this.NGDataPoints.push({
          y: NGCount,
          x: new Date(lotOp.createDate)
        });
        this.orderDataPoints.push({
          y: totalCount,
          x: new Date(lotOp.createDate)
        });
      });

      this.value = [];
    },
    renderData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("EverdayNGChart", {
          animationEnabled: true,
          exportEnabled: true,
          title: {
            text: this.opData.opName,
            fontWeight: "bold",
            fontSize: 26
          },
          subtitles: [
            {
              text: this.$t("everydayNG"),
              fontSize: 16
            }
          ],
          axisX: {
            interval: 1,
            intervalType: "day",
            valueFormatString: "MM/DD",
            labelFontSize: 14
          },
          legend: {
            fontSize: 16
          },
          axisY: {
            //  interval: 1,
            valueFormatString: "#",
            gridColor: "#B6B1A8",
            tickColor: "#B6B1A8"
          },
          toolTip: {
            shared: true,
            content: toolTipContent
          },
          data: [
            {
              type: "column",
              showInLegend: true,
              color: "red",
              name: this.$t("NG") + this.$t("count"),
              dataPoints: this.NGDataPoints
            },
            {
              type: "column",
              showInLegend: true,
              name: this.$t("orderCount"),
              color: "#0080FF",
              dataPoints: this.orderDataPoints
            }
          ]
        });
      } else {
        this.chart.options.title.text = this.opData.opName;
        this.chart.options.subtitles[0].text = this.$t("everydayNG");
        this.chart.options.data[0].dataPoints = this.NGDataPoints;
        this.chart.options.data[1].dataPoints = this.orderDataPoints;
      }

      function toolTipContent(e) {
        var str = "";
        var total = 0;
        var str2, str3;
        for (var i = 0; i < e.entries.length; i++) {
          var str1 =
            '<span style= "color:' +
            e.entries[i].dataSeries.color +
            '"> ' +
            e.entries[i].dataSeries.name +
            "</span>: <strong>" +
            e.entries[i].dataPoint.y +
            "</strong> pcs<br/>";
          total = e.entries[i].dataPoint.y + total;
          str = str.concat(str1);
        }
        str2 =
          "<span style = ><strong>" +
          (e.entries[0].dataPoint.x.getMonth() + 1) +
          "/" +
          e.entries[0].dataPoint.x.getDate() +
          "</strong></span><br/>";

        return str2.concat(str);
      }
      setTimeout(() => {
        this.chart.render();
      }, 200);
      // chart.render();
    }
  },
  mounted() {
    // console.log("mounted");
    this.transData();
    this.renderData();
  },
  watch: {
    data() {
      console.log(this.data);
      this.transData();
      this.renderData();
    }
  },
  created() {}
};
</script>
<style>
.echarts {
  width: 1000px;
  height: 400px;
}
</style>
