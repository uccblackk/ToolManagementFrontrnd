<template>
  <v-layout row wrap>
    <v-flex xs12 sm lg xl md12>
      <v-breadcrumbs :items="buttonItems">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :href="item.href" :disabled="item.disabled">
            {{ item.text.toUpperCase() }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>
    </v-flex>
    <v-flex md12 class="pa-2">
      <div class="text-center">
        <h1>
          <span style="font-weight:bold">
            {{ lotOpData.lot.lotNo }}
          </span>
          <v-chip dark :color="getStatusColor(lotOpData.status)" class="mb-2">
            <span v-if="lotOpData.status === 'dispatch'">
              {{ $t("already") + $t(lotOpData.status) }}
            </span>
            <span v-else-if="lotOpData.status === 'close'">
              {{ $t("projectClose") }}
              \</span
            >
            <span v-else>
              {{ $t(lotOpData.status) }}
            </span>
          </v-chip>
        </h1>
      </div>
    </v-flex>
    <v-flex md12 class="pa-2">
      <!-- <v-chip outlined small color="info" class="ma-1">{{
        $t("procedureInfo")
      }}</v-chip> -->
      <v-divider></v-divider>
      <v-row no-gutters class="ma-3">
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("jobNo") + $t("No") }}：</span
          >
        </v-col>
        <v-col md="3" class="text-left">
          <span style="color: gray">{{ lotOpData.moData.moNo }}</span>
        </v-col>
        <v-col md="1" 　 style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("product") + $t("No") }}：</span
          >
        </v-col>
        <v-col md="3">
          <span style="color: gray">{{ lotOpData.moData.itemNo }}</span>
        </v-col>
        <v-col md="1" 　 style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("product") + $t("name") }}：</span
          >
        </v-col>
        <v-col md="3">
          <span style="color: gray">{{ lotOpData.moData.itemName }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("dispatch") + $t("equipment") + $t("type") }}：</span
          >
        </v-col>
        <v-col md="3" class="text-left">
          <span
            style="color: gray"
            v-if="lotOpData.lotWipData.resourceType == 'E'"
          >
            {{ $t("equipment") }}
          </span>
          <span
            style="color: gray"
            v-if="lotOpData.lotWipData.resourceType == 'L'"
          >
            {{ $t("line") }}
          </span>
          <!-- <span style="color: gray">{{
            lotOpData.lotWipData.resourceType
          }}</span> -->
        </v-col>
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("dispatch") + $t("equipment") + $t("No") }}：</span
          >
        </v-col>
        <v-col md="3">
          <span style="color: gray">{{ lotOpData.lotWipData.resourceNo }}</span>
        </v-col>
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("dispatch") + $t("equipment") + $t("name") }}：</span
          >
        </v-col>
        <v-col md="3">
          <span style="color: gray">{{
            lotOpData.lotWipData.resourceName
          }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold">{{ $t("status") }}：</span>
        </v-col>
        <v-col md="3">
          <span style="color: gray">{{ $t(lotOpData.status) }}</span>
        </v-col>
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("process") + $t("No") }}：</span
          >
        </v-col>
        <v-col md="3" class="text-left">
          <span style="color: gray">{{ lotOpData.opNo }}</span>
        </v-col>
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("process") + $t("name") }}：</span
          >
        </v-col>
        <v-col md="3">
          <span style="color:#1565C0;font-weight:bold">{{
            lotOpData.opName
          }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("expected") + $t("count") }}：</span
          >
        </v-col>
        <v-col md="3">
          <span style="color: gray">{{ lotOpData.qty }}</span>
        </v-col>
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("already") + $t("completed") + $t("count") }}：</span
          >
        </v-col>
        <v-col md="3" class="text-left">
          <span style="color: gray">{{
            lotOpData.completedQty + "/" + lotOpData.qty
          }}</span>
        </v-col>
        <v-col md="1" style="text-align:right">
          <span style="color: gray;font-weight:bold"
            >{{ $t("NG") + $t("count") }}：</span
          >
        </v-col>
        <v-col md="3" class="text-left">
          <span v-if="lotWipData.ngQty != '0'" style="color: red">{{
            lotWipData.ngQty
          }}</span>
          <span v-else style="color: gray">{{ lotWipData.ngQty }}</span>
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
          background-color="white"
          fixed-tabs
          slider-color="primary"
        >
          <v-tab
            style="color:black"
            @click="forceRerender(item.tab)"
            v-for="(item, idx) in items"
            :key="idx"
          >
            <v-icon>{{ item.icon }}</v-icon>
            {{ item.tab }}
          </v-tab>
        </v-tabs>
        <v-divider />
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-layout
              align-center
              justify-center
              column
              fill-height
              class="pa-1"
            >
              <ReportLogTimeline
                :lotWipLogData="lotWipLogData"
                :lotOpData="lotOpData"
                :actionData="actionData"
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
              <MeasureDataTable
                :lotOpData="lotOpData"
                :measureData="measureData"
                @update="searchMeasureData"
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
              <MeasurementDistributionChart
                :measureData="measureData"
                :key="measurementDistributionChart"
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
              <NormalDistributionChart
                :measureData="measureData"
                :key="normalDistributionChart"
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
              <ProcessCapabilityChart
                :measureData="measureData"
                :key="processCapabilityChart"
              />
            </v-layout>
          </v-tab-item>
          <v-tab-item>
            <v-layout class="pa-1">
              <ApiTaskTable
                :apiTaskData="apiTaskData"
                @update="updateApiTask()"
              />
            </v-layout>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import ReportLogTimeline from "~/components/order/ReportLogTimeline.vue";
import MeasureDataTable from "~/components/order/MeasureDataTable.vue";
import MeasurementDistributionChart from "~/components/order/MeasurementDistributionChart.vue";
import ProcessCapabilityChart from "~/components/order/ProcessCapabilityChart.vue";
import NormalDistributionChart from "~/components/order/NormalDistributionChart.vue";
import ApiTaskTable from "~/components/order/ApiTaskTable.vue";
import moment from "moment";
export default {
  middleware: "auth",
  data() {
    return {
      apiTaskData: [],
      measurementDistributionChart: 0,
      normalDistributionChart: 0,
      processCapabilityChart: 0,
      actionData: [],
      lotWipData: [],
      lotWipLogData: [],
      buttonItems: [
        {
          text: this.$t("produce") + this.$t("history"),
          disabled: false,
          href: "/jobReport/jobReportLog"
        },
        {
          text: "",
          disabled: true
        }
      ],
      lotNo: null,
      lotOpData: [],
      measureData: {},
      tab: null,
      items: [
        { tab: this.$t("jobReport") + this.$t("log"), icon: "mdi-math-log" },
        { tab: this.$t("measurementData"), icon: "mdi-washing-machine" },
        {
          tab: this.$t("measurementDistribution"),
          icon: "mdi-fit-to-page-outline"
        },
        {
          tab: this.$t("normalDistribution"),
          icon: "mdi-clipboard-text-outline"
        },
        { tab: this.$t("processCapability"), icon: "mdi-access-point" },
        {
          tab: this.$t("notyet") + this.$t("completed") + "API",
          icon: "mdi-format-list-checkbox"
        }
      ]
    };
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    const id = params.id;
    // console.log(id);
    let response = await app.$axios.$get(`/LotOp/${id}`, {
      headers: {
        Authorization: token
      }
    });
    const lotOpData = response.data;
    //  console.log(lotOpData);
    response = await app.$axios.$get(`/MeasureData/Search?lotOpId=${id}`, {
      headers: {
        Authorization: token
      }
    });
    const measureData = response.data;

    response = await app.$axios.$get(`LotWipLog/Search?lotOpId=${id}`, {
      headers: {
        Authorization: token
      }
    });
    const lotWipLogData = response.data;

    response = await app.$axios.$get(`LotWip/Get?lotOpId=${id}`, {
      headers: {
        Authorization: token
      }
    });
    const lotWipData = response.data;

    response = await app.$axios.$get(`/Action/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    const actionData = response.data;

    response = await app.$axios.$get(
      `/ApiTask/Search?value=${id}&status=${"N"}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    const apiTaskData = response.data;

    return {
      id: params.id,
      lotOpData: lotOpData,
      measureData: measureData,
      lotWipLogData: lotWipLogData,
      lotWipData: lotWipData,
      actionData: actionData,
      apiTaskData: apiTaskData
    };
  },
  components: {
    ReportLogTimeline,
    MeasureDataTable,
    MeasurementDistributionChart,
    ProcessCapabilityChart,
    NormalDistributionChart,
    ApiTaskTable
  },
  methods: {
    updateApiTask() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/ApiTask/Search?value=${this.id}&status=${"N"}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          // if (res.data.data == null || res.data.data == undefined) {
          //   this.measureData = [];
          // }
          this.apiTaskData = res.data.data;
          console.log(res);
        });
    },
    forceRerender(tabName) {
      // this.chartKey += 1;
      if (tabName == this.$t("measurementDistribution")) {
        this.measurementDistributionChart += 1;
      } else if (tabName == this.$t("normalDistribution")) {
        this.normalDistributionChart += 1;
      } else if (tabName == this.$t("processCapability")) {
        this.processCapabilityChart += 1;
      }
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case "new":
          color = "grey";
          break;

        case "dispatch":
          color = "orange darken-1";
          break;
        case "producted":
          color = "green accent-4";
          break;

        case "pause":
          color = "red darken-1";
          break;
        case "complete":
          color = "light-blue accent-4";
          break;
        case "close":
          color = "blue-grey darken-3";
          break;
      }
      return color;
    },
    searchMeasureData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/MeasureData/Search?lotOpId=${this.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          // if (res.data.data == null || res.data.data == undefined) {
          //   this.measureData = [];
          // }
          this.measureData = res.data.data;
          this.update();
        });
    },
    update() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`LotWip/Get?lotOpId=${this.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.lotWipData = res.data.data;
        });

      this.$axios
        .get(`LotWipLog/Search?lotOpId=${this.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.lotWipLogData = res.data.data;
        });
    }
  },
  head() {
    return {
      title: this.lotOpData.lot.lotNo
    };
  },
  mounted() {
    this.buttonItems[1].text = this.lotOpData.lot.lotNo;
  },
  computed: {}
};
</script>
