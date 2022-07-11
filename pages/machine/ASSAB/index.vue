<template>
  <v-app>
    <v-container fluid>
      <v-layout row wrap class="mx-2">
        <v-flex xs12>
          <v-form>
            <v-container>
              <v-row class="text-center">
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
                <v-col cols="2" md="2">
                  <v-select
                    v-model="areaData"
                    :items="areaList"
                    :label="$t('area')"
                    item-text="areaName"
                    item-value="areaNo"
                  ></v-select>
                </v-col>
                <v-col cols="2" md="3">
                  <v-select
                    v-model="machineType"
                    :items="machineTypeList"
                    :label="$t('machineType')"
                  ></v-select>
                </v-col>
                <v-col cols="8" md="6">
                  <v-text-field
                    :placeholder="$t('machineName')"
                    v-model="machineName"
                    append-icon="mdi-magnify"
                    @click:append="onSearch"
                    clearable
                  >
                  </v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-flex>
      </v-layout>
      <v-layout row wrap class="mt-n6">
        <v-flex xs12 md3 v-for="item in machines" :key="item.id" class="pa-2">
          <MachineCard
            :machineData="item"
            showDelete="true"
            @delete="getData()"
          />
        </v-flex>
      </v-layout>

      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
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
import MachineCard from "~/components/machine/MachineCard.vue";
export default {
  middleware: "auth",
  data() {
    return {
      allParentNodes: true,
      selectedItem: [],
      items: [],
      treeAreaList: [],
      group: null,
      drawer: false,
      overlay: false,
      areaNoData: "",
      areaData: [],
      areaList: [],
      machines: {},
      machineName: null,
      machineType: "*",
      machineTypeList: [
        "*",
        "CNC",
        "Robot",
        "EDM",
        "EW",
        "ED",
        "UPL",
        "MI",
        "SG"
      ],
      showAddDialog: false,
      addMachineForm: {
        name: "",
        type: "CNC",
        brand: "",
        series: "",
        notice: "",
        setting: {}
      }
    };
  },
  async asyncData({ app, params, store, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "equipmentInfo") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    const response = await app.$axios.$get(`/Machine/Search?machineName=`, {
      headers: {
        Authorization: token
      }
    });

    return { machines: response.data };
  },
  head() {
    return {
      title: this.$t("equipmentInfo")
    };
  },
  watch: {
    group() {
      this.drawer = false;
    },
    drawer() {
      if (this.drawer == false) {
        //console.log("close");
        this.areaNoData = "";
        this.areaData = this.areaList[0].areaNo;
        this._selection.forEach(item => {
          if (item.areaNo != null) {
            this.areaNoData += item.areaNo + ",";
          }
        });
        //移除最後字元的逗號
        this.areaNoData = this.areaNoData.substring(
          0,
          this.areaNoData.length - 1
        );
        this.getData();
        console.log(this._selection);
      }
    }
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
      // console.log(result);
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
    getData() {
      const token = this.$store.state.authUser.token;
      let machineName = this.machineName;
      let areaNo = this.areaData;
      if (this.areaNoData.length > 0) {
        areaNo = this.areaNoData;
      }
      this.overlay = true;
      this.$axios
        .get(`/Machine/Search?value=${machineName}&areaNo=${areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machines = res.data.data;
          // this.selectedItem = [];
          if (this.machineType != "*") {
            this.machines = this.machines.filter(
              item => item.type === this.machineType
            );
          }
          this.overlay = false;
        });
    },
    onSearch() {
      this.areaNoData = "";
      this.getData();
    },
    addMachine() {},
    getAreaData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Area/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
          this.treeAreaList = this.areaList.slice(0);
          this.areaList.unshift({
            areaNo: "",
            areaName: "*"
          });
          this.areaData = this.areaList[0].areaNo;
          // if (this.areaList.length > 0) {
          //   this.areaData = this.areaList[0];
          // }
        });
    }
  },
  computed: {
    _items() {
      const replaceChildren = (obj, parent) => {
        const clone = Object.assign({}, obj);
        delete clone.children;
        if (parent) clone.parent = parent;
        return clone;
      };

      const addItems = (arr, parent) => {
        const items = arr.reduce((acc, x) => {
          acc.push(replaceChildren(x, parent));

          if (x.children) {
            acc.push(addItems(x.children, x.id));
          }
          return acc;
        }, []);

        return items.flat();
      };

      return addItems(this.items).reduce((acc, x) => {
        acc[x.id] = x;
        return acc;
      }, {});
    },
    _selection() {
      const proxy = {};
      const addParents = (x, all) => {
        const parentId = this._items[x.id].parent;
        if (parentId) {
          if (all) addParents(this._items[parentId]);
          proxy[parentId] = this._items[parentId];
        }
      };
      this.selectedItem.forEach(x => {
        addParents(x, this.allParentNodes);
        proxy[x.id] = x;
      });
      return Object.values(proxy);
    }
  },
  mounted() {
    this.getAreaData();
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 10px;
  position: relative;
  max-height: 100%;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
