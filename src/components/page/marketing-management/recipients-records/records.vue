<template>
    <div class="order-list-container" id="containerWrap"  @click.stop="searchShow = false">
        <div class="container container-table-has-search p-t-0 pos-relative">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">领用记录</div>
                <div class="grey-line"></div>
                <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                <transition name="slide-fade">
                    <div class="container clearfix head-container" ref="searchBox" v-show="searchShow" @click.stop="">
                        <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left">
                            <el-form-item label="优惠券名称" prop="coupon_title" class="">
                                <el-input class="filter-item" v-model="searchForm.coupon_title" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="用户微信名" prop="nick_name" class="">
                                <el-input class="filter-item" v-model="searchForm.nick_name" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="用户手机号" prop="phone" class="">
                                <el-input class="filter-item" v-model="searchForm.phone" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="优惠券状态" prop="status" class="">
                                <el-select class="filter-item" v-model="searchForm.status" placeholder="请选择" clearable>
                                    <el-option v-for="state in statusOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="店铺" prop="shop_id">
                                <el-select class="filter-item" v-model="searchForm.shop_id" placeholder="请选择" filterable>
                                    <el-option v-for="item in shopOptions" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="领用时间" prop="searchTime" class="long-time">
                                <el-date-picker
                                        class="filter-item"
                                        v-model="searchForm.searchTime"
                                        type="datetimerange"
                                        range-separator="至"
                                        align="left"
                                        start-placeholder="开始时间"
                                        end-placeholder="结束时间"
                                        :default-time="['00:00:00', '23:59:59']"
                                        :picker-options="pickerOptions"
                                >
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item class="form-item-btn" label="">
                                <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                                <el-button class="filter-btn" type="primary" @click="handleSearch('searchForm')">搜索</el-button>
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
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column prop="coupon_title" label="优惠券名称"></el-table-column>
                <el-table-column prop="nick_name" label="用户微信名" width="110"></el-table-column>
                <el-table-column prop="phone" label="用户手机号" width="110"></el-table-column>
                <el-table-column prop="shop_name" label="所属店铺"></el-table-column>
                <el-table-column prop="order_no" label="获取途径" width="110">
                    <template slot-scope="scope">{{ scope.row.source > 1 ? '前台发放' : '后台excel导入' }}</template>
                </el-table-column>
                <el-table-column prop="get_time" label="领取时间" width="168"></el-table-column>
                <el-table-column prop="use_time" label="使用时间" width="168"></el-table-column>
                <el-table-column prop="price_total_detail_end" label="状态" width="80">
                    <template slot-scope="scope">{{ scope.row.status > 1 ? '已使用' : '未使用' }}</template>
                </el-table-column>
                <el-table-column prop="order_no" label="订单号" width="155">
                    <template slot-scope="scope">{{ scope.row.order_no ? scope.row.order_no : '' }}</template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { couponSendUserRecord } from '../../../../api/coupons'
import { queryShopList } from '@/api/goods'

import EmptyList from '../../../common/empty-list/EmptyList'
import './records.less'
export default {
    name: 'OrderList',
    data() {
        return {
            shopOptions: [],
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            loading: false,
            tableData: [],
            pageTotal: 0, // 总条数
            id: -1,
            channelOptions: [], // 购买渠道下拉列表
            statusOptions: [], // 状态下拉
            shopOptions: [], // 代理店铺下拉列表
            searchForm: {
                coupon_title: '', // 优惠券名称
                nick_name: '', // 铜壶微信名
                status: '', // 优惠券状态
                phone: '', // 用户手机号
                shop_id: '',
                searchTime: null
            },
            searchParams: {
                coupon_title: '', // 优惠券名称
                nick_name: '', // 微信名
                status: '', // 优惠券状态
                phone: '', // 用户手机号
                shop_id: '',
                searchTime: null
            },
            tableHeight: 'calc(100vh - 194px)',
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
        }
    },
    components: {
        EmptyList
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
    computed: {},
    created() {
        // 状态 下拉列表
        this.statusOptions = [
            { id: 2, name: '已使用' },
            { id: 1, name: '未使用' }
        ]
    },
    mounted() {
        // 获取列表数据
        this.getListData()
        this.queryShopList()
    },
    methods: {
        // 请求-获取订单列表数据
        getListData() {
            console.log('输出 ~ this.searchParams', this.searchForm)

            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                coupon_id: -1,
                coupon_title: this.searchParams.coupon_title ? this.searchParams.coupon_title : '',
                nick_name: this.searchParams.nick_name ? this.searchParams.nick_name : '',
                phone: this.searchParams.phone ? this.searchParams.phone : '',
                status: this.searchParams.status > 0 ? this.searchParams.status : -1,
                shop_id: this.searchParams.shop_id ? this.searchParams.shop_id : -1,
                get_time_let: this.searchParams.searchTime ? Number(this.$moment(this.searchParams.searchTime[0]).format('X')) : -1,
                get_time_gte: this.searchParams.searchTime ? Number(this.$moment(this.searchParams.searchTime[1]).format('X')) : -1
            }
            const rLoading = this.openLoading()
            couponSendUserRecord(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists
                            this.pageTotal = res.data.total
                        } else {
                            this.tableData = []
                            this.pageTotal = 0
                        }
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {})
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopOptions = res.data || []
                })
                .catch(err => {})
        },
        // 按钮 - 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.$set(this.searchParams, 'coupon_title', '')
            this.$set(this.searchParams, 'status', '')
            this.$set(this.searchParams, 'nick_name', '')
            this.$set(this.searchParams, 'phone', '')
            this.$set(this.searchParams, 'shop_id', '')
            this.$set(this.searchParams, 'searchTime', null)
            this.$set(this.searchForm, 'searchTime', null)
            this.searchShow = false;
            this.setSearchValue();
            this.getListData()
        },

        // 按钮-触发搜索按钮
        handleSearch(formName) {
            this.$set(this.pageInfo, 'pageIndex', 1)
            //  存储搜索条件
            this.$set(this.searchParams, 'coupon_title', this.searchForm.coupon_title)
            this.$set(this.searchParams, 'status', this.searchForm.status)
            this.$set(this.searchParams, 'nick_name', this.searchForm.nick_name)
            this.$set(this.searchParams, 'phone', this.searchForm.phone)
            this.$set(this.searchParams, 'shop_id', this.searchForm.shop_id)
            this.$set(this.searchParams, 'searchTime', this.searchForm.searchTime)
            this.searchShow = false;
            this.setSearchValue();
            this.getListData()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            // console.log('status', this.searchParams['status'])
            // console.log('this.searchParams', this.searchParams);
            // 优惠券名称 coupon_title
            if(this.searchParams['coupon_title']){
                let obj = {
                    label: 'coupon_title',
                    val: this.searchParams['coupon_title']
                }
                _search.push(obj)
            }
            // 用户微信 nick_name
            if(this.searchParams['nick_name']){
                let obj = {
                    label: 'nick_name',
                    val: this.searchParams['nick_name']
                }
                _search.push(obj)
            }
            // 用户手机号 phone
            if(this.searchParams['phone']){
                let obj = {
                    label: 'phone',
                    val: this.searchParams['phone']
                }
                _search.push(obj)
            }

            // 优惠券状态 status
            if(this.searchParams['status']){
                this.statusOptions.forEach((ev)=>{
                    if(ev.id == this.searchParams['status']){
                        let obj = {
                            label: 'status',
                            val: ev.name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 店铺 shop_id
            if(this.searchParams['shop_id']){
                this.shopOptions.forEach((ev)=>{
                    if(ev.id == this.searchParams['shop_id']){
                        let obj = {
                            label: 'shop_id',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 优惠券面额 user_phone
            if(this.searchParams['coupon_amount']){
                let obj = {
                    label: 'coupon_amount',
                    val: this.searchParams['coupon_amount']
                }
                _search.push(obj)
            }
            // 领用时间 searchTime
            if(this.searchParams['searchTime']){
                console.log('searchTime', this.searchParams.searchTime);
                console.log('111', this.$moment(this.searchParams.searchTime[0]).format('YYYY-MM-DD '))
                let _ge_arr = (this.$moment(this.searchParams.searchTime[0]).format('YYYY-MM-DD ')).split('-');
                let _le_arr = (this.$moment(this.searchParams.searchTime[1]).format('YYYY-MM-DD ')).split('-');
                //  + ' '+ this.searchParams['created_time_ge'].split(' ')[1]
                let _ge = _ge_arr[1]+ '.' + _ge_arr[2];
                //  + ' '+ this.searchParams['created_time_le'].split(' ')[1]
                let _le = _le_arr[1]+ '.' + _le_arr[2];
                let obj = {
                    label: 'searchTime',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.searchForm,item.label, '');
            this.$set(this.searchParams,item.label, '');
            if(item.label == 'searchTime'){
                this.$set(this.searchParams, 'searchTime', null)
                this.$set(this.searchForm, 'searchTime', null)
            }
            this.handleSearch()
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val)
            if (this.searchParams['status'] > 0) {
                this.$set(this.searchForm, 'status', this.searchParams['status'])
            }
            if (this.searchParams['coupon_title']) {
                this.$set(this.searchForm, 'name', this.searchParams['coupon_title'])
            }
            if (this.searchParams['nick_name']) {
                this.$set(this.searchForm, 'nick_name', this.searchParams['nick_name'])
            }
            if (this.searchParams['phone']) {
                this.$set(this.searchForm, 'phone', this.searchParams['phone'])
            }
            if (this.searchParams['shop_id']) {
                this.$set(this.searchForm, 'shop_id', this.searchParams['shop_id'])
            }
            if (this.searchParams['searchTime']) {
                this.$set(this.searchForm, 'searchTime', this.searchParams['searchTime'])
            }
            this.getListData()
        }
    }
}
</script>
