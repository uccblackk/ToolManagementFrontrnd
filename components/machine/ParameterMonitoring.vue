<template>
  <v-layout row wrap style="width:100%">
    <v-flex md12 class="px-2">
      <!-- 新增設備參數 -->
      <v-dialog v-model="addDialog" persistent max-width="800px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text"
              ><v-icon color="white">mdi-plus</v-icon>
              {{ $t("add") + $t("equipment") + $t("parameter") }}</span
            >
          </v-card-title>
          <v-data-table
            :headers="parameterHeaders"
            :items="parameterList"
            v-model="selected"
            :items-per-page="10"
            :loading="isLoading == 1"
            loading-text="Loading... Please wait"
            :sort-by="['ParameterNo']"
            class="elevation-1"
            show-select
            :single-select="false"
          >
          </v-data-table>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="addDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="addParameter()">
              {{ $t("add") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 移除參數彈窗 -->
      <v-dialog v-model="removeDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("remove") + $t("parameter") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") + $t("remove") + $t("parameter") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="removeDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="removeParam()">
              {{ $t("remove") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-card width="100%">
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon class="my-n5">mdi-monitor-eye</v-icon>
          <span class=" ml-2">{{
            $t("equipment") + $t("parameter") + $t("monitoring")
          }}</span>
          <v-spacer />
          <v-btn color="primary" dark class="mb-2" @click="showAddDialog()">
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ $t("add") + $t("equipment") + $t("parameter") }}
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text style="text-align:left">
          <v-alert
            v-if="paramData.length > 0"
            dense
            text
            type="info"
            class="ma-2"
          >
            {{ $t("parameter") + $t("count") }}：<strong>{{
              paramData.length
            }}</strong>
          </v-alert>
          <v-alert v-else dense text type="warning" class="ma-2">
            {{ $t("parameter") + $t("count") }}：<strong>{{
              paramData.length
            }}</strong>
          </v-alert>
          <v-data-table
            :headers="headers"
            :items="paramData"
            :items-per-page="itemsPerPage"
            class="elevation-1 text-center"
            @page-count="pageCount = $event"
            :page.sync="page"
            hide-default-footer
          >
            <template v-slot:item.action="{ item }">
              <v-icon small @click="showRemoveDialog(item.value)">
                mdi-delete
              </v-icon>
            </template>
            <template v-slot:item.time="{ item }">
              {{ getParamTime(item.value.parameterNo) }}
            </template>
            <template v-slot:item.parameterValue="{ item }">
              {{
                getParamValue(item.value.parameterNo) +
                  " (" +
                  item.value.unit +
                  ")"
              }}
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
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>
<script>
import moment from "moment";
import mqtt from "mqtt";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    data: null
  },
  data() {
    return {
      mqttParamData: [],
      snackbar: false,
      snackbarText: null,
      machineData: {},
      seletctdItem: null,
      removeDialog: false,
      mqttParam: [],
      selected: [],
      parameterList: [],
      addDialog: false,
      mqttData: {},
      mqttClient: {},
      status: [
        { name: this.$t("all"), value: "" },
        { name: this.$t("status1"), value: "1" },
        { name: this.$t("status2"), value: "2" },
        { name: this.$t("status5"), value: "5" },
        { name: this.$t("status7"), value: "7" }
      ],
      isLoading: 0,
      search: "",
      sotDesc: true,
      statusData: null,
      paramData: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      timsStamp: null,
      headers: [
        // { value: "select", sortable: false, width: "1%" },
        {
          text: this.$t("No"),
          align: "left",
          sortable: false,
          value: "key",
          filterable: false,
          width: "5%"
        },

        {
          text: this.$t("parameter") + this.$t("name"),
          value: "value.parameterName",
          align: "left",
          filterable: false,
          sortable: false,
          width: "20%"
        },
        {
          text: this.$t("value"),
          align: "left",
          sortable: true,
          filterable: false,
          value: "parameterValue",
          width: "20%"
        },
        {
          text: this.$t("time"),
          value: "time",
          align: "left",
          filterable: false,
          sortable: false,
          width: "20%"
        },
        {
          text: this.$t("action"),
          value: "action",
          align: "right",
          filterable: false,
          sortable: false
        }
      ],
      parameterHeaders: [
        {
          text: this.$t("parameter") + this.$t("name"),
          value: "parameterNo",
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("parameter") + this.$t("No"),
          value: "parameterName",
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("unit"),
          value: "unit",
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("standardValue"),
          value: "standardValue",
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("upperLimit"),
          value: "upperLimit",
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("lowerLimit"),
          value: "lowerLimit",
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("itemDesc"),
          value: "description",
          sortable: false,
          align: "left"
        }
      ]
    };
  },

  methods: {
    showRemoveDialog(param) {
      this.seletctdItem = param;
      this.removeDialog = true;
    },
    removeParam() {
      let parameter = {};
      let k = 1;
      for (let i = 0; i < this.paramData.length; i++) {
        //console.log(this.paramData[i]);
        if (
          this.paramData[i].value.parameterNo != this.seletctdItem.parameterNo
        ) {
          parameter[k] = this.paramData[i].value.id;
          k++;
        }
      }

      const token = this.$store.state.authUser.token;
      this.$axios
        .post(`/Machine/BindParameter/${this.machineData.id}`, parameter, {
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
          this.$emit("update");
          this.removeDialog = false;
        });
    },
    getParamValue(parameterNo) {
      let data = this.mqttParam.find(x => x.parameter == parameterNo);
      if (data != undefined) {
        // console.log(data);
        return data.value;
      } else {
        return "N/A";
      }
    },
    getParamTime(parameterNo) {
      let data = this.mqttParam.find(x => x.parameter == parameterNo);
      if (data != undefined) {
        // console.log(data);
        return data.time;
      } else {
        return "N/A";
      }
    },
    addParameter() {
      // console.log(this.selected);
      if (this.selected.length == 0) {
        this.snackbar = true;
        this.snackbarText = "無選擇參數。";
        return;
      }
      let parameter = {};
      for (let j = 0; j < this.paramData.length; j++) {
        parameter[j + 1] = this.paramData[j].value.id;
      }

      for (let i = 0; i < this.selected.length; i++) {
        parameter[this.paramData.length + i + 1] = this.selected[i].id;
      }
      // console.log(parameter);
      // return;
      const token = this.$store.state.authUser.token;

      this.$axios
        .post(`/Machine/BindParameter/${this.machineData.id}`, parameter, {
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
          this.$emit("update");
          this.addDialog = false;
        });
    },
    getParameterData() {
      this.parameterList = [];
      const token = this.$store.state.authUser.token;
      this.isLoading = 1;
      this.$axios
        .get(`/Parameter/Search?value=${this.parameterSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let data = res.data.data;
          //    this.parameterList = res.data.data != null ? res.data.data : [];
          // 過濾已經加入的資料
          data.forEach(Element => {
            if (
              this.paramData.find(
                x => x.value.parameterNo == Element.parameterNo
              ) == undefined
            )
              this.parameterList.push(Element);
          });
          this.isLoading = 0;
        });
    },
    showAddDialog() {
      this.addDialog = true;
      this.selected = [];
      this.getParameterData();
    },
    getLastTime(actualStartTime, actualEndTime) {
      let lastTime = "";
      const diff = moment.duration(
        actualEndTime.getTime() - actualStartTime.getTime()
      );
      if (diff.months() > 0) {
        return `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.days() > 0) {
        return ` ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.hours() > 0) {
        return ` ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.minutes() > 0) {
        return ` ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.seconds() > 0) {
        return ` ${diff.seconds()} sec`;
      }
    },
    getStatus(machineStatus) {
      let name = "";
      switch (machineStatus) {
        case "1":
          name = this.$t("status1");
          break;
        case "2":
          name = this.$t("status2");
          break;
        case "5":
          name = this.$t("status5");
          break;
        case "7":
          name = this.$t("status7");
          break;
      }
      return name;
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
        case "1":
          color = "success";
          break;
        case "2":
          color = "error";
          break;
        case "5":
          color = "warning";
          break;
        case "7":
          color = "black";
          break;
      }
      return color;
    },

    getMachineParamData() {
      let param = {};
      //let data = [];
      param = this.mqttData.data;
      //console.log(param.FeedOverride);
      //console.log(new Date(this.mqttData.ts));
      for (var key in param) {
        //console.log("key " + key + " has value " + param[key]);
        let result = this.mqttParamData.find(x => x.parameter == key);

        if (result != undefined) {
          let pos = this.mqttParamData.indexOf(result);
          this.mqttParamData.splice(pos, 1);
        }
        this.mqttParamData.push({
          parameter: key,
          value: param[key],
          time: new Date(param["time"]).toLocaleString()
        });
      }
      //console.log(this.mqttParamData);
      this.mqttParam = this.mqttParamData;
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
      // console.log(options);
      // mqtt连接
      if (!this.mqttClient.connted) {
        this.mqttClient = mqtt.connect(setting.mqtt.url, options);
        this.mqttClient.on("connect", e => {
          console.log("连接成功:");
          this.mqttClient.subscribe(
            `${setting.mqtt.customer}/D200/tc/${this.machineData.no}/EqInfo/GetParam/+`,
            { qos: 0 },
            error => {
              if (!error) {
                console.log("订阅成功");
              } else {
                console.log("订阅失败");
              }
            }
          );
        });
        // 接收消息处理
        this.mqttClient.on("message", (topic, message) => {
          const mqttData = JSON.parse(message.toString());
          this.mqttData = mqttData;
          // this.resfreshMachineStatus();
          this.getMachineParamData();
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          console.log("连接失败:", error);
        });
      }
    }
  },
  mounted() {
    this.machineData = this.data;
    this.paramData = this.machineData.parameter;
  },
  deactivated() {
    if (this.mqttClient.connected) {
      this.mqttClient.unsubscribe(
        `${setting.mqtt.customer}/D200/tc/${this.machine.no}/EqInfo/GetParam`,
        error => {
          //   console.log("取消訂閱");
          if (error) {
            //  console.log("Unsubscribe error", error);
          }
        }
      );
      this.mqttClient.end();
      this.mqttClient = {
        connected: false
      };
    }
  },
  activated() {
    this.machineData = this.data;
    this.paramData = this.machineData.parameter;
  },
  computed: {},
  watch: {
    data() {
      this.machineData = this.data;
      this.paramData = this.machineData.parameter;
      //console.log("watch");
    }
  },
  beforeDestroy() {
    //斷線
    this.mqttClient.unsubscribe(
      `${setting.mqtt.customer}/D200/tc/${this.machineData.no}/EqInfo/GetParam`,
      error => {
        console.log("取消訂閱");
        if (error) {
          console.log("Unsubscribe error", error);
        }
      }
    );
    this.mqttClient.end();
    this.mqttClient = {
      connected: false
    };
  },
  created() {
    //console.log(this.machineNo);
    this.mqttMSG();
  }
};
</script>
