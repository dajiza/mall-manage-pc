<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">售后申请列表</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="订单号" prop="order_no">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.order_no"></el-input>
                        </el-form-item>
                        <el-form-item label="子订单号" prop="order_detail_no">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.order_detail_no"></el-input>
                        </el-form-item>
                        <el-form-item label="退款类型" prop="type">
                            <el-select class="filter-item" v-model="formFilter.type" placeholder="请选择" @change="onChangeType">
                                <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="退款状态" prop="statusCache">
                            <el-select class="filter-item" v-model="formFilter.statusCache" placeholder="请选择">
                                <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="售后原因" prop="reason_id">
                            <el-select class="filter-item" v-model="formFilter.reason_id" placeholder="请选择">
                                <el-option v-for="item in reasonList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
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
            <el-radio-group v-model="formFilter.statusCache" class="tab-way" @change="onTabClick">
                <el-radio-button label="10">全部</el-radio-button>
                <el-radio-button label="11">待处理({{ totalProcessed }})</el-radio-button>
            </el-radio-group>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :height="tableHeight" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="操作" width="">
                <template slot-scope="scope">
                    <div v-hasPermission="'mall-backend-after-sale-audit'">
                        <el-button class="text-red" type="text" size="" v-if="scope.row.status == 0" @click.native="gotoDetail(scope.row.id, scope.row.order_id)">审核</el-button>
                    </div>
                    <div v-hasPermission="'mall-backend-afterSaleDetail'">
                        <el-button
                            class="text-blue"
                            type="text"
                            size=""
                            v-if="scope.row.status == 2 || scope.row.status == 4 || scope.row.status == 7 || scope.row.status == 8 || scope.row.status == 9"
                            @click.native="gotoDetail(scope.row.id, scope.row.order_id)"
                            >详情</el-button
                        >
                    </div>
                    <div v-hasPermission="'mall-backend-after-sale-process'">
                        <el-button
                            class="text-yellow"
                            type="text"
                            size=""
                            v-if="scope.row.status == 1 || scope.row.status == 5 || scope.row.status == 6"
                            @click.native="gotoDetail(scope.row.id, scope.row.order_id)"
                            >处理</el-button
                        >
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="订单号" width="">
                <template slot-scope="scope">
                    <span>{{ scope.row.order_no }}</span>
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
                    <div class="type-tag type-red" v-if="scope.row.type == 3">{{ REFUND_TYPE[scope.row.type] }}</div>
                    <div class="type-tag type-red" v-if="scope.row.type == 4">{{ REFUND_TYPE[scope.row.type] }}</div>
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
                :page-size="listQuery.limit"
                layout="total, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </div>
    </div>
</template>
<script>
import { queryAfterSaleList, queryReasonList } from '@/api/afterSale'
import { REFUND_TYPE, REFUND_STATUS } from '@/plugin/constant'
import { formatMoney } from '@/plugin/tool'

export default {
    data() {
        return {
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
                { value: '2', label: '换货' },
                { value: '3', label: '部分退款' },
                { value: '4', label: '退运费' }
                // { value: '3', label: '后台关闭' }
            ],
            statusList: [
                { value: '10', label: '全部' },
                { value: '0', label: '待审核' },
                { value: '1', label: '待打款' },
                { value: '2', label: '已拒绝' },
                { value: '3', label: '撤销' },
                { value: '4', label: '等待买家退货' },
                { value: '5', label: '买家已退货' },
                { value: '6', label: '商家待发货' },
                { value: '7', label: '已打款' },
                { value: '8', label: '拒绝打款' },
                { value: '9', label: '商家已重新发货' },
                { value: '11', label: '待处理' }
            ],
            reasonList: [],

            formFilter: {
                type: '', //不检索传“”
                status: '',
                statusCache: '10',
                order_no: '',
                order_detail_no: '',
                reason_id: '',
                createdTime: '',
                created_time_le: '',
                created_time_ge: ''
            },
            orderType: '', //订单筛选
            totalProcessed: 0, //待处理数量
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
        let status = this.$route.query.status ? this.$route.query.status : '0'
        this.$set(this.formFilter, 'statusCache', status)
        this.setSearchValue();
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = this.$refs['formFilter'].model
            if (params.createdTime.length == 2) {
                params['created_time_ge'] = params.createdTime[0]
                params['created_time_le'] = params.createdTime[1]
            } else {
                params['created_time_ge'] = ''
                params['created_time_le'] = ''
            }
            if (params.statusCache == 10) {
                params.status_in = []
            } else if (params.statusCache == 11) {
                params.status_in = [0, 1, 6]
            } else {
                params.status_in = [Number(params.statusCache)]
            }
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log('params', params)
            queryAfterSaleList(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.lists
                    this.total = res.data.total
                })
                .catch(err => {})
            this.getProcessedNum()
        },
        // 获取待处理数量
        getProcessedNum() {
            let params = {
                status_in: [0, 1, 6],
                page: 1,
                limit: 1
            }
            console.log(params)
            queryAfterSaleList(params)
                .then(res => {
                    this.totalProcessed = res.data.total
                })
                .catch(err => {})
        },
        onChangeType(event) {
            this.getReasonList(event)
            this.formFilter.reason_id = ''
        },
        // 筛选处原因列表
        getReasonList(type) {
            let params = {
                // 0仅退款理由 1退货理由 2换货理由 3后台关闭理由 4拒绝售后理由 5修改订单金额理由 6修改邮费理由
                type: Number(type)
            }
            queryReasonList(params)
                .then(res => {
                    console.log('GOOGLE: getReasonListgetReasonList', res)
                    this.reasonList = res.data.map(item => {
                        return {
                            id: item.id.toString(),
                            name: item.name,
                            type: item.type
                        }
                    })
                    console.log('GOOGLE: res', res)
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
            this.searchShow = false;
            this.setSearchValue();
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleFilter()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            // 订单号
            if(this.formFilter['order_no']){
                let obj = {
                    label: 'order_no',
                    val: this.formFilter['order_no']
                }
                _search.push(obj)
            }
            // 子订单号
            if(this.formFilter['order_detail_no']){
                let obj = {
                    label: 'order_detail_no',
                    val: this.formFilter['order_detail_no']
                }
                _search.push(obj)
            }
            // 退款类型
            if(this.formFilter['type']){
                this.typeList.forEach((ev)=>{
                    if(ev.value == this.formFilter['type']){
                        let obj = {
                            label: 'type',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }

            // 退款状态
            console.log('退款状态', this.formFilter)
            if(this.formFilter['statusCache']){
                this.statusList.forEach((ev)=>{
                    if(ev.value == this.formFilter['statusCache']){
                        let obj = {
                            label: 'statusCache',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }

            // 售后原因 reason_id
            if(this.formFilter['reason_id']){
                this.reasonList.forEach((ev)=>{
                    if(ev.id == this.formFilter['reason_id']){
                        let obj = {
                            label: 'reason_id',
                            val: ev.name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 申请时间 createdTime
            if(this.formFilter['createdTime'] && this.formFilter['createdTime'].length === 2){
                let _ge_arr = (this.$moment(this.formFilter.createdTime[0]).format('YYYY-MM-DD ')).split('-');
                let _le_arr = (this.$moment(this.formFilter.createdTime[1]).format('YYYY-MM-DD ')).split('-');
                let _ge = _ge_arr[1]+ '.' + _ge_arr[2];
                let _le = _le_arr[1]+ '.' + _le_arr[2];
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
            this.$set(this.formFilter,item.label, '');
            if(item.label == 'createdTime'){
                this.$set(this.formFilter, 'created_time_ge', '');
                this.$set(this.formFilter, 'created_time_le', '');
            }
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
        },
        // tab
        onTabClick() {
            this.setSearchValue();
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
