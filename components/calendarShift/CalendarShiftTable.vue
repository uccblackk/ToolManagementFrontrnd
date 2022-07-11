<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯生產區域彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("workShift") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-form ref="editForm" v-model="valid" lazy-validation>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12" md="4">
                    <v-text-field
                      class="mt-2"
                      v-model="workShiftSelected"
                      :label="$t('workShift')"
                      item-value="shiftNo"
                      disabled
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="12" md="8">
                    <v-layout row wrap class="mt-n6">
                      <v-flex xs3 md2 v-for="(items, idx) in week" :key="idx">
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
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editWorkShift()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除生產區域彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("workShift") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("workShift") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteWorkShift()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="shiftList"
        :items-per-page="itemsPerPage"
        :sort-by="['lineNo']"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="showDeleteDialog(item)">
            mdi-delete
          </v-icon>
        </template>
        <template #item.weekday="{ item }">
          <v-layout>
            <v-chip
              class="text-left ma-2"
              v-for="(items, idx) in item.weekDay"
              :key="idx"
            >
              {{ week.find(x => x.value == items).name }}
            </v-chip>
          </v-layout>
        </template>
      </v-data-table>
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
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    calendarShiftData: {}
  },
  data() {
    return {
      valid: true,
      shiftList: [],
      weekCheckBox: [],
      workShiftSelected: null,
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
      workShiftList: {},
      lineSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      lineName: "",
      areaList: {},
      errorMessage: "",
      procedure: "",
      areaSelected: null,
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
      headers: [
        {
          text: this.$t("workShift") + this.$t("No"),
          value: "shiftNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("workShift") + this.$t("name"),
          value: "shiftName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("weekday"),
          value: "weekday",
          sortable: false,
          width: "30%"
        },

        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },

  watch: {
    calendarShiftData() {
      this.shiftList = this.calendarShiftData;
      this.areaSelected = this.calendarShiftData.areaNo;
      for (let i = 0; i < this.shiftList.length; i++) {
        this.shiftList[i].weekDay.sort(function(a, b) {
          return a - b;
        });
      }
      //  console.log(this.shiftList);
    }
  },
  methods: {
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
      //console.log(item);
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
          this.shiftList = res.data.data != null ? res.data.data : [];
          for (let i = 0; i < this.shiftList.length; i++) {
            this.shiftList[i].weekDay.sort(function(a, b) {
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
    this.week = setting.week;
  }
};
</script>
