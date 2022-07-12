<template>
  <v-app dark>
    <!-- <v-navigation-drawer app clipped permanent mini-variant expand-on-hover> -->
    <v-navigation-drawer fixed v-model="drawer" temporary>
      <v-list nav dense>
        <v-list-item-group active-class="green--text">
          <div v-for="(link, i) in links" :key="i">
            <v-list-item v-if="!link.subLinks" :to="link.to" avatar>
              <v-list-item-icon>
                <v-icon>{{ link.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-title v-text="$t(link.text)" />
            </v-list-item>

            <v-list-group
              v-else
              :key="link.text"
              no-action
              :prepend-icon="link.icon"
              :value="false"
            >
              <template v-slot:activator>
                <v-list-item-title>{{ $t(link.text) }}</v-list-item-title>
              </template>

              <v-list-item
                v-for="sublink in link.subLinks"
                :to="sublink.to"
                :key="sublink.text"
              >
                <v-list-item-icon>
                  <v-icon>{{ sublink.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t(sublink.text) }}</v-list-item-title>
              </v-list-item>
            </v-list-group>
          </div>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar fixed app color="green darken-2" style="color:white">
      <v-app-bar-nav-icon style="color:white" @click="drawer = true" />
      <!-- <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>-->
      <!-- <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>-->
      <!-- <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>mdi-minus</v-icon>
      </v-btn>-->
      <v-btn icon style="color:white">
        <v-icon @click="onIndexBtnClick()">mdi-earth</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <!-- <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>-->
      <div style="margin-right:10px;color:white">
        <span v-if="$store.state.authUser != null">
          <v-avatar
            v-if="$store.state.authUser.role != 'admin'"
            color="primary white--text text-caption"
            style="max-width: 30px;"
            size="30"
            dark
          >
            <span class="text-truncate" style="max-width: 25px;">
              {{ $store.state.authUser.name.charAt(0) }}
            </span>
          </v-avatar>
          <v-avatar
            v-if="$store.state.authUser.role == 'admin'"
            color="error white--text text-caption"
            style="max-width: 30px;"
            size="30"
            dark
          >
            <span class="text-truncate" style="max-width: 25px;">
              {{ $store.state.authUser.name.charAt(0) }}
            </span>
          </v-avatar>
        </span>
        <!-- <v-btn icon style="color:white">
          <v-icon>mdi-account</v-icon>
        </v-btn> -->
      </div>
      <div
        v-if="$store.state.authUser != null"
        style="margin-right:5px;color:white"
      >
        <div>
          <span style="font-size:8px;color:white">{{
            $store.state.authUser.name
          }}</span>
        </div>
        <div>
          <span style="font-size:5px;color:white">{{
            $t($store.state.authUser.role)
          }}</span>
        </div>
      </div>
      <v-menu left bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            style="font-size:8px;color:white"
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <!-- <v-list-item @click="() => {}">
            <v-list-item-title>變更密碼</v-list-item-title>
          </v-list-item> -->

          <!-- <v-list-item @click="setting" style="color:gray">
            <v-list-item-title>{{ $t("setting") }}</v-list-item-title>
          </v-list-item> -->
          <v-list-item @click="logout" style="color:white">
            <v-list-item-title>{{ $t("logout") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <div class="pa-4">
        <nuxt />
      </div>
    </v-main>
    <SettingDialog
      :showSettingDialog="showSettingDialog"
      @update="updateSettingDialog()"
    ></SettingDialog>
    <!-- <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>mdi-repeat</v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer> -->
    <v-footer :absolute="!fixed" app>
      <span
        >Copyright &copy; {{ new Date().getFullYear() + "  " + customerName }}
      </span>
    </v-footer>
  </v-app>
</template>
<style>
html {
  font-family: "Microsoft JhengHei", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
</style>
<script>
import mqtt from "mqtt";
import SettingDialog from "~/components/setting/SettingDialog.vue";
const setting = require(`@/static/setting/setting.json`);
export default {
  data() {
    return {
      timerId: null,
      showSettingDialog: false,
      power: true,
      menuList: [],
      clipped: false,
      drawer: false,
      fixed: false,
      customerName: null,
      links: [],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "ToolManagement",
      userType: "",
      messageCount: 0,
      mqttClient: {}
    };
  },
  components: {
    SettingDialog
  },
  mounted() {
    this.customerName = setting.customerName;
    //console.log(this.$store.state.authUser);
    if (this.$store.state.authUser == "undefined") {
      return;
    }
    switch (this.$store.state.authUser.role) {
      case "admin":
        this.userType = "管理者";
        break;
      case "user":
        this.userType = "一般使用者";
        break;
    }
    this.getMenuHeaders();
  },
  created() {},

  beforeDestroy() {
    clearTimeout(this.timerId);
  },
  methods: {
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
          // console.log("连接成功:");
          this.mqttClient.subscribe(
            `${this.$store.state.authUser.id}/msg`,
            { qos: 0 },
            error => {
              if (!error) {
                //  console.log("订阅成功");
              } else {
                //  console.log("订阅失败");
              }
            }
          );
        });
        // 接收消息处理
        this.mqttClient.on("message", (topic, message) => {
          this.messageCount = message.toString();
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          //  console.log("连接失败:", error);
        });
      }
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
    resfreshMessage() {
      const token = this.$store.state.authUser.token;
      // console.log(this.$store.state.authUser);
      this.$axios
        .get(
          `/Message/Refresh?userId=${this.$store.state.authUser.id}&status=N`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.messageCount = res.data.data != null ? res.data.data : [];
          } else {
            this.messageCount = 0;
          }
          this.timerId = setTimeout(this.resfreshMessage, 1000 * 5);
        })
        .catch(({ response }) => {
          this.timerId = setTimeout(this.resfreshMessage, 1000 * 5);
        });
    },
    onMessageBtnClick() {
      this.$router.push(`/message`);
    },
    onPowerBtnClick() {
      this.$router.push(`/powerMonitoring`);
    },
    onIndexBtnClick() {
      this.$router.push(`/`);
    },
    async logout() {
      try {
        //取消訂閱MQTT
        if (this.mqttClient.connected) {
          this.mqttClient.unsubscribe(
            `${this.$store.state.authUser.id}/msg`,
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
        await this.$store.dispatch("logout");
      } catch (e) {
        this.formError = e.message;
      }
    },
    async setting() {
      this.showSettingDialog = true;
    },
    updateSettingDialog() {
      this.showSettingDialog = false;
    },
    getMenuHeaders() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Menu/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.menuList = res.data.data != null ? res.data.data : [];
          //console.log(this.userData);

          if (this.$store.state.authUser.authority != null) {
            for (let i = 0; i < this.menuList.length; i++) {
              let menuData = {
                icon: this.menuList[i].icon,
                text: this.menuList[i].text,
                sequence: this.menuList[i].sequence,
                subLinks: []
              };
              this.$store.state.authUser.authority.forEach(element => {
                if (
                  this.menuList[i].sublinks.find(
                    x => x.menu_no == element.menu_no
                  ) != undefined
                ) {
                  menuData.subLinks.push(
                    this.menuList[i].sublinks.find(
                      x => x.menu_no == element.menu_no
                    )
                  );
                  //   console.log(this.selected);
                }
              });
              // 重整sublinks順序
              menuData.subLinks.sort(function(a, b) {
                return a.sequence.localeCompare(b.sequence, "en", {
                  numeric: true
                });
              });

              this.links.push(menuData);
            }
            // 重整links順序
            this.links.sort(function(a, b) {
              return a.sequence.localeCompare(b.sequence, "en", {
                numeric: true
              });
            });
            // console.log(this.links);
          }
        });
    }
  }
};
</script>
<style>
body::-webkit-scrollbar {
  width: 1em;
}

body::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

body::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 1px solid slategrey;
}
</style>
