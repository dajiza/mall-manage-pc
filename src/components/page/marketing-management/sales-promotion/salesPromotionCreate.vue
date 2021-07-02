<template>
    <div class="app-container operation-container">
        <el-form class="freight-form" label-position="right" :model="operationForm" :rules="rules" ref="operationForm" label-width="90px">
            <!-- 新增商品 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">{{ operationTitle }}</div>
            </div>
            <div class="divider"></div>
            <div class="form-content">
                <div class="err-tip" v-if="isShelf">如需修改，请先下架该促销！</div>
                <el-form-item class="form-item" label="促销名称:" prop="title">
                    <el-input class="w300" placeholder="请输入促销名称" v-model="operationForm.title" :disabled="operationTitle === '编辑促销'" />
                </el-form-item>
                <el-form-item class="form-item" label="可用店铺:" prop="shop_id">
                    <el-select class="w300" filterable placeholder="请选择店铺" v-model="operationForm.shop_id" :disabled="operationTitle === '编辑促销'" @change="chooseShop">
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item class="form-item" label="促销类型:" prop="type">
                    <el-radio-group v-model="operationForm.type" :disabled="operationTitle === '编辑促销'" @change="chooseCouponsType">
                        <el-radio :label="1">每满减</el-radio>
                        <el-radio :label="2">满减</el-radio>
                        <el-radio :label="3">满折</el-radio>
                        <el-radio :label="4">满件折</el-radio>
                        <el-radio :label="5">加价购</el-radio>
                        <el-radio :label="6">满券</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!--每满减、加价购-->
                <template v-if="operationForm.type == 1">
                    <el-form-item class="form-item inline-block" :label="operationForm.type == 1?'每满:':'满:'" prop="amount1">
                        <el-input class="w120" placeholder="" v-model="operationForm.amount1" :disabled="isShelf"></el-input>
                        <span style="padding: 0 10px" v-if="operationForm.type == 1">减</span>
                    </el-form-item>
                    <el-form-item class="form-item inline-block" label="" prop="discount1" label-width="0px">
                        <el-input class="w120" placeholder="" v-model="operationForm.discount1" :disabled="isShelf"></el-input>
                    </el-form-item>
                </template>

                <!--阶梯 - 满减、满折、满件折、满券-->
                <template v-if="operationForm.type != 1">
                    <el-form-item style="margin-bottom: 20px" class="form-item inline-block" label="阶梯:">
                        <el-button class="add-ladder" type="primary" @click="handleAddLadder">添加阶梯</el-button>
                    </el-form-item>
                    <div class="ladder-wrap clearfix" v-for="(item, index) in operationForm.ladderList" :key="index">
                        <span style="padding:0 10px 0 90px" v-show="!(index > 0 && operationForm.type == 5)">满</span>
                        <!--满减、加价购-->
                        <template v-if="operationForm.type == 2 || operationForm.type == 5">
                            <el-form-item class="form-item inline-block" label="" label-width="0px"
                                          :prop="'ladderList.' + index + '.needNum'" :rules="rules.needNum"
                                          v-if="!(index > 0 && operationForm.type == 5)">
                                <el-input class="w120" v-model="item.needNum" placeholder="请输入" :precision="2" :disabled="isShelf"></el-input>
                            </el-form-item>
                            <span style="display:inline-block;width: 234px;height: 100%" v-if="(index > 0 && operationForm.type == 5)"></span>
                            <span style="padding: 0 10px">{{operationForm.type == 2?'减':'加'}}</span>
                            <el-form-item class="form-item inline-block" label="" label-width="0px" :prop="'ladderList.' + index + '.subNum'"
                                          :rules="[
                                            { required: true, message: '请输入' },
                                            { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '可保留两位小数' },
                                            {
                                                type: 'number',
                                                message: '优惠金额应小于前者',
                                                transform(value) {
                                                    return Number(value)
                                                },
                                                max: Number(item.needNum)
                                            }
                                          ]"
                                          v-if="operationForm.type == 2">
                                <el-input class="w120" v-model="item.subNum" :disabled="isShelf" placeholder="请输入" :precision="1"></el-input>
                            </el-form-item>
                            <el-form-item class="form-item inline-block" label="" label-width="0px" :prop="'ladderList.' + index + '.subNum'"
                                          :rules="[
                                            { required: true, message: '请输入' },
                                            { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '可保留两位小数' }]"
                                          v-if="operationForm.type == 5">
                                <el-input class="w120" v-model="item.subNum" :disabled="isShelf" placeholder="请输入" :precision="1"></el-input>
                            </el-form-item>
                            <!--加价换购-->
                            <template v-if="operationForm.type == 5">
                                <span style="padding: 0 10px">可换购赠品</span>
                                <el-tooltip placement="top" effect="light" popper-class="tooltip-remark">
                                    <div slot="content" class="remark-box">
                                        <div class="remark-content">换购商品有变动，别忘了保存哦~</div>
                                    </div>
                                    <img class="cursor-class remark-tip-icon" v-show="item.showTipIcon" src="../../../../assets/img/remark-red.png" alt="">
                                </el-tooltip>
                                <el-button class="del-ladder" :class="item.showTipIcon?'marginLeft6':'marginLeft20'" type="primary" @click.prevent="AddSwapGoods(item, index)" :disabled="isShelf">换购品({{item.exchGoodsList.length}})</el-button>
                            </template>
                        </template>

                        <!--满折、满件折、送券-->
                        <template v-if="operationForm.type == 3 || operationForm.type == 4 || operationForm.type == 6">
                            <el-form-item class="form-item inline-block" label="" label-width="0px" :prop="'ladderList.' + index + '.needNum'"
                                          :rules="rules.needNum" v-if="operationForm.type != 4">
                                <el-input class="w120" v-model="item.needNum" placeholder="请输入" :precision="2" :disabled="isShelf"></el-input>
                                <span style="padding: 0 10px">{{operationForm.type == 3?'元':'送券'}}</span>
                            </el-form-item>
                            <!--4满件折-->
                            <el-form-item class="form-item inline-block" label="" label-width="0px" :prop="'ladderList.' + index + '.needNum'"
                                          :rules="rules.piecesValue" v-if="operationForm.type == 4">
                                <el-input class="w120" v-model="item.needNum" placeholder="请输入" :disabled="isShelf"></el-input>
                                <span style="padding: 0 10px" v-if="operationForm.type == 4">件</span>
                            </el-form-item>
                            <!--折扣-->
                            <el-form-item class="form-item inline-block" label=""  label-width="0px" :prop="'ladderList.' + index + '.subNum'"
                                          :rules="rules.discountValue" v-if="operationForm.type == 3 || operationForm.type == 4">
                                <el-input class="w120" v-model="item.subNum" :disabled="isShelf" placeholder="请输入" :precision="1"></el-input>
                                <span style="padding-left: 10px">折</span>
                            </el-form-item>
                            <!--优惠券-->
                            <template v-if="operationForm.type == 6">
                                <router-link :to="{ path: '/mall-backend-coupon-update', query: { id: item.coupon_id, status:'edit' } }">
                                    <u style="color: rgba(0, 0, 0, 0.85);"><span v-if="item.coupon_title && item.coupon_id > 0">{{item.coupon_title}}</span></u>
                                </router-link>
                                <div class="inline-block" style="margin:0 10px">
                                    <!--v-hasPermission="'mall-backend-promotion-update'"-->
                                    <el-button type="text" class="marginLeft0" @click="selectCoupons(item, index)" :disabled="isShelf">{{item.coupon_id?'重新选择':'选择优惠券'}}</el-button>
                                </div>
                            </template>
                        </template>

                        <div class="inline-block" style="margin-left: 10px" v-if="operationForm.ladderList.length > 1">
                            <el-button class="del-ladder" type="danger" @click.prevent="removeSingleGood(item, index)" :disabled="isShelf">删除</el-button>
                        </div>
                    </div>
                </template>
                <!--封顶优惠-->
                <el-form-item class="form-item" label="封顶优惠:" prop="topMoney" v-if="operationForm.type == 3 || operationForm.type == 4">
                    <el-input class="w300" placeholder="" v-model="operationForm.topMoney" :disabled="isShelf"></el-input>
                    元
                </el-form-item>
                <div>
                    <el-form-item class="form-item inline-block" label="促销时间:" prop="startTime">
                        <el-date-picker
                                style="width:200px"
                                class="filter-item"
                                v-model="operationForm.startTime"
                                type="datetime"
                                placeholder="开始时间"
                                default-time="00:00:00"
                                @change="getTimeLe"
                                format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="pickerOptions1"
                                :disabled="isShelf"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <span style="padding: 0 10px">至</span>
                    <el-form-item class="form-item inline-block" label="" prop="endTime" label-width="0px">
                        <el-date-picker
                                style="width:200px"
                                class="filter-item"
                                v-model="operationForm.endTime"
                                type="datetime"
                                placeholder="结束时间"
                                default-time="23:59:59"
                                @change="getTimeGe"
                                format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="pickerOptions2"
                                :disabled="isShelf"
                        >
                        </el-date-picker>
                    </el-form-item>
                </div>
                <el-form-item class="form-item" label="用户群体:" prop="receive_user">
                    <el-radio-group v-model="operationForm.receive_user" :disabled="isShelf">
                        <el-radio :label="1">店铺全体用户</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" label="可用商品:" prop="use_goods_type">
                    <el-radio-group v-model="operationForm.use_goods_type" :disabled="isShelf" @change="useGoodsTypeChange">
                        <el-radio :label="1">全场通用</el-radio>
                        <el-radio :label="2">指定商品</el-radio>
                        <el-radio :label="3">指定标签</el-radio>
                    </el-radio-group>
                </el-form-item>
            </div>

            <template v-if="operationForm.use_goods_type === 3">
                <div class="table-title marginTop20">
                    <div class="line"></div>
                    <div class="text">选择标签</div>
                </div>
                <div class="divider"></div>
                <div class="form-content padding40">
                    <div class="tags-box">
                        <el-form-item class="form-item" label="选择标签:" prop="tag_ids">
                            <el-cascader
                                    style="width: 200px;height: 32px"
                                    class="filter-item"
                                    :key="labelKey"
                                    v-model="operationForm.tag_ids"
                                    placeholder="请选择"
                                    :options="labelOptions"
                                    :show-all-levels="false"
                                    :props="{ multiple: true, label: 'name', value: 'id' }"
                                    @change="tagsChange"
                                    filterable
                            ></el-cascader>
                        </el-form-item>
                        <div class="select-tags-box">
                            <el-tag v-for="(tag, index) in showTags" :key="tag.id" closable size="medium" @close="delTags(tag, index)">{{ tag.name }}</el-tag>
                        </div>
                    </div>
                </div>
            </template>
            <template v-if="operationForm.use_goods_type === 2">
                <div class="tabs-wrap flex-wrap marginTop20">
                    <span>已添加({{addGoodsCount}})</span>
                    <el-button style="margin-left: auto" type="success" :disabled="isShelf" @click="handleAdd">添加</el-button>
                </div>
                <div class="divider"></div>
                <div class="form-content goods-table-padding head-container">
                    <el-form class="search-form-box" :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left" @keydown.enter.native="handleSearch('searchForm')">
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
                            </el-cascader>
                        </el-form-item>
                        <el-form-item class="btn-box" label="">
                            <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                            <el-button class="filter-btn" type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                        </el-form-item>
                        <el-form-item class="add-btn-box">
                            <el-button type="warning" @click="handleDelSelected" :disabled="isShelf">移除</el-button>
                            <el-button type="primary" @click="handleDelCate" :disabled="isShelf">移除该分类</el-button>
                            <el-button type="warning" @click="handleDelAll" :disabled="isShelf">
                                {{ searchParams.goods_name || searchParams.cateArr.length > 0 ? '清空搜索列表' : '清空已添加' }}
                            </el-button>
                        </el-form-item>
                    </el-form>
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
                                <el-button type="text" class="marginLeft0 delete-color marginRight15" :disabled="isShelf" @click="handleDelItem(scope.$index, scope.row)">移除</el-button>
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
            </template>

            <div class="operations">
                <el-button type="primary" :disabled="saveIsClick || isShelf" @click="handleSave('operationForm')">保存</el-button>
                <el-button class="btn-cancel" type="danger" :disabled="saveIsClick" @click="handleCancel('operationForm')">取消</el-button>
            </div>
        </el-form>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
        <!-- 添加优惠券 -->
        <coupon-list ref="couponList" getWay="4" @add-success="getCoupon" :couponId="couponId > 0 ? couponId : ''"></coupon-list>
        <!-- 添加商品 -->
        <addGoodsPop ref="goodsList"
                     :categoryData="categoryData"
                     :checked="selectedGoods"
                     :shopId="shopId"
                     @handleAddGoods="handleAddGoods"
                     @handleAddCateGoods="handleAddCateGoods"
                     @handleAddAllGoods="handleAddAllGoods"
        ></addGoodsPop>
        <!-- 添加赠品、换购商品 -->
        <addSkuPop ref="skuList"
                   :checked="checkedSkuList"
                   :addIds="addIds"
                   :shopId="shopId"
                   :cateOtherList="cate_other_list"
                   :cateGroupList="cate_group_list"
                   @addSku="getAddSku"
                   @delSku="getDelSku"
        ></addSkuPop>
    </div>
</template>
<script>
    import { mixinsPromotion } from '../../../mixins/salesPromotion'
    import './salesPromotion.less'
    export default {
        name: 'promotionCreate',
        mixins: [mixinsPromotion],
        data() {
            return {}
        },
        created() {},
        methods: {}
    }
</script>
<style lang="less" scoped>
    .tabs {
        margin-left: 30px;
    & /deep/ .el-tabs__header {
          margin: 0;
      }
    & /deep/ .el-tabs__nav {
          height: 58px;
      }
    & /deep/ .el-tabs__item {
          line-height: 58px;
      }
    }
</style>
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
    .add-ladder,.del-ladder{
        padding: 5px 10px !important;
    }
    .el-form-item--small .el-form-item__error {
        min-width: 132px;
    }
</style>
