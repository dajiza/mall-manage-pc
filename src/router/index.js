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
                    path: '/mall-backend-goods-list',
                    name: 'goods-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/goodsList.vue'),
                    meta: { title: '商品列表', name: 'goodsList' }
                },
                {
                    path: '/mall-backend-goods-create',
                    name: 'goods-creat',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/goodsCreat.vue'),
                    meta: { title: '新增商品', name: 'goodsCreat' }
                },
                {
                    path: '/mall-backend-goods-edit',
                    name: 'goods-edit',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/goodsCreat.vue'),
                    meta: { title: '编辑商品', name: 'goodsEdit' }
                },
                {
                    path: '/mall-backend-goods-preview',
                    name: 'goods-preview',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/goodsPreview.vue'),
                    meta: { title: '查看商品', name: 'goodsPreview' }
                },
                {
                    path: '/mall-backend-freight',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/freight.vue'),
                    meta: { title: '运费模板', name: 'freightList' }
                },
                {
                    path: '/mall-backend-freightCreat',
                    name: 'freightCreat',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/freightCreat.vue'),
                    meta: { title: '新增模板', name: 'freightCreat' }
                },
                {
                    path: '/mall-backend-afterSaleList',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/after-sale/afterSaleList.vue'),
                    meta: { title: '售后申请处理', name: 'afterSaleList' }
                },
                {
                    path: '/mall-backend-afterSaleDetail',
                    name: 'afterSaleDetail',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/after-sale/afterSaleDetail.vue'),
                    meta: { title: '售后申请详情' }
                },
                {
                    path: '/mall-backend-customer-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/customer/customerList.vue'),
                    meta: { title: '客户管理' }
                },
                {
                    path: '/mall-backend-agent-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/agent/agentList.vue'),
                    meta: { title: '代理管理' }
                },
                {
                    path: '/mall-backend-other-category',
                    name: 'otherCategory',
                    component: () => import(/* webpackChunkName: "other-category" */ '../components/page/other-category/otherCategory.vue'),
                    meta: { title: '其它商品分类' }
                },
                {
                    path: '/mall-backend-goodsLabel',
                    component: () => import(/* webpackChunkName: "goods-label" */ '../components/page/goods-label/goodsLabel.vue'),
                    meta: { title: '商品标签', name: 'goodsLabel' }
                },
                {
                    path: '/mall-backend-custom-attributes',
                    component: () => import(/* webpackChunkName: "custom-attributes" */ '../components/page/custom-attributes/custom-attributes.vue'),
                    meta: { title: '自定义属性', name: 'customAttributes' }
                },
                {
                    path: '/mall-backend-order-list',
                    component: () => import(/* webpackChunkName: "order-list" */ '../components/page/order-management/order-list/OrderList.vue'),
                    meta: { title: '订单列表', name: 'orderList' }
                },
                {
                    path: '/mall-backend-order-detail',
                    component: () => import(/* webpackChunkName: "order-detail" */ '../components/page/order-management/order-list/OrderDetail.vue'),
                    meta: { title: '查看订单', name: 'orderDetail' }
                },
                {
                    path: '/mall-backend-order-after-reason',
                    component: () => import(/* webpackChunkName: "order-after-reason" */ '../components/page/after-sale/afterSaleReason.vue'),
                    meta: { title: '售后原因设置', name: 'afterSaleReason' }
                },
                {
                    path: '/mall-backend-parameter-setting',
                    component: () =>
                        import(
                            /* webpackChunkName: "parameter-setting" */ '../components/page/system-settings/parameter-configuration/parameterConfiguration.vue'
                        ),
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
