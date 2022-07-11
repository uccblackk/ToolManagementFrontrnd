<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 訊息彈窗 -->
      <v-dialog
        v-model="messageDialog"
        width="500"
        @click:outside="updateData()"
      >
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            <v-icon class="mr-3">mdi-email-outline</v-icon>
            {{ messageForm.informDate }}
          </v-card-title>

          <v-card-text class="text-h6">
            <v-row>
              <v-col cols="12">
                {{ $t("type") + "：" + messageForm.type }}
              </v-col>
              <v-col cols="12">
                {{ $t("maintenanceContent") + "：" + messageForm.content }}
              </v-col>
              <v-col cols="12">
                {{
                  $t("expected") +
                    $t("execute") +
                    $t("time") +
                    "：" +
                    messageForm.planEndDate
                }}
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="updateData()">
              {{ $t("close") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除訊息彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="error">
            <span class="headline  white--text">
              <v-icon color="white" class="mb-2">mdi-delete</v-icon>
              {{ $t("delete") + $t("message") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container class="text-h6">
              {{ $t("confirm") + $t("delete") + $t("message") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="error" dark text @click="deleteMessage()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="messageList"
        :items-per-page="itemsPerPage"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        :sort-by="['ActionNo']"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
        @click:row="rowClick"
      >
        <template v-slot:item.type="{ item }">
          {{ $t(item.type.toLowerCase()) }}
        </template>
        <template v-slot:item.planEndDate="{ item }">
          {{ new Date(item.planEndDate).toLocaleString() }}
        </template>
        <template v-slot:item.informDate="{ item }">
          {{ new Date(item.informDate).toLocaleString() }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-icon v-if="item.status == 'N'" color="primary"> mdi-circle</v-icon>
        </template>
        <template v-slot:item.delete="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                small
                @click="showDeleteDialog(item)"
                v-bind="attrs"
                v-on="on"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>{{ $t("delete") }}</span>
          </v-tooltip>
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
import moment from "moment";
export default {
  props: {
    messageData: {},
    isLoading: null
  },
  data() {
    return {
      messageForm: {
        informDate: null,
        content: null,
        planEndDate: null,
        type: null
      },
      messageDialog: false,
      loading: 0,
      messageList: [],
      ActionSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      ActionName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      selectedRow: null,
      selectedItem: [],
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editActionForm: {
        id: null,
        no: null,
        name: null,
        spec: null,
        desc: null,
        qty: null
      },
      deleteActionData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: this.$t("type"),
          value: "type",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("content"),
          value: "content",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("equipment") + this.$t("name"),
          value: "machineData.name",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("expected") + this.$t("execute") + this.$t("time"),
          value: "planEndDate",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("inform") + this.$t("time"),
          value: "informDate",
          align: "start",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("delete"),
          value: "delete",
          align: "start",
          sortable: false,
          width: "10%"
        },
        {
          text: "",
          value: "status",
          align: "right",
          sortable: true,
          width: "5%"
        }
      ]
    };
  },
  watch: {
    messageData() {
      // console.log(this.actionData);
      this.messageList = this.messageData;
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  methods: {
    rowClick: function(item, row) {
      if (this.deleteDialog == true) {
        return;
      }
      this.messageDialog = true;
      this.messageForm.informDate = new Date(item.informDate).toLocaleString();
      this.messageForm.content = item.content;
      this.messageForm.type = this.$t(item.type.toLowerCase());
      this.messageForm.planEndDate = new Date(
        item.planEndDate
      ).toLocaleString();
      this.selectedRow = row;
      row.select(true);
      // this.loading = 1;
      if (this.selectedItem == item) {
        this.loading = 0;
      }
      this.selectedItem = item;
      // window.location.reload();
      // this.refreshUserData();
    },

    updateData() {
      this.messageDialog = false;
      //console.log("update");
      //若狀態為已讀,則不post
      if (this.selectedItem.status == "Y") {
        return;
      }
      const token = this.$store.state.authUser.token;
      const message = {
        id: this.selectedItem.id,
        machineId: this.selectedItem.machineId,
        type: this.selectedItem.type,
        informDate: this.selectedItem.informDate,
        planEndDate: this.selectedItem.planEndDate,
        userId: this.selectedItem.userId,
        content: this.selectedItem.content,
        status: "Y",
        sourceId: this.selectedItem.sourceId,
        remark: this.selectedItem.Remark
      };

      this.$axios
        .post(`/Message/update`, message, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.$emit("update");
        });
    },
    deleteMessage() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .delete(`/Message/delete/${this.selectedItem.id}`, {
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
          //this.refreshActionData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    showDeleteDialog(item) {
      this.messageDialog = false;
      this.deleteDialog = true;
      this.selectedItem = item;
    }
  },
  mounted() {
    this.messageList = this.messageData;
  },
  computed: {},
  created() {
    this.messageList = this.messageData;
  }
};
</script>
<style>
.selected {
  background-color: red;
}
</style>
