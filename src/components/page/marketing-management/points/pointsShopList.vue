<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">店铺列表</div>
        </div>

        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="logo" width="140">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.shopIcon || avatar" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="店铺名" min-width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.shopName }}</span>
                </template>
            </el-table-column>

            <el-table-column label="状态" width="140">
                <template slot-scope="scope">
                    <span>{{ scope.row.status == 1 ? '启用' : '未启用' }}</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <el-button class="text-blud opt-btn" type="text" size="small" @click="gotoGoodsAdmin(scope.row)">商品管理</el-button>
                    <el-button class="text-blud opt-btn" type="text" size="small" v-has-permission="'mall-backend-redeem-order'" @click="handleRedeemOrder(scope.row)">
                        兑换订单
                        <span class="num">{{ scope.row.redeemQty }}</span>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- <div class="pagination-container">
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
        </div> -->
    </div>
</template>
<script>
import { queryPointsShopList } from '@/api/points'
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
            list: [
                {
                    shopId: 0,
                    shopName: '店铺名',
                    shopIcon: 'https://www.w3school.com.cn/i/eg_tulip.jpg',
                    status: 1, // 1使用中 2停止使用
                    redeemQty: 2 // 兑换数
                }
            ],
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
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            queryPointsShopList()
                .then(res => {
                    console.log('GOOGLE: res', res)
                    // this.list = res.data.lists
                })
                .catch(err => {})
        },

        // 商品管理
        gotoGoodsAdmin(row) {
            this.$router.push({
                path: '/mall-backend-page-points-goods-list',
                query: {
                    shopId: row.shopId || 1
                }
            })
        },
        // 兑换订单
        gotoOrder(row) {},

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
        },
        // 兑换订单
        handleRedeemOrder(row) {
            const _id = row.id
            console.log('_id', _id)
            this.$router.push({ path: '/mall-backend-page-points-order?shopId=' + _id })
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

.num {
    padding: 0 5px;
    height: 16px;
    background: #ff4d4f;
    border-radius: 8px;
    position: absolute;
    font-size: 13px;
    font-weight: 400;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    left: 135px;
    top: 12px;
}
</style>
