<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <!-- 新增按鈕 -->
            <v-col cols="2" md="2">
              <v-flex d-flex justify-end>
                <!-- 新增生產線彈窗 -->
                <v-dialog v-model="addLineDialog" persistent max-width="600px">
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
                        {{ $t("add") }}{{ $t("line") }}</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("lineNo") }}* -->
                              <v-text-field
                                ref="lineNo"
                                :rules="rules"
                                :label="'*' + $t('line') + $t('No')"
                                v-model="addLineForm.no"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("lineName") }}* -->
                              <v-text-field
                                ref="lineName"
                                :rules="rules"
                                :label="'*' + $t('line') + $t('name')"
                                v-model="addLineForm.name"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-select
                                class="mt-2"
                                v-model="areaSelected"
                                :rules="rules"
                                :items="areaList"
                                :label="'*' + $t('area')"
                                item-text="areaName"
                                item-value="areaNo"
                              ></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <!-- {{ $t("lineName") }}* -->
                              <v-text-field
                                ref="description"
                                :label="$t('description')"
                                v-model="addLineForm.description"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-form>
                      </v-container>
                      <small>*{{ $t("inputRequired") }}</small>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn class="gray" @click="addLineDialog = false">{{
                        $t("cancel")
                      }}</v-btn>
                      <v-btn class="info" dark text @click="addLine()">
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
            <v-col cols="8" md="10">
              <v-form onSubmit="return false;">
                <v-text-field
                  clearable
                  v-model="lineSearchValue"
                  :label="this.$t('line') + this.$t('search')"
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
      <LineTable
        :lineData="lineList"
        :areaData="areaList"
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
      lineSearchValue: "",
      lineList: {},
      areaSelected: null,
      areaList: {},
      addLineDialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addLineForm: {
        no: null,
        name: null,
        description: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      lineData: [],

      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        lineNo: this.lineNo,
        lineName: this.lineName
      };
    }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "line") == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Line/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    let areaResponse = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      lineList: response.data,
      areaList: areaResponse.data
    };
  },
  methods: {
    onSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(`/Line/Search?value=${this.lineSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.lineList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },

    addLine() {
      const token = this.$store.state.authUser.token;
      const line = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        lineNo: this.addLineForm.no,
        lineName: this.addLineForm.name,
        areaNo: this.areaSelected,
        description: this.addLineForm.description,
        status: "Y"
      };

      if (
        this.areaSelected == null ||
        this.addLineForm.no == null ||
        this.addLineForm.name == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      this.addLineForm.no = "";
      this.addLineForm.name = "";
      this.addLineForm.description = "";
      this.$axios
        .post(`/Line/create`, line, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(line.lineName, this.$t("createSuccess"), "success");
            this.showAddDialog = false;
          } else {
            this.$swal(line.lineName, res.data.msg, "error");
            this.showAddDialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshLineData();
          this.addLineDialog = false;
        })
        .then(() => {});
    },
    refreshLineData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Line/Search?value=${this.lineSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.lineList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    getAreaData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Area/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
        });
    }
  },
  mounted() {
    //this.getAreaData();
    // this.refreshLineData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("line")
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
