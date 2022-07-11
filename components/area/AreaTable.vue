<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯生產區域彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("area") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <!-- {{ $t("areaNo") }}* -->
                  <v-text-field
                    ref="areaNo"
                    :label="$t('areaNo')"
                    v-model="editAreaForm.no"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <!-- {{ $t("areaName") }}* -->
                  <v-text-field
                    ref="areaName"
                    :label="$t('areaName')"
                    v-model="editAreaForm.name"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editArea()">
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
              {{ $t("delete") }}{{ $t("area") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("area") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteArea()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="areaList"
        :items-per-page="itemsPerPage"
        :sort-by="['areaNo']"
        :loading="isLoading == 1"
        loading-text="Loading... Please wait"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
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
    areaData: {},
    isLoading: null
  },
  data() {
    return {
      selected: {},
      areaList: [],
      areaSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      areaName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editAreaForm: {
        no: null,
        name: null
      },
      deleteAreaData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: this.$t("areaNo"),
          value: "areaNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("areaName"),
          value: "areaName",
          sortable: false,
          width: "10%"
        },
        // {
        //   text: this.$t("status"),
        //   value: "status",
        //   sortable: false,
        //   width: "10%"
        // },
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
    areaData() {
      this.areaList = this.areaData;
    }
  },
  methods: {
    editItem(item) {
      this.selected = item;
      //console.log(item);
      this.editAreaForm.no = item.areaNo;
      this.editAreaForm.name = item.areaName;
      //this.editedIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
      this.editDialog = true;
    },
    editArea() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;
      const area = {
        id: this.selected.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        areaNo: this.editAreaForm.no,
        areaName: this.editAreaForm.name,
        Status: "Y"
      };
      this.editAreaForm.no = "";
      this.editAreaForm.name = "";

      this.$axios
        .post(`/area/update`, area, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(area.name, this.$t("editSuccess"), "success");
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(area.name, this.$t("editFailed"), "error");
          }
          //this.refreshAreaData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteArea() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;
      const area = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        areaNo: this.deleteAreaData.no,
        areaName: this.deleteAreaData.name,
        Status: "Y"
      };
      //console.log(area);
      this.deleteAreaData.no = "";
      this.deleteAreaData.name = "";

      this.$axios
        .delete(`/area/delete/${this.deleteAreaData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("deleteSuccess"), "", "success");
          } else {
            // this.errorDialog = true;
            // this.message = res.data.msg;
            this.$swal(res.data.msg, "", "error");
          }
          //this.refreshAreaData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshAreaData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Area/Search?value=${this.areaSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      //console.log(item);
      this.deleteAreaData.no = item.areaNo;
      this.deleteAreaData.name = item.areaName;
      this.deleteAreaData.id = item.id;
    }
  },
  mounted() {
    this.areaList = this.areaData;
  },
  computed: {},
  created() {
    this.areaList = this.areaData;
  }
};
</script>
