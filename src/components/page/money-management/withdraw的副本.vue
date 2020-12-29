<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                <el-form-item label="店铺名称" prop="shop_id">
                    <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="管理员昵称" prop="name">
                    <el-input class="filter-item" placeholder="请输入" v-model="formFilter.name"></el-input>
                </el-form-item>
                <el-form-item label="管理员手机号" prop="phone">
                    <el-input class="filter-item" placeholder="请输入" v-model="formFilter.phone"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item class="long-time" label="申请时间" prop="createdTime">
                    <el-date-picker
                        class="filter-item"
                        v-model="formFilter.createdTime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item class="long-time" label="到账时间" prop="createdTime">
                    <el-date-picker
                        class="filter-item"
                        v-model="formFilter.createdTime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    >
                    </el-date-picker>
                </el-form-item>

                <el-form-item class="form-item-btn" label="">
                    <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                    <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">代理管理</div>
        </div>
        <el-table :height="$tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <div v-hasPermission="'mall-backend-agent-update-status'">
                        <el-button class="text-blue" type="text" size="" v-if="scope.row.status == 1" @click.native="updateAgentStatus(scope.row.id, 4)">
                            通过
                        </el-button>
                        <el-button class="text-red" type="text" size="" v-if="scope.row.status == 1" @click.native="updateAgentStatus(scope.row.id, 3)">
                            拒绝
                        </el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
                <template slot-scope="scope">
                    <div class="type-tag type-yellow" v-if="scope.row.status == 1">审核拒绝</div>
                    <div class="type-tag type-green" v-if="scope.row.status == 4">审核通过</div>
                    <div class="type-tag type-grey" v-if="scope.row.status == 5">待审核</div>
                </template>
            </el-table-column>
            <el-table-column label="管理员昵称" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="管理员手机号" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺名称" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="申请提现金额" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="申请时间" width="180">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.apply_time).format('YYYY-DD-MM HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="提现方式" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="请求第三方时间" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="到账时间" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
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
import { queryAgentList, updateAgentStatus } from '@/api/agent'
import { queryWithdrawList } from '@/api/money'
import { queryShopList } from '@/api/goods'

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
                shop_id: '', //不搜索为0
                phone: '', //不搜索为空
                name: '', //不搜索为空
                status: '' //不搜索为0 //状态：1新增(待审核)；2审核通过（待绑定）；3拒绝；4合作中；5取消合作
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
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['shop_id'] = params['shop_id'] == '' ? 0 : params['shop_id']
            params['status'] = params['status'] == '' ? 0 : params['status']

            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryAgentList(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.lists
                    this.total = res.data.total
                })
                .catch(err => {})
        },
        // 更新状态
        updateAgentStatus(id, status) {
            let params = {
                id: id,
                status: status //2审核通过（待绑定）；3拒绝；4合作中；5取消合作
            }
            let title
            let type
            switch (status) {
                case 3:
                    title = '确认要取消与该代理的合作吗？'
                    type = 'warning'
                    break
                case 4:
                    title = '确认要通过该代理申请吗？'
                    type = 'success'

                    break
                case 5:
                    title = '确认要拒绝该代理申请吗？'
                    type = 'error'
                    break
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
                                })
                                this.reload()
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
                })
                .catch(() => {})
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
