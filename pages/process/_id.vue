<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-2">
      <div class="text-center">
        <h2>{{ processData.name }}</h2>
      </div>
    </v-flex>
    <v-flex xs12  md3 class="pa-2 justify-center">
      <v-chip outlined small color="info" class="ma-1">{{
        $t("equipmentInfo")
      }}</v-chip>
      <v-divider></v-divider>
      <MachineCard v-if="machineData" :machineData="machineData" class="ma-1" />
      <v-btn
        v-else
        x-large
        width="100%"
        dark
        class="rounded grey mt-10 d-flex justify-center"
      >
        <v-icon>mdi-ballot-outline</v-icon>
        {{ $t("waitingSchedule") }}
      </v-btn>
    </v-flex>
    <v-flex xs12 md5 class="pa-2">
      <v-chip outlined small color="info" class="ma-1">{{
        $t("stationInfo")
      }}</v-chip>
      <v-divider></v-divider>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("partName") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.name }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("partNo") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.partNo }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("jobNo") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.jobNo }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("station") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.name }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("totalCount") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.totalCount }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("count") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.count }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("supervisor") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.sheculeStartTime }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("operator") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.finishTime }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("status") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ $t(processData.status) }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("notice") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.notice }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("scheduleStartTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.scheduleStartTime }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("scheduleFinishTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.scheduleFinishTime }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-3">
        <v-col md="2">
          <span style="color: gray">{{ $t("startTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.sheculeStartTime }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("finishTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ processData.finishTime }}</span>
        </v-col>
      </v-row>
    </v-flex>
    <v-flex md12 class="pa-2">
      <v-divider />
    </v-flex>
    <v-flex>
      <!-- tabs -->
      <v-card color="basil" class="ma-2">
        <v-tabs
          v-model="tab"
          background-color="blue-grey lighten-1"
          dark
          fixed-tabs
          slider-color="deep-orange darken-1"
        >
          <v-tab v-for="(item, idx) in items" :key="idx">
            <v-icon>{{ item.icon }}</v-icon>
            {{ item.tab }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-layout
              align-center
              justify-center
              column
              fill-height
              class="pa-1"
            >
              <ProcedureTable :processId="processData.id" />
            </v-layout>
          </v-tab-item>
          <v-tab-item>
            <v-layout
              align-center
              justify-center
              column
              fill-height
              class="pa-1"
            >
            </v-layout>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
export default {
  middleware: "auth",
  data() {
    return {
      partData: {},
      processData: {},
      procedureData: {},
      machineData: {},
      tab: null,
      items: [
        { tab: this.$t("procedure"), icon: "mdi-washing-machine" },
        // { tab: this.$t("measurementData"), icon: "mdi-clipboard-text-outline" },
        // { tab: this.$t("processCapability"), icon: "mdi-access-point" },
        { tab: this.$t("setting"), icon: "mdi-cog" },
        { tab: this.$t("paperlessInfo"), icon: "mdi-file-outline" }
      ]
    };
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    const id = params.id;
    let response = await app.$axios.$get(`/Process/${id}`, {
      headers: {
        Authorization: token
      }
    });
    const processData = response.data;
    response = await app.$axios.$get(`/Part/${processData.part.id}`, {
      headers: {
        Authorization: token
      }
    });
    const partData = response.data;

    let machineData = null;
    if (processData.machine != null) {
      response = await app.$axios.$get(`/Machine/${processData.machine.id}`, {
        headers: {
          Authorization: token
        }
      });
      machineData = response.data;
    }
    processData.scheduleStartTime =
      processData.scheduleStartTime != null
        ? moment(processData.scheduleStartTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    processData.scheduleFinishTime =
      processData.scheduleFinishTime != null
        ? moment(processData.scheduleFinishTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    processData.startTime =
      processData.startTime != null
        ? moment(processData.startTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    processData.finishTime =
      processData.finishTime != null
        ? moment(processData.finishTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    return {
      id: params.id,
      processData: processData,
      partData: partData,
      machineData: machineData
    };
  },
  methods: {},
  head() {
    return {
      title: ""
    };
  },
  mounted() {},
  computed: {}
};
</script>
