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
                    <el-select class="w300" filterable placeholder="请选择店铺" v-model="operationForm.shop_id" :disabled="operationTitle == '编辑系列'" @change="shopChange">
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
                <el-select class="sort-select" v-model="sortValue" placeholder="请选择" clearable @change="sortTypeChange">
                    <el-option v-for="state in sortOptions" :key="state.id" :value="state.id" :label="state.name" />
                </el-select>
                <el-button type="primary" style="margin-left: auto;" :disabled="checked_goods_count == 0" @click="handleDelCate">批量移除</el-button>
                <el-button style="margin-right: 30px" type="success" @click="handleAdd">添加</el-button>
            </div>
            <div class="divider"></div>
            <div class="goods-table-padding head-container table-content">
                <div class="goods-detail-ino">
                    <div class="th-box">
                        <div class="sort-box" v-show="isSort"></div>
                        <div class="check-box-all">
                            <el-checkbox :indeterminate="isIndeterminate" v-model="allChecked" @change="value => goodsAllChecked(value)"></el-checkbox>
                        </div>
                        <div class="goods-id">商品ID</div>
                        <div class="goods-img">主图</div>
                        <div class="goods-name">商品名称</div>
                        <div class="real-sale">实际销量</div>
                        <div class="goods-cate">商品分类</div>
                        <div class="goods-status">状态</div>
                        <div class="operation-box">操作</div>
                    </div>
                    <div class="goods-list table" ref="listUl" @scroll="handleScroll">
                        <draggable :disabled="!isSort" @start="dragStart" @end="end" animation="300">
                            <div class="goods-item-wrap" v-for="(goods, i) in goodsData" :key="goods.id + '_'+ goods.goodsIsChecked">
                                <div class="goods-item">
                                    <div class="sort-box" v-show="isSort">
                                        <div class="tuozhuai-wrap">
                                            <span class="iconfont icon-tuozhuai"></span>
                                        </div>
                                    </div>
                                    <div class="check-box">
                                        <i class="iconfont icon-plus" v-show="!goods.open" style="color: #1890ff" @click="goodsOpenSKU(i, true)"></i>
                                        <i class="iconfont icon-minus" v-show="goods.open" style="color: #6d7278" @click="goodsOpenSKU(i, false)"></i>
                                        <span style="margin-left: 10px">({{ goods.onShelfNum }}/{{ goods.shop_skus.length }})</span>
                                    </div>
                                    <div class="goods-id">
                                        <el-checkbox :key="goods.id" v-model="goods.goodsIsChecked" @change="value => goodsChecked(value, goods, i)"></el-checkbox>
                                        <span style="margin-left: 8px">{{goods.id}}</span>
                                    </div>
                                    <div class="goods-img">
                                        <img class="timg" :src="goods.goods_img + '!upyun520/fw/300'" alt="" @click="openPreview(goods.goods_img, 1, i)" />
                                    </div>
                                    <div class="goods-name">{{goods.goods_title}}</div>
                                    <div class="real-sale w88">{{goods.real_sales}}</div>
                                    <div class="goods-cate w88">
                                        <span v-if="goods.goods_type == 1">布料</span>
                                        <span v-if="goods.goods_type == 2"> 其他{{ backGoodsOtherName(goods.goods_category_id) }} </span>
                                        <span v-if="goods.goods_type == 3"> 布组{{ backGoodsCategoryName(goods.goods_category_id) }} </span>
                                    </div>
                                    <div class="goods-status w88">
                                        <span class="dot dot-grey" v-if="goods.status == 1"></span>
                                        <span class="dot dot-green" v-if="goods.status == 2"></span>
                                        <span :class="[goods.status == 1 ? 'text-grey' : '', 'status-text']">
                                    {{ goods.status == 1 ? '已下架' : '已上架' }}
                                </span>
                                    </div>
                                    <div class="operation-box w100">
                                        <el-button type="text" class="marginLeft0 marginRight15 delete-color" @click="handleDelItem(i, goods)">移除</el-button>
                                    </div>
                                </div>
                                <div class="sku-wrap" v-show="goods.open">
                                    <div class="sku-detail-info">
                                        <div class="sku-th-box">
                                            <div class="sku-col-item sku-status">状态</div>
                                            <div class="sku-col-item sku-img">SKU图片</div>
                                            <div class="sku-name">SKU名称</div>
                                            <div class="sku-col-item sku-code">SKU编码</div>
                                            <div class="sku-col-item sku-real-sales w80">实际销量</div>
                                            <div class="sku-col-item w88">售价(元)</div>
                                            <div class="sku-col-item w88">总库存</div>
                                            <div class="sku-col-item w88">可用库存</div>
                                            <div class="sku-col-item w88">是否售罄</div>
                                            <div class="sku-col-item w88">会员折扣</div>
                                            <div class="sku-col-item w100">预售/正常</div>
                                        </div>
                                        <div class="sku-item-wrap" v-for="(sku, sku_i) in goods.shop_skus" :key="sku.id + '_'+ goods.goodsIsChecked">
                                            <div class="sku-item">
                                                <div class="sku-col-item sku-status">
                                                    <span class="text-red" v-show="sku.status == 1">已下架</span>
                                                    <span class="text-blue" v-show="sku.status == 2">已上架</span>
                                                </div>
                                                <div class="sku-col-item sku-img">
                                                    <img
                                                            class="timg"
                                                            :src="sku.sku_sku_img + '!upyun520/fw/300'"
                                                            alt=""
                                                            @click="openPreview(sku.sku_sku_img, 2, sku.skuImgIndex)"
                                                    />
                                                </div>
                                                <div class="sku-name">{{sku.sku_title}}</div>
                                                <div class="sku-col-item sku-code">{{sku.sku_storehouse_code}}</div>
                                                <div class="sku-col-item sku-real-sales">{{sku.sku_real_sales}}</div>
                                                <div class="sku-col-item w88">{{ formatMoney(sku.sku_min_price) }}</div>
                                                <div class="sku-col-item w88">{{sku.product_storage_data.stock_total}}{{sku.sku_attr_unit}}</div>
                                                <div class="sku-col-item w88">{{sku.product_storage_data.stock_available}}{{sku.sku_attr_unit}}</div>
                                                <div class="sku-col-item w88">{{sku.sku_is_store_shortage == 2 ? '是' : '否'}}</div>
                                                <div class="sku-col-item w88">
                                                    <span v-if="sku.sku_user_discount == 0">是</span>
                                                    <span v-else-if="sku.sku_user_discount == 1">否</span>
                                                    <span v-else>{{ commUtil.numberMul(Number(sku.sku_user_discount), 0.1) }}折</span>
                                        </div>
                                                <div class="sku-col-item w100">{{ sku.sku_is_pro_sale == 2 ? '正常' : '预售' }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </draggable>
                        <div class="is-all tip-text" v-if="goodsData.length > 0 && is_all">没有更多了</div>
                        <div class="empty-list tip-text" v-if="goodsData.length < 1">暂无商品</div>
                    </div>
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
                @check-goods="sureAddGoods"
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
