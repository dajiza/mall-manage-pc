<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left" label-width="100px">
                <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                <el-form-item label="所属店铺" prop="shop_id">
                    <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="客户微信昵称" prop="nick_name">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.nick_name"></el-input>
                </el-form-item>
                <el-form-item label="客户手机号" prop="phone">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.phone"></el-input>
                </el-form-item>
                <el-form-item label="累计消费" prop="consumption_min">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.consumption_min"></el-input>
                </el-form-item>
                <el-form-item label="" prop="consumption_min">
                    <span>-</span>
                </el-form-item>
                <el-form-item label="" prop="consumption_max">
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
            <el-table-column label="序号" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.user_id }}</span>
                </template>
            </el-table-column>
            <el-table-column label="所属店铺" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户微信昵称" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.nick_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户微信头像" width="120">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.avatar_url" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="客户手机号" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="累计消费(元)" width="140">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.consumption) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="首次登录时间" width="200"
                >>
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.first_login_time).format('YYYY-DD-MM HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="上次登录时间" width="200"
                >>
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.last_login_time).format('YYYY-DD-MM HH:mm:ss') }}</span>
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
import { queryShopList } from '@/api/goods';

export default {
    name: 'customer-list',
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

            formFilter: {
                nick_name: '', //不搜索 为空
                consumption_min: '', //不搜索 为-1
                consumption_max: '', //不搜索 为-1
                shop_id: '', //不搜索 为-1
                phone: '' ////不搜索 为空
            }
        };
    },

    created() {},
    mounted() {
        this.queryShopList();
        this.getList();
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model);

            params['consumption_min'] = params['consumption_min'] == '' ? -1 : params['consumption_min'] * 100;
            params['consumption_max'] = params['consumption_max'] == '' ? -1 : params['consumption_max'] * 100;
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
