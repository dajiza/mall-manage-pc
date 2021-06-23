<template>
    <!-- dialog 城市列表 -->
    <el-dialog title="选择优惠券" :visible.sync="isShow" width="90%" @open="open" @opened="opened" @closed="close">
        <div class="app-container goods-list">
            <div class="head-container">
                <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
                    <el-form-item label="优惠券名称" prop="title" class="">
                        <el-input class="filter-item" v-model="formFilter.title" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="优惠券类型" prop="type" class="">
                        <el-select class="filter-item" v-model="formFilter.type" placeholder="请选择" clearable>
                            <el-option v-for="state in typeOptions" :key="state.id" :value="state.id" :label="state.name" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="优惠券状态" prop="status" class="">
                        <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择" clearable>
                            <el-option v-for="state in statusOptions" :key="state.id" :value="state.id" :label="state.name" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="可用店铺" prop="shop_id" class="">
                        <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" clearable>
                            <el-option v-for="state in shopOptions" :key="state.id" :value="state.id" :label="state.shop_name" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="优惠券面额" prop="coupon_amount" class="">
                        <el-input class="filter-item" v-model="formFilter.coupon_amount" placeholder="请输入"></el-input>
                    </el-form-item>

                    <el-form-item class="form-item-btn" label="">
                        <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                        <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="loading" :data="list" ref="multipleTable" class="order-list-table" :height="tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column prop="status" label="" width="60">
                    <template slot-scope="scope">
                        <el-radio v-model="checkedId" :label="scope.row.id" @change="e => onChangeRadio(e, scope.row)">{{ '' }}</el-radio>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已停用' : '已启用' }}</span>
                    </template>
                </el-table-column>
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
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="listQuery.page"
                    :page-size="listQuery.limit"
                    layout="total, prev, pager, next, jumper"
                    :total="total"
                >
                </el-pagination>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="close">取 消</el-button>
            <el-button type="primary" @click="save">确定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { queryList } from '@/api/coupons'
// import './coupons.less'
import { queryShopList } from '@/api/goods'
import commUtil from '@/utils/commUtil'

import { formatMoney } from '@/plugin/tool'
export default {
    name: 'CheckList',
    props: ['couponId'],

    data() {
        return {
            list: [],
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            checkedId: '',
            isShow: false,
            checkedList: [],
            // 类型下拉列表
            typeOptions: [
                { id: 1, name: '满减' },
                { id: 2, name: '折扣' }
            ],
            // 状态下拉
            statusOptions: [
                { id: 1, name: '已启用' },
                { id: 2, name: '已停用' }
            ],
            formFilter: {
                title: '', // 优惠券名称
                type: '', // 优惠券类型
                status: '', // 优惠券状态
                shop_id: '', // 优惠券店铺
                coupon_amount: '' // 优惠券面额
            },
            loading: false,
            tableHeight: 'calc(100vh - 334px)',
            shopOptions: [], // 代理店铺下拉列表
            activeCoupon: '' //选中的优惠券
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
    created() {},
    mounted() {},
    methods: {
        formatMoney: formatMoney,
        open() {},
        opened() {
            this.checkedId = Number(this.couponId)
            this.queryShopList()

            this.getList()
        },

        getList() {
            const rLoading = this.openLoading()

            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['type'] = params['type'] ? params['type'] : -1
            params['status'] = params['status'] > 0 ? params['status'] : -1
            params['shop_id'] = params['shop_id'] ? params['shop_id'] : -1
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            if (params['coupon_amount']) {
                params['coupon_amount'] = commUtil.numberMul(Number(params['coupon_amount']), 100)
            } else {
                params['coupon_amount'] = -1
            }
            queryList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.list = res.data.lists
                            this.total = res.data.total
                        } else {
                            this.list = []
                            this.total = 0
                        }
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {
                    rLoading.close()
                })
        },

        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopOptions = res.data || []
                })
                .catch(err => {})
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.formFilter.tag_id = ''
            this.handleFilter()
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
        },

        show() {
            this.isShow = true
        },
        close() {
            this.isShow = false
        },
        onChangeRadio(e, row) {
            this.activeCoupon = _.cloneDeep(row)
        },
        save() {
            if (!this.activeCoupon) {
                this.$notify({
                    title: '请选择优惠券',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            this.$emit('add-success', this.activeCoupon)
            this.close()
        }
    }
}
</script>
<style scoped="scoped" lang="less">
/deep/.el-dialog {
    top: 50%;
    left: 50%;
    margin: 0 !important;
    transform: translate(-50%, -50%);
}
/deep/.el-dialog__body {
    padding: 0 !important;
}
.head-container{
    margin-bottom: 0;
}
.timg {
    width: 80px;
    height: 60px;
}

.item {
    display: flex;
    margin-bottom: 10px;
    min-height: 50px;
    .check {
        color: rgba(0, 0, 0, 0.65);
        font-weight: 400;
        font-size: 14px;
    }
    .check-all {
        margin-right: 120px;
    }
    .check-city {
        margin-bottom: 20px;
    }
}
.type-tag {
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
