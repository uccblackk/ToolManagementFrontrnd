<template>
  <v-layout row wrap width="100%">
    <v-flex md12>
      <!-- loading視窗 -->
      <v-dialog v-model="loadingDialog" hide-overlay persistent width="300">
        <v-card color="success" dark>
          <v-card-text>
            {{ "MCS投產中..." }}
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-card>
        <v-tabs v-model="tab" background-color="primary" dark>
          <v-tab :key="newLot">{{ $t("notDispatch") }}</v-tab>
          <v-tab :key="dispatched">{{ $t("dispatched") }}</v-tab>
          <v-tab :key="production">{{
            $t("already") + $t("production")
          }}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" class="pa-2">
          <v-tab-item :key="newLot">
            <v-card flat>
              <v-flex xs12 class="mx-1">
                <v-row>
                  <v-col cols="12" md="3">
                    <v-menu
                      ref="menu"
                      v-model="menu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          @click:clear="onClearClicked()"
                          v-model="dateRangeText"
                          :label="$t('select') + $t('date') + $t('range')"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        :events="arrayEvents"
                        ref="picker"
                        v-model="dates"
                        :min="min"
                        range
                      >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="menu = false">
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="onCalendarSelected()"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-form onSubmit="return false;">
                      <v-text-field
                        clearable
                        v-model="NewLotSearchValue"
                        :label="this.$t('lot') + this.$t('search')"
                        append-icon="mdi-magnify"
                        required
                        @click:append="onNewLotOpSearch"
                        @keyup.enter="onNewLotOpSearch()"
                      ></v-text-field>
                    </v-form>
                  </v-col>
                  <v-col cols="12" md="2">
                    <v-btn disabled class="primary" @click="autoDispatch()">{{
                      $t("auto") + $t("dispatch")
                    }}</v-btn>
                  </v-col>
                  <v-col cols="12" md="12">
                    <NewLotTable
                      :newLotData="noDispatchLotOpData"
                      :isLoading="isLoading"
                      @update="update"
                    />
                  </v-col>
                </v-row>
              </v-flex>
            </v-card>
          </v-tab-item>

          <v-tab-item :key="dispatched">
            <v-card flat>
              <v-flex xs12 class="mx-1">
                <v-row>
                  <v-col cols="12" md="3">
                    <v-menu
                      ref="menu1"
                      v-model="menu1"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          @click:clear="onDispatchedClearClicked()"
                          v-model="dispatchedDateRangeText"
                          :label="$t('select') + $t('date') + $t('range')"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        :events="lotWipEvents"
                        ref="picker"
                        v-model="dispatchedDates"
                        range
                      >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="menu1 = false">
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="onDispatchedCalendarSelected()"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-form onSubmit="return false;">
                      <v-text-field
                        clearable
                        v-model="dispatchedLotSearchValue"
                        :label="this.$t('lot') + this.$t('search')"
                        append-icon="mdi-magnify"
                        required
                        @click:append="onDispatchedLotOpSearch"
                        @keyup.enter="onDispatchedLotOpSearch()"
                      ></v-text-field>
                    </v-form>
                  </v-col>
                  <v-spacer />
                  <v-col v-if="MCS == 'ON'" cols="12" md="2">
                    <div style="text-align:right">
                      <v-btn
                        @click="onProductionBtnClick_V1()"
                        class="success"
                        :disabled="dispatchLotOpData.length == 0"
                        ><v-icon left dark> mdi-chevron-right-box </v-icon
                        >{{ "MCS" + $t("production") }}</v-btn
                      >
                    </div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="12">
                    <DispatchedLotTable
                      :dispatchLotData="dispatchLotOpData"
                      :isLoading="isDispatchedLoading"
                      @update="update"
                    />
                  </v-col>
                </v-row>
              </v-flex>
            </v-card>
          </v-tab-item>
          <v-tab-item :key="production">
            <v-card flat>
              <v-flex xs12 class="mx-1">
                <v-row>
                  <v-col cols="12" md="3">
                    <v-menu
                      ref="productionMenu"
                      v-model="productionMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          @click:clear="onProductionClearClicked()"
                          v-model="productionDateRangeText"
                          :label="$t('select') + $t('date') + $t('range')"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        :events="productionLotWipEvents"
                        ref="picker"
                        v-model="productionDates"
                        range
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="primary"
                          @click="productionMenu = false"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="onProductionCalendarSelected()"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-form onSubmit="return false;">
                      <v-text-field
                        clearable
                        v-model="productionLotSearchValue"
                        :label="this.$t('lot') + this.$t('search')"
                        append-icon="mdi-magnify"
                        required
                        @click:append="onProductionLotOpSearch"
                        @keyup.enter="onProductionLotOpSearch()"
                      ></v-text-field>
                    </v-form>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="12">
                    <ProductionLotTable
                      :productionLotOpData="productionLotOpData"
                      :isLoading="isProductionLoading"
                      @update="update"
                    />
                  </v-col>
                </v-row>
              </v-flex>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
      <v-snackbar v-model="snackbar">
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
      <v-overlay :value="overlay">
        <!-- <v-progress-circular indeterminate size="64"></v-progress-circular> -->
      </v-overlay>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
var order = require("@/static/scripts/mes/order/order.js");
import NewLotTable from "~/components/order/NewLotTable.vue";
import DispatchedLotTable from "~/components/order/DispatchedLotTable.vue";
import ProductionLotTable from "~/components/order/ProductionLotTable.vue";
export default {
  components: {
    NewLotTable,
    DispatchedLotTable,
    ProductionLotTable
  },
  middleware: "auth",
  data() {
    return {
      productionLotSearchValue: "",
      productionMenu: false,
      productionLotOpData: [],
      isProductionLoading: 0,
      production: null,
      loadingDialog: false,
      version: null,
      MCS: null,
      productionLotWipEvents: [],
      lotWipEvents: [],
      arrayEvents: [],
      machine: [],
      snackbarText: "",
      snackbar: false,
      editDialog: false,
      dispatchLotOpData: [],
      workShiftData: [],
      workShiftList: {},
      Valid: true,
      machineData: [],
      updateMachineData: [],
      updateLineData: [],
      lineData: [],
      machineList: [],
      lineList: [],
      opResourceType: [
        { name: this.$t("equipment"), value: "E" },
        { name: this.$t("line"), value: "L" }
      ],
      selectedOpResourceType: { name: null, value: null },
      ResourceList: [],
      Resource: [],
      dispatchDates: new Date().toISOString().substr(0, 10),
      dispatchMenu: false,
      dispatchDate: null,

      DateRangeText: null,

      dispatchDialog: false,
      selectedLotOp: [],
      noDispatchLotOpList: [],
      isDispatchedLoading: 1,
      dispatchedDates: [],
      dispatchedLotSearchValue: null,
      isLoading: 1,
      overlay: true,
      menu: false,
      menu1: false,
      productionDateRangeText: null,
      productionDates: [],
      dateRangeText: null,
      dispatchedDateRangeText: null,
      dispatched: null,
      newLot: null,
      noDispatchLotOpData: [],
      tab: null,
      SearchValue: null,
      statusCheckedList: [],
      statusLabel: [
        { name: this.$t("new"), value: "new" },
        { name: this.$t("dispatch"), value: "dispatch" },
        { name: this.$t("producted"), value: "producted" },
        { name: this.$t("complete"), value: "complete" },
        { name: this.$t("projectClose"), value: "projectClose" }
      ],
      valid: true,
      noRules: [v => !!v || this.$t("mustInput")],
      itemList: [],
      dates: [],
      newLotStartDate: null,
      newLotEndDate: null,
      dispatchedLotStartDate: null,
      dispatchedLotEndDate: null,
      productionLotEndDate: null,
      productionLotStartDate: null,
      min: null,
      menu: false,
      menu2: false,
      overlay: true,
      menu3: false,
      formHasErrors: false,
      errorMessages: "",
      NewLotSearchValue: "",
      itemsPerPage: 10,
      dispatchPageCount: 0,
      dispatchPage: 1,
      deleteItemData: {},
      page: 1,
      pageCount: 0,
      moData: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addMoForm: {
        moNo: null,
        itemNo: null,
        newLotStartDate: new Date().toISOString().substr(0, 10),
        newLotEndDate: null,
        count: null,
        urgent: null,
        remark: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      exceptionReasonList: [],
      exceptionActionList: [],
      cancelDispatchDialog: false,
      dateRangeText: null,
      selectedLotWip: [],
      min: null
    };
  },
  computed: {
    form() {
      return {
        areaNo: this.areaNo,
        areaName: this.areaName
      };
    }

    // dateRangeText: function() {
    //   if (this.dates.length > 1) {
    //     this.min = this.dates[0];
    //     return this.dates.join(" ~ ");
    //   }
    // }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(
        x => x.menu_no == "dispatchManagement"
      ) == undefined
    ) {
      console.log(store.state.authUser.authority);
      error({ statusCode: 404, message: "noPermission" });
    }
    let date = new Date().toISOString().substr(0, 10);
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substr(0, 10);
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    ).toISOString();
    //   .substr(0, 10);
    // let noDispatchResponse = await app.$axios.$get(
    //   `/LotOp/Search?status=new&startDate=${firstday}&endDate=${lastday}`,
    //   {
    //     headers: {
    //       Authorization: token
    //     }
    //   }
    // );
    // let DispatchResponse = await app.$axios.$get(
    //   `/LotOp/Search?status=dispatch&startDate=${firstday}&endDate=${lastday}`,
    //   {
    //     headers: {
    //       Authorization: token
    //     }
    //   }
    // );
    return {
      // noDispatchLotOpData: noDispatchResponse.data,
      // dispatchLotOpData: DispatchResponse.data,
      overlay: false,
      isLoading: 0,
      isDispatchedLoading: 0
    };
  },
  watch: {
    onCalendarSelected() {
      if (this.dates.length >= 1) {
        this.dateRangeText = this.dates[0];
      }
      this.menu = false;
    }
  },
  methods: {
    update() {
      this.onNewLotOpSearch();
      this.onDispatchedLotOpSearch();
      // this.onProductionLotOpSearch();
      this.getTotalMoData();
    },
    getDate() {
      var date = new Date();
      // date.setDate(date.getDate() + 0);

      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);

      // console.log(date.toISOString());
      return date.toISOString().substr(0, 10);
    },
    itemRowBackground: function(item) {
      //console.log(item);
      return item.moData.urgent == "Y" ? "red lighten-5" : "";
    },
    //職訓局
    onProductionBtnClick() {
      //整理當前搜尋lot_wip內的IsProduction值為"N"的資料
      this.loadingDialog = true;
      this.overlay = true;
      let data = this.dispatchLotOpData.filter(
        x => x.lotWipData.isProduction == "N"
      );
      let url = setting.MCSSetting.url;
      let lotOpIdList = [];
      let MCSLot = [];
      let id = 0;
      data.forEach(e => {
        lotOpIdList.push(e.id);
        MCSLot.push({
          id: id,
          BatchNumber: e.lot.lotNo,
          WorksheetNumber: e.moData.moNo,
          ObjectNumber: e.moData.itemNo,
          OperationNumber: e.opNo,
          TargetMachine: e.lotWipData.resourceNo,
          dispatchStartDate: e.lotWipData.dispatchStartDate,
          scheduleStartTime: e.lotWipData.scheduleStartTime,
          Priority: e.moData.urgent,
          Amount: parseFloat(e.qty),
          SetupUser: this.$store.state.authUser.name
        });
        id++;
      });
      //console.log(MCSLot);

      //return;
      //1. 呼叫MCS的API(若MCS的url有填寫則呼叫MCS)
      if (url != null && url != undefined) {
        console.log(MCSLot);
        if (MCSLot.length == 0) {
          this.loadingDialog = false;
          this.overlay = false;
          this.snackbar = true;
          this.snackbarText =
            "無資料進行投產，請確認當前頁面有資料或皆已投產。";
          return;
        }
        const token = this.$store.state.authUser.token;

        this.$axios
          .post(url + "MCS/Production/FromMES/InsertBatch", MCSLot, {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          })
          .then(res => {
            console.log(res.data);
            if (res.data.isSuccess) {
              // this.$swal(
              //   "請停留在此頁面，等待更新結果顯示。",
              //   res.data.msg,
              //   "success"
              // );
              let errorList = res.data.errorList;

              if (errorList != null && errorList != undefined) {
                //若異常清單不為空,則進入檢查異常的生產批
                let updateData = [];
                //搜尋所有頁面上選擇投產的生產批資料
                for (let i = 0; i < lotOpIdList.length; i++) {
                  //確認是否有包含在投產異常的清單內
                  if (!errorList.includes(i)) {
                    //確認不在清單內,才加入要更新的資料內
                    updateData.push(lotOpIdList[i]);
                  }
                }
                //更新不在異常清單內的生產批資料為"已投產"
                console.log("更新不在異常清單內的生產批資料為'已投產'");
                this.updateProductionLotWip(
                  updateData,
                  "部分生產批無法投產。\r\n" + res.data.msg,
                  "warning"
                );
              } else {
                //若沒有異常清單資料,則全部更新為已投產
                console.log("若沒有異常清單資料,則全部更新為已投產");
                this.updateProductionLotWip(
                  lotOpIdList,
                  "生產批成功投產。\r\n" + res.data.msg,
                  "success"
                );
              }
            } else {
              this.$swal("", res.data.msg, "error");
            }
          })
          .catch(({ response }) => {
            this.loadingDialog = false;
            this.overlay = false;
            this.snackbar = true;
            this.snackbarText = "MCS伺服器異常，無法投產。";
            // console.log("fail");
            // console.log(response);
          });
      } else {
        //2.若沒有填寫url,則直接莫認為都可以投產加工
        //若沒有呼叫MCS的URL,則直接更新為已投產
        console.log("若沒有填寫url,則直接默認為都可以投產加工");
        this.updateProductionLotWip(lotOpIdList, null, "success");
      }
      // 若成功投產,則更新lot_wip內的IsProduction值為"Y"
    },
    //for order.js(永進)
    async onProductionBtnClick_V1() {
      //整理當前搜尋lot_wip內的IsProduction值為"N"的資料
      this.loadingDialog = true;
      this.overlay = true;
      let data = this.dispatchLotOpData.filter(
        x => x.lotWipData.isProduction == "N"
      );
      let url = setting.MCSSetting.url;
      let lotOpIdList = [];
      let MCSLot = [];
      let id = 0;
      let res = await order.Dispatch_V1(data, this.$store.state.authUser);
      console.log(res);
      //return;
      //1. 呼叫MCS的API(若MCS的url有填寫則呼叫MCS)
      this.loadingDialog = false;
      this.overlay = false;
      if (res.success == false) {
        this.snackbar = true;
        this.snackbarText = res.msg;
        return;
      }
      if (res.success == true) {
        this.$swal("", res.msg, res.type);
      }
      this.onDispatchedLotOpSearch();
      this.onProductionLotOpSearch();
    },
    updateProductionLotWip(lotOpIdList, msg, type) {
      //lotOpIdList為待更新"已投產"的生產批id清單
      const token = this.$store.state.authUser.token;

      this.$axios
        .post(
          `/LotWip/UpdateProductionTag?tag=Y&userName=${this.$store.state.authUser.name}`,
          lotOpIdList,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.loadingDialog = false;
          this.overlay = false;
          this.onDispatchedLotOpSearch();
          this.onProductionLotOpSearch();
          if (res.data.isSuccess) {
            if (msg == null) {
              this.$swal("", res.data.msg, type);
            } else {
              let msgArr = msg.split(";");
              const pattern = /,/g;
              //console.log(msgArr[0].replace(pattern, "\n\r"));
              this.$swal(msgArr[0].replace(pattern, "\n\r"), msgArr[1], type);
            }
          } else {
            i;
            this.$swal("", res.data.msg, "error");
          }
        })
        .then(() => {});
    },

    refreshDispatchLotOpData() {
      this.isDispatchedLoading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(
          `/LotOp/SearchDispatchLotOp?value=${this.dispatchedLotSearchValue}&status=dispatch&startDate=${this.dispatchedLotStartDate}&endDate=${this.dispatchedLotEndDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          var data = res.data.data;
          var datalist = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i].lotWipData.inQty == null) {
              datalist.push(data[i]);
            }
          }

          this.dispatchLotOpData = datalist;
          // this.dispatchLotOpData = res.data.data != null ? res.data.data : [];

          this.isDispatchedLoading = 0;
        });
    },

    getMachineData() {
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(`/Machine/Search?value`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machine = res.data.data != null ? res.data.data : [];
        });
    },
    autoDispatch() {
      let randomItemIndex = Math.floor(Math.random() * this.machine.length);
      this.noDispatchLotOpData.forEach(data => {
        randomItemIndex = Math.floor(Math.random() * this.machine.length);
        //console.log(this.machine[randomItemIndex].name);
        const token = this.$store.state.authUser.token;
        let resourceNo = null;
        let resourceName = null;

        const lotWip = {
          lotOpId: data.id,
          resourceType: "E",
          resourceNo: this.machine[randomItemIndex].no,
          resourceName: this.machine[randomItemIndex].name,
          userNo: this.$store.state.authUser.account,
          userName: this.$store.state.authUser.name,
          shiftNo: "SF01",
          shiftName: "日班",
          dispatchStartDate: this.getDate(),
          dispatchEndDate: this.getDate(),
          status: "dispatch",
          statusDate: this.getDateTime(),
          cycleTime: null,
          planQty: data.qty,
          inQty: null,
          outQty: null,
          ngQty: null,
          inTime: null,
          actualStartTime: null,
          actualEndTime: null
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
            } else {
            }
          })
          .then(() => {});
      });
      this.refreshNewLotOpData();
      this.refreshDispatchLotOpData();
    },

    refreshNewLotOpData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/LotOp/SearchNewLotOp?value=${this.NewLotSearchValue}&status=new&startDate=${this.newLotStartDate}&endDate=${this.newLotEndDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.noDispatchLotOpData = res.data.data != null ? res.data.data : [];

          this.isLoading = 0;
        });
    },

    getDateTime() {
      var date = new Date();
      // date.setDate(date.getDate() + 0);

      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);

      // console.log(date.toISOString());
      return date;
    },

    onClearClicked() {
      this.dates = [];
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
    onProductionCalendarSelected() {
      if (this.productionDates.length > 1) {
        if (this.productionDates[0] <= this.productionDates[1]) {
          this.productionLotStartDate = this.productionDates[0];
          this.productionLotEndDate = this.productionDates[1];
        } else {
          this.productionLotStartDate = this.productionDates[1];
          this.productionLotEndDate = this.productionDates[0];
        }
        this.productionDateRangeText =
          this.productionLotStartDate + " ~ " + this.productionLotEndDate;
      }

      this.productionMenu = false;
    },
    onProductionClearClicked() {
      this.productionLotStartDate = null;
      this.productionLotEndDate = null;
      this.productionDates = [];
    },
    onDispatchedCalendarSelected() {
      if (this.dispatchedDates.length > 1) {
        if (this.dispatchedDates[0] <= this.dispatchedDates[1]) {
          this.dispatchedLotStartDate = this.dispatchedDates[0];
          this.dispatchedLotEndDate = this.dispatchedDates[1];
        } else {
          this.dispatchedLotStartDate = this.dispatchedDates[1];
          this.dispatchedLotEndDate = this.dispatchedDates[0];
        }
        this.dispatchedDateRangeText =
          this.dispatchedLotStartDate + " ~ " + this.dispatchedLotEndDate;
      }

      this.menu1 = false;
    },
    onDispatchedClearClicked() {
      this.dispatchedLotStartDate = null;
      this.dispatchedLotEndDate = null;
      this.dispatchedDates = [];
    },
    onCalendarSelected() {
      if (this.dates.length > 1) {
        if (this.dates[0] <= this.dates[1]) {
          this.newLotStartDate = this.dates[0];
          this.newLotEndDate = this.dates[1];
        } else {
          this.newLotStartDate = this.dates[1];
          this.newLotEndDate = this.dates[0];
        }
        this.dateRangeText = this.newLotStartDate + " ~ " + this.newLotEndDate;
      }
      this.min = null;
      this.menu = false;
    },
    onClearClicked() {
      this.newLotStartDate = null;
      this.newLotEndDate = null;
      this.dates = [];
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case this.$t("new"):
          color = "grey";
          break;
        case this.$t("dispatch"):
          color = "orange darken-1";
          break;
        case this.$t("producted"):
          color = "green accent-4";
          break;
        case this.$t("complete"):
          color = "light-blue accent-4";
          break;
        case this.$t("projectClose"):
          color = "red darken-4";
          break;
      }
      return color;
    },
    onClearClicked() {
      this.newLotStartDate = null;
      this.newLotEndDate = null;
      this.dates = [];
    },
    onCalendarSelected() {
      if (this.dates.length > 1) {
        if (this.dates[0] <= this.dates[1]) {
          this.newLotStartDate = this.dates[0];
          this.newLotEndDate = this.dates[1];
        } else {
          this.newLotStartDate = this.dates[1];
          this.newLotEndDate = this.dates[0];
        }
        this.dateRangeText = this.newLotStartDate + " ~ " + this.newLotEndDate;
      }
      this.min = null;
      this.menu = false;
    },
    onProductionLotOpSearch() {
      this.isProductionLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/LotOp/SearchDispatchLotOp?value=${this.productionLotSearchValue}&status=&startDate=${this.productionLotStartDate}&endDate=${this.productionLotEndDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          var data = res.data.data;
          var datalist = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i].lotWipData.isProduction == "Y") {
              datalist.push(data[i]);
            }
          }

          this.productionLotOpData = datalist;
          //   console.log(datalist);
          // this.dispatchLotOpData = res.data.data != null ? res.data.data : [];
          this.isProductionLoading = 0;
        });
    },
    onDispatchedLotOpSearch() {
      this.isDispatchedLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/LotOp/SearchDispatchLotOp?value=${this.dispatchedLotSearchValue}&status=dispatch&startDate=${this.dispatchedLotStartDate}&endDate=${this.dispatchedLotEndDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          var data = res.data.data;
          var datalist = [];
          for (let i = 0; i < data.length; i++) {
            if (
              data[i].lotWipData.inQty == null &&
              data[i].lotWipData.isProduction != "Y"
            ) {
              datalist.push(data[i]);
            }
          }

          this.dispatchLotOpData = datalist;
          //   console.log(datalist);
          // this.dispatchLotOpData = res.data.data != null ? res.data.data : [];
          this.isDispatchedLoading = 0;
        });
    },
    onNewLotOpSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/LotOp/SearchNewLotOp?value=${this.NewLotSearchValue}&status=new&startDate=${this.newLotStartDate}&endDate=${this.newLotEndDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.noDispatchLotOpData = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    getTotalMoData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Mo/SearchMoCount?status=createlot`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let lotWipData = [];

          this.arrayEvents = [];
          if (res.data.data != undefined) {
            //console.log(res.data.data);
            this.arrayEvents = res.data.data;
          }
        })
        .then(() => {});

      this.$axios
        .get(`/LotWip/SearchLotWipCount?type=start&status=dispatch`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let lotWipData = [];

          this.lotWipEvents = [];
          if (res.data.data != undefined) {
            //console.log(res.data.data);
            this.lotWipEvents = res.data.data;
          }
        })
        .then(() => {});

      this.$axios
        .get(`/LotWip/SearchLotWipCount?type=production`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let lotWipData = [];

          this.productionLotWipEvents = [];
          if (res.data.data != undefined) {
            //console.log(res.data.data);
            this.productionLotWipEvents = res.data.data;
          }
        })
        .then(() => {});
    }
  },
  mounted() {
    var datalist = [];
    for (let i = 0; i < this.dispatchLotOpData.length; i++) {
      if (this.dispatchLotOpData[i].lotWipData.inQty == null) {
        datalist.push(this.dispatchLotOpData[i]);
      }
    }

    this.dispatchLotOpData = datalist;
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    );
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    );
    this.dates.push(firstday.toISOString().substr(0, 10));
    this.dates.push(lastday.toISOString().substr(0, 10));
    this.dispatchedDates.push(firstday.toISOString().substr(0, 10));
    this.dispatchedDates.push(lastday.toISOString().substr(0, 10));
    this.productionDates.push(firstday.toISOString().substr(0, 10));
    this.productionDates.push(lastday.toISOString().substr(0, 10));
    if (this.dates.length > 1) {
      //已派工
      if (this.dispatchedDates[0] <= this.dates[1]) {
        this.dispatchedLotStartDate = this.dates[0];
        this.dispatchedLotEndDate = this.dates[1];
      } else {
        this.dispatchedLotStartDate = this.dates[1];
        this.dispatchedLotEndDate = this.dates[0];
      }
      this.dispatchedDateRangeText =
        this.dispatchedLotStartDate + " ~ " + this.dispatchedLotEndDate;
      //未派工
      this.newLotStartDate = this.dispatchedLotStartDate;
      this.newLotEndDate = this.dispatchedLotEndDate;
      this.productionLotStartDate = this.dispatchedLotStartDate;
      this.productionLotEndDate = this.dispatchedLotEndDate;
      this.dateRangeText = this.newLotStartDate + " ~ " + this.newLotEndDate;
      this.productionDateRangeText =
        this.productionLotStartDate + " ~ " + this.productionLotEndDate;
    }

    this.onNewLotOpSearch();
    this.onDispatchedLotOpSearch();
    this.onProductionLotOpSearch();
    this.getMachineData();
    this.getTotalMoData();
    this.MCS = setting.MCS;
    // if (this.MCS == "ON") {
    //   this.dispatchHeaders.push({
    //     text: this.$t("production"),
    //     value: "lotWipData.isProduction",
    //     align: "center",
    //     sortable: false,
    //     width: "5%"
    //   });
    // }
    //this.refreshAreaData();
  },

  created() {
    var datalist = [];
    for (let i = 0; i < this.dispatchLotOpData.length; i++) {
      if (this.dispatchLotOpData[i].lotWipData.inQty == null) {
        datalist.push(this.dispatchLotOpData[i]);
      }
    }

    this.dispatchLotOpData = datalist;
  },
  head() {
    return {
      title: this.$t("dispatchManegement")
    };
  },
  submit() {}
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
