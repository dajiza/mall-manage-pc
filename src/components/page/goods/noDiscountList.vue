<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">不享折扣商品</div>
            <!-- <div class="grey-line"></div> -->
            <!-- <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i> -->
            <!-- <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
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
            </transition> -->
            <!-- <div class="search-value">
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
            </div> -->
            <el-button class="add-btn" size="" type="primary" @click="addSku">添加商品</el-button>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :height="tableHeight" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="SKU图片" width="120">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.sku_img, 2, scope.row.skuImgIndex)" />
                </template>
            </el-table-column>
            <el-table-column label="SKU名称" min-width="150">
                <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                </template>
            </el-table-column>
            <el-table-column label="SKU编码" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.storehouse_code }}</span>
                </template>
            </el-table-column>
            <el-table-column label="售价(元)" width="90">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.display_price) }}</span>
                </template>
            </el-table-column>

            <el-table-column label="实际销量" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.real_sales }}</span>
                </template>
            </el-table-column>
            <el-table-column label="可售库存" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.stock_available }}</span>
                </template>
            </el-table-column>
            <el-table-column label="总库存" width="80">
                <template slot-scope="scope">
                    <span>{{ scope.row.stock_total }}{{ scope.row.attr_unit }}</span>
                </template>
            </el-table-column>
            <el-table-column label="可用库存" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.stock_available }}{{ scope.row.attr_unit }}</span>
                </template>
            </el-table-column>
            <el-table-column label="是否售罄" width="90">
                <template slot-scope="scope">
                    <div class="type-tag type-yellow" v-if="scope.row.stock_available == 0">售罄</div>
                    <div class="type-tag type-blue" v-else>否</div>
                </template>
            </el-table-column>
            <!-- 折扣值：0正常折扣，1无折扣，(0,1)为其他折扣 -->
            <el-table-column label="会员折扣" width="90">
                <template slot-scope="scope">
                    <span v-if="scope.row.user_discount == 1">否</span>
                    <span v-else-if="scope.row.user_discount == 0">是</span>
                    <span v-else>{{ commUtil.numberMul(Number(scope.row.user_discount), 10) }}折</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button class="text-blue" type="text" size="small" @click.native="setDiscount(scope.row)">设置折扣</el-button>
                    <el-button class="text-red" type="text" size="small" @click.native="moveoutDiscount(scope.row)">移出</el-button>
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

        <!-- 设置折扣 -->
        <el-dialog :visible.sync="dialogVisibleDiscount" title="设置折扣" width="360px" @closed="closeDialogDiscount">
            <el-form label-width="0px">
                <el-form-item label="">
                    <el-radio-group v-model="discountType">
                        <el-radio :label="1">无折扣</el-radio>
                        <el-radio :label="2">有折扣</el-radio>
                    </el-radio-group>
                    <el-input v-model="discountValue" :disabled="discountType == 1" style="width:120px;margin-left:20px;"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="closeDialogDiscount">取 消</el-button>
                <el-button type="primary" @click="updateDiscount">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 商品添加 -->
        <goods-discount-list ref="productList" @add-success="getList"></goods-discount-list>
    </div>
</template>
<script>
import { goodsDiscountlist } from '@/api/goods'
import { updateSkuDiscount } from '@/api/discount'
import { REFUND_TYPE, REFUND_STATUS } from '@/plugin/constant'
import { formatMoney } from '@/plugin/tool'
import commUtil from '@/utils/commUtil'
import goodsDiscountList from '@/components/common/goods-discount-list/GoodsDiscountList'

export default {
    data() {
        return {
            commUtil,
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

            // formFilter: {
            //     type: '', //不检索传“”
            //     status: '',
            //     statusCache: '10',
            //     order_no: '',
            //     order_detail_no: '',
            //     reason_id: '',
            //     createdTime: '',
            //     created_time_le: '',
            //     created_time_ge: ''
            // },
            orderType: '', //订单筛选
            totalProcessed: 0, //待处理数量
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            // 折扣弹框
            dialogVisibleDiscount: false,
            discountType: 1, //1.无折扣 2.有折扣 折扣值为0时为移出
            discountId: '', //设置折扣的id
            discountValue: ''
        }
    },
    components: {
        goodsDiscountList
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
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = {}

            params['page_size'] = this.listQuery.limit
            params['page_index'] = this.listQuery.page
            params['type'] = 1 //// 1.无折扣 2.有折扣

            console.log('params', params)
            goodsDiscountlist(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.list
                    this.total = res.data.total
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
        addSku() {
            this.$refs.productList.show()
        },
        // 设置折扣
        setDiscount(row) {
            console.log('输出 ~ row', row)
            this.discountId = row.id
            this.discountType = row.user_discount == 1 ? 1 : 2
            this.discountValue = row.user_discount == 1 ? '' : commUtil.numberMul(Number(row.user_discount), 10)
            this.openDialogDiscount()
        },
        // 移出
        moveoutDiscount(row) {
            this.$confirm('确认移出该商品', '', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        type: 2,
                        goods_sku_id: row.id,
                        value: 0 // type为1 该字段可以忽略
                    }
                    updateSkuDiscount(params)
                        .then(res => {
                            console.log('GOOGLE: res', res)
                            if (res.code == 200) {
                                this.$notify({
                                    title: '移出成功',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.closeDialogDiscount()
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
                })
                .catch(() => {})
        },
        // 保存折扣
        updateDiscount() {
            if (this.discountType == 2) {
                // 正则 0-10 最多两位小数
                var pattern = /^(?!0(\.0{1,2})?$)(\d(\.\d{1,2})?)$/
                let verify = pattern.test(this.discountValue)
                if (!verify) {
                    this.$notify({
                        title: '请输入正确折扣',
                        type: 'warning',
                        duration: 5000
                    })
                    return
                }
            }
            let params = {
                type: this.discountType,
                goods_sku_id: this.discountId,
                value: Number(this.discountValue) // type为1 该字段可以忽略
            }
            updateSkuDiscount(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '折扣设置成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.closeDialogDiscount()
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
        // setSearchValue() {
        //     let _search = []
        //     // 订单号
        //     if (this.formFilter['order_no']) {
        //         let obj = {
        //             label: 'order_no',
        //             val: this.formFilter['order_no']
        //         }
        //         _search.push(obj)
        //     }
        //     // 子订单号
        //     if (this.formFilter['order_detail_no']) {
        //         let obj = {
        //             label: 'order_detail_no',
        //             val: this.formFilter['order_detail_no']
        //         }
        //         _search.push(obj)
        //     }
        //     // 退款类型
        //     if (this.formFilter['type']) {
        //         this.typeList.forEach(ev => {
        //             if (ev.value == this.formFilter['type']) {
        //                 let obj = {
        //                     label: 'type',
        //                     val: ev.label
        //                 }
        //                 _search.push(obj)
        //             }
        //         })
        //     }

        //     // 退款状态
        //     console.log('退款状态', this.formFilter)
        //     if (this.formFilter['statusCache']) {
        //         this.statusList.forEach(ev => {
        //             if (ev.value == this.formFilter['statusCache']) {
        //                 let obj = {
        //                     label: 'statusCache',
        //                     val: ev.label
        //                 }
        //                 _search.push(obj)
        //             }
        //         })
        //     }

        //     // 售后原因 reason_id
        //     if (this.formFilter['reason_id']) {
        //         this.reasonList.forEach(ev => {
        //             if (ev.id == this.formFilter['reason_id']) {
        //                 let obj = {
        //                     label: 'reason_id',
        //                     val: ev.name
        //                 }
        //                 _search.push(obj)
        //             }
        //         })
        //     }

        //     // 申请时间 createdTime
        //     if (this.formFilter['createdTime'] && this.formFilter['createdTime'].length === 2) {
        //         let _ge_arr = this.$moment(this.formFilter.createdTime[0])
        //             .format('YYYY-MM-DD ')
        //             .split('-')
        //         let _le_arr = this.$moment(this.formFilter.createdTime[1])
        //             .format('YYYY-MM-DD ')
        //             .split('-')
        //         let _ge = _ge_arr[1] + '.' + _ge_arr[2]
        //         let _le = _le_arr[1] + '.' + _le_arr[2]
        //         let obj = {
        //             label: 'createdTime',
        //             val: _ge + ' - ' + _le
        //         }
        //         _search.push(obj)
        //     }
        //     console.log('_search', _search)
        //     this.searchList = _.cloneDeep(_search)
        // },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter, item.label, '')
            if (item.label == 'createdTime') {
                this.$set(this.formFilter, 'created_time_ge', '')
                this.$set(this.formFilter, 'created_time_le', '')
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
        // 关闭弹窗
        closeDialogDiscount() {
            this.discountType = 1
            this.discountValue = ''
            this.dialogVisibleDiscount = false
        },
        // 打开弹窗
        openDialogDiscount() {
            this.dialogVisibleDiscount = true
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
    padding: 0 11px;
    min-width: 50px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    text-align: center;
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
.add-btn {
    margin: 0 30px 0 auto;
}
.timg {
    width: 80px;
    height: 60px;
}
</style>
