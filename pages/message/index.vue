<template>
  <v-card>
    <v-card-title class="text-h5 font-weight-bold">
      <v-icon large class="mr-2">
        mdi-bell-ring-outline
      </v-icon>
      {{ $t("inform") + $t("message") }}
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                @click:clear="onClearClicked()"
                v-model="dateRangeText"
                :label="$t('select') + $t('date') + $t('range')"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              >
              </v-text-field>
            </template>
            <v-date-picker
              :events="arrayEvents"
              ref="picker"
              v-model="dates"
              :min="min"
              range
            >
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="onCalendarSelected()">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <!-- <v-col cols="12" md="3">
              <v-select
                v-model="statusCheckedList"
                :items="statusLabel"
                item-text="name"
                item-value="value"
                :label="this.$t('jobNo') + this.$t('status')"
                multiple
                clearable
              ></v-select>
            </v-col> -->
        <v-col cols="12" md="3">
          <v-form onSubmit="return false;">
            <v-text-field
              clearable
              v-model="searchValue"
              :label="this.$t('search')"
              append-icon="mdi-magnify"
              required
              @click:append="onSearch()"
              @keyup.enter="onSearch()"
            ></v-text-field>
          </v-form>
        </v-col>
        <v-spacer />
        <v-col cols="12" md="3">
          <v-radio-group v-model="statusValue" row>
            <v-radio :label="this.$t('all')" value="all"></v-radio>
            <v-radio
              :label="this.$t('already') + this.$t('read')"
              color="green"
              value="Y"
            ></v-radio>
            <v-radio
              :label="this.$t('notyet') + this.$t('read')"
              color="red"
              value="N"
            ></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row>
        <MessageTable
          :messageData="messageData"
          :isLoading="isLoading"
          @update="onSearch"
        />
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",
  data() {
    return {
      statusValue: "all",
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
      arrayEvents: []
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
    let date = new Date().toISOString().substr(0, 10);
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substr(0, 10);
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substr(0, 10);
    let response = await app.$axios.$get(
      `/Message/Search?userId=${store.state.authUser.id}&startDate=${firstday}&endDate=${lastday}`,
      {
        headers: {
          Authorization: token
        }
      }
    );

    return {
      messageData: response.data
    };
  },
  methods: {
    getTotalMsgData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Message/SearchCount`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.arrayEvents = [];
          if (res.data.data != undefined) {
            //console.log(res.data.data);
            this.arrayEvents = res.data.data;
          }
        })
        .then(() => {});
    },
    onSearch() {
      //console.log(this.statusCheckedList);
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/Message/Search?userId=${this.$store.state.authUser.id}&value=${this.searchValue}&startDate=${this.startDate}&endDate=${this.endDate}&status=${this.statusValue}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.messageData = res.data.data != null ? res.data.data : [];
          //console.log(this.messageData);
          this.isLoading = 0;
        });
    },
    onClearClicked() {
      this.startDate = null;
      this.endDate = null;
      this.dates = [];
    },
    onCalendarSelected() {
      if (this.dates.length > 1) {
        if (this.dates[0] <= this.dates[1]) {
          this.startDate = this.dates[0];
          this.endDate = this.dates[1];
        } else {
          this.startDate = this.dates[1];
          this.endDate = this.dates[0];
        }
        this.dateRangeText = this.startDate + " ~ " + this.endDate;
      }
      this.min = null;
      this.menu = false;
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
        role: "user",
        authoity: null,
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
      let role = "user";
      if (this.selectedItem.role == "admin") {
        role = "admin";
      }

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
        authority: null,
        notice: null,
        role: role,

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
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    );
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    );
    this.dates.push(firstday.toISOString().substr(0, 10));
    this.dates.push(lastday.toISOString().substr(0, 10));

    if (this.dates.length > 1) {
      if (this.dates[0] <= this.dates[1]) {
        this.startDate = this.dates[0];
        this.endDate = this.dates[1];
      } else {
        this.startDate = this.dates[1];
        this.endDate = this.dates[0];
      }
      this.dateRangeText = this.startDate + " ~ " + this.endDate;
    }
    this.min = null;
    this.menu = false;
    this.getTotalMsgData();
  },
  head() {
    return {
      title: this.$t("inform") + this.$t("message")
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
