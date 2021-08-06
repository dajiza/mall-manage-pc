import { get, post, put } from './util'

// 菜单上各总数统计
export const queryAllCount = params => post('/backend/all-count', params)
export async function sidebarCount() {
    let { data } = await queryAllCount()
    console.log('输出 ~ data', data)
    return {
        commentCount: data.shop_comment_not_approve_count || 0, //商品评论待审核总数
        afterSaleCount: data.order_apply_count || 0, //售后处理申请总数
        courseCount: data.course_not_approve_count || 0, //团作待审核总数
        pointsOrderCount: data.points_redeem_count || 0, //积分商城兑换订单
        withdrawCount: data.commission_not_approve_count || 0, //提现管理总数
        tutorialCount: data.tutorial_not_approve_count || 0 //看看待审核总数
    }
}

// // 商品评论未审核总数 评价管理
// export const queryCommentCount = params => post('/backend/comment-not-approve-count', params)

// // 看看未审核总数 看看
// export const queryTutorialCount = params => post('/backend/tutorial-not-approve-count', params)

// // 售后申请列表 售后处理申请
// export const queryOrderCount = params => post('/backend/order-apply-list', params)

// // 佣金提现审核列表 提现管理
// export const queryWithdrawCount = params => post('/backend/commission-withdraw-check-list', params)

// // 积分商品店铺列表 积分商城
// export const queryPointsOrderCount = params => post('/backend/points-shop-list', params)

// // 团作报名审核总数 团作列表
// export const queryCourseCount = params => post('/backend/course-not-approve-count', params)

// export async function sidebarCount() {
//     // 评论管理
//     let commentCount = await queryCommentCount()
//     // 看看
//     let tutorialCount = await queryTutorialCount()
//     // 售后处理申请
//     let afterSaleCount = await queryOrderCount({
//         status_in: [0, 1, 5, 6]
//     })
//     // 提现管理
//     let withdrawCount = await queryWithdrawCount({
//         page: 1,
//         limit: 1,
//         shop_id: -1,
//         status: 1 // '1 待审核 2 审核通过 3 拒绝 4 放款成功 5放款失败'
//     })
//     // 积分商城
//     let pointsOrderCount = (await queryPointsOrderCount()).data.reduce((prev, cur) => {
//         return prev + cur.redeemQty
//     }, 0)
//     // 团作列表
//     let courseCount = await queryCourseCount()
//     return {
//         commentCount: commentCount.data || 0,
//         afterSaleCount: afterSaleCount.data.total || 0,
//         withdrawCount: withdrawCount.data.total || 0,
//         courseCount: courseCount.total || 0,
//         pointsOrderCount: pointsOrderCount,
//         tutorialCount: tutorialCount.data || 0
//     }
// }
