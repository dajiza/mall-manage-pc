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
                        v-loading="goods_loading"
                        :data="goodsData"
                        ref="multipleTable"
                        class="order-list-table"
                        :height="tableHeight"
                        @selection-change="handleSelectionChange"
                >
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column label="主图" width="128">
                        <template slot-scope="scope">
                            <img class="timg" :src="scope.row.goods_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.img, 1, scope.$index)" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="goods_name" label="商品名称"></el-table-column>
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
                            <div v-if="tabPosition === 'no_select'">
                                <el-button type="text" class="marginLeft0 marginRight15" @click="handleAddItem(scope.$index, scope.row)">添加</el-button>
                            </div>
                            <div v-if="tabPosition === 'selected'">
                                <el-button type="text" class="marginLeft0 delete-color marginRight15" @click="handleDelItem(scope.$index, scope.row)">移除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                    <template slot="empty">
                        <EmptyList></EmptyList>
                    </template>
                </el-table>
                <div class="pagination-container">
                    <el-pagination
                            background
                            layout="total, prev, pager, next"
                            :current-page="goodsPage"
                            :page-size="goodsLimit"
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
                :checked="checked_sku_list"
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
