<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="right" label-width="80px">
                <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                <el-form-item label="订单号" prop="order_no">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.order_no"></el-input>
                </el-form-item>
                <el-form-item label="退款类型" prop="type">
                    <el-select class="filter-item" v-model="formFilter.type" placeholder="请选择">
                        <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="退款状态" prop="status">
                    <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                        <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="售后原因" prop="reason_id">
                    <el-select class="filter-item" v-model="formFilter.reason_id" placeholder="请选择">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="申请时间" prop="createdTime">
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
                <el-button class="filter-item" size="" type="" icon="el-icon-edit-outline" @click="resetForm('formFilter')">重置</el-button>
                <el-button class="filter-item" size="" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">售后申请列表</div>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit highlight-current-row>
            <el-table-column label="操作" width="">
                <template slot-scope="scope">
                    <el-button class="text-red" v-if="scope.row.status == 0" type="text" size="" @click.native="gotoDetail(scope.row.id)">详情</el-button>
                    <el-button
                        class="text-blue"
                        v-if="scope.row.status == 2 || scope.row.status == 7 || scope.row.status == 8 || scope.row.status == 9"
                        type="text"
                        size=""
                        @click.native="gotoDetail(scope.row.id)"
                        >审核</el-button
                    >
                    <el-button
                        class="text-yellow"
                        v-if="scope.row.status == 1 || scope.row.status == 4 || scope.row.status == 5 || scope.row.status == 6"
                        type="text"
                        size=""
                        @click.native="gotoDetail(scope.row.id)"
                        >处理</el-button
                    >
                </template>
            </el-table-column>
            <el-table-column label="订单号" width="">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="nnn" width="">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_detail_num }}</span>
                </template>
            </el-table-column>
            <el-table-column label="退款金额(元)">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.money) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="退款类型" fit>
                <template slot-scope="scope">
                    <div class="type-tag type-red" v-if="scope.row.type == 0">{{ REFUND_TYPE[scope.row.type] }}</div>
                    <div class="type-tag type-purple" v-if="scope.row.type == 1">{{ REFUND_TYPE[scope.row.type] }}</div>
                    <div class="type-tag type-yellow" v-if="scope.row.type == 2">{{ REFUND_TYPE[scope.row.type] }}</div>
                </template>
            </el-table-column>
            <el-table-column label="退款状态" fit>
                <template slot-scope="scope">
                    <div class="status">
                        <span class="dot dot-grey" v-if="scope.row.status == 0"></span>
                        <span class="dot dot-red" v-if="scope.row.status == 2 || scope.row.status == 8"></span>
                        <span class="dot dot-yellow" v-if="scope.row.status == 4 || scope.row.status == 5"></span>
                        <span class="dot dot-blue" v-if="scope.row.status == 1"></span>
                        <span class="dot dot-purple" v-if="scope.row.status == 6"></span>
                        <span class="dot dot-green" v-if="scope.row.status == 9 || scope.row.status == 7"></span>
                        <span :class="[scope.row.status == 0 ? 'text-grey' : '', 'status-text']">
                            {{ REFUND_STATUS[scope.row.status] }}
                        </span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="售后原因">
                <template slot-scope="scope">
                    <span>{{ scope.row.reason }}</span>
                </template>
            </el-table-column>
            <el-table-column label="申请时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_time }}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column label="操作"  width="250">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click.native="edit(scope.row.id)">修改</el-button>
                    <el-button :type="scope.row.status ? 'success' : 'warning'" size="mini" @click.native="setStatus(scope.row, scope.$index)">{{ scope.row.status ? '已启用' : '已禁用' }}</el-button>
                    <el-button type="danger" size="mini" @click.native="del(scope.row.id, scope.$index)" :disabled="scope.row.isDelete">删除</el-button>
                </template>
            </el-table-column> -->
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
import { queryAfterSaleList } from '@/api/afterSale';
import { REFUND_TYPE, REFUND_STATUS } from '@/plugin/constant';
import { formatMoney } from '@/plugin/tool';

export default {
    data() {
        return {
            value: '',
            options: [
                { value: '4321334', label: '123' },
                { value: '132', label: '32121' }
            ],
            REFUND_TYPE,
            REFUND_STATUS,
            list: null,
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            // 检索
            typeList: [
                { value: '0', label: '仅退款' },
                { value: '1', label: '退货退款' },
                { value: '2', label: '换货' }
            ],
            statusList: [
                { value: '0', label: '待审核' },
                { value: '1', label: '待打款' },
                { value: '2', label: '已拒绝' },
                { value: '3', label: '撤销' },
                { value: '4', label: '等待买家退货' },
                { value: '5', label: '买家已退货' },
                { value: '6', label: '商家待发货' },
                { value: '7', label: '已打款' },
                { value: '8', label: '拒绝打款' },
                { value: '9', label: '商家已重新发货' }
            ],
            reasonList: '',

            formFilter: {
                type: '', //不检索传“”
                status: '',
                order_no: '',
                reason_id: '',
                createdTime: '',
                created_time_le: '',
                created_time_ge: ''
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
            if (params.createdTime.length == 2) {
                params['created_time_ge'] = params.createdTime[0];
                params['created_time_le'] = params.createdTime[1];
            } else {
                params['created_time_ge'] = '';
                params['created_time_le'] = '';
            }
            params['limit'] = this.listQuery.limit;
            params['page'] = this.listQuery.page;

            console.log(params);
            queryAfterSaleList(params)
                .then(res => {
                    console.log('GOOGLE: res', res);
                    this.list = res.data.lists;
                    this.total = res.data.total;
                })
                .catch(err => {});
        },

        gotoDetail(id) {
            this.$router.push({
                // path: '/goods/goods_edit',
                name: 'afterSaleDetail',
                params: {
                    id: id
                }
            });
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
