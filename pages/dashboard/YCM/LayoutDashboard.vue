<template>
  <v-app
    id="main"
    rounded
    style="background: rgb(2,0,36);
background: linear-gradient(17deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%); border-radius: 10px;"
  >
    <v-container id="dashboard" fluid tag="section">
      <v-row>
        <v-col cols="12" md="12" lg="12">
          <YCM_Y3_Layout :data="machineList" :trayData="trayData" />
        </v-col>
        <v-col cols="12" md="12" lg="12">
          <YCM_Y4_Layout :data="machineList" :trayData="trayData" />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import Stomp from "stompjs";
import YCM_Y3_Layout from "~/components/dashboard/YCM/Y3/Layout.vue";
import YCM_Y4_Layout from "~/components/dashboard/YCM/Y4/Layout.vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";

const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        background: colors.grey.lighten4
      }
    }
  }
});
export default {
  name: "App",
  middleware: "auth",

  data() {
    return {
      machineList: [],
      client: null,
      trayData: []
      // UtilizationPieCardHeight: 500
    };
  },
  components: {
    YCM_Y3_Layout,
    YCM_Y4_Layout
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    }
  },
  async asyncData({ app, params, store, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(
        x => x.menu_no == "productionDashboard"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let machineResponse = await app.$axios.$get(`/Machine/Search?name=`, {
      headers: {
        Authorization: token
      }
    });
    //console.log(machineResponse.data);
    return {
      machineList: machineResponse.data
    };
  },
  methods: {
    connect() {
      //这里填你rabbitMQ的连接ip地址直接替换localhost:15674就好其它的不用改
      this.client = Stomp.client("ws://localhost:15674/ws");
      this.client.debug = null;
      //填写你rabbitMQ登录的用户名和密码
      var headers = {
        login: "itri",
        passcode: "d200",
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
      //console.log(this.trayData);

      //接收到服务器推送消息，向服务器定义的接收消息routekey路由rk_recivemsg发送确认消息
      // this.client.send(
      //   "/exchange/exchange_pushmsg/rk_recivemsg",
      //   { "content-type": "text/plain" },
      //   frame.body
      // );
    }
  },
  beforeDestroy() {
    if (this.client != null) this.client.disconnect();
  },
  deactivated() {
    this.client.disconnect();
  },
  activated() {
    this.connect();
  },
  mounted() {
    //初始化连接
    // this.connect();
    console.log(this.machineList);
  },
  head() {
    return {
      title: this.$t("productionDashboard")
    };
  }
};
</script>
<style lang="scss" scoped>
html {
  overflow-y: auto;
}
.container {
  position: relative;
  max-height: 100%;

  overflow: hidden;
}
th {
  border-bottom: 1px solid rgb(179, 179, 179);
  font-family: 微軟正黑體;
  color: rgb(65, 65, 65);
  font-size: 24px;
}
@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
