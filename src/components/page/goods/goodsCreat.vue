<template>
    <div class="app-container">
        <el-form class="freight-form" :inline="true" label-position="top" :model="goods" :rules="rules" ref="formRef">
            <!-- 新增商品 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">{{ goods.goods_id ? '编辑' : '新增' }}商品</div>
            </div>
            <div class="divider"></div>
            <div class="content">
                <div class="upload">
                    <el-form-item label="首图 可上传图片">
                        <el-upload
                            list-type="picture-card"
                            :class="timg.length > 0 ? 'hide-upload' : ''"
                            :action="uploadImgUrl"
                            :headers="header"
                            :before-upload="beforeUpload"
                            :on-success="uploadImgSuccess"
                            :on-error="uploadImgError"
                            :on-remove="handleRemove"
                            :on-preview="handlePictureCardPreview"
                            :file-list="timg"
                            :limit="1"
                        >
                            <i class="el-icon-plus"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="可上传图片/视频">
                        <el-upload
                            list-type="picture-card"
                            :class="tfile.length > 4 ? 'hide-upload' : ''"
                            :action="uploadImgUrl"
                            :headers="header"
                            :before-upload="beforeUploadMultiple"
                            :on-success="uploadImgSuccessMultiple"
                            :on-error="uploadImgErrorMultiple"
                            :on-remove="handleRemoveMultiple"
                            :on-exceed="handleExceedMultiple"
                            :on-preview="handlePictureCardPreview"
                            :file-list="tfile"
                            multiple
                            :limit="5"
                        >
                            <i class="el-icon-plus"></i>
                            <div slot="file" slot-scope="{ file }">
                                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                                <span class="el-upload-list__item-actions">
                                    <span class="el-upload-list__item-delete" @click="handlePictureLeft(file)">
                                        <i class="el-icon-arrow-left"></i>
                                    </span>
                                    <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                                        <i class="el-icon-zoom-in"></i>
                                    </span>
                                    <span class="el-upload-list__item-delete" @click="handleRemoveMultiple(file)">
                                        <i class="el-icon-delete"></i>
                                    </span>
                                    <span class="el-upload-list__item-delete" @click="handlePictureRight(file)">
                                        <i class="el-icon-arrow-right"></i>
                                    </span>
                                </span>
                            </div>
                        </el-upload>
                    </el-form-item>
                </div>
                <el-form-item label="名称" prop="title">
                    <el-input style="width:280px" placeholder="名称" v-model="goods.title"></el-input>
                </el-form-item>
                <el-form-item label="分类" v-if="goods.type == 1">
                    <el-select disabled class="filter-item" v-model="goods.type" placeholder="请选择" style="width:280px">
                        <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="分类" prop="category_id" v-if="goods.type == 2 || goods.type == 3">
                    <el-select class="filter-item" v-model="goods.category_id" placeholder="请选择" style="width:280px">
                        <el-option v-for="item in categoryData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标签">
                    <v-tag-picker
                        :tag-picker-dialog-visible="dialogVisibleTag"
                        @cancel="dialogCancelTag"
                        @confirm="dialogConfirmTag"
                        :options="options"
                        :value="pickerTag"
                    ></v-tag-picker>
                    <div>
                        <el-tag class="el-tag" type="warning" @close="handleCloseMiniApp(item)" closable v-for="item in miniProgramTags">{{ item.label }}</el-tag>
                    </div>
                    <div>
                        <el-tag class="el-tag" closable @close="handleCloseBack(item)" v-for="item in backendTags">{{ item.label }}</el-tag>
                    </div>
                    <el-button type="" size="mini" @click="dialogVisibleTag = true" icon="el-icon-plus">标签</el-button>
                </el-form-item>
            </div>
            <!-- 展示属性 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">展示属性</div>
            </div>
            <div class="divider"></div>
            <div class="content">
                <el-form-item label="">
                    <el-checkbox-group v-model="basicChecked">
                        <el-checkbox v-for="item in basicAttr" @change="handleCheckedBasic" :key="item.id" :label="item.id">
                            {{ item.title }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <div class="divider"></div>
                <!-- <div class="sub-title">
                    <div class="text">自定义属性</div>
                </div> -->
                <el-form-item label="自定义属性">
                    <el-checkbox-group v-model="consumeChecked">
                        <el-checkbox v-for="item in consumeAttr" @change="handleConsumeBasic" :key="item.id" :label="item.id">{{ item.title }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </div>
            <!-- SKU信息 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">SKU信息</div>
                <el-button class="add-sku" type="success" @click="addSku" :loading="btnLoading">添加</el-button>
            </div>
            <div class="divider"></div>
            <div class="content content-table">
                <el-table
                    :data="goods.sku_list"
                    v-loading.body="listLoading"
                    :header-cell-style="$tableHeaderColor"
                    element-loading-text="Loading"
                    fit
                    :cell-style="setCellColor"
                    :key="tableKey"
                >
                    <el-table-column label="操作" width="160">
                        <template slot-scope="scope">
                            <el-button class="opt-btn" type="danger" size="small" @click.native="deleteSku(scope.$index)" v-if="scope.row.sku_id == 0">
                                删除SKU
                            </el-button>
                            <el-button class="opt-btn" type="primary" size="small" @click.native="setFirsetSku(scope.row, scope.$index)">设为主商品</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="">
                        <template slot-scope="scope">
                            <span :class="[scope.row.status == 1 ? 'text-red' : 'text-blue', 'cursor']" @click="setSkuStatus(scope.row, scope.row.status, scope.$index)">
                                {{ scope.row.status == 1 ? '已下架' : '已上架' }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="SKU图片" width="130">
                        <template slot-scope="scope">
                            <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.sku_img)" />
                        </template>
                    </el-table-column>
                    <!-- 自定义属性 -->
                    <el-table-column :label="item.title" width="120" :property="item.id.toString()" v-for="(item, index) in attrDiyList" :key="item.id">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.attrDiyValue.' + index" :rules="rulesRequired">
                                <el-input class="default-input" placeholder="" v-model="scope.row.attrDiyValue[index]"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="SKU名称" width="240">
                        <template slot-scope="scope">
                            <span>{{ scope.row.title }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="最低售价(元)" width="120">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.min_price'" :rules="rulesPrice">
                                <el-input class="default-input" placeholder="最低售价" v-model="scope.row.min_price"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="显示售价(元)" width="120">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.display_price'" :rules="rulesPrice">
                                <el-input class="default-input" placeholder="显示售价" v-model="scope.row.display_price"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column label="可售库存" width="240">
                        <template slot-scope="scope">
                            <el-form-item class="table-radio-content">
                                <el-radio v-model="scope.row.stock_sell" :label="1">同步仓库</el-radio>
                                <el-radio class="table-radio-last" v-model="scope.row.stock_sell" :label="2">{{ scope.row.stock_sell == 2 ? '' : '自定义' }}</el-radio>
                                <el-form-item label="" class="" :prop="'sku_list.' + scope.$index + '.stock_num'" :rules="rulesStock" v-if="scope.row.stock_sell == 2">
                                    <el-input class="default-input" placeholder="请输入" v-model="scope.row.stock_num" style="width:80px;"></el-input>
                                </el-form-item>
                            </el-form-item>
                        </template>
                    </el-table-column> -->

                    <el-table-column label="总库存" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_total }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="可用库存" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_available }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="库存预警" width="120">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.stock_warning'" :rules="rulesInt">
                                <el-input class="default-input" placeholder="库存预警" v-model.number="scope.row.stock_warning"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column label="产品组" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_available }}</span>
                        </template>
                    </el-table-column> -->
                    <el-table-column :label="ATTR_NAME[1]" width="100" property="1">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_brand }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[2]" width="" property="2" v-if="goods.type == 1">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_color }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[3]" width="" property="3" v-if="goods.type == 1">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_origin }}</span>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column :label="ATTR_NAME[4]" width="" property="4">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_unit }}</span>
                        </template>
                    </el-table-column> -->
                    <el-table-column :label="ATTR_NAME[5]" width="" property="5" v-if="goods.type == 1">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_material }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[6]" width="" property="6" v-if="goods.type == 1">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_pattern }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[7]" width="" property="7" v-if="goods.type == 3">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_size }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[9]" width="" property="9" v-if="goods.type == 3">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_piece }}</span>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column :label="ATTR_NAME[8]" width="" property="8" v-if="goods.type == 2">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_width }}</span>
                        </template>
                    </el-table-column> -->

                    <!-- <el-table-column label="分类" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.category_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="标签" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.tag_names.join(',') }}</span>
                        </template>
                    </el-table-column> -->
                </el-table>
            </div>
            <!-- 销售设置 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">销售设置</div>
            </div>
            <div class="divider"></div>
            <div class="content">
                <el-form-item label="是否指定店铺" style="width:200px">
                    <el-radio v-model="goods.is_allow_agent" :label="1">是</el-radio>
                    <el-radio v-model="goods.is_allow_agent" :label="2">否</el-radio>
                </el-form-item>
                <el-form-item label="是否上架商品" v-if="!goods.goods_id" style="width:200px">
                    <el-radio v-model="goods.status" :label="2">是</el-radio>
                    <el-radio v-model="goods.status" :label="1">否</el-radio>
                </el-form-item>
                <div class="option-content">
                    <el-form-item label="指定代理" prop="allow_shop_ids">
                        <el-select class="filter-item" :disabled="goods.is_allow_agent == 2" v-model="goods.allow_shop_ids" placeholder="请选择" style="width:200px" multiple>
                            <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="虚拟销量" prop="display_sales">
                        <el-input style="width:200px" placeholder="虚拟销量" v-model.number="goods.display_sales"></el-input>
                    </el-form-item>
                    <el-form-item label="邮费模板" prop="freight_id">
                        <el-select class="filter-item" v-model="goods.freight_id" placeholder="请选择" style="width:200px">
                            <el-option v-for="item in freightList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="time-content">
                    <el-form-item label="是否定时上下架" style="width:200px">
                        <el-radio v-model="goods.set_time_status" :label="1">是</el-radio>
                        <el-radio v-model="goods.set_time_status" :label="2">否</el-radio>
                    </el-form-item>
                    <el-form-item class="long-time" label="上架时间">
                        <el-date-picker
                            style="width:200px"
                            class="filter-item"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            v-model="goods.set_time_on"
                            type="datetime"
                            placeholder="选择上架时间"
                            default-time="00:00:00"
                            :disabled="goods.set_time_status == 2"
                            :picker-options="startDatePicker"
                        >
                        </el-date-picker>

                        <!-- <el-date-picker
                            class="filter-item"
                            v-model="goods.shelvesTime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="上架日期"
                            end-placeholder="下架日期"
                            :default-time="['00:00:00', '23:59:59']"
                            :disabled="goods.set_time_status == 2"
                            :picker-options="startDatePicker"
                        >
                        </el-date-picker> -->
                    </el-form-item>
                    <el-form-item class="long-time" label="下架时间">
                        <el-date-picker
                            style="width:200px"
                            class="filter-item"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            v-model="goods.set_time_off"
                            type="datetime"
                            placeholder="选择下架时间"
                            default-time="00:00:00"
                            :disabled="goods.set_time_status == 2"
                            :picker-options="startDatePicker"
                        >
                        </el-date-picker>
                    </el-form-item>
                </div>
            </div>
        </el-form>
        <div class="submit-wrap">
            <el-button class="submit-btn" type="primary" size="small" @click.native="submit">提交</el-button>
        </div>

        <!-- 仓库产品 -->
        <store-product-list ref="productList" @check-sku="getSku" :checkedSku="goods.sku_list" :type="goods.type - 1"></store-product-list>
        <!-- 视频预览 -->
        <el-dialog :visible.sync="dialogVisible" title="预览">
            <img width="100%" :src="dialogImageUrl" alt="" />
            <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true" :options="playerOptions" v-if="dialogViewType == 2"></video-player>
        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
        <!-- 选择类型 -->
        <el-dialog :visible.sync="dialogVisibleType" width="380px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" title="商品类型选择">
            <div class="dialog-type">
                <el-radio v-model="goods.type" :label="1">布料</el-radio>
                <el-radio v-model="goods.type" :label="2">其他</el-radio>
                <el-radio v-model="goods.type" :label="3">布组</el-radio>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="gotoCreat">返 回</el-button>
                <el-button type="primary" @click="confirmType">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { mixinsGoods } from '@/components/mixins/goods'
export default {
    name: 'goods-creat',
    mixins: [mixinsGoods],
    data() {
        return {}
    },
    created() {},
    methods: {}
}
</script>

<style scoped src="./goodsCreat.less" lang="less"></style>
