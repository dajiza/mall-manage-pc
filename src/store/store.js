import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
    state: {
        plateStore: {}, //整个布局的数据
        addLayout: {}, //添加板块的数据
        addImg: {}, //添加图片的数据
        isBanner: false, //添加的是否是Banner
        scrollToId: '', //视图滚动到的id
        shopIdStore: '' //选中的店铺
    },
    mutations: {
        setPlateStore(state, value) {
            state.plateStore = value
        },
        setAddLayout(state, value) {
            state.addLayout = value
        },
        setAddImg(state, value) {
            state.addImg = value
        },
        setIsBanner(state, value) {
            state.isBanner = value
        },
        setScrollToId(state, value) {
            state.scrollToId = value
        },
        setShopIdStore(state, value) {
            state.shopIdStore = value
        }
    }
})
