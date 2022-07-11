<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="12" md="2">
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
                  <v-btn text color="primary" @click="onCalendarSelected()">
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="statusCheckedList"
                :items="statusLabel"
                item-text="name"
                item-value="value"
                :label="this.$t('lot') + this.$t('status')"
                multiple
                clearable
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip small v-if="index <= 2">
                    <span>{{ item.name }}</span>
                  </v-chip>
                  <span v-if="index === 3" class="grey--text caption">
                    (+{{ statusCheckedList.length - 3 }} others)
                  </span>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="areaData"
                :items="areaList"
                item-text="areaName"
                return-object
                :label="this.$t('area')"
              >
              </v-select>
            </v-col>
            <v-col cols="12" md="1">
              <v-select
                v-model="type"
                :items="typeList"
                item-text="name"
                item-value="value"
                :label="this.$t('type')"
              >
              </v-select>
            </v-col>
            <v-col cols="12" md="2" v-if="type != null">
              <!-- 設備資料 -->
              <v-select
                v-if="type == `E`"
                v-model="machineData"
                :items="machineList"
                item-text="name"
                return-object
                :label="this.$t('equipment')"
                multiple
                clearable
              >
                <template v-slot:prepend-item>
                  <v-list-item ripple @mousedown.prevent @click="toggle">
                    <v-list-item-action>
                      <v-icon
                        :color="machineData.length > 0 ? 'indigo darken-4' : ''"
                      >
                        {{ icon }}
                      </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        Select All
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>
                <template v-slot:selection="{ item, index }">
                  <v-chip small v-if="index <= 1">
                    <span>{{ item.name }}</span>
                  </v-chip>
                  <span v-if="index === 2" class="grey--text caption">
                    (+{{ machineData.length - 2 }} others)
                  </span>
                </template>
              </v-select>
              <!-- 生產線資料 -->
              <v-select
                v-if="type == `L`"
                v-model="lineData"
                :items="lineList"
                item-text="lineName"
                return-object
                :label="this.$t('line')"
                multiple
                clearable
              >
                <template v-slot:prepend-item>
                  <v-list-item ripple @mousedown.prevent @click="lineToggle">
                    <v-list-item-action>
                      <v-icon
                        :color="lineData.length > 0 ? 'indigo darken-4' : ''"
                      >
                        {{ icon }}
                      </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        Select All
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>
                <template v-slot:selection="{ item, index }">
                  <v-chip small v-if="index <= 0">
                    <span>{{ item.lineName }}</span>
                  </v-chip>
                  <span v-if="index === 1" class="grey--text caption">
                    (+{{ lineData.length - 1 }} others)
                  </span>
                </template>
              </v-select>
            </v-col>
            <!-- <v-col cols="12" md="3">
              <v-select
                v-model="machineData"
                :items="machineList"
                item-text="resourceName"
                return-object
                :label="this.$t('equipment')"
                multiple
                clearable
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip small v-if="index <= 1">
                    <span>{{ item.resourceName }}</span>
                  </v-chip>
                  <span v-if="index === 2" class="grey--text caption">
                    (+{{ machineData.length - 2 }} others)
                  </span>
                </template>
              </v-select>
            </v-col> -->
            <v-col cols="12" md="2">
              <v-form onSubmit="return false;">
                <v-text-field
                  clearable
                  v-model="lotWipSearchValue"
                  :label="this.$t('lot') + this.$t('search')"
                  append-icon="mdi-magnify"
                  required
                  @click:append="onSearch()"
                  @keyup.enter="onSearch()"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="10" class="text-left  mt-n5">
          <v-chip
            label
            :color="getStatusColor(item.name)"
            v-for="(item, idx) in statusLabel"
            :key="idx"
            class="mx-2 px-5"
            width="100"
            outlined
          >
            <v-icon x-small>mdi-circle</v-icon
            ><strong> {{ item.name }}</strong></v-chip
          >
        </v-col>
        <v-col cols="2" class="text-right  mt-n5">
          <v-btn
            @click="showBarcodeJobReportDialog()"
            class="primary"
            v-if="jobReport == 'ON'"
          >
            <v-icon left>
              mdi-barcode
            </v-icon>
            {{ $t("barCode") + $t("jobReport") }}</v-btn
          >
          <v-dialog
            persistent
            v-model="barcodeJobReportDialog"
            max-width="1000"
          >
            <template v-slot:default="dialog">
              <v-card>
                <v-toolbar color="primary" dark>
                  <v-icon left>
                    mdi-barcode
                  </v-icon>
                  {{ $t("barCode") + $t("jobReport") }}</v-toolbar
                >
                <v-card-text>
                  <v-row no-gutters class="mt-3">
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        type="text"
                        ref="name"
                        :label="$t('lot') + $t('No')"
                        @change="getLotOpData()"
                        v-model="lotNo"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters class="mt-n3">
                    <v-col cols="12">
                      <v-alert border="top" color="blue lighten-4" dark>
                        <span v-for="lotOp in lotOpData" :key="lotOp.id">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                rounded
                                :text="currentOp.id != lotOp.id"
                                class="ma-1 pa-1"
                                :color="getLotOpStatusColor(lotOp.status)"
                                v-bind="attrs"
                                v-on="on"
                                ><div>
                                  {{ lotOp.opSequence }}.{{ lotOp.opName }}
                                </div>
                              </v-btn>
                            </template>
                            <div>
                              <h4>
                                {{ $t("processSequence") }}:{{ lotOp.opSequence
                                }}<br />
                                <span
                                  v-if="
                                    lotOp.status != 'dispatch' &&
                                      lotOp.status != 'close'
                                  "
                                  >●{{ $t(lotOp.status) }}</span
                                >
                                <span v-else-if="lotOp.status == 'close'"
                                  >●{{ $t("projectClose") }}</span
                                >
                                <span v-else>
                                  ●{{ $t("already") }}{{ $t(lotOp.status) }}
                                </span>
                              </h4>
                            </div>
                          </v-tooltip>
                          <v-icon
                            v-if="
                              lotOpData.indexOf(lotOp) != lotOpData.length - 1
                            "
                            color="grey"
                            >mdi-chevron-right</v-icon
                          >
                        </span>
                      </v-alert>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-alert
                        border="left"
                        color="grey lighten-2 "
                        style="color:black"
                        dark
                      >
                        <v-row no-gutters>
                          <v-col
                            v-if="currentOp.lotWipData != undefined"
                            cols="4"
                            class="title font-weight-black"
                          >
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                  :color="getLotOpStatusColor(currentOp.status)"
                                  v-bind="attrs"
                                  v-on="on"
                                  class="mb-1"
                                  >mdi-circle</v-icon
                                >
                              </template>
                              <span
                                v-if="
                                  currentOp.status != 'dispatch' &&
                                    currentOp.status != 'close'
                                "
                                >{{ $t(currentOp.status) }}</span
                              >
                              <span v-else-if="currentOp.status == 'close'">{{
                                $t("projectClose")
                              }}</span>
                              <span v-else>
                                {{ $t("already") }}{{ $t(currentOp.status) }}
                              </span>
                            </v-tooltip>
                            {{
                              $t("current") +
                                $t("process") +
                                "：" +
                                currentOp.opName +
                                " (" +
                                currentOp.opSequence +
                                ")"
                            }}
                          </v-col>

                          <v-col
                            v-if="currentOp.lotWipData != undefined"
                            cols="3"
                            class="title font-weight-black"
                          >
                            {{ resourceType + "：" + resourceName }}
                          </v-col>
                        </v-row>

                        <v-row no-gutters>
                          <v-col
                            cols="3"
                            v-if="currentOp.lotWipData != undefined"
                          >
                            {{ $t("already") + $t("in") + $t("count") + "：" }}
                            <span v-if="currentOp.lotWipData.inQty != null">
                              {{ currentOp.lotWipData.inQty }}
                            </span>
                            <span v-else>
                              {{ "0" }}
                            </span>
                          </v-col>
                          <v-col
                            cols="3"
                            v-if="currentOp.lotWipData != undefined"
                          >
                            {{
                              $t("already") +
                                $t("outStation") +
                                $t("count") +
                                "："
                            }}
                            <span v-if="currentOp.lotWipData.outQty != null">
                              {{ currentOp.lotWipData.outQty }}
                            </span>
                            <span v-else>
                              {{ "0" }}
                            </span>
                          </v-col>
                          <v-col
                            cols="3"
                            v-if="currentOp.lotWipData != undefined"
                          >
                            {{
                              $t("expected") +
                                $t("produce") +
                                $t("count") +
                                "：" +
                                currentOp.lotWipData.planQty
                            }}
                          </v-col>
                        </v-row>
                        <v-progress-linear
                          v-if="currentOp.lotWipData != undefined"
                          color="primary lighten-2"
                          :value="
                            (parseFloat(currentOp.lotWipData.outQty) /
                              parseFloat(currentOp.lotWipData.planQty)) *
                              100
                          "
                        ></v-progress-linear>
                      </v-alert>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-radio-group
                        v-model="reportMode"
                        row
                        :disabled="currentOp.length == 0"
                        @change="onModeChange()"
                      >
                        <v-radio
                          :disabled="inStatus"
                          :label="$t('in')"
                          value="in"
                        ></v-radio>
                        <v-radio
                          :disabled="outStatus"
                          :label="$t('outStation')"
                          value="out"
                        ></v-radio>
                        <v-radio
                          v-if="!cancelPauseStatus"
                          :disabled="pauseStatus"
                          :label="$t('pause')"
                          value="pause"
                        ></v-radio>
                        <v-radio
                          v-if="cancelPauseStatus"
                          :disabled="checkEquip(currentOp)"
                          :label="$t('cancel') + $t('pause')"
                          value="cancelPause"
                        ></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-text-field
                        ref="itemDesc"
                        v-if="reportMode == 'in'"
                        :disabled="currentOp.length == 0"
                        :label="$t('in') + $t('count')"
                        v-model="inForm.qty"
                        oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                        :max="maxCount"
                        outlined
                        type="number"
                      ></v-text-field>
                      <v-text-field
                        ref="itemDesc"
                        v-if="reportMode == 'out' || reportMode == 'pause'"
                        :label="$t('outStation') + $t('count')"
                        v-model="outForm.qty"
                        oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                        :max="maxCount"
                        outlined
                        type="number"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" sm="12" md="12">
                      <v-checkbox
                        v-if="reportMode == 'out' || reportMode == 'pause'"
                        v-model="isNGCheck"
                        :label="$t('ifor') + $t('has') + $t('NG') + $t('count')"
                        @change="onIsNGCheckChange()"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="12" md="6">
                      <v-select
                        v-if="isNGCheck == true"
                        v-model="outForm.QCReason"
                        :label="$t('NG') + $t('reason')"
                        :items="reasonList"
                        outlined
                        item-text="reasonName"
                        return-object
                      ></v-select>
                    </v-col>

                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                        v-if="isNGCheck == true"
                        ref="itemDesc"
                        :label="$t('NG') + $t('count')"
                        v-model="outForm.NGCount"
                        outlined
                        oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                        :max="outForm.qty"
                        type="number"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete
                        v-model="executor"
                        :items="userData"
                        item-text="name"
                        :rules="noRules"
                        outlined
                        return-object
                        :label="$t('executor')"
                        required
                      ></v-autocomplete>
                      <!-- <v-select
                        ref="itemSpec"
                        :label="$t('executor')"
                        :items="userData"
                        outlined
                        return-object
                        item-text="name"
                        v-model="executor"
                      ></v-select> -->
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        outlined
                        ref="itemQty"
                        :label="$t('description')"
                        counter="25"
                        maxlength="25"
                        v-model="description"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-divider />
                <v-card-actions class="justify-end">
                  <v-btn
                    :disabled="currentOp.length == 0 || reportMode == null"
                    class="primary"
                    @click="jobReport()"
                    >{{ $t("jobReport") }}</v-btn
                  >
                  <v-btn @click="dialog.value = false">{{ $t("close") }}</v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-col>
        <v-snackbar v-model="snackbar">
          {{ snackbarText }}

          <template v-slot:action="{ attrs }">
            <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
              Close
            </v-btn>
          </template>
        </v-snackbar>
        <v-col cols="12" class="pa-2 mt-5">
          <JobReportTable
            :lotWipData="lotWipData"
            :lotWipSearchValue="lotWipSearchValue"
            :startDate="startDate"
            :endDate="endDate"
            :status="statusCheckedList"
            :isLoading="isLoading"
            @update="onSearch"
            :totalPage="totalPage"
            :totalCount="totalCount"
            :defaultPage="defaultPage"
          />
        </v-col>
      </v-row>
      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",

  data() {
    return {
      areaList: [],
      areaData: {},
      type: null,
      typeList: [
        { name: "*", value: null },
        { name: this.$t("equipment"), value: "E" },
        { name: this.$t("line"), value: "L" }
      ],
      lineData: [],
      lineList: [],
      jobReportTag: "ON",
      jobReport: "ON",
      lotNo: "",
      arrayEvents: [],
      defaultPage: 0,
      totalCount: 0,
      totalPage: 0,
      resourceName: "",
      resourceType: "",
      cancelPauseStatus: false,
      inStatus: false,
      outStatus: false,
      pauseStatus: false,
      noRules: [v => !!v || this.$t("mustInput")],
      description: null,
      userData: [],
      executor: null,
      reasonList: [],
      isNGCheck: false,
      maxOutCount: 0,
      maxCount: 0,
      reportMode: null,
      currentOp: [],
      snackbarText: "",
      snackbar: false,
      lotNo: null,
      lotOpData: [],
      barcodeJobReportDialog: false,
      machineData: [],
      machineList: [],
      resourceList: {},
      currentPage: 1,
      perPage: 1,
      isLoading: 0,
      lotWipData: [],
      statusCheckedList: ["dispatch", "producted"],
      statusLabel: [
        { name: this.$t("already") + this.$t("dispatch"), value: "dispatch" },
        { name: this.$t("producted"), value: "producted" },
        { name: this.$t("pause"), value: "pause" },
        { name: this.$t("complete"), value: "complete" },
        { name: this.$t("projectClose"), value: "close" }
      ],
      inForm: {
        lotOpNo: null,
        opName: null,
        planQty: null,
        inQty: null,
        qty: null,
        user: {},
        desc: null,
        resourceName: null,
        resourceType: null
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
      valid: true,
      noRules: [v => !!v || this.$t("mustInput")],
      itemList: [],
      dates: [],
      startDate: null,
      endDate: null,
      min: null,
      menu: false,
      menu2: false,
      overlay: false,
      menu3: false,
      formHasErrors: false,
      errorMessages: "",
      lotWipSearchValue: "",
      moData: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addMoForm: {
        moNo: null,
        itemNo: null,
        startDate: new Date().toISOString().substr(0, 10),
        endDate: null,
        count: null,
        urgent: null,
        remark: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      exceptionReasonList: [],
      exceptionActionList: [],
      dateRangeText: null
    };
  },
  computed: {
    form() {
      return {
        areaNo: this.areaNo,
        areaName: this.areaName
      };
    },
    likesAllItems() {
      return this.machineData.length === this.machineList.length;
    },
    likesSomeItems() {
      return this.machineData.length > 0 && !this.likesAllItems;
    },
    icon() {
      if (this.likesAllItems) return "mdi-close-box";
      if (this.likesSomeItems) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    lineAllItems() {
      return this.lineData.length === this.lineList.length;
    },
    lineSomeItems() {
      return this.lineData.length > 0 && !this.lineAllItems;
    },
    lineIcon() {
      if (this.lineAllItems) return "mdi-close-box";
      if (this.lineSomeItems) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
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
    const id = params.id;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "jobReport") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    return {
      overlay: false,
      lotNo: id
    };
  },
  methods: {
    toggle() {
      this.$nextTick(() => {
        if (this.likesAllItems) {
          this.machineData = [];
        } else {
          this.machineData = this.machineList.slice();
        }
      });
    },
    lineToggle() {
      this.$nextTick(() => {
        if (this.lineAllItems) {
          this.lineData = [];
        } else {
          this.lineData = this.lineList.slice();
        }
      });
    },
    jobReport() {
      if (this.reportMode == "in") {
        this.inReport();
      } else if (this.reportMode == "out") {
        this.outReport();
      } else if (this.reportMode == "pause") {
        this.pauseReport();
      } else if (this.reportMode == "cancelPause") {
        this.cancelPauseReport();
      }
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
        moId: this.currentOp.moData.id,
        lotId: this.currentOp.lot.id,
        lotOpId: this.currentOp.id,
        resourceType: this.currentOp.lotWipData.resourceType,
        resourceNo: this.currentOp.lotWipData.resourceNo,
        resourceName: this.currentOp.lotWipData.resourceName,
        userNo: this.executor.account,
        userName: this.executor.name,
        shiftNo: this.currentOp.workShiftData[0][0].shiftNo,
        shiftName: this.currentOp.workShiftData[0][0].shiftName,
        dispatchStartDate: this.currentOp.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "OUT",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.outForm.qty.toString(),
        wipDesc: this.description,
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
            this.onSearch();
            this.barcodeJobReportDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.barcodeJobReportDialog = false;
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
        moId: this.currentOp.moData.id,
        lotId: this.currentOp.lot.id,
        lotOpId: this.currentOp.id,
        resourceType: this.currentOp.lotWipData.resourceType,
        resourceNo: this.currentOp.lotWipData.resourceNo,
        resourceName: this.currentOp.lotWipData.resourceName,
        userNo: this.executor.account,
        userName: this.executor.name,
        shiftNo: this.currentOp.workShiftData[0][0].shiftNo,
        shiftName: this.currentOp.workShiftData[0][0].shiftName,
        dispatchStartDate: this.currentOp.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logUserId: this.executor.id,
        logUserName: this.executor.name,
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
        moId: this.currentOp.moData.id,
        lotId: this.currentOp.lot.id,
        lotOpId: this.currentOp.id,
        resourceType: this.currentOp.lotWipData.resourceType,
        resourceNo: this.currentOp.lotWipData.resourceNo,
        resourceName: this.currentOp.lotWipData.resourceName,
        userNo: this.executor.account,
        userName: this.executor.name,
        shiftNo: this.currentOp.workShiftData[0][0].shiftNo,
        shiftName: this.currentOp.workShiftData[0][0].shiftName,
        dispatchStartDate: this.currentOp.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "PAUSE",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.outForm.qty.toString(),
        wipDesc: this.description,
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
            this.onSearch();
            this.barcodeJobReportDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.barcodeJobReportDialog = false;
          }
        })
        .then(() => {});
    },
    cancelPauseReport() {
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.currentOp.moData.id,
        lotId: this.currentOp.lot.id,
        lotOpId: this.currentOp.id,
        resourceType: this.currentOp.lotWipData.resourceType,
        resourceNo: this.currentOp.lotWipData.resourceNo,
        resourceName: this.currentOp.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: this.currentOp.workShiftData[0][0].shiftNo,
        shiftName: this.currentOp.workShiftData[0][0].shiftName,
        dispatchStartDate: this.currentOp.lotWipData.dispatchStartDate,
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
            this.onSearch();
          } else {
            this.$swal("", res.data.msg, "error");
          }
        })
        .then(() => {});
      this.barcodeJobReportDialog = false;
      this.onSearch();
    },
    inReport() {
      if (this.inForm.qty == 0 || this.currentOp.length == 0) {
        return;
      }
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.currentOp.moData.id,
        lotId: this.currentOp.lot.id,
        lotOpId: this.currentOp.id,
        resourceType: this.currentOp.lotWipData.resourceType,
        resourceNo: this.currentOp.lotWipData.resourceNo,
        resourceName: this.currentOp.lotWipData.resourceName,
        userNo: this.executor.account,
        userName: this.executor.name,
        shiftNo: this.currentOp.workShiftData[0][0].shiftNo,
        shiftName: this.currentOp.workShiftData[0][0].shiftName,
        dispatchStartDate: this.currentOp.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "IN",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.inForm.qty.toString(),
        wipDesc: this.description,
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

            this.onSearch();
            this.barcodeJobReportDialog = false;
            this.mqttClient.publish(
              "${setting.mqtt.customer}/D200/tc/thirdParty/jobReport/in",
              JSON.stringify(Object.assign({}, lotWipLog)),
              0,
              error => {
                if (error) {
                  console.log("Publish error", error);
                }
              }
            );
          } else {
            this.$swal("", res.data.msg, "error");
            this.barcodeJobReportDialog = false;
          }
        })
        .then(() => {});
    },
    onModeChange() {
      let inQty = 0;
      let outQty = 0;
      if (this.reportMode == "in") {
        if (this.currentOp.lotWipData.inQty == null) {
          inQty = 0;
        } else {
          inQty = this.currentOp.lotWipData.inQty;
        }
        this.inForm.qty = parseFloat(this.currentOp.lotWipData.planQty) - inQty;
        this.maxCount = parseFloat(this.currentOp.lotWipData.planQty) - inQty;
      } else if (this.reportMode == "out") {
        // 計算進站量
        if (this.currentOp.lotWipData.inQty == null) {
          inQty = 0;
        } else {
          inQty = this.currentOp.lotWipData.inQty;
        }
        // 計算出站量
        if (this.currentOp.lotWipData.outQty == null) {
          outQty = 0;
          this.outForm.outQty = 0;
        } else {
          outQty = this.currentOp.lotWipData.outQty;
          this.outForm.outQty = this.currentOp.lotWipData.outQty;
        }

        this.outForm.planQty = this.currentOp.lotWipData.planQty;

        this.outForm.qty = inQty - outQty;
        this.maxCount = inQty - outQty;
      } else if (this.reportMode == "pause") {
        // 計算進站量
        if (this.currentOp.lotWipData.inQty == null) {
          inQty = 0;
        } else {
          inQty = this.currentOp.lotWipData.inQty;
        }
        // 計算出站量
        if (this.currentOp.lotWipData.outQty == null) {
          outQty = 0;
          this.outForm.outQty = 0;
        } else {
          outQty = this.currentOp.lotWipData.outQty;
          this.outForm.outQty = this.currentOp.lotWipData.outQty;
        }

        this.outForm.planQty = this.currentOp.lotWipData.planQty;

        this.outForm.qty = inQty - outQty;
        this.maxCount = inQty - outQty;
      }
    },
    checkInStatus() {
      if (this.currentOp != undefined) {
        if (
          this.getPreviousOpStatus(this.currentOp) == true ||
          this.checkCount(this.currentOp) == true ||
          this.checkEquip(this.currentOp) == true
        ) {
          if (this.getPreviousOpStatus(this.currentOp) == true) {
            this.snackbar = true;
            this.snackbarText = "無法進站，上個製程尚未完成。";
          } else if (this.checkEquip(this.currentOp) == true) {
            this.snackbar = true;
            this.snackbarText = "無法進站，設備正在加工中。";
          }
          return true;
        } else {
          if (this.currentOp.lotWipData != undefined) {
            if (
              this.currentOp.lotWipData.status == "pause" ||
              this.currentOp.lotWipData.status == "complete" ||
              this.currentOp.lotWipData.status == "close"
            ) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        }
      } else {
        return true;
      }
    },
    checkOutStatus() {
      if (this.currentOp != undefined) {
        if (this.currentOp.lotWipData != undefined) {
          if (
            this.currentOp.lotWipData.inQty == null ||
            this.currentOp.lotWipData.inQty ==
              this.currentOp.lotWipData.outQty ||
            this.currentOp.lotWipData.status == "pause" ||
            this.currentOp.lotWipData.status == "complete" ||
            this.currentOp.lotWipData.status == "close"
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    checkPauseStatus() {
      if (this.currentOp != undefined) {
        if (this.currentOp.lotWipData != undefined) {
          if (
            this.currentOp.lotWipData.inQty == null ||
            this.currentOp.status == "complete" ||
            this.currentOp.status == "close"
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    getPreviousOpStatus(item) {
      let lotOpData = item.lotOpData;
      let status = true;
      if (lotOpData != undefined) {
        // 搜尋該生產批下的製程內容
        for (let i = 0; i < lotOpData.length; i++) {
          // 若製程順序小於當前生產批製程順序則進入
          if (
            parseFloat(lotOpData[i].opSequence) < parseFloat(item.opSequence)
          ) {
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
      }
      //若當前製程序為最高的,則回覆啟用按鈕
      status = false;
      return status;
    },
    checkCount(item) {
      let lotWipData = item.lotWipData;
      let status = false;
      if (lotWipData != undefined) {
        if (parseFloat(lotWipData.inQty) >= parseFloat(lotWipData.planQty)) {
          status = true;
        }
      }
      return status;
    },
    checkEquip(item) {
      if (item.lotWipData != undefined) {
        let resourceType = item.lotWipData.resourceType;
        let resourceNo = item.lotWipData.resourceNo;
        let resourceName = item.lotWipData.resourceName;
        //console.log(item);
        if (item.machineLotWipData != null) {
          // console.log(item.lotWipData.resourceNo);
          // console.log(item.machineLotWipData.resourceNo);
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
      } else {
        return false;
      }
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
          this.executor = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
          this.executor = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
        });
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
    getTotalLotWipData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/LotWip/SearchAreaLotWipCount?areaNo=`, {
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
    },
    showBarcodeJobReportDialog() {
      this.getUserData();
      this.reportMode = null;
      this.currentOp = [];
      this.isNGCheck = false;
      this.lotOpData = [];
      this.lotNo = null;
      this.resourceType = "";
      this.resourceName = "";
      this.barcodeJobReportDialog = true;
      setTimeout(() => {
        this.$refs.name.focus();
      }, 200);
      // this.$refs.name.focus();
    },
    getLotOpStatusColor(status) {
      // console.log(status);
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
        case "producted":
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
    getLotOpData() {
      console.log(this.lotNo);
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(`/LotOp/SearchByNo?value=${this.lotNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.reportMode = null;
            this.lotOpData = res.data.data != null ? res.data.data : [];
            this.currentOp = this.lotOpData.find(
              x =>
                x.status == "dispatch" ||
                x.status == "producted" ||
                x.status == "pause"
            );
            if (this.currentOp != undefined) {
              this.maxCount =
                parseFloat(this.currentOp.lotWipData.planQty) -
                this.currentOp.lotWipData.inQty;
              if (this.currentOp.lotWipData != undefined) {
                if (this.currentOp.lotWipData.resourceType == "E") {
                  this.resourceType = this.$t("equipment");
                } else {
                  this.resourceType = this.$t("line");
                }
                this.resourceName = this.currentOp.lotWipData.resourceName;

                if (this.currentOp.lotWipData.status == "pause") {
                  this.cancelPauseStatus = true;
                }
              }
            } else {
              this.currentOp = [];
              this.maxCount = 0;
              let newLotOp = this.lotOpData.find(x => x.status == "new");
              if (newLotOp != undefined) {
                this.snackbar = true;
                this.snackbarText = "請先完成派工。";
              }
            }
            this.inStatus = this.checkInStatus();
            this.outStatus = this.checkOutStatus();
            this.pauseStatus = this.checkPauseStatus();
            console.log(this.currentOp);
          } else {
            this.currentOp = [];
            this.lotOpData = [];
            this.reportMode = null;
            this.currentOp = [];
            this.isNGCheck = false;
            this.lotOpData = [];
            this.lotNo = null;
            this.snackbar = true;
            this.snackbarText = res.data.msg;
          }
        });
    },
    itemsForList() {
      return this.lotWipData.slice(
        (this.currentPage - 1) * this.perPage,
        this.currentPage * this.perPage
      );
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case this.$t("new"):
          color = "grey";
          break;
        case this.$t("already") + this.$t("dispatch"):
          color = "orange darken-1";
          break;
        case this.$t("pause"):
          color = "red darken-1";
          break;
        case this.$t("producted"):
          color = "green accent-4";
          break;
        case this.$t("complete"):
          color = "light-blue accent-4";
          break;
        case this.$t("projectClose"):
          color = "blue-grey darken-3";
          break;
      }
      return color;
    },
    onClearClicked() {
      this.startDate = null;
      this.endDate = null;
      this.dates = [];
    },
    onCalendarSelected() {
      if (this.dates.length > 1) {
        if (this.dates[0] <= this.dates[1]) {
          this.startDate = this.dates[0];
          this.endDate = this.dates[1];
        } else {
          this.startDate = this.dates[1];
          this.endDate = this.dates[0];
        }
        this.dateRangeText = this.startDate + " ~ " + this.endDate;
      }
      this.min = null;
      this.menu = false;
    },
    onSearch(data) {
      //console.log(data);
      let p = 1;
      let ipp = 10;
      if (data != null) {
        p = data.page;
        ipp = data.itemsPerPage;
        this.defaultPage = data.page;
      } else {
        this.defaultPage = 1;
      }
      let resourceData = {};
      let machine = [];
      let line = [];

      if (this.type != "L") {
        this.machineData.forEach(m => {
          machine.push(m.no);
        });
        if (machine.length == 0) {
          this.machineList.forEach(m => {
            machine.push(m.no);
          });
        }
      }

      if (this.type != "E") {
        this.lineData.forEach(m => {
          line.push(m.lineNo);
        });
        if (line.length == 0) {
          this.lineList.forEach(m => {
            line.push(m.lineNo);
          });
        }
      }

      resourceData = {
        E: machine,
        L: line
      };
      //console.log(resourceData);

      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/LotOp/SearchForJobReport?value=${this.lotWipSearchValue}&status=${this.statusCheckedList}&startDate=${this.startDate}&endDate=${this.endDate}&page=${p}&itemPerPage=${ipp}&areaNo=${this.areaData.areaNo}&lineData=${line}&machineData=${machine}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          let array = [];
          array = res.data.data != null ? res.data.data : [];

          this.totalPage = res.data.totalPage;
          this.totalCount = res.data.totalCount;
          let data = [];
          this.lotWipData = array;

          this.refreshMachineData();
          this.isLoading = 0;
        });
    },
    getMachineData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Machine/Search?areaNo=${this.areaData.areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.machineList = res.data.data != null ? res.data.data : [];
          this.machineData = this.machineList;
          this.isLoading = 0;
        });
    },
    getLineData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Line/Search?areaNo=${this.areaData.areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.lineList = res.data.data != null ? res.data.data : [];
          this.lineData = this.lineList;
          this.isLoading = 0;
        });
    },
    refreshMachineData() {
      if (this.lotWipData.length > 0) {
        let array = [];
        let data = [];
        for (let i = 0; i < this.lotWipData.length; i++) {
          array.push(this.lotWipData[i].lotWipData);
        }
        var uniq = {};
        var arrFiltered = array.filter(
          obj => !uniq[obj.resourceName] && (uniq[obj.resourceName] = true)
        );
        //console.log(this.arrFiltered);
        this.machineList = arrFiltered;
        // console.log(data);
      } else {
        this.machineList = [];
      }
    }
  },
  head() {
    return {
      title: this.$t("jobNo") + this.$t("jobReport")
    };
  },
  mounted() {
    this.refreshMachineData();
    this.jobReport = setting.jobReport;
    if (this.lotNo != undefined) {
      this.lotWipSearchValue = this.lotNo;
    }

    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    );
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    );

    if (this.$route.query.date != undefined) {
      let date = this.$route.query.date;
      this.dates.push(date);
      this.dates.push(date);
      this.startDate = date;
      this.endDate = date;
      this.dateRangeText = this.startDate + " ~ " + this.endDate;
    } else {
      this.dates.push(firstday.toISOString().substr(0, 10));
      this.dates.push(lastday.toISOString().substr(0, 10));
      if (this.dates.length > 1) {
        if (this.dates[0] <= this.dates[1]) {
          this.startDate = this.dates[0];
          this.endDate = this.dates[1];
        } else {
          this.startDate = this.dates[1];
          this.endDate = this.dates[0];
        }
        this.dateRangeText = this.startDate + " ~ " + this.endDate;
      }
    }

    this.min = null;
    this.menu = false;
    this.areaData = this.areaList[0];
    this.onSearch();
    this.getTotalLotWipData();
    //this.refreshAreaData();
  },

  created() {
    //this.refreshMachineData();
  },
  watch: {
    areaData() {
      this.getMachineData();
      this.getLineData();
    },
    type() {
      this.lineData = this.lineList;
      this.machineData = this.machineList;
    }
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
