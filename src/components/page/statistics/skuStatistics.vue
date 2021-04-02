<template>
    <div class="app-container goods-list" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">SKU销量排行统计</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left">
                        <el-form-item label="SKU产品编码" prop="product_code" class="">
                            <el-input class="filter-item" v-model="formFilter.product_code" placeholder="请输入"></el-input>
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
                                    :clearable="false"
                            >
                            </el-date-picker>
                        </el-form-item>

                        <el-form-item label="店铺名称" prop="shop_id" class="">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
            <div class="shop-icon shop-all" v-if="!filterShop.id"><span class="iconfont icon-shop"></span><span class="text">所有店铺</span></div>
            <div class="shop-icon shop-filter" v-if="filterShop.id">
                <img class="shop-img" :src="filterShop.shop_icon" alt="" /><span class="text">{{ filterShop.shop_name }}</span>
            </div>
            <div class="search-value" >
                <template v-for="(item,i) in searchList">
                    <div class="search-item" v-if="i <= showMaxIndex">
                        {{item.val}}
                        <span class="tags-li-icon" @click="closeSearchItem(item,i)"><i class="el-icon-close"></i></span>
                    </div>
                </template>
                <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                <div class="search-value-clone" ref="searchValueBox">
                    <template v-for="(item,i) in searchList">
                        <div class="search-item" :ref="'searchItem'+ i">
                            {{item.val}}
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
            <el-popover placement="right" width="100" trigger="click" popper-class="statistics-popover">
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                <el-checkbox-group v-model="checkedColumn" @change="handleCheckedColumnChange">
                    <el-col :span="24" v-for="item in columns" :key="item.key">
                        <el-checkbox :label="item.key">{{ item.label }}</el-checkbox>
                    </el-col>
                </el-checkbox-group>
                <span slot="reference" class="icon iconfont icon-open1 "></span>
            </el-popover>
        </div>
        <div class="wrap" style="height:calc(100vh - 194px);">
            <vxe-table
                ref="xTable"
                :show-header-overflow="true"
                align="left"
                :data="list"
                @sort-change="sortColumn"
                :sort-config="{ trigger: 'cell' }"
                :header-cell-style="$tableHeaderColor"
                height="auto"
                :scroll-y="{ enabled: false }"
                :scroll-x="{ enabled: false }"
                :loading="listLoading"
            >
                <vxe-table-column title="SKU图片" min-width="150" fixed="left" align="center">
                    <template #default="{ row }">
                        <img class="timg" :src="row.product_img" alt="" />
                    </template>
                </vxe-table-column>

                <vxe-table-column v-for="(item, index) in showColumn" :key="index" :title="item.label" :width="item.width">
                    <template #default="{ row }">
                        <span v-if="item.key == 'goods_attr'">{{ row.goods_attr.join(',') }}</span>
                        <span v-else-if="item.key == 'price'">{{ formatMoney(row.price) }}</span>
                        <span v-else style="word-break: break-word;">{{ row[item.key] }}</span>
                    </template>
                </vxe-table-column>
                <vxe-table-column title="小计" min-width="120" field="xj" sortable>
                    <template #default="{ row }">
                        <div v-if="orderByField == 1">{{ row.num }}</div>
                        <div v-if="orderByField == 2">{{ row.order_count }}</div>
                        <div v-if="orderByField == 3">{{ formatMoney(row.money_total) }}</div>
                    </template>
                </vxe-table-column>
                <vxe-table-column v-for="(item, index) in columnName" :key="item" :field="item" :title="$moment(item).format('MM-DD')" width="100" sortable>
                    <template #default="{ row }">
                        <span v-if="orderByField == 1">{{ row.date_info[index].num }}</span>
                        <span v-if="orderByField == 2">{{ row.date_info[index].order_count }}</span>
                        <span v-if="orderByField == 3">{{ formatMoney(row.date_info[index].money_total) }}</span>
                    </template>
                </vxe-table-column>
            </vxe-table>
        </div>

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
            list: null,
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
            orderAsc: '', //1 顺序 2倒序 不排为空
            orderByDate: '', //排序日期

            // tableKey: 0,
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
                    width: 120,
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
                    width: 160,
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
            ],
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
        }
    },
    // updated() {
    //     console.log('输出 ~ updated')
    //     this.$nextTick(() => {
    //         this.$refs['table'].doLayout()
    //     })
    // },
    watch:{
        'searchList':function() {
            this.$nextTick(function() {
                if (!this.$refs.searchValueBox) {
                    return;
                }
                let maxWidth = window.getComputedStyle(this.$refs.searchValueBox).width.replace('px', '')  - 20;
                let showWidth = 0;
                for(let i=0; i<this.searchList.length; i++){
                    let el = 'searchItem' + i;
                    let _width = this.$refs[el][0].offsetWidth;
                    showWidth = showWidth + Math.ceil(Number(_width)) + 8;
                    if(showWidth > maxWidth){
                        this.showMaxIndex = i-1;
                        // console.log('this.showMaxIndex', this.showMaxIndex)
                        return;
                    }
                    if(i == this.searchList.length - 1){
                        if(showWidth <= maxWidth - 20){
                            this.showMaxIndex = this.searchList.length - 1;
                        }
                    }
                }
            }.bind(this));
        }
    },
    mounted() {
        this.setDefaultDate()

        // 默认显示全部列表
        this.handleCheckAllChange(true)
        this.queryShopList()
        this.setSearchValue();
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,

        getList() {
            this.listLoading = true
            let params = _.cloneDeep(this.$refs['formFilter'].model)
            if (params['shop_id']) {
                this.filterShop = this.shopList.find(item => item.id == params['shop_id'])
            } else {
                params['shop_id'] = -1
                this.filterShop = {}
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
                this.listLoading = false
                return
            }

            //1按num 2orderCount 3money
            params['order_by_field'] = this.orderByField
            //1 顺序 2倒序
            params['order_asc'] = this.orderAsc
            // 2021-03-08 00:00:00
            params['order_by_date'] = this.orderByDate

            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            queryOrderReportSku(params)
                .then(res => {
                    this.total = res.data.total
                    if (res.data.lists == null) {
                        res.data.lists = []
                    }
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const element = res.data.lists[i]
                        element['goods_attr'] = JSON.parse(element['goods_attr'])
                        element['goods_attr'] = element['goods_attr'].map(item => item.Value)
                    }
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
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const element = res.data.lists[i]
                        element.date_info = element.date_info ? element.date_info : []
                        element.date_info = element.date_info.sort((a, b) => {
                            return this.$moment(b.key_name).diff(this.$moment(a.key_name), 'days')
                        })
                    }
                    // 补齐所有日期数据 请求的数据当日为0则没有该日期数据
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const element = res.data.lists[i]
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

                    this.list = res.data.lists
                    this.listLoading = false
                    // this.tableKey++
                })
                .catch(err => {
                    this.listLoading = false
                })
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
        // 排序
        sortColumn(value) {
            console.log('输出 ~ value', value)
            if (value.property == 'xj') {
                this.orderByDate = ''
            } else {
                this.orderByDate = this.$moment(value.property).format('YYYY-MM-DD HH:mm:ss')
            }
            switch (value.order) {
                case 'asc':
                    this.orderAsc = 1
                    break
                case 'desc':
                    this.orderAsc = 2
                    break
                case null:
                    this.orderAsc = ''
                    this.orderByDate = ''
                    break
                default:
                    this.orderAsc = ''
                    this.orderByDate = ''
                    break
            }

            this.getList()
        },
        // tab
        onTabClick() {
            this.$refs.xTable.clearSort()
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
            // this.tableKey++
            this.checkedColumn = val ? this.columns.map(item => item.key) : []
            this.showColumn = val ? this.columns.map(item => item).sort((a, b) => a.index - b.index) : []
            this.isIndeterminate = false
        },
        handleCheckedColumnChange(value) {
            // this.tableKey++
            let checkedCount = value.length
            this.checkAll = checkedCount === this.columns.length
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.columns.length

            this.showColumn = value.map(item => this.columns.find(column => column.key == item)).sort((a, b) => a.index - b.index)
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false;
            this.setSearchValue();
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()

            this.setDefaultDate()
            this.orderByField = 1
            this.orderAsc = ''
            this.orderByDate = ''

            this.handleFilter()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            // SKU产品编码 product_code
            if(this.formFilter['product_code']){
                let obj = {
                    label: 'product_code',
                    val: this.formFilter['product_code']
                }
                _search.push(obj)
            }
            // 店铺名称 shop_id
            if(this.formFilter['shop_id']){
                this.shopList.forEach((ev)=>{
                    if(ev.id == this.formFilter['shop_id']){
                        let obj = {
                            label: 'shop_id',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }
            // 时间区间
            if(this.formFilter['searchTime'] && this.formFilter['searchTime'].length === 2){
                let _ge_arr = (this.$moment(this.formFilter.searchTime[0]).format('YYYY-MM-DD ')).split('-');
                let _le_arr = (this.$moment(this.formFilter.searchTime[1]).format('YYYY-MM-DD ')).split('-');
                let _ge = _ge_arr[1]+ '.' + _ge_arr[2];
                let _le = _le_arr[1]+ '.' + _le_arr[2];
                let obj = {
                    label: 'searchTime',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }
            console.log('_search', _search)
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            // created_time_le
            this.$set(this.formFilter,item.label, '');
            if(item.label == 'searchTime'){
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
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.tab-way {
    margin-left: auto;
}
.icon-open1 {
    margin: 0 30px;
    cursor: pointer;
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
