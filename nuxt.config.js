import colors from "vuetify/es5/util/colors";
const webpack = require("webpack");
let development = process.env.NODE_ENV !== "production";
const setting = require(`./static/setting/setting.json`);
export default {
  render: {
    static: {
      setHeaders(res) {
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
      }
    }
  },
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  //mode: 'universal',
  //mode: 'spa',
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: "static",
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    titleTemplate: "%s - " + process.env.npm_package_name,
    title: process.env.npm_package_name || "",
    meta: [
      {
        charset: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico"
      }
    ]
  },
  /*
   ** Global CSS
   */
  css: ["@/static/fonts/MaterialDesignIcons/css/materialdesignicons.min.css"],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    {
      src: "~/plugins/font-awesome"
    },
    {
      src: "@/plugins/axios"
    },
    {
      src: "~/plugins/v-charts",
      ssr: false
    },
    {
      src: "~/plugins/i18n",
      ssr: false
    },
    {
      src: "~/plugins/localStorage.js",
      ssr: false
    },
    {
      src: "~/plugins/vue-ctk-date-time-picker.js",
      ssr: false
    },
    {
      src: "~/plugins/gantt-elastic.js",
      ssr: false
    },
    {
      src: "~/plugins/vue-gantt-chart.js",
      ssr: false
    },
    {
      src: "~/plugins/excel-export.js",
      ssr: false
    }
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxtjs/vuetify"],
  /*
   ** Nuxt.js modules
   */
  modules: ["nuxt-fontawesome", "vue-sweetalert2/nuxt", "@nuxtjs/axios"],
  axios: {
    //baseURL: development ? 'https:/localhost:5001/api' : 'http://localhost:5000/api'
    //baseURL: 'http://192.168.2.30:5000/api',
    baseURL: setting.BaseUrl,
    credentials: false
  },
  // axios: {
  //    baseURL: development ? 'https://172.20.10.7:5001/api' : 'http://172.20.10.7:5000/api'
  //   //baseURL: 'http://localhost:5000/api'
  // },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  fontawesome: {
    // icon 的標籤使用 <fa>，這邊不設定就會依照 plugin 裡的設定<font-awesome-icon>
    component: "fa",
    imports: [
      // 引入 fas 所有的icon
      {
        set: "@fortawesome/free-solid-svg-icons",
        icons: ["fas"]
      }
      // 只引入兩種特定的icon
      // 此為pro付費版的package，請注意
      // {
      //   set: '@fortawesome/pro-regular-svg-icons',
      //   icons: ['faAdjust', 'faArchive']
      // }
    ]
  },
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        },
        light: {
          // primary: colors.purple,
          // secondary: colors.grey.darken1,
          // accent: colors.shades.black,
          // error: colors.red.accent3,
        }
      }
    },
    treeShake: true,
    defaultAssets: {
      font: {
        family: "Microsoft JhengHei"
      }
    }
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    transpile: ["google-autocomplete"],
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery"
      })
    ],
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? "source-map" : "inline-source-map";
      }
    }
  }
};
