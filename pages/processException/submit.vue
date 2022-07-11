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
      <v-card
        v-for="item in partData"
        class="ma-2"
        :key="item.id"
        max-width="100%"
        height="auto"
      >
        <v-card-title class="justify-center blue lighten-4">
          <h4 dark>{{ item.partNo }}</h4>
        </v-card-title>
        <v-card-subtitle>
          <v-data-table
            :headers="headers"
            :items="item.processList"
            class="elevation-1 mt-8"
            hide-default-footer
          >
            <template v-slot:[`item.exceptionReason`]="{ item }">
              <v-combobox
                v-model="item.exceptionReason"
                :items="exceptionReasonList"
              ></v-combobox>
            </template>
            <template v-slot:[`item.exceptionAction`]="{ item }">
              <div class="justify-end">
                <v-combobox
                  v-model="item.exceptionAction"
                  :items="exceptionActionList"
                ></v-combobox>
              </div>
            </template>
            <template v-slot:[`item.submit`]="{ item }">
              <div class="justify-center">
                <v-btn class="success" @click="onApply(item)">{{
                  $t("submit")
                }}</v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-subtitle>
        <v-card-actions> </v-card-actions>
      </v-card>
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
      partSearchType: "partNo",
      partSearchValue: "",
      partData: [],
      headers: [
        {
          text: this.$t("processSequence"),
          align: "start",
          value: "sequence",
          width: "5%"
        },
        {
          text: this.$t("name"),
          align: "start",
          value: "name",
          width: "10%"
        },
        {
          text: this.$t("count"),
          align: "start",
          value: "count",
          width: "5%"
        },
        {
          text: this.$t("operator"),
          align: "start",
          value: "operator",
          width: "8%"
        },
        {
          text: this.$t("status"),
          align: "start",
          value: "status",
          width: "8%"
        },
        {
          text: this.$t("startTime"),
          align: "start",
          value: "startTime",
          width: "15%"
        },
        {
          text: this.$t("finishTime"),
          align: "start",
          value: "finishTime",
          width: "15%"
        },
        {
          text: this.$t("exceptionReason"),
          align: "start",
          value: "exceptionReason",
          width: "20%"
        },
        {
          text: this.$t("action"),
          align: "start",
          value: "exceptionAction",
          width: "10%"
        },
        {
          text: this.$t("submit"),
          align: "start",
          value: "submit",
          width: "10%"
        }
      ],
      exceptionReasonList: [],
      exceptionActionList: []
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
      let type = "partNo";
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
              //工站過濾
              e.processList = e.processList.filter((item, index, array) => {
                return (
                  item.station.name === this.station &&
                  item.status !== "abnormal"
                );
              });
              if (e.processList != null && e.processList.length > 0) {
                e.processList.forEach(item => {
                  item.status = this.$t(item.status);
                  //增加異常資料
                  item.exceptionReason = this.exceptionReasonList[0];
                  item.exceptionAction = this.exceptionActionList[0];
                  item.startTime =
                    item.startTime != null
                      ? moment(item.startTime).format("YYYY/MM/DD HH:mm:ss")
                      : "";
                  item.finishTime =
                    item.finishTime != null
                      ? moment(item.finishTime).format("YYYY/MM/DD HH:mm:ss")
                      : "";
                });
              }
            });
          }
        });
    },
    onApply(item) {
      console.log(item);
      const axios = this.$axios;
      const token = this.$store.state.authUser.token;
      const self = this;
      const user = this.$store.state.authUser;
      this.$swal({
        title: this.$t("processExceptionApplication"),
        text: `${item.name} ?`,
        showCancelButton: true,
        confirmButtonText: this.$t("confirm"),
        cancelButtonText: this.$t("cancel"),
        icon: "question"
      }).then(function(dismiss) {
        if (dismiss.value) {
          const data = {
            applicantId: user.id,
            processId: item.id,
            reason: item.exceptionReason,
            action: item.exceptionAction,
            status: "submiting",
            applicationTime: new Date()
          };
          axios
            .post(`/ProcessException/Submit`, data, {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              if (res.data.isSuccess) {
                this.$swal(self.procedure, self.$t("createSuccess"), "success");
                self.onSearch();
              } else {
                this.$swal(self.procedure, self.$t("createFailed"), "error");
              }
            });
        }
      });
    }
  },
  computed: {},
  created() {
    const setting = require(`@/static/setting/setting.json`);
    this.exceptionReasonList = Object.values(
      setting.processExceptionReasonList
    );
    this.exceptionActionList = Object.values(
      setting.processExceptionActionList
    );
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
