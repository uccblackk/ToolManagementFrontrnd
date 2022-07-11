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
                        {{ $t("add") + $t("jobReport") + $t("reason") }}</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <v-select
                                ref="itemNo"
                                :label="$t('type')"
                                :items="reasonType"
                                :item-text="
                                  item => item.value + ' : ' + item.name
                                "
                                item-value="value"
                                v-model="addReasonForm.type"
                              ></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="itemSpec"
                                :label="
                                  '*' +
                                    $t('jobReport') +
                                    $t('reason') +
                                    $t('No')
                                "
                                :rules="[v => !!v || this.$t('mustInput')]"
                                requird
                                v-model="addReasonForm.no"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                ref="itemName"
                                :label="
                                  '*' +
                                    $t('jobReport') +
                                    $t('reason') +
                                    $t('name')
                                "
                                :rules="[v => !!v || this.$t('mustInput')]"
                                requird
                                v-model="addReasonForm.name"
                              ></v-text-field>
                            </v-col>

                            <v-col cols="12" sm="12" md="12">
                              <v-text-field
                                ref="itemDesc"
                                :label="$t('description')"
                                v-model="addReasonForm.desc"
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
                      <v-btn class="info" dark text @click="addReason()">
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
                  v-model="reasonSearchValue"
                  :label="
                    this.$t('jobReport') + this.$t('reason') + this.$t('search')
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
      <ReasonTable
        :reasonData="reasonList"
        :reasonSearchValue="reasonSearchValue"
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
      isLoading: 0,
      valid: true,
      reasonType: [
        { value: "QC", name: this.$t("QC") },
        { value: "ET", name: this.$t("exceptionalTime") }
      ],
      formHasErrors: false,
      errorMessages: "",
      reasonSearchValue: "",
      reasonList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addReasonForm: {
        type: "QC",
        no: null,
        name: null,
        desc: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      reasonData: [],
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
      store.state.authUser.authority.find(x => x.menu_no == "reason") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Reason/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    return {
      reasonList: response.data
    };
  },
  methods: {
    onSearch() {
      const token = this.$store.state.authUser.token;
      this.isLoading = 1;
      this.$axios
        .get(`/Reason/Search?value=${this.reasonSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.reasonList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    addReason() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      if (this.addReasonForm.no == null || this.addReasonForm.name == null) {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        type: this.addReasonForm.type,
        reasonNo: this.addReasonForm.no,
        reasonName: this.addReasonForm.name,
        description: this.addReasonForm.desc,
        status: "Y"
      };
      this.addReasonForm.no = "";
      this.addReasonForm.name = "";
      this.addReasonForm.desc = "";

      this.$axios
        .post(`/Reason/create`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
            this.dialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshreasonData();
          this.dialog = false;
        })
        .then(() => {});
    },
    refreshreasonData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Reason/Search?value=${this.reasonSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.reasonList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
          //  console.log(this.reasonList);
        });
    }
  },
  mounted() {
    //  this.refreshreasonData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("jobReportReason")
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
