<template>
  <v-layout row wrap>
    <v-flex xs12 class="pa-2">
      <div class="text-center">
        <h2>{{ partData.partNo }}</h2>
      </div>
    </v-flex>
    <v-flex xs12 md6 class="pa-2">
      <v-chip outlined small color="info" class="ma-1">{{
        $t("partInfo")
      }}</v-chip>
      <v-divider></v-divider>
      <v-row no-gutters class="ma-1">
        <v-col md="2">
          <span style="color: gray">{{ $t("name") }}:</span>
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
      <v-row no-gutters class="ma-1">
        <v-col md="2">
          <span style="color: gray">{{ $t("jobNo") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.jobNo }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("count") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.count }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-1">
        <v-col md="2">
          <span style="color: gray">{{ $t("group") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.group }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("status") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ $t(partData.status) }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-1">
        <v-col md="2">
          <span style="color: gray">{{ $t("type") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.type }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("notice") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ partData.notice }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-1">
        <v-col md="2">
          <span style="color: gray">{{ $t("scheduleStartTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ scheduleStartTime }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("scheduleFinishTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ scheduleFinishTime }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="ma-1">
        <v-col md="2">
          <span style="color: gray">{{ $t("startTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ scheduleStartTime }}</span>
        </v-col>
        <v-col md="2">
          <span style="color: gray">{{ $t("finishTime") }}:</span>
        </v-col>
        <v-col md="4">
          <span style="color: gray">{{ finishTime }}</span>
        </v-col>
      </v-row>
    </v-flex>
    <v-flex xs12 md6 class="pa-2">
      <v-chip outlined small color="info" class="ma-1">{{
        $t("procedureInfo")
      }}</v-chip>
      <v-divider></v-divider>
    </v-flex>
    <v-flex xs12 class="pa-2">
      <div style="text-align: center">
        <!-- tabs -->
        <v-card color="basil">
          <v-tabs
            v-model="tab"
            background-color="blue-grey lighten-1"
            dark
            fixed-tabs
            slider-color="light-blue lighten-4"
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
                class="pa-2 ma-2"
              >
                <v-card color="basil" flat>
                  <v-layout row wrap>
                    <v-flex md12 class="mx-2 text-right">
                      <v-btn
                        small
                        class="info px-5"
                        @click.stop="showAddDialog = true"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                      <v-dialog v-model="showAddDialog" max-width="500">
                        <v-card>
                          <v-card-title class="info">
                            <span class="headline white--text"
                              >{{ $t("add") }}{{ $t("process") }}</span
                            >
                          </v-card-title>
                          <v-card-text>
                            <v-container>
                              <h3 class="text-center">
                                {{ $t("processSequence") }}:
                                {{ processData.length + 1 }}
                              </h3>
                              <v-row no-gutters>
                                <v-col cols="12">
                                  <v-text-field
                                    :label="$t('process')"
                                    v-model="addProcessForm.name"
                                    required
                                  ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                  <v-text-field
                                    :label="$t('notice')"
                                    v-model="addProcessForm.notice"
                                  ></v-text-field>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-card-text>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                              class="info"
                              dark
                              text
                              @click="addProcess()"
                              >{{ $t("confirm") }}</v-btn
                            >
                            <v-btn
                              class="gray"
                              @click="showAddDialog = false"
                              >{{ $t("cancel") }}</v-btn
                            >
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-flex>
                    <v-flex
                      xs12
                      sm12
                      lg
                      xl
                      md3
                      v-for="(item, index) in processData"
                      :key="item.id"
                      class="justify-center pa-2"
                    >
                      <v-chip
                        label
                        dark
                        class="ma-1 px-10 font-weight-bold blue-grey"
                        >{{ index + 1 }}</v-chip
                      >
                      <ProcessCard
                        :processData="item"
                        @delete="deleteProcess()"
                      />
                    </v-flex>
                  </v-layout>
                </v-card>
              </v-layout>
            </v-tab-item>
            <v-tab-item>
              <v-layout
                align-center
                justify-center
                column
                fill-height
                class="pa-2"
              ></v-layout>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
import ProcessCard from "~/components/part/ProcessCard.vue";
import moment from "moment";
export default {
  middleware: "auth",
  data() {
    return {
      showAddDialog: false,
      addProcessForm: {
        sequence: 0,
        name: "",
        notice: ""
      },
      partData: {},
      processData: {},
      tab: null,
      items: [
        { tab: this.$t("processInfo"), icon: "mdi-washing-machine" },
        { tab: this.$t("electrodeInfo"), icon: "mdi-alpha-e-box" },
        { tab: this.$t("electrodeStatus"), icon: "mdi-access-point" },
        { tab: this.$t("paperlessInfo"), icon: "mdi-file-outline" }
      ]
    };
  },
  async asyncData({ app, store, params }) {
    const token = store.state.authUser.token;
    const id = params.id;
    let response = await app.$axios.$get(`/Part/${id}`, {
      headers: {
        Authorization: token
      }
    });
    const partData = response.data;
    response = await app.$axios.$get(`/Process/Search?partId=${id}`, {
      headers: {
        Authorization: token
      }
    });
    const processData = response.data;
    return {
      id: params.id,
      partData: partData,
      processData: processData
    };
  },
  methods: {
    addProcess() {
      this.showAddDialog = false;
      const token = this.$store.state.authUser.token;
      const process = {
        sequence: this.processData.length + 1,
        partId: this.partData.id,
        name: this.addProcessForm.name,
        notice: this.addProcessForm.notice,
        status: "waitingSchedule"
      };
      this.addProcessForm.name = "";
      this.addProcessForm.notice = "";

      this.$axios
        .post(`/process/create`, process, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(process.name, this.$t("createSuccess"), "success");
            this.getProcessData();
          } else {
            this.$swal(self.procedure, this.$t("createFailed"), "error");
          }
          this.showAddDialog = false;
        })
        .then(() => {});
    },
    getProcessData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Process/Search/${this.partData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.processData = res.data.data;
          }
        });
    },
    deleteProcess() {
      this.getProcessData();
      //window.location.reload(true)
    }
  },
  head() {
    return {
      title: ""
    };
  },
  mounted() {},
  computed: {
    scheduleStartTime() {
      return this.partData.scheduleStartTime != null
        ? moment(this.partData.scheduleStartTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    },
    scheduleFinishTime() {
      return this.partData.scheduleFinishTime != null
        ? moment(this.partData.scheduleFinishTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    },
    scheduleStartTime() {
      return this.partData.scheduleStartTime != null
        ? moment(this.partData.scheduleStartTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    },
    startTime() {
      return this.partData.startTime != null
        ? moment(this.partData.startTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    },
    finishTime() {
      return this.partData.finishTime != null
        ? moment(this.partData.finishTime).format("YYYY/MM/DD HH:mm:ss")
        : "";
    }
  },
  watch: {}
};
</script>
