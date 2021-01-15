<template>
    <div class="app-container operation-container">
        <el-form
            class="freight-form"
            label-position="right"
            :model="operationForm"
            :rules="rules"
            ref="operationForm"
            label-width="100px"
        >
            <!-- 新增商品 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">{{operationTitle}}</div>
            </div>
            <div class="divider"></div>
            <div class="form-content">
                <el-form-item class="form-item" label="广告状态:" prop="status">
                    <el-radio-group
                        v-model="operationForm.status"
                        @change="chooseStatusType"
                    >
                        <el-radio :label="2">上架</el-radio>
                        <el-radio :label="1">下架</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" label="location:" prop="location">
                    <el-select
                        class="w300"
                        filterable
                        placeholder="请选择广告位"
                        v-model="operationForm.location"
                        @change="locationChange"
                    >
                        <el-option
                                v-for="item in locationOptions"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="logo" label="广告图片:">
                    <el-upload
                            class="avatar-uploader"
                            :class="{'has-pic':imageUrl}"
                            :action="uploadImgUrl"
                            :on-success="handleAvatarSuccess"
                            :on-error="uploadError"
                            :before-upload="beforeAvatarUpload"
                            :on-remove="handleRemove"
                            :show-file-list="false"
                            :headers="header"
                            :disabled="!operationForm.location"
                    >
                        <img
                            v-if="imageUrl"
                            :src="imageUrl"
                            class="avatar"
                        />
                        <div v-else class="avatar-uploader-icon">
                            <img src="../../../../assets/img/Icon-Plus.svg" alt="">
                            <div class="choose-location">
                                <span class="add-img-text">
                                    {{operationForm.location > 0 ? '建议尺寸：' : '请先选择'}}
                                </span>
                                <span class="add-img-text">
                                    {{operationForm.location > 0 ? (operationForm.location === 1? '690*400px':'690*144px') : 'Location'}}
                                </span>
                            </div>
                        </div>
                        <div class="magnifier-box" v-show="imageUrl" @click.stop="viewBigImg">
                            <img class="magnifier-img" src="../../../../assets/img/magnifier-icon.png" />
                        </div>
                    </el-upload>
                </el-form-item>
                <el-form-item class="form-item" label="广告名称:" prop="title">
                    <el-input class="w300" placeholder="请输入广告名称" v-model="operationForm.title"/>
                </el-form-item>
                <el-form-item class="form-item" label="Link:" prop="link">
                    <el-input class="w300" placeholder="请输入活动链接" v-model="operationForm.link"/>
                </el-form-item>
                <el-form-item class="form-item" label="描述:" prop="description">
                    <el-input class="w300" placeholder="请输入广告描述" v-model="operationForm.description"/>
                </el-form-item>
                <el-form-item class="form-item" label="可用店铺:" prop="shop_id">
                    <el-select class="w300" filterable placeholder="请选择店铺" v-model="operationForm.shop_id">
                        <el-option
                                v-for="item in shopList"
                                :key="item.id"
                                :label="item.shop_name"
                                :value="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <template>
                    <el-form-item class="form-item inline-block" label="时间:" prop="start_time">
                        <el-date-picker
                                style="width:200px"
                                class="filter-item"
                                v-model="operationForm.start_time"
                                type="datetime"
                                placeholder="开始时间"
                                default-time="00:00:00"
                                format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="optionsStart"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <span style="padding: 0 10px">至</span>
                    <el-form-item class="form-item inline-block" label="" prop="valid_end_time" label-width="0px">
                        <el-date-picker
                                style="width:200px"
                                class="filter-item"
                                v-model="operationForm.end_time"
                                type="datetime"
                                placeholder="结束时间"
                                default-time="23:59:59"
                                format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="optionsEnd"
                        >
                        </el-date-picker>
                    </el-form-item>
                </template>
            </div>
            <div class="operations">
                <el-button type="primary" :disabled="saveIsClick"  @click="handleSave('operationForm')">保存</el-button>
                <el-button class="btn-cancel" type="danger" :disabled="saveIsClick"  @click="handleCancel('operationForm')">取消</el-button>
            </div>
        </el-form>
        <!--大图预览-->
        <el-image-viewer
                v-if="dialogVisiblePic"
                :on-close="closePreview"
                :url-list="imgSrcList" />
    </div>
</template>
<script>
import { mixinsAdv } from '../../../mixins/adv'
import './adv.less'
export default {
    name: 'AdvCreat',
    mixins: [mixinsAdv],
    data() {
        return {}
    },
    created() {},
    methods: {}
}
</script>

<style lang="less">
    .el-cascader-node > .el-radio {
        display: none;
    }
    .select-item {
        display: inline-block;
        width: 100%;
    }
    .el-cascader__tags .el-tag{
        display: none;
    }
</style>
