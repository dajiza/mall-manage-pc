module.exports = {
    /**
     * 售后类型
     * 0仅退款，1退货退款，2换货
     */
    REFUND_TYPE: {
        0: '仅退款',
        1: '退货退款',
        2: '换货',
        3: '部分退款',
        4: '退运费'
    },
    /**
     * 售后状态
     * 0仅退款，1退货退款，2换货
     */
    REFUND_STATUS: {
        0: '待审核', //新建
        1: '待打款', //待退款
        2: '已拒绝', //拒绝完结
        3: '撤销', //撤销
        4: '待买家发货', //请退货
        5: '买家已退货', //退货中   商家待收货
        6: '商家待发货', //待重新发货
        7: '已完结', //打款/重发完结
        8: '已拒绝', //拒绝打款
        9: '已完成' // 商家已重新发货
    },
    /**
     * 售后操作步骤
     *  '步骤：1审核；2我们确认收货 3财务打款 4我们再次发货 5原路返回退款',
     */
    REFUND_STEP: {
        1: '审核',
        2: '商家确认收货',
        3: '财务打款',
        4: '商家再次发货',
        5: '原路返回退款'
    },

    // 属性
    ATTR: {
        1: 'attr_brand', //品牌
        2: 'attr_color', //颜色
        3: 'attr_origin', //产地
        4: 'attr_unit', //单位
        5: 'attr_material', //材质
        6: 'attr_pattern', //花纹
        7: 'attr_size', //成品布尺寸
        8: 'attr_width', //幅宽
        9: 'attr_piece', //片数
        10: 'attr_weight', //重量
        11: 'attr_code' //编号
    },
    // 属性名称
    ATTR_NAME: {
        1: '品牌', //品牌
        2: '颜色', //颜色
        3: '产地', //产地
        4: '单位', //单位
        5: '材质', //材质
        6: '花纹', //花纹
        7: '尺寸', //尺寸
        8: '幅宽', //幅宽
        9: '片数', //片数
        10: '重量', //重量
        11: '编号' //编号
    },
    // 积分记录
    POINTS_LOG_TYPE: {
        1: '购买商品',
        2: '兑换商品',
        3: '退款扣减',
        4: '发表评价',
        5: '兑换优惠卷',
        6: '旧系统导入'
    }
}
