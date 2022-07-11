<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <v-col cols="4" md="2">
              <v-select
                v-model="station"
                :items="stationList"
                :label="$t('station')"
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
    <v-flex xs12 class="mx-1">
      <v-data-table
        :headers="headers"
        :items="exceptionProcessData"
        class="elevation-1 mt-8"
        hide-default-footer
      >
        <template v-slot:[`item.result`]="{ item }">
          <div class="justify-end">
            <v-combobox v-model="item.result" :items="resultList"></v-combobox>
          </div>
        </template>
        <template v-slot:[`item.review`]="{ item }">
          <div class="justify-center">
            <v-btn class="success" @click="onReview(item)">{{
              $t("review")
            }}</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
export default {
  middleware: "auth",
  data() {
    return {
      station: "",
      stationList: [],
      exceptionProcessData: [],
      headers: [
        {
          text: this.$t("processSequence"),
          align: "start",
          value: "process.sequence",
          width: "10%"
        },
        {
          text: this.$t("process"),
          align: "start",
          value: "process.name",
          width: "10%"
        },
        {
          text: this.$t("applicant"),
          align: "start",
          value: "applicant.name",
          width: "10%"
        },
        {
          text: this.$t("status"),
          align: "start",
          value: "status",
          width: "8%"
        },
        {
          text: this.$t("applicationTime"),
          align: "start",
          value: "applicationTime",
          width: "15%"
        },
        {
          text: this.$t("exceptionReason"),
          align: "start",
          value: "reason",
          width: "20%"
        },
        {
          text: this.$t("action"),
          align: "start",
          value: "action",
          width: "10%"
        },
        {
          text: this.$t("result"),
          align: "start",
          value: "result",
          width: "20%"
        },
        {
          text: this.$t("review"),
          align: "start",
          value: "review",
          width: "10%"
        }
      ],
      resultList: []
    };
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    let response = await app.$axios.$get(`/Station/Search?name=`, {
      headers: {
        Authorization: token
      }
    });
    const stationData = response.data;
    let stationList = [];
    stationData.forEach(e => {
      stationList.push(e.name);
    });
    return {
      stationList: stationList
    };
  },
  methods: {
    onSearch() {
      const token = this.$store.state.authUser.token;
      let status = "submiting";
      this.$axios
        .get(`/ProcessException/Search?status=${status}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.data == null || res.data.data == undefined) {
            this.exceptionProcessData = [];
          }
          this.exceptionProcessData = res.data.data;
          if (this.exceptionProcessData != null) {
            this.exceptionProcessData.forEach(e => {
              e.status = this.$t(e.status);
              e.result = e.action;
              e.applicationTime =
                e.applicationTime != null
                  ? moment(e.applicationTime).format("YYYY/MM/DD HH:mm:ss")
                  : "";
            });
          }
        });
    },
    onReview(item) {
      console.log(item);
      const axios = this.$axios;
      const token = this.$store.state.authUser.token;
      const self = this;
      const user = this.$store.state.authUser;
      this.$swal({
        title: `${this.$t("reviewResult")}`,
        text: `${item.action}`,
        showCancelButton: true,
        confirmButtonText: this.$t("confirm"),
        cancelButtonText: this.$t("cancel"),
        icon: "question"
      }).then(function(dismiss) {
        if (dismiss.value) {
          const data = {
            auditorId: user.id,
            id: item.id,
            result: item.result,
            auditTime: new Date()
          };
          axios
            .post(`/ProcessException/Audit`, data, {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              if (res.data.isSuccess) {
                this.$swal(self.procedure, self.$t("auditSuccess"), "success");
                self.onSearch();
              } else {
                this.$swal(self.procedure, self.$t("auditFailed"), "error");
              }
            });
        }
      });
    }
  },
  computed: {},
  created() {
    const setting = require(`@/static/setting/setting.json`);
    this.resultList = Object.values(setting.processExceptionActionList);
    this.station = this.stationList[0];
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
