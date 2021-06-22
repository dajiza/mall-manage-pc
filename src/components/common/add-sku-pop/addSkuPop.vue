<template>
    <div class="dialog-container" @click="searchShow = false">
        <el-dialog :visible.sync="isShow" width="90%" @open="open" @opened="opened" :close-on-click-modal="false" @close="closed">
            <div slot="title">
                <div class="table-title">
<!--                    <div class="text">挑选赠品</div>-->
                    <el-tabs class="tabs" v-model="activeTab" @tab-click="onTabClick">
                        <el-tab-pane :label="'未添加'" name="1"></el-tab-pane>
                        <el-tab-pane :label="'已添加('+ addCount +')'" name="2"></el-tab-pane>
                    </el-tabs>
                    <div class="grey-line"></div>
                    <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                    <transition name="slide-fade">
                        <div class="head-container" v-show="searchShow" @click.stop="">
                            <el-form ref="searchForm" :model="searchForm" class="form-filter" :inline="true" size="small" label-position="left">
                                <el-form-item label="商品名称" prop="goods_name" label-width="">
                                    <el-input class="filter-item" placeholder="请输入" v-model="searchForm.goods_name" @keyup.enter.native="handleFilter()"></el-input>
                                </el-form-item>
                                <el-form-item label="商品ID" prop="goods_id" v-show="activeTab == '1'">
                                    <el-input class="filter-item" placeholder="请输入" v-model="searchForm.goods_id" @keyup.enter.native="handleFilter()"></el-input>
                                </el-form-item>
                                <el-form-item label="商品分类" prop="typeCategory" v-show="activeTab == '1'">
                                    <el-cascader
                                            class="filter-item"
                                            :props="{ checkStrictly: true }"
                                            v-model="searchForm.typeCategory"
                                            placeholder="请选择"
                                            :options="typeList"
                                    ></el-cascader>
                                </el-form-item>
                                <!--<el-form-item label="出售状态" prop="is_sale" v-show="activeTab == '1'">
                                    <el-select class="filter-item" v-model="searchForm.is_sale" placeholder="请选择">
                                        <el-option v-for="item in saleStatusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                                    </el-select>
                                </el-form-item>-->
                                <el-form-item label="是否售罄" prop="goods_is_store_shortage" v-show="activeTab == '1'">
                                    <el-select class="filter-item" v-model="searchForm.goods_is_store_shortage" placeholder="请选择">
                                        <el-option v-for="item in soldoutList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="SKU名称" prop="sku_name" class="">
                                    <el-input class="filter-item" v-model="searchForm.sku_name" placeholder="请输入" @keyup.enter.native="handleFilter()"></el-input>
                                </el-form-item>
                                <el-form-item label="SKU编码" prop="sku_code" class="">
                                    <el-input class="filter-item" v-model="searchForm.sku_code" placeholder="请输入" @keyup.enter.native="handleFilter()"></el-input>
                                </el-form-item>
                                <!--<el-form-item label="会员折扣" prop="discount_condition" v-show="false">
                                    <el-select class="filter-item" v-model="searchForm.discount_condition" placeholder="请选择">
                                        <el-option v-for="item in discountList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                                    </el-select>
                                </el-form-item>-->
                                <el-form-item class="form-item-btn" label="">
                                    <el-button class="filter-btn" size="" type="" @click="resetForm('searchForm')">重置</el-button>
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
                        <div class="search-value-clone" ref="searchConditionBox">
                            <template v-for="(item, i) in searchList">
                                <div class="search-item" :ref="'searchConditionItem' + i">
                                    {{ item.val }}
                                    <span class="tags-li-icon"><i class="el-icon-close"></i></span>
                                </div>
                            </template>
                            <span style="width: 20px;display: inline-block">...</span>
                        </div>
                    </div>
                    <div class="selected-goods-btn" v-if="activeTab=='1'">
                        <el-popover placement="bottom-end" width="300" trigger="click" popper-class="group-popper">
                            <div class="row-list">
                                <div class="nodata" v-if="checkedList.length == 0">无数据</div>
                                <div class="row-item" v-for="item in checkedList" :key="item.id">
                                    <template v-if="item.shop_skus.length > 0">
                                        <div class="item-content">
                                            <span class="iconfont icon-plus" v-show="!item.open" @click="triggerImg(item)"></span>
                                            <span class="iconfont icon-minus" v-show="item.open" @click="triggerImg(item)"></span>
                                            <div class="name">{{ item.goods_title }}</div>
                                            <i class="el-icon-error row-delete" v-if="!item.isDisabled" @click="cancelSelection(item)"></i>
                                        </div>
                                        <div class="son" v-show="item.open">
                                            <template v-for="(sku, sku_i) in item.shop_skus">
                                                <div class="son-item" v-if="sku.skuIsChecked">
                                                    <img alt="" class="son-timg" :src="sku.sku_sku_img + '!upyun520/fw/300'" @click="openPreview(item.sku_sku_img, 3, sku_i)" />
                                                    <div class="name">{{ sku.sku_title }}</div>
                                                    <i class="el-icon-error row-delete" v-if="!item.isDisabled" @click="cancelSelectionImg(item, sku)"></i>
                                                </div>
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            <el-button slot="reference" class="filter-btn" size="" type="success" style="margin-left:20px">已选商品</el-button>
                        </el-popover>
                    </div>
                </div>
            </div>
            <div class="app-container" @click="searchShow = false">
                <template v-if="activeTab == '1'">
                    <el-table
                            ref="multipleTable"
                            :height="tableHeight"
                            class="table"
                            :data="list"
                            v-loading.body="listLoading"
                            :header-cell-style="$tableHeaderColor"
                            element-loading-text="Loading"
                            :default-expand-all="false"
                            row-key="id"
                            :cell-class-name="goodsTable"
                            :cell-style="{ background: '#fff' }"
                            key="tableKey"
                    >
                        <template v-if="activeTab == '1'">
                            <el-table-column label="-" type="expand" width="55">
                                <template slot-scope="props">
                                    <el-table class="sku-table" :data="props.row.shop_skus" :header-cell-style="$tableHeaderColor">
                                        <el-table-column label="" width="50">
                                            <template slot-scope="scope">
                                                <el-checkbox
                                                        v-model="scope.row.skuIsChecked"
                                                        :disabled="scope.row.isDisabled"
                                                        @change="value => skuChecked(value, scope.row, scope.$index, props.row, props.$index)"
                                                ></el-checkbox>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="状态" width="90">
                                            <template slot-scope="scope">
                                                <span class="text-red" v-show="scope.row.status == 1">已下架</span>
                                                <span class="text-blue" v-show="scope.row.status == 2">已上架</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="SKU图片" width="120">
                                            <template slot-scope="scope">
                                                <img
                                                        class="timg"
                                                        :src="scope.row.sku_sku_img + '!upyun520/fw/300'"
                                                        alt=""
                                                        @click="openPreview(scope.row.sku_sku_img, 2, scope.row.skuImgIndex)"
                                                />
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="SKU名称">
                                            <template slot-scope="scope">
                                                <span>{{ scope.row.sku_title }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="SKU编码">
                                            <template slot-scope="scope">
                                                <span>{{ scope.row.sku_storehouse_code }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="实际销量" width="90">
                                            <template slot-scope="scope">
                                                <span>{{ scope.row.real_sales }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="售价(元)" width="90">
                                            <template slot-scope="scope">
                                                <span>{{ formatMoney(scope.row.price) }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="总库存" width="90">
                                            <template slot-scope="scope">
                                                <span>{{ scope.row.product_storage_data.stock_total }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="可用库存" width="90">
                                            <template slot-scope="scope">
                                                <span>{{ scope.row.product_storage_data.stock_available }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="是否售罄" width="90">
                                            <template slot-scope="scope">
                                                <div class="type-tag type-yellow" v-if="scope.row.sku_is_store_shortage == 2">售罄</div>
                                                <div class="type-tag type-blue" v-else>否</div>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </template>
                            </el-table-column>
                            <el-table-column label="" width="70">
                                <template slot-scope="scope">
                                    <span>({{ scope.row.checkNum || 0 }}/{{ scope.row.shop_skus.length }})</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="" width="35">
                                <template slot-scope="scope">
                                    <el-checkbox
                                            v-model="scope.row.goodsIsChecked"
                                            :disabled="scope.row.isDisabled"
                                            :indeterminate="0 < scope.row.checkNum && scope.row.checkNum < scope.row.shop_skus.length"
                                            @change="value => goodsChecked(value, scope.row, scope.$index)"
                                    ></el-checkbox>
                                </template>
                            </el-table-column>
                            <el-table-column label="商品ID" width="80">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.id }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="主图" width="120">
                                <template slot-scope="scope">
                                    <img class="timg" :src="scope.row.goods_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.goods_img, 1, scope.$index)" />
                                </template>
                            </el-table-column>
                            <el-table-column label="商品名称">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.goods_title }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="商品分类" width="180">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.goods_type == 1">布料</span>
                                    <span v-if="scope.row.goods_type == 2"> 其他{{ categoryGenerate(scope.row.goods_category_id, 2) }} </span>
                                    <span v-if="scope.row.goods_type == 3"> 布组{{ categoryGenerate(scope.row.goods_category_id, 3) }} </span>
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" width="120">
                                <template slot-scope="scope">
                                    <div class="status">
                                        <span class="dot dot-grey" v-if="scope.row.status == 1"></span>
                                        <span class="dot dot-green" v-if="scope.row.status == 2"></span>

                                        <span :class="[scope.row.status == 1 ? 'text-grey' : '', 'status-text']">
                                    {{ scope.row.status == 1 ? '已下架' : '已上架' }}
                                </span>
                                    </div>
                                </template>
                            </el-table-column>
                            <!--<el-table-column label="出售状态" width="110">
                                <template slot-scope="scope">{{ scope.row.is_sale == 1 ? '可出售' : '不可售' }}</template>
                            </el-table-column>-->
                        </template>
                    </el-table>
                </template>
                <template v-if="activeTab == '2'">
                    <el-table
                            :height="tableHeight"
                            class="table"
                            :data="addList"
                            key="addListKey"
                            element-loading-text="Loading"
                    >
                        <el-table-column label="" width="55">
                            <template slot-scope="scope">
                                <!-- :indeterminate="0 < scope.row.checkNum && scope.row.checkNum < scope.row.shop_skus.length" -->
                                <el-checkbox
                                        v-model="scope.row.goodsIsChecked"
                                        :disabled="scope.row.isDisabled"
                                        @change="value => delSkuChecked(value, scope.row, scope.$index)"
                                ></el-checkbox>
                            </template>
                        </el-table-column>
                        <el-table-column label="商品主图" width="120">
                            <template slot-scope="scope">
                                <img class="timg" :src="scope.row.goodsImg + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.goodsImg, 1, scope.$index)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="商品名称" prop="goodsName">
                            <template slot-scope="scope">{{scope.row.goodsName}}</template>
                        </el-table-column>
                        <el-table-column label="SKU图片" width="120">
                            <template slot-scope="scope">
                                <img class="timg" :src="scope.row.skuImg + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.skuImg, 1, scope.$index)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="SKU名称" prop="skuName"></el-table-column>
                        <el-table-column label="SKU编码" prop="skuCode"></el-table-column>
                        <el-table-column label="售价(元)" width="100">
                            <template slot-scope="scope">{{ (scope.row.price / 100) | rounding }}</template>
                        </el-table-column>
                        <el-table-column label="操作" width="110">
                            <template slot-scope="scope">
                                <el-button type="text" class="marginLeft0 marginRight15 delete-color" @click="handleDelItem(scope.$index, scope.row)">移除</el-button>
                            </template>
                        </el-table-column>
                        <!--                        <template slot="empty">-->
                        <!--                            <EmptyList></EmptyList>-->
                        <!--                        </template>-->
                    </el-table>
                </template>
                <div class="pagination-container">
                    <template v-if="activeTab == '1'">
                        <el-pagination
                                background
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                                :current-page="listQuery.page"
                                :page-size="listQuery.limit"
                                layout="total, prev, pager, next, jumper"
                                :total="total"
                                key="tableKey"
                        >
                        </el-pagination>
                    </template>
                    <template v-else>
                        <el-pagination
                                background
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                                :current-page="listQuery.addPage"
                                :page-size="listQuery.limit"
                                layout="total, prev, pager, next, jumper"
                                :total="addCount"
                                key="addPaginationKey"
                        >
                        </el-pagination>
                    </template>
                </div>
            </div>

            <div slot="footer" class="dialog-footer">
                <!--<el-button @click="close">取 消</el-button>-->
                <el-button type="primary" @click="handleOnAdd" v-if="activeTab=='1'" :disabled="list < 1">添加</el-button>
                <el-button type="danger" @click="handleOnDel" v-if="activeTab=='2'" :disabled="addList < 1">移除</el-button>
            </div>
        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>
</template>

<script>
import { queryShopGoodsList, queryCheckedGoods } from '@/api/live'
import { queryGoodsListNew, queryShopList, queryCategoryListAll } from '@/api/goods'
import { querySkuList } from '@/api/promotion'
import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
import { construct } from '@/utils/json-tree'
import commUtil from '@/utils/commUtil'
import { queryCouponGoodsList } from '@/api/coupons';
export default {
    name: 'CheckList',
    props: {
        checked: {
            type: Array,
            default: []
        },
        addIds: {
            type: Array,
            default: []
        },
        shopId: {
            type: Number,
            default: -1
        },
        cateOtherList: {
            type: Array,
            default: []
        },
        cateGroupList: {
            type: Array,
            default: []
        },
        tableKey: 0,
        addTableKey: 1
    },
    data() {
        return {
            tableHeight: 'calc(100vh - 264px)',
            list: [],
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                addPage: 1,
                limit: 10
            },
            isShow: false,
            searchForm: {
                goods_id: '',
                goods_name: '',
                sku_name: '',
                sku_code: '',
                goods_is_store_shortage: '',
                shop_goods_status: 2, //1下架；2上架；
                other_id: '',
                goods_type: '',
                typeCategory: [] //cache数据
            },
            searchParams: {},
            searchShow: false, //搜索表单显示
            // 类型 1 布料  2其他 3成品布
            typeList: [
                { value: 1, label: '布料' },
                { value: 2, label: '其他' },
                { value: 3, label: '布组' }
            ],
            // 售罄 1是 2不是
            soldoutList: [
                { value: 1, label: '否' },
                { value: 2, label: '是' }
            ],
            categoryList: [],
            categoryListOther: [], // 其他分类
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
            // 会员折扣搜索下拉列表 //是否折扣：1正常折扣，2不是折扣，3其他折扣
            discountList: [
                { label: '是', value: 1 },
                { label: '否', value: 2 },
                { label: '其他', value: 3 }
            ],
            // 图片预览
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            timgList: [], //主图预览列表
            skuImgList: [], //sku图预览列表
            checkImgList: [], // 选中图片列表
            checkedSkuIds: [], // 初始选中的sku id集合
            searchList: [],
            showMaxIndex: 0,
            checkedList: [], // 选中商品列表
            delSkuList: [], // 选中移除
            labelKey: 1,
            activeTab: '0',
            addCount: 0,
            allAddList: [], // 全部已添加 不分页
            addSkuIdsArr: [], // 已添加sku id集合
            addList:[]
        }
    },
    components: {
        ElImageViewer,
        EmptyList
    },
    watch: {
        searchList: function() {
            this.$nextTick(
                function() {
                    if (!this.$refs.searchConditionBox) {
                        return
                    }
                    let maxWidth = window.getComputedStyle(this.$refs.searchConditionBox).width.replace('px', '') - 20
                    let showWidth = 0
                    for (let i = 0; i < this.searchList.length; i++) {
                        let el = 'searchConditionItem' + i
                        if (!this.$refs[el][0]) {
                            return
                        }
                        let _width = this.$refs[el][0].offsetWidth
                        showWidth = showWidth + Math.ceil(Number(_width)) + 8
                        if (showWidth > maxWidth) {
                            this.showMaxIndex = i - 1
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
        },
        checked: {
            handler(newValue, oldValue) {
                console.log('newValue', newValue)
                this.checkedSkuIds = _.cloneDeep(newValue)
                if(this.activeTab == '1' && this.isShow){
                    this.listQuery.page = 1
                    this.getList()
                }
            },
            deep: true
        },
        addIds: {
            handler(newValue, oldValue) {
                console.log('newValue', newValue)
                this.addSkuIdsArr = _.cloneDeep(newValue)
                if(this.isShow) {
                    this.listQuery.addPage = 1
                    this.getPromotionGoods()
                }
            },
            deep: true
        },
    },
    computed: {
        backGoodsOtherName: function() {
            return data => {
                let _name = ''
                this.categoryListOther.forEach(ev => {
                    if (ev.id == data) {
                        _name = ' > ' + ev.name
                    }
                })
                return _name
            }
        },
        backGoodsCategoryName: function() {
            return data => {
                let _name = ''
                this.categoryListClothGroup.forEach(ev => {
                    if (ev.id == data) {
                        _name = ' > ' + ev.name
                    }
                })
                return _name
            }
        }
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
            this.categoryListOther = _.cloneDeep(this.cateOtherList)
            this.categoryListClothGroup = _.cloneDeep(this.cateGroupList)
            ++this.labelKey
            this.checkedList = []
            this.addList = []
            this.addCount = 0
            this.listQuery.addPage = 1
            this.listQuery.page = 1
            this.searchShow = false
            this.$refs['searchForm'].resetFields()
            this.searchParams = _.cloneDeep(this.searchForm)
            this.setSearchValue()
            this.checkedSkuIds = _.cloneDeep(this.checked) // 已选sku ID集合
            this.addSkuIdsArr = _.cloneDeep(this.addIds)
            this.activeTab = '1'
            this.creatCategoryData()
            this.resetForm('searchForm')
            console.log('this.checkedSkuIds', this.checkedSkuIds)
            console.log('this.addSkuIdsArr', this.addSkuIdsArr)

            // 获取已添加条数
            this.getPromotionGoods()
        },
        closed() {
            this.searchShow = false
        },
        //  刷新显示列表的checkbox显示状态
        refreshSelection(ids) {
            this.list.forEach(goods_item => {
                goods_item.shop_skus.forEach((sku_item, i) => {
                    if (ids.indexOf(sku_item.id) > -1) {
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

        // 生成类型 分类 级联列表
        creatCategoryData() {
            this.typeList = [
                { value: 1, label: '布料', children: null },
                {
                    value: 2,
                    label: '其他',
                    children: construct(this.categoryListOther, {
                        id: 'id',
                        pid: 'parent_id',
                        children: 'children'
                    }).map(item => {
                        return {
                            label: item.name,
                            value: item.id,
                            children: item.children
                                ? item.children.map(son => {
                                      return { label: son.name, value: son.id }
                                  })
                                : null
                        }
                    })
                },
                {
                    value: 3,
                    label: '布组',
                    children: construct(this.categoryListClothGroup, {
                        id: 'id',
                        pid: 'parent_id',
                        children: 'children'
                    }).map(item => {
                        return {
                            label: item.name,
                            value: item.id,
                            children: item.children
                                ? item.children.map(son => {
                                      return { label: son.name, value: son.id }
                                  })
                                : null
                        }
                    })
                }
            ]
        },
        // 生成类目显示 修复部分类目被删导数据错误问题
        categoryGenerate: function(id, type) {
            if (id == 0) {
                return ''
            }
            if (type == 2) {
                let cate = this.categoryListOther.find(item => item.id == id)

                return cate ? '> ' + cate.name : ''
            } else {
                let cate = this.categoryListClothGroup.find(item => item.id == id)
                return cate ? '> ' + cate.name : ''
            }
        },

        // 未添加
        getList() {
            const rLoading = this.openLoading()
            let params = _.cloneDeep(this.searchParams)
            // params['sku_is_store_shortage'] = 1;
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            params['goods_id'] = Number(this.searchParams.goods_id)
            if (params['typeCategory'].length == 1) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = ''
            } else if (params['typeCategory'].length == 2) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = params['typeCategory'][1]
            } else if (params['typeCategory'].length == 3) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = params['typeCategory'][2]
            }
            if (params['goods_type'] == 1) {
                params['other_id'] = 0
            }
            params['shop_id'] = this.shopId
            params['shop_goods_status'] = 2
            queryShopGoodsList(params)
                .then(res => {
                    if (res.data.lists == null || res.data.lists.length == 0) {
                        this.list = res.data.lists || []
                        this.total = res.data.total || 0
                        rLoading.close()
                        return
                    }
                    // 生成主图 sku图预览列表
                    this.timgList = []
                    this.skuImgList = []
                    let goods_list = []
                    let new_sku_ids = [] // 新加sku id集合
                    this.checkedList.forEach(goods_item => {
                        goods_item.shop_skus.forEach(sku_item => {
                            if (sku_item.skuIsChecked) {
                                new_sku_ids.push(sku_item.sku_id)
                            }
                        })
                    })
                    console.log('this.checkedList', this.checkedList)
                    console.log('this.checkedSkuIds', this.checkedSkuIds)
                    if (res.data.lists && res.data.lists.length > 0) {
                        _.cloneDeep(res.data.lists).forEach(ev => {
                            let goods = _.cloneDeep(ev)
                            this.timgList.push(goods.goods_img)
                            goods.shop_skus.forEach((sku, sku_i) => {
                                this.skuImgList.push(sku.sku_sku_img)
                                sku['skuIsChecked'] = false
                                sku['isDisabled'] = false
                                if (this.checkedSkuIds.indexOf(sku.sku_id) > -1) {
                                    sku['skuIsChecked'] = true
                                    sku['isDisabled'] = true
                                }
                                if (new_sku_ids.indexOf(sku.sku_id) > -1) {
                                    sku['skuIsChecked'] = true
                                }
                            })
                            goods['goodsIsChecked'] = false
                            goods['checkNum'] = goods.shop_skus.filter(item => item.skuIsChecked).length
                            goods['skuDisabledNum'] = goods.shop_skus.filter(item => item.isDisabled).length
                            if (goods['checkNum'] > 0) {
                                goods['goodsIsChecked'] = true
                            }
                            goods['isDisabled'] = false
                            if (goods['skuDisabledNum'] > 0 && goods['skuDisabledNum'] == goods.shop_skus.length) {
                                goods['isDisabled'] = true
                                // goods.shop_skus.forEach((sku, sku_i) => {
                                //     sku['isDisabled'] = true
                                // })
                            }

                            goods_list.push(goods)
                        })
                    }
                    this.list = goods_list
                    this.total = res.data.total
                    rLoading.close()
                })
                .catch(err => {
                    rLoading.close()
                })
        },

        // 换购-已添加SKU列表
        getPromotionGoods() {
            let delSkuIds = []
            if (this.addSkuIdsArr.length < 1) {
                this.imgList = []
                this.allAddList = []
                this.addCount = 0
                this.addList = []
                return
            }
            let params = {
                goodsName: this.searchParams.goods_name || '',
                skuName: this.searchParams.sku_name || '',
                skuCode: this.searchParams.sku_code || '',
                skuIds: this.addSkuIdsArr,
                shopId: this.shopId
            }
            this.listQuery.page = 1
            const rLoading = this.openLoading()
            querySkuList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data) {
                            this.allAddList = res.data || []
                            this.addCount = res.data.length || 0
                            this.addListPagination()
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

        // 换购-已添加SKU列表 分页处理
        addListPagination() {
            this.imgList = []
            this.previewIndex = 0
            const startNum = (this.listQuery.addPage - 1) * this.listQuery.limit,
                  endNum = this.listQuery.addPage * this.listQuery.limit
            this.addList = this.allAddList.slice(startNum,endNum)
            this.addList.forEach(item => {
                this.imgList.push(item.goods_img)
            })
        },

        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.listQuery.addPage = 1
            this.searchShow = false
            this.searchParams = _.cloneDeep(this.searchForm)
            this.setSearchValue()
            if(this.activeTab == '1'){
                console.log('1111111')
                this.getList()
            } else {
                console.log('222222')
                this.getPromotionGoods()
            }
        },

        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleFilter()
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            // id
            // if (this.searchParams['id']) {
            //     let obj = {
            //         label: 'id',
            //         val: this.searchParams['id']
            //     }
            //     _search.push(obj)
            // }
            // 上下架状态 status
            // if (this.searchParams['status']) {
            //     this.statusList.forEach(ev => {
            //         if (ev.value == this.searchParams['status']) {
            //             let obj = {
            //                 label: 'status',
            //                 val: ev.label
            //             }
            //             _search.push(obj)
            //         }
            //     })
            // }
            // 商品名称
            if (this.searchForm['goods_name']) {
                let obj = {
                    label: 'goods_name',
                    val: this.searchForm['goods_name']
                }
                _search.push(obj)
            }
            // sku名称
            if (this.searchForm['sku_name']) {
                let obj = {
                    label: 'sku_name',
                    val: this.searchForm['sku_name']
                }
                _search.push(obj)
            }
            // sku编码
            if (this.searchForm['sku_code']) {
                let obj = {
                    label: 'sku_code',
                    val: this.searchForm['sku_code']
                }
                _search.push(obj)
            }
            // 是否售罄
            if (this.searchForm['goods_is_store_shortage']) {
                this.soldoutList.forEach(ev => {
                    if (ev.value == this.searchForm['goods_is_store_shortage']) {
                        let obj = {
                            label: 'goods_is_store_shortage',
                            val: '售罄:' + ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // 级联选择 商品类型+分类
            if (this.searchForm['typeCategory'].length == 1) {
                this.typeList.forEach(ev => {
                    if (ev.value == this.searchForm['typeCategory'][0]) {
                        let obj = {
                            label: 'typeCategory',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            } else if (this.searchForm['typeCategory'].length == 2) {
                let showValue = ''
                this.typeList.forEach(ev => {
                    if (ev.value == this.searchForm['typeCategory'][0]) {
                        showValue = ev.label
                    }
                })

                let _arr = this.categoryListClothGroup.concat(this.categoryListOther)
                _arr.forEach(ev => {
                    if (ev.id == this.searchForm['typeCategory'][1]) {
                        showValue = showValue + '/' + ev.name
                    }
                })
                _search.push({
                    label: 'typeCategory',
                    val: showValue
                })
            } else if (this.searchForm['typeCategory'].length == 3) {
                let showValue = ''
                this.typeList.forEach(ev => {
                    if (ev.value == this.searchForm['typeCategory'][0]) {
                        showValue = ev.label
                    }
                })

                let _arr = this.categoryListClothGroup.concat(this.categoryListOther)
                _arr.forEach(ev => {
                    if (ev.id == this.searchForm['typeCategory'][1]) {
                        showValue = showValue + '/' + ev.name
                    }
                })
                _arr.forEach(ev => {
                    if (ev.id == this.searchForm['typeCategory'][2]) {
                        showValue = showValue + '/' + ev.name
                    }
                })
                _search.push({
                    label: 'typeCategory',
                    val: showValue
                })
            }
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.searchForm, item.label, '')
            this.$set(this.searchParams, item.label, '')
            if (item.label == 'typeCategory') {
                this.$set(this.searchForm, 'typeCategory', [])
                this.$set(this.searchParams, 'typeCategory', [])
            }
            this.handleFilter()
        },

        // 已选商品删除商品
        cancelSelection(group) {
            for (let i = 0; i < this.checkedList.length; i++) {
                const element = this.checkedList[i]
                if (group.id == element.id) {
                    this.checkedList.splice(i, 1)
                    const ids = element.shop_skus.map(item => {
                        return item.id
                    })
                    this.refreshSelection(ids)
                }
            }
        },

        // 已选商品删除sku
        cancelSelectionImg(goods, sku) {
            for (let i = 0; i < this.checkedList.length; i++) {
                const element = this.checkedList[i]
                if (goods.id == element.id) {
                    for (let j = 0; j < element.shop_skus.length; j++) {
                        const skuElement = element.shop_skus[j]
                        if (sku.id == skuElement.id) {
                            element.shop_skus.splice(j, 1)
                            const ids = [sku.id]
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
            this.getList()
        },
        handleCurrentChange(val) {
            if (this.activeTab == '1') {
                this.listQuery.page = val
                this.getList()
            } else {
                this.listQuery.addPage = val
                this.addListPagination()
            }

        },

        show() {
            this.isShow = true
        },
        close() {
            this.isShow = false
        },
        async handleOnAdd() {
            let sku_arr = []
            console.log('this.checkedList', this.checkedList)
            console.log('this.checkedList.length', this.checkedList.length)
            this.checkedList.forEach(goods_item => {
                goods_item.shop_skus.forEach(sku_item => {
                    if (sku_item.skuIsChecked && !sku_item.isDisabled) {
                        sku_item['goods_title'] = goods_item.goods_title
                        sku_item['goods_img'] = goods_item.goods_img
                        sku_arr.push(sku_item)
                    }
                })
            })
            console.log('sku_arr', sku_arr)
            console.log('sku_arr', sku_arr)
            if (sku_arr.length < 1) {
                this.$notify({
                    title: '请挑选商品',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            this.$emit('addSku', _.cloneDeep(sku_arr))
            // this.$emit('delSku', _.cloneDeep(sku_arr))
            this.checkedList = []
            // this.isShow = false
        },

        // 移除单条
        handleDelItem(i,row) {
            console.log('row',row)
            let goodsSku = _.cloneDeep(row)
            let list = []
            list.push(goodsSku)
            console.log('1051======', list)
            this.$emit('delSku', _.cloneDeep(list))
        },
        // 确定移除
        handleOnDel() {
            if (this.delSkuList.length < 1) {
                this.$notify({
                    title: '请挑选商品',
                    type: 'warning',
                    duration: 3000
                })
                return
            }
            this.$emit('delSku', _.cloneDeep(this.delSkuList))
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
        // type 1主图 2sku图 3 已选中sku
        openPreview(img, type, index) {
            if (type == 1) {
                this.previewUrlList = this.timgList
            } else if (type == 2) {
                this.previewUrlList = this.skuImgList
            } else if (type == 3) {
                let _list = []
                img.forEach(item => {
                    _list.push(item.sku_img)
                })
                this.previewUrlList = _list
                // return
            }
            this.previewIndex = index
            this.dialogVisiblePic = true
        },

        filterGoods() {
            this.checkedList.forEach((goods, i) => {
                if (goods['checkNum'] < 1) {
                    this.checkedList.splice(i, 1)
                }
            })
        },
        // sku选中/取消
        skuChecked(bol, row, index, goods_detail, goods_index) {
            goods_detail.shop_skus.forEach((ev, i) => {
                if (!ev.isDisabled) {
                    // ev['skuIsChecked'] = false
                }
            })
            row['skuIsChecked'] = bol
            goods_detail['checkNum'] = goods_detail.shop_skus.filter(item => item.skuIsChecked).length
            if (goods_detail['checkNum'] < 1) {
                goods_detail['goodsIsChecked'] = false
            } else {
                goods_detail['goodsIsChecked'] = true
            }

            let checkedGoodsIds = [] // 选中商品id集合
            if (this.checkedList.length > 0) {
                checkedGoodsIds = this.checkedList.map(item => {
                    return item.id
                })
            }
            let goodsSku = _.cloneDeep(goods_detail)
            // 判断 当前操作的sku 所属商品 是否在 已选商品列表中
            if (checkedGoodsIds.indexOf(goodsSku.id) == -1) {
                this.checkedList.push(goodsSku)
            } else if (checkedGoodsIds.indexOf(goodsSku.id) > -1) {
                let index = checkedGoodsIds.indexOf(goodsSku.id)
                this.$set(this.checkedList, index, goodsSku)
            }
            this.filterGoods()
        },

        // 商品选中/取消
        goodsChecked(bol, row, index) {
            if (row.shop_skus && row.shop_skus.length > 1) {
                // row['goodsIsChecked'] = false
                row.shop_skus.forEach((ev, i) => {
                    if (!ev['isDisabled']) {
                        ev['skuIsChecked'] = bol
                    }
                })
            } else if (row.shop_skus && row.shop_skus.length == 1) {
                if (!row.isDisabled) {
                    row['goodsIsChecked'] = bol
                    row.shop_skus.forEach((ev, i) => {
                        if (!ev['isDisabled']) {
                            ev['skuIsChecked'] = bol
                        }
                    })
                }
            }
            let sku_checked_num = row.shop_skus.filter(item => item.skuIsChecked).length
            row['checkNum'] = sku_checked_num
            let checkedGoodsIds = [] // 选中商品id集合
            if (this.checkedList.length > 0) {
                checkedGoodsIds = this.checkedList.map(item => {
                    return item.id
                })
            }
            let goodsSku = _.cloneDeep(row)
            // 判断 当前操作的商品 是否在 已选商品列表中
            if (checkedGoodsIds.indexOf(goodsSku.id) == -1) {
                this.checkedList.push(goodsSku)
            } else if (checkedGoodsIds.indexOf(goodsSku.id) > -1) {
                let index = checkedGoodsIds.indexOf(goodsSku.id)
                this.$set(this.checkedList, index, goodsSku)
            }
            this.filterGoods()
        },

        // 已添加列表 sku选中
        delSkuChecked(bol, row, index) {
            row['goodsIsChecked'] = bol
            let goodsSku = _.cloneDeep(row)
            let checkedSkuIds = [] // 选中商品id集合
            if (this.delSkuList.length > 0) {
                checkedSkuIds = this.delSkuList.map(item => {
                    return item.skuId
                })
            }
            // 判断 当前操作的商品 是否在 已选商品列表中
            if (checkedSkuIds.indexOf(row.skuId) == -1) {
                if(bol) {
                    this.delSkuList.push(goodsSku)
                }
            } else if (checkedSkuIds.indexOf(row.skuId) > -1) {
                let index = checkedSkuIds.indexOf(row.skuId)
                // 删除
                if(bol) {
                    // this.checkedList.push(goodsSku)
                } else {
                    this.delSkuList.splice(index, 1)
                }
            }
        },

        onTabClick() {
            this.searchList = []
            this.listQuery.addPage = 1
            this.listQuery.page = 1
            if(this.activeTab == 2){
                this.delSkuList = []
                this.resetForm('searchForm')
            } else {
                this.resetForm('searchForm')
            }
        },
    }
}
</script>

<style scoped="scoped" lang="less">
.app-container{
    margin-top: 20px;
}
.tabs {
    margin-left: 30px;
    & /deep/ .el-tabs__header {
        margin: 0;
    }
    & /deep/ .el-tabs__nav {
        height: 56px;
        z-index: 2003;
    }
    & /deep/ .el-tabs__item {
        line-height: 56px;
    }
}
.el-tabs__active-bar{
    z-index: 2004;
}
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
    box-sizing: border-box;
    height: 57px;
}
/deep/.el-dialog__headerbtn {
    top: 21px;
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
    min-width: 50px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    word-break: keep-all;
    font-weight: 400;
    line-height: 26px;
    text-align: center;
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
