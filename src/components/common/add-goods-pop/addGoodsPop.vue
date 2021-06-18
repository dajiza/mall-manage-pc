<template>
    <div class="dialog-container" @click="searchShow = false">
        <el-dialog :visible.sync="isShow" :close-on-click-modal="false" width="90%" @open="open" @opened="opened" @close="closed">
            <div slot="title">
                <div class="table-title">
                    <div class="text">挑选商品</div>
                </div>
            </div>
            <el-form class="search-form-box" :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left">
                <el-form-item label="商品名称" prop="goods_name" class="">
                    <el-input class="filter-item" v-model="searchForm.goods_name" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="商品分类：" prop="cateArr">
                    <el-cascader
                            class="filter-item"
                            filterable
                            :key="cateKey"
                            v-model="searchForm.cateArr"
                            ref="refHandle"
                            :options="categoryData"
                            :props="{ checkStrictly: false, label: 'name', value: 'id' }"
                    >
                        <!-- <template slot-scope="{ node, data }">
                            <span class="select-item" @click="handleSelectCate($event, data)">{{ data.name }}</span>
                                </template> -->
                    </el-cascader>
                </el-form-item>
                <el-form-item class="btn-box" label="">
                    <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                    <el-button class="filter-btn" type="primary" @click="handleFilter('searchForm')">搜索</el-button>
                </el-form-item>
                <el-form-item class="add-btn-box">
                    <el-button type="primary" @click="handleAddSelected">添加</el-button>
                    <el-button type="success" @click="handleAddCate">添加该分类</el-button>
                    <el-button type="primary" @click="handleAddAll">
                        {{ searchParams.goods_name || searchParams.cateArr.length > 0 ? '添加搜索列表' : '添加全部商品' }}
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="app-container" @click="searchShow = false">
                <el-table
                    ref="multipleTable"
                    :height="tableHeight"
                    class="table"
                    :data="list"
                    v-loading.body="listLoading"
                    :header-cell-style="$tableHeaderColor"
                    element-loading-text="Loading"
                    :default-expand-all="false"
                    row-key="goods_id"
                    :cell-class-name="goodsTable"
                    :cell-style="{ background: '#fff' }"
                >
                    <el-table-column label="" width="55">
                        <template slot-scope="scope">
                            <!-- :indeterminate="0 < scope.row.checkNum && scope.row.checkNum < scope.row.shop_skus.length" -->
                            <el-checkbox
                                v-model="scope.row.goodsIsChecked"
                                :disabled="scope.row.isDisabled"
                                @change="value => goodsChecked(value, scope.row, scope.$index)"
                            ></el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column label="主图" width="120">
                        <template slot-scope="scope">
                            <img class="timg" :src="scope.row.goods_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.goods_img, 1, scope.$index)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                    <el-table-column prop="category_name" label="商品分类">
                        <template slot-scope="scope">
                            {{ scope.row.category_id === 0 ? '布料' : scope.row.category_name }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="channel_name" label="售价(元)" width="100">
                        <template slot-scope="scope">{{ (scope.row.goods_price / 100) | rounding }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="110">
                        <template slot-scope="scope">
                            <el-button type="text" class="marginLeft0 marginRight15" @click="handleAddItem(scope.$index, scope.row)">添加</el-button>
                        </template>
                    </el-table-column>
                    <template slot="empty">
                        <EmptyList></EmptyList>
                    </template>
                </el-table>
                <div class="pagination-container" style="padding: 20px 0;border-top: 1px solid rgba(0,0,0,.06)">
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

        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>
</template>

<script>
import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
import { queryCouponGoodsList } from '@/api/coupons';
export default {
    name: 'CheckList',
    props: {
        checked: {
            type: Array,
            default: []
        },
        shopId: {
            type: Number,
            default: -1
        },
        categoryData: {
            type: Array,
            default: []
        },
    },
    data() {
        return {
            tableHeight: 'calc(100vh - 294px)',
            list: [],
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            isShow: false,
            searchForm: {
                goods_name: '',
                cateArr: []
            },
            searchParams: {
                goods_name: '',
                cateArr: []
            },
            searchShow: false, //搜索表单显示
            // 类型 1 布料  2其他 3成品布
            typeList: [
                { value: 1, label: '布料' },
                { value: 2, label: '其他' },
                { value: 3, label: '布组' }
            ],
            categoryList: [],
            categoryListOther: [], //其他分类
            categoryListClothGroup: [], //布组分类
            // 是否上架：1下架；2上架
            statusList: [
                { value: 1, label: '下架' },
                { value: 2, label: '上架' }
            ],
            saleStatusList: [
                { value: 1, label: '可出售' },
                { value: 2, label: '不可售' }
            ],
            // 图片预览
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            timgList: [], //主图预览列表
            searchList: [],
            showMaxIndex: 0,
            checkedList: [], // 选中商品列表
            labelKey: 1,
            cateKey: 1,
            loadingTip: {},
        }
    },
    components: {
        ElImageViewer,
        EmptyList
    },
    watch: {

    },
    computed: {
    },
    created() {},
    mounted() {},
    methods: {
        formatMoney: formatMoney,
        goodsTable(row) {
            if (row.columnIndex == 2) {
                return 'checkboxColumn'
            }
        },
        open() {},
        opened() {
            console.log('this.checked', this.checked)

            ++this.labelKey
            this.checkedList = []
            this.listQuery.page = 1
            this.searchShow = false
            this.$refs['searchForm'].resetFields()
            this.searchParams = _.cloneDeep(this.searchForm)
            this.getListData()
        },
        closed() {
            this.searchShow = false
        },
        //  刷新显示列表的checkbox显示状态
        refreshSelection(ids) {
            this.list.forEach(goods_item => {
                goods_item.shop_skus.forEach((sku_item, i) => {
                    if (ids.indexOf(sku_item.sku_id) > -1) {
                        sku_item.skuIsChecked = false
                    }
                })
                goods_item['checkNum'] = goods_item.shop_skus.filter(item => item.skuIsChecked).length
                if (goods_item['checkNum'] < 1) {
                    goods_item['goodsIsChecked'] = false
                }
            })
            this.$nextTick(() => {})
        },


        // 获取分类下商品数量/全部商品数量
        getGoodsListTotal(type, cate_id, str) {
            let params = {
                page: 1,
                limit: 10,
                goods_name: str === 'cate' ? '' : this.searchParams.goods_name,
                category_id: cate_id,
                goods_ids: this.tabPosition === 'selected' ? this.selected_goods : [],
                not_goods_ids: this.tabPosition === 'selected' ? [] : this.selected_goods
            }
            queryCouponGoodsList(params)
                .then(res => {
                    this.imgList = []
                    this.previewIndex = 0
                    if (res.code === 200) {
                        if (res.data) {
                            if (str === 'all') {
                                this.allLimit = res.data.total
                            } else {
                                this.cateLimit = res.data.total
                            }
                            if (res.data.total > 10) {
                                this.getAllOrCateGoods('', type, cate_id, str)
                            } else {
                                this.addOrDelSuccess(res.data.lists || [], type)
                            }
                        }
                    } else {
                        this.loadingTip.close()
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {
                    this.loadingTip.close()
                })
        },

        // 商品列表
        getListData() {
            let cateId = this.backCateId()
            let params = {
                page: this.listQuery.page,
                limit: this.listQuery.limit,
                goods_name: this.searchParams.goods_name || '',
                category_id: cateId,
                goods_ids: [],
                not_goods_ids: this.checked
            }
            const rLoading = this.openLoading()
            queryCouponGoodsList(params)
                .then(res => {
                    rLoading.close()
                    this.timgList = []
                    this.previewIndex = 0
                    if (res.code === 200) {
                        if (res.data.lists == null || res.data.lists.length == 0) {
                            this.list = res.data.lists || []
                            this.total = res.data.total || 0
                            return
                        }
                        let goods_list = []
                        if(res.data.lists && res.data.lists.length > 0){
                            _.cloneDeep(res.data.lists).forEach(ev => {
                                let goods = _.cloneDeep(ev)
                                goods['goodsIsChecked'] = false
                                this.checkedList.forEach(check_ev => {
                                    if(check_ev.goods_id == ev.goods_id) {
                                        goods['goodsIsChecked'] = true
                                    }
                                })
                                goods_list.push(goods)
                            })
                        }
                        this.list =  goods_list
                        this.total = res.data.total
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

        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.searchParams = _.cloneDeep(this.searchForm)
            this.getListData()
        },

        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleFilter()
        },

        // 已选商品删除商品
        cancelSelection(group) {
            for (let i = 0; i < this.checkedList.length; i++) {
                const element = this.checkedList[i]
                if (group.goods_id == element.goods_id) {
                    this.checkedList.splice(i, 1)
                    const ids = element.shop_skus.map(item => {
                        return item.sku_id
                    })
                    this.refreshSelection(ids)
                }
            }
        },
        // 已选商品删除sku
        cancelSelectionImg(goods, sku) {
            for (let i = 0; i < this.checkedList.length; i++) {
                const element = this.checkedList[i]
                if (goods.goods_id == element.goods_id) {
                    for (let j = 0; j < element.shop_skus.length; j++) {
                        const skuElement = element.shop_skus[j]
                        if (sku.sku_id == skuElement.sku_id) {
                            element.shop_skus.splice(j, 1)
                            const ids = [sku.sku_id]
                            this.refreshSelection(ids)
                        }
                    }
                    // 没有选中图片时 删除组
                    if (element.shop_skus.length == 0) {
                        this.checkedList.splice(i, 1)
                    }
                }
            }
        },

        // 已选图片显示/关闭
        triggerImg(goods) {
            goods.open = !goods.open
            this.$forceUpdate()
        },

        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getListData()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getListData()
        },

        show() {
            this.isShow = true
        },
        close() {
            this.isShow = false
        },
        async save() {
            let sku_arr = []
            this.checkedList.forEach(goods_item => {
                goods_item.shop_skus.forEach(sku_item => {
                    if (sku_item.skuIsChecked && !sku_item.isDisabled) {
                        sku_item['goods_name'] = goods_item.goods_title
                        sku_item['new_title'] = ''
                        sku_arr.push(sku_item)
                    }
                })
            })
            if (sku_arr.length < 1) {
                this.$notify({
                    title: '请挑选商品',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            this.$emit('check-sku', _.cloneDeep(sku_arr))
            this.checkedList = []
            this.isShow = false
        },

        closeAddGoods() {
            this.searchShow = false
        },

        gotoDetail(id) {
            this.close()
            this.$router.push({
                name: 'goods-preview',
                query: {
                    id: id
                }
            })
        },

        // 关闭大图预览
        closePreview() {
            this.dialogVisiblePic = false
        },
        // type 1主图 2sku图 3
        openPreview(img, type, index) {
            if (type == 1) {
                this.previewUrlList = this.timgList
            }
            this.previewIndex = index
            this.dialogVisiblePic = true
        },

        // 商品选中/取消
        goodsChecked(bol, row, index) {
            console.log('bol', bol)
            console.log('row', row)
            console.log('index', index)
            row['goodsIsChecked'] = bol
            let goodsSku = _.cloneDeep(row)
            let checkedGoodsIds = [] // 选中商品id集合
            console.log('this.checkedList', this.checkedList)
            if (this.checkedList.length > 0) {
                checkedGoodsIds = this.checkedList.map(item => {
                    return item.goods_id
                })
            }
            console.log('checkedGoodsIds', checkedGoodsIds)
            // 判断 当前操作的商品 是否在 已选商品列表中

            if (checkedGoodsIds.indexOf(goodsSku.goods_id) == -1) {
                if(bol) {
                    this.checkedList.push(goodsSku)
                } else {

                }

            } else if (checkedGoodsIds.indexOf(goodsSku.goods_id) > -1) {
                let index = checkedGoodsIds.indexOf(goodsSku.goods_id)
                // 删除
                if(bol) {
                    // this.checkedList.push(goodsSku)
                } else {
                    this.checkedList.splice(index, 1)
                }

                // this.$set(this.checkedList, index, goodsSku)
            }
            console.log('this.checkedList======606', this.checkedList)
            return
        },


        // 添加单个
        handleAddItem(index, row) {
            let _arr = []
            _arr.push(row)
            this.$emit('handleAddGoods', this.checkedList);

        },

        // 添加选中
        handleAddSelected() {
            console.log('checkedList', this.checkedList)
            if (this.checkedList.length > 0) {
                this.$emit('handleAddGoods', this.checkedList);
            } else {
                this.$notify({
                    title: '请勾选商品后再添加',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 添加该分类
        handleAddCate() {
            this.searchForm = _.cloneDeep(this.searchParams)
            if (this.searchParams.cateArr.length > 0) {
                const cate_id = this.backCateId()
                const params = {
                    cate_id: cate_id,
                    goods_name: this.searchParams.goods_name,
                }
                this.$emit('handleAddCateGoods', params);
            } else {
                this.$notify({
                    title: '请选择分类并搜索后再添加该分类',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 输出 -- 分类id
        backCateId() {
            let cateId = -1
            if (this.searchParams.cateArr.length > 0) {
                const selected_cate = this.searchParams.cateArr
                if (selected_cate.length == 2) {
                    cateId = selected_cate[1]
                } else if (selected_cate.length == 3) {
                    cateId = selected_cate[2]
                } else {
                    cateId = 0
                }
            }
            console.log('输出 ~ cateId', cateId)
            return cateId
        },

        // 添加全部商品
        handleAddAll() {
            this.searchForm = _.cloneDeep(this.searchParams)
            let params = {
                cate_id: -1,
                goods_name: this.searchParams.goods_name
            }
            if (this.list.length > 0) {
                if (this.searchParams.cateArr.length > 0) {
                    const cate_id = this.backCateId()
                    params['cate_id'] = cate_id
                }
                this.$emit('handleAddAllGoods', params);
            } else {
                this.$notify({
                    title: '无可添加商品',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },
    }
}
</script>

<style scoped="scoped" lang="less">
/deep/.el-dialog {
    top: 50%;
    left: 50%;
    margin: 0 !important;
    transform: translate(-50%, -50%);
}
/deep/.el-dialog__body {
    padding: 0 !important;
}
/deep/.el-dialog__header {
    padding: 10px 0 !important;
}
/deep/.el-dialog__headerbtn {
    top: 21px;
}
.search-form-box{
    padding-top: 20px !important;
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid rgba(0,0,0,.1);
    margin-bottom: 24px;
    .btn-box{
        flex: 0 0 136px;
        width: 136px;
    }
    .add-btn-box{
        flex: 0 0 300px;
        width: 300px;
        margin-left: auto;
        margin-right: 0;
    }
}

.table-title {
    position: relative;
    height: 36px;
    .text {
        margin-left: 24px;
    }
    .search {
        font-size: 18px;
        cursor: pointer;
    }
    .grey-line {
        margin: 0 20px;
        width: 1px;
        height: 26px;
        background: #e6e6e6;
    }
    .head-container {
        position: absolute;
        top: 48px;
        z-index: 9;
        // transition: all 3s ease-in-out;
        padding: 24px 24px 4px 24px;
        // border: 1px solid #000;
        border-radius: 2px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
    }
    .selected-goods-btn {
        margin-right: 68px;
        margin-left: auto;
    }
}
.timg {
    width: 80px;
    height: 60px;
}

.row-list {
    max-height: 400px;
    width: 300px;
    .nodata {
        padding: 12px;
    }
    .row-item {
        // border-bottom: 1px solid #e8e8e8;

        .item-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            height: 50px;
            border-bottom: 1px solid #e8e8e8;
            .iconfont {
                margin-right: 16px;
                font-size: 14px;
                cursor: pointer;
            }
        }
        &:last-child {
            border-bottom: none;
        }
        .row-delete {
            cursor: pointer;
        }
        .name {
            overflow: hidden;
            padding-right: 10px;
            width: 250px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .son-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0 12px 0 46px;
            height: 50px;
            border-bottom: 1px solid #e8e8e8;
            .son-timg {
                margin-right: 10px;
                width: 40px;
                height: 40px;
            }
        }
    }
}
.item {
    display: flex;
    margin-bottom: 10px;
    min-height: 50px;
    .check {
        color: rgba(0, 0, 0, 0.65);
        font-weight: 400;
        font-size: 14px;
    }
    .check-all {
        margin-right: 120px;
    }
    .check-city {
        margin-bottom: 20px;
    }
}
.gotoDetail {
    color: #1890ff;
    cursor: pointer;
}
.sku-table {
    box-sizing: border-box;
    margin-left: 120px;
    max-width: calc(100% - 120px);
}
.table /deep/ .el-table__expand-icon > .el-icon {
    margin-top: -10px;
}
.table /deep/ .el-table__expand-icon--expanded {
    transform: rotate(0deg);
}
.table /deep/ .el-icon-arrow-right:before {
    color: #1890ff;
    content: '\e61a';
    font-size: 19px;
    font-family: 'iconfont';
}
.table /deep/ .el-table__expand-icon--expanded .el-icon-arrow-right:before {
    color: #6d7278;
    content: '\e617';
}

.cursor {
    cursor: pointer;
}
.table /deep/ .el-table__body tr:hover > td {
    background-color: #fff !important;
}
.table .sku-table /deep/ .el-table__body tr:hover > td {
    background-color: #f6faff !important;
}
.table /deep/ .el-table__expanded-cell {
    padding: 0 !important;
}
/deep/ .el-table-column--selection .cell {
    padding-right: 12px;
    padding-left: 12px;
}
/deep/.el-image-viewer__wrapper {
    z-index: 99999 !important;
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
</style>
