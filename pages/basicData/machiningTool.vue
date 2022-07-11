<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-form>
        <v-container>
          <v-row>
            <!-- 新增按鈕 -->
            <v-col cols="2" md="2">
              <v-flex d-flex justify-end>
                <!-- 新增刀具彈窗 -->
                <v-dialog v-model="addToolDialog" persistent max-width="600px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      class="mt-4"
                      width="100%"
                      @click.stop="showAddToolDialog()"
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
                        {{ $t("add") }}{{ $t("machiningTool") }}</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-form ref="addForm" v-model="valid" lazy-validation>
                          <v-row>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="no"
                                :label="'*' + $t('machiningTool') + $t('No')"
                                :rules="noRules"
                                v-model="addToolForm.no"
                                required
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="toolName"
                                :label="'*' + $t('machiningTool') + $t('name')"
                                :rules="nameRules"
                                v-model="addToolForm.name"
                                required
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="partNo"
                                :label="
                                  '*' + $t('machiningTool') + $t('partNo')
                                "
                                :rules="nameRules"
                                v-model="addToolForm.partNo"
                                required
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="toolBrand"
                                :label="$t('machiningTool') + $t('brand')"
                                v-model="addToolForm.brand"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="toolSeries"
                                :label="$t('machiningTool') + $t('series')"
                                v-model="addToolForm.series"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-select
                                ref="toolType"
                                :label="'*' + $t('machiningTool') + $t('type')"
                                :items="toolTypeList"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                v-model="addToolForm.type"
                                required
                              ></v-select>
                            </v-col>
                            <v-col cols="6" sm="6" md="6">
                              <v-text-field
                                ref="toolDiameter"
                                :label="$t('toolDiameter')"
                                v-model="addToolForm.toolDiameter"
                                oninput="if(this.value < 1) this.value = 1;"
                                type="number"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" sm="6" md="6">
                              <v-text-field
                                ref="toolTipRadius"
                                :label="$t('toolTipRadius')"
                                v-model="addToolForm.tipRadius"
                                oninput="if(this.value < 0) this.value = 0;"
                                type="number"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="price"
                                :label="$t('price')"
                                v-model="addToolForm.price"
                                type="number"
                                oninput="if(this.value < 0) this.value = 0;"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="cost"
                                :label="$t('cost')"
                                v-model="addToolForm.cost"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                              <v-text-field
                                ref="toolLife"
                                :label="$t('toolLife')"
                                v-model="addToolForm.toolLife"
                                type="number"
                                oninput="if(this.value < 1) this.value = 1;"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <v-text-field
                                ref="notice"
                                :label="$t('description')"
                                v-model="addToolForm.notice"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
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
                      <v-btn class="gray" @click="addToolDialog = false">{{
                        $t("cancel")
                      }}</v-btn>
                      <v-btn class="info" dark text @click="addTool()">
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
            <!-- 搜尋欄 -->
            <v-col cols="8" md="10">
              <v-form onSubmit="return false;">
                <v-text-field
                  clearable
                  v-model="toolSearchValue"
                  :label="this.$t('machiningTool') + this.$t('search')"
                  append-icon="mdi-magnify"
                  required
                  @click:append="onSearch"
                  @keyup.enter="onSearch()"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-flex>
    <v-flex xs12 class="mx-1">
      <MachiningToolTable
        :toolData="toolList"
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
      message: "",
      isLoading: 0,
      url: "",
      image: undefined,
      toolTypeList: setting.machiningToolType,
      valid: true,
      uploadImg: "",
      formHasErrors: false,
      errorMessages: "",
      toolSearchValue: "",
      toolSearchType: "partNo",
      toolList: {},
      errorDialog: false,
      addToolDialog: false,
      nameRules: [v => !!v || this.$t("mustInput")],
      noRules: [v => !!v || this.$t("mustInput")],
      addToolForm: {
        machine: null,
        no: null,
        partNo: null,
        name: null,
        brand: null,
        series: null,
        type: setting.machiningToolType[0],
        toolDiameter: 1,
        tipRadius: 0,
        toolLife: 500,
        elapsedTime: 0,
        image: null,
        notice: null,
        price: 0,
        cost: null
      },
      searchType: "partNo",
      searchValue: ""
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
      store.state.authUser.authority.find(x => x.menu_no == "machiningTool") ==
      undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let toolResponse = await app.$axios.$get(`/MachiningTool/Search?partNo=`, {
      headers: {
        Authorization: token
      }
    });

    return {
      toolList: toolResponse.data
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
        .get(`/MachiningTool/Search?partNo=${this.toolSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.toolList = res.data.data != null ? res.data.data : [];
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

    async addTool() {
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
      if (
        this.addToolForm.no == null ||
        this.addToolForm.name == null ||
        this.addToolForm.partNo == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }
      console.log(this.addToolForm);

      const token = this.$store.state.authUser.token;
      const tool = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        no: this.addToolForm.no,
        partNo: this.addToolForm.partNo,
        name: this.addToolForm.name,
        brand: this.addToolForm.brand,
        price: this.addToolForm.price,
        cost: this.addToolForm.cost,
        series: this.addToolForm.series,
        type: this.addToolForm.type,
        toolDiameter: this.addToolForm.toolDiameter,
        tipRadius: this.addToolForm.tipRadius,
        toolLife: this.addToolForm.toolLife,
        elapsedTime: this.addToolForm.elapsedTime,
        image: this.addToolForm.image,
        img: imgValue,
        notice: this.addToolForm.notice
      };

      if (
        this.addToolForm.partNo == null ||
        this.addToolForm.name == null ||
        this.addToolForm.type == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }

      this.$axios
        .post(`/MachiningTool/create`, tool, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
          } else {
            this.$swal("", res.data.msg, "error");
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshToolData();
          this.addToolDialog = false;
        })
        .then(() => {});
    },
    refreshToolData() {
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(
          `/MachiningTool/Search?${this.toolSearchType}=${this.toolSearchValue}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          //  console.log(res.data.data);
          this.toolList = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },

    getToolData() {
      const token = this.$store.state.authUser.token;
      let type = this.toolSearchType;
      this.$axios
        .get(`/MachiningTool/Search?${type}=`, {
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
    showAddToolDialog() {
      this.addToolDialog = true;
      this.addToolForm.partNo = null;
      this.addToolForm.name = null;
      this.addToolForm.notice = null;
      this.addToolForm.brand = null;
      this.addToolForm.series = null;
      this.addToolForm.type = setting.machiningToolType[0];
      this.addTool.toolDiameter = 1;
      this.addTool.tipRadius = 0;
      this.addToolForm.toolLife = 500;
      this.addToolForm.elapsedLife = 0;
      this.addToolForm.image = "";
      this.image = undefined;
      this.url = "";
      //  console.log(this.uploadImg);
    }
  },
  mounted() {
    this.getToolData();
    // this.refreshToolData();
  },
  computed: {},
  created() {},
  head() {
    return {
      title: this.$t("machiningTool")
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
