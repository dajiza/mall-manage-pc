<template>
    <div class="order-list-container" id="containerWrap">
        <div class="container clearfix head-container" ref="searchBox">
            <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left">
                <el-form-item label="SKU产品编码" prop="sku_no" class="">
                    <el-input class="filter-item" v-model="searchForm.sku_no" placeholder=""></el-input>
                </el-form-item>

                <el-form-item label="时间区间" prop="search_time" class="long-time">
                    <el-date-picker
                        class="filter-item"
                        v-model="searchForm.search_time"
                        type="datetimerange"
                        range-separator="至"
                        align="left"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :picker-options="pickerOptions"
                        :default-time="['00:00:00', '23:59:59']"
                    >
                        <!--:picker-options="pickerOptions"-->
                    </el-date-picker>
                </el-form-item>

                <el-form-item label="店铺名称" prop="shop_id" class="">
                    <el-select class="filter-item" v-model="searchForm.shop_id" placeholder="请选择" filterable>
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name"
                                   :value="item.id"></el-option>
                    </el-select>

                </el-form-item>

                <el-form-item class="form-item-btn" label="">
                    <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                    <el-button class="filter-btn" type="primary" @click="handleFilter">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0 pos-relative">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>SKU销量排行统计</span>
                </div>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="sku-list-table">
                <el-table-column label="SKU图片" width="128">
                    <template slot-scope="scope">
                        <img class="timg" :src="scope.row.product_img" alt="" />
                    </template>
                </el-table-column>
                <el-table-column label="SKU名字" width="220"></el-table-column>
                <el-table-column label="商品名称" width="220"></el-table-column>
                <el-table-column label="规格" width="160"></el-table-column>
                <el-table-column label="可用库存" width="116"></el-table-column>
                <el-table-column label="销量" width="100"></el-table-column>
                <el-table-column label="销售单价(元)" width="120"></el-table-column>
                <el-table-column label="总销售额(元)" width="120"></el-table-column>
                <template slot="empty">
                    <EmptyList v-show="false"></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
            <div class="empty-list-box" v-show="tableData.length === 0">
                <emptyList></emptyList>
            </div>
        </div>
    </div>
</template>

<script>
import emptyList from '../../common/empty-list/EmptyList';
import './Statistics.less';
import { queryShopList } from '@/api/goods';
import { queryOrderReportSku } from '@/api/statistics';

export default {
    name: 'SKUStatistics',
    data() {
        return {
            shopList: [],
            searchForm: {
                sku_no: '', // 订单号
                shop_id: '', // 代理店铺id
                search_time: ''
            },
            pageInfo: {
                pageIndex: 1,
                pageSize: 10
            },
            loading: false,
            tableData: [],
            pageTotal: 0, // 总条数

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
    components: {
        emptyList
    },
    mounted() {
        this.queryShopList();
        this.getList();
    },
    methods: {
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data;
                })
                .catch(err => {
                });
        },
        getList() {

        },
        // 搜索
        handleFilter() {
            this.pageInfo.pageIndex= 1;
            this.getList();
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model);
            this.$refs[formName].resetFields();
            this.$set(this.searchForm, 'sku_no', '');
            this.$set(this.searchForm, 'shop_id', '');
            this.$set(this.searchForm, 'search_time', '');

            this.handleFilter();
        },
        handlePageChange(val) {
            this.pageInfo.page = val;
            this.getList();
        }
    }
};
</script>
