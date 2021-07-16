<template>
    <div class="app-container goods-series-create" @click="searchShow = false">
        <el-form class="freight-form" label-position="right" :model="operationForm" :rules="rules" ref="operationForm" label-width="100px">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">基本信息</div>
            </div>
            <div class="divider"></div>
            <div class="form-content">
                <el-form-item class="form-item" label="系列名称:" prop="title">
                    <el-input class="w300" placeholder="请输入名称" v-model="operationForm.title"/>
                </el-form-item>
                <el-form-item class="form-item" label="备注:" prop="remark">
                    <el-input class="w300" type="textarea" :rows="5" placeholder="请输入名称" v-model="operationForm.remark" />
                </el-form-item>
                <el-form-item class="form-item" label="可用店铺:" prop="shop_id">
                    <el-select class="w300" filterable placeholder="请选择店铺" v-model="operationForm.shop_id">
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
            </div>
            <div class="table-title marginTop20">
                <div class="line"></div>
                <div class="text">商品</div>
                <div class="grey-line"></div>
                <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                <transition name="slide-fade">
                    <div class="container clearfix head-container" ref="searchBox" v-show="searchShow" @click.stop="">
                        <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left" @keydown.enter.native="handleSearch()">

                            <el-form-item label="商品名称" prop="goods_name" label-width="">
                                <el-input class="filter-item" placeholder="请输入" v-model="searchForm.goods_name"></el-input>
                            </el-form-item>
                            <el-form-item label="商品ID" prop="goods_id">
                                <el-input class="filter-item" placeholder="请输入" v-model="searchForm.goods_id"></el-input>
                            </el-form-item>
                            <el-form-item label="商品分类" prop="typeCategory">
                                <el-cascader
                                        :key="'add-goods-cate' + cateKey"
                                        class="filter-item"
                                        :props="{ checkStrictly: true }"
                                        v-model="searchForm.typeCategory"
                                        placeholder="请选择"
                                        :options="categoryData"
                                ></el-cascader>
                            </el-form-item>
                            <el-form-item label="商品状态" prop="shop_goods_status">
                                <el-select class="filter-item" v-model="searchForm.shop_goods_status" placeholder="请选择">
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
                                <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                                <el-button class="filter-btn" type="primary" @click="handleSearch()">搜索</el-button>
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
                <el-select class="sort-select" v-model="sortValue" placeholder="请选择" clearable>
                    <el-option v-for="state in sortOptions" :key="state.id" :value="state.id" :label="state.name" />
                </el-select>
                <el-button type="primary" style="margin-left: auto;" @click="handleDelCate">批量移除</el-button>
                <el-button style="margin-right: 30px" type="success" @click="handleAdd">添加</el-button>
            </div>
            <div class="divider"></div>
            <div class="form-content goods-table-padding head-container">
                <el-table
                        ref="multipleTable"
                        :height="tableHeight"
                        class="order-list-table table"
                        :data="goodsData"
                        element-loading-text="Loading"
                        :default-expand-all="false"
                        row-key="id"
                        :header-cell-style="$tableHeaderColor"
                        :cell-class-name="goodsTable"
                        :cell-style="{ background: '#fff' }"
                >
                    <el-table-column label="-" type="expand" width="55">
                        <template slot-scope="props">
                            <el-table class="sku-table" :data="props.row.shop_skus" :header-cell-style="$tableHeaderColor">
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
                            <span>({{ scope.row.onShelfNum }}/{{ scope.row.shop_skus.length }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="" width="35">
                        <template slot-scope="scope">
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
                            layout="total, prev, pager, next"
                            :current-page="goodsPage"
                            :page-size="limit"
                            :total="pageTotal"
                            @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </div>

            <div class="operations">
                <el-button type="primary" :disabled="saveIsClick" @click="handleSave('operationForm')">保存</el-button>
            </div>
        </el-form>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />

        <!-- 添加商品 -->
        <addShopGoods
                ref="goodsList"
                title="挑选商品"
                :categoryListOther="cate_other_list"
                :categoryListClothGroup="cate_group_list"
                :checked="checked_goods_ids"
                :shopId="shopId"
                @check-sku="getAddSku"
        ></addShopGoods>

    </div>
</template>
<script>
import { mixinsGoodsSeries } from '../../../mixins/goodsSeries'
import './series.less'
export default {
    name: 'couponAdd',
    mixins: [mixinsGoodsSeries],
    data() {
        return {}
    },
    components: {

    },
    created() {},
    methods: {}
}
</script>

<style lang="less">
.el-cascader-node > .el-radio {
    // display: none;
}
.select-item {
    display: inline-block;
    width: 100%;
}
.el-cascader__tags .el-tag {
    display: none;
}
</style>
<style lang="less" scoped>
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
    .table /deep/ .el-table__expanded-cell {
        padding: 0 !important;
    }
    /deep/ .el-table-column--selection .cell {
        padding-right: 12px;
        padding-left: 12px;
    }
    .sku-table {
        box-sizing: border-box;
        margin-left: 120px;
        max-width: calc(100% - 120px);
    }
    .table .sku-table /deep/ .el-table__body tr:hover > td {
        background-color: #f6faff !important;
    }
    .cursor {
        cursor: pointer;
    }
    .table /deep/ .el-table__body tr:hover > td {
        background-color: #fff !important;
    }
</style>
