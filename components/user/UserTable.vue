<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n2">
      <v-row>
        <v-col style="text-align:left" md="1" sm="12">
          <v-avatar
            v-if="userData.role != 'admin'"
            color="primary white--text text-h7"
            style="max-width: 40px;"
            size="40"
            class="elevation-3"
            dark
          >
            <span class="text-truncate" style="max-width: 35px;">
              {{ userData.name.charAt(0) }}
            </span>
          </v-avatar>
          <v-avatar
            v-if="userData.role == 'admin'"
            color="error white--text text-h7"
            style="max-width: 40px;"
            size="40"
            class="elevation-3"
            dark
          >
            <span class="text-truncate" style="max-width: 35px;">
              {{ userData.name.charAt(0) }}
            </span>
          </v-avatar>
        </v-col>
        <v-col style="text-align:right" md="11" sm="12">
          <v-btn
            @click="update()"
            class=" primary"
            :disabled="userData.role != null"
          >
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
                    :items="getSubLink(item)"
                    :sort-by="['sequence']"
                    class="elevation-1"
                    item-key="text"
                    :show-select="userData.role == null"
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
    userData: {},
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
    userData() {
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
    getSubLink(item) {
      let data = item.sublinks;
      console.log(item);
      console.log(this.selected);
      if (this.userData.role != null) {
        data = this.selected.filter(x => x.menu_root == item.menuNo);
      }
      return data;
    },
    refreshMenuData() {
      this.child = [];
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
          //console.log(this.userData);
          this.selected = [];
          if (this.userData.authority != null) {
            for (let i = 0; i < this.menuList.length; i++) {
              this.userData.authority.forEach(element => {
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
      const user = {
        id: this.userData.id,
        customerId: this.userData.customerId,
        compNo: this.userData.compNo,
        siteNo: this.userData.siteNo,
        name: this.userData.name,
        account: this.userData.account,
        title: this.userData.title,
        employeeId: this.userData.employeeId,
        password: this.userData.password,
        email: this.userData.email,
        authority: this.selected,
        notice: this.userData.notice,
        role: this.userData.role,
        setting: this.userData.setting,
        status: this.userData.status
      };
      //console.log(this.selected);

      this.$axios
        .post(`/User/update`, user, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              this.$t("save") + this.$t("success"),
              "請重新登入確認權限是否更新。",
              "success"
            );

            //this.refreshMenuData();
          } else {
            this.$swal("", this.$t("save") + this.$t("failed"), "error");
          }
        })
        .then(() => {});
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      //console.log(item);
      this.deleteAreaData.no = item.areaNo;
      this.deleteAreaData.name = item.areaName;
      this.deleteAreaData.id = item.id;
    }
  },
  mounted() {
    this.version = setting.version;
    // this.refreshMenuData();
  },
  computed: {
    getItems() {
      return this.desserts.map(x => ({
        ...x,
        isSelectable: x.calories <= 250
      }));
    }
  },
  created() {
    this.refreshMenuData();
  }
};
</script>
