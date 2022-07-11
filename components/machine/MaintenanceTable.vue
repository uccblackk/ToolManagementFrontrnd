<template>
  <v-layout row wrap style="width:100%">
    <v-flex md12 class="px-2">
      <!-- 新增保養資料彈窗 -->
      <v-dialog v-model="addDialog" persistent max-width="800px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text"
              ><v-icon color="white">mdi-plus</v-icon> {{ $t("add")
              }}{{ $t("equipmentMaintenance") }}</span
            >
          </v-card-title>
          <v-form ref="addForm" v-model="valid" lazy-validation>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="machineName"
                    dense
                    :label="$t('equipment') + $t('name')"
                    v-model="machineData.name"
                    disabled
                    filled
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-select
                    ref="userName"
                    :items="userData"
                    :label="$t('executor')"
                    v-model="addForm.userData"
                    return-object
                    item-text="name"
                  >
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                  <v-select
                    ref="type"
                    :items="typeList"
                    :label="$t('type')"
                    v-model="addForm.type"
                    item-value="value"
                    item-text="name"
                  >
                  </v-select>
                </v-col>

                <v-col v-if="addForm.type == 'Date'" cols="12" sm="6" md="4">
                  <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="addForm.planDate"
                        :label="$t('expected') + $t('maintenance') + $t('date')"
                        prepend-icon="mdi-calendar"
                        :rules="noRules"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        required
                      >
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="addForm.planDate"
                      no-title
                      locale="zh-cn"
                      :min="new Date().toISOString().substr(0, 10)"
                      @input="menu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col v-if="addForm.type == 'Week'" cols="12" sm="6" md="4">
                  <v-select
                    ref="type"
                    :items="weekList"
                    :label="$t('expected') + $t('maintenance') + $t('weekday')"
                    v-model="addForm.week"
                    item-value="value"
                    item-text="name"
                  >
                  </v-select>
                </v-col>
                <v-col v-if="addForm.type == 'Month'" cols="12" sm="6" md="4">
                  <v-select
                    ref="type"
                    :items="monthList"
                    :label="$t('expected') + $t('maintenance') + $t('date')"
                    v-model="addForm.date"
                  >
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-menu
                    ref="menu1"
                    v-model="menu1"
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
                        :label="
                          '*' + $t('expected') + $t('maintenance') + $t('time')
                        "
                        v-model="addForm.planTime"
                        prepend-icon="mdi-clock-time-four-outline"
                        readonly
                        required
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="menu1"
                      v-model="addForm.planTime"
                      scrollable
                      format="24hr"
                      full-width
                      @click:minute="$refs.menu1.save(time)"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
                <!-- <v-col v-if="addForm.type != 'Date'" cols="12" sm="6" md="4">
                </v-col> -->
                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    ref="machineName"
                    :label="'*' + $t('expected') + $t('cycleTime') + '(分)'"
                    v-model="addForm.cycleTime"
                    type="number"
                    :min="1"
                    oninput="if(this.value < 0) this.value = 1;"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-textarea
                    append-icon="mdi-comment"
                    rows="1"
                    ref="maintenanceContent"
                    :label="'*' + $t('maintenanceContent')"
                    v-model="addForm.content"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                  >
                  </v-textarea>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    outlined
                    rows="1"
                    ref="maintenanceContent"
                    :label="$t('notice')"
                    v-model="addForm.remark"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <small>*{{ $t("inputRequired") }}</small>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="addDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="addData()">
              {{ $t("add") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 修改保養資料彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="800px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text"
              ><v-icon color="white">mdi-pencil</v-icon> {{ $t("edit")
              }}{{ $t("equipmentMaintenance") }}</span
            >
          </v-card-title>
          <v-form ref="editForm" v-model="valid" lazy-validation>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="machineName"
                    dense
                    :label="$t('equipment') + $t('name')"
                    v-model="machineData.name"
                    disabled
                    filled
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-select
                    ref="userName"
                    :items="userData"
                    :label="$t('executor')"
                    v-model="editForm.userData"
                    return-object
                    item-text="name"
                  >
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                  <v-select
                    ref="type"
                    :items="typeList"
                    :label="$t('type')"
                    v-model="editForm.type"
                    item-value="value"
                    item-text="name"
                  >
                  </v-select>
                </v-col>

                <v-col v-if="editForm.type == 'Date'" cols="12" sm="6" md="4">
                  <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="editForm.planDate"
                        :label="$t('expected') + $t('maintenance') + $t('date')"
                        prepend-icon="mdi-calendar"
                        :rules="noRules"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        required
                      >
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="editForm.planDate"
                      no-title
                      locale="zh-cn"
                      :min="new Date().toISOString().substr(0, 10)"
                      @input="menu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col v-if="editForm.type == 'Week'" cols="12" sm="6" md="4">
                  <v-select
                    ref="type"
                    :items="weekList"
                    :label="$t('expected') + $t('maintenance') + $t('weekday')"
                    v-model="editForm.week"
                    item-value="value"
                    item-text="name"
                  >
                  </v-select>
                </v-col>
                <v-col v-if="editForm.type == 'Month'" cols="12" sm="6" md="4">
                  <v-select
                    ref="type"
                    :items="monthList"
                    :label="$t('expected') + $t('maintenance') + $t('date')"
                    v-model="editForm.date"
                  >
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-menu
                    ref="menu1"
                    v-model="menu1"
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
                        :label="
                          '*' + $t('expected') + $t('maintenance') + $t('time')
                        "
                        v-model="editForm.planTime"
                        prepend-icon="mdi-clock-time-four-outline"
                        readonly
                        required
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="menu1"
                      v-model="editForm.planTime"
                      scrollable
                      format="24hr"
                      full-width
                      @click:minute="$refs.menu1.save(time)"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
                <!-- <v-col v-if="addForm.type != 'Date'" cols="12" sm="6" md="4">
                </v-col> -->
                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    ref="machineName"
                    :label="'*' + $t('expected') + $t('cycleTime') + '(分)'"
                    v-model="editForm.cycleTime"
                    type="number"
                    :min="1"
                    oninput="if(this.value < 0) this.value = 1;"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-textarea
                    append-icon="mdi-comment"
                    rows="1"
                    ref="maintenanceContent"
                    :label="'*' + $t('maintenanceContent')"
                    v-model="editForm.content"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                  >
                  </v-textarea>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    outlined
                    rows="1"
                    ref="maintenanceContent"
                    :label="$t('notice')"
                    v-model="editForm.remark"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <small>*{{ $t("inputRequired") }}</small>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editData()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="error">
            <v-icon class="pa-2" color="white">mdi-delete</v-icon>
            <span class="headline  white--text">
              {{ $t("delete") + $t("equipmentMaintenance") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") + $t("delete") + "?" }}
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="error" dark text @click="deleteData()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 報工彈窗 -->
      <v-dialog v-model="jobReportDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="success">
            <v-icon class="pa-2" color="white">mdi-check</v-icon>
            <span class="headline  white--text">
              {{ $t("equipmentMaintenance") + $t("jobReport") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ jobReportDialogText }}
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="jobReportDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="success" dark text @click="jobReport()">
              {{ $t("confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-card width="100%">
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon class="my-n5">mdi-clipboard-check-multiple-outline</v-icon>
          <span class=" my-n5">{{
            $t("equipmentMaintenance") + $t("list")
          }}</span>
          <v-spacer />
          <v-btn color="primary" dark class="mb-2" @click="addDialog = true">
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ $t("add") + $t("equipmentMaintenance") }}
          </v-btn>
        </v-card-title>
        <v-divider light />
        <v-card-text style="text-align:left">
          <v-alert
            v-if="maintenance.length > 0"
            dense
            text
            type="info"
            class="ma-2"
          >
            {{ $t("equipmentMaintenance") + $t("count") }}：<strong>{{
              maintenance.length
            }}</strong>
          </v-alert>
          <v-alert v-else dense text type="warning" class="ma-2">
            {{ $t("equipmentMaintenance") + $t("count") }}：<strong>{{
              maintenance.length
            }}</strong>
          </v-alert>
          <v-data-table
            :headers="headers"
            :items="maintenance"
            :search="search"
            :items-per-page="itemsPerPage"
            :sort-by="['status', 'actualEndTime']"
            :sort-desc="[false, false]"
            class="elevation-1 text-center"
            @page-count="pageCount = $event"
            :page.sync="page"
            hide-default-footer
          >
            <template v-slot:top>
              <div class="mx-2">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </div>
            </template>
            <template v-slot:item.user="{ item }">
              <v-chip class="ma-2" color="primary" text-color="white">
                <v-avatar left>
                  <v-icon>mdi-account-circle</v-icon>
                </v-avatar>
                {{ item.userData.name }}
              </v-chip>
            </template>
            <template v-slot:item.type="{ item }">
              {{ typeList.find(x => x.value == item.type).name }}
              <span v-if="item.type == 'Week'" class="font-weight-black">
                {{
                  " (" +
                    weekList.find(
                      x => x.value == new Date(item.planEndTime).getDay()
                    ).name +
                    ")"
                }}
              </span>
              <span v-if="item.type == 'Month'" class="font-weight-black">
                {{ " (" + new Date(item.planEndTime).getDate() + ")" }}
              </span>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip outlined v-if="item.status == 'Y'" color="primary">
                <span>
                  {{ $t("already") + $t("completed") }}
                </span>
              </v-chip>
              <v-chip outlined v-else-if="item.status == 'N'" color="warning">
                <span>
                  {{ $t("scheduled") }}
                </span>
              </v-chip>
              <v-chip outlined v-else-if="item.status == 'P'" color="success">
                <span>
                  {{ $t("executing") }}
                </span>
              </v-chip>
            </template>
            <template v-slot:item.planEndTime="{ item }">
              <span
                v-if="
                  new Date(item.planEndTime) < new Date() &&
                    item.status == 'N' &&
                    (item.type != 'Date' || item.status != 'Y')
                "
                style="color:red"
                class="font-weight-black"
              >
                {{ new Date(item.planEndTime).toLocaleString() }}
              </span>
              <span v-else-if="item.type != 'Date' || item.status != 'Y'">
                {{ new Date(item.planEndTime).toLocaleString() }}
              </span>
              <span v-else>
                {{ "--" }}
              </span>
            </template>
            <template v-slot:item.actualEndTime="{ item }">
              <span v-if="item.actualEndTime == null">
                {{ "--" }}
              </span>
              <span v-else>
                {{ new Date(item.actualEndTime).toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.actualStartTime="{ item }">
              <span v-if="item.actualStartTime == null">
                {{ "--" }}
              </span>
              <span v-else>
                {{ new Date(item.actualStartTime).toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.action="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    :disabled="item.status != 'N'"
                    v-bind="attrs"
                    v-on="on"
                    small
                    class="mr-2"
                    @click="edit(item)"
                  >
                    mdi-pencil
                  </v-icon>
                </template>
                {{ $t("edit") }}
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    :disabled="item.status != 'N'"
                    v-bind="attrs"
                    v-on="on"
                    small
                    @click="showDeleteDialog(item)"
                  >
                    mdi-delete
                  </v-icon>
                </template>
                {{ $t("delete") }}
              </v-tooltip>
            </template>
            <template v-slot:item.jobReport="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="item.status != 'Y'"
                    v-bind="attrs"
                    v-on="on"
                    class="ma-2"
                    color="success"
                    fab
                    x-small
                    dark
                    @click="showJobReportDialog(item)"
                  >
                    <v-icon>mdi-check</v-icon>
                  </v-btn>
                </template>
                {{ $t("equipmentMaintenance") + $t("jobReport") }}
              </v-tooltip>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination
              :total-visible="7"
              v-model="page"
              :length="pageCount"
            ></v-pagination>
          </div>
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
export default {
  props: {
    maintenanceData: null,
    machineData: null
  },
  data() {
    return {
      jobReportDialogText: "",
      search: "",
      jobReportDialog: false,
      selectedItem: {},
      deleteDialog: false,
      time: null,
      noRules: [v => !!v || this.$t("mustInput")],
      menu: false,
      menu1: false,
      typeList: [
        { name: "指定日期", value: "Date" },
        { name: "每週", value: "Week" },
        { name: "每月", value: "Month" }
      ],
      weekList: [
        { name: "一", value: 1 },
        { name: "二", value: 2 },
        { name: "三", value: 3 },
        { name: "四", value: 4 },
        { name: "五", value: 5 },
        { name: "六", value: 6 },
        { name: "日", value: 0 }
      ],
      monthList: [],
      userData: [],
      addForm: {
        userData: [],
        creator: null,
        type: "Date",
        planDate: new Date().toISOString().substring(0, 10),
        week: 1,
        date: 1,
        planTime: null,
        cycleTime: 1,
        content: null,
        remark: null
      },
      editForm: {
        id: null,
        creator: null,
        userData: [],
        type: null,
        planDate: new Date().toISOString().substring(0, 10),
        week: 1,
        date: 1,
        planTime: null,
        cycleTime: null,
        content: null,
        remark: null
      },
      editDialog: false,
      valid: null,
      addDialog: false,
      maintenance: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      headers: [
        // { value: "select", sortable: false, width: "1%" },
        {
          text: this.$t("maintenance") + this.$t("type"),
          value: "type",
          align: "left",
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("expected") + this.$t("maintenance") + this.$t("time"),
          value: "planEndTime",
          align: "left",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("maintenance") + this.$t("start") + this.$t("time"),
          value: "actualStartTime",
          align: "left",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("maintenance") + this.$t("end") + this.$t("time"),
          value: "actualEndTime",
          align: "left",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("expected") + this.$t("cycleTime") + "(分)",
          value: "cycleTime",
          align: "left",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("maintenanceContent"),
          value: "content",
          align: "left",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("executor"),
          value: "userData.name",
          align: "left",
          sortable: true,
          width: "150px"
        },

        {
          text: this.$t("status"),
          value: "status",
          align: "center",
          sortable: true,
          width: "100px"
        },
        {
          text: this.$t("notice"),
          value: "remark",
          align: "left",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("action"),
          value: "action",
          align: "center",
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("jobReport"),
          value: "jobReport",
          align: "center",
          sortable: false,
          width: "100px"
        }
      ]
    };
  },
  methods: {
    showJobReportDialog(item) {
      if (item.status == "N") {
        this.jobReportDialogText =
          this.$t("confirm") +
          this.$t("start") +
          this.$t("equipmentMaintenance") +
          "?";
      } else {
        this.jobReportDialogText =
          this.$t("confirm") +
          this.$t("completed") +
          this.$t("equipmentMaintenance") +
          "?";
      }
      this.jobReportDialog = true;
      this.selectedItem = item;
    },
    jobReport() {
      let status = "Y";
      if (this.selectedItem.status == "N") {
        status = "P";
      }

      if (this.selectedItem.type == "Date") {
        //更新狀態
        this.updateStatus(status);
      } else if (this.selectedItem.type == "Week") {
        //更新狀態
        this.updateStatus(status);
        //新增下次的保養資料
        this.addNextMaintenanceData();
      } else if (this.selectedItem.type == "Month") {
        //更新狀態
        this.updateStatus(status);
        //新增下次的保養資料
        this.addNextMaintenanceData();
      }
      this.jobReportDialog = false;
    },
    updateStatus(status) {
      let start = this.selectedItem.actualStartTime;
      let end = this.selectedItem.actualEndTime;
      if (status == "P") {
        start = new Date();
      } else {
        end = new Date();
      }
      const data = {
        id: this.selectedItem.id,
        creatorId: this.selectedItem.creatorId,
        machineId: this.machineData.id,
        type: this.selectedItem.type,
        planEndTime: this.selectedItem.planEndTime,
        actualStartTime: start,
        actualEndTime: end,
        cycleTime: this.selectedItem.cycleTime,
        userId: this.$store.state.authUser.id,
        content: this.selectedItem.content,
        status: status,
        remark: this.selectedItem.remark
      };
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(`/MachineMaintenance/update`, data, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("editSuccess"), "", "success");
          } else {
            this.$swal(this.$t("editFailed"), "", "error");
          }
          // this.refreshShiftData();
          this.$emit("update");
          this.$emit("updateMachineData");
        })
        .then(() => {});
    },
    addNextMaintenanceData() {
      let planEndDate = null;
      if (this.selectedItem.type == "Week") {
        var date; // given: a Date object and a integer representing the week day
        date = new Date(this.selectedItem.planEndTime);
        var currentDay = date.getDay();
        var distance =
          (new Date(this.selectedItem.planEndTime).getDay() + 7 - currentDay) %
          7;
        //強制下週
        date.setDate(date.getDate() + distance + 7);
        planEndDate = new Date(
          date.toISOString().substring(0, 10) +
            " " +
            new Date(this.selectedItem.planEndTime).getHours() +
            ":" +
            new Date(this.selectedItem.planEndTime).getMinutes()
        );
      } else if (this.selectedItem.type == "Month") {
        var date = new Date(this.selectedItem.planEndTime);
        // 本月第一天
        date.setDate(1);
        var currentMonthStartDate = date;
        //下個月第一天
        var nextMonthStartDate = new Date(this.selectedItem.planEndTime);
        nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() + 1);
        nextMonthStartDate.setDate(1);
        //本月最後一天
        date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
        date.setDate(date.getDate() - 1);
        var currentMonthEndDate = date;
        //下個月最後一天
        var nextMonthEndDate = new Date(this.selectedItem.planEndTime);
        nextMonthEndDate.setMonth(nextMonthEndDate.getMonth() + 2);
        nextMonthEndDate.setDate(1);
        nextMonthEndDate.setDate(nextMonthEndDate.getDate() - 1);

        //1.先確認日期是否大於今日
        var currentDate = new Date(this.selectedItem.planEndTime)
          .toISOString()
          .substring(8, 10);
        //console.log(currentDate);
        //該月不管何時報工,下次都以下個月計算
        //確認日期是否超出下個月的最後一天
        if (
          new Date(this.selectedItem.planEndTime).getDate() >
          nextMonthEndDate.toISOString().substring(8, 10)
        ) {
          //超過則取最後一天+設定時間
          planEndDate = new Date(
            nextMonthEndDate.toISOString().substring(0, 10) +
              " " +
              new Date(this.selectedItem.planEndTime).getHours() +
              ":" +
              new Date(this.selectedItem.planEndTime).getMinutes()
          );
        } else {
          //沒超過則取設定時間(下個月+設定日期+設定時間)
          planEndDate = new Date(
            nextMonthEndDate.toISOString().substring(0, 8) +
              new Date(this.selectedItem.planEndTime).getDate() +
              " " +
              new Date(this.selectedItem.planEndTime).getHours() +
              ":" +
              new Date(this.selectedItem.planEndTime).getMinutes()
          );
        }
      }

      const data = {
        creatorId: this.$store.state.authUser.id,
        machineId: this.machineData.id,
        type: this.selectedItem.type,
        planEndTime: planEndDate,
        cycleTime: this.selectedItem.cycleTime,
        userId: this.selectedItem.userData.id,
        content: this.selectedItem.content,
        status: "N",
        remark: this.selectedItem.remark
      };
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(`/MachineMaintenance/Create`, data, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("createSuccess"), "", "success");
          } else {
            this.$swal(this.$t("createFailed"), "", "error");
          }
          // this.refreshShiftData();
          this.$emit("update");
        })
        .then(() => {});
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      this.selectedItem = item;
    },
    deleteData() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/MachineMaintenance/delete/${this.selectedItem.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
          } else {
            this.$swal(this.$t("deleteFailed"), res.data.msg, "error");
          }
          //this.refreshActionData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    edit(item) {
      this.editDialog = true;
      console.log(item);
      this.editForm.userData = item.userData;
      this.editForm.type = item.type;
      if (item.type == "Date") {
        this.editForm.planDate = new Date(item.planEndTime)
          .toISOString()
          .substring(0, 10);
      } else if (item.type == "Week") {
        this.editForm.week = new Date(item.planEndTime).getDay();
      } else if (item.type == "Month") {
        this.editForm.date = new Date(item.planEndTime).getDate();
      }
      this.editForm.id = item.id;
      this.editForm.planTime =
        new Date(item.planEndTime).getHours() +
        ":" +
        new Date(item.planEndTime).getMinutes();
      this.editForm.cycleTime = item.cycleTime;
      this.editForm.content = item.content;
      this.editForm.remark = item.remark;
    },
    editData() {
      if (
        this.editForm.planTime == null ||
        this.editForm.cycleTime <= 0 ||
        this.editForm.content == null ||
        this.editForm.content == ""
      ) {
        this.$refs["editForm"].validate();
        return;
      }
      this.editDialog = false;
      let planEndDate = null;
      if (this.editForm.type == "Date") {
        if (this.editForm.planDate == null) {
          this.$refs["editForm"].validate();
          return;
        }
        planEndDate = new Date(
          this.editForm.planDate + " " + this.editForm.planTime
        );
      } else if (this.editForm.type == "Week") {
        var date; // given: a Date object and a integer representing the week day
        date = new Date();
        var currentDay = date.getDay();
        var distance = (this.editForm.week + 7 - currentDay) % 7;
        date.setDate(date.getDate() + distance);
        planEndDate = new Date(
          date.toISOString().substring(0, 10) + " " + this.editForm.planTime
        );
      } else if (this.editForm.type == "Month") {
        var date = new Date();
        // 本月第一天
        date.setDate(1);
        var currentMonthStartDate = date;
        //下個月第一天
        var nextMonthStartDate = new Date();
        nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() + 1);
        nextMonthStartDate.setDate(1);
        //本月最後一天
        date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
        date.setDate(date.getDate() - 1);
        var currentMonthEndDate = date;
        //下個月最後一天
        var nextMonthEndDate = new Date();
        nextMonthEndDate.setMonth(nextMonthEndDate.getMonth() + 2);
        nextMonthEndDate.setDate(1);
        nextMonthEndDate.setDate(nextMonthEndDate.getDate() - 1);

        //1.先確認日期是否大於今日
        var currentDate = new Date().toISOString().substring(8, 10);
        //console.log(currentDate);
        //2.大於,則以本月計算
        if (this.editForm.date >= currentDate) {
          //確認日期是否超出本月的最後一天
          if (
            this.editForm.date >
            currentMonthEndDate.toISOString().substring(8, 10)
          ) {
            //超過則取最後一天+設定時間
            planEndDate = new Date(
              currentMonthEndDate.toISOString().substring(0, 10) +
                " " +
                this.editForm.planTime
            );
          } else {
            //沒超過則取設定時間(本月+設定日期+設定時間)

            planEndDate = new Date(
              new Date().toISOString().substring(0, 8) +
                this.editForm.date +
                " " +
                this.editForm.planTime
            );
          }
        } else {
          //3. 小於,則以下個月計算
          //確認日期是否超出下個月的最後一天
          if (
            this.editForm.date > nextMonthEndDate.toISOString().substring(8, 10)
          ) {
            //超過則取最後一天+設定時間
            planEndDate = new Date(
              nextMonthEndDate.toISOString().substring(0, 10) +
                " " +
                this.editForm.planTime
            );
          } else {
            //沒超過則取設定時間(下個月+設定日期+設定時間)
            console.log(
              nextMonthEndDate.toISOString().substring(0, 8) +
                this.editForm.date +
                " " +
                this.editForm.planTime
            );
            planEndDate = new Date(
              nextMonthEndDate.toISOString().substring(0, 8) +
                this.editForm.date +
                " " +
                this.editForm.planTime
            );
          }
        }
        // console.log(planEndDate);
        // console.log(currentMonthStartDate);
        // console.log(nextMonthStartDate);
        // console.log(currentMonthEndDate);
        // console.log(nextMonthEndDate);
      }
      //console.log(planEndDate);

      const data = {
        creatorId: this.$store.state.authUser.id,
        id: this.editForm.id,
        machineId: this.machineData.id,
        type: this.editForm.type,
        planEndTime: planEndDate,
        cycleTime: this.editForm.cycleTime,
        userId: this.editForm.userData.id,
        content: this.editForm.content,
        status: "N",
        remark: this.editForm.remark
      };
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(`/MachineMaintenance/update`, data, {
          headers: {
            Authorization: token
          }
        })
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
    addData() {
      if (
        this.addForm.planTime == null ||
        this.addForm.cycleTime <= 0 ||
        this.addForm.content == null ||
        this.addForm.content == ""
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      this.addDialog = false;
      let planEndDate = null;
      if (this.addForm.type == "Date") {
        if (this.addForm.planDate == null) {
          this.$refs["addForm"].validate();
          return;
        }
        planEndDate = new Date(
          this.addForm.planDate + " " + this.addForm.planTime
        );
      } else if (this.addForm.type == "Week") {
        var date; // given: a Date object and a integer representing the week day
        date = new Date();
        var currentDay = date.getDay();
        var distance = (this.addForm.week + 7 - currentDay) % 7;
        date.setDate(date.getDate() + distance);
        planEndDate = new Date(
          date.toISOString().substring(0, 10) + " " + this.addForm.planTime
        );
      } else if (this.addForm.type == "Month") {
        var date = new Date();
        // 本月第一天
        date.setDate(1);
        var currentMonthStartDate = date;
        //下個月第一天
        var nextMonthStartDate = new Date();
        nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() + 1);
        nextMonthStartDate.setDate(1);
        //本月最後一天
        date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
        date.setDate(date.getDate() - 1);
        var currentMonthEndDate = date;
        //下個月最後一天
        var nextMonthEndDate = new Date();
        nextMonthEndDate.setMonth(nextMonthEndDate.getMonth() + 2);
        nextMonthEndDate.setDate(1);
        nextMonthEndDate.setDate(nextMonthEndDate.getDate() - 1);

        //1.先確認日期是否大於今日
        var currentDate = new Date().toISOString().substring(8, 10);
        //console.log(currentDate);
        //2.大於,則以本月計算
        if (this.addForm.date >= currentDate) {
          //確認日期是否超出本月的最後一天
          if (
            this.addForm.date >
            currentMonthEndDate.toISOString().substring(8, 10)
          ) {
            //超過則取最後一天+設定時間
            planEndDate = new Date(
              currentMonthEndDate.toISOString().substring(0, 10) +
                " " +
                this.addForm.planTime
            );
          } else {
            //沒超過則取設定時間(本月+設定日期+設定時間)

            planEndDate = new Date(
              new Date().toISOString().substring(0, 8) +
                this.addForm.date +
                " " +
                this.addForm.planTime
            );
          }
        } else {
          //3. 小於,則以下個月計算
          //確認日期是否超出下個月的最後一天
          if (
            this.addForm.date > nextMonthEndDate.toISOString().substring(8, 10)
          ) {
            //超過則取最後一天+設定時間
            planEndDate = new Date(
              nextMonthEndDate.toISOString().substring(0, 10) +
                " " +
                this.addForm.planTime
            );
          } else {
            //沒超過則取設定時間(下個月+設定日期+設定時間)
            console.log(
              nextMonthEndDate.toISOString().substring(0, 8) +
                this.addForm.date +
                " " +
                this.addForm.planTime
            );
            planEndDate = new Date(
              nextMonthEndDate.toISOString().substring(0, 8) +
                this.addForm.date +
                " " +
                this.addForm.planTime
            );
          }
        }
        // console.log(planEndDate);
        // console.log(currentMonthStartDate);
        // console.log(nextMonthStartDate);
        // console.log(currentMonthEndDate);
        // console.log(nextMonthEndDate);
      }
      // console.log(planEndDate);

      const data = {
        creatorId: this.$store.state.authUser.id,
        machineId: this.machineData.id,
        type: this.addForm.type,
        planEndTime: planEndDate,
        cycleTime: this.addForm.cycleTime,
        userId: this.addForm.userData.id,
        content: this.addForm.content,
        status: "N",
        remark: this.addForm.remark
      };
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(`/MachineMaintenance/Create`, data, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("createSuccess"), "", "success");
          } else {
            this.$swal(this.$t("createFailed"), "", "error");
          }
          // this.refreshShiftData();
          this.$emit("update");
        })
        .then(() => {});
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
          this.addForm.userData = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
          this.addForm.userData = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
        });
    },
    showItemState(cycleTime) {
      // console.log(cycleTime);
      let result = "--";
      if (cycleTime != "" && cycleTime != undefined) {
        result = new Date(cycleTime * 1000).toISOString().substr(11, 8);
      }
      return result;
    },
    getStatusColor(status) {
      //  console.log(status);
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
        case "in":
          color = "green accent-4";
          break;
        case "out":
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
    }
  },
  mounted() {
    this.getUserData();
    for (let i = 0; i <= 30; i++) {
      this.monthList.push(i + 1);
    }
    // console.log(this.maintenanceData);
    // this.maintenance = this.maintenanceData;
  },
  watch: {
    maintenanceData() {
      //   console.log(this.maintenanceData);
      this.maintenance = this.maintenanceData;
    }
  },
  created() {
    // console.log(this.maintenanceData);
    this.maintenance = this.maintenanceData;
  }
};
</script>
