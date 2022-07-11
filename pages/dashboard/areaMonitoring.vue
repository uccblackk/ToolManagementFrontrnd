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

      <v-row v-if="selectedArea != ''" style="margin-top:-35px">
        <v-col class="mt-3" cols="12" md="4" lg="3">
          <UtilizationPieChart :data="machineData" />
        </v-col>
        <v-col cols="12" md="8" lg="9">
          <v-row>
            <v-col cols="12" md="6" lg="5">
              <OEEChart :areaNo="selectedArea" />
            </v-col>

            <v-col cols="12" md="6" lg="7">
              <OEETrend :areaNo="selectedArea" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="selectedArea != ''" style="margin-top:-35px">
        <v-col class="mt-3" cols="12" md="4" lg="3">
          <LotProgress :data="machineData" :areaNo="selectedArea" />
        </v-col>

        <v-col cols="12" md="8" lg="9">
          <v-row>
            <v-col cols="12" md="6" lg="5">
              <ProduceCount :areaNo="selectedArea" />
            </v-col>
            <v-col cols="12" md="6" lg="7">
              <UtilizationTrend :areaNo="selectedArea" />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <MachineStatus :data="machineData" />
            </v-col>
          </v-row>
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
import UtilizationPieChart from "~/components/dashboard/UtilizationPieChart.vue";
import LotProgress from "~/components/dashboard/LotProgress.vue";
import OEEChart from "~/components/dashboard/OEEChart.vue";
import OEETrend from "~/components/dashboard/OEETrend.vue";
import ProduceCount from "~/components/dashboard/ProduceCount.vue";
import UtilizationTrend from "~/components/dashboard/UtilizationTrend.vue";
import MachineStatus from "~/components/dashboard/MachineStatus.vue";
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
  lineModel: 0,
  middleware: "auth",

  data() {
    return {
      areaData: [],
      selectedArea: "",
      machineData: []
      // UtilizationPieCardHeight: 500
    };
  },
  components: {
    UtilizationPieChart,
    LotProgress,
    OEEChart,
    OEETrend,
    ProduceCount,
    UtilizationTrend,
    MachineStatus
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    }
  },
  async asyncData({ app, params, store, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "areaMonitoring") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      areaData: response.data
    };
  },
  methods: {
    onSelectedChange() {
      this.GetMachineList();
      //  console.log(this.selectedArea);
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
  mounted() {},
  head() {
    return {
      title: this.$t("areaMonitoring")
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
