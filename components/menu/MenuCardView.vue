<template>
  <v-container fluid>
    <v-layout row wrap class="mx-2">
      <v-flex xs12>
        <div v-for="m in data" :key="m.id" class="mt-3">
          <div v-if="m.subLinks.length > 0">
            <v-banner class="text-h5 font-weight-black" single-line>
              <v-icon class="mb-1">{{ m.icon }}</v-icon> {{ $t(m.text) }}
            </v-banner>

            <v-row>
              <v-col
                style="text-align:center"
                xs="12"
                sm="3"
                md="2"
                lg="1"
                v-for="s in m.subLinks"
                :key="s.menuNo"
              >
                <v-tooltip color="green darken-2" bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-card
                      v-bind="attrs"
                      v-on="on"
                      class="card"
                      @click="redirectTo(s.to)"
                    >
                      <v-row justify="center" no-gutters>
                        <v-icon class="mt-2" dark x-large style="height:60px">
                          {{ s.icon }}
                        </v-icon>
                      </v-row>
                      <v-row style="color:white" justify="center" no-gutters>
                        <div class="mx-1  text-truncate ">
                          {{ $t(s.text) }}
                        </div>
                      </v-row>
                    </v-card>
                  </template>
                  <span>{{ $t(s.text) }}</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-flex>
    </v-layout>

    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>
<script>
export default {
  props: {
    data: []
  },
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

  head() {
    return {
      title: "首頁"
    };
  },
  methods: {
    redirectTo(to) {
      this.$router.push(to);
    }
  },
  mounted() {
    //console.log(this.data);
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
.btn {
  background-color: rgb(17, 15, 15);
}
.card {
  background-color: black !important;
  border: none;
  color: white;
  opacity: 0.5;
  text-align: center;
  transition: 0.3s;
}

.card:hover {
  background-color: #388e3c !important;
  opacity: 1;
  color: white;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
</style>
