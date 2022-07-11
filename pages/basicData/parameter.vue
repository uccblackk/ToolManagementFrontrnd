<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <!-- 新增按鈕 -->
            <v-col cols="2" md="2">
              <v-btn class="mt-4" width="100%" @click.stop="showAddDialog()">
                <v-icon left dark>
                  mdi-plus-thick
                </v-icon>
                {{ $t("add") }}
              </v-btn>
              <v-flex d-flex justify-end>
                <!-- 新增參數彈窗 -->
                <v-dialog v-model="dialog" persistent max-width="600px">
                  <v-card ref="form">
                    <v-card-title class="info">
                      <span class=" headline white--text">
                        {{ $t("add") + $t("parameter") }}</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                :label="'*' + $t('parameter') + $t('No')"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                requird
                                v-model="addParameterForm.no"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                :label="'*' + $t('parameter') + $t('name')"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                requird
                                v-model="addParameterForm.name"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                :label="$t('parameter') + $t('unit')"
                                v-model="addParameterForm.unit"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                :label="$t('parameter') + $t('standardValue')"
                                v-model="addParameterForm.standardValue"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                :label="$t('parameter') + $t('upperLimit')"
                                v-model="addParameterForm.upperLimit"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <v-text-field
                                :label="$t('parameter') + $t('lowerLimit')"
                                v-model="addParameterForm.lowerLimit"
                              ></v-text-field>
                            </v-col>

                            <v-col cols="12" sm="12" md="12">
                              <v-text-field
                                ref="itemDesc"
                                :label="$t('description')"
                                v-model="addParameterForm.desc"
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
                      <v-btn class="info" dark text @click="addParameter()">
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
                  v-model="parameterSearchValue"
                  :label="this.$t('parameter') + this.$t('search')"
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
      <ParameterTable
        :parameterData="parameterList"
        :isLoading="isLoading"
        @update="onSearch"
      />
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
export default {
  middleware: "auth",
  data() {
    return {
      isLoading: 0,
      valid: true,

      formHasErrors: false,
      errorMessages: "",
      parameterSearchValue: "",
      parameterList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addParameterForm: {
        no: null,
        name: null,
        unit: null,
        standardValue: null,
        upperLimit: null,
        lowerLimit: null,
        desc: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      parameterData: [],
      exceptionParameterList: [],
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
      store.state.authUser.authority.find(x => x.menu_no == "parameter") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Parameter/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    return {
      parameterList: response.data
    };
  },
  methods: {
    showAddDialog() {
      this.addParameterForm.no = null;
      this.addParameterForm.name = null;
      this.addParameterForm.unit = null;
      this.addParameterForm.standardValue = null;
      this.addParameterForm.upperLimit = null;
      this.addParameterForm.lowerLimit = null;
      this.addParameterForm.desc = null;
      this.dialog = true;
    },
    onSearch() {
      const token = this.$store.state.authUser.token;
      this.isLoading = 1;
      this.$axios
        .get(`/Parameter/Search?value=${this.parameterSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.parameterList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    addParameter() {
      if (
        this.addParameterForm.no == null ||
        this.addParameterForm.no == "" ||
        this.addParameterForm.name == null ||
        this.addParameterForm.name == ""
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const item = {
        parameterNo: this.addParameterForm.no,
        parameterName: this.addParameterForm.name,
        unit: this.addParameterForm.unit,
        standardValue: this.addParameterForm.standardValue,
        upperLimit: this.addParameterForm.upperLimit,
        lowerLimit: this.addParameterForm.lowerLimit,
        description: this.addParameterForm.desc,
        status: "Y"
      };

      this.$axios
        .post(`/Parameter/create`, item, {
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
          this.onSearch();
          this.dialog = false;
        })
        .then(() => {});
    }
  },
  mounted() {
    //  this.refreshparameterData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("equipment") + this.$t("parameter")
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
