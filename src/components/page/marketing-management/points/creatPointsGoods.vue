<template>
    <div class="app-container">
        <!-- 原订单信息 -->
        <div class="wrap detail">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">新增</div>
            </div>
            <div class="divider"></div>
            <div class="substance" style="padding: 22px 32px 32px">
                <el-form class="freight-form" :inline="false" :model="goods" :rules="rules" ref="formRef" label-width="100px">
                    <el-form-item label="类型" prop="title">
                        <el-radio-group v-model="goods.radio" @change="onChangeRadio">
                            <el-radio :label="3">商品</el-radio>
                            <el-radio :label="6">优惠券</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="可用店铺" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="商品名称" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title"></el-input>
                    </el-form-item>
                    <el-form-item label="商品图片">
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
                    <el-form-item label="商品属性" prop="title">
                        <el-button type="primary" size="mini" @click="addAttr">添加</el-button>
                        <div class="attr" v-for="(item, index) in attrList" :key="index">
                            <el-input style="width:100px;margin-right:10px" placeholder="属性名称" v-model="item.label"></el-input>
                            <el-input style="width:180px;margin-right:10px" placeholder="属性值" v-model="item.value"></el-input>
                            <el-button type="danger" size="mini" @click="deleteAttr(index)">删除</el-button>
                        </div>
                    </el-form-item>
                    <el-form-item label="需要积分" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title"></el-input>
                    </el-form-item>
                    <el-form-item label="原售价" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title"></el-input>
                    </el-form-item>
                    <el-form-item label="库存数量" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title"></el-input>
                    </el-form-item>
                    <el-form-item label="单用户限制" prop="title">
                        <el-input style="width:180px" placeholder="请输入" v-model="goods.title"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div class="brn-wrap">
                <el-button type="danger" size="large">删除</el-button>
                <el-button type="primary" size="large">保存</el-button>
            </div>
        </div>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>
</template>
<script>
import { queryAfterSaleDetail } from '@/api/afterSale'
import { getToken } from '@/utils/auth'

import { formatMoney } from '@/plugin/tool'
import ElImageViewer from '@/components/common/image-viewer'
export default {
    data() {
        return {
            id: '',

            detail: null,
            list: null,
            logList: null,
            listLoading: false,
            header: {},
            goods: {
                title: '',
                radio: ''
            },
            tfile: [],
            attrList: [{ label: '', value: '' }],
            rules: {
                imgs: [{ required: true, message: '请上传图片', trigger: 'blur' }],
                title: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
                ],
                display_sales: [
                    { required: true, message: '请输入销量', trigger: 'blur' },
                    { type: 'number', message: '请输入数字' }
                ],
                freight_id: [{ required: true, message: '请选择运费模板', trigger: 'blur' }],
                category_id: [{ required: true, message: '请选择分类', trigger: 'blur' }]
            },
            //图片预览
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: ''
        }
    },
    components: {
        ElImageViewer
    },
    created() {
        // this.id = Number(this.$route.query.id)
        // this.order_id = Number(this.$route.query.orderId)
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
        // this.getDetail()
    },
    mounted() {},
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        getDetail() {
            let params = {
                id: this.id
            }

            console.log(params)
            queryAfterSaleDetail(params)
                .then(res => {
                    console.log('GOOGLE: res', res)

                    this.detail = res.data
                })
                .catch(err => {})
        },
        addAttr() {
            if (this.attrList.length < 6) {
                this.attrList.push({ label: '', value: '' })
            }
        },
        deleteAttr(index) {
            this.attrList.splice(index, 1)
        },
        // 图片上传前检测
        beforeUploadMultiple(file) {
            if ((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') && file.size <= 1024 * 1024 * 5) {
                this.upload_loading = this.uploadLoading('上传中')
                this.uploadVisible = false
            } else {
                if (file.size > 1024 * 1024 * 5) {
                    this.$notify({
                        title: '文件大小应不超过5M',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                } else {
                    this.$notify({
                        title: '文件格式只支持JPG、PNG',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
                return false
            }
        },
        // 图片上传成功回调
        uploadImgSuccessMultiple(response, file, fileList) {
            console.log('GOOGLE: fileList', fileList)
            console.log('GOOGLE: file', file)
            let status = fileList.every(item => item.type || (item.response && item.response.code == 200))
            if (status) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                })
                this.upload_loading.close()
                // 上传视频 替换一张可显示图片
                // if (file.raw.type == 'video/mp4') {
                //     file.url = this.imgVedio;
                // }
                // fileList = fileList.map(item => {
                //     if (item.type == 1 || item.type == 2) {
                //         return item
                //     }
                //     if (item.raw.type == 'video/mp4') {
                //         item.url = this.imgVedio
                //     }
                //     return item
                // })
                // // this.tfile.push(file);
                this.tfile = fileList
            }
            if (response.code != 200) {
                this.upload_loading.close()
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
            }
        },
        // 图片上传失败回调
        uploadImgErrorMultiple(err, file, fileList) {
            this.upload_loading.close()
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            })
        },
        // 图片视频
        handleRemoveMultiple(file) {
            this.tfile.splice(this.tfile.indexOf(file), 1)
        },
        // 图片视频
        handleExceedMultiple(files, fileList) {
            this.$notify({
                title: '只能上传6张图片',
                message: '',
                type: 'warning',
                duration: 5000
            })
        },
        // 预览
        handlePictureCardPreview(file) {
            if (file.response) {
                this.dialogImageUrl = file.response.data.file_url
            } else {
                this.dialogImageUrl = file.url
            }

            this.previewUrlList = []
            let list = this.tfile
            for (let i = 0; i < list.length; i++) {
                const item = list[i]
                if (item.response) {
                    this.previewUrlList.push(item.response.data.file_url)
                } else {
                    this.previewUrlList.push(dialogImageUrl)
                }
            }
            this.previewIndex = this.previewUrlList.indexOf(this.dialogImageUrl)
            this.dialogVisiblePic = true
        },
        // 图片左移
        handlePictureLeft(file) {
            let index = this.tfile.indexOf(file)
            if (index == 0) {
                return
            }
            this.swapItems(index, index - 1)
        },
        // 图片右移
        handlePictureRight(file) {
            let index = this.tfile.indexOf(file)
            if (index == this.tfile.length - 1) {
                return
            }
            this.swapItems(index, index + 1)
        },
        // 图片位置交换方法
        swapItems(index1, index2) {
            this.tfile[index1] = this.tfile.splice(index2, 1, this.tfile[index1])[0]
        },
        closePreview() {
            this.dialogVisiblePic = false
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleFilter()
        },
        onChangeRadio() {
            this.$router.push('/mall-backend-page-points-coupon-creat')
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.page-title {
    box-sizing: border-box;
    padding-left: 24px;
    width: 100%;
    height: 80px;
    border-radius: 2px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 20px;
    line-height: 80px;
}

.wrap {
    border-radius: 2px;
    background: #fff;
}
.detail {
    .substance {
        padding: 32px;
        .divider {
            margin: 32px 0;
        }
        .label {
            color: rgba(0, 0, 0, 0.85);
        }
        .order-info {
            display: flex;
            flex-wrap: wrap;
            padding-top: 10px;

            .sheet {
                margin-right: 20px;
                padding-top: 10px;
            }
            .w280 {
                /*width: 300px;*/
                min-width: 280px;
            }
            &:first-child {
                padding-top: 0;
                /*.sheet{*/
                /*    padding-top: 0;*/
                /*}*/
            }
            .remark-box {
                display: flex;
                .label {
                    width: 72px;
                }
                .value {
                    flex: 1;
                }
            }
        }
        .info {
            display: flex;
            justify-content: space-between;
        }
        .sheet-img {
            display: flex;
            margin-top: 32px;
        }
        .apply-img {
            margin-right: 12px;
            width: 120px;
            height: 120px;
            cursor: pointer;
        }
    }
}
.goods {
    .substance {
        padding: 32px;
        .label {
            color: rgba(0, 0, 0, 0.85);
        }
        .divider {
            margin: 30px 0 20px;
        }
        .goods-img {
            width: 80px;
            height: 60px;
        }
        .express {
            display: flex;
            .sheet {
                margin-right: 240px;
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
        // .thimg {
        //     height: 148px;
        //     position: absolute;
        //     left: 150px;
        // }
        // .upload-demo {
        //     position: relative;
        // }
        .sheet-certificate {
            .upload {
                margin-top: 20px;
            }
        }
        .certificate-img {
            height: 60px;
        }
    }
}
.brn-wrap {
    padding: 0px 0 34px 32px;
}
.attr {
    margin-top: 20px;
}
</style>
