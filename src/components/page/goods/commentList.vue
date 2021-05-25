<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">评论管理</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="商品名称" prop="skuName">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.skuName"></el-input>
                        </el-form-item>
                        <el-form-item label="店铺名称" prop="shopName">
                            <el-select class="filter-item" v-model="formFilter.shopName" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="订单号" prop="orderNo">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.orderNo"></el-input>
                        </el-form-item>
                        <el-form-item label="用户名称" prop="nickName">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.nickName"></el-input>
                        </el-form-item>
                        <el-form-item label="用户ID" prop="userId">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.userId"></el-input>
                        </el-form-item>
                        <el-form-item class="long-time" label="评价时间" prop="createdTime">
                            <el-date-picker
                                class="filter-item"
                                v-model="formFilter.createdTime"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                type="datetimerange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                :default-time="['00:00:00', '23:59:59']"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
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
            <el-radio-group v-model="formFilter.isApprove" class="tab-way" @change="onTabClick">
                <el-radio-button :label="1">未审核</el-radio-button>
                <el-radio-button :label="2">已审核</el-radio-button>
            </el-radio-group>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :height="tableHeight" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="操作" width="110">
                <template slot-scope="scope">
                    <el-button class="text-blue" type="text" size="" @click.native="gotoDetail(scope.row.id, scope.row.order_id)">通过</el-button>
                    <el-button class="text-red" type="text" size="" @click.native="gotoDetail(scope.row.id, scope.row.order_id)">拒绝</el-button>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="评价内容" width="610">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="评星" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="商品名称" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺名称" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="订单号" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户ID" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户名称" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="评价时间" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
        </el-table>
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
import { queryCommentList, updateCommentApprove } from '@/api/goods'
import { queryShopList } from '@/api/goods'

import { formatMoney } from '@/plugin/tool'

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
            shopList: [],

            formFilter: {
                pi: 1,
                ps: 10,
                skuName: '', //商品名称
                shopName: '', // 店铺名称
                orderNo: 0, // 订单编号
                nickName: '', // 用户名称
                userId: '', // 用户id
                isApprove: 1, // 是否审核 1未审核 2已审核
                startTime: 0, // 时间戳
                endTime: 0, //时间戳
                createdTime: ''
            },
            tableHeight: 'calc(100vh - 194px)',
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
    created() {},
    mounted() {
        this.queryShopList()
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = this.$refs['formFilter'].model
            if (params.createdTime.length == 2) {
                params['startTime'] = params.createdTime[0]
                params['endTime'] = params.createdTime[1]
            } else {
                params['startTime'] = 0
                params['endTime'] = 0
            }

            params['orderNo'] = params['orderNo'] || 0
            params['pi'] = this.listQuery.limit
            params['ps'] = this.listQuery.page

            console.log('params', params)
            queryCommentList(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.lists
                    this.total = res.data.total
                })
                .catch(err => {})
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data
                })
                .catch(err => {})
        },

        gotoDetail(id, order_id) {
            this.$router.push({
                name: 'afterSaleDetail',
                query: {
                    id: id,
                    orderId: order_id
                }
            })
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
            this.handleFilter()
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            // 商品名称
            if (this.formFilter['skuName']) {
                let obj = {
                    label: 'skuName',
                    val: this.formFilter['skuName']
                }
                _search.push(obj)
            }
            // 店铺名称
            if (this.formFilter['shopName']) {
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
            // 订单编号
            if (this.formFilter['orderNo']) {
                let obj = {
                    label: 'orderNo',
                    val: this.formFilter['orderNo']
                }
                _search.push(obj)
            }
            // 用户名称
            if (this.formFilter['nickName']) {
                let obj = {
                    label: 'nickName',
                    val: this.formFilter['nickName']
                }
                _search.push(obj)
            }
            // 用户id
            if (this.formFilter['userId']) {
                let obj = {
                    label: 'userId',
                    val: this.formFilter['userId']
                }
                _search.push(obj)
            }
            // 评价时间 createdTime
            if (this.formFilter['createdTime'] && this.formFilter['createdTime'].length === 2) {
                let _ge_arr = this.$moment(this.formFilter.createdTime[0])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _le_arr = this.$moment(this.formFilter.createdTime[1])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _ge = _ge_arr[1] + '.' + _ge_arr[2]
                let _le = _le_arr[1] + '.' + _le_arr[2]
                let obj = {
                    label: 'createdTime',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }

            console.log('_search', _search)
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter, item.label, '')
            if (item.label == 'createdTime') {
                this.$set(this.formFilter, 'startTime', '')
                this.$set(this.formFilter, 'endTime', '')
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
        // tab
        onTabClick() {
            this.listQuery.page = 1
            this.setSearchValue()
            this.getList()
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.tab-way {
    margin-right: 32px;
    margin-left: auto;
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
