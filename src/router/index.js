import Vue from 'vue'
import Router from 'vue-router'
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
Vue.use(Router)

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
                    path: '/mall-backend-dashboard',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard.vue'),
                    meta: { title: '系统首页', name: 'mall-backend-dashboard' }
                },
                {
                    path: '/mall-backend-goods-list',
                    name: 'goods-list',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/goodsList.vue'),
                    meta: { title: '商品列表', name: 'goodsList' }
                },
                {
                    path: '/mall-backend-no-discount-list',
                    name: 'no-discount-list',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/noDiscountList.vue'),
                    meta: { title: '其它折扣商品', name: 'noDiscountList' }
                },
                {
                    path: '/mall-backend-shop-goods-list',
                    name: 'shop-goods-list',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/shopGoodsList.vue'),
                    meta: { title: '店铺商品管理', name: 'shopGoodsList' }
                },
                {
                    path: '/mall-backend-goods-create',
                    name: 'goods-creat',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/goodsCreat.vue'),
                    meta: { title: '新增商品', name: 'goodsCreat' }
                },
                {
                    path: '/mall-backend-goods-update',
                    name: 'goods-edit',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/goodsCreat.vue'),
                    meta: { title: '编辑商品', name: 'goodsEdit' }
                },
                {
                    path: '/mall-backend-goods-preview',
                    name: 'goods-preview',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/goodsPreview.vue'),
                    meta: { title: '查看商品', name: 'goodsPreview' }
                },
                {
                    path: '/mall-backend-goods-detail-template',
                    name: 'goods-detail-template',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/goodsDetailTemplate.vue'),
                    meta: { title: '详情页模版', name: 'defaultDetail' }
                },
                {
                    path: '/mall-backend-goods-detail-template-create',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/goods/defaultDetail.vue'),
                    meta: { title: '新增模版' }
                },
                {
                    path: '/mall-backend-goods-detail-template-edit',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/goods/defaultDetail.vue'),
                    meta: { title: '编辑模版' }
                },
                {
                    path: '/mall-backend-goods-comment-list',
                    name: 'comment-list',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/commentList.vue'),
                    meta: { title: '评论管理', name: 'commentList' }
                },
                {
                    path: '/mall-backend-goods-comment-list-user',
                    name: 'comment-list-user',
                    component: () => import(/* webpackChunkName: "goods" */ '../components/page/goods/commentListUser.vue'),
                    meta: { title: '评论管理-用户', name: 'commentListUser' }
                },
                {
                    path: '/mall-backend-goods-series',
                    name: 'goods-series',
                    component: () => import(/* webpackChunkName: "series" */ '../components/page/goods/series/seriesList.vue'),
                    meta: { title: '商品系列', name: 'goodsSeries' }
                },
                {
                    path: '/mall-backend-goods-series-create',
                    name: 'goods-series-create',
                    component: () => import(/* webpackChunkName: "series" */ '../components/page/goods/series/seriesCreat.vue'),
                    meta: { title: '新增商品系列', name: 'goodsSeriesCreate' }
                },
                {
                    path: '/mall-backend-goods-series-update',
                    name: 'goods-series-update',
                    component: () => import(/* webpackChunkName: "series" */ '../components/page/goods/series/seriesCreat.vue'),
                    meta: { title: '编辑商品系列', name: 'goodsSeriesUpdate' }
                },
                {
                    path: '/mall-backend-freight',
                    component: () => import(/* webpackChunkName: "freight" */ '../components/page/goods/freight.vue'),
                    meta: { title: '运费模板', name: 'freightList' }
                },
                {
                    path: '/mall-backend-freightCreat',
                    name: 'freightCreat',
                    component: () => import(/* webpackChunkName: "freight" */ '../components/page/goods/freightCreat.vue'),
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
                    component: () => import(/* webpackChunkName: "customer" */ '../components/page/customer/customerList.vue'),
                    meta: { title: '客户管理' }
                },
                {
                    path: '/mall-backend-discount-setup',
                    component: () => import(/* webpackChunkName: "customer" */ '../components/page/customer/discountSetup.vue'),
                    meta: { title: '客户管理' }
                },
                {
                    path: '/mall-backend-agent-list',
                    component: () => import(/* webpackChunkName: "customer" */ '../components/page/agent/agentList.vue'),
                    meta: { title: '批发折扣配置' }
                },
                {
                    path: '/mall-backend-shop-list',
                    component: () => import(/* webpackChunkName: "customer" */ '../components/page/agent/shopList.vue'),
                    meta: { title: '店铺管理' }
                },
                {
                    path: '/mall-backend-coupons',
                    component: () => import(/* webpackChunkName: "coupons" */ '../components/page/marketing-management/coupons/couponsList.vue'),
                    meta: { title: '配置优惠券' }
                },
                {
                    path: '/mall-backend-coupon-create',
                    name: 'coupons-creat',
                    component: () => import(/* webpackChunkName: "coupons-create" */ '../components/page/marketing-management/coupons/couponsCreat.vue'),
                    meta: { title: '新增优惠券', name: 'couponsCreat' }
                },
                {
                    path: 'mall-backend-coupon-update',
                    name: 'coupons-edit',
                    component: () => import(/* webpackChunkName: "coupons-edit" */ '../components/page/marketing-management/coupons/couponsCreat.vue'),
                    meta: { title: '编辑优惠券', name: 'couponsEdit' }
                },
                {
                    path: '/mall-backend-coupons-copy',
                    name: 'coupons-copy',
                    component: () => import(/* webpackChunkName: "coupons-copy" */ '../components/page/marketing-management/coupons/couponsCreat.vue'),
                    meta: { title: '复制优惠券', name: 'couponsCopy' }
                },
                {
                    path: '/mall-backend-recipients-records',
                    component: () => import(/* webpackChunkName: "recipients-records" */ '../components/page/marketing-management/recipients-records/records.vue'),
                    meta: { title: '领用记录' }
                },
                {
                    path: '/mall-backend-adv',
                    component: () => import(/* webpackChunkName: "recipients-records" */ '../components/page/marketing-management/adv/advList.vue'),
                    meta: { title: '广告管理' }
                },
                {
                    path: '/mall-backend-adv-create',
                    name: 'adv-creat',
                    component: () => import(/* webpackChunkName: "adv-create" */ '../components/page/marketing-management/adv/advCreat.vue'),
                    meta: { title: '新增广告', name: 'advCreat' }
                },
                {
                    path: '/mall-backend-adv-update',
                    name: 'adv-edit',
                    component: () => import(/* webpackChunkName: "adv-edit" */ '../components/page/marketing-management/adv/advCreat.vue'),
                    meta: { title: '编辑广告', name: 'advEdit' }
                },
                {
                    path: '/mall-backend-activity',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/marketing-management/activity/activityList.vue'),
                    meta: { title: '活动管理' }
                },
                {
                    path: '/mall-backend-page',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/marketing-management/page-manage/pageManage.vue'),
                    meta: { title: '页面管理' }
                },
                {
                    path: '/mall-backend-page-creat',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/marketing-management/page-manage/pageCreat.vue'),
                    meta: { title: '新建页面' }
                },
                {
                    path: '/mall-backend-page-edit',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/marketing-management/page-manage/pageCreat.vue'),
                    meta: { title: '编辑页面' }
                },
                {
                    path: '/mall-backend-teamwork-list',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/marketing-management/teamwork/teamworkList.vue'),
                    meta: { title: '团作列表' }
                },
                {
                    path: '/mall-backend-teamwork-detail',
                    name: 'teamwork-detail',
                    component: () => import(/* webpackChunkName: "activity-management" */ '../components/page/marketing-management/teamwork/teamworkDetail.vue'),
                    meta: { title: '团作详情' }
                },
                {
                    path: '/mall-backend-page-share',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/marketing-management/page-share/pageShare.vue'),
                    meta: { title: '小程序分享页' }
                },
                {
                    path: '/mall-backend-points-shop-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/marketing-management/points/pointsShopList.vue'),
                    meta: { title: '店铺列表' }
                },
                {
                    path: '/mall-backend-points-goods-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/marketing-management/points/pointsGoodsList.vue'),
                    meta: { title: '积分商品管理' }
                },
                {
                    path: '/mall-backend-points-coupon-list',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/marketing-management/points/pointsCouponList.vue'),
                    meta: { title: '积分优惠券管理' }
                },
                {
                    path: '/mall-backend-points-goods-creat',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/marketing-management/points/creatPointsGoods.vue'),
                    meta: { title: '积分商品' }
                },
                {
                    path: '/mall-backend-points-coupon-creat',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/marketing-management/points/creatPointsCoupon.vue'),
                    meta: { title: '积分优惠券' }
                },
                {
                    path: '/mall-backend-page-points-order',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/marketing-management/points/pointsOrderList.vue'),
                    meta: { title: '积分兑换订单' }
                },
                {
                    path: '/mall-backend-points-order-detail',
                    component: () => import(/* webpackChunkName: "pointsOrderDetail" */ '../components/page/marketing-management/points/pointsOrderDetail.vue'),
                    meta: { title: '订单详情' }
                },
                {
                    path: '/mall-backend-sales-promotion',
                    component: () => import(/* webpackChunkName: "promotionList" */ '../components/page/marketing-management/sales-promotion/salesPromotion.vue'),
                    meta: { title: '促销管理' }
                },
                {
                    path: '/mall-backend-sales-promotion-create',
                    component: () => import(/* webpackChunkName: "promotionCreate" */ '../components/page/marketing-management/sales-promotion/salesPromotionCreate.vue'),
                    meta: { title: '新增促销' }
                },
                {
                    path: '/mall-backend-sales-promotion-update',
                    component: () => import(/* webpackChunkName: "promotionUpdate" */ '../components/page/marketing-management/sales-promotion/salesPromotionCreate.vue'),
                    meta: { title: '编辑促销' }
                },
                {
                    path: '/mall-backend-sales-index-admin',
                    component: () => import(/* webpackChunkName: "parameter-setting" */ '../components/page/marketing-management/index-admin/indexAdmin.vue'),
                    meta: { title: '编辑首页', name: 'indexAdmin' }
                },
                {
                    path: '/mall-backend-tutorial',
                    component: () => import(/* webpackChunkName: "parameter-setting" */ '../components/page/marketing-management/tutorial/tutorial.vue'),
                    meta: { title: '看看', name: 'tutorial' }
                },
                {
                    path: '/mall-backend-tutorial-audit-list',
                    component: () => import(/* webpackChunkName: "tutorial-audit-list" */ '../components/page/marketing-management/tutorial/tutorialAuditList.vue'),
                    meta: { title: '看看审核列表', name: 'tutorialAuditList' }
                },
                {
                    path: '/mall-backend-tutorial-creat',
                    component: () => import(/* webpackChunkName: "parameter-setting" */ '../components/page/marketing-management/tutorial/tutorialCreate.vue'),
                    meta: { title: '看看新增', name: 'tutorialCreate' }
                },
                {
                    path: '/mall-backend-tutorial-update',
                    component: () => import(/* webpackChunkName: "parameter-setting" */ '../components/page/marketing-management/tutorial/tutorialCreate.vue'),
                    meta: { title: '看看编辑', name: 'tutorialUpdate' }
                },
                {
                    path: '/mall-backend-tutorial-audit',
                    component: () => import(/* webpackChunkName: "parameter-setting" */ '../components/page/marketing-management/tutorial/tutorialCreate.vue'),
                    meta: { title: '看看审核', name: 'tutorialAudit' }
                },
                {
                    path: '/mall-backend-commission',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/money-management/commission.vue'),
                    meta: { title: '佣金统计' }
                },
                {
                    path: '/mall-backend-performance',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/money-management/performance.vue'),
                    meta: { title: '店铺业绩' }
                },
                {
                    path: '/mall-backend-withdraw',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/money-management/withdraw.vue'),
                    meta: { title: '提现管理-审核' }
                },
                {
                    path: '/mall-backend-withdraw-all',
                    component: () => import(/* webpackChunkName: "after-sale" */ '../components/page/money-management/withdrawAll.vue'),
                    meta: { title: '提现管理-全部' }
                },
                {
                    path: '/mall-backend-other-category',
                    name: 'otherCategory',
                    component: () => import(/* webpackChunkName: "other-category" */ '../components/page/other-category/otherCategory.vue'),
                    meta: { title: '商品分类' }
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
                    path: '/mall-backend-statistics-sku',
                    component: () => import(/* webpackChunkName: "statistics-sku" */ '../components/page/statistics/skuStatistics.vue'),
                    meta: { title: 'SKU销量排行统计' }
                },
                {
                    path: '/mall-backend-statistics-sales',
                    component: () => import(/* webpackChunkName: "statistics-sku" */ '../components/page/statistics/salesStatistics.vue'),
                    meta: { title: '销售统计' }
                },
                {
                    path: '/mall-backend-live-goods',
                    component: () => import(/* webpackChunkName: "statistics-sku" */ '../components/page/live-management/liveGoods.vue'),
                    meta: { title: '直播商品' }
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
            path: '/test-ts',
            component: () => import(/* webpackChunkName: "tag-test" */ '../components/page/test-demo/tsTest.vue'),
            meta: { title: 'test', name: 'test' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
