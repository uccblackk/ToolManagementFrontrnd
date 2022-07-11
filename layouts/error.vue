<template>
  <v-app dark>
    <v-alert type="error">
      <h1 v-if="error.statusCode === 404 && error.message != 'noPermission'">
        {{ pageNotFound }}
      </h1>
      <h1 v-else>
        {{ otherError }}
      </h1>
    </v-alert>
    <v-alert type="warning">
      <h1 v-if="error.statusCode === 404 && error.message == 'noPermission'">
        {{ $t("noPermission") }}
      </h1>
    </v-alert>

    <v-btn width="150px" class="ma-2" outlined color="primary" to="/" dark>
      <!-- <NuxtLink to="/"> -->
      Home page
      <!-- </NuxtLink> -->
    </v-btn>
  </v-app>
</template>

<script>
export default {
  layout: "error",
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      pageNotFound: "404 Not Found",
      otherError: "An error occurred"
    };
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title
    };
  }
};
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
