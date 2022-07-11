<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5">
      <!--報工確認彈窗 -->
      <v-dialog v-model="jobReportDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("exceptionalTime") }}{{ $t("jobReport") }}</span
            >
          </v-card-title>
          <v-card-text class="text-h5">
            <v-container>
              {{ $t("confirm") }}{{ $t("jobReport") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="jobReportDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="jobReport()">
              {{ $t("jobReport") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="exceptionalTimeData"
        :items-per-page="itemsPerPage"
        :sort-by="['status', 'actualStartTime']"
        :sort-desc="[true, false]"
        :loading="loading == 1"
        multi-sort
        loading-text="Loading... Please wait"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.reportBtn="{ item }">
          <v-btn
            outlined
            v-if="item.status == 'active'"
            color="primary"
            class="font-weight-black"
            @click="showJobReportDialog(item)"
            >{{ $t("jobReport") }}</v-btn
          >
        </template>
        <template v-slot:item.userName="{ item }">
          <v-avatar
            v-if="item.userNo != 'admin'"
            color="primary white--text text-caption"
            style="max-width: 30px;"
            size="30"
            dark
          >
            <span class="text-truncate" style="max-width: 25px;">
              {{ item.userName.charAt(0) }}
            </span>
          </v-avatar>
          <v-avatar
            v-if="item.userNo == 'admin'"
            color="error white--text text-caption"
            style="max-width: 30px;"
            size="30"
            dark
          >
            <span class="text-truncate" style="max-width: 25px;">
              {{ item.userName.charAt(0) }}
            </span>
          </v-avatar>
          {{ item.userName }}
        </template>
        <template v-slot:item.actualStartTime="{ item }">
          {{ new Date(item.actualStartTime).toLocaleString() }}
        </template>
        <template v-slot:item.actualEndTime="{ item }">
          <span v-if="item.actualEndTime != null">
            {{ new Date(item.actualEndTime).toLocaleString() }}
          </span>
          <span v-else>
            {{ "--" }}
          </span>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip color="success" v-if="item.status == 'active'">
            {{ $t(item.status) }}
          </v-chip>
          <v-chip v-else color="primary">
            {{ $t(item.status) }}
          </v-chip>
        </template>
        <template v-slot:item.lotData="{ item }">
          <span v-if="item.lotData != undefined">
            {{ item.lotData[0].lotNo }}
          </span>
          <span v-else>
            {{ "--" }}
          </span>
        </template>
        <template v-slot:item.resourceName="{ item }">
          <span v-if="item.resourceName != null">
            {{ item.resourceName }}
          </span>
          <span v-else>
            {{ "--" }}
          </span>
        </template>
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="showDeleteDialog(item)">
            mdi-delete
          </v-icon>
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
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    data: {},
    isLoading: null,
    userSearchValue: null,
    statusCheckedList: null,
    startDate: null,
    endDate: null
  },
  data() {
    return {
      loading: 0,
      selectedItem: {},
      exceptionalTimeData: [],
      areaSearchValue: "",
      editDialog: false,
      jobReportDialog: false,
      areaName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editAreaForm: {
        no: null,
        name: null
      },
      deleteAreaData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: "",
          value: "reportBtn",
          align: "start",
          sortable: true,
          width: "5%"
        },
        // {
        //   text: this.$t("user") + this.$t("No"),
        //   value: "userNo",
        //   align: "start",
        //   sortable: true,
        //   width: "5%"
        // },
        {
          text: this.$t("user") + this.$t("name"),
          value: "userName",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("lot") + this.$t("No"),
          value: "lotData",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("equipment") + "/" + this.$t("line") + this.$t("name"),
          value: "resourceName",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("workShift") + this.$t("name"),
          value: "shiftName",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("start") + this.$t("time"),
          value: "actualStartTime",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("completed") + this.$t("time"),
          value: "actualEndTime",
          align: "start",
          sortable: true,
          width: "10%"
        },

        {
          text: this.$t("status"),
          value: "status",
          align: "start",
          sortable: true,
          width: "5%"
        },
        {
          text: this.$t("exceptionalTime") + this.$t("reason"),
          value: "reasonName",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("notice"),
          value: "remark",
          align: "start",
          sortable: true,
          width: "10%"
        }
      ]
    };
  },
  watch: {
    data() {
      // console.log(this.data);
      this.exceptionalTimeData = this.data;
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  methods: {
    showJobReportDialog(item) {
      this.selectedItem = item;
      this.jobReportDialog = true;
    },
    jobReport() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;
      const data = {
        id: this.selectedItem.id,
        customerId: this.selectedItem.customerId,
        lotOpId: this.selectedItem.lotOpId,
        compNo: this.selectedItem.compNo,
        siteNo: this.selectedItem.siteNo,
        resourceType: this.selectedItem.resourceType,
        resourceNo: this.selectedItem.resourceNo,
        resourceName: this.selectedItem.resourceName,
        userNo: this.selectedItem.userNo,
        userName: this.selectedItem.userName,
        status: "complete",
        reasonNo: this.selectedItem.reasonNo,
        reasonName: this.selectedItem.reasonName,
        statusDate: new Date(),
        actualStartTime: this.selectedItem.actualStartTime,
        actualEndTime: new Date(),
        remark: this.selectedItem.remark
      };
      this.selectedItem = {};

      this.$axios
        .post(
          `/ExceptionalTime/update?logUserId=` + this.$store.state.authUser.id,
          data,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("jobReport") + this.$t("success"),
              "success"
            );
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal("", this.$t("jobReport") + this.$t("failed"), "error");
          }
          this.refreshData();
          this.jobReportDialog = false;
        })
        .then(() => {});
    },
    refreshData() {
      this.loading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(
          `/ExceptionalTime/Search?value=${this.userSearchValue}&status=${this.statusCheckedList}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.exceptionalTimeData = res.data.data != null ? res.data.data : [];
          this.loading = 0;
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deleteAreaData.no = item.areaNo;
      this.deleteAreaData.name = item.areaName;
      this.deleteAreaData.id = item.id;
    }
  },
  mounted() {
    this.exceptionalTimeData = this.data;
  },
  computed: {},
  created() {}
};
</script>
