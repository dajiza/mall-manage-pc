<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                <el-form-item label="店铺名称" prop="shop_id">
                    <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="代理姓名" prop="agent_name">
                    <el-input class="filter-item" placeholder="请输入" v-model="formFilter.agent_name"></el-input>
                </el-form-item>
                <el-form-item class="interval" label="总销售额">
                    <el-input class="filter-item" placeholder="请输入" v-model="formFilter.sale_count_gte"></el-input>
                    <div class="separator">-</div>
                    <el-input class="filter-item" placeholder="请输入" v-model="formFilter.sale_count_lte"></el-input>
                </el-form-item>
                <el-form-item class="form-item-btn" label="">
                    <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                    <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">店铺业绩</div>
        </div>
        <el-table :height="$tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="店铺名称">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="代理姓名">
                <template slot-scope="scope">
                    <span>{{ scope.row.agent_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户数">
                <template slot-scope="scope">
                    <span>{{ scope.row.user_counts }}</span>
                </template>
            </el-table-column>
            <el-table-column label="总销售额">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.sales_count) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="累计佣金">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.commission_count) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="总资产">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.total_assets) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="待入账">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.waiting_confirm) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="可提现">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.can_withdraw) }}</span>
                </template>
            </el-table-column>
        </el-table>
        <!-- <div class="pagination-container">
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="listQuery.page"
                :page-size="listQuery.size"
                layout="total, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </div> -->
    </div>
</template>
<script>
import { queryShopCount } from '@/api/money'
import { queryShopList } from '@/api/goods'
import commUtil from '@/utils/commUtil'
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
                    label: '新增'
                },
                {
                    id: 2,
                    label: '待绑定'
                },
                {
                    id: 3,
                    label: '已拒绝'
                },
                {
                    id: 4,
                    label: '合作中'
                },
                {
                    id: 5,
                    label: '取消合作'
                }
            ],
            formFilter: {
                shop_id: '', //不搜索为-1
                agent_name: '', //不搜索为空
                sale_count_lte: '', //销售总额度 小于等于
                sale_count_gte: '' //销售总额度 大于等于
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

            params['sale_count_lte'] = params['sale_count_lte'] == '' ? -1 : commUtil.numberMul(Number(params['sale_count_lte']), 100)
            params['sale_count_gte'] = params['sale_count_gte'] == '' ? -1 : commUtil.numberMul(Number(params['sale_count_gte']), 100)
            params['shop_id'] = params['shop_id'] == '' ? -1 : params['shop_id']

            // params['limit'] = this.listQuery.limit
            // params['page'] = this.listQuery.page

            console.log(params)
            queryShopCount(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data
                    // this.list = res.data.lists
                    // this.total = res.data.total
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
            this.formFilter.sale_count_lte = ''
            this.formFilter.sale_count_gte = ''
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
