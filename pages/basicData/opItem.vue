<template>
  <v-card>
    <v-card-title class="text-h5 font-weight-bold">
      <v-icon large class="mr-2">
        mdi-sitemap
      </v-icon>
      {{ $t("product") }}{{ $t("process") }}
    </v-card-title>
    <v-divider />
    <v-row class="pa-4" justify="space-between">
      <v-col cols="3">
        <div>
          <v-form onSubmit="return false;">
            <v-text-field
              clearable
              v-model="itemSearchValue"
              :label="this.$t('itemSearch')"
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
          :items="products"
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
              mdi-cube-outline
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
          {{ $t("select") }}{{ $t("product") }}
        </div>
        <div
          v-else
          class="title grey--text text--lighten-1 font-weight-light"
          style="align-self: center;width:100%"
        >
          <OpItemTable :data="selectedItem" @update="onSearch" />
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
      productList: {},
      itemList: {},
      itemSearchValue: null,
      avatar: null,
      products: [],
      tabs: null,
      open: [1],
      opItemData: [],
      headers: [
        {
          text: this.$t("product") + this.$t("No"),
          value: "itemNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("product") + this.$t("name"),
          value: "itemName",
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
      store.state.authUser.authority.find(x => x.menu_no == "opItem") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let products = [];
    let response = await app.$axios.get(`/Item/Search?value=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      products: response.data.data
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
      this.refreshPrductData();
      this.selectedItem = [];
      if (this.selectedRow != null) {
        this.selectedRow.select(false);
      }
    },
    refreshPrductData() {
      // Remove in 6 months and say
      // you've made optimizations! :)
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Item/Search?value=${this.itemSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          // this.items = res.data.data != null ? res.data.data : [];
          this.products = res.data.data;
          this.isLoading = 0;
          //this.products = [];
          // res.data.data.forEach(element => {
          //   this.products.push({
          //     name: element.itemName + " (" + element.itemNo + ")",
          //     id: element.id,
          //     no: element.itemNo
          //   });
          //   //console.log(this.products);
          // });
        });
    },
    onSelected() {
      if (!this.active.length) {
        return false;
      }
      const id = this.active[0];
      this.itemList = this.productList.find(item => item.id === id);
      return true;
    }
  },
  mounted() {
    //this.refreshPrductData();
  },
  head() {
    return {
      title: this.$t("productProcess")
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
