<template>
  <v-layout row wrap>
    <v-flex xs12 sm lg xl md12>
      <v-breadcrumbs :items="buttonItems">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :href="item.href" :disabled="item.disabled">
            {{ item.text.toUpperCase() }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>
    </v-flex>
    <v-flex xs12 md6 class="pa-2">
      <div style="font-weight:bold">
        {{ $t("equipment") }}
        <v-divider></v-divider>
        <div style="text-align:center">
          <v-avatar
            v-if="machineData.img == null"
            color="grey darken-1 white--text text-h5"
            class="mt-2"
            size="150"
            dark
          >
            <span class="text-truncate" style="max-width: 140px;">
              {{ machineData.name }}
            </span>
          </v-avatar>
        </div>
        <div style="text-align:center">
          <v-img
            v-if="machineData.img != null"
            class="mt-2"
            :src="machineData.img"
            width="100%"
            height="100%"
            max-height="150"
            contain
          ></v-img>
          <span style="width:100%">
            {{ machineData.name }}
          </span>
        </div>
        <v-row>
          <v-col cols="12" style="text-align:center">
            <v-tooltip v-if="machineData.maintenanceData.length > 0" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-chip v-bind="attrs" v-on="on" class="success">
                  {{ $t("maintenance") + $t("ing") }}
                </v-chip>
              </template>
              {{ machineData.maintenanceData[0].content }}
            </v-tooltip>
          </v-col>
        </v-row>
      </div>
    </v-flex>
    <v-flex xs12 md6 class="pa-2">
      <div style="font-weight:bold">
        {{ $t("machineInfo") }}
      </div>
      <v-divider></v-divider>
      <v-row>
        <v-col cols="6">
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("name") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.name
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("brand") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.brand
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("series") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.series
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("type") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.type
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("use") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.use
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span
                class="subtitle-2"
                style="color: gray;font-weight:bold;color:#2E7D32"
                >{{ $t("machineToolMagazine") + $t("count") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span
                class="subtitle-2"
                style="color: gray;font-weight:bold;color:#2E7D32"
                >{{ Object.keys(machineData.toolMagazine).length }}</span
              >
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("manufature") + $t("country") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.setting.country
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("factoryNo") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.setting.factoryNo
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("factoryDate") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.setting.factoryDate
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("purchasePrice") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.setting.purchasePrice
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("residualValue") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.setting.residualValue
              }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col md="4">
              <span class="subtitle-2" style="color: gray"
                >{{ $t("description") }}：</span
              >
            </v-col>
            <v-col md="8">
              <span class="subtitle-2" style="color: gray">{{
                machineData.notice
              }}</span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-flex>

    <!-- TAB -->
    <v-flex xs12 class="pa-2">
      <div style="text-align: left;font-weight:bold">
        {{ $t("detail") }}
        <v-divider></v-divider>
        <!-- datepicker -->

        <!-- tabs -->
        <v-card color="basil">
          <v-tabs v-model="tab" background-color="white" slider-color="primary">
            <v-tab
              style="color:black"
              @click="forceRerender(item.tab)"
              v-for="(item, idx) in items"
              :key="idx"
            >
              <v-icon>{{ item.icon }}</v-icon>
              {{ item.tab }}
            </v-tab>
          </v-tabs>
          <v-divider />
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <v-layout align-center justify-start row fill-height class="pa-2">
                <v-flex
                  xs12
                  md2
                  v-for="(value, key) in machineData.toolMagazine"
                  :key="key"
                  class="justify-center pa-2"
                >
                  <div>
                    <MachiningToolCard
                      :toolData="value"
                      :toolNum="key"
                      @bind="onBindTool(key)"
                      @updateElapsedTime="updateElapsedTime(value)"
                    />
                  </div>
                </v-flex>
              </v-layout>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </div>
      <v-dialog v-model="bindToolDialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }"> </template>
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("tool") + $t("No") + "-" + bindToolForm.toolNum }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="addForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <!-- <v-text-field
                      ref="no"
                      :label="'*' + $t('machiningTool') + $t('No')"
                      :rules="noRules"
                      v-model="bindToolForm.no"
                      required
                    ></v-text-field> -->
                    <v-autocomplete
                      v-model="bindToolForm.no"
                      :items="toolData"
                      item-text="name"
                      item-value="no"
                      :rules="noRules"
                      outlined
                      :label="'*' + $t('machiningTool') + $t('No')"
                      required
                    ></v-autocomplete>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="bindToolDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="bindTool()">
              {{ $t("confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="elapsedTimeDialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }"> </template>
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{
                $t("tool") + $t("elapsedTime") + "-" + updateToolForm.toolNum
              }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="updateForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="no"
                      :label="
                        '*' +
                          $t('tool') +
                          $t('elapsedTime') +
                          ' ( ' +
                          $t('toolLife') +
                          ' : ' +
                          updateToolForm.toolLife +
                          ' )'
                      "
                      oninput="if(this.value < 0) this.value = 0;"
                      v-model="updateToolForm.elapsedTime"
                      required
                      type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="elapsedTimeDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="UpdateTool()">
              {{ $t("confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>
<script>
import MachineCard from "~/components/machine/MachineCard.vue";

import MachiningToolCard from "~/components/machiningTool/MachiningToolCard.vue";
import moment from "moment";
import mqtt from "mqtt";

const setting = require(`@/static/setting/setting.json`);

export default {
  middleware: "auth",
  data() {
    return {
      elapsedTime: 1,
      elapsedTimeDialog: false,
      arrayEvents: [],
      alarmChartKey: 0,
      utilizationChartKey: 0,
      workEfficiencyChartKey: 0,
      toolData: [],
      componentKey: 0,
      chartKey: 0,
      dateRangeText: null,
      show: true,
      lotWipList: [],
      todaysData: [],
      dates: [],
      menu: false,
      tab: null,
      buttonItems: [
        {
          text: this.$t("equipmentInfo"),
          disabled: false,
          href: "/machine"
        },
        {
          text: "",
          disabled: true
        }
      ],
      items: [
        {
          tab: this.$t("machineToolMagazine"),
          icon: "mdi-tools"
        }
      ],
      oeeData: {},
      machineData: {},
      selectedDates: [],
      machineStatusData: {},
      statusData: [],
      inprogressStation: {},
      processData: [],
      maintenanceData: [],
      partData: {},
      mqttData: {},
      mqttClient: {},
      startDate: null,
      endDate: null,
      bindToolDialog: false,
      bindToolForm: {
        no: null,
        toolNum: null
      },
      updateToolForm: {
        no: null,
        toolLife: null,
        toolNum: null,
        elapsedTime: 1,
        toolData: null
      },
      nameRules: [v => !!v || this.$t("mustInput")],
      noRules: [v => !!v || this.$t("mustInput")],
      valid: true
    };
  },
  components: {
    MachiningToolCard
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    const id = params.id;
    const machineNo = params.no;
    let response = await app.$axios.$get(`/Machine/${id}`, {
      headers: {
        Authorization: token
      }
    });
    const machineData = response.data;
    const dates = [
      moment().format("YYYY-MM-DD"),
      moment().format("YYYY-MM-DD")
    ];
    let selectedDates = [];
    selectedDates.push(dates[0]);
    selectedDates.push(dates[1]);
    response = await app.$axios.$get(
      `/MachineStatus/Search?machineId=${id}&startTime=${dates[0]}&endTime=${dates[0]}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    const machineStatusData = response.data;
    const statusData = response.data.filter(x => x.status != null);
    statusData.sort(function(a, b) {
      return b.time.localeCompare(a.time, "en", {
        numeric: true
      });
    });

    response = await app.$axios.$get(
      `/OEE/GetMachineOEE?machineNo=${machineData.no}&startDate=${dates[0]}&endDate=${dates[1]}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let oeeData = response.data != null ? response.data : [];

    response = await app.$axios.$get(
      `/LotWip/SearchByMachine?machineNo=${machineData.no}&startDate=${dates[0]}&endDate=${dates[1]}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let processData = response.data != null ? response.data : [];

    response = await app.$axios.$get(
      `/MachineMaintenance/Search?machineId=${id}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let maintenanceData = response.data != null ? response.data : [];

    response = await app.$axios.$get(`/MachiningTool/Search`, {
      headers: {
        Authorization: token
      }
    });
    let toolData = response.data != null ? response.data : [];
    toolData = toolData.filter(x => x.machineId == null);
    //console.log(toolData);
    return {
      id: params.id,
      machineData: machineData,
      machineStatusData: machineStatusData,
      statusData: statusData,
      todaysData: machineStatusData,
      maintenanceData: maintenanceData,
      // inprogressStation: inprogressStation,
      processData: processData,
      // partData: partData,
      selectedDates: selectedDates,
      startDate: selectedDates[0],
      endDate: selectedDates[1],
      oeeData: oeeData,
      toolData: toolData
    };
  },
  methods: {
    redirectToDetail(lotNo, date) {
      this.$router.push(`/jobReport/jobReport/${lotNo}?date=${date}`);
    },
    forceRerender(tabName) {
      // this.chartKey += 1;
      if (tabName == this.$t("machineUtilization")) {
        this.utilizationChartKey += 1;
      } else if (tabName == this.$t("workEfficiency")) {
        this.workEfficiencyChartKey += 1;
      } else if (tabName == this.$t("error") + this.$t("analysis")) {
        this.alarmChartKey += 1;
      }
    },
    onClearClicked() {
      this.startDate = null;
      this.endDate = null;
      this.dates = [];
      this.selectedDates = [];
    },
    onCalendarSelected() {
      this.selectedDates = [];
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
      this.selectedDates.push(this.startDate);
      this.selectedDates.push(this.endDate);
      this.menu = false;
    },
    getDate() {
      var date = new Date();
      // date.setDate(date.getDate() + 0);

      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);

      return date.toISOString().substr(0, 10);
    },
    getCurrentJob() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(
          `/LotWip/SearchByMachine?machineNo=${this.machineData.no}&status=in,out`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.lotWipList = res.data.data != null ? res.data.data : [];
        });
    },
    resfreshMachineStatus() {
      const token = this.$store.state.authUser.token;
      const id = this.id;
      this.$axios
        .get(
          `/MachineStatus/Search?machineId=${id}&startTime=${this.startDate}&endTime=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.machineStatusData = res.data.data;
        });
    },
    onSearch() {
      const token = this.$store.state.authUser.token;

      if (this.dates.length == 0) {
        return;
      }
      const id = this.id;
      this.$axios
        .get(
          `/MachineStatus/Search?machineId=${id}&startTime=${this.startDate}&endTime=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.machineStatusData = res.data.data;
          this.statusData = res.data.data.filter(x => x.status != null);
          this.statusData.sort(function(a, b) {
            return b.time.localeCompare(a.time, "en", {
              numeric: true
            });
          });
        });
      this.$axios
        .get(
          `/LotWip/SearchByMachine?machineNo=${this.machineData.no}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.data != null) {
            this.processData = res.data.data;
          } else {
            this.processData = [];
          }
        });

      this.$axios
        .get(`/MachineMaintenance/Search?machineId=${this.machineData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.data != null) {
            this.maintenanceData = res.data.data;
          } else {
            this.maintenanceData = [];
          }
        });
    },
    getMachineStatus() {
      let status = "disconnect";
      status = this.mqttData.status;
      return status;
    },
    uuid() {
      var d = Date.now();
      if (
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
      ) {
        d += performance.now(); //use high-precision timer if available
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
    },
    mqttMSG() {
      const options = {
        connectTimeout: 40000,
        clientId: this.uuid(),
        clean: true
      };

      // mqtt连接
      if (!this.mqttClient.connted) {
        this.mqttClient = mqtt.connect(setting.mqtt.url, options);
        this.mqttClient.on("connect", e => {
          //console.log("连接成功:");
          this.mqttClient.subscribe(
            `${setting.mqtt.customer}/D200/tc/${this.machineData.no}/EqInfo/GetStatus`,
            { qos: 0 },
            error => {
              if (!error) {
                //console.log("订阅成功");
              } else {
                //console.log("订阅失败");
              }
            }
          );
        });
        // 接收消息处理
        this.mqttClient.on("message", (topic, message) => {
          const mqttData = JSON.parse(message.toString());
          this.mqttData = mqttData.data;
          // this.resfreshMachineStatus();
          this.getMachineStatus();
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          console.log("连接失败:", error);
        });
      }
    },
    showBindToolDialog(toolNum) {
      this.bindToolForm.toolNum = toolNum;
      this.bindToolDialog = true;
      return;
    },
    showElapsedTimeDialog(toolData) {
      this.updateToolForm.toolData = toolData;
      this.updateToolForm.toolNum = toolData.toolNum;
      this.updateToolForm.toolLife = toolData.toolLife;
      this.updateToolForm.elapsedTime = toolData.elapsedTime;
      this.elapsedTimeDialog = true;
    },
    updateElapsedTime(toolData) {
      console.log(toolData);
      if (toolData != null && toolData != undefined) {
        this.showElapsedTimeDialog(toolData);
      }
    },
    onBindTool(toolNum) {
      const data = this.machineData.toolMagazine[toolNum];
      if (data == null || data == undefined) {
        this.showBindToolDialog(toolNum);
      } else {
        this.unbindTool(toolNum);
      }
    },
    UpdateTool() {
      // console.log(this.bindToolForm.no);
      if (this.updateToolForm.toolData == null) {
        return;
      }
      const token = this.$store.state.authUser.token;
      this.updateToolForm.toolData.elapsedTime = this.updateToolForm.elapsedTime;
      this.$axios
        .post(
          `/MachiningTool/UpdateElapsedTime`,
          this.updateToolForm.toolData,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
          } else {
            this.$swal("", res.data.msg, "error");
          }
        })
        .then(() => {
          this.updateMachineData();
          this.resfreshToolData();
          this.updateToolForm.toolData = null;
          this.elapsedTimeDialog = false;
        });
    },
    bindTool() {
      // console.log(this.bindToolForm.no);
      if (this.bindToolForm.no == null || this.bindToolForm.no == "") {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const tool = {
        toolNum: this.bindToolForm.toolNum,
        type: "toolNo",
        value: this.bindToolForm.no,
        userId: this.$store.state.authUser.id
      };
      this.$axios
        .post(`/Machine/BindTool/${this.machineData.id}`, tool, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
          } else {
            this.$swal("", res.data.msg, "error");
          }
        })
        .then(() => {
          this.updateMachineData();
          this.resfreshToolData();
          this.bindToolForm.no = "";
          this.bindToolDialog = false;
        });
    },
    resfreshToolData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/MachiningTool/Search`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.toolData = res.data.data;
          // console.log(this.toolData);
          this.toolData = this.toolData.filter(x => x.machineId == null);
        });
    },
    unbindTool(toolNum) {
      const token = this.$store.state.authUser.token;
      const tool = {
        toolNum: toolNum,
        type: "toolNo",
        value: null,
        userId: this.$store.state.authUser.id
      };
      this.$swal({
        title: `${this.$t("edit")}${this.$t("machineToolMagazine")}`,
        text: `${this.$t("confirm")}${this.$t("cancel")}${this.$t(
          "bindToolMagazine"
        )}?`,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.$t("confirm")
      }).then(ret => {
        if (ret.isConfirmed) {
          this.$axios
            .post(`/Machine/BindTool/${this.machineData.id}`, tool, {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              if (res.data.isSuccess) {
                this.$swal("", this.$t("editSuccess"), "success");
              } else {
                this.$swal("", res.data.msg, "error");
              }
              this.updateMachineData();
              this.resfreshToolData();
            });
        }
      });
    },
    updateMachineData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .$get(`/Machine/${this.machineData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machineData = res.data;
        });
    },
    getTotalLotWipData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/LotWip/SearchAreaLotWipCount?machineNo=` + this.machineData.no, {
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
      title: this.machineData.name
    };
  },
  mounted() {
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dateRangeText = this.dates[0] + " ~ " + this.dates[1];
    // this.mqttMSG();
    // this.getCurrentJob();
    // this.getTotalLotWipData();
    this.buttonItems[1].text = this.machineData.name;
  },
  activated() {
    // this.mqttMSG();
    // this.getCurrentJob();
    // this.getTotalLotWipData();
    this.dates = [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
    this.dateRangeText = this.dates[0] + " ~ " + this.dates[1];
    this.buttonItems[1].text = this.machineData.name;
  },
  deactivated() {},
  computed: {},
  created() {},
  beforeDestroy() {
    //斷線
    // if (this.mqttClient.connected) {
    //   this.mqttClient.unsubscribe(
    //     `${setting.mqtt.customer}/D200/tc/${this.machineData.no}/EqInfo/GetStatus`,
    //     error => {
    //       console.log("取消訂閱");
    //       if (error) {
    //         console.log("Unsubscribe error", error);
    //       }
    //     }
    //   );
    //   this.mqttClient.end();
    //   this.mqttClient = {
    //     connected: false
    //   };
    // }
  }
};
</script>
