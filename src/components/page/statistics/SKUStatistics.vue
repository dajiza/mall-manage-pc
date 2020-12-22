<template>
    <div class="app-container goods-list">
        <div class="head-container">
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
                    >
                        <!--:picker-options="pickerOptions"-->
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
        <div class="table-title">
            <div class="line"></div>
            <div class="text">SKU销量排行统计</div>
            <div class="shop-icon shop-all" v-if="!filterShop.id"><span class="iconfont icon-shop"></span><span class="text">所有店铺</span></div>
            <div class="shop-icon shop-filter" v-if="filterShop.id">
                <img class="shop-img" :src="filterShop.shop_icon" alt="" /><span class="text">{{ filterShop.shop_name }}</span>
            </div>
        </div>
        <el-table
            :height="$tableHeight"
            class="table"
            :data="list"
            v-loading.body="listLoading"
            :header-cell-style="$tableHeaderColor"
            element-loading-text="Loading"
        >
            <el-table-column label="SKU图片" width="128">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.product_img" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="SKU名字" width="220">
                <template slot-scope="scope">
                    <span>{{ scope.row.product_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="SKU编码" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.product_code }}</span>
                </template>
            </el-table-column>
            <el-table-column label="商品名称" width="220">
                <template slot-scope="scope">
                    <span>{{ scope.row.goods_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="规格" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.goods_attr.join(',') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="可用库存" width="116">
                <template slot-scope="scope">
                    <span>{{ scope.row.storage }}</span>
                </template>
            </el-table-column>
            <el-table-column label="销量" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.num }}</span>
                </template>
            </el-table-column>
            <el-table-column label="销售单价(元)" width="120">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.price) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="总销售额(元)" width="120">
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
                :page-size="listQuery.size"
                layout="total, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </div>
    </div>
</template>

<script>
import './Statistics.less';
import { queryShopList } from '@/api/goods';
import { queryOrderReportSku } from '@/api/statistics';
import { formatMoney } from '@/plugin/tool';
// import { filter } from 'vue/types/umd';

export default {
    name: 'SKUStatistics',
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
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }
                ]
            }
        };
    },

    mounted() {
        this.queryShopList();
        this.getList();
    },
    methods: {
        formatMoney: formatMoney,

        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model);
            if (params['shop_id']) {
                this.filterShop = this.shopList.find(item => item.id == params['shop_id']);
            } else {
                this.filterShop = {};
            }

            if (params['searchTime'].length == 2) {
                params['created_time_ge'] = params.searchTime[0];
                params['created_time_le'] = params.searchTime[1];
            } else {
                params['created_time_ge'] = '';
                params['created_time_le'] = '';
            }
            params['limit'] = this.listQuery.limit;
            params['page'] = this.listQuery.page;

            console.log(params);
            queryOrderReportSku(params)
                .then(res => {
                    if (res.data.lists == null) {
                        this.list = res.data.lists;
                        return;
                    }
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const element = res.data.lists[i];
                        element['goods_attr'] = JSON.parse(element['goods_attr']);
                        element['goods_attr'] = element['goods_attr'].map(item => item.Value);
                    }

                    this.list = res.data.lists;
                    this.total = res.data.total;
                })
                .catch(err => {});
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data;
                })
                .catch(err => {});
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.getList();
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.handleFilter();
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val;
            this.getList();
        },
        handleCurrentChange(val) {
            this.listQuery.page = val;
            this.getList();
        }
    }
};
</script>
