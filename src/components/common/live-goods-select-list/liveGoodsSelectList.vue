<template>
    <!-- dialog 商品列表 -->
    <div>
        <el-dialog :visible.sync="isShow" width="90%" @open="open" @opened="opened">
            <template slot="title">
                <div class="table-title">
                    <div class="text">直播商品</div>
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
                                <el-form-item label="商品类型" prop="type">
                                    <el-select class="filter-item" v-model="searchForm.type" placeholder="请选择" @change="onChangeType">
                                        <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="商品分类" prop="category_id">
                                    <el-select class="filter-item" v-model="searchForm.category_id" placeholder="请选择" :disabled="searchForm.type == 1">
                                        <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                                    </el-select>
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
                                <el-form-item label="SKU名称" prop="storehouse_code" class="">
                                    <el-input class="filter-item" v-model="searchForm.storehouse_name" placeholder="请输入"></el-input>
                                </el-form-item>
                                <el-form-item label="SKU编码" prop="storehouse_code" class="">
                                    <el-input class="filter-item" v-model="searchForm.storehouse_code" placeholder="请输入"></el-input>
                                </el-form-item>
                                <el-form-item class="form-item-btn" label="">
                                    <el-button class="filter-btn" size="" type="" @click="resetForm('searchForm')">重置</el-button>
                                    <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </transition>
                    <div class="selected-goods-btn">
                        <el-popover placement="bottom-end" width="300" trigger="click" popper-class="group-popper">
                            <div class="row-list">
                                <span v-if="checkedList.length == 0">无数据</span>
                                <div class="row-item" v-for="item in checkedList" :key="item.id">
                                    <div class="name">{{ item.name ? item.name : item.title }}</div>
                                    <i class="el-icon-error row-delete" @click="cancelSelection(item)"></i>
                                </div>
                            </div>
                            <el-button slot="reference" class="filter-btn" size="" type="success" style="margin-left:20px">已选商品</el-button>
                        </el-popover>
                    </div>

                </div>
            </template>
            <div class="app-container" @click="searchShow = false">
                <el-table
                        ref="multipleTable"
                        :height="$tableHeight"
                        class="table"
                        :data="list"
                        v-loading.body="listLoading"
                        :header-cell-style="$tableHeaderColor"
                        element-loading-text="Loading"
                        @selection-change="handleSelectionChange"
                        :default-expand-all="false"
                        row-key="id"
                        :cell-class-name="goodsTable"
                        :cell-style="{ background: '#fff' }"
                >
                    <el-table-column label="-" type="expand" width="55">
                        <template slot-scope="props">
                            <el-table
                                    :ref="'skuTable_'+ props.row.id"
                                    class="sku-table"
                                    :data="props.row.goods_sku"
                                    :header-cell-style="$tableHeaderColor"
                            >
                                <el-table-column label="" width="50">
                                    <template slot-scope="scope">
                                        <el-checkbox  @change="skuChecked(scope.row,scope.$index,props.row,props.$index)" v-model="scope.row.skuIsChecked"></el-checkbox>
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
                                        <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.sku_img, 2, scope.row.skuImgIndex)" />
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
                                <el-table-column label="库存预警" width="90">
                                    <template slot-scope="scope">
                                        <div class="type-tag type-yellow" v-if="scope.row.stock_available <= scope.row.stock_warning">低库存</div>
                                        <div class="type-tag type-blue" v-if="scope.row.stock_available > scope.row.stock_warning">正常</div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>

                    <el-table-column label="" width="70">
                        <template slot-scope="scope">
                            <span>({{ scope.row.checkNum }}/{{ scope.row.goods_sku.length }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="" width="50">
                        <template slot-scope="scope">
                            <el-checkbox
                                    @change="goodsChecked(scope.row,scope.$index)"
                                    v-model="scope.row.goodsIsChecked"
                                    :indeterminate="0 < scope.row.checkNum && scope.row.checkNum < scope.row.goods_sku.length"
                            ></el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="45"></el-table-column>
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
                            <span>{{ scope.row.title }}{{scope.row.checkNum}}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="商品分类" width="180">
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
                <el-button @click="close">取 消</el-button>
                <el-button type="primary" @click="save">确定</el-button>
            </div>
        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>

</template>

<script>
import {  queryProduceList, getLabelAllList, queryProduceDetail, queryTagListAll, queryGroupList, queryStoreCategoryList } from '@/api/goods'
import {
    queryGoodsList,
    queryStoreProduct,
    updateAllow,
    updateGoodsStatus,
    updateGoodsAssign,
    queryShopList,
    queryCategoryListAll,
    queryGoodsDetail,
    updateGoods,
    updateSkuStatus
} from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
export default {
    name: 'CheckList',
    props: {
        checkedSku: {
            type: Array,
            default: []
        },
        //type 商城123 仓库012 以012格式传到此处
        type: {
            type: Number,
            default: 1
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
            checkedList: [],
            searchForm: {
                id: '',
                title: '',
                category_id: '',
                type: '',
                status: '',
                is_sale: '',
                sku_name: '',
                sku_code: ''
            },
            searchParams: {},
            searchShow: false,
            // 类型 1 布料  2其他 3成品布
            typeList: [
                { value: '1', label: '布料' },
                { value: '2', label: '其他' },
                { value: '3', label: '布组' }
            ],
            categoryList:[],
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
            // 图片预览
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            timgList: [], //主图预览列表
            skuImgList: [], //sku图预览列表
            sku_select_list:[212,213,214,219,225,238,244,249,252,265,266,267]
        }
    },
    components: {
        ElImageViewer,
        EmptyList
    },
    created() {},
    mounted() {
        // this.getList();
    },
    methods: {
        formatMoney: formatMoney,
        goodsTable(row) {
            if (row.columnIndex == 2) {
                return 'checkboxColumn'
            }
        },
        open() {
            // this.getList();
        },
        opened() {
            this.queryCategoryListAllInit()
            this.searchParams = _.cloneDeep(this.searchForm);
            this.getList();

            // this.$refs.multipleTable.clearSelection()
            // let list = this.checkedSku.map(item => {
            //     return {
            //         id: item.storehouse_pid,
            //         title: item.title
            //     }
            // })
            // list.forEach(row => {
            //     this.$refs.multipleTable.toggleRowSelection(row)
            // })
        },
        toggleSelection() {
            this.checkedList.forEach(row => {
                this.$refs.multipleTable.toggleRowSelection(row)
            })
        },
        refreshSelection() {
            let firstRow = this.list[0]
            let state = this.checkedList.some(item => item.id == firstRow.id)

            this.$nextTick(() => {
                // 为触发selection-change
                this.$refs.multipleTable.toggleRowSelection(this.list[0], !state)
                this.$refs.multipleTable.toggleRowSelection(this.list[0], state)
            })

        },
        cancelSelection(row) {
            if (row) {
                this.$refs.multipleTable.toggleRowSelection(row, false)
                // this.checkedList.forEach(row => {
                //     this.$refs.multipleTable.toggleRowSelection(row, false);
                //     this.getList();
                // });
            }
        },

        getList() {
            const rLoading = this.openLoading()
            let params = _.cloneDeep(this.searchParams)
            console.log('GOOGLE: params', params)
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            params['category_id'] = params['category_id'].toString()
            if (params['type'] == 1) {
                params['category_id'] = 0
            }
            queryGoodsList(params)
                .then(async res => {
                    if (res.data.lists == null) {
                        this.list = res.data.lists
                        this.total = res.data.total
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
                        if (!product.goods_sku) {
                            continue
                        }

                        product.onsaleNum = product.goods_sku.filter(item => item.status == 2).length
                        for (let j = 0; j < product.goods_sku.length; j++) {
                            const sku = product.goods_sku[j]
                            let parameters = { sku_id: sku.storehouse_pid }
                            let data = await queryStoreProduct(parameters)
                            this.skuImgList.push(sku.sku_img)
                            sku.skuImgIndex = skuImgIndex
                            skuImgIndex++
                            sku.stock_total = data.data.stock_total
                            sku.stock_available = data.data.stock_available;
                            sku['skuIsChecked'] = false;
                            if(this.sku_select_list.indexOf(sku.id) > -1){
                                sku['skuIsChecked'] = true;
                            }
                            console.log('sku', sku);
                        }
                        product['checkNum'] = product.goods_sku.filter(item => item.skuIsChecked).length;
                        product['goodsIsChecked'] = false;
                        if(product['checkNum'] > 0 && product['checkNum'] == product.goods_sku.length){
                            product['goodsIsChecked'] = true;
                        }
                    }

                    console.log('输出 ~ res.data.lists-397', res.data.lists)
                    this.list = res.data.lists
                    this.total = res.data.total
                    rLoading.close()
                })
                .catch(err => {
                    rLoading.close()
                })
        },
        /*getList() {
            this.listLoading = true
            let params = this.$refs['formFilter'].model

            if (params.tag_id) {
                params['tag_ids'] = params.tag_id.map(item => item[1])
                // params['tag_ids'].push(params.tag_id);
            } else {
                params['tag_ids'] = []
            }

            params['type'] = this.type
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            queryProduceList(params)
                .then(async res => {
                    this.list = res.data.list ? res.data.list : []
                    this.total = res.data.total
                    this.refreshSelection()
                    this.listLoading = false
                })
                .catch(err => {})
        },*/
        handleSelectionChange(val) {
            this.checkedList = val
        },
        handleSKUSelectionChange(val) {
            this.checkedList = val
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.searchShow = false;
            this.searchParams = _.cloneDeep(this.searchForm);
            this.getList();
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
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

        show() {
            this.isShow = true
        },
        close() {
            this.isShow = false
        },
        async save() {
            let listClone = _.cloneDeep(this.checkedList)

            let skuList = await Promise.all(
                listClone.map(async m => {
                    let item = {}
                    if (m.name) {
                        item = m
                    } else {
                        // 商品创建页面传入sku id列表,回传前查询详情数据返回
                        item = await this.queryDetail(m.id)
                    }
                    return {
                        sku_id: 0,
                        storehouse_pid: item.id, //所选的仓库产品id
                        storehouse_code: item.product_code, //所选的仓库产品code
                        title: item.name,
                        min_price: item.price_out / 100,
                        display_price: item.price_out / 100,
                        sku_img: item.img,
                        stock_warning: 1,
                        stock_total: item.stock_total,
                        stock_available: item.stock_available,
                        attr_origin: item.attr_origin_name,
                        attr_brand: item.attr_brand_name,
                        attr_color: item.attr_color_name,
                        attr_material: item.attr_material_name,
                        attr_unit: item.attr_unit_name,
                        attr_pattern: item.attr_pattern_name,
                        attr_size: item.attr_size_name,
                        attr_width: item.attr_width_name,
                        attr_piece: item.attr_piece.toString(),
                        status: item.stock_available > 0 ? 2 : 1,
                        // tag_names: item.tag_names,
                        // category_name: item.category_name,
                        attrDiyValue: ['', '', ''],
                        attr_list: [
                            // {
                            //     attr_id: item.attr_brand,
                            //     attr_title: '品牌',
                            //     attr_value: item.attr_brand_name
                            // },
                            // {
                            //     attr_id: item.attr_color,
                            //     attr_title: '颜色',
                            //     attr_value: item.attr_color_name
                            // },
                            // {
                            //     attr_id: item.attr_material,
                            //     attr_title: '材质',
                            //     attr_value: item.attr_material_name
                            // },
                            // {
                            //     attr_id: item.attr_origin,
                            //     attr_title: '产地',
                            //     attr_value: item.attr_origin_name
                            // },
                            // {
                            //     attr_id: item.attr_pattern,
                            //     attr_title: '花纹',
                            //     attr_value: item.attr_origin_name
                            // },
                            // {
                            //     attr_id: item.attr_unit,
                            //     attr_title: '单位',
                            //     attr_value: item.attr_unit_name
                            // }
                        ]
                    }
                })
            )
            this.$emit('check-sku', skuList)
            this.checkedList = []
            this.$refs.multipleTable.toggleAllSelection(false)
            this.isShow = false
        },

        queryDetail(skuId) {
            let params = { sku_id: skuId }
            return new Promise(function(resolve, reject) {
                queryProduceDetail(params)
                    .then(res => {
                        resolve(res.data)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
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

        //1 其他 2 成品布
        onChangeType(event) {
            let type = event == 2 ? 1 : 2
            this.queryCategoryListAll(type)
            this.$set(this.searchForm,'category_id','');
        },
        // 获取分类列表
        queryCategoryListAll(type) {
            if (type == 1) {
                this.categoryList = this.categoryListOther
            } else {
                this.categoryList = this.categoryListClothGroup
            }
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
                })
                .catch(() => {})
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
        // sku选中/取消
        skuChecked(row,index,goods_detail,goods_index){
            console.log('row', row);
            console.log('goods_detail', goods_detail);
            console.log('goods_index', goods_index);
            if (row.skuIsChecked) {
                if(this.sku_select_list.indexOf(row.id) > -1){

                } else {
                    this.sku_select_list.push(row.id)
                }
            } else {
                if(this.sku_select_list.indexOf(row.id) > -1){
                    this.sku_select_list.splice(this.sku_select_list.indexOf(row.id), 1)
                }
            }
            goods_detail['checkNum'] = goods_detail.goods_sku.filter(item => item.skuIsChecked).length;
            if(goods_detail['checkNum'] > 0 && goods_detail['checkNum'] == goods_detail.goods_sku.length){
                goods_detail['goodsIsChecked'] = true;
            } else {
                goods_detail['goodsIsChecked'] = false;
            }
        },
        // 商品选中/取消
        goodsChecked(row,index) {
            console.log('row.goodsIsChecked', row.goodsIsChecked);
            if(row.goodsIsChecked){
                row.goods_sku.forEach((ev,i)=>{
                    ev['skuIsChecked'] = true
                })
            } else {
                row.goods_sku.forEach((ev,i)=>{
                    ev['skuIsChecked'] = false
                })
            }
            row['checkNum'] = row.goods_sku.filter(item => item.skuIsChecked).length;
        }
    }
}
</script>
<style scoped="scoped" lang="less">
/deep/.el-dialog{
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    margin: 0!important;
}
/deep/.el-dialog__body{
    padding: 0 !important;
}
/deep/.el-dialog__header{
    padding: 10px 0 !important;
}
/deep/.el-dialog__headerbtn{
    top: 21px;
}
.table-title {
    height: 36px;
    position: relative;
    .text{
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
        // border: 1px solid #000;
        border-radius: 2px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
        // transition: all 3s ease-in-out;
        padding: 24px 24px 20px 24px;
    }
    .selected-goods-btn{
        margin-right: 68px;
        margin-left: auto;
    }
}
.timg {
    width: 80px;
    height: 60px;
}

.row-list {
    width: 300px;
    .row-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        border-bottom: 1px solid #e8e8e8;
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
/deep/ .el-table-column--selection .cell{
    padding-left: 12px;
    padding-right: 12px;
}
/deep/.el-image-viewer__wrapper{
    z-index: 99999!important;
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
