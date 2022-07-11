<template>
  <v-flex md12 class="pa-5">
    <v-row no-gutters>
      <v-col cols="11">
        <v-alert
          v-if="lotWipList.length > 0"
          dense
          text
          type="success"
          class="ma-2"
        >
          {{ $t("producted") + " - " + $t("lot") + $t("count") }}：<strong>{{
            lotWipList.length
          }}</strong>
        </v-alert>
        <v-alert v-else dense text type="warning" class="ma-2">
          {{ $t("lot") + $t("count") }}：<strong>{{
            lotWipList.length
          }}</strong>
        </v-alert>
      </v-col>
      <v-col cols="1">
        <v-select
          outlined
          dense
          :label="$t('itemPerPage')"
          v-model="itemsPerPage"
          :items="itemCountList"
          class="mt-2"
        ></v-select>
      </v-col>
    </v-row>

    <v-data-table
      ref="table"
      :headers="headers"
      :items="lotWipList"
      :items-per-page="itemsPerPage"
      :sort-by="[
        'status',
        'lotWipData.dispatchStartDate',
        'lotWipData.scheduleStartTime'
      ]"
      :sort-desc="[true, false, false]"
      class="elevation-1 mytable"
      :loading="isLoading == 1"
      loading-text="Loading... Please wait"
      @page-count="pageCount = $event"
      :page.sync="page"
      hide-default-header
      hide-default-footer
    >
      <template v-slot:item.status="{ item }">
        <v-card
          class=" mt-3 mb-3 rounded-lg font-weight-black"
          elevation="2"
          outlined
        >
          <template>
            <v-progress-linear
              color="success"
              :value="
                (parseFloat(item.lotWipData.outQty) / parseFloat(item.qty)) *
                  100
              "
            ></v-progress-linear>
          </template>
          <!-- <v-system-bar
            v-if="item.status != 'dispatch'"
            :color="getStatusColor(item.status)"
            dark
          >
            <v-icon color="white">mdi-file</v-icon>
            <span v-if="item.status != 'close'">
              {{
                $t(item.status) + " - " + item.lot.lotNo + " - " + item.opName
              }}
            </span>
            <span v-else>
              {{
                $t("projectClose") +
                  " - " +
                  item.lot.lotNo +
                  " - " +
                  item.opName
              }}
            </span>
            <v-spacer></v-spacer>
          </v-system-bar>
          <v-system-bar v-else color="orange darken-1  font-weight-black" dark>
            <v-icon color="white">mdi-file</v-icon>
            <span
              >{{ $t("already")
              }}{{
                $t(item.status) + " - " + item.lot.lotNo + " - " + item.opName
              }}</span
            >
            <v-spacer></v-spacer>
          </v-system-bar> -->

          <div v-show="show" :style="getCardColor(item.moData)">
            <v-row>
              <v-col
                style="text-align:left"
                class="text-h5 font-weight-black"
                cols="2"
              >
                <v-icon
                  class="ml-2 mb-1"
                  size="26"
                  :color="getStatusColor(item.status)"
                  >mdi-circle</v-icon
                >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      v-bind="attrs"
                      v-on="on"
                      @click="
                        redirectToDetail(
                          item.lot.lotNo,
                          item.lotWipData.dispatchStartDate
                        )
                      "
                    >
                      {{ item.lot.lotNo }}
                    </span>
                  </template>
                  {{ "報工" }}
                </v-tooltip>
              </v-col>
              <v-col style="text-align:left" class="text-h7 mt-2 " cols="2">
                {{ $t("itemNo") + " : " + item.moData.itemNo }}
              </v-col>
              <v-col style="text-align:left" class="text-h7 mt-2 " cols="2">
                {{ $t("itemName") + " : " + item.moData.itemName }}
              </v-col>
              <v-col style="text-align:left" class="text-h7 mt-2 " cols="1">
                {{ $t("dispatch") + $t("count") + " : " + item.qty }}
              </v-col>
              <v-col style="text-align:left" class="text-h7 mt-2 " cols="1">
                {{ $t("previousStation") + " : " + getPreviousOp(item) }}
              </v-col>
              <v-col
                style="text-align:left"
                class="text-h7 mt-2 font-weight-black"
                cols="2"
              >
                {{ $t("process") + " : " + item.opName }}
              </v-col>
              <v-col
                style="text-align:left"
                class="text-h7 mt-2 font-weight-black"
                cols="2"
              >
                {{
                  $t("expected") +
                    $t("completed") +
                    $t("date") +
                    " : " +
                    item.moData.planEndDate
                }}
              </v-col>
              <!-- 
              <v-col class="text-h7 mt-3  d-flex flex-row-reverse" cols="5">
                {{ item.opName }}
              </v-col> -->
            </v-row>
            <v-divider></v-divider>
            <v-card-actions style="background-color:#F0F0F0;height:50px">
              <v-row no-gutters>
                <v-col
                  style="text-align:left"
                  class="text-h7 font-weight-black"
                  cols="3"
                >
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        v-bind="attrs"
                        v-on="on"
                        size="16"
                        :color="
                          getMachineStatusColor(item.lotWipData.resourceNo)
                        "
                        >mdi-circle</v-icon
                      >
                    </template>
                    {{
                      $t(
                        "status" + getMachineStatus(item.lotWipData.resourceNo)
                      )
                    }}
                  </v-tooltip>

                  <span
                    style="color:	#0072E3"
                    v-if="item.lotWipData.resourceType == 'E'"
                    >{{
                      $t("equipment") + " " + item.lotWipData.resourceName
                    }}</span
                  >
                  <span style="color:	#0072E3" v-else>{{
                    $t("line") + " " + item.lotWipData.resourceNo
                  }}</span>
                  <span style="color:	#0072E3">
                    {{ " > " + $t("schedule") + $t("start") + $t("time") }}
                  </span>
                  {{ " : " + item.lotWipData.dispatchStartDate + " " }}
                  <span v-if="item.lotWipData.scheduleStartTime != null">
                    {{ item.lotWipData.scheduleStartTime }}</span
                  >
                  {{ " (" + item.lotWipData.shiftName + ")" }}
                </v-col>

                <v-col
                  style="text-align:left"
                  class="text-h7 font-weight-black"
                  cols="2"
                >
                  <span style="color:	#0072E3"
                    >{{ $t("schedule") + $t("end") + $t("time") }}：</span
                  >

                  <span> {{ item.lotWipData.dispatchEndDate + " " }}</span>
                  <span v-if="item.lotWipData.scheduleEndTime != null">
                    {{ item.lotWipData.scheduleEndTime }}
                  </span>
                </v-col>

                <v-col
                  style="text-align:left"
                  class="text-h7 font-weight-black"
                  cols="2"
                >
                  <span style="color:	#0072E3"
                    >{{ $t("in") + $t("time") }}：</span
                  >
                  <span v-if="item.lotWipLogData == undefined">
                    --
                  </span>
                  <span v-else>
                    {{
                      new Date(item.lotWipLogData.logDate)
                        .toISOString()
                        .slice(0, 10) +
                        " " +
                        new Date(
                          item.lotWipLogData.logDate
                        ).toLocaleTimeString()
                    }}</span
                  >
                </v-col>
                <v-col
                  style="text-align:left"
                  class="text-h7 font-weight-black"
                  cols="2"
                >
                  <span style="color:	#0072E3"
                    >{{
                      $t("expected") + $t("outStation") + $t("time")
                    }}：</span
                  >
                  <span v-if="item.lotWipLogData == undefined">
                    --
                  </span>
                  <span v-else>
                    {{
                      getExpectedOutDateTime(
                        new Date(item.lotWipLogData.logDate),
                        item.lotWipData.cycleTime
                      )
                    }}</span
                  >
                </v-col>
                <v-col
                  style="text-align:left"
                  class="text-h7 font-weight-black"
                  cols="1"
                >
                  <span style="color:	#0072E3"
                    >{{ $t("expected") + $t("cycleTime") }}：</span
                  >
                  <span v-if="item.lotWipData.cycleTime == ''">
                    --
                  </span>
                  <span v-else>
                    {{ showItemState(item.lotWipData.cycleTime) }}</span
                  >
                </v-col>
                <v-col
                  style="text-align:center"
                  class="text-h7 font-weight-black"
                  cols="1"
                >
                  <span style="color:	#0072E3">{{ $t("in") }}：</span>
                  <span v-if="item.lotWipData.inQty == null">
                    --
                  </span>
                  <span v-else> {{ item.lotWipData.inQty }}</span>
                </v-col>
                <v-col
                  style="text-align:left"
                  class="text-h7 font-weight-black"
                  cols="1"
                >
                  <span style="color:	#0072E3">{{ $t("outStation") }}：</span>
                  <span v-if="item.lotWipData.outQty == null">
                    --
                  </span>
                  <span v-else> {{ item.lotWipData.outQty }}</span>
                </v-col>
              </v-row>
            </v-card-actions>
          </div>
        </v-card>
      </template>
    </v-data-table>
    <div class="text-center pt-2">
      <v-pagination
        :total-visible="7"
        v-model="page"
        :length="pageCount"
        color="success"
        circle
      ></v-pagination>
    </div>
  </v-flex>
</template>
<script>
import moment from "moment";
import mqtt from "mqtt";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    lotWipData: {},
    lotWipSearchValue: null,
    startDate: null,
    endDate: null,
    isLoading: null,

    status: null
  },
  data() {
    return {
      itemCountList: [5, 6, 7, 8, 9, 10],
      timerId: null,
      timerId1: null,
      mqttData: {},
      mqttClient: {},
      machineData: [],
      closeDialog: false,
      opActionData: [],
      isActionLoading: 0,
      produceActionDialog: false,
      pauseDialog: false,
      reasonList: [],
      isNGCheck: false,
      outDialog: false,
      selectedItem: {},
      maxInCount: null,
      userData: [],
      inDialog: false,
      selection: 1,
      show: true,
      isActionDescending: true,
      isDescending: true,
      lotWipList: {},
      ItemSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      ItemName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 6,
      actionList: [],
      actionLogList: [],
      inForm: {
        lotOpNo: null,
        opName: null,
        planQty: null,
        inQty: null,
        qty: null,
        user: {},
        desc: null
      },
      outForm: {
        lotOpNo: null,
        opName: null,
        planQty: null,
        outQty: null,
        qty: null,
        user: {},
        desc: null,
        hasNG: null,
        QCReason: null,
        NGCount: null
      },
      produceActionForm: {
        lotOpNo: null,
        opName: null,
        actionData: []
      },
      deletelotWipData: {
        no: null,
        name: null,
        id: null
      },
      opActionHeaders: [
        {
          text: this.$t("sequence"),
          value: "actionSequence",
          align: "center",

          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("action") + this.$t("name"),
          value: "actionName",
          align: "left",

          sortable: false,
          width: "10%"
        },
        ,
        {
          text: this.$t("action") + this.$t("startTime"),
          value: "startTime",
          align: "left",

          sortable: false,
          width: "10%"
        },
        ,
        {
          text: this.$t("action") + this.$t("finishTime"),
          value: "finishTime",
          align: "left",

          sortable: false,
          width: "10%"
        }
      ],
      headers: [
        {
          text: this.$t("lot"),
          value: "status",
          align: "center",

          sortable: true,
          width: "100%"
        }
      ]
    };
  },

  watch: {
    lotWipData() {
      // console.log(this.lotWipData);
      this.lotWipList = this.lotWipData;
    }
  },
  methods: {
    getCardColor(moData) {
      let style = "background:transparent";
      if (moData.urgent == "Y") {
        style = "background:#FFE1E1";
      }
      return style;
    },
    redirectToDetail(lotNo, date) {
      this.$router.push(`/jobReport/jobReport/${lotNo}?date=${date}`);
    },
    getExpectedOutDateTime(startDateTime, cycleTime) {
      if (cycleTime != "") {
        var start = new Date(startDateTime);

        var endDateTime = new Date();
        endDateTime = new Date(start.getTime() + parseFloat(cycleTime) * 1000);
        // console.log(endDateTime);
        return (
          endDateTime.toISOString().slice(0, 10) +
          " " +
          endDateTime.toLocaleTimeString()
        );
      } else {
        return "--";
      }
    },
    showItemState(cycleTime) {
      // console.log(cycleTime);
      let result = null;
      if (cycleTime != "" && cycleTime != undefined) {
        result = new Date(cycleTime * 1000).toISOString().substr(11, 8);
      }
      return result;
    },
    onCloseClick(item) {
      this.selectedItem = item;
      this.closeDialog = true;
    },
    getActionTime(item, type) {
      let time = null;
      //console.log(this.actionLogList);
      if (this.actionLogList.length > 0) {
        var data = this.actionLogList.find(
          x => x.logType == type && x.actionNo == item.actionNo
        );
        if (data != undefined) {
          time = new Date(data.logDate).toLocaleString();
        }
      }
      return time;
    },
    getActionLog() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(`/LotWipLog/Search?lotOpId=${this.selectedItem.id}&type=ACTION`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.actionLogList = res.data.data != null ? res.data.data : [];
        });
    },
    getActionName(item) {
      let actionName;

      if (this.actionList.length > 0) {
        actionName = this.actionList.find(x => x.actionNo == item.actionNo)
          .actionName;
      }
      return actionName;
    },
    getActionList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Action/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.actionList = res.data.data != null ? res.data.data : [];
        });
    },
    onProduceActionClick(item) {
      this.produceActionForm.lotOpNo = item.lot.lotNo;
      this.produceActionForm.opName = item.opName;
      this.selectedItem = item;
      this.opActionData = item.opActionData;
      this.getActionList();
      this.getActionLog();
      this.produceActionDialog = true;
    },
    onIsNGCheckChange() {
      if (this.isNGCheck == true) {
        const token = this.$store.state.authUser.token;
        this.$axios
          .get(`/Reason/Search?type=QC`, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            //console.log(res.data.data);
            this.reasonList = res.data.data != null ? res.data.data : [];
            if (this.reasonList.length > 0) {
              this.outForm.QCReason = this.reasonList[0];
            }
          });
      } else {
        this.reasonList = [];
      }
    },
    inReport() {
      if (this.inForm.qty == 0) {
        return;
      }
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.inForm.user.account,
        userName: this.inForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "IN",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.inForm.qty.toString(),
        wipDesc: this.inForm.desc,
        remark: null
      };
      this.inForm.desc = "";

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("in") + this.$t("success"), "success");
            this.refreshlotWipData();
            this.inDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.inDialog = false;
          }
        })
        .then(() => {});
    },
    onInClick(item) {
      this.getUserData();
      let outQty = 0;
      let inQty = 0;
      this.selectedItem = item;
      this.inForm.lotOpNo = item.lot.lotNo;
      this.inForm.opName = item.opName;
      if (item.lotWipData.inQty == null) {
        inQty = 0;
        this.inForm.inQty = 0;
      } else {
        inQty = item.lotWipData.inQty;
        this.inForm.inQty = item.lotWipData.inQty;
      }

      this.inForm.planQty = item.lotWipData.planQty;

      this.inForm.qty = parseFloat(item.lotWipData.planQty) - inQty;
      this.maxInCount = parseFloat(item.lotWipData.planQty) - inQty;
      this.inDialog = true;
    },
    onOutClick(item) {
      this.getUserData();
      let outQty = 0;
      let inQty = 0;
      this.selectedItem = item;
      this.outForm.lotOpNo = item.lot.lotNo;
      this.outForm.opName = item.opName;
      // 計算進站量
      if (item.lotWipData.inQty == null) {
        inQty = 0;
      } else {
        inQty = item.lotWipData.inQty;
      }
      // 計算出站量
      if (item.lotWipData.outQty == null) {
        outQty = 0;
        this.outForm.outQty = 0;
      } else {
        outQty = item.lotWipData.outQty;
        this.outForm.outQty = item.lotWipData.outQty;
      }

      this.outForm.planQty = item.lotWipData.planQty;

      this.outForm.qty = inQty - outQty;
      this.maxInCount = inQty - outQty;
      this.outDialog = true;
    },
    onPauseClick(item) {
      this.getUserData();
      let outQty = 0;
      let inQty = 0;
      this.selectedItem = item;
      this.outForm.lotOpNo = item.lot.lotNo;
      this.outForm.opName = item.opName;
      // 計算進站量
      if (item.lotWipData.inQty == null) {
        inQty = 0;
      } else {
        inQty = item.lotWipData.inQty;
      }
      // 計算出站量
      if (item.lotWipData.outQty == null) {
        outQty = 0;
        this.outForm.outQty = 0;
      } else {
        outQty = item.lotWipData.outQty;
        this.outForm.outQty = item.lotWipData.outQty;
      }

      this.outForm.planQty = item.lotWipData.planQty;

      this.outForm.qty = inQty - outQty;
      this.maxInCount = inQty - outQty;
      this.pauseDialog = true;
    },
    onActionCheck(item, type) {
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: type,
        actionNo: item.actionNo,
        logUserId: this.$store.state.authUser.id,
        qty: this.selectedItem.lotWipLogData.qty,
        wipDesc: null,
        remark: null
      };

      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("jobReport") + this.$t("success"),
              "success"
            );
            this.produceActionDialog = false;
            this.refreshlotWipData();
          } else {
            this.$swal("", res.data.msg, "error");
            this.produceActionDialog = false;
          }
        })
        .then(() => {});
    },
    outReport() {
      if (this.outForm.qty == 0) {
        return;
      }
      if (
        this.isNGCheck == true &&
        (this.outForm.NGCount == 0 || this.outForm.NGCount == null)
      ) {
        return;
      }
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.outForm.user.account,
        userName: this.outForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "OUT",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.outForm.qty.toString(),
        wipDesc: this.outForm.desc,
        remark: null
      };
      this.outForm.desc = "";
      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            lotWipLogId = res.data.id;
            if (lotWipLogId != null && this.isNGCheck == true) {
              this.NgReport(lotWipLogId);
            }
            this.$swal(
              "",
              this.$t("outStation") + this.$t("success"),
              "success"
            );
            this.refreshlotWipData();
            this.outDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.outDialog = false;
          }
        })
        .then(() => {});
    },
    pauseReport() {
      if (
        this.isNGCheck == true &&
        (this.outForm.NGCount == 0 || this.outForm.NGCount == null)
      ) {
        return;
      }
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.outForm.user.account,
        userName: this.outForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "PAUSE",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.outForm.qty.toString(),
        wipDesc: this.outForm.desc,
        remark: null
      };
      this.outForm.desc = "";
      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            lotWipLogId = res.data.id;
            if (lotWipLogId != null && this.isNGCheck == true) {
              this.NgReport(lotWipLogId);
            }
            this.$swal("", this.$t("pause") + this.$t("success"), "success");
            this.refreshlotWipData();
            this.pauseDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.pauseDialog = false;
          }
        })
        .then(() => {});
    },
    cancelPauseReport(item) {
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: item.moData.id,
        lotId: item.lot.id,
        lotOpId: item.id,
        resourceType: item.lotWipData.resourceType,
        resourceNo: item.lotWipData.resourceNo,
        resourceName: item.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: item.workShiftData[0][0].shiftNo,
        shiftName: item.workShiftData[0][0].shiftName,
        dispatchStartDate: item.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "CANCEL_PAUSE",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: null,
        wipDesc: null,
        remark: null
      };

      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("cancel") + this.$t("pause") + this.$t("success"),
              "success"
            );
            this.refreshlotWipData();
          } else {
            this.$swal("", res.data.msg, "error");
          }
        })
        .then(() => {});
    },
    closeReport() {
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "CLOSE",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: null,
        wipDesc: null,
        remark: null
      };

      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("projectClose") + this.$t("success"),
              "success"
            );
            this.closeDialog = false;
            this.refreshlotWipData();
          } else {
            this.$swal("", res.data.msg, "error");
            this.closeDialog = false;
          }
        })
        .then(() => {});
    },
    NgReport(lotWipLogId) {
      const token = this.$store.state.authUser.token;
      const prodNg = {
        lotWipLogId: lotWipLogId,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.outForm.user.account,
        userName: this.outForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logUserId: this.outForm.user.id,
        logUserName: this.outForm.user.name,
        dataSrc: "OUT",
        qcType: "4",
        ngQty: this.outForm.NGCount.toString(),
        reasonNo: this.outForm.QCReason.reasonNo,
        reasonName: this.outForm.QCReason.reasonName,
        status: "Y"
      };
      //  console.log(prodNg);

      // 寫入不良品日誌

      this.$axios
        .post(`/ProdNg/create`, prodNg, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
          } else {
          }
        })
        .then(() => {});
    },
    getStatusColor(status) {
      let color = "";

      switch (status) {
        case "new":
          color = "grey   font-weight-black";
          break;
        case "createlot":
          color = "grey darken-1  font-weight-black";
          break;
        case "dispatch":
          color = "orange darken-1  font-weight-black";
          break;
        case "producted":
          color = "green accent-4  font-weight-black";
          break;
        case "pause":
          color = "red darken-1  font-weight-black";
          break;
        case "complete":
          color = "light-blue accent-4  font-weight-black";
          break;
        default:
          color = "blue-grey darken-3  font-weight-black";
          break;
      }
      //console.log(color);
      return color;
    },
    edit(item) {
      // console.log(item);
      this.editDialog = true;
      this.inForm.no = item.itemNo;
      this.inForm.name = item.itemName;
      this.inForm.spec = item.itemSpec;
      this.inForm.desc = item.description;
      this.inForm.qty = item.stdLotQty;
      //this.editedIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
    },
    editItem() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });

      const token = this.$store.state.authUser.token;
      const Item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.inForm.no,
        itemName: this.inForm.name,
        itemSpec: this.inForm.spec,
        description: this.inForm.desc,
        itemType: "1",
        stdLotQty: this.inForm.qty,
        status: "Y"
      };
      this.inForm.no = "";
      this.inForm.name = "";
      this.inForm.spec = "";
      this.inForm.desc = "";
      this.inForm.qty = "";

      this.$axios
        .post(`/Item/update`, Item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(Item.name, this.$t("editSuccess"), "success");
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(self.name, this.$t("editFailed"), "error");
          }
          this.refreshlotWipData();
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteItem() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;

      //console.log(Item);
      this.deletelotWipData.no = "";
      this.deletelotWipData.name = "";

      this.$axios
        .delete(`/Item/delete/${this.deletelotWipData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              this.deletelotWipData.no,
              this.$t("deleteSuccess"),
              "success"
            );
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(self.name, this.$t("deleteFailed"), "error");
          }
          this.refreshlotWipData();
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshlotWipData() {
      this.isLoading = 1;
      this.lotWipList = [];
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(
          `/LotOp/Search?value=${this.lotWipSearchValue}&status=${this.status}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          //console.log(res.data.data);
          this.lotWipList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    getUserData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/User/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.userData = res.data.data != null ? res.data.data : [];
          //console.log(this.$store.state.authUser);
          this.inForm.user = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
          this.outForm.user = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deletelotWipData.no = item.ItemNo;
      this.deletelotWipData.name = item.ItemName;
      this.deletelotWipData.id = item.id;
    },
    getPreviousOp(item) {
      let opName = "--";
      let lotOpData = item.lotOpData;

      for (let i = 0; i < lotOpData.length; i++) {
        if (parseFloat(lotOpData[i].opSequence) < parseFloat(item.opSequence)) {
          opName = lotOpData[i].opName;
          break;
        }
      }
      return opName;
    },
    getPreviousOpStatus(item) {
      let lotOpData = item.lotOpData;
      let status = true;
      // 搜尋該生產批下的製程內容
      for (let i = 0; i < lotOpData.length; i++) {
        // 若製程順序小於當前生產批製程順序則進入
        if (parseFloat(lotOpData[i].opSequence) < parseFloat(item.opSequence)) {
          //若前一筆製程的狀態等於"complete"或"close"
          if (
            lotOpData[i].status == "complete" ||
            lotOpData[i].status == "close"
          ) {
            //console.log(lotOpData[i]);
            //則回覆啟用按鈕
            status = false;
            return status;
          } else {
            //若前一筆製程的狀態不等於"complete"或"close", 則回覆禁止啟用按鈕
            status = true;
            return status;
          }
        }
      }
      //若當前製程序為最高的,則回覆啟用按鈕
      status = false;
      return status;
    },
    checkCount(item) {
      let lotWipData = item.lotWipData;
      let status = false;
      if (parseFloat(lotWipData.inQty) >= parseFloat(lotWipData.planQty)) {
        status = true;
      }

      return status;
    },
    checkEquip(item) {
      let resourceType = item.lotWipData.resourceType;
      let resourceNo = item.lotWipData.resourceNo;
      let resourceName = item.lotWipData.resourceName;
      //console.log(item);
      if (item.machineLotWipData != null) {
        if (
          item.machineLotWipData.find(
            x =>
              x.resourceType == resourceType &&
              x.resourceNo == resourceNo &&
              x.resourceName == resourceName
          ) != undefined
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    getMachineStatus(machineNo) {
      let status = "7";

      var machineData = this.machineData.find(x => x.machineNo === machineNo);
      if (machineData != null) {
        //console.log(machineData.Data.Status);
        status = machineData.data.status;
      }
      return status;
    },
    getMachineStatusColor(machineNo) {
      let status = "7";
      let color = "black";
      var machineData = this.machineData.find(x => x.machineNo === machineNo);
      if (machineData != null) {
        //console.log(machineData.Data.Status);
        status = machineData.data.status;
      }
      switch (status) {
        case "1":
          color = "#01B468";
          break;
        case "5":
          color = "#FFBB77";
          break;
        case "7":
          color = "black";
          break;
        case "2":
          color = "red";
          break;
      }
      return color;
    },
    uuid() {
      var d = Date.now();
      if (
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
      ) {
        d += performance.now(); //use high-precision timer if available
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
    },
    mqttMSG() {
      const options = {
        connectTimeout: 40000,
        clientId: this.uuid(),
        clean: true
      };

      // mqtt连接
      if (!this.mqttClient.connted) {
        this.mqttClient = mqtt.connect(setting.mqtt.url, options);
        this.mqttClient.on("connect", e => {
          console.log("连接成功:");
          this.mqttClient.subscribe(
            `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
            { qos: 0 },
            error => {
              if (!error) {
                console.log("订阅成功");
              } else {
                console.log("订阅失败");
              }
            }
          );
        });
        // 接收消息处理
        this.mqttClient.on("message", (topic, message) => {
          //    console.log(message.toString());
          const mqttData = JSON.parse(message.toString());

          let pos = this.machineData
            .map(x => x.machineNo)
            .indexOf(mqttData.machineNo);
          if (pos == -1) {
            this.machineData.push(mqttData);
          } else {
            this.machineData.splice(pos, 1);
            this.machineData.push(mqttData);
          }

          let statusString = "";
          let colorString = "";
          let yValue = null;
          this.dataPoints = [];

          // yValue = this.machineData.filter(x => x.Data.Status === "1");

          //  console.log(this.machineData.filter(x => x.machineNo === "CNC01"));
          //  console.log(this.dataPoints);
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          console.log("连接失败:", error);
        });
      }
    },
    updateData() {
      if (this.timerId != null) {
        this.$emit("update");
      }

      this.timerId = setTimeout(this.updateData, 10000);
    },
    updatePage() {
      if (this.timerId1 != null) {
        if (this.page < this.pageCount) {
          this.page++;
        } else {
          this.page = 1;
        }
      }

      this.timerId1 = setTimeout(this.updatePage, 10000);
    }
  },
  beforeDestroy() {
    clearTimeout(this.timerId);
    clearTimeout(this.timerId1);
    //斷線
    if (this.mqttClient.connected) {
      this.mqttClient.unsubscribe(
        `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
        error => {
          console.log("取消訂閱");
          if (error) {
            console.log("Unsubscribe error", error);
          }
        }
      );
      this.mqttClient.end();
      this.mqttClient = {
        connected: false
      };
    }
  },
  deactivated() {
    clearTimeout(this.timerId);
    clearTimeout(this.timerId1);
    //斷線
    if (this.mqttClient.connected) {
      this.mqttClient.unsubscribe(
        `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
        error => {
          console.log("取消訂閱");
          if (error) {
            console.log("Unsubscribe error", error);
          }
        }
      );
      this.mqttClient.end();
      this.mqttClient = {
        connected: false
      };
    }
  },
  activated() {
    clearTimeout(this.timerId);
    clearTimeout(this.timerId1);
    this.lotWipList = this.lotWipData;
    this.mqttMSG();
    this.updateData();
    this.updatePage();
  },
  mounted() {
    //this.updatePage();
  },
  computed: {},
  created() {
    clearTimeout(this.timerId);
    clearTimeout(this.timerId1);
    this.lotWipList = this.lotWipData;
    this.mqttMSG();
    this.updateData();

    //console.log(this.status);
  }
};
</script>
<style>
.mytable table tr {
  /* background-color: rgb(235, 235, 235); */
}
</style>
