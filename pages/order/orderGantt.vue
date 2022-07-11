<template>
  <v-layout column justify-center align-center>
    <div style="width:100%">
      <!-- APS彈窗 -->
      <v-dialog
        v-model="APSDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar dark color="success">
            <v-progress-linear
              color="success"
              bottom
              absolute
              :active="true"
              indeterminate
            ></v-progress-linear>

            <v-btn icon dark @click="APSDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{
              "APS" + $t("schedule") + $t("setting")
            }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn
                :disabled="lotWipList.length == 0"
                dark
                text
                @click="APSStart()"
              >
                <v-icon>mdi-arrow-right-drop-circle</v-icon>
                {{ $t("start") }}
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-list three-line subheader>
            <v-subheader>{{
              "本次排程任務數量：" + tasks.filter(x => x.type == "task").length
            }}</v-subheader>
          </v-list>
          <v-divider></v-divider>

          <v-subheader>General</v-subheader>

          <v-row>
            <v-col cols="2" style="text-align:right" class="mt-2">
              {{ $t("schedule") + $t("mode") }}</v-col
            >
            <v-col cols="2">
              <v-select
                outlined
                dense
                v-model="APSMode"
                :items="modeItem"
                item-text="text"
                item-value="value"
              ></v-select
            ></v-col>
          </v-row>
          <v-row>
            <v-col cols="2" style="text-align:right" class="mt-2">
              {{ $t("schedule") + $t("start") + $t("time") }}</v-col
            >
            <v-col cols="2">
              <v-select
                outlined
                dense
                v-model="APSStartTime"
                :items="startTimeItem"
                item-value="value"
                item-text="name"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="2" style="text-align:right" class="mt-2">
              {{
                $t("default") + $t("standardTime") + "(" + $t("seconds") + ")"
              }}</v-col
            >
            <v-col cols="2">
              <v-text-field
                outlined
                dense
                oninput="if(this.value < 1) this.value = 1"
                :rules="[v => !!v || this.$t('mustInput')]"
                v-model="defaultTime"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- <div
            class="text-center"
            style="top:70%;position:fixed; left: 80%;
  transform: translate(-50%, -50%);"
          >
            <v-img
              src="/Organizing projects.gif"
              width="auto"
              contain
              height="500px"
            ></v-img>
            <a href="https://www.freepik.com/vectors/process"
              >Process vector created by stories - www.freepik.com</a
            >
          </div> -->
        </v-card>
      </v-dialog>
      <!-- loading視窗 -->
      <v-dialog v-model="loadingDialog" hide-overlay persistent width="300">
        <v-card color="success" dark>
          <v-card-text>
            {{ "APS schedule..." }}
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
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
              >
              </v-text-field>
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
        <v-col cols="12" md="2">
          <v-select
            v-model="statusCheckedList"
            :items="statusLabel"
            item-text="name"
            item-value="value"
            :label="this.$t('jobNo') + this.$t('status')"
            multiple
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-form onSubmit="return false;">
            <v-text-field
              clearable
              v-model="moSearchValue"
              :label="this.$t('jobNo') + this.$t('search')"
              append-icon="mdi-magnify"
              required
              @click:append="onSearch()"
              @keyup.enter="onSearch()"
            ></v-text-field>
          </v-form>
        </v-col>

        <v-spacer />
        <v-col cols="12" md="2" style="text-align:right">
          <v-btn
            class="success"
            @click="onAPSClick()"
            v-if="autoSchedule == 'ON'"
          >
            <v-icon left>mdi-domain</v-icon>{{ "APS排程" }}</v-btn
          >
        </v-col>
        <v-col cols="12" md="1">
          <v-select
            dense
            outlined
            label="每頁顯示數量"
            v-model="itemPerPage"
            :items="showItems"
            @input="onSearch()"
          >
          </v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-alert v-if="moData.length > 0" dense text type="info" class="ma-2">
            {{ $t("jobNo") + $t("count") }}：<strong>
              {{ totalCount + ", " }}</strong
            >
            {{ $t("order") + $t("count") }}：<strong>{{ totalTask }}</strong>
          </v-alert>
          <v-alert v-else dense text type="warning" class="ma-2">
            {{ $t("jobNo") + $t("count") }}：<strong>
              {{ totalCount + ", " }}</strong
            >
            {{ $t("order") + $t("count") }}：<strong>{{ totalTask }}</strong>
          </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <gantt-elastic
          :options="options"
          :tasks="tasks"
          v-model="task"
          @tasks-changed="tasksUpdate"
          @options-changed="optionsUpdate"
          @dynamic-style-changed="styleUpdate"
          @chart-task-click="onTaskClick()"
        >
          <gantt-header slot="header"></gantt-header>
        </gantt-elastic>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-pagination
            :total-visible="7"
            v-model="page"
            :length="totalPage"
            circle
            color="primary"
            @input="onPageChange()"
          ></v-pagination>
        </v-col>
      </v-row>
      <v-snackbar v-model="snackbar">
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>

    <v-overlay :value="overlay">
      <v-progress-circular
        v-if="loadingDialog == false"
        indeterminate
        size="64"
        >{{ "update..." }}</v-progress-circular
      >
    </v-overlay>
  </v-layout>
</template>

<script>
// import GanttElastic from "gantt-elastic";
// import GanttHeader from "gantt-elastic-header";
import dayjs from "dayjs";
import moment, { duration } from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",
  components: {
    // GanttElastic,
    // GanttHeader
  },
  data() {
    return {
      autoSchedule: null,
      loadingDialog: false,
      arrayEvents: [],
      loading: false,
      APSStartTime: null,
      APSMode: "",
      startTimeItem: [
        { value: 0, name: "now" },
        { value: 10, name: "10 mins later" },
        { value: 20, name: "20 mins later" },
        { value: 30, name: "30 mins later" },
        { value: 40, name: "40 mins later" },
        { value: 50, name: "50 mins later" },
        { value: 60, name: "60 mins later" }
      ],
      modeItem: [
        { value: "normal", text: "Normal" },
        { value: "ortools", text: "OrTools" }
      ],
      defaultTime: 0,
      APSDialog: false,
      interval: 0,
      defaultCycleTime: 0,
      totalTask: 0,
      totalCount: 0,
      showItems: [10, 20, 30, 40, 50, 100],
      page: 1,
      itemPerPage: 20,
      totalPage: 1,
      snackbar: false,
      snackbarText: "",
      lotWipList: [],
      task: null,
      overlay: true,
      moData: [],
      isLoading: 0,
      moSearchValue: "",
      statusCheckedList: [],
      statusLabel: [
        { name: this.$t("new"), value: "new" },
        { name: this.$t("already") + this.$t("dispatch"), value: "dispatch" },
        { name: this.$t("producted"), value: "producted" },
        { name: this.$t("pause"), value: "pause" },
        { name: this.$t("complete"), value: "complete" },
        { name: this.$t("projectClose"), value: "projectClose" }
      ],
      min: null,
      dateRangeText: null,
      dates: [],
      itemList: [],
      startDate: null,
      endDate: null,
      menu: false,
      tasks: [
        {
          id: 0,
          label: "N/A",
          equipment: "N/A",
          start: this.getDate(0),
          duration: 1 * 24 * 60 * 60 * 1000,
          percent: 0.0,
          status: "N/A",
          type: "project",
          parentId: null,
          style: {
            base: {
              fill: "white",
              stroke: "gray"
            }
          }
        }
      ],

      options: {
        taskMapping: {
          progress: "percent"
        },
        maxRows: 100,
        maxHeight: 500,
        title: {
          label: this.$t("jobNo") + this.$t("progress"),
          html: false
        },
        row: {
          height: 24
        },
        calendar: {
          hour: {
            display: true
          }
        },
        chart: {
          progress: {
            bar: false
          },
          expander: {
            display: true
          },
          text: {
            offset: 10,
            color: "white"
          }
        },
        taskList: {
          expander: {
            straight: false
          },
          columns: [
            // {
            //   id: 1,
            //   label: this.$t("No"),
            //   value: "id",
            //   width: 40,
            //   events: {
            //     mouseenter({ event, data, column }) {
            //       alert("description clicked!\n" + data.label);
            //     }
            //   }
            // },
            {
              id: 2,
              label: this.$t("jobNo") + "/" + this.$t("lot"),
              value: "label",

              width: 150,
              expander: true,
              html: true,
              events: {
                // click({ data, column }) {
                //   alert("description clicked!\n" + data.label);
                // }
              }
            },
            {
              id: 100,
              label: this.$t("customer"),
              value: "customer",
              width: 130,
              html: true
            },
            {
              id: 3,
              label: this.$t("equipment"),
              value: "equipment",
              width: 130,
              html: true
            },
            {
              id: 8,
              label: this.$t("count"),
              value: "qty",
              width: 50,
              html: true
            },
            {
              id: 7,
              label: "Start",
              value: task => dayjs(task.start).format("YYYY-MM-DD"),
              width: 80
            },
            {
              id: 6,
              label: "End",
              value: task =>
                moment(task.start)
                  .add(task.duration, "ms")

                  .format("YYYY-MM-DD"),
              width: 80
            },
            {
              id: 4,
              label: this.$t("status"),
              value: "status",
              width: 60
            },
            {
              id: 5,
              label: "%",
              value: "progress",
              width: 60,
              style: {
                "task-list-header-label": {
                  "text-align": "center",
                  width: "100%"
                },
                "task-list-item-value-container": {
                  "text-align": "center",
                  width: "100%"
                }
              }
            }
          ]
        },
        locale: {
          name: "zh-TW",
          Now: "Now",
          "X-Scale": "Zoom-X",
          "Y-Scale": "Zoom-Y",
          "Task list width": "Task list",
          "Before/After": "Expand",
          "Display task list": "Task list"
        }
      },
      dynamicStyle: {},
      lastId: 16
    };
  },
  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "orderGantt") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }

    return {};
  },
  methods: {
    onAPSClick() {
      this.APSDialog = true;
      this.defaultTime = 1;
      this.APSMode = this.modeItem[0];
      this.APSStartTime = this.startTimeItem[0].value;
    },
    onPageChange() {
      this.onSearch(this.page);
    },
    addTask(
      id,
      label,
      customer,
      equipment,
      start,
      duration,
      percent,
      qty,
      type,
      parentId,
      status,
      color
    ) {
      if (percent == "NaN") {
        percent = 0.0;
        percent = percent.toFixed(1);
      }
      this.tasks.push({
        id: id,
        label: label,
        customer: customer,
        equipment: equipment,
        start: start, //getDate()
        duration: duration, //毫秒
        percent: percent,
        qty: qty,
        type: type,
        parentId: parentId,
        status: status,
        style: {
          base: {
            fill: color,
            stroke: "white"
          }
        }
      });
    },
    onSearch(page) {
      //console.log(this.statusCheckedList);
      this.overlay = true;
      this.moData = [];
      if (page == undefined) {
        this.page = 1;
      }
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/Mo/SearchForPaging?value=${this.moSearchValue}&status=${this.statusCheckedList}&startDate=${this.startDate}&endDate=${this.endDate}&page=${this.page}&itemPerPage=${this.itemPerPage}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.overlay = false;
          // console.log(res.data.data);
          this.moData = res.data.data != null ? res.data.data : [];
          this.totalTask = res.data.totalTask;
          this.totalCount = res.data.totalCount;
          this.totalPage = res.data.totalPage;
        })
        .then(() => {
          this.updataMoTasks();
        });
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
    onClearClicked() {
      this.startDate = null;
      this.endDate = null;
      this.dates = [];
    },
    onTaskClick() {
      //console.log();
    },
    getDate(hours) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      const timeStamp = new Date(
        currentYear,
        currentMonth,
        currentDay,
        0,
        0,
        0
      ).getTime();
      //console.log(new Date(timeStamp + hours * 60 * 60 * 1000).getTime());
      return new Date(timeStamp + hours * 60 * 60 * 1000).getTime();
    },
    updataMoTasks() {
      let id = 0;
      let start, end, duration, percent, color;
      let equipment = "";
      let lastEndDate = null;
      this.lotWipList = [];
      // console.log(this.moData);
      if (this.moData.length > 0) {
        this.tasks = [];
        for (let i = 0; i < this.moData.length; i++) {
          lastEndDate = new Date(this.moData[i].planStartDate + " 00:00:00");
          start = new Date(this.moData[i].planStartDate + " 00:00:00");
          end = moment(this.moData[i].planEndDate + " 00:00:00")
            .add(1, "d")
            .toDate();
          //console.log(start);
          //console.log(end);
          duration = moment
            .duration(end.getTime() - start.getTime())
            .asMilliseconds();
          //console.log(duration);
          percent =
            (parseFloat(this.moData[i].completedQty) /
              parseFloat(this.moData[i].qty)) *
            100;
          color = this.getStatusColor(this.moData[i].status);
          //加入工單資料
          // this.addTask(
          //   this.moData[i].id,
          //   this.moData[i].moNo,
          //   "",
          //   start.getTime(),
          //   duration,
          //   percent.toFixed(1),
          //   "project",
          //   null,
          //   this.$t(this.moData[i].status),
          //   color
          // );

          id++;
          // console.log(this.moData[i]);
          let totalDuration = 0;
          if (this.moData[i].lotList.length > 0) {
            for (let j = 0; j < this.moData[i].lotList.length; j++) {
              //  console.log(this.moData[i].lotList[j]);
              //加入生產批資料
              start = new Date(this.moData[i].planStartDate + " 00:00:00");
              end = moment(this.moData[i].planEndDate + " 00:00:00")
                .add(1, "d")
                .toDate();

              duration = moment
                .duration(end.getTime() - start.getTime())
                .asMilliseconds();
              percent =
                (parseFloat(this.moData[i].lotList[j].completedQty) /
                  parseFloat(this.moData[i].lotList[j].qty)) *
                100;
              color = this.getStatusColor(this.moData[i].status);
              //新增生產批資料
              // this.addTask(
              //   this.moData[i].lotList[j].id,
              //   this.moData[i].lotList[j].lotNo,
              //   "",
              //   start.getTime(),
              //   duration,
              //   percent.toFixed(1),
              //   "milestone",
              //   this.moData[i].id,
              //   this.$t(this.moData[i].lotList[j].status),
              //   color
              // );
              if (this.moData[i].lotList[j].lotOpList.length > 0) {
                for (
                  let k = 0;
                  k < this.moData[i].lotList[j].lotOpList.length;
                  k++
                ) {
                  equipment = "N/A";
                  let firstStart = new Date(
                    this.moData[i].planStartDate + " 00:00:00"
                  ).getTime();
                  //加入生產批下的製程資料
                  if (this.moData[i].lotList[j].lotWipList.length > 0) {
                    let lotWipData = this.moData[i].lotList[j].lotWipList.find(
                      x =>
                        x.lotOpId == this.moData[i].lotList[j].lotOpList[k].id
                    );
                    let firstLotWipData = this.moData[i].lotList[
                      j
                    ].lotWipList.find(
                      x =>
                        x.lotOpId == this.moData[i].lotList[j].lotOpList[0].id
                    );

                    this.lotWipList.push(lotWipData);
                    color = this.getStatusColor(
                      this.moData[i].lotList[j].lotOpList[k].status
                    );
                    //若已完成派工,則有派工單可以查詢
                    if (lotWipData != undefined) {
                      equipment = lotWipData.resourceName;
                      //console.log(lotWipData);
                      //若派工日期不為null
                      if (lotWipData.dispatchStartDate != null) {
                        //若派工時間不為null(代表有完成排程)
                        if (lotWipData.scheduleStartTime != null) {
                          if (firstLotWipData != undefined) {
                            firstStart = new Date(
                              firstLotWipData.dispatchStartDate +
                                " " +
                                firstLotWipData.scheduleStartTime
                            ).getTime();
                          }
                          start = new Date(
                            lotWipData.dispatchStartDate +
                              " " +
                              lotWipData.scheduleStartTime
                          );
                          end = new Date(
                            lotWipData.dispatchEndDate +
                              " " +
                              lotWipData.scheduleEndTime
                          );
                          totalDuration += end.getTime() - start.getTime();
                        } else {
                          //若派工時間為null(沒有完成排程)
                          //需要依製程等分
                          if (firstLotWipData != undefined) {
                            firstStart = new Date(
                              firstLotWipData.dispatchStartDate + " 00:00:00"
                            ).getTime();
                          }
                          let moDuration = moment
                            .duration(
                              moment(this.moData[i].planEndDate + " 00:00:00")
                                .add(1, "d")
                                .valueOf() -
                                new Date(
                                  this.moData[i].planStartDate + " 00:00:00"
                                ).getTime()
                            )
                            .asMilliseconds();
                          let cycleTimeData = this.moData[i].cycleTimeData.find(
                            x =>
                              x.opNo ==
                              this.moData[i].lotList[j].lotOpList[k].opNo
                          );

                          // console.log(cycleTimeData);
                          if (cycleTimeData != undefined) {
                            start = lastEndDate;
                            end = new Date(
                              lastEndDate.getTime() +
                                (parseFloat(cycleTimeData.fixTime) +
                                  (parseFloat(cycleTimeData.varTime) /
                                    parseFloat(cycleTimeData.baseQty)) *
                                    parseFloat(this.moData[i].lotList[j].qty)) *
                                  1000
                            );
                            lastEndDate = end;
                          } else {
                            let length = this.moData[i].lotList[j].lotOpList
                              .length;
                            start = new Date(
                              new Date(
                                this.moData[i].planStartDate + " 00:00:00"
                              ).getTime() +
                                (moDuration / length) * k
                            );
                            end = new Date(
                              new Date(
                                this.moData[i].planStartDate + " 00:00:00"
                              ).getTime() +
                                (moDuration / length) * (k + 1)
                            );
                          }
                          totalDuration += end.getTime() - start.getTime();
                        }

                        //console.log(firstLotWipData);
                        // if (firstLotWipData != undefined) {
                        //   firstStart = new Date(
                        //     firstLotWipData.dispatchStartDate +
                        //       " " +
                        //       firstLotWipData.scheduleStartTime
                        //   ).getTime();
                        //   console.log(firstLotWipData);
                        //   console.log(firstStart);
                        // }
                      }

                      //若該生產批已開工或完成,則依實際開始和結束時間為主
                      //若已有實際開工時間
                      if (lotWipData.actualStartTime != null) {
                        //若已有實際完成時間
                        if (lotWipData.actualEndTime != null) {
                          start = new Date(lotWipData.actualStartTime);
                          end = new Date(lotWipData.actualEndTime);
                          //console.log(start);
                          //console.log(end);
                        } else {
                          start = new Date(lotWipData.actualStartTime);
                          end = new Date();
                        }
                      }
                    } else {
                      //若沒有派工單(代表還未派工)
                      //預估起始跟完成時間沿用工單的時間
                      start = new Date(
                        this.moData[i].planStartDate + " 00:00:00"
                      );
                      end = moment(this.moData[i].planEndDate + " 00:00:00")
                        .add(1, "d")
                        .toDate();
                      color = "grey";
                      equipment = "";
                    }
                  } else {
                    //若當前還沒進行派工,分成製程數量等分依製程順序顯示
                    let moDuration = moment
                      .duration(
                        moment(this.moData[i].planEndDate + " 00:00:00")
                          .add(1, "d")
                          .valueOf() -
                          new Date(
                            this.moData[i].planStartDate + " 00:00:00"
                          ).getTime()
                      )
                      .asMilliseconds();
                    let length = this.moData[i].lotList[j].lotOpList.length;
                    start = new Date(
                      new Date(
                        this.moData[i].planStartDate + " 00:00:00"
                      ).getTime() +
                        (moDuration / length) * k
                    );
                    end = new Date(
                      new Date(
                        this.moData[i].planStartDate + " 00:00:00"
                      ).getTime() +
                        (moDuration / length) * (k + 1)
                    );
                  }

                  //加入工單和生產批資料
                  if (k == this.moData[i].lotList[j].lotOpList.length - 1) {
                    if (totalDuration == 0) {
                      let moStart = new Date(
                        this.moData[i].planStartDate + " 00:00:00"
                      );
                      let moEnd = moment(
                        this.moData[i].planEndDate + " 00:00:00"
                      )
                        .add(1, "d")
                        .toDate();

                      let moDuration = moment
                        .duration(moEnd.getTime() - moStart.getTime())
                        .asMilliseconds();
                      totalDuration = moDuration;
                    }

                    //加入工單資料

                    if (
                      this.tasks.find(x => x.id == this.moData[i].id) ==
                      undefined
                    ) {
                      this.addTask(
                        this.moData[i].id,
                        this.moData[i].moNo,
                        this.moData[i].customer,
                        "",
                        firstStart,
                        totalDuration,
                        percent.toFixed(1),
                        this.moData[i].lotQty + "/" + this.moData[i].qty,
                        "project",
                        null,
                        this.$t(this.moData[i].status),
                        color
                      );
                    }

                    //加入生產批資料
                    this.addTask(
                      this.moData[i].lotList[j].id,
                      this.moData[i].lotList[j].lotNo,
                      this.moData[i].customer,
                      "",
                      firstStart,
                      totalDuration,
                      percent.toFixed(1),
                      this.moData[i].lotList[j].qty,
                      "milestone",
                      this.moData[i].id,
                      this.$t(this.moData[i].lotList[j].status),
                      color
                    );
                  }

                  duration = moment
                    .duration(end.getTime() - start.getTime())
                    .asMilliseconds();
                  percent =
                    (parseFloat(
                      this.moData[i].lotList[j].lotOpList[k].completedQty
                    ) /
                      parseFloat(
                        this.moData[i].lotList[j].lotOpList[k].dispatchQty
                      )) *
                    100;
                  //新增生產批下的製程Task資料
                  this.addTask(
                    this.moData[i].lotList[j].lotOpList[k].id,
                    this.moData[i].lotList[j].lotNo +
                      "(" +
                      this.moData[i].lotList[j].lotOpList[k].opName +
                      ")",
                    this.moData[i].customer,
                    equipment,
                    start.getTime(),
                    duration,
                    percent.toFixed(1),
                    this.moData[i].lotList[j].lotOpList[k].qty,
                    "task",
                    this.moData[i].lotList[j].id,
                    this.$t(this.moData[i].lotList[j].lotOpList[k].status),
                    color
                  );
                }
              }
            }
          }
        }
      } else {
        this.tasks = [
          {
            id: 0,
            label: "N/A",
            equipment: "N/A",
            start: this.getDate(0),
            duration: 1 * 24 * 60 * 60 * 1000,
            percent: 0.0,
            qty: 0,
            status: "N/A",
            type: "project",
            parentId: null,
            style: {
              base: {
                fill: "white",
                stroke: "gray"
              }
            }
          }
        ];
      }
      // console.log(this.tasks);
    },
    APSStart() {
      this.APSDialog = false;
      this.loadingDialog = true;
      this.overlay = true;
      this.loading = true;
      console.log(this.APSMode);
      if (this.lotWipList.length < 0) {
        return;
      }
      // console.log(this.lotWipList);
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(
          `/LotWip/APSUpdate?interval=${this.APSStartTime}&defaultCycleTime=${this.defaultTime}&mode=${this.APSMode.value}`,
          this.lotWipList,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.loadingDialog = false;
          this.loading = false;

          if (res.data.isSuccess) {
            // this.$swal(this.$t("editSuccess"), "", "success");
            this.snackbar = true;
            this.snackbarText = this.$t("editSuccess");
          } else {
            //this.$swal(this.$t("editFailed"), "", "error");
            this.snackbar = true;
            this.snackbarText = this.$t("editFailed");
          }
          // this.refreshShiftData();
          //this.$emit("update");
        })
        .then(() => {
          this.onSearch();
        });
    },
    getStatusColor(status) {
      let color = "";

      switch (status) {
        case "new":
          color = "#9E9E9E";
          break;
        case "createlot":
          color = "#757575";
          break;
        case "dispatch":
          color = "#FB8C00";
          break;
        case "producted":
          color = "#00C853";
          break;
        case "pause":
          color = "#E53935";
          break;
        case "complete":
          color = "#0091EA";
          break;
        default:
          color = "#37474F";
          break;
      }
      //console.log(color);
      return color;
    },

    tasksUpdate(tasks) {
      this.tasks = tasks;
    },
    optionsUpdate(options) {
      this.options = options;
    },
    styleUpdate(style) {
      this.dynamicStyle = style;
    },
    getTotalMoData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Mo/SearchMoCount`, {
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
    }
  },
  head() {
    return {
      title: this.$t("orderGantt")
    };
  },
  // beforeRouteLeave(to, from, next) {
  //   if (this.loadingDialog == true) {
  //     const answer = window.confirm("Do you really want to leave?");
  //     if (answer) {
  //       next();
  //     } else {
  //       next(false);
  //     }
  //   }
  // },
  mounted() {
    this.autoSchedule = setting.autoSchedule;
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
    this.min = null;
    this.menu = false;
    this.onSearch();
    this.getTotalMoData();
    // this.updataMoTasks();
    //this.refreshAreaData();
  }
};
</script>
