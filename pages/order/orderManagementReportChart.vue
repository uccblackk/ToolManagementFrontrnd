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
        <v-col cols="12" md="3">
          <v-select
            v-model="opData"
            :items="opList"
            item-text="opName"
            item-value="opNo"
            :label="this.$t('process')"
            return-object
          >
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
        </v-col>

        <v-col
          cols="12"
          sm="12"
          md="2"
          style="text-align:right"
          class="ml-auto "
        >
          <v-btn color="primary" dark class="mt-3" disabled>
            <v-icon left>
              mdi-tray-arrow-down
            </v-icon>
            {{ $t("export") + "EXCEL" }}
          </v-btn>
        </v-col>
      </v-row>
    </v-flex>

    <v-flex style="text-align:center">
      <v-card>
        <v-tabs v-model="tab">
          <v-tab @click="forceRerender('accumulationOrder')">{{
            $t("accumulationOrder")
          }}</v-tab>
          <v-tab @click="forceRerender('everydayOrder')">{{
            $t("everydayOrder")
          }}</v-tab>
          <v-tab @click="forceRerender('completedOrderPercent')">{{
            $t("completedOrderPercent")
          }}</v-tab>
          <v-tab @click="forceRerender('everydayNG')">{{
            $t("everydayNG")
          }}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" class="pa-2">
          <v-tab-item>
            <AccumulationOrderChart
              :data="data"
              :opData="opData"
              :key="accumulationOrder"
            />
          </v-tab-item>
          <v-tab-item>
            <EverydayOrderChart
              :data="data"
              :opData="opData"
              :key="everydayOrder"
            />
          </v-tab-item>
          <v-tab-item>
            <CompletedOrderPercentChart
              :data="data"
              :opData="opData"
              :key="completedOrderPercent"
            />
          </v-tab-item>
          <v-tab-item>
            <EverydayNGChart :data="data" :opData="opData" :key="everydayNG" />
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
import AccumulationOrderChart from "~/components/order/chart/AccumulationOrderChart.vue";
import EverydayOrderChart from "~/components/order/chart/EverydayOrderChart.vue";
import EverydayNGChart from "~/components/order/chart/EverydayNGChart.vue";
import CompletedOrderPercentChart from "~/components/order/chart/CompletedOrderPercentChart.vue";
export default {
  components: {
    AccumulationOrderChart,
    EverydayOrderChart,
    EverydayNGChart,
    CompletedOrderPercentChart
  },
  middleware: "auth",
  data() {
    return {
      opName: "",
      accumulationOrder: 0,
      everydayOrder: 0,
      everydayNG: 0,
      completedOrderPercent: 0,
      tab: null,
      data: [],
      opList: [],
      opData: {},
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
        x => x.menu_no == "orderManagementReportChart"
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
    forceRerender(tabName) {
      // this.chartKey += 1;
      //  console.log(tabName);
      if (tabName == "accumulationOrder") {
        this.accumulationOrder += 1;
      } else if (tabName == "everydayOrder") {
        this.everydayOrder += 1;
      } else if (tabName == "completedOrderPercent") {
        this.completedOrderPercent += 1;
      } else if (tabName == "everydayNG") {
        this.everydayNG += 1;
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
      // console.log(this.opData.opNo);
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(
          `/LotOp/SearchLotOpReport?opData=${this.opData.opNo}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.data = res.data.data;
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
    // this.refreshMachineData();

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
    if (this.opList.length > 0) {
      this.opData = this.opList[0];
      this.onSearch();
    }
    this.min = null;
    this.menu = false;
    this.areaData = this.areaList[0];
    this.getTotalMoData();
  },
  watch: {
    opData() {
      this.opName = this.opData.opName;
    }
  },
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
      title: this.$t("orderManagementReportChart")
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
