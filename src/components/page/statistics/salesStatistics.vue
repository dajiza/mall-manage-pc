<template>
    <div class="app-container goods-list">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left">
                <el-form-item label="店铺名称" prop="shop_id" class="">
                    <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="时间区间" prop="searchTime" class="long-time">
                    <el-date-picker
                        class="filter-item"
                        v-model="formFilter.searchTime"
                        type="datetimerange"
                        range-separator="至"
                        align="left"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :default-time="['00:00:00', '23:59:59']"
                        :picker-options="pickerOptions"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item class="form-item-btn" label="">
                    <el-button class="filter-btn" @click="resetForm('formFilter')">重置</el-button>
                    <el-button class="filter-btn" type="primary" @click="handleFilter">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">销售统计</div>
            <div class="shop-icon shop-all" v-if="!filterShop.id"><span class="iconfont icon-shop"></span><span class="text">所有店铺</span></div>
            <div class="shop-icon shop-filter" v-if="filterShop.id">
                <img class="shop-img" :src="filterShop.shop_icon" alt="" /><span class="text">{{ filterShop.shop_name }}</span>
            </div>
            <el-radio-group v-model="tabWay" class="tab-way">
                <el-radio-button label="sales">销量</el-radio-button>
                <el-radio-button label="order">订单量</el-radio-button>
                <el-radio-button label="amount">销售额</el-radio-button>
            </el-radio-group>
        </div>
        <el-table
            ref="table"
            :height="$tableHeight"
            class="table"
            :data="list"
            v-loading.body="listLoading"
            :header-cell-style="$tableHeaderColor"
            element-loading-text="Loading"
            :key="tableKey"
            show-summary
        >
            <el-table-column label="店铺名称" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.product_code }}</span>
                </template>
            </el-table-column>
            <el-table-column label="SKU图片">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.product_img" alt="" />
                </template>
            </el-table-column>

            <el-table-column :label="item.label" v-for="(item, index) in showColumn" :key="index" :width="item.width">
                <template slot-scope="scope">
                    <span v-if="item.key == 'goods_attr'">{{ scope.row.goods_attr.join(',') }}</span>
                    <span v-else>{{ scope.row[item.key] }}</span>
                </template>
            </el-table-column>

            <el-table-column label="小计" width="120" sortable prop="money_total">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.money_total) }}</span>
                </template>
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
</template>

<script>
import { queryShopList } from '@/api/goods'
import { queryOrderReportSku } from '@/api/statistics'
import { formatMoney } from '@/plugin/tool'
// import { filter } from 'vue/types/umd';

export default {
    name: 'skuStatistics',
    data() {
        return {
            shopList: [],
            filterShop: {},
            pageInfo: {
                pageIndex: 1,
                pageSize: 10
            },
            listLoading: false,
            loading: false,
            tableData: [],
            list: [],
            total: 0,
            listQuery: {
                page: 1,
                limit: 10
            },
            formFilter: {
                product_code: '',
                searchTime: '',
                created_time_le: '',
                created_time_ge: '',
                shop_id: ''
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            tabWay: 'sales',
            tableKey: 0,
            isIndeterminate: false,
            checkAll: true,
            checkedColumn: ['product_name', 'product_code', 'goods_name', 'goods_attr', 'storage', 'price'],
            showColumn: [],
            columns: [
                {
                    label: 'SKU名称',
                    key: 'product_name',
                    width: 160,
                    index: 1
                },
                {
                    label: 'SKU编码',
                    key: 'product_code',
                    width: 160,
                    index: 2
                },
                {
                    label: '商品名称',
                    key: 'goods_name',
                    width: 160,
                    index: 3
                },
                {
                    label: '规格',
                    key: 'goods_attr',
                    width: 120,
                    index: 4
                },
                {
                    label: '可用库存',
                    key: 'storage',
                    width: 100,
                    index: 5
                },
                {
                    label: '销售单价',
                    key: 'price',
                    width: 120,
                    index: 6
                }
            ]
        }
    },
    updated() {
        this.$nextTick(() => {
            this.$refs['table'].doLayout()
        })
    },
    mounted() {
        // 默认搜索一个月
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 14)
        let timeStart = start
        let timeEnd = end
        timeStart = this.$moment(timeStart).format('yyyy-MM-DD HH:mm:ss')
        timeEnd = this.$moment(timeEnd).format('yyyy-MM-DD HH:mm:ss')
        this.formFilter.searchTime = [timeStart, timeEnd]

        // 默认显示全部列表
        this.handleCheckAllChange(true)
        this.queryShopList()
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,

        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)
            if (params['shop_id']) {
                this.filterShop = this.shopList.find(item => item.id == params['shop_id'])
            } else {
                this.filterShop = {}
            }

            if (params['searchTime'].length == 2) {
                params['created_time_ge'] = params.searchTime[0]
                params['created_time_le'] = params.searchTime[1]
            } else {
                params['created_time_ge'] = ''
                params['created_time_le'] = ''
            }
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryOrderReportSku(params)
                .then(res => {
                    if (res.data.lists == null) {
                        this.list = res.data.lists
                        return
                    }
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const element = res.data.lists[i]
                        element['goods_attr'] = JSON.parse(element['goods_attr'])
                        element['goods_attr'] = element['goods_attr'].map(item => item.Value)
                    }

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
        // 全选
        handleCheckAllChange(val) {
            this.tableKey++
            this.checkedColumn = val ? this.columns.map(item => item.key) : []
            this.showColumn = val ? this.columns.map(item => item).sort((a, b) => a.index - b.index) : []
            this.isIndeterminate = false
        },
        handleCheckedColumnChange(value) {
            this.tableKey++
            let checkedCount = value.length
            this.checkAll = checkedCount === this.columns.length
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.columns.length

            this.showColumn = value.map(item => this.columns.find(column => column.key == item)).sort((a, b) => a.index - b.index)
            console.log('输出 ~ this.showColumn', this.showColumn)
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
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
        },
        getSummaries(param) {
            console.log('输出 ~ param', param)
            const { columns, data } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '总计'
                    return
                }
                const values = data.map(item => Number(item[column.property]))
                console.log('输出 ~ values', values)
                if (!values.every(value => isNaN(value))) {
                    sums[index] = values.reduce((prev, curr) => {
                        const value = Number(curr)
                        if (!isNaN(value)) {
                            return prev + curr
                        } else {
                            return prev
                        }
                    }, 0)
                    sums[index] += ' 元'
                } else {
                    sums[index] = 'N/A'
                }
            })

            return sums
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.tab-way {
    margin-right: 30px;
    margin-left: auto;
}

.el-col {
    margin-top: 10px;
}

.timg {
    width: 80px;
    height: 60px;
}
.shop-icon {
    display: flex;
    margin-left: 23px;
    padding: 0 10px;
    height: 30px;
    border-radius: 15px;
    background: #ffffff;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
    font-weight: 500;
    font-size: 14px;
    line-height: 30px;
    &.shop-all {
        color: #1890ff;
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .icon-shop {
            margin-right: 6px;
        }
    }
    &.shop-filter {
        color: rgba(0, 0, 0, 0.85);
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .shop-img {
            margin-top: 5px;
            margin-right: 6px;
            width: 20px;
            height: 20px;
            border-radius: 10px;
        }
    }
}
</style>
