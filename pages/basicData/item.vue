<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <!-- 新增按鈕 -->
            <v-col cols="2" md="2">
              <v-flex d-flex justify-end>
                <!-- 新增產品彈窗 -->
                <v-dialog v-model="dialog" persistent max-width="600px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      class="mt-4"
                      width="100%"
                      @click.stop="showAddDialog = true"
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
                        {{ $t("add") }}{{ $t("product") }}</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="itemNo"
                                :label="'*' + $t('itemNo')"
                                :rules="rules"
                                v-model="addItemForm.no"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="itemName"
                                :label="'*' + $t('itemName')"
                                :rules="rules"
                                v-model="addItemForm.name"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="itemSpec"
                                :label="$t('itemSpec')"
                                v-model="addItemForm.spec"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="itemDesc"
                                :label="$t('itemDesc')"
                                v-model="addItemForm.desc"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="itemQty"
                                :label="$t('itemQty')"
                                v-model="addItemForm.qty"
                                oninput="if(this.value < 1) this.value = 1;"
                                :rules="rules"
                                type="number"
                              ></v-text-field>
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
                      <v-btn class="info" dark text @click="additem()">
                        {{ $t("add") }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-flex>
            </v-col>
            <!-- 搜尋欄 -->
            <v-col cols="8" md="10">
              <v-form onSubmit="return false;">
                <v-text-field
                  clearable
                  v-model="itemSearchValue"
                  :label="this.$t('itemSearch')"
                  append-icon="mdi-magnify"
                  required
                  @click:append="onSearch"
                  @keyup.enter="onSearch()"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex xs12 class="mx-1">
      <ItemTable
        :itemData="itemList"
        :isLoading="isLoading"
        @update="onSearch"
      />
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",
  data() {
    return {
      rules: [v => !!v || this.$t("mustInput")],
      valid: true,
      isLoading: 0,
      formHasErrors: false,
      errorMessages: "",
      itemSearchValue: "",
      itemList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addItemForm: {
        no: null,
        name: null,
        spec: null,
        desc: null,
        qty: 1
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      itemData: [],
      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        itemNo: this.itemNo,
        itemName: this.itemName
      };
    }
  },
  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "item") == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Item/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    return {
      itemList: response.data
    };
  },
  methods: {
    onSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(`/item/Search?value=${this.itemSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.itemList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    additem() {
      if (
        this.addItemForm.no == null ||
        this.addItemForm.name == null ||
        this.addItemForm.qty == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.addItemForm.no,
        itemName: this.addItemForm.name,
        itemSpec: this.addItemForm.spec,
        description: this.addItemForm.desc,
        itemType: "1",
        stdLotQty: this.addItemForm.qty,
        status: "Y"
      };
      this.addItemForm.no = "";
      this.addItemForm.name = "";
      this.addItemForm.spec = "";
      this.addItemForm.desc = "";

      this.$axios
        .post(`/Item/create`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(item.itemNo, this.$t("createSuccess"), "success");
            this.dialog = false;
          } else {
            this.$swal(item.itemNo, res.data.msg, "error");
            this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshitemData();
          this.dialog = false;
        })
        .then(() => {});
    },
    refreshitemData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Item/Search?value=${this.itemSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.itemList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
          //  console.log(this.itemList);
        });
    }
  },
  mounted() {
    //  this.refreshitemData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("product")
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
