<template>
  <v-layout row wrap>
    <div style="width:100%">
      <v-flex xs12 class="mx-1">
        <!-- 新增排程彈窗 -->
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
                    {{ $t("date") + "：" + myChartStart }}
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
        <v-row>
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
          <v-col cols="4">
            <v-row no-gutters>
              <v-col cols="1">
                <v-btn fab text small color="grey darken-2" @click="prev">
                  <v-icon small>
                    mdi-chevron-left
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col>
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
                    @input="onDateTimeInput()"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="2">
                <v-btn fab text small color="grey darken-2" @click="next">
                  <v-icon small>
                    mdi-chevron-right
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col cols="2">
                <v-btn @click="onTodayClick()" outlined>{{
                  $t("today")
                }}</v-btn>
              </v-col>
            </v-row>
          </v-col>

          <v-spacer />
          <v-col cols="2" style="text-align:right">
            <v-btn color="primary" class="mr-4" @click.stop="showAddDialog()">
              <v-icon left dark>
                mdi-timeline-text-outline
              </v-icon>
              {{ $t("lot") + $t("schedule") }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <div :style="chartStyle">
            <div id="machineScheduleChart" :style="chartStyle"></div>
          </div>
        </v-row>
        <v-row> </v-row>
      </v-flex>
    </div>
    <div style="width:100%" v-if="areaMachine.length != 0">
      <ScheduledListTable :processData="lotWipData" />
    </div>
  </v-layout>
</template>
<script>
import moment from "moment";
import dayjs from "dayjs";
import { GGanttChart, GGanttRow } from "vue-ganttastic";
import LotScheduleTable from "~/components/order/LotScheduleTable.vue";
import ScheduledListTable from "~/components/machine/ScheduledListTable.vue";
export default {
  middleware: "auth",
  data() {
    return {
      chartStyle: "width:100%",
      tasks: [
        {
          id: 1,
          label: "MO20210923",
          user: "",
          start: this.getDate(-24 * 5),
          duration: 4 * 24 * 60 * 60 * 1000,
          percent: 50,
          status: this.$t("producted"),
          type: "project",
          style: {
            base: {
              fill: "#1EBC61",
              stroke: "#0EAC51"
            }
          }

          //collapsed: true,
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
          }
        },
        taskList: {
          expander: {
            straight: false
          },
          columns: [
            {
              id: 1,
              label: this.$t("No"),
              value: "id",
              width: 40,
              events: {
                mouseenter({ event, data, column }) {
                  alert("description clicked!\n" + data.label);
                }
              }
            },

            {
              id: 2,
              label: this.$t("equipment"),
              value: "label",
              width: 130,
              html: true
            },
            // {
            //   id: 3,
            //   label: "Start",
            //   value: task => dayjs(task.start).format("YYYY-MM-DD"),
            //   width: 100
            // },
            // {
            //   id: 6,
            //   label: "End",
            //   value: task =>
            //     moment(task.start)
            //       .add(task.duration, "ms")
            //       .format("YYYY-MM-DD"),
            //   width: 100
            // },
            {
              id: 4,
              label: this.$t("status"),
              value: "status",
              width: 68
            },
            {
              id: 5,
              label: "%",
              value: "progress",
              width: 40,
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
        },
        dynamicStyle: {},
        lastId: 16
      },
      events: [],
      totalEvents: [],
      selectedType: {},
      opResourceType: [
        { name: "*", value: null },
        { name: this.$t("equipment"), value: "E" }
      ],
      chart: null,
      valid: false,
      dispatchedData: [],
      isLoading: 0,
      machineListData: [],
      machineList: {},
      selectedShift: "",
      addShiftForm: {
        areaNo: null,
        areaName: null,
        startTime: null,
        endTime: null,
        offStartTime: null,
        offEndTime: null
      },
      dialog: false,
      selected: moment().format("YYYY-MM-DD"),
      arrayEvents: [],
      menu2: false,
      areaSelected: {
        areaNo: null,
        areaName: null
      },
      areaList: [],
      shiftData: [],
      machineData: [],
      areaMachine: [],
      lotWipData: [],
      rowLabelWidth: 10,
      grid: true,
      hours: [...Array(24).keys()],
      highlightedHours: [
        moment()
          .add(1, "h")
          .hour()
      ],
      highlightOnHover: true,
      myChartStart: moment().format("YYYY-MM-DD"),
      myChartEnd: moment()
        .add(1, "d")
        .format("YYYY-MM-DD"),
      lotWipData: [],
      dataPoints: [],
      timerId: null,
      chart: null
      // myBars1: [
      //   {
      //     label: "test1",
      //     myBarStart: "2021-09-22 01:30",
      //     myBarEnd: "2021-09-22 06:00",
      //     ganttBarConfig: {
      //       immobile: true
      //     }
      //   }
      // ],
      // myBars2: [
      //   {
      //     label: "test2",
      //     myBarStart: "2021-09-22 15:10",
      //     myBarEnd: "2021-09-22 20:00",
      //     ganttBarConfig: {
      //       color: "white",
      //       backgroundColor: "#a23def",
      //       handles: true
      //     }
      //   }
      // ]
    };
  },
  components: {
    GGanttChart,
    GGanttRow,
    LotScheduleTable,
    ScheduledListTable
  },
  computed: {},

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(
        x => x.menu_no == "machineSchedule"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Area/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    let areaList = [];
    areaList = response.data;
    // areaList.unshift({ areaNo: null, areaName: "ALL" });
    //console.log(response.data);

    return {
      areaList: areaList,

      overlay: false
    };
  },
  methods: {
    onTodayClick() {
      this.selected = moment().format("YYYY-MM-DD");
      this.myChartStart = this.selected;
      const myMomentObject = moment(this.selected, "YYYY-MM-DD").add(1, "d");
      this.myChartEnd = myMomentObject.format("YYYY-MM-DD");
      this.updateLotWipData();
    },
    transData() {
      this.dataPoints = [];
      let data = [];
      let task = {};
      let startTime = null;
      let startTimeString = null;
      let endTime = null;
      let endTimeString = null;
      for (let i = 0; i < this.areaMachine.length; i++) {
        let lotWip = this.lotWipData.filter(
          x => x.resourceNo == this.areaMachine[i].no
        );
        if (lotWip.length > 0 && lotWip != undefined) {
          let k = 0;
          let existLotWip = false;
          lotWip.forEach(e => {
            startTime = null;
            startTimeString = null;
            endTime = null;
            endTimeString = null;
            if (e.scheduleStartTime != null && e.actualStartTime == null) {
              if (
                e.dispatchStartDate ==
                moment(this.selected).format("YYYY-MM-DD")
              ) {
                startTime = new Date(
                  e.dispatchStartDate + " " + e.scheduleStartTime
                );
              } else {
                startTime = new Date(this.selected + " 00:00:00");
              }
              if (
                e.dispatchEndDate == moment(this.selected).format("YYYY-MM-DD")
              ) {
                endTime = new Date(e.dispatchEndDate + " " + e.scheduleEndTime);
              } else {
                endTime = new Date(this.selected + " 23:59:59");
              }
              startTimeString = new Date(
                e.dispatchStartDate + " " + e.scheduleStartTime
              );
              endTimeString = new Date(
                e.dispatchEndDate + " " + e.scheduleEndTime
              );
            } else if (e.status == "complete") {
              startTime = new Date(e.actualStartTime);
              endTime = new Date(e.actualEndTime);
              startTimeString = startTime;
              endTimeString = endTime;
              //console.log(startTime);
            } else if (e.status == "in" || e.status == "out") {
              startTime = new Date(e.actualStartTime);
              endTime = new Date();
              startTimeString = startTime;
              endTimeString = endTime;
            }
            // console.log(e.dispatchStartDate);
            // console.log(moment(this.selected).format("YYYY/MM/DD"));
            if (startTime != null && endTime != null) {
              existLotWip = true;
              this.dataPoints.push(
                this.getItem(
                  i,
                  this.areaMachine[i],
                  startTime,
                  endTime,
                  startTimeString,
                  endTimeString,
                  e.lotOpData.status,
                  e.lotData.lotNo,
                  e.lotOpData.opName
                )
              );
            }
          });
          if (existLotWip == false) {
            this.dataPoints.push({
              y: null,
              x: this.areaMachine.indexOf(this.areaMachine[i]),
              label: this.areaMachine[i].name
            });
          }
        } else {
          this.dataPoints.push({
            y: null,
            x: this.areaMachine.indexOf(this.areaMachine[i]),
            label: this.areaMachine[i].name
          });
        }
      }
      console.log(this.dataPoints);
    },
    getItem(
      i,
      machine,
      startTime,
      endTime,
      actualStartTime,
      actualEndTime,
      status,
      lotNo,
      opName
    ) {
      // console.log(startTime);
      // console.log(endTime);
      const diffDay = Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24);
      // console.log(diffDay);
      const diff = moment.duration(
        actualEndTime.getTime() - actualStartTime.getTime()
      );

      let color = "red";

      let item = {
        startTime: startTime,
        endTime: endTime,
        y: [startTime.getTime(), endTime.getTime()],
        x: this.areaMachine.indexOf(machine),
        color: this.getLotWipStatusColor(status),
        label: machine.name,
        start: moment(actualStartTime).format("YYYY/MM/DD HH:mm:ss"),
        end: moment(actualEndTime).format("YYYY/MM/DD HH:mm:ss"),
        status: this.$t(status),
        opName: opName,
        lotNo: lotNo,
        label6: `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`
      };
      //console.log(item);
      return item;
    },

    renderData() {
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      // let backgroundColor = "white";

      // this.chart = null;
      //console.log(moment(this.selected).format("YYYY-MM-DD (dddd)"));

      this.chart = new CanvasJS.Chart("machineScheduleChart", {
        animationEnabled: true,
        rangeChanged: function(e) {
          //console.log(e.trigger);
          if (e.trigger == "zoom") {
            e.chart.axisY[0].interval = 0;
            // console.log(e);
          } else {
            e.chart.axisY[0].interval = 1 * 60 * 60 * 1000;
            // console.log(e);
          }
        },
        animationDuration: 30,
        exportEnabled: true,
        dataPointMaxWidth: 30,
        dataPointMinWidth: 0.1,
        // title: {
        //   text: moment(this.selected).format("YYYY-MM-DD (dddd)"),
        //   fontSize: 36
        // },
        zoomType: "y",
        axisX: {
          labelFontSize: 16,
          // interval: 1,
          gridThickness: 1,
          gridColor: "#D3D3D3"
        },
        zoomEnabled: true,
        axisY: {
          labelFontSize: 16,
          stripLines: [
            { value: new Date().getTime(), thickness: 1, color: "red" }
          ],
          gridThickness: 1,
          gridColor: "#D3D3D3",
          minimum: new Date(this.selected + " 00:00:00").getTime(),
          maximum: new Date(this.selected + " 00:00:00").setDate(
            new Date(this.selected).getDate() + 1
          ),
          interval: 1 * 60 * 60 * 1000,
          labelFormatter: function(e) {
            return CanvasJS.formatDate(e.value, "HH:mm");
          }
        },
        legend: { cursor: "pointer" },
        data: [
          {
            bevelEnabled: true,
            yValueType: "dateTime",
            // yValueFormatString: "DD MMM hh:mm TT",
            type: "rangeBar",
            toolTipContent:
              "<b>{start} ~ {end}</b><br/><b>生產批編號</b> : {lotNo}<br/><b>製程</b> : {opName} <br/><b>狀態</b> : {status} ",
            dataPoints: this.dataPoints
          }
        ]
      });

      //console.log(this.chart);
      // this.chart.render();

      this.updateChart();
      // clearTimeout(this.timerId);
    },
    updateChart() {
      let startValue = 0;
      let endValue = 0;
      // console.log(moment(x));
      // console.log(moment());
      if (this.selected == moment().format("YYYY-MM-DD")) {
        //console.log(moment().format("YYYY-MM-DD"));
        startValue = moment()
          .startOf("day")
          .valueOf();
        endValue = new Date().getTime();
      } else if (moment(this.selected).valueOf() < moment().valueOf()) {
        startValue = moment(this.selected, "YYYY-MM-DD").valueOf();
        let end = new Date(this.selected + " 00:00:00").setDate(
          new Date(this.selected).getDate() + 1
        );
        endValue = end;
        // console.log(moment(x));
        // console.log(endValue);
      }
      this.chart.options.axisY.stripLines[0] = {
        value: new Date().getTime(),
        thickness: 1,
        color: "white",
        label: moment().format("HH:mm:ss"),
        labelFontColor: "black",
        showOnTop: true
      };
      this.chart.options.axisY.stripLines[1] = {
        startValue: startValue,
        endValue: endValue,
        opacity: 0.1,
        color: "black",

        showOnTop: true
      };
      //console.log(chart);
      this.chart.render();
      if (this.selected == moment().format("YYYY-MM-DD")) {
        this.timerId = setTimeout(this.updateChart, 1000);
      }
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
    doScrollToPostion() {
      this.$refs.gantt.scrollToPostionHandle({ x: 100, y: 100 });
    },
    doScrollToTime() {
      this.$refs.gantt.scrollToTimehandle("Fri, 31 Jul 2020 12:41:39 GMT");
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
    getLotWipStatusColor(status) {
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
    updateLotWipData() {
      this.lotWipData = [];
      clearTimeout(this.timerId);
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(
          `/LotWip/SearchByArea?areaNo=${this.areaSelected}&startDate=${this.myChartStart}&endDate=${this.myChartStart}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.events = [];
          if (res.data.data != undefined) {
            this.lotWipData = res.data.data;
            // this.lotWipData = res.data.data.filter(
            //   x => x.scheduleStartTime != null
            // );

            this.overlay = false;
          }
        })
        .then(() => {
          //this.getLotWipData();
          this.transData();
          this.renderData();
        });
    },
    fetchEvents(name, opName, start, end, status, areaMachine) {
      let events = {};

      events = {
        name: name + " (" + opName + ")",
        start: new Date(this.calendarDate + " " + start),
        end: new Date(this.calendarDate + " " + end),
        color: this.getStatusColor(status),
        timed: true,
        category: areaMachine,
        status: status
      };
      //console.log(this.events);
      this.events.push(events);
    },
    onCompleteBtnClick() {
      this.dialog = false;

      this.updateLotWipData();
    },
    showAddDialog() {
      this.dialog = true;
      this.machineListData = [];

      this.selectedType = this.opResourceType[0];
      if (this.shiftData.length > 0) {
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
    getDispatchedLotOpData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(
          `/LotWip/SearchByArea?areaNo=${this.areaSelected}&status=dispatch&startDate=${this.myChartStart}&endDate=${this.myChartStart}`,
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

          this.dispatchedData = datalist;
          // console.log(this.dispatchedData);
          this.isLoading = 0;
        });
    },
    prev() {
      const start = moment(this.selected, "YYYY-MM-DD").subtract(1, "d");
      const end = moment(this.selected, "YYYY-MM-DD");
      this.myChartStart = start.format("YYYY-MM-DD");
      //console.log(start);
      this.myChartEnd = end.format("YYYY-MM-DD");
      this.selected = start.format("YYYY-MM-DD");
      this.updateLotWipData();
    },
    next() {
      const start = moment(this.selected, "YYYY-MM-DD").add(1, "d");
      const end = moment(this.selected, "YYYY-MM-DD").add(2, "d");
      this.myChartStart = start.format("YYYY-MM-DD");
      //console.log(start);
      this.myChartEnd = end.format("YYYY-MM-DD");
      this.selected = start.format("YYYY-MM-DD");
      this.updateLotWipData();
    },
    onDateTimeInput() {
      this.menu2 = false;
      //console.log(this.selected);
      this.myChartStart = this.selected;
      const myMomentObject = moment(this.selected, "YYYY-MM-DD").add(1, "d");
      this.myChartEnd = myMomentObject.format("YYYY-MM-DD");
      this.updateLotWipData();
    },
    getLotWipData() {
      this.tasks = [];
      // this.areaMachine.forEach(machine => {

      // if (machineData.length > 0) {
      let data = [];
      for (let i = 0; i < this.areaMachine.length; i++) {
        data = [];
        let machineData = this.lotWipData.filter(
          x => x.resourceNo == this.areaMachine[i].no
        );
        //console.log(machineData);
        if (machineData.length > 0 && machineData != undefined) {
          let k = 0;
          machineData.forEach(element => {
            let actualEndTime = new Date(
              element.dispatchEndDate + " " + element.scheduleEndTime
            );
            let actualStartTime = new Date(
              element.dispatchStartDate + " " + element.scheduleStartTime
            );
            //console.log(actualEndTime.getTime() - actualStartTime.getTime());
            data.push({
              id: i.toString() + k.toString(),
              // label:
              //   element.lotData.lotNo + "(" + element.lotOpData.opName + ")",
              status: this.$t(element.lotOpData.status),
              start: actualStartTime.getTime(),
              duration: actualEndTime.getTime() - actualStartTime.getTime(),
              percent: 100,
              style: {
                base: {
                  fill: this.getLotWipStatusColor(element.lotOpData.status),
                  stroke: "white"
                }
              },
              type: "task"
            });
            k++;
          });
        }
        this.tasks.push({
          id: i,
          label: this.areaMachine[i].name,
          user: "",

          start: moment(this.selected, "YYYY-MM-DD"),
          duration: 2 * 60 * 1000,
          percent: 0,
          type: "group",
          status: null,
          tasks: data,
          collapsed: false
        });
      }

      // }

      // });
      console.log(this.tasks);
    },

    onAreaSelectedChange() {
      //this.updateCalendars();

      this.updateMachineData();
      this.updateLotWipData();
      this.getTotalLotWipData();
    },
    updateMachineData() {
      let chartHeight = "100";
      if (this.areaList.length > 0) {
        this.areaMachine = [];
        this.machineData = [];
        if (this.areaSelected != null) {
          this.machineData = this.areaList.find(
            x => x.areaNo == this.areaSelected
          ).machineData;
        } else {
          this.areaList.forEach(e => {
            if (e.machineData != undefined) {
              e.machineData.forEach(m => {
                this.areaMachine.push({ name: m.name, no: m.no });
              });
            }
          });
        }
        // console.log(this.areaList);
        this.machineData.forEach(data => {
          if (data != "*") {
            this.areaMachine.push({ name: data.name, no: data.no });
          }
        });
        if (this.areaMachine.length != 0) {
          chartHeight = (this.areaMachine.length * 100).toString();
        }
        this.chartStyle = "width:100%;height:" + chartHeight + "px";
        //console.log(this.chartStyle);
        this.shiftData = this.areaList.find(
          x => x.areaNo == this.areaSelected
        ).workShiftData;
      }
    },
    momentInti() {
      moment.locale("zh-tw", {
        months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split(
          "_"
        ),
        monthsShort: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split(
          "_"
        ),
        weekdays: "日_一_二_三_四_五_六".split("_"),
        weekdaysShort: "周日_周一_周二_周三_周四_周五_周六".split("_"),
        weekdaysMin: "日_一_二_三_四_五_六".split("_"),
        longDateFormat: {
          LT: "Ah點mm分",
          LTS: "Ah點m分s秒",
          L: "YYYY-MM-DD",
          LL: "YYYY年MMMD日",
          LLL: "YYYY年MMMD日Ah點mm分",
          LLLL: "YYYY年MMMD日ddddAh點mm分",
          l: "YYYY-MM-DD",
          ll: "YYYY年MMMD日",
          lll: "YYYY年MMMD日Ah點mm分",
          llll: "YYYY年MMMD日ddddAh點mm分"
        },
        meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
        meridiemHour: function(h, meridiem) {
          let hour = h;
          if (hour === 12) {
            hour = 0;
          }
          if (
            meridiem === "凌晨" ||
            meridiem === "早上" ||
            meridiem === "上午"
          ) {
            return hour;
          } else if (meridiem === "下午" || meridiem === "晚上") {
            return hour + 12;
          } else {
            // '中午'
            return hour >= 11 ? hour : hour + 12;
          }
        },
        meridiem: function(hour, minute, isLower) {
          const hm = hour * 100 + minute;
          if (hm < 600) {
            return "凌晨";
          } else if (hm < 900) {
            return "早上";
          } else if (hm < 1130) {
            return "上午";
          } else if (hm < 1230) {
            return "中午";
          } else if (hm < 1800) {
            return "下午";
          } else {
            return "晚上";
          }
        },
        calendar: {
          sameDay: function() {
            return this.minutes() === 0 ? "[今天]Ah[點整]" : "[今天]LT";
          },
          nextDay: function() {
            return this.minutes() === 0 ? "[明天]Ah[點整]" : "[明天]LT";
          },
          lastDay: function() {
            return this.minutes() === 0 ? "[昨天]Ah[點整]" : "[昨天]LT";
          },
          nextWeek: function() {
            let startOfWeek, prefix;
            startOfWeek = moment().startOf("week");
            prefix = this.diff(startOfWeek, "days") >= 7 ? "[下]" : "[本]";
            return this.minutes() === 0
              ? prefix + "dddA點整"
              : prefix + "dddAh點mm";
          },
          lastWeek: function() {
            let startOfWeek, prefix;
            startOfWeek = moment().startOf("week");
            prefix = this.unix() < startOfWeek.unix() ? "[上]" : "[本]";
            return this.minutes() === 0
              ? prefix + "dddAh點整"
              : prefix + "dddAh點mm";
          },
          sameElse: "LL"
        },
        ordinalParse: /\d{1,2}(日|月|周)/,
        ordinal: function(number, period) {
          switch (period) {
            case "d":
            case "D":
            case "DDD":
              return number + "日";
            case "M":
              return number + "月";
            case "w":
            case "W":
              return number + "周";
            default:
              return number;
          }
        },
        relativeTime: {
          future: "%s内",
          past: "%s前",
          s: "幾秒",
          m: "1 分鐘",
          mm: "%d 分鐘",
          h: "1 小時",
          hh: "%d 小時",
          d: "1 天",
          dd: "%d 天",
          M: "1 個月",
          MM: "%d 个月",
          y: "1 年",
          yy: "%d 年"
        },
        week: {
          // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
          dow: 1, // Monday is the first day of the week.
          doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
      });
    }
  },
  mounted() {
    clearTimeout(this.timerId);
    //this.momentInti();
    let chartHeight = "100";
    if (this.areaList.length > 0) {
      this.areaSelected = this.areaList[0].areaNo;
      if (this.areaSelected != null) {
        this.machineData = this.areaList[0].machineData;
        this.shiftData = this.areaList[0].workShiftData;

        this.machineData.forEach(data => {
          this.areaMachine.push({ name: data.name, no: data.no });
        });
      } else {
        this.areaList.forEach(e => {
          if (e.machineData != undefined) {
            e.machineData.forEach(m => {
              this.areaMachine.push({ name: m.name, no: m.no });
              //    this.machineData.push(m);
            });
          }
        });
      }
    }
    if (this.areaList.length > 0) {
      // this.getAreaShiftData();
      if (this.areaMachine.length != 0) {
        chartHeight = (this.areaMachine.length * 100).toString();
      }
      this.chartStyle = "width:100%;height:" + chartHeight + "px";

      this.updateLotWipData();
      this.getTotalLotWipData();
      //  console.log(this.areaSelected);
      //   this.addShiftForm.areaNo = this.areaSelected.areaNo;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timerId);
  },
  activated() {
    clearTimeout(this.timerId);
    if (this.chart != null) {
      this.renderData();
    }
  },
  deactivated() {
    clearTimeout(this.timerId);
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("machineSchedule")
    };
  },
  submit() {}
};
</script>
<style lang="scss" scoped>
#ganttastic-wrapper {
  height: 50vh;
  overflow-y: auto;
}
</style>
