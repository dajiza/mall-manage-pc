import Vue from 'vue';
import Router from 'vue-router';
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};
Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '自述文件' },
            children: [
                {
                    path: '/dashboard',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard.vue'),
                    meta: { title: '系统首页', name: 'dashboard' }
                },
                {
                    path: '/goods-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/goodsList.vue'),
                    meta: { title: '商品列表', name: 'goodsList' }
                },
                {
                    path: '/goods-creat',
                    name: 'goods-creat',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/goodsCreat.vue'),
                    meta: { title: '新增商品', name: 'goodsCreat' }
                },
                {
                    path: '/freight',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/freight.vue'),
                    meta: { title: '运费模板', name: 'afterSfreightleList' }
                },
                {
                    path: '/freight-creat',
                    name: 'freight-creat',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/freightCreat.vue'),
                    meta: { title: '新增模板', name: 'freightCreat' }
                },
                {
                    path: '/after-sale-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/after-sale/afterSaleList.vue'),
                    meta: { title: '售后申请处理', name: 'afterSaleList' }
                },
                {
                    path: '/after-sale-detail',
                    name: 'after-sale-detail',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/after-sale/afterSaleDetail.vue'),
                    meta: { title: '售后申请详情' }
                },
                {
                    path: '/otherCategory',
                    name: 'otherCategory',
                    component: () => import(/* webpackChunkName: "other-category" */ '../components/page/other-category/otherCategory.vue'),
                    meta: { title: '其它商品分类' }
                },
                {
                    path: '/goodsLabel',
                    component: () => import(/* webpackChunkName: "goods-label" */ '../components/page/goods-label/goodsLabel.vue'),
                    meta: { title: '商品标签', name: 'goodsLabel' }
                },
                {
                    path: '/customAttributes',
                    component: () => import(/* webpackChunkName: "custom-attributes" */ '../components/page/custom-attributes/custom-attributes.vue'),
                    meta: { title: '自定义属性', name: 'customAttributes' }
                },
                {
                    path: '/order-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-list/OrderList.vue'),
                    meta: { title: '订单列表', name: 'orderList' }
                },
                {
                    path: '/order-detail',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-list/OrderDetail.vue'),
                    meta: { title: '订单详情', name: 'orderDetail' }
                },
                {
                    path: '/mall-order-after-reason',
                    component: () => import(/* webpackChunkName: "order-after-reason" */ '../components/page/after-sale/afterSaleReason.vue'),
                    meta: { title: '售后原因设置', name: 'afterSaleReason' }
                },
                {
                    path: '/mall-backend-parameter-setting',
                    component: () => import(/* webpackChunkName: "parameter-setting" */ '../components/page/system-settings/parameter-configuration/parameterConfiguration.vue'),
                    meta: { title: '参数配置', name: 'parameterSetting' }
                },
                {
                    path: '/404',
                    component: () => import(/* webpackChunkName: "404" */ '../components/page/404.vue'),
                    meta: { title: '404', name: '404' }
                },
                {
                    path: '/403',
                    component: () => import(/* webpackChunkName: "403" */ '../components/page/403.vue'),
                    meta: { title: '403', name: '403' }
                }
            ]
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../components/page/login/Login.vue'),
            meta: { title: '登录', name: 'login' }
        },
        {
            path: '/test',
            component: () => import(/* webpackChunkName: "tag-test" */ '../components/page/test-demo/TagPickerDemo.vue'),
            meta: { title: 'test', name: 'test' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
