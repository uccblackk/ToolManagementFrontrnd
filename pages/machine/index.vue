<template>
  <v-container fluid>
    <v-layout row wrap class="mx-2">
      <v-flex xs12>
        <v-form>
          <v-container>
            <v-row class="text-center">
              <v-col cols="2" md="3">
                <v-select
                  v-model="areaData"
                  :items="areaList"
                  :label="$t('area')"
                  item-text="areaName"
                  item-value="areaNo"
                ></v-select>
              </v-col>
              <v-col cols="2" md="3">
                <v-select
                  v-model="machineType"
                  :items="machineTypeList"
                  :label="$t('machineType')"
                ></v-select>
              </v-col>
              <v-col cols="8" md="6">
                <v-text-field
                  :placeholder="$t('machineName')"
                  v-model="machineName"
                  append-icon="mdi-magnify"
                  @click:append="onSearch"
                  clearable
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="mt-n6">
      <v-flex xs12 md3 v-for="item in machines" :key="item.id" class="pa-2">
        <MachineCard
          :machineData="item"
          showDelete="true"
          @delete="getData()"
        />
      </v-flex>
    </v-layout>
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>
<script>
import MachineCard from "~/components/machine/MachineCard.vue";
export default {
  middleware: "auth",
  data() {
    return {
      overlay: false,
      areaData: [],
      areaList: [],
      machines: {},
      machineName: null,
      machineType: "*",
      machineTypeList: [
        "*",
        "CNC",
        "Robot",
        "EDM",
        "EW",
        "ED",
        "UPL",
        "MI",
        "SG"
      ],
      showAddDialog: false,
      addMachineForm: {
        name: "",
        type: "CNC",
        brand: "",
        series: "",
        notice: "",
        setting: {}
      }
    };
  },
  async asyncData({ app, params, store, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "equipmentInfo") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    const response = await app.$axios.$get(`/Machine/Search?machineName=`, {
      headers: {
        Authorization: token
      }
    });

    return { machines: response.data };
  },
  head() {
    return {
      title: this.$t("equipmentInfo")
    };
  },
  methods: {
    getData() {
      const token = this.$store.state.authUser.token;
      let machineName = this.machineName;
      let areaNo = this.areaData;
      this.overlay = true;
      this.$axios
        .get(`/Machine/Search?value=${machineName}&areaNo=${areaNo}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machines = res.data.data;
          if (this.machineType != "*") {
            this.machines = this.machines.filter(
              item => item.type === this.machineType
            );
          }
          this.overlay = false;
        });
    },
    onSearch() {
      this.getData();
    },
    addMachine() {},
    getAreaData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Area/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
          this.areaList.unshift({
            areaNo: "",
            areaName: "*"
          });
          this.areaData = this.areaList[0].areaNo;
          // if (this.areaList.length > 0) {
          //   this.areaData = this.areaList[0];
          // }
        });
    }
  },
  mounted() {
    this.getAreaData();
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 10px;
  position: relative;
  max-height: 100%;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
