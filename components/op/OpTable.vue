<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯製程彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("process") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="opNo"
                    :label="$t('process') + $t('No')"
                    v-model="editOpForm.no"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="opName"
                    :label="$t('process') + $t('name')"
                    v-model="editOpForm.name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="opDesc"
                    :label="$t('process') + $t('description')"
                    v-model="editOpForm.desc"
                  ></v-text-field>
                </v-col>
                <!-- <v-col cols="12" sm="6" md="6">
                  <v-select
                    v-model="defaultSelected"
                    :items="editOpForm.dispatchOptions"
                    :label="$t('process') + $t('description')"
                    item-text="state"
                    item-value="value"
                    required
                    return-object
                    single-line
                  ></v-select>
                </v-col> -->
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editOp()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除製程彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("process") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("process") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteOp()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 新增製程資源談窗 -->
      <v-dialog
        v-model="addOpResourceDialog"
        persistent
        max-width="600px"
        max-height="600px"
      >
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("add") }}{{ $t("equipment") }} / {{ $t("line") }}</span
            >
          </v-card-title>
          <v-form ref="addForm" v-model="Valid" lazy-validation>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="opNo"
                      :label="$t('process') + $t('No')"
                      v-model="editOpForm.no"
                      readonly
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="opName"
                      :label="$t('process') + $t('name')"
                      v-model="editOpForm.name"
                      readonly
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="3" md="3" class="mt-2">
                    <v-select
                      ref="opDesc"
                      :label="$t('type')"
                      v-model="selectedOpResourceType"
                      :items="opResourceType"
                      item-text="name"
                      item-value="value"
                      @change="onTypeSelectedChange()"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="9" md="9">
                    <!-- <div v-if="selectedOpResourceType === 'E'">E</div>
                  <div v-else-if="selectedOpResourceType === 'L'">L</div> -->
                    <v-select
                      ref="opDesc"
                      v-if="selectedOpResourceType === 'L'"
                      :label="$t('line')"
                      v-model="lineList"
                      :items="updateLineData"
                      item-text="lineName"
                      item-value="lineNo"
                      required
                      multiple
                      chips
                    ></v-select>
                    <v-select
                      ref="select"
                      v-else-if="selectedOpResourceType === 'E'"
                      :label="$t('equipment')"
                      v-model="machineList"
                      :items="updateMachineData"
                      item-text="name"
                      item-value="no"
                      multiple
                      chips
                    >
                      <span
                        slot="no-options"
                        @click="$refs.select.open = false"
                      >
                        Sorry, no matching options
                      </span>
                    </v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="addOpResourceDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="addOpResource()">
              {{ $t("add") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除製程資源彈窗 -->
      <v-dialog v-model="deleteOpSourceDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("equipment") }} / {{ $t("line") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("equipment") }} /
              {{ $t("line") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteOpSourceDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteOpResource()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="opList"
        :items-per-page="opPerPage"
        :sort-by="['OpNo']"
        :loading="isLoading == 1"
        loading-text="Loading... Please wait"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
        single-expand
        hide-default-footer
        show-expand
      >
        <template v-slot:item.action="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                small
                v-bind="attrs"
                v-on="on"
                class="mr-2"
                @click="showAddOpResourceDialog(item)"
              >
                mdi-plus
              </v-icon>
            </template>
            {{ $t("add") }}
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                v-on="on"
                small
                class="mr-2"
                @click="edit(item)"
              >
                mdi-pencil
              </v-icon>
            </template>
            {{ $t("edit") }}
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                v-on="on"
                :disabled="item.opResource.length > 0"
                small
                @click="showDeleteDialog(item)"
              >
                mdi-delete
              </v-icon>
            </template>
            {{ $t("delete") }}
          </v-tooltip>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <div class="mt-2 mb-2">
              <v-data-table
                dense
                :headers="opResourceheaders"
                :items="item.opResource"
                :sort-by="['resourceNo']"
                class="elevation-1  mytable"
                hide-default-header
              >
                <template v-slot:item.resourceType="{ item }">
                  <div v-if="item.resourceType == 'E'">
                    {{ $t("equipment") }}
                  </div>
                  <div v-if="item.resourceType == 'L'">
                    {{ $t("line") }}
                  </div>
                </template>
                <template v-slot:item.resourceName="{ item }">
                  {{ showResourceName(item) }}
                </template>
                <template v-slot:item.action="{ item }">
                  <v-icon small @click="showDeleteOpResourceDialog(item)">
                    mdi-delete
                  </v-icon>
                </template>
                <template v-slot:header="{ props: { headers } }">
                  <thead>
                    <tr class="some-other-style">
                      <th v-for="h in opResourceheaders" :class="h.class">
                        <span>{{ h.text }}</span>
                      </th>
                    </tr>
                  </thead>
                </template>
              </v-data-table>
            </div>
          </td>
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
    opData: {},
    isLoading: null
  },
  data() {
    return {
      selectedOpResource: {},
      deleteOpSourceDialog: false,
      itemsPerPage: 10,
      Valid: true,
      machineData: [],
      updateMachineData: [],
      updateLineData: [],
      lineData: [],
      machineList: null,
      lineList: null,
      opResourceType: [
        { name: this.$t("equipment"), value: "E" },
        { name: this.$t("line"), value: "L" }
      ],
      ResourceList: [],
      Resource: [],
      selectedOpResourceType: {},
      addOpResourceDialog: false,
      opList: [],
      OpSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      ItemName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      opPerPage: 15,
      defaultSelected: {
        state: "是",
        value: "Y"
      },
      editOpForm: {
        id: null,
        no: null,
        name: null,
        desc: null,
        dispatchOptions: [
          { state: "是", value: "Y" },
          { state: "否", value: "N" }
        ]
      },
      deleteOpData: {
        id: null
      },
      headers: [
        {
          text: this.$t("process") + this.$t("No"),
          value: "opNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("process") + this.$t("name"),
          value: "opName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("process") + this.$t("description"),
          value: "description",
          sortable: false,
          width: "20%"
        },
        // {
        //   text: this.$t("ifor") + this.$t("dispatch"),
        //   value: "dispatchTag",
        //   sortable: false,
        //   width: "10%"
        // },

        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("equipment") + "/" + this.$t("line"),
          value: "data-table-expand",
          align: "left",
          sortable: false,
          width: "5%"
        }
      ],
      opResourceheaders: [
        {
          text: this.$t("type"),
          value: "resourceType",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("No"),
          value: "resourceNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("name"),
          value: "resourceName",
          align: "start",
          sortable: true,
          width: "10%"
        },

        {
          text: this.$t("action"),
          value: "action",
          align: "end",
          sortable: false,
          width: "5%"
        }
      ]
    };
  },
  watch: {
    opData() {
      // console.log(this.opData);
      this.opList = this.opData;
    }
  },
  methods: {
    deleteOpResource() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/OpResource/delete/${this.selectedOpResource.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
          } else {
            this.$swal(
              this.$t("deleteFailed"),
              res.data.msg.toString(),
              "error"
            );
            this.deleteOpSourceDialog = false;
          }
          //this.refreshOpData();
          this.$emit("update");
          this.deleteOpSourceDialog = false;
        })
        .then(() => {});
    },
    showDeleteOpResourceDialog(item) {
      this.deleteOpSourceDialog = true;
      this.selectedOpResource = item;
      //console.log(this.selectedOpResource);
    },
    showResourceName(item) {
      let name = null;
      if (item.resourceType == "E") {
        if (this.machineData.find(x => x.no == item.resourceNo) != undefined) {
          name = this.machineData.find(x => x.no == item.resourceNo).name;
        }
      } else {
        if (this.lineData.find(x => x.lineNo == item.resourceNo) != undefined) {
          name = this.lineData.find(x => x.lineNo == item.resourceNo).lineName;
        }
      }
      return name;
    },
    addOpResource() {
      //console.log(this.selectedOpResourceType);
      let resourceNo = null;
      if (this.selectedOpResourceType == "E") {
        if (this.machineList == null || this.machineList == "") {
          this.$refs["addForm"].validate();
          // console.log(this.machineList);
          return;
        } else {
          resourceNo = this.machineList;
        }
      } else {
        if (this.lineList == null || this.lineList == "") {
          this.$refs["addForm"].validate();
          //console.log(resourceNo);
          return;
        } else {
          resourceNo = this.lineList;
        }
      }
      const token = this.$store.state.authUser.token;
      const opResource = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        opNo: this.editOpForm.no,
        resourceType: this.selectedOpResourceType,
        resourceNo: resourceNo.toString(),
        sequence: ""
      };
      // console.log(opResource);

      this.$axios
        .post(`/OpResource/create`, opResource, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("createSuccess"), res.data.msg, "success");
            this.addOpResourceDialog = false;
          } else {
            this.$swal("", this.$t("createFailed"), "error");
            this.addOpResourceDialog = false;
          }
          // this.refreshOpData();
          this.$emit("update");
          this.addOpResourceDialog = false;
        })
        .then(() => {});
    },
    getMachineList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Machine/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machineData = res.data.data != null ? res.data.data : [];
          // this.machineList.unshift("*");
          // console.log(this.machineData);
        });
    },
    getLineList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Line/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.lineData = res.data.data != null ? res.data.data : [];
          // this.machineList.unshift("*");
          // console.log(this.machineData);
        });
    },
    onTypeSelectedChange() {
      if (this.selectedOpResourceType == "E") {
        this.lineList = null;
      } else {
        this.machineList = null;
      }
      //console.log(this.selectedOpResourceType);
    },
    showAddOpResourceDialog(item) {
      this.addOpResourceDialog = true;
      this.editOpForm.no = item.opNo;
      this.editOpForm.name = item.opName;
      this.selectedOpResourceType = this.opResourceType[0].value;

      this.machineList = null;
      this.lineList = null;
      this.updateMachineData = this.machineData;
      this.updateLineData = this.lineData;
      if (item.opResource.length > 0) {
        this.updateMachineData = [];
        this.updateLineData = [];
        for (let i = 0; i < this.machineData.length; i++) {
          let pos = item.opResource.find(
            x => x.resourceNo == this.machineData[i].no && x.resourceType == "E"
          );

          //console.log(pos);
          if (pos == undefined) {
            this.updateMachineData.push(this.machineData[i]);
          }
        }

        for (let i = 0; i < this.lineData.length; i++) {
          let pos = item.opResource.find(
            x =>
              x.resourceNo == this.lineData[i].lineNo && x.resourceType == "L"
          );

          //console.log(pos);
          if (pos == undefined) {
            this.updateLineData.push(this.lineData[i]);
          }
        }
      }
      //console.log(this.selectedOpResourceType);
    },
    edit(item) {
      // console.log(item);
      this.editDialog = true;
      this.editOpForm.no = item.opNo;
      this.editOpForm.name = item.opName;
      this.editOpForm.id = item.id;
      this.editOpForm.desc = item.description;
      this.defaultSelected.state = item.dispatchTag;
      if (item.dispatchTag == "Y") {
        this.defaultSelected.value = "Y";
      } else {
        this.defaultSelected.value = "N";
      }
      //this.editedIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
    },
    editOp() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });

      const token = this.$store.state.authUser.token;
      const Op = {
        id: this.editOpForm.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        opNo: this.editOpForm.no,
        opName: this.editOpForm.name,
        description: this.editOpForm.desc,
        dispatchTag: "Y",
        status: "Y"
      };
      // console.log(Op);
      this.editOpForm.no = "";
      this.editOpForm.name = "";
      this.editOpForm.desc = "";

      this.$axios
        .post(`/Op/update`, Op, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(Op.name, this.$t("editSuccess"), "success");
            this.editDialog = false;
          } else {
            this.$swal(this.$t("editFailed"), "", "error");
            this.editDialog = false;
          }
          //this.refreshOpData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteOp() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;

      //console.log(Item);
      this.deleteOpData.no = "";
      this.deleteOpData.name = "";

      this.$axios
        .delete(`/Op/delete/${this.deleteOpData.id}`, {
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
          //this.refreshOpData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshOpData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Op/Search?value=${this.OpSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //   console.log(res.data.data);
          this.opList = res.data.data != null ? res.data.data : [];
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deleteOpData.id = item.id;
    }
  },
  mounted() {
    this.opList = this.opData;
    this.getMachineList();
    this.getLineList();
  },
  computed: {},
  created() {
    this.opList = this.opData;
    this.getMachineList();
    this.getLineList();
  }
};
</script>
<style lang="scss" scoped>
.some-other-style {
  background: rgb(231, 231, 231);
}
.my-header-style {
  color: #37474f !important;
}
</style>
