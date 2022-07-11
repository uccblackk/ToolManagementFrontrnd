<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <v-data-table
        :headers="headers"
        :items="productionLotOpData"
        :items-per-page="itemsPerPage"
        :sort-by="['moData.urgent']"
        :sort-desc="[true]"
        multi-sort
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        :item-class="itemRowBackground"
        hide-default-footer
      >
        <template v-slot:item.moData.urgent="{ item }">
          <div v-if="item.moData.urgent == 'Y'">
            <v-icon large color="red">
              mdi-fire-alert
            </v-icon>
          </div>
        </template>
        <template v-slot:item.opName="{ item }">
          {{ item.opName + " (" + item.opSequence + ")" }}
        </template>
        <!-- MCS投產ICON_START -->
        <template v-slot:item.lotWipData.isProduction="{ item }">
          <v-icon color="warning" v-if="item.lotWipData.isProduction == 'N'">
            mdi-minus-circle
          </v-icon>
          <v-icon color="success" v-else>
            mdi-check-circle
          </v-icon>
        </template>
        <!-- MCS投產ICON_END -->

        <template v-slot:item.resourceType="{ item }">
          <div v-if="item.lotWipData.resourceType == 'E'">
            {{ $t("equipment") }}
          </div>
          <div v-if="item.lotWipData.resourceType == 'L'">
            {{ $t("line") }}
          </div>
        </template>
        <template v-slot:item.resourceNo="{ item }">
          <v-chip
            v-if="item.lotWipData.resourceType == 'E'"
            color="blue darken-3"
            dark
          >
            {{ item.lotWipData.resourceNo }}
          </v-chip>
          <v-chip
            v-if="item.lotWipData.resourceType == 'L'"
            color="orange  darken-3"
            dark
          >
            {{ item.lotWipData.resourceNo }}
          </v-chip>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip outlined :color="getStatusColor(item.status)">
            <span v-if="item.status == 'complete'">
              {{ $t(item.status) }}
            </span>
            <span v-else-if="item.status === 'in' || item.status === 'out'">
              {{ $t("producted") }}
            </span>

            <span v-else-if="item.status === 'dispatch'">
              {{ $t("already") + $t(item.status) }}
            </span>
            <span v-else-if="item.status === 'close'">
              {{ $t("projectClose") }}
            </span>
          </v-chip>
        </template>
        <template v-slot:[`item.dispatchStartDate`]="{ item }">
          <span v-if="item.lotWipData.scheduleStartTime != null">
            {{
              new Date(
                item.lotWipData.dispatchStartDate +
                  " " +
                  item.lotWipData.scheduleStartTime
              ).toLocaleString()
            }}
          </span>
          <span v-else>
            {{ item.lotWipData.dispatchStartDate }}
          </span>
        </template>
        <template v-slot:item.cycleTime="{ item }">
          <label id="status1" class="form-label">
            {{ showItemState(item.lotWipData.cycleTime) }}
          </label>
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
import dayjs from "dayjs";
const setting = require(`@/static/setting/setting.json`);
export default {
  components: {},
  props: {
    productionLotOpData: [],
    isLoading: 0
  },
  data() {
    return {
      loading: 0,
      opResourceType: [
        { name: this.$t("equipment"), value: "E" },
        { name: this.$t("line"), value: "L" }
      ],
      selectedOpResourceType: { name: null, value: null },
      ResourceList: [],
      Resource: [],
      machineData: [],
      updateMachineData: [],
      updateLineData: [],
      lineData: [],
      machineList: [],
      lineList: [],
      workShiftData: [],
      workShiftList: {},
      Valid: true,
      dispatchDates: new Date().toISOString().substr(0, 10),
      dispatchMenu: false,
      dispatchDate: null,
      dispatchDialog: false,
      editDialog: false,
      selectedLotOp: {},
      selectedLotWip: {},
      page: 1,
      cancelDispatchDialog: false,
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        {
          text: this.$t("urgentMo"),
          value: "moData.urgent",
          align: "start",
          sortable: true,
          width: "5%"
        },
        {
          text: this.$t("lot") + this.$t("No"),
          value: "lot.lotNo",
          align: "start",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("itemName"),
          value: "moData.itemName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("itemNo"),
          value: "moData.itemNo",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("itemSpec"),
          value: "moData.itemSpec",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("process"),
          value: "opName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("type"),
          value: "resourceType",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("equipment") + this.$t("No"),
          value: "lotWipData.resourceNo",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("status"),
          value: "status",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("count"),
          value: "qty",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("dispatch") + this.$t("time"),
          value: "dispatchStartDate",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("workShift"),
          value: "lotWipData.shiftName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("expected") + this.$t("cycleTime"),
          value: "cycleTime",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("production"),
          value: "lotWipData.isProduction",
          align: "center",
          sortable: false,
          width: "5%"
        }
      ]
    };
  },

  methods: {
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case "new":
          color = "grey";
          break;
        case "createlot":
          color = "grey darken-1";
          break;
        case "dispatch":
          color = "orange darken-1";
          break;
        case "in":
          color = "green accent-4";
          break;
        case "out":
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
    showDeleteDialog(item) {
      //console.log(item);
      this.cancelDispatchDialog = true;
      this.deleteItemData = item;
    },
    showEditDialog(item) {
      //console.log(item);
      this.editDialog = true;
      this.selectedLotOp = item;
      this.selectedLotWip = item.lotWipData;
      this.dispatchDates = this.selectedLotWip.dispatchStartDate;
      this.selectedOpResourceType = this.selectedLotWip.resourceType;
      //console.log(this.selectedLotOp);
      this.getOpResource();
    },

    showItemState(cycleTime) {
      // console.log(cycleTime);
      let result = null;
      if (cycleTime != "" && cycleTime != undefined) {
        result = new Date(cycleTime * 1000).toISOString().substr(11, 8);
      }
      return result;
    },
    cancelDispatch() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/lotWip/delete/${this.deleteItemData.lotWipData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("cancel") + this.$t("dispatch") + this.$t("success"),
              "success"
            );
          } else {
            this.$swal("", res.data.msg, "error");
          }
          this.$emit("update");
          this.cancelDispatchDialog = false;
        })
        .then(() => {});
    },
    getOpResource() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/OpResource/Search?value=` + this.selectedLotOp.opNo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machineData = res.data.data.equipOpResource;
          if (this.machineData != undefined) {
            this.machineData.sort(function(a, b) {
              if (a.resourceNo < b.resourceNo) {
                return -1;
              }
              if (a.resourceNo > b.resourceNo) {
                return 1;
              }
              return 0;
            });
          }

          this.lineData = res.data.data.lineOpResource;
          if (this.lineData != undefined) {
            this.lineData.sort(function(a, b) {
              if (a.resourceNo < b.resourceNo) {
                return -1;
              }
              if (a.resourceNo > b.resourceNo) {
                return 1;
              }
              return 0;
            });
          }
          if (this.selectedOpResourceType == "E") {
            this.machineList = this.machineData.find(
              x => x.resourceNo == this.selectedLotWip.resourceNo
            );
            //console.log(this.machineList);
          } else {
            this.lineList = this.lineData.find(
              x => x.resourceNo == this.selectedLotWip.resourceNo
            );
          }
          this.onOpReourceSelectChange();
        });
    },
    getDate() {
      var date = new Date();
      // date.setDate(date.getDate() + 0);

      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);

      // console.log(date.toISOString());
      return date.toISOString().substr(0, 10);
    },
    onTypeSelectedChange() {
      if (this.selectedOpResourceType == "E") {
        this.lineList = [];
      } else {
        this.machineList = [];
      }
      this.workShiftData = [];
      //console.log(this.lineList);
      //  console.log(this.selectedOpResourceType);
    },
    onOpReourceSelectChange() {
      //  console.log(this.machineList);
      if (this.selectedOpResourceType == "E") {
        if (this.machineList != undefined) {
          let machineData = this.machineData.find(
            x => x.resourceNo == this.machineList.resourceNo
          );
          this.workShiftData = [];
          let data = machineData.workShift;
          if (data != undefined) {
            for (let i = 0; i < data.length; i++) {
              this.workShiftData.push(data[i][0]);
            }
            this.workShiftList = this.workShiftData[0];
          }
        }
        //console.log(this.workShiftData);
      } else {
        if (this.lineList != undefined) {
          let lineData = this.lineData.find(
            x => x.resourceNo == this.lineList.resourceNo
          );
          this.workShiftData = [];
          let data = lineData.workShift;
          if (data != undefined) {
            for (let i = 0; i < data.length; i++) {
              this.workShiftData.push(data[i][0]);
            }
            this.workShiftList = this.workShiftData[0];
            //console.log(this.workShiftData);
          }
        }
      }
      //console.log();
    },
    getDateTime() {
      var date = new Date();
      // date.setDate(date.getDate() + 0);

      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);

      // console.log(date.toISOString());
      return date;
    },
    editLotWip() {
      const token = this.$store.state.authUser.token;
      let resourceNo = null;
      let resourceName = null;
      if (this.selectedOpResourceType == "E") {
        if (this.machineList.resourceNo == undefined) {
          return;
        }
        resourceNo = this.machineList.resourceNo;
        resourceName = this.machineList.name;
      } else {
        if (this.lineList.resourceNo == undefined) {
          return;
        }
        resourceNo = this.lineList.resourceNo;
        resourceName = this.lineList.name;
      }

      if (this.workShiftList == undefined) {
        return;
      }
      //console.log(this.selectedLotOp);
      const lotWip = {
        id: this.selectedLotWip.id,
        lotId: this.selectedLotOp.lotId,
        moId: this.selectedLotOp.moId,
        lotOpId: this.selectedLotOp.id,
        resourceType: this.selectedOpResourceType,
        resourceNo: resourceNo,
        resourceName: resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: this.workShiftList.shiftNo,
        shiftName: this.workShiftList.shiftName,
        dispatchStartDate: this.dispatchDates,
        dispatchEndDate: this.dispatchDates,
        status: "dispatch",
        statusDate: this.getDateTime(),
        cycleTime: null,
        planQty: this.selectedLotOp.qty,
        inQty: null,
        outQty: null,
        ngQty: null,
        inTime: null,
        actualStartTime: null,
        actualEndTime: null,
        urgent: this.selectedLotWip.urgent,
        isProduction: this.selectedLotWip.isProduction
      };
      //console.log(lotWip);

      this.$axios
        .post(`/LotWip/update`, lotWip, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
          } else {
            this.$swal("", this.$t("dispatch") + this.$t("failed"), "error");
          }
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },

    itemRowBackground: function(item) {
      //console.log(item);
      return item.moData.urgent == "Y" ? "red lighten-5" : "";
    }
  },
  watch: {
    newLotData() {},
    isLoading() {
      this.loading = this.isLoading;
    }
  },

  created() {},
  mounted() {},
  computed: {
    rules() {
      return [this.opCheckbox.length > 0 || ""];
    }
  }
};
</script>
<style lang="scss" scoped>
.some-other-style {
  background: rgb(231, 231, 231);
}
.my-header-style {
  color: #6f8fb9 !important;
}
.style-1 {
  background-color: rgb(215, 215, 44);
}
.style-2 {
  background-color: rgb(114, 114, 67);
}
</style>
