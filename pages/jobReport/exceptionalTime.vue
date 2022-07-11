<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-row>
          <!-- 搜尋欄 -->
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
              <v-date-picker ref="picker" v-model="dates" :min="min" range>
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
          <v-col cols="12" md="2">
            <v-select
              v-model="searchAreaData"
              :items="areaDataList"
              item-text="areaName"
              return-object
              :label="this.$t('area')"
            >
            </v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="machineSearchData"
              :items="machineSearchList"
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
                      :color="
                        machineSearchData.length > 0 ? 'indigo darken-4' : ''
                      "
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
          </v-col>
          <v-col cols="12" md="2">
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
                <v-chip small v-if="index <= 1">
                  <span>{{ item.name }}</span>
                </v-chip>
                <span v-if="index === 2" class="grey--text caption">
                  (+{{ statusCheckedList.length - 2 }} others)
                </span>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="2">
            <v-form onSubmit="return false;">
              <v-text-field
                clearable
                v-model="userSearchValue"
                append-icon="mdi-magnify"
                required
                @click:append="onSearch()"
                @keyup.enter="onSearch()"
              ></v-text-field>
            </v-form>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <!-- 新增按鈕 -->
          <v-col cols="12" md="1">
            <v-flex d-flex justify-end>
              <v-btn
                color="blue darken-3"
                dark
                width="100%"
                @click.stop="showAddDialog()"
              >
                <v-icon left dark>
                  mdi-plus-thick
                </v-icon>
                {{ $t("add") }}
              </v-btn>
              <!-- 彈窗 -->
              <v-dialog v-model="addDialog" persistent max-width="800px">
                <v-card ref="form">
                  <v-card-title class="info">
                    <v-icon left dark>
                      mdi-plus-thick
                    </v-icon>
                    <span class=" headline white--text">
                      {{
                        $t("add") + $t("exceptionalTime") + $t("jobReport")
                      }}</span
                    >
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="12" md="4">
                          <v-select
                            ref="itemSpec"
                            :label="$t('executor')"
                            :items="userData"
                            return-object
                            item-text="name"
                            v-model="addForm.user"
                            prepend-icon="mdi-account"
                          >
                          </v-select>
                        </v-col>

                        <v-col cols="12" sm="12" md="2">
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
                        <v-col cols="12" sm="12" md="3">
                          <!-- <div v-if="selectedOpResourceType === 'E'">E</div>
                  <div v-else-if="selectedOpResourceType === 'L'">L</div> -->
                          <v-select
                            ref="opDesc"
                            v-if="selectedOpResourceType == 'L'"
                            :label="$t('line')"
                            v-model="lineList"
                            :items="lineData"
                            item-text="lineName"
                            item-value="lineNo"
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
                            item-value="no"
                          >
                          </v-select>
                        </v-col>
                        <v-col cols="12" sm="12" md="3">
                          <v-select
                            ref="select"
                            v-if="selectedOpResourceType != null"
                            :label="$t('workShift')"
                            v-model="workShiftData"
                            :items="workShiftList"
                            title="startTime"
                            item-text="shiftName"
                            item-value="shiftNo"
                            return-object
                          >
                          </v-select>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-text-field
                          color="success"
                          :loading="lotLoading == 1"
                          :label="$t('lot') + $t('No')"
                          placeholder="該設備/生產線當前無生產批"
                          v-model="lotNo"
                          disabled
                          filled
                          rounded
                          dense
                        >
                        </v-text-field>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-card elevation="1" class="mx-auto">
                            <v-card-title class="white--text orange darken-4">
                              <v-icon color="white" left
                                >mdi-clipboard-alert-outline</v-icon
                              >
                              {{ $t("jobReport") + $t("reason") }}
                            </v-card-title>
                            <!-- <v-virtual-scroll height="300" item-height="64"> -->
                            <v-card-text>
                              <v-item-group v-model="selectedReason" mandatory>
                                <v-row>
                                  <v-col
                                    style="text-align:center"
                                    v-for="data in reasonList"
                                    :key="data.id"
                                    cols="12"
                                    md="3"
                                  >
                                    <v-item
                                      v-slot="{ active, toggle }"
                                      :value="data"
                                    >
                                      <v-card
                                        :color="
                                          active
                                            ? 'orange darken-4'
                                            : 'orange lighten-1'
                                        "
                                        dark
                                        class="rounded-lg "
                                        @click="toggle"
                                      >
                                        <v-card-text
                                          class="text-h6 font-weight-black"
                                          >{{ data.reasonName }}</v-card-text
                                        >
                                        <v-scroll-y-transition>
                                          <div
                                            v-if="active"
                                            class="text-h2 flex-grow-1 text-center"
                                          ></div>
                                        </v-scroll-y-transition>
                                      </v-card>
                                    </v-item>
                                  </v-col>
                                </v-row>
                              </v-item-group>
                            </v-card-text>
                            <!-- </v-virtual-scroll> -->
                          </v-card>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-text-field
                          :label="$t('notice')"
                          v-model="addForm.remark"
                        >
                        </v-text-field>
                      </v-row>
                    </v-container>
                    <small>*{{ $t("inputRequired") }}</small>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="gray" @click="addDialog = false">{{
                      $t("cancel")
                    }}</v-btn>
                    <v-btn class="info" dark text @click="addExceptionalTime()">
                      {{ $t("add") }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

              <!-- 異常視窗 -->
              <v-dialog v-model="errorDialog" persistent max-width="300px">
                <v-card>
                  <v-card-title class="error">
                    <span class=" white--text"> {{ $t("error") }}</span>
                  </v-card-title>
                  <v-card-text>
                    <div class="mt-4">
                      <span style="font-size:18px;font-weight:bold">
                        {{ message }}
                      </span>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      class="gray"
                      @click="(errorDialog = false), (showAddDialog = false)"
                      >{{ $t("close") }}</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-flex>
          </v-col>
        </v-row>
      </v-form>
    </v-flex>
    <v-flex xs12 class="mx-1">
      <ExceptionalTimeTable
        :data="data"
        :isLoading="isLoading"
        :userSearchValue="userSearchValue"
        :statusCheckedList="statusCheckedList"
        :startDate="startDate"
        :endDate="endDate"
      />
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
import ExceptionalTimeTable from "~/components/jobReport/ExceptionalTimeTable.vue";
export default {
  middleware: "auth",
  data() {
    return {
      machineSearchData: [],
      machineSearchList: [],
      workShiftList: [],
      workShiftData: { shiftName: null, shiftNo: null },
      data: [],
      selectedReason: null,
      benched: 0,
      lotLoading: 0,
      lotData: {},
      lotOpId: null,
      lotNo: null,
      lotWip: [],
      addDialog: false,
      selectedOpResourceType: null,
      opResourceType: [
        { name: "無", value: null },
        { name: this.$t("equipment"), value: "E" }
        // { name: this.$t("line"), value: "L" }
      ],
      lineData: [],
      machineList: {},
      lineList: {},
      machineData: [],
      userSearchValue: null,
      statusCheckedList: [],
      statusLabel: [
        { name: this.$t("active"), value: "active" },
        { name: this.$t("complete"), value: "complete" }
      ],
      dateRangeText: null,
      dates: [],
      startDate: null,
      userData: [],
      endDate: null,
      min: null,
      menu: false,
      menu2: false,
      isLoading: 0,
      formHasErrors: false,
      errorMessages: "",
      areaSearchValue: "",
      areaList: {},
      areaDataList: [],
      searchAreaData: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addAreaForm: {
        no: null,
        name: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      areaData: [],
      addForm: {
        user: null,
        resorceNo: null,
        startTime: null,
        lotOpNo: null,
        reasonNo: null,
        remark: null
      },

      exceptionReasonList: [],
      exceptionActionList: [],
      reasonList: []
    };
  },
  components: {
    ExceptionalTimeTable
  },
  computed: {
    form() {
      return {
        areaNo: this.areaNo,
        areaName: this.areaName
      };
    }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(
        x => x.menu_no == "exceptionalTime"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
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
    )
      .toISOString()
      .substr(0, 10);

    let response = await app.$axios.$get(
      `/ExceptionalTime/Search?startDate=${firstday}&endDate=${lastday}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let exceptionalTimeData = response.data;

    response = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    let areaDataList = response.data;
    areaDataList.unshift({ areaName: "*", areaNo: null });

    return {
      data: exceptionalTimeData,
      areaDataList: areaDataList
    };
  },
  methods: {
    getReasonData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Reason/Search?type=ET`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.reasonList = res.data.data != null ? res.data.data : [];
          //console.log(this.reasonList);
        });
    },
    showAddDialog() {
      this.addDialog = true;
      this.lotOpId = null;
      this.lotData = {};
      this.lotNo = null;
      this.addForm.remark = null;
      this.selectedReason = {};
      this.addForm.user = this.userData.find(
        x => x.account == this.$store.state.authUser.account
      );
      // console.log(this.$store.state.authUser);
      this.selectedOpResourceType = this.opResourceType[0].value;
      this.getResourceData();
      this.getUserData();
      this.getReasonData();
      //console.log(this.selectedReason);
    },
    getResourceData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/line/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.lineData = res.data.data != null ? res.data.data : [];
        });

      this.$axios
        .get(`/machine/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.machineData = res.data.data != null ? res.data.data : [];
        });
    },
    onTypeSelectedChange() {
      if (this.selectedOpResourceType == "E") {
        this.lineList = {};
      } else {
        this.machineList = {};
      }
      this.workShiftList = [];
      //  console.log(this.selectedOpResourceType);
    },
    onOpReourceSelectChange() {
      this.lotLoading = 1;
      const token = this.$store.state.authUser.token;
      if (this.selectedOpResourceType == "E") {
        if (this.machineList != undefined) {
          let machineData = this.machineData.find(
            x => x.no == this.machineList.no
          );
          //console.log(machineData);
          this.workShiftList = [];

          if (machineData != undefined) {
            this.workShiftList = machineData.shiftData;
            this.workShiftData = this.workShiftList[0];
          }
        }

        this.$axios
          .get(`/lotWip/SearchByMachine?machineNo=` + this.machineList.no, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            // console.log(res.data.data);

            let data = res.data.data != null ? res.data.data : [];

            if (data.length > 0) {
              if (
                data.find(x => x.status == "in" || x.status == "out") !=
                undefined
              ) {
                this.lotData = data.find(
                  x => x.status == "in" || x.status == "out"
                ).lotData;
                if (this.lotData != undefined) {
                  let lotOpData = data.find(
                    x => x.status == "in" || x.status == "out"
                  ).lotOpData;
                  if (lotOpData != undefined) {
                    this.lotOpId = lotOpData.id;
                  }
                  this.lotNo = this.lotData.lotNo;
                }
              } else {
                this.lotOpId = null;
                this.lotData = {};
                this.lotNo = null;
              }
            } else {
              this.lotOpId = null;
              this.lotData = {};
              this.lotNo = null;
            }
            this.lotLoading = 0;
          });
      } else {
        if (this.lineList != undefined) {
          let lineData = this.lineData.find(x => x.no == this.lineList.lineNo);
          this.workShiftList = [];

          if (lineData != undefined) {
            this.workShiftList = lineData.shiftData;
            this.workShiftData = this.workShiftList[0];
          }
        }

        this.$axios
          .get(`/lotWip/SearchByLine?lineNo=` + this.lineList.lineNo, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            //console.log(res.data.data);

            let data = res.data.data != null ? res.data.data : [];
            if (data.length > 0) {
              if (
                data.find(x => x.status == "in" || x.status == "out") !=
                undefined
              ) {
                this.lotData = data.find(
                  x => x.status == "in" || x.status == "out"
                ).lotData;
                if (this.lotData != undefined) {
                  let lotOpData = data.find(
                    x => x.status == "in" || x.status == "out"
                  ).lotOpData;
                  if (lotOpData != undefined) {
                    this.lotOpId = lotOpData.id;
                  }
                  this.lotNo = this.lotData.lotNo;
                }
              } else {
                this.lotOpId = null;
                this.lotData = {};
                this.lotNo = null;
              }
            } else {
              this.lotOpId = null;
              this.lotData = {};
              this.lotNo = null;
            }
            this.lotLoading = 0;
            //console.log(this.$store.state.authUser);
          });
      }
      //console.log();
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
          this.addForm.user = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
        });
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
    onSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(
          `/ExceptionalTime/Search?value=&status=${this.statusCheckedList}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          let array = [];
          let result = [];
          array = res.data.data != null ? res.data.data : [];
          //過濾設備
          if (this.machineSearchData.length > 0) {
            this.data = [];
            for (let j = 0; j < this.machineSearchData.length; j++) {
              result.push(
                array.filter(x => x.resourceNo == this.machineSearchData[j].no)
              );
            }
            // console.log(array);
            for (let i = 0; i < result.length; i++) {
              result[i].forEach(element => {
                if (this.userSearchValue == null) {
                  this.userSearchValue = "";
                }
                if (element.lotData != null) {
                  //  console.log(element);
                  if (
                    element.lotData[0].lotNo.includes(this.userSearchValue) ||
                    element.userName.includes(this.userSearchValue)
                  ) {
                    this.data.push(element);
                  }
                } else {
                  if (element.userName.includes(this.userSearchValue)) {
                    this.data.push(element);
                  }
                }
              });
            }
          } else {
            this.data = array;
          }
          this.isLoading = 0;
        });
    },
    addExceptionalTime() {
      let resorceNo,
        shiftNo = null;
      let resourceName,
        shiftName = null;
      if (this.reasonList.length == 0) {
        return;
      }
      if (this.selectedOpResourceType == "L") {
        resorceNo = this.lineList.lineNo;
        resourceName = this.lineList.lineName;
      } else if (this.selectedOpResourceType == "E") {
        resorceNo = this.machineList.no;
        resourceName = this.machineList.name;
      }

      if (this.workShiftData != undefined) {
        shiftNo = this.workShiftData.shiftNo;
        shiftName = this.workShiftData.shiftName;
      }
      const token = this.$store.state.authUser.token;
      const data = {
        lotOpId: this.lotOpId,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        resourceType: this.selectedOpResourceType,
        resourceNo: resorceNo,
        resourceName: resourceName,
        shiftNo: shiftNo,
        shiftName: shiftName,
        userNo: this.addForm.user.employeeId,
        userName: this.addForm.user.name,
        status: "active",
        reasonNo: this.selectedReason.reasonNo,
        reasonName: this.selectedReason.reasonName,
        statusDate: new Date(),
        actualStartTime: new Date(),
        actualEndTime: null,
        remark: this.addForm.remark
      };
      console.log(data);
      this.addForm.remark = null;
      this.selectedReason = {};
      this.addForm.user = null;
      this.selectedOpResourceType = this.opResourceType[0];
      this.lotOpId = null;
      this.lotData = {};
      this.lotNo = null;
      this.$axios
        .post(
          `/ExceptionalTime/create?logUserId=` + this.$store.state.authUser.id,
          data,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
            this.addDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.addDialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.onSearch();
          this.addDialog = false;
        })
        .then(() => {});
    },
    refreshData() {
      this.isLoading = 1;
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
          this.data = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    toggle() {
      this.$nextTick(() => {
        if (this.likesAllItems) {
          this.machineSearchData = [];
        } else {
          this.machineSearchData = this.machineSearchList.slice();
        }
      });
    }
  },
  mounted() {
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
    this.searchAreaData = this.areaDataList[0];
    this.min = null;
    this.menu = false;
    //this.refreshAreaData();
  },
  computed: {
    items() {
      return Array.from({ length: this.length }, (k, v) => v + 1);
    },
    likesAllItems() {
      return this.machineSearchData.length === this.machineSearchList.length;
    },
    likesSomeItems() {
      return this.machineSearchData.length > 0 && !this.likesAllItems;
    },
    icon() {
      if (this.likesAllItems) return "mdi-close-box";
      if (this.likesSomeItems) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    }
  },
  watch: {
    searchAreaData() {
      // console.log(this.searchAreaData);
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Machine/Search?areaNo=${this.searchAreaData.areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.machineSearchList = res.data.data != null ? res.data.data : [];
          this.machineSearchData = this.machineSearchList;
          this.isLoading = 0;
        });
    }
  },
  created() {},
  head() {
    return {
      title: this.$t("exceptionalTime") + this.$t("jobReport")
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
