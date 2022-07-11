<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯設備彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="800px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("equipment") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="addForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <!-- {{ $t("lineNo") }}* -->
                    <v-text-field
                      ref="machineNo"
                      :label="'*' + $t('equipment') + $t('No')"
                      v-model="editMachineForm.no"
                      disabled
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <!-- {{ $t("lineName") }}* -->
                    <v-text-field
                      ref="machineName"
                      :label="'*' + $t('equipment') + $t('name')"
                      :rules="nameRules"
                      v-model="editMachineForm.name"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <!-- {{ $t("lineName") }}* -->
                    <v-text-field
                      ref="machineType"
                      :label="'*' + $t('equipment') + $t('type')"
                      :items="machineTypeList"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      v-model="editMachineForm.type"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      class="mt-2"
                      v-model="areaSelected"
                      :items="areaData"
                      :label="'*' + $t('area')"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      item-text="areaName"
                      item-value="areaNo"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      class="mt-2"
                      v-model="lineSelected"
                      :items="lineData"
                      :label="$t('line')"
                      item-text="lineName"
                      item-value="lineNo"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <!-- {{ $t("lineName") }}* -->
                    <v-text-field
                      ref="machineBrand"
                      :label="$t('equipment') + $t('brand')"
                      v-model="editMachineForm.brand"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <!-- {{ $t("lineName") }}* -->
                    <v-text-field
                      ref="machineSeries"
                      :label="$t('equipment') + $t('series')"
                      v-model="editMachineForm.series"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <!-- {{ $t("lineName") }}* -->
                    <v-text-field
                      ref="machineBrand"
                      :label="$t('manufature') + $t('country')"
                      v-model="editMachineForm.setting.country"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <!-- {{ $t("lineName") }}* -->
                    <v-text-field
                      number
                      :disabled="toolMagazineEdit"
                      :label="$t('machineToolMagazine') + $t('count')"
                      v-model="editMachineForm.toolMagazine"
                      oninput="if(this.value < 1) this.value = 1;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                      :max="toolMagazineMaxCount"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="machineSeries"
                      :label="$t('factoryNo')"
                      v-model="editMachineForm.setting.factoryNo"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-menu
                      v-model="menu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          outlined
                          v-model="editMachineForm.setting.factoryDate"
                          :label="$t('factoryDate')"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          style="margin-top:-10px"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="editMachineForm.setting.factoryDate"
                        @input="menu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="machineSeries"
                      :label="$t('purchasePrice')"
                      v-model="editMachineForm.setting.purchasePrice"
                      oninput="if(this.value < 0) this.value = 0;"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="machineSeries"
                      :label="$t('residualValue')"
                      v-model="editMachineForm.setting.residualValue"
                      oninput="if(this.value < 0) this.value = 0;"
                      type="number"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="12" md="12">
                    <!-- {{ $t("lineName") }}* -->
                    <v-text-field
                      ref="notice"
                      :label="$t('description')"
                      v-model="editMachineForm.notice"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-file-input
                      accept="image/png, image/jpeg, image/bmp"
                      :placeholder="$t('select') + $t('image')"
                      prepend-icon="mdi-camera"
                      :label="$t('image')"
                      @change="Preview_image"
                      v-model="image"
                      :show-size="1000"
                    ></v-file-input>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <img :src="url" width="100%" style="max-width:200px" />
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn class="gray" @click="closeEditMachineDialog()">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editMachine()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除設備彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("equipment") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("equipment") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteMachine()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 預覽圖片彈窗 -->
      <v-dialog v-model="imageDialog" max-width="600px">
        <v-card ref="form">
          <v-card-text>
            <v-container>
              <v-form>
                <v-row>
                  <v-col cols="12">
                    <img :src="url" width="100%" style="max-width:600px" />
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-data-table
        height="100%"
        :headers="headers"
        :items="machineList"
        :items-per-page="itemsPerPage"
        :sort-by="['no']"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.image="{ item }">
          <v-avatar
            v-if="item.img == null || item.img == ''"
            color="grey darken-1 white--text text-caption"
            style="max-width: 30px;"
            size="30"
            dark
          >
            <span class="text-truncate" style="max-width: 25px;">
              {{ item.name }}
            </span>
          </v-avatar>

          <v-img
            v-if="item.img != null && item.img != ''"
            :src="item.img"
            @click="displayImage(item.img)"
            width="30"
            contain
          ></v-img>
        </template>
        <template v-slot:item.toolMagazine="{ item }">
          {{ Object.keys(item.toolMagazine).length }}
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="showDeleteDialog(item)">
            mdi-delete
          </v-icon>
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
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    machineData: {},
    areaData: {},
    lineData: {},
    isLoading: null
  },
  data() {
    return {
      menu: false,
      imageDialog: false,
      snackbar: false,
      snackbarText: "",
      toolMagazineEdit: true,
      toolMagazineMaxCount: 50,
      selectedMachine: {},
      loading: null,
      url: "",
      valid: true,
      image: undefined,
      machineTypeList: ["CNC", "Robot", "EDM", "EW", "ED", "UPL", "MI", "SG"],
      machineImg: null,
      selectedFile: undefined,
      machineList: [],
      MachineSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      lineSelected: null,
      lineList: {},
      lineName: "",
      areaList: {},
      errorMessage: "",
      nameRules: [v => !!v || this.$t("mustInput")],
      noRules: [v => !!v || this.$t("mustInput")],
      areaRules: [v => v == null || this.$t("mustInput")],
      procedure: "",
      areaSelected: null,
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      editMachineForm: {
        no: null,
        name: null,
        areaName: null
      },
      deleteMachineData: {
        no: null,
        name: null,
        id: null
      },
      editMachineForm: {
        no: null,
        name: null,
        brand: null,
        series: null,
        type: null,
        use: null,
        image: null,
        img: null,
        notice: null,
        toolMagazine: 1,
        setting: {
          country: null,
          factoryNo: null,
          factoryDate: null,
          purchasePrice: null,
          residualValue: null
        }
      },
      headers: [
        {
          text: "",
          value: "image",
          align: "center fixed",
          class: "fixed",
          // class: "sticky-header  grey lighten-3",
          sortable: false,
          width: "50px"
        },
        {
          text: this.$t("equipment") + this.$t("No"),
          value: "no",
          align: "start fixed",
          class: "fixed",
          // class: "sticky-header  grey lighten-3",
          sortable: true,
          width: "150px"
        },
        {
          text: this.$t("equipment") + this.$t("name"),
          value: "name",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("area") + this.$t("name"),
          value: "areaName",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("line") + this.$t("name"),
          value: "lineName",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("equipment") + this.$t("brand"),
          value: "brand",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("equipment") + this.$t("series"),
          value: "series",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("equipment") + this.$t("type"),
          value: "type",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "100px"
        },
        {
          text: this.$t("manufature") + this.$t("country"),
          value: "setting.country",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "100px"
        },
        {
          text: this.$t("factoryNo"),
          value: "setting.factoryNo",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("factoryDate"),
          value: "setting.factoryDate",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("purchasePrice"),
          value: "setting.purchasePrice",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "100px"
        },
        {
          text: this.$t("residualValue"),
          value: "setting.residualValue",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "100px"
        },
        {
          text: this.$t("description"),
          value: "notice",
          sortable: false,
          // class: "sticky-header  grey lighten-3",
          width: "150px"
        },
        {
          text: this.$t("machineToolMagazine") + this.$t("count"),
          value: "toolMagazine",
          // class: "sticky-header  grey lighten-3",
          sortable: false,
          width: "150px"
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
          align: "center",
          // class: "sticky-header  grey lighten-3",
          sortable: false,
          width: 100
        }
      ]
    };
  },
  watch: {
    machineData() {
      this.machineList = this.machineData;
      // this.areaList = this.areaData;
      // this.lineList = this.lineData;
      // console.log(this.machineList);
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },
  methods: {
    displayImage(img) {
      this.imageDialog = true;
      this.url = img;
    },
    getToolMagazineCount(item) {
      return Object.keys(item).length;
    },
    Preview_image(file) {
      this.selectedFile = file;
      // console.log(this.selectedFile);
      if (this.selectedFile == undefined) {
        this.url = "";

        return;
      }
      this.progress = 0;
      this.currentFile = file;
      var attach = null;
      var reader = [];
      // attach = this.singleFileToBase64(file, reader);
      //  console.log(this.uploadImg);
      this.url = URL.createObjectURL(this.selectedFile);
    },
    getAreaData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Area/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
        });
    },
    convert(obj) {
      return Object.keys(obj).map(key => ({
        name: key,
        value: obj[key]
      }));
    },
    editItem(item) {
      this.toolMagazineEdit = false;
      for (let i = 0; i <= Object.keys(item.toolMagazine).length; i++) {
        if (item.toolMagazineData[i + 1] != null) {
          // console.log(item.toolMagazineData);
          this.toolMagazineEdit = true;
          this.snackbar = true;
          this.snackbarText = "已有刀具在刀庫，請先移除後再編輯。";
          break;
        }
      }

      this.selectedMachine = item;
      this.editMachineForm.no = item.no;
      this.editMachineForm.name = item.name;
      this.areaSelected = item.areaNo;
      this.editMachineForm.brand = item.brand;
      this.editMachineForm.series = item.series;
      this.editMachineForm.type = item.type;
      this.editMachineForm.notice = item.notice;
      this.editMachineForm.img = item.img;
      this.lineSelected = item.lineNo;
      this.editMachineForm.toolMagazine = Object.keys(item.toolMagazine).length;
      if (item.setting != null) {
        this.editMachineForm.setting.country = item.setting.country;
        this.editMachineForm.setting.factoryNo = item.setting.factoryNo;
        this.editMachineForm.setting.factoryDate = item.setting.factoryDate;
        this.editMachineForm.setting.purchasePrice = item.setting.purchasePrice;
        this.editMachineForm.setting.residualValue = item.setting.residualValue;
      } else {
        this.editMachineForm.setting.factoryNo = null;
        this.editMachineForm.setting.factoryNo = null;
        this.editMachineForm.setting.factoryDate = new Date()
          .toISOString()
          .substr(0, 10);
        this.editMachineForm.setting.purchasePrice = null;
        this.editMachineForm.setting.residualValue = null;
      }
      //this.editedIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
      // console.log(item.img);
      if (item.img != null) {
        let Uint8 = new Uint8Array();
        var startIndex = item.img.indexOf("base64,") + 7;
        var b64 = item.img.substr(startIndex);
        Uint8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        var data = new Blob([Uint8], { type: "image/jpeg" });

        //console.log(window.URL.createObjectURL(data));
        //var img=URL.createObjectURL(data);
        this.url = URL.createObjectURL(data);
      }
      this.editDialog = true;
    },
    singleFileToBase64(file, reader) {
      reader = new FileReader();
      // read the file into a base64 format
      reader.readAsDataURL(file);

      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          reader.abort();
          reject("Insert error message here");
        };

        // return the base 64 string
        reader.onload = function() {
          this.uploadImg = reader.result.toString();
          //console.log(this.uploadImg);
          var startIndex = this.uploadImg.indexOf("base64,") + 7;
          var b64 = this.uploadImg.substr(startIndex);
          let Uint8 = new Uint8Array();
          Uint8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
          var data = new Blob([Uint8], { type: "image/jpeg" });
          //console.log(window.URL.createObjectURL(data));
          //var img=URL.createObjectURL(data);
          this.url = URL.createObjectURL(data);
          resolve(reader.result);
        };
      });
    },
    base64ToByteArray(base64String) {
      try {
        var sliceSize = 1024;
        var byteCharacters = atob(base64String);
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);

        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
          var begin = sliceIndex * sliceSize;
          var end = Math.min(begin + sliceSize, bytesLength);

          var bytes = new Array(end - begin);
          for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
          }
          byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return byteArrays;
      } catch (e) {
        //console.log("Couldn't convert to byte array: " + e);
        return undefined;
      }
    },
    base64ToArrayBuffer(base64) {
      var binary_string = window.atob(base64);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    },
    async editMachine() {
      var attach = null;
      var reader = [];
      let imgValue;
      //console.log(this.selectedFile);
      if (this.selectedFile != undefined) {
        attach = await this.singleFileToBase64(this.selectedFile, reader).then(
          x => (imgValue = x)
        );
        this.editMachineForm.img = imgValue;
        // console.log(imgValue);
        var startIndex = imgValue.indexOf("base64,") + 7;
        var b64 = imgValue.substr(startIndex);
        //let Uint8 = new Uint8Array();
        //Uint8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

        var bytes = this.base64ToByteArray(b64);
      }
      let toolMagazine = {};
      if (this.toolMagazineEdit == true) {
        toolMagazine = this.selectedMachine.toolMagazineData;
      } else {
        for (let i = 0; i < this.editMachineForm.toolMagazine; i++) {
          toolMagazine[i + 1] = null;
        }
      }
      const token = this.$store.state.authUser.token;

      const line = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        no: this.editMachineForm.no,
        name: this.editMachineForm.name,
        areaNo: this.areaSelected,
        brand: this.editMachineForm.brand,
        series: this.editMachineForm.series,
        type: this.editMachineForm.type,
        use: this.editMachineForm.use,
        image: this.editMachineForm.image,
        lineNo: this.lineSelected,
        img: this.editMachineForm.img,
        notice: this.editMachineForm.notice,
        toolMagazine: toolMagazine,
        parameter: this.selectedMachine.parameterData,
        setting: this.editMachineForm.setting
      };

      this.$axios
        .post(`/Machine/update`, line, {
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
          //this.refreshMachineData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
      this.editMachineForm.no = "";
      this.editMachineForm.name = "";
      this.editMachineForm.notice = "";
      this.editMachineForm.brand = "";
      this.editMachineForm.series = "";
      this.editMachineForm.type = "";
      this.editMachineForm.use = "";
      this.editMachineForm.image = "";
      this.editMachineForm.setting.country = null;
      this.editMachineForm.setting.factoryNo = null;
      this.editMachineForm.setting.factoryDate = new Date()
        .toISOString()
        .substr(0, 10);
      this.editMachineForm.setting.purchasePrice = null;
      this.editMachineForm.setting.residualValue = null;
      this.image = undefined;
    },
    deleteMachine() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;
      const line = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        no: this.deleteMachineData.no,
        name: this.deleteMachineData.name,
        Status: "Y"
      };
      //console.log(line);

      this.$axios
        .delete(`/Machine/delete/${this.deleteMachineData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(this.$t("deleteSuccess"), "", "success");
          } else {
            this.$swal(res.data.msg, "", "error");
          }
          //this.refreshMachineData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    closeEditMachineDialog() {
      this.editDialog = false;
      this.selectedFile = undefined;
      this.editMachineForm.img = null;
      this.image = undefined;
      this.url = "";
    },
    refreshMachineData() {
      this.loading = 1;
      this.machineList = [];
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Machine/Search?value=${this.MachineSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          // console.log(res.data.data);
          this.machineList = res.data.data != null ? res.data.data : [];
          this.loading = 0;
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      //console.log(item);
      this.deleteMachineData.id = item.id;
    }
  },
  mounted() {
    this.machineList = this.machineData;
    // this.areaList = this.areaData;
    // this.lineList = this.lineData;
  },
  computed: {},
  created() {
    this.machineList = this.machineData;
    // this.areaList = this.areaData;
    // this.lineList = this.lineData;
  }
};
</script>
<style>
/* .v-data-table /deep/ .sticky-header {
  position: sticky;
  z-index: 2;
}

.v-data-table /deep/ .v-data-table__wrapper {
  overflow: unset;
} */
table > tbody > tr > td.fixed:nth-child(2),
table > thead > tr > th.fixed:nth-child(2) {
  position: sticky !important;
  position: -webkit-sticky !important;
  left: 62px;
  z-index: 3;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.15) 2.4px 0px 3.2px;
}
table > tbody > tr > td.fixed:nth-child(1),
table > thead > tr > th.fixed:nth-child(1) {
  position: sticky !important;
  position: -webkit-sticky !important;
  left: 0;
  z-index: 3;
  background: white;
}
table > thead > tr > th.fixed:nth-child(1) {
  z-index: 3;
}
</style>
