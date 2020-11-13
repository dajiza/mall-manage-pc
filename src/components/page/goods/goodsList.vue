<template>
    <div class="app-container">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="right" label-width="80px">
                <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                <el-form-item label="商品名称">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.title"></el-input>
                </el-form-item>
                <el-form-item label="商品ID">
                    <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.id"></el-input>
                </el-form-item>
                <el-form-item label="商品分类">
                    <el-select class="filter-item" v-model="formFilter.category_id" placeholder="请选择" @change="onChangeType">
                        <el-option v-for="item in categoryList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品状态">
                    <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                        <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="库存预警">
                    <el-select class="filter-item" v-model="formFilter.is_store_shortage" placeholder="请选择">
                        <el-option v-for="item in shortageList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="是否分销">
                    <el-select class="filter-item" v-model="formFilter.allow_agent" placeholder="请选择">
                        <el-option v-for="item in agentList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>

                <el-button class="filter-item" size="" type="" icon="el-icon-edit-outline" @click="resetForm('formFilter')">重置</el-button>
                <el-button class="filter-item" size="" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
            </el-form>
        </div>
        <div class="operate">
            <el-button type="primary" @click="resetForm">上架</el-button>
            <el-button type="warning" @click="resetForm">下架</el-button>
            <el-button type="primary" @click="resetForm">分销</el-button>
            <el-button type="warning" @click="resetForm">取消分销</el-button>
            <el-button type="primary" @click="resetForm" class="creat-goods">新增商品</el-button>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">商品列表</div>
        </div>
        <el-table
            :data="list"
            v-loading.body="listLoading"
            :header-cell-style="$tableHeaderColor"
            element-loading-text="Loading"
            @selection-change="handleSelectionChange"
            :span-method="arraySpanMethod"
            highlight-current-row
        >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="商品ID" width="">
                <template slot-scope="scope">
                    <span>{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button class="text-red" v-if="scope.row.status == 0" type="text" size="" @click.native="gotoDetail(scope.row.id)">审核</el-button>
                    <el-button
                        class="text-blue"
                        v-if="scope.row.status == 2 || scope.row.status == 4 || scope.row.status == 7 || scope.row.status == 8 || scope.row.status == 9"
                        type="text"
                        size=""
                        @click.native="gotoDetail(scope.row.id)"
                        >详情</el-button
                    >
                    <el-button
                        class="text-yellow"
                        v-if="scope.row.status == 1 || scope.row.status == 5 || scope.row.status == 6"
                        type="text"
                        size=""
                        @click.native="gotoDetail(scope.row.id)"
                        >处理</el-button
                    >
                </template>
            </el-table-column>
            <el-table-column label="是否分销" width="100">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.allow_agent" :active-value="2" :inactive-value="1" active-color="#13ce66" inactive-color="#ff4949">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="指定代理" width="200">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="主图" width="128">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.img" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="商品名称" width="200">
                <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                </template>
            </el-table-column>

            <el-table-column label="商品分类" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.category_id == 0 ? '布料' : '其他' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="">
                <template slot-scope="scope">
                    <div class="status">
                        <span class="dot dot-grey" v-if="scope.row.status == 1"></span>
                        <span class="dot dot-green" v-if="scope.row.status == 2"></span>

                        <span :class="[scope.row.status == 1 ? 'text-grey' : '', 'status-text']">
                            {{ scope.row.status == 1 ? '已下架' : '已上架' }}
                        </span>
                    </div>
                </template>
            </el-table-column>
            <!-- sku 合并行 -->
            <el-table-column label="SKU图片" width="128" class="sku-column">
                <template slot-scope="scope">
                    <el-table class="sku-table" :data="scope.row.goods_sku" :header-cell-style="$tableHeaderColor" :show-header="false" highlight-current-row>
                        <el-table-column label="SKU图片" width="118">
                            <template slot-scope="scope">
                                <img class="timg" :src="scope.row.sku_img" alt="" />
                            </template>
                        </el-table-column>
                        <el-table-column label="SKU名称" width="200">
                            <template slot-scope="scope">
                                <span>{{ scope.row.title }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="售价(元)" width="100">
                            <template slot-scope="scope">
                                <span>{{ formatMoney(scope.row.display_price) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="总库存" width="100">
                            <template slot-scope="scope">
                                <span>{{ scope.row.reason }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="可用库存" width="100">
                            <template slot-scope="scope">
                                <span>{{ scope.row.reason }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="库存预警" width="90">
                            <template slot-scope="scope">
                                <div class="type-tag type-yellow" v-if="scope.row.type == 1">{{}}</div>
                                <div class="type-tag type-blue" v-if="scope.row.type == 2">{{}}</div>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>

            <el-table-column label="SKU名称" width="200"> </el-table-column>
            <el-table-column label="售价(元)" width="100"> </el-table-column>
            <el-table-column label="总库存" width="100"> </el-table-column>
            <el-table-column label="可用库存" width="100"> </el-table-column>
            <el-table-column label="库存预警" width="100"> </el-table-column>
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
import { queryGoodsList } from '@/api/goods';
import { formatMoney } from '@/plugin/tool';

export default {
    data() {
        return {
            value: null,
            list: null,
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            // 分类 0 布料  否则为其他的商品分类
            categoryList: [
                { value: 0, label: '布料' },
                { value: 1, label: '其他' }
            ],
            // 是否上架：1下架；2上架
            statusList: [
                { value: 1, label: '下架' },
                { value: 2, label: '上架' }
            ],
            // 是否库存不足 1 足 2 不足(只有当所有sku 全部库存不足 为2
            shortageList: [
                { value: 1, label: '足' },
                { value: 2, label: '不足' }
            ],
            // 是否所有代理可以销售：1指定代理；2所有代理可以销售
            agentList: [
                { value: 1, label: '指定代理' },
                { value: 2, label: '所有代理可以销售' }
            ],
            typeList: [
                { value: '0', label: '仅退款' },
                { value: '1', label: '退货退款' },
                { value: '2', label: '换货' },
                { value: '3', label: '后台关闭' }
            ],

            reasonList: [],

            formFilter: {
                id: '',
                title: '',
                category_id: '',
                status: '',
                is_store_shortage: '',
                allow_agent: ''
            }
        };
    },

    created() {},
    mounted() {
        this.getList();
    },
    methods: {
        formatMoney: formatMoney,
        arraySpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 9) {
                return [1, 6];
            }
            if (columnIndex > 9) {
                return [0, 0];
            }
            console.log('GOOGLE: row, column, rowIndex, columnIndex', row, column, rowIndex, columnIndex);
            // if (rowIndex % 2 === 0) {
            //     if (columnIndex === 0) {
            //         return [1, 2];
            //     } else if (columnIndex === 1) {
            //         return [0, 0];
            //     }
            // }
        },
        getList() {
            let params = this.$refs['formFilter'].model;
            console.log('GOOGLE: params', params);

            console.log(params);
            queryGoodsList(params)
                .then(res => {
                    console.log('GOOGLE: res', res);
                    this.list = res.data.lists;
                    this.total = res.data.total;
                })
                .catch(err => {});
        },
        onChangeType(event) {
            this.getReasonList(event);
            this.formFilter.reason_id = '';
        },
        getReasonList(type) {
            let params = {
                type: Number(type) // 0仅退款理由 1退货理由 2换货理由 3后台关闭理由
            };

            queryReasonList(params)
                .then(res => {
                    this.reasonList = res.data.map(item => {
                        return {
                            id: item.id.toString(),
                            name: item.name,
                            type: item.type
                        };
                    });
                    console.log('GOOGLE: res', res);
                })
                .catch(err => {});
        },

        gotoDetail(id) {
            this.$router.push({
                name: 'afterSaleDetail',
                params: {
                    id: id
                }
            });
        },
        handleSelectionChange(val) {
            console.log('GOOGLE: val', val);
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
.sku-column {
    .cell {
        padding: 0;
    }
    & /deep/ .cell {
        padding: 0;
    }
}
.operate {
    display: flex;
    padding: 14px 24px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    .creat-goods {
        margin-left: auto;
    }
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
