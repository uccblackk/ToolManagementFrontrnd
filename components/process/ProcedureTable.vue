<template>
  <v-layout row wrap style="width: 100%">
    <v-flex xs6 md12 class="px-2">
      <v-form>
        <v-container fluid>
          <v-row class="text-center">
            <v-col cols="12" md="2">
              <v-text-field
                readonly
                v-model="sequence"
                :label="this.$t('processSequence')"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                clearable
                v-model="procedure"
                :label="this.$t('procedure')"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                clearable
                v-model="notice"
                :label="this.$t('notice')"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-btn color="info" class="my-2" @click="addProcedure()">
                <v-icon left>mdi-plus</v-icon>
                {{ $t("add") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex md12 class="pa-2 mt-n5">
      <v-data-table
        :headers="headers"
        :items="procedureData"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:[`item.actions`]="{ item }">
          <!-- <v-icon @click="editProcedure(item)">mdi-pencil</v-icon>
          <v-icon @click="deleteProcedure(item)">mdi-delete</v-icon> -->
          <v-icon @click="redirectProcedureDetail(item)"
            >mdi-android-messages</v-icon
          >
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
export default {
  props: {
    processId: {}
  },
  data() {
    return {
      procedure: "",
      sequence: 1,
      notice: "",
      procedureData: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      headers: [
        {
          text: this.$t("processSequence"),
          align: "start",
          sortable: false,
          value: "sequence",
          width: "5%"
        },
        {
          text: this.$t("procedure"),
          align: "start",
          value: "name",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("operator"),
          align: "start",
          value: "user.name",
          sortable: false,
          width: "15%"
        },
        {
          text: this.$t("count"),
          align: "start",
          value: "count",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("status"),
          align: "start",
          value: "status",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("startTime"),
          align: "start",
          value: "startTime",
          sortable: false,
          width: "20%"
        },
        {
          text: this.$t("finishTime"),
          align: "start",
          value: "finishTime",
          sortable: false,
          width: "20%"
        },
        {
          text: this.$t("notice"),
          align: "start",
          value: "notice",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("detail"),
          align: "start",
          value: "actions",
          sortable: false,
          width: "5%"
        }
        // { text: this.$t("detail"), value: "data-table-expand", width: "5%" },
      ]
    };
  },
  methods: {
    addProcedure() {
      if (this.procedure == null || this.procedure == "") {
        this.$swal(
          this.procedure,
          `${this.$t("miss")} ${this.$t("procedureInfo")}`,
          "error"
        );
        return;
      }
      const token = this.$store.state.authUser.token;
      const axios = this.$axios;
      const self = this;
      this.$swal({
        title: this.procedure,
        text: `${this.$t("createConfirm")} ?`,
        showCancelButton: true,
        confirmButtonText: this.$t("confirm"),
        cancelButtonText: this.$t("cancel"),
        icon: "question"
      }).then(function(dismiss) {
        if (dismiss.value) {
          const data = {
            processId: self.processId,
            name: self.procedure,
            sequence: self.sequence,
            status: self.$t("waitingSchedule"),
            notice: self.notice
          };
          axios
            .post(`/procedure/create`, data, {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              if (res.data.isSuccess) {
                // this.$swal(self.procedure, self.$t("createSuccess"), "success");
                self.getProcedureData();
              } else {
                this.$swal(self.procedure, self.$t("createFailed"), "error");
              }
            });
        }
      });
    },
    deleteProcedure(item) {
      const token = this.$store.state.authUser.token;
      const axios = this.$axios;
      const self = this;
      this.$swal({
        title: item.name,
        text: `${this.$t("deleteConfirm")} ?`,
        showCancelButton: true,
        confirmButtonText: this.$t("confirm"),
        cancelButtonText: this.$t("cancel"),
        icon: "question"
      }).then(function(dismiss) {
        if (dismiss.value) {
          axios
            .delete(`/Procedure/Delete/${item.id}`, {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              if (res.data.isSuccess) {
                // this.$swal(item.name, self.$t("deleteSuccess"), "success");
                self.getProcedureData();
              } else {
                this.$swal(item.name, self.$t("deleteFailed"), "error");
              }
            });
        }
      });
    },
    redirectProcedureDetail(item) {
      this.$router.push(`/procedure/${item.id}`);
      // let route = this.$router.resolve({path: `/procedure/${item.id}`});
      // window.open(route.href, '_blank');
    },
    editProcedure() {},
    getProcedureData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Procedure/Search?processId=${this.processId}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.data == null || res.data.data == undefined) {
            this.procedureData = [];
          }
          this.procedureData = res.data.data;
          this.procedureData.forEach(e => {
            e.status = this.$t(e.status);
          });
          this.sequence = this.procedureData.length + 1;
          this.procedure = "";
          this.notice = "";
        });
    }
  },
  mounted() {
    this.getProcedureData();
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
