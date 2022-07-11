import createPersistedState from 'vuex-persistedstate';
import * as Cookies from "js-cookie";

let cookieStorage = {
  getItem: function(key) {
    return Cookies.getJSON(key);
  },
  setItem: function(key, value) {
    return Cookies.set(key, value, {expires: 3, secure: false});
  },
  removeItem: function(key) {
    return Cookies.remove(key);
  }
};

export default (context) => {
  createPersistedState({
    storage: cookieStorage,
    getState: cookieStorage.getItem,
    setState: cookieStorage.setItem
  })(context.store);
};

// 作者：223333
// 链接：https://juejin.im/post/6844904009631793165
// 来源：掘金
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。