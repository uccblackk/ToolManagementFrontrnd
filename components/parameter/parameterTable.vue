<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯參數彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") + $t("parameter") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="editForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      :label="'*' + $t('parameter') + $t('No')"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      disabled
                      v-model="editParameterForm.no"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      :label="'*' + $t('parameter') + $t('name')"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      required
                      v-model="editParameterForm.name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      :label="$t('parameter') + $t('unit')"
                      v-model="editParameterForm.unit"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      :label="$t('parameter') + $t('standardValue')"
                      v-model="editParameterForm.standardValue"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      :label="$t('parameter') + $t('upperLimit')"
                      v-model="editParameterForm.upperLimit"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      :label="$t('parameter') + $t('lowerLimit')"
                      v-model="editParameterForm.lowerLimit"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="itemDesc"
                      :label="$t('description')"
                      v-model="editParameterForm.desc"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editParameter()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除參數彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") + $t("parameter") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container> {{ $t("confirm") + $t("parameter") }}? </v-container>
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
        :items="parameterList"
        :items-per-page="itemsPerPage"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        :sort-by="['ParameterNo']"
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
export default {
  props: {
    parameterData: {},
    isLoading: null
  },
  data() {
    return {
      loading: 0,
      valid: true,
      parameterList: [],
      selectedItem: null,
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
      editParameterForm: {
        no: null,
        name: null,
        unit: null,
        standardValue: null,
        upperLimit: null,
        lowerLimit: null,
        desc: null
      },
      deleteParameterData: {
        id: null
      },
      headers: [
        {
          text: this.$t("parameter") + this.$t("No"),
          value: "parameterNo",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("parameter") + this.$t("name"),
          value: "parameterName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("unit"),
          value: "unit",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("standardValue"),
          value: "standardValue",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("upperLimit"),
          value: "upperLimit",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("lowerLimit"),
          value: "lowerLimit",
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
    parameterData() {
      // console.log(this.parameterData);
      this.parameterList = this.parameterData;
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  methods: {
    edit(item) {
      // console.log(item);
      this.editDialog = true;
      this.selectedItem = item;
      this.editParameterForm.no = item.parameterNo;
      this.editParameterForm.name = item.parameterName;
      this.editParameterForm.unit = item.unit;
      this.editParameterForm.standardValue = item.standardValue;
      this.editParameterForm.upperLimit = item.upperLimit;
      this.editParameterForm.lowerLimit = item.lowerLimit;
      this.editParameterForm.desc = item.description;
    },
    editParameter() {
      if (
        this.editParameterForm.no == null ||
        this.editParameterForm.no == "" ||
        this.editParameterForm.name == null ||
        this.editParameterForm.name == ""
      ) {
        this.$refs["editForm"].validate();
        return;
      }
      const token = this.$store.state.authUser.token;
      const Item = {
        id: this.selectedItem.id,
        parameterNo: this.editParameterForm.no,
        parameterName: this.editParameterForm.name,
        unit: this.editParameterForm.unit,
        standardValue: this.editParameterForm.standardValue,
        upperLimit: this.editParameterForm.upperLimit,
        lowerLimit: this.editParameterForm.lowerLimit,
        description: this.editParameterForm.desc,
        status: "Y"
      };

      this.$axios
        .post(`/Parameter/update`, Item, {
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
          //this.refreshparameterData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteItem() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/Parameter/delete/${this.selectedItem.id}`, {
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
          //this.refreshparameterData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },

    showDeleteDialog(item) {
      this.deleteDialog = true;
      this.selectedItem = item;
    }
  },
  mounted() {
    this.parameterList = this.parameterData;
  },
  computed: {},
  created() {
    this.parameterList = this.parameterData;
  }
};
</script>
