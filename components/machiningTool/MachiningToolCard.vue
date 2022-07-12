<template>
  <v-hover v-slot:default="{ hover }" open-delay="200">
    <v-card
      max-width="300"
      class="transition-swing"
      height="300"
      :elevation="hover ? 6 : 2"
    >
      <v-system-bar class="blue-grey white--text justify-center" dark>
        {{ num }}
      </v-system-bar>
      <div v-if="tool != undefined" class="text-center mx-2">
        <v-avatar
          v-if="tool.img == null"
          color="grey darken-1 white--text text-h5"
          class="mt-1"
          size="100"
          dark
        >
          <span class="text-truncate" style="max-width: 100px;">
            {{ tool.name }}
          </span>
        </v-avatar>
        <v-img
          v-if="tool.img != null"
          class="mt-1"
          :src="tool.img"
          width="auto"
          height="100px"
          contain
        ></v-img>
        <v-card-actions>
          <v-progress-linear
            class="hover mx-5"
            height="20"
            striped
            :color="
              getUsedColor(usedPercentage(tool.toolLife, tool.elapsedTime))
            "
            :value="usedPercentage()"
            @click="updateElapsedTime()"
          >
            <strong>{{ usedPercentage() }}%</strong>
          </v-progress-linear>
        </v-card-actions>
        <v-btn text @click="bindTool()" class="my-1">
          {{ tool.name
          }}<v-icon class="gray justify-end" dark>mdi-close</v-icon>
        </v-btn>
      </div>
      <div v-else class="text-center">
        <v-btn
          class="blue-grey white--text my-15 pa-10 text-center"
          height="80"
          @click="bindTool()"
          >{{ $t("bindToolMagazine") }}
          <v-icon>mdi-content-duplicate</v-icon></v-btn
        >
      </div>
      <v-divider class="mx-4"></v-divider>
      <v-card-subtitle>
        <div v-if="tool != undefined">
          <v-row no-gutters>
            <v-col md="4">
              <span style="color: gray">{{ $t("brand") }}:</span>
            </v-col>
            <v-col md="8">
              <span style="color: gray">{{ tool.brand }}</span>
            </v-col>
            <v-col md="4">
              <span style="color: gray">{{ $t("series") }}:</span>
            </v-col>
            <v-col md="8">
              <span style="color: gray">{{ tool.series }}</span>
            </v-col>
            <v-col md="4">
              <span style="color: gray">{{ $t("type") }}:</span>
            </v-col>
            <v-col md="8">
              <span style="color: gray">{{ tool.type }}</span>
            </v-col>
          </v-row>
        </div>
      </v-card-subtitle>
    </v-card>
  </v-hover>
</template>

<script>
export default {
  props: {
    toolData: {},
    toolNum: {}
  },
  data() {
    return {
      num: {},
      tool: {}
    };
  },
  created() {
    this.num = this.toolNum;
    this.tool = this.toolData;
  },
  methods: {
    updateElapsedTime() {
      //console.log("test");
      this.$emit("updateElapsedTime");
    },
    bindTool() {
      this.$emit("bind");
    },
    usedPercentage() {
      let percent = (this.tool.elapsedTime / this.tool.toolLife) * 100;
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
  watch: {
    toolData: function(value, newValue) {
      if (newValue != value) {
        this.num = this.toolNum;
        this.tool = this.toolData;
      }
    }
  }
};
</script>
<style>
.hover:hover {
  cursor: pointer;
}
</style>
