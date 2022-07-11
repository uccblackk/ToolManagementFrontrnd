<template>
  <v-card>
    <v-card-title class="text-h5 font-weight-bold">
      <v-icon large class="mr-2">
        mdi-home-lightning-bolt
      </v-icon>
      {{ $t("power") + $t("monitoring") }}
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row>
        <div style="width: 100%; height: auto">
          <div
            id="powerMonitoringChart"
            style="width:100%; height: 600px"
            ref="powerMonitoringChart"
          ></div>
        </div>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import moment from "moment";

export default {
  middleware: "auth",
  data() {
    return {
      searchValue: null,
      startDate: null,
      endDate: null,
      dates: [],
      min: null,
      menu: false,
      dateRangeText: null,
      messageData: [],
      deleteDialog: false,
      alert: false,
      addValid: true,
      emailRules: [v => /.+@.+/.test(v) || "Invalid Email address"],
      editValid: true,
      show1: false,
      show2: false,
      editDialog: false,
      addDialog: false,
      selectedRow: null,
      isUserLoading: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      selectedItem: [],
      isLoading: 0,
      userList: [],
      active: [],
      productList: {},
      itemList: {},
      userSearchValue: null,
      avatar: null,
      products: [],
      tabs: null,
      open: [1],
      opItemData: [],
      dataPoints: [],
      chart: null,
      timerId: null,
      count: 0
    };
  },
  computed: {},

  methods: {
    GetRandomInt(max) {
      return Math.floor(Math.random() * max);
    },
    updateData() {
      //this.count++;
      if (this.dataPoints.length == 10) {
        this.dataPoints.shift();
      }
      this.dataPoints.push({
        x: moment().toDate(),
        y: this.GetRandomInt(0)
      });
      this.renderChart();
      this.timerId = setTimeout(this.updateData, 1000);
    },
    renderChart() {
      //var dataPoints = [];
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      if (this.chart == null) {
        this.chart = new CanvasJS.Chart("powerMonitoringChart", {
          theme: "light2",
          axisX: {
            minimum: moment()
              .add(-10, "seconds")
              .toDate(),
            maximum: moment().toDate(),
            interval: 1,
            valueFormatString: "HH:mm:ss",
            intervalType: "second",
            labelFontSize: 12
          },
          axisY: {
            suffix: " Kw"
          },
          data: [
            {
              type: "line",
              dataPoints: this.dataPoints
            }
          ]
        });
      } else {
        this.chart.options.data[0].dataPoints = this.dataPoints;
        this.chart.options.axisX.maximum = moment().toDate();
        this.chart.options.axisX.minimum = moment()
          .add(-10, "seconds")
          .toDate();
      }
      this.chart.render();
    }
  },
  mounted() {
    this.updateData();
  },
  head() {
    return {
      title: this.$t("power") + this.$t("monitoring")
    };
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 5px;
  position: relative;
  max-height: 100%;
}
table.v-table tbody td {
  height: 40px;
  border: none;
}
.theme--light.v-table tbody tr:not(:last-child) {
  border: none;
}
.row-pointer:hover {
  cursor: pointer;
}
// table {
//   border-collapse: collapse;
// } // remove border
// table td,
// table th {
//   height: 40px; //change the height
// }
@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
