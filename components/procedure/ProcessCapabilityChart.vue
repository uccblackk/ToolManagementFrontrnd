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
          id="processCapabilityChart"
          style="width: 100%; height: 400px"
          ref="processCapabilityChart"
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
      this.dataPoints = [];
      if (this.searchResult == undefined || this.searchResult.length == 0) {
        return;
      }
      this.value = [];
      this.searchResult.forEach(e => {
        this.value.push(e.value);
        this.upperLimit = e.upperTolerance + e.standardValue;
        this.lowerLimit = e.lowerTolerance + e.standardValue;
        this.standardValue = e.standardValue;
        if (e.value > this.upperLimit && e.value > this.chartMaximum) {
          this.chartMaximum = e.value;
        }
        if (e.value < this.lowerLimit && e.value < this.chartMinimum) {
          this.chartMinimum = e.value;
        }
      });
      //取得平均值
      this.meanValue = math.mean(this.value);
      //取得標準差
      this.stdValue = math.std(this.value);
      this.midValue = (this.upperLimit + this.lowerLimit) / 2;
      //計算 ca, cp, cpk
      this.ca = math.round(
        math.abs(
          (this.meanValue - this.midValue) /
            ((this.upperLimit - this.lowerLimit) / 2)
        ),
        3
      );
      this.cp = math.round(
        (this.upperLimit - this.lowerLimit) / (6 * this.stdValue),
        3
      );
      this.cpk = math.round(this.cp * (1 - this.ca), 3);
    },
    renderData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      const chart = new CanvasJS.Chart("processCapabilityChart", {
        axisY: { gridDashType: "dash", minimum: 0, maximum: 3.709 },
        axisX: { labelFontSize: 20 },
        zoomEnabled: true,
        zoomType: "y",
        animationEnabled: true,
        title: { text: this.$t("processCapability") },
        data: [
          {
            indexLabelPlacement: "outside",
            type: "column",
            toolTipContent: "{label2} : {y}, {label1}",
            dataPoints: [
              {
                label: "Ca",
                label2: '<span style="color:#003D79"><b>Ca</b></span>',
                y: this.ca,
                indexLabel: this.ca.toString(),
                indexLabel: `${this.ca}, Level : ${this.getCaLevel(this.ca)}`,
                label1: `<span style="color:#AE0000"><b>${this.$t(
                  "level"
                )}:${this.getCaLevel(this.ca)}, ${this.getLevelHint(
                  this.getCaLevel(this.ca)
                )}</b></span></br><span style="color:#003D79"><strong>※${this.$t(
                  "ca"
                )} Ca</strong></span> : ${this.$t("caExplanation")}`,
                indexLabelFontWeight: "bold",
                indexLabelFontSize: 18,
                indexLabelBackgroundColor: "#FFFFFF"
              },
              {
                label: "Cp",
                label2: '<span style="color:#930000"><b>Cp</b></span>',
                y: this.cp,
                indexLabel: this.cp.toString(),
                indexLabel: `${this.cp}, Level : ${this.getCpLevel(this.cp)}`,
                label1: `<span style="color:#01814A"><b>${this.$t(
                  "level"
                )}:${this.getCpLevel(this.cp)}, ${this.getLevelHint(
                  this.getCpLevel(this.cp)
                )}</b></span></br><span style="color:#930000"><strong>※${this.$t(
                  "cp"
                )} Cp</strong></span> : ${this.$t("cpExplanation")}`,
                indexLabelFontWeight: "bold",
                indexLabelFontSize: 18,
                indexLabelBackgroundColor: "#FFFFFF"
              },
              {
                label: "Cpk",
                label2: '<span style="color:#009100"><b>Cpk</b></span>',
                y: this.cpk,
                indexLabel: this.cpk.toString(),
                indexLabel: `${this.cpk}, Level : ${this.getCpkLevel(
                  this.cpk
                )}`,
                label1: `<span style="color:#AE0000"><b>${this.$t(
                  "level"
                )}:${this.getCpkLevel(this.cp)}, ${this.getLevelHint(
                  this.getCpkLevel(this.cpk)
                )}</b></span></br><span style="color:#009100"><strong>※${this.$t(
                  "cpk"
                )} Cpk</strong></span> : ${this.$t("cpkExplanation")}`,
                indexLabelFontWeight: "bold",
                indexLabelFontSize: 18,
                indexLabelBackgroundColor: "#FFFFFF"
              }
            ]
          }
        ]
      });
      chart.render();
    },
    getCaLevel(ca) {
      if (ca <= 0.0625) {
        return "A";
      } else if (ca > 0.0625 && ca <= 0.125) {
        return "B";
      } else if (ca > 0.125 && ca <= 0.25) {
        return "C";
      } else if (ca > 0.25 && ca <= 0.5) {
        return "D";
      } else if (ca > 0.5) {
        return "E";
      }
    },
    getCpLevel(cp) {
      if (cp >= 1.67) {
        return "A";
      } else if (cp >= 1.33 && cp < 1.67) {
        return "B";
      } else if (cp >= 1.0 && cp < 1.33) {
        return "C";
      } else if (cp >= 0.67 && cp < 1.0) {
        return "D";
      } else if (cp >= 0 && cp < 0.67) {
        return "E";
      }
    },
    getCpkLevel(cpk) {
      if (cpk >= 1.67) {
        return "A";
      } else if (cpk >= 1.33 && cpk < 1.67) {
        return "B";
      } else if (cpk >= 1.0 && cpk < 1.33) {
        return "C";
      } else if (cpk >= 0.67 && cpk < 1.0) {
        return "D";
      } else if (cpk >= 0 && cpk < 0.67) {
        return "E";
      }
    },
    getLevelHint(level) {
      switch (level) {
        case "A":
          return "繼續保持";
        case "B":
          return "改進至A級";
        case "C":
          return "立即改進";
        case "D":
          return "考慮立即停止生產";
        case "E":
          return "立即停止生產";
      }
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
