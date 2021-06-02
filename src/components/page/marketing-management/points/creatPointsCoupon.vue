<template>
    <div class="app-container">
        <!-- 原订单信息 -->
        <div class="wrap detail">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">新增</div>
            </div>
            <div class="divider"></div>
            <div class="substance" style="padding: 22px 32px 32px">
                <el-form class="freight-form" :inline="false" :model="goods" :rules="rules" ref="formRef" label-width="100px">
                    <el-form-item label="类型" prop="title">
                        <el-radio-group v-model="goods.radio" @change="onChangeRadio">
                            <el-radio :label="3">商品</el-radio>
                            <el-radio :label="6">优惠券</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="可用店铺" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title" disabled></el-input>
                    </el-form-item>

                    <el-form-item label="需要积分" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title"></el-input>
                    </el-form-item>
                    <el-button class="add-btn" type="primary" size="mini" @click="addCoupon">选择优惠券</el-button>
                    <el-table :data="activeCoupon" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
                        <el-table-column prop="title" label="优惠券名称" width="170"></el-table-column>
                        <el-table-column prop="shop_name" label="可用店铺"></el-table-column>
                        <el-table-column prop="type" label="优惠券类型" width="100">
                            <template slot-scope="scope">
                                {{ scope.row.type > 1 ? '折扣' : '满减' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="优惠券面额" width="100">
                            <template slot-scope="scope">
                                <div v-if="scope.row.type > 1">{{ scope.row.coupon_amount / 10 }}折</div>
                                <div v-else>{{ (scope.row.coupon_amount / 100) | rounding }}元</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="使用门槛" width="100">
                            <template slot-scope="scope">
                                <div v-if="scope.row.with_amount > 0">满{{ (scope.row.with_amount / 100) | rounding }}元</div>
                                <div v-else>无门槛</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="使用期限" width="176">
                            <template slot-scope="scope">
                                <div v-if="Number(scope.row.valid_type) === 1">领券后{{ scope.row.valid_days }}天内</div>
                                <div v-else>{{ scope.row.valid_start_time }} - {{ scope.row.valid_end_time }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="quota" label="发放数量" width="100"></el-table-column>
                        <el-table-column prop="take_count" label="已领取数量" width="100"></el-table-column>
                        <el-table-column prop="used_count" label="已使用数量" width="100"></el-table-column>
                        <el-table-column label="可用商品" width="100">
                            <template slot-scope="scope">{{ useGoods(scope.row.use_goods_type) }}</template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="100">
                            <template slot-scope="scope">
                                <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已停用' : '已启用' }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form>
            </div>
            <div class="brn-wrap">
                <el-button type="danger" size="large">删除</el-button>
                <el-button type="primary" size="large">保存</el-button>
            </div>
        </div>
        <!-- 商品添加 -->
        <coupon-list ref="couponList" @add-success="getCoupon"></coupon-list>
    </div>
</template>
<script>
import { queryAfterSaleDetail } from '@/api/afterSale'
import { getToken } from '@/utils/auth'

import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import couponList from '@/components/common/coupon-list-pop/CouponListPop'

export default {
    data() {
        return {
            id: '',

            list: [{}],
            listLoading: false,
            header: {},
            goods: {
                title: '',
                radio: ''
            },
            tfile: [],
            attrList: [{ label: '', value: '' }],
            rules: {
                imgs: [{ required: true, message: '请上传图片', trigger: 'blur' }],
                title: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
                ],
                display_sales: [
                    { required: true, message: '请输入销量', trigger: 'blur' },
                    { type: 'number', message: '请输入数字' }
                ],
                freight_id: [{ required: true, message: '请选择运费模板', trigger: 'blur' }],
                category_id: [{ required: true, message: '请选择分类', trigger: 'blur' }]
            },
            activeCoupon: []
        }
    },
    computed: {
        statusClass: function() {
            return data => {
                if (data === 0) {
                    return 'order-paid'
                } else if (data === 1) {
                    return 'order-paid'
                } else if (data === 2) {
                    return 'order-cancelled'
                }
            }
        },
        useGoods: function() {
            let str = ''
            return data => {
                if (data === 1) {
                    str = '全场可用'
                } else if (data === 2) {
                    str = '指定商品'
                } else if (data === 3) {
                    str = '指定标签'
                }
                return str
            }
        }
    },
    components: {
        ElImageViewer,
        couponList
    },
    created() {
        // this.id = Number(this.$route.query.id)
        // this.order_id = Number(this.$route.query.orderId)
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
        // this.getDetail()
    },
    mounted() {},
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        getDetail() {
            let params = {
                id: this.id
            }

            console.log(params)
            queryAfterSaleDetail(params)
                .then(res => {
                    console.log('GOOGLE: res', res)

                    this.detail = res.data
                })
                .catch(err => {})
        },
        addCoupon() {
            this.$refs.couponList.show()
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleFilter()
        },
        onChangeRadio() {
            console.log('输出 ~ onChangeRadio')
        },
        getCoupon(coupon) {
            console.log('输出 ~ getCoupon', coupon)
            this.activeCoupon = []
            this.activeCoupon.push(coupon)
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.page-title {
    box-sizing: border-box;
    padding-left: 24px;
    width: 100%;
    height: 80px;
    border-radius: 2px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 20px;
    line-height: 80px;
}

.wrap {
    border-radius: 2px;
    background: #fff;
}
.detail {
    .substance {
        padding: 32px;
        .divider {
            margin: 32px 0;
        }
        .label {
            color: rgba(0, 0, 0, 0.85);
        }
        .order-info {
            display: flex;
            flex-wrap: wrap;
            padding-top: 10px;

            .sheet {
                margin-right: 20px;
                padding-top: 10px;
            }
            .w280 {
                /*width: 300px;*/
                min-width: 280px;
            }
            &:first-child {
                padding-top: 0;
                /*.sheet{*/
                /*    padding-top: 0;*/
                /*}*/
            }
            .remark-box {
                display: flex;
                .label {
                    width: 72px;
                }
                .value {
                    flex: 1;
                }
            }
        }
        .info {
            display: flex;
            justify-content: space-between;
        }
        .sheet-img {
            display: flex;
            margin-top: 32px;
        }
        .apply-img {
            margin-right: 12px;
            width: 120px;
            height: 120px;
            cursor: pointer;
        }
    }
}
.goods {
    .substance {
        padding: 32px;
        .label {
            color: rgba(0, 0, 0, 0.85);
        }
        .divider {
            margin: 30px 0 20px;
        }
        .goods-img {
            width: 80px;
            height: 60px;
        }
        .express {
            display: flex;
            .sheet {
                margin-right: 240px;
            }
        }
        .status {
            display: flex;
            align-items: center;
            .text-grey {
                color: rgba(0, 0, 0, 0.25);
            }
            .dot {
                display: block;
                margin-right: 8px;
                width: 8px;
                height: 8px;
                border-radius: 4px;
            }
        }
        // .thimg {
        //     height: 148px;
        //     position: absolute;
        //     left: 150px;
        // }
        // .upload-demo {
        //     position: relative;
        // }
        .sheet-certificate {
            .upload {
                margin-top: 20px;
            }
        }
        .certificate-img {
            height: 60px;
        }
    }
}
.add-btn {
    margin: 10px 0 20px;
}
.brn-wrap {
    padding: 0px 0 34px 32px;
}
.attr {
    margin-top: 20px;
}
.type-tag {
    // display: block;
    padding: 0 11px;
    min-width: 50px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    text-align: center;
    word-break: keep-all;
    font-weight: 400;
    line-height: 26px;
    &.type-red {
        background-color: #ff4d4f;
    }
    &.type-purple {
        background-color: #a151ff;
    }
    &.type-yellow {
        background-color: #faad14;
    }
    &.type-blue {
        background-color: #1890ff;
    }
}
/*表格-订单状态*/
.order-status {
    display: inline-block;
    padding: 0 9px;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 400;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    line-height: 26px;
}
// 已付款
.order-paid {
    background: #1890ff;
}
// 已取消
.order-cancelled {
    background: #ff4d4f;
}
</style>
