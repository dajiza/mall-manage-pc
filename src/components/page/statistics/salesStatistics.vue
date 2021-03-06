<template>
    <div class="app-container goods-list" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">销售统计</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
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
            </transition>
            <div class="search-value">
                <template v-for="(item, i) in searchList">
                    <div class="search-item" v-if="i <= showMaxIndex">
                        {{ item.val }}
                        <span class="tags-li-icon" @click="closeSearchItem(item, i)"><i class="el-icon-close"></i></span>
                    </div>
                </template>
                <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                <div class="search-value-clone" ref="searchValueBox">
                    <template v-for="(item, i) in searchList">
                        <div class="search-item" :ref="'searchItem' + i">
                            {{ item.val }}
                            <span class="tags-li-icon"><i class="el-icon-close"></i></span>
                        </div>
                    </template>
                    <span style="width: 20px;display: inline-block">...</span>
                </div>
            </div>
            <el-radio-group v-model="orderByField" class="tab-way" @change="onTabClick">
                <el-radio-button :label="1">销量</el-radio-button>
                <el-radio-button :label="2">订单量</el-radio-button>
                <el-radio-button :label="3">销售额</el-radio-button>
            </el-radio-group>
        </div>
        <el-table
            ref="table"
            :height="tableHeight"
            class="table"
            :data="list"
            v-loading.body="listLoading"
            :header-cell-style="$tableHeaderColor"
            element-loading-text="Loading"
            show-summary
            :summary-method="getSummaries"
        >
            <el-table-column label="店铺名称" min-width="160" fixed>
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>

            <el-table-column
                label="小计"
                width="120"
                prop="num"
                sortable
                fixed
                :sort-by="[orderByField == 1 ? 'num' : '', orderByField == 2 ? 'order_count' : '', orderByField == 3 ? 'money_total' : '']"
            >
                <template slot-scope="scope">
                    <span v-if="orderByField == 1">{{ scope.row.num }}</span>
                    <span v-if="orderByField == 2">{{ scope.row.order_count }}</span>
                    <span v-if="orderByField == 3">{{ formatMoney(scope.row.money_total) }}</span>
                </template>
            </el-table-column>
            <el-table-column
                :label="$moment(item).format('MM-DD')"
                :prop="item"
                v-for="(item, index) in columnName"
                :key="item"
                sortable
                width="100"
                :sort-by="[orderByField == 1 ? 'num' : '', orderByField == 2 ? 'order_count' : '', orderByField == 3 ? 'money_total' : '']"
            >
                <template slot-scope="scope">
                    <span v-if="orderByField == 1">{{ scope.row.date_info[index].num }}</span>
                    <span v-if="orderByField == 2">{{ scope.row.date_info[index].order_count }}</span>
                    <span v-if="orderByField == 3">{{ formatMoney(scope.row.date_info[index].money_total) }}</span>
                </template>
            </el-table-column>
        </el-table>
        <!-- <div class="pagination-container">
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
        </div> -->
    </div>
</template>

<script>
import { queryShopList } from '@/api/goods'
import { queryOrderReportShop } from '@/api/statistics'
import { formatMoney } from '@/plugin/tool'
// import { filter } from 'vue/types/umd';

export default {
    name: 'skuStatistics',
    data() {
        return {
            shopList: [],

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
                shop_id: '',
                channel_id: -1
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            columnName: [], //按日期统计的表头
            orderByField: 1, //1按num 2orderCount 3money
            tableHeight: 'calc(100vh - 142px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0
        }
    },
    watch: {
        searchList: function() {
            this.$nextTick(
                function() {
                    if (!this.$refs.searchValueBox) {
                        return
                    }
                    let maxWidth = window.getComputedStyle(this.$refs.searchValueBox).width.replace('px', '') - 20
                    let showWidth = 0
                    for (let i = 0; i < this.searchList.length; i++) {
                        let el = 'searchItem' + i
                        let _width = this.$refs[el][0].offsetWidth
                        showWidth = showWidth + Math.ceil(Number(_width)) + 8
                        if (showWidth > maxWidth) {
                            this.showMaxIndex = i - 1
                            // console.log('this.showMaxIndex', this.showMaxIndex)
                            return
                        }
                        if (i == this.searchList.length - 1) {
                            if (showWidth <= maxWidth - 20) {
                                this.showMaxIndex = this.searchList.length - 1
                            }
                        }
                    }
                }.bind(this)
            )
        }
    },
    updated() {
        this.$nextTick(() => {
            this.$refs['table'].doLayout()
        })
    },
    mounted() {
        // 默认搜索一个月
        this.setDefaultDate()

        // 默认显示全部列表
        this.queryShopList()
        this.setSearchValue()
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,

        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            if (!params['shop_id']) {
                params['shop_id'] = -1
            }
            if (params['searchTime'] && params['searchTime'].length == 2) {
                params['created_time_ge'] = params.searchTime[0]
                params['created_time_le'] = params.searchTime[1]
            } else {
                params['created_time_ge'] = ''
                params['created_time_le'] = ''
                this.$notify({
                    title: '请选择时间区间',
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            // params['limit'] = this.listQuery.limit
            // params['page'] = this.listQuery.page

            queryOrderReportShop(params)
                .then(res => {
                    console.log('输出 ~ res', res)
                    // 生成统计显示表头
                    let start = this.$moment(params.searchTime[0]).format('YYYY-MM-DD')
                    let end = this.$moment(params.searchTime[1]).format('YYYY-MM-DD')
                    let pointer = end
                    let columnName = []
                    while (this.$moment(pointer).diff(this.$moment(start), 'days') >= 0) {
                        columnName.push(this.$moment(pointer).format('YYYY-MM-DD'))
                        pointer = this.$moment(pointer).add(-1, 'd')
                    }
                    this.columnName = columnName
                    // 日期排序
                    for (let i = 0; i < res.data.length; i++) {
                        const element = res.data[i]
                        element.date_info = element.date_info ? element.date_info : []
                        element.date_info = element.date_info.sort((a, b) => {
                            return this.$moment(b.key_name).diff(this.$moment(a.key_name), 'days')
                        })
                    }

                    // 补齐所有日期数据 请求的数据当日为0则没有该日期数据
                    for (let i = 0; i < res.data.length; i++) {
                        const element = res.data[i]
                        element.date_info = element.date_info ? element.date_info : []
                        for (let j = 0; j < columnName.length; j++) {
                            const dateItem = element.date_info[j] ? element.date_info[j].key_name : null
                            const column = columnName[j]
                            if (!dateItem || this.$moment(dateItem).diff(this.$moment(column), 'days') != 0) {
                                let insertData = {
                                    key_name: column,
                                    money_total: 0,
                                    num: 0,
                                    order_count: 0
                                }
                                element.date_info.splice(j, 0, insertData)
                            }
                        }
                    }
                    // 小计
                    for (let i = 0; i < res.data.length; i++) {
                        const element = res.data[i]
                        let num = 0
                        let order_count = 0
                        let money_total = 0
                        for (let j = 0; j < element.date_info.length; j++) {
                            const item = element.date_info[j]
                            num = num + item.num
                            order_count += item.order_count
                            money_total += item.money_total
                        }
                        element.num = num
                        element.order_count = order_count
                        element.money_total = money_total
                    }
                    this.list = res.data
                    console.log('输出 ~ res.data', res.data)
                })
                .catch(err => {})
        },
        // 设置默认时间 搜索7天
        setDefaultDate() {
            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            let timeStart = start
            let timeEnd = end
            timeStart = this.$moment(timeStart).format('yyyy-MM-DD HH:mm:ss')
            timeEnd = this.$moment(timeEnd).format('yyyy-MM-DD HH:mm:ss')
            this.formFilter.searchTime = [timeStart, timeEnd]
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data
                })
                .catch(err => {})
        },
        onTabClick() {
            // this.tableKey++
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.setSearchValue()
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.setDefaultDate()
            this.handleFilter()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            // console.log('this.formFilter.searchTime', this.formFilter.searchTime)
            let _search = []
            // 店铺名称 shop_id
            if (this.formFilter['shop_id']) {
                this.shopList.forEach(ev => {
                    if (ev.id == this.formFilter['shop_id']) {
                        let obj = {
                            label: 'shop_id',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }
            // 时间区间
            if (this.formFilter['searchTime'] && this.formFilter['searchTime'].length === 2) {
                let _ge_arr = this.$moment(this.formFilter.searchTime[0])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _le_arr = this.$moment(this.formFilter.searchTime[1])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _ge = _ge_arr[1] + '.' + _ge_arr[2]
                let _le = _le_arr[1] + '.' + _le_arr[2]
                let obj = {
                    label: 'searchTime',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }
            // console.log('_search', _search)
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            // created_time_le
            this.$set(this.formFilter, item.label, '')
            if (item.label == 'searchTime') {
                this.$set(this.formFilter, 'searchTime', [])
                this.$set(this.formFilter, 'created_time_le', '')
                this.$set(this.formFilter, 'created_time_ge', '')
            }
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
            const { columns, data } = param
            const sums = []
            let paramName = ''
            let magnificat = 1
            switch (this.orderByField) {
                case 1:
                    paramName = 'num'
                    magnificat = 1
                    break
                case 2:
                    paramName = 'order_count'
                    magnificat = 1
                    break
                case 3:
                    paramName = 'money_total'
                    magnificat = 0.01
                    break
            }
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '总计'
                    return
                }
                if (index >= 2) {
                    sums[index] = data.reduce((prev, curr) => {
                        return prev + curr.date_info[index - 2][paramName] * magnificat
                    }, 0)
                } else {
                    sums[index] = data.reduce((prev, curr) => {
                        return prev + curr[paramName] * magnificat
                    }, 0)
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
.table /deep/ .el-table__footer {
    font-weight: 500;
}
</style>
