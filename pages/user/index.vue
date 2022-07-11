<template>
  <v-card>
    <v-card-title class="text-h5 font-weight-bold">
      <v-icon large class="mr-2">
        mdi-account-details
      </v-icon>
      {{ $t("userManagement") }}
    </v-card-title>
    <v-divider />
    <!-- 角色彈窗 -->
    <v-dialog v-model="roleDialog" persistent max-width="800px">
      <v-card ref="form">
        <v-card-title class="info">
          <span class=" headline white--text"
            ><v-icon color="white">mdi-plus</v-icon> {{ $t("select")
            }}{{ $t("role") }}</span
          >
        </v-card-title>
        <v-form ref="roleForm" lazy-validation>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-data-table
                    dense
                    :headers="roleHeaders"
                    :items="roleList"
                    :items-per-page="itemsPerPage"
                    :loading="isRoleLoading == 1"
                    loading-text="Loading... Please wait"
                    class="elevation-1"
                    @click:row="onRoleRowClick"
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
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-form>
        <v-divider />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="gray" @click="roleDialog = false">{{
            $t("cancel")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增人員彈窗 -->
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
                    :label="'*' + $t('user') + $t('name')"
                    v-model="addUserForm.name"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                    prepend-icon="mdi-clipboard-account-outline"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    @click="onRoleTextfieldClick()"
                    :label="$t('role')"
                    readonly
                    v-model="addUserForm.roleName"
                    prepend-icon="mdi-account-tie"
                    clearable
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    :label="$t('employeeId')"
                    v-model="addUserForm.employeeId"
                    prepend-icon="mdi-counter "
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    :label="$t('jobTitle')"
                    v-model="addUserForm.title"
                    prepend-icon="mdi-account-box-outline"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    :label="'*' + $t('email')"
                    v-model="addUserForm.email"
                    :rules="emailRules"
                    prepend-icon="mdi-email-outline"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    ref="account"
                    :label="'*' + $t('account')"
                    v-model="addUserForm.account"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    prepend-icon="mdi-account-circle"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show1 = !show1"
                    :type="show1 ? 'text' : 'password'"
                    class="input-group--focused"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    autocomplete="false"
                    counter
                    ref="password"
                    :label="'*' + $t('password')"
                    v-model="addUserForm.password"
                    prepend-icon="mdi-key"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    autocomplete="false"
                    ref="password"
                    :label="'*' + $t('repeat') + $t('input') + $t('password')"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show2 = !show2"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    counter
                    :type="show2 ? 'text' : 'password'"
                    class="input-group--focused"
                    v-model="addUserForm.repeatPassword"
                    prepend-icon="mdi-key"
                    required
                  ></v-text-field>
                </v-col>
                <v-alert
                  width="100%"
                  :value="alert"
                  color="pink"
                  dark
                  border="top"
                  type="error"
                  transition="scale-transition"
                >
                  {{ $t("password") + $t("input") + $t("error") }}
                </v-alert>
              </v-row>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="addDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="addUser()">
              {{ $t("add") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <!-- 編輯人員彈窗 -->
    <v-dialog v-model="editDialog" persistent max-width="600px">
      <v-form ref="editForm" v-model="editValid" lazy-validation>
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              <v-icon left dark class="mb-1">
                mdi-plus-thick
              </v-icon>
              {{ $t("edit") }}{{ $t("user") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    :label="$t('user') + $t('name')"
                    v-model="editUserForm.name"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    required
                    prepend-icon="mdi-clipboard-account-outline"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    @click="onRoleTextfieldClick()"
                    :label="$t('role')"
                    v-model="editUserForm.roleName"
                    @click:clear="callItBack()"
                    clearable
                    readonly
                    required
                    prepend-icon="mdi-account-tie"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    :label="$t('employeeId')"
                    v-model="editUserForm.employeeId"
                    prepend-icon="mdi-counter "
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    :label="$t('jobTitle')"
                    v-model="editUserForm.title"
                    prepend-icon="mdi-account-box-outline"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    :label="$t('email')"
                    v-model="editUserForm.email"
                    :rules="emailRules"
                    prepend-icon="mdi-email-outline"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    ref="account"
                    :label="$t('account')"
                    v-model="editUserForm.account"
                    disabled
                    :rules="[v => !!v || this.$t('mustInput')]"
                    prepend-icon="mdi-account-circle"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show1 = !show1"
                    :type="show1 ? 'text' : 'password'"
                    class="input-group--focused"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    autocomplete="false"
                    counter
                    ref="password"
                    :label="$t('password')"
                    v-model="editUserForm.password"
                    prepend-icon="mdi-key"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    autocomplete="false"
                    ref="password"
                    :label="$t('repeat') + $t('input') + $t('password')"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show2 = !show2"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    counter
                    :type="show2 ? 'text' : 'password'"
                    class="input-group--focused"
                    v-model="editUserForm.repeatPassword"
                    prepend-icon="mdi-key"
                    required
                  ></v-text-field>
                </v-col>
                <v-alert
                  width="100%"
                  :value="alert"
                  color="pink"
                  dark
                  border="top"
                  type="error"
                  transition="scale-transition"
                >
                  {{ $t("password") + $t("input") + $t("error") }}
                </v-alert>
              </v-row>
            </v-container>
            <small>*{{ $t("inputRequired") }}</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editUser()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <!-- 刪除人員彈窗 -->
    <v-dialog v-model="deleteDialog" persistent max-width="300px">
      <v-card ref="form">
        <v-card-title class="info">
          <span class="headline  white--text">
            {{ $t("delete") + $t("user") }}</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            {{ $t("confirm") + $t("delete") + $t("user") }}?
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="gray" @click="deleteDialog = false">{{
            $t("cancel")
          }}</v-btn>

          <v-btn class="info" dark text @click="deleteUser()">
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
                v-model="userSearchValue"
                :label="this.$t('user') + this.$t('search')"
                append-icon="mdi-magnify"
                required
                @click:append="onSearch()"
                @keyup.enter="onSearch()"
                open-all
              ></v-text-field>
            </v-form>
          </v-col>
          <v-col sm="12" md="3">
            <v-btn class=" mt-3" width="100%" @click="showAddDialog()">
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
          :items="userList"
          :items-per-page="itemsPerPage"
          :sort-by="['role']"
          :loading="isUserLoading == 1"
          loading-text="Loading... Please wait"
          class="row-pointer"
          @page-count="pageCount = $event"
          :page.sync="page"
          @click:row="rowClick"
          single-select
        >
          <template v-slot:item.icon="{ item }">
            <v-avatar
              v-if="item.role != 'admin'"
              color="primary white--text text-caption"
              style="max-width: 30px;"
              size="30"
              dark
            >
              <span class="text-truncate" style="max-width: 25px;">
                {{ item.name.charAt(0) }}
              </span>
            </v-avatar>
            <v-avatar
              v-if="item.role == 'admin'"
              color="error white--text text-caption"
              style="max-width: 30px;"
              size="30"
              dark
            >
              <span class="text-truncate" style="max-width: 25px;">
                {{ item.name.charAt(0) }}
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
                  @click="showEditUserDialog(item)"
                  :disabled="item.role == 'admin' && item.account == customerNo"
                >
                  mdi-pencil
                </v-icon>
              </template>
              <span>{{ $t("edit") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  :disabled="item.role == 'admin' && item.account == customerNo"
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
          {{ $t("select") }}{{ $t("user") }}
        </div>
        <div v-else>
          <!-- {{ selectedItem }} -->

          <UserTable :userData="selectedItem" :isLoading="isLoading" />
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
      isRoleLoading: 0,
      roleList: [],
      roleDialog: false,
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
      addUserForm: {
        name: null,
        employeeId: null,
        roleName: null,
        roleNo: null,
        title: null,
        email: null,
        account: null,
        password: null,
        repeatPassword: null,
        organizeGroupDepartment: null,
        department: null,
        force: null,
        rank: null
      },
      editUserForm: {
        name: null,
        employeeId: null,
        roleName: null,
        roleNo: null,
        title: null,
        email: null,
        account: null,
        password: null,
        repeatPassword: null,
        organizeGroupDepartment: null,
        department: null,
        force: null,
        rank: null
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
          text: this.$t("role"),
          value: "role",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("employeeId"),
          value: "employeeId",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("user") + this.$t("name"),
          value: "name",
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
      ],
      roleHeaders: [
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
      store.state.authUser.authority.find(x => x.menu_no == "userManagement") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/User/Search?value=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      userList: response.data
    };
  },
  methods: {
    callItBack() {
      //console.log("call");
      if (this.addDialog) {
        this.addUserForm.roleNo = null;
        this.addUserForm.roleName = null;
      } else if (this.editDialog) {
        this.editUserForm.roleNo = null;
        this.editUserForm.roleName = null;
      }
    },
    showAddDialog() {
      this.addDialog = true;
      this.addUserForm.roleName = null;
      this.addUserForm.roleNo = null;
    },
    onRoleTextfieldClick() {
      this.roleDialog = true;
      this.getRoleList();
    },
    getRoleList() {
      this.isRoleLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Role/Search?value=`, {
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
    },
    onRoleRowClick: function(item, row) {
      if (this.addDialog) {
        this.addUserForm.roleNo = item.roleNo;
        this.addUserForm.roleName = item.roleName + `(${item.roleNo})`;
      } else if (this.editDialog) {
        this.editUserForm.roleNo = item.roleNo;
        this.editUserForm.roleName = item.roleName + `(${item.roleNo})`;
      }

      this.roleDialog = false;
    },
    deleteUser() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/User/delete/${this.selectedItem.id}`, {
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
          this.refreshUserData();
          this.selectedItem = [];
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    showDeleteDialog(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },
    addUser() {
      if (this.addUserForm.name == null || this.addUserForm.name == "") {
        this.$refs["addForm"].validate();
        return;
      }
      if (this.addUserForm.account == null || this.addUserForm.account == "") {
        this.$refs["addForm"].validate();
        return;
      }
      if (
        this.addUserForm.password == null ||
        this.addUserForm.password == ""
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      if (this.addUserForm.password != this.addUserForm.repeatPassword) {
        this.alert = true;
        this.$refs["addForm"].validate();
        return;
      }
      this.alert = false;
      // 加入客製參數
      let param = {};

      const token = this.$store.state.authUser.token;
      const user = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        name: this.addUserForm.name,
        account: this.addUserForm.account,
        title: this.addUserForm.title,
        employeeId: this.addUserForm.employeeId,
        password: this.addUserForm.password,
        email: this.addUserForm.email,
        authority: null,
        notice: null,
        role: this.addUserForm.roleNo,
        authoity: null,
        setting: param,
        status: "Y"
      };

      this.$axios
        .post(`/User/create`, user, {
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
          this.refreshUserData();
          this.addDialog = false;

          this.addUserForm.name = null;
          this.addUserForm.title = null;
          this.addUserForm.employeeId = null;
          this.addUserForm.email = null;
          this.addUserForm.account = null;

          this.addUserForm.password = null;
          this.addUserForm.repeatPassword = null;
        })
        .then(() => {});
    },
    editUser() {
      if (this.editUserForm.name == null || this.editUserForm.name == "") {
        this.$refs["editForm"].validate();
        return;
      }
      if (
        this.editUserForm.account == null ||
        this.editUserForm.account == ""
      ) {
        this.$refs["editForm"].validate();
        return;
      }
      if (
        this.editUserForm.password == null ||
        this.editUserForm.password == ""
      ) {
        this.$refs["editForm"].validate();
        return;
      }
      if (this.editUserForm.password != this.editUserForm.repeatPassword) {
        this.alert = true;
        this.$refs["editForm"].validate();
        return;
      }

      // 加入客製參數
      let param = {};

      this.alert = false;
      const token = this.$store.state.authUser.token;
      const user = {
        id: this.selectedItem.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        name: this.editUserForm.name,
        account: this.editUserForm.account,
        title: this.editUserForm.title,
        employeeId: this.editUserForm.employeeId,
        password: this.editUserForm.password,
        email: this.editUserForm.email,
        authority: this.selectedItem.authority,
        notice: null,
        role: this.editUserForm.roleNo,
        setting: param,
        status: "Y"
      };

      this.$axios
        .post(`/User/update`, user, {
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
            this.refreshUserData();
            this.editDialog = false;
          } else {
            this.$swal("", this.$t("editFailed"), "error");
            this.editDialog = false;
          }
          // this.refreshItemData();
          this.editDialog = false;

          this.editUserForm.name = null;
          this.editUserForm.title = null;
          this.editUserForm.employeeId = null;
          this.editUserForm.email = null;
          this.editUserForm.account = null;
          this.editUserForm.password = null;
          this.editUserForm.repeatPassword = null;
        })
        .then(() => {});
    },
    showEditUserDialog(item) {
      //console.log(item);
      this.selectedItem = item;
      this.editDialog = true;
      this.editUserForm.account = item.account;
      this.editUserForm.title = item.title;
      this.editUserForm.name = item.name;
      this.editUserForm.email = item.eMail;
      this.editUserForm.employeeId = item.employeeId;
      this.editUserForm.password = item.password;
      this.editUserForm.repeatPassword = item.password;
      let roleName = null;
      if (item.role != null) {
        roleName = item.roleName + `(${item.role})`;
      }
      this.editUserForm.roleName = roleName;
      this.editUserForm.roleNo = item.role;
      // 加入客製參數
    },
    rowClick: function(item, row) {
      this.selectedRow = row;
      row.select(true);
      this.isLoading = 1;
      if (this.selectedItem == item) {
        this.isLoading = 0;
      }
      this.selectedItem = item;
      this.refreshUserData();
    },
    onSearch() {
      if (this.selectedRow != undefined) {
        this.selectedRow.select(false);
      }
      this.selectedItem = [];
      this.refreshUserData();
      this.active = [];
    },
    refreshUserData() {
      this.isUserLoading = 1;
      // Remove in 6 months and say
      // you've made optimizations! :)
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/User/Search?value=${this.userSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          // this.items = res.data.data != null ? res.data.data : [];
          this.userList = res.data.data;

          this.isUserLoading = 0;
        });
    }
  },

  mounted() {
    this.version = setting.version;
    this.customerNo = setting.customerNo;
    // console.log("userMounted");
    //this.refreshUserData();
  },
  // beforeRouteLeave(to, from, next) {
  //   const answer = window.confirm("Do you really want to leave?");
  //   if (answer) {
  //     next();
  //   } else {
  //     next(false);
  //   }
  // },
  head() {
    return {
      title: this.$t("userManagement")
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
