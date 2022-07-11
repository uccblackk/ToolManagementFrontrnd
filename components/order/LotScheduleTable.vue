<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <v-row>
        <v-col cols="12">
          <v-data-table
            :search="search"
            :headers="dispatchHeaders"
            :items="data"
            :items-per-page="itemsPerPage"
            @sorted="saveOrder"
            @current-items="current"
            v-sortable-data-table
            :sort-by="[
              'moData.urgent',
              'lotData.lotNo',
              'lotOpData.opSequence'
            ]"
            :item-class="itemRowBackground"
            :sort-desc="[true, false, false]"
            class="elevation-1"
            @page-count="pageCount = $event"
            :page.sync="page"
            :loading="loading == 1"
            loading-text="Loading... Please wait"
            multi-sort
            hide-default-footer
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>
                  <span class="text-h5 font-weight-black">
                    {{ $t("lot") }}
                  </span></v-toolbar-title
                >
                <v-divider class="mx-4" inset vertical></v-divider>

                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      outlined
                      class="mr-4"
                      @click.stop="updateScheduleData('M')"
                    >
                      <v-icon left dark>
                        mdi-hand-back-left
                      </v-icon>
                      {{
                        $t("manual") +
                          $t("update") +
                          "/" +
                          $t("save") +
                          $t("schedule")
                      }}
                    </v-btn>
                  </template>
                  <span>{{ "手動設定各製程排程時間,並儲存" }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      outlined
                      class="mr-4"
                      @click.stop="updateScheduleData('A')"
                    >
                      <v-icon left dark>
                        mdi-update
                      </v-icon>
                      {{
                        $t("auto") +
                          $t("update") +
                          "/" +
                          $t("save") +
                          $t("schedule")
                      }}
                    </v-btn>
                  </template>
                  <span>{{ "自動更新後續製程資料,並儲存" }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      color="error"
                      @click.stop="updateScheduleData('R')"
                    >
                      <v-icon left dark>
                        mdi-refresh
                      </v-icon>
                      {{ $t("reset") + $t("schedule") }}
                    </v-btn>
                  </template>
                  <span>{{ "重置排程資料" }}</span>
                </v-tooltip>
              </v-toolbar>
            </template>
            <template v-slot:item.urgent="{ item }">
              <div v-if="item.moData.urgent == 'Y'">
                <v-icon large color="red">
                  mdi-fire-alert
                </v-icon>
              </div>
            </template>
            <template v-slot:item.sn="{ index }">
              {{ index + 1 }}
            </template>
            <template v-slot:item.resourceType="{ item }">
              <div v-if="item.resourceType == 'E'">
                {{ $t("equipment") }}
              </div>
              <div v-if="item.resourceType == 'L'">
                {{ $t("line") }}
              </div>
            </template>
            <template v-slot:item.resourceName="{ item }">
              <v-chip
                v-if="item.resourceType == 'E'"
                color="blue darken-3"
                dark
              >
                {{ item.resourceName }}
              </v-chip>
              <v-chip
                v-if="item.resourceType == 'L'"
                color="orange  darken-3"
                dark
              >
                {{ item.resourceName }}
              </v-chip>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip
                v-if="item.status != 'dispatch'"
                color="orange darken-1"
                dark
                outlined
              >
                {{ $t(item.status) }}
              </v-chip>
              <v-chip v-else dark color="orange darken-1" outlined>
                {{ $t("already") }}{{ $t(item.status) }}
              </v-chip>
            </template>
            <template v-slot:item.cycleTime="{ item }">
              <label id="status1" class="form-label">
                {{ showItemState(item.cycleTime) }}
              </label>
            </template>
            <template v-slot:item.startTime="{ item }">
              <v-menu
                ref="menu"
                v-model="item.menu"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="time"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="item.scheduleStartTime"
                    prepend-icon="mdi-clock-time-four-outline"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-if="item.menu"
                  v-model="item.scheduleStartTime"
                  format="24hr"
                  full-width
                  @click:minute="updateEndTime(item)"
                ></v-time-picker>
              </v-menu>
            </template>
            <template v-slot:item.endTime="{ item }">
              <v-menu
                ref="menu"
                v-model="item.menu1"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="time"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="item.scheduleEndTime"
                    prepend-icon="mdi-clock-time-four-outline"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-if="item.menu1"
                  v-model="item.scheduleEndTime"
                  format="24hr"
                  full-width
                  @click:minute="save(item)"
                  :min="item.scheduleStartTime"
                ></v-time-picker>
              </v-menu>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
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
// Default SortableJS
import Sortable from "sortablejs";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    dispatchedData: [],
    isLoading: null,
    areaSelected: null
  },
  data() {
    return {
      isMove: false,
      sortableData: [],
      editedItem: [],
      search: "",
      time: null,
      menu2: false,
      modal2: false,
      dispatchLotOpData: [],
      loading: 0,
      valid: true,
      data: [],
      weekCheckBox: [],
      workShiftSelected: null,
      week: [
        { name: "一", value: 1 },
        { name: "二", value: 2 },
        { name: "三", value: 3 },
        { name: "四", value: 4 },
        { name: "五", value: 5 },
        { name: "六", value: 6 },
        { name: "日", value: 0 }
      ],
      workShiftList: {},
      lineSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      lineName: "",
      areaList: {},
      errorMessage: "",
      procedure: "",

      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editCalendarShiftForm: {
        no: null,
        name: null,
        areaName: null
      },
      deleteLineData: {
        no: null,
        name: null,
        id: null
      },
      dispatchHeaders: [
        {
          text: this.$t("urgentMo"),
          value: "urgent",
          align: "start",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("lot") + this.$t("No"),
          value: "lotData.lotNo",
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
          text: this.$t("itemSpec"),
          value: "moData.itemSpec",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("sequence"),
          value: "lotOpData.opSequence",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("process"),
          value: "lotOpData.opName",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("equipment") + this.$t("name"),
          value: "resourceName",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("status"),
          value: "status",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("count"),
          value: "lotData.qty",
          sortable: false,
          width: "5%"
        },
        // {
        //   text: this.$t("dispatch") + this.$t("date"),
        //   value: "dispatchStartDate",
        //   sortable: true,
        //   width: "10%"
        // },
        {
          text: this.$t("workShift"),
          value: "shiftName",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("schedule") + this.$t("start") + this.$t("time"),
          value: "startTime",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("schedule") + this.$t("endTime"),
          value: "endTime",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("expected") + this.$t("cycleTime"),
          value: "cycleTime",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },

  watch: {
    dispatchedData() {
      // console.log(this.dispatchedData);
      this.data = this.dispatchedData.filter(x => x.isProduction == "N");
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  directives: {
    sortableDataTable: {
      bind(el, binding, vnode) {
        const options = {
          animation: 150,
          onUpdate: function(event) {
            vnode.child.$emit("sorted", event);
          }
        };
        Sortable.create(el.getElementsByTagName("tbody")[0], options);
      }
    }
  },
  methods: {
    itemRowBackground: function(item) {
      //console.log(item);
      return item.moData.urgent == "Y" ? "red lighten-5" : "";
    },
    saveOrder(event) {
      const movedItem = this.sortableData.splice(event.oldIndex, 1)[0];
      this.sortableData.splice(event.newIndex, 0, movedItem);
      //this.sortableData = this.data;
      // this.isMove = true;
      //console.log(this.sortableData);
    },
    current(e) {
      //console.log(this.isMove);
      // eslint-disable-next-line no-console
      // if (this.isMove == false) {
      this.sortableData = e;
      //console.log(this.sortableData);
      //  }
      // this.isMove = false;
    },
    click(item) {
      //console.log(item);
    },
    save(item) {
      item.menu1 = false;
      let pos = this.editedItem.map(x => x.id).indexOf(item.id);

      if (pos == -1) {
        // console.log(item.id);
        this.editedItem.push(item);
      } else {
        // console.log(item.id);
        this.editedItem.splice(pos, 1);
        this.editedItem.push(item);
      }

      // console.log(item);
    },
    updateEndTime(item) {
      item.menu = false;

      let startDate = new Date(
        item.dispatchStartDate + " " + item.scheduleStartTime
      );
      let startHour = startDate.getHours();
      let endDate = startDate;
      let cycleTime = null;
      if (item.cycleTime != "" && item.cycleTime != undefined) {
        endDate.setSeconds(endDate.getSeconds() + item.cycleTime);
        if (endDate.getHours() >= startHour) {
          item.scheduleEndTime =
            endDate.getHours() + ":" + (endDate.getMinutes() + 1);
        } else {
          item.scheduleEndTime = "23:59";
        }

        // cycleTime = new Date(item.cycleTime * 1000).toISOString().substr(11, 8);
      }

      let pos = this.editedItem.map(x => x.id).indexOf(item.id);

      if (pos == -1) {
        // console.log(item.id);
        this.editedItem.push(item);
      } else {
        // console.log(item.id);
        this.editedItem.splice(pos, 1);
        this.editedItem.push(item);
      }
      // this.save(item);
      // console.log(this.editedItem);
    },
    updateScheduleData(type) {
      // console.log(this.editedItem);
      let lotWipData = [];
      if (type == "M") {
        if (this.editedItem.length > 0) {
          lotWipData = this.editedItem;
        } else {
          this.$swal(this.$t("editSuccess"), "", "success");
          return;
        }
      } else {
        lotWipData = this.sortableData;
      }
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(
          `/LotWip/UpdateScheduleTime?areaNo=${this.areaSelected}&type=` + type,
          lotWipData,
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
          this.$emit("update");
        })
        .then(() => {});
    },
    showItemState(cycleTime) {
      // console.log(cycleTime);
      let result = null;
      if (cycleTime != "" && cycleTime != undefined) {
        result = new Date(cycleTime * 1000).toISOString().substr(11, 8);
      }
      return result;
    },
    getAreaData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Area/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
        });
    },
    editItem(item) {
      // console.log(item);
      this.workShiftList = item;
      this.workShiftSelected = item.shiftName + " (" + item.shiftNo + ")";
      this.weekCheckBox = item.weekDay;
      this.editDialog = true;
    },
    editWorkShift() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      if (this.weekCheckBox.length <= 0) {
        this.$refs["editForm"].validate();
        return;
      }

      const token = this.$store.state.authUser.token;
      const shift = {
        id: this.workShiftList.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        shiftNo: this.workShiftList.shiftNo,
        areaNo: this.workShiftList.areaNo,
        weekday: this.weekCheckBox
      };
      this.editCalendarShiftForm.no = "";
      this.editCalendarShiftForm.name = "";

      this.$axios
        .post(`/CalendarShift/update`, shift, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
          } else {
            this.$swal("", this.$t("editFailed"), "error");
          }
          this.refreshShiftData();
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteWorkShift() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/CalendarShift/delete/${this.workShiftList.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
          } else {
            this.$swal("", this.$t("editFailed"), "error");
          }
          this.refreshShiftData();
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshShiftData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/CalendarShift/Search?value=${this.workShiftList.areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.data = res.data.data != null ? res.data.data : [];
          for (let i = 0; i < this.data.length; i++) {
            this.data[i].weekDay.sort(function(a, b) {
              return a - b;
            });
          }
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      this.workShiftList = item;
    }
  },
  mounted() {
    this.editedItem = [];
  }
};
</script>
