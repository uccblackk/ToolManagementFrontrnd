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
          id="measurementDistributionChart"
          style="width: 100%; height: 400px"
          ref="distributionChart"
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
      upperLimit: 0,
      lowerLimit: 0,
      chartMaximum: 0,
      chartMinimum: 0,
      standardValue: 0,
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
      this.chartMaximum = math.round(
        this.searchResult[0].upperTolerance +
          this.searchResult[0].standardValue,
        3
      );
      this.chartMinimum = math.round(
        this.searchResult[0].lowerTolerance +
          this.searchResult[0].standardValue,
        3
      );
      this.searchResult.forEach(e => {
        let item = {
          indexLabel: e.number.toString(),
          x: e.number,
          y: e.value,
          label: e.number.toString()
        };
        this.dataPoints.push(item);
        this.upperLimit = math.round(e.upperTolerance + e.standardValue, 3);
        this.lowerLimit = math.round(e.lowerTolerance + e.standardValue, 3);
        this.standardValue = e.standardValue;
        if (e.value > this.upperLimit && e.value > this.chartMaximum) {
          this.chartMaximum = e.value;
        }
        if (e.value < this.lowerLimit && e.value < this.chartMinimum) {
          this.chartMinimum = e.value;
        }
      });
      this.chartMaximum += 0.01;
      this.chartMinimum -= 0.01;
    },
    renderData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      const chart = new CanvasJS.Chart("measurementDistributionChart", {
        animationEnabled: true,
        title: { text: this.$t("measurementResult") },
        axisX: { maximum: this.dataPoints.length + 1 },
        axisY: {
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
              value: this.standardValue,
              label: this.standardValue.toString(),
              labelAlign: "left",
              color: "#01B468",
              lineDashType: "dot",
              thickness: 3
            }
          ]
        },
        legend: { cursor: "pointer" },
        data: [
          {
            color: "	#0066cc",
            type: "scatter",
            markerSize: 10,
            name: this.$t("measurementData"),
            toolTipContent: "<strong>{name} {label} </strong>: {y} ",
            showInLegend: true,
            dataPoints: this.dataPoints
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
