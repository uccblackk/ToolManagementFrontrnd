<template>
  <v-container fluid>
    <v-layout>
      <v-flex style="z-index:2">
        <MenuCardView :data="links" />
      </v-flex>
    </v-layout>
    <v-layout column justify-center align-center>
      <v-flex xs12 sm8 md6>
        <div
          class="text-center"
          style="top:50%;position:fixed; left: 50%;z-index: 1;opacity:0.3;
  transform: translate(-50%, -50%);"
        >
          <!-- <logo />
        <vuetify-logo /> -->
          <!-- <v-img src="/logo.jpg" width="auto" contain height="100px"></v-img> -->
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Logo from "~/components/Logo.vue";

import MenuCardView from "~/components/menu/MenuCardView.vue";

export default {
  middleware: "auth",
  components: {
    Logo,
    MenuCardView
  },
  data() {
    return {
      menuList: [],
      links: []
    };
  },
  methods: {
    getMenuHeaders() {
      const token = this.$store.state.authUser.token;
      this.$axios
        .get(`/Menu/Search?value=`, {
          headers: {
            Authorization: token
          }
        })
        .then(res => {
          //console.log(res.data.data);
          this.menuList = res.data.data != null ? res.data.data : [];
          //console.log(this.userData);

          if (this.$store.state.authUser.authority != null) {
            for (let i = 0; i < this.menuList.length; i++) {
              let menuData = {
                icon: this.menuList[i].icon,
                text: this.menuList[i].text,
                sequence: this.menuList[i].sequence,
                subLinks: []
              };
              this.$store.state.authUser.authority.forEach(element => {
                if (
                  this.menuList[i].sublinks.find(
                    x => x.menu_no == element.menu_no
                  ) != undefined
                ) {
                  menuData.subLinks.push(
                    this.menuList[i].sublinks.find(
                      x => x.menu_no == element.menu_no
                    )
                  );
                  //   console.log(this.selected);
                }
              });
              // 重整sublinks順序
              menuData.subLinks.sort(function(a, b) {
                return a.sequence.localeCompare(b.sequence, "en", {
                  numeric: true
                });
              });

              this.links.push(menuData);
            }
            // 重整links順序
            this.links.sort(function(a, b) {
              return a.sequence.localeCompare(b.sequence, "en", {
                numeric: true
              });
            });
            // console.log(this.links);
          }
        });
    }
  },
  mounted() {
    this.getMenuHeaders();
  }
};
</script>
