<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯報工原因彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") + $t("jobReport") + $t("reason") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-select
                      ref="itemNo"
                      :label="$t('type')"
                      :items="reasonType"
                      :item-text="item => item.value + ' : ' + item.name"
                      item-value="value"
                      v-model="editReasonForm.type"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemSpec"
                      :label="$t('jobReport') + $t('reason') + $t('No')"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      disabled
                      v-model="editReasonForm.no"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemName"
                      :label="$t('jobReport') + $t('reason') + $t('name')"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      requird
                      v-model="editReasonForm.name"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="itemDesc"
                      :label="$t('description')"
                      v-model="editReasonForm.desc"
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
            <v-btn class="info" dark text @click="editReason()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除報工原因彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") + $t("jobReport") + $t("reason") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") + $t("jobReport") + $t("reason") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteItem()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="reasonList"
        :items-per-page="itemsPerPage"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        :sort-by="['ReasonNo']"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.type="{ item }">
          <v-chip
            color="warning"
            class="font-weight-black"
            v-if="item.type == 'QC'"
          >
            {{ $t(item.type) + " (" + item.type + ")" }}
          </v-chip>
          <v-chip color="primary" class="font-weight-black" v-else>
            {{ $t(item.type) + " (" + item.type + ")" }}
          </v-chip>
        </template>
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
    reasonData: {},
    reasonSearchValue: null,
    isLoading: null
  },
  data() {
    return {
      loading: 0,
      reasonType: [
        { value: "QC", name: this.$t("QC") },
        { value: "ET", name: this.$t("exceptionalTime") }
      ],
      reasonList: [],

      editDialog: false,
      deleteDialog: false,
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
      },
      headers: [
        {
          text: this.$t("type"),
          value: "type",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("reason") + this.$t("name"),
          value: "reasonNo",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("reason") + this.$t("No"),
          value: "reasonName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("itemDesc"),
          value: "description",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          width: "5%"
        }
      ]
    };
  },
  watch: {
    reasonData() {
      // console.log(this.reasonData);
      this.reasonList = this.reasonData;
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  methods: {
    edit(item) {
      // console.log(item);
      this.editDialog = true;
      this.editReasonForm.id = item.id;
      this.editReasonForm.type = item.type;
      this.editReasonForm.no = item.reasonNo;
      this.editReasonForm.name = item.reasonName;
      this.editReasonForm.desc = item.description;
    },
    editReason() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });

      const token = this.$store.state.authUser.token;
      const Item = {
        id: this.editReasonForm.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        type: this.editReasonForm.type,
        reasonNo: this.editReasonForm.no,
        reasonName: this.editReasonForm.name,
        description: this.editReasonForm.desc,
        status: "Y"
      };
      this.editReasonForm.no = "";
      this.editReasonForm.name = "";
      this.editReasonForm.desc = "";

      this.$axios
        .post(`/Reason/update`, Item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
          } else {
            this.$swal("", this.$t("editFailed"), "error");
          }
          //this.refreshreasonData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteItem() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/Reason/delete/${this.deleteReasonData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
          } else {
            this.$swal("", this.$t("deleteFailed"), "error");
          }
          //this.refreshreasonData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshreasonData() {
      this.loading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Reason/Search?value=${this.reasonSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.reasonList = res.data.data != null ? res.data.data : [];
          this.loading = 0;
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      this.deleteReasonData.id = item.id;
    }
  },
  mounted() {
    this.reasonList = this.reasonData;
  },
  computed: {},
  created() {
    this.reasonList = this.reasonData;
  }
};
</script>
