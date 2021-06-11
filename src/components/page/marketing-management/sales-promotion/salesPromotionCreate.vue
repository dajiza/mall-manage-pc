<template>
    <div class="app-container operation-container">
        <el-form class="freight-form" label-position="right" :model="operationForm" :rules="rules" ref="operationForm" label-width="100px">
            <!-- 新增商品 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">{{ operationTitle }}</div>
            </div>
            <div class="divider"></div>
            <div class="form-content">
                <el-form-item class="form-item" label="促销类型:" prop="type">
                    <el-radio-group v-model="operationForm.type" :disabled="operationTitle === '编辑促销'" @change="chooseCouponsType">
                        <el-radio :label="1">满减</el-radio>
                        <el-radio :label="2">折扣</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" label="促销名称:" prop="title">
                    <el-input class="w300" placeholder="请输入名称" v-model="operationForm.title" :disabled="operationTitle === '编辑促销'" />
                </el-form-item>
                <el-form-item class="form-item" label="使用门槛:" prop="threshold" required>
                    <el-radio-group v-model="operationForm.threshold" :disabled="operationTitle === '编辑促销'" @change="chooseThresholdType">
                        <el-radio :label="1">无门槛</el-radio>
                        <el-radio :label="2">
                            满
                            <el-form-item
                                    style="display: inline-block;margin-bottom: 0"
                                    class="form-item"
                                    label=""
                                    prop="with_amount"
                                    :rules="[{ required: operationForm.threshold === 2, message: '请输入金额', trigger: 'blur' }]"
                            >
                                <el-input class="w100" placeholder="" v-model.number="operationForm.with_amount" :disabled="operationTitle === '编辑促销'"></el-input>
                            </el-form-item>
                            元可用
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item
                        ref="fullReduction"
                        class="form-item"
                        style="margin-bottom: 20px"
                        label="促销面额:"
                        prop="coupon_amount"
                        :rules="operationForm.type > 1 ? rules_coupon_amount2 : rules_coupon_amount1"
                >
                    <el-input class="w300" placeholder="" v-model="operationForm.coupon_amount" v-if="operationForm.type > 1" :disabled="operationTitle === '编辑促销'">
                        <template slot="append" class="append-unit">折</template>
                    </el-input>
                    <el-input class="w300" placeholder="" v-model.number="operationForm.coupon_amount" v-else :disabled="operationTitle === '编辑促销'">
                        <template slot="append" class="append-unit">元</template>
                    </el-input>
                    <div class="tip-text">{{ operationForm.type > 1 ? '1 ~ 9.9，限一位小数' : '1 ~ 100，只限整数，有使用门槛时需小于门槛数字' }}</div>
                </el-form-item>
                <el-form-item class="form-item" label="封顶金额:" prop="have_discount_top" required v-if="operationForm.type === 2">
                    <el-radio-group v-model="operationForm.have_discount_top" :disabled="operationTitle === '编辑促销'" @change="disTopChange">
                        <el-radio :label="1">无封顶</el-radio>
                        <el-radio :label="2">
                            封顶优惠
                            <el-form-item
                                    style="display: inline-block;margin-bottom: 0"
                                    class="form-item"
                                    label=""
                                    prop="discount_top"
                                    :rules="[{ required: operationForm.have_discount_top === 2, message: '请输入金额', trigger: 'blur' }]"
                            >
                                <el-input class="w100" placeholder="" v-model.number="operationForm.discount_top" :disabled="operationTitle === '编辑促销'"></el-input>
                            </el-form-item>
                            元
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" label="有效期:" prop="valid_type">
                    <el-radio-group v-model="operationForm.valid_type" @change="chooseValidityType" :disabled="operationTitle === '编辑促销'">
                        <el-radio :label="1">领取后天数</el-radio>
                        <el-radio :label="2">有效期间</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" label="领取后天数:" prop="valid_days" v-if="operationForm.valid_type === 1">
                    <el-input class="w300" placeholder="" v-model.number="operationForm.valid_days" :disabled="operationTitle === '编辑促销'">
                        <template slot="append" class="append-unit">天</template>
                    </el-input>
                </el-form-item>
                <template v-if="operationForm.valid_type === 2">
                    <el-form-item class="form-item inline-block" label="有效期间:" prop="valid_start_time" :disabled="operationTitle === '编辑促销'">
                        <el-date-picker
                                style="width:200px"
                                class="filter-item"
                                v-model="operationForm.valid_start_time"
                                type="datetime"
                                placeholder="开始时间"
                                default-time="00:00:00"
                                format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="validityOptionsStart"
                                :disabled="operationTitle === '编辑促销'"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <span style="padding: 0 10px">至</span>
                    <el-form-item class="form-item inline-block" label="" prop="valid_end_time" label-width="0px">
                        <el-date-picker
                                style="width:200px"
                                class="filter-item"
                                v-model="operationForm.valid_end_time"
                                type="datetime"
                                placeholder="结束时间"
                                default-time="23:59:59"
                                format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="validityOptionsEnd"
                                :disabled="operationTitle === '编辑促销'"
                        >
                        </el-date-picker>
                    </el-form-item>
                </template>

                <el-form-item class="form-item" label="可用店铺:" prop="shop_id">
                    <el-select class="w300" filterable placeholder="请选择店铺" v-model="operationForm.shop_id" :disabled="operationTitle === '编辑促销'">
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item class="form-item" label="发放数量:" prop="quota">
                    <el-input class="w300" placeholder="" v-model.number="operationForm.quota" :disabled="operationTitle === '编辑促销'" />
                </el-form-item>
                <el-form-item class="form-item inline-block" label="领用时间:" prop="grant_start_time">
                    <el-date-picker
                            style="width:200px"
                            class="filter-item"
                            v-model="operationForm.grant_start_time"
                            type="datetime"
                            placeholder="开始时间"
                            default-time="00:00:00"
                            @change="getTimeLe"
                            format="yyyy-MM-dd HH:mm:ss"
                            :picker-options="pickerOptions1"
                            :disabled="operationTitle === '编辑促销'"
                    >
                    </el-date-picker>
                </el-form-item>
                <span style="padding: 0 10px">至</span>
                <el-form-item class="form-item inline-block" label="" prop="grant_end_time" label-width="0px">
                    <el-date-picker
                            style="width:200px"
                            class="filter-item"
                            v-model="operationForm.grant_end_time"
                            type="datetime"
                            placeholder="结束时间"
                            default-time="23:59:59"
                            @change="getTimeGe"
                            format="yyyy-MM-dd HH:mm:ss"
                            :picker-options="pickerOptions2"
                            :disabled="operationTitle === '编辑促销'"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item class="form-item" label="单用户领取次数:" prop="person_get_type" required label-width="120">
                    <el-radio-group v-model="operationForm.person_get_type" :disabled="operationTitle === '编辑促销'" @change="disTopChange">
                        <el-radio :label="1">无限制</el-radio>
                        <el-radio :label="2">
                            最多领取
                            <el-form-item
                                    style="display: inline-block;margin-bottom: 0"
                                    class="form-item"
                                    label=""
                                    prop="person_get_count"
                                    :rules="[{ required: operationForm.person_get_type === 2, message: '请输入金额', trigger: 'blur' }]"
                            >
                                <el-input class="w100" placeholder="" v-model.number="operationForm.person_get_count" :disabled="operationTitle === '编辑促销'"></el-input>
                            </el-form-item>
                            次
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" label="领取用户:" prop="receive_user">
                    <el-radio-group v-model="operationForm.receive_user" :disabled="operationTitle === '编辑促销'">
                        <el-radio :label="1">店铺全体用户</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" label="可用商品:" prop="use_goods_type">
                    <el-radio-group v-model="operationForm.use_goods_type" :disabled="operationTitle === '编辑促销'" @change="useGoodsTypeChange">
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
                <div class="tabs-wrap marginTop20">
                    <el-radio-group v-model="tabPosition" class="tabs-nav" @change="tabClick()">
                        <el-radio-button label="selected">已添加</el-radio-button>
                        <el-radio-button label="no_select">未添加</el-radio-button>
                    </el-radio-group>
                </div>
                <div class="divider"></div>
                <div class="form-content goods-table-padding head-container">
                    <el-form class="search-form-box" :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left">
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
                                <!-- <template slot-scope="{ node, data }">
                                    <span class="select-item" @click="handleSelectCate($event, data)">{{ data.name }}</span>
                                </template> -->
                            </el-cascader>
                        </el-form-item>
                        <el-form-item class="btn-box" label="">
                            <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                            <el-button class="filter-btn" type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                        </el-form-item>
                        <el-form-item class="add-btn-box" v-show="tabPosition === 'no_select'">
                            <el-button type="primary" @click="handleAddSelected">添加</el-button>
                            <el-button type="success" @click="handleAddCate">添加该分类</el-button>
                            <el-button type="primary" @click="handleAddAll">
                                {{ searchParams.goods_name || searchParams.cateArr.length > 0 ? '添加搜索列表' : '添加全部商品' }}
                            </el-button>
                        </el-form-item>
                        <el-form-item class="add-btn-box" v-show="tabPosition === 'selected'">
                            <el-button type="warning" @click="handleDelSelected">移除</el-button>
                            <el-button type="primary" @click="handleDelCate">移除该分类</el-button>
                            <el-button type="warning" @click="handleDelAll">
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
            </template>

            <div class="operations">
                <el-button type="primary" :disabled="saveIsClick" @click="handleSave('operationForm')">保存</el-button>
                <el-button class="btn-cancel" type="danger" :disabled="saveIsClick" @click="handleCancel('operationForm')">取消</el-button>
            </div>
        </el-form>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
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
