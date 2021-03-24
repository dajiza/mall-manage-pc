export default {
    install(Vue, options) {
        Vue.prototype.$tableHeaderColor = function() {
            return 'font-size:14px;padding:16px 0 !important;background:#fafafa !important;font-weight:500;color:#000;'
        }
        Vue.prototype.$tableHeight = 'calc(100vh - 183px)'
    }
}
