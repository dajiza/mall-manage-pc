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
                        <el-form-item label="批发折扣" prop="discount_id">
                            <el-select class="filter-item" v-model="formFilter.discount_id" placeholder="请选择" filterable>
                                <el-option v-for="item in discountList" :key="item.id" :label="item.discount" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="到期时间" prop="searchTime" class="long-time">
                            <el-date-picker
                                class="filter-item"
                                v-model="formFilter.searchTime"
                                type="datetimerange"
                                range-separator="至"
                                align="left"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :default-time="['00:00:00', '23:59:59']"
                                :picker-options="pickerOptionsSearch"
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
                    <span>{{ showMaxIndex }}</span>
                    <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                </div>
            </div>
        </div>
        <el-button @click="addSku">addSku</el-button>
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
            <el-table-column label="客户微信昵称" min-width="110">
                <template slot-scope="scope">
                    <span>{{ scope.row.nick_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="客户微信头像">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.avatar_url || avatar" alt="" />
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
            <el-table-column label="首次登录时间" width="200">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.first_login_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="上次登录时间" width="200">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.last_login_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="批发折扣" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.discount_value ? commUtil.numberMul(Number(scope.row.discount_value), 10) + '折' : '' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="批发时间" width="120">
                <template slot-scope="scope" v-if="scope.row.discount_end_at">
                    <span>{{ $moment(scope.row.discount_start_at).format('YYYY-MM-DD') }}至{{ $moment(scope.row.discount_end_at).format('YYYY-MM-DD') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="160">
                <template slot-scope="scope">
                    <el-button class="text-blud opt-btn" type="text" size="small" v-hasPermission="'mall-backend-user-discount-update'" @click="setMember(scope.row)"
                        >{{ scope.row.discount_end_at ? '修改' : '设置' }}批发</el-button
                    >
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

        <!-- 设置会员 -->
        <el-dialog :visible.sync="dialogVisibleMember" title="设置折扣" width="360px">
            <el-form ref="formMember" :model="formMember" class="form-member" :inline="true" :rules="rulesMember" size="small" label-position="left">
                <el-form-item label="批发折扣" prop="discount_id" class="">
                    <el-select class="filter-item" v-model="formMember.discount_id" placeholder="请选择" filterable style="width:220px">
                        <el-option v-for="item in discountList" :key="item.id" :label="item.discount" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="到期时间" prop="discount_end_at" class="">
                    <el-date-picker
                        v-model="formMember.discount_end_at"
                        value-format="yyyy-MM-dd"
                        align="right"
                        type="date"
                        placeholder="选择日期"
                        :picker-options="pickerOptions"
                        style="width:220px"
                    >
                    </el-date-picker>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="endMember" v-if="this.isEdit">结束合作</el-button>
                <el-button @click="dialogVisibleMember = false" v-else>取 消</el-button>
                <el-button type="primary" @click="updateMember">{{ this.isEdit ? '保存修改' : '确 定' }}</el-button>
            </span>
        </el-dialog>
        <!-- 商品添加 -->
        <goods-discount-list ref="productList" @add-success="getList"></goods-discount-list>
    </div>
</template>
<script lang="ts">
import { queryDiscountList, updateUserDiscount } from '@/api/discount'
import { queryCustomerList } from '@/api/customer'
import { formatMoney } from '@/plugin/tool'
import { queryShopList } from '@/api/goods'
import commUtil from '@/utils/commUtil'
import goodsDiscountList from '@/components/common/goods-discount-list/GoodsDiscountList.vue'

import { Component, Vue } from 'vue-property-decorator'
import { ElForm } from 'element-ui-chuanshui/types/form'

export default Vue.extend({
    name: 'customer-list',
    data() {
        return {
            commUtil,
            avatar: require('@/assets/img/wx.jpeg'),
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
                phone: '', ////不搜索 为空
                discount_id: '', //折扣id 不搜索 <=0
                searchTime: '', //到期时间 暂存
                discount_end_start: '', //不搜索为空
                discount_end_end: '' // 不搜索为空
            },
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            // 设置会员弹框
            dialogVisibleMember: false,
            discountList: '',
            isEdit: '', //弹框状态 true编辑 false新建
            formMember: {
                user_id: '',
                discount_id: '', // 折扣id
                discount_end_at: '' // 到期时间
            },
            rulesMember: {
                discount_id: [{ required: true, message: '请选择折扣', trigger: 'blur' }],
                discount_end_at: [{ required: true, message: '请选择时间', trigger: 'blur' }]
            },
            // 搜索-到期时间-时间区间
            pickerOptionsSearch: {
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
            // 新建-到期时间-单选日期
            pickerOptions: {
                disabledDate(time) {
                    const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                    return time.getTime() < start
                },
                shortcuts: [
                    {
                        text: '一个月后',
                        onClick(picker) {
                            const date = new Date()
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', date)
                        }
                    },
                    {
                        text: '半年后',
                        onClick(picker) {
                            const date = new Date()
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 30 * 6)
                            picker.$emit('pick', date)
                        }
                    },
                    {
                        text: '一年后',
                        onClick(picker) {
                            const date = new Date()
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 365)
                            picker.$emit('pick', date)
                        }
                    }
                ]
            }
        }
    },
    components: {
        goodsDiscountList
    },
    watch: {
        searchList: function() {
            this.$nextTick(
                function(): void {
                    if (!(this.$refs.searchValueBox as ElForm)) {
                        return
                    }
                    let maxWidth: number = (window.getComputedStyle(this.$refs.searchValueBox).width.replace('px', '') as any) - 20
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
        this.queryDiscountList()
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        addSku() {
            this.$refs.productList.show()
        },
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            if (!params['discount_id']) {
                params['discount_id'] = 0
            }
            if (params['searchTime'] && params['searchTime'].length == 2) {
                params['discount_end_start'] = this.$moment(params.searchTime[0]).format('YYYY-MM-DD')
                params['discount_end_end'] = this.$moment(params.searchTime[1]).format('YYYY-MM-DD')
            } else {
                params['discount_end_start'] = ''
                params['discount_end_end'] = ''
            }
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
        // 获取折扣列表
        queryDiscountList() {
            queryDiscountList()
                .then(res => {
                    console.log('输出 ~ res', res)
                    this.discountList = res.data.list.map(item => {
                        item.discount = commUtil.numberMul(Number(item.discount_value), 10) + '折'
                        return item
                    })
                })
                .catch(err => {})
        },
        closeDialog() {
            this.formMember = {
                user_id: '',
                discount_id: '', // 折扣id
                discount_end_at: '' // 到期时间
            }
            this.dialogVisibleMember = false
        },
        // 设置会员
        setMember(row) {
            console.log('输出 ~ row', row)
            this.isEdit = row.discount_id ? true : false
            this.formMember.user_id = row.user_id
            this.formMember.discount_id = row.discount_id || ''
            this.formMember.discount_end_at = row.discount_end_at || null
            this.dialogVisibleMember = true
        },
        // 结束合作
        endMember() {
            let params = {
                type: 2, // 1.设置 2.删除
                user_id: this.formMember.user_id
            }
            updateUserDiscount(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '结束合作成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.closeDialog()
                        this.getList()
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 5000
                        })
                    }
                })
                .catch(err => {})
        },
        // 设置折扣
        updateMember() {
            this.$refs['formMember'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    let params = {
                        type: 1, // 1.设置 2.删除
                        user_id: this.formMember.user_id,
                        discount_id: this.formMember.discount_id, // 折扣id
                        discount_end_at: this.$moment(this.formMember.discount_end_at)
                            .set({ hour: 23, minute: 59, second: 59 })
                            .format('YYYY-MM-DD') // 到期时间
                    }
                    updateUserDiscount(params)
                        .then(res => {
                            console.log('GOOGLE: res', res)
                            if (res.code == 200) {
                                this.$notify({
                                    title: '批发设置成功',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.closeDialog()
                                this.getList()
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
                } else {
                    this.$notify({
                        title: '请选择后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
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
            this.searchShow = false
            this.setSearchValue()
            this.getList()
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
            let _search = []
            console.log('this.formFilter', this.formFilter)
            // 所属店铺 shop_id
            if (this.formFilter['shop_id']) {
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

            // 客户微信昵称 nick_name
            if (this.formFilter['nick_name']) {
                let obj = {
                    label: 'nick_name',
                    val: this.formFilter['nick_name']
                }
                _search.push(obj)
            }
            // 客户手机号 phone
            if (this.formFilter['phone']) {
                let obj = {
                    label: 'phone',
                    val: this.formFilter['phone']
                }
                _search.push(obj)
            }

            // 累计消费 consumption_min
            if (this.formFilter['consumption_min'] || this.formFilter['consumption_max']) {
                let obj = {}
                if (this.formFilter['consumption_min'] && this.formFilter['consumption_max']) {
                    obj = {
                        label: 'consumption_count',
                        val: this.formFilter['consumption_min'] + ' - ' + this.formFilter['consumption_max']
                    }
                }
                if (this.formFilter['consumption_min'] && !this.formFilter['consumption_max']) {
                    obj = {
                        label: 'consumption_count',
                        val: this.formFilter['consumption_min']
                    }
                }
                if (!this.formFilter['consumption_min'] && this.formFilter['consumption_max']) {
                    obj = {
                        label: 'consumption_count',
                        val: this.formFilter['consumption_max']
                    }
                }
                _search.push(obj)
            }
            // 会员折扣
            if (this.formFilter['discount_id']) {
                this.discountList.forEach(ev => {
                    if (ev.id == this.formFilter['discount_id']) {
                        let obj = {
                            label: 'discount_id',
                            val: commUtil.numberMul(Number(ev.discount_value), 10) + '折'
                        }
                        _search.push(obj)
                    }
                })
            }
            // 时间区间
            if (this.formFilter['searchTime'] && this.formFilter['searchTime'].length === 2) {
                let _ge_arr = this.$moment(this.formFilter.searchTime[0])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _le_arr = this.$moment(this.formFilter.searchTime[1])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _ge = _ge_arr[1] + '.' + _ge_arr[2]
                let _le = _le_arr[1] + '.' + _le_arr[2]
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
            this.$set(this.formFilter, item.label, '')
            if (item.label == 'consumption_count') {
                this.$set(this.formFilter, 'consumption_min', '')
                this.$set(this.formFilter, 'consumption_max', '')
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
})
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
