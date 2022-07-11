<template>
  <v-hover v-if="process" v-slot:default="{ hover }" open-delay="200">
    <v-card
      max-width="400"
      height="auto"
      :elevation="hover ? 16 : 2"
      :color="statusColor"
    >
      <div class="text-right mx-2">
        <v-icon small @click="deleteProcess()">mdi-close</v-icon>
      </div>
      <v-card-title>
        <v-layout row class="pa-1">
          <v-flex
            style="
              color: white;
              width: 400px;
              font-weight: bold;
              font-size: 30px;
            "
          >
            <div>{{ process.name }}</div>
            <v-divider class="ma-2" />
            <div
              style="width: auto; background-color: white; text-align: left"
              class="justify-center rounded ma-2"
            >
              <v-chip label color="white" class="max-width-chip ma-1"
                >{{ $t("completedProcedure") }}:
                {{ completedProcedureName }}</v-chip
              >
            </div>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-card-subtitle>
        <v-layout
          row
          wrap
          style="width: 100%; text-align: center; color: white"
          class="pa-1"
        >
          <v-flex
            xs
            sm
            lg
            xl
            md12
            style="width: 100%; text-align: left; color: white"
          >
            <v-row no-gutters>
              <v-col cols="4">{{ $t("equipmentInfo") }}:</v-col>
              <v-col cols="8">{{ process.name }}</v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="4">{{ $t("startTime") }}:</v-col>
              <v-col cols="8">{{ startTime }}</v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="4">{{ $t("finishTime") }}:</v-col>
              <v-col cols="8">{{ finishTime }}</v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="4">{{ $t("status") }}:</v-col>
              <v-col cols="8">{{ $t(process.status) }}</v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="4">{{ $t("notice") }}:</v-col>
              <v-col cols="8">{{ process.notice }}</v-col>
            </v-row>
          </v-flex>
        </v-layout>
      </v-card-subtitle>
      <v-card-actions>
        <v-btn @click="redirectToDetail">
          <v-icon>mdi-android-messages</v-icon>
          {{ $t("detail") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>
<script>
import moment from "moment";
export default {
  props: {
    processData: {}
  },
  data() {
    return {
      process: {}
    };
  },
  methods: {
    redirectToDetail() {
      this.$router.push(`/process/${this.process.id}`);
    },
    deleteProcess() {
      const token = this.$store.state.authUser.token;
      const axios = this.$axios;
      const self = this;
      this.$swal({
        title: this.process.name,
        text: `${this.$t("deleteConfirm")} ?`,
        showCancelButton: true,
        confirmButtonText: this.$t("confirm"),
        cancelButtonText: this.$t("cancel"),
        icon: "question"
      }).then(function(dismiss) {
        if (!dismiss.value) {
          return;
        }
        if (self.$store.state.authUser.role != "admin") {
          this.$swal(
            self.process.name,
            `${self.$t("noPermission")} ${self.$t("deleteFailed")}`,
            "error"
          );
          return;
        }
        axios
          .delete(`/Process/Delete/${self.process.id}`, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            if (res.data.isSuccess) {
              this.$swal(
                self.process.name,
                self.$t("deleteSuccess"),
                "success"
              );
              self.process = {};
              self.$emit("delete", self.process);
            } else {
              this.$swal(self.process.name, self.$t("deleteFailed"), "error");
            }
          });
      });
    }
  },
  created() {
    this.process = this.processData;
  },
  computed: {
    statusColor() {
      let color = "";
      switch (this.process.status) {
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
        case "executing":
        case "processing":
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
    startTime() {
      return this.process.startTime != null
        ? moment(this.process.startTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    },
    finishTime() {
      return this.process.finishTime != null
        ? moment(this.process.finishTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    },
    completedProcedureName() {
      if (this.process.procedureList == null) {
        return "";
      }
      const procedureList =
        this.process.procedureList.length != 0
          ? this.process.procedureList
          : null;
      if (procedureList == null || this.process.procedureList.length == 0) {
        return "";
      }
      let completedProcedureName = "";
      procedureList.forEach(e => {
        if (e.status === this.$t("completed")) {
          completedProcedureName = e.name;
        }
      });
      return completedProcedureName;
    }
  }
};
</script>
<style></style>
