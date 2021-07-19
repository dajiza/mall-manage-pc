<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">其它折扣商品</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
                        <el-form-item label="SKU" prop="sku">
                            <el-input class="filter-item" placeholder="请输入SKU名称或编码" v-model="formFilter.sku"></el-input>
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
            <el-button class="add-btn" size="" type="primary" v-hasPermission="'mall-backend-goods-sku-discount-batch-remove'" @click="addSku">添加商品</el-button>
        </div>
        <div class="batch-operation-box">
            <el-button class="batch-btn" size="" :disabled="checkedSkuIds.length < 1" type="warning" v-hasPermission="'mall-backend-goods-move-out'" @click="handleBatchDel">批量移除</el-button>
            <el-button class="batch-btn" size="" :disabled="checkedSkuIds.length < 1" type="primary" v-hasPermission="'mall-backend-goods-set-discount'" @click="handleBatchSetDis">批量设置折扣</el-button>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :height="tableHeight" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="-" width="60">
                <template slot-scope="scope">
                    <el-checkbox v-model="scope.row.checked" :key="scope.row.id" @change="value => skuChecked(value, scope.row, scope.$index)"></el-checkbox>
                </template>
            </el-table-column>
            <el-table-column label="SKU图片" width="120">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.$index)" />
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
                    <span v-if="scope.row.user_discount == 100">否</span>
                    <span v-else-if="scope.row.user_discount == 0">是</span>
                    <span v-else>{{ commUtil.numberMul(Number(scope.row.user_discount), 0.1) }}折</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button class="text-blue" type="text" size="small" v-hasPermission="'mall-backend-goods-set-discount'" @click.native="setDiscount(scope.row)"
                        >设置折扣</el-button
                    >
                    <el-button class="text-red" type="text" size="small" v-hasPermission="'mall-backend-goods-move-out'" @click.native="moveoutDiscount(scope.row)">移出</el-button>
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
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
        <!-- 商品添加 -->
        <goods-discount-list ref="productList" @add-success="SureAdd"></goods-discount-list>
    </div>
</template>
<script>
import { goodsDiscountlist } from '@/api/goods'
import { updateSkuDiscount, updateSkuDiscountBatch } from '@/api/discount'
import { REFUND_TYPE, REFUND_STATUS } from '@/plugin/constant'
import { formatMoney } from '@/plugin/tool'
import commUtil from '@/utils/commUtil'
import goodsDiscountList from '@/components/common/goods-discount-list/GoodsDiscountList'
import ElImageViewer from '@/components/common/image-viewer'
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

            formFilter: {
                sku: ''
            },
            orderType: '', //订单筛选
            totalProcessed: 0, //待处理数量
            tableHeight: 'calc(100vh - 254px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            // 折扣弹框
            dialogVisibleDiscount: false,
            discountType: 1, //1.无折扣 2.有折扣 折扣值为0时为移出
            discountId: '', //设置折扣的id
            discountValue: '',
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            checkedSkuIds: [],
            isBatch: false, // 批量操作
            isDel: false
        }
    },
    components: {
        goodsDiscountList,
        ElImageViewer
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
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['page_size'] = this.listQuery.limit
            params['page_index'] = this.listQuery.page
            params['type'] = 1 //// 1.无折扣 2.有折扣

            // console.log('params', params)
            goodsDiscountlist(params)
                .then(res => {
                    this.previewUrlList = []
                    // console.log('GOOGLE: res', res)
                    let sku_list = res.data.list || []
                    this.total = res.data.total
                    this.list = []
                    if(sku_list.length > 0) {
                        sku_list.forEach((ev)=>{
                            ev['checked'] = false
                            if (this.checkedSkuIds.includes(ev.id)) {
                                ev['checked'] = true
                            }
                            this.list.push(ev)
                        })
                        this.previewUrlList = sku_list.map(item=>{return item.sku_img})
                    }
                    if (this.list.length == 0 && this.total > 0 && this.listQuery.page > 0 && this.isDel) {

                        const newPage = this.listQuery.page - 1
                        console.log('newPage', newPage)
                        this.$set(this.listQuery,'page', newPage)
                        this.getList()
                    }
                })
                .catch(err => {})
        },

        gotoDetail(id, order_id) {
            this.isDel = false
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
            this.isBatch = false
            this.isDel = false
            console.log('输出 ~ row', row)
            this.discountId = row.id
            this.discountType = row.user_discount == 100 ? 1 : 2
            this.discountValue = row.user_discount == 100 ? '' : commUtil.numberMul(Number(row.user_discount), 0.1)
            this.openDialogDiscount()
        },
        // 移出
        moveoutDiscount(row) {
            this.isBatch = false
            this.$confirm('确认移出该商品', '', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        goods_skus: [
                            {
                                type: 2,
                                goods_sku_id: row.id,
                                value: 0 // type为1 该字段可以忽略
                            }
                        ]
                    }
                    this.queryUpdate(params,'移出成功')
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
                goods_skus: []
            }
            if (this.isBatch) {
                this.checkedSkuIds.forEach((ev)=>{
                    params['goods_skus'].push({
                        type: this.discountType,
                        goods_sku_id: ev,
                        value: Number(this.discountValue)
                    })
                })
            }else {
                params['goods_skus'].push({
                    type: this.discountType,
                    goods_sku_id: this.discountId,
                    value: Number(this.discountValue)
                })
            }
            this.queryUpdate(params,'折扣设置成功')
        },

        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.isDel = false
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
            // sku编码
            if (this.formFilter['sku']) {
                let obj = {
                    label: 'sku',
                    val: this.formFilter['sku']
                }
                _search.push(obj)
            }

            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.isDel = false
            this.$set(this.formFilter, item.label, '')
            if (item.label == 'createdTime') {
                this.$set(this.formFilter, 'created_time_ge', '')
                this.$set(this.formFilter, 'created_time_le', '')
            }
            this.handleFilter()
        },
        // 分页方法
        handleSizeChange(val) {
            this.isDel = false
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.isDel = false
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
        },
        skuChecked(bol, row, i) {
            this.list[i].checked = bol
            if (bol) {
                if (this.checkedSkuIds.indexOf(row.id) > -1) {

                } else {
                    this.checkedSkuIds.push(row.id)
                }
            } else {
                if (this.checkedSkuIds.indexOf(row.id) > -1) {
                    const index = this.checkedSkuIds.indexOf(row.id)
                    this.checkedSkuIds.splice(index, 1)
                }
            }
            // console.log('this.checkedSkuIds', this.checkedSkuIds)
        },
        // 批量删除
        handleBatchDel() {
            this.isBatch = true
            this.isDel = false
            const num = this.checkedSkuIds.length
            this.$confirm('确认移出'+ num +'件商品？', '', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        goods_skus: []
                    }
                    this.checkedSkuIds.forEach((ev)=>{
                        params['goods_skus'].push({
                            type: 2,
                            goods_sku_id: ev,
                            value: 0
                        })
                    })
                    this.queryUpdate(params,'移出成功')
                })
                .catch(() => {})
        },

        queryUpdate(params, str) {
            updateSkuDiscount(params)
                .then(res => {
                    // console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: str,
                            type: 'success',
                            duration: 3000
                        })
                        if (str == '移出成功') {
                            this.isDel = true
                        }
                        if (this.isBatch) {
                            this.checkedSkuIds = []
                        }
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
        // 批量设置折扣
        handleBatchSetDis() {
            this.isBatch = true
            this.discountType = 1
            this.discountValue = ''
            this.dialogVisibleDiscount = true
        },
        SureAdd(data) {
            if(data.length < 1) {
                return false
            }
            console.log('data', data)
            const params = {
                goods_sku_ids: data
            }
            updateSkuDiscountBatch(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '添加成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.$refs.productList.close()
                        this.checkedSkuIds = []
                        this.getList()
                        data.forEach((ev)=>{
                            this.checkedSkuIds.push(ev)
                        })
                        this.handleBatchSetDis()
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
        openPreview(index) {
            this.previewIndex = index
            this.dialogVisiblePic = true
        },
        closePreview() {
            this.dialogVisiblePic = false
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
    .batch-operation-box{
        width: 100%;
        padding: 10px 24px;
        background: #fff;
        border-top:1px solid rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        .batch-btn{
            /*margin-right: 10px;*/
        }
    }
</style>
