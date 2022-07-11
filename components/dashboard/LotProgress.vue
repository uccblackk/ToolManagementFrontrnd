<template>
  <div style="width: 100%;">
    <v-card id="info-box" :loading="loading" height="630px">
      <template slot="progress">
        <v-progress-linear
          color="primary"
          height="5"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-card-title class="text-h5 font-weight-bold">
        {{ $t("jobNo") + $t("progress") }}
        <v-spacer />
        <span v-if="totalCount != 0" class="caption">
          {{ "共 " + totalCount + " 筆" }}
        </span>
      </v-card-title>

      <v-card-text>
        <!-- <v-carousel
          light
          cycle="true"
          hide-delimiters
          show-arrows-on-hover
          height="550px"
          v-model="model"
        >
          <v-carousel-item v-for="(data, i) in totalData" :key="i"> -->
        <v-row>
          <v-col cols="12">
            <v-card
              width="100%"
              :color="getCardColor(detail.moData)"
              v-for="(detail, idx) in totalData"
              :key="idx"
            >
              <v-card-title
                style="color:black"
                class="text-subtitle-2 font-weight-black"
              >
                <v-row no-gutters>
                  <v-col cols="1">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          :color="getStatusColor(detail.status)"
                          v-bind="attrs"
                          v-on="on"
                          class="mb-1"
                          >mdi-circle</v-icon
                        >
                      </template>
                      <p>
                        {{
                          $t("tray") +
                            $t("status") +
                            "：" +
                            getTaryDate(detail.lot.lotNo, detail.opNo).status
                        }}
                      </p>
                      <p class="mb-0">
                        {{
                          $t("time") +
                            "：" +
                            getTaryDate(detail.lot.lotNo, detail.opNo).time
                        }}
                      </p>
                    </v-tooltip>
                  </v-col>
                  <v-col md="5" class="text-truncate">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          @click="
                            redirectToDetail(
                              detail.lot.lotNo,
                              detail.lotWipData.dispatchStartDate
                            )
                          "
                          v-bind="attrs"
                          v-on="on"
                        >
                          {{ detail.lot.lotNo }}
                        </span>
                      </template>
                      {{ detail.lot.lotNo }}
                    </v-tooltip>
                  </v-col>
                  <v-col md="3" class="text-truncate">
                    <!-- <v-icon
                      v-bind="attrs"
                      v-on="on"
                      v-if="detail.moData.urgent == 'Y'"
                      small
                      color="red"
                    >
                      mdi-fire-alert
                    </v-icon> -->
                    <span class="caption">
                      {{ detail.opName }}
                    </span>
                  </v-col>

                  <v-col md="3" class="text-right text-truncate">
                    <!-- <span
                      v-if="detail.moData.urgent == 'Y'"
                      style="color:red"
                      class="caption font-weight-black"
                    >
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <span v-bind="attrs" v-on="on">
                            {{ detail.moData.planEndDate }}
                          </span>
                        </template>
                        {{ $t("urgentMo") }}
                      </v-tooltip>
                    </span> -->
                    <span class="caption">
                      {{ detail.lotWipData.dispatchStartDate }}
                    </span>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-subtitle class="font-weight-bold" style="color:black">
                <v-row no-gutters>
                  <v-col class="text-truncate">
                    {{ detail.lotWipData.resourceName }}
                  </v-col>
                  <v-col class="text-truncate">
                    {{
                      detail.moData.itemName + "(" + detail.moData.itemNo + ")"
                    }}
                  </v-col>
                  <v-col
                    v-if="detail.lotWipData.outQty != null"
                    class="text-right text-truncate"
                  >
                    {{
                      detail.lotWipData.outQty +
                        "/" +
                        detail.lotWipData.planQty +
                        " (" +
                        getProgressValue(detail) +
                        "%)"
                    }}
                  </v-col>
                  <v-col v-else class="text-right text-truncate">
                    {{ "0/" + detail.lotWipData.planQty + " (0%)" }}
                  </v-col>
                </v-row>

                <v-progress-linear
                  height="5"
                  :color="getStatusColor(detail.status)"
                  :value="getProgressValue(detail)"
                >
                </v-progress-linear>
              </v-card-subtitle>
              <!-- <v-card-actions>
             
              </v-card-actions> -->
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <!-- </v-carousel-item>
        </v-carousel> -->
            <v-pagination
              v-if="totalData.length > 0"
              :total-visible="7"
              v-model="page"
              :length="totalPage"
              circle
              color="secondary"
              @input="onPageChange()"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
import Stomp from "stompjs";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    data: {},
    areaNo: null
  },
  data() {
    return {
      snackbar: false,
      snackbarText: null,
      page: 0,
      totalCount: 0,
      totalPage: 1,
      selectedItem: null,
      items: [
        { text: "Real-Time", icon: "mdi-clock" },
        { text: "Audience", icon: "mdi-account" },
        { text: "Conversions", icon: "mdi-flag" }
      ],
      colors: ["primary", "secondary", "yellow darken-2", "red", "orange"],
      model: 0,
      height: null,
      machineData: [],
      dataPoints: [],
      mqttData: [],
      mqttClient: {},
      runningCount: 0,
      idleCount: 0,
      errorCount: 0,
      disconnectCount: 0,
      dataTableHeight: 0,
      itemList: [],
      lotWipData: [],
      loading: false,
      overlay: false,
      itemPerPage: 5,
      totalData: [],
      lotCount: 0,
      mounted: 0,
      intervalID: null,
      timerId: null,
      client: null,
      trayData: []
    };
  },

  methods: {
    getCardColor(moData) {
      let color = "transparent";
      if (moData.urgent == "Y") {
        color = "#FFEFEF";
      }
      return color;
    },
    redirectToDetail(lotNo, date) {
      this.$router.push(`/jobReport/jobReport/${lotNo}?date=${date}`);
    },
    onPageChange() {
      clearTimeout(this.timerId);
      this.page--;
      this.refreshData();
    },
    getTaryDate(lotNo, opNo) {
      let data = this.trayData.find(
        x => x.LOT_NO == lotNo && x.SECTION_TYPE_I18n == opNo
      );
      // console.log(lotNo);
      // console.log(opNo);
      let result = {};
      if (data == undefined) {
        result = { status: "--", time: "--" };
      } else {
        result = {
          status: data.SECTION_STATUS,
          time: new Date(data.Time).toLocaleString()
        };
      }
      return result;
    },
    getStatusColor(status) {
      let color = "";

      switch (status) {
        case "new":
          color = "grey ";
          break;
        case "createlot":
          color = "grey darken-1 ";
          break;
        case "dispatch":
          color = "orange darken-1";
          break;
        case "producted":
          color = "green accent-4";
          break;
        case "pause":
          color = "red darken-1";
          break;
        case "complete":
          color = "light-blue accent-4";
          break;
        default:
          color = "blue-grey darken-3";
          break;
      }
      //console.log(color);
      return color;
    },
    getProgressValue(detail) {
      let progress = 0;
      if (detail.lotWipData.outQty != null) {
        progress =
          Math.round(
            parseFloat(
              detail.lotWipData.outQty / parseFloat(detail.lotWipData.planQty)
            ) * 100
          ) / 100;
        progress = Math.round(progress * 100 * 100) / 100;
      }

      return progress;
    },
    transData() {
      this.dataPoints = [];
    },

    updateDataTableHeight() {
      this.dataTableHeight = this.$refs.parentDiv.clientHeight;
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
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async refreshData() {
      await this.sleep(1);
      this.loading = true;
      let total_Data = [];
      this.lotWipData = [];
      // this.totalData = [];
      //每次觸發都讓page+1
      //若page+1>total page,則page再從1開始
      this.page++;
      if (this.page > this.totalPage) {
        this.page = 1;
      }

      const token = this.$store.state.authUser.token;

      this.$axios
        .$get(
          `/LotOp/SearchForJobReport?value=&status=dispatch,producted,pause&page=${this.page}&itemPerPage=${this.itemPerPage}&areaNo=${this.areaNo}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.lotCount = 0;
          this.totalData = res.data;
          this.totalCount = res.totalCount;
          console.log(this.totalData);
          this.totalPage = res.totalPage;
          // console.log(this.machineData);
          this.loading = false;
          this.timerId = setTimeout(this.refreshData, 1000 * 6);
        })
        .catch(({ response }) => {
          this.loading = false;
          this.timerId = setTimeout(this.refreshData, 1000 * 6);
          this.snackbar = true;
          this.snackbarText = "MES後台伺服器異常。";
        });
    },
    // async refreshData() {
    //   await this.sleep(1);
    //   this.loading = true;
    //   let total_Data = [];
    //   this.lotWipData = [];
    //   // this.totalData = [];

    //   const token = this.$store.state.authUser.token;

    //   this.$axios
    //     .$get(`/LotOp/Search?value=&status=dispatch,producted,pause`, {
    //       headers: {
    //         Authorization: token
    //       }
    //     })
    //     .then(res => {
    //       this.lotCount = 0;
    //       this.lotWipData = res.data;
    //       if (this.lotWipData.length > 0) {
    //         this.lotWipData.sort(function(a, b) {
    //           return b.moData.urgent.localeCompare(a.moData.urgent);
    //         });
    //       }
    //       //console.log(this.lotWipData);
    //       let intValue = this.lotWipData.length / this.itemPerPage;
    //       let remainder = this.lotWipData.length % this.itemPerPage;
    //       let detail = [];
    //       for (let i = 0; i < this.lotWipData.length; i++) {
    //         if (this.machineData != undefined) {
    //           if (
    //             this.machineData.find(
    //               x => x.no == this.lotWipData[i].lotWipData.resourceNo
    //             ) != undefined
    //           ) {
    //             this.lotCount++;
    //             //  console.log(this.lotCount);
    //             detail.push(this.lotWipData[i]);
    //             if (
    //               (i + 1) % this.itemPerPage == 0 ||
    //               i + 1 == this.lotWipData.length
    //             ) {
    //               total_Data.push(detail);
    //               detail = [];
    //             }
    //           }
    //           // console.log(detail);
    //         }
    //       }
    //       this.totalData = total_Data;
    //       // console.log(this.machineData);
    //       this.loading = false;
    //       this.timerId = setTimeout(this.refreshData, 1000 * 60);
    //     });
    // },
    connect() {
      //这里填你rabbitMQ的连接ip地址直接替换localhost:15674就好其它的不用改
      this.client = Stomp.client(setting.rabbitMQ.url);
      this.client.debug = null;
      //填写你rabbitMQ登录的用户名和密码
      var headers = {
        login: setting.rabbitMQ.userName,
        passcode: setting.rabbitMQ.password,
        //虚拟主机，默认“/”
        host: "/"
      };
      //创建连接,放入连接成功和失败回调函数
      this.client.connect(headers, this.onConnected, this.onFailed);
    },
    onConnected(frame) {
      console.log("Connected: " + frame);
      //绑定交换机exchange_pushmsg是交换机的名字rk_pushmsg是绑定的路由key
      // var exchange = "/exchange/exchange_pushmsg/rk_pushmsg";
      var queue = "/queue/qTopic_test2";
      //创建随机队列用上面的路由key绑定交换机,放入收到消息后的回调函数和失败的回调函数
      this.client.subscribe(queue, this.responseCallback, this.onFailed);
      console.log(frame);
    },
    onFailed(frame) {
      console.log("Failed: " + frame);
    },
    responseCallback(frame) {
      console.log("得到的消息 msg=>" + frame.body);
      let data = {};
      data = JSON.parse(frame.body);
      //console.log(data);
      // console.log(data);
      //1 .接到托盤狀態後, 寫入array
      let pos = -1;
      //先檢查是否存在相同生產批與製程的資料
      let result = this.trayData.find(
        x =>
          x.LOT_NO == data.LOT_NO &&
          x.SECTION_TYPE_I18n == data.SECTION_TYPE_I18n
      );
      if (result != undefined) {
        //若存在,則取得其於陣列內的index位置
        pos = this.trayData.indexOf(result);
      }

      if (pos == -1) {
        //若不存在則直接新增
        this.trayData.push(data);
      } else {
        //若存在,則需要移除原先的資料,再新增當前的資料至陣列
        this.trayData.splice(pos, 1);
        this.trayData.push(data);
      }
      console.log(this.trayData);

      //接收到服务器推送消息，向服务器定义的接收消息routekey路由rk_recivemsg发送确认消息
      // this.client.send(
      //   "/exchange/exchange_pushmsg/rk_recivemsg",
      //   { "content-type": "text/plain" },
      //   frame.body
      // );
    }
  },

  beforeDestroy() {
    // clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    if (this.client != null) {
      this.client.disconnect();
    }
    //console.log(this.intervalID);
  },
  mounted() {
    clearTimeout(this.timerId);
    this.machineData = this.data;
    this.refreshData();
    this.mounted = 1;
    this.connect();
  },
  deactivated() {
    clearTimeout(this.timerId);
    if (this.client != null) {
      this.client.disconnect();
    }
  },
  activated() {
    clearTimeout(this.timerId);
    this.machineData = this.data;
    this.refreshData();
    this.mounted = 1;
    this.connect();
  },
  created() {},
  watch: {
    data() {
      //console.log("watch");
      //console.log(this.data);
      clearTimeout(this.timerId);
      this.page = 0;
      this.machineData = this.data;
      if (this.mounted == 1) {
        this.mounted = 0;
        return;
      }

      this.refreshData();
    }
  },
  head() {
    return {};
  }
};
</script>
<style></style>
