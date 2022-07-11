<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <!-- 新增按鈕 -->
            <v-col cols="2" md="2">
              <v-flex d-flex justify-end>
                <!-- 新增製程彈窗 -->
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
                        {{ $t("add") }}{{ $t("process") }}</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="opNo"
                                :rules="rules"
                                :label="'*' + $t('process') + $t('No')"
                                v-model="addOpForm.no"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="opName"
                                :rules="rules"
                                :label="'*' + $t('process') + $t('name')"
                                v-model="addOpForm.name"
                              ></v-text-field>
                            </v-col>
                            <v-col class="mt-5" cols="12" sm="6" md="6">
                              <v-text-field
                                ref="opDesc"
                                :label="$t('process') + $t('description')"
                                v-model="addOpForm.desc"
                              ></v-text-field>
                            </v-col>
                            <!-- <v-col cols="12" sm="6" md="6">
                            {{ $t("ifor") }}{{ $t("dispatch") }}
                            <v-select
                              v-model="defaultSelected"
                              :items="addOpForm.dispatchOptions"
                              :label="$t('ifor') + $t('dispatch')"
                              item-text="state"
                              item-value="value"
                              required
                              return-object
                              single-line
                            ></v-select>
                          </v-col> -->
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
                      <v-btn class="info" dark text @click="addOp()">
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
                  v-model="opSearchValue"
                  :label="this.$t('process') + this.$t('search')"
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
      <OpTable :opData="opList" :isLoading="isLoading" @update="onSearch" />
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
      opSearchValue: "",
      opList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      defaultSelected: {
        state: "是",
        value: "Y"
      },

      addOpForm: {
        no: null,
        name: null,
        desc: null,
        dispatchOptions: [
          { state: "是", value: "Y" },
          { state: "否", value: "N" }
        ]
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      opData: [],
      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        opNo: this.opNo,
        opName: this.opName
      };
    }
  },
  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "op") == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Op/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    return {
      opList: response.data
    };
  },
  methods: {
    onSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(`/Op/Search?value=${this.opSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.opList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    addOp() {
      if (this.addOpForm.no == null || this.addOpForm.name == null) {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        opNo: this.addOpForm.no,
        opName: this.addOpForm.name,
        description: this.addOpForm.desc,
        dispatchTag: this.defaultSelected.value,
        status: "Y"
      };
      this.addOpForm.no = "";
      this.addOpForm.name = "";
      this.addOpForm.desc = "";
      this.addOpForm.dispatchTag = "";

      this.$axios
        .post(`/Op/create`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(item.opNo, this.$t("createSuccess"), "success");
            this.dialog = false;
          } else {
            this.$swal(item.opNo, res.data.msg, "error");
            this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshOpData();
          this.dialog = false;
        })
        .then(() => {});
    },
    refreshOpData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Op/Search?value=${this.opSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.opList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
          //  console.log(this.opList);
        });
    }
  },
  mounted() {
    //this.refreshOpData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("process")
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
