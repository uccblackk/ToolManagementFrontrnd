<template>
  <v-layout row wrap style="width:100%">
      <v-flex md12 class="pa-5 mt-n10">
        <v-data-table
        dense
        style="width:100%"
      :headers="headers"
      :items="data"
      class="elevation-1"
      v-if="opData.length>0"
      :itemsPerPage="-1"
      hide-default-header
    >
      <template v-slot:header="{ props: { headers } }">
         
        <tr >
          <th class="text-xs-left" style="border-bottom: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" rowspan="1">{{$t("orderCreateTime")}}</th>
           <th class="text-xs-center" style="border-bottom: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" rowspan="1">{{$t("orderCount")}}</th>
          <th class="text-xs-center" style="border-bottom: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" rowspan="1">{{$t("undoneCount")}}</th>
          <th class="text-xs-center" style="border-bottom: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" :colspan="opData.length">{{$t("undoneProcessType")}}</t>
         
          <th class="text-xs-center" style="border-bottom: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" :colspan="opData.length">{{$t("completed")+$t("count")}}</th>
          <th class="text-xs-left" style="border-bottom: 1px solid #E0E0E0;border-right: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" rowspan="1">{{$t("totalCompleteProgress")}}</th>
         
        </tr>
        <tr >
           <th style="border-bottom: 1px solid #E0E0E0;border-right: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0"></th>
            <th style="border-bottom: 1px solid #E0E0E0;border-right: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0"></th>
               <th style="border-bottom: 1px solid #E0E0E0;border-right: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0"></th>
            <th style="border-bottom: 1px solid #E0E0E0;border-right: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" :v-if="opData.length>0" v-for="op in opData" :key="op.id">{{op.opName}}</th>
             <th style="border-bottom: 1px solid #E0E0E0;border-right: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0" :v-if="opData.length>0" v-for="op in opData" :key="op.opNo">{{op.opName}}</th>
           <th style="border-bottom: 1px solid #E0E0E0;border-right: 1px solid #E0E0E0;border-left: 1px solid #E0E0E0"></th>
        </tr>
     
       
      </template>
      <template  v-slot:body="{ items }">
      <tbody>
          <tr
            v-for="item in items"
            :key="item.name"
          >
        <td>{{ item.createDate }}</td>
         <td class="text-xs-center">{{ item.totalLotOpCount }}</td>
        <td class="text-xs-center">{{ item.unDoneCount }}</td>
         <td v-for="op in opData" :key="op.id" class="text-xs-center">{{ item.unDoneData[op.opNo] }}</td>
            <td class="text-xs-center" v-if="opData.length==0">{{"0"}}</td>
           <td v-for="op in opData" :key="op.opNo" class="text-xs-center">{{ item.doneData[op.opNo] }}</td>
           <td class="text-xs-center" v-if="opData.length==0">{{"0"}}</td>
         <td class="text-xs-left">
           <v-progress-linear
      height="20"
      v-if="item.progress>=100"
      :value="item.progress"
      striped
      color="primary"
      style="color:white"
    >
     <strong
              >{{ item.progress }}%</strong
            >
            </v-progress-linear>
             <v-progress-linear
      height="20"
      v-if="item.progress>0&&item.progress<100"
      :value="item.progress"
      striped
      color="success"
    >
     <strong
              >{{ item.progress }}%</strong
            >
            </v-progress-linear>
             <v-progress-linear
      height="20"
      v-if="item.progress==0"
      :value="item.progress"
      striped
      color="error"
    >
     <strong
              >{{ item.progress }}%</strong
            >
            </v-progress-linear>
            </td>
          </tr>
      </tbody>
      </template>
    </v-data-table>
    </v-flex>
     </v-layout>
     
</template>
<script>
import moment from "moment";
export default {
  props: {
    data:[],
    opData:[]
  },
  data() {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 15,
      headers: [
       
      ],
      desserts: [
      
      ]
    };
  },
  methods: {},
  mounted() {},
  watch: {
    opData(){
      //console.log(this.opData);
    }
  },
  created() {}
};
</script>
<style>
.no-border {
  border: 0 !important;
}

.border-bottom-1 {
  border-bottom: 1px solid rgba(0,0,0,.12);
}
.v-data-table td {
   border-left:  1px solid #E0E0E0;
    /* border-top:  1px solid #E0E0E0; */
}
</style>
