export default {
    install(Vue, options) {
        Vue.prototype.$tableHeaderColor = function() {
            return 'font-size:14px;padding:16px 0 !important;background:#fafafa !important;font-weight:500;';
        };
    }
};
