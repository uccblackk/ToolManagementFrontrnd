const cookieparser = process.server ? require("cookieparser") : undefined;
const state = () => {
  return {
    tabItem: [],
    authUser: null,
    locales: ["en-US", "zh-TW", "zh-CN"],
    locale: "zh-TW"
  };
};
const mutations = {
  SET_USER(state, user) {
    state.authUser = user;
  },
  updateTabItem(state, linkData) {
    let existData = state.tabItem.find(x => x.text == linkData.text);
    if (existData != undefined) {
      let index = state.tabItem.indexOf(existData);
      let item = {
        text: linkData.text,
        to: linkData.to
      };
      state.tabItem.splice(index, 1, item);
      return;
    }
    state.tabItem.push({
      text: linkData.text,
      to: linkData.to
    });
    // console.log(state.tabItem);
  },
  clearTabItem(state) {
    state.tabItem = [];
  },
  removeTabItem(state, linkData) {
    let existData = state.tabItem.find(x => x.text == linkData.text);
    let index = state.tabItem.indexOf(existData);

    state.tabItem.splice(index, 1);
  }
};
const actions = {
  nuxtServerInit({ commit }, { req }) {
    // if (req.session && req.session.authUser) {
    //   commit('SET_USER', req.session.authUser)
    // }
  },
  async login({ commit }, { account, password }) {
    try {
      const { data } = await this.$axios.post("/user/login", {
        account,
        password
      });
      if (data.data !== "undefined" && data.msg == "登入成功") {
        commit("SET_USER", data.data);
        commit("clearTabItem");
        this.$router.push("/");
      } else {
        this.$swal(data.msg);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error("Bad credentials");
      }
      throw error;
    }
  },
  async logout({ commit }) {
    commit("SET_USER", null);
    this.$router.push("/login");
  }
};
const getters = {
  user: (state, getters) => {
    return state.authUser;
  }
};

export default {
  state,
  actions,
  mutations,
  getters,
  namespaced: true // 多模組的時候，當有相同名稱的變數或方法才能區隔開
};
