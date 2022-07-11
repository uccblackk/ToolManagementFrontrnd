<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <!-- 新增按鈕 -->
            <v-col cols="2" md="2">
              <v-flex d-flex justify-end>
                <!-- 新增生產區域彈窗 -->
                <v-dialog v-model="dialog" persistent max-width="600px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      class="mt-4"
                      width="100%"
                      @click.stop="showAddDialog()"
                    >
                      <v-icon left dark>
                        mdi-plus-thick
                      </v-icon>
                      {{ $t("add") }}
                    </v-btn>
                  </template>
                  <v-card ref="form">
                    <v-card-title class="info">
                      <span class=" headline white--text">
                        {{ $t("add") }}{{ $t("area") }}</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("areaNo") }}* -->
                              <v-text-field
                                ref="areaNo"
                                :label="'*' + $t('areaNo')"
                                :rules="rules"
                                v-model="addAreaForm.no"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("areaName") }}* -->
                              <v-text-field
                                ref="areaName"
                                :rules="rules"
                                :label="'*' + $t('areaName')"
                                v-model="addAreaForm.name"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-select
                                :label="$t('upperLevel') + $t('area')"
                                v-model="selectedArea"
                                :items="selectAreaList"
                                item-text="areaName"
                                item-value="id"
                              ></v-select>
                            </v-col>
                          </v-row>
                        </v-form>
                      </v-container>
                      <small>*{{ $t("inputRequired") }}</small>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn class="gray" @click="dialog = false">{{
                        $t("cancel")
                      }}</v-btn>
                      <v-btn class="info" dark text @click="addArea()">
                        {{ $t("add") }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <!-- 異常視窗 -->
                <v-dialog v-model="errorDialog" persistent max-width="300px">
                  <v-card>
                    <v-card-title class="error">
                      <span class=" white--text"> {{ $t("error") }}</span>
                    </v-card-title>
                    <v-card-text>
                      <div class="mt-4">
                        <span style="font-size:18px;font-weight:bold">
                          {{ message }}
                        </span>
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        class="gray"
                        @click="(errorDialog = false), (showAddDialog = false)"
                        >{{ $t("close") }}</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-flex>
            </v-col>
            <!-- 搜尋欄 -->
            <v-col cols="8" md="8">
              <v-form onSubmit="return false;">
                <v-text-field
                  clearable
                  v-model="areaSearchValue"
                  :label="this.$t('areaSearch')"
                  append-icon="mdi-magnify"
                  required
                  @click:append="onSearch"
                  @keyup.enter="onSearch()"
                ></v-text-field>
              </v-form>
            </v-col>
            <v-col cols="1" md="1">
              <v-flex d-flex justify-end>
                <!-- 生產區域樹狀圖 -->
                <v-dialog
                  fullscreen
                  hide-overlay
                  transition="dialog-bottom-transition"
                  scrollable
                  v-model="treeViewDialog"
                  persistent
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      fab
                      raised
                      rounded
                      text
                      outlined
                      small
                      color="primary"
                      class="mt-2"
                      @click.stop="showTreeViewDialog()"
                    >
                      <v-icon dark>
                        mdi-eye
                      </v-icon>
                      <!-- {{ $t("visualization") }} -->
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="primary " style="color:white">
                      <v-btn icon dark @click="treeViewDialog = false">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                      {{ $t("area") + $t("visualization") }}
                    </v-card-title>

                    <v-card-text>
                      <v-treeview
                        @input="OnNodeSelected"
                        v-model="selectedItem"
                        selection-type="leaf"
                        return-object
                        activatable
                        hoverable
                        open-all
                        :items="items"
                      >
                        <template v-slot:prepend="{ item }">
                          <v-icon v-if="item.children.length > 0"
                            >mdi-home-variant
                          </v-icon>
                          <v-icon v-else>
                            mdi-bookmark-outline
                          </v-icon>
                        </template>
                      </v-treeview>
                    </v-card-text>
                  </v-card>
                </v-dialog>

                <!-- 異常視窗 -->
                <v-dialog v-model="errorDialog" persistent max-width="300px">
                  <v-card>
                    <v-card-title class="error">
                      <span class=" white--text"> {{ $t("error") }}</span>
                    </v-card-title>
                    <v-card-text>
                      <div class="mt-4">
                        <span style="font-size:18px;font-weight:bold">
                          {{ message }}
                        </span>
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        class="gray"
                        @click="(errorDialog = false), (showAddDialog = false)"
                        >{{ $t("close") }}</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-flex>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex xs12 class="mx-1">
      <AreaTable
        :areaData="areaList"
        :isLoading="isLoading"
        @update="onSearch"
      />
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
import AreaTable from "~/components/area/ASSAB/AreaTable.vue";
export default {
  middleware: "auth",
  components: {
    AreaTable
  },
  data() {
    return {
      selectedItem: [],
      items: [],
      treeViewDialog: false,
      selectAreaList: [],
      selectedArea: {},
      rules: [v => !!v || this.$t("mustInput")],
      valid: true,
      isLoading: 0,
      formHasErrors: false,
      errorMessages: "",
      areaSearchValue: "",
      areaList: [],
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addAreaForm: {
        no: null,
        name: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      areaData: [],

      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        areaNo: this.areaNo,
        areaName: this.areaName
      };
    }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "area") == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      areaList: response.data
    };
  },
  methods: {
    OnNodeSelected(node) {
      // let arr = node;
      // if (node.length > 1) {
      //   arr.shift();
      // }
      // this.selectedItem = arr;

      // let rootData = this.selectedNode(this.items, this.selectedItem.id);
      // console.log(rootData);
      // if (rootData != undefined && rootData != null) {
      //   rootData.children.push(d);
      // }
      console.log(this.selectedItem);
    },
    showTreeViewDialog() {
      this.treeViewDialog = true;
      this.updateTreeView();
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
      this.areaList.forEach(element => {
        IdList.push(element.rootId);
      });
      var result = IdList.filter((item, index, arr) => {
        return arr.indexOf(item) === index;
      });
      // console.log(result);
      result.forEach(id => {
        let data = this.areaList.filter(x => x.rootId == id);
        let list = [];
        data.forEach(detail => {
          list.push(
            this.getItem(
              detail.id,
              detail.areaName,
              detail.areaNo,
              [],
              detail.rootId
            )
          );
        });
        dataList.push(list);
      });
      // console.log(dataList);

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
    getItem(id, name, no, children, rootId) {
      let item = {
        id: id,
        name: name + ` (${no})`,

        children: children,
        rootId: rootId
      };
      return item;
    },
    showAddDialog() {
      this.dialog = true;
      this.selectedArea = this.selectAreaList[0].id;
      // console.log(this.selectedArea);
    },
    onSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(`/Area/Search?value=${this.areaSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.areaList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },

    addArea() {
      // console.log(this.selectedArea);
      // return;
      if (this.addAreaForm.no == null || this.addAreaForm.name == null) {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const area = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        areaNo: this.addAreaForm.no,
        areaName: this.addAreaForm.name,
        rootId: this.selectedArea,
        status: "Y"
      };
      this.addAreaForm.no = "";
      this.addAreaForm.name = "";
      console.log(area);
      this.$axios
        .post(`/area/create`, area, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(process.name, this.$t("createSuccess"), "success");
            this.dialog = false;
          } else {
            this.$swal(process.name, res.data.msg, "error");
            this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshAreaData();
          this.dialog = false;
        })
        .then(() => {});
    },
    refreshAreaData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Area/Search?value=${this.areaSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
          this.selectAreaList = this.areaList.slice(0);

          this.selectAreaList.unshift({ areaName: "無", id: null });
          this.isLoading = 0;
        });
    }
  },
  mounted() {
    this.selectAreaList = this.areaList.slice(0);

    this.selectAreaList.unshift({ areaName: "無", id: null });
    //this.refreshAreaData();
  },
  computed: {},
  created() {},
  watch: {
    selectedItem() {}
  },
  head() {
    return {
      title: this.$t("area")
    };
  },
  submit() {}
};
</script>
<style lang="scss" scoped>
.container {
  padding: 5px;
  position: relative;
  max-height: 100%;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
