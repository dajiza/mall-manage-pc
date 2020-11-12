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
                    path: '/freight',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/freight.vue'),
                    meta: { title: '运费模板', name: 'afterSfreightleList' }
                },
                {
                    path: '/freightCreat',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/goods/freightCreat.vue'),
                    meta: { title: '新增模板', name: 'freightCreat' }
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
                    meta: { title: '查看订单', name: 'orderDetail' }
                },
                {
                    path: '/order-err-operate',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/order-management/order-list/OrderErrOperate.vue'),
                    meta: { title: '手动调整列表', name: 'orderErrOperate' }
                },

                {
                    path: '/user-management',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/system-settings/user-management/UserList.vue'),
                    meta: { title: '用户管理', name: 'userList' }
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
