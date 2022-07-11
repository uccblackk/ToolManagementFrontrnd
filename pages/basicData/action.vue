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
                        {{ $t("add") }}{{ $t("produce")
                        }}{{ $t("action") }}</span
                      >
                    </v-card-title>

                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="actionNo"
                                :label="
                                  '*' + $t('produce') + $t('action') + $t('No')
                                "
                                v-model="addActionForm.no"
                                :rules="rules"
                                requird
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="actionName"
                                :label="
                                  '*' +
                                    $t('produce') +
                                    $t('action') +
                                    $t('name')
                                "
                                v-model="addActionForm.name"
                                :rules="rules"
                                requird
                              ></v-text-field>
                            </v-col>

                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="actionDesc"
                                :label="$t('description')"
                                v-model="addActionForm.desc"
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
                      <v-btn class="info" dark text @click="addaction()">
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
                  v-model="actionSearchValue"
                  :label="
                    this.$t('produce') + this.$t('action') + this.$t('search')
                  "
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
      <ActionTable
        :actionData="actionList"
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
      valid: true,
      formHasErrors: false,
      errorMessages: "",
      actionSearchValue: "",
      actionList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addActionForm: {
        no: null,
        name: null,
        desc: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      actionData: [],
      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        actionNo: this.actionNo,
        actionName: this.actionName
      };
    }
  },
  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "action") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Action/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    return {
      actionList: response.data
    };
  },
  methods: {
    onSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(`/Action/Search?value=${this.actionSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.actionList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    addaction() {
      if (this.addActionForm.no == null || this.addActionForm.name == null) {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const action = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        actionNo: this.addActionForm.no,
        actionName: this.addActionForm.name,
        description: this.addActionForm.desc,
        status: "Y"
      };
      this.addActionForm.no = "";
      this.addActionForm.name = "";
      this.addActionForm.desc = "";

      this.$axios
        .post(`/Action/create`, action, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(action.actionNo, this.$t("createSuccess"), "success");
            this.dialog = false;
          } else {
            this.$swal(action.actionNo, res.data.msg, "error");
            this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshactionData();
          this.dialog = false;
        })
        .then(() => {});
    },
    refreshactionData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Action/Search?value=${this.actionSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.actionList = res.data.data != null ? res.data.data : [];
          //  console.log(this.actionList);
        });
    }
  },
  mounted() {
    // this.refreshactionData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("processAction")
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
