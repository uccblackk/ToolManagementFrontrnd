<template>
  <v-app
    id="main"
    :style="{ background: $vuetify.theme.themes[theme].background }"
  >
    <v-container id="dashboard" fluid tag="section">
      <v-row no-gutters>
        <v-col style="text-align:center" cols="12"
          ><v-select
            style="font-weight:bold;font-size:20px"
            background-color="#ffffff"
            :items="areaData"
            v-model="selectedArea"
            item-text="areaName"
            item-value="areaNo"
            :label="$t('select') + $t('area')"
            @change="onSelectedChange()"
            outlined
          ></v-select
        ></v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12">
          <AlarmCountRanking
            v-if="selectedArea != ''"
            :data="data"
            :dates="dates"
            :isLoading="isLoading"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12">
          <AlarmTimeRanking
            v-if="selectedArea != ''"
            :data="machineStatusData"
            :dates="dates"
            :isLoading="isLoading"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- <v-container fluid>
    <v-layout row wrap class="mx-2">
      <v-flex xs12 md4>
        {{ $t("utilityDistribution") }}
        <v-divider></v-divider>

        <UtilizationPieChart />
      </v-flex>
    </v-layout>
    <v-layout row wrap class="mx-2">
      <v-flex xs12 md3> </v-flex>
    </v-layout>
  </v-container> -->
  </v-app>
</template>

<script>
import AlarmCountRanking from "~/components/dashboard/AlarmCountRanking.vue";
import AlarmTimeRanking from "~/components/dashboard/AlarmTimeRanking.vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";
import moment from "moment";

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
  lineModel: 0,
  middleware: "auth",

  data() {
    return {
      areaData: [],
      selectedArea: "",
      machineData: [],
      dates: [],
      data: [],
      isLoading: 0,
      machineStatusData: [],
      firstUpdate: true,
      intervalID: null,
      timerId: null
      // UtilizationPieCardHeight: 500
    };
  },
  components: {
    AlarmCountRanking,
    AlarmTimeRanking
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    }
  },
  async asyncData({ app, params, store, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(
        x => x.menu_no == "alarmMonitoring"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    const dates = [
      moment().format("YYYY-MM-DD"),
      moment().format("YYYY-MM-DD")
    ];
    let response = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });
    let areaData = response.data;
    areaData.unshift({
      areaName: "所有區域",
      areaNo: null
    });

    return {
      areaData: areaData,
      dates: dates
    };
  },
  methods: {
    onSelectedChange() {
      clearTimeout(this.timerId);
      if (this.firstUpdate) {
        // console.log(this.firstUpdate);
        // this.intervalID = setInterval(this.GetUtilizationData, 30000);
        this.firstUpdate = false;
      }
      this.GetUtilizationData();
      //  console.log(this.selectedArea);
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async GetUtilizationData() {
      await this.sleep(1);
      const token = this.$store.state.authUser.token;
      this.isLoading = 1;
      this.$axios
        .$get(
          `/MachineStatus/GetAllMachineStatus?startTime=${this.dates[0]}&endTime=${this.dates[1]}&areaNo=${this.selectedArea}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.machineStatusData = res.data;
          let totalStatusData = [];
          if (this.machineStatusData != undefined) {
            this.machineStatusData.forEach(machine => {
              machine.machineStatus.forEach(statusData => {
                totalStatusData.push(statusData);
              });
            });
            this.data = totalStatusData;
            this.isLoading = 0;
          } else {
            this.data = [];
            this.isLoading = 0;
          }
          this.timerId = setTimeout(this.GetUtilizationData, 30000);
          //  console.log(totalStatusData);
        })
        .catch(({ response }) => {
          this.isLoading = 0;
          this.timerId = setTimeout(this.GetUtilizationData, 30000);
        });
    },
    GetMachineList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .$get(`/Machine/Search?areaNo=${this.selectedArea}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machineData = res.data;
        });
    }
  },
  beforeDestroy() {
    // clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    //console.log(this.intervalID);
  },
  deactivated() {
    clearTimeout(this.timerId);
  },
  activated() {
    clearTimeout(this.timerId);
    if (this.selectedArea != "") {
      this.GetUtilizationData();
    }
  },
  mounted() {
    clearTimeout(this.timerId);
    if (this.selectedArea != "") {
      this.GetUtilizationData();
    }
  },
  head() {
    return {
      title: this.$t("alarmMonitoring")
    };
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 10px;
  position: relative;
  max-height: 100%;
}
th {
  border-bottom: 1px solid rgb(179, 179, 179);
  font-family: 微軟正黑體;
  color: rgb(65, 65, 65);
  font-size: 24px;
}
@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
.v-select__selection,
.v-select__selection--comma,
.v-select.v-text-field input {
  font-weight: bold;
  font-size: large;
}
</style>
