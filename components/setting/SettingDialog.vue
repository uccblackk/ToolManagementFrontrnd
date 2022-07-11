<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯報工原因彈窗 -->
      <v-dialog
        v-model="settingDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text"> {{ $t("setting") }}</span>
          </v-card-title>
          <v-card-text>
            <v-list three-line subheader>
              <v-subheader>General</v-subheader>
              <!-- 自動執行未完成API -->
              <v-list-item>
                <v-list-item-action>
                  <v-checkbox v-model="autoExecuteAPI"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="mb-3">{{
                    $t("auto") +
                      $t("execute") +
                      $t("notyet") +
                      $t("completed") +
                      "API"
                  }}</v-list-item-title>
                  <v-list-item-subtitle></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="OnCloseDialog()">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="save()">
              {{ $t("save") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar :timeout="timeout" v-model="snackbar">
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
export default {
  props: {
    showSettingDialog: false
  },
  data() {
    return {
      orderQty: 1,
      timeout: 1000,
      snackbar: false,
      snackbarText: null,
      autoExecuteAPI: false,
      apiUpdateTypeList: [
        { value: "A", text: this.$t("auto") },
        { value: "H", text: this.$t("manual") }
      ],
      loading: 0,
      reasonType: [
        { value: "QC", name: this.$t("QC") },
        { value: "ET", name: this.$t("exceptionalTime") }
      ],
      settingList: [],
      settingDialog: false,
      ItemName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editReasonForm: {
        id: null,
        type: null,
        no: null,
        name: null,
        desc: null
      },
      deleteReasonData: {
        id: null
      }
    };
  },
  watch: {
    showSettingDialog() {
      // console.log(this.reasonData);
      this.settingDialog = this.showSettingDialog;
      if (this.settingDialog == true) {
        this.refreshSetting();
      }
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  methods: {
    OnCloseDialog() {
      this.settingDialog = false;
      this.$emit("update");
    },
    getSettingData() {
      var settingList = [];
      var setting = this.settingList
        .slice()
        .find(x => x.settingNo == "AutoExecuteAPI");
      if (setting == null || setting == undefined) return;
      // var data = setting.slice();
      if (this.autoExecuteAPI == true) {
        setting.settingValue = "Y";
      } else {
        setting.settingValue = "N";
      }
      setting.time = new Date();
      settingList.push(setting);
      return settingList;
    },
    save() {
      var settingList = this.getSettingData();
      const token = this.$store.state.authUser.token;
      settingList.forEach(setting => {
        this.$axios
          .post(`/Setting/Update`, setting, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            this.loading = false;
            this.snackbar = true;
            if (res.data.isSuccess) {
              this.snackbarText = res.data.msg;
            } else {
              this.snackbarText = this.$t("update") + this.$t("failed");
            }
          })
          .catch(({ response }) => {
            this.snackbar = true;
            this.snackbarText = this.$t("update") + this.$t("failed");
          });
      });

      this.settingDialog = false;
      this.$emit("update");
    },
    updateAutoExecuteAPISetting() {
      if (this.settingList.length > 0) {
        var data = this.settingList.find(x => x.settingNo == "AutoExecuteAPI");
        if (data != null && data != undefined) {
          if (data.settingValue == "Y") {
            this.autoExecuteAPI = true;
          } else {
            this.autoExecuteAPI = false;
          }
        }
      }
    },

    refreshSetting() {
      this.loading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Setting/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          // console.log(res.data.data);
          this.settingList = res.data.data != null ? res.data.data : [];
          this.updateAutoExecuteAPISetting();

          this.loading = 0;
        });
    }
  },
  beforeDestroy() {
    this.settingDialog = false;
    this.$emit("update");
  },
  mounted() {},
  computed: {},
  created() {}
};
</script>
