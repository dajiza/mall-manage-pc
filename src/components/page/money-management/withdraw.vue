<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">提现审核列表</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
                        <el-form-item label="店铺名称" prop="shop_id">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="昵称" prop="shop_admin_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.shop_admin_name"></el-input>
                        </el-form-item>
                        <el-form-item label="管理员手机号" prop="shop_admin_phone">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.shop_admin_phone"></el-input>
                        </el-form-item>
                        <el-form-item label="提现类型" prop="out_model">
                            <el-select class="filter-item" v-model="formFilter.out_model" placeholder="请选择">
                                <el-option v-for="item in withdrawTypeOptions" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="long-time" label="申请时间" prop="applyTime">
                            <el-date-picker
                                    class="filter-item"
                                    v-model="formFilter.applyTime"
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
            <el-button size="mini" class="title-btn" v-hasPermission="'mall-backend-withdraw-all'" @click="gotoWithdrawListAll">全部提现列表</el-button>
        </div>
        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="操作" width="130">
                <template slot-scope="scope">
                    <div v-hasPermission="'mall-backend-agent-update-status'">
                        <el-button class="text-blue" type="text" size="" v-if="scope.row.status == 1" @click.native="updateStatus(scope.row.id, 1)">
                            通过
                        </el-button>
                        <el-button class="text-red" type="text" size="" v-if="scope.row.status == 1" @click.native="updateStatus(scope.row.id, 2)">
                            拒绝
                        </el-button>
                    </div>
                </template>
            </el-table-column>
            <!--1 待审核 2 审核通过 3 拒绝 4 放款成功 5 放款失败-->
            <el-table-column label="状态" width="100">
                <template slot-scope="scope">
                    <div class="type-tag type-grey" v-if="scope.row.status == 1">待审核</div>
                    <div class="type-tag type-green" v-if="scope.row.status == 2">审核通过</div>
                    <div class="type-tag type-yellow" v-if="scope.row.status == 3">拒绝</div>
                    <div class="type-tag type-green" v-if="scope.row.status == 4">放款成功</div>
                    <div class="type-tag type-yellow" v-if="scope.row.status == 5">放款失败</div>
                </template>
            </el-table-column>
            <el-table-column label="提现类型" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.out_model == 1? '管理员提现':'普通用户提现'}}</span>
                </template>
            </el-table-column>
            <el-table-column label="昵称" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_admin_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="管理员手机号" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_admin_phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺名称" min-width="150">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="申请提现金额" width="120">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.money) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="申请时间" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.apply_time }}</span>
                </template>
            </el-table-column>
            <el-table-column label="提现方式" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.type == 1 ? '微信钱包' : '银行卡' }}</span>
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
import { queryWithdrawList, putWithdrawCheck } from '@/api/money'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import bus from '@/components/common/bus'
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
                shop_id: '', //不搜索-1
                shop_admin_name: '', //不搜索为空
                shop_admin_phone: '', //不搜索为空
                applyTime: [], //暂存
                apply_time_lte: '', //不搜索为空
                apply_time_gte: '', //不搜索为空
                out_model: ''
            },
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
            withdrawTypeOptions: [
                {id: 1, label: '管理员提现'},
                {id: 2, label: '普通用户提现'}
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
            if (params.applyTime.length == 2) {
                params['apply_time_gte'] = params.applyTime[0]
                params['apply_time_lte'] = params.applyTime[1]
            } else {
                params['apply_time_gte'] = ''
                params['apply_time_lte'] = ''
            }
            delete params['applyTime']
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            params['status'] = 1 //'1 待审核 2 审核通过 3 拒绝 4 放款成功 5放款失败'
            console.log(params)
            queryWithdrawList(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.lists
                    this.total = res.data.total
                })
                .catch(err => {})
        },
        // 审核
        updateStatus(id, status) {
            let params = {
                id: id,
                status: status //1 通过 2 拒绝
            }
            let title
            let type
            switch (status) {
                case 1:
                    title = '确认通过审核?'
                    type = 'success'
                    break
                case 2:
                    title = '确认拒绝审核?'
                    type = 'warning'
                    break
            }

            this.$confirm(title, '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: type
            })
                .then(() => {
                    putWithdrawCheck(params)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '审核处理完成',
                                    type: 'success',
                                    duration: 5000
                                })
                                this.reload()
                                // 改变侧边栏提示数字
                                bus.$emit('changSidebarCount')
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
        gotoWithdrawListAll() {
            this.$router.push({
                path: 'mall-backend-withdraw-all'
            })
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.searchShow = false;
            this.setSearchValue();
            this.getList()
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields()
            this.handleFilter()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            // 店铺名称 shop_id
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
            // 昵称 shop_admin_name
            if(this.formFilter['shop_admin_name']){
                let obj = {
                    label: 'shop_admin_name',
                    val: this.formFilter['shop_admin_name']
                }
                _search.push(obj)
            }
            // 管理员手机号 shop_admin_phone
            if(this.formFilter['shop_admin_phone']){
                let obj = {
                    label: 'shop_admin_phone',
                    val: this.formFilter['shop_admin_phone']
                }
                _search.push(obj)
            }
            // 提现类型
            if(this.formFilter['out_model']){
                this.withdrawTypeOptions.forEach((ev)=>{
                    if(ev.id == this.formFilter['out_model']){
                        let obj = {
                            label: 'out_model',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // 申请时间 applyTime
            if(this.formFilter['applyTime'] && this.formFilter['applyTime'].length === 2){
                console.log('applyTime', this.formFilter.applyTime);
                console.log('111', this.$moment(this.formFilter.applyTime[0]).format('YYYY-MM-DD '))
                let _ge_arr = (this.$moment(this.formFilter.applyTime[0]).format('YYYY-MM-DD ')).split('-');
                let _le_arr = (this.$moment(this.formFilter.applyTime[1]).format('YYYY-MM-DD ')).split('-');
                //  + ' '+ this.formFilter['created_time_ge'].split(' ')[1]
                let _ge = _ge_arr[1]+ '.' + _ge_arr[2];
                //  + ' '+ this.formFilter['created_time_le'].split(' ')[1]
                let _le = _le_arr[1]+ '.' + _le_arr[2];
                let obj = {
                    label: 'applyTime',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }
            this.searchList = _.cloneDeep(_search)
            console.log('this.searchList', this.searchList)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter,item.label, '');
            if(item.label == 'applyTime'){
                this.$set(this.formFilter, 'applyTime', [])
                this.$set(this.formFilter, 'apply_time_lte', '')
                this.$set(this.formFilter, 'apply_time_gte', '')
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
.title-btn {
    margin-right: 32px;
    margin-left: auto;
}
</style>
