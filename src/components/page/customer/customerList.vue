<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="right" label-width="100px">
                <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                <el-form-item label="客户名称">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.nick_name"></el-input>
                </el-form-item>
                <el-form-item label="客户微信号">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.order_no"></el-input>
                </el-form-item>
                <el-form-item label="所属代理">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.order_no"></el-input>
                </el-form-item>
                <el-form-item label="累计消费">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.consumption_min"></el-input>
                    <span>-</span>
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.consumption_max"></el-input>
                </el-form-item>

                <el-button class="filter-item" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                <el-button class="filter-item" size="" type="primary" @click="handleFilter">搜索</el-button>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">客户管理</div>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit highlight-current-row>
            <el-table-column label="序号" width="">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户微信号">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.money) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户微信名称" fit>
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.money) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="所属店铺" fit>
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.money) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="累计消费(元)">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.reason) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="首次登录时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_time }}</span>
                </template>
            </el-table-column>
            <el-table-column label="上次登录时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_time }}</span>
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
import { queryCustomerList } from '@/api/customer';
import { formatMoney } from '@/plugin/tool';

export default {
    data() {
        return {
            list: null,
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },

            formFilter: {
                nick_name: '', //不搜索 为空
                consumption_min: -1, //不搜索 为-1
                consumption_max: -1, //不搜索 为-1
                shop_id: -1 //不搜索 为-1
            }
        };
    },

    created() {},
    mounted() {
        this.getList();
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = this.$refs['formFilter'].model;

            // "nick_name":"",//不搜索 为空
            // "consumption_min":-1,//不搜索 为-1
            // "consumption_max":-1,//不搜索 为-1
            // "shop_id":-1//不搜索 为-1

            params['consumption_min'] = params['consumption_min'] == '' ? -1 : params['consumption_min'];
            params['consumption_max'] = params['consumption_max'] == '' ? -1 : params['consumption_max'];
            params['shop_id'] = params['shop_id'] == '' ? -1 : params['shop_id'];

            params['limit'] = this.listQuery.limit;
            params['page'] = this.listQuery.page;

            console.log(params);
            queryCustomerList(params)
                .then(res => {
                    console.log('GOOGLE: res', res);
                    this.list = res.data.lists;
                    this.total = res.data.total;
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
            console.log(this.$refs[formName].model);
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
<style scoped="scoped" lang="less">
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
