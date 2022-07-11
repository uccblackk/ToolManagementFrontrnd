<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯生產區域彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("line") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <!-- {{ $t("lineNo") }}* -->
                  <v-text-field
                    ref="lineNo"
                    :label="$t('line') + $t('No')"
                    v-model="editLineForm.no"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <!-- {{ $t("lineName") }}* -->
                  <v-text-field
                    ref="lineName"
                    :label="$t('line') + $t('name')"
                    v-model="editLineForm.name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  {{ $t("area") }}
                  <v-select
                    class="mt-2"
                    v-model="areaSelected"
                    :items="areaList"
                    :label="$t('area')"
                    item-text="areaName"
                    item-value="areaNo"
                    solo
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <!-- {{ $t("lineName") }}* -->
                  <v-text-field
                    ref="description"
                    :label="$t('description')"
                    v-model="editLineForm.description"
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
            <v-btn class="info" dark text @click="editLine()">
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
              {{ $t("delete") }}{{ $t("line") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("line") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteLine()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="lineList"
        :items-per-page="itemsPerPage"
        :sort-by="['lineNo']"
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
    lineData: {},
    areaData: {},
    isLoading: null
  },
  data() {
    return {
      lineList: [],
      lineSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      lineName: "",
      areaList: {},
      errorMessage: "",
      procedure: "",
      areaSelected: null,
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editLineForm: {
        no: null,
        name: null,
        areaName: null
      },
      deleteLineData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: this.$t("line") + this.$t("No"),
          value: "lineNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("line") + this.$t("name"),
          value: "lineName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("area") + this.$t("name"),
          value: "areaName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("description"),
          value: "description",
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
    lineData() {
      this.lineList = this.lineData;
      this.areaList = this.areaData;
      //console.log(this.areaData);
    }
  },
  methods: {
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
    },
    editItem(item) {
      //console.log(item);
      this.editLineForm.no = item.lineNo;
      this.editLineForm.name = item.lineName;
      this.areaSelected = item.areaNo;
      this.editLineForm.description = item.description;
      //this.editedIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
      this.editDialog = true;
    },
    editLine() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;
      const line = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        lineNo: this.editLineForm.no,
        lineName: this.editLineForm.name,
        areaNo: this.areaSelected,
        description: this.editLineForm.description,
        Status: "Y"
      };
      this.editLineForm.no = "";
      this.editLineForm.name = "";

      this.$axios
        .post(`/Line/update`, line, {
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
          //this.refreshLineData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteLine() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;
      const line = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        lineNo: this.deleteLineData.no,
        lineName: this.deleteLineData.name,
        Status: "Y"
      };
      //console.log(line);
      this.deleteLineData.no = "";
      this.deleteLineData.name = "";
      this.deleteLineData.description = "";

      this.$axios
        .delete(`/Line/delete/${this.deleteLineData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("deleteSuccess"), "", "success");
          } else {
            this.$swal(res.data.msg, "", "error");
          }
          //this.refreshLineData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshLineData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Line/Search?value=${this.lineSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.lineList = res.data.data != null ? res.data.data : [];
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      //console.log(item);
      this.deleteLineData.no = item.lineNo;
      this.deleteLineData.name = item.lineName;
      this.deleteLineData.id = item.id;
    }
  },
  mounted() {
    this.lineList = this.lineData;
    this.areaList = this.areaData;
  },
  computed: {},
  created() {
    this.lineList = this.lineData;
    this.areaList = this.areaData;
  }
};
</script>
