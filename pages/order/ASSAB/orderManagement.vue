<template>
  <v-layout row wrap>
    <v-flex xs12 class="mx-6">
      <v-row>
        <v-flex xs12 class="text-left  mt-5">
          <v-chip
            label
            :color="getStatusColor(item.name)"
            v-for="(item, idx) in statusLabel"
            :key="idx"
            class="mx-5 px-5"
            width="100"
            outlined
          >
            <v-icon x-small>mdi-circle</v-icon
            ><strong> {{ item.name }}</strong></v-chip
          >
        </v-flex>
      </v-row>
      <v-row>
        <!-- <v-col cols="12" md="2" lg="2">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="mt-4 primary"
                v-bind="attrs"
                v-on="on"
                width="100%"
                @click="importMo()"
              >
                <v-icon left dark>
                  mdi-application-import
                </v-icon>

                {{ $t("import") + $t("jobNo") }}
              </v-btn>
            </template>
            {{ $t("import") + " ERP " + $t("jobNo") }}
          </v-tooltip>
        </v-col> -->
        <v-col cols="12" md="1">
          <v-btn
            v-show="false"
            disabled
            class=" mt-4 primary"
            @click="autoDispatch()"
            >{{ $t("auto") + $t("dispatch") }}</v-btn
          >
        </v-col>
        <!-- 新增按鈕 -->

        <v-col cols="12" md="1">
          <v-flex d-flex justify-end>
            <v-btn class="mt-4" width="100%" @click="onAddBtnClick()">
              <v-icon left dark>
                mdi-plus-thick
              </v-icon>
              {{ $t("add") }}
            </v-btn>
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
                            :headers="headers"
                            :items="itemList"
                            :items-per-page="itemsPerPage"
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
                            <template v-slot:item.action="{ item }">
                              <v-icon small class="mr-2" @click="edit(item)">
                                mdi-pencil
                              </v-icon>
                              <v-icon small @click="showDeleteDialog(item)">
                                mdi-delete
                              </v-icon>
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
            <!-- 新增工單彈窗_ASSAB -->
            <v-dialog
              v-model="ASSABDialog"
              fullscreen
              hide-overlay
              transition="dialog-bottom-transition"
            >
              <v-card ref="form">
                <v-card-title class="info">
                  <span class=" headline white--text"
                    ><v-icon color="white">mdi-plus</v-icon> {{ $t("add")
                    }}{{ $t("jobNo") }}</span
                  >
                </v-card-title>
                <v-form ref="addForm" v-model="valid" lazy-validation>
                  <v-card-text>
                    <v-card elevation="1">
                      <v-card-title class="grey lighten-2">
                        <span class=" headline font-weight-black">
                          {{ "Basic" }}</span
                        >
                      </v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("customer") + $t("name") }}</v-row
                            >
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                ref="customerName"
                                v-model="addMoForm.customer"
                                :rules="[v => !!v || this.$t('mustInput')]"
                              ></v-text-field
                            ></v-row>
                          </v-col>

                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("customerOrder") + $t("No") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                ref="customerNo"
                                v-model="addMoForm.orderNo"
                                :rules="[v => !!v || this.$t('mustInput')]"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="12" md="3">
                            <v-row no-gutters>
                              {{ $t("customerOrder") + $t("dueDate") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-menu
                                v-model="menu4"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    outlined
                                    v-model="addMoForm.orderDueDate"
                                    prepend-icon="mdi-calendar"
                                    :rules="noRules"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                  >
                                  </v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="addMoForm.orderDueDate"
                                  no-title
                                  locale="zh-cn"
                                  @input="menu4 = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ "*" + $t("productionNo") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                ref="MoNo"
                                v-model="addMoForm.moNo"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ "*" + $t("product") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                ref="itemNo"
                                v-model="addMoForm.itemText"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                @click="onItemTextfieldClick()"
                                required
                                readonly
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{
                                "*" + $t("expected") + $t("start") + $t("date")
                              }}
                            </v-row>
                            <v-row no-gutters>
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
                                    outlined
                                    v-model="addMoForm.startDate"
                                    prepend-icon="mdi-calendar"
                                    :rules="noRules"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                  >
                                  </v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="addMoForm.startDate"
                                  no-title
                                  locale="zh-cn"
                                  :max="addMoForm.endDate"
                                  @input="menu2 = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{
                                "*" +
                                  $t("expected") +
                                  $t("completed") +
                                  $t("date")
                              }}
                            </v-row>
                            <v-row no-gutters>
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
                                    outlined
                                    v-model="addMoForm.endDate"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    :rules="noRules"
                                    required
                                  >
                                  </v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="addMoForm.endDate"
                                  :min="addMoForm.startDate"
                                  no-title
                                  locale="zh-cn"
                                  @input="menu3 = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-row>
                          </v-col>

                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("jobNo") + $t("count") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                ref="count"
                                outlined
                                prepend-icon=" mdi-minus"
                                v-model="addMoForm.count"
                                append-outer-icon="mdi-plus"
                                oninput="if(this.value < 1) this.value = 1;"
                                :rules="[v => !!v || this.$t('mustInput')]"
                                required
                                :type="getCountType()"
                                @change="onCountChange()"
                                @click:append-outer="increment()"
                                @click:prepend="decrement()"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>

                    <v-card class="mt-5">
                      <v-card-title class="grey lighten-2">
                        <span class=" headline font-weight-black">
                          {{ "Detail" }}</span
                        >
                      </v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("ASSABName") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.ASSABName"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("resourceThickness") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.resourceThickness"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("resourceWidth") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.resourceWidth"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("resourceLength") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.resourceLength"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3"> </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("customThickness") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.customThickness"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>

                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("customWidth") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.customWidth"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>

                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("customLength") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.customLength"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3"> </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("widthUpperTolerance") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.widthUpperTolerance"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>

                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("thicknessUpperTolerance") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.thicknessUpperTolerance"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>

                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("lengthUpperTolerance") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.lengthUpperTolerance"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3"> </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("widthLowerTolerance") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.widthLowerTolerance"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("thicknessLowerTolerance") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.thicknessLowerTolerance"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("lengthLowerTolerance") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.lengthLowerTolerance"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("MACHP") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.MACHP"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("zHeat") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.zHeat"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("chamfering") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.chamfering"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("classification") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.classification"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("materialName") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.materialName"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("flatness") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.flatness"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("salesDoc") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.salesDoc"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("itemCount") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.itemCount"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <!-- <v-col cols="12" sm="6" md="3">
                        <v-text-field
                          :label="$t('PONumber')"
                          v-model="addMoForm.PONumber"
                          required
                        ></v-text-field>
                      </v-col> -->
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("transpZone") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.transpZone"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("customerMaterialNum") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.customerMaterialNum"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("bottomChamfering") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.bottomChamfering"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("aroundChamfering") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.aroundChamfering"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("topChamfering") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.topChamfering"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-row no-gutters>
                              {{ $t("weight") }}
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field
                                outlined
                                v-model="addMoForm.weight"
                                required
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="12" sm="6" md="3">
                            <v-checkbox
                              v-model="addMoForm.urgent"
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
                              v-model="addMoForm.remark"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                    <small>*{{ $t("inputRequired") }}</small>
                  </v-card-text>
                </v-form>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="gray" @click="ASSABDialog = false">{{
                    $t("cancel")
                  }}</v-btn>
                  <v-btn class="info" dark text @click="addMo()">
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

        <v-col cols="12" md="3">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                @click:clear="onClearClicked()"
                v-model="dateRangeText"
                :label="$t('select') + $t('date') + $t('range')"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              >
              </v-text-field>
            </template>
            <v-date-picker
              :events="arrayEvents"
              ref="picker"
              v-model="dates"
              :min="min"
              range
            >
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="onCalendarSelected()">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="statusCheckedList"
            :items="statusLabel"
            item-text="name"
            item-value="value"
            :label="this.$t('jobNo') + this.$t('status')"
            multiple
            clearable
          >
            <template v-slot:selection="{ item, index }">
              <v-chip small v-if="index <= 2">
                <span>{{ item.name }}</span>
              </v-chip>
              <span v-if="index === 3" class="grey--text caption">
                (+{{ statusCheckedList.length - 3 }} others)
              </span>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-form onSubmit="return false;">
            <v-text-field
              clearable
              v-model="moSearchValue"
              :label="this.$t('jobNo') + this.$t('search')"
              append-icon="mdi-magnify"
              required
              @click:append="onSearch()"
              @keyup.enter="onSearch()"
            ></v-text-field>
          </v-form>
        </v-col>

        <!-- 搜尋欄 -->
      </v-row>
    </v-flex>

    <v-flex xs12 class="mx-1">
      <OrderManagementTable
        :moData="moData"
        :moSearchValue="moSearchValue"
        :startDate="startDate"
        :endDate="endDate"
        :isLoading="isLoading"
        @update="onSearch"
      />
    </v-flex>
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-layout>
</template>
<script>
import moment from "moment";
import OrderManagementTable from "~/components/order/ASSAB/OrderManagementTable.vue";
const setting = require(`@/static/setting/setting.json`);
export default {
  middleware: "auth",
  data() {
    return {
      itemSearch: "",
      stdLotQty: 1,
      isLoading: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
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

        // {
        //   text: this.$t("action"),
        //   value: "action",
        //   sortable: false,
        //   width: "10%"
        // }
      ],
      itemDialog: false,
      version: null,
      ASSABDialog: false,
      arrayEvents: [],
      hasCustomerOrder: null,
      isLoading: 0,
      statusCheckedList: [],
      statusLabel: [
        { name: this.$t("createlot"), value: "createlot" },
        { name: this.$t("already") + this.$t("dispatch"), value: "dispatch" },
        { name: this.$t("producted"), value: "producted" },
        { name: this.$t("pause"), value: "pause" },
        { name: this.$t("complete"), value: "complete" },
        { name: this.$t("projectClose"), value: "projectClose" }
      ],
      valid: true,
      noRules: [v => !!v || this.$t("mustInput")],
      itemList: [],
      dates: [],
      startDate: null,
      endDate: null,
      min: null,
      menu: false,
      menu2: false,
      overlay: true,
      menu3: false,
      menu4: false,
      formHasErrors: false,
      errorMessages: "",
      moSearchValue: "",
      moData: {},
      dialog: false,
      errorDialog: false,
      station: "",
      message: "",
      addMoForm: {
        orderNo: null,
        customer: null,
        orderDueDate: null,
        moNo: null,
        itemNo: null,
        itemText: null,
        startDate: new Date().toISOString().substr(0, 10),
        endDate: null,
        count: null,
        urgent: null,
        remark: null,

        ASSABName: null,
        resourceThickness: null,
        resourceWidth: null,
        resourceLength: null,
        customThickness: null,
        customWidth: null,
        customLength: null,
        widthUpperTolerance: null,
        thicknessUpperTolerance: null,
        lengthUpperTolerance: null,
        widthLowerTolerance: null,
        thicknessLowerTolerance: null,
        lengthLowerTolerance: null,
        MACHP: null,
        zHeat: null,
        chamfering: null,
        classification: null,
        materialName: null,
        flatness: null,
        salesDoc: null,
        itemCount: null,
        PONumber: null,
        transpZone: null,
        customerMaterialNum: null,
        bottomChamfering: null,
        aroundChamfering: null,
        topChamfering: null,
        weight: null
      },
      stationList: [],
      partSearchType: "partNo",
      partSearchValue: "",
      exceptionReasonList: [],
      exceptionActionList: [],
      dateRangeText: null
    };
  },
  components: {
    OrderManagementTable
  },
  computed: {
    form() {
      return {
        areaNo: this.areaNo,
        areaName: this.areaName
      };
    }
    // dateRangeText: function() {
    //   if (this.dates.length > 1) {
    //     this.min = this.dates[0];
    //     return this.dates.join(" ~ ");
    //   }
    // }
  },

  async asyncData({ app, store, params, error }) {
    const token = store.state.authUser.token;
    if (
      store.state.authUser.authority.find(
        x => x.menu_no == "orderManagement"
      ) == undefined
    ) {
      error({ statusCode: 404, message: "noPermission" });
    }
    let response = await app.$axios.$get(`/Item/Search?value=`, {
      headers: {
        Authorization: token
      }
    });
    let date = new Date().toISOString().substr(0, 10);
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substr(0, 10);
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substr(0, 10);
    let orderResponse = await app.$axios.$get(
      `/Mo/Search?startDate=${firstday}&endDate=${lastday}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    return {
      itemList: response.data,
      moData: orderResponse.data,
      overlay: false
    };
  },
  methods: {
    rowClick: function(item, row) {
      this.addMoForm.itemNo = item.itemNo;
      this.addMoForm.itemText = item.itemName + `(${item.itemNo})`;
      this.stdLotQty = item.stdLotQty;
      this.addMoForm.count = item.stdLotQty;
      this.itemDialog = false;
    },
    onItemTextfieldClick() {
      this.itemDialog = true;
    },
    getCountType() {
      let type = "";
      //type = "number";

      return type;
    },
    increment() {
      console.log(this.stdLotQty);
      if (this.stdLotQty != null) {
        this.addMoForm.count = this.addMoForm.count + this.stdLotQty;
      }
    },
    decrement() {
      if (this.stdLotQty != null) {
        if (this.addMoForm.count != this.stdLotQty) {
          this.addMoForm.count = this.addMoForm.count - this.stdLotQty;
        }
      }
    },
    onAddBtnClick() {
      this.hasCustomerOrder = "Y";
      this.ASSABDialog = true;
      this.stdLotQty = null;
      this.addMoForm.count = null;
      this.addMoForm.moNo = null;
      this.addMoForm.itemText = null;
    },
    autoDispatch() {
      console.log(this.moData);
      let data = this.moData.filter(x => x.status == "new");
      data.forEach(mo => {
        let itemOp = "";
        for (let i = 0; i < mo.itemOpData.length; i++) {
          itemOp += mo.itemOpData[i].id + ",";
        }
        itemOp = itemOp.slice(0, -1);
        this.createLot(mo, itemOp);
      });
    },
    createLot(mo, itemOp) {
      const token = this.$store.state.authUser.token;
      const lot = {
        moId: mo.id,
        lotNo: null,
        lotDate: new Date().toISOString().substr(0, 10),
        qty: mo.qty.toString(),
        completedQty: null,
        actualStartDate: null,
        actualEndDate: null,
        status: "new",
        closeUser: null,
        opSelected: itemOp,
        type: "0"
      };

      this.$axios
        .post(`/Lot/Create?type=0&opSelected=` + itemOp, lot, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
          } else {
          }
        });
    },
    getStatusColor(status) {
      let color = "";
      switch (status) {
        case this.$t("new"):
          color = "grey";
          break;
        case this.$t("already") + this.$t("dispatch"):
          color = "orange darken-1";
          break;
        case this.$t("producted"):
          color = "green accent-4";
          break;
        case this.$t("pause"):
          color = "red darken-1";
          break;
        case this.$t("complete"):
          color = "light-blue accent-4";
          break;
        case this.$t("projectClose"):
          color = "blue-grey darken-3";
          break;
      }
      return color;
    },
    onClearClicked() {
      this.startDate = null;
      this.endDate = null;
      this.dates = [];
    },
    onCalendarSelected() {
      if (this.dates.length > 1) {
        if (this.dates[0] <= this.dates[1]) {
          this.startDate = this.dates[0];
          this.endDate = this.dates[1];
        } else {
          this.startDate = this.dates[1];
          this.endDate = this.dates[0];
        }
        this.dateRangeText = this.startDate + " ~ " + this.endDate;
      }
      this.min = null;
      this.menu = false;
    },
    onSearch() {
      //console.log(this.statusCheckedList);
      this.isLoading = 1;
      const token = this.$store.state.authUser.token;
      let type = "partNo";
      this.$axios
        .get(
          `/Mo/Search?value=${this.moSearchValue}&status=${this.statusCheckedList}&startDate=${this.startDate}&endDate=${this.endDate}`,
          {
            headers: {
              Authorization: token
            }
          }
        )
        .then(res => {
          this.moData = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    onCountChange() {
      if (this.addMoForm.count % this.stdLotQty !== 0) {
        this.addMoForm.count = this.stdLotQty;
      }
    },
    getParameter() {
      let parameter = {};
      parameter = {
        productionNo: this.addMoForm.moNo,
        ASSABName: this.addMoForm.ASSABName,
        resourceThickness: this.addMoForm.resourceThickness,
        resourceWidth: this.addMoForm.resourceWidth,
        resourceLength: this.addMoForm.resourceLength,
        customThickness: this.addMoForm.customThickness,
        customWidth: this.addMoForm.customWidth,
        customLength: this.addMoForm.customLength,
        widthUpperTolerance: this.addMoForm.widthUpperTolerance,
        thicknessUpperTolerance: this.addMoForm.thicknessUpperTolerance,
        lengthUpperTolerance: this.addMoForm.lengthUpperTolerance,
        widthLowerTolerance: this.addMoForm.widthLowerTolerance,
        thicknessLowerTolerance: this.addMoForm.thicknessLowerTolerance,
        lengthLowerTolerance: this.addMoForm.lengthLowerTolerance,
        MACHP: this.addMoForm.MACHP,
        zHeat: this.addMoForm.zHeat,
        chamfering: this.addMoForm.chamfering,
        classification: this.addMoForm.classification,
        materialName: this.addMoForm.materialName,
        flatness: this.addMoForm.flatness,
        salesDoc: this.addMoForm.salesDoc,
        itemCount: this.addMoForm.itemCount,
        PONumber: this.addMoForm.orderNo,
        customerName: this.addMoForm.customer,
        quantity: this.addMoForm.count,
        transpZone: this.addMoForm.transpZone,
        customerMaterialNum: this.addMoForm.customerMaterialNum,
        bottomChamfering: this.addMoForm.bottomChamfering,
        aroundChamfering: this.addMoForm.aroundChamfering,
        topChamfering: this.addMoForm.topChamfering,
        weight: this.addMoForm.weight
      };

      return parameter;
    },
    addMo() {
      let isUrgent = null;
      //console.log(this.addMoForm.urgent);
      if (
        this.addMoForm.moNo == null ||
        this.addMoForm.itemNo == null ||
        this.addMoForm.startDate == null ||
        this.addMoForm.endDate == null ||
        this.addMoForm.count == null
      ) {
        this.$refs["addForm"].validate();
        return;
      }

      if (
        this.hasCustomerOrder == "Y" &&
        (this.addMoForm.orderNo == null ||
          this.addMoForm.customer == null ||
          this.addMoForm.orderDueDate == null)
      ) {
        this.$refs["addForm"].validate();
        return;
      }

      if (this.addMoForm.urgent == null) {
        isUrgent = "N";
      } else {
        isUrgent = "Y";
      }
      let parameter = {};

      parameter = this.getParameter();

      const token = this.$store.state.authUser.token;
      const result = this.itemList.filter(
        x => x.itemNo == this.addMoForm.itemNo
      );
      //console.log(result[0].itemName);
      const mo = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        moNo: this.addMoForm.moNo,
        urgent: isUrgent,
        qty: this.addMoForm.count.toString(),
        lotQty: "0",
        completedQty: null,
        itemNo: this.addMoForm.itemNo,
        itemName: result[0].itemName,
        itemSpec: result[0].itemSpec,
        planStartDate: this.addMoForm.startDate,
        planEndDate: this.addMoForm.endDate,
        actualStartDate: null,
        actualEndDate: null,
        status: "new",
        closeUser: null,
        orderNo: this.addMoForm.orderNo,
        orderDueDate: this.addMoForm.orderDueDate,
        customer: this.addMoForm.customer,
        createTime: new Date(),
        parameter: parameter,
        remark: this.addMoForm.remark
      };
      //console.log(mo);
      // return;
      this.hasCustomerOrder = "N";
      this.addMoForm.orderNo = "";
      this.addMoForm.orderDueDate = "";
      this.addMoForm.customer = "";
      this.addMoForm.moNo = "";
      this.addMoForm.itemNo = "";
      this.addMoForm.count = "";
      this.addMoForm.remark = "";
      this.addMoForm.startDate = new Date().toISOString().substr(0, 10);
      this.addMoForm.endDate = null;

      this.$axios
        .post(`/Mo/create`, mo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            this.$swal(process.name, this.$t("createSuccess"), "success");
            this.dialog = false;
          } else {
            this.$swal(process.name, res.data.msg, "error");
            this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }
          this.refreshMoData();
          this.dialog = false;
          this.ASSABDialog = false;
        })
        .then(() => {});
    },
    importMo() {
      let isUrgent = null;

      let moNo = null;
      let randomItemIndex = Math.floor(Math.random() * this.itemList.length);
      let endDate = new Date();
      endDate.setDate(new Date().getDate() + 1);
      //console.log(this.addMoForm.urgent);
      let moData = this.moData.filter(x =>
        x.moNo.includes(
          new Date()
            .toISOString()
            .substr(0, 10)
            .replaceAll("-", "") + "-"
        )
      );
      //console.log(moData);
      if (moData.length != 0) {
        moData.sort(function(a, b) {
          return b.moNo
            .split("-")[1]
            .localeCompare(a.moNo.split("-")[1], "en", {
              numeric: true
            });
        });
        if (moData.length == 1) {
          let no = 0;
          if (moData[0].moNo.split("-").length > 0) {
            if (parseFloat(moData[0].moNo.split("-")[1]) != NaN) {
              no = parseFloat(moData[0].moNo.split("-")[1]);
              //console.log(no);
            }
          }
          moNo =
            new Date()
              .toISOString()
              .substr(0, 10)
              .replaceAll("-", "") +
            "-" +
            (no + 1);
        } else {
          let no = 0;
          if (moData[0].moNo.split("-").length > 0) {
            if (parseFloat(moData[0].moNo.split("-")[1]) != NaN) {
              no = parseFloat(moData[0].moNo.split("-")[1]);
            }
          }

          moNo =
            new Date()
              .toISOString()
              .substr(0, 10)
              .replaceAll("-", "") +
            "-" +
            (no + 1);
        }
      } else {
        moNo =
          new Date()
            .toISOString()
            .substr(0, 10)
            .replaceAll("-", "") + "-1";
      }
      //console.log(moNo);

      // for (let i = 0; i < 500; i++) {
      const token = this.$store.state.authUser.token;
      const result = this.itemList.filter(
        x => x.itemNo == this.addMoForm.itemNo
      );
      // console.log(result[0].itemName);
      const mo = {
        customerId: setting.default.customerId,
        compNo: setting.default.compNo,
        siteNo: setting.default.siteNo,
        moNo: moNo,
        urgent: "N",
        qty: this.itemList[randomItemIndex].stdLotQty.toString(),
        lotQty: "0",
        completedQty: null,
        itemNo: this.itemList[randomItemIndex].itemNo,
        itemName: this.itemList[randomItemIndex].itemName,
        itemSpec: this.itemList[randomItemIndex].itemSpec,
        planStartDate: new Date().toISOString().substr(0, 10),
        planEndDate: endDate.toISOString().substr(0, 10),
        actualStartDate: null,
        actualEndDate: null,
        status: "new",
        closeUser: null,
        orderNo: moNo,
        orderDueDate: endDate.toISOString().substr(0, 10),
        customer: "ERP",
        createTime: new Date(),
        remark: "From ERP Systenm."
      };

      this.$axios
        .post(`/Mo/create`, mo, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          if (res.data.isSuccess) {
            // this.$swal(
            //   process.name,
            //   this.$t("import") + this.$t("success"),
            //   "success"
            // );
            // this.dialog = false;
          } else {
            // this.$swal(process.name, res.data.msg, "error");
            // this.dialog = false;
            // this.errorDialog = true;
            //  console.log(res.data);
            //  this.message = res.data.msg;
          }

          //this.dialog = false;
        })
        .then(() => {
          this.onSearch();
        });
      //}
    },
    refreshMoData() {
      this.isLoading = 1;
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
          this.moData = res.data.data != null ? res.data.data : [];
          this.isLoading = 0;
        });
    },
    getTotalMoData() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Mo/SearchMoCount`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          let lotWipData = [];

          this.arrayEvents = [];
          if (res.data.data != undefined) {
            //console.log(res.data.data);
            this.arrayEvents = res.data.data;
          }
        })
        .then(() => {});
    }
  },
  mounted() {
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(
      curr.setDate(first) - curr.getTimezoneOffset() * 60000
    );
    var lastday = new Date(
      curr.setDate(curr.getDate() + 6) - curr.getTimezoneOffset() * 60000
    );
    this.dates.push(firstday.toISOString().substr(0, 10));
    this.dates.push(lastday.toISOString().substr(0, 10));

    if (this.dates.length > 1) {
      if (this.dates[0] <= this.dates[1]) {
        this.startDate = this.dates[0];
        this.endDate = this.dates[1];
      } else {
        this.startDate = this.dates[1];
        this.endDate = this.dates[0];
      }
      this.dateRangeText = this.startDate + " ~ " + this.endDate;
    }
    this.min = null;
    this.menu = false;
    this.getTotalMoData();
    this.version = setting.version;

    //this.refreshAreaData();
  },
  head() {
    return {
      title: this.$t("jobManagement")
    };
  },
  created() {},
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
