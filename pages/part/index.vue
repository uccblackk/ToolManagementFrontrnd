<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <v-col cols="4" md="2">
              <v-select
                v-model="partSearchType"
                :items="partSearchList"
                :label="$t('partSearchType')"
                solo
              ></v-select>
            </v-col>
            <v-col cols="8" md="10">
              <v-text-field
                clearable
                v-model="partSearchValue"
                :label="this.$t('partSearch')"
                append-icon="mdi-magnify"
                required
                @click:append="onSearch"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex xs12 class="text-center justify-center mt-n5">
      <v-btn
        label
        :color="getStatusColor(item)"
        v-for="(item, idx) in statusLabel"
        :key="idx"
        class="mx-5 px-5"
        dark
        width="100"
        >{{ $t(item) }}</v-btn
      >
    </v-flex>
    <v-flex xs12 class="ma-5">
      <v-data-table
        :headers="headers"
        :items="partData"
        :items-per-page="itemsPerPage"
        class="elevation-2"
        @page-count="pageCount = $event"
        :page.sync="page"
        show-expand
        hide-default-footer
      >
        <template v-slot:[`item.select`]="{ item }">
          <v-icon class="mr-2" @click="redirectToPartDetail(item.id)"
            >mdi-arrow-right-bold-box</v-icon
          >
          {{ item.name }}
        </template>
        <template v-slot:[`item.processList`]="{ item }">
          <v-tooltip
            bottom
            v-for="process in item.processList"
            :key="process.id"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="ma-1 pa-1"
                :color="getStatusColor(process.status)"
                dark
                v-bind="attrs"
                v-on="on"
                @click="redirectToStation(process.id)"
                >{{ process.name }}</v-btn
              >
            </template>
            <div>
              <h4>{{ $t("name") }}:{{ process.name }}</h4>
              <h4>{{ $t("status") }}:{{ process.status }}</h4>
            </div>
          </v-tooltip>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <v-tooltip
              bottom
              v-for="process in item.processList"
              :key="process.id"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="ma-1 pa-1"
                  :color="getStatusColor(process.status)"
                  dark
                  v-bind="attrs"
                  v-on="on"
                  @click="redirectToStation(process.id)"
                  >{{ process.name }}<br />●{{ $t(process.status) }}</v-btn
                >
              </template>
              <div>
                <h4>{{ $t("name") }}:{{ process.name }}</h4>
                <h4>{{ $t("status") }}:{{ $t(process.status) }}</h4>
              </div>
            </v-tooltip>
          </td>
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
export default {
  middleware: "auth",
  data() {
    return {
      partSearchType: this.$t("partNo"),
      partSearchList: [this.$t("partNo"), this.$t("jobNo")],
      partSearchValue: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 20,
      headers: [
        {
          text: this.$t("name"),
          value: "select",
          sortable: false,
          width: "10%"
        },
        { text: this.$t("partNo"), value: "partNo", width: "15%" },
        { text: this.$t("count"), value: "count", width: "4%" },
        {
          text: this.$t("scheduleStartTime"),
          value: "scheduleStartTime",
          width: "10%"
        },
        {
          text: this.$t("scheduleFinishTime"),
          value: "scheduleFinishTime",
          width: "10%"
        },
        { text: this.$t("startTime"), value: "startTime", width: "10%" },
        { text: this.$t("finishTime"), value: "finishTime", width: "10%" },
        { text: this.$t("process"), value: "data-table-expand", width: "2%" }
      ],
      partData: [],
      statusLabel: [
        "inStation",
        "waitingSchedule",
        "scheduled",
        "preparing",
        "processing",
        "completed",
        "abnormal",
        "scrapped"
      ]
    };
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    const id = params.id;
    let type = "partNo";
    let value = "";
    let response = await app.$axios.$get(
      `/Part/Search?type=${type}&value=${value}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    const partData = response.data;
    partData.forEach(e => {
      e.scheduleStartTime =
        e.scheduleStartTime != null
          ? moment(e.scheduleStartTime).format("YYYY/MM/DD HH:mm:ss")
          : "";
      e.scheduleFinishTime =
        e.scheduleFinishTime != null
          ? moment(e.scheduleFinishTime).format("YYYY/MM/DD HH:mm:ss")
          : "";
      e.startTime =
        e.startTime != null
          ? moment(e.startTime).format("YYYY/MM/DD HH:mm:ss")
          : "";
      e.finishTime =
        e.finishTime != null
          ? moment(e.finishTime).format("YYYY/MM/DD HH:mm:ss")
          : "";
    });
    return {
      partData: partData
    };
  },
  methods: {
    onSearch() {
      const token = this.$store.state.authUser.token;
      let type = "";
      switch (this.partSearchType) {
        case this.$t("partNo"):
          type = "partNo";
          break;
        case this.$t("jobNo"):
          type = "jobNo";
          break;
      }
      this.$axios
        .get(`/Part/Search?type=${type}&value=${this.partSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.data == null || res.data.data == undefined) {
            this.partData = [];
          }
          this.partData = res.data.data;
          if (this.partData != null) {
            this.partData.forEach(e => {
              e.scheduleStartTime =
                e.scheduleStartTime != null
                  ? moment(e.scheduleStartTime).format("YYYY/MM/DD HH:mm:ss")
                  : "";
              e.scheduleFinishTime =
                e.scheduleFinishTime != null
                  ? moment(e.scheduleFinishTime).format("YYYY/MM/DD HH:mm:ss")
                  : "";
              e.startTime =
                e.startTime != null
                  ? moment(e.startTime).format("YYYY/MM/DD HH:mm:ss")
                  : "";
              e.finishTime =
                e.finishTime != null
                  ? moment(e.finishTime).format("YYYY/MM/DD HH:mm:ss")
                  : "";
            });
          }
        });
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case "inStation":
          color = "grey darken-2";
          break;
        case "waitingSchedule":
          color = "grey lighten-1";
          break;
        case "scheduled":
          color = "blue lighten-3";
          break;
        case "preparing":
          color = "amber darken-1";
          break;
        case "processing":
        case "executing":
          color = "success";
          break;
        case "completed":
          color = "primary";
          break;
        case "abnormal":
          color = "red";
          break;
        case "scrapped":
          color = "blue-grey darken-4";
          break;
      }
      return color;
    },
    redirectToPartDetail(partId) {
      this.$router.push(`/part/${partId}`);
    },
    redirectToStation(processId) {
      this.$router.push(`/process/${processId}`);
    }
  },
  computed: {}
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
