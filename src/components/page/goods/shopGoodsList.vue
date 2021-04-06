<template>
    <div class="app-container goods-list">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">店铺商品</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="店铺名称" prop="shop_id" class="">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="商品名称" prop="name" label-width="">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.name"></el-input>
                        </el-form-item>
                        <el-form-item label="SKU名称" prop="sku_name" label-width="">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.sku_name"></el-input>
                        </el-form-item>
                        <el-form-item label="SKU编码" prop="sku_code" label-width="">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.sku_code"></el-input>
                        </el-form-item>
                        <el-form-item label="商品类型/分类" prop="typeCategory">
                            <el-cascader
                                class="filter-item"
                                :props="{ checkStrictly: true }"
                                v-model="formFilter.typeCategory"
                                placeholder="请选择"
                                :options="typeList"
                            ></el-cascader>
                        </el-form-item>
                        <el-form-item label="是否售罄" prop="status">
                            <el-select class="filter-item" v-model="formFilter.sku_is_store_shortage" placeholder="请选择">
                                <el-option v-for="item in soldoutList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
            <div class="shop-icon shop-filter">
                <img class="shop-img" :src="filterShop.shop_icon" alt="" /><span class="text">{{ filterShop.shop_name }}</span>
            </div>
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
            <el-radio-group v-model="formFilter.status" class="tab-way" @change="onTabClick">
                <el-radio-button :label="2">已上架</el-radio-button>
                <el-radio-button :label="1">已下架</el-radio-button>
            </el-radio-group>
            <el-button type="primary" @click="goodsPuton" class="goods-put">上架商品</el-button>
        </div>
        <div class="divider"></div>

        <el-table
            :height="$tableHeight"
            class="table"
            :data="list"
            v-loading.body="listLoading"
            :header-cell-style="$tableHeaderColor"
            element-loading-text="Loading"
            @selection-change="handleSelectionChange"
            :default-expand-all="false"
            row-key="goods_id"
            :cell-class-name="goodsTable"
            :cell-style="{ background: '#fff' }"
        >
            <el-table-column label="-" type="expand" width="60">
                <template slot-scope="props">
                    <el-table class="sku-table" :data="props.row.goods_sku" :header-cell-style="$tableHeaderColor">
                        <el-table-column label="操作" width="90" v-if="formFilter.status == 2">
                            <template slot-scope="scope">
                                <span class="text-blue cursor" @click="changePrice(props.row, scope.row)">修改价格</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="SKU图片" width="120">
                            <template slot-scope="scope">
                                <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.sku_img, 2, scope.row.skuImgIndex)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="SKU名称">
                            <template slot-scope="scope">
                                <span>{{ scope.row.Title }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="SKU编码">
                            <template slot-scope="scope">
                                <span>{{ scope.row.storehouse_code }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="售价(元)" width="90">
                            <template slot-scope="scope">
                                <span>{{ formatMoney(scope.row.min_price) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="实际销量" width="90">
                            <template slot-scope="scope">
                                <span>{{ scope.row.real_sales }}</span>
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
                                <!--<div class="type-tag type-yellow" v-if="scope.row.stock_available <= scope.row.stock_warning">低库存</div>
                                <div class="type-tag type-blue" v-if="scope.row.stock_available > scope.row.stock_warning">正常</div>-->
                                <div class="type-tag type-yellow" v-if="scope.row.stock_available == 0">售罄</div>
                                <div v-else>否</div>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>

            <el-table-column label="" width="70">
                <template slot-scope="scope">
                    <span>({{ scope.row.onsaleNum }}/{{ scope.row.goods_sku.length }})</span>
                </template>
            </el-table-column>
            <el-table-column type="selection" width="40"> </el-table-column>
            <el-table-column label="商品ID" width="80">
                <template slot-scope="scope">
                    <span>
                        <router-link :to="{ name: 'goods-edit', query: { id: scope.row.goods_id } }">
                            {{ scope.row.goods_id }}
                        </router-link>
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="160">
                <template slot-scope="scope">
                    <div class="opt-wrap">
                        <el-button
                            class="text-blue btn-opt table-btn"
                            type="text"
                            size=""
                            v-show="formFilter.status == 1"
                            v-hasPermission="'mall-backend-shop-goods-on'"
                            @click.native="updateOnShelf(scope.row)"
                        >
                            上架
                        </el-button>
                        <el-button
                            class="text-red btn-opt table-btn"
                            type="text"
                            size=""
                            v-show="formFilter.status == 2"
                            v-hasPermission="'mall-backend-shop-goods-down'"
                            @click.native="updateOffShelf(scope.row)"
                        >
                            下架
                        </el-button>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="主图" width="120">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.img, 1, scope.$index)" />
                </template>
            </el-table-column>
            <el-table-column label="商品名称" width="">
                <template slot-scope="scope">
                    <router-link :to="{ name: 'goods-edit', query: { id: scope.row.goods_id } }">
                        {{ scope.row.title }}
                    </router-link>
                </template>
            </el-table-column>

            <el-table-column label="商品分类" width="">
                <template slot-scope="scope">
                    <span v-if="scope.row.type == 1">布料</span>
                    <span v-if="scope.row.type == 2">
                        其他{{ scope.row.category_id > 0 ? ' > ' + categoryListOther.find(item => item.id == scope.row.category_id).name : '' }}
                    </span>
                    <span v-if="scope.row.type == 3">
                        布组{{ scope.row.category_id > 0 ? ' > ' + categoryListClothGroup.find(item => item.id == scope.row.category_id).name : '' }}
                    </span>
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

        <!-- 店铺上下架 -->
        <el-dialog :visible.sync="dialogVisibleShelf" title="店铺上下架" width="618px" :show-close="false">
            <el-table ref="shelfTable" :data="shelfSku" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
                <el-table-column label="SKU图片" width="">
                    <template slot-scope="scope">
                        <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" />
                    </template>
                </el-table-column>
                <el-table-column label="SKU名称" width="">
                    <template slot-scope="scope">
                        <span>{{ scope.row.title ? scope.row.title : scope.row.Title }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="SKU编码" width="">
                    <template slot-scope="scope">
                        <span>{{ scope.row.storehouse_code }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="售价(元)" width="">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.price" @change="value => onChangePrice(value, scope)" placeholder="请输入内容" style="width:100px"></el-input>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="closeShopShelf">取 消</el-button>
                <el-button type="primary" @click="updateAgentGoodsStatusFn">{{ editSkuPrice ? '确认' : '上架' }}</el-button>
            </span>
        </el-dialog>

        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>
</template>
<script>
import {
    queryStoreProductDetail,
    queryShopList,
    queryCategoryListAll,
    updateAgentGoodsStatus,
    updateAgentGoodsSingle,
    queryAgentGoodsSkuList,
    queryAgentShopGoodsList,
    updateAgentSkuPrice
} from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
import commUtil from '@/utils/commUtil'

export default {
    name: 'goods-list',
    data() {
        return {
            searchShow: false, //搜索表单显示
            list: [],
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },

            goodsId: '',
            shopList: [],
            shopIds: [],
            dialogVisibleAssign: false,
            checkedList: [], //表格选中列表
            // 类型 1 布料 2其他 3成品布
            typeList: [
                { value: 1, label: '布料' },
                { value: 2, label: '其他' },
                { value: 3, label: '布组' }
            ],
            // 售罄 1是 2不是
            soldoutList: [
                {
                    value: 1,
                    label: '是'
                },
                {
                    value: 2,
                    label: '否'
                }
            ],
            // 分类 先选择商品类型 在获取分类列表
            categoryList: [], //筛选列表
            categoryListOther: [], //其他分类
            categoryListClothGroup: [], //布组分类
            // 是否上架：1下架；2上架
            statusList: [
                { value: '1', label: '下架' },
                { value: '2', label: '上架' }
            ],
            saleStatusList: [
                { value: 1, label: '可出售' },
                { value: 2, label: '不可售' }
            ],
            // 是否库存不足 1 足 2 不足(只有当所有sku 全部库存不足 为2
            shortageList: [
                { value: '1', label: '正常' },
                { value: '2', label: '低库存' }
            ],
            // 是否所有代理可以销售：1指定代理；2所有代理可以销售
            agentList: [
                { value: '1', label: '指定店铺' },
                { value: '2', label: '所有店铺都可以' }
            ],

            reasonList: [],

            formFilter: {
                shop_id: 1,
                name: '',
                sku_name: '',
                sku_code: '',
                sku_is_store_shortage: '',
                status: 2, //1下架；2上架；

                other_id: '',
                goods_type: '',
                typeCategory: [] //cache数据
            },
            // 图片预览
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            timgList: [], //主图预览列表
            skuImgList: [], //sku图预览列表
            searchList: [],
            showMaxIndex: 0,

            filterShop: {},
            edidGoodsId: '',
            editSkuPrice: '', //true修改sku单个价格操作 false修改价格并上架操作
            // 店铺上下架参数

            dialogVisibleShelf: false,

            shelfSku: []
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
    async mounted() {
        this.queryCategoryListAllInit()
        await this.queryShopList()
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,

        goodsTable(row) {
            if (row.columnIndex == 2) {
                return 'checkboxColumn'
            }
        },

        closePreview() {
            this.dialogVisiblePic = false
        },
        // type 1主图 2sku图
        openPreview(img, type, index) {
            console.log('输出 ~ img, type, index', img, type, index)
            if (type == 1) {
                this.previewUrlList = this.timgList
            } else {
                this.previewUrlList = this.skuImgList
            }
            this.previewIndex = index
            this.dialogVisiblePic = true
        },
        getList() {
            const rLoading = this.openLoading()
            let params = _.cloneDeep(this.$refs['formFilter'].model)
            console.log('GOOGLE: params', params)
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            this.filterShop = this.shopList.find(item => item.id == params['shop_id'])
            if (params['typeCategory'].length == 1) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = ''
            } else if (params['typeCategory'].length == 2) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = params['typeCategory'][1]
            } else {
                params['goods_type'] = ''
                params['other_id'] = ''
            }
            if (params['goods_type'] == 1) {
                params['other_id'] = 0
            }

            queryAgentShopGoodsList(params)
                .then(async res => {
                    if (res.data.lists == null) {
                        this.list = res.data.lists || []
                        this.total = res.data.total || 0
                        rLoading.close()
                        return
                    }
                    // 逐个获取库存信息 同时生成主图 sku图预览列表
                    let skuImgIndex = 0
                    this.timgList = []
                    this.skuImgList = []
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const product = res.data.lists[i]
                        this.timgList.push(product.img)

                        // 获取sku
                        let paramsSku = {
                            shop_id: this.formFilter.shop_id,
                            goods_id: product.goods_id
                        }
                        let dataSku = await queryAgentGoodsSkuList(paramsSku)
                        product.goods_sku = _.cloneDeep(dataSku.data.goods_sku_data)
                        if (!product.goods_sku) {
                            continue
                        }
                        product.onsaleNum = product.goods_sku.filter(item => item.status == 2).length

                        for (let j = 0; j < product.goods_sku.length; j++) {
                            const sku = product.goods_sku[j]
                            let parameters = { sku_id: sku.storehouse_pid }
                            let data = await queryStoreProductDetail(parameters)
                            this.skuImgList.push(sku.sku_img)
                            sku.skuImgIndex = skuImgIndex
                            skuImgIndex++
                            sku.stock_total = data.data.stock_total
                            sku.stock_available = data.data.stock_available
                        }
                    }

                    console.log('输出 ~ res.data.lists', res.data.lists)
                    this.list = res.data.lists
                    console.log('输出 ~  this.list', this.list)
                    this.total = res.data.total
                    rLoading.close()
                })
                .catch(err => {
                    rLoading.close()
                })
        },
        // 选择类型
        //1 其他 2 成品布
        onChangeType(event) {
            let type = event == 2 ? 1 : 2
            this.queryCategoryListAll(type)
            this.formFilter.category_id = ''
        },
        // 获取分类列表
        queryCategoryListAll(type) {
            if (type == 1) {
                this.categoryList = this.categoryListOther
            } else {
                this.categoryList = this.categoryListClothGroup
            }
        },

        // 获取分类列表
        goodsPuton() {
            this.$confirm('您可以在商品列表页进行操作?', '', {
                confirmButtonText: '去操作',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    console.log('输出 ~ router')

                    this.$router.push('/mall-backend-goods-list')
                })
                .catch(() => {})
        },
        // 生成类型 分类 级联列表
        creatCategoryData() {
            this.typeList = [
                { value: 1, label: '布料', children: [] },
                {
                    value: 2,
                    label: '其他',
                    children: _.cloneDeep(this.categoryListOther).map(item => {
                        return { label: item.name, value: Number(item.id) }
                    })
                },
                {
                    value: 3,
                    label: '布组',
                    children: _.cloneDeep(this.categoryListClothGroup).map(item => {
                        return { label: item.name, value: Number(item.id) }
                    })
                }
            ]
            console.log('输出 ~ this.typeList', this.typeList)
        },

        queryCategoryListAllInit() {
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
                })
                .catch(() => {})
        },

        // 代理店铺列表

        queryShopList() {
            return new Promise((resolve, reject) => {
                queryShopList()
                    .then(res => {
                        this.shopList = res.data
                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        },

        goodsPreview(id) {
            this.$router.push({
                name: 'goods-preview',
                query: {
                    id: id
                }
            })
        },

        handleSelectionChange(val) {
            this.checkedList = val
            console.log('GOOGLE: val', val)
        },
        // 搜索
        handleFilter() {
            this.setSearchValue()
            this.listQuery.page = 1
            this.getList()
            this.searchShow = false
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields()
            console.log(this.$refs[formName].model)
            this.handleFilter()
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            // 商品名称
            if (this.formFilter['name']) {
                let obj = {
                    label: 'name',
                    val: this.formFilter['name']
                }
                _search.push(obj)
            }
            // sku名称
            if (this.formFilter['sku_name']) {
                let obj = {
                    label: 'sku_name',
                    val: this.formFilter['sku_name']
                }
                _search.push(obj)
            }
            // sku编码
            if (this.formFilter['sku_code']) {
                let obj = {
                    label: 'sku_code',
                    val: this.formFilter['sku_code']
                }
                _search.push(obj)
            }
            // 是否售罄
            if (this.formFilter['sku_is_store_shortage']) {
                this.soldoutList.forEach(ev => {
                    console.log('输出 ~ ev', ev)
                    console.log('输出 ~ this.formFilter[]', this.formFilter['sku_is_store_shortage'])
                    if (ev.value == this.formFilter['sku_is_store_shortage']) {
                        let obj = {
                            label: 'sku_is_store_shortage',
                            val: '售罄:' + ev.label
                        }
                        console.log('输出 ~ obj', obj)
                        _search.push(obj)
                    }
                })
            }
            // 级联选择 商品类型+分类
            if (this.formFilter['typeCategory'].length == 1) {
                this.typeList.forEach(ev => {
                    if (ev.value == this.formFilter['typeCategory'][0]) {
                        let obj = {
                            label: 'type',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            } else if (this.formFilter['typeCategory'].length == 2) {
                let showValue = ''
                this.typeList.forEach(ev => {
                    if (ev.value == this.formFilter['typeCategory'][0]) {
                        showValue = ev.label
                    }
                })

                let _arr = this.categoryListClothGroup.concat(this.categoryListOther)
                _arr.forEach(ev => {
                    if (ev.id == this.formFilter['typeCategory'][1]) {
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
            console.log('item', item)
            this.$set(this.formFilter, item.label, '')
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
        // tab
        onTabClick() {
            this.listQuery.page = 1
            this.getList()
        },
        // 打开店铺上下架弹窗
        // openShopShelf(row) {
        //     let sku = _.cloneDeep(row.goods_sku)
        //     this.shelfSku = sku.map(item => {
        //         item.price = item.min_price / 100
        //         return item
        //     })
        //     this.formShelf.goods_id = row.id
        //     this.dialogVisibleShelf = true

        //     this.$nextTick(() => {
        //         this.$refs['shelfTable'].doLayout()
        //     })
        // },
        closeShopShelf() {
            // this.$refs['formShelf'].resetFields()
            this.dialogVisibleShelf = false
        },

        // sku修改价格 打开弹窗
        async changePrice(goods, sku) {
            console.log('输出 ~ sku', sku)
            console.log('输出 ~ goods', goods)
            let paramsSku = {
                shop_id: this.formFilter.shop_id,
                goods_id: goods.goods_id
            }
            let dataSku = await queryAgentGoodsSkuList(paramsSku)
            console.log('输出 ~ dataSku', dataSku)
            let skuList = dataSku.data.goods_sku_data.filter(item => item.id == sku.id)
            console.log('输出 ~ skuList', skuList)
            skuList = skuList.map((item, index) => {
                item.price = item.goods_sku_price != 0 ? item.goods_sku_price : item.min_price
                item.price = item.price / 100
                return item
            })
            this.shelfSku = _.cloneDeep(skuList)
            this.dialogVisibleShelf = true
            this.editSkuPrice = true
        },
        // 监听价格输入框
        onChangePrice(value, scope) {
            this.$set(this.shelfSku[scope.$index], 'price', value)
        },
        // 商品修改价格并上架 打开弹窗
        async updateOnShelf(goods) {
            let paramsSku = {
                shop_id: this.formFilter.shop_id,
                goods_id: goods.goods_id
            }
            let skuList = await queryAgentGoodsSkuList(paramsSku)
            skuList = skuList.data.goods_sku_data.map(item => {
                item.price = item.goods_sku_price != 0 ? item.goods_sku_price : item.min_price
                item.price = item.price / 100
                return item
            })
            this.shelfSku = _.cloneDeep(skuList)
            this.dialogVisibleShelf = true
            this.editSkuPrice = false
            this.edidGoodsId = goods.goods_id
        },
        // 商品下架
        updateOffShelf(goods) {
            this.$confirm('确认要下架该商品吗?', '', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        shop_id: this.formFilter.shop_id,
                        goods_id: goods.goods_id,
                        status: 1 //1下架；2上架；
                    }
                    updateAgentGoodsStatus(params)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '店铺商品下架成功',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.getList()
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                            rLoading.close()
                        })
                        .catch(err => {})
                })
                .catch(() => {})
        },
        // 店铺上架 / 修改sku价格
        updateAgentGoodsStatusFn() {
            const rLoading = this.openLoading()
            let shelfSku = _.cloneDeep(this.shelfSku)

            // 验证价格
            for (let i = 0; i < shelfSku.length; i++) {
                const element = shelfSku[i]
                if (element.price > 0) {
                } else {
                    this.$notify({
                        title: '请输入正确价格',
                        type: 'warning',
                        duration: 5000
                    })
                    rLoading.close()
                    return
                }
            }
            // 修改sku单个价格
            if (this.editSkuPrice) {
                let sku = shelfSku[0]
                let params = { id: sku.id, new_price: commUtil.numberMul(Number(sku.price), 100) }
                updateAgentSkuPrice(params)
                    .then(res => {
                        console.log('GOOGLE: res', res)
                        if (res.code == 200) {
                            this.$notify({
                                title: '店铺商品SKU价格修改成功',
                                type: 'success',
                                duration: 3000
                            })
                            // this.dialogVisibleAssign = false
                            // this.closeShopShelf()
                        } else {
                            this.$notify({
                                title: res.msg,
                                type: 'warning',
                                duration: 5000
                            })
                        }
                        rLoading.close()
                    })
                    .catch(err => {})
            } else {
                let skus = shelfSku.map(item => {
                    return {
                        id: item.id,
                        price: commUtil.numberMul(Number(item.price), 100)
                    }
                })
                let params = {
                    shop_id: this.formFilter.shop_id,
                    goods_id: this.edidGoodsId,
                    is_top: 1, //'是否置顶 1:否 2:是'
                    skus: skus
                }
                updateAgentGoodsSingle(params)
                    .then(res => {
                        console.log('GOOGLE: res', res)
                        if (res.code == 200) {
                            this.$notify({
                                title: '店铺商品上架成功',
                                type: 'success',
                                duration: 3000
                            })
                            // this.dialogVisibleAssign = false
                            this.closeShopShelf()
                        } else {
                            this.$notify({
                                title: res.msg,
                                type: 'warning',
                                duration: 5000
                            })
                        }
                        rLoading.close()
                    })
                    .catch(err => {})
            }
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.timg {
    width: 80px;
    height: 60px;
    // max-height: 200px;
    cursor: pointer;
}
.opt-wrap {
    margin-top: 7px;
    .btn-opt {
    }
}

.goods-put {
    margin-right: 32px;
}
.table-title {
    position: relative;
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
        top: 63px;
        z-index: 9;
        // border: 1px solid #000;
        border-radius: 2px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
        // transition: all 3s ease-in-out;
    }
}
.slide-fade-enter-active {
    transition: all 0.3s ease;
}
.slide-fade-leave-active {
    transition: all 0.3s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-30px);
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
.sku-table {
    box-sizing: border-box;
    margin: 0px 138px;
    max-width: calc(100% - 138px);
}
.goods-list .table /deep/ .el-table__expand-icon > .el-icon {
    margin-top: -10px;
}
.goods-list .table /deep/ .el-table__expand-icon--expanded {
    transform: rotate(0deg);
}
.goods-list .table /deep/ .el-icon-arrow-right:before {
    color: #1890ff;
    content: '\e61a';
    font-size: 19px;
    font-family: 'iconfont';
}
.goods-list .table /deep/ .el-table__expand-icon--expanded .el-icon-arrow-right:before {
    color: #6d7278;
    content: '\e617';
}

.cursor {
    cursor: pointer;
}
.goods-list .table /deep/ .el-table__body tr:hover > td {
    background-color: #fff !important;
}
.goods-list .table .sku-table /deep/ .el-table__body tr:hover > td {
    background-color: #f6faff !important;
}
.goods-list .table /deep/ .el-table__expanded-cell {
    padding: 0 !important;
}
.shop-icon {
    display: flex;
    margin-left: 23px;
    padding: 0 10px;
    height: 30px;
    border-radius: 15px;
    background: #ffffff;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
    font-weight: 500;
    font-size: 14px;
    line-height: 30px;
    &.shop-all {
        color: #1890ff;
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .icon-shop {
            margin-right: 6px;
        }
    }
    &.shop-filter {
        color: rgba(0, 0, 0, 0.85);
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .shop-img {
            margin-top: 5px;
            margin-right: 6px;
            width: 20px;
            height: 20px;
            border-radius: 10px;
        }
    }
}
.tab-way {
    margin-right: 10px;
}
</style>
<style lang="less">
.goods-list {
    .checkboxColumn {
        .cell {
            padding-left: 10px;
        }
    }
}
</style>
