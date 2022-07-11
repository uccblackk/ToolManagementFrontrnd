<template>
  <v-layout row wrap style="width:100%">
    <v-flex md12 class="px-2">
      <v-card width="100%">
        <v-card-title class="text-h6 font-weight-bold" style="height:20px">
          <v-icon class="my-n5">mdi-clock-time-eight-outline</v-icon>
          <span class=" my-n5">{{ $t("machineUtilization") + $t("log") }}</span>
        </v-card-title>
        <v-divider />
        <v-card-text style="text-align:left">
          <v-alert
            v-if="statusData.length > 0"
            dense
            text
            type="info"
            class="ma-2"
          >
            {{ $t("machineUtilization") + $t("count") }}：<strong>{{
              statusData.length
            }}</strong>
          </v-alert>
          <v-alert v-else dense text type="warning" class="ma-2">
            {{ $t("machineUtilization") + $t("count") }}：<strong>{{
              statusData.length
            }}</strong>
          </v-alert>
          <v-select
            v-model="search"
            :items="status"
            item-value="value"
            item-text="name"
            :label="$t('search') + $t('status')"
          ></v-select>
          <v-data-table
            :headers="headers"
            :items="statusData"
            :items-per-page="itemsPerPage"
            class="elevation-1 text-center"
            :sort-desc="sotDesc"
            sort-by="time"
            item-key="id"
            :search="search"
            @page-count="pageCount = $event"
            :page.sync="page"
            hide-default-footer
          >
            <template v-slot:item.status="{ item }">
              <span style="color:white">
                {{ item.status }}
              </span>
            </template>
            <template v-slot:item.sn="{ item }">
              {{ statusData.indexOf(item) + 1 }}
            </template>
            <template v-slot:item.time="{ item }">
              {{ new Date(item.time).toLocaleString() }}
            </template>
            <template v-slot:item.endTime="{ item }">
              <!-- {{ statusData.indexOf(item) }} -->
              <span v-if="statusData.indexOf(item) != 0">
                {{
                  new Date(
                    statusData[statusData.indexOf(item) - 1].time
                  ).toLocaleString()
                }}
              </span>
            </template>
            <template v-slot:item.lastTime="{ item }">
              <!-- {{ statusData.indexOf(item) }} -->
              <span v-if="statusData.indexOf(item) != 0">
                {{
                  getLastTime(
                    new Date(item.time),
                    new Date(statusData[statusData.indexOf(item) - 1].time)
                  )
                }}
              </span>
              <span v-if="statusData.indexOf(item) == 0 && item.status != null">
                {{ getLastTime(new Date(), new Date(item.time)) }}
              </span>
            </template>
            <template v-slot:item.statusData="{ item }">
              <v-icon :color="getStatusColor(item.status)">mdi-circle</v-icon>
              {{ getStatus(item.status) }}
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
    machineStatusData: null,
    dates: null
  },
  data() {
    return {
      status: [
        { name: this.$t("all"), value: "" },
        { name: this.$t("status1"), value: "1" },
        { name: this.$t("status2"), value: "2" },
        { name: this.$t("status5"), value: "5" },
        { name: this.$t("status7"), value: "7" }
      ],
      search: "",
      sotDesc: true,
      statusData: null,
      page: 1,
      pageCount: 0,
      itemsPerPage: 15
      // headers: [
      //   // { value: "select", sortable: false, width: "1%" },
      //   {
      //     text: this.$t("No"),
      //     align: "left",
      //     sortable: false,
      //     value: "sn",
      //     width: "30px"
      //   },
      //   {
      //     text: this.$t("status"),
      //     value: "status",
      //     align: "left",
      //     sortable: false,
      //     width: "100px"
      //   },
      //   {
      //     text: this.$t("startTime"),
      //     align: "left",
      //     sortable: true,
      //     value: "time",
      //     width: "100px"
      //   },
      //   {
      //     text: this.$t("endTime"),
      //     value: "endTime",
      //     align: "left",
      //     sortable: false,
      //     width: "100px"
      //   },
      //   {
      //     text: this.$t("lastTime"),
      //     value: "lastTime",
      //     align: "left",
      //     sortable: false,
      //     width: "100px"
      //   }
      // ]
    };
  },
  methods: {
    getLastTime(actualStartTime, actualEndTime) {
      let lastTime = "";
      const diff = moment.duration(
        actualEndTime.getTime() - actualStartTime.getTime()
      );
      if (diff.months() > 0) {
        return `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.days() > 0) {
        return ` ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.hours() > 0) {
        return ` ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.minutes() > 0) {
        return ` ${diff.minutes()} min ${diff.seconds()} sec`;
      } else if (diff.seconds() > 0) {
        return ` ${diff.seconds()} sec`;
      }
    },
    getStatus(machineStatus) {
      let name = "";
      switch (machineStatus) {
        case "1":
          name = this.$t("status1");
          break;
        case "2":
          name = this.$t("status2");
          break;
        case "5":
          name = this.$t("status5");
          break;
        case "7":
          name = this.$t("status7");
          break;
      }
      return name;
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
        case "1":
          color = "success";
          break;
        case "2":
          color = "error";
          break;
        case "5":
          color = "warning";
          break;
        case "7":
          color = "black";
          break;
      }
      return color;
    },
    redirectToProcess(processId) {
      this.$router.push(`/jobReport`);
    },
    refresh(data) {
      data.sort(function(a, b) {
        return a.time.localeCompare(b.time, "en", {
          numeric: true
        });
      });
    }
  },
  mounted() {
    this.statusData.sort(x => new Date(x.time));

    // this.statusData = this.data;
  },
  computed: {
    headers() {
      return [
        // { value: "select", sortable: false, width: "1%" },
        {
          text: this.$t("No"),
          align: "left",
          sortable: false,
          value: "sn",
          filterable: false,
          width: "30px"
        },
        {
          text: "",
          value: "status",
          align: "left",
          class: "text--white",
          sortable: false,
          width: "1px"
        },
        {
          text: this.$t("status"),
          value: "statusData",
          align: "left",
          filterable: false,

          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("startTime"),
          align: "left",
          sortable: true,
          filterable: false,
          value: "time",
          width: "100px"
        },
        {
          text: this.$t("endTime"),
          value: "endTime",
          align: "left",
          filterable: false,
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("lastTime"),
          value: "lastTime",
          align: "left",
          filterable: false,
          sortable: false,
          width: "100px"
        }
      ];
    }
  },
  watch: {
    machineStatusData() {
      //   console.log(this.data);

      this.statusData = this.machineStatusData;
    }
  },
  created() {
    // console.log(this.data);
    this.statusData = this.machineStatusData;

    // this.statusData = this.data.filter(
    //   x => new Date(x.time) >= new Date(this.dates[0] + " 00:00:00")
    // );
  }
};
</script>
