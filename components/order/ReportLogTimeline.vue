<template>
  <v-layout row wrap style="width: 100%;background-color:#FCFCFC">
    <v-flex md12 class="px-2">
      <v-timeline align-top :dense="$vuetify.breakpoint.smAndDown">
        <v-timeline-item
          :color="getLotOpStatusColor(lotOpData.status)"
          icon="mdi-information"
          fill-dot
        >
          <v-chip
            dark
            :color="getLotOpStatusColor(lotOpData.status)"
            class="mb-2"
          >
            <span v-if="lotOpData.status === 'dispatch'">
              {{ $t("already") + $t(lotOpData.status) }}
            </span>
            <span v-else-if="lotOpData.status === 'close'">
              {{ $t("projectClose") }}
              \</span
            >
            <span v-else>
              {{ $t(lotOpData.status) }}
            </span>
          </v-chip>
        </v-timeline-item>
        <v-timeline-item
          max-width="500px"
          v-for="(item, i) in logData"
          :key="i"
          :color="getStatusColor(item.logType)"
        >
          <v-card :color="getStatusColor(item.logType)" dark>
            <v-card-title class="text-h6 font-weight-black">
              {{
                new Date(item.logDate).toLocaleString() +
                  " - " +
                  getTypeName(item.logType)
              }}
              <v-spacer />
              <v-chip
                v-if="item.actionNo != null"
                color="white"
                style="color:black"
              >
                <span>{{ getActionName(item.actionNo) }}</span>
              </v-chip>
            </v-card-title>
            <v-card-text
              style="background-color:white;color:black;"
              class=" text-h6"
            >
              <v-row no-gutters>
                <v-col
                  cols="2"
                  class="font-weight-black text-truncate"
                  style="text-align:right"
                >
                  {{ $t("jobReport") + $t("count") + "：" }}</v-col
                >
                <v-col cols="2" class="text-truncate">{{ item.qty }}</v-col>
                <v-col
                  cols="2"
                  class="font-weight-black text-truncate"
                  style="text-align:right"
                >
                  {{
                    $t("already") + $t("completed") + $t("count") + "："
                  }}</v-col
                >
                <v-col cols="2" class="text-truncate">{{
                  getCompleteCount(i)
                }}</v-col>
                <v-col
                  cols="2"
                  class="font-weight-black text-truncate"
                  style="text-align:right"
                >
                  {{ $t("jobReport") + $t("user") + "：" }}</v-col
                >
                <v-col cols="2" class="text-truncate">
                  <v-chip color="grey darken-1" text-color="black" outlined>
                    <v-avatar left>
                      <v-icon>mdi-account-circle</v-icon>
                    </v-avatar>
                    {{ item.userName }}
                  </v-chip></v-col
                >
              </v-row>

              <v-row v-if="item.ngData != null" no-gutters>
                <v-col
                  cols="2"
                  class="font-weight-black text-truncate"
                  style="text-align:right"
                >
                  {{ $t("NG") + $t("count") + "：" }}</v-col
                >
                <v-col cols="2" class="text-truncate" style="color:red">{{
                  getNGCount(i)
                }}</v-col>
              </v-row>
              <!-- <p>Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.</p>
          <v-btn
            :color="item.color"
            class="mx-0"
            outlined
          >
            Button
          </v-btn> -->
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
  props: {
    lotWipLogData: {},
    lotOpData: {},
    actionData: {}
  },
  data() {
    return {
      lotOp: [],
      logData: [],
      memsurement: [],
      searchResult: [],
      number: [],
      currentNumber: 1,
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      headers: [
        {
          text: this.$t("item"),
          align: "start",
          sortable: false,
          value: "sequence",
          width: "5%"
        },
        {
          text: this.$t("name"),
          align: "start",
          value: "name",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("type"),
          align: "start",
          value: "type",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("standardValue"),
          align: "start",
          value: "standardValue",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("upperTolerance"),
          align: "start",
          value: "upperTolerance",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("lowerTolerance"),
          align: "start",
          value: "lowerTolerance",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("measureValue"),
          align: "start",
          value: "value",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("status"),
          align: "center",
          value: "status",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("notice"),
          align: "start",
          value: "notice",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },
  methods: {
    getActionName(actionNo) {
      let actionName = "";
      actionName = this.actionData.find(x => x.actionNo == actionNo).actionName;
      //console.log(actionName);
      return actionName;
    },
    getLotOpStatusColor(status) {
      let color = "";
      switch (status) {
        case "new":
          color = "grey";
          break;

        case "dispatch":
          color = "orange darken-1";
          break;
        case "producted":
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
    getCompleteCount(index) {
      let currentCompleteCount = 0;
      // console.log(index);
      for (let i = this.logData.length - 1; i >= index; i--) {
        if (
          this.logData[i].logType == "OUT" ||
          this.logData[i].logType == "PAUSE"
        ) {
          currentCompleteCount += parseFloat(this.logData[i].qty);
        }
        // console.log(currentCompleteCount);
      }
      return currentCompleteCount + "/" + this.lotOp.qty;
    },
    getNGCount(index) {
      let currentNGCount = 0;
      //  console.log(index);

      if (this.logData[index].ngData != null) {
        currentNGCount = parseFloat(this.logData[index].ngData.ngQty);

        // console.log(currentNGCount);
      }
      return currentNGCount;
    },
    getStatusColor(status) {
      let color = "";
      switch (true) {
        case status == "ACTION_START":
          color = "grey";
          break;
        case status == "ACTION_END":
          color = "grey darken-1";
          break;
        case status.includes("ACTION_REWORK"):
          var arr = status.split("_");
          color = "blue-grey  darken-3";
          if (arr[arr.length - 1] == "START") {
            color = "blue-grey lighten-1";
          } else if (arr[arr.length - 1] == "END") {
            color = "blue-grey darken-1";
          }
          break;
        case status == "CANCEL_PAUSE":
          color = "orange darken-1";
          break;
        case status == "PRODUCTION":
          color = "primary";
        case status == "IN":
          color = "primary";
          break;
        case status == "OUT":
          color = "green accent-4";
          break;
        case status == "PAUSE":
          color = "red darken-1";
          break;
        case status == "COMPLETE":
          color = "light-blue accent-4";
          break;
        case status == "CLOSE":
          color = "blue-grey darken-3";
          break;
      }
      return color;
    },
    getTypeName(type) {
      //console.log(status);
      let name = "";
      switch (true) {
        case type == "IN":
          name = this.$t("in");
          break;
        case type == "OUT":
          name = this.$t("outStation");
          break;
        case type == "COMPLETE":
          name = this.$t("complete");
          break;
        case type == "PAUSE":
          name = this.$t("pause");
          break;
        case type == "CANCEL_PAUSE":
          name = this.$t("cancel") + this.$t("pause");
          break;
        case type == "ACTION_START":
          name = this.$t("produce") + this.$t("action") + this.$t("start");
          break;
        case type == "ACTION_END":
          name = this.$t("produce") + this.$t("action") + this.$t("completed");
          break;
        case type == "ACTION_START":
          name = this.$t("produce") + this.$t("action") + this.$t("start");
          break;
        case type.includes("ACTION_REWORK"):
          name = this.$t("produce") + this.$t("action") + this.$t("rework");
          var arr = type.split("_");
          if (arr[arr.length - 1] == "START") {
            name += this.$t("start");
          } else if (arr[arr.length - 1] == "END") {
            name += this.$t("completed");
          }
          break;
        case type == "close":
          name = this.$t("projectClose");
          break;
        case type == "PRODUCTION":
          name = this.$t("production");
      }
      return name;
    }
  },
  mounted() {},
  created() {
    this.logData = this.lotWipLogData;
    this.lotOp = this.lotOpData;
    //console.log(this.logData);
  },
  watch: {
    lotWipLogData() {
      this.logData = this.lotWipLogData;
    }
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 5px;
  position: relative;
  max-height: 100%;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
