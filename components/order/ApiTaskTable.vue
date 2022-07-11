<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 ">
      <!-- 訊息彈窗 -->
      <v-dialog
        v-model="messageDialog"
        width="1000"
        @click:outside="closeDilog()"
      >
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            <v-icon class="mr-3">mdi-file-document-outline</v-icon>
            {{ $t("data") }}
          </v-card-title>

          <v-card-text class="text-h7">
            <v-row>
              <v-col cols="12">
                {{ selectedItem.data }}
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeDilog()">
              {{ $t("close") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- loading視窗 -->
      <v-dialog v-model="loadingDialog" hide-overlay persistent width="300">
        <v-card color="success" dark>
          <v-card-text>
            {{ "processing..." }}
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-row>
        <v-col sm="12" md="10">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-col>

        <v-col style="text-align:right;margin-top:10px" sm="12" md="1">
          <v-btn
            :disabled="selected.length == 0"
            width="100%"
            class="primary"
            @click="publish()"
            >{{ $t("publish") }}</v-btn
          >
        </v-col>
        <v-col style="text-align:right;margin-top:10px" sm="12" md="1">
          <v-btn class="mx-2" text dark color="primary" @click="update()">
            <v-icon dark>
              mdi-refresh
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            show-select
            v-model="selected"
            :search="search"
            :headers="headers"
            :items="apiTaskData"
            :items-per-page="itemsPerPage"
            :sort-by="['expireAt']"
            :sort-desc="[true]"
            multi-sort
            class="elevation-1"
            @page-count="pageCount = $event"
            :page.sync="page"
            :loading="loading == 1"
            loading-text="Loading... Please wait"
            hide-default-footer
            @click:row="rowClick"
          >
            <template #item.data="{ value }">
              <div class="text-truncate" style="max-width: 600px">
                {{ value }}
              </div>
            </template>
            <template #item.expireAt="{ value }">
              {{ new Date(value).toLocaleString() }}
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
      <v-snackbar :timeout="timeout" v-model="snackbar">
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
      <v-overlay :value="overlay"> </v-overlay>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
import dayjs from "dayjs";
const setting = require(`@/static/setting/setting.json`);
export default {
  components: {},
  props: {
    apiTaskData: [],
    isLoading: 0
  },
  data() {
    return {
      data: [],
      timeout: 2000,
      overlay: false,
      loadingDialog: false,
      snackbar: false,
      snackbarText: null,
      selected: [],
      search: "",
      messageDialog: false,
      selectedItem: {},
      loading: 0,
      opResourceType: [
        { name: this.$t("equipment"), value: "E" },
        { name: this.$t("line"), value: "L" }
      ],
      selectedOpResourceType: { name: null, value: null },
      ResourceList: [],
      Resource: [],
      machineData: [],
      updateMachineData: [],
      updateLineData: [],
      lineData: [],
      machineList: [],
      lineList: [],
      workShiftData: [],
      workShiftList: {},
      Valid: true,
      dispatchDates: new Date().toISOString().substr(0, 10),
      dispatchMenu: false,
      dispatchDate: null,
      dispatchDialog: false,
      editDialog: false,
      selectedLotOp: {},
      selectedLotWip: {},
      page: 1,
      cancelDispatchDialog: false,
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        {
          text: this.$t("target"),
          value: "target",
          align: "start",
          sortable: true,
          width: "5%"
        },
        {
          text: this.$t("type"),
          value: "type",
          align: "start",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("address"),
          value: "address",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("data"),
          value: "data",
          sortable: false,

          width: "100px"
        },

        {
          text: this.$t("status"),
          value: "status",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("expire"),
          value: "expireAt",
          sortable: false,
          width: "15%"
        }
      ]
    };
  },

  methods: {
    publish() {
      this.overlay = true;
      this.loadingDialog = true;
      const token = this.$store.state.authUser.token;

      this.$axios
        .post(`/ApiTask/DoCallingApiTask`, this.selected, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.loading = false;
          this.snackbar = true;
          if (res.data.isSuccess) {
            this.snackbarText = res.data.msg;
          } else {
            this.snackbarText = this.$t("update") + this.$t("failed");
          }
          this.overlay = false;
          this.loadingDialog = false;
          this.$emit("update");
          this.selected = [];
        })
        .catch(({ response }) => {
          this.snackbar = true;
          this.snackbarText = this.$t("update") + this.$t("failed");
          this.overlay = false;
          this.loadingDialog = false;
          this.$emit("update");
          this.selected = [];
        });
    },
    rowClick: function(item, row) {
      this.messageDialog = true;

      this.selectedItem = item;
    },
    closeDilog() {
      this.messageDialog = false;
    },
    update() {
      this.$emit("update");
    }
  },
  watch: {
    isLoading() {
      this.loading = this.isLoading;
    },
    apiTaskData() {
      //  this.data = this.apiTaskData.slice();
      //console.log(this.apiTaskData);
      //   this.data = this.data.find(x => x.status == "N");
    }
  },

  created() {},
  mounted() {},
  computed: {}
};
</script>
<style lang="scss" scoped></style>
