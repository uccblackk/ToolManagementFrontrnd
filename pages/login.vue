<template>
  <div style="margin-top:100px;width:100%">
    <v-hover v-slot:default="{ hover }" open-delay="200">
      <v-card class="mx-auto" max-width="500" :elevation="hover ? 16 : 5">
        <div>
          <v-img src="/logo.jpg" width="100%" height="auto"></v-img>
        </div>

        <!-- <v-card-title>{{ title }}</v-card-title> -->

        <v-card-subtitle>
          <v-form ref="form" lazy-validation>
            <v-text-field
              v-model="account"
              :label="$t('account')"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              :label="$t('password')"
              type="password"
              @keyup.native.enter="login"
            ></v-text-field>
            <v-btn block color="info" class="my-2" @click="login">確定</v-btn>
          </v-form>
        </v-card-subtitle>

        <v-card-actions></v-card-actions>
      </v-card>
    </v-hover>
  </div>
</template>

<script>
export default {
  layout: "empty",
  data() {
    return {
      title: "MES",
      account: "",
      password: "",
      formError: ""
    };
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch("login", {
          account: this.account,
          password: this.password
        });
        this.formError = null;
      } catch (e) {
        this.formError = e.message;
      }
    },
    async logout() {
      try {
        await this.$store.dispatch("logout");
      } catch (e) {
        this.formError = e.message;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 10px;
  position: relative;
  max-height: 100%;
}
.btn {
  max-width: 100%;
}
@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
