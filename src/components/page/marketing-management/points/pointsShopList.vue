<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">店铺列表</div>
        </div>

        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="logo" width="140">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.avatar_url || avatar" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="店铺名" min-width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>

            <el-table-column label="状态" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <el-button class="text-blud opt-btn" type="text" size="small" @click="setMember(scope.row)">商品管理</el-button>
                    <el-button class="text-blud opt-btn" type="text" size="small" @click="setMember(scope.row)">兑换订单</el-button>
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
import { queryDiscountList, updateUserDiscount } from '@/api/discount'
import { queryCustomerList } from '@/api/customer'
import { formatMoney } from '@/plugin/tool'
import { queryShopList } from '@/api/goods'
import commUtil from '@/utils/commUtil'
export default {
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
            }
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
                                    title: '会员设置成功',
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
