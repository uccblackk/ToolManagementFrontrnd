<template>
  <v-app
    id="main"
    :style="{ background: $vuetify.theme.themes[theme].background }"
  >
    <v-container id="dashboard" fluid tag="section">
      <v-row>
        <v-col class="mt-3" cols="12" md="4" lg="3">
          <UtilizationPieChart :data="machineList" />
        </v-col>
        <v-col cols="12" md="8" lg="9">
          <v-row>
            <v-col cols="12" md="6" lg="5">
              <OEEChart />
            </v-col>

            <v-col cols="12" md="6" lg="7">
              <OEETrend />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row style="margin-top:-35px">
        <v-col class="mt-3" cols="12" md="4" lg="3">
          <LotProgress height="100vh" :data="machineList" />
        </v-col>

        <v-col cols="12" md="8" lg="9">
          <v-row>
            <v-col cols="12" md="6" lg="5">
              <ProduceCount />
            </v-col>
            <v-col cols="12" md="6" lg="7">
              <UtilizationTrend />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <MachineStatus :data="machineList" />
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
  middleware: "auth",

  data() {
    return {
      machineList: []
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
      store.state.authUser.authority.find(
        x => x.menu_no == "productionDashboard"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let machineResponse = await app.$axios.$get(`/Machine/Search?name=`, {
      headers: {
        Authorization: token
      }
    });
    //console.log(machineResponse.data);
    return {
      machineList: machineResponse.data
    };
  },
  methods: {},
  mounted() {},
  head() {
    return {
      title: this.$t("productionDashboard")
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
</style>
