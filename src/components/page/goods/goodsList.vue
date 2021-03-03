<template>
    <div class="app-container goods-list">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">商品列表</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow">
                    <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="商品名称" prop="title" label-width="">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.title"></el-input>
                        </el-form-item>
                        <el-form-item label="商品ID" prop="id">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.id"></el-input>
                        </el-form-item>
                        <el-form-item label="商品类型" prop="type">
                            <el-select class="filter-item" v-model="formFilter.type" placeholder="请选择" @change="onChangeType">
                                <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="category_id">
                            <el-select class="filter-item" v-model="formFilter.category_id" placeholder="请选择" :disabled="formFilter.type == 1">
                                <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="商品状态" prop="status">
                            <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                                <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="出售状态" prop="status">
                            <el-select class="filter-item" v-model="formFilter.is_sale" placeholder="请选择">
                                <el-option v-for="item in saleStatusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="库存预警" prop="is_store_shortage">
                            <el-select class="filter-item" v-model="formFilter.is_store_shortage" placeholder="请选择">
                                <el-option v-for="item in shortageList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="是否指定店铺" prop="allow_agent">
                            <el-select class="filter-item" v-model="formFilter.allow_agent" placeholder="请选择">
                                <el-option v-for="item in agentList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="SKU编码" prop="storehouse_code" class="">
                            <el-input class="filter-item" v-model="formFilter.storehouse_code" placeholder="请输入"></el-input>
                        </el-form-item>
                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
        </div>
        <div class="divider"></div>
        <div class="operate">
            <!-- <el-button type="primary" v-hasPermission="'mall-backend-goods-dismounting'" @click="updateStatusMultiple(2)">上架</el-button> -->
            <el-button type="warning" v-hasPermission="'mall-backend-goods-dismounting'" @click="updateStatusMultiple(1)">下架</el-button>
            <el-button type="primary" v-hasPermission="'mall-backend-goods-distribution'" @click="updateIsAgentMultiple(1)">指定店铺</el-button>
            <el-button type="warning" v-hasPermission="'mall-backend-goods-distribution'" @click="updateIsAgentMultiple(2)">取消指定店铺</el-button>
            <el-button type="primary" @click="goodsCreat" class="creat-goods" v-hasPermission="'mall-backend-goods-add'">新增商品</el-button>
        </div>
        <el-table
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
        >
            <el-table-column label="-" type="expand" width="60">
                <template slot-scope="props">
                    <el-table class="sku-table" :data="props.row.goods_sku" :header-cell-style="$tableHeaderColor">
                        <!-- <el-table-column label="状态" width="90">
                            <template slot-scope="scope">
                                <span class="text-red cursor" v-show="scope.row.status == 1" @click="setSkuStatus(props.row, scope.row, props.$index, scope.$index)">已下架</span>
                                <span class="text-blue cursor" v-show="scope.row.status == 2" @click="setSkuStatus(props.row, scope.row, props.$index, scope.$index)">已上架</span>
                            </template>
                        </el-table-column> -->
                        <el-table-column label="SKU图片" width="120">
                            <template slot-scope="scope">
                                <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.sku_img, 2, scope.row.skuImgIndex)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="SKU名称" width="180">
                            <template slot-scope="scope">
                                <span>{{ scope.row.title }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="SKU编码" width="180">
                            <template slot-scope="scope">
                                <span>{{ scope.row.storehouse_code }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="售价(元)" width="80">
                            <template slot-scope="scope">
                                <span>{{ formatMoney(scope.row.min_price) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="实际销量" width="80">
                            <template slot-scope="scope">
                                <span>{{ scope.row.real_sales }}</span>
                            </template>
                        </el-table-column>
                        <!-- <el-table-column label="可售库存" width="100">
                            <template slot-scope="scope">
                                <span>{{ scope.row.real_sales }}</span>
                            </template>
                        </el-table-column> -->
                        <el-table-column label="总库存" width="80">
                            <template slot-scope="scope">
                                <span>{{ scope.row.stock_total }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="可用库存" width="80">
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

            <el-table-column label="" fit>
                <template slot-scope="scope">
                    <span>({{ scope.row.onsaleNum }}/{{ scope.row.goods_sku.length }})</span>
                </template>
            </el-table-column>
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="商品ID" width="80">
                <template slot-scope="scope">
                    <span>{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="160">
                <template slot-scope="scope">
                    <div class="opt-wrap">
                        <el-button class="text-blue btn-opt table-btn" type="text" size="" v-hasPermission="'mall-backend-goods-update'" @click.native="goodsEdit(scope.row.id)">
                            编辑
                        </el-button>
                        <el-button
                            class="text-blue btn-opt table-btn"
                            type="text"
                            size=""
                            v-hasPermission="'mall-backend-goods-preview'"
                            @click.native="goodsPreview(scope.row.id)"
                        >
                            查看
                        </el-button>

                        <el-button
                            class="text-blue btn-opt table-btn"
                            type="text"
                            size=""
                            v-show="scope.row.status == 1"
                            v-hasPermission="'mall-backend-goods-dismounting'"
                            @click.native="updateStatus(scope.row.id, scope.row.status)"
                        >
                            上架
                        </el-button>
                        <el-button
                            class="text-red btn-opt table-btn"
                            type="text"
                            size=""
                            v-show="scope.row.status == 2"
                            v-hasPermission="'mall-backend-goods-dismounting'"
                            @click.native="updateStatus(scope.row.id, scope.row.status)"
                        >
                            下架
                        </el-button>
                        <el-button
                            class="text-blue btn-opt table-btn"
                            type="text"
                            size=""
                            @click.native="goodsAssign(scope.row.id, scope.row)"
                            v-show="scope.row.allow_agent == 1"
                            v-hasPermission="'mall-backend-goods-assign-shop'"
                        >
                            指定代理
                        </el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="是否指定店铺" width="110">
                <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.allow_agent"
                        v-hasPermission="'mall-backend-goods-distribution'"
                        @change="updateIsAgent(scope.row.id, scope.row.allow_agent)"
                        :active-value="1"
                        :inactive-value="2"
                        active-color="#1890FF"
                        inactive-color="#BFBFBF"
                    >
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="指定代理" width="120">
                <template slot-scope="scope" v-if="scope.row.allow_agent == 1">
                    <div v-for="item in scope.row.agent_list">{{ item.ShopName }}</div>
                </template>
            </el-table-column>
            <el-table-column label="主图" width="120">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.img, 1, scope.$index)" />
                </template>
            </el-table-column>
            <el-table-column label="商品名称" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                </template>
            </el-table-column>

            <el-table-column label="商品分类" width="80">
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
            <el-table-column label="状态">
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
            <!-- sku 合并行 -->
            <!-- <el-table-column label="SKU图片" width="128" class="sku-column">
                <template slot-scope="scope"> </template>
            </el-table-column> -->

            <!-- 被合并列 占位 -->
            <!-- <el-table-column label="SKU名称" width="200"> </el-table-column>
            <el-table-column label="SKU编码" width="140"> </el-table-column>
            <el-table-column label="售价(元)" width="100"> </el-table-column>
            <el-table-column label="实际销量" width="100"> </el-table-column>
            <el-table-column label="总库存" width="100"> </el-table-column>
            <el-table-column label="可用库存" width="100"> </el-table-column>
            <el-table-column label="库存预警" width="100"> </el-table-column> -->
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

        <el-dialog :visible.sync="dialogVisibleAssign" title="指定代理商">
            <el-select class="filter-item" v-model="shopIds" placeholder="请选择" style="width: 280px" multiple>
                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
            </el-select>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisibleAssign = false">取 消</el-button>
                <el-button type="primary" @click="updateGoodsAssign">确 定</el-button>
            </span>
        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>
</template>
<script>
import {
    queryGoodsList,
    queryStoreProduct,
    updateAllow,
    updateGoodsStatus,
    updateGoodsAssign,
    queryShopList,
    queryCategoryListAll,
    queryGoodsDetail,
    updateGoods
} from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
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
                { value: '1', label: '布料' },
                { value: '2', label: '其他' },
                { value: '3', label: '布组' }
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
                id: '',
                title: '',
                category_id: '',
                type: '',
                status: '',
                is_sale: '',
                is_store_shortage: '',
                allow_agent: '',
                storehouse_code: ''
            },
            // 图片预览
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            timgList: [], //主图预览列表
            skuImgList: [] //sku图预览列表
        }
    },
    components: {
        ElImageViewer,
        EmptyList
    },
    created() {},
    mounted() {
        this.queryCategoryListAllInit()
        this.queryShopList()
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        // 合并单元格
        // arraySpanMethod({ row, column, rowIndex, columnIndex }) {
        //     if (columnIndex === 10) {
        //         return [1, 8]
        //     }
        //     if (columnIndex > 10) {
        //         return [0, 0]
        //     }
        // },
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
                            sku.stock_available = data.data.stock_available
                        }
                    }

                    console.log('输出 ~ res.data.lists', res.data.lists)
                    this.list = res.data.lists
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
        // 更新是否代理
        updateIsAgent(id, allow_agent) {
            // allow_agent = allow_agent == 1 ? 2 : 1;
            let params = {
                allow_agent: allow_agent, //1指定代理；2所有代理可以销售；
                ids: [id]
            }

            updateAllow(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '分销操作成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.getList()
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 3000
                        })
                    }
                })
                .catch(err => {})
        },
        // 更新是否代理 批量
        updateIsAgentMultiple(allow_agent) {
            if (this.checkedList.length == 0) {
                this.$notify({
                    title: '未选择商品',
                    type: 'warning',
                    duration: 3000
                })
                return
            }
            let ids = this.checkedList.map(item => item.id)
            let params = {
                allow_agent: allow_agent, //1指定代理；2所有代理可以销售；
                ids: ids
            }

            updateAllow(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '操作成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.getList()
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 3000
                        })
                    }
                })
                .catch(err => {})
        },
        // 上下架
        updateStatus(id, status) {
            status = status == 1 ? 2 : 1
            let params = {
                status: status, // 1下架；2上架
                ids: [id]
            }
            updateGoodsStatus(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '上/下架成功',
                            type: 'success',
                            duration: 3000
                        })
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 3000
                        })
                    }
                    this.getList()
                })
                .catch(err => {})
        },
        // 上下架 批量
        updateStatusMultiple(status) {
            if (this.checkedList.length == 0) {
                this.$notify({
                    title: '未选择商品',
                    type: 'warning',
                    duration: 3000
                })
                return
            }
            let ids = this.checkedList.map(item => item.id)
            let params = {
                status: status, // 1下架；2上架
                ids: ids
            }
            updateGoodsStatus(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '上/下架成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.getList()
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 3000
                        })
                    }
                })
                .catch(err => {})
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data
                })
                .catch(err => {})
        },
        goodsAssign(id, row) {
            console.log('GOOGLE: row', row)
            this.goodsId = id
            this.shopIds = row.agent_list == null ? [] : row.agent_list.map(item => item.ShopId)
            this.dialogVisibleAssign = true
        },
        // 更新代理
        updateGoodsAssign() {
            let params = {
                goods_id: this.goodsId,
                shop_ids: this.shopIds
            }
            updateGoodsAssign(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '代理设置成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.dialogVisibleAssign = false

                        this.getList()
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 3000
                        })
                    }
                })
                .catch(err => {})
        },
        goodsCreat() {
            this.$router.push({
                name: 'goods-creat'
            })
        },
        goodsEdit(id) {
            this.$router.push({
                name: 'goods-edit',
                query: {
                    id: id
                }
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
        // 编辑获取详情
        getDetail(id) {
            return new Promise((resolve, reject) => {
                let params = {
                    goods_id: Number(id)
                }
                queryGoodsDetail(params)
                    .then(async res => {
                        let data = _.cloneDeep(res.data)

                        resolve(data)
                    })
                    .catch(err => {
                        reject()
                    })
            })
        },
        async setSkuStatus(goods, sku, goodsIndex, skuIndex) {
            let goodsData = await this.getDetail(goods.id)
            let skuData = goodsData.sku_list.find(item => item.sku_id == sku.id)
            if (skuData.stock_available == 0 && skuData.sku_status == 1) {
                this.$notify({
                    title: 'SKU上架失败',
                    message: '可用库存为0,不能上架',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            skuData.sku_status = skuData.sku_status == 1 ? 2 : 1
            // console.log('GOOGLE: goods', this.goods)
            const rLoading = this.openLoading()

            let params = _.cloneDeep(goodsData)
            console.log('输出 ~ params', params)

            // 判断失少有一个sku为上架
            let skuStatus = false
            for (let i = 0; i < params.sku_list.length; i++) {
                const skuItem = params.sku_list[i]
                if (skuItem.sku_status == 2) {
                    skuStatus = true
                    break
                }
            }
            if (!skuStatus && params.status == 2) {
                this.$notify({
                    title: 'SKU下架失败',
                    message: '商品上架状态至少需要一个sku处于上架',
                    type: 'warning',
                    duration: 5000
                })
                rLoading.close()
                return
            }

            // 判断任意两个上架商品 所选择的属性值不能完全一致 导致小程序区分不开sku
            for (let i = 0; i < params.sku_list.length; i++) {
                const skuItem = params.sku_list[i]
                // 判断上下架
                if (skuItem.sku_status == 1) {
                    continue
                }

                for (let j = i + 1; j < params.sku_list.length; j++) {
                    const skuCompare = params.sku_list[j]
                    // 判断上下架
                    if (skuCompare.sku_status == 1) {
                        continue
                    }
                    let allSame = skuCompare.sku_attr_list.every((item, index) => {
                        return item.attr_value == skuItem.sku_attr_list[index].attr_value
                    })
                    if (allSame) {
                        this.$notify({
                            title: 'SKU上架失败',
                            message: `SKU第${i + 1}条和第${j + 1}条的展示属性完全一致,请更改属性值或者下架其中一个`,
                            type: 'warning',
                            duration: 5000
                        })
                        rLoading.close()
                        return
                    }
                }
            }

            // 格式化
            params['id'] = params['goods_id']
            params['set_time_off'] = params['set_time_off'] ? this.$moment(params['set_time_off']).format('X') : 0
            params['set_time_on'] = params['set_time_on'] ? this.$moment(params['set_time_on']).format('X') : 0
            params['tag_ids'] = params['tag_detail_list'] ? params['tag_detail_list'].map(item => item.tag_id).join(',') : ''
            params['allow_shop_ids'] = params['is_allow_agent'] == 2 ? [] : params['allow_shop_ids']
            params.sku_list.map(item => {
                item['status'] = item['sku_status']
                item['attr_list'] = item['sku_attr_list']
                item['storehouse_pid'] = item['store_house_id']
                item['title'] = item['sku_title']
                return item
            })
            updateGoods(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code === 200) {
                        this.$notify({
                            title: 'SKU上/下架成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        this.list[goodsIndex].goods_sku[skuIndex].status = this.list[goodsIndex].goods_sku[skuIndex].status == 1 ? 2 : 1
                        // this.initData();
                        // bus.$emit('close_current_tags')
                        // this.$router.push({
                        //     path: 'mall-backend-goods-list'
                        // })
                    } else {
                        this.$notify({
                            title: 'SKU上/下架失败',
                            message: res.msg,
                            type: 'error',
                            duration: 5000
                        })
                    }
                    rLoading.close()
                })
                .catch(err => {
                    rLoading.close()
                })
        },
        handleSelectionChange(val) {
            this.checkedList = val
            console.log('GOOGLE: val', val)
        },
        // 搜索
        handleFilter() {
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
    width: 80px;
    height: 60px;
    // max-height: 200px;
    cursor: pointer;
}
.opt-wrap {
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    .btn-opt {
        // margin-bottom: 16px;
        // margin-left: 0;
    }
}

.operate {
    display: flex;
    padding: 14px 24px;
    background: #fff;
    .creat-goods {
        margin-left: auto;
    }
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
    margin: 0px 60px;
    max-width: calc(100% - 60px);
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
</style>
<style lang="less">
.goods-list {
    .checkboxColumn {
        .cell {
            padding-left: 10px;
        }
    }
    // .statusColumn {
    //     .cell {
    //         padding-left: 10px !important;
    //     }
    // }
}
</style>
