<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯產品彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("produce") }}{{ $t("action") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="actionNo"
                      :label="$t('produce') + $t('action') + $t('No')"
                      v-model="editActionForm.no"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="actionName"
                      :label="$t('produce') + $t('action') + $t('name')"
                      v-model="editActionForm.name"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="actionDesc"
                      :label="$t('description')"
                      v-model="editActionForm.desc"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editAction()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除生產區域彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("produce") }}{{ $t("action") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("produce")
              }}{{ $t("action") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteAction()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="actionList"
        :items-per-page="itemsPerPage"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        :sort-by="['ActionNo']"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="edit(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="showDeleteDialog(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
      <div class="text-center pt-2">
        <v-pagination
          :total-visible="7"
          v-model="page"
          :length="pageCount"
        ></v-pagination>
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    actionData: {},
    isLoading: null
  },
  data() {
    return {
      loading: 0,
      actionList: [],
      ActionSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      ActionName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editActionForm: {
        id: null,
        no: null,
        name: null,
        spec: null,
        desc: null,
        qty: null
      },
      deleteActionData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: this.$t("produce") + this.$t("action") + this.$t("No"),
          value: "actionNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("produce") + this.$t("action") + this.$t("name"),
          value: "actionName",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("description"),
          value: "description",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },
  watch: {
    actionData() {
      // console.log(this.actionData);
      this.actionList = this.actionData;
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  methods: {
    edit(item) {
      // console.log(action);
      this.editDialog = true;
      this.deleteActionData.id = item.id;
      this.editActionForm.no = item.actionNo;
      this.editActionForm.name = item.actionName;
      this.editActionForm.spec = item.actionSpec;
      this.editActionForm.desc = item.description;
      this.editActionForm.qty = item.stdLotQty;
      //this.editedIndex = this.desserts.indexOf(action);
      // this.editedAction = Object.assign({}, action);
    },
    editAction() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });

      const token = this.$store.state.authUser.token;
      const Action = {
        id: this.editActionForm.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        actionNo: this.editActionForm.no,
        actionName: this.editActionForm.name,

        description: this.editActionForm.desc,

        status: "Y"
      };
      this.editActionForm.no = "";
      this.editActionForm.name = "";
      this.editActionForm.desc = "";

      this.$axios
        .post(`/Action/update`, Action, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("editSuccess"), "", "success");
          } else {
            this.$swal(this.$t("editFailed"), "", "error");
          }
          //this.refreshActionData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteAction() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;

      //console.log(Action);
      this.deleteActionData.no = "";
      this.deleteActionData.name = "";

      this.$axios
        .delete(`/Action/delete/${this.deleteActionData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
            this.deleteDialog = false;
          } else {
            this.$swal(this.$t("deleteFailed"), res.data.msg, "error");
          }
          //this.refreshActionData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshActionData() {
      this.loading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Action/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.actionList = res.data.data != null ? res.data.data : [];
          this.loading = 0;
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(action);
      this.deleteActionData.no = item.ActionNo;
      this.deleteActionData.name = item.ActionName;
      this.deleteActionData.id = item.id;
    }
  },
  mounted() {
    this.actionList = this.actionData;
  },
  computed: {},
  created() {
    this.actionList = this.actionData;
  }
};
</script>
