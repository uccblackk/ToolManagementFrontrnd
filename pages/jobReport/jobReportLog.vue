<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
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
              ></v-text-field>
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
        <v-col cols="12" md="2">
          <v-select
            v-model="statusCheckedList"
            :items="statusLabel"
            item-text="name"
            item-value="value"
            :label="this.$t('lot') + this.$t('status')"
            multiple
            clearable
          >
            <template v-slot:selection="{ item, index }">
              <v-chip small v-if="index <= 0">
                <span>{{ item.name }}</span>
              </v-chip>
              <span v-if="index === 1" class="grey--text caption">
                (+{{ statusCheckedList.length - 1 }} others)
              </span>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="areaData"
            :items="areaList"
            item-text="areaName"
            return-object
            :label="this.$t('area')"
          >
          </v-select>
        </v-col>
        <v-col cols="12" md="1">
          <v-select
            v-model="type"
            :items="typeList"
            item-text="name"
            item-value="value"
            :label="this.$t('type')"
          >
          </v-select>
        </v-col>
        <v-col cols="12" md="2" v-if="type != null">
          <!-- 設備資料 -->
          <v-select
            v-if="type == `E`"
            v-model="machineData"
            :items="machineList"
            item-text="name"
            return-object
            :label="this.$t('equipment')"
            multiple
            clearable
          >
            <template v-slot:prepend-item>
              <v-list-item ripple @mousedown.prevent @click="toggle">
                <v-list-item-action>
                  <v-icon
                    :color="machineData.length > 0 ? 'indigo darken-4' : ''"
                  >
                    {{ icon }}
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    Select All
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="mt-2"></v-divider>
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip small v-if="index <= 0">
                <span>{{ item.name }}</span>
              </v-chip>
              <span v-if="index === 1" class="grey--text caption">
                (+{{ machineData.length - 1 }} others)
              </span>
            </template>
          </v-select>
          <!-- 生產線資料 -->
          <v-select
            v-if="type == `L`"
            v-model="lineData"
            :items="lineList"
            item-text="lineName"
            return-object
            :label="this.$t('line')"
            multiple
            clearable
          >
            <template v-slot:prepend-item>
              <v-list-item ripple @mousedown.prevent @click="lineToggle">
                <v-list-item-action>
                  <v-icon :color="lineData.length > 0 ? 'indigo darken-4' : ''">
                    {{ icon }}
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    Select All
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="mt-2"></v-divider>
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip small v-if="index <= 0">
                <span>{{ item.lineName }}</span>
              </v-chip>
              <span v-if="index === 1" class="grey--text caption">
                (+{{ lineData.length - 1 }} others)
              </span>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-form onSubmit="return false;">
            <v-text-field
              clearable
              v-model="lotWipSearchValue"
              :label="this.$t('search')"
              append-icon="mdi-magnify"
              required
              @click:append="onSearch()"
              @keyup.enter="onSearch()"
            ></v-text-field>
          </v-form>
        </v-col>
      </v-row>
    </v-flex>
    <v-flex xs12 class="mx-1">
      <JobReportLogTable
        :lotWipData="lotWipList"
        :lotWipSearchValue="lotWipSearchValue"
        :startDate="startDate"
        :endDate="endDate"
        :status="statusCheckedList"
        :isLoading="isLoading"
      />
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
export default {
  middleware: "auth",
  data() {
    return {
      type: null,
      typeList: [
        { name: "*", value: null },
        { name: this.$t("equipment"), value: "E" },
        { name: this.$t("line"), value: "L" }
      ],
      areaList: [],
      areaData: {},
      arrayEvents: [],
      dateRangeText: null,
      machineData: [],
      machineList: [],
      lineData: [],
      lineList: [],
      resourceList: {},
      currentPage: 1,
      perPage: 1,
      isLoading: 0,
      lotWipData: {},
      statusCheckedList: [],
      statusLabel: [
        { name: this.$t("already") + this.$t("dispatch"), value: "dispatch" },
        { name: this.$t("producted"), value: "producted" },
        { name: this.$t("pause"), value: "pause" },
        { name: this.$t("complete"), value: "complete" },
        { name: this.$t("projectClose"), value: "close" }
      ],
      valid: true,
      noRules: [v => !!v || this.$t("mustInput")],
      itemList: [],
      dates: [],
      startDate: null,
      endDate: null,
      min: null,
      menu: false,
      menu2: false,
      lotWipSearchValue: "",
      isLoading: 0,
      formHasErrors: false,
      errorMessages: "",
      SearchValue: "",
      lotWipList: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      defaultSelected: {
        state: "是",
        value: "Y"
      },

      addOpForm: {
        no: null,
        name: null,
        desc: null,
        dispatchOptions: [
          { state: "是", value: "Y" },
          { state: "否", value: "N" }
        ]
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      opData: [],
      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        opNo: this.opNo,
        opName: this.opName
      };
    }
  },
  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "jobReportLog") ==
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
      `LotWip/Search?startDate=${firstday}&endDate=${lastday}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let lotWipList = response.data;

    response = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    let areaList = response.data;
    areaList.unshift({ areaName: "*", areaNo: null });

    return {
      lotWipList: lotWipList,
      areaList: areaList
    };
  },
  methods: {
    toggle() {
      this.$nextTick(() => {
        if (this.likesAllItems) {
          this.machineData = [];
        } else {
          this.machineData = this.machineList.slice();
        }
      });
    },
    lineToggle() {
      this.$nextTick(() => {
        if (this.lineAllItems) {
          this.lineData = [];
        } else {
          this.lineData = this.lineList.slice();
        }
      });
    },
    getTotalLotWipData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/LotWip/SearchAreaLotWipCount?areaNo=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let lotWipData = [];

          this.arrayEvents = [];
          if (res.data.data != undefined) {
            console.log(res.data.data);
            this.arrayEvents = res.data.data;
          }
        })
        .then(() => {});
    },
    itemsForList() {
      return this.lotWipData.slice(
        (this.currentPage - 1) * this.perPage,
        this.currentPage * this.perPage
      );
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case this.$t("new"):
          color = "grey";
          break;
        case this.$t("already") + this.$t("dispatch"):
          color = "orange darken-1";
          break;
        case this.$t("pause"):
          color = "red darken-1";
          break;
        case this.$t("producted"):
          color = "green accent-4";
          break;
        case this.$t("complete"):
          color = "light-blue accent-4";
          break;
        case this.$t("projectClose"):
          color = "blue-grey darken-3";
          break;
      }
      return color;
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
    onSearch() {
      //  console.log(this.statusCheckedList);
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/LotWip/Search?value=${this.lotWipSearchValue}&status=${this.statusCheckedList}&startDate=${this.startDate}&endDate=${this.endDate}`,
          this.machineData,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          let array = [];
          array = res.data.data != null ? res.data.data : [];
          let data = [];
          if (this.type == "E") {
            this.lotWipList = [];
            for (let j = 0; j < this.machineData.length; j++) {
              data.push(
                array.filter(x => x.resourceNo == this.machineData[j].no)
              );
            }

            for (let i = 0; i < data.length; i++) {
              data[i].forEach(element => {
                this.lotWipList.push(element);
              });
            }
          } else if (this.type == "L") {
            this.lotWipList = [];
            for (let j = 0; j < this.lineData.length; j++) {
              data.push(
                array.filter(x => x.resourceNo == this.lineData[j].lineNo)
              );
            }

            for (let i = 0; i < data.length; i++) {
              data[i].forEach(element => {
                this.lotWipList.push(element);
              });
            }
          } else {
            console.log(res.data.data);
            this.lotWipList = [];
            // //取得設備工單
            // for (let j = 0; j < this.machineData.length; j++) {
            //   data.push(
            //     array.filter(x => x.resourceNo == this.machineData[j].no)
            //   );
            // }
            // for (let i = 0; i < data.length; i++) {
            //   data[i].forEach(element => {
            //     this.lotWipList.push(element);
            //   });
            // }
            // data = [];
            // //取得生產線工單,重複的不新增
            // for (let j = 0; j < this.lineData.length; j++) {
            //   data.push(
            //     array.filter(x => x.resourceNo == this.lineData[j].lineNo)
            //   );
            // }

            // for (let i = 0; i < data.length; i++) {
            //   data[i].forEach(element => {
            //     if (!this.lotWipList.includes(element)) {
            //       this.lotWipList.push(element);
            //     }
            //   });
            // }
            // console.log(array);
            this.lotWipList = res.data.data;
          }
          //this.refreshMachineData();
          this.isLoading = 0;
        });
    },

    refreshMachineData() {
      if (this.lotWipList.length > 0) {
        var uniq = {};
        var arrFiltered = this.lotWipList.filter(
          obj => !uniq[obj.resourceName] && (uniq[obj.resourceName] = true)
        );
        //console.log(this.arrFiltered);
        this.machineList = arrFiltered;
        // console.log(data);
      } else {
        this.machineList = [];
      }
    },
    getMachineData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Machine/Search?areaNo=${this.areaData.areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.machineList = res.data.data != null ? res.data.data : [];
          this.machineData = this.machineList;
          this.isLoading = 0;
        });
    },
    getLineData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Line/Search?areaNo=${this.areaData.areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.lineList = res.data.data != null ? res.data.data : [];
          this.lineData = this.lineList;
          this.isLoading = 0;
        });
    }
  },
  mounted() {
    this.refreshMachineData();
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
    this.areaData = this.areaList[0];
    this.getTotalLotWipData();
  },
  watch: {
    areaData() {
      this.getMachineData();
      this.getLineData();
    },
    type() {
      this.lineData = this.lineList;
      this.machineData = this.machineList;
    }
  },
  computed: {
    likesAllItems() {
      return this.machineData.length === this.machineList.length;
    },
    likesSomeItems() {
      return this.machineData.length > 0 && !this.likesAllItems;
    },
    icon() {
      if (this.likesAllItems) return "mdi-close-box";
      if (this.likesSomeItems) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    lineAllItems() {
      return this.lineData.length === this.lineList.length;
    },
    lineSomeItems() {
      return this.lineData.length > 0 && !this.lineAllItems;
    },
    lineIcon() {
      if (this.lineAllItems) return "mdi-close-box";
      if (this.lineSomeItems) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    }
  },
  created() {
    //this.refreshMachineData();
  },
  head() {
    return {
      title: this.$t("jobReportLog")
    };
  },
  submit() {}
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
