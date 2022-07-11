<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-2">
      <div class="text-center">
        <h2>{{ procedureData.name }}</h2>
      </div>
    </v-flex>
    <v-flex xs12 sm lg xl md5 class="pa-2">
      <v-chip outlined small color="info" class="ma-1">{{
        $t("procedureInfo")
      }}</v-chip>
      <v-divider></v-divider>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("procedure") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ procedureData.name }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("status") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ $t(procedureData.status) }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("operator") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ procedureData.user.name }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("count") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ procedureData.count }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("startTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ procedureData.startTime }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("finishTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ procedureData.finishTime }}</span>
        </v-col>
      </v-row>
    </v-flex>
    <v-flex md12 class="pa-2">
      <v-divider />
    </v-flex>
    <v-flex md12 class="pa-2">
      <!-- tabs -->
      <v-card color="basil" class="mt-0">
        <v-tabs
          v-model="tab"
          background-color="blue-grey lighten-1"
          dark
          fixed-tabs
          slider-color="light-blue lighten-4"
        >
          <v-tab v-for="(item, idx) in items" :key="idx">
            <v-icon>{{ item.icon }}</v-icon>
            {{ item.tab }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-layout
              align-center
              justify-center
              column
              fill-height
              class="pa-1"
            >
              <MeasurementDataTable :memsurementData="memsurementData" />
            </v-layout>
          </v-tab-item>
          <v-tab-item>
            <v-layout
              align-center
              justify-center
              column
              fill-height
              class="pa-1"
            >
              <MeasurementDistributionChart
                :memsurementData="memsurementData"
              />
            </v-layout>
          </v-tab-item>
          <v-tab-item>
            <v-layout
              align-center
              justify-center
              column
              fill-height
              class="pa-1"
            >
              <NormalDistributionChart :memsurementData="memsurementData" />
            </v-layout>
          </v-tab-item>
          <v-tab-item>
            <v-layout
              align-center
              justify-center
              column
              fill-height
              class="pa-1"
            >
              <ProcessCapabilityChart :memsurementData="memsurementData" />
            </v-layout>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import MeasurementDataTable from "~/components/procedure/MeasurementDataTable.vue";
import MeasurementDistributionChart from "~/components/procedure/MeasurementDistributionChart.vue";
import ProcessCapabilityChart from "~/components/procedure/ProcessCapabilityChart.vue";
import NormalDistributionChart from "~/components/procedure/NormalDistributionChart.vue";
import moment from "moment";
export default {
  middleware: "auth",
  data() {
    return {
      procedureData: {},
      memsurementData: {},
      tab: null,
      items: [
        { tab: this.$t("measurementData"), icon: "mdi-washing-machine" },
        {
          tab: this.$t("measurementDistribution"),
          icon: "mdi-fit-to-page-outline"
        },
        {
          tab: this.$t("normalDistribution"),
          icon: "mdi-clipboard-text-outline"
        },
        { tab: this.$t("processCapability"), icon: "mdi-access-point" }
      ]
    };
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    const id = params.id;
    let response = await app.$axios.$get(`/Procedure/${id}`, {
      headers: {
        Authorization: token
      }
    });
    const procedureData = response.data;
    response = await app.$axios.$get(`/Measurement/Search?procedureId=${id}`, {
      headers: {
        Authorization: token
      }
    });
    const memsurementData = response.data;
    return {
      id: params.id,
      procedureData: procedureData,
      memsurementData: memsurementData
    };
  },
  methods: {
    searchMemsurementData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Measurement/Search?procedureId=${this.procedureId}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.data == null || res.data.data == undefined) {
            this.memsurementData = [];
          }
          this.memsurementData = res.data.data;
        });
    }
  },
  head() {
    return {
      title: ""
    };
  },
  mounted() {},
  computed: {}
};
</script>
