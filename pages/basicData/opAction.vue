<template>
  <v-card>
    <v-card-title class="text-h5 font-weight-bold">
      <v-icon large class="mr-2">
        mdi-flag
      </v-icon>
      {{ $t("process") }}{{ $t("produce") }}{{ $t("action") }}
    </v-card-title>
    <v-divider />
    <v-row class="pa-4" justify="space-between">
      <v-col cols="3">
        <div>
          <v-form onSubmit="return false;">
            <v-text-field
              clearable
              v-model="opSearchValue"
              :label="this.$t('process') + this.$t('search')"
              append-icon="mdi-magnify"
              required
              @click:append="onSearch"
              @keyup.enter="onSearch()"
              open-all
            ></v-text-field>
          </v-form>
        </div>
        <!-- <v-divider></v-divider> -->
        <v-data-table
          :headers="headers"
          :items="OpList"
          :items-per-page="itemsPerPage"
          :sort-by="['role']"
          :loading="isLoading == 1"
          loading-text="Loading... Please wait"
          class="row-pointer"
          @page-count="pageCount = $event"
          :page.sync="page"
          @click:row="rowClick"
          single-select
        >
        </v-data-table>
        <!-- <v-treeview
          :active.sync="active"
          :items="items"
          active-class="grey lighten-4 indigo--text"
          open-all
          :open.sync="open"
          activatable
          color="secondary"
          open-on-click
          transition
        >
          <template v-slot:prepend="{ item }">
            <v-icon v-if="!item.children">
              mdi-bolt
            </v-icon>
          </template>
        </v-treeview> -->
      </v-col>

      <v-divider vertical></v-divider>

      <v-col class=" text-center">
        <div
          v-if="selectedItem.length == 0"
          class="title grey--text text--lighten-1 font-weight-light"
          style="align-self: center;width:100%"
        >
          {{ $t("select") }}{{ $t("process") }}
        </div>
        <div
          v-else
          class="title grey--text text--lighten-1 font-weight-light"
          style="align-self: center;width:100%"
        >
          <OpActionTable :opData="selectedItem" @update="onSearch" />
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import moment from "moment";

export default {
  middleware: "auth",
  data() {
    return {
      selectedRow: null,
      selectedItem: [],
      isLoading: 0,
      selectedRow: null,
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      active: [],
      processList: {},
      opData: {},
      opSearchValue: null,
      avatar: null,
      OpList: [],
      tabs: null,
      open: [1],
      opItemData: [],
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
          align: "start",
          sortable: true,
          width: "10%"
        }
      ]
    };
  },
  computed: {},
  async asyncData({ app, store, params, error }) {
    // Remove in 6 months and say
    // you've made optimizations! :)
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "opAction") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }

    let response = await app.$axios.get(`/Op/Search?value=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      OpList: response.data.data
    };
  },
  methods: {
    rowClick: function(item, row) {
      this.selectedRow = row;
      row.select(true);
      //this.isLoading = 1;

      if (this.selectedItem == item) {
        this.selectedRow = null;
        row.select(false);
        this.selectedItem = [];
      } else {
        this.selectedItem = item;
      }
      //console.log(this.selectedItem);
      //this.refreshPrductData();
    },
    onSearch() {
      this.refresOpData();
      this.selectedItem = [];
      if (this.selectedRow != null) {
        this.selectedRow.select(false);
      }
    },
    refresOpData() {
      // Remove in 6 months and say
      // you've made optimizations! :)
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Op/Search?value=${this.opSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.OpList = res.data.data;
          this.isLoading = 0;
        });
    },
    onSelected() {
      if (!this.active.length) {
        return false;
      }
      const id = this.active[0];
      this.opData = this.processList.find(item => item.id === id);
      // console.log(this.opData);
      return true;
    }
  },
  mounted() {
    //this.refresOpData();
  },
  head() {
    return {
      title: this.$t("opAction")
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

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
