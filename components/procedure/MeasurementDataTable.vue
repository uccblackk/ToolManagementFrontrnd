<template>
  <v-layout row wrap style="width: 100%">
    <v-flex md12 class="px-2">
      <v-form>
        <v-container fluid>
          <v-row class="justify-center">
            <v-col cols="12" md="8">
              <v-combobox
                v-model="currentNumber"
                :items="number"
                :label="$t('item')"
                outlined
                dense
                append-icon="mdi-magnify"
                @click:append="onSearch"
              ></v-combobox>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex md12 class="pa-2 mt-n5">
      <v-data-table
        :headers="headers"
        :items="searchResult"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            v-if="getStatus(item) == 'qualified'"
            class="ma-2"
            color="success"
            >&nbsp;&nbsp;&nbsp;</v-chip
          >
          <v-chip
            v-else-if="getStatus(item) == 'critial'"
            class="ma-2"
            color="info"
            >&nbsp;&nbsp;&nbsp;</v-chip
          >
          <v-chip v-else class="ma-2" color="error">&nbsp;&nbsp;&nbsp;</v-chip>
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
export default {
  props: {
    memsurementData: {}
  },
  data() {
    return {
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
          align: "start",
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
    onSearch() {
      this.searchResult = this.memsurement;
      const currentNumber = this.currentNumber;
      if (this.searchResult.length > 0) {
        this.searchResult = this.searchResult.filter(item => {
          return item.number == currentNumber;
        });
      }
    },
    getStatus(data) {
      let status;
      if (
        data.value < data.standardValue + data.upperTolerance &&
        data.value > data.standardValue + data.lowerTolerance
      ) {
        status = "qualified";
      } else if (
        data.value == data.standardValue + data.upperTolerance ||
        data.value == data.standardValue + data.lowerTolerance
      ) {
        status = "critical";
      } else {
        status = "unqualified";
      }
      return status;
    }
  },
  mounted() {},
  created() {
    this.memsurement = this.memsurementData;
    this.number = [];
    for (let i = 0; i < this.memsurement.length; i++) {
      if (this.number.indexOf(this.memsurement[i].number) == -1) {
        this.number.push(this.memsurement[i].number);
      }
    }
    this.currentNumber = this.number[0];
    this.onSearch();
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
