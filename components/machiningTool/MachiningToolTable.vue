<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯刀具彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("machiningTool") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="addForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="4" md="4">
                    <v-text-field
                      ref="toolNo"
                      :label="'*' + $t('machiningTool') + $t('No')"
                      v-model="editToolForm.no"
                      disabled
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <v-text-field
                      ref="toolName"
                      :label="'*' + $t('machiningTool') + $t('name')"
                      :rules="nameRules"
                      v-model="editToolForm.name"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <v-text-field
                      ref="partNo"
                      :label="'*' + $t('machiningTool') + $t('partNo')"
                      :rules="nameRules"
                      v-model="editToolForm.partNo"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <v-text-field
                      ref="toolBrand"
                      :label="$t('machiningTool') + $t('brand')"
                      v-model="editToolForm.brand"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <v-text-field
                      ref="toolSeries"
                      :label="$t('machiningTool') + $t('series')"
                      v-model="editToolForm.series"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <v-select
                      ref="toolType"
                      :label="'*' + $t('machiningTool') + $t('type')"
                      :items="toolTypeList"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      v-model="editToolForm.type"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="6" sm="6" md="3">
                    <v-text-field
                      ref="toolDiameter"
                      :label="$t('toolDiameter')"
                      v-model="editToolForm.toolDiameter"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="3">
                    <v-text-field
                      ref="toolTipRadius"
                      :label="$t('toolTipRadius')"
                      v-model="editToolForm.tipRadius"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="3">
                    <v-text-field
                      ref="price"
                      :label="$t('price')"
                      v-model="editToolForm.price"
                      type="number"
                      oninput="if(this.value < 0) this.value = 0;"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="3">
                    <v-text-field
                      ref="cost"
                      :label="$t('cost')"
                      v-model="editToolForm.cost"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="6">
                    <v-text-field
                      ref="toolLife"
                      :label="$t('toolLife') + '(min)'"
                      v-model="editToolForm.toolLife"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" md="6">
                    <v-text-field
                      ref="toolLife"
                      :label="$t('elapsedTime') + '(min)'"
                      v-model="editToolForm.elapsedTime"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="notice"
                      :label="$t('description')"
                      v-model="editToolForm.notice"
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
                  <v-col cols="12" sm="12" md="12">
                    <img :src="url" width="100%" />
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn class="gray" @click="closeEditToolDialog()">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editTool()">
              {{ $t("confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除刀具彈窗 -->
      <v-dialog v-model="deleteDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("machiningTool") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("machiningTool") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteTool()">
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
        :headers="headers"
        :items="toolList"
        :single-expand="singleExpand"
        :items-per-page="itemsPerPage"
        :sort-by="['no']"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
        show-expand
        @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
      >
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <div class="mt-2 mb-2">
              <v-data-table
                dense
                :headers="machiningToolLogHeaders"
                :items="item.machiningToolLog"
                :items-per-page="10"
                :sort-by="['logDate']"
                :sort-desc="sort"
                class="elevation-1  mytable"
              >
                <template v-slot:item.logDate="{ item }">
                  {{ new Date(item.logDate).toLocaleString() }}
                </template>
                <template v-slot:item.status="{ item }">
                  {{ $t(item.status) }}
                </template>
                <template v-slot:item.toolNum="{ item }">
                  <v-chip small label>
                    {{ item.toolNum }}
                  </v-chip>
                </template>
                <template v-slot:item.machineName="{ item }">
                  <v-chip small color="primary" v-if="item.machine != null">
                    {{ item.machine.name }}
                  </v-chip>
                </template>
                <template v-slot:item.usedPercentage="{ item }">
                  <v-progress-linear
                    height="20"
                    striped
                    :color="
                      getUsedColor(
                        usedPercentage(item.toolLife, item.elapsedTime)
                      )
                    "
                    :value="usedPercentage(item.toolLife, item.elapsedTime)"
                  >
                    <strong
                      >{{
                        usedPercentage(item.toolLife, item.elapsedTime)
                      }}%</strong
                    >
                  </v-progress-linear>
                </template>
              </v-data-table>
            </div>
          </td>
        </template>
        <template v-slot:item.image="{ item }">
          <v-avatar
            v-if="item.img == null"
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
            v-if="item.img != null"
            :src="item.img"
            @click="displayImage(item.img)"
            width="30"
            contain
          ></v-img>
        </template>
        <template v-slot:item.usedPercentage="{ item }">
          <v-progress-linear
            height="20"
            striped
            :color="
              getUsedColor(usedPercentage(item.toolLife, item.elapsedTime))
            "
            :value="usedPercentage(item.toolLife, item.elapsedTime)"
          >
            <strong
              >{{ usedPercentage(item.toolLife, item.elapsedTime) }}%</strong
            >
          </v-progress-linear>
        </template>
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon
            :disabled="item.machine != null"
            small
            @click="showDeleteDialog(item)"
          >
            mdi-delete
          </v-icon>
        </template>
        <template v-slot:item.machine.name="{ item }">
          <v-chip small color="primary" v-if="item.machine != null">
            {{ item.machine.name }}
          </v-chip>
          <v-chip v-else> </v-chip>
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
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    toolData: {},
    isLoading: null
  },
  data() {
    return {
      imageDialog: false,
      singleExpand: true,
      sort: true,
      loading: null,
      url: "",
      valid: true,
      image: undefined,
      toolTypeList: setting.machiningToolType,
      toolImg: null,
      selectedFile: undefined,
      toolList: [],
      toolSearchValue: "",
      toolSearchType: "partNo",
      editDialog: false,
      deleteDialog: false,
      toolTypeSelected: null,
      errorMessage: "",
      nameRules: [v => !!v || this.$t("mustInput")],
      noRules: [v => !!v || this.$t("mustInput")],
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      deleteToolData: {
        no: null,
        name: null,
        id: null
      },
      editToolForm: {
        id: null,
        machineId: null,
        no: null,
        name: null,
        partNo: null,
        brand: null,
        series: null,
        type: null,
        count: 1,
        toolDiameter: 0,
        tipRadius: 0,
        status,
        elapsedTime: null,
        toolLife: null,
        toolHolderNum: null,
        img: null,
        notice: null,
        price: 0,
        cost: null
      },
      headers: [
        {
          text: this.$t("image"),
          value: "image",
          align: "start",
          sortable: false,
          width: "5%"
        },
        {
          text: this.$t("machineName"),
          value: "machine.name",
          align: "start",
          sortable: true,
          width: "100px"
        },
        {
          text: this.$t("No"),
          value: "no",
          align: "start",
          sortable: true,
          width: "8%"
        },
        {
          text: this.$t("partNo"),
          value: "partNo",
          align: "start",
          sortable: true,
          width: "8%"
        },
        {
          text: this.$t("name"),
          value: "name",
          sortable: false,
          width: "8%"
        },
        {
          text: this.$t("brand"),
          value: "brand",
          sortable: false,
          width: "6%"
        },
        {
          text: this.$t("price"),
          value: "price",
          sortable: false,
          width: "6%"
        },
        {
          text: this.$t("cost"),
          value: "cost",
          sortable: false,
          width: "6%"
        },
        {
          text: this.$t("series"),
          value: "series",
          sortable: false,
          width: "6%"
        },
        {
          text: this.$t("type"),
          value: "type",
          sortable: false,
          width: "6%"
        },
        {
          text: this.$t("toolDiameter"),
          value: "toolDiameter",
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("toolTipRadius"),
          value: "tipRadius",
          sortable: false,
          width: "100px"
        },
        {
          text: `${this.$t("toolLife")}(min)`,
          value: "toolLife",
          sortable: false,
          width: "150px"
        },
        {
          text: `${this.$t("elapsedTime")}(%)`,
          value: "usedPercentage",
          sortable: false,
          width: "150px"
        },
        {
          text: this.$t("notice"),
          value: "notice",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          width: "100px"
        },
        {
          text: this.$t("history"),
          value: "data-table-expand",
          align: "center",
          sortable: false,
          width: "30px"
        }
      ],
      machiningToolLogHeaders: [
        {
          text: this.$t("time"),
          value: "logDate",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("status"),
          value: "status",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("equipment"),
          value: "machineName",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("address"),
          value: "toolNum",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: this.$t("operator"),
          value: "logUser.name",
          align: "start",
          sortable: true,
          width: "10%",
          class: "grey lighten-3"
        },
        {
          text: `${this.$t("elapsedTime")}(%)`,
          value: "usedPercentage",
          sortable: false,
          width: "10%",
          class: "grey lighten-3"
        }
      ]
    };
  },
  watch: {
    toolData() {
      this.toolList = this.toolData;
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
    Preview_image(file) {
      this.selectedFile = file;
      if (this.selectedFile == undefined) {
        this.url = "";

        return;
      }
      this.progress = 0;
      this.currentFile = file;
      var attach = null;
      var reader = [];
      // attach = this.singleFileToBase64(file, reader);
      this.url = URL.createObjectURL(this.selectedFile);
    },
    editItem(item) {
      this.editToolForm.id = item.id;
      this.editToolForm.partNo = item.partNo;
      this.editToolForm.machineId = item.machineId;
      this.editToolForm.no = item.no;
      this.editToolForm.name = item.name;
      this.editToolForm.brand = item.brand;
      this.editToolForm.series = item.series;
      this.editToolForm.type = item.type;
      this.editToolForm.toolDiameter = item.toolDiameter;
      this.editToolForm.tipRadius = item.tipRadius;
      this.editToolForm.notice = item.notice;
      this.editToolForm.img = item.img;
      this.editToolForm.elapsedTime = item.elapsedTime;
      this.editToolForm.toolLife = item.toolLife;
      this.editToolForm.cost = item.cost;
      this.editToolForm.price = item.price;
      if (item.img != null) {
        let Uint8 = new Uint8Array();
        var startIndex = item.img.indexOf("base64,") + 7;
        var b64 = item.img.substr(startIndex);
        Uint8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        var data = new Blob([Uint8], { type: "image/jpeg" });
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
          var startIndex = this.uploadImg.indexOf("base64,") + 7;
          var b64 = this.uploadImg.substr(startIndex);
          let Uint8 = new Uint8Array();
          Uint8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
          var data = new Blob([Uint8], { type: "image/jpeg" });
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
        console.log("Couldn't convert to byte array: " + e);
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
    async editTool() {
      var attach = null;
      var reader = [];
      let imgValue;
      if (this.selectedFile != undefined) {
        attach = await this.singleFileToBase64(this.selectedFile, reader).then(
          x => (imgValue = x)
        );
        this.editToolForm.img = imgValue;
        var startIndex = imgValue.indexOf("base64,") + 7;
        var b64 = imgValue.substr(startIndex);
        //let Uint8 = new Uint8Array();
        //Uint8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

        var bytes = this.base64ToByteArray(b64);
      }
      const token = this.$store.state.authUser.token;
      const tool = this.editToolForm;
      this.$axios
        .post(`/MachiningTool/update`, tool, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
            this.$emit("update");
          } else {
            this.$swal("", this.$t("editFailed"), "error");
          }
          //this.refreshToolData();
          this.editDialog = false;
        })
        .then(() => {});
      this.editToolForm.no = "";
      this.editToolForm.name = "";
      this.editToolForm.notice = "";
      this.editToolForm.brand = "";
      this.editToolForm.series = "";
      this.editToolForm.type = "";
      this.editToolForm.use = "";
      this.editToolForm.image = "";
      this.image = undefined;
    },
    deleteTool() {
      const token = this.$store.state.authUser.token;
      const tool = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        no: this.deleteToolData.partNo,
        name: this.deleteToolData.name,
        Status: "Y"
      };
      this.$axios
        .delete(`/MachiningTool/delete/${this.deleteToolData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
          } else {
            this.$swal("", this.$t("editFailed"), "error");
          }
          //this.refreshToolData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    closeEditToolDialog() {
      this.editDialog = false;
      this.selectedFile = undefined;
      this.editToolForm.img = null;
      this.image = undefined;
      this.url = "";
    },
    refreshToolData() {
      this.loading = 1;
      this.toolList = [];
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
          this.toolList = res.data.data != null ? res.data.data : [];
          this.loading = 0;
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      this.deleteToolData.id = item.id;
    },
    usedPercentage(toolLife, elapsedTime) {
      let percent = (elapsedTime / toolLife) * 100;
      return percent.toFixed(2);
    },
    getUsedColor(value) {
      let color = "amber darken-1";
      if (value <= 50 && value >= 0) {
        color = "success";
      } else if (value > 50 && value < 80) {
        color = "amber darken-1";
      } else if (value > 80) {
        color = "red";
      }
      return color;
    }
  },
  mounted() {
    this.toolList = this.toolData;
  },
  computed: {},
  created() {
    this.toolList = this.toolData;
  }
};
</script>
