import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
    state: {
        plateStore: {}
    },
    mutations: {
        setPlateStore(state, value) {
            state.setPlateStore = value
        }
    }
})
