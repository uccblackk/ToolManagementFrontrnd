<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <v-row>
        <v-col cols="12">
          <span class="text-h5 font-weight-black" style="color:black">
            {{ opData.opName }}
          </span>
          <v-divider />
        </v-col>
        <!-- 新增按鈕 -->
        <v-col cols="1" md="1">
          <v-flex>
            <!-- 新增製程生產動作按鈕 -->
            <v-dialog v-model="dialog" persistent max-width="600px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  width="100%"
                  @click.stop="showAddDialog()"
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
                    {{ $t("add") }}{{ $t("produce") }}{{ $t("action") }}</span
                  >
                </v-card-title>
                <v-form ref="addForm" v-model="addValid" lazy-validation>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            ref="itemNo"
                            :label="$t('process') + $t('No')"
                            v-model="addOpActionForm.opNo"
                            disabled
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            ref="itemName"
                            :label="$t('process') + $t('name')"
                            v-model="addOpActionForm.opName"
                            disabled
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            ref="opSeq"
                            :label="
                              $t('produce') + $t('action') + $t('sequence')
                            "
                            v-model="addOpActionForm.actionSeq"
                            type="number"
                            disabled
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-select
                            class="mt-2"
                            v-model="actionSelected"
                            :items="actionList"
                            :label="'*' + $t('produce') + $t('action')"
                            item-text="actionName"
                            item-value="actionNo"
                            :rules="[v => !!v || this.$t('mustInput')]"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-container>
                    <small>*{{ $t("inputRequired") }}</small>
                  </v-card-text>
                </v-form>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="gray" @click="dialog = false">{{
                    $t("cancel")
                  }}</v-btn>
                  <v-btn class="info" dark text @click="addOpAction()">
                    {{ $t("add") }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-flex>
        </v-col>
      </v-row>
      <!-- 編輯製程彈窗 -->
      <v-dialog v-model="editOpActionDialog" persistent max-width="600px">
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
                      ref="opNo"
                      :label="$t('process') + $t('No')"
                      v-model="addOpActionForm.opNo"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="opName"
                      :label="$t('process') + $t('name')"
                      v-model="addOpActionForm.opName"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="process"
                      :label="$t('produce') + $t('action') + $t('name')"
                      v-model="editOpActionForm.actionName"
                      disabled
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="actionSequence"
                      :label="$t('produce') + $t('action') + $t('sequence')"
                      v-model="editOpActionForm.seq"
                      type="number"
                      @input="up"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editOpActionDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editOpAction()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除製程彈窗 -->
      <v-dialog v-model="deleteOpActionDialog" persistent max-width="300px">
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
            <v-btn class="gray" @click="deleteOpActionDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteOpItem()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-data-table
        :headers="opActionheaders"
        :items="opActionList"
        :items-per-page="itemsPerPage"
        :sort-by="['actionSequence']"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        :loading="isLoading == 1"
        loading-text="Loading... Please wait"
        hide-default-footer
        @sorted="saveOrder"
        @current-items="current"
        v-sortable-data-table
      >
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="showEditOpDialog(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="showDeleteItemOpDialog(item)">
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
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-layout>
</template>
<script>
import moment from "moment";

// Default SortableJS
import Sortable from "sortablejs";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    opData: {}
  },
  data() {
    return {
      sortableData: [],
      addValid: true,
      isLoading: 1,
      overlay: false,
      seqLimit: 3,
      onSeqInput: null,
      machineSelected: null,
      actionSelected: null,
      machineList: null,
      actionList: {},
      opActionList: [],
      selectedOpActionItem: [],
      selectedOpAction: [],
      selectedCycleTime: [],
      editCycleTimeDialog: false,
      addOpActionForm: {
        opNo: null,
        opName: null,
        actionName: null,
        actionNo: null,
        actionSeq: null
      },
      addCycleTimeForm: {
        itemNo: null,
        itemName: null,
        opNo: null,
        opName: null,
        machineNo: null,
        opSeq: null,
        fixTime: null,
        varTime: null,
        baseQty: null
      },
      editCycleTimeForm: {
        itemNo: null,
        itemName: null,
        opNo: null,
        opName: null,
        machineNo: null,
        opSeq: null,
        fixTime: null,
        varTime: null,
        baseQty: null
      },
      dialog: false,
      itemList: [],
      actionList: [],
      ItemSearchValue: "",
      editOpActionDialog: false,
      deleteOpActionDialog: false,
      addCycleTimeDialog: false,
      deleteCycleTimeDialog: false,
      ItemName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editOpActionForm: {
        actionName: null,
        seq: null
      },
      deleteItemData: {
        no: null,
        name: null,
        id: null
      },
      cycleTimeheaders: [
        {
          text: this.$t("equipment") + this.$t("No"),
          value: "machineNo",
          align: "left",
          sortable: true,
          width: "10%"
        },

        {
          text: this.$t("fixTime"),
          value: "fixTime",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("varTime"),
          value: "varTime",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("baseQty"),
          value: "baseQty",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          align: "left",
          width: "10%"
        }
      ],
      opActionheaders: [
        {
          text: this.$t("action") + this.$t("sequence"),
          value: "actionSequence",
          align: "left",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("produce") + this.$t("action") + this.$t("No"),
          value: "actionNo",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("produce") + this.$t("action") + this.$t("name"),
          value: "actionName",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          align: "left",
          width: "10%"
        }
      ]
    };
  },

  methods: {
    saveOrder(event) {
      const movedItem = this.sortableData.splice(event.oldIndex, 1)[0];
      this.sortableData.splice(event.newIndex, 0, movedItem);
      console.log(this.sortableData);
      const token = this.$store.state.authUser.token;
      this.$axios
        .post(`/OpAction/UpdateActionSequence`, this.sortableData, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.refreshOpActionData();
          } else {
            this.$swal("", res.data.msg, "error");
          }
        });
    },
    current(e) {
      this.sortableData = e;
      // console.log(this.sortableData);
    },
    up() {
      if (parseFloat(this.editOpActionForm.seq) < 1) {
        this.$nextTick(() => {
          this.editOpActionForm.seq = 1;
        });
      } else if (
        parseFloat(this.editOpActionForm.seq) > this.opActionList.length
      ) {
        this.$nextTick(() => {
          this.editOpActionForm.seq = this.opActionList.length;
        });
      }
    },
    showAddDialog() {
      this.actionList = [];

      this.dialog = true;
      this.getActionList();
      this.addOpActionForm.actionSeq = this.opActionList.length + 1;
    },
    showEditOpDialog(item) {
      // console.log(item);
      this.editOpActionDialog = true;
      this.selectedOpAction = item;
      this.editOpActionForm.seq = item.actionSequence;
      this.editOpActionForm.actionName = item.actionName[0];
    },
    editOpAction() {
      const token = this.$store.state.authUser.token;
      const item = {
        id: this.selectedOpAction.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        opNo: this.selectedOpAction.opNo,
        actionNo: this.selectedOpAction.actionNo,
        actionSequence: this.editOpActionForm.seq.toString()
      };

      if (this.selectedOpAction.actionSequence == item.actionSequence) {
        return;
      }
      this.$axios
        .post(`/OpAction/update`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
            this.editOpActionDialog = false;
            this.refreshOpActionData();
          } else {
            this.$swal("", res.data.msg, "error");
          }
        });
    },
    editItem() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });

      const token = this.$store.state.authUser.token;
      const Item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.editOpActionForm.no,
        itemName: this.editOpActionForm.name,
        itemSpec: this.editOpActionForm.spec,
        description: this.editOpActionForm.desc,
        itemType: "1",
        stdLotQty: this.editOpActionForm.qty,
        status: "Y"
      };
      this.editOpActionForm.no = "";
      this.editOpActionForm.name = "";
      this.editOpActionForm.spec = "";
      this.editOpActionForm.desc = "";
      this.editOpActionForm.qty = "";

      this.$axios
        .post(`/Item/update`, Item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(Item.name, this.$t("editSuccess"), "success");
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(self.name, this.$t("editFailed"), "error");
          }
          this.refreshItemData();
          this.editOpActionDialog = false;
        })
        .then(() => {});
    },
    deleteItem() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;

      //console.log(Item);
      this.deleteItemData.no = "";
      this.deleteItemData.name = "";

      this.$axios
        .delete(`/Item/delete/${this.deleteItemData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              this.deleteItemData.no,
              this.$t("deleteSuccess"),
              "success"
            );
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(self.name, this.$t("deleteFailed"), "error");
          }
          this.refreshItemData();
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshItemData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Item/Search?value=${this.ItemSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.itemList = res.data.data != null ? res.data.data : [];
        });
    },
    refreshOpActionData() {
      this.getOpActionList();
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deleteItemData.no = item.ItemNo;
      this.deleteItemData.name = item.ItemName;
      this.deleteItemData.id = item.id;
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
          this.machineList = res.data.data != null ? res.data.data : [];
          // console.log(this.machineList.name);
        });
    },
    getActionList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Action/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let data = res.data.data != null ? res.data.data : [];
          data.forEach(Element => {
            if (
              this.opActionList.find(x => x.actionNo == Element.actionNo) ==
              undefined
            )
              this.actionList.push(Element);
          });
        });
    },
    getOpActionList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/OpAction/Search?value=` + this.opData.opNo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.opActionList = res.data.data != null ? res.data.data : [];

          this.isLoading = 0;
          // console.log(this.opActionList);
        });
    },
    addOpAction() {
      const token = this.$store.state.authUser.token;
      const item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        opNo: this.opData.opNo,
        actionNo: this.actionSelected,
        actionSequence: this.addOpActionForm.actionSeq.toString()
      };
      // this.addOpActionForm.opSeq = "";
      //console.log(item);
      //  this.showAddDialog = false;
      // console.log(this.actionSelected);
      if (this.actionSelected == null) {
        this.$swal("", this.$t("createFailed"), "error");
        return;
        // this.addCycleTime();
        //  this.refreshOpItemData();
      }
      this.actionSelected = null;
      this.$axios
        .post(`/OpAction/Create`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
            // this.addCycleTime();
            this.refreshOpActionData();
          } else {
            this.$swal("", res.data.msg, "error");
          }
          this.dialog = false;
        })
        .then(() => {});
    },
    showDeleteItemOpDialog(item) {
      this.deleteOpActionDialog = true;
      // console.log(item);
      this.selectedOpActionItem = item;
    },

    deleteOpItem() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/OpAction/delete/${this.selectedOpActionItem.id}`, {
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
          this.refreshOpActionData();
          this.deleteOpActionDialog = false;
        })
        .then(() => {});
    }
  },
  watch: {
    opData() {
      //this.opActionList = this.opData;
      this.isLoading = 1;
      // console.log(this.opData);
      this.addOpActionForm.opNo = this.opData.opNo;
      this.addOpActionForm.opName = this.opData.opName;
      //this.getActionList();
      this.refreshOpActionData();
      //console.log(this.itemList);
    }
  },
  directives: {
    sortableDataTable: {
      bind(el, binding, vnode) {
        const options = {
          animation: 150,
          onUpdate: function(event) {
            vnode.child.$emit("sorted", event);
          }
        };
        Sortable.create(el.getElementsByTagName("tbody")[0], options);
      }
    }
  },
  created() {
    // this.overlay = true;
    //  this.opActionList = this.opData;
    //console.log(this.opActionList);
    this.isLoading = 1;
    // console.log(this.opData);
    this.addOpActionForm.opNo = this.opData.opNo;
    this.addOpActionForm.opName = this.opData.opName;
    //this.getActionList();
    this.refreshOpActionData();
    // window.setTimeout(() => {
    //   this.overlay = false;
    // }, 500);
    //this.overlay = false;
    //   console.log(this.itemList);
  }
};
</script>
<style lang="scss" scoped>
.some-other-style {
  background: rgb(231, 231, 231);
}
.my-header-style {
  color: #6f8fb9 !important;
}
</style>
