<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 派工彈窗 -->
      <v-dialog v-model="dispatchDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              <v-icon left color="white">
                mdi-arrow-right-bold-box
              </v-icon>
              {{ $t("lot") }}{{ $t("dispatch") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-menu
                      ref="dispatchMenu"
                      v-model="dispatchMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="dispatchDates"
                          :label="$t('select') + $t('dispatch') + $t('date')"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        locale="zh-cn"
                        v-model="dispatchDates"
                        @input="dispatchMenu = false"
                        :min="getDate()"
                      >
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="3" md="3">
                    <v-select
                      ref="opDesc"
                      :label="$t('type')"
                      v-model="selectedOpResourceType"
                      :items="opResourceType"
                      item-text="name"
                      item-value="value"
                      @change="onTypeSelectedChange()"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="5" md="5">
                    <!-- <div v-if="selectedOpResourceType === 'E'">E</div>
                  <div v-else-if="selectedOpResourceType === 'L'">L</div> -->
                    <v-select
                      ref="opDesc"
                      v-if="selectedOpResourceType == 'L'"
                      :label="$t('line')"
                      v-model="lineList"
                      :items="lineData"
                      item-text="name"
                      item-value="resourceNo"
                      return-object
                      @change="onOpReourceSelectChange()"
                      required
                    ></v-select>
                    <v-select
                      ref="select"
                      v-else-if="selectedOpResourceType == 'E'"
                      :label="$t('equipment')"
                      v-model="machineList"
                      :items="machineData"
                      @change="onOpReourceSelectChange()"
                      return-object
                      item-text="name"
                      item-value="resourceNo"
                    >
                    </v-select>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <v-select
                      ref="select"
                      :label="$t('workShift')"
                      v-model="workShiftList"
                      :items="workShiftData"
                      title="startTime"
                      item-text="shiftName"
                      item-value="shiftNo"
                      return-object
                    >
                    </v-select>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="dispatchDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="dispath()">
              {{ $t("dispatch") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-data-table
        style="width:100%"
        :headers="headers"
        :items="newLotData"
        :items-per-page="itemsPerPage"
        :sort-by="['moData.urgent', 'moData.planStartDate']"
        :sort-desc="[true, false]"
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
        <template v-slot:item.sn="{ index }">
          {{ index + 1 }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip color="grey" outlined dark>
            {{ $t(item.status) }}
          </v-chip>
        </template>
        <template v-slot:item.dispatch="{ item }">
          <v-btn text color="primary" @click="showDispatchDialog(item)">
            <v-icon left>
              mdi-arrow-right-bold-box
            </v-icon>

            {{ $t("dispatch") }}
          </v-btn>
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
    newLotData: [],
    isLoading: 0
  },
  data() {
    return {
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
      page: 1,
      loading: 0,
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
          sortable: true,
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
          text: this.$t("expected") + this.$t("start") + this.$t("time"),
          value: "moData.planStartDate",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("expected") + this.$t("completed") + this.$t("time"),
          value: "moData.planEndDate",
          sortable: true,
          width: "10%"
        },

        {
          text: this.$t("action"),
          value: "dispatch",
          align: "center",
          sortable: false,
          width: "5%"
        }
      ]
    };
  },

  methods: {
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
          //  if (this.selectedOpResourceType == "E") {
          //             this.machineList = this.machineData.find(
          //               x => x.resourceNo == this.selectedLotWip.resourceNo
          //             );
          //             //console.log(this.machineList);
          //           } else {
          //             this.lineList = this.lineData.find(
          //               x => x.resourceNo == this.selectedLotWip.resourceNo
          //             );
          //           }
          // this.onOpReourceSelectChange();
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
          this.refreshNewLotOpData();
          this.refreshDispatchLotOpData();
          this.editDialog = false;
        })
        .then(() => {});
    },
    dispath() {
      //console.log(this.lineList);
      const token = this.$store.state.authUser.token;
      let resourceNo = null;
      let resourceName = null;
      if (this.selectedOpResourceType == "E") {
        if (this.machineList == undefined) {
          this.snackbar = true;
          this.snackbarText = "請選擇設備。";
          return;
        }
        resourceNo = this.machineList.resourceNo;
        resourceName = this.machineList.name;
      } else {
        if (this.lineList == undefined || this.lineList.length == 0) {
          this.snackbar = true;
          this.snackbarText = "請選擇生產線。";
          return;
        }

        resourceNo = this.lineList.resourceNo;
        resourceName = this.lineList.name;
      }
      if (this.workShiftList == undefined || this.workShiftList.length == 0) {
        this.snackbar = true;
        this.snackbarText = "請選擇班別";
        return;
      }
      const lotWip = {
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
        isProduction: "N"
      };
      //console.log(lotWip);

      this.$axios
        .post(`/LotWip/Create`, lotWip, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("dispatch") + this.$t("success"), "success");
          } else {
            this.$swal("", res.data.msg, "error");
          }
          this.$emit("update");

          this.dispatchDialog = false;
        })
        .then(() => {});
    },
    showDispatchDialog(item) {
      this.dispatchDialog = true;
      this.selectedLotOp = item;
      this.dispatchDates = this.getDate();
      this.selectedOpResourceType = this.opResourceType[0].value;
      //console.log(this.selectedLotOp);
      this.getOpResource();
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
