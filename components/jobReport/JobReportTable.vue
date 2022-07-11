<template>
  <v-layout row wrap>
    <v-flex md12 class="pa-5 mt-n10">
      <!-- 進站彈窗 -->
      <v-dialog v-model="inDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("lot") }}{{ $t("in") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-alert
                    border="top"
                    color="blue lighten-4"
                    style="color:black"
                  >
                    <span class="text-h5 font-weight-black">
                      {{ $t("lot") + " : " + inForm.lotOpNo }}
                    </span>
                  </v-alert>
                </v-col>

                <v-col cols="12" sm="12" md="12" class="mt-n5">
                  <v-alert
                    border="left"
                    color="grey lighten-2 "
                    style="color:black"
                    dark
                  >
                    <v-row no-gutters>
                      <v-col cols="6">
                        <span class="text-h7 font-weight-black">
                          {{
                            $t("process") +
                              " : " +
                              inForm.opName +
                              " (" +
                              selectedItem.opSequence +
                              ")"
                          }}
                        </span>
                      </v-col>
                      <v-col cols="6">
                        <span
                          class="text-h7 font-weight-black"
                          v-if="inForm.resourceType == 'E'"
                          >{{
                            $t("equipment") + " : " + inForm.resourceName
                          }}</span
                        >
                        <span class="text-h7 font-weight-black" v-else>{{
                          $t("line") + " : " + inForm.resourceName
                        }}</span>
                      </v-col>
                    </v-row>
                  </v-alert>
                </v-col>

                <v-col cols="12" sm="12" md="6">
                  <v-select
                    ref="itemSpec"
                    :label="$t('executor')"
                    :items="userData"
                    return-object
                    item-text="name"
                    v-model="inForm.user"
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="12" md="6">
                  <v-text-field
                    ref="itemNo"
                    :label="$t('expected') + $t('produce') + $t('count')"
                    v-model="inForm.planQty"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                  <v-text-field
                    ref="itemName"
                    :label="$t('already') + $t('in') + $t('count')"
                    v-model="inForm.inQty"
                    disabled
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="12" md="6">
                  <v-text-field
                    ref="itemDesc"
                    :label="$t('in') + $t('count')"
                    v-model="inForm.qty"
                    oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                    :rules="[v => !!v || this.$t('mustInput')]"
                    :max="maxInCount"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    ref="itemQty"
                    :label="$t('description')"
                    counter="25"
                    maxlength="25"
                    v-model="inForm.desc"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="inDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="inReport()">
              {{ $t("in") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 出站彈窗 -->
      <v-dialog v-model="outDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="info">
            <span class=" headline white--text">
              {{ $t("lot") }}{{ $t("outStation") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-alert
                      border="top"
                      color="blue lighten-4"
                      style="color:black"
                    >
                      <span class="text-h5 font-weight-black">
                        {{ $t("lot") + " : " + outForm.lotOpNo }}
                      </span>
                    </v-alert>
                  </v-col>

                  <v-col cols="12" sm="12" md="12" class="mt-n5">
                    <v-alert
                      border="left"
                      color="grey lighten-2 "
                      style="color:black"
                      dark
                    >
                      <v-row no-gutters>
                        <v-col cols="6">
                          <span class="text-h7 font-weight-black">
                            {{
                              $t("process") +
                                " : " +
                                outForm.opName +
                                " (" +
                                selectedItem.opSequence +
                                ")"
                            }}
                          </span>
                        </v-col>
                        <v-col cols="6">
                          <span
                            class="text-h7 font-weight-black"
                            v-if="outForm.resourceType == 'E'"
                            >{{
                              $t("equipment") + " : " + outForm.resourceName
                            }}</span
                          >
                          <span class="text-h7 font-weight-black" v-else>{{
                            $t("line") + " : " + outForm.resourceNo
                          }}</span>
                        </v-col>
                      </v-row>
                    </v-alert>
                  </v-col>

                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      ref="itemNo"
                      :label="$t('expected') + $t('produce') + $t('count')"
                      v-model="outForm.planQty"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      ref="itemName"
                      :label="$t('already') + $t('outStation') + $t('count')"
                      v-model="outForm.outQty"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-select
                      ref="itemSpec"
                      :label="$t('executor')"
                      :items="userData"
                      return-object
                      item-text="name"
                      v-model="outForm.user"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="itemDesc"
                      :label="$t('outStation') + $t('count')"
                      v-model="outForm.qty"
                      oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      :max="maxInCount"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-checkbox
                      v-model="isNGCheck"
                      :label="$t('ifor') + $t('has') + $t('NG') + $t('count')"
                      @change="onIsNGCheckChange()"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-select
                      v-if="isNGCheck == true"
                      v-model="outForm.QCReason"
                      :label="$t('NG') + $t('reason')"
                      :items="reasonList"
                      item-text="reasonName"
                      return-object
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      v-if="isNGCheck == true"
                      ref="itemDesc"
                      :label="$t('NG') + $t('count')"
                      v-model="outForm.NGCount"
                      oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                      :max="outForm.qty"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="itemQty"
                      :label="$t('description')"
                      counter="25"
                      maxlength="25"
                      v-model="outForm.desc"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="outDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="info" dark text @click="outReport()">
              {{ $t("outStation") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 暫停彈窗 -->
      <v-dialog v-model="pauseDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="warning">
            <span class=" headline white--text">
              {{ $t("lot") }}{{ $t("pause") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="6">
                    <span class="text-h5 font-weight-black">
                      {{ $t("lot") + " : " + outForm.lotOpNo }}
                    </span>
                  </v-col>

                  <v-col cols="12" sm="12" md="6">
                    <span class="text-h5 font-weight-black">
                      {{ $t("process") + " : " + outForm.opName }}
                    </span>
                  </v-col>

                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      ref="itemNo"
                      :label="$t('expected') + $t('produce') + $t('count')"
                      v-model="outForm.planQty"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      ref="itemName"
                      :label="$t('already') + $t('outStation') + $t('count')"
                      v-model="outForm.outQty"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-select
                      ref="itemSpec"
                      :label="$t('executor')"
                      :items="userData"
                      return-object
                      item-text="name"
                      v-model="outForm.user"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="itemDesc"
                      :label="$t('outStation') + $t('count')"
                      v-model="outForm.qty"
                      oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                      :rules="[v => !!v || this.$t('mustInput')]"
                      :max="maxInCount"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-checkbox
                      v-model="isNGCheck"
                      :label="$t('ifor') + $t('has') + $t('NG') + $t('count')"
                      @change="onIsNGCheckChange()"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-select
                      v-if="isNGCheck == true"
                      v-model="outForm.QCReason"
                      :label="$t('NG') + $t('reason')"
                      :items="reasonList"
                      item-text="reasonName"
                      return-object
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      v-if="isNGCheck == true"
                      ref="itemDesc"
                      :label="$t('NG') + $t('count')"
                      v-model="outForm.NGCount"
                      oninput="if(this.value < 0) this.value = 0;if(Number(this.value) > Number(this.max)) this.value = this.max;"
                      :max="outForm.qty"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field
                      ref="itemQty"
                      :label="$t('description')"
                      counter="25"
                      maxlength="25"
                      v-model="outForm.desc"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="pauseDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn class="warning" dark text @click="pauseReport()">
              {{ $t("pause") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 生產動作報工彈窗 -->
      <v-dialog v-model="produceActionDialog" persistent max-width="800px">
        <v-card ref="form">
          <v-card-title class="success">
            <span class=" headline white--text">
              <v-icon color="white" class="mb-1" left>
                mdi-checkbox-marked-circle-outline
              </v-icon>
              {{ $t("produce") }}{{ $t("action") }}{{ $t("jobReport") }}</span
            >
            <v-spacer />
            <div style="text-align:right">
              <v-btn
                :disabled="opActionData == 0"
                color="error"
                dark
                class="mb-2"
                @click="reworkDialog = true"
              >
                {{ $t("rework") }}
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <v-container>
              <!-- 生產動作報工表格 -->
              <v-data-table
                :items="reworkActionList"
                :items-per-page="10"
                :sort-by="['actionSequence']"
                :sort-asc.sync="isActionDescending"
                :headers="opActionHeaders"
                class="elevation-1 mytable"
                :loading="isActionLoading == 1"
                loading-text="Loading... Please wait"
              >
                <template v-slot:item.actionName="{ item }">
                  {{ item.actionName[0] }}
                </template>
                <template v-slot:item.startTime="{ item }">
                  <v-btn
                    color="success"
                    v-if="getActionTime(item, 'START') == null"
                    @click="onActionCheck(item, 'START')"
                  >
                    <v-icon left>
                      mdi-check-bold
                    </v-icon>
                    {{ $t("completed") }}
                  </v-btn>
                  <span>{{ getActionTime(item, "START") }}</span>
                </template>
                <template v-slot:item.finishTime="{ item }">
                  <v-btn
                    color="success"
                    v-if="getActionTime(item, 'END') == null"
                    @click="onActionCheck(item, 'END')"
                  >
                    <v-icon left>
                      mdi-check-bold
                    </v-icon>
                    {{ $t("completed") }}
                  </v-btn>
                  <span>{{ getActionTime(item, "END") }}</span>
                </template>
              </v-data-table>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="produceActionDialog = false">{{
              $t("completed")
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 返工彈窗 -->
      <v-dialog v-model="reworkDialog" persistent max-width="600px">
        <v-card ref="form">
          <v-card-title class="error">
            <span class=" headline white--text">
              <v-icon color="white" class="mb-1" left>
                mdi-checkbox-marked-circle-outline
              </v-icon>
              {{ $t("produce") }}{{ $t("action") }}{{ $t("rework") }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-select
                v-model="selectedOpAction"
                :label="$t('produce') + $t('action')"
                :items="opActionData"
                item-text="actionName"
                item-value="actionNo"
              ></v-select>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="gray" @click="reworkDialog = false">{{
              $t("cancel")
            }}</v-btn>
            <v-btn
              color="error"
              @click="onReworkActionCheck('ACTION_REWORK')"
              >{{ $t("confirm") }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 指定結案詢問視窗 -->
      <v-dialog v-model="closeDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="error">
            <span class=" headline white--text">
              {{ $t("projectClose") }}
            </span>
          </v-card-title>
          <v-card-text>
            <span class="text-h5 font-weight-black">
              {{ $t("ifor") + $t("projectClose") }}?
            </span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="closeDialog = false">
              {{ $t("cancel") }}
            </v-btn>
            <v-btn class="error" text @click="closeReport()">
              {{ $t("confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-alert v-if="lotWipList.length > 0" dense text type="info" class="ma-2">
        {{ $t("lot") + $t("count") }}：<strong>{{ totalCount }}</strong>
      </v-alert>
      <v-alert v-else dense text type="warning" class="ma-2">
        {{ $t("lot") + $t("count") }}：<strong>{{ totalCount }}</strong>
      </v-alert>
      <v-data-table
        :headers="headers"
        :items="lotWipList"
        :sort-by="['moData.urgent']"
        :sort-desc="[true]"
        class="elevation-1 mytable"
        :loading="loading == 1"
        loading-text="Loading... Please wait"
        hide-default-header
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <v-card
            class=" mt-3 mb-3 rounded-lg font-weight-black"
            elevation="2"
            outlined
          >
            <v-system-bar
              v-if="item.status != 'dispatch'"
              :color="getStatusColor(item.status)"
              dark
            >
              <v-icon color="white">mdi-file</v-icon>
              <span v-if="item.status != 'close'">
                {{
                  $t(item.status) + " - " + item.lot.lotNo + " - " + item.opName
                }}
              </span>
              <span v-else>
                {{
                  $t("projectClose") +
                    " - " +
                    item.lot.lotNo +
                    " - " +
                    item.opName
                }}
              </span>
              <span class="ml-1" v-if="item.lotWipData.isProduction == 'Y'">
                {{ " (" }}
                <v-icon class="mb-1">
                  mdi-check-circle
                </v-icon>
                {{ $t("already") + $t("production") + " )" }}
              </span>
              <v-spacer></v-spacer>
              <!-- 生產動作報工 -->
              <v-btn
                v-if="jobReport == 'ON'"
                x-small
                class="ma-2"
                outlined
                color="white"
                :disabled="
                  item.lotWipData.inQty === null ||
                    item.status === 'complete' ||
                    item.status === 'close' ||
                    item.status === 'pause'
                "
                @click="onProduceActionClick(item)"
              >
                <v-icon left>
                  mdi-check-bold
                </v-icon>
                {{ $t("produce") + $t("action") + $t("jobReport") }}
              </v-btn>
              <!-- 指定結案按鈕 -->
              <!-- <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
               
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click="onCloseClick(item)"
                    :disabled="
                      item.status == 'complete' || item.status == 'close'
                    "
                  >
                    <v-icon>mdi-close-box-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("projectClose") }}</span>
              </v-tooltip> -->
              <v-btn icon @click="show = !show">
                <v-icon>{{
                  show ? "mdi-chevron-up" : "mdi-chevron-down"
                }}</v-icon>
              </v-btn>
            </v-system-bar>
            <v-system-bar
              v-else
              color="orange darken-1  font-weight-black"
              dark
            >
              <v-icon color="white">mdi-file</v-icon>
              <span
                >{{ $t("already")
                }}{{
                  $t(item.status) + " - " + item.lot.lotNo + " - " + item.opName
                }}</span
              >
              <span class="ml-1" v-if="item.lotWipData.isProduction == 'Y'">
                {{ " (" }}
                <v-icon class="mb-1">
                  mdi-check-circle
                </v-icon>
                {{ $t("already") + $t("production") + " )" }}
              </span>
              <v-spacer></v-spacer>
              <!-- 生產動作報工 -->
              <v-btn
                v-if="jobReport == 'ON'"
                x-small
                class="ma-2"
                outlined
                color="white"
                :disabled="
                  item.lotWipData.inQty == null ||
                    item.status == 'complete' ||
                    item.status == 'close' ||
                    item.status == 'pause'
                "
                @click="onProduceActionClick(item)"
              >
                <v-icon left>
                  mdi-check-bold
                </v-icon>
                {{ $t("produce") + $t("action") + $t("jobReport") }}
              </v-btn>
              <!-- 指定結案按鈕 -->
              <!-- <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
              
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click="onCloseClick(item)"
                    :disabled="
                      item.status == 'complete' || item.status == 'close'
                    "
                  >
                    <v-icon>mdi-close-box-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("projectClose") }}</span>
              </v-tooltip> -->
              <v-btn icon @click="show = !show">
                <v-icon>{{
                  show ? "mdi-chevron-up" : "mdi-chevron-down"
                }}</v-icon>
              </v-btn>
            </v-system-bar>
            <v-expand-transition>
              <div v-show="show" :style="getCardColor(item.moData)">
                <v-row justify="center" align="center">
                  <!-- <v-col cols="1">
                <div v-if="item.status == 'new'">
                  <v-icon x-large color="grey">mdi-circle</v-icon>
                </div>

                <div v-else-if="item.status == 'dispatch'">
                  <v-icon x-large color=" orange darken-1">mdi-circle</v-icon>
                </div>
                <div v-else-if="item.status == 'product'">
                  <v-icon x-large color=" green accent-4">mdi-circle</v-icon>
                </div>
                <div v-else-if="item.status == 'complete'">
                  <v-icon x-large color=" light-blue accent-4"
                    >mdi-circle</v-icon
                  >
                </div>
                <div v-else-if="item.status == 'close'">
                  <v-icon x-large color=" red darken-4">mdi-circle</v-icon>
                </div>
              </v-col> -->

                  <v-col
                    style="text-align:center"
                    class="text-h5 font-weight-black"
                    cols="2"
                  >
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          v-bind="attrs"
                          v-on="on"
                          v-if="item.moData.urgent == 'Y'"
                          large
                          color="red"
                        >
                          mdi-fire-alert
                        </v-icon>
                      </template>
                      {{ $t("urgentMo") }}
                    </v-tooltip>
                    {{ item.lot.lotNo }}
                  </v-col>
                  <v-col cols="10">
                    <v-row no-gutters>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 "
                        cols="2"
                      >
                        {{ $t("itemNo") + " : " + item.moData.itemNo }}
                      </v-col>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 "
                        cols="2"
                      >
                        {{ $t("itemName") + " : " + item.moData.itemName }}
                      </v-col>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 "
                        cols="2"
                      >
                        {{ $t("dispatch") + $t("count") + " : " + item.qty }}
                      </v-col>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 "
                        cols="2"
                      >
                        {{
                          $t("previousStation") + " : " + getPreviousOp(item)
                        }}
                      </v-col>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 font-weight-black"
                        cols="2"
                      >
                        {{
                          $t("process") +
                            " : " +
                            item.opName +
                            " (" +
                            item.opSequence +
                            ")"
                        }}
                      </v-col>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 font-weight-black"
                        cols="2"
                      >
                        {{
                          $t("expected") +
                            $t("completed") +
                            $t("date") +
                            " : " +
                            item.moData.planEndDate
                        }}
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 "
                        cols="4"
                      >
                        {{ $t("customer") + " : " }}
                        <span v-if="item.moData.customer != null">
                          {{ item.moData.customer }}
                        </span>
                      </v-col>
                      <v-col
                        style="text-align:left"
                        class="text-h7 mt-2 "
                        cols="4"
                      >
                        {{ $t("salesDoc") + " : " }}
                        <span v-if="item.moData.orderNo != null">
                          {{ item.moData.orderNo }}
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <!-- 
              <v-col class="text-h7 mt-3  d-flex flex-row-reverse" cols="5">
                {{ item.opName }}
              </v-col> -->
                </v-row>
                <v-divider></v-divider>
                <v-card-actions style="background-color:#F0F0F0;height:50px">
                  <v-row no-gutters justify="center" align="center">
                    <v-col
                      style="text-align:left"
                      class="text-h7 font-weight-black"
                      cols="3"
                    >
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            v-bind="attrs"
                            v-on="on"
                            size="16"
                            :color="
                              getMachineStatusColor(item.lotWipData.resourceNo)
                            "
                            >mdi-circle</v-icon
                          >
                        </template>
                        {{
                          $t(
                            "status" +
                              getMachineStatus(item.lotWipData.resourceNo)
                          )
                        }}
                      </v-tooltip>

                      <span
                        style="color:	#0072E3"
                        v-if="item.lotWipData.resourceType == 'E'"
                        >{{
                          $t("equipment") + " " + item.lotWipData.resourceName
                        }}</span
                      >
                      <span style="color:	#0072E3" v-else>{{
                        $t("line") + " " + item.lotWipData.resourceNo
                      }}</span>
                      <span style="color:	#0072E3">
                        {{ " > " + $t("schedule") + $t("start") + $t("time") }}
                      </span>
                      {{ " : " + item.lotWipData.dispatchStartDate + " " }}
                      <span v-if="item.lotWipData.scheduleStartTime != null">
                        {{ item.lotWipData.scheduleStartTime }}</span
                      >
                      {{ " (" + item.lotWipData.shiftName + ")" }}
                    </v-col>

                    <v-col
                      style="text-align:left"
                      class="text-h7 font-weight-black"
                      cols="2"
                    >
                      <span style="color:	#0072E3"
                        >{{ $t("schedule") + $t("end") + $t("time") }}：</span
                      >

                      <span> {{ item.lotWipData.dispatchEndDate + " " }}</span>
                      <span v-if="item.lotWipData.scheduleEndTime != null">
                        {{ item.lotWipData.scheduleEndTime }}
                      </span>
                    </v-col>

                    <v-col
                      style="text-align:left"
                      class="text-h7 font-weight-black"
                      cols="2"
                    >
                      <span style="color:	#0072E3"
                        >{{ $t("in") + $t("time") }}：</span
                      >
                      <span v-if="item.lotWipLogData == undefined">
                        --
                      </span>
                      <span v-else>
                        {{
                          new Date(item.lotWipLogData.logDate)
                            .toISOString()
                            .slice(0, 10) +
                            " " +
                            new Date(
                              item.lotWipLogData.logDate
                            ).toLocaleTimeString()
                        }}</span
                      >
                    </v-col>
                    <v-col
                      style="text-align:left"
                      class="text-h7 font-weight-black"
                      cols="2"
                    >
                      <span style="color:	#0072E3"
                        >{{
                          $t("expected") + $t("outStation") + $t("time")
                        }}：</span
                      >
                      <span v-if="item.lotWipLogData == undefined">
                        --
                      </span>
                      <span v-else>
                        {{
                          getExpectedOutDateTime(
                            new Date(item.lotWipLogData.logDate),
                            item.lotWipData.cycleTime
                          )
                        }}</span
                      >
                    </v-col>
                    <v-col
                      style="text-align:left"
                      class="text-h7 font-weight-black"
                      cols="1"
                    >
                      <span style="color:	#0072E3"
                        >{{ $t("expected") + $t("cycleTime") }}：</span
                      >
                      <span v-if="item.lotWipData.cycleTime == ''">
                        --
                      </span>
                      <span v-else>
                        {{ showItemState(item.lotWipData.cycleTime) }}</span
                      >
                    </v-col>

                    <v-col class="text-h5 d-flex flex-row-reverse" cols="2">
                      <!-- 暫停按鈕 -->
                      <v-btn
                        v-if="
                          item.lotWipData.status != 'pause' && jobReport == 'ON'
                        "
                        color="error"
                        class="text-h7  font-weight-black ml-3"
                        small
                        @click="onPauseClick(item)"
                        :disabled="
                          item.lotWipData.inQty == null ||
                            item.status == 'complete' ||
                            item.status == 'close'
                        "
                      >
                        {{ $t("pause") }}
                      </v-btn>

                      <!-- 取消暫停按鈕 -->
                      <v-btn
                        v-if="
                          item.lotWipData.status == 'pause' && jobReport == 'ON'
                        "
                        color="error"
                        class="text-h7  font-weight-black ml-3"
                        small
                        @click="cancelPauseReport(item)"
                        :disabled="checkEquip(item) == true"
                      >
                        {{ $t("cancel") + $t("pause") }}
                      </v-btn>

                      <!-- 出站按鈕ˋ -->
                      <!-- <v-btn
                        color="primary"
                        class="text-h7  font-weight-black"
                        small
                        @click="onOutClick(item)"
                        :disabled="
                          item.lotWipData.inQty == null ||
                            item.lotWipData.inQty == item.lotWipData.outQty ||
                            item.lotWipData.status == 'pause' ||
                            item.lotWipData.status == 'complete' ||
                            item.lotWipData.status == 'close' ||
                            getMachineStatus(item.lotWipData.resourceNo) == '1'
                        "
                      > -->
                      <v-btn
                        v-if="jobReport == 'ON'"
                        color="primary"
                        class="text-h7  font-weight-black"
                        small
                        @click="onOutClick(item)"
                        :disabled="
                          item.lotWipData.inQty == null ||
                            item.lotWipData.inQty == item.lotWipData.outQty ||
                            item.lotWipData.status == 'pause' ||
                            item.lotWipData.status == 'complete' ||
                            item.lotWipData.status == 'close'
                        "
                      >
                        <span v-if="item.lotWipData.outQty == null">
                          {{ $t("outStation") + "(0)" }}</span
                        >
                        <span v-else>
                          {{
                            $t("outStation") +
                              "(" +
                              item.lotWipData.outQty +
                              ")"
                          }}</span
                        >
                      </v-btn>

                      <!-- 進站按鈕 -->
                      <v-btn
                        v-if="jobReport == 'ON'"
                        color="primary"
                        small
                        class="text-h7  font-weight-black mr-3"
                        @click="onInClick(item)"
                        :disabled="
                          getPreviousOpStatus(item) == true ||
                            checkCount(item) == true ||
                            checkEquip(item) == true ||
                            item.lotWipData.status == 'pause' ||
                            item.lotWipData.status == 'complete' ||
                            item.lotWipData.status == 'close'
                        "
                      >
                        <span v-if="item.lotWipData.inQty == null">
                          {{ $t("in") + "(0)" }}</span
                        >
                        <span v-else>
                          {{
                            $t("in") + "(" + item.lotWipData.inQty + ")"
                          }}</span
                        >
                      </v-btn>
                      <!-- <v-btn
                        color="primary"
                        small
                        class="text-h7  font-weight-black mr-3"
                        @click="onInClick(item)"
                        :disabled="
                          getPreviousOpStatus(item) == true ||
                            checkCount(item) == true ||
                            checkEquip(item) == true ||
                            item.lotWipData.status == 'pause' ||
                            item.lotWipData.status == 'complete' ||
                            item.lotWipData.status == 'close' ||
                            getMachineStatus(item.lotWipData.resourceNo) == '1'
                        "
                      >
                        <span v-if="item.lotWipData.inQty == null">
                          {{ $t("in") + "(0)" }}</span
                        >
                        <span v-else>
                          {{
                            $t("in") + "(" + item.lotWipData.inQty + ")"
                          }}</span
                        >
                      </v-btn> -->
                    </v-col>
                  </v-row>
                </v-card-actions>
              </div>
            </v-expand-transition>
            <!-- {{ item }} -->
          </v-card>
        </template>
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
          @input="onPageChange()"
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
import mqtt from "mqtt";
const setting = require(`@/static/setting/setting.json`);
var order = require("@/static/scripts/mes/order/order.js");
export default {
  props: {
    lotWipData: {},
    lotWipSearchValue: null,
    startDate: null,
    endDate: null,
    isLoading: null,
    totalPage: 0,
    status: null,
    totalCount: 0,
    defaultPage: 0
  },
  data() {
    return {
      snackbar: false,
      snackbarText: "",
      jobReport: "OFF",
      reworkActionList: [],
      loading: null,
      selectedOpAction: "",
      reworkDialog: false,
      mqttData: {},
      mqttClient: {},
      machineData: [],
      closeDialog: false,
      opActionData: [],
      isActionLoading: 0,
      produceActionDialog: false,
      pauseDialog: false,
      reasonList: [],
      isNGCheck: false,
      outDialog: false,
      selectedItem: {},
      maxInCount: null,
      userData: [],
      inDialog: false,
      selection: 1,
      show: true,
      isActionDescending: true,
      isDescending: true,
      lotWipList: {},
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
      itemsPerPage: 10,
      actionList: [],
      actionLogList: [],
      inForm: {
        lotOpNo: null,
        opName: null,
        planQty: null,
        inQty: null,
        qty: null,
        user: {},
        desc: null,
        resourceName: null,
        resourceType: null
      },
      outForm: {
        lotOpNo: null,
        opName: null,
        planQty: null,
        outQty: null,
        qty: null,
        user: {},
        desc: null,
        hasNG: null,
        QCReason: null,
        NGCount: null,
        resourceName: null,
        resourceType: null
      },
      produceActionForm: {
        lotOpNo: null,
        opName: null,
        actionData: []
      },
      deletelotWipData: {
        no: null,
        name: null,
        id: null
      },
      opActionHeaders: [
        {
          text: this.$t("sequence"),
          value: "actionSequence",
          align: "center",

          sortable: false,
          width: "10%"
        },
        {
          text: this.$t("action") + this.$t("name"),
          value: "actionName",
          align: "left",

          sortable: false,
          width: "10%"
        },
        ,
        {
          text: this.$t("action") + this.$t("startTime"),
          value: "startTime",
          align: "left",

          sortable: false,
          width: "10%"
        },
        ,
        {
          text: this.$t("action") + this.$t("finishTime"),
          value: "finishTime",
          align: "left",

          sortable: false,
          width: "10%"
        }
      ],
      headers: [
        {
          text: this.$t("lot"),
          value: "status",
          align: "center",

          sortable: true,
          width: "100%"
        }
      ]
    };
  },
  watch: {
    lotWipData() {
      this.lotWipList = this.lotWipData;
    },
    isLoading() {
      // console.log(" this.isLoading");
      this.loading = this.isLoading;
    },
    totalPage() {
      this.pageCount = this.totalPage;
    },
    defaultPage() {
      //console.log(this.defaultPage);
      this.page = this.defaultPage;
    }
  },
  methods: {
    async wipIn(lotOpData, qty) {
      const res = await order.WipIn(lotOpData, qty);
      return res;
      //console.log(ret);
    },
    getCardColor(moData) {
      let style = "background:transparent";
      if (moData.urgent == "Y") {
        style = "background:#FFE1E1";
      }
      return style;
    },
    onPageChange() {
      let msg = { page: this.page, itemsPerPage: this.itemsPerPage };
      this.$emit("update", msg);
    },
    getExpectedOutDateTime(startDateTime, cycleTime) {
      if (cycleTime != "") {
        var start = new Date(startDateTime);

        var endDateTime = new Date();
        endDateTime = new Date(start.getTime() + parseFloat(cycleTime) * 1000);
        //console.log(endDateTime);
        return (
          endDateTime.toISOString().slice(0, 10) +
          " " +
          endDateTime.toLocaleTimeString()
        );
      } else {
        return "--";
      }
    },
    showItemState(cycleTime) {
      // console.log(cycleTime);
      let result = null;
      if (cycleTime != "" && cycleTime != undefined) {
        result = new Date(cycleTime * 1000).toISOString().substr(11, 8);
      }
      return result;
    },
    onCloseClick(item) {
      this.selectedItem = item;
      this.closeDialog = true;
    },
    getActionTime(item, type) {
      let time = null;
      //console.log(this.actionLogList);
      if (this.actionLogList.length > 0) {
        var data = this.actionLogList.find(
          x =>
            x.logType == item.type + "_" + type && x.actionNo == item.actionNo
        );
        if (data != undefined) {
          time = new Date(data.logDate).toLocaleString();
        }
      }
      return time;
    },
    getActionLog() {
      const token = this.$store.state.authUser.token;

      this.$axios
        .get(`/LotWipLog/Search?lotOpId=${this.selectedItem.id}&type=ACTION`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          this.actionLogList = res.data.data != null ? res.data.data : [];
        })
        .then(res => {
          // 找出含rework字樣的
          var data = [];
          this.reworkActionList = [];
          this.opActionData.forEach(opAction => {
            this.reworkActionList.push({
              actionName: opAction.actionName,
              actionNo: opAction.actionNo,
              actionSequence: opAction.actionSequence,
              compNo: opAction.compNo,
              customerId: opAction.customerId,
              id: opAction.id,
              opNo: opAction.opNo,
              siteNo: opAction.siteNo,
              type: "ACTION"
            });
          });
          data = this.actionLogList
            .filter(x => x.logType.includes("REWORK"))
            .filter(x => x.logType.includes("START") == false)
            .filter(x => x.logType.includes("END") == false)
            .sort(function(a, b) {
              // boolean false == 0; true == 1
              return a.logData > b.logData;
            });
          var num = 0;
          data.forEach(element => {
            let actionNo = element.actionNo;
            console.log(actionNo);
            let seq = this.opActionData.find(x => x.actionNo == actionNo)
              .actionSequence;

            var reworkList = this.opActionData.filter(
              x => x.actionSequence >= seq
            );
            // console.log(reworkList);
            num++;
            reworkList.forEach(reworkData => {
              var aa = reworkData;
              let count = this.reworkActionList.length;
              this.reworkActionList.push({
                actionName: reworkData.actionName,
                actionNo: reworkData.actionNo,
                actionSequence: count + 1,
                compNo: reworkData.compNo,
                customerId: reworkData.customerId,
                id: null,
                opNo: reworkData.opNo,
                siteNo: reworkData.siteNo,
                type: "ACTION_REWORK_" + num
              });
              //  console.log(this.reworkActionList);
            });
          });
        });
    },
    getActionName(item) {
      let actionName;

      if (this.actionList.length > 0) {
        actionName = this.actionList.find(x => x.actionNo == item.actionNo)
          .actionName;
      }
      return actionName;
    },

    onProduceActionClick(item) {
      // console.log(item);
      this.reworkActionList = [];
      this.produceActionForm.lotOpNo = item.lot.lotNo;
      this.produceActionForm.opName = item.opName;
      this.selectedItem = item;
      this.opActionData = item.opActionData;
      // this.reworkActionList = this.opActionData;
      // console.log(this.reworkActionList);

      //console.log(item);

      this.getActionLog();
      this.produceActionDialog = true;
    },
    onIsNGCheckChange() {
      if (this.isNGCheck == true) {
        const token = this.$store.state.authUser.token;
        this.$axios
          .get(`/Reason/Search?type=QC`, {
            headers: {
              Authorization: token
            }
          })
          .then(res => {
            //console.log(res.data.data);
            this.reasonList = res.data.data != null ? res.data.data : [];
            if (this.reasonList.length > 0) {
              this.outForm.QCReason = this.reasonList[0];
            }
          });
      } else {
        this.reasonList = [];
      }
    },
    async inReport() {
      if (this.inForm.qty == 0) {
        return;
      }
      // let res = await this.wipIn(this.selectedItem, this.inForm.qty);
      // console.log(res);
      // if (!res.success) {
      //   this.snackbar = true;
      //   this.snackbarText = res.msg;
      // }
      // return;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.inForm.user.account,
        userName: this.inForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "IN",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.inForm.qty.toString(),
        wipDesc: this.inForm.desc,
        remark: null
      };
      this.inForm.desc = "";

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            this.$swal("", this.$t("in") + this.$t("success"), "success");
            msg = { page: this.page, itemsPerPage: this.itemsPerPage };

            this.inDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.inDialog = false;
          }
          this.$emit("update", msg);
        })
        .then(() => {});
    },
    onInClick(item) {
      this.getUserData();
      let outQty = 0;
      let inQty = 0;
      //console.log(item.lotWipData.resourceName);
      this.selectedItem = item;
      this.inForm.lotOpNo = item.lot.lotNo;
      this.inForm.opName = item.opName;
      this.inForm.resourceName = item.lotWipData.resourceName;
      //console.log(this.inForm.resourceName);
      this.inForm.resourceType = item.lotWipData.resourceType;
      if (item.lotWipData.inQty == null) {
        inQty = 0;
        this.inForm.inQty = 0;
      } else {
        inQty = item.lotWipData.inQty;
        this.inForm.inQty = item.lotWipData.inQty;
      }

      this.inForm.planQty = item.lotWipData.planQty;

      this.inForm.qty = parseFloat(item.lotWipData.planQty) - inQty;
      this.maxInCount = parseFloat(item.lotWipData.planQty) - inQty;
      this.inDialog = true;
    },
    onOutClick(item) {
      this.getUserData();
      let outQty = 0;
      let inQty = 0;
      this.selectedItem = item;
      this.outForm.lotOpNo = item.lot.lotNo;
      this.outForm.opName = item.opName;
      this.outForm.resourceName = item.lotWipData.resourceName;
      this.outForm.resourceType = item.lotWipData.resourceType;
      // 計算進站量
      if (item.lotWipData.inQty == null) {
        inQty = 0;
      } else {
        inQty = item.lotWipData.inQty;
      }
      // 計算出站量
      if (item.lotWipData.outQty == null) {
        outQty = 0;
        this.outForm.outQty = 0;
      } else {
        outQty = item.lotWipData.outQty;
        this.outForm.outQty = item.lotWipData.outQty;
      }

      this.outForm.planQty = item.lotWipData.planQty;

      this.outForm.qty = inQty - outQty;
      this.maxInCount = inQty - outQty;
      this.outDialog = true;
    },
    onPauseClick(item) {
      this.getUserData();
      let outQty = 0;
      let inQty = 0;
      this.selectedItem = item;
      this.outForm.lotOpNo = item.lot.lotNo;
      this.outForm.opName = item.opName;
      // 計算進站量
      if (item.lotWipData.inQty == null) {
        inQty = 0;
      } else {
        inQty = item.lotWipData.inQty;
      }
      // 計算出站量
      if (item.lotWipData.outQty == null) {
        outQty = 0;
        this.outForm.outQty = 0;
      } else {
        outQty = item.lotWipData.outQty;
        this.outForm.outQty = item.lotWipData.outQty;
      }

      this.outForm.planQty = item.lotWipData.planQty;

      this.outForm.qty = inQty - outQty;
      this.maxInCount = inQty - outQty;
      this.pauseDialog = true;
    },
    onActionCheck(item, type) {
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: item.type + "_" + type,
        actionNo: item.actionNo,
        logUserId: this.$store.state.authUser.id,
        qty: this.selectedItem.lotWipLogData.qty,
        wipDesc: null,
        remark: null
      };

      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("jobReport") + this.$t("success"),
              "success"
            );
            this.produceActionDialog = false;
            msg = { page: this.page, itemsPerPage: this.itemsPerPage };
          } else {
            this.$swal("", res.data.msg, "error");
            this.produceActionDialog = false;
          }
          this.$emit("update", msg);
        })
        .then(() => {});
    },
    onReworkActionCheck(type) {
      if (this.selectedOpAction == "") {
        return;
      }
      // 找出已返工的次數
      var data = [];
      data = this.actionLogList.filter(x => x.logType.includes("REWORK"));
      let no = 1;
      if (data != undefined) {
        no = data.length + 1;
      }
      // console.log(data);

      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: type + "_" + no,
        actionNo: this.selectedOpAction,
        logUserId: this.$store.state.authUser.id,
        qty: this.selectedItem.lotWipLogData.qty,
        wipDesc: null,
        remark: null
      };

      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            this.$swal("", this.$t("rework") + this.$t("success"), "success");
            this.reworkDialog = false;
            msg = { page: this.page, itemsPerPage: this.itemsPerPage };

            this.getActionLog();
          } else {
            this.$swal("", res.data.msg, "error");
            this.reworkDialog = false;
          }
          this.$emit("update", msg);
        })
        .then(() => {});
    },
    outReport() {
      if (this.outForm.qty == 0) {
        return;
      }
      if (
        this.isNGCheck == true &&
        (this.outForm.NGCount == 0 || this.outForm.NGCount == null)
      ) {
        return;
      }
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.outForm.user.account,
        userName: this.outForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "OUT",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.outForm.qty.toString(),
        wipDesc: this.outForm.desc,
        remark: null
      };
      this.outForm.desc = "";
      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            lotWipLogId = res.data.id;
            if (lotWipLogId != null && this.isNGCheck == true) {
              this.NgReport(lotWipLogId);
            }
            this.$swal(
              "",
              this.$t("outStation") + this.$t("success"),
              "success"
            );
            msg = { page: this.page, itemsPerPage: this.itemsPerPage };

            this.outDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.outDialog = false;
          }
          this.$emit("update", msg);
        })
        .then(() => {});
    },
    pauseReport() {
      if (
        this.isNGCheck == true &&
        (this.outForm.NGCount == 0 || this.outForm.NGCount == null)
      ) {
        return;
      }
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.outForm.user.account,
        userName: this.outForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "PAUSE",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: this.outForm.qty.toString(),
        wipDesc: this.outForm.desc,
        remark: null
      };
      this.outForm.desc = "";
      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            lotWipLogId = res.data.id;
            if (lotWipLogId != null && this.isNGCheck == true) {
              this.NgReport(lotWipLogId);
            }
            this.$swal("", this.$t("pause") + this.$t("success"), "success");
            msg = { page: this.page, itemsPerPage: this.itemsPerPage };

            this.pauseDialog = false;
          } else {
            this.$swal("", res.data.msg, "error");
            this.pauseDialog = false;
          }
          this.$emit("update", msg);
        })
        .then(() => {});
    },
    cancelPauseReport(item) {
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: item.moData.id,
        lotId: item.lot.id,
        lotOpId: item.id,
        resourceType: item.lotWipData.resourceType,
        resourceNo: item.lotWipData.resourceNo,
        resourceName: item.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: item.workShiftData[0][0].shiftNo,
        shiftName: item.workShiftData[0][0].shiftName,
        dispatchStartDate: item.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "CANCEL_PAUSE",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: null,
        wipDesc: null,
        remark: null
      };

      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("cancel") + this.$t("pause") + this.$t("success"),
              "success"
            );
            msg = { page: this.page, itemsPerPage: this.itemsPerPage };
          } else {
            this.$swal("", res.data.msg, "error");
          }
          this.$emit("update", msg);
        })
        .then(() => {});
    },
    closeReport() {
      let lotWipLogId = null;
      const token = this.$store.state.authUser.token;
      const lotWipLog = {
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.$store.state.authUser.account,
        userName: this.$store.state.authUser.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logType: "CLOSE",
        actionNo: null,
        logUserId: this.$store.state.authUser.id,
        qty: null,
        wipDesc: null,
        remark: null
      };

      //console.log(this.outForm.hasNG);

      // 寫入生產日誌

      this.$axios
        .post(`/LotWipLog/create`, lotWipLog, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            this.$swal(
              "",
              this.$t("projectClose") + this.$t("success"),
              "success"
            );
            this.closeDialog = false;
            msg = { page: this.page, itemsPerPage: this.itemsPerPage };
          } else {
            this.$swal("", res.data.msg, "error");
            this.closeDialog = false;
          }
          this.$emit("update", msg);
        })
        .then(() => {});
    },
    NgReport(lotWipLogId) {
      const token = this.$store.state.authUser.token;
      const prodNg = {
        lotWipLogId: lotWipLogId,
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        moId: this.selectedItem.moData.id,
        lotId: this.selectedItem.lot.id,
        lotOpId: this.selectedItem.id,
        resourceType: this.selectedItem.lotWipData.resourceType,
        resourceNo: this.selectedItem.lotWipData.resourceNo,
        resourceName: this.selectedItem.lotWipData.resourceName,
        userNo: this.outForm.user.account,
        userName: this.outForm.user.name,
        shiftNo: this.selectedItem.workShiftData[0][0].shiftNo,
        shiftName: this.selectedItem.workShiftData[0][0].shiftName,
        dispatchStartDate: this.selectedItem.lotWipData.dispatchStartDate,
        logDate: new Date().toISOString(),
        logUserId: this.outForm.user.id,
        logUserName: this.outForm.user.name,
        dataSrc: "OUT",
        qcType: "4",
        ngQty: this.outForm.NGCount.toString(),
        reasonNo: this.outForm.QCReason.reasonNo,
        reasonName: this.outForm.QCReason.reasonName,
        status: "Y"
      };
      //  console.log(prodNg);

      // 寫入不良品日誌

      this.$axios
        .post(`/ProdNg/create`, prodNg, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
          } else {
          }
        })
        .then(() => {});
    },
    getStatusColor(status) {
      let color = "";

      switch (status) {
        case "new":
          color = "grey   font-weight-black";
          break;
        case "createlot":
          color = "grey darken-1  font-weight-black";
          break;
        case "dispatch":
          color = "orange darken-1  font-weight-black";
          break;
        case "producted":
          color = "green accent-4  font-weight-black";
          break;
        case "pause":
          color = "red darken-1  font-weight-black";
          break;
        case "complete":
          color = "light-blue accent-4  font-weight-black";
          break;
        default:
          color = "blue-grey darken-3  font-weight-black";
          break;
      }
      //console.log(color);
      return color;
    },
    edit(item) {
      // console.log(item);
      this.editDialog = true;
      this.inForm.no = item.itemNo;
      this.inForm.name = item.itemName;
      this.inForm.spec = item.itemSpec;
      this.inForm.desc = item.description;
      this.inForm.qty = item.stdLotQty;
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
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        itemNo: this.inForm.no,
        itemName: this.inForm.name,
        itemSpec: this.inForm.spec,
        description: this.inForm.desc,
        itemType: "1",
        stdLotQty: this.inForm.qty,
        status: "Y"
      };
      this.inForm.no = "";
      this.inForm.name = "";
      this.inForm.spec = "";
      this.inForm.desc = "";
      this.inForm.qty = "";

      this.$axios
        .post(`/Item/update`, Item, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            this.$swal(Item.name, this.$t("editSuccess"), "success");
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(self.name, this.$t("editFailed"), "error");
          }
          msg = { page: this.page, itemsPerPage: this.itemsPerPage };
          this.$emit("update", msg);
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
      this.deletelotWipData.no = "";
      this.deletelotWipData.name = "";

      this.$axios
        .delete(`/Item/delete/${this.deletelotWipData.id}`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let msg = null;
          if (res.data.isSuccess) {
            this.$swal(
              this.deletelotWipData.no,
              this.$t("deleteSuccess"),
              "success"
            );
          } else {
            this.errorDialog = true;
            this.message = res.data.msg;
            this.$swal(self.name, this.$t("deleteFailed"), "error");
          }
          msg = { page: this.page, itemsPerPage: this.itemsPerPage };
          this.$emit("update", msg);
          this.deleteDialog = false;
        })
        .then(() => {});
    },
    refreshlotWipData() {
      this.loading = 1;
      this.lotWipList = [];
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(
          `/LotOp/Search?value=${this.lotWipSearchValue}&status=${this.status}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          //console.log(res.data.data);
          this.lotWipList = res.data.data != null ? res.data.data : [];
          // this.loading = 0;
        });
    },
    getUserData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/User/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.userData = res.data.data != null ? res.data.data : [];
          //console.log(this.$store.state.authUser);
          this.inForm.user = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );

          this.outForm.user = this.userData.find(
            x => x.id == this.$store.state.authUser.id
          );
        });
    },
    showDeleteDialog(item) {
      this.deleteDialog = true;
      // console.log(item);
      this.deletelotWipData.no = item.ItemNo;
      this.deletelotWipData.name = item.ItemName;
      this.deletelotWipData.id = item.id;
    },
    getPreviousOp(item) {
      let opName = "--";
      let lotOpData = item.lotOpData;
      //console.log(lotOpData);
      let data = lotOpData.find(
        x => x.opSequence.localeCompare(item.opSequence) < 0
      );
      if (data != undefined) {
        //console.log(data.opName + data.opSequence);
        opName = data.opName + " (" + data.opSequence + ")";
      }

      // for (let i = 0; i < lotOpData.length; i++) {
      //   if (parseFloat(lotOpData[i].opSequence) < parseFloat(item.opSequence)) {
      //     opName = lotOpData[i].opName;
      //     break;
      //   }
      // }
      return opName;
    },
    getPreviousOpStatus(item) {
      let lotOpData = item.lotOpData;
      let status = true;
      // 搜尋該生產批下的製程內容
      for (let i = 0; i < lotOpData.length; i++) {
        // 若製程順序小於當前生產批製程順序則進入
        if (parseFloat(lotOpData[i].opSequence) < parseFloat(item.opSequence)) {
          //若前一筆製程的狀態等於"complete"或"close"
          if (
            lotOpData[i].status == "complete" ||
            lotOpData[i].status == "close"
          ) {
            //console.log(lotOpData[i]);
            //則回覆啟用按鈕
            status = false;
            return status;
          } else {
            //若前一筆製程的狀態不等於"complete"或"close", 則回覆禁止啟用按鈕
            status = true;
            return status;
          }
        }
      }
      //若當前製程序為最高的,則回覆啟用按鈕
      status = false;
      return status;
    },
    checkCount(item) {
      let lotWipData = item.lotWipData;
      let status = false;
      if (parseFloat(lotWipData.inQty) >= parseFloat(lotWipData.planQty)) {
        status = true;
      }

      return status;
    },
    checkEquip(item) {
      let resourceType = item.lotWipData.resourceType;
      let resourceNo = item.lotWipData.resourceNo;
      let resourceName = item.lotWipData.resourceName;
      //console.log(item);
      if (item.machineLotWipData != null) {
        // console.log(item.lotWipData.resourceNo);
        // console.log(item.machineLotWipData.resourceNo);
        if (
          item.machineLotWipData.find(
            x =>
              x.resourceType == resourceType &&
              x.resourceNo == resourceNo &&
              x.resourceName == resourceName
          ) != undefined
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    getMachineStatus(machineNo) {
      let status = "7";

      var machineData = this.machineData.find(x => x.machineNo === machineNo);
      if (machineData != null) {
        //console.log(machineData.Data.Status);
        status = machineData.data.status;
      }
      return status;
    },
    getMachineStatusColor(machineNo) {
      let status = "7";
      let color = "black";
      var machineData = this.machineData.find(x => x.machineNo === machineNo);
      if (machineData != null) {
        //console.log(machineData.Data.Status);
        status = machineData.data.status;
      }
      switch (status) {
        case "1":
          color = "#01B468";
          break;
        case "5":
          color = "#FFBB77";
          break;
        case "7":
          color = "black";
          break;
        case "2":
          color = "red";
          break;
      }
      return color;
    },
    uuid() {
      var d = Date.now();
      if (
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
      ) {
        d += performance.now(); //use high-precision timer if available
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
    },
    mqttMSG() {
      const options = {
        connectTimeout: 40000,
        clientId: this.uuid(),
        clean: true
      };

      // mqtt连接
      if (!this.mqttClient.connted) {
        this.mqttClient = mqtt.connect(setting.mqtt.url, options);
        this.mqttClient.on("connect", e => {
          console.log("连接成功:");
          this.mqttClient.subscribe(
            `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
            { qos: 0 },
            error => {
              if (!error) {
                console.log("订阅成功");
              } else {
                console.log("订阅失败");
              }
            }
          );
        });

        // 接收消息处理
        this.mqttClient.on("message", (topic, message) => {
          //    console.log(message.toString());
          const mqttData = JSON.parse(message.toString());

          let pos = this.machineData
            .map(x => x.machineNo)
            .indexOf(mqttData.machineNo);
          if (pos == -1) {
            this.machineData.push(mqttData);
          } else {
            this.machineData.splice(pos, 1);
            this.machineData.push(mqttData);
          }

          let statusString = "";
          let colorString = "";
          let yValue = null;
          this.dataPoints = [];

          // yValue = this.machineData.filter(x => x.Data.Status === "1");

          //  console.log(this.machineData.filter(x => x.machineNo === "CNC01"));
          //  console.log(this.dataPoints);
        });

        // 链接异常处理
        this.mqttClient.on("error", error => {
          console.log("连接失败:", error);
        });
      }
    }
  },
  beforeDestroy() {
    //斷線
    this.mqttClient.unsubscribe(
      `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
      error => {
        console.log("取消訂閱");
        if (error) {
          console.log("Unsubscribe error", error);
        }
      }
    );
    this.mqttClient.end();
    this.mqttClient = {
      connected: false
    };
  },
  mounted() {
    //console.log(this.status);
  },
  activated() {
    this.loading = this.isLoading;
    this.lotWipList = this.lotWipData;
    this.mqttMSG();
  },
  deactivated() {
    if (this.mqttClient.connted) {
      this.mqttClient.unsubscribe(
        `${setting.mqtt.customer}/D200/tc/+/EqInfo/GetStatus`,
        error => {
          console.log("取消訂閱");
          if (error) {
            console.log("Unsubscribe error", error);
          }
        }
      );
      this.mqttClient.end();
      this.mqttClient = {
        connected: false
      };
    }
  },
  computed: {},
  created() {
    this.loading = this.isLoading;
    this.lotWipList = this.lotWipData;
    this.mqttMSG();
    this.jobReport = setting.jobReport;
    // console.log(this.status);
  }
};
</script>
<style>
.mytable table tr {
  /* background-color: rgb(235, 235, 235); */
}
</style>
