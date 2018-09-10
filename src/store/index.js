import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
const store = () => new Vuex.Store({

  state: {
    hotkey: [],
  },
  mutations: {
    sethotkey(state, value) {
      state.hotkey = value;
    }
  }
})

export default store
