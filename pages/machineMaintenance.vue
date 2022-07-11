<template>
  <v-container fluid>
    <v-layout row wrap style="width: 100%">
      <v-flex xs12>
        <v-card>
          <v-card-title class="info" style="height: 20px">
            <v-icon dark class="my-n5">mdi-calendar-clock</v-icon>
            <span class="white--text my-n5"
              >{{ $t("equipmentMaintenance") }}{{ $t("search") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-layout row wrap class="mx-2">
              <v-flex xs12>
                <v-form>
                  <v-container>
                    <v-row class="text-center">
                      <v-col cols="12" md="4">
                        <v-select
                          v-model="machineName"
                          :items="machineNameList"
                          :label="$t('machineName')"
                          solo
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-menu
                          ref="menu"
                          v-model="menu"
                          :close-on-content-click="false"
                          :return-value.sync="dates"
                          transition="scale-transition"
                          offset-y
                          min-width="100px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-combobox
                              v-model="dates"
                              multiple
                              chips
                              small-chips
                              :label="$t('date')"
                              prepend-icon="mdi-calendar"
                              append-icon="mdi-magnify"
                              append-outer-icon="mdi-plus"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              @click:append="onSearch"
                              @click:append-outer="showAddDialog = true"
                            ></v-combobox>
                          </template>
                          <v-date-picker
                            v-model="dates"
                            no-title
                            scrollable
                            range
                          >
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="menu = false"
                              >Cancel</v-btn
                            >
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.menu.save(dates)"
                              >OK</v-btn
                            >
                          </v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-flex>
              <v-flex xs12></v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <MaintenanceTable :maintenanceData="maintenanceList" />
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import moment from "moment";
import MaintenanceTable from "~/components/machineMaintenance/OLD_MaintenanceTable.vue";
export default {
  middleware: "auth",
  data() {
    return {
      maintenanceList: {},
      machineList: {},
      machineName: "",
      machineType: "CNC",
      machineTypeList: ["CNC", "EDM", "EW", "ED", "UPL", "MI", "SG"],
      showAddDialog: false,
      dates: [],
      menu: false,
      addMaintenanceForm: {
        machineName: "",
        employeeId: "",
        content: "",
        scheduleTime: "",
        notice: "",
        menu: false,
        modal: false
      }
    };
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    const id = params.id;
    let response = await app.$axios.$get(`/Machine/Search?machineId=`, {
      headers: {
        Authorization: token
      }
    });
    const machineList = response.data;
    const dates = [
      moment().format("YYYY-MM-DD"),
      moment()
        .add(1, "days")
        .format("YYYY-MM-DD")
    ];
    response = await app.$axios.$get(
      `/MachineMaintenance/Search?machineId=${machineList[0].id}&startTime=${dates[0]}&endTime=${dates[1]}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    const maintenanceList =
      response.data.data != null ? response.data.data : [];
    return {
      id: params.id,
      machineList: machineList,
      maintenanceList: maintenanceList
    };
  },
  methods: {
    onSearch() {
      const token = this.$store.state.authUser.token;
      let machineId = "";
      this.machineList.forEach(e => {
        if (e.name === this.machineName) {
          machineId = e.id;
        }
      });
      this.$axios
        .get(
          `/MachineMaintenance/Search?machineId=${machineId}&startTime=${this.dates[0]}&endTime=${this.dates[1]}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.maintenanceList = res.data.data != null ? res.data.data : [];
        });
    },
    addMaintenance() {
      this.$axios.post("/");
      this.showAddDialog = false;
    }
  },
  mounted() {
    this.dates = [
      moment().format("YYYY-MM-DD"),
      moment()
        .add(1, "days")
        .format("YYYY-MM-DD")
    ];
    this.machineNameList = [];
    this.machineList.forEach(e => {
      this.machineNameList.push(e.name);
    });
    if (this.machineList.length > 0) {
      this.machineName = this.machineList[0].name;
      this.addMaintenanceForm.machineName = this.machineName;
    }
    this.addMaintenanceForm.scheduleTime = moment().format("YYYY-MM-DD");
  }
};
</script>
