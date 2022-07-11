<template>
  <v-layout row wrap style="width: 100%">
    <v-flex xs12 class="px-2">
      <v-form>
        <v-container fluid>
          <v-row class="justify-center">
            <v-col cols="12" md="8">
              <v-combobox
                v-model="currentName"
                :items="names"
                :label="$t('name')"
                outlined
                dense
                append-icon="mdi-magnify"
                @click:append="onSearch"
              ></v-combobox>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex xs12 class="pa-2 mt-n5">
      <div style="width: 100%; height: auto">
        <div
          id="normalDistributionChart"
          style="width: 100%; height: 400px"
          ref="normalDistributionChart"
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
    memsurementData: {}
  },
  data() {
    return {
      memsurement: [],
      searchResult: [],
      dataPoints: [],
      standardValue: 0,
      upperLimit: 0,
      lowerLimit: 0,
      midValue: 0,
      meanValue: 0,
      value: [],
      stdValue: 0,
      x: [],
      y: [],
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
      this.dataPoints = [];
      if (this.searchResult == undefined || this.searchResult.length == 0) {
        return;
      }
      this.value = [];
      this.searchResult.forEach(e => {
        this.value.push(e.value);
        this.upperLimit = math.round(e.upperTolerance + e.standardValue, 3);
        this.lowerLimit = math.round(e.lowerTolerance + e.standardValue, 3);
        this.standardValue = e.standardValue;
        this.chartMaximum = this.upperLimit;
        this.chartMinimum = this.lowerLimit;
      });
      //取得平均值
      this.meanValue = math.mean(this.value);
      //取得標準差
      this.stdValue = math.std(this.value);
      this.midValue = (this.upperLimit + this.lowerLimit) / 2;
      //取得高斯分佈點x值
      this.x = [];
      for (let i = 0; i < 7; i++) {
        const x = math.round(this.meanValue + this.stdValue * (-3 + i), 4);
        this.x.push(x);
      }
      //取得高斯分佈點y值
      this.y = [];
      for (let i = 0; i < 7; i++) {
        const a = 1 / (math.sqrt(2 * math.pi) * this.stdValue);
        const b = -1 * math.pow(this.x[i] - this.meanValue, 2);
        const c = 2 * math.pow(this.stdValue, 2);
        const x = a * math.exp(b / c);
        this.y.push(x);
      }
      //取得chart的x範圍
      for (let i = 0; i < this.x.length; i++) {
        if (this.x[i] > this.chartMaximum) {
          this.chartMaximum = this.x[i];
        }
        if (this.x[i] < this.chartMinimum) {
          this.chartMinimum = this.x[i];
        }
      }
      this.chartMaximum += 0.01;
      this.chartMinimum -= 0.01;
      // console.log(this.chartMaximum);
      //console.log(this.chartMinimum);
    },
    renderData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      const chart = new CanvasJS.Chart("normalDistributionChart", {
        title: { text: this.$t("normalDistribution") },
        zoomEnabled: true,
        animationEnabled: true,
        axisX: {
          maximum: this.chartMaximum,
          minimum: this.chartMinimum,
          gridDashType: "dash",
          stripLines: [
            {
              value: this.upperLimit,
              label: this.upperLimit.toString(),
              labelAlign: "left",
              color: "#FF0800",
              lineDashType: "dot",
              thickness: 3
            },
            {
              value: this.lowerLimit,
              label: this.lowerLimit.toString(),
              labelAlign: "left",
              color: "#FF0800",
              lineDashType: "dot",
              thickness: 3
            },
            {
              value: this.midValue,
              label: this.midValue.toString(),
              labelAlign: "left",
              color: "#01B468",
              lineDashType: "dot",
              thickness: 3
            }
          ]
        },
        data: [
          {
            type: "splineArea",
            markerSize: 0,
            color: "rgba(54,158,173,.7)",
            dataPoints: [
              {
                x: this.x[0],
                y: this.y[0],
                toolTipContent: null
              },
              {
                x: this.x[1],
                y: this.y[1],
                toolTipContent: null
              },
              {
                x: this.x[2],
                y: this.y[2],
                toolTipContent: null
              },
              {
                x: this.x[3],
                y: this.y[3],
                toolTipContent: `平均量測值 : ${this.x[3]}`
              },
              {
                x: this.x[4],
                y: this.y[4],
                toolTipContent: null
              },
              {
                x: this.x[5],
                y: this.y[5],
                toolTipContent: null
              },
              {
                x: this.x[6],
                y: this.y[6],
                toolTipContent: null
              }
            ]
          }
        ]
      });
      chart.render();
    }
  },
  mounted() {
    this.memsurement = this.memsurementData;
    this.onSearch();
  },
  created() {
    this.memsurement = this.memsurementData;
    this.names = [];
    for (let i = 0; i < this.memsurement.length; i++) {
      if (this.names.indexOf(this.memsurement[i].name) == -1) {
        this.names.push(this.memsurement[i].name);
      }
    }
    this.currentName = this.names[0];
  }
};
</script>
<style>
.echarts {
  width: 1000px;
  height: 400px;
}
</style>
