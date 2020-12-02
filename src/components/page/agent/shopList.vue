<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left" label-width="100px">
                <el-form-item label="店铺名称" prop="name">
                    <el-select class="filter-item" v-model="formFilter.name" placeholder="请选择" filterable>
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.shop_name"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="绑定代理" prop="agent_name">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.agent_name"></el-input>
                </el-form-item>
                <el-form-item label="代理手机号" prop="agent_phone">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.agent_phone"></el-input>
                </el-form-item>
                <el-form-item label="管理员微信昵称" prop="admin_name">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.admin_name"></el-input>
                </el-form-item>
                <el-form-item label="店铺状态" prop="status">
                    <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>

                <el-button class="filter-item" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                <el-button class="filter-item" size="" type="primary" @click="handleFilter">搜索</el-button>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">店铺管理</div>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit highlight-current-row>
            <el-table-column label="店铺名称" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺logo" width="100">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.shop_icon" alt="" @click="openPreview(scope.row.img)" />
                </template>
            </el-table-column>
            <el-table-column label="开店时间" width="200">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_at }}</span>
                </template>
            </el-table-column>
            <el-table-column label="绑定代理" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.agent_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="代理手机号" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.agent_phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="管理员微信昵称" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_admin_wx_nick_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="可提现金额" width="120">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.withdrawal_amount) }}</span>
                </template>
            </el-table-column>

            <el-table-column label="店铺状态" width="100">
                <template slot-scope="scope">
                    <div class="type-tag type-green" v-if="scope.row.status == 1">营业中</div>
                    <div class="type-tag type-grey" v-if="scope.row.status == 2">已打样</div>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="300">
                <template slot-scope="scope">
                    <el-button class="text-blue" type="text" size="" @click.native="updateAgentStatus(scope.row.id, 4)">编辑</el-button>
                    <el-button class="text-blue" type="text" size="" @click.native="updateAgentStatus(scope.row.id, 4)">小程序配置</el-button>
                    <el-button class="text-blue" type="text" size="" @click.native="updateAgentStatus(scope.row.id, 4)">订单配置</el-button>
                    <el-button class="text-blue" type="text" size="" @click.native="updateAgentStatus(scope.row.id, 4)">佣金配置</el-button>
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
import { queryShopListPage } from '@/api/agent';
import { queryShopList } from '@/api/goods';
import { formatMoney } from '@/plugin/tool';

export default {
    name: 'shop-list',
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
                    label: '使用中'
                },
                {
                    id: 2,
                    label: '停止使用'
                }
            ],
            formFilter: {
                status: '', //状态 '1 使用中 2 停止使用' 不搜索为-1
                name: '', //店铺名称 不搜索为空
                agent_name: '', //代理商名称 不搜索为空
                agent_phone: '', //代理商手机号 不搜索为空
                admin_name: '' //管理员名称 不搜索为空
            }
        };
    },

    created() {},
    mounted() {
        this.queryShopList();
        this.getList();
    },
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model);

            params['status'] = params['status'] == '' ? -1 : params['status'];

            params['limit'] = this.listQuery.limit;
            params['page'] = this.listQuery.page;

            console.log(params);
            queryShopListPage(params)
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
        // 更新状态
        updateAgentStatus(id, status) {
            let params = {
                id: id,
                status: status //2审核通过（待绑定）；3拒绝；4合作中；5取消合作
            };
            let title;
            let type;
            switch (status) {
                case 3:
                    title = '确认要取消与该代理的合作吗？';
                    type = 'warning';
                    break;
                case 4:
                    title = '确认要通过该代理申请吗？';
                    type = 'success';

                    break;
                case 5:
                    title = '确认要拒绝该代理申请吗？';
                    type = 'error';
                    break;
            }

            this.$confirm(title, '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: type
            })
                .then(() => {
                    updateAgentStatus(params)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '状态设置成功',
                                    type: 'success',
                                    duration: 5000
                                });
                                this.reload();
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                });
                            }
                        })
                        .catch(err => {});
                })
                .catch(() => {});
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
    width: 40px;
    height: 40px;
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
