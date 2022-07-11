<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <v-data-table
        :headers="headers"
        :items="maintenanceList"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      ></v-data-table>
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
  props: {
    maintenanceData: {}
  },
  data() {
    return {
      maintenanceList: [],
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      headers: [
        {
          text: this.$t("machineName"),
          value: "machine.name",
          align: "start",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("maintenanceContent"),
          value: "content",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("status"),
          value: "status",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("scheduleTime"),
          value: "scheduleTime",
          sortable: false,
          width: "15%"
        },
        {
          text: this.$t("finishTime"),
          value: "time",
          sortable: false,
          width: "15%"
        },
        {
          text: this.$t("operator"),
          value: "operator.name",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("reviewResult"),
          value: "reviewResult",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("reviewTime"),
          value: "reviewTime",
          sortable: false,
          width: "15%"
        },
        {
          text: this.$t("notice"),
          value: "notice",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },
  watch: {
    maintenanceData() {
      this.maintenanceList = this.maintenanceData;
      this.maintenanceList.forEach(e => {
        e.scheduleTime =
          e.scheduleTime != null
            ? moment(e.scheduleTime).format("YYYY/MM/DD HH:mm:ss")
            : "";
        e.time =
          e.time != null ? moment(e.time).format("YYYY/MM/DD HH:mm:ss") : "";
        e.time =
          e.reviewTime != null
            ? moment(e.reviewTime).format("YYYY/MM/DD HH:mm:ss")
            : "";
      });
    }
  }
};
</script>
