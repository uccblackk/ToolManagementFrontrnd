<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n2">
      <v-row>
        <v-col style="text-align:left" md="1" sm="12">
          <v-avatar
            color="primary white--text text-h7"
            style="max-width: 40px;"
            size="40"
            class="elevation-3"
            dark
          >
            <span class="text-truncate" style="max-width: 35px;">
              {{ roleData.roleName.charAt(0) }}
            </span>
          </v-avatar>
        </v-col>
        <v-col style="text-align:right" md="11" sm="12">
          <v-btn @click="update()" class=" primary">
            {{ $t("save") + $t("setting") }}
          </v-btn>
        </v-col>

        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="menuList"
            :items-per-page="itemsPerPage"
            :sort-by="['sequence']"
            :loading="loading == 1"
            loading-text="Loading... Please wait"
            class="elevation-1"
            @page-count="pageCount = $event"
            :page.sync="page"
            @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
            show-expand
            hide-default-footer
            single-expand
          >
            <template v-slot:item.name="{ item }">
              <v-icon class="ml-2">
                {{ item.icon }}
              </v-icon>
              {{ $t(item.text) }}
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                <div class="mt-2 mb-2">
                  <v-data-table
                    v-model="selected"
                    :headers="subHeaders"
                    :items-per-page="-1"
                    :items="item.sublinks"
                    :sort-by="['sequence']"
                    class="elevation-1"
                    item-key="text"
                    :show-select="roleData.role != 'admin'"
                    :single-select="roleData.role == 'admin'"
                  >
                    <template v-slot:item.name="{ item }">
                      <v-icon class="ml-2">
                        {{ item.icon }}
                      </v-icon>
                      {{ $t(item.text) }}
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
        </v-col>
      </v-row>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    roleData: {},
    isLoading: null
  },
  data() {
    return {
      disabledCount: 0,
      selected: [],
      loading: 1,
      singleSelect: false,
      menuList: [],
      areaSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      areaName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,

      pageCount: 0,
      itemsPerPage: 15,
      editAreaForm: {
        no: null,
        name: null
      },
      deleteAreaData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: this.$t("name"),
          value: "name",
          align: "left",
          sortable: true,
          width: "10%"
        },
        {
          text: "",
          value: "data-table-expand",
          align: "right",
          sortable: false,
          width: "5%"
        }
      ],
      subHeaders: [
        {
          text: this.$t("name"),
          value: "name",
          align: "left",
          sortable: true
        }
      ]
    };
  },
  watch: {
    roleData() {
      this.loading = this.isLoading;

      this.refreshMenuData();
    },
    selected() {
      // console.log(this.selected);
    }
  },

  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    let response = await app.$axios.$get(`/Menu/Search?value=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      menuList: response.data
    };
  },
  methods: {
    refreshMenuData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Menu/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.menuList = res.data.data != null ? res.data.data : [];
          //console.log(this.roleData);
          this.selected = [];
          if (this.roleData.authority != null) {
            for (let i = 0; i < this.menuList.length; i++) {
              this.roleData.authority.forEach(element => {
                if (
                  this.menuList[i].sublinks.find(
                    x => x.menu_no == element.menu_no
                  ) != undefined
                ) {
                  this.selected.push(
                    this.menuList[i].sublinks.find(
                      x => x.menu_no == element.menu_no
                    )
                  );
                  //   console.log(this.selected);
                }
              });
            }
          }

          //    console.log(this.menuList.length);
          // this.selected = this.menuList[0].sublinks.filter(
          //   x => x.menu_no == "area"
          // );
          // console.log(this.menuList);
          this.loading = 0;
        });
    },
    update() {
      const token = this.$store.state.authUser.token;
      let role = this.roleData;
      this.roleData.authority = this.selected;

      this.$axios
        .post(`/Role/update`, role, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("save") + this.$t("success"), "", "success");

            //this.refreshMenuData();
          } else {
            this.$swal("", this.$t("save") + this.$t("failed"), "error");
          }
          this.$emit("update");
        })
        .then(() => {});
    }
  },
  mounted() {
    this.version = setting.version;
    // this.refreshMenuData();
  },
  computed: {},
  created() {
    this.refreshMenuData();
  }
};
</script>
