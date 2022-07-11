<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <v-row>
        <!-- 產品彈窗 -->
        <v-dialog v-model="itemDialog" persistent max-width="800px">
          <v-card ref="form">
            <v-card-title class="info">
              <span class=" headline white--text"
                ><v-icon color="white">mdi-plus</v-icon> {{ $t("select")
                }}{{ $t("product") }}</span
              >
            </v-card-title>
            <v-form ref="itemForm" v-model="valid" lazy-validation>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-data-table
                        dense
                        :headers="itemHeaders"
                        :items="itemList"
                        :sort-by="['ItemNo']"
                        loading-text="Loading... Please wait"
                        class="elevation-1"
                        @click:row="rowClick"
                        :search="itemSearch"
                      >
                        <template v-slot:top>
                          <v-text-field
                            v-model="itemSearch"
                            label="Search"
                            class="mx-4"
                          ></v-text-field>
                        </template>
                      </v-data-table>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
            </v-form>
            <v-divider />
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="gray" @click="itemDialog = false">{{
                $t("cancel")
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- 新增按鈕 -->
        <v-col cols="1" md="1">
          <v-flex>
            <!-- 生產批建立按鈕 -->
            <v-dialog v-model="lotCreateDialog" persistent max-width="600px">
              <v-card ref="form">
                <v-card-title class="info">
                  <span class=" headline white--text">
                    {{ $t("add") }}{{ $t("lot") }}</span
                  >
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          ref="moNo"
                          :label="$t('jobNo') + $t('No')"
                          v-model="addLotForm.moNo"
                          disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          ref="itemName"
                          :label="$t('product') + $t('name')"
                          v-model="addLotForm.itemName"
                          disabled
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="5" md="5">
                        <v-select
                          class="mt-2"
                          v-model="addLotForm.lotCreateType"
                          :items="lotCreateMethodList"
                          item-text="name"
                          item-value="value"
                          :label="$t('lotCreate') + $t('method')"
                          @change="onLotCreateTypeChange()"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="4" md="4">
                        <v-text-field
                          ref="lotQty"
                          :label="$t('count')"
                          v-model="addLotForm.qty"
                          prepend-icon=" mdi-minus"
                          append-outer-icon="mdi-plus"
                          oninput="if(this.value < 1) this.value = 1;"
                          :rules="[v => !!v || this.$t('mustInput')]"
                          :disabled="validated == true"
                          required
                          @change="onCountChange()"
                          @click:append-outer="increment()"
                          @click:prepend="decrement()"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="3" md="3">
                        <v-text-field
                          ref="lotQty"
                          :label="$t('createlot') + $t('count')"
                          v-model="addLotForm.lotQty"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*{{ $t("inputRequired") }}</small>
                  <v-divider></v-divider>
                  <v-flex xs12 class="mx-1 mt-5">
                    <v-data-table
                      :headers="opItemheaders"
                      :items="opItemList"
                      :items-per-page="itemsPerPage"
                      :sort-by="['opSeq']"
                      class="elevation-1"
                      :loading="loading == 1"
                      loading-text="Loading... Please wait"
                    >
                      <template v-slot:item.opSelected="{ item }">
                        <v-checkbox
                          v-model="opCheckbox"
                          :id="item.id"
                          :value="item.id"
                          :rules="rules"
                        ></v-checkbox>
                      </template>
                    </v-data-table>
                  </v-flex>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="gray" @click="onLotCreateDialogClosed()">{{
                    $t("cancel")
                  }}</v-btn>
                  <v-btn class="info" dark text @click="createLot()">
                    {{ $t("add") }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-flex>
        </v-col>
      </v-row>
      <!-- 生產批條碼顯示彈窗 -->
      <v-dialog v-model="lotBarcodeDialog" max-width="600px">
        <v-card ref="form">
          <v-card-title style="background:black">
            <span class=" headline white--text"> {{ $t("barCode") }}</span>
          </v-card-title>

          <v-card-text>
            <div style="text-align:center">
              <img id="barcode" width="100%" />
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- 工單編輯彈窗 -->
      <v-dialog v-model="moEditDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("jobNo") }}</span
            >
          </v-card-title>
          <v-form ref="editForm" v-model="valid" lazy-validation>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-checkbox
                      v-model="hasCustomerOrder"
                      :label="$t('ifor') + $t('has') + $t('customerOrder')"
                      value="Y"
                      hide-details
                    ></v-checkbox>
                    <v-divider></v-divider>
                  </v-col>
                  <v-col cols="12" sm="6" md="6" v-if="hasCustomerOrder == 'Y'">
                    <v-text-field
                      ref="customerName"
                      :label="$t('customer') + $t('name')"
                      v-model="editMoForm.customer"
                      :rules="[v => !!v || this.$t('mustInput')]"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6" v-if="hasCustomerOrder == 'Y'">
                    <v-text-field
                      ref="customerNo"
                      :label="$t('customerOrder') + $t('No')"
                      v-model="editMoForm.orderNo"
                      :rules="[v => !!v || this.$t('mustInput')]"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="12"
                    md="12"
                    v-if="hasCustomerOrder == 'Y'"
                  >
                    <v-menu
                      v-model="menu4"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="editMoForm.orderDueDate"
                          :label="$t('customerOrder') + $t('dueDate')"
                          prepend-icon="mdi-calendar"
                          readonly
                          :rules="noRules"
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="editMoForm.orderDueDate"
                        no-title
                        locale="zh-cn"
                        @input="menu4 = false"
                      ></v-date-picker>
                    </v-menu>
                    <v-divider></v-divider>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <!-- {{ $t("areaNo") }}* -->
                    <v-text-field
                      ref="MoNo"
                      :label="$t('jobNo') + $t('No')"
                      v-model="editMoForm.moNo"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <!-- {{ $t("areaName") }}* -->
                    <v-text-field
                      ref="itemNo"
                      :label="'*' + $t('product')"
                      v-model="editMoForm.itemText"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      required
                      @click="onItemTextfieldClick()"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-menu
                      v-model="menu2"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="editMoForm.startDate"
                          :label="$t('expected') + $t('start') + $t('date')"
                          prepend-icon="mdi-calendar"
                          :rules="noRules"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          required
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="editMoForm.startDate"
                        no-title
                        locale="zh-cn"
                        :max="editMoForm.endDate"
                        @input="menu2 = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-menu
                      v-model="menu3"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="editMoForm.endDate"
                          :label="$t('expected') + $t('completed') + $t('date')"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          :rules="noRules"
                          required
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="editMoForm.endDate"
                        :min="editMoForm.startDate"
                        no-title
                        locale="zh-cn"
                        @input="menu3 = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      ref="count"
                      :label="$t('jobNo') + $t('count')"
                      v-model="editMoForm.qty"
                      prepend-icon=" mdi-minus"
                      append-outer-icon="mdi-plus"
                      oninput="if(this.value < 1) this.value = 1;"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      required
                      @change="onCountChange()"
                      @click:append-outer="increment()"
                      @click:prepend="decrement()"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-checkbox
                      v-model="editMoForm.urgent"
                      :label="$t('ifor') + $t('equal') + $t('urgentMo')"
                      color="red"
                      value="Y"
                      hide-details
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="notive"
                      prepend-icon="mdi-pencil"
                      :label="$t('notice')"
                      v-model="editMoForm.remark"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
              <small>*{{ $t("inputRequired") }}</small>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="moEditDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editMo()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除工單彈窗 -->
      <v-dialog v-model="deleteMoDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("jobNo") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("jobNo") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteMoDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteMo()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 生產批修改彈窗 -->
      <v-dialog v-model="lotEditDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("edit") }}{{ $t("lot") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-flex xs12 class="mx-1 mt-5">
              <v-data-table
                :headers="opItemheaders"
                :items="opItemList"
                :items-per-page="itemsPerPage"
                :sort-by="['opSeq']"
                class="elevation-1"
                :loading="loading == 1"
                loading-text="Loading... Please wait"
              >
                <template v-slot:item.opSelected="{ item }">
                  <v-checkbox
                    v-model="opCheckbox"
                    :id="item.id"
                    :value="item.id"
                    :ref="item.id"
                    :rules="rules"
                    :disabled="disabled(item.id)"
                  ></v-checkbox>
                </template>
              </v-data-table>
            </v-flex>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="lotEditDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="editLot()">
              {{ $t("edit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 刪除生產批彈窗 -->
      <v-dialog v-model="deleteLotDialog" persistent max-width="300px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class="headline  white--text">
              {{ $t("delete") }}{{ $t("lot") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              {{ $t("confirm") }}{{ $t("delete") }}{{ $t("lot") }}?
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="deleteLotDialog = false">{{
              $t("cancel")
            }}</v-btn>

            <v-btn class="info" dark text @click="deleteLot()">
              {{ $t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 工單結案彈窗 -->
      <v-dialog v-model="moCloseDialog" max-width="290">
        <v-card>
          <v-card-title class="headline ">
            {{ $t("jobNo") + $t("projectClose") }}
          </v-card-title>

          <v-card-text>
            {{ $t("confirm") + $t("projectClose") + "?" }}
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="gray" @click="moCloseDialog = false">
              {{ $t("cancel") }}
            </v-btn>

            <v-btn color="info" @click="moClose()">
              {{ $t("confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 生產批進度彈窗 -->
      <v-dialog v-model="detailDialog" max-width="1500px">
        <v-card ref="form">
          <v-card-title class="info">
            <v-icon class="mr-2" color="white">mdi-android-messages</v-icon>
            <span class=" headline white--text"> {{ $t("detail") }}</span>
            <v-spacer />
            <v-btn icon @click="onBarcodeClick()">
              <v-icon large color="white">mdi-barcode</v-icon>
            </v-btn>
          </v-card-title>
          <v-form ref="editForm" v-model="valid" lazy-validation>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field
                    v-model="detail.moNo"
                    :label="$t('jobNo')"
                    outlined
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field
                    v-model="detail.lotNo"
                    :label="$t('lot') + $t('No')"
                    outlined
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field
                    v-model="detail.expectedFinishDate"
                    :label="$t('expected') + $t('completed') + $t('date')"
                    outlined
                    disabled
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row class="mt-n5">
                <v-col cols="12" sm="12" md="4">
                  <v-text-field
                    v-model="detail.itemNo"
                    :label="$t('product') + $t('name')"
                    outlined
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field
                    v-model="detail.itemNo"
                    :label="$t('product') + $t('No')"
                    outlined
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field
                    v-model="detail.itemNo"
                    :label="$t('itemSpec')"
                    outlined
                    disabled
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row class="mt-n5">
                <v-col cols="12" sm="12" md="4">
                  <v-text-field
                    v-model="detail.lotQty"
                    :label="$t('lot') + $t('count')"
                    outlined
                    disabled
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row>
                <v-col cols="12">
                  <gantt-elastic
                    :options="options"
                    :tasks="tasks"
                    v-model="task"
                  >
                    <gantt-header slot="header"></gantt-header>
                  </gantt-elastic>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" sm="12" md="5">
                  <v-row no-gutters>
                    <v-col
                      cols="12"
                      v-for="lotOp in lotOpData"
                      :key="lotOp.id"
                      style="text-align:center"
                    >
                      <v-card
                        :color="getStatusColor(lotOp.status)"
                        class="mx-auto"
                      >
                        <v-system-bar
                          style="background:black;color:white;opacity:0.4"
                          class="text-h7  font-weight-bold text-truncate"
                        >
                          {{ lotOp.opSequence + "." + lotOp.opName }}
                          <v-spacer />
                          <v-btn icon>
                            <v-icon dense color="white">mdi-file-find</v-icon>
                          </v-btn>
                        </v-system-bar>

                        <v-card-text style="color:white">
                          <v-row no-gutters>
                            {{ $t("status") + "：" }}
                            <span
                              v-if="
                                lotOp.status != 'dispatch' &&
                                  lotOp.status != 'close'
                              "
                              >{{ $t(lotOp.status) }}</span
                            >
                            <span v-else-if="lotOp.status == 'close'">{{
                              $t("projectClose")
                            }}</span>
                            <span v-else>
                              {{ $t("already") }}{{ $t(lotOp.status) }}
                            </span>
                          </v-row>
                          <v-row no-gutters>
                            {{
                              $t("dispatch") +
                                $t("user") +
                                "：" +
                                getExecutor(lotOp)
                            }}
                          </v-row>
                          <v-row no-gutters>
                            <v-col cols="6" style="text-align:left">
                              {{
                                $t("expected") +
                                  $t("start") +
                                  $t("time") +
                                  "：" +
                                  getPlanStartTime(lotOp)
                              }}
                            </v-col>
                            <v-col cols="6" style="text-align:left">
                              {{
                                $t("actual") +
                                  $t("start") +
                                  $t("time") +
                                  "：" +
                                  getActualStartTime(lotOp)
                              }}
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="6" style="text-align:left">
                              {{
                                $t("expected") +
                                  $t("start") +
                                  $t("time") +
                                  "：" +
                                  getPlanEndTime(lotOp)
                              }}
                            </v-col>
                            <v-col cols="6" style="text-align:left">
                              {{
                                $t("actual") +
                                  $t("completed") +
                                  $t("time") +
                                  "：" +
                                  getActualEndTime(lotOp)
                              }}
                            </v-col>
                          </v-row>
                          <v-row no-gutters>
                            {{
                              $t("complete") +
                                $t("count") +
                                "：" +
                                lotOp.completedQty +
                                " / " +
                                lotOp.qty
                            }}
                          </v-row>
                          <v-row no-gutters>
                            {{
                              $t("NG") + $t("count") + "：" + getNgQty(lotOp)
                            }}
                          </v-row>
                        </v-card-text>
                      </v-card>
                      <v-icon
                        v-if="lotOpData.indexOf(lotOp) != lotOpData.length - 1"
                        color="black"
                        large
                      >
                        mdi-menu-down
                      </v-icon>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="6" sm="12" md="6">
                  <div
                    id="runningTimeChart"
                    style="width:100%; height: 400px"
                    ref="runningTimeChart"
                  ></div>
                </v-col>
              </v-row>
              <v-divider></v-divider>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="detailDialog = false">{{
              $t("close")
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="moheaders"
        :items="moList"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        :items-per-page="itemsPerPage"
        :sort-by="['urgent', 'status', 'planStartDate']"
        :sort-desc="[true, true, true]"
        multi-sort
        class="elevation-1"
        @page-count="pageCount = $event"
        :page.sync="page"
        @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
        :item-class="itemRowBackground"
        single-expand
        hide-default-footer
        show-expand
      >
        <template v-slot:item.action="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                small
                class="mr-2"
                :disabled="item.status != 'new'"
                @click="showMoEditDialog(item)"
                v-bind="attrs"
                v-on="on"
              >
                mdi-pencil
              </v-icon>
            </template>
            <span>{{ $t("edit") }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                small
                :disabled="item.status != 'new'"
                @click="showdeleteMoDialog(item)"
                v-bind="attrs"
                v-on="on"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>{{ $t("delete") }}</span>
          </v-tooltip>
        </template>
        <template v-slot:item.createTime="{ item }">
          {{ new Date(item.createTime).toLocaleString() }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip outlined :color="getStatusColor(item.status)">
            <span v-if="item.status != 'dispatch' && item.status != 'close'">
              {{ $t(item.status) }}
            </span>
            <span v-else-if="item.status === 'dispatch'">
              {{ $t("already") }}{{ $t(item.status) }}
            </span>
            <span v-else-if="item.status === 'close'">
              {{ $t("projectClose") }}
            </span>
          </v-chip>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <div class="mt-2 mb-2">
              <v-data-table
                :headers="lotheaders"
                :items="item.lotList"
                :items-per-page="itemsPerPage"
                :sort-by="['opSeq']"
                class="elevation-1  mytable"
                hide-default-header
              >
                <template v-slot:item.detail="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        @click="showDetailDialog(item)"
                        v-bind="attrs"
                        v-on="on"
                        >mdi-android-messages</v-icon
                      >
                    </template>
                    {{ $t("detail") }}
                  </v-tooltip>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        class="mr-2"
                        :disabled="item.status != 'new'"
                        @click="showEditLotDialog(item)"
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-pencil
                      </v-icon>
                    </template>
                    <span>{{ $t("edit") }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        :disabled="item.status != 'new'"
                        @click="showDeleteLotDialog(item)"
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-delete
                      </v-icon>
                    </template>
                    <span>{{ $t("delete") }}</span>
                  </v-tooltip>
                </template>
                <template v-slot:header="{ props: { headers } }">
                  <thead>
                    <tr class="some-other-style">
                      <th v-for="h in lotheaders" :class="h.class">
                        <span>{{ h.text }}</span>
                      </th>
                    </tr>
                  </thead>
                </template>
                <template v-slot:item.status="{ item }">
                  <div v-if="item.status != 'dispatch'">
                    {{ $t(item.status) }}
                  </div>

                  <div v-else>{{ $t("already") }}{{ $t(item.status) }}</div>
                </template>

                <template v-slot:item.statusIcon="{ item }">
                  <div>
                    <v-icon :color="getStatusColor(item.status)"
                      >mdi-circle</v-icon
                    >
                  </div>
                </template>
                <template v-slot:item.opItem="{ item }">
                  <td :colspan="headers.length">
                    <span v-for="lotOp in item.lotOpList" :key="lotOp.id">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            class="ma-1 pa-1"
                            :color="getStatusColor(lotOp.status)"
                            dark
                            v-bind="attrs"
                            v-on="on"
                            ><div>
                              {{ lotOp.opSequence }}.{{ lotOp.opName }}
                            </div>
                          </v-btn>
                        </template>
                        <div>
                          <h4>
                            {{ $t("processSequence") }}:{{ lotOp.opSequence
                            }}<br />
                            <span
                              v-if="
                                lotOp.status != 'dispatch' &&
                                  lotOp.status != 'close'
                              "
                              >●{{ $t(lotOp.status) }}</span
                            >
                            <span v-else-if="lotOp.status == 'close'"
                              >●{{ $t("projectClose") }}</span
                            >
                            <span v-else>
                              ●{{ $t("already") }}{{ $t(lotOp.status) }}
                            </span>
                          </h4>
                        </div>
                      </v-tooltip>
                      <v-icon
                        v-if="
                          item.lotOpList.indexOf(lotOp) !=
                            item.lotOpList.length - 1
                        "
                        color="black"
                      >
                        mdi-menu-right
                      </v-icon>
                    </span>
                  </td>
                </template>
              </v-data-table>
            </div>
          </td>
        </template>
        <template v-slot:item.urgent="{ item }">
          <div v-if="item.urgent == 'Y'">
            <v-icon large color="red">
              mdi-fire-alert
            </v-icon>
          </div>
        </template>
        <template v-slot:item.qty="{ item }">
          {{ item.lotQty }}/{{ item.qty }}
        </template>
        <template v-slot:item.operate="{ item }">
          <v-row align="center">
            <v-btn
              :disabled="parseFloat(item.lotQty) >= parseFloat(item.qty)"
              color="primary"
              @click="showCreateLotDialog(item)"
              small
              text
            >
              {{ $t("lotCreate") }}
            </v-btn>
            <!-- 指定結案按鈕 -->
            <!-- |
            <v-btn
              color="primary"
              :disabled="
                item.lotList.length == 0 ||
                  item.status === 'close' ||
                  item.status === 'complete'
              "
              small
              text
              @click="showMoCloseDialog(item)"
            >
              {{ $t("projectClose") }}
            </v-btn> -->
          </v-row>
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
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-layout>
</template>
<script>
import moment from "moment";
import dayjs from "dayjs";
const setting = require(`@/static/setting/setting.json`);
export default {
  components: {},
  props: {
    moData: {},
    moSearchValue: null,
    startDate: null,
    endDate: null,
    isLoading: null
  },
  data() {
    return {
      itemSearch: "",
      itemDialog: false,
      itemHeaders: [
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
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("itemSpec"),
          value: "itemSpec",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("itemDesc"),
          value: "description",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("itemQty"),
          value: "stdLotQty",
          sortable: false,
          width: "10%"
        }
      ],
      version: null,
      task: null,
      tasks: [
        {
          id: 0,
          label: "N/A",
          equipment: "N/A",
          start: this.getDate(0),
          duration: 1 * 24 * 60 * 60 * 1000,
          percent: 0,
          status: "N/A",
          type: "project",
          parentId: null,
          style: {
            base: {
              fill: "white",
              stroke: "gray"
            }
          }
        }
      ],

      options: {
        taskMapping: {
          progress: "percent"
        },
        maxRows: 100,
        maxHeight: 500,
        title: {
          label: "",
          html: false
        },
        row: {
          height: 30
        },
        calendar: {
          hour: {
            display: true
          }
        },
        chart: {
          progress: {
            bar: false
          },
          expander: {
            display: true
          },
          text: {
            offset: 10,
            color: "white"
          }
        },
        taskList: {
          expander: {
            straight: false
          },
          columns: [
            // {
            //   id: 1,
            //   label: this.$t("No"),
            //   value: "id",
            //   width: 40,
            //   events: {
            //     mouseenter({ event, data, column }) {
            //       alert("description clicked!\n" + data.label);
            //     }
            //   }
            // },
            {
              id: 2,
              label: this.$t("jobNo") + "/" + this.$t("lot"),
              value: "label",
              width: 150,
              expander: true,
              html: true,
              events: {
                // click({ data, column }) {
                //   alert("description clicked!\n" + data.label);
                // }
              }
            },
            {
              id: 3,
              label: this.$t("equipment"),
              value: "equipment",
              width: 130,
              html: true
            },
            {
              id: 8,
              label: this.$t("count"),
              value: "qty",
              width: 50,
              html: true
            },
            {
              id: 7,
              label: "Start",
              value: task => dayjs(task.start).format("YYYY-MM-DD"),
              width: 80
            },
            {
              id: 6,
              label: "End",
              value: task =>
                moment(task.start)
                  .add(task.duration, "ms")

                  .format("YYYY-MM-DD"),
              width: 80
            },
            {
              id: 4,
              label: this.$t("status"),
              value: "status",
              width: 60
            },
            {
              id: 5,
              label: "%",
              value: "progress",
              width: 60,
              style: {
                "task-list-header-label": {
                  "text-align": "center",
                  width: "100%"
                },
                "task-list-item-value-container": {
                  "text-align": "center",
                  width: "100%"
                }
              }
            }
          ]
        },
        locale: {
          name: "zh-TW",
          Now: "Now",
          "X-Scale": "Zoom-X",
          "Y-Scale": "Zoom-Y",
          "Task list width": "Task list",
          "Before/After": "Expand",
          "Display task list": "Task list"
        }
      },
      lotBarcodeDialog: false,
      lotWipData: [],
      lotOpData: [],
      detail: {
        moNo: null,
        lotNo: null,
        expectedFinishDate: null,
        itemNo: null,
        itemName: null,
        itemSpec: null,
        lotQty: null
      },
      detailDialog: false,
      loading: null,
      hasCustomerOrder: null,
      lotEditDialog: false,
      noRules: [v => !!v || this.$t("mustInput")],
      maxQty: null,
      itemList: [],
      opItemSelected: [],
      moCloseDialog: false,
      moEditDialog: false,
      menu2: false,
      menu3: false,
      menu4: false,
      valid: true,
      opCheckbox: [],

      validated: false,
      lotCreateMethod: null,
      lotCreateDialog: false,
      lotCreateMethodList: [
        { name: "全部開立", value: 0 },
        { name: "單獨開立", value: 1 },
        { name: "平均開立", value: 2 },
        { name: "剩餘獨立", value: 3 }
      ],
      editMoForm: {
        orderNo: null,
        customer: null,
        orderDueDate: null,
        moNo: null,
        itemNo: null,
        itemText: null,
        startDate: new Date().toISOString().substr(0, 10),
        endDate: null,
        qty: null,
        urgent: null,
        remark: null
      },
      overlay: false,
      seqLimit: 3,
      onSeqInput: null,
      machineSelected: null,
      opSelected: null,
      machineList: null,
      opList: {},
      opItemList: [],
      selectedOpItem: [],
      selectedOp: [],
      selectedCycleTime: [],
      selectedLot: [],
      editCycleTimeDialog: false,
      addLotForm: {
        itemName: null,
        moNo: null,
        qty: null,
        lotQty: null,
        lotCreateType: []
      },
      addCycleTimeForm: {
        itemNo: null,
        itemName: null,
        opNo: null,
        opName: null,
        machineNo: null,
        opSeq: null,
        fixTime: null,
        varTime: null,
        baseQty: null
      },
      editCycleTimeForm: {
        itemNo: null,
        itemName: null,
        opNo: null,
        opName: null,
        machineNo: null,
        opSeq: null,
        fixTime: null,
        varTime: null,
        baseQty: null
      },
      stdLotQty: null,
      selectedMo: [],
      dialog: false,
      moList: [],
      opList: [],
      ItemSearchValue: "",
      editItemOpDialog: false,
      deleteMoDialog: false,
      addCycleTimeDialog: false,
      deleteCycleTimeDialog: false,
      deleteLotDialog: false,
      ItemName: "",
      errorMessage: "",
      procedure: "",
      sequence: 1,
      notice: "",
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      editOpForm: {
        opName: null,
        seq: null
      },
      deleteItemData: {
        no: null,
        name: null,
        id: null
      },

      opItemheaders: [
        {
          value: "opSelected",
          sortable: false,
          align: "left",
          width: "3%"
        },
        {
          text: this.$t("processSequence"),
          value: "opSequence",
          align: "left",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("process") + this.$t("No"),
          value: "opNo",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("process") + this.$t("name"),
          value: "opName",
          sortable: false,
          align: "left",
          width: "20%"
        }
      ]
    };
  },

  methods: {
    rowClick: function(item, row) {
      this.editMoForm.itemNo = item.itemNo;
      this.editMoForm.itemText = item.itemName + `(${item.itemNo})`;
      this.stdLotQty = item.stdLotQty;
      this.editMoForm.qty = item.stdLotQty;
      this.itemDialog = false;
    },
    onItemTextfieldClick() {
      this.itemDialog = true;
    },
    onCountChange() {
      if (this.addLotForm.count % this.stdLotQty !== 0) {
        this.addLotForm.qty = this.stdLotQty;
      }
    },
    increment() {
      // console.log(this.stdLotQty);
      if (this.stdLotQty != null) {
        if (this.moEditDialog == true) {
          this.editMoForm.qty =
            parseFloat(this.editMoForm.qty) + parseFloat(this.stdLotQty);
        } else if (
          this.addLotForm.qty != this.maxQty &&
          this.lotCreateDialog == true
        ) {
          this.addLotForm.qty =
            parseFloat(this.addLotForm.qty) + parseFloat(this.stdLotQty);
        }
      }
      //}
    },
    decrement() {
      if (this.stdLotQty != null) {
        if (parseFloat(this.addLotForm.qty) != parseFloat(this.stdLotQty)) {
          this.addLotForm.qty = this.addLotForm.qty - this.stdLotQty;
        }
        if (parseFloat(this.editMoForm.qty) != parseFloat(this.stdLotQty)) {
          this.editMoForm.qty =
            parseFloat(this.editMoForm.qty) - parseFloat(this.stdLotQty);
        }
      }
      // }
    },
    itemRowBackground: function(item) {
      //console.log(item);
      return item.urgent == "Y" ? "red lighten-5" : "";
    },
    addTask(
      id,
      label,
      equipment,
      start,
      duration,
      percent,
      qty,
      type,
      parentId,
      status,
      color
    ) {
      if (percent == "NaN") {
        percent = 0.0;
      }
      this.tasks.push({
        id: id,
        label: label,
        equipment: equipment,
        start: start, //getDate()
        duration: duration, //毫秒
        percent: percent,
        qty: qty,
        type: type,
        parentId: parentId,
        status: status,
        style: {
          base: {
            fill: color,
            stroke: "white"
          }
        }
      });
    },
    updataMoTasks(moData, item) {
      let id = 0;
      let start, end, duration, percent, color;
      let equipment = "";
      let lastEndDate = null;
      this.lotWipList = [];
      //console.log(moData);
      if (moData != undefined) {
        this.tasks = [];

        lastEndDate = new Date(moData.planStartDate + " 00:00:00");
        start = new Date(moData.planStartDate + " 00:00:00");
        end = moment(moData.planEndDate + " 00:00:00")
          .add(1, "d")
          .toDate();
        //console.log(start);
        //console.log(end);
        duration = moment
          .duration(end.getTime() - start.getTime())
          .asMilliseconds();
        //console.log(duration);
        percent =
          (parseFloat(moData.completedQty) / parseFloat(moData.qty)) * 100;
        color = this.getStatusColorCode(moData.status);

        id++;
        //console.log(moData);
        let totalDuration = 0;

        if (moData.lotList.length > 0) {
          let lotData = item;

          //  console.log(moData.lotList[j]);
          //加入生產批資料
          start = new Date(moData.planStartDate + " 00:00:00");
          end = moment(moData.planEndDate + " 00:00:00")
            .add(1, "d")
            .toDate();

          duration = moment
            .duration(end.getTime() - start.getTime())
            .asMilliseconds();
          percent =
            (parseFloat(lotData.completedQty) / parseFloat(lotData.qty)) * 100;
          color = this.getStatusColorCode(moData.status);

          if (lotData.lotOpList.length > 0) {
            for (let k = 0; k < lotData.lotOpList.length; k++) {
              equipment = "N/A";
              let firstStart = new Date(
                moData.planStartDate + " 00:00:00"
              ).getTime();
              //加入生產批下的製程資料
              if (lotData.lotWipList.length > 0) {
                let lotWipData = lotData.lotWipList.find(
                  x => x.lotOpId == lotData.lotOpList[k].id
                );
                let firstLotWipData = lotData.lotWipList.find(
                  x => x.lotOpId == lotData.lotOpList[0].id
                );

                this.lotWipList.push(lotWipData);
                color = this.getStatusColorCode(lotData.lotOpList[k].status);
                //若已完成派工,則有派工單可以查詢
                if (lotWipData != undefined) {
                  equipment = lotWipData.resourceName;
                  //console.log(lotWipData);
                  //若派工日期不為null
                  if (lotWipData.dispatchStartDate != null) {
                    //若派工時間不為null(代表有完成排程)
                    if (lotWipData.scheduleStartTime != null) {
                      if (firstLotWipData != undefined) {
                        firstStart = new Date(
                          firstLotWipData.dispatchStartDate +
                            " " +
                            firstLotWipData.scheduleStartTime
                        ).getTime();
                      }
                      start = new Date(
                        lotWipData.dispatchStartDate +
                          " " +
                          lotWipData.scheduleStartTime
                      );
                      end = new Date(
                        lotWipData.dispatchEndDate +
                          " " +
                          lotWipData.scheduleEndTime
                      );
                      totalDuration += end.getTime() - start.getTime();
                    } else {
                      //若派工時間為null(沒有完成排程)
                      //需要依製程等分
                      if (firstLotWipData != undefined) {
                        firstStart = new Date(
                          firstLotWipData.dispatchStartDate + " 00:00:00"
                        ).getTime();
                      }
                      let moDuration = moment
                        .duration(
                          moment(moData.planEndDate + " 00:00:00")
                            .add(1, "d")
                            .valueOf() -
                            new Date(
                              moData.planStartDate + " 00:00:00"
                            ).getTime()
                        )
                        .asMilliseconds();

                      let cycleTimeData = moData.cycleTimeData.find(
                        x => x.opNo == lotData.lotOpList[k].opNo
                      );

                      if (cycleTimeData != undefined) {
                        start = lastEndDate;
                        end = new Date(
                          lastEndDate.getTime() +
                            (parseFloat(cycleTimeData.fixTime) +
                              (parseFloat(cycleTimeData.varTime) /
                                parseFloat(cycleTimeData.baseQty)) *
                                parseFloat(lotData.qty)) *
                              1000
                        );
                        lastEndDate = end;
                      } else {
                        let length = lotData.lotOpList.length;
                        start = new Date(
                          new Date(
                            moData.planStartDate + " 00:00:00"
                          ).getTime() +
                            (moDuration / length) * k
                        );
                        end = new Date(
                          new Date(
                            moData.planStartDate + " 00:00:00"
                          ).getTime() +
                            (moDuration / length) * (k + 1)
                        );
                      }
                      totalDuration += end.getTime() - start.getTime();
                    }

                    //console.log(firstLotWipData);
                    // if (firstLotWipData != undefined) {
                    //   firstStart = new Date(
                    //     firstLotWipData.dispatchStartDate +
                    //       " " +
                    //       firstLotWipData.scheduleStartTime
                    //   ).getTime();
                    //   console.log(firstLotWipData);
                    //   console.log(firstStart);
                    // }
                  }

                  //若該生產批已開工或完成,則依實際開始和結束時間為主
                  //若已有實際開工時間
                  if (lotWipData.actualStartTime != null) {
                    //若已有實際完成時間
                    if (lotWipData.actualEndTime != null) {
                      start = new Date(lotWipData.actualStartTime);
                      end = new Date(lotWipData.actualEndTime);
                      //console.log(start);
                      //console.log(end);
                    } else {
                      start = new Date(lotWipData.actualStartTime);
                      end = new Date();
                    }
                  }
                } else {
                  //若沒有派工單(代表還未派工)
                  //預估起始跟完成時間沿用工單的時間
                  start = new Date(moData.planStartDate + " 00:00:00");
                  end = moment(moData.planEndDate + " 00:00:00")
                    .add(1, "d")
                    .toDate();
                  color = "grey";
                  equipment = "";
                }
              } else {
                //若當前還沒進行派工,分成製程數量等分依製程順序顯示
                let moDuration = moment
                  .duration(
                    moment(moData.planEndDate + " 00:00:00")
                      .add(1, "d")
                      .valueOf() -
                      new Date(moData.planStartDate + " 00:00:00").getTime()
                  )
                  .asMilliseconds();
                let length = lotData.lotOpList.length;
                start = new Date(
                  new Date(moData.planStartDate + " 00:00:00").getTime() +
                    (moDuration / length) * k
                );
                end = new Date(
                  new Date(moData.planStartDate + " 00:00:00").getTime() +
                    (moDuration / length) * (k + 1)
                );
              }

              //加入工單和生產批資料
              if (k == lotData.lotOpList.length - 1) {
                if (totalDuration == 0) {
                  let moStart = new Date(moData.planStartDate + " 00:00:00");
                  let moEnd = moment(moData.planEndDate + " 00:00:00")
                    .add(1, "d")
                    .toDate();

                  let moDuration = moment
                    .duration(moEnd.getTime() - moStart.getTime())
                    .asMilliseconds();
                  totalDuration = moDuration;
                }

                //加入工單資料
                this.addTask(
                  moData.id,
                  moData.moNo,
                  "",
                  firstStart,
                  totalDuration,
                  percent.toFixed(1),
                  moData.lotQty + "/" + moData.qty,
                  "project",
                  null,
                  this.$t(moData.status),
                  color
                );
                //加入生產批資料
                this.addTask(
                  lotData.id,
                  lotData.lotNo,
                  "",
                  firstStart,
                  totalDuration,
                  percent.toFixed(1),
                  lotData.qty,
                  "milestone",
                  moData.id,
                  this.$t(lotData.status),
                  color
                );
              }

              duration = moment
                .duration(end.getTime() - start.getTime())
                .asMilliseconds();
              percent =
                (parseFloat(lotData.lotOpList[k].completedQty) /
                  parseFloat(lotData.lotOpList[k].dispatchQty)) *
                100;
              //新增生產批下的製程Task資料
              this.addTask(
                lotData.lotOpList[k].id,
                lotData.lotNo + "(" + lotData.lotOpList[k].opName + ")",
                equipment,
                start.getTime(),
                duration,
                percent.toFixed(1),
                lotData.lotOpList[k].qty,
                "task",
                lotData.id,
                this.$t(lotData.lotOpList[k].status),
                color
              );
            }
          }
        } else {
          this.tasks = [
            {
              id: 0,
              label: "N/A",
              equipment: "N/A",
              start: this.getDate(0),
              duration: 1 * 24 * 60 * 60 * 1000,
              percent: 0,
              qty: 0,
              status: "N/A",
              type: "project",
              parentId: null,
              style: {
                base: {
                  fill: "white",
                  stroke: "gray"
                }
              }
            }
          ];
        }
      }
    },
    // updataMoTasks(moData) {
    //   let id = 0;
    //   let start, end, duration, percent, color;
    //   let equipment = "";
    //   //console.log(moData);
    //   this.tasks = [];

    //   start = new Date(moData.planStartDate + " 00:00:00");
    //   end = moment(moData.planEndDate + " 00:00:00")
    //     .add(1, "d")
    //     .toDate();
    //   //console.log(start);
    //   //console.log(end);
    //   duration = moment
    //     .duration(end.getTime() - start.getTime())
    //     .asMilliseconds();
    //   //console.log(duration);
    //   percent =
    //     (parseFloat(moData.completedQty) / parseFloat(moData.qty)) * 100;
    //   color = this.getStatusColorCode(moData.status);
    //   //加入工單資料
    //   this.addTask(
    //     moData.id,
    //     moData.moNo,
    //     "",
    //     start.getTime(),
    //     duration,
    //     percent.toFixed(1),
    //     "project",
    //     null,
    //     this.$t(moData.status),
    //     color
    //   );

    //   id++;
    //   //console.log(this.tasks);
    //   if (moData.lotList.length > 0) {
    //     for (let j = 0; j < moData.lotList.length; j++) {
    //       //  console.log(this.moData.lotList[j]);
    //       //加入生產批資料
    //       start = new Date(moData.planStartDate + " 00:00:00");
    //       end = moment(moData.planEndDate + " 00:00:00")
    //         .add(1, "d")
    //         .toDate();

    //       duration = moment
    //         .duration(end.getTime() - start.getTime())
    //         .asMilliseconds();
    //       percent =
    //         (parseFloat(moData.lotList[j].completedQty) /
    //           parseFloat(moData.lotList[j].qty)) *
    //         100;
    //       color = this.getStatusColorCode(moData.status);
    //       //新增Task
    //       this.addTask(
    //         moData.lotList[j].id,
    //         moData.lotList[j].lotNo,
    //         "",
    //         start.getTime(),
    //         duration,
    //         percent.toFixed(1),
    //         "milestone",
    //         moData.id,
    //         this.$t(moData.lotList[j].status),
    //         color
    //       );
    //       if (moData.lotList[j].lotOpList.length > 0) {
    //         for (let k = 0; k < moData.lotList[j].lotOpList.length; k++) {
    //           equipment = "N/A";
    //           //加入生產批下的製程資料
    //           if (moData.lotList[j].lotWipList.length > 0) {
    //             let lotWipData = moData.lotList[j].lotWipList.find(
    //               x => x.lotOpId == moData.lotList[j].lotOpList[k].id
    //             );
    //             // this.lotWipList.push(lotWipData);
    //             color = this.getStatusColorCode(
    //               moData.lotList[j].lotOpList[k].status
    //             );
    //             //若已完成派工,則有派工單可以查詢
    //             if (lotWipData != undefined) {
    //               equipment = lotWipData.resourceName;
    //               //console.log(lotWipData);
    //               //若派工日期不為null
    //               if (lotWipData.dispatchStartDate != null) {
    //                 //若派工時間不為null(代表有完成排程)
    //                 if (lotWipData.scheduleStartTime != null) {
    //                   start = new Date(
    //                     lotWipData.dispatchStartDate +
    //                       " " +
    //                       lotWipData.scheduleStartTime
    //                   );
    //                   end = new Date(
    //                     lotWipData.dispatchEndDate +
    //                       " " +
    //                       lotWipData.scheduleEndTime
    //                   );
    //                 } else {
    //                   //若派工時間為null(沒有完成排程)
    //                   //需要依製程等分
    //                   let moDuration = moment
    //                     .duration(
    //                       moment(moData.planEndDate + " 00:00:00")
    //                         .add(1, "d")
    //                         .valueOf() -
    //                         new Date(
    //                           moData.planStartDate + " 00:00:00"
    //                         ).getTime()
    //                     )
    //                     .asMilliseconds();
    //                   let length = moData.lotList[j].lotOpList.length;
    //                   let lastOp = moData.lotList[j].lotOpList.filter(
    //                     x =>
    //                       x.opSequence <
    //                       moData.lotList[j].lotOpList[k].opSequence
    //                   );
    //                   console.log(lastOp);
    //                   let lastEndTime = null;
    //                   if (lastOp.length > 0) {
    //                     lastEndTime = new Date(
    //                       new Date(
    //                         this.tasks.find(
    //                           x => x.id == lastOp[lastOp.length - 1].id
    //                         ).start
    //                       ).getTime() +
    //                         this.tasks.find(
    //                           x => x.id == lastOp[lastOp.length - 1].id
    //                         ).duration
    //                     );
    //                   }
    //                   if (lastEndTime != null) {
    //                     start = lastEndTime;
    //                   } else {
    //                     start = new Date(
    //                       new Date(
    //                         moData.planStartDate + " 00:00:00"
    //                       ).getTime() +
    //                         (moDuration / length) * k
    //                     );
    //                   }
    //                   end = new Date(
    //                     start.getTime() + (moDuration / length) * (k + 1)
    //                   );
    //                 }
    //               }

    //               //若該生產批已開工或完成,則依實際開始和結束時間為主
    //               //若已有實際開工時間
    //               if (lotWipData.actualStartTime != null) {
    //                 //若已有實際完成時間
    //                 if (lotWipData.actualEndTime != null) {
    //                   start = new Date(lotWipData.actualStartTime);
    //                   end = new Date(lotWipData.actualEndTime);
    //                   //console.log(start);
    //                   //console.log(end);
    //                 } else {
    //                   start = new Date(lotWipData.actualStartTime);
    //                   end = new Date();
    //                 }
    //               }
    //             } else {
    //               //若沒有派工單(代表還未派工)
    //               //預估起始跟完成時間沿用工單的時間
    //               start = new Date(moData.planStartDate + " 00:00:00");
    //               end = moment(moData.planEndDate + " 00:00:00")
    //                 .add(1, "d")
    //                 .toDate();
    //               color = "grey";
    //               equipment = "";
    //             }
    //           } else {
    //             //若當前還沒進行派工,分成製程數量等分依製程順序顯示
    //             let moDuration = moment
    //               .duration(
    //                 moment(moData.planEndDate + " 00:00:00")
    //                   .add(1, "d")
    //                   .valueOf() -
    //                   new Date(moData.planStartDate + " 00:00:00").getTime()
    //               )
    //               .asMilliseconds();
    //             let length = moData.lotList[j].lotOpList.length;
    //             start = new Date(
    //               new Date(moData.planStartDate + " 00:00:00").getTime() +
    //                 (moDuration / length) * k
    //             );
    //             end = new Date(
    //               new Date(moData.planStartDate + " 00:00:00").getTime() +
    //                 (moDuration / length) * (k + 1)
    //             );
    //           }

    //           duration = moment
    //             .duration(end.getTime() - start.getTime())
    //             .asMilliseconds();
    //           percent =
    //             (parseFloat(moData.lotList[j].lotOpList[k].completedQty) /
    //               parseFloat(moData.lotList[j].lotOpList[k].dispatchQty)) *
    //             100;
    //           //新增生產批下的製程Task資料
    //           this.addTask(
    //             moData.lotList[j].lotOpList[k].id,
    //             moData.lotList[j].lotNo +
    //               "(" +
    //               moData.lotList[j].lotOpList[k].opName +
    //               ")",
    //             equipment,
    //             start.getTime(),
    //             duration,
    //             percent.toFixed(1),
    //             "task",
    //             moData.lotList[j].id,
    //             this.$t(moData.lotList[j].lotOpList[k].status),
    //             color
    //           );
    //         }
    //       }
    //     }
    //   }

    //   //console.log(this.tasks);
    // },
    getDate(hours) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      const timeStamp = new Date(
        currentYear,
        currentMonth,
        currentDay,
        0,
        0,
        0
      ).getTime();
      //console.log(new Date(timeStamp + hours * 60 * 60 * 1000).getTime());
      return new Date(timeStamp + hours * 60 * 60 * 1000).getTime();
    },
    renderData() {
      let dataPoints = [];
      dataPoints = this.getDataPoints();
      var CanvasJS = require("@/static/scripts/canvasjs.min.js");
      const chart = new CanvasJS.Chart("runningTimeChart", {
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        exportEnabled: true,
        animationEnabled: true,
        title: {
          text: "各製程加工時間比例"
        },
        legend: {
          cursor: "pointer",
          itemclick: explodePie
        },
        data: [
          {
            type: "pie",
            startAngle: 25,
            toolTipContent: "<b>{label}</b>: {label1} (#percent%)",
            showInLegend: "true",
            legendText: "{label}",
            indexLabelFontSize: 16,
            indexLabel: "{label} - #percent%",
            dataPoints: dataPoints
          }
        ]
      });
      chart.render();

      function explodePie(e) {
        if (
          typeof e.dataSeries.dataPoints[e.dataPointIndex].exploded ===
            "undefined" ||
          !e.dataSeries.dataPoints[e.dataPointIndex].exploded
        ) {
          e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
        } else {
          e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
        }
        e.chart.render();
      }
    },
    onBarcodeClick() {
      this.lotBarcodeDialog = true;
      setTimeout(() => {
        this.renderBarCode();
      }, 200);
    },
    renderBarCode() {
      var JsBarcode = require("jsbarcode");
      JsBarcode("#barcode", this.selectedLot.lotNo);
    },
    getDataPoints() {
      var difference = 0;
      let dataPoints = [];
      let diff;
      this.lotOpData.forEach(lotOp => {
        let lotWip = this.lotWipData.find(x => x.lotOpId == lotOp.id);
        if (lotWip != undefined) {
          if (lotWip.actualStartTime != null) {
            if (lotWip.actualEndTime != null) {
              difference =
                new Date(lotWip.actualEndTime).getTime() -
                new Date(lotWip.actualStartTime).getTime();
              diff = moment.duration(
                new Date(lotWip.actualEndTime).getTime() -
                  new Date(lotWip.actualStartTime).getTime()
              );
              dataPoints.push({
                y: difference,
                label: lotOp.opSequence + "." + lotOp.opName,
                label1: `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`
              });
            } else {
              difference =
                new Date().getTime() -
                new Date(lotWip.actualStartTime).getTime();
              diff = moment.duration(
                new Date().getTime() -
                  new Date(lotWip.actualStartTime).getTime()
              );
              dataPoints.push({
                y: difference,
                label: lotOp.opSequence + "." + lotOp.opName,
                label1: `${diff.months()} month ${diff.days()} days ${diff.hours()} hr ${diff.minutes()} min ${diff.seconds()} sec`
              });
            }
          } else {
            return;
          }
        } else {
          return;
        }
      });

      if (dataPoints.length == 0) {
        dataPoints.push({ y: 100, label: "無資料", color: "grey" });
      }
      return dataPoints;
    },
    getNgQty(lotOp) {
      let lotWip = this.lotWipData.find(x => x.lotOpId == lotOp.id);
      //console.log(lotWip);
      if (lotWip != undefined) {
        if (lotWip.ngQty != null) {
          return lotWip.ngQty;
        }
      }
      return "0";
    },
    getExecutor(lotOp) {
      let lotWip = this.lotWipData.find(x => x.lotOpId == lotOp.id);
      //console.log(lotWip);
      if (lotWip != undefined) {
        if (lotWip.userName != null) {
          return lotWip.userName;
        }
      }
      return "";
    },
    getPlanStartTime(lotOp) {
      let lotWip = this.lotWipData.find(x => x.lotOpId == lotOp.id);
      //console.log(lotWip);
      if (lotWip != undefined) {
        if (lotWip.dispatchStartDate != null) {
          if (lotWip.scheduleStartTime != null) {
            return lotWip.dispatchStartDate + " " + lotWip.scheduleStartTime;
          } else {
            return lotWip.dispatchStartDate;
          }
        }
      }
      return "";
    },
    getPlanEndTime(lotOp) {
      let lotWip = this.lotWipData.find(x => x.lotOpId == lotOp.id);
      //console.log(lotWip);
      if (lotWip != undefined) {
        if (lotWip.dispatchEndDate != null) {
          if (lotWip.scheduleEndTime != null) {
            return lotWip.dispatchEndDate + " " + lotWip.scheduleEndTime;
          } else {
            return lotWip.dispatchEndDate;
          }
        }
      }
      return "";
    },
    getActualStartTime(lotOp) {
      let lotWip = this.lotWipData.find(x => x.lotOpId == lotOp.id);
      //console.log(lotWip);
      if (lotWip != undefined) {
        if (lotWip.actualStartTime != null) {
          return new Date(lotWip.actualStartTime).toLocaleString();
        }
      }
      return "";
    },
    getActualEndTime(lotOp) {
      let lotWip = this.lotWipData.find(x => x.lotOpId == lotOp.id);
      //console.log(lotWip);
      if (lotWip != undefined) {
        if (lotWip.actualEndTime != null) {
          return new Date(lotWip.actualEndTime).toLocaleString();
        }
      }
      return "";
    },
    showDetailDialog(item) {
      this.detailDialog = true;
      console.log(item);
      this.selectedLot = item;
      this.lotOpData = item.lotOpList;
      this.lotWipData = item.lotWipList;
      //console.log(item);
      let moData = this.moList.find(x => x.id == item.moId);
      this.detail.moNo = moData.moNo;
      this.detail.lotNo = item.lotNo;
      this.detail.expectedFinishDate = moData.planEndDate;
      this.detail.itemNo = moData.itemNo;
      this.detail.itemName = moData.itemName;
      this.detail.itemSpec = moData.itemSpec;
      this.detail.lotQty = item.qty;
      this.updataMoTasks(moData, item);
      setTimeout(() => {
        this.renderData();
      }, 200);
    },
    getStatusColorCode(status) {
      let color = "";

      switch (status) {
        case "new":
          color = "#9E9E9E";
          break;
        case "createlot":
          color = "#757575";
          break;
        case "dispatch":
          color = "#FB8C00";
          break;
        case "producted":
          color = "#00C853";
          break;
        case "pause":
          color = "#E53935";
          break;
        case "complete":
          color = "#0091EA";
          break;
        default:
          color = "#37474F";
          break;
      }
      //console.log(color);
      return color;
    },
    getStatusColor(status) {
      //console.log(status);
      let color = "";
      switch (status) {
        case "new":
          color = "grey";
          break;
        case "createlot":
          color = "grey darken-1";
          break;
        case "dispatch":
          color = "orange darken-1";
          break;
        case "producted":
          color = "green accent-4";
          break;
        case "pause":
          color = "red darken-1";
          break;
        case "complete":
          color = "light-blue accent-4";
          break;
        case "close":
          color = "blue-grey darken-3";
          break;
      }
      return color;
    },
    showDeleteLotDialog(item) {
      this.deleteLotDialog = true;
      this.selectedLot = item;
    },
    showEditLotDialog(item) {
      let moData = this.moList.filter(x => x.id == item.moId);
      //console.log(item);
      // 1.更新產品製程資料
      this.selectedLot = item;
      this.getOpItemData(moData[0].itemNo, item);
      this.lotEditDialog = true;
    },
    deleteLot() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/Lot/delete/${this.selectedLot.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
          } else {
            this.$swal(this.$t("deleteFailed"), res.data.msg, "error");
          }
          //this.refreshMoData();
          this.$emit("update");
          this.deleteLotDialog = false;
        });
    },
    editLot() {
      //過濾已存在的產品製程,只新增先前不存在的
      let selectedOpItemData = null;
      let lotOp = null;
      const token = this.$store.state.authUser.token;
      for (let i = 0; i < this.opCheckbox.length; i++) {
        selectedOpItemData = this.opItemSelected.filter(
          x => x == this.opCheckbox[i]
        );
        let opItemData = this.opItemList.filter(
          x => x.id == this.opCheckbox[i]
        );
        if (selectedOpItemData.length == 0) {
          //取得不存在原先於原先生產批內的產品製程id
          //不存在則新增
          lotOp = {
            moId: this.selectedLot.moId,
            lotId: this.selectedLot.id,
            opNo: opItemData[0].opNo[0],
            opName: opItemData[0].opName[0],
            opSequence: opItemData[0].opSequence,
            finalFlag: null,
            needDispatch: "Y",
            qty: this.selectedLot.qty,
            dispatchQty: "0",
            completedQty: "0",
            fixLoad: null,
            varLoad: null,
            status: "new"
          };
          //console.log(opItemData);

          this.$axios
            .post(`/LotOp/Create`, lotOp, {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              if (res.data.isSuccess) {
                this.$swal("", this.$t("editSuccess"), "success");
                //this.refreshMoData();

                this.lotEditDialog = false;
              } else {
                this.$swal("", res.data.msg, "error");
                this.lotEditDialog = false;
              }
            });
        }
        this.$emit("update");
        this.lotEditDialog = false;
      }
    },
    showMoEditDialog(item) {
      this.getItemList();
      this.selectedMo = item;
      this.moEditDialog = true;
      this.stdLotQty = item.itemData.stdLotQty;
      this.editMoForm.moNo = item.moNo;
      this.editMoForm.itemNo = item.itemNo;
      this.editMoForm.itemText = item.itemName + `(${item.itemNo})`;
      this.editMoForm.startDate = item.planStartDate;
      this.editMoForm.endDate = item.planEndDate;
      this.editMoForm.qty = item.qty;
      this.editMoForm.urgent = item.urgent;
      this.editMoForm.remark = item.remark;
      if (item.orderNo != null) {
        this.hasCustomerOrder = "Y";
        this.editMoForm.orderNo = item.orderNo;
        this.editMoForm.customer = item.customer;
        this.editMoForm.orderDueDate = item.orderDueDate;
      } else {
        this.hasCustomerOrder = "N";
        this.editMoForm.orderNo = null;
        this.editMoForm.customer = null;
        this.editMoForm.orderDueDate = null;
      }
      // console.log(this.editMoForm.urgent);
    },
    editMo() {
      let isUrgent = null;
      let orderNo = null;
      let customer = null;
      let orderDueDate = null;
      if (
        this.editMoForm.moNo == null ||
        this.editMoForm.itemNo == null ||
        this.editMoForm.startDate == null ||
        this.editMoForm.endDate == null ||
        this.editMoForm.qty == null
      ) {
        this.$refs["editForm"].validate();
        return;
      }
      if (
        this.hasCustomerOrder == "Y" &&
        (this.editMoForm.orderNo == null ||
          this.editMoForm.customer == null ||
          this.editMoForm.orderDueDate == null)
      ) {
        this.$refs["editForm"].validate();
        return;
      }
      if (this.editMoForm.urgent == "Y") {
        isUrgent = "Y";
      } else {
        isUrgent = "N";
      }

      if (this.hasCustomerOrder == "Y") {
        orderNo = this.editMoForm.orderNo;
        customer = this.editMoForm.customer;
        orderDueDate = this.editMoForm.orderDueDate;
      }
      const token = this.$store.state.authUser.token;
      const result = this.itemList.filter(
        x => x.itemNo == this.editMoForm.itemNo
      );
      // console.log(result[0].itemName);
      const mo = {
        id: this.selectedMo.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        moNo: this.editMoForm.moNo,
        urgent: isUrgent,
        qty: this.editMoForm.qty.toString(),
        lotQty: "0",
        completedQty: null,
        itemNo: this.editMoForm.itemNo,
        itemName: result[0].itemName,
        itemSpec: result[0].itemSpec,
        planStartDate: this.editMoForm.startDate,
        planEndDate: this.editMoForm.endDate,
        actualStartDate: null,
        actualEndDate: null,
        status: "new",
        closeUser: null,
        orderNo: orderNo,
        orderDueDate: orderDueDate,
        customer: customer,
        createTime: this.selectedMo.createTime,
        remark: this.editMoForm.remark
      };
      //console.log(mo);
      this.$axios
        .post(`/Mo/update`, mo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
            //this.refreshMoData();

            this.moEditDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.moEditDialog = false;
          }
        })
        .then(() => {
          this.$emit("update");
        });
    },
    showMoCloseDialog(item) {
      this.selectedMo = item;
      this.moCloseDialog = true;
    },
    moClose() {
      const token = this.$store.state.authUser.token;
      const mo = {
        id: this.selectedMo.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        moNo: this.selectedMo.moNo,
        urgent: this.selectedMo.isUrgent,
        qty: this.selectedMo.qty,
        lotQty: this.selectedMo.lotQty,
        completedQty: this.selectedMo.completedQty,
        itemNo: this.selectedMo.itemNo,
        itemName: this.selectedMo.itemName,
        itemSpec: this.selectedMo.itemSpec,
        planStartDate: this.selectedMo.startDate,
        planEndDate: this.selectedMo.endDate,
        actualStartDate: this.selectedMo.actualStartDate,
        actualEndDate: new Date().toISOString().substr(0, 10),
        status: "close",
        closeUser: this.$store.state.authUser.name,
        orderNo: this.selectedMo.orderNo,
        orderDueDate: this.selectedMo.orderDueDate,
        customer: this.selectedMo.customer,
        remark: this.selectedMo.remark
      };

      this.$axios
        .post(`/Mo/update`, mo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");
            //this.refreshMoData();

            this.moCloseDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.moCloseDialog = false;
          }
        })
        .then(() => {
          this.$emit("update");
        });
    },
    onLotCreateTypeChange() {
      if (this.addLotForm.lotCreateType == this.lotCreateMethodList[0].value) {
        this.addLotForm.qty = this.selectedMo.qty - this.selectedMo.lotQty;
        this.validated = true;
      } else {
        this.addLotForm.qty = this.selectedMo.qty - this.selectedMo.lotQty;
        this.maxQty = this.selectedMo.qty - this.selectedMo.lotQty;
        this.validated = false;
      }

      //  console.log(this.addLotForm.lotCreateType);
    },
    showCreateLotDialog(item) {
      this.lotCreateDialog = true;
      this.selectedMo = item;
      this.addLotForm.moNo = item.moNo;
      this.addLotForm.itemName = item.itemName;
      this.stdLotQty = item.itemData.stdLotQty;
      this.addLotForm.qty = item.itemData.stdLotQty;
      this.addLotForm.lotQty = item.lotQty + " / " + item.qty;

      this.addLotForm.lotCreateType = this.lotCreateMethodList[0].value;
      this.addLotForm.qty = this.selectedMo.qty - this.selectedMo.lotQty;

      this.validated = true;

      this.getOpItemList(this.selectedMo.itemNo);
    },
    onLotCreateDialogClosed() {
      this.lotCreateDialog = false;
      this.opItemList = [];
    },
    up() {
      if (parseFloat(this.editOpForm.seq) < 1) {
        this.$nextTick(() => {
          this.editOpForm.seq = 1;
        });
      } else if (parseFloat(this.editOpForm.seq) > this.opItemList.length) {
        this.$nextTick(() => {
          this.editOpForm.seq = this.opItemList.length;
        });
      }
    },
    showAddDialog() {
      this.dialog = true;
      this.addLotForm.opSeq = this.opItemList.length + 1;
    },
    showEditOpDialog(item) {
      //console.log(item);
      this.editItemOpDialog = true;
      this.selectedOp = item;
      this.editOpForm.opName = item.opName;
      this.editOpForm.seq = item.opSequence;
    },
    editOp() {
      const token = this.$store.state.authUser.token;
      const item = {
        id: this.selectedOp.id,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        qty: this.addLotForm.qty,
        completedQty: 0,
        actualStartDate: null,
        actualEndDate: null,
        status: "new",
        closeUser: null
      };
      //console.log(item);

      if (this.selectedOp.opSequence == item.opSequence) {
        return;
      }
      this.$axios
        .post(`/ItemOp/update`, item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("editSuccess"), "success");

            this.editItemOpDialog = false;
            //this.refreshOpItemData();
          } else {
            this.$swal("", res.data.msg, "error");
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.$emit("update");
        });
    },

    refreshMoData() {
      this.loading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(
          `/Mo/Search?value=${this.moSearchValue}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          //console.log(res.data.data);
          this.moList = res.data.data != null ? res.data.data : [];
          this.loading = 0;
        });
    },
    refreshOpItemData() {
      this.getOpItemList();
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deleteItemData.no = item.ItemNo;
      this.deleteItemData.name = item.ItemName;
      this.deleteItemData.id = item.id;
    },
    getMachineList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Machine/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.machineList = res.data.data != null ? res.data.data : [];
          // console.log(this.machineList.name);
        });
    },
    getLotList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Lot/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.opList = res.data.data != null ? res.data.data : [];
          // console.log(this.machineList.name);
        });
    },
    getOpItemList(itemNo) {
      this.loading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/ItemOp/Search?value=` + itemNo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.opItemList = res.data.data != null ? res.data.data : [];
          this.opCheckbox = [];
          // console.log(this.opItemList);
          for (let i = 0; i < this.opItemList.length; i++) {
            this.opCheckbox.push(this.opItemList[i].id);
          }
          //this.$refs[this.opItemList[i].id].disabled = true;
          this.loading = 0;
        });
    },
    getOpItemData(itemNo, item) {
      this.loading = 1;
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/ItemOp/Search?value=` + itemNo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.opItemList = res.data.data != null ? res.data.data : [];
          this.opCheckbox = [];
          let opItemData = null;
          for (let i = 0; i < item.lotOpList.length; i++) {
            opItemData = this.opItemList.filter(
              x => x.opSequence + "0" == item.lotOpList[i].opSequence
            );
            //  console.log(this.opItemList);
            this.opCheckbox.push(opItemData[0].id);
          }
          this.opItemSelected = this.opCheckbox;
          this.loading = 0;
          // console.log(this.opItemList);
        });
    },
    getItemList() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Item/Search`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.itemList = res.data.data != null ? res.data.data : [];
        });
    },
    createLot() {
      const token = this.$store.state.authUser.token;
      const lot = {
        moId: this.selectedMo.id,
        lotNo: null,
        lotDate: new Date().toISOString().substr(0, 10),
        qty: this.addLotForm.qty.toString(),
        completedQty: null,
        actualStartDate: null,
        actualEndDate: null,
        status: "new",
        closeUser: null,
        opSelected: this.opCheckbox,
        type: this.addLotForm.lotCreateType.toString()
      };
      // this.addLotForm.opSeq = "";
      //console.log(lot);
      //  this.showAddDialog = false;

      if (this.opCheckbox.length == 0) {
        this.$swal("", this.$t("createFailed"), "error");
        return;
        // this.addCycleTime();
        //  this.refreshOpItemData();
      }
      this.$axios
        .post(
          `/Lot/Create?type=` +
            this.addLotForm.lotCreateType.toString() +
            "&opSelected=" +
            this.opCheckbox,
          lot,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("createSuccess"), "success");
            //this.refreshMoData();

            this.lotCreateDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
          }
          this.$emit("update");
          this.lotCreateDialog = false;
        });
    },
    showdeleteMoDialog(item) {
      this.deleteMoDialog = true;
      //console.log(item);
      this.selectedMo = item;
    },

    deleteMo() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .delete(`/Mo/delete/${this.selectedMo.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal("", this.$t("deleteSuccess"), "success");
            //this.refreshMoData();
          } else {
            this.$swal("", this.$t("deleteFailed"), "error");
            //this.refreshMoData();
          }
          this.$emit("update");
          this.deleteMoDialog = false;
        })
        .then(() => {});
    },
    disabled(id) {
      let ret = false;
      for (let i = 0; i < this.opItemSelected.length; i++) {
        if (this.opItemSelected[i] == id) {
          ret = true;
          return ret;
        } else {
          ret = false;
        }
      }
      return ret;
    }
  },
  watch: {
    moData() {
      this.moList = this.moData;

      this.addLotForm.itemNo = this.moList.itemNo;
      this.addLotForm.itemName = this.moList.itemName;
      // this.getMachineList();
      // this.getOpList();
      // this.refreshOpItemData();
      //console.log(this.moData);
    },
    isLoading() {
      this.loading = this.isLoading;
    }
  },

  created() {
    // this.overlay = true;

    this.moList = this.moData;
    this.version = setting.version;
    // this.addLotForm.itemNo = this.moList.itemNo;
    // this.addLotForm.itemName = this.moList.itemName;
    // this.getMachineList();
    // this.getOpList();
    // this.refreshOpItemData();
    // window.setTimeout(() => {
    //   this.overlay = false;
    // }, 500);
    //this.overlay = false;
    //console.log(this.moData);
  },
  mounted() {},
  computed: {
    rules() {
      return [this.opCheckbox.length > 0 || ""];
    },
    moheaders() {
      let headers = [];
      headers = [
        {
          text: this.$t("urgentMo"),
          value: "urgent",
          sortable: true,
          align: "left",
          width: "7%"
        },
        {
          text: this.$t("jobNo"),
          value: "moNo",
          align: "left",
          sortable: true,
          width: "10%"
        },
        {
          text: this.$t("partNo"),
          value: "itemNo",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("itemName"),
          value: "itemName",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("status"),
          value: "status",
          sortable: true,
          align: "center",

          width: "5%"
        },

        {
          text: this.$t("plan") + this.$t("start") + this.$t("date"),
          value: "planStartDate",
          sortable: true,
          align: "left",
          width: "13%"
        },
        {
          text: this.$t("plan") + this.$t("completed") + this.$t("date"),
          value: "planEndDate",
          sortable: true,
          align: "left",
          width: "13%"
        },
        {
          text: this.$t("mo") + this.$t("count"),
          value: "qty",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("notice"),
          value: "remark",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("operate"),
          value: "operate",
          sortable: false,
          align: "left",
          width: "5%"
        },
        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          align: "left",
          width: "5%"
        },
        {
          text: this.$t("moCreateDateTime"),
          value: "createTime",
          sortable: false,
          align: "left",
          width: "5%"
        },
        {
          text: "",
          value: "data-table-expand",
          align: "left",
          sortable: false,
          width: "5%"
        }
      ];
      // if (setting.version == "YCM") {
      //   headers.unshift({
      //     text: this.$t("soYear"),
      //     value: "moNo",
      //     align: "left",
      //     sortable: true,
      //     width: "10%"
      //   });
      // } else {

      // headers.unshift({
      //   text: this.$t("jobNo"),
      //   value: "moNo",
      //   align: "left",
      //   sortable: true,
      //   width: "10%"
      // });
      // }

      return headers;
    },
    lotheaders() {
      let headers = [];
      headers = [
        {
          value: "detail",
          align: "left",
          sortable: true,
          width: "5%"
        },
        {
          value: "statusIcon",
          align: "left",
          sortable: true,
          width: "2%"
        },

        {
          text: this.$t("process"),
          value: "opItem",
          sortable: false,
          align: "left",
          width: "20%"
        },
        {
          text: this.$t("status"),
          value: "status",
          sortable: false,
          align: "left",
          width: "5%"
        },
        {
          text: this.$t("lotCreate") + this.$t("date"),
          value: "lotDate",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("require") + this.$t("count"),
          value: "qty",
          sortable: false,
          align: "left",
          width: "10%"
        },
        {
          text: this.$t("action"),
          value: "action",
          sortable: false,
          align: "left",
          width: "10%"
        }
      ];
      // if (setting.version == "YCM") {
      //   headers.splice(2, 0, {
      //     text: this.$t("jobNo") + this.$t("No"),
      //     value: "lotNo",
      //     align: "left",
      //     sortable: true,
      //     width: "10%"
      //   });
      // } else {
      headers.splice(2, 0, {
        text: this.$t("lot") + this.$t("No"),
        value: "lotNo",
        align: "left",
        sortable: true,
        width: "10%"
      });
      // }
      return headers;
    }
  }
};
</script>
<style lang="scss" scoped>
.some-other-style {
  background: rgb(231, 231, 231);
}
.my-header-style {
  color: #6f8fb9 !important;
}
.style-1 {
  background-color: rgb(215, 215, 44);
}
.style-2 {
  background-color: rgb(114, 114, 67);
}
</style>
