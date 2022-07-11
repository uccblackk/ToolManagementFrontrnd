<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-row class="mx-2">
        <v-col cols="12" md="3">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                @click:clear="onClearClicked()"
                v-model="dateRangeText"
                :label="$t('select') + $t('date') + $t('range')"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              :events="arrayEvents"
              ref="picker"
              v-model="dates"
              :min="min"
              range
            >
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="onCalendarSelected()">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="opData"
            :items="opList"
            item-text="opName"
            item-value="opNo"
            :label="this.$t('process')"
            return-object
            multiple
            clearable
          >
            <template v-slot:prepend-item>
              <v-list-item ripple @mousedown.prevent @click="toggle">
                <v-list-item-action>
                  <v-icon :color="opData.length > 0 ? 'indigo darken-4' : ''">
                    {{ icon }}
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    Select All
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="mt-2"></v-divider>
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip small v-if="index <= 2">
                <span>{{ item.opName }}</span>
              </v-chip>
              <span v-if="index === 3" class="grey--text caption">
                (+{{ opList.length - 3 }} others)
              </span>
            </template>
          </v-select>
        </v-col>

        <v-col style="text-align:right" cols="12" sm="12" md="1">
          <v-btn
            class="primary mt-3"
            @click="onSearch()"
            @keyup.enter="onSearch()"
          >
            <v-icon>mdi-magnify</v-icon>
            {{ $t("search") }}
          </v-btn>
          <!-- <v-text-field
              clearable
              v-model="lotWipSearchValue"
              :label="this.$t('search')"
              append-icon="mdi-magnify"
              required
              @click:append="onSearch()"
              @keyup.enter="onSearch()"
            ></v-text-field> -->
        </v-col>

        <v-col
          cols="12"
          sm="12"
          md="2"
          style="text-align:right"
          class="ml-auto "
        >
          <v-btn color="primary" dark class="mt-3" @click="createSheet()">
            <excel-export
              filename="report"
              :sheet="sheet"
              :manual="true"
              ref="excelExport"
            >
              {{ $t("export") + "Excel" }}
            </excel-export>
          </v-btn>
        </v-col>
      </v-row>
    </v-flex>

    <v-flex style="text-align:center">
      <OrderManagementReportTable :data="data" :opData="opDataList" />
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
// import { ExcelExport } from "pikaz-excel-js";
import OrderManagementReportTable from "~/components/order/OrderManagementReportTable.vue";
export default {
  middleware: "auth",
  data() {
    return {
      sheet: [],
      data: [],
      opList: [],
      opData: [],
      opDataList: [],
      ret: false,
      maintenanceData: [],
      areaList: [],
      areaData: {},
      arrayEvents: [],
      dateRangeText: null,
      machineData: [],
      machineList: [],
      resourceList: {},
      currentPage: 1,
      perPage: 1,
      isLoading: 0,
      lotWipData: {},
      statusCheckedList: [],
      statusLabel: [
        { name: this.$t("already") + this.$t("schedule"), value: "N" },
        { name: this.$t("maintenance") + this.$t("ing"), value: "P" },

        { name: this.$t("complete"), value: "Y" }
      ],
      valid: true,
      noRules: [v => !!v || this.$t("mustInput")],
      itemList: [],
      dates: [],
      startDate: null,
      endDate: null,
      min: null,
      menu: false,
      menu2: false,
      lotWipSearchValue: "",
      isLoading: 0,
      formHasErrors: false,
      errorMessages: "",
      SearchValue: "",
      lotWipList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      defaultSelected: {
        state: "是",
        value: "Y"
      },

      addOpForm: {
        no: null,
        name: null,
        desc: null,
        dispatchOptions: [
          { state: "是", value: "Y" },
          { state: "否", value: "N" }
        ]
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  components: { OrderManagementReportTable },

  computed: {
    form() {
      return {
        opNo: this.opNo,
        opName: this.opName
      };
    }
  },
  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(
        x => x.menu_no == "orderManagementReport"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }

    let response = await app.$axios.$get(`/Op/Search?value=`, {
      headers: {
        Authorization: token
      }
    });

    let opList = response.data;

    return {
      opList: opList
    };
  },
  methods: {
    createSheet() {
      console.log(this.data);
      // return;
      let header1 = [
        this.$t("orderCreateTime"),
        this.$t("orderCount"),
        this.$t("undoneCount"),
        this.$t("undoneProcessType")
      ];

      if (this.data.length > 0) {
        for (
          let i = 0;
          i < Object.keys(this.data[0].doneData).length - 1;
          i++
        ) {
          header1.push("");
        }
        header1.push(this.$t("completed") + this.$t("count"));
        for (
          let i = 0;
          i < Object.keys(this.data[0].doneData).length - 1;
          i++
        ) {
          header1.push("");
        }
        header1.push(this.$t("totalCompleteProgress"));

        let header2 = ["", "", ""];

        for (let i = 0; i < Object.keys(this.data[0].doneData).length; i++) {
          header2.push(
            this.opList.find(
              x => x.opNo == Object.keys(this.data[0].doneData)[i]
            ).opName
          );
        }

        for (let i = 0; i < Object.keys(this.data[0].doneData).length; i++) {
          header2.push(
            this.opList.find(
              x => x.opNo == Object.keys(this.data[0].doneData)[i]
            ).opName
          );
        }
        header2.push("");

        let keys = ["createDate", "totalLotOpCount", "undoneCount"];

        for (let i = 0; i < Object.keys(this.data[0].doneData).length; i++) {
          keys.push("undone_" + Object.keys(this.data[0].doneData)[i]);
          keys.push("done_" + Object.keys(this.data[0].doneData)[i]);
        }
        keys.push("progress");

        let table = [];

        this.data.forEach(e => {
          let item = {};
          item = {
            createDate: e.createDate,
            totalLotOpCount: e.totalLotOpCount,
            undoneCount: e.unDoneCount,
            progress: e.progress
          };
          for (let i = 0; i < Object.keys(this.data[0].doneData).length; i++) {
            var keyValue = "undone_" + Object.keys(this.data[0].doneData)[i];

            item[keyValue] =
              e.unDoneData[Object.keys(this.data[0].doneData)[i]];

            keyValue = "done_" + Object.keys(this.data[0].doneData)[i];
            item[keyValue] = e.doneData[Object.keys(this.data[0].doneData)[i]];
          }

          table.push(item);
        });

        console.log(header1);
        console.log(header2);
        console.log(keys);
        console.log(table);

        this.sheet = [
          {
            title: "report",
            merges: ["D2:F2", "G2:I2"],
            multiHeader: [header1, header2],
            table: table,
            keys: keys,
            sheetName: "report",
            cellStyle: [
              // {
              //   cell: "A1",
              //   font: {
              //     sz: 14,
              //     color: { rgb: "ffffff" },
              //     bold: true
              //   },
              //   fill: {
              //     fgColor: { rgb: "ff7e00" }
              //   }
              // }
            ]
          }
        ];
        this.$refs.excelExport.pikaExportExcel();
      }
    },
    getTotalMoData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Mo/SearchMoCount`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let lotWipData = [];

          this.arrayEvents = [];
          if (res.data.data != undefined) {
            //console.log(res.data.data);
            this.arrayEvents = res.data.data;
          }
        })
        .then(() => {});
    },
    updateRet() {
      this.ret = false;
    },
    showAddDialog() {
      this.ret = true;
    },
    toggle() {
      this.$nextTick(() => {
        if (this.likesAllItems) {
          this.opData = [];
        } else {
          this.opData = this.opList.slice();
        }
      });
    },
    itemsForList() {
      return this.lotWipData.slice(
        (this.currentPage - 1) * this.perPage,
        this.currentPage * this.perPage
      );
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case this.$t("new"):
          color = "grey";
          break;
        case this.$t("already") + this.$t("dispatch"):
          color = "orange darken-1";
          break;
        case this.$t("pause"):
          color = "red darken-1";
          break;
        case this.$t("producted"):
          color = "green accent-4";
          break;
        case this.$t("complete"):
          color = "light-blue accent-4";
          break;
        case this.$t("projectClose"):
          color = "blue-grey darken-3";
          break;
      }
      return color;
    },
    onClearClicked() {
      this.startDate = null;
      this.endDate = null;
      this.dates = [];
    },
    onCalendarSelected() {
      if (this.dates.length > 1) {
        if (this.dates[0] <= this.dates[1]) {
          this.startDate = this.dates[0];
          this.endDate = this.dates[1];
        } else {
          this.startDate = this.dates[1];
          this.endDate = this.dates[0];
        }
        this.dateRangeText = this.startDate + " ~ " + this.endDate;
      }
      this.min = null;
      this.menu = false;
    },
    onSearch() {
      //  console.log(this.statusCheckedList);
      this.opDataList = this.opData;
      this.isLoading = 1;
      let opNoList = "";
      this.opData.forEach(op => {
        opNoList += op.opNo + ",";
      });
      if (opNoList != null) {
        opNoList = opNoList.slice(0, -1);
      }
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(
          `/LotOp/SearchLotOpReport?opData=${opNoList}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.data = res.data.data;
            // console.log(this.data);
          } else {
            this.$swal("", res.data.msg, "error");
          }

          this.isLoading = 0;
        });
    },

    refreshMachineData() {
      if (this.lotWipList.length > 0) {
        var uniq = {};
        var arrFiltered = this.lotWipList.filter(
          obj => !uniq[obj.resourceName] && (uniq[obj.resourceName] = true)
        );
        //console.log(this.arrFiltered);
        this.machineList = arrFiltered;
        // console.log(data);
      } else {
        this.machineList = [];
      }
    }
  },
  mounted() {
    this.refreshMachineData();

    this.dates.push(
      moment()
        .startOf("month")
        .format("YYYY-MM-DD")
    );
    this.dates.push(
      moment()
        .endOf("month")
        .format("YYYY-MM-DD")
    );

    if (this.dates.length > 1) {
      if (this.dates[0] <= this.dates[1]) {
        this.startDate = this.dates[0];
        this.endDate = this.dates[1];
      } else {
        this.startDate = this.dates[1];
        this.endDate = this.dates[0];
      }
      this.dateRangeText = this.startDate + " ~ " + this.endDate;
    }
    this.min = null;
    this.menu = false;
    this.areaData = this.areaList[0];
    this.getTotalMoData();
  },
  watch: {},
  computed: {
    likesAllItems() {
      return this.opData.length === this.opList.length;
    },
    likesSomeItems() {
      return this.opData.length > 0 && !this.likesAllItems;
    },
    icon() {
      if (this.likesAllItems) return "mdi-close-box";
      if (this.likesSomeItems) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    }
  },
  created() {
    //this.refreshMachineData();
  },
  head() {
    return {
      title: this.$t("orderManagementReport")
    };
  },
  submit() {}
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
