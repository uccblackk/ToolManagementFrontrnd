<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-row>
        <!-- 新增按鈕 -->
        <v-col cols="2" md="2">
          <v-flex d-flex justify-end>
            <!-- 新增設備彈窗 -->
            <v-dialog v-model="addMachineDialog" persistent max-width="800px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  class="mt-4"
                  width="100%"
                  @click.stop="showAddMachineDialog()"
                >
                  <v-icon left dark>
                    mdi-plus-thick
                  </v-icon>
                  {{ $t("add") }}
                </v-btn>
              </template>
              <v-card ref="form">
                <v-card-title class="info">
                  <span class=" headline white--text">
                    {{ $t("add") }}{{ $t("equipment") }}</span
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
                            :rules="[v => !!v || this.$t('mustInput')]"
                            v-model="addMachineForm.no"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <!-- {{ $t("lineName") }}* -->
                          <v-text-field
                            ref="machineName"
                            :label="'*' + $t('equipment') + $t('name')"
                            :rules="[v => !!v || this.$t('mustInput')]"
                            v-model="addMachineForm.name"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <!-- {{ $t("lineName") }}* -->
                          <v-select
                            ref="machineType"
                            :label="'*' + $t('equipment') + $t('type')"
                            :items="machineTypeList"
                            :rules="[v => !!v || this.$t('mustInput')]"
                            v-model="addMachineForm.type"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-select
                            class="mt-2"
                            v-model="areaSelected"
                            :items="addMachineForm.areaList"
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
                            :items="lineList"
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
                            v-model="addMachineForm.brand"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                          <!-- {{ $t("lineName") }}* -->
                          <v-text-field
                            ref="machineSeries"
                            :label="$t('equipment') + $t('series')"
                            v-model="addMachineForm.series"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                          <!-- {{ $t("lineName") }}* -->
                          <v-text-field
                            ref="machineBrand"
                            :label="$t('manufature') + $t('country')"
                            v-model="addMachineForm.setting.country"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                          <!-- {{ $t("lineName") }}* -->
                          <v-text-field
                            number
                            ref="machineSeries"
                            :label="$t('machineToolMagazine') + $t('count')"
                            v-model="addMachineForm.toolMagazine"
                            oninput="if(this.value < 1) this.value = 1;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                            :max="toolMagazineMaxCount"
                            type="number"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            ref="machineSeries"
                            :label="$t('factoryNo')"
                            v-model="addMachineForm.setting.factoryNo"
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
                                v-model="addMachineForm.setting.factoryDate"
                                :label="$t('factoryDate')"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                style="margin-top:-10px"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="addMachineForm.setting.factoryDate"
                              @input="menu = false"
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            ref="machineSeries"
                            :label="$t('purchasePrice')"
                            v-model="addMachineForm.setting.purchasePrice"
                            oninput="if(this.value < 0) this.value = 0;"
                            type="number"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            ref="machineSeries"
                            :label="$t('residualValue')"
                            v-model="addMachineForm.setting.residualValue"
                            oninput="if(this.value < 0) this.value = 0;"
                            type="number"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="12" md="12">
                          <v-text-field
                            ref="notice"
                            :label="$t('description')"
                            v-model="addMachineForm.notice"
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
                          <img :src="url" width="100%" />
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-container>
                  <small>*{{ $t("inputRequired") }}</small>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="gray" @click="addMachineDialog = false">{{
                    $t("cancel")
                  }}</v-btn>
                  <v-btn class="info" dark text @click="addMachine()">
                    {{ $t("add") }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- 異常視窗 -->
            <v-dialog v-model="errorDialog" persistent max-width="300px">
              <v-card>
                <v-card-title class="error">
                  <span class=" white--text"> {{ $t("error") }}</span>
                </v-card-title>
                <v-card-text>
                  <div class="mt-4">
                    <span style="font-size:18px;font-weight:bold">
                      {{ message }}
                    </span>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    class="gray"
                    @click="(errorDialog = false), (showAddDialog = false)"
                    >{{ $t("close") }}</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-flex>
        </v-col>
        <!-- 生產區域選單 -->
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
        <!-- 搜尋欄 -->
        <v-col cols="8" md="4">
          <v-form onSubmit="return false;">
            <v-text-field
              clearable
              v-model="machineSearchValue"
              :label="this.$t('equipment') + this.$t('search')"
              append-icon="mdi-magnify"
              required
              @click:append="onSearch"
              @keyup.enter="onSearch()"
            ></v-text-field>
          </v-form>
        </v-col>
      </v-row>
    </v-flex>
    <v-flex xs12 class="mx-1">
      <MachineTable
        :machineData="machineList"
        :areaData="addMachineForm.areaList"
        :lineData="lineList"
        :isLoading="isLoading"
        @update="onSearch"
      />
    </v-flex>
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",
  data() {
    return {
      menu: false,
      toolMagazineMaxCount: 50,
      isLoading: 0,
      url: "",
      image: undefined,
      machineTypeList: ["CNC", "Robot", "EDM", "EW", "ED", "UPL", "MI", "SG"],
      valid: true,
      uploadImg: "",
      formHasErrors: false,
      errorMessages: "",
      machineSearchValue: "",
      machineList: {},
      areaSelected: null,
      areaList: [],
      areaData: {},
      lineSelected: null,
      lineList: {},
      seletedFile: undefined,
      addMachineDialog: false,
      errorDialog: false,
      station: "",
      message: "",
      currentFile: undefined,
      progress: 0,
      nameRules: [v => !!v || this.$t("mustInput")],
      noRules: [v => !!v || this.$t("mustInput")],
      areaRules: [v => v == null || this.$t("mustInput")],
      addMachineForm: {
        areaList: [],
        no: null,
        name: null,
        brand: null,
        series: null,
        type: null,
        use: null,
        image: null,
        notice: null,
        toolMagazine: 1,
        setting: {
          country: "",
          factoryNo: "",
          factoryDate: new Date().toISOString().substr(0, 10),
          purchasePrice: "0",
          residualValue: "0"
        }
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      lineData: [],

      exceptionReasonList: [],
      exceptionActionList: []
    };
  },
  computed: {
    form() {
      return {
        lineNo: this.lineNo,
        lineName: this.lineName
      };
    }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(x => x.menu_no == "machine") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let machineResponse = await app.$axios.$get(`/Machine/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    let response = await app.$axios.$get(`/Area/Search?name=`, {
      headers: {
        Authorization: token
      }
    });

    let areaList = response.data;

    return {
      machineList: machineResponse.data,
      areaList: areaList
    };
  },
  methods: {
    Preview_image(file) {
      this.seletedFile = file;
      // console.log(this.seletedFile);
      if (this.image == undefined) {
        this.url = "";

        return;
      }
      this.progress = 0;
      this.currentFile = file;
      var attach = null;
      var reader = [];
      attach = this.singleFileToBase64(file, reader);
      //  console.log(this.uploadImg);
      this.url = URL.createObjectURL(this.image);
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
    base64ToArrayBuffer(base64) {
      var binary_string = window.atob(base64);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    },
    onSearch() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/Machine/Search?value=${this.machineSearchValue}&areaNo=${this.areaData.areaNo}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.machineList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
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

    async addMachine() {
      var attach = null;
      var reader = [];
      let imgValue;
      if (this.seletedFile != undefined) {
        attach = await this.singleFileToBase64(this.seletedFile, reader).then(
          x => (imgValue = x)
        );
        var startIndex = imgValue.indexOf("base64,") + 7;
        var b64 = imgValue.substr(startIndex);
        //let Uint8 = new Uint8Array();
        //Uint8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

        var bytes = this.base64ToByteArray(b64);
      } else {
        imgValue: null;
      }
      let toolMagazine = {};
      for (let i = 0; i < this.addMachineForm.toolMagazine; i++) {
        toolMagazine[i + 1] = null;
      }

      // console.log(toolMagazine);
      // return;
      const token = this.$store.state.authUser.token;
      const machine = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        no: this.addMachineForm.no,
        name: this.addMachineForm.name,
        areaNo: this.areaSelected,
        lineNo: this.lineSelected,
        brand: this.addMachineForm.brand,
        series: this.addMachineForm.series,
        type: this.addMachineForm.type,
        use: this.addMachineForm.use,
        image: this.addMachineForm.image,
        img: imgValue,
        notice: this.addMachineForm.notice,
        toolMagazine: toolMagazine,
        setting: this.addMachineForm.setting,
        parameter: {}
      };
      // console.log(machine);
      // return;
      if (
        this.areaSelected == null ||
        this.addMachineForm.no == null ||
        this.addMachineForm.name == null ||
        this.addMachineForm.type == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }

      this.$axios
        .post(`/Machine/create`, machine, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data);
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
          } else {
            this.$swal("", res.data.msg, "error");
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.areaData = this.areaList[0];
          this.refreshMachineData();
          this.addMachineDialog = false;
        })
        .then(() => {});
    },
    refreshMachineData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Machine/Search?value=${this.machineSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //  console.log(res.data.data);
          this.machineList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
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
          // console.log(res.data.data);
          this.areaList = res.data.data != null ? res.data.data : [];
        });
    },
    getLineData() {
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(`/Line/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.lineList = res.data.data != null ? res.data.data : [];
          var item = {
            lineNo: null,
            lineName: "無"
          };
          this.lineList.splice(0, 0, item);
        });
    },
    async showAddMachineDialog() {
      this.addMachineDialog = true;
      this.addMachineForm.no = null;
      this.addMachineForm.name = null;
      this.addMachineForm.notice = "";
      this.addMachineForm.brand = "";
      this.addMachineForm.series = "";
      this.addMachineForm.type = this.machineTypeList[0];
      this.addMachineForm.use = "";
      this.addMachineForm.image = "";
      this.addMachineForm.toolMagazine = 1;
      this.areaSelected = this.addMachineForm.areaList[0].areaNo;
      this.image = undefined;
      this.url = "";
      this.addMachineForm.setting.factoryNo = "";
      this.addMachineForm.setting.country = "";
      this.addMachineForm.setting.purchasePrice = "0";
      this.addMachineForm.setting.residualValue = "0";
      this.addMachineForm.setting.factoryDate = new Date()
        .toISOString()
        .substr(0, 10);
      //  console.log(this.uploadImg);
    }
  },
  mounted() {
    // this.getAreaData();

    this.addMachineForm.areaList = this.areaList.slice(0);

    this.areaList.unshift({ areaName: "*", areaNo: null });
    this.areaData = this.areaList[0];

    this.getLineData();
    // this.refreshMachineData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("equipment")
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
