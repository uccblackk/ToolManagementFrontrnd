<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <v-data-table
        :headers="headers"
        :items="lotWipList"
        :items-per-page="opPerPage"
        :single-expand="singleExpand"
        :sort-by="['status', 'dispatchStartDate', 'lotData.lotNo']"
        :sort-desc="[true, false, false]"
        :loading="isLoading == 1"
        multi-sort
        loading-text="Loading... Please wait"
        class="elevation-1 "
        @page-count="pageCount = $event"
        @item-expanded="loadDetails"
        @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
        :item-class="itemRowBackground"
        :page.sync="page"
        hide-default-footer
        show-expand
      >
        <template v-slot:item.moData.createTime="{ item }">
          {{ formatDate(item.moData.createTime) }}
        </template>
        <template v-slot:top>
          <div style="text-align:right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                  @click="createSheet()"
                >
                  <excel-export
                    filename="報工履歷"
                    :sheet="sheet"
                    :manual="true"
                    ref="excelExport"
                  >
                    {{ $t("export") + "Excel" }}
                  </excel-export>
                </v-btn>
              </template>
              {{ $t("export") + $t("jobReport") + $t("history") + "Excel" }}
            </v-tooltip>
          </div>
        </template>
        <template v-slot:[`item.statusDate`]="{ item }">
          {{ new Date(item.statusDate).toLocaleString() }}
        </template>
        <template v-slot:[`item.moData.urgent`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                v-on="on"
                v-if="item.moData.urgent == 'Y'"
                large
                color="red"
              >
                mdi-fire-alert
              </v-icon>
            </template>
            {{ $t("urgentMo") }}
          </v-tooltip>
        </template>
        <template v-slot:item.dispatchStartDate="{ item }">
          <span v-if="item.scheduleStartTime != null">
            {{
              new Date(
                item.dispatchStartDate + " " + item.scheduleStartTime
              ).toLocaleString()
            }}
          </span>
          <span v-else>
            {{ item.dispatchStartDate }}
          </span>
        </template>
        <template v-slot:item.dispatchEndDate="{ item }">
          <span v-if="item.scheduleStartTime != null">
            {{
              new Date(
                item.dispatchEndDate + " " + item.scheduleEndTime
              ).toLocaleString()
            }}
          </span>
          <span v-else>
            {{ item.dispatchEndDate }}
          </span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                @click="redirectProcedureDetail(item)"
                v-bind="attrs"
                v-on="on"
                >mdi-android-messages</v-icon
              >
            </template>
            {{ $t("detail") }}
          </v-tooltip>
        </template>
        <template v-slot:[`item.actualStartTime`]="{ item }">
          <span v-if="item.actualStartTime != null">
            {{ new Date(item.actualStartTime).toLocaleString() }}
          </span>
          <span v-else>
            {{ "--" }}
          </span>
        </template>
        <template v-slot:[`item.qty`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on" style="text-align:right">
                <span v-if="item.outQty != null">
                  {{ item.outQty + "/" + item.planQty }}
                  {{
                    " (" +
                      (
                        parseFloat(item.outQty) / parseFloat(item.planQty)
                      ).toFixed(3) *
                        100 +
                      "%)"
                  }}
                </span>
                <span v-else>
                  {{ "0/" + item.planQty + " (0%)" }}
                </span>
              </div>
              <v-progress-linear
                v-bind="attrs"
                v-on="on"
                color="green lighten-2"
                :value="
                  (parseFloat(item.outQty) / parseFloat(item.planQty)) * 100
                "
              ></v-progress-linear>
            </template>
            {{ "出站數量 / 預計生產數量" }}
          </v-tooltip>
        </template>
        <template v-slot:[`item.resourceName`]="{ item }">
          <v-chip color="primary">{{ item.resourceName }}</v-chip>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip label outlined :color="getStatusColor(item.status)">
            <span v-if="item.status == 'complete'">
              {{ $t(item.status) }}
            </span>
            <span v-else-if="item.status === 'in' || item.status === 'out'">
              {{ $t("producted") }}
            </span>

            <span v-else-if="item.status === 'dispatch'">
              {{ $t("already") + $t(item.status) }}
            </span>
            <span v-else-if="item.status === 'close'">
              {{ $t("projectClose") }}
            </span>
          </v-chip>
        </template>
        <template v-slot:[`item.resourceType`]="{ item }">
          <div v-if="item.resourceType == 'E'">
            {{ $t("equipment") }}
          </div>
          <div v-if="item.resourceType == 'L'">
            {{ $t("line") }}
          </div>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <div class="mt-2 mb-2">
              <v-data-table
                dense
                :headers="lotWipLogHeaders"
                :items="item.lotWipLog"
                :items-per-page="itemsPerPage"
                :sort-by="['logDate']"
                :sort-desc="sort"
                class="elevation-1  mytable"
              >
                <!-- <template v-slot:header="{ props: { headers } }">
                  <thead>
                    <tr class="some-other-style">
                      <th v-for="h in lotWipLogHeaders" :class="h.class">
                        <span>{{ h.text }}</span>
                      </th>
                    </tr>
                  </thead>
                </template> -->

                <template v-slot:[`item.logDate`]="{ item }">
                  {{ new Date(item.logDate).toLocaleString() }}
                </template>

                <template v-slot:[`item.type`]="{ item }">
                  <div style="margin-top:5px;margin-bottom:5px">
                    <span
                      v-if="item.logType.includes('START')"
                      class=" font-weight-black"
                    >
                      <v-chip color="success">
                        {{ getActionName(item) }}</v-chip
                      >
                      {{ getTypeName(item) }}
                    </span>
                    <span
                      v-else-if="item.logType.includes('END')"
                      class=" font-weight-black"
                    >
                      <v-chip color="primary">
                        {{ getActionName(item) }}</v-chip
                      >
                      {{ getTypeName(item) }}
                    </span>
                    <span
                      v-else-if="
                        item.logType.includes('ACTION_REWORK') &&
                          item.logType.includes('START') == false &&
                          item.logType.includes('END') == false
                      "
                      class=" font-weight-black"
                    >
                      <v-chip color="blue-grey  darken-3" dark>
                        {{ getActionName(item) }}</v-chip
                      >
                      {{ getTypeName(item) }}
                    </span>
                    <span v-else class=" font-weight-black">
                      {{ getTypeName(item) }}
                    </span>
                  </div>
                </template>
                <template v-slot:[`item.userName`]="{ item }">
                  <v-chip class="ma-2" color="primary" text-color="white">
                    <v-avatar left>
                      <v-icon>mdi-account-circle</v-icon>
                    </v-avatar>
                    {{ item.userName }}
                  </v-chip>
                  <!-- <v-avatar
                    color="primary white--text text-caption"
                    style="max-width: 30px;"
                    size="30"
                    dark
                  >
                    <span class="text-truncate" style="max-width: 25px;">
                      {{ item.userName.charAt(0) }}
                    </span>
                  </v-avatar>
                  {{ item.userName }} -->
                </template>
                <template v-slot:[`item.NgCount`]="{ item }">
                  {{ getNgCount(item) }}
                </template>
                <template v-slot:[`item.NgReason`]="{ item }">
                  {{ getNgReason(item) }}
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
// import { ExcelExport } from "pikaz-excel-js";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    lotWipData: {},
    isLoading: null
  },
  data() {
    return {
      sheet: [],
      singleExpand: true,
      selectedItem: [],
      sort: true,
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
      lotWipList: [],
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
      opPerPage: 10,
      defaultSelected: {
        state: "是",
        value: "Y"
      },
      editOpForm: {
        no: null,
        name: null,
        desc: null,
        dispatchOptions: [
          { state: "是", value: "Y" },
          { state: "否", value: "N" }
        ]
      },
      deletelotWipData: {
        id: null
      },
      headers: [
        {
          text: "",
          align: "start fixed",

          value: "actions",
          sortable: false,
          width: "10px"
        },
        {
          text: this.$t("urgentMo"),
          value: "moData.urgent",
          align: "start ",

          sortable: true,
          width: "80px"
        },
        {
          text: this.$t("moCreateDateTime"),
          value: "moData.createTime",
          sortable: true,
          align: "left fixed",
          class: "fixed",
          width: "150px"
        },
        {
          text: this.$t("plan") + this.$t("start") + this.$t("date"),
          value: "moData.planStartDate",
          sortable: true,
          align: "left fixed",
          class: "fixed",
          width: "150px"
        },
        {
          text: this.$t("scheduleDueDate"),
          value: "moData.planEndDate",
          sortable: true,
          align: "left fixed",
          class: "fixed",
          width: "150px"
        },
        {
          text: this.$t("customer"),
          value: "moData.customer",
          sortable: true,
          align: "left",
          width: "150px"
        },
        {
          text: this.$t("salesDoc"),
          value: "moData.orderNo",
          sortable: false,
          align: "left",
          width: "150px"
        },
        {
          text: this.$t("productionNo"),
          value: "moData.moNo",
          align: "start fixed",
          class: "fixed",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("mo") + this.$t("count"),
          value: "moData.qty",
          sortable: false,
          align: "center",
          width: "100px"
        },
        {
          text: this.$t("lot") + this.$t("No"),
          value: "lotData.lotNo",
          align: "start fixed",
          class: "fixed",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("partNo"),
          value: "moData.itemNo",
          align: "start",
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("itemName"),
          value: "moData.itemName",
          align: "start",
          sortable: false,
          width: "150px"
        },

        {
          text: this.$t("type"),
          value: "resourceType",
          align: "start",
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("equipment") + this.$t("name"),
          value: "resourceName",
          align: "start",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("processSequence"),
          value: "lotOpData.opSequence",
          align: "start",
          sortable: true,
          width: "100px"
        },
        {
          text: this.$t("process"),
          value: "lotOpData.opName",
          align: "start",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("status"),
          value: "status",
          align: "center",
          sortable: true,
          width: "100px"
        },
        {
          text: this.$t("ASSABName"),
          value: "moData.parameter.ASSABName",
          sortable: true,
          align: "center",

          width: "100px"
        },
        {
          text: this.$t("resourceThickness"),
          value: "moData.parameter.resourceThickness",
          sortable: true,
          align: "center",

          width: "100px"
        },
        {
          text: this.$t("resourceWidth"),
          value: "moData.parameter.resourceWidth",
          sortable: true,
          align: "center",

          width: "100px"
        },
        {
          text: this.$t("resourceLength"),
          value: "moData.parameter.resourceLength",
          sortable: true,
          align: "center",

          width: "100px"
        },
        {
          text: this.$t("MACHP"),
          value: "moData.parameter.MACHP",
          sortable: true,
          align: "center",

          width: "100px"
        },

        {
          text: this.$t("weight"),
          value: "moData.parameter.weight",
          sortable: true,
          align: "center",

          width: "100px"
        },
        {
          text: this.$t("dispatch") + this.$t("start") + this.$t("time"),
          value: "dispatchStartDate",
          align: "start",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("dispatch") + this.$t("end") + this.$t("time"),
          value: "dispatchEndDate",
          align: "start",
          sortable: true,
          width: "150px"
        },

        {
          text: this.$t("require") + this.$t("count"),
          value: "lotData.qty",
          sortable: false,
          align: "center",
          width: "100px"
        },
        {
          text: this.$t("complete") + this.$t("count"),
          value: "qty",
          align: "center",
          sortable: false,
          width: "150px"
        },

        {
          text: this.$t("jobReport") + this.$t("history"),
          value: "data-table-expand",
          align: "center",
          sortable: false,
          width: "100px"
        }
      ]
    };
  },
  //  components: {
  //     ExcelExport
  //   },
  watch: {
    lotWipData() {
      // console.log(this.lotWipData);
      this.lotWipList = this.lotWipData;
    }
  },
  methods: {
    formatDate(date) {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    },
    itemRowBackground: function(item) {
      //console.log(item);
      return item.moData.urgent == "Y" ? "red lighten-5" : "";
    },
    redirectProcedureDetail(item) {
      //console.log(item);
      this.$router.push(`/order/${item.lotOpData.id}`);
      // let route = this.$router.resolve({path: `/procedure/${item.id}`});
      // window.open(route.href, '_blank');
    },
    loadDetails({ item }) {
      this.selectedItem = item;
      //  console.log(item);
    },
    getNgReason(item) {
      let count = "--";

      if (this.selectedItem.ngData.length > 0) {
        var data = this.selectedItem.ngData.find(x => x.lotWipLogId == item.id);
        if (data != undefined) {
          count = data.reasonName;
        }
      }
      return count;
    },
    getNgCount(item) {
      let count = "--";

      if (this.selectedItem.ngData.length > 0) {
        var data = this.selectedItem.ngData.find(x => x.lotWipLogId == item.id);
        if (data != undefined) {
          count = data.ngQty;
        }
      }
      return count;
    },
    findActionName(lotWipData, item) {
      let name = null;
      //console.log(this.selectedItem);
      if (lotWipData.actionData.length > 0) {
        name = lotWipData.actionData.find(x => x.actionNo == item.actionNo)
          .actionName;
      }
      return name;
    },
    findNgReason(lotWipData, item) {
      let count = "--";

      if (lotWipData.ngData.length > 0) {
        var data = lotWipData.ngData.find(x => x.lotWipLogId == item.id);
        if (data != undefined) {
          count = data.reasonName;
          // console.log(
          //   lotWipData.ngData.find(x => x.lotWipLogId == item.id)
          //     .reasonName
          // );
        }
      }
      return count;
    },
    findNgCount(lotWipData, item) {
      let count = "--";

      if (lotWipData.ngData.length > 0) {
        var data = lotWipData.ngData.find(x => x.lotWipLogId == item.id);
        if (data != undefined) {
          count = data.ngQty;
        }
      }
      return count;
    },
    getActionName(item) {
      let name = null;
      //console.log(this.selectedItem);
      if (this.selectedItem.actionData.length > 0) {
        name = this.selectedItem.actionData.find(
          x => x.actionNo == item.actionNo
        ).actionName;
      }
      return name;
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case "new":
          color = "grey";
          break;
        case "createlot":
          color = "grey darken-1";
          break;
        case "dispatch":
          color = "orange darken-1";
          break;
        case "in":
          color = "green accent-4";
          break;
        case "out":
          color = "green accent-4";
          break;
        case "pause":
          color = "red darken-1";
          break;
        case "complete":
          color = "light-blue accent-4";
          break;
        case "close":
          color = "blue-grey darken-3";
          break;
      }
      return color;
    },
    getTypeName(item) {
      //console.log(status);
      let name = "";
      switch (true) {
        case item.logType == "IN":
          name = this.$t("in");
          break;
        case item.logType == "OUT":
          name = this.$t("outStation");
          break;
        case item.logType == "COMPLETE":
          name = this.$t("complete");
          break;
        case item.logType == "PAUSE":
          name = this.$t("pause");
          break;
        case item.logType == "CANCEL_PAUSE":
          name = this.$t("cancel") + this.$t("pause");
          break;
        case item.logType == "ACTION_START":
          name = this.$t("produce") + this.$t("action") + this.$t("start");
          break;
        case item.logType == "ACTION_END":
          name = this.$t("produce") + this.$t("action") + this.$t("completed");
          break;
        case item.logType == "ACTION_START":
          name = this.$t("produce") + this.$t("action") + this.$t("start");
          break;
        case item.logType.includes("ACTION_REWORK"):
          name = this.$t("produce") + this.$t("action") + this.$t("rework");
          var arr = item.logType.split("_");
          if (arr[arr.length - 1] == "START") {
            name += this.$t("start");
          } else if (arr[arr.length - 1] == "END") {
            name += this.$t("completed");
          }
          break;
        case item.logType == "CLOSE":
          name = this.$t("projectClose");
          break;
        case item.logType == "NG":
          name = this.$t("NG") + this.$t("report");
          break;
      }
      return name;
    },
    getLocalTime(item) {
      if (item.atualStartTime != null) {
        //console.log(new Date(item.atualStartTime).toString());
        return new Date(item.atualStartTime).toString();
      }
    },
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
          this.refreshlotWipData();
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
        name = this.machineData.find(x => x.no == item.resourceNo).name;
      } else {
        name = this.lineData.find(x => x.lineNo == item.resourceNo).lineName;
      }
      return name;
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
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        opNo: this.editOpForm.no,
        opName: this.editOpForm.name,
        description: this.editOpForm.desc,
        dispatchTag: "Y",
        status: "Y"
      };
      //console.log(Op);
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
            this.$swal(Op.name, this.$t("editFailed"), "error");
            this.editDialog = false;
          }
          this.refreshlotWipData();
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
      this.deletelotWipData.no = "";
      this.deletelotWipData.name = "";

      this.$axios
        .delete(`/Op/delete/${this.deletelotWipData.id}`, {
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
            this.deleteDialog = false;
          }
          this.refreshlotWipData();
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshlotWipData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Op/Search?value=${this.OpSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //   console.log(res.data.data);
          this.lotWipList = res.data.data != null ? res.data.data : [];
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deletelotWipData.id = item.id;
    },
    createSheet() {
      //console.log(this.lotWipList);
      //return;
      let logData = [];
      this.lotWipList.forEach(lotWip => {
        lotWip.lotWipLog.forEach(log => {
          let resourceType = "";
          if (lotWip.resourceType == "L") {
            resourceType = this.$t("line");
          } else {
            resourceType = this.$t("equipment");
          }
          let ngCount = 0;
          let ngReason = 0;
          let lotOpStatus = "";
          if (lotWip.status == "complete") lotOpStatus = this.$t(lotWip.status);
          else if (lotWip.status === "in" || lotWip.status === "out")
            lotOpStatus = this.$t("producted");
          else if (lotWip.status === "dispatch") {
            (lotOpStatus = this), $t("already") + this.$t(lotWip.status);
          } else if (lotWip.status === "close") {
            lotOpStatus = this.$t("projectClose");
          }

          ngCount = this.findNgCount(lotWip, log);
          ngReason = this.findNgReason(lotWip, log);

          let logType = "";
          if (log.logType == "ACTION_START" || log.logType == "ACTION_END") {
            logType =
              this.findActionName(lotWip, log) +
              "(" +
              this.getTypeName(log) +
              ")";
          } else {
            logType = this.getTypeName(log);
          }

          let wipdesc = "--";

          if (log.wipDesc != null) {
            wipdesc = log.wipDesc;
          }
          let item = {
            urgent: lotWip.moData.urgent,
            moCreateDateTime: lotWip.moData.createTime,
            planStartDate: lotWip.moData.planStartDate,
            scheduleDueDate: lotWip.moData.planEndDate,
            customer: lotWip.moData.customer,
            salesDoc: lotWip.moData.orderNo,
            moNo: lotWip.moData.moNo,
            moQty: lotWip.moData.qty,
            reportQty: log.qty,
            lotNo: lotWip.lotData.lotNo,
            itemNo: lotWip.moData.itemNo,
            itemName: lotWip.moData.itemName,
            resourceType: resourceType,
            resourceName: lotWip.resourceName,
            opSeq: lotWip.lotOpData.opSequence,
            opNo: lotWip.lotOpData.opNo,
            opName: lotWip.lotOpData.opName,
            lotOpStatus: lotOpStatus,
            ASSABName: lotWip.moData.parameter.ASSABName,
            resourceThickness: lotWip.moData.parameter.resourceThickness,
            resourceWidth: lotWip.moData.parameter.resourceWidth,
            resourceLength: lotWip.moData.parameter.resourceLength,
            MACHP: lotWip.moData.parameter.MACHP,
            weight: lotWip.moData.parameter.weight,
            dispatchQty: lotWip.lotOpData.dispatchQty,
            completedQty: lotWip.lotOpData.completedQty,
            logDate: new Date(log.logDate).toLocaleDateString(),
            shiftName: log.shiftName,
            logType: logType,
            userName: log.userName,
            wipDesc: wipdesc,
            ngCount: ngCount,
            ngReason: ngReason
          };

          logData.push(item);
        });
      });

      this.sheet = [
        {
          title: this.$t("jobReport") + this.$t("log"),
          tHeader: [
            this.$t("urgentMo"),
            this.$t("moCreateDateTime"),
            this.$t("plan") + this.$t("start") + this.$t("date"),
            this.$t("scheduleDueDate"),
            this.$t("customer"),
            this.$t("salesDoc"),
            this.$t("productionNo"),
            this.$t("mo") + this.$t("count"),
            this.$t("jobReport") + this.$t("count"),
            this.$t("lot") + this.$t("No"),
            this.$t("partNo"),
            this.$t("itemName"),
            this.$t("type"),
            this.$t("equipment") + this.$t("name"),
            this.$t("processSequence"),
            this.$t("process") + this.$t("No"),
            this.$t("process") + this.$t("name"),
            this.$t("status"),
            this.$t("ASSABName"),
            this.$t("resourceThickness"),
            this.$t("resourceWidth"),
            this.$t("resourceLength"),
            this.$t("MACHP"),
            this.$t("weight"),
            this.$t("dispatch") + this.$t("count"),
            this.$t("complete") + this.$t("count"),
            this.$t("jobReport") + this.$t("time"),
            this.$t("workShift"),
            this.$t("jobReport") + this.$t("type"),
            this.$t("jobReport") + this.$t("user"),
            this.$t("notice"),
            this.$t("NG") + this.$t("count"),
            this.$t("NG") + this.$t("reason")
          ],
          table: logData,
          keys: [
            "urgent",
            "moCreateDateTime",
            "planStartDate",
            "scheduleDueDate",
            "customer",
            "salesDoc",
            "moNo",
            "moQty",
            "reportQty",
            "lotNo",
            "itemNo",
            "itemName",
            "resourceType",
            "resourceName",
            "opSeq",
            "opNo",
            "opName",
            "lotOpStatus",
            "ASSABName",
            "resourceThickness",
            "resourceWidth",
            "resourceLength",
            "MACHP",
            "weight",
            "dispatchQty",
            "completedQty",
            "logDate",
            "shiftName",
            "logType",
            "userName",
            "wipDesc",
            "ngCount",
            "ngReason"
          ],
          sheetName: this.$t("jobReport") + this.$t("log"),
          cellStyle: [
            {
              cell: "A1",
              font: {
                sz: 14,
                color: { rgb: "ffffff" },
                bold: true
              },
              fill: {
                fgColor: { rgb: "ff7e00" }
              }
            }
          ]
        }
      ];
      //console.log(this.sheet);
      this.$refs.excelExport.pikaExportExcel();
    }
  },
  mounted() {
    // this.lotWipList = this.lotWipData;
    // console.log(this.lotWipList);
  },
  computed: {
    lotWipLogHeaders() {
      let headers = [];
      headers = [
        {
          text: this.$t("jobReport") + this.$t("time"),
          value: "logDate",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("workShift"),
          value: "shiftName",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("execute") + this.$t("action"),
          value: "type",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("count"),
          value: "qty",
          align: "start",
          sortable: true,
          width: "5%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("jobReport") + this.$t("user"),
          value: "userName",
          align: "center",
          sortable: true,
          width: "5%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("notice"),
          value: "wipDesc",
          align: "start",
          sortable: true,
          width: "5%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("NG") + this.$t("count"),
          value: "NgCount",
          align: "start",
          sortable: true,
          width: "5%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("NG") + this.$t("reason"),
          value: "NgReason",
          align: "start",
          sortable: true,
          width: "5%",
          class: "grey lighten-3"
        }
      ];
      return headers;
    }
  },
  created() {
    this.lotWipList = this.lotWipData;
  }
};
</script>
<style>
.some-other-style {
  background: rgb(243, 243, 243);
}
.custom_table_class thead th {
  background-color: #f0f2f5;
}
.custom_table_class thead th:first-child {
  border-radius: 6px 0 0 0;
}
.custom_table_class thead th:lsat-child {
  border-radius: 0 6px 0 0;
}
table > tbody > tr > td.fixed:nth-child(3),
table > thead > tr > th.fixed:nth-child(3) {
  position: sticky !important;
  position: -webkit-sticky !important;
  left: 0;
  z-index: 3;
  background: white;
}
table > tbody > tr > td.fixed:nth-child(4),
table > thead > tr > th.fixed:nth-child(4) {
  position: sticky !important;
  position: -webkit-sticky !important;
  left: 150px;
  z-index: 3;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.15) 2.4px 0px 3.2px;
}
table > thead > tr > th.fixed:nth-child(1) {
  z-index: 3;
}
</style>
