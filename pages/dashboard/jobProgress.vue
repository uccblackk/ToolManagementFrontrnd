<template>
  <v-app
    id="main"
    :style="{ background: $vuetify.theme.themes[theme].background }"
  >
    <v-container id="dashboard" fluid tag="section">
      <v-card width="100%">
        <!-- <v-flex xs12 class="text-left">
          <v-chip
            label
            :color="getStatusColor(item.name)"
            v-for="(item, idx) in statusLabel"
            :key="idx"
            class="mx-5 px-5 mt-3"
            width="100"
            outlined
          >
            <v-icon x-small>mdi-circle</v-icon
            ><strong> {{ item.name }}</strong></v-chip
          >
        </v-flex> -->

        <v-flex xs12 class="pa-2">
          <!-- <v-divider></v-divider> -->
          <JobProgressTable
            :lotWipData="lotWipData"
            :lotWipSearchValue="lotWipSearchValue"
            :startDate="startDate"
            :endDate="endDate"
            :status="statusCheckedList"
            :isLoading="isLoading"
            @update="onSearch"
          />
        </v-flex>

        <v-overlay :value="overlay">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-card>
    </v-container>
  </v-app>
</template>
<script>
import moment from "moment";
import JobProgressTable from "~/components/dashboard/JobProgressTable.vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";
const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        background: colors.grey.lighten4
      }
    }
  }
});
export default {
  name: "App",
  middleware: "auth",

  data() {
    return {
      machineData: [],
      machineList: [],
      resourceList: {},
      currentPage: 1,
      perPage: 1,
      isLoading: 0,
      lotWipData: {},
      statusCheckedList: ["dispatch", "producted"],
      statusLabel: [
        { name: this.$t("already") + this.$t("dispatch"), value: "dispatch" },
        { name: this.$t("producted"), value: "producted" },
        { name: this.$t("pause"), value: "pause" },
        { name: this.$t("complete"), value: "complete" },
        { name: this.$t("projectClose"), value: "close" }
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
      overlay: true,
      menu3: false,
      formHasErrors: false,
      errorMessages: "",
      lotWipSearchValue: "",
      moData: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addMoForm: {
        moNo: null,
        itemNo: null,
        startDate: new Date().toISOString().substr(0, 10),
        endDate: null,
        count: null,
        urgent: null,
        remark: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      exceptionReasonList: [],
      exceptionActionList: [],
      dateRangeText: null
    };
  },
  components: {
    JobProgressTable
  },
  computed: {
    form() {
      return {
        areaNo: this.areaNo,
        areaName: this.areaName
      };
    },
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    }
    // dateRangeText: function() {
    //   if (this.dates.length > 1) {
    //     this.min = this.dates[0];
    //     return this.dates.join(" ~ ");
    //   }
    // }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "jobProgress") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Item/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substr(0, 10);
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substr(0, 10);

    let lotWipResponse = await app.$axios.$get(
      `/LotOp/Search?status=producted`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    return {
      itemList: response.data,
      lotWipData: lotWipResponse.data,
      isLoading: 0,
      overlay: false
    };
  },
  methods: {
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
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(`/LotOp/Search?status=producted`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let array = [];
          array = res.data.data != null ? res.data.data : [];
          let data = [];

          // console.log(array);
          this.lotWipData = array;
          this.isLoading = 0;
        });
    },

    refreshMachineData() {
      if (this.lotWipData.length > 0) {
        let array = [];
        let data = [];
        for (let i = 0; i < this.lotWipData.length; i++) {
          array.push(this.lotWipData[i].lotWipData);
        }
        var uniq = {};
        var arrFiltered = array.filter(
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
  head() {
    return {
      title: this.$t("jobProgress")
    };
  },
  mounted() {},

  created() {},
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
