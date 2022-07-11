<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-1">
      <v-row>
        <v-col cols="12" md="2" sm="12"> </v-col>
        <!-- 新增按鈕 -->
        <v-col cols="12" md="2" sm="12">
          <v-flex d-flex justify-end>
            <!-- 排程設定彈窗 -->
            <v-dialog v-model="dialog" persistent max-width="1500px">
              <v-card ref="form">
                <v-card-title class="info">
                  <span class=" headline white--text">
                    <v-icon left color="white">
                      mdi-timeline-text-outline
                    </v-icon>
                    {{ $t("add") }}{{ $t("schedule") }}</span
                  >
                </v-card-title>
                <v-form ref="addForm" v-model="valid" lazy-validation>
                  <v-card-text>
                    <v-row no-gutters>
                      <span class="text-h5 font-weight-black">
                        {{ $t("date") + "：" + selectedDate }}
                      </span>
                    </v-row>
                    <v-divider></v-divider>
                    <v-row>
                      <v-col cols="12" md="2">
                        <v-text-field
                          ref="areaName"
                          :label="$t('area') + $t('name')"
                          v-model="addShiftForm.areaName"
                          disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="2">
                        <v-select
                          hide-details
                          v-model="selectedShift"
                          :items="shiftData"
                          :label="$t('workShift')"
                          item-text="shiftName"
                          item-value="shiftNo"
                          @change="getDispatchedLotOpData()"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                          ref="select"
                          :label="$t('equipment')"
                          v-model="machineList"
                          :items="machineListData"
                          return-object
                          item-text="name"
                          item-value="no"
                          @change="getDispatchedLotOpData()"
                        >
                        </v-select>
                      </v-col>
                    </v-row>

                    <v-divider></v-divider>

                    <v-flex xs12 class="mx-1">
                      <v-row>
                        <LotScheduleTable
                          :dispatchedData="dispatchedData"
                          :isLoading="isLoading"
                          :areaSelected="areaSelected"
                          @update="getDispatchedLotOpData"
                        />
                      </v-row>
                    </v-flex>
                  </v-card-text>
                </v-form>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="gray" @click="onCompleteBtnClick()">{{
                    $t("completed")
                  }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-flex>
        </v-col>
        <!-- 搜尋欄 -->
      </v-row>
    </v-flex>
    <v-divider />
    <v-flex xs12 class="mx-1">
      <!-- 行事曆元件 -->
      <v-row class="fill-height">
        <v-col>
          <v-sheet height="64">
            <v-row>
              <v-col cols="1" style="text-align:left">
                <v-btn
                  color="primary"
                  class="mr-4"
                  @click.stop="showAddDialog()"
                >
                  <v-icon left dark>
                    mdi-timeline-text-outline
                  </v-icon>
                  {{ $t("schedule") }}
                </v-btn>
              </v-col>
              <v-col cols="3">
                <v-select
                  dense
                  outlined
                  hide-details
                  v-model="areaSelected"
                  :items="areaList"
                  :label="$t('area')"
                  item-text="areaName"
                  item-value="areaNo"
                  @change="onAreaSelectedChange()"
                  required
                ></v-select>
              </v-col>
              <v-col cols="2">
                <v-menu
                  v-model="menu2"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      outlined
                      v-model="selected"
                      :label="$t('date')"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      style="margin-top:-10px"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="selected"
                    :events="arrayEvents"
                    @input="menu2 = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
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
                <span class="font-weight-black text-h5" v-if="$refs.calendar">
                  {{ $refs.calendar.title }}
                </span>
                <v-btn fab text small color="grey darken-2" @click="next">
                  <v-icon small>
                    mdi-chevron-right
                  </v-icon>
                </v-btn>
              </v-col>
              <!-- <v-col cols="5">
                <v-flex xs12 class="text-left ">
                  <v-chip
                    label
                    :color="getStatusLabelColor(item.name)"
                    v-for="(item, idx) in statusLabel"
                    :key="idx"
                    class="mx-5 px-5"
                    outlined
                  >
                    <v-icon x-small>mdi-circle</v-icon
                    ><strong> {{ item.name }}</strong></v-chip
                  >
                </v-flex>
              </v-col> -->

              <v-col v-if="isDrag == true" cols="1" style="text-align:right"
                ><v-btn depressed @click.stop="onSaveBtnClick()">
                  <v-icon left dark> mdi-content-save-outline </v-icon
                  >{{ $t("save") }}</v-btn
                >
              </v-col>
              <v-col v-if="isDrag == true" cols="1" style="text-align:left"
                ><v-btn
                  class="error"
                  depressed
                  @click.stop="updateLotWipData()"
                >
                  <v-icon left dark> mdi-refresh </v-icon
                  >{{ $t("reset") }}</v-btn
                >
              </v-col>
            </v-row>
          </v-sheet>
          <v-sheet height="900px">
            <v-calendar
              ref="calendar"
              v-model="selected"
              color="primary"
              :events="totalEvents"
              :event-color="getEventColor"
              type="category"
              :categories="machineName"
              category-text="name"
              category-show-all
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
              @change="updateRange"
              :event-ripple="false"
              @mousedown:event="startDrag"
              @mousedown:time="startTime1"
              @mousemove:time="mouseMove"
              @mouseup:time="endDrag"
              @mouseleave.native="cancelDrag"
            >
              <template #category="{ category }">
                <div class="text-center mt-n0">
                  <v-row no-gutters justify="center">
                    <v-col cols="12" justify="center">
                      <v-img
                        v-if="getMachineImage(category) != ''"
                        :src="getMachineImage(category)"
                        width="auto"
                        height="150px"
                        contain
                        style="text-align:center"
                      ></v-img>
                      <v-avatar
                        class="mt-15"
                        v-else
                        color="grey darken-1 white--text text-caption"
                        style="max-width: 150px"
                        dark
                      >
                        <span
                          class="text-truncate"
                          style="max-width: 100px;font-size:16px"
                        >
                          {{ category }}
                        </span>
                      </v-avatar>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col>
                      {{ category }}
                    </v-col>
                  </v-row>
                </div>
              </template>
              <template v-slot:day-body="{ date, week }">
                <div class="v-current-time" :style="y"></div>
              </template>
              <template v-slot:event="{ event, timed, eventSummary }">
                <div class="v-event-draggable" v-html="eventSummary()"></div>
                <div
                  v-if="timed"
                  class="v-event-drag-bottom"
                  @mousedown.stop="extendBottom(event)"
                ></div>
              </template>
            </v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card color="grey lighten-4" min-width="350px" flat>
                <v-toolbar :color="selectedEvent.color" dark>
                  <v-btn icon>
                    <v-icon>mdi-file</v-icon>
                  </v-btn>
                  <v-toolbar-title
                    v-html="selectedEvent.name"
                  ></v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                  <v-row no-gutters>
                    <v-col>
                      <v-alert dense text :color="selectedEvent.color">
                        <span
                          class="text-h5 font-weight-black"
                          v-if="selectedEvent.status == 'dispatch'"
                          >{{ $t("already") + $t("dispatch") }}</span
                        >
                        <span class="text-h5 font-weight-black" v-else>{{
                          $t(selectedEvent.status)
                        }}</span>
                      </v-alert>
                    </v-col>
                    <v-spacer />
                    <v-col v-if="selectedEvent.isProduction == 'Y'">
                      <v-alert dense text type="success">
                        <span class="text-h6 font-weight-black ">
                          {{ $t("already") + $t("production") }}</span
                        >
                      </v-alert>
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-alert
                      dense
                      text
                      class="grey lighten-4 text-caption font-weight-black"
                    >
                      <v-icon small>
                        mdi-cog-transfer
                      </v-icon>
                      <span>{{ $t("equipment") + " : " }}</span>
                      <span>{{ selectedEvent.category }}</span>
                    </v-alert>
                  </v-row>
                  <v-row no-gutters>
                    <v-alert
                      dense
                      text
                      class="grey lighten-4 text-caption font-weight-black"
                    >
                      <v-icon small>
                        mdi-calendar-clock
                      </v-icon>
                      <span>{{
                        $t("actual") +
                          $t("date") +
                          " : " +
                          selectedEvent.actualStart +
                          " ~ " +
                          selectedEvent.actualEnd
                      }}</span>
                    </v-alert>
                  </v-row>
                  <v-row no-gutters>
                    <v-alert
                      dense
                      text
                      class="grey lighten-4 text-caption font-weight-black"
                    >
                      <v-icon small>
                        mdi-calendar-clock
                      </v-icon>
                      <span>{{ $t("schedule") + $t("date") + " : " }} </span>

                      <span>{{
                        new Date(selectedEvent.scheduleStart).toLocaleString() +
                          " ~ " +
                          new Date(selectedEvent.scheduleEnd).toLocaleString() +
                          " "
                      }}</span>
                    </v-alert>
                  </v-row>
                </v-card-text>
                <!-- <v-card-actions>
                  <v-btn text color="secondary" @click="selectedOpen = false">
                    Cancel
                  </v-btn>
                </v-card-actions> -->
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
import LotScheduleTable from "~/components/order/LotScheduleTable.vue";
export default {
  middleware: "auth",
  data() {
    return {
      lotWipData: [],
      isDrag: false,
      arrayEvents: null,
      totalEvents: [],
      statusLabel: [
        { name: this.$t("already") + this.$t("dispatch"), value: "dispatch" },
        { name: this.$t("producted"), value: "producted" },
        { name: this.$t("pause"), value: "pause" },
        { name: this.$t("complete"), value: "complete" },
        { name: this.$t("projectClose"), value: "close" }
      ],
      y: "top:0px",
      isLoading: 0,
      dispatchedData: [],
      lineData: [],
      machineListData: [],
      machineList: {},
      lineList: {},
      selectedType: {},
      opResourceType: [
        { name: "*", value: null },
        { name: this.$t("equipment"), value: "E" }
      ],
      selectedDate: "",
      calendarDate: "",
      selectedShift: "",
      value: "",
      ready: true,
      machineData: [],
      machineName: [],
      shiftData: [],
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
      week: [
        { name: "一", value: 1 },
        { name: "二", value: 2 },
        { name: "三", value: 3 },
        { name: "四", value: 4 },
        { name: "五", value: 5 },
        { name: "六", value: 6 },
        { name: "日", value: 0 }
      ],
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
      selected: new Date().toISOString().substr(0, 10),
      partSearchType: "partNo",
      partSearchValue: "",
      workShiftData: [],
      origDate: null,
      exceptionReasonList: [],
      exceptionActionList: [],
      dragEvent: null,
      dragStart: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null
    };
  },
  components: {
    LotScheduleTable
  },
  watch: {
    selected() {
      if (this.isDrag == true && this.origDate != this.selected) {
        const answer = window.confirm(
          "調整的排程資料尚未儲存，是否確定離開此頁面?"
        );
        if (answer) {
          this.origDate = this.selected;
        } else {
          this.selected = this.origDate;
        }
      } else {
        this.origDate = this.selected;
      }
    }
  },
  computed: {
    cal() {
      return this.ready ? this.$refs.calendar : null;
    },

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
      store.state.authUser.authority.find(
        x => x.menu_no == "scheduleManagement"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Area/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    //console.log(response.data);

    return {
      areaList: response.data,

      overlay: false
    };
  },
  methods: {
    onSaveBtnClick() {
      //console.log(this.totalEvents);
      let updateWipData = [];
      this.lotWipData.forEach(lotwip => {
        let updateData = this.totalEvents.find(x => x.id == lotwip.id);
        if (updateData != undefined) {
          updateWipData.push({
            id: lotwip.id,
            lotOpId: lotwip.lotOpId,
            resourceType: lotwip.resourceType,
            resourceNo: lotwip.resourceNo,
            resourceName: lotwip.resourceName,
            userNo: lotwip.userNo,
            userName: lotwip.userName,
            shiftNo: lotwip.shiftNo,
            shiftName: lotwip.shiftName,
            dispatchStartDate: lotwip.dispatchStartDate,
            dispatchEndDate: lotwip.dispatchEndDate,
            scheduleStartTime: moment(updateData.start).format("HH:mm"),
            scheduleEndTime: moment(updateData.end).format("HH:mm"),
            status: "dispatch",
            statusDate: new Date(),
            cycleTime: lotwip.cycleTime,
            planQty: lotwip.planQty,
            inQty: lotwip.inQty,
            outQty: lotwip.outQty,
            ngQty: lotwip.ngQty,
            inTime: lotwip.inTime,
            actualStartTime: lotwip.actualStartTime,
            actualEndTime: lotwip.actualEndTime
          });
        }
      });
      console.log(updateWipData);
      this.updateScheduleTime(updateWipData);
    },
    updateScheduleTime(updateWipData) {
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(
          `/LotWip/UpdateScheduleTime?areaNo=${this.areaSelected}&type=M`,
          updateWipData,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("editSuccess"), "", "success");
          } else {
            this.$swal(this.$t("editFailed"), "", "error");
          }
          // this.refreshShiftData();
          this.updateLotWipData();
        })
        .then(() => {});
    },

    roundTime(time, down = true) {
      const roundTo = 15; // minutes
      const roundDownTime = roundTo * 60 * 1000;

      return down
        ? time - (time % roundDownTime)
        : time + (roundDownTime - (time % roundDownTime));
    },
    toTime(tms) {
      return new Date(
        tms.year,
        tms.month - 1,
        tms.day,
        tms.hour,
        tms.minute
      ).getTime();
    },
    startDrag({ event, timed }) {
      //console.log(event);
      if (event && timed && event.status == "dispatch") {
        this.isDrag = true;
        this.dragEvent = event;
        this.dragTime = null;
        this.extendOriginal = null;
      }
    },
    startTime1(tms) {
      const mouse = this.toTime(tms);

      if (this.dragEvent && this.dragTime === null) {
        this.isDrag = true;
        const start = this.dragEvent.start;

        this.dragTime = mouse - start;
      } else {
        //產生新的排程資料
        // this.createStart = this.roundTime(mouse);
        // this.createEvent = {
        //   name: `Event #${this.events.length}`,
        //   color: this.rndElement(this.colors),
        //   start: this.createStart,
        //   end: this.createStart,
        //   timed: true
        // };
        // this.events.push(this.createEvent);
      }
    },
    extendBottom(event) {
      //console.log("extendBottom");
      if (event.status == "dispatch") {
        this.isDrag = true;
        this.createEvent = event;
        this.createStart = event.start;
        this.extendOriginal = event.end;
      }
    },
    mouseMove(tms) {
      const mouse = this.toTime(tms);

      if (this.dragEvent && this.dragTime !== null) {
        const start = this.dragEvent.start;
        const end = this.dragEvent.end;
        const duration = end - start;
        const newStartTime = mouse - this.dragTime;
        const newStart = this.roundTime(newStartTime);
        const newEnd = newStart + duration;

        this.dragEvent.start = newStart;
        this.dragEvent.end = newEnd;
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false);
        const min = Math.min(mouseRounded, this.createStart);
        const max = Math.max(mouseRounded, this.createStart);

        this.createEvent.start = min;
        this.createEvent.end = max;
      }
    },
    endDrag() {
      this.dragTime = null;
      this.dragEvent = null;
      this.createEvent = null;
      this.createStart = null;
      this.extendOriginal = null;
    },
    cancelDrag() {
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal;
        } else {
          const i = this.events.indexOf(this.createEvent);
          if (i !== -1) {
            this.events.splice(i, 1);
          }
        }
      }

      this.createEvent = null;
      this.createStart = null;
      this.dragTime = null;
      this.dragEvent = null;
    },
    getStatusLabelColor(status) {
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
    getDispatchedLotOpData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(
          `/LotWip/SearchByArea?areaNo=${this.areaSelected}&status=dispatch&startDate=${this.calendarDate}&endDate=${this.calendarDate}`,
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
            if (this.machineList == "*") {
              if (
                data[i].inQty == null &&
                this.machineListData.find(x => x.no == data[i].resourceNo) !=
                  undefined &&
                data[i].shiftNo == this.selectedShift
              ) {
                datalist.push(data[i]);
              }
            } else {
              if (
                data[i].inQty == null &&
                data[i].resourceNo == this.machineList.no &&
                data[i].shiftNo == this.selectedShift
              ) {
                datalist.push(data[i]);
              }
            }
          }
          //console.log(this.selectedShift);
          this.dispatchedData = datalist;
          //console.log(this.dispatchedData);
          this.isLoading = 0;
        });
    },
    nowY() {
      let hour = new Date().getHours();
      let min = new Date().getMinutes();
      //console.log(hour);
      // console.log(min);
      this.y = "top:" + (hour * 48 + min * 0.8) + "px";
    },
    getMachineImage(machineName) {
      let image = "";
      let data = this.machineData.find(x => x.name == machineName);
      // console.log(data);
      if (data != undefined) {
        if (data.img != "" && data.img != null) {
          image = data.img;
        }
      }
      return image;
    },
    onCompleteBtnClick() {
      this.dialog = false;

      this.updateLotWipData();
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
    updateCalendarTime() {
      // console.log(this.$refs.calendar);
      // console.log(this.$refs.calendar.value);
    },
    setToday() {
      this.selected = new Date().toISOString().substr(0, 10);
      this.nowY();
      this.scrollToTime();
    },
    prev() {
      this.$refs.calendar.prev();
      this.nowY();

      this.scrollToTime();
    },
    next() {
      this.$refs.calendar.next();

      this.nowY();

      this.scrollToTime();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => {
          this.selectedOpen = true;
        }, 10);
      };
      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }
      nativeEvent.stopPropagation();
    },
    getWeekDays(dateTime, day) {
      var d = new Date(dateTime),
        month = d.getMonth(),
        mondays = [];

      d.setDate(1);

      // Get the first Monday in the month
      while (d.getDay() !== day) {
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

    updateRange({ start, end }) {
      this.updateLotWipData();
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    showAddDialog() {
      this.dialog = true;
      this.machineListData = [];
      if (this.$refs.calendar.value != "") {
        this.selectedDate =
          this.$refs.calendar.value +
          "(" +
          this.week.find(x => x.value == this.$refs.calendar.eventWeekdays[0])
            .name +
          ")";
        this.calendarDate = this.$refs.calendar.value;
      } else {
        this.selectedDate =
          this.$refs.calendar.days[0].date +
          "(" +
          this.week.find(x => x.value == this.$refs.calendar.eventWeekdays[0])
            .name +
          ")";
        this.calendarDate = this.$refs.calendar.days[0].date;
      }

      this.selectedType = this.opResourceType[0];
      if (this.shiftData.length > 0) {
        // console.log(this.shiftData);
        this.selectedShift = this.shiftData[0].shiftNo;
      }

      this.machineListData = this.machineData;
      this.machineListData.unshift("*");
      //
      this.machineList = this.machineListData[0];
      let area = {};
      if (this.areaList.length > 0) {
        this.addShiftForm.areaNo = this.areaSelected;
        area = this.areaList.filter(x => x.areaNo === this.areaSelected);
        this.addShiftForm.areaName = area[0].areaName;
        this.getDispatchedLotOpData();
        // console.log(area);
      }
    },
    onAreaSelectedChange() {
      //this.updateCalendars();
      if (this.isDrag == true) {
        const answer = window.confirm(
          "調整的排程資料尚未儲存，是否確定離開此頁面?"
        );
        if (answer) {
          this.updateMachineData();
          this.updateLotWipData();
          this.getTotalLotWipData();
        } else {
        }
      } else {
        this.updateMachineData();
        this.updateLotWipData();
        this.getTotalLotWipData();
      }
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
    updateLotWipData() {
      this.isDrag = false;
      this.totalEvents = [];
      this.lotWipData = [];
      if (this.$refs.calendar.value != "") {
        this.selectedDate =
          this.$refs.calendar.value +
          "(" +
          this.week.find(x => x.value == this.$refs.calendar.eventWeekdays[0])
            .name +
          ")";
        this.calendarDate = this.$refs.calendar.value;
      } else {
        this.selectedDate =
          this.$refs.calendar.days[0].date +
          "(" +
          this.week.find(x => x.value == this.$refs.calendar.eventWeekdays[0])
            .name +
          ")";
        this.calendarDate = this.$refs.calendar.days[0].date;
      }
      // console.log(this.$refs.calendar);
      // console.log(this.$refs.calendar.value);
      //  console.log(this.calendarDate);
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(
          `/LotWip/SearchByArea?areaNo=${this.areaSelected}&startDate=${this.calendarDate}&endDate=${this.calendarDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          let lotWipData = [];

          this.events = [];
          if (res.data.data != undefined) {
            lotWipData = res.data.data;
            //lotWipData = res.data.data.filter(x => x.scheduleStartTime != null);
            this.lotWipData = lotWipData;
            // console.log(lotWipData);
            lotWipData.forEach(data => {
              let timed = false;

              if (data.scheduleStartTime != null || data.actualEndTime != null)
                timed = true;

              this.fetchEvents(
                data.id,
                data.lotData.lotNo,
                data.lotOpData.opName,
                data.dispatchStartDate,
                data.dispatchEndDate,
                data.scheduleStartTime,
                data.scheduleEndTime,
                data.actualStartTime,
                data.actualEndTime,
                data.lotOpData.status,
                data.resourceName,
                timed,
                data.isProduction
              );
            });
            console.log(this.events);
            this.totalEvents = this.events;
            this.overlay = false;
          }
        })
        .then(() => {});
    },
    getTotalLotWipData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/LotWip/SearchAreaLotWipCount?areaNo=${this.areaSelected}`, {
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
    fetchEvents(
      id,
      name,
      opName,
      dispatchStartDate,
      dispatchEndDate,
      scheduleStart,
      scheduleEnd,
      actualStart,
      actualEnd,
      status,
      machineName,
      timed,
      isProduction
    ) {
      let events = {};
      let scheduleStartTime = new Date(dispatchStartDate + " 00:00:00");
      let scheduleEndTime = new Date(dispatchEndDate + " 00:00:00");
      let showStart = new Date(dispatchStartDate + " 00:00:00");
      let showEnd = new Date(dispatchEndDate + " 00:00:00");
      let actualStartTime = "--";
      let actualEndTime = "--";
      if (scheduleStart != null) {
        scheduleStartTime = new Date(dispatchStartDate + " " + scheduleStart);
        showStart = new Date(dispatchStartDate + " " + scheduleStart);
      }
      if (scheduleEnd != null) {
        scheduleEndTime = new Date(dispatchEndDate + " " + scheduleEnd);
        showEnd = new Date(dispatchEndDate + " " + scheduleEnd);
      }
      if (actualStart != null) {
        actualStartTime = new Date(actualStart).toLocaleString();
      }
      if (actualEnd != null) {
        actualEndTime = new Date(actualEnd).toLocaleString();
        showStart = new Date(actualStart);
        showEnd = new Date(actualEnd);
      }

      events = {
        id: id,
        name: name + " (" + opName + ")",
        start: showStart,
        end: showEnd,
        actualStart: actualStartTime,
        actualEnd: actualEndTime,
        scheduleStart: scheduleStartTime,
        scheduleEnd: scheduleEndTime,
        color: this.getStatusColor(status),
        timed: timed,
        category: machineName,
        status: status,
        isProduction: isProduction
      };
      //console.log(this.events);
      this.events.push(events);
    },
    updateMachineData() {
      if (this.areaList.length > 0) {
        this.machineName = [];
        this.machineData = [];
        this.machineData = this.areaList.find(
          x => x.areaNo == this.areaSelected
        ).machineData;
        // console.log(this.areaList);
        this.machineData.forEach(data => {
          if (data != "*") {
            this.machineName.push(data.name);
          }
        });
        this.shiftData = this.areaList.find(
          x => x.areaNo == this.areaSelected
        ).workShiftData;
      }
      this.scrollToTime();
    },
    scrollToTime() {
      const time = new Date().getHours() * 60 + new Date().getMinutes();
      const first = Math.max(0, time - (time % 30) - 30);

      this.$refs.calendar.scrollToTime(first);
    }
  },
  mounted() {
    this.scrollToTime();
    this.nowY();
    this.overlay = true;
    //this.getWorkShiftData();
    if (this.areaList.length > 0) {
      this.machineData = this.areaList[0].machineData;
      this.shiftData = this.areaList[0].workShiftData;
      this.machineData.forEach(data => {
        this.machineName.push(data.name);
      });
    }
    //console.log(this.$refs.calendar.days[0].date);
    this.selectedDate =
      this.$refs.calendar.days[0].date +
      "(" +
      this.week.find(x => x.value == this.$refs.calendar.eventWeekdays[0])
        .name +
      ")";
    //this.calendarDate = this.$refs.calendar.days[0].date;
    // this.$refs.calendar.checkChange();
    if (this.areaList.length > 0) {
      this.areaSelected = this.areaList[0].areaNo;
      this.getAreaShiftData();

      this.updateLotWipData();
      this.getTotalLotWipData();
      //  console.log(this.areaSelected);
      //   this.addShiftForm.areaNo = this.areaSelected.areaNo;
    }
    //this.refreshShiftData();
  },
  beforeRouteLeave(to, from, next) {
    if (this.isDrag == true) {
      const answer = window.confirm(
        "調整的排程資料尚未儲存，是否確定離開此頁面?"
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("scheduleManagement")
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
.google {
  ::v-deep .v-calendar-daily_head-weekday {
    display: inline-block;
    position: absolute;
    width: 56px;
  }

  ::v-deep .v-calendar-daily_head-day-label {
    display: inline-block;
    position: absolute;
    top: 20px;
    z-index: 1;
  }

  ::v-deep .google-category {
    height: 80px;
    position: relative;

    .google-category-name {
      text-align: center;
      padding: 8px;
      font-size: 11px;
    }

    .google-category-avatar {
      background-color: rgba(0, 0, 0, 0.3);
      width: 40px;
      height: 40px;
      position: absolute;
      border-radius: 20px;
      margin-bottom: 20px;
    }
  }
}
.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    height: 2px;
    background-color: #ea4335;
    position: absolute;
    left: -1px;
    right: 0;
    pointer-events: none;
  }
}
.v-event-draggable {
  padding-left: 6px;
}

.v-event-timed {
  user-select: none;
  -webkit-user-select: none;
}

.v-event-drag-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 4px;
  cursor: ns-resize;

  &::after {
    display: none;
    position: absolute;
    left: 50%;
    height: 4px;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
    width: 16px;
    margin-left: -8px;
    opacity: 0.8;
    content: "";
  }

  &:hover::after {
    display: block;
  }
}
</style>
