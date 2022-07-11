<template>
  <v-card>
    <v-card-title class="text-h5 font-weight-bold">
      <v-icon large class="mr-2">
        mdi-account-tie
      </v-icon>
      {{ $t("role") + $t("management") }}
    </v-card-title>
    <v-divider />
    <!-- 新增按鈕 -->

    <!-- 新增角色彈窗 -->
    <v-dialog v-model="addDialog" persistent max-width="600px">
      <v-form ref="addForm" v-model="addValid" lazy-validation>
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              <v-icon left dark class="mb-1">
                mdi-plus-thick
              </v-icon>
              {{ $t("add") }}{{ $t("user") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    :label="'*' + $t('role') + $t('No')"
                    v-model="addRoleForm.roleNo"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                    prepend-icon="mdi-clipboard-account-outline"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    :label="'*' + $t('role') + $t('name')"
                    v-model="addRoleForm.roleName"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    prepend-icon="mdi-counter "
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="addDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="addRole()">
              {{ $t("add") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <!-- 編輯角色彈窗 -->
    <v-dialog v-model="editDialog" persistent max-width="600px">
      <v-form ref="editForm" v-model="editValid" lazy-validation>
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              <v-icon left dark class="mb-1">
                mdi-plus-thick
              </v-icon>
              {{ $t("edit") }}{{ $t("role") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    :label="$t('role') + $t('No')"
                    v-model="editRoleForm.roleNo"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                    disabled
                    prepend-icon="mdi-clipboard-account-outline"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    :label="$t('role') + $t('name')"
                    v-model="editRoleForm.roleName"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                    prepend-icon="mdi-clipboard-account-outline"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editRole()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <!-- 刪除角色彈窗 -->
    <v-dialog v-model="deleteDialog" persistent max-width="300px">
      <v-card ref="form">
        <v-card-title class="info">
          <span class="headline  white--text">
            {{ $t("delete") + $t("role") }}</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            {{ $t("confirm") + $t("delete") + $t("role") }}?
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="gray" @click="deleteDialog = false">{{
            $t("cancel")
          }}</v-btn>

          <v-btn class="info" dark text @click="deleteRole()">
            {{ $t("delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row class="mx-4" justify="space-between">
      <v-col md="4" sm="12">
        <v-row>
          <v-col sm="12" md="9">
            <v-form onSubmit="return false;">
              <v-text-field
                clearable
                v-model="roleSearchValue"
                :label="this.$t('role') + this.$t('search')"
                append-icon="mdi-magnify"
                required
                @click:append="onSearch()"
                @keyup.enter="onSearch()"
                open-all
              ></v-text-field>
            </v-form>
          </v-col>
          <v-col sm="12" md="3">
            <v-btn class=" mt-3" width="100%" @click="addDialog = true">
              <v-icon left dark>
                mdi-plus-thick
              </v-icon>
              {{ $t("add") }}
            </v-btn>
          </v-col>
        </v-row>
        <!-- <v-divider></v-divider> -->
        <v-data-table
          :headers="headers"
          :items="roleList"
          :items-per-page="itemsPerPage"
          :sort-by="['role']"
          :loading="isRoleLoading == 1"
          loading-text="Loading... Please wait"
          class="row-pointer"
          @page-count="pageCount = $event"
          :page.sync="page"
          @click:row="rowClick"
          single-select
        >
          <template v-slot:item.icon="{ item }">
            <v-avatar
              v-if="item.roleNo != 'admin'"
              color="primary white--text text-caption"
              style="max-width: 30px;"
              size="30"
              dark
            >
              <span class="text-truncate" style="max-width: 25px;">
                {{ item.roleName.charAt(0) }}
              </span>
            </v-avatar>
            <v-avatar
              v-if="item.roleNo == 'admin'"
              color="error white--text text-caption"
              style="max-width: 30px;"
              size="30"
              dark
            >
              <span class="text-truncate" style="max-width: 25px;">
                {{ item.roleName.charAt(0) }}
              </span>
            </v-avatar>
          </template>
          <template v-slot:item.action="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  small
                  class="mr-2"
                  @click="showEditRoleDialog(item)"
                  :disabled="item.allowEdit == false"
                >
                  mdi-pencil
                </v-icon>
              </template>
              <span>{{ $t("edit") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  :disabled="item.allowDelete == false"
                  v-bind="attrs"
                  v-on="on"
                  small
                  @click="showDeleteDialog(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
              <span>{{ $t("delete") }}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>

      <v-divider class="ml-2" vertical></v-divider>

      <v-col class=" text-center">
        <div
          v-if="selectedItem.length == 0"
          class="title grey--text text--lighten-1 font-weight-light"
          style="align-self: center;width:100%"
        >
          {{ $t("select") }}{{ $t("role") }}
        </div>
        <div v-else>
          <!-- {{ selectedItem }} -->

          <RoleTable
            :roleData="selectedItem"
            :isLoading="isLoading"
            @update="onSearch"
          />
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",
  data() {
    return {
      customerNo: null,
      version: "standard",
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
      isRoleLoading: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      selectedItem: [],
      isLoading: 0,
      roleList: [],
      active: [],
      productList: {},
      itemList: {},
      roleSearchValue: null,
      avatar: null,
      products: [],
      tabs: null,
      open: [1],
      opItemData: [],
      addRoleForm: {
        roleName: null,
        roleNo: null
      },
      editRoleForm: {
        roleNo: null,
        roleName: null
      },
      headers: [
        {
          text: "",
          value: "icon",
          align: "start",
          sortable: true,
          width: "5%"
        },
        {
          text: this.$t("role") + this.$t("No"),
          value: "roleNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("role") + this.$t("name"),
          value: "roleName",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: "",
          value: "action",
          align: "start",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },
  computed: {
    items() {
      return [
        {
          id: 1,
          name: this.$t("product"),
          children: this.products
        }
      ];
    }
  },
  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "roleManagement") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Role/Search?value=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      roleList: response.data
    };
  },
  methods: {
    deleteRole() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/Role/delete/${this.selectedItem.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
            this.deleteDialog = false;
          } else {
            this.$swal(this.$t("deleteFailed"), res.data.msg, "error");
          }
          this.refreshRoleData();
          this.selectedItem = [];
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    showDeleteDialog(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },
    addRole() {
      if (
        this.addRoleForm.roleName == null ||
        this.addRoleForm.roleName == ""
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      if (this.addRoleForm.roleNo == null || this.addRoleForm.roleNo == "") {
        this.$refs["addForm"].validate();
        return;
      }

      this.alert = false;
      // 加入客製參數
      let param = {};

      const token = this.$store.state.authUser.token;
      const role = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        roleNo: this.addRoleForm.roleNo,
        roleName: this.addRoleForm.roleName,
        allowEdit: true,
        allowDelete: true,
        status: "Y"
      };

      this.$axios
        .post(`/Role/create`, role, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
            this.addDialog = false;
          } else {
            this.$swal("", this.$t("createFailed"), "error");
            this.addDialog = false;
          }
          this.refreshRoleData();
          this.addDialog = false;

          this.addRoleForm.roleName = null;
          this.addRoleForm.roleNo = null;
        })
        .then(() => {});
    },
    editRole() {
      if (
        this.editRoleForm.roleName == null ||
        this.editRoleForm.roleName == ""
      ) {
        this.$refs["editForm"].validate();
        return;
      }
      if (this.editRoleForm.roleNo == null || this.editRoleForm.roleNo == "") {
        this.$refs["editForm"].validate();
        return;
      }

      // 加入客製參數
      let param = {};

      this.alert = false;

      const token = this.$store.state.authUser.token;
      let role = this.selectedItem;
      role.roleNo = this.editRoleForm.roleNo;
      role.roleName = this.editRoleForm.roleName;

      this.$axios
        .post(`/Role/Update`, role, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
            if (this.selectedRow != undefined) {
              this.selectedRow.select(false);
            }
            this.selectedItem = [];
            this.refreshRoleData();
            this.editDialog = false;
          } else {
            this.$swal("", this.$t("editFailed"), "error");
            this.editDialog = false;
          }
          // this.refreshItemData();
          this.editDialog = false;
        })
        .then(() => {});
    },
    showEditRoleDialog(item) {
      //console.log(item);
      this.selectedItem = item;
      this.editDialog = true;
      this.editRoleForm.roleNo = item.roleNo;
      this.editRoleForm.roleName = item.roleName;
    },
    rowClick: function(item, row) {
      this.selectedRow = row;
      row.select(true);
      this.isLoading = 1;
      if (this.selectedItem == item) {
        this.isLoading = 0;
      }
      this.selectedItem = item;
      this.refreshRoleData();
    },
    onSearch() {
      if (this.selectedRow != undefined) {
        this.selectedRow.select(false);
      }
      this.selectedItem = [];
      this.refreshRoleData();
      this.active = [];
    },
    refreshRoleData() {
      this.isRoleLoading = 1;
      // Remove in 6 months and say
      // you've made optimizations! :)
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Role/Search?value=${this.roleSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          // this.items = res.data.data != null ? res.data.data : [];
          this.roleList = res.data.data;

          this.isRoleLoading = 0;
        });
    }
  },

  mounted() {
    this.version = setting.version;
    this.customerNo = setting.customerNo;
    // console.log("userMounted");
    //this.refreshUserData();
  },

  head() {
    return {
      title: this.$t("role") + this.$t("management")
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
