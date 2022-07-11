<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 編輯產品彈窗 -->
      <v-dialog v-model="editDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("product") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemNo"
                      :label="$t('itemNo')"
                      v-model="editItemForm.no"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemName"
                      :label="$t('itemName')"
                      v-model="editItemForm.name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemSpec"
                      :label="$t('itemSpec')"
                      v-model="editItemForm.spec"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemDesc"
                      :label="$t('itemDesc')"
                      v-model="editItemForm.desc"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="itemQty"
                      :label="$t('itemQty')"
                      v-model="editItemForm.qty"
                      type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="editDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editItem()">
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
              {{ $t("delete") }}{{ $t("product") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("product") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteItem()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="itemList"
        :items-per-page="itemsPerPage"
        :sort-by="['ItemNo']"
        :loading="isLoading == 1"
        loading-text="Loading... Please wait"
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        hide-default-footer
      >
        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="edit(item)">
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
  </v-layout>
</template>
<script>
import moment from "moment";
const setting = require(`@/static/setting/setting.json`);
export default {
  props: {
    itemData: {},
    isLoading: null
  },
  data() {
    return {
      itemList: [],
      ItemSearchValue: "",
      editDialog: false,
      deleteDialog: false,
      ItemName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editItemForm: {
        id: null,
        no: null,
        name: null,
        spec: null,
        desc: null,
        qty: null
      },
      deleteItemData: {
        no: null,
        name: null,
        id: null
      },
      headers: [
        {
          text: this.$t("itemNo"),
          value: "itemNo",
          align: "start",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("itemName"),
          value: "itemName",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("itemSpec"),
          value: "itemSpec",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("itemDesc"),
          value: "description",
          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("itemQty"),
          value: "stdLotQty",
          sortable: false,
          width: "10%"
        },

        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          width: "10%"
        }
      ]
    };
  },
  watch: {
    itemData() {
      // console.log(this.itemData);
      this.itemList = this.itemData;
    }
  },
  methods: {
    edit(item) {
      // console.log(item);
      this.editDialog = true;
      this.editItemForm.id = item.id;
      this.editItemForm.no = item.itemNo;
      this.editItemForm.name = item.itemName;
      this.editItemForm.spec = item.itemSpec;
      this.editItemForm.desc = item.description;
      this.editItemForm.qty = item.stdLotQty;
      //this.editedIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
    },
    editItem() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });

      const token = this.$store.state.authUser.token;
      const Item = {
        id: this.editItemForm.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.editItemForm.no,
        itemName: this.editItemForm.name,
        itemSpec: this.editItemForm.spec,
        description: this.editItemForm.desc,
        itemType: "1",
        stdLotQty: this.editItemForm.qty,
        status: "Y"
      };
      this.editItemForm.no = "";
      this.editItemForm.name = "";
      this.editItemForm.spec = "";
      this.editItemForm.desc = "";
      this.editItemForm.qty = "";

      this.$axios
        .post(`/Item/update`, Item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(Item.name, this.$t("editSuccess"), "success");
          } else {
            this.$swal(this.$t("editFailed"), "", "error");
          }
          //this.refreshItemData();
          this.$emit("update");
          this.editDialog = false;
        })
        .then(() => {});
    },
    deleteItem() {
      // this.dialog = false;
      // this.formHasErrors = false;

      // Object.keys(this.form).forEach(f => {
      //   if (!this.form[f]) this.formHasErrors = true;

      //   this.$refs[f].validate(true);
      // });
      const token = this.$store.state.authUser.token;

      //console.log(Item);
      this.deleteItemData.no = "";
      this.deleteItemData.name = "";

      this.$axios
        .delete(`/Item/delete/${this.deleteItemData.id}`, {
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
          // this.refreshItemData();
          this.$emit("update");
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshItemData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Item/Search?value=${this.ItemSearchValue}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          console.log(res.data.data);
          this.itemList = res.data.data != null ? res.data.data : [];
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deleteItemData.no = item.ItemNo;
      this.deleteItemData.name = item.ItemName;
      this.deleteItemData.id = item.id;
    }
  },
  mounted() {
    this.itemList = this.itemData;
  },
  computed: {},
  created() {
    this.itemList = this.itemData;
  }
};
</script>
