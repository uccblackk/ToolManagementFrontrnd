<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <!-- 新增按鈕 -->
            <v-col cols="2" md="2">
              <v-flex d-flex justify-end>
                <!-- 新增生產區域彈窗 -->
                <v-dialog v-model="dialog" persistent max-width="600px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      class="mt-4"
                      width="100%"
                      @click.stop="showAddDialog = true"
                    >
                      <v-icon left dark>
                        mdi-plus-thick
                      </v-icon>
                      {{ $t("add") }}
                    </v-btn>
                  </template>
                  <v-card ref="form">
                    <v-card-title class="info">
                      <span class=" headline white--text">
                        {{ $t("add") }}{{ $t("workShift") }}</span
                      >
                    </v-card-title>
                    <v-form ref="addForm" v-model="valid" lazy-validation>
                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("workShiftNo") }}* -->
                              <v-text-field
                                ref="workShiftNo"
                                :label="'*' + $t('workShift') + $t('No')"
                                v-model="addShiftForm.no"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                required
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("workShiftName") }}* -->
                              <v-text-field
                                ref="workShiftName"
                                :label="'*' + $t('workShift') + $t('name')"
                                v-model="addShiftForm.name"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                required
                              ></v-text-field>
                            </v-col>
                            <v-col cols="5" sm="5">
                              <v-menu
                                ref="menu"
                                v-model="menu"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="addShiftForm.startTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="addShiftForm.startTime"
                                    :label="
                                      '*' + $t('shiftOn') + $t('startTime')
                                    "
                                    :rules="noRules"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menu"
                                  v-model="addShiftForm.startTime"
                                  full-width
                                  ampm-in-title
                                  format="24hr"
                                  scrollable
                                  @click:minute="
                                    $refs.menu.save(addShiftForm.startTime)
                                  "
                                  :max="addShiftForm.endTime"
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                            <v-col cols="1" sm="1" class="mt-7">
                              ~
                            </v-col>

                            <v-col cols="5" sm="5">
                              <v-menu
                                ref="menu1"
                                v-model="menu1"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="addShiftForm.endTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="addShiftForm.endTime"
                                    :label="'*' + $t('shiftOn') + $t('endTime')"
                                    :rules="noRules"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menu1"
                                  v-model="addShiftForm.endTime"
                                  full-width
                                  ampm-in-title
                                  format="24hr"
                                  scrollable
                                  @click:minute="
                                    $refs.menu1.save(addShiftForm.endTime)
                                  "
                                  :min="addShiftForm.startTime"
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>

                          <v-banner single-line sticky>{{
                            $t("shiftOff") + $t("time") + $t("setting")
                          }}</v-banner>
                        </v-container>
                        <v-row>
                          <v-col cols="5" sm="5">
                            <v-menu
                              ref="menu2"
                              v-model="menu2"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              :return-value.sync="addShiftForm.offStartTime"
                              transition="scale-transition"
                              offset-y
                              max-width="290px"
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="addShiftForm.offStartTime"
                                  :label="$t('shiftOff') + $t('startTime')"
                                  prepend-icon="mdi-clock-time-four"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-time-picker
                                v-if="menu2"
                                v-model="addShiftForm.offStartTime"
                                full-width
                                ampm-in-title
                                format="24hr"
                                scrollable
                                @click:minute="
                                  $refs.menu2.save(addShiftForm.offStartTime)
                                "
                                :max="addShiftForm.endTime"
                                :min="addShiftForm.startTime"
                              ></v-time-picker>
                            </v-menu>
                          </v-col>
                          <v-col cols="1" sm="1" class="mt-7">
                            ~
                          </v-col>

                          <v-col cols="5" sm="5">
                            <v-menu
                              ref="menu3"
                              v-model="menu3"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              :return-value.sync="addShiftForm.offEndTime"
                              transition="scale-transition"
                              offset-y
                              max-width="290px"
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="addShiftForm.offEndTime"
                                  :label="$t('shiftOff') + $t('endTime')"
                                  prepend-icon="mdi-clock-time-four"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-time-picker
                                v-if="menu3"
                                v-model="addShiftForm.offEndTime"
                                full-width
                                ampm-in-title
                                format="24hr"
                                scrollable
                                @click:minute="
                                  $refs.menu3.save(addShiftForm.offEndTime)
                                "
                                :min="addShiftForm.offStartTime"
                                :max="addShiftForm.endTime"
                              ></v-time-picker>
                            </v-menu>
                          </v-col>
                        </v-row>

                        <small>*{{ $t("inputRequired") }}</small>
                      </v-card-text>
                    </v-form>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn class="gray" @click="dialog = false">{{
                        $t("cancel")
                      }}</v-btn>
                      <v-btn class="info" dark text @click="addWorkShift()">
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
            <!-- 搜尋欄 -->
            <v-col cols="8" md="10">
              <v-form onSubmit="return false;">
                <v-text-field
                  clearable
                  v-model="workShiftSearchValue"
                  :label="this.$t('workShift') + this.$t('search')"
                  append-icon="mdi-magnify"
                  required
                  @click:append="onSearch"
                  @keyup.enter="onSearch()"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex xs12 class="mx-1">
      <WorkShiftTable
        :workShiftData="workShiftList"
        :isLoading="isLoading"
        :workShiftSearchValue="workShiftSearchValue"
        @update="onSearch"
      />
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
      isLoading: 0,
      valid: true,
      noRules: [v => !!v || this.$t("mustInput")],
      shiftOffStartTime: null,
      shiftOffEndTime: null,
      shiftStartTime: null,
      shiftEndTime: null,
      menu: false,
      menu1: false,
      menu2: false,
      menu3: false,
      modal2: false,
      formHasErrors: false,
      errorMessages: "",
      workShiftSearchValue: "",
      workShiftList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addShiftForm: {
        no: null,
        name: null,
        startTime: null,
        endTime: null,
        offStartTime: null,
        offEndTime: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      workShiftData: [],

      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        workShiftNo: this.workShiftNo,
        workShiftName: this.workShiftName
      };
    }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "workShift") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/WorkShift/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    return {
      workShiftList: response.data
    };
  },
  methods: {
    onSearch() {
      this.isLoading = 1;
      //console.log(this.workShiftList);
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(`/WorkShift/Search?value=${this.workShiftSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.workShiftList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },

    addWorkShift() {
      //.log(this.addShiftForm.offStartTime);
      const token = this.$store.state.authUser.token;
      if (
        this.addShiftForm.no == null ||
        this.addShiftForm.name == null ||
        this.addShiftForm.startTime == null ||
        this.addShiftForm.endTime == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }

      const workShift = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        shiftNo: this.addShiftForm.no,
        shiftName: this.addShiftForm.name,
        startTime: this.addShiftForm.startTime,
        endTime: this.addShiftForm.endTime,
        status: "Y"
      };

      this.$axios
        .post(`/WorkShift/create`, workShift, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              workShift.shiftName,
              this.$t("createSuccess"),
              "success"
            );
            this.dialog = false;
          } else {
            this.$swal(workShift.shiftName, res.data.msg, "error");
            this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.addOffShift();
          this.refreshShiftData();
          this.dialog = false;
        })
        .then(() => {});
    },
    addOffShift() {
      let t3 = null;
      if (
        this.addShiftForm.offStartTime == null ||
        this.addShiftForm.offEndTime == null
      ) {
        return;
      } else if (
        this.addShiftForm.offStartTime != null &&
        this.addShiftForm.offEndTime != null
      ) {
        var t1 = moment(this.addShiftForm.offStartTime, "HH:MM");
        var t2 = moment(this.addShiftForm.offEndTime, "HH:MM");
        t3 = moment(t2.diff(t1)).format("HH:MM");
      }

      const token = this.$store.state.authUser.token;
      const workShift = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        shiftNo: this.addShiftForm.no,
        startTime: this.addShiftForm.offStartTime,
        endTime: this.addShiftForm.offEndTime,
        duration: t3
      };
      this.addShiftForm.no = "";
      this.addShiftForm.name = "";
      this.addShiftForm.offStartTime = null;
      this.addShiftForm.offEndTime = null;

      this.$axios
        .post(`/ShiftOff/create`, workShift, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              workShift.shiftName,
              this.$t("createSuccess"),
              "success"
            );
          } else {
            this.$swal(workShift.shiftName, res.data.msg, "error");

            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
        })
        .then(() => {});
    },
    refreshShiftData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/WorkShift/Search?value=${this.workShiftSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.workShiftList = res.data.data != null ? res.data.data : [];
        });
    }
  },
  mounted() {
    //this.refreshShiftData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("workShift")
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
