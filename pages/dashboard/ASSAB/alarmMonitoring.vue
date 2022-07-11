<template>
  <v-app
    id="main"
    :style="{ background: $vuetify.theme.themes[theme].background }"
  >
    <v-container id="dashboard" fluid tag="section">
      <v-row no-gutters>
        <v-col cols="1" md="1">
          <v-btn
            fab
            raised
            rounded
            text
            outlined
            small
            color="primary"
            class="mt-2"
            @click.stop="showTreeView()"
          >
            <v-icon dark>
              mdi-eye
            </v-icon>
            <!-- {{ $t("visualization") }} -->
          </v-btn>
        </v-col>
        <v-col style="text-align:center" cols="11"
          ><v-select
            style="font-weight:bold;font-size:20px"
            background-color="#ffffff"
            :items="areaData"
            v-model="selectedArea"
            item-text="areaName"
            item-value="areaNo"
            :label="$t('select') + $t('area')"
            @change="onSelectedChange()"
            outlined
          ></v-select
        ></v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12">
          <AlarmCountRanking
            v-if="selectedArea != ''"
            :data="data"
            :dates="dates"
            :isLoading="isLoading"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12">
          <AlarmTimeRanking
            v-if="selectedArea != ''"
            :data="machineStatusData"
            :dates="dates"
            :isLoading="isLoading"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- 生產區域樹狀圖 -->
    <v-navigation-drawer v-model="drawer" width="400px" absolute temporary>
      <v-treeview
        @input="OnNodeSelected"
        v-model="selectedItem"
        selection-type="leaf"
        return-object
        activatable
        selectable
        hoverable
        open-all
        item-children="children"
        :items="items"
      >
        <template v-slot:prepend="{ item }">
          <v-icon v-if="item.children.length > 0">mdi-home-variant </v-icon>
          <v-icon v-else>
            mdi-bookmark-outline
          </v-icon>
        </template>
      </v-treeview>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import AlarmCountRanking from "~/components/dashboard/AlarmCountRanking.vue";
import AlarmTimeRanking from "~/components/dashboard/AlarmTimeRanking.vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";
import moment from "moment";

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
  lineModel: 0,
  middleware: "auth",

  data() {
    return {
      areaNoData: "",
      selectedItem: [],
      items: [],
      treeAreaList: [],
      group: null,
      drawer: false,
      areaData: [],
      selectedArea: "",
      machineData: [],
      dates: [],
      data: [],
      isLoading: 0,
      machineStatusData: [],
      firstUpdate: true,
      intervalID: null,
      timerId: null
      // UtilizationPieCardHeight: 500
    };
  },
  components: {
    AlarmCountRanking,
    AlarmTimeRanking
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
        x => x.menu_no == "alarmMonitoring"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    const dates = [
      moment().format("YYYY-MM-DD"),
      moment().format("YYYY-MM-DD")
    ];
    let response = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });
    let treeAreaList = response.data.slice(0);
    let areaData = response.data;
    areaData.unshift({
      areaName: "*",
      areaNo: null
    });

    return {
      areaData: areaData,
      dates: dates,
      treeAreaList: treeAreaList
    };
  },
  methods: {
    OnNodeSelected(node) {
      // console.log(node);
    },
    showTreeView() {
      this.updateTreeView();
      this.drawer = true;
    },
    selectedNode(array, id) {
      if (typeof array != "undefined") {
        for (var i = 0; i < array.length; i++) {
          if (array[i].id == id) return array[i];
          var a = this.find(array[i].children, id);
          if (a != null) {
            //console.log(a);
            // a.unshift(array[i].id);
            return a;
          }
        }
      }
      return null;
    },
    find(array, id) {
      if (typeof array != "undefined") {
        for (var i = 0; i < array.length; i++) {
          if (array[i].id == id) return array[i];
          var a = this.find(array[i].children, id);
          if (a != null) {
            // console.log(a);
            // a.unshift(array[i].id);
            return a;
          }
        }
      }
      return null;
    },
    updateTreeView() {
      let itemList = [];
      let IdList = [];
      let dataList = [];
      this.treeAreaList.forEach(element => {
        IdList.push(element.rootId);
      });
      var result = IdList.filter((item, index, arr) => {
        return arr.indexOf(item) === index;
      });
      console.log(result);
      result.forEach(id => {
        let data = this.treeAreaList.filter(x => x.rootId == id);
        let list = [];
        data.forEach(detail => {
          list.push(
            this.getItem(
              detail.id,
              detail.areaName,
              [],
              detail.rootId,
              detail.areaNo
            )
          );
        });
        dataList.push(list);
      });
      //console.log(dataList);

      dataList.forEach(e => {
        if (e[0].rootId == null) {
          e.forEach(element => {
            itemList.push(element);
          });
        }
        // let aa = itemList.find(x => x.id == e[0].rootId);
        // console.log(e);
        // if (aa != undefined) {
        e.forEach(d => {
          // aa.children.push(d);

          // console.log(this.find(itemList, d.rootId));
          let rootData = this.find(itemList, d.rootId);
          if (rootData != undefined && rootData != null) {
            rootData.children.push(d);
          }
        });
        //}
      });
      this.items = itemList;
    },
    getItem(id, name, children, rootId, areaNo) {
      let item = {
        id: id,
        name: name,
        children: children,
        rootId: rootId,
        areaNo: areaNo
      };
      return item;
    },
    onSelectedChange() {
      clearTimeout(this.timerId);
      if (this.firstUpdate) {
        // console.log(this.firstUpdate);
        // this.intervalID = setInterval(this.GetUtilizationData, 30000);
        this.firstUpdate = false;
      }
      this.areaNoData = "";
      this.selectedItem = [];
      this.GetUtilizationData();
      //  console.log(this.selectedArea);
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async GetUtilizationData() {
      await this.sleep(1);
      const token = this.$store.state.authUser.token;
      this.isLoading = 1;
      let areaNo = this.selectedArea;
      if (this.areaNoData.length > 0) {
        areaNo = this.areaNoData;
      }
      this.$axios
        .$get(
          `/MachineStatus/GetAllMachineStatus?startTime=${this.dates[0]}&endTime=${this.dates[1]}&areaNo=${areaNo}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.machineStatusData = res.data;
          let totalStatusData = [];
          if (this.machineStatusData != undefined) {
            this.machineStatusData.forEach(machine => {
              machine.machineStatus.forEach(statusData => {
                totalStatusData.push(statusData);
              });
            });
            this.data = totalStatusData;
            this.isLoading = 0;
          } else {
            this.data = [];
            this.isLoading = 0;
          }
          this.timerId = setTimeout(this.GetUtilizationData, 30000);
          //  console.log(totalStatusData);
        })
        .catch(({ response }) => {
          this.isLoading = 0;
          this.timerId = setTimeout(this.GetUtilizationData, 30000);
        });
    },
    GetMachineList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .$get(`/Machine/Search?areaNo=${this.selectedArea}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machineData = res.data;
        });
    }
  },
  watch: {
    group() {
      this.drawer = false;
    },
    drawer() {
      if (this.drawer == false) {
        //  console.log("close");
        this.areaNoData = "";
        this.selectedArea = this.areaData[0].areaNo;
        this.selectedItem.forEach(item => {
          if (item.areaNo != null) {
            this.areaNoData += item.areaNo + ",";
          }
        });
        //移除最後字元的逗號
        this.areaNoData = this.areaNoData.substring(
          0,
          this.areaNoData.length - 1
        );
        this.GetUtilizationData();
        console.log(this.areaNoData);
      }
    }
  },
  beforeDestroy() {
    // clearInterval(this.intervalID);
    clearTimeout(this.timerId);
    //console.log(this.intervalID);
  },
  deactivated() {
    clearTimeout(this.timerId);
  },
  activated() {
    clearTimeout(this.timerId);
    if (this.selectedArea != "") {
      this.GetUtilizationData();
    }
  },
  mounted() {
    clearTimeout(this.timerId);
    if (this.selectedArea != "") {
      this.GetUtilizationData();
    }
  },
  head() {
    return {
      title: this.$t("alarmMonitoring")
    };
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 10px;
  position: relative;
  max-height: 100%;
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
.v-select__selection,
.v-select__selection--comma,
.v-select.v-text-field input {
  font-weight: bold;
  font-size: large;
}
</style>
