<template>
    <div class="dialog-container" @click="searchShow = false">
        <el-dialog :visible.sync="isShow" width="90%" @open="open" @opened="opened" @close="closed">
            <div slot="title">
                <div class="table-title">
                    <div class="text">挑选赠品</div>
                    <div class="grey-line"></div>
                    <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                    <transition name="slide-fade">
                        <div class="head-container" v-show="searchShow" @click.stop="">
                            <el-form ref="searchForm" :model="searchForm" class="form-filter" :inline="true" size="small" label-position="left">
                                <el-form-item label="商品名称" prop="title" label-width="">
                                    <el-input class="filter-item" placeholder="请输入" v-model="searchForm.title"></el-input>
                                </el-form-item>
                                <el-form-item label="商品ID" prop="id">
                                    <el-input class="filter-item" placeholder="请输入" v-model="searchForm.id"></el-input>
                                </el-form-item>
                                <el-form-item label="商品分类" prop="typeCategory">
                                    <el-cascader
                                            class="filter-item"
                                            :props="{ checkStrictly: true }"
                                            v-model="searchForm.typeCategory"
                                            placeholder="请选择"
                                            :options="typeList"
                                    ></el-cascader>
                                </el-form-item>
                                <el-form-item label="商品状态" prop="status">
                                    <el-select class="filter-item" v-model="searchForm.status" placeholder="请选择">
                                        <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="出售状态" prop="is_sale">
                                    <el-select class="filter-item" v-model="searchForm.is_sale" placeholder="请选择">
                                        <el-option v-for="item in saleStatusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="SKU名称" prop="sku_name" class="">
                                    <el-input class="filter-item" v-model="searchForm.sku_name" placeholder="请输入"></el-input>
                                </el-form-item>
                                <el-form-item label="SKU编码" prop="storehouse_code" class="">
                                    <el-input class="filter-item" v-model="searchForm.storehouse_code" placeholder="请输入"></el-input>
                                </el-form-item>
                                <el-form-item label="会员折扣" prop="discount_condition">
                                    <el-select class="filter-item" v-model="searchForm.discount_condition" placeholder="请选择">
                                        <el-option v-for="item in discountList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                                    </el-select>
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
                                    <template v-if="item.goods_sku.length > 0">
                                        <div class="item-content">
                                            <span class="iconfont icon-plus" v-show="!item.open" @click="triggerImg(item)"></span>
                                            <span class="iconfont icon-minus" v-show="item.open" @click="triggerImg(item)"></span>
                                            <div class="name">{{ item.title }}</div>
                                            <i class="el-icon-error row-delete" v-if="!item.isDisabled" @click="cancelSelection(item)"></i>
                                        </div>
                                        <div class="son" v-show="item.open">
                                            <template v-for="(sku, sku_i) in item.goods_sku">
                                                <div class="son-item" v-if="sku.skuIsChecked">
                                                    <img alt="" class="son-timg" :src="sku.sku_img + '!upyun520/fw/300'" @click="openPreview(item.goods_sku, 3, sku_i)" />
                                                    <div class="name">{{ sku.title }}</div>
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
                    row-key="id"
                    :cell-class-name="goodsTable"
                    :cell-style="{ background: '#fff' }"
                >
                    <el-table-column label="-" type="expand" width="55">
                        <template slot-scope="props">
                            <el-table class="sku-table" :data="props.row.goods_sku" :header-cell-style="$tableHeaderColor">
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
                                            :src="scope.row.sku_img + '!upyun520/fw/300'"
                                            alt=""
                                            @click="openPreview(scope.row.sku_img, 2, scope.row.skuImgIndex)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column label="SKU名称">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.title }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="SKU编码">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.storehouse_code }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="实际销量" width="90">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.real_sales }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="售价(元)" width="90">
                                    <template slot-scope="scope">
                                        <span>{{ formatMoney(scope.row.min_price) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="总库存" width="90">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.stock_total }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="可用库存" width="90">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.stock_available }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="是否售罄" width="90">
                                    <template slot-scope="scope">
                                        <div class="type-tag type-yellow" v-if="scope.row.is_store_shortage == 2">售罄</div>
                                        <div class="type-tag type-blue" v-else>否</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="会员折扣" width="90">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.user_discount == 0">是</span>
                                        <span v-else-if="scope.row.user_discount == 1">否</span>
                                        <span v-else>{{ commUtil.numberMul(Number(scope.row.user_discount), 10) }}折</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>

                    <el-table-column label="" width="70">
                        <template slot-scope="scope">
<!--                            <span>({{ scope.row.checkNum }}/{{ scope.row.goods_sku.length }})</span>-->
                            <span>({{ scope.row.checkNum || 0 }}/{{ scope.row.goods_sku.length }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="" width="35">
                        <template slot-scope="scope">
                            <!-- :indeterminate="0 < scope.row.checkNum && scope.row.checkNum < scope.row.goods_sku.length" -->
                            <el-checkbox
                                v-model="scope.row.goodsIsChecked"
                                :disabled="scope.row.isDisabled"
                                :indeterminate="0 < scope.row.checkNum && scope.row.checkNum < scope.row.goods_sku.length"
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
                            <img class="timg" :src="scope.row.img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.img, 1, scope.$index)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="商品名称">
                        <template slot-scope="scope">
                            <span>{{ scope.row.title }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="商品分类" width="180">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type == 1">布料</span>
                            <span v-if="scope.row.type == 2"> 其他{{ categoryGenerate(scope.row.category_id, 2) }} </span>
                            <span v-if="scope.row.type == 3"> 布组{{ categoryGenerate(scope.row.category_id, 3) }} </span>
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
                    <el-table-column label="出售状态" width="110">
                        <template slot-scope="scope">{{ scope.row.is_sale == 1 ? '可出售' : '不可售' }}</template>
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
import { queryGoodsListNew, queryShopList, queryCategoryListAll } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
import { construct } from '@/utils/json-tree'
import commUtil from '@/utils/commUtil'
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
                id: '',
                title: '',
                category_id: '',
                type: '',
                status: '',
                is_sale: '',
                is_store_shortage: '',
                allow_agent: '',
                storehouse_code: '',
                typeCategory: [], //cache数据
                discount_condition: ''
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
                goods_item.goods_sku.forEach((sku_item, i) => {
                    if (ids.indexOf(sku_item.id) > -1) {
                        sku_item.skuIsChecked = false
                    }
                })
                goods_item['checkNum'] = goods_item.goods_sku.filter(item => item.skuIsChecked).length
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
        /*getList() {
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
        },*/

        getList() {
            const rLoading = this.openLoading()
            let params = _.cloneDeep(this.searchParams)
            // let params = _.cloneDeep(this.$refs['searchForm'].model)
            console.log('GOOGLE: params', params)
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            if (params['typeCategory'].length == 1) {
                params['type'] = params['typeCategory'][0]
                params['category_id'] = ''
            } else if (params['typeCategory'].length == 2) {
                params['type'] = params['typeCategory'][0]
                params['category_id'] = params['typeCategory'][1].toString()
            } else if (params['typeCategory'].length == 3) {
                params['type'] = params['typeCategory'][0]
                params['category_id'] = params['typeCategory'][2].toString()
            } else {
                params['type'] = ''
                params['category_id'] = ''
            }
            // params['category_id'] = params['category_id'].toString()
            if (params['type'] == 1) {
                params['category_id'] = 0
            }
            if (params['discount_condition'] == '') {
                params['discount_condition'] = 0
            }

            queryGoodsListNew(params)
                .then(async res => {
                    console.log('输出 ~ res', res)
                    if (res.data.goods_list == null) {
                        this.list = []
                        this.total = 0
                        rLoading.close()
                        return
                    }
                    // 拼合goods和sku
                    let goods = _.cloneDeep(res.data.goods_list)
                    let sku = _.cloneDeep(res.data.goods_sku_list)
                    for (let i = 0; i < goods.length; i++) {
                        const goodsItem = goods[i]
                        goodsItem.goods_sku = []
                        for (let j = 0; j < sku.length; j++) {
                            const skuItem = sku[j]
                            if (goodsItem.id == skuItem.goods_id) {
                                goodsItem.goods_sku.push(skuItem)
                            }
                        }
                    }
                    // 逐个获取库存信息 同时生成主图 sku图预览列表
                    let skuImgIndex = 0
                    this.timgList = []
                    this.skuImgList = []
                    let goods_list = []
                    let new_sku_ids = [] // 新加sku id集合
                    this.checkedList.forEach(goods_item => {
                        goods_item.goods_sku.forEach(sku_item => {
                            if (sku_item.skuIsChecked) {
                                new_sku_ids.push(sku_item.id)
                            }
                        })
                    })
                    for (let i = 0; i < goods.length; i++) {
                        const product = goods[i]

                        this.timgList.push(product.img)
                        if (!product.goods_sku) {
                            product.goods_sku = []
                            continue
                        }
                        product.onsaleNum = product.goods_sku.filter(item => item.status == 2).length
                        for (let j = 0; j < product.goods_sku.length; j++) {
                            const sku = product.goods_sku[j]
                            sku['skuIsChecked'] = false
                            if (this.checkedSkuIds.indexOf(sku.id) > -1) {
                                sku['skuIsChecked'] = true
                                sku['isDisabled'] = true
                            }
                            if (new_sku_ids.indexOf(sku.id) > -1) {
                                sku['skuIsChecked'] = true
                            }
                            this.skuImgList.push(sku.sku_img)
                            sku.skuImgIndex = skuImgIndex
                            skuImgIndex++
                        }
                        product['checkNum'] = product.goods_sku.filter(item => item.skuIsChecked).length
                        product['skuDisabledNum'] = product.goods_sku.filter(item => item.isDisabled).length
                        if (product['checkNum'] > 0) {
                            product['goodsIsChecked'] = true
                        }
                        product['isDisabled'] = false
                        if (product['skuDisabledNum'] > 0) {
                            product['isDisabled'] = true
                            product.goods_sku.forEach((sku, sku_i) => {
                                sku['isDisabled'] = true
                            })
                        }
                        goods_list.push(product)
                    }
                    this.list = goods
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
            if (this.searchParams['title']) {
                let obj = {
                    label: 'title',
                    val: this.searchParams['title']
                }
                _search.push(obj)
            }
            // id
            if (this.searchParams['id']) {
                let obj = {
                    label: 'id',
                    val: this.searchParams['id']
                }
                _search.push(obj)
            }
            // 级联选择 商品类型+分类
            if (this.searchParams['typeCategory'].length == 1) {
                this.typeList.forEach(ev => {
                    if (ev.value == this.searchParams['typeCategory'][0]) {
                        let obj = {
                            label: 'type',
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

            if (this.searchParams['status']) {
                this.statusList.forEach(ev => {
                    if (ev.value == this.searchParams['status']) {
                        let obj = {
                            label: 'status',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // 出售状态 is_sale
            if (this.searchParams['is_sale']) {
                this.saleStatusList.forEach(ev => {
                    if (ev.value == this.searchParams['is_sale']) {
                        let obj = {
                            label: 'is_sale',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }

            // 是否售罄
            if (this.searchParams['is_store_shortage']) {
                this.shortageList.forEach(ev => {
                    if (ev.value == this.searchParams['is_store_shortage']) {
                        let obj = {
                            label: 'is_store_shortage',
                            val: '售罄:' + ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // 是否指定店铺 allow_agent
            if (this.searchParams['allow_agent']) {
                this.agentList.forEach(ev => {
                    if (ev.value == this.searchParams['allow_agent']) {
                        let obj = {
                            label: 'allow_agent',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // SKU编码
            if (this.searchParams['storehouse_code']) {
                let obj = {
                    label: 'storehouse_code',
                    val: this.searchParams['storehouse_code']
                }
                _search.push(obj)
            }
            // 会员折扣
            if (this.searchParams['discount_condition']) {
                this.discountList.forEach(ev => {
                    if (ev.value == this.searchParams['discount_condition']) {
                        let obj = {
                            label: 'discount_condition',
                            val: '折扣:' + ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // console.log('_search', _search)
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
                    const ids = element.goods_sku.map(item => {
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
                    for (let j = 0; j < element.goods_sku.length; j++) {
                        const skuElement = element.goods_sku[j]
                        if (sku.id == skuElement.id) {
                            element.goods_sku.splice(j, 1)
                            const ids = [sku.id]
                            this.refreshSelection(ids)
                        }
                    }
                    // 没有选中图片时 删除组
                    if (element.goods_sku.length == 0) {
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
                goods_item.goods_sku.forEach(sku_item => {
                    if (sku_item.skuIsChecked && !sku_item.isDisabled) {
                        sku_item['goods_title'] = goods_item.title
                        sku_item['goods_img'] = goods_item.img
                        // sku_item['new_title'] = ''
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
                queryCategoryListAll({ type: 2 })
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
                    this.resetForm('searchForm')
                })
                .catch(() => {})
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
            goods_detail.goods_sku.forEach((ev, i) => {
                if (!ev.isDisabled) {
                    // ev['skuIsChecked'] = false
                }
            })
            row['skuIsChecked'] = bol
            goods_detail['checkNum'] = goods_detail.goods_sku.filter(item => item.skuIsChecked).length
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
            console.log('goodsSku====1055', goodsSku)
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
            if (row.goods_sku && row.goods_sku.length > 1) {
                // row['goodsIsChecked'] = false
                row.goods_sku.forEach((ev, i) => {
                    if (!ev['isDisabled']) {
                        ev['skuIsChecked'] = bol
                    }
                })
            } else if (row.goods_sku && row.goods_sku.length == 1) {
                if (!row.isDisabled) {
                    row['goodsIsChecked'] = bol
                    row.goods_sku.forEach((ev, i) => {
                        if (!ev['isDisabled']) {
                            ev['skuIsChecked'] = bol
                        }
                    })
                }
            }
            let sku_checked_num = row.goods_sku.filter(item => item.skuIsChecked).length
            row['checkNum'] = sku_checked_num
            let checkedGoodsIds = [] // 选中商品id集合
            if (this.checkedList.length > 0) {
                checkedGoodsIds = this.checkedList.map(item => {
                    return item.id
                })
            }
            let goodsSku = _.cloneDeep(row)
            console.log('goodsSku====1103', goodsSku)
            // 判断 当前操作的商品 是否在 已选商品列表中
            if (checkedGoodsIds.indexOf(goodsSku.id) == -1) {
                this.checkedList.push(goodsSku)
            } else if (checkedGoodsIds.indexOf(goodsSku.id) > -1) {
                let index = checkedGoodsIds.indexOf(goodsSku.id)
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
