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
                    path: '/afterSaleList',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/after-sale/afterSaleList.vue'),
                    meta: { title: '售后申请处理', name: 'afterSaleList' }
                },
                {
                    path: '/afterSaleDetail',
                    name: 'afterSaleDetail',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/after-sale/afterSaleDetail.vue'),
                    meta: { title: '售后申请详情' }
                },
                {
                    path: '/otherCategory',
                    name: 'otherCategory',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/other-category/otherCategory.vue'),
                    meta: { title: '其它商品分类' }
                },
                {
                    path: '/goodsLabel',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/goods-label/goodsLabel.vue'),
                    meta: { title: '商品标签', name: 'goodsLabel' }
                },
                {
                    path: '/product-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/product-list/ProductList.vue'),
                    meta: { title: '产品列表', name: 'productList' }
                },
                {
                    path: '/product-lock-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/product-list/LockingProductList.vue'),
                    meta: { title: '锁定产品列表', name: 'LockingProductList' }
                },
                {
                    path: '/product-add',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/product-list/productAdd.vue'),
                    meta: { title: '新增产品', name: 'productAdd' }
                },
                {
                    path: '/view-product-goods',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/product-list/productView.vue'),
                    meta: { title: '查看产品', name: 'productView' }
                },
                {
                    path: '/product-update',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/product-list/productEdit.vue'),
                    meta: { title: '编辑产品', name: 'productEdit' }
                },
                {
                    path: '/product-category',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/product-category/ProductCategory.vue'),
                    meta: { title: '产品分类', name: 'productCategory' }
                },
                {
                    path: '/product-label',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/product-label/ProductLabel.vue'),
                    meta: { title: '产品标签', name: 'productLabel' }
                },
                {
                    path: '/photo-detection',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/photo-detection/PhotoDetection.vue'),
                    meta: { title: '照片检测', name: 'photoDetection' }
                },
                {
                    path: '/config-management',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/config-management/ConfigManagement.vue'),
                    meta: { title: '配置管理', name: 'configManagement' }
                },
                {
                    path: '/leaflet-query',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/photo-detection/LeafletQuery.vue'),
                    meta: { title: '单张查询', name: 'leafletQuery' }
                },
                {
                    path: '/batch-processing',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/cargo-management/photo-detection/BatchProcessing.vue'),
                    meta: { title: '批量处理', name: 'batchProcessing' }
                },
                {
                    path: '/shelf-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/shelf-management/shelf-list/ShelfList.vue'),
                    meta: { title: '货架列表', name: 'shelfList' }
                },
                {
                    path: '/order-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-list/OrderList.vue'),
                    meta: { title: '订单列表', name: 'orderList' }
                },
                {
                    path: '/order-detail',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-list/OrderDetail.vue'),
                    meta: { title: '查看订单', name: 'orderDetail' }
                },
                {
                    path: '/order-err-operate',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-list/OrderErrOperate.vue'),
                    meta: { title: '手动调整列表', name: 'orderErrOperate' }
                },
                {
                    path: '/cut-cloth',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/cut-cloth/CutCloth.vue'),
                    meta: { title: '裁布', name: 'cutCloth' }
                },
                {
                    path: '/order-cut-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/cut-cloth/CutSheet.vue'),
                    meta: { title: '裁布单', name: 'cutSheet' }
                },
                {
                    path: '/distribution',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/distribution/Distribution.vue'),
                    meta: { title: '配货管理', name: 'distribution' }
                },
                {
                    path: '/order-delivery-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/distribution/DistributionSheet.vue'),
                    meta: { title: '配货单', name: 'distributionSheet' }
                },
                {
                    path: '/order-sent',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-sent/OrderSent.vue'),
                    meta: { title: '已发订单', name: 'orderSent' }
                },
                {
                    path: '/order-sand-detail',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-sent/OrderSentDetail.vue'),
                    meta: { title: '已发订单详情', name: 'orderSentDetail' }
                },
                {
                    path: '/order-delivery',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-delivery/OrderDelivery.vue'),
                    meta: { title: '打单发货', name: 'orderDelivery' }
                },
                {
                    path: '/delivery-list',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-delivery/Delivery.vue'),
                    meta: { title: '发货单', name: 'delivery' }
                },
                {
                    path: '/user-management',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/system-settings/user-management/UserList.vue'),
                    meta: { title: '用户管理', name: 'userList' }
                },
                {
                    path: '/parameter-configuration',
                    component: () =>
                        import(/* webpackChunkName: "table" */ '../components/page/system-settings/parameter-configuration/ParameterConfiguration'),
                    meta: { title: '参数配置', name: 'parameterConfiguration' }
                },
                {
                    path: '/authority-management',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/system-settings/authority-management/AuthorityManagement'),
                    meta: { title: '权限管理', name: 'authorityManagement' }
                },
                {
                    path: '/role-management',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/system-settings/role-management/RoleManagement'),
                    meta: { title: '角色管理', name: 'roleManagement' }
                },
                {
                    path: '/role-create',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/system-settings/role-management/RoleAdd'),
                    meta: { title: '新建角色', name: 'addRole' }
                },
                {
                    path: '/role-update',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/system-settings/role-management/OperationRoleModule'),
                    meta: { title: '编辑角色', name: 'editRole' }
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
            path: '*',
            redirect: '/404'
        }
    ]
});
