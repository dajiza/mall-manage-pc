<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">客户管理</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="所属店铺" prop="shop_id">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="客户微信昵称" prop="nick_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.nick_name"></el-input>
                        </el-form-item>
                        <el-form-item label="客户手机号" prop="phone">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.phone"></el-input>
                        </el-form-item>
                        <el-form-item class="interval" label="累计消费">
                            <el-input class="filter-item" placeholder="累计下限" v-model="formFilter.consumption_min"></el-input>
                            <div class="separator">-</div>
                            <el-input class="filter-item" placeholder="累计上限" v-model="formFilter.consumption_max"></el-input>
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
                    <span>{{showMaxIndex}}</span>
                    <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                </div>
            </div>
        </div>

        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="序号" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.user_id }}</span>
                </template>
            </el-table-column>
            <el-table-column label="所属店铺">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户微信昵称">
                <template slot-scope="scope">
                    <span>{{ scope.row.nick_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户微信头像">
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
                    <span>{{ $moment(scope.row.first_login_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="上次登录时间" width="200"
                >>
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.last_login_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
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
import { queryCustomerList } from '@/api/customer'
import { formatMoney } from '@/plugin/tool'
import { queryShopList } from '@/api/goods'
import commUtil from '@/utils/commUtil'
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
            },
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
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
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['consumption_min'] = params['consumption_min'] == '' ? -1 : commUtil.numberMul(Number(params['consumption_min']), 100)
            params['consumption_max'] = params['consumption_max'] == '' ? -1 : commUtil.numberMul(Number(params['consumption_max']), 100)
            params['shop_id'] = params['shop_id'] == '' ? -1 : params['shop_id']

            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryCustomerList(params)
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
            this.$refs[formName].resetFields()
            this.formFilter.consumption_min = ''
            this.formFilter.consumption_max = ''
            this.handleFilter()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            console.log('this.formFilter', this.formFilter);
            // 所属店铺 shop_id
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

            // 客户微信昵称 nick_name
            if(this.formFilter['nick_name']){
                let obj = {
                    label: 'nick_name',
                    val: this.formFilter['nick_name']
                }
                _search.push(obj)
            }
            // 客户手机号 phone
            if(this.formFilter['phone']){
                let obj = {
                    label: 'phone',
                    val: this.formFilter['phone']
                }
                _search.push(obj)
            }

            // 累计消费 consumption_min
            if(this.formFilter['consumption_min'] || this.formFilter['consumption_max']){
                let obj = {}
                if(this.formFilter['consumption_min'] && this.formFilter['consumption_max']){
                    obj = {
                        label: 'consumption_count',
                        val: this.formFilter['consumption_min'] + ' - ' + this.formFilter['consumption_max']
                    }
                }
                if(this.formFilter['consumption_min'] && !this.formFilter['consumption_max']){
                    obj = {
                        label: 'consumption_count',
                        val: this.formFilter['consumption_min']
                    }
                }
                if(!this.formFilter['consumption_min'] && this.formFilter['consumption_max']){
                    obj = {
                        label: 'consumption_count',
                        val: this.formFilter['consumption_max']
                    }
                }
                _search.push(obj)
            }
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter,item.label, '');
            if(item.label == 'consumption_count'){
                this.$set(this.formFilter, 'consumption_min', '');
                this.$set(this.formFilter, 'consumption_max', '');
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
        }
    }
}
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
