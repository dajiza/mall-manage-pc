<template>
    <div class="app-container"  @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">佣金统计</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="订单号" prop="order_no">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.order_no"></el-input>
                        </el-form-item>
                        <el-form-item label="获佣店铺" prop="shop_id">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="状态" prop="status">
                            <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                                <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="佣金获取人" prop="user_nick_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.user_nick_name"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号" prop="user_phone">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.user_phone"></el-input>
                        </el-form-item>
                        <el-form-item label="佣金类型" prop="commission_type">
                            <el-select class="filter-item" v-model="formFilter.commission_type" placeholder="请选择">
                                <el-option v-for="item in commissionTypeOptions" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
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
        </div>
        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="序号" width="80" align="left" type="index">
                <template scope="scope">
                    <span>{{ (listQuery.page - 1) * listQuery.limit + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column label="商品名称" min-width="200">
                <template slot-scope="scope">
                    <span>{{ scope.row.goods_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="订单号" width="130">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
                </template>
            </el-table-column>
            <el-table-column label="获佣店铺" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="获佣金额(元)" width="120">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.commission) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="佣金获取人" prop="user_nick_name" width="130"></el-table-column>
            <el-table-column label="电话" prop="user_phone" width="130"></el-table-column>
            <el-table-column label="佣金类型" width="120">
                <template slot-scope="scope">
                    <span>{{COMMISSION_TYPE[scope.row.commission_type]}}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
                <template slot-scope="scope">
                    <div class="type-tag type-blue" v-if="scope.row.status == 1">待结算</div>
                    <div class="type-tag type-green" v-if="scope.row.status == 2">已结算</div>
                    <div class="type-tag type-grey" v-if="scope.row.status == 3">失效</div>
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
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
import { queryCommission } from '@/api/money'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import { COMMISSION_TYPE } from '@/plugin/constant'
export default {
    name: 'agent-list',
    data() {
        return {
            COMMISSION_TYPE,
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
                    label: '待结算'
                },
                {
                    id: 2,
                    label: '已结算'
                },
                {
                    id: 3,
                    label: '失效'
                }
            ],
            formFilter: {
                goods_name: '', //不搜索为空
                order_no: '', //不搜索为空
                shop_id: '', //不搜索为-1
                status: '', //不搜索为-1 1 已经付款 待结算  2可提现 已结算  3 已取消
                user_nick_name: '', // 佣金获取人
                user_phone: '', // 手机号
                commission_type: '', // 佣金类型
            },
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
            tableHeight: 'calc(100vh - 194px)',
            commissionTypeOptions: [
                {id: 1, label: '代理商佣金'},
                {id: 2, label: '看看分享佣金'}
            ]
        }
    },
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
    created() {},
    mounted() {
        this.queryShopList()
        this.getList()
    },
    inject: ['reload'],
    methods: {
        formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['shop_id'] = params['shop_id'] == '' ? -1 : params['shop_id']
            params['status'] = params['status'] == '' ? -1 : params['status']

            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryCommission(params)
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
        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.searchShow = false;
            this.setSearchValue();
            this.getList();
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields();
            this.handleFilter();
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            // 商品名称 goods_name
            if(this.formFilter['goods_name']){
                let obj = {
                    label: 'goods_name',
                    val: this.formFilter['goods_name']
                }
                _search.push(obj)
            }
            // 订单号
            if(this.formFilter['order_no']){
                let obj = {
                    label: 'order_no',
                    val: this.formFilter['order_no']
                }
                _search.push(obj)
            }

            // 获佣店铺 shop_id
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

            // 状态 status
            if(this.formFilter['status']){
                this.statusList.forEach((ev)=>{
                    if(ev.id == this.formFilter['status']){
                        let obj = {
                            label: 'status',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // 佣金获取人
            if(this.formFilter['user_nick_name']){
                let obj = {
                    label: 'user_nick_name',
                    val: this.formFilter['user_nick_name']
                }
                _search.push(obj)
            }
            // 佣金获取人手机号
            if(this.formFilter['user_phone']){
                let obj = {
                    label: 'user_phone',
                    val: this.formFilter['user_phone']
                }
                _search.push(obj)
            }
            // 佣金类型
            if(this.formFilter['commission_type']){
                this.commissionTypeOptions.forEach((ev)=>{
                    if(ev.id == this.formFilter['commission_type']){
                        let obj = {
                            label: 'commission_type',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            this.searchList = _.cloneDeep(_search)
            console.log('this.searchList', this.searchList)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter,item.label, '');
            this.handleFilter();
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
