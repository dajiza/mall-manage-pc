<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input class="filter-item" placeholder="请输入" v-model="formFilter.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="订单号" prop="order_no">
                    <el-input class="filter-item" placeholder="请输入" v-model="formFilter.order_no"></el-input>
                </el-form-item>
                <el-form-item label="获佣店铺" prop="shop_id">
                    <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item class="form-item-btn" label="">
                    <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                    <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">佣金统计</div>
        </div>
        <el-table :height="$tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="序号" width="100" align="left" type="index">
                <template scope="scope">
                    <span>{{ (listQuery.page - 1) * listQuery.limit + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column label="商品名称" width="280">
                <template slot-scope="scope">
                    <span>{{ scope.row.goods_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="订单号">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="获佣店铺">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="获佣金额(元)" width="120">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.commission) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
                <template slot-scope="scope">
                    <div class="type-tag type-blue" v-if="scope.row.status == 1">待结算</div>
                    <div class="type-tag type-green" v-if="scope.row.status == 2">已结算</div>
                    <div class="type-tag type-grey" v-if="scope.row.status == 3">失效</div>
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
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
</template>
<script>
import { queryCommission } from '@/api/money'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'

export default {
    name: 'agent-list',
    data() {
        return {
            list: null,
            total: 0,
            listLoading: false,
            shopList: [],
            listQuery: {
                page: 1,
                limit: 10
            },
            statusList: [
                {
                    id: 1,
                    label: '待结算'
                },
                {
                    id: 2,
                    label: '已结算'
                },
                {
                    id: 3,
                    label: '失效'
                }
            ],
            formFilter: {
                goods_name: '', //不搜索为空
                order_no: '', //不搜索为空
                shop_id: '', //不搜索为-1
                status: '' //不搜索为-1 1 已经付款 待结算  2可提现 已结算  3 已取消
            }
        }
    },

    created() {},
    mounted() {
        this.queryShopList()
        this.getList()
    },
    inject: ['reload'],
    methods: {
        formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['shop_id'] = params['shop_id'] == '' ? -1 : params['shop_id']
            params['status'] = params['status'] == '' ? -1 : params['status']

            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryCommission(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.lists
                    this.total = res.data.total
                })
                .catch(err => {})
        },

        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data
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
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields()
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
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.timg {
    width: 80px;
    height: 60px;
}
.type-tag {
    // display: block;
    padding: 0 11px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
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
    &.type-grey {
        background-color: rgba(0, 0, 0, 0.25);
    }
    &.type-green {
        background-color: #52c41a;
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
</style>
