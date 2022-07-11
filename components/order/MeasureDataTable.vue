<template>
  <v-layout row wrap style="width: 100%">
    <!-- 新增量測資料彈窗 -->
    <v-dialog v-model="addDialog" persistent max-width="600px">
      <v-card ref="form">
        <v-card-title class="info">
          <span class=" headline white--text">
            <v-icon color="white">mdi-plus</v-icon>
            {{ $t("add") + $t("measurementData") }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="addForm" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    :label="'*' + $t('workPiece') + $t('No')"
                    v-model="addForm.number"
                    type="number"
                    oninput="if(this.value < 1) this.value = 1;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    :max="lotOpData.qty"
                    @input="onNumberChange()"
                    requird
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    :label="'*' + $t('measure') + $t('sequence')"
                    v-model="addForm.seq"
                    disabled
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6" md="6">
                  <v-combobox
                    hide-selected
                    small-chips
                    filled
                    dense
                    ref="actionDesc"
                    :label="'*' + $t('measure') + $t('type')"
                    v-model="addForm.type"
                    @input="getMeasureStandard()"
                    :items="typeItems"
                    requird
                    :rules="[v => !!v || this.$t('mustInput')]"
                  ></v-combobox>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-combobox
                    :search-input.sync="search"
                    ref="actionDesc"
                    :label="'*' + $t('measure') + $t('name')"
                    v-model="addForm.name"
                    hide-selected
                    small-chips
                    filled
                    dense
                    @input="getMeasureStandard()"
                    :items="nameItems"
                    requird
                    :rules="[v => !!v || this.$t('mustInput')]"
                  ></v-combobox>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    prepend-inner-icon="mdi-pan-horizontal"
                    ref="actionDesc"
                    :label="'*' + $t('standardValue')"
                    v-model="addForm.standardValue"
                    type="number"
                    color="success"
                    @input="onInputChange()"
                    requird
                    :rules="[v => !!v || this.$t('mustInput')]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    prepend-inner-icon="mdi-pan-up"
                    ref="actionDesc"
                    :label="'*' + $t('upperTolerance')"
                    v-model="addForm.upperLimit"
                    color="red"
                    type="number"
                    :min="addForm.lowerLimit"
                    @input="onInputChange()"
                    requird
                    :rules="[v => !!v || this.$t('mustInput')]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    prepend-inner-icon="mdi-pan-down"
                    ref="actionDesc"
                    :label="'*' + $t('lowerTolerance')"
                    v-model="addForm.lowerLimit"
                    color="red"
                    type="number"
                    :max="addForm.upperLimit"
                    @input="onInputChange()"
                    requird
                    :rules="[v => !!v || this.$t('mustInput')]"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    prepend-inner-icon="mdi-numeric"
                    ref="measureValue"
                    :label="'*' + $t('measureValue')"
                    v-model="addForm.measureValue"
                    type="number"
                    color="primary"
                    @input="onInputChange()"
                    requird
                    :rules="[v => !!v || this.$t('mustInput')]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <div style="width: 100%; height: auto">
                    <div
                      id="chart"
                      style="width: 100%; height: 200px"
                      ref="chart"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    prepend-inner-icon="mdi-pen"
                    ref="actionDesc"
                    :label="$t('notice')"
                    v-model="addForm.notice"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <small>*{{ $t("inputRequired") }}</small>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-checkbox
            v-model="continueAdd"
            :label="$t('continue') + $t('add')"
            class="ml-3"
          ></v-checkbox>
          <v-spacer></v-spacer>
          <v-btn class="gray" @click="addDialog = false">{{
            $t("cancel")
          }}</v-btn>
          <v-btn class="info" dark text @click="addMeasureData()">
            {{ $t("add") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-flex md12 class="px-2">
      <v-form>
        <v-container fluid>
          <v-row class="justify-center">
            <v-col cols="12" md="8">
              <v-combobox
                v-model="currentNumber"
                :items="number"
                :label="$t('item')"
                outlined
                dense
                @input="onSearch()"
                append-icon="mdi-magnify"
                @click:append="onSearch"
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="2">
              <v-btn class="primary" @click="onAddBtnClick()"
                ><v-icon small>mdi-plus</v-icon>{{ $t("add") }}</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex md12 class="pa-2 mt-n5">
      <v-data-table
        :headers="headers"
        :items="searchResult"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:[`item.status`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-if="getStatus(item) == 'qualified'"
                class="ma-2"
                color="success"
                v-bind="attrs"
                v-on="on"
                >mdi-circle</v-icon
              >
              <v-icon
                v-else-if="getStatus(item) == 'critical'"
                class="ma-2"
                color="warning"
                v-bind="attrs"
                v-on="on"
                >mdi-circle</v-icon
              >
              <v-icon v-else class="ma-2" color="error" v-bind="attrs" v-on="on"
                >mdi-circle</v-icon
              >
            </template>
            {{ $t(getStatus(item)) }}
          </v-tooltip>
        </template>
        <template v-slot:[`item.value`]="{ item }">
          <span v-if="getStatus(item) == 'qualified'" style="font-weight:bold">
            {{ item.value }}
          </span>
          <span
            v-else-if="getStatus(item) == 'critical'"
            style="font-weight:bold"
          >
            {{ item.value }}
          </span>
          <span v-else style="color:red;font-weight:bold">
            {{ item.value }}
          </span>
        </template>
      </v-data-table>
      <div class="text-center pt-2">
        <v-pagination
          :total-visible="7"
          v-model="page"
          :length="pageCount"
        ></v-pagination>
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
import * as math from "mathjs";
export default {
  props: {
    measureData: {},
    lotOpData: {}
  },
  data() {
    return {
      dataPoints: null,
      chart: null,
      continueAdd: false,
      search: null,
      nameItems: [],
      typeItems: [],
      valid: true,
      addForm: {
        number: 1,
        seq: 1,
        name: null,
        type: null,
        measureValue: null,
        upperLimit: null,
        lowerLimit: null,
        standardValue: null,
        notice: null
      },
      addDialog: false,
      memsurement: [],
      searchResult: [],
      number: [],
      currentNumber: 1,
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      headers: [
        {
          text: this.$t("item"),
          align: "start",
          sortable: false,
          value: "sequence",
          width: "5%"
        },
        {
          text: this.$t("name"),
          align: "start",
          value: "name",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("type"),
          align: "start",
          value: "type",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("standardValue"),
          align: "start",
          value: "standardValue",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("upperTolerance"),
          align: "start",
          value: "upperTolerance",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("lowerTolerance"),
          align: "start",
          value: "lowerTolerance",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("measureValue"),
          align: "start",
          value: "value",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("status"),
          align: "center",
          value: "status",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("notice"),
          align: "start",
          value: "notice",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },
  methods: {
    onInputChange() {
      if (
        this.addForm.upperLimit != null &&
        this.addForm.upperLimit != "" &&
        this.addForm.lowerLimit != null &&
        this.addForm.lowerLimit != "" &&
        this.addForm.standardValue != null &&
        this.addForm.standardValue != ""
      ) {
        this.renderData();
        // this.$refs.measureValue.focus();
      } else {
        if (this.chart != null) {
          this.chart.options.data[0].dataPoints = [];
          this.chart.options.axisY = {};
          setTimeout(() => {
            this.chart.render();
          }, 200);
        }
      }
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
      let color = "#01B468";
      let chartMaximum = math.round(
        parseFloat(this.addForm.upperLimit) +
          parseFloat(this.addForm.standardValue),
        3
      );
      let chartMinimum = math.round(
        parseFloat(this.addForm.lowerLimit) +
          parseFloat(this.addForm.standardValue),
        3
      );
      let upperTolerance =
        parseFloat(this.addForm.upperLimit) +
        parseFloat(this.addForm.standardValue);
      let lowerTolerance =
        parseFloat(this.addForm.lowerLimit) +
        parseFloat(this.addForm.standardValue);
      if (
        parseFloat(this.addForm.measureValue) > upperTolerance &&
        parseFloat(this.addForm.measureValue) > chartMaximum
      ) {
        chartMaximum = parseFloat(this.addForm.measureValue);
        color = "red";
      }
      if (
        parseFloat(this.addForm.measureValue) < lowerTolerance &&
        parseFloat(this.addForm.measureValue) < chartMinimum
      ) {
        chartMinimum = parseFloat(this.addForm.measureValue);
        color = "red";
      }
      let dataPoints = [];
      if (this.addForm.measureValue != null) {
        dataPoints.push({
          label: 1,
          y: parseFloat(this.addForm.measureValue),
          x: 1,
          indexLabel: "" + this.addForm.measureValue
        });
      }

      this.chart = new CanvasJS.Chart("chart", {
        animationEnabled: true,

        axisX: { maximum: 2 },
        axisY: {
          maximum: chartMaximum + 1,
          minimum: chartMinimum - 1,
          gridDashType: "dash",
          stripLines: [
            {
              value: upperTolerance,
              label: upperTolerance.toString(),
              labelAlign: "left",
              color: "#FF0800",
              lineDashType: "dot",
              thickness: 3
            },
            {
              value: lowerTolerance,
              label: lowerTolerance.toString(),
              labelAlign: "left",
              color: "#FF0800",
              lineDashType: "dot",
              thickness: 3
            },
            {
              value: parseFloat(this.addForm.standardValue),
              label: this.addForm.standardValue.toString(),
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
            indexLabelPlacement: "outside",
            indexLabelOrientation: "horizontal",
            indexLabelFontSize: 16,
            indexLabelWrap: true,
            color: color,
            type: "scatter",
            markerSize: 10,
            name: this.$t("measurementData"),
            toolTipContent: "<strong>{name} {label} </strong>: {y} ",
            showInLegend: true,
            dataPoints: dataPoints
          }
        ]
      });
      setTimeout(() => {
        this.chart.render();
      }, 200);
      // console.log(chartMaximum);
      //   this.chart.render();
    },
    onNumberChange() {
      let count = this.measureData.filter(x => x.number == this.addForm.number)
        .length;
      this.addForm.seq = count + 1;
      // this.getMeasureStandard();
    },
    getMeasureStandard() {
      if (
        this.addForm.type != null &&
        this.addForm.type != "" &&
        this.addForm.name != null &&
        this.addForm.name != ""
      ) {
        let data = this.measureData.find(
          x => x.type == this.addForm.type && x.name == this.addForm.name
        );
        if (data != undefined) {
          this.addForm.standardValue = data.standardValue;
          this.addForm.upperLimit = data.upperTolerance;
          this.addForm.lowerLimit = data.lowerTolerance;
        } else {
          this.addForm.standardValue = null;
          this.addForm.upperLimit = null;
          this.addForm.lowerLimit = null;
          if (this.chart != null) {
            this.chart.options.data[0].dataPoints = [];
            this.chart.options.axisY = {};
            setTimeout(() => {
              this.chart.render();
            }, 200);
          }
        }

        if (
          this.addForm.upperLimit != null &&
          this.addForm.upperLimit != "" &&
          this.addForm.lowerLimit != null &&
          this.addForm.lowerLimit != "" &&
          this.addForm.standardValue != null &&
          this.addForm.standardValue != ""
        ) {
          this.renderData();
        }
      } else {
        this.addForm.standardValue = null;
        this.addForm.upperLimit = null;
        this.addForm.lowerLimit = null;
        if (this.chart != null) {
          this.chart.options.data[0].dataPoints = [];
          this.chart.options.axisY = {};
          setTimeout(() => {
            this.chart.render();
          }, 200);
        }
      }
    },
    addMeasureData() {
      const token = this.$store.state.authUser.token;
      if (
        this.addForm.type == null ||
        this.addForm.type == "" ||
        this.addForm.name == null ||
        this.addForm.name == "" ||
        this.addForm.upperLimit == null ||
        this.addForm.upperLimit == "" ||
        this.addForm.lowerLimit == null ||
        this.addForm.lowerLimit == "" ||
        this.addForm.standardValue == null ||
        this.addForm.standardValue == "" ||
        this.addForm.measureValue == null ||
        this.addForm.measureValue == ""
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      let measureData = {
        lotOpId: this.lotOpData.id,
        machineNo: this.lotOpData.lotWipData.resourceNo,
        number: this.addForm.number,
        sequence: this.addForm.seq,
        name: this.addForm.name,
        type: this.addForm.type,
        standardValue: this.addForm.standardValue,
        upperTolerance: this.addForm.upperLimit,
        lowerTolerance: this.addForm.lowerLimit,
        value: this.addForm.measureValue,
        time: moment(),
        referenceName: "Artificial",
        notice: this.addForm.notice
      };

      this.$axios
        .post(`/MeasureData/create`, measureData, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data);
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
          } else {
            this.$swal("", res.data.msg, "error");
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.$emit("update");
          //若不啟動連續新增,則新增完關閉視窗
        })
        .then(() => {
          if (this.continueAdd == false) {
            this.addDialog = false;
          } else {
            //啟動則不關閉,但清除表單資料
            this.onAddBtnClick();
          }
        });
    },
    onAddBtnClick() {
      this.addDialog = true;
      if (this.chart != null) {
        this.chart.options.data[0].dataPoints = [];
        this.chart.options.axisY = {};
        setTimeout(() => {
          this.chart.render();
        }, 200);
      }
      if (this.currentNumber != null) {
        this.addForm.number = this.currentNumber;
      } else {
        this.addForm.number = 1;
      }
      this.addForm.standardValue = null;
      this.addForm.notice = null;
      // this.addForm.number = 1;
      this.addForm.type = null;
      this.addForm.name = null;
      this.addForm.standardValue = null;
      this.addForm.measureValue = null;
      this.addForm.upperLimit = null;
      this.addForm.lowerLimit = null;
      let count = this.measureData.filter(x => x.number == this.addForm.number)
        .length;
      this.addForm.seq = count + 1;
      // 取得不重複的種類

      let typeItems = this.measureData.filter(
        (item, pos, self) => self.findIndex(v => v.type === item.type) === pos
      );
      typeItems.forEach(e => {
        this.typeItems.push(e.type);
      });
      let nameItems = this.measureData.filter(
        (item, pos, self) => self.findIndex(v => v.name === item.name) === pos
      );
      nameItems.forEach(e => {
        this.nameItems.push(e.name);
      });
      //  console.log(nameItems);
    },
    onSearch() {
      this.searchResult = this.memsurement;
      const currentNumber = this.currentNumber;
      if (this.searchResult.length > 0) {
        this.searchResult = this.searchResult.filter(item => {
          return item.number == currentNumber;
        });
      }
    },
    getStatus(data) {
      let status;
      if (
        data.value < data.standardValue + data.upperTolerance &&
        data.value > data.standardValue + data.lowerTolerance
      ) {
        status = "qualified";
      } else if (
        data.value == data.standardValue + data.upperTolerance ||
        data.value == data.standardValue + data.lowerTolerance
      ) {
        status = "critical";
      } else {
        status = "unqualified";
      }
      //  console.log(status);
      return status;
    }
  },
  watch: {
    measureData() {
      this.memsurement = this.measureData;
      this.number = [];
      for (let i = 0; i < this.memsurement.length; i++) {
        if (this.number.indexOf(this.memsurement[i].number) == -1) {
          this.number.push(this.memsurement[i].number);
        }
      }
      // sort by value
      this.number.sort(function(a, b) {
        return a - b;
      });
      console.log(this.number);
      this.currentNumber = this.number[0];
      let count = this.measureData.filter(x => x.number == this.addForm.number)
        .length;
      this.addForm.seq = count + 1;
      let typeItems = this.measureData.filter(
        (item, pos, self) => self.findIndex(v => v.type === item.type) === pos
      );
      typeItems.forEach(e => {
        this.typeItems.push(e.type);
      });
      let nameItems = this.measureData.filter(
        (item, pos, self) => self.findIndex(v => v.name === item.name) === pos
      );
      nameItems.forEach(e => {
        this.nameItems.push(e.name);
      });
      this.onSearch();
      // console.log(this.measureData);
    }
  },
  mounted() {},
  created() {
    this.memsurement = this.measureData;
    this.number = [];
    for (let i = 0; i < this.memsurement.length; i++) {
      if (this.number.indexOf(this.memsurement[i].number) == -1) {
        this.number.push(this.memsurement[i].number);
      }
    }
    // sort by value
    // this.number.sort(function(a, b) {
    //   return a - b;
    // });
    // console.log(this.number);
    this.currentNumber = this.number[0];
    this.onSearch();
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 5px;
  position: relative;
  max-height: 100%;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
