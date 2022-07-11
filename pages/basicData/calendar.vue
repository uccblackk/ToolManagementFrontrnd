<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <v-col cols="12" md="2" sm="12">
              <v-select
                class="mt-2"
                v-model="areaSelected"
                :items="areaList"
                :label="$t('area')"
                item-text="areaName"
                item-value="areaNo"
                @change="onAreaSelectedChange()"
                required
              ></v-select>
            </v-col>
            <!-- 新增按鈕 -->
            <v-col cols="12" md="2" sm="12">
              <v-flex d-flex justify-end>
                <!-- 班別設定彈窗 -->
                <v-dialog v-model="dialog" persistent max-width="800px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      class="mt-4"
                      width="100%"
                      @click.stop="showAddDialog()"
                    >
                      <v-icon left dark>
                        mdi-table-edit
                      </v-icon>
                      {{ $t("setting") + $t("workShift") }}
                    </v-btn>
                  </template>
                  <v-card ref="form">
                    <v-card-title class="info">
                      <span class=" headline white--text">
                        {{ $t("setting") }}{{ $t("workShift") }}</span
                      >
                    </v-card-title>
                    <v-form ref="addForm" v-model="valid" lazy-validation>
                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("workShiftNo") }}* -->
                              <v-text-field
                                ref="areaNo"
                                :label="'*' + $t('area') + $t('No')"
                                v-model="addShiftForm.areaNo"
                                disabled
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("workShiftName") }}* -->
                              <v-text-field
                                ref="areaName"
                                :label="'*' + $t('area') + $t('name')"
                                v-model="addShiftForm.areaName"
                                disabled
                              ></v-text-field>
                            </v-col>
                          </v-row>

                          <v-banner single-line sticky>
                            {{
                              $t("workShift") + $t("calendar") + $t("setting")
                            }}
                            <template v-slot:actions>
                              <v-btn
                                color="primary"
                                small
                                outlined
                                @click="showAddShiftDialog()"
                              >
                                + {{ $t("add") }}
                              </v-btn>
                            </template>
                          </v-banner>
                        </v-container>
                        <v-container class="mt-3">
                          <v-flex xs12 class="mx-1">
                            <v-row>
                              <CalendarShiftTable
                                :calendarShiftData="calendarShiftList"
                              />
                            </v-row>
                          </v-flex>
                        </v-container>
                      </v-card-text>
                    </v-form>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn class="gray" @click="onCompleteBtnClick()">{{
                        $t("completed")
                      }}</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <!-- 班別新增彈窗 -->
                <v-dialog v-model="addShiftDialog" persistent max-width="700px">
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
                            <v-col cols="12" sm="12" md="4">
                              <v-select
                                class="mt-2"
                                v-model="workShiftSelected"
                                :items="workShiftList"
                                :label="$t('workShift')"
                                :item-text="
                                  item =>
                                    item.shiftName + ' (' + item.shiftNo + ')'
                                "
                                item-value="shiftNo"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                required
                              ></v-select>
                            </v-col>

                            <v-col cols="12" sm="12" md="8">
                              <v-layout row wrap class="mt-n6">
                                <v-flex
                                  xs3
                                  md2
                                  v-for="(items, idx) in week"
                                  :key="idx"
                                >
                                  <!-- {{ items.name }} -->

                                  <v-checkbox
                                    v-model="weekCheckBox"
                                    :label="items.name"
                                    color="blue"
                                    :value="items.value"
                                    hide-details
                                  ></v-checkbox>
                                </v-flex>
                              </v-layout>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                    </v-form>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn class="gray" @click="addShiftDialog = false">{{
                        $t("cancel")
                      }}</v-btn>
                      <v-btn class="info" dark text @click="addWorkShift()">
                        {{ $t("add") }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-flex>
            </v-col>
            <!-- 搜尋欄 -->
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-divider />
    <v-flex xs12 class="mx-1">
      <!-- 行事曆元件 -->
      <v-row class="fill-height">
        <v-col>
          <v-sheet height="64">
            <v-toolbar flat>
              <v-btn
                outlined
                class="mr-4"
                color="grey darken-2"
                @click="setToday"
              >
                {{ $t("today") }}
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="prev">
                <v-icon small>
                  mdi-chevron-left
                </v-icon>
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="next">
                <v-icon small>
                  mdi-chevron-right
                </v-icon>
              </v-btn>
              <v-toolbar-title v-if="$refs.calendar">
                {{ $refs.calendar.title }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <!-- <v-menu bottom right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    outlined
                    color="grey darken-2"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right>
                      mdi-menu-down
                    </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="type = 'day'">
                    <v-list-item-title>Day</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'week'">
                    <v-list-item-title>Week</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'month'">
                    <v-list-item-title>Month</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = '4day'">
                    <v-list-item-title>4 days</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu> -->
            </v-toolbar>
          </v-sheet>
          <v-sheet height="600">
            <v-calendar
              ref="calendar"
              v-model="focus"
              color="primary"
              :events="events"
              :event-color="getEventColor"
              type="month"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
              @change="updateRange"
            ></v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card color="grey lighten-4" min-width="350px" flat>
                <v-toolbar :color="selectedEvent.color" dark>
                  <v-btn icon>
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-toolbar-title
                    v-html="selectedEvent.name"
                  ></v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn icon>
                    <v-icon>mdi-heart</v-icon>
                  </v-btn>
                  <v-btn icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </v-toolbar>
                <v-card-text>
                  <span v-html="selectedEvent.details"></span>
                </v-card-text>
                <v-card-actions>
                  <v-btn text color="secondary" @click="selectedOpen = false">
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-col>
      </v-row>
    </v-flex>
    <v-overlay :opacity="0.5" :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",
  data() {
    return {
      overlay: true,
      weekCheckBox: [1, 2, 3, 4, 5],
      defaultWeekCheckBox: [1, 2, 3, 4, 5],
      workShiftSelected: null,
      addShiftDialog: false,
      calendarShiftList: {},
      workShiftList: {},
      shiftList: [],
      startTime: null,
      endTime: null,
      areaSelected: {
        areaNo: null,
        areaName: null
      },
      // week: [
      //   { name: "一", value: 1 },
      //   { name: "二", value: 2 },
      //   { name: "三", value: 3 },
      //   { name: "四", value: 4 },
      //   { name: "五", value: 5 },
      //   { name: "六", value: 6 },
      //   { name: "日", value: 0 }
      // ],
      week: [],
      focus: "",
      type: "month",
      areaList: {},
      typeToLabel: {
        month: "Month",
        week: "Week",
        day: "Day",
        "4day": "4 Days"
      },
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      colors: [
        "blue",
        "indigo",
        "deep-purple",
        "cyan",
        "green",
        "orange",
        "grey darken-1"
      ],
      names: [
        "Meeting",
        "Holiday",
        "PTO",
        "Travel",
        "Event",
        "Birthday",
        "Conference",
        "Party"
      ],
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
      calendarShiftList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addShiftForm: {
        areaNo: null,
        areaName: null,
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
      store.state.authUser.authority.find(x => x.menu_no == "calendar") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Area/Search?value=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      areaList: response.data,
      overlay: false
    };
  },
  methods: {
    onCompleteBtnClick() {
      this.updateCalendars();
      this.dialog = false;
    },
    getWorkShiftData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/WorkShift/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.workShiftList = res.data.data != null ? res.data.data : [];
        });
    },
    showAddShiftDialog() {
      this.addShiftDialog = true;
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      //this.updateCalendars();
      this.$refs.calendar.prev();
    },
    next() {
      //  this.updateCalendars();
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      // const open = () => {
      //   this.selectedEvent = event;
      //   this.selectedElement = nativeEvent.target;
      //   setTimeout(() => {
      //     this.selectedOpen = true;
      //   }, 10);
      // };
      // if (this.selectedOpen) {
      //   this.selectedOpen = false;
      //   setTimeout(open, 10);
      // } else {
      //   open();
      // }
      // nativeEvent.stopPropagation();
    },
    getWeekDays(dateTime, day) {
      var d = new Date(dateTime),
        month = d.getMonth(),
        mondays = [];

      d.setDate(1);

      // Get the first Monday in the month
      while (d.getDay() !== day) {
        //console.log(d.getDay());
        d.setDate(d.getDate() + 1);
      }

      // Get all the other Mondays in the month
      while (d.getMonth() === month) {
        mondays.push(new Date(d.getTime()));
        d.setDate(d.getDate() + 7);
      }

      return mondays;
    },
    getAreaShiftData() {
      const token = this.$store.state.authUser.token;
      //console.log(this.areaSelected);
      this.$axios
        .get(`/CalendarShift/Search?value=${this.areaSelected}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.shiftList = res.data.data != null ? res.data.data : [];
          //console.log(this.shiftList);
        });
    },
    updateCalendars() {
      const events = [];
      let weekDay = null;
      this.overlay = true;
      const token = this.$store.state.authUser.token;
      //console.log(this.areaSelected);
      this.$axios
        .get(`/CalendarShift/Search?value=${this.areaSelected}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.shiftList = res.data.data != null ? res.data.data : [];

          for (let k = 0; k < this.shiftList.length; k++) {
            for (let j = 0; j < this.shiftList[k].weekDay.length; j++) {
              // console.log(this.shiftList[k].weekDay[j]);
              switch (this.shiftList[k].weekDay[j]) {
                case 1:
                  weekDay = 1;
                  break;
                case 2:
                  weekDay = 2;
                  break;
                case 3:
                  weekDay = 3;
                  break;
                case 4:
                  weekDay = 4;
                  break;
                case 5:
                  weekDay = 5;
                  break;
                case 6:
                  weekDay = 6;
                  break;
                case 0:
                  weekDay = 0;
                  break;
                default:
                // code block
              }
              var day = this.getWeekDays(this.startTime, weekDay);
              //console.log(day);
              for (let i = 0; i < day.length; i++) {
                let year = new Date(this.startTime).getFullYear();
                let month = new Date(this.startTime).getMonth() + 1;
                let date = new Date(day[i]).getDate();
                // console.log(
                //   new Date(year + "/" + month + "/" + date + " 10:00:00")
                // );
                // console.log(
                //   new Date(year + "/" + month + "/" + date + " 12:00:00")
                // );
                events.push({
                  name:
                    this.shiftList[k].shiftNo +
                    " " +
                    this.shiftList[k].shiftName,
                  start: new Date(
                    year +
                      "/" +
                      month +
                      "/" +
                      date +
                      " " +
                      this.shiftList[k].shiftStartTime
                  ),
                  end: new Date(
                    year +
                      "/" +
                      month +
                      "/" +
                      date +
                      " " +
                      this.shiftList[k].shiftEndTime
                  ),
                  color: this.colors[k],
                  timed: this.shiftList[k].shiftStartTime
                });
              }
            }
          }
          this.overlay = false;
        });

      this.events = events;

      // console.log(this.events);
    },
    updateRange({ start, end }) {
      const events = [];
      let weekDay = [];
      this.startTime = new Date(`${start.date}T00:00:00`);
      this.endTime = new Date(`${end.date}T23:59:59`);
      this.updateCalendars();
      // const min = new Date(`${start.date}T00:00:00`);
      // const max = new Date(`${end.date}T23:59:59`);
      // const days = (max.getTime() - min.getTime()) / 86400000;
      // const eventCount = this.rnd(days, days + 20);

      // for (let i = 0; i < eventCount; i++) {
      //   const allDay = this.rnd(0, 3) === 0;
      //   const firstTimestamp = this.rnd(min.getTime(), max.getTime());
      //   const first = new Date(firstTimestamp - (firstTimestamp % 900000));
      //   const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000;
      //   const second = new Date(first.getTime() + secondTimestamp);

      // this.shiftList.forEach(element => {
      //   weekDay = element.weekday;
      //   console.log(weekDay);
      // });
      // var day = this.getWeekDays(this.startTime, 3);
      // for (let i = 0; i < day.length; i++) {
      //   let year = new Date(this.startTime).getFullYear();
      //   let month = new Date(this.startTime).getMonth() + 1;
      //   let date = new Date(day[i]).getDate();
      //   // console.log(new Date(year + "/" + month + "/" + date + " 10:00:00"));
      //   // console.log(new Date(year + "/" + month + "/" + date + " 12:00:00"));
      //   events.push({
      //     name: "test",
      //     start: new Date(year + "/" + month + "/" + date + " 10:00:00"),
      //     end: new Date(year + "/" + month + "/" + date + " 12:00:00"),
      //     color: this.colors[0],
      //     timed: this.rnd(0, 3) === 0
      //   });
      // }
      // }

      // this.events = events;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    onSearch() {
      //console.log(this.calendarShiftList);
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
          this.calendarShiftList = res.data.data != null ? res.data.data : [];
        });
    },

    addWorkShift() {
      //  console.log(this.workShiftSelected);
      if (this.workShiftSelected == null) {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const workShift = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        shiftNo: this.workShiftSelected,
        areaNo: this.areaSelected,
        weekday: this.weekCheckBox
      };

      this.$axios
        .post(`/CalendarShift/create`, workShift, {
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

            this.addShiftDialog = false;
          } else {
            this.$swal(workShift.shiftName, res.data.msg, "error");

            this.addShiftDialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshShiftData();
          this.weekCheckBox = this.defaultWeekCheckBox;
          this.addShiftDialog = false;
        })
        .then(() => {});
    },
    addOffShift() {
      let t3 = null;
      if (
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
        .get(`/CalendarShift/Search?value=${this.areaSelected}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.calendarShiftList = res.data.data != null ? res.data.data : [];
        });
    },
    showAddDialog() {
      this.dialog = true;
      let area = {};
      if (this.areaList.length > 0) {
        this.addShiftForm.areaNo = this.areaSelected;
        area = this.areaList.filter(x => x.areaNo === this.areaSelected);
        this.addShiftForm.areaName = area[0].areaName;
        this.refreshShiftData();
        // console.log(area);
      }
    },
    onAreaSelectedChange() {
      this.updateCalendars();
    }
  },
  mounted() {
    this.overlay = true;
    this.getWorkShiftData();
    this.week = setting.week;
    // this.$refs.calendar.checkChange();
    if (this.areaList.length > 0) {
      this.areaSelected = this.areaList[0].areaNo;
      this.getAreaShiftData();

      this.updateCalendars();

      //  console.log(this.areaSelected);
      //   this.addShiftForm.areaNo = this.areaSelected.areaNo;
    }
    //this.refreshShiftData();
  },
  computed: {},
  created() {
    this.getWorkShiftData();

    // this.$refs.calendar.checkChange();
    if (this.areaList.length > 0) {
      this.areaSelected = this.areaList[0].areaNo;
      // this.getAreaShiftData();
      // this.updateCalendars();
      //  console.log(this.areaSelected);
      //   this.addShiftForm.areaNo = this.areaSelected.areaNo;
    }
    //this.refreshShiftData();
  },
  head() {
    return {
      title: this.$t("calendar")
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
