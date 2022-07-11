<template>
  <v-layout row wrap style="width:100%">
    <v-flex md12 class="px-2">
      <v-card width="100%">
        <v-card-title class="text-h6 font-weight-bold" style="height:20px">
          <v-icon class="my-n5">mdi-clock-time-eight-outline</v-icon>
          <span class=" my-n5">{{ $t("machineMissionList") }}</span>
        </v-card-title>
        <v-divider light />
        <v-card-text style="text-align:left">
          <v-alert
            v-if="process.length > 0"
            dense
            text
            type="info"
            class="ma-2"
          >
            {{ $t("lot") + $t("count") }}：<strong>{{ process.length }}</strong>
          </v-alert>
          <v-alert v-else dense text type="warning" class="ma-2">
            {{ $t("lot") + $t("count") }}：<strong>{{ process.length }}</strong>
          </v-alert>
          <v-data-table
            :headers="headers"
            :items="process"
            :items-per-page="itemsPerPage"
            :sort-by="['moData.urgent', 'resourceName', 'status']"
            :sort-desc="[true, true, true]"
            class="elevation-1 text-center"
            @page-count="pageCount = $event"
            :page.sync="page"
            :item-class="itemRowBackground"
            hide-default-footer
            multi-sort
          >
            <template v-slot:item.lotData.lotNo="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span
                    @click="
                      redirectToDetail(
                        item.lotData.lotNo,
                        item.dispatchStartDate
                      )
                    "
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ item.lotData.lotNo }}
                  </span>
                </template>
                {{ "報工" }}
              </v-tooltip>
            </template>
            <template v-slot:item.moData.urgent="{ item }">
              <div v-if="item.moData.urgent == 'Y'">
                <v-icon large color="red">
                  mdi-fire-alert
                </v-icon>
              </div>
            </template>
            <template v-slot:item.isProduction="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    color="warning"
                    v-if="item.isProduction == 'N'"
                  >
                    mdi-minus-circle
                  </v-icon>
                  <v-icon v-bind="attrs" v-on="on" color="success" v-else>
                    mdi-check-circle
                  </v-icon>
                </template>
                <span v-if="item.isProduction == 'N'">
                  {{ $t("notyet") + $t("production") }}
                </span>
                <span v-else>
                  {{ $t("already") + $t("production") }}
                </span>
              </v-tooltip>
            </template>
            <template v-slot:item.dispatchDateTime="{ item }">
              <span v-if="item.scheduleStartTime != null">
                {{ item.dispatchStartDate + " " + item.scheduleStartTime }}
              </span>
              <span v-else>
                {{ item.dispatchStartDate }}
              </span>
            </template>
            <template v-slot:item.scheduleEndTime="{ item }">
              <span v-if="item.scheduleEndTime != null">
                {{ item.dispatchEndDate + " " + item.scheduleEndTime }}
              </span>
              <span v-else>
                {{ item.dispatchEndDate }}
              </span>
            </template>
            <template v-slot:item.select="{ item }">
              <v-icon class="mr-2" @click="redirectToStation(item.id)"
                >mdi-arrow-right-bold-box</v-icon
              >
            </template>
            <template v-slot:item.actualStartTime="{ item }">
              <span
                style="color:#0072E3;font-weight:bold"
                v-if="item.actualStartTime != null"
              >
                {{ new Date(item.actualStartTime).toLocaleString() }}
              </span>
              <span v-else>{{ "--" }}</span>
            </template>
            <template v-slot:item.actualEndTime="{ item }">
              <span
                style="color:#0072E3;font-weight:bold"
                v-if="item.actualEndTime != null"
              >
                {{ new Date(item.actualEndTime).toLocaleString() }}
              </span>
              <span v-else>{{ "--" }}</span>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip outlined :color="getStatusColor(item.status)">
                <span
                  v-if="item.status == 'pause' || item.status == 'complete'"
                >
                  {{ $t(item.status) }}
                </span>
                <span v-else-if="item.status == 'in' || item.status == 'out'">
                  {{ $t("producted") }}
                </span>
                <span v-else-if="item.status === 'dispatch'">
                  {{ $t("already") }}{{ $t(item.status) }}
                </span>
                <span v-else-if="item.status === 'close'">
                  {{ $t("projectClose") }}
                </span>
              </v-chip>
            </template>
            <template v-slot:item.cycleTime="{ item }">
              <label id="status1" class="form-label">
                {{ showItemState(item.cycleTime) }}
              </label>
            </template>
            <template v-slot:item.qty="{ item }">
              <label id="status1" class="form-label">
                <span v-if="item.outQty == null || item.outQty == 'null'">
                  {{ "0/" + item.planQty }}</span
                >
                <span v-else> {{ item.outQty + "/" + item.planQty }}</span>
              </label>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination
              :total-visible="7"
              v-model="page"
              :length="pageCount"
            ></v-pagination>
          </div>
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
export default {
  props: {
    processData: null
  },
  data() {
    return {
      process: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      headers: [
        {
          text: "",
          value: "isProduction",
          align: "start",
          sortable: true,
          width: "20px"
        },
        {
          text: this.$t("urgentMo"),
          value: "moData.urgent",
          align: "start",
          sortable: true,
          width: "20px"
        },

        {
          text: this.$t("equipment") + this.$t("name"),
          value: "resourceName",
          align: "start",
          sortable: true,
          width: "100px"
        },
        {
          text: this.$t("dispatch") + this.$t("start") + this.$t("time"),
          value: "dispatchDateTime",
          align: "left",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("expected") + this.$t("completed") + this.$t("time"),
          value: "scheduleEndTime",
          align: "left",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("actual") + this.$t("start") + this.$t("time"),
          value: "actualStartTime",
          align: "left",
          sortable: true,
          width: "200px"
        },
        {
          text: this.$t("actual") + this.$t("completed") + this.$t("time"),
          value: "actualEndTime",
          align: "left",
          sortable: true,
          width: "200px"
        },
        {
          text: this.$t("jobNo"),
          align: "left",
          sortable: false,
          value: "moData.moNo",
          width: "150px"
        },
        {
          text: this.$t("lot") + this.$t("No"),
          value: "lotData.lotNo",
          align: "left",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("itemName"),
          value: "moData.itemName",
          align: "left",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("itemNo"),
          value: "moData.itemNo",
          align: "left",
          sortable: false,
          width: "100px"
        },

        {
          text: this.$t("itemSpec"),
          value: "moData.itemSpec",
          align: "left",
          sortable: false,
          width: "100px"
        },

        {
          text: this.$t("process"),
          value: "lotOpData.opName",
          align: "left",
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
          text: this.$t("completeCount"),
          value: "qty",
          align: "left",
          sortable: false,
          width: "100px"
        },

        {
          text: this.$t("workShift"),
          value: "shiftName",
          align: "left",
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("expected") + this.$t("cycleTime"),
          value: "cycleTime",
          align: "left",
          sortable: false,
          width: "100px"
        }
      ]
    };
  },
  methods: {
    itemRowBackground: function(item) {
      //console.log(item);
      return item.moData.urgent == "Y" ? "red lighten-5" : "";
    },
    redirectToDetail(lotNo, date) {
      this.$router.push(`/jobReport/jobReport/${lotNo}?date=${date}`);
    },
    showItemState(cycleTime) {
      // console.log(cycleTime);
      let result = "--";
      if (cycleTime != "" && cycleTime != undefined) {
        result = new Date(cycleTime * 1000).toISOString().substr(11, 8);
      }
      return result;
    },
    getStatusColor(status) {
      //  console.log(status);
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
        case "producted":
          color = "green accent-4";
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
    redirectToProcess(processId) {
      this.$router.push(`/jobReport`);
    }
  },
  mounted() {
    // console.log(this.processData);
    // this.process = this.processData;
  },
  watch: {
    processData() {
      //   console.log(this.processData);
      this.process = this.processData;
    }
  },
  created() {
    // console.log(this.processData);
    this.process = this.processData;
  }
};
</script>
