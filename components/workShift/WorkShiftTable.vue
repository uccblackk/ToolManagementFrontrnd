<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯生產區域彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("workShift") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <!-- {{ $t("workShiftNo") }}* -->
                  <v-text-field
                    ref="workShiftNo"
                    :label="$t('workShift') + $t('No')"
                    v-model="editWorkShiftForm.no"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <!-- {{ $t("workShiftName") }}* -->
                  <v-text-field
                    ref="workShiftName"
                    :label="$t('workShift') + $t('name')"
                    v-model="editWorkShiftForm.name"
                  ></v-text-field>
                </v-col>
                <v-col cols="5" sm="5">
                            <v-menu
                              ref="menu"
                              v-model="menu"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              :return-value.sync="editWorkShiftForm.startTime"
                              transition="scale-transition"
                              offset-y
                              max-width="290px"
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="editWorkShiftForm.startTime"
                                  :label="$t('shiftOn') + $t('startTime')"
                                  :rules="noRules"
                                  prepend-icon="mdi-clock-time-four-outline"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  required
                                ></v-text-field>
                              </template>
                              <v-time-picker
                                v-if="menu"
                                v-model="editWorkShiftForm.startTime"
                                full-width
                                ampm-in-title
                                format="24hr"
                                scrollable
                                @click:minute="
                                  $refs.menu.save(editWorkShiftForm.startTime)
                                "
                                :max="editWorkShiftForm.endTime"
                              ></v-time-picker>
                            </v-menu>
                          </v-col>
                          <v-col cols="1" sm="1" class="mt-7">
                            ~
                          </v-col>

                          <v-col cols="5" sm="5">
                            <v-menu
                              ref="menu1"
                              v-model="menu1"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              :return-value.sync="editWorkShiftForm.endTime"
                              transition="scale-transition"
                              offset-y
                              max-width="290px"
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="editWorkShiftForm.endTime"
                                  :label="$t('shiftOn') + $t('endTime')"
                                  :rules="noRules"
                                  prepend-icon="mdi-clock-time-four-outline"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  required
                                ></v-text-field>
                              </template>
                              <v-time-picker
                                v-if="menu1"
                                v-model="editWorkShiftForm.endTime"
                                full-width
                                ampm-in-title
                                format="24hr"
                                scrollable
                                @click:minute="
                                  $refs.menu1.save(editWorkShiftForm.endTime)
                                "
                                :min="editWorkShiftForm.startTime"
                              ></v-time-picker>
                            </v-menu>
                          </v-col>
                        </v-row>

                        <v-banner single-line sticky>{{
                          $t("shiftOff") + $t("time") + $t("setting")
                        }}</v-banner>
                      </v-container>
                      <v-row>
                        <v-col cols="5" sm="5">
                          <v-menu
                            ref="menu2"
                            v-model="menu2"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            :return-value.sync="editWorkShiftForm.offStartTime"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="editWorkShiftForm.offStartTime"
                                :label="$t('shiftOff') + $t('startTime')"
                                prepend-icon="mdi-clock-time-four"
                              
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="menu2"
                              v-model="editWorkShiftForm.offStartTime"
                              full-width
                              ampm-in-title
                              format="24hr"
                              scrollable
                              @click:minute="
                                $refs.menu2.save(editWorkShiftForm.offStartTime)
                              "
                              :max="editWorkShiftForm.offEndTime"
                              :min="editWorkShiftForm.startTime"
                            ></v-time-picker>
                          </v-menu>
                        </v-col>
                        <v-col cols="1" sm="1" class="mt-7">
                          ~
                        </v-col>

                        <v-col cols="5" sm="5">
                          <v-menu
                            ref="menu3"
                            v-model="menu3"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            :return-value.sync="editWorkShiftForm.offEndTime"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="editWorkShiftForm.offEndTime"
                                :label="$t('shiftOff') + $t('endTime')"
                                prepend-icon="mdi-clock-time-four"
                        
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="menu3"
                              v-model="editWorkShiftForm.offEndTime"
                              full-width
                              ampm-in-title
                              format="24hr"
                              scrollable
                              @click:minute="
                                $refs.menu3.save(editWorkShiftForm.offEndTime)
                              "
                              :min="editWorkShiftForm.offStartTime"
                               :max="editWorkShiftForm.endTime"
                            ></v-time-picker>
                          </v-menu>
                        </v-col>
                      </v-row>
       
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editWorkShift()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除生產區域彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("workShift") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("workShift") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteWorkShift()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="workShiftList"
        :items-per-page="itemsPerPage"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        :sort-by="['workShiftNo']"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="showDeleteDialog(item)">
            mdi-delete
          </v-icon>
        </template>
        <template #item.shiftOnTime="{ item }"
          >{{ item.startTime }} ~ {{ item.endTime }}</template
        >
        <template #item.shiftOffTime="{ item }">
         <span v-if="item.shiftOffData!=null">
            {{ item.shiftOffData.startTime }} ~
            {{ item.shiftOffData.endTime }}
         </span>
        </template>
      </v-data-table>
      <div class="text-center pt-2">
        <v-pagination :total-visible="7" v-model="page" :length="pageCount"></v-pagination>
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    workShiftData: {},
    isLoading:null,
      workShiftSearchValue: null
  },
  data() {
    return {
      loading:0,
 menu: false,
      menu1: false,
      menu2: false,
      menu3: false,
      noRules: [v => !!v || this.$t("mustInput")],
      workShiftList: [],
    
      editDialog: false,
      deleteDialog: false,
      workShiftName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      selectedItem:null,
      editWorkShiftForm: {
        no: null,
        name: null,
        startTime: null,
        endTime: null,
        offStartTime: null,
        offEndTime: null
      },
      deleteWorkShiftData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: this.$t("workShift") + this.$t("No"),
          value: "shiftNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("workShift") + this.$t("name"),
          value: "shiftName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("shiftOn") + this.$t("time"),
          value: "shiftOnTime",
          sortable: false,
          width: "15%"
        },
        {
          text: this.$t("shiftOff") + this.$t("time"),
          value: "shiftOffTime",
          sortable: false,
          width: "15%"
        },
        // {
        //   text: this.$t("status"),
        //   value: "status",
        //   sortable: false,
        //   width: "10%"
        // },
        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          width: "5%"
        }
      ]
    };
  },
  watch: {
    workShiftData() {
      //console.log(this.workShiftData);
      this.workShiftList = this.workShiftData;
    },
    isLoading(){
      this.loading=this.isLoading;
    }
  },
  created() {
 //   console.log(this.workShiftData[1].shiftOffEndTime);
    this.workShiftList = this.workShiftData;
  },
  methods: {
    editItem(item) {
     
      this.editWorkShiftForm.no = item.shiftNo;
      this.editWorkShiftForm.name = item.shiftName;
      this.editWorkShiftForm.startTime = item.startTime;
      this.editWorkShiftForm.endTime = item.endTime;
      if( item.shiftOffData!=null){
      this.editWorkShiftForm.offStartTime = item.shiftOffData.startTime;
      this.editWorkShiftForm.offEndTime = item.shiftOffData.endTime;
      }
      else{
         this.editWorkShiftForm.offStartTime=null;
          this.editWorkShiftForm.offEndTime=null;
      }
      this.selectedItem=item;
       //console.log(this.selectedItem);
       this.editWorkShiftForm.id=item.id;
      //this.editedIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
      this.editDialog = true;
    },
    editWorkShift() {
   
      const token = this.$store.state.authUser.token;
      const workShift = {
        id:this.editWorkShiftForm.id,
       customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        shiftNo: this.editWorkShiftForm.no,
        shiftName: this.editWorkShiftForm.name,
        startTime: this.editWorkShiftForm.startTime,
        endTime: this.editWorkShiftForm.endTime,
        status: "Y"
      };
    
      this.$axios
        .post(`/workShift/update`, workShift, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
          
             this.editDialog = false;
          } else {
            this.editDialog = false;
        
          }
         this.editOffShift();
         
          this.editDialog = false;
        })
        .then(() => {});
    },
     editOffShift() {
      let t3 = null;
       if (
        this.editWorkShiftForm.offStartTime == null ||
        this.editWorkShiftForm.offEndTime == null
      ) {
        
        return;
      }
      else if (
        this.editWorkShiftForm.offStartTime != null &&
        this.editWorkShiftForm.offEndTime != null
      ) {
       var t1 = moment(this.editWorkShiftForm.offStartTime, "HH:mm:ss");
       // console.log(t1);
var t2 = moment(this.editWorkShiftForm.offEndTime, "HH:mm:ss");
 //console.log(t2);
 
 var duration = moment.duration(t2.diff(t1));
  t3 = duration.hours() + ":" + duration.minutes() + ":" + duration.seconds();
        //console.log(t3);
      }

      const token = this.$store.state.authUser.token;
      const offShift = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        shiftNo: this.editWorkShiftForm.no,
        startTime: this.editWorkShiftForm.offStartTime,
        endTime: this.editWorkShiftForm.offEndTime,
        duration: t3
      };
      this.editWorkShiftForm.no = "";
      this.editWorkShiftForm.name = "";
      this.editWorkShiftForm.offStartTime = null;
      this.editWorkShiftForm.offEndTime = null;
      //console.log( this.selectedItem.shiftOffData);
     
      if( this.selectedItem.shiftOffData != null ){
      this.$axios
        .post(`/ShiftOff/update`, offShift, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
             this.$swal("", this.$t("editSuccess"), "success");
          } else {
               this.$swal("", this.$t("editFailed"), "error");
          }
          this.refreshShiftData();
        })
        .then(() => {});
        }
        else{
            this.$axios
        .post(`/ShiftOff/create`, offShift, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
             "",
              this.$t("editSuccess"),
              "success"
            );
          } else {
         this.$swal("", this.$t("editFailed"), "error");

            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
           this.refreshShiftData();
        })
        .then(() => {});
        }
    },
    deleteWorkShift() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;
      const workShift = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        workShiftNo: this.deleteWorkShiftData.no,
        workShiftName: this.deleteWorkShiftData.name,
        Status: "Y"
      };
      //console.log(workShift);
      this.deleteWorkShiftData.no = "";
      this.deleteWorkShiftData.name = "";
     
      this.$axios
        .delete(`/WorkShift/delete/${this.deleteWorkShiftData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("deleteSuccess"),
              "success"
            );
          } else {
           
            this.$swal("", this.$t("deleteFailed"), "error");
          }
          this.refreshShiftData();
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshShiftData() {
      this.loading=1;
    const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/WorkShift/Search?value=${this.workShiftSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
         // console.log(res.data.data);
          this.workShiftList = res.data.data != null ? res.data.data : [];
           this.loading=0;
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      //console.log(item);
      this.deleteWorkShiftData.no = item.workShiftNo;
      this.deleteWorkShiftData.name = item.workShiftName;
      this.deleteWorkShiftData.id = item.id;
    }
  }
};
</script>
