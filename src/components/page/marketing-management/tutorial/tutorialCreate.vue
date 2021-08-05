<template>
    <div class="app-container operation-container look-create-page">
        <el-form class="freight-form" :model="operationForm" :rules="rules" ref="operationForm" label-width="90px" label-position="top">
            <!-- 新增商品 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">内容</div>
            </div>
            <div class="divider"></div>
            <div class="form-content">
                <el-form-item class="form-item" label="标题" prop="title" label-position="top">
                    <el-input class="w300" placeholder="请输入标题" v-model="operationForm.title" :disabled="operationTitle == 'audit'"/>
                </el-form-item>
                <el-form-item label="上传图片" required >
                    <el-upload
                            list-type="picture-card"
                            :class="tfile.length > 8 ? 'hide-upload' : 'img-upload'"
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
                            :limit="9"
                            v-if="operationTitle !== 'audit'"
                    >
                        <i class="el-icon-plus"></i>
                        <div class="size-tip" style="position: absolute;bottom: 10px;text-align: center;">800*800px</div>
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
                    <div v-if="operationTitle === 'audit'">
                        <div class="img-list">
                            <div class="img-wrap-item" v-for="(item,i) in tfile" :key="item.id" @click="openPreview(item.url, 2, i)">
                                <img class="img-item" :src="item.url" alt="" />
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item class="form-item" label="作者" prop="author">
                    <el-select
                            style="width: 300px"
                            popper-class="select-creat-author"
                            filterable
                            default-first-option
                            v-model="operationForm.author"
                            placeholder="请输入"
                            :filter-method="brandKeyChange"
                            :disabled="operationTitle !== 'add'"
                            @change="copyrightChange"
                            :key="authorSelectKey"
                    >
                        <el-option class="beforecontent" v-for="state in authorList" :key="state.user_id" :value="state.user_id" :label="state.nick_name" />
                    </el-select>
                </el-form-item>
                <el-form-item class="form-item" label="可用店铺" prop="shop_id">
                    <el-select style="width: 300px" class="w300" filterable placeholder="请选择店铺" v-model="operationForm.shop_id" :disabled="operationTitle !== 'add'" @change="chooseShop">
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
            </div>
        </el-form>
        <template>
            <div class="table-title marginTop20">
                <div class="line"></div>
                <div class="text">材料清单</div>
                <el-button style="margin-left: auto" type="danger" :disabled="checkedSkuCount < 1 || operationTitle == 'audit'" @click="handleDelSelected">批量移除</el-button>
                <el-button style="margin-right: 24px" type="primary" :disabled="operationTitle == 'audit'" @click="handleAdd">添加</el-button>
            </div>
            <div class="divider"></div>
            <div class="form-content goods-table-padding head-container" style="padding-top: 0!important;">
                <el-table
                        :data="materialList"
                        ref="multipleTable"
                        class="order-list-table"
                        :height="tableHeight"
                >
                    <el-table-column label="" width="50">
                        <template slot="header" slot-scope="scope">
                            <el-checkbox v-model="checkAll"
                                         :indeterminate="indeterminate"
                                         @change="value => handleCheckCurrentPage(value)"
                            ></el-checkbox>
                        </template>
                        <template slot-scope="scope">
                            <el-checkbox
                                    v-model="scope.row.skuIsChecked"
                                    :disabled="scope.row.isDisabled"
                                    @change="value => skuChecked(value, scope.row, scope.$index)"
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
                                    @click="openPreview(scope.row.sku_img, 1, scope.$index)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="SKU名称" prop="sku_name" min-width="200px"></el-table-column>
                    <el-table-column label="SKU编码" prop="sku_code" min-width="100px"></el-table-column>
                    <el-table-column label="商品名称" prop="goods_name" min-width="200px"></el-table-column>
                    <el-table-column label="实际销量" width="90">
                        <template slot-scope="scope">
                            <span>{{ scope.row.real_sales }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="售价(元)" width="90">
                        <template slot-scope="scope">
                            <span>{{ formatMoney(scope.row.display_price) }}</span>
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
                    <el-table-column label="预售/正常" width="120">
                        <template slot-scope="scope">
                            <!--<div class="type-tag type-yellow" v-if="scope.row.sku_is_store_shortage == 2">售罄</div>
                            <div class="type-tag type-blue" v-else>否</div>-->
                            <span>{{scope.row.is_pro_sale == 1 ? '预售':'正常'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="110">
                        <template slot-scope="scope">
                            <el-button type="text" class="marginLeft0 delete-color marginRight15" @click="handleDelItem(scope.$index, scope.row)" :disabled="operationTitle == 'audit'">移除</el-button>
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
                            :current-page="skuPage"
                            :page-size="skuLimit"
                            :total="skuTotal"
                            @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </div>
        </template>
        <div class="table-title marginTop20">
            <div class="line"></div>
            <div class="text">制作教程(选填)</div>
        </div>
        <!--教程-->
        <div class="row-line"></div>
        <div class="tutorials-content">
            <div class="tutorials-list">
                <div class="tutorials-item" v-for="(item,i) in tutorialsList">
                    <div class="title">
                        <span class="title-text">步骤：{{i < 9 ? '0' + (i + 1) : i + 1}}</span>
                        <el-button type="text" class="delete-color" @click="handleDeleteTutorials(i, item)" v-show="operationTitle !== 'audit'">删除</el-button>
                    </div>
                    <div class="content">
                        <div class="left-box">
                            <div class="label-text">文字描述：</div>
                            <el-input class="textarea-box" :rows="6" type="textarea" placeholder="请输入名称" v-model="item.summary" :disabled="operationTitle == 'audit'"/>
                        </div>
                        <div class="right-box" @click="tutorialsIndex = i">
                            <div class="label-text">图片</div>
                            <el-upload
                                    class="tutorials-uploader"
                                    :class="operationTitle == 'audit'?'cursor-not-allowed':''"
                                    :action="uploadImgUrl"
                                    :on-success="handleTutorialsImgSuccess"
                                    :on-error="uploadImgErrorMultiple"
                                    :before-upload="beforeUploadMultiple"
                                    :on-remove="handleTutorialsImgRemove"
                                    :show-file-list="false"
                                    :headers="header"
                                    v-if="!item.img_url"
                                    :disabled="operationTitle == 'audit'"
                            >
                                <div class="tutorials-add-box">
                                    <i class="el-icon-plus"></i>
                                    <span class="tip-text">670*400px</span>
                                </div>
                            </el-upload>
                            <div class="tutorials-img-wrap" v-if="item.img_url">
                                <img class="tutorials-img" :src="item.img_url" @click="openPreview(item.img_url, 3, 0)"/>
                                <div class="operate-box">
                                    <div class="operate-icon-wrap" @click="openPreview(item.img_url, 3, 0)">
                                        <i class="el-icon-zoom-in"></i>
                                    </div>
                                    <div style="margin-left: 20px" class="operate-icon-wrap" @click="handleDelTutorialsImg(item, i)">
                                        <i class="el-icon-delete"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="placeholder-box"></div>
            <div class="add-tutorials" :class="operationTitle == 'audit'?'cursor-not-allowed':''" @click="addTutorials">
                <span>+</span>
                <span style="margin-left: 10px">添加</span>
            </div>
        </div>
        <div class="operations">
            <el-button type="primary" :disabled="saveIsClick || isShelf" @click="handleSave('operationForm')" v-if="operationTitle == 'add' || operationTitle == 'edit'">保存</el-button>
            <el-button type="primary" :disabled="saveIsClick" v-if="operationTitle == 'audit'" @click="handleAgree()">通过</el-button>
            <el-button class="btn-cancel" type="danger" :disabled="saveIsClick"  v-if="operationTitle == 'audit'" @click="openReasonDialog()">拒绝</el-button>
        </div>

        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />

        <!-- 添加sku -->
        <addSkuPop ref="skuList"
                   :checked="checkedSkuIds"
                   :shopId="shopId"
                   :cateOtherList="cate_other_list"
                   :cateGroupList="cate_group_list"
                   @addSku="getAddSku"
        ></addSkuPop>

        <!--拒绝理由-->
        <el-dialog class="reason-dialog" title="拒绝理由" width="380px" :visible.sync="reasonDialogVisible" :close-on-click-modal="false" :before-close="reasonDialogClose">
            <el-input placeholder="请填写拒绝理由" autofocus="autofocus" v-model="rejectReason" @keydown.enter.native="handleSureReject()"></el-input>
            <span slot="footer" class="dialog-footer">
                <el-button @click="reasonDialogClose">取 消</el-button>
                <el-button type="primary" @click="handleSureReject">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import { mixinsLook } from '../../../mixins/lookCreate'
    import './tutorial.less'
    export default {
        name: 'promotionCreate',
        mixins: [mixinsLook],
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
    /deep/ .el-textarea__inner{
        line-height: 1.4 !important;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
    }
    /deep/.el-dialog {
        top: 50%;
        left: 50%;
        margin: 0 !important;
        transform: translate(-50%, -50%);
    }
    .reason-dialog /deep/.el-dialog__body {
        padding: 60px 24px !important;
    }
    /deep/ .el-upload-list--picture-card .el-upload-list__item{
        width: 120px !important;
        height: 120px !important;
    }
    /deep/ .el-upload--picture-card{
        width: 120px !important;
        height: 120px !important;
        position: relative;
    }
    .img-upload .el-icon-plus{
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
    }
    .size-tip{
        width: 120px;
        height: 22px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
        line-height: 22px;
        position: absolute;
        bottom: 20px;
        text-align: center;
    }
    .el-upload-list--picture-card .el-upload-list__item-actions span+span{
        margin-left: 8px!important;
    }
    .select-creat-author .el-select-dropdown__item {
        display: flex;
    }

    /deep/ .not-add{
        display: flex;
        /*color: #00a854 !important;*/
    }
    /deep/ .not-add:before{
        display: block;
        -ms-flex-preferred-size: 64px;
        flex-basis: 64px;
        width: 64px;
        height: 34px;
        background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAoCAMAAAABrwJ6AAACplBMVEUAAAD///9/f39VVVVAQEAzMzNVVVVV1CpJSUlJ2yQzMzNGRkZAQEA7Ozs3NzczMzNAQEA8PDw5OTk2NjYzMzM6Ojo3Nzc1NTVKvxU7Ozs5OTk3Nzc1NTUzMzM6Ojo4ODg2NjY0NDQ5OTk3Nzc0NDQzMzM1NTVKwRc3NzdIvBY2NjY1NTU0NDQ3Nzc2NjY1NTU0NDQzMzM3Nzc2NjY1NTU0NDQzMzM2NjY1NTU1NTU0NDQzMzM2NjY0NDQzMzM2NjZIvhY1NTU0NDQzMzM1NTU0NDQ0NDQzMzM1NTU0NDQ0NDQzMzM1NTU1NTU0NDQzMzM1NTU1NTU0NDQ0NDQzMzM1NTU1NTU0NDQ0NDQzMzM1NTU0NDQ0NDQ1NTU0NDQzMzMzMzM1NTUzMzMzMzM1NTU0NDQzMzMzMzM0NDQ0NDQzMzMzMzM1NTU0NDQ0NDQzMzNHvBY1NTU0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQzMzM0NDQ0NDRGvBYzMzNHvRY0NDQ0NDQzMzM0NDQ0NDQzMzMzMzM0NDQzMzMzMzM0NDQ0NDQ0NDQzMzM0NDQzMzMzMzM0NDQ0NDQzMzM0NDQ0NDQzMzM0NDQ0NDQ0NDQzMzM0NDRHvBU0NDQ0NDQzMzMzMzM0NDQ0NDQ0NDRGvBYzMzM0NDQ0NDQzMzMzMzM0NDQzMzMzMzM0NDQzMzM0NDQ0NDRHvBUzMzMzMzM0NDQzMzMzMzM0NDQ0NDRHvRUzMzMzMzM0NDQ0NDQzMzM0NDQ0NDQzMzMzMzM0NDRHvBVHvRUzMzNGvRZGvBYzMzM0NDQ0NDQzMzMzMzMzMzM0NDQ0NDQzMzMzMzMzMzNGvBV7z1h8z1l90Ft+0Fzk9d3l9d7o9uLp9+Pp9+Ts+Ojt+Oj8/vv8/vz9/vyy4IxxAAAA0nRSTlMAAQIDBAUGBgcHCgsMDQ4PEBESExQWFxgYGhscHR4fICEiJCUnKCstLi4vMDEzNDU2Nzg5Ojs8PT4/QEFCREZHR0hKS01OT1BSU1RVVldZWltcXV5fYGFiY2RlZmdqa21ub3JzdHV3eHp7fH1+f4CCgoOEhYiJio2OkZOUlZaWl5ianZ6foKGkpaanqKqsrq+wsbS1t7i6u7y9v7/AwcLDxMXGx8jKy8zNztHS09XY2dnb3N3f4eLj4+Tl5+jr7O3v8PHx8vPz9PX29/j5+vv8/f7YW8u3AAAD8UlEQVRYw+2X91tURxSGD7I0EQU1NlSsWEBFxIoI1kQsWNFIoqJYsWAvSwnGgg0T7CIrClZYBTVEYlQUQUGlfGvv/ifO3Lu77HXHles+0fjI98M5M3vm7rx35ky5RHWqk1kuYfHpeaWleenxYS5fofsWicUGs4oTW3zh7t3i7hgUuhPn9kVfP8tgpSzRIGiCbP9RxkmPz+m/2xWDQFe6WDV0/LN6jYb5jRkK7TY3KIHn57y/sH9GYD0GE0qg8yLSQaFC+wDcsgwfUZZ1HnTKRW5LataG6y8ES75NK/sA4iz7fPLQshZn3dozsypcLrXF31bRGoCYNKMmfHICFPn/8qliLQgSsX6osRCFTZa/N2rPdBf+3LEhSTHNz/JPASQqRv31C0U1UfSEJkKSDskRJrkTzbZIiuMcYE4Q00YzQHe93k+4/xXbAihW7omOq7yZbQArtWX5mcNUDX1OzkVkcoCh/Im5ZoDfgN9FAGEGWwCGMEXjWFwNIHLVchXiiFabj2NSpbEcd6gCW6WBOCYAmAJEigDibQPEKxq7bkP5MLk4supWE6KAyuudLTMUt5gNgk4AQH7CGaB02wDpHzSPxT0pCQPLMIn71Sjwrom2w2Vm+yNDBPAR5dkGyPuw/XycdSDqeA1LpWq9FOh9zMEeOMPsIBxVAVAqd/T4+StJ797K/vlj+fdSqwdmNicaewNbyHNEb74kdqJ8RX1jLAQHmR2MQ+oBHj17KentG9k/M25ItwWPeG0HkpyoN/ZJ1TkVKBgnRyKxndkh2P8fTgHTH7jJN0MTAPXKRqpcSsA8ZocjTQWAyiSkphdjWu9tRzUAXtMHOkR0lYOnMJDZH7FHBYCqZcgHHMnMBqf5cYB6IdNYzuvMq/R+JdsSaQx2CQB+SEhoZvdGxKRHX2kWxnMATeFdDzqB7sZYIM5xNxFbBQBrgHV2b8VEfZDP13vVv87SFCzFDBplPpQ2QMvdDCQJABbBuHLtO4w2YTGz67FCzoFWFdnkcL68iXxOFsGf+9lYLwBwj452t/84blBSzc4dn7IKb2MSpsKXYrBACk7DCckvQayKJFR3IfkZh4n3qjWtgnD2ts0rCxz5pngW8uVjB37hAEmzmPbUAkDNlSwbk/lGc7OpCcC97Joz7cVoVl+If5x5m5YP0F/NhUTNpdQXJWweAy7NI2cn+pWvNjYa4TT2wkiing+qQ6j95J+W5OOqhgOkLGM6UBuA2l/LV2Izdx6uFIoyIIqVIzL7kSM7nugI1hJ14O9cFEyqckDFh4lmfA/TeZCbe3pxQ34HMcVab3ViNnrl8qlevDogUror+0b6fxOfZl//4/R/8Hlep+9W7wGWLhTo3tfbygAAAABJRU5ErkJggg==) no-repeat;
        background-position-y: 7px;
        background-size: 64px 20px;
        content: '';
    }
    .select-creat-author .not-add:before {
        display: block;
        -ms-flex-preferred-size: 64px;
        flex-basis: 64px;
        width: 64px;
        height: 34px;
        background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAoCAMAAAABrwJ6AAACplBMVEUAAAD///9/f39VVVVAQEAzMzNVVVVV1CpJSUlJ2yQzMzNGRkZAQEA7Ozs3NzczMzNAQEA8PDw5OTk2NjYzMzM6Ojo3Nzc1NTVKvxU7Ozs5OTk3Nzc1NTUzMzM6Ojo4ODg2NjY0NDQ5OTk3Nzc0NDQzMzM1NTVKwRc3NzdIvBY2NjY1NTU0NDQ3Nzc2NjY1NTU0NDQzMzM3Nzc2NjY1NTU0NDQzMzM2NjY1NTU1NTU0NDQzMzM2NjY0NDQzMzM2NjZIvhY1NTU0NDQzMzM1NTU0NDQ0NDQzMzM1NTU0NDQ0NDQzMzM1NTU1NTU0NDQzMzM1NTU1NTU0NDQ0NDQzMzM1NTU1NTU0NDQ0NDQzMzM1NTU0NDQ0NDQ1NTU0NDQzMzMzMzM1NTUzMzMzMzM1NTU0NDQzMzMzMzM0NDQ0NDQzMzMzMzM1NTU0NDQ0NDQzMzNHvBY1NTU0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQzMzM0NDQ0NDRGvBYzMzNHvRY0NDQ0NDQzMzM0NDQ0NDQzMzMzMzM0NDQzMzMzMzM0NDQ0NDQ0NDQzMzM0NDQzMzMzMzM0NDQ0NDQzMzM0NDQ0NDQzMzM0NDQ0NDQ0NDQzMzM0NDRHvBU0NDQ0NDQzMzMzMzM0NDQ0NDQ0NDRGvBYzMzM0NDQ0NDQzMzMzMzM0NDQzMzMzMzM0NDQzMzM0NDQ0NDRHvBUzMzMzMzM0NDQzMzMzMzM0NDQ0NDRHvRUzMzMzMzM0NDQ0NDQzMzM0NDQ0NDQzMzMzMzM0NDRHvBVHvRUzMzNGvRZGvBYzMzM0NDQ0NDQzMzMzMzMzMzM0NDQ0NDQzMzMzMzMzMzNGvBV7z1h8z1l90Ft+0Fzk9d3l9d7o9uLp9+Pp9+Ts+Ojt+Oj8/vv8/vz9/vyy4IxxAAAA0nRSTlMAAQIDBAUGBgcHCgsMDQ4PEBESExQWFxgYGhscHR4fICEiJCUnKCstLi4vMDEzNDU2Nzg5Ojs8PT4/QEFCREZHR0hKS01OT1BSU1RVVldZWltcXV5fYGFiY2RlZmdqa21ub3JzdHV3eHp7fH1+f4CCgoOEhYiJio2OkZOUlZaWl5ianZ6foKGkpaanqKqsrq+wsbS1t7i6u7y9v7/AwcLDxMXGx8jKy8zNztHS09XY2dnb3N3f4eLj4+Tl5+jr7O3v8PHx8vPz9PX29/j5+vv8/f7YW8u3AAAD8UlEQVRYw+2X91tURxSGD7I0EQU1NlSsWEBFxIoI1kQsWNFIoqJYsWAvSwnGgg0T7CIrClZYBTVEYlQUQUGlfGvv/ifO3Lu77HXHles+0fjI98M5M3vm7rx35ky5RHWqk1kuYfHpeaWleenxYS5fofsWicUGs4oTW3zh7t3i7hgUuhPn9kVfP8tgpSzRIGiCbP9RxkmPz+m/2xWDQFe6WDV0/LN6jYb5jRkK7TY3KIHn57y/sH9GYD0GE0qg8yLSQaFC+wDcsgwfUZZ1HnTKRW5LataG6y8ES75NK/sA4iz7fPLQshZn3dozsypcLrXF31bRGoCYNKMmfHICFPn/8qliLQgSsX6osRCFTZa/N2rPdBf+3LEhSTHNz/JPASQqRv31C0U1UfSEJkKSDskRJrkTzbZIiuMcYE4Q00YzQHe93k+4/xXbAihW7omOq7yZbQArtWX5mcNUDX1OzkVkcoCh/Im5ZoDfgN9FAGEGWwCGMEXjWFwNIHLVchXiiFabj2NSpbEcd6gCW6WBOCYAmAJEigDibQPEKxq7bkP5MLk4supWE6KAyuudLTMUt5gNgk4AQH7CGaB02wDpHzSPxT0pCQPLMIn71Sjwrom2w2Vm+yNDBPAR5dkGyPuw/XycdSDqeA1LpWq9FOh9zMEeOMPsIBxVAVAqd/T4+StJ797K/vlj+fdSqwdmNicaewNbyHNEb74kdqJ8RX1jLAQHmR2MQ+oBHj17KentG9k/M25ItwWPeG0HkpyoN/ZJ1TkVKBgnRyKxndkh2P8fTgHTH7jJN0MTAPXKRqpcSsA8ZocjTQWAyiSkphdjWu9tRzUAXtMHOkR0lYOnMJDZH7FHBYCqZcgHHMnMBqf5cYB6IdNYzuvMq/R+JdsSaQx2CQB+SEhoZvdGxKRHX2kWxnMATeFdDzqB7sZYIM5xNxFbBQBrgHV2b8VEfZDP13vVv87SFCzFDBplPpQ2QMvdDCQJABbBuHLtO4w2YTGz67FCzoFWFdnkcL68iXxOFsGf+9lYLwBwj452t/84blBSzc4dn7IKb2MSpsKXYrBACk7DCckvQayKJFR3IfkZh4n3qjWtgnD2ts0rCxz5pngW8uVjB37hAEmzmPbUAkDNlSwbk/lGc7OpCcC97Joz7cVoVl+If5x5m5YP0F/NhUTNpdQXJWweAy7NI2cn+pWvNjYa4TT2wkiing+qQ6j95J+W5OOqhgOkLGM6UBuA2l/LV2Izdx6uFIoyIIqVIzL7kSM7nugI1hJ14O9cFEyqckDFh4lmfA/TeZCbe3pxQ34HMcVab3ViNnrl8qlevDogUror+0b6fxOfZl//4/R/8Hlep+9W7wGWLhTo3tfbygAAAABJRU5ErkJggg==) no-repeat;
        background-position-y: 7px;
        background-size: 64px 20px;
        content: '';
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
