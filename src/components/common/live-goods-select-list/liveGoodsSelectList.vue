<template>
    <div class="dialog-container" @click="searchShow = false">
        <el-dialog :visible.sync="isShow" width="90%" @open="open" @opened="opened" @close="closed">
            <div slot="title">
                <div class="table-title">
                    <div class="text">直播商品</div>
                    <div class="grey-line"></div>
                    <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                    <transition name="slide-fade">
                        <div class="head-container" v-show="searchShow" @click.stop="">
                            <el-form ref="searchForm" :model="searchForm" class="form-filter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
                                <el-form-item label="商品名称" prop="goods_name" label-width="">
                                    <el-input class="filter-item" placeholder="请输入" v-model="searchForm.goods_name"></el-input>
                                </el-form-item>
                                <el-form-item label="商品ID" prop="goods_id">
                                    <el-input class="filter-item" placeholder="请输入" v-model="searchForm.goods_id"></el-input>
                                </el-form-item>
                                <el-form-item label="商品分类" prop="typeCategory">
                                    <el-cascader
                                        :key="'add-live-cate' + labelKey"
                                        class="filter-item"
                                        :props="{ checkStrictly: true }"
                                        v-model="searchForm.typeCategory"
                                        placeholder="请选择"
                                        :options="typeList"
                                    ></el-cascader>
                                </el-form-item>
                                <el-form-item label="商品状态" prop="shop_goods_status">
                                    <el-select :key="'add-live-status' + labelKey" class="filter-item" v-model="searchForm.shop_goods_status" placeholder="请选择">
                                        <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="SKU名称" prop="sku_name" class="">
                                    <el-input class="filter-item" v-model="searchForm.sku_name" placeholder="请输入"></el-input>
                                </el-form-item>
                                <el-form-item label="SKU编码" prop="sku_code" class="">
                                    <el-input class="filter-item" v-model="searchForm.sku_code" placeholder="请输入"></el-input>
                                </el-form-item>
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
                    <div class="selected-goods-btn">
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
                                                    <img alt="" class="son-timg" :src="sku.sku_sku_img + '!upyun520/fw/300'" @click="openPreview(item.shop_skus, 3, sku_i)" />
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
                <el-table
                    ref="multipleTable"
                    :height="$tableHeight"
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
                                        <span>{{ scope.row.sku_real_sales }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="售价(元)" width="90">
                                    <template slot-scope="scope">
                                        <span>{{ formatMoney(scope.row.sku_min_price) }}</span>
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
                                        {{ scope.row.sku_is_store_shortage == 2 ? '是' : '否' }}
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>

                    <el-table-column label="" width="70">
                        <template slot-scope="scope">
                            <span>({{ scope.row.checkNum }}/{{ scope.row.shop_skus.length }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="" width="35">
                        <template slot-scope="scope">
                            <!-- :indeterminate="0 < scope.row.checkNum && scope.row.checkNum < scope.row.shop_skus.length" -->
                            <el-checkbox
                                v-model="scope.row.goodsIsChecked"
                                :disabled="scope.row.isDisabled"
                                @change="value => goodsChecked(value, scope.row, scope.$index)"
                            ></el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column label="商品ID" width="80">
                        <template slot-scope="scope">
                            <span>{{ scope.row.goods_id }}</span>
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
                            <span v-if="scope.row.goods_type == 2"> 其他{{ backGoodsOtherName(scope.row.goods_category_id) }} </span>
                            <span v-if="scope.row.goods_type == 3"> 布组{{ backGoodsCategoryName(scope.row.goods_category_id) }} </span>
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
            <div slot="footer" class="dialog-footer">
                <!--<el-button @click="close">取 消</el-button>-->
                <el-button type="primary" @click="save">确定</el-button>
            </div>
        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>
</template>

<script>
import { queryShopGoodsList, queryCheckedGoods } from '@/api/live'
import { queryCategoryListAll } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
import { construct } from '@/utils/json-tree'
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
        }
    },
    data() {
        return {
            list: [],
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            isShow: false,
            searchForm: {
                goods_id: '',
                goods_name: '', // 商品名称
                other_id: '',
                goods_type: '',
                shop_goods_status: '',
                sku_name: '',
                sku_code: '',
                typeCategory: []
            },
            searchParams: {},
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
            skuImgList: [], //sku图预览列表
            checkImgList: [], // 选中图片列表
            checkedSkuIds: [], // 初始选中的sku id集合
            searchList: [],
            showMaxIndex: 0,
            checkedList: [], // 选中商品列表
            labelKey: 1
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
        }
    },
    computed: {
        backGoodsOtherName: function() {
            return data => {
                console.log('data', data)
                let _name = ''
                this.categoryListOther.forEach(ev => {
                    console.log('ev', ev.id)
                    if (ev.id == data) {
                        console.log('ev', ev)
                        _name = ' > ' + ev.name
                    }
                })
                return _name
            }
        },
        backGoodsCategoryName: function() {
            return data => {
                console.log('data', data)
                let _name = ''
                this.categoryListClothGroup.forEach(ev => {
                    console.log('ev', ev.id)
                    if (ev.id == data) {
                        console.log('ev', ev)
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
            ++this.labelKey
            this.checkedList = []
            this.listQuery.page = 1
            this.searchShow = false
            this.$refs['searchForm'].resetFields()
            this.searchParams = _.cloneDeep(this.searchForm)
            this.setSearchValue()
            this.checkedSkuIds = _.cloneDeep(this.checked) // 已选sku ID集合
            this.queryDataAllInit()
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
                    if (res.data.lists && res.data.lists.length > 0) {
                        _.cloneDeep(res.data.lists).forEach(ev => {
                            let goods = _.cloneDeep(ev)
                            this.timgList.push(goods.goods_img)
                            goods.shop_skus.forEach((sku, sku_i) => {
                                this.skuImgList.push(sku.sku_sku_img)
                                sku['skuIsChecked'] = false
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
                            if (goods['skuDisabledNum'] > 0) {
                                goods['isDisabled'] = true
                                goods.shop_skus.forEach((sku, sku_i) => {
                                    sku['isDisabled'] = true
                                })
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

        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.searchParams = _.cloneDeep(this.searchForm)
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
            // 商品名称
            if (this.searchParams['goods_name']) {
                let obj = {
                    label: 'goods_name',
                    val: this.searchParams['goods_name']
                }
                _search.push(obj)
            }
            // 商品id
            if (this.searchParams['goods_id']) {
                let obj = {
                    label: 'goods_id',
                    val: this.searchParams['goods_id']
                }
                _search.push(obj)
            }
            // 级联选择 商品类型+分类
            if (this.searchParams['typeCategory'].length == 1) {
                this.typeList.forEach(ev => {
                    if (ev.value == this.searchParams['typeCategory'][0]) {
                        let obj = {
                            label: 'typeCategory',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            } else if (this.searchParams['typeCategory'].length == 2) {
                let showValue = ''
                this.typeList.forEach(ev => {
                    if (ev.value == this.searchParams['typeCategory'][0]) {
                        showValue = ev.label
                    }
                })

                let _arr = this.categoryListClothGroup.concat(this.categoryListOther)
                _arr.forEach(ev => {
                    if (ev.id == this.searchParams['typeCategory'][1]) {
                        showValue = showValue + '/' + ev.name
                    }
                })
                _search.push({
                    label: 'typeCategory',
                    val: showValue
                })
            } else if (this.searchParams['typeCategory'].length == 3) {
                let showValue = ''
                this.typeList.forEach(ev => {
                    if (ev.value == this.searchParams['typeCategory'][0]) {
                        showValue = ev.label
                    }
                })

                let _arr = this.categoryListClothGroup.concat(this.categoryListOther)
                _arr.forEach(ev => {
                    if (ev.id == this.searchParams['typeCategory'][1]) {
                        showValue = showValue + '/' + ev.name
                    }
                })
                _arr.forEach(ev => {
                    if (ev.id == this.searchParams['typeCategory'][2]) {
                        showValue = showValue + '/' + ev.name
                    }
                })
                _search.push({
                    label: 'typeCategory',
                    val: showValue
                })
            }
            // 商品状态 shop_goods_status
            if (this.searchParams['shop_goods_status']) {
                this.statusList.forEach(ev => {
                    if (ev.value == this.searchParams['shop_goods_status']) {
                        let obj = {
                            label: 'shop_goods_status',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // sku_name
            if (this.searchParams['sku_name']) {
                let obj = {
                    label: 'sku_name',
                    val: this.searchParams['sku_name']
                }
                _search.push(obj)
            }
            // SKU编码
            if (this.searchParams['sku_code']) {
                let obj = {
                    label: 'sku_code',
                    val: this.searchParams['sku_code']
                }
                _search.push(obj)
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
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
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

        // 获取分类列表
        queryDataAllInit() {
            Promise.all([
                // type 1其他 2布组
                queryCategoryListAll({ type: 1 }),
                queryCategoryListAll({ type: 2 }),
                queryCheckedGoods({ sku_ids_in: this.checkedSkuIds })
            ])
                .then(res => {
                    let options = {}
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            this.categoryListOther = res[0].data
                        }
                    }
                    if (res[1].code === 200) {
                        if (res[1].data) {
                            this.categoryListClothGroup = res[1].data
                        }
                    }
                    this.creatCategoryData()
                    if (res[2].code === 200) {
                        if (res[2].data) {
                            const sku_list = res[2].data.datas || []
                            let goodsIds = []
                            sku_list.forEach(sku => {
                                if (goodsIds.indexOf(sku.goods_id) == -1) {
                                    goodsIds.push(sku.goods_id)
                                }
                            })
                        }
                    }

                    this.resetForm('searchForm')
                })
                .catch(() => {})
        },

        // 关闭大图预览
        closePreview() {
            this.dialogVisiblePic = false
        },
        // type 1主图 2sku图 3
        openPreview(img, type, index) {
            if (type == 1) {
                this.previewUrlList = this.timgList
            } else if (type == 2) {
                this.previewUrlList = this.skuImgList
            } else if (type == 3) {
                let _list = []
                img.forEach(item => {
                    _list.push(item.sku_sku_img)
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
                    ev['skuIsChecked'] = false
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
                    return item.goods_id
                })
            }
            let goodsSku = _.cloneDeep(goods_detail)
            // 判断 当前操作的sku 所属商品 是否在 已选商品列表中
            if (checkedGoodsIds.indexOf(goodsSku.goods_id) == -1) {
                this.checkedList.push(goodsSku)
            } else if (checkedGoodsIds.indexOf(goodsSku.goods_id) > -1) {
                let index = checkedGoodsIds.indexOf(goodsSku.goods_id)
                this.$set(this.checkedList, index, goodsSku)
            }
            this.filterGoods()
        },

        // 商品选中/取消
        goodsChecked(bol, row, index) {
            if (row.shop_skus && row.shop_skus.length > 1) {
                row['goodsIsChecked'] = false
                if (bol) {
                    this.$notify({
                        title: '请选择sku',
                        type: 'warning',
                        duration: 5000
                    })
                    // row['goodsIsChecked'] = !bol;
                } else {
                    row.shop_skus.forEach((ev, i) => {
                        if (!ev['isDisabled']) {
                            ev['skuIsChecked'] = false
                        }
                    })
                }
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
                    return item.goods_id
                })
            }
            let goodsSku = _.cloneDeep(row)
            // 判断 当前操作的商品 是否在 已选商品列表中
            if (checkedGoodsIds.indexOf(goodsSku.goods_id) == -1) {
                this.checkedList.push(goodsSku)
            } else if (checkedGoodsIds.indexOf(goodsSku.goods_id) > -1) {
                let index = checkedGoodsIds.indexOf(goodsSku.goods_id)
                this.$set(this.checkedList, index, goodsSku)
            }
            this.filterGoods()
        }
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
