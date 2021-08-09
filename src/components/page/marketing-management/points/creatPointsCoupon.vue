<template>
    <div class="app-container">
        <!-- 原订单信息 -->
        <div class="wrap detail">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">{{ id == 0 ? '新增' : '编辑' }}</div>
            </div>
            <div class="divider"></div>
            <div class="substance" style="padding: 22px 32px 32px">
                <el-form class="freight-form" :inline="false" :model="goods" :rules="rules" ref="formRef" label-width="100px">
                    <el-form-item label="类型" prop="title">
                        <el-radio-group :value="2" @change="onChangeRadio">
                            <el-radio :label="1" :disabled="id != 0">商品</el-radio>
                            <el-radio :label="2" :disabled="id != 0">优惠券</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="可用店铺" prop="">
                        <el-input style="width:180px" placeholder="请输入" v-model="shopName" disabled></el-input>
                    </el-form-item>

                    <el-form-item label="需要积分" prop="points">
                        <el-input style="width:180px" placeholder="请输入" v-model.number="goods.points"></el-input>
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
                        <el-table-column label="使用期限" width="180">
                            <template slot-scope="scope">
                                <div v-if="Number(scope.row.valid_type) === 1">领券后{{ scope.row.valid_days }}天内</div>
                                <div v-else>{{ $moment(scope.row.valid_start_time).format('YYYY.MM.DD') }} - {{ $moment(scope.row.valid_end_time).format('YYYY.MM.DD') }}</div>
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
                <el-button type="danger" size="large" @click="deleteGoods" v-if="id != 0" v-hasPermission="'mall-backend-points-coupon-delete'">删除</el-button>
                <el-button type="primary" size="large" @click="save" v-hasPermission="'mall-backend-points-coupon-creat'">保存</el-button>
            </div>
        </div>
        <!-- 优惠券添加 -->
        <coupon-list ref="couponList" getWay="3" @add-success="getCoupon" :shopId="shopId" :shopName="shopName" :couponId="activeCoupon.length > 0 ? activeCoupon[0].id : ''"></coupon-list>
    </div>
</template>
<script>
import { creatPointsCoupon, queryPointsCouponDetail, deletePointsCoupon } from '@/api/points'
import { getToken } from '@/utils/auth'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import couponList from '@/components/common/coupon-list-pop/CouponListPop'
import bus from '@/components/common/bus'

export default {
    name: 'creat-points-coupon',
    data() {
        return {
            id: '',
            shopId: 0,
            shopName: '',

            list: [{}],
            listLoading: false,
            header: {},
            goods: {
                points: '', // 积分
                couponId: '' // 优惠券id
            },
            typeIndex: 2,
            tfile: [],
            attrList: [{ label: '', value: '' }],
            rules: {
                points: [
                    { required: true, message: '请输入积分', trigger: 'blur' },
                    { pattern: /(^[1-9]\d*$)/, message: '请输入大于零的整数', trigger: 'blur' }
                ]
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
        couponList
    },
    created() {
        // this.id = Number(this.$route.query.id)
        // this.order_id = Number(this.$route.query.orderId)
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
        // this.getDetail()
        this.shopId = Number(this.$route.query.shopId)
    },
    async mounted() {
        await this.queryShopList()
        this.shopName = this.shopId ? this.shopList.find(item => item.id == this.shopId).shop_name : ''
        this.id = Number(this.$route.query.id)
        if (this.id != 0) {
            this.getDetail()
        }
    },
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        // 代理店铺列表
        queryShopList() {
            return new Promise((resolve, reject) => {
                queryShopList()
                    .then(res => {
                        this.shopList = res.data
                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        },
        getDetail() {
            let params = {
                id: this.id
            }
            console.log(params)
            queryPointsCouponDetail(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.activeCoupon = [res.data.coupon]
                    this.goods.points = res.data.points
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
            this.$router.push({
                path: '/mall-backend-points-goods-creat',
                query: {
                    id: 0,
                    shopId: this.shopId
                }
            })
        },
        getCoupon(coupon) {
            console.log('输出 ~ getCoupon', coupon)
            this.activeCoupon = []
            this.activeCoupon.push(coupon)
        },
        deleteGoods() {
            this.$confirm('确认要删除该优惠券吗?', '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        id: this.id
                    }
                    deletePointsCoupon(params)
                        .then(res => {
                            console.log('GOOGLE: res', res)
                            if (res.code == 200) {
                                this.$notify({
                                    title: '优惠券删除成功',
                                    type: 'success',
                                    duration: 3000
                                })
                                bus.$emit('close_current_tags')
                                bus.$emit('refreshPointsCouponList', 'edit')
                                this.$router.push({
                                    path: 'mall-backend-points-coupon-list',
                                    query: {
                                        shopId: this.shopId
                                    }
                                })
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
                })
                .catch(() => {})
        },
        save() {
            const rLoading = this.openLoading()

            this.$refs['formRef'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    let params = _.cloneDeep(this.goods)
                    if (this.activeCoupon.length == 0) {
                        this.$notify({
                            title: '请选择优惠券',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                        rLoading.close()
                        return
                    }
                    // format 价格
                    params['id'] = this.id || 0
                    params['shopId'] = this.shopId
                    params['couponId'] = this.activeCoupon[0].id

                    creatPointsCoupon(params)
                        .then(res => {
                            console.log('GOOGLE: res', res)
                            if (res.code === 200) {
                                this.$notify({
                                    title: this.id == 0 ? '创建成功' : '编辑成功',
                                    message: '',
                                    type: 'success',
                                    duration: 3000
                                })
                                bus.$emit('close_current_tags')
                                bus.$emit('refreshPointsCouponList', this.id == 0 ? 'add' : 'edit')
                                this.$router.push({
                                    path: 'mall-backend-points-coupon-list',
                                    query: {
                                        shopId: this.shopId
                                    }
                                })
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    message: '',
                                    type: 'error',
                                    duration: 5000
                                })
                            }
                            rLoading.close()
                        })
                        .catch(err => {
                            rLoading.close()
                        })
                } else {
                    rLoading.close()
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
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
