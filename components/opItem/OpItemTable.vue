<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <v-row>
        <v-col cols="12">
          <span class="text-h5 font-weight-black" style="color:black">
            {{ data.itemName }}
          </span>
          <v-divider />
        </v-col>
        <!-- 新增按鈕 -->
        <v-col cols="1" md="1">
          <v-flex>
            <!-- 新增製程按鈕 -->
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
                    {{ $t("add") }}{{ $t("process") }}</span
                  >
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          ref="itemNo"
                          :label="$t('product') + $t('No')"
                          v-model="addItemOpForm.itemNo"
                          disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          ref="itemName"
                          :label="$t('product') + $t('name')"
                          v-model="addItemOpForm.itemName"
                          disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          ref="opSeq"
                          :label="$t('processSequence')"
                          v-model="addItemOpForm.opSeq"
                          type="number"
                          disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-select
                          v-model="opSelected"
                          :items="opList"
                          :label="$t('process')"
                          item-text="opName"
                          item-value="opNo"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*{{ $t("inputRequired") }}</small>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="gray" @click="dialog = false">{{
                    $t("cancel")
                  }}</v-btn>
                  <v-btn class="info" dark text @click="addItemOp()">
                    {{ $t("add") }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-flex>
        </v-col>
      </v-row>
      <!-- 編輯製程彈窗 -->
      <v-dialog v-model="editItemOpDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("process") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemNo"
                      :label="$t('itemNo')"
                      v-model="addItemOpForm.itemNo"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemName"
                      :label="$t('itemName')"
                      v-model="addItemOpForm.itemName"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="process"
                      :label="$t('process')"
                      v-model="editOpForm.opName"
                      disabled
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="processSequence"
                      :label="$t('processSequence')"
                      v-model="editOpForm.seq"
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
            <v-btn class="gray" @click="editItemOpDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editOp()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除製程彈窗 -->
      <v-dialog v-model="deleteItemOpDialog" persistent max-width="300px">
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
            <v-btn class="gray" @click="deleteItemOpDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteOpItem()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 新增標準工時按鈕 -->
      <v-dialog v-model="addCycleTimeDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("add") }}{{ $t("standardTime") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="addForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemNo"
                      :label="$t('product') + $t('No')"
                      v-model="addCycleTimeForm.itemNo"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemName"
                      :label="$t('product') + $t('name')"
                      v-model="addCycleTimeForm.itemName"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="opSeq"
                      :label="$t('processSequence')"
                      v-model="addCycleTimeForm.opSeq"
                      type="number"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="opNo"
                      :label="$t('process')"
                      v-model="addCycleTimeForm.opName"
                      disabled
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="3" md="3">
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
                      :items="lineData"
                      item-text="lineName"
                      item-value="lineNo"
                      return-object
                      @change="onOpReourceSelectChange()"
                      :rules="rules"
                      required
                    ></v-select>
                    <v-select
                      ref="select"
                      v-else-if="selectedOpResourceType === 'E'"
                      :label="$t('equipment')"
                      v-model="machineList"
                      :items="machineData"
                      @change="onOpReourceSelectChange()"
                      :rules="rules"
                      return-object
                      item-text="name"
                      item-value="no"
                    >
                    </v-select>
                  </v-col>

                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      ref="fixTime"
                      :label="$t('fixTime') + '(' + $t('seconds') + ')'"
                      v-model="addCycleTimeForm.fixTime"
                      type="number"
                      :rules="rules"
                      oninput="if(this.value < 0) this.value = 0;"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      ref="varTime"
                      :label="$t('varTime') + '(' + $t('seconds') + ')'"
                      v-model="addCycleTimeForm.varTime"
                      oninput="if(this.value < 0) this.value = 0;"
                      type="number"
                      :rules="rules"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      ref="baseQty"
                      :label="$t('baseQty')"
                      v-model="addCycleTimeForm.baseQty"
                      oninput="if(this.value < 0) this.value = 0;"
                      type="number"
                      :rules="rules"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="addCycleTimeDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="addCycleTime()">
              {{ $t("add") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 編輯標準工時按鈕 -->
      <v-dialog v-model="editCycleTimeDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("standardTime") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="itemNo"
                    :label="$t('product') + $t('No')"
                    v-model="editCycleTimeForm.itemNo"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="itemName"
                    :label="$t('product') + $t('name')"
                    v-model="editCycleTimeForm.itemName"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="opSeq"
                    :label="$t('processSequence')"
                    v-model="editCycleTimeForm.opSeq"
                    type="number"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    ref="opNo"
                    :label="$t('process')"
                    v-model="editCycleTimeForm.opName"
                    disabled
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="3" md="3">
                  <v-text-field
                    ref="type"
                    :label="$t('type')"
                    v-model="editCycleTimeForm.resourceType.name"
                    disabled
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="9" md="9">
                  <v-text-field
                    ref="machineName"
                    :label="$t('No')"
                    v-model="editCycleTimeForm.resourceNo"
                    disabled
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    ref="fixTime"
                    :label="$t('fixTime') + '(' + $t('seconds') + ')'"
                    v-model="editCycleTimeForm.fixTime"
                    oninput="if(this.value < 0) this.value = 0;"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    ref="varTime"
                    :label="$t('varTime') + '(' + $t('seconds') + ')'"
                    v-model="editCycleTimeForm.varTime"
                    oninput="if(this.value < 0) this.value = 0;"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    ref="baseQty"
                    :label="$t('baseQty')"
                    v-model="editCycleTimeForm.baseQty"
                    oninput="if(this.value < 0) this.value = 0;"
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editCycleTimeDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editCycleTime()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除標準工時彈窗 -->
      <v-dialog v-model="deleteCycleTimeDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("standardTime") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("standardTime") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteCycleTimeDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteCycleTime()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-data-table
        :headers="opItemheaders"
        :items="opItemList"
        :items-per-page="itemsPerPage"
        :sort-by="['opSeq']"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        :loading="isLoading == 1"
        loading-text="Loading... Please wait"
        @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
        hide-default-footer
        single-expand
        show-expand
        @sorted="saveOrder"
        @current-items="current"
        v-sortable-data-table
      >
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="showAddCycleTimeDialog(item)">
            mdi-plus
          </v-icon>
          <v-icon small class="mr-2" @click="showEditOpDialog(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="showDeleteItemOpDialog(item)">
            mdi-delete
          </v-icon>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <div class="mt-2 mb-2">
              <v-data-table
                :headers="cycleTimeheaders"
                :items="item.cycleTimeList"
                :sort-by="['opSeq']"
                class="elevation-1  mytable"
                hide-default-header
              >
                <template v-slot:item.type="{ item }">
                  <div v-if="item.resourceType == 'E'">
                    {{ $t("equipment") }}
                  </div>
                  <div v-if="item.resourceType == 'L'">
                    {{ $t("line") }}
                  </div>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-icon
                    small
                    class="mr-2"
                    @click="showEditCycleTimeDialog(item)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon small @click="showDeleteCycleTimeDialog(item)">
                    mdi-delete
                  </v-icon>
                </template>
                <template v-slot:header="{ props: { headers } }">
                  <thead>
                    <tr class="some-other-style">
                      <th v-for="h in cycleTimeheaders" :class="h.class">
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
    data: []
  },
  data() {
    return {
      sortableData: [],
      rules: [v => !!v || this.$t("mustInput")],
      valid: true,
      opResourceType: [
        { name: this.$t("equipment"), value: "E" },
        { name: this.$t("line"), value: "L" }
      ],
      selectedOpResourceType: {},
      machineData: [],
      updateMachineData: [],
      updateLineData: [],
      lineData: [],
      machineList: {},
      lineList: {},
      overlay: false,
      seqLimit: 3,
      onSeqInput: null,
      machineSelected: null,
      opSelected: null,
      // machineList: null,
      opList: {},
      opItemList: [],
      selectedOpItem: [],
      selectedOp: [],
      selectedCycleTime: [],
      editCycleTimeDialog: false,
      addItemOpForm: {
        itemNo: null,
        itemName: null,
        opNo: null,
        opName: null,
        resourceType: null,
        resourceNo: null,
        opSeq: null,
        fixTime: null,
        varTime: null,
        baseQty: null
      },
      addCycleTimeForm: {
        itemNo: null,
        itemName: null,
        opNo: null,
        opName: null,
        resourceType: null,
        resourceNo: null,
        opSeq: null,
        fixTime: null,
        varTime: null,
        baseQty: 1
      },
      editCycleTimeForm: {
        itemNo: null,
        itemName: null,
        opNo: null,
        opName: null,
        resourceType: { name: null, value: null },
        resourceNo: null,
        opSeq: null,
        fixTime: null,
        varTime: null,
        baseQty: null
      },
      dialog: false,
      itemList: [],
      opList: [],
      ItemSearchValue: "",
      editItemOpDialog: false,
      deleteItemOpDialog: false,
      addCycleTimeDialog: false,
      deleteCycleTimeDialog: false,
      ItemName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      isLoading: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editOpForm: {
        opName: null,
        seq: null
      },
      deleteItemData: {
        no: null,
        name: null,
        id: null
      },
      cycleTimeheaders: [
        {
          text: this.$t("type"),
          value: "type",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("No"),
          value: "resourceNo",
          align: "left",
          sortable: true,
          width: "10%"
        },

        {
          text: this.$t("fixTime") + "(" + this.$t("seconds") + ")",
          value: "fixTime",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("varTime") + "(" + this.$t("seconds") + ")",
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
      opItemheaders: [
        {
          text: this.$t("processSequence"),
          value: "opSequence",
          align: "left",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("process") + this.$t("name"),
          value: `opName`,
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
        },
        {
          text: this.$t("standardTime"),
          value: "data-table-expand",
          align: "left",
          sortable: false,
          width: "5%"
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
        .post(`/ItemOp/UpdateOpSequence`, this.sortableData, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.refreshOpItemData();
          } else {
            this.$swal("", res.data.msg, "error");
          }
        });
    },
    current(e) {
      this.sortableData = e;
      // console.log(this.sortableData);
    },
    onTypeSelectedChange() {
      if (this.selectedOpResourceType == "E") {
        this.lineList = {};
      } else {
        this.machineList = {};
      }
      this.workShiftData = [];
      //console.log(this.selectedOpResourceType);
    },
    onOpReourceSelectChange() {
      //  console.log(this.machineList);
      if (this.selectedOpResourceType == "E") {
        let machineData = this.machineData.find(
          x => x.resourceNo == this.machineList.resourceNo
        );
        this.workShiftData = [];
        let data = machineData.workShift;
        if (data != undefined) {
          for (let i = 0; i < data.length; i++) {
            this.workShiftData.push(data[i][0]);
          }
          this.workShiftList = this.workShiftData[0];
        }
        //console.log(this.workShiftData);
      } else {
        let lineData = this.lineData.find(
          x => x.resourceNo == this.lineList.resourceNo
        );
        this.workShiftData = [];
        let data = lineData.workShift;
        if (data != undefined) {
          for (let i = 0; i < data.length; i++) {
            this.workShiftData.push(data[i][0]);
          }
          this.workShiftList = this.workShiftData[0];
          //console.log(this.workShiftData);
        }
      }
      //console.log();
    },
    up() {
      if (parseFloat(this.editOpForm.seq) < 1) {
        this.$nextTick(() => {
          this.editOpForm.seq = 1;
        });
      } else if (parseFloat(this.editOpForm.seq) > this.opItemList.length) {
        this.$nextTick(() => {
          this.editOpForm.seq = this.opItemList.length;
        });
      }
    },
    showAddDialog() {
      this.dialog = true;
      this.getOpList();
      this.addItemOpForm.opSeq = this.opItemList.length + 1;
    },
    showEditOpDialog(item) {
      //console.log(item);
      this.editItemOpDialog = true;
      this.selectedOp = item;
      this.editOpForm.opName = item.opName;
      this.editOpForm.seq = item.opSequence;
    },
    editOp() {
      const token = this.$store.state.authUser.token;
      const item = {
        id: this.selectedOp.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.selectedOp.itemNo,
        opNo: this.selectedOp.opNo[0].toString(),
        opSequence: this.editOpForm.seq.toString()
      };
      //console.log(item);

      if (this.selectedOp.opSequence == item.opSequence) {
        return;
      }
      this.$axios
        .post(`/ItemOp/update`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");

            this.editItemOpDialog = false;
            this.refreshOpItemData();
          } else {
            this.$swal("", res.data.msg, "error");
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
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
        itemNo: this.editOpForm.no,
        itemName: this.editOpForm.name,
        itemSpec: this.editOpForm.spec,
        description: this.editOpForm.desc,
        itemType: "1",
        stdLotQty: this.editOpForm.qty,
        status: "Y"
      };
      this.editOpForm.no = "";
      this.editOpForm.name = "";
      this.editOpForm.spec = "";
      this.editOpForm.desc = "";
      this.editOpForm.qty = "";

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
          this.editItemOpDialog = false;
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
    refreshOpItemData() {
      this.getOpItemList();
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
          this.machineData = res.data.data != null ? res.data.data : [];
          this.machineData.unshift("*");
          // console.log(this.machineList.name);
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
          this.lineData.unshift("*");
          // console.log(this.machineList.name);
        });
    },
    getOpList() {
      this.opList = [];
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Op/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let data = res.data.data != null ? res.data.data : [];
          // 過濾已經加入的資料
          data.forEach(Element => {
            if (this.opItemList.find(x => x.opNo == Element.opNo) == undefined)
              this.opList.push(Element);
          });
          // console.log(this.machineList.name);
        });
    },
    getOpItemList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/ItemOp/Search?value=` + this.itemList.itemNo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.opItemList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
          console.log(this.opItemList);
        });
    },
    addItemOp() {
      const token = this.$store.state.authUser.token;
      const item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.addItemOpForm.itemNo,
        opNo: this.opSelected,
        opSequence: this.addItemOpForm.opSeq.toString()
      };
      // this.addItemOpForm.opSeq = "";
      //console.log(item);
      //  this.showAddDialog = false;

      if (this.opSelected == null) {
        this.$swal("", this.$t("createFailed"), "error");
        return;
        // this.addCycleTime();
        //  this.refreshOpItemData();
      }
      this.opSelected = null;
      this.$axios
        .post(`/itemOp/Create`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(item.opNo, this.$t("createSuccess"), "success");
            // this.addCycleTime();
            this.refreshOpItemData();
          } else {
            this.$swal(item.opNo, res.data.msg, "error");
            this.dialog = false;
            this.errorDialog = true;
            // console.log(res.data);
            this.message = res.data.msg;
          }
          this.dialog = false;
        })
        .then(() => {});
    },
    showDeleteItemOpDialog(item) {
      this.deleteItemOpDialog = true;
      //console.log(item);
      this.selectedOpItem = item;
    },
    showAddCycleTimeDialog(item) {
      this.addCycleTimeDialog = true;
      this.selectedOpItem = item;
      this.addCycleTimeForm.itemNo = this.itemList.itemNo;
      this.addCycleTimeForm.itemName = this.itemList.itemName;
      this.addCycleTimeForm.opSeq = item.opSequence;
      this.addCycleTimeForm.opName = item.opName;
      this.addCycleTimeForm.opNo = item.opNo;
      this.addCycleTimeForm.qty = 1;
      this.selectedOpResourceType = this.opResourceType[0].value;
      this.machineList = this.machineData[0];
      this.lineList = this.lineData[0];
      this.getMachineList();
      this.getLineList();
    },
    showEditCycleTimeDialog(item) {
      this.editCycleTimeDialog = true;
      this.selectedCycleTime = item;
      this.editCycleTimeForm.itemNo = this.itemList.itemNo;
      this.editCycleTimeForm.itemName = this.itemList.itemName;
      this.editCycleTimeForm.opSeq = item.opSequence;
      this.editCycleTimeForm.opName = item.opName;
      this.editCycleTimeForm.opNo = item.opNo;
      this.editCycleTimeForm.resourceNo = item.resourceNo;
      this.editCycleTimeForm.varTime = item.varTime;
      this.editCycleTimeForm.fixTime = item.fixTime;
      this.editCycleTimeForm.baseQty = item.baseQty;

      if (item.resourceType == "E") {
        this.editCycleTimeForm.resourceType = this.opResourceType[0];
      } else {
        this.editCycleTimeForm.resourceType = this.opResourceType[1];
      }
      //console.log(item);
    },
    showDeleteCycleTimeDialog(item) {
      this.deleteCycleTimeDialog = true;
      //  console.log(item);
      this.selectedCycleTime = item;
    },
    deleteOpItem() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/ItemOp/delete/${this.selectedOpItem.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              this.selectedOpItem.opName[0],
              this.$t("deleteSuccess"),
              "success"
            );
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(
              this.selectedOpItem.opName[0],
              this.$t("deleteFailed"),
              "error"
            );
          }
          this.refreshOpItemData();
          this.deleteItemOpDialog = false;
          this.dialog = false;
        })
        .then(() => {});
    },
    addCycleTime() {
      if (
        this.addCycleTimeForm.fixTime == null ||
        this.addCycleTimeForm.varTime == null ||
        this.addCycleTimeForm.baseQty == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      let resourceNo = null;
      if (this.selectedOpResourceType == "L") {
        resourceNo = this.lineList.lineNo;
      } else {
        resourceNo = this.machineList.no;
      }
      const token = this.$store.state.authUser.token;
      const item = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.addCycleTimeForm.itemNo,
        opNo: this.addCycleTimeForm.opNo,
        resourceType: this.selectedOpResourceType,
        resourceNo: resourceNo,
        mouldNo: "*",
        fixTime: this.addCycleTimeForm.fixTime.toString(),
        varTime: this.addCycleTimeForm.varTime.toString(),
        baseQty: this.addCycleTimeForm.baseQty.toString(),
        opSequence: this.addCycleTimeForm.opSeq.toString()
      };
      //console.log(item);
      // this.addCycleTimeForm.fixTime = "";
      // this.addCycleTimeForm.varTime = "";
      this.addCycleTimeForm.baseQty = "1";

      this.$axios
        .post(`/CycleTime/create`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(item.opName, this.$t("createSuccess"), "success");
            this.refreshOpItemData();
          } else {
            this.$swal(item.opName, res.data.msg, "error");
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
        });

      this.addCycleTimeDialog = false;
    },
    editCycleTime() {
      this.overlay = true;
      const token = this.$store.state.authUser.token;
      const item = {
        id: this.selectedCycleTime.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.editCycleTimeForm.itemNo,
        opNo: this.editCycleTimeForm.opNo,
        resourceType: this.editCycleTimeForm.resourceType.value.toString(),
        resourceNo: this.editCycleTimeForm.resourceNo,
        mouldNo: "*",
        fixTime: this.editCycleTimeForm.fixTime,
        varTime: this.editCycleTimeForm.varTime,
        baseQty: this.editCycleTimeForm.baseQty,
        opSequence: this.editCycleTimeForm.opSeq.toString()
      };
      // console.log(item);
      // this.editCycleTimeForm.fixTime = "";
      // this.editCycleTimeForm.varTime = "";
      this.editCycleTimeForm.baseQty = "1";

      if (
        item.fixTime == null ||
        item.varTime == null ||
        item.baseQty == null
      ) {
        this.$swal("", ` ${this.$t("createFailed")}`, "error");
        return;
      }
      this.$axios
        .post(`/CycleTime/update`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.overlay = false;
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
            this.refreshOpItemData();
            //this.refreshOpItemData();
          } else {
            this.$swal("", res.data.msg, "error");
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
        });

      this.editCycleTimeDialog = false;
    },
    deleteCycleTime() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/CycleTime/delete/${this.selectedCycleTime.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
          } else {
            this.$swal(res.data.msg, this.$t("deleteFailed"), "error");
          }
          this.refreshOpItemData();
          this.deleteCycleTimeDialog = false;
        })
        .then(() => {});
    }
  },
  watch: {
    data() {
      this.itemList = this.data;
      //console.log(this.itemList);
      this.isLoading = 1;
      this.addItemOpForm.itemNo = this.itemList.itemNo;
      this.addItemOpForm.itemName = this.itemList.itemName;
      this.getMachineList();
      //this.getOpList();
      this.refreshOpItemData();
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
    this.isLoading = 1;
    this.itemList = this.data;
    //console.log(this.itemList);
    this.addItemOpForm.itemNo = this.itemList.itemNo;
    this.addItemOpForm.itemName = this.itemList.itemName;
    this.getMachineList();
    // this.getOpList();
    this.refreshOpItemData();

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
