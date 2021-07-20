<template>
    <div class="module">
        <div class="caption">
            <div class="title" @click="navigatePlate(3, true)">
                <span class="iconfont icon-fanhui"></span>
                {{ operationForm.id ? '编辑图片' : '添加图片' }}
            </div>
        </div>
        <div class="plate">
            <el-form class="create-plate" label-position="top" :model="operationForm" :rules="rules" ref="formRef">
                <el-form-item label="内容名称" prop="title">
                    <el-input style="width:280px" placeholder="请输入" v-model="operationForm.title"></el-input>
                </el-form-item>
                <el-form-item label="上传图片" prop="img">
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
                        <div class="tips">{{ adviceSize[addLayout.kind - 1].size }}</div>
                    </el-upload>
                </el-form-item>
                <el-form-item class="form-item" label="板块类型" prop="type">
                    <el-radio-group v-model="operationForm.type" @change="chooseLinkType">
                        <el-radio class="type-radio" :label="1">商品列表页</el-radio>
                        <el-radio class="type-radio" :label="2">商品详情页</el-radio>
                        <el-radio class="type-radio" :label="3">直播页</el-radio>
                        <el-radio class="type-radio" :label="5">页面</el-radio>
                        <el-radio class="type-radio" :label="4">自定义（手填）</el-radio>
                        <el-radio class="type-radio" :label="6">优惠券领取</el-radio>
                        <el-radio class="type-radio" :label="7">产品系列</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" :label="back_link_label(operationForm.type)" prop="link">
                    <el-input type="textarea" :rows="3" placeholder="请输入" v-model="operationForm.link" style="width:280px" />
                    <template v-if="operationForm.type == 1">
                        <div class="tip-text">
                            <div>示例：name=布组&brand=川水&color=红色||灰色&material=棉&origin=中国&pattern=&other_id=-1&tag_id=34||3 。</div>
                            <div>其中other_id最多只能有一个值,属性和标签可以有多个值。</div>
                        </div>
                    </template>
                    <template v-if="operationForm.type == 2">
                        <div class="tip-text">商品id可以在商品列表页中查看。</div>
                    </template>
                    <template v-if="operationForm.type == 3">
                        <div class="tip-text">房间号可以通过在微信后台查看。</div>
                    </template>
                    <template v-if="operationForm.type == 4">
                        <div class="tip-text">请填写完整路径，如果您不知道如何填写，请勿使用该选项。</div>
                    </template>
                    <template v-if="operationForm.type == 5">
                        <div class="tip-text">页面id可以在页面列表页中查看。</div>
                    </template>
                    <template v-if="operationForm.type == 6">
                        <div class="tip-text">优惠券id可以在优惠券列表页中查看。</div>
                    </template>
                    <template v-if="operationForm.type == 7">
                        <div class="tip-text">产品系列id可以在产品系列列表页中查看。</div>
                    </template>
                </el-form-item>
                <el-form-item label="描述备注">
                    <el-input style="width:280px" placeholder="请输入" v-model="operationForm.remarks"></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div class="bottom">
            <el-button class="bottom-btn" type="" @click="navigatePlate(3, true)">取 消</el-button>
            <el-button class="bottom-btn" type="danger" @click="deleteImg" v-if="!operationForm.isNew">删 除</el-button>
            <el-button class="bottom-btn" type="primary" @click="save">保 存</el-button>
        </div>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" />
    </div>
</template>

<script>
import ElImageViewer from '@/components/common/image-viewer'
import { deleteLayoutContent } from '@/api/plate'
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'

import { getToken } from '@/utils/auth'
export default {
    name: 'Index-Init',
    props: {},
    data() {
        return {
            addLayout: this.$store.state.addLayout,
            // 创建模块
            operationForm: this.$store.state.addImg,
            // operationForm: {
            //     link: '',
            //     id: 0, //0新增 大于0修改
            //     img: '', //
            //     parameter: '', //
            //     remarks: '', //
            //     title: '', //
            //     type: '', //类型：1.商品列表，2.商品详情，3.直播间，4.页面，5.自定义，6.优惠券领取，7.产品系列
            //     status: 2 //内容显示状态：1不显示，2显示
            // },

            header: {},
            dialogVisiblePic: false,
            previewUrlList: [],
            rules: {
                title: [{ required: true, trigger: 'blur', message: '请输入名称' }],
                link: [{ required: true, trigger: 'blur', message: '请输入参数' }],
                type: [{ required: true, trigger: 'blur', message: '请选择类型' }],
                img: [{ required: true, trigger: 'blur', message: '请上传图片' }]
            },
            iconBanner: require('@/assets/img/plate-banner.png'),
            iconAdd: require('@/assets/img/plate-add.png'),
            iconList: [
                require('@/assets/img/plate-icon1.png'),
                require('@/assets/img/plate-icon2.png'),
                require('@/assets/img/plate-icon3.png'),
                require('@/assets/img/plate-icon4.png')
            ],
            adviceSize: [{ size: '670*240px' }, { size: '750*360px' }, { size: '210*280px' }, { size: '600*280px' }, { size: '750*680px' }],
            plateType: [
                {
                    type: 1,
                    name: '有边距横图'
                },
                {
                    type: 2,
                    name: '无边距横图'
                },
                {
                    type: 3,
                    name: '三竖图'
                },
                {
                    type: 4,
                    name: '滑动横图'
                }
            ],
            TYPE: {
                1: '有边距横图',
                2: '无边距横图',
                3: '三竖图',
                4: '滑动横图'
            },
            timg: []
        }
    },
    components: {
        ElImageViewer
    },
    computed: {
        // back_link_label
        back_link_label: function() {
            let link_label = ''
            return data => {
                if (data === 1) {
                    link_label = '参数:'
                } else if (data === 2) {
                    link_label = '商品ID:'
                } else if (data === 3) {
                    link_label = '房间号:'
                } else if (data === 5) {
                    link_label = '页面ID:'
                } else if (data === 6) {
                    link_label = '优惠券ID:'
                } else if (data === 7) {
                    link_label = '系列ID:'
                } else {
                    link_label = 'link:'
                }
                return link_label
            }
        }
    },
    watch: {},
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
    },
    mounted() {
        if (!this.operationForm.isNew) {
            this.timg = [{ id: this.operationForm.id, url: this.operationForm.img }]

            let advType = this.operationForm.type,
                link = '',
                parameter = this.operationForm.parameter
            if (parameter.indexOf('/pages/goodsSearchResult/goodsSearchResult?') > -1) {
                // 商品列表
                advType = 1
                link = parameter.split('/pages/goodsSearchResult/goodsSearchResult?')[1]
            } else if (parameter.indexOf('/pages/goodsDetail/goodsDetail?goodsId=') > -1) {
                // 商品详情
                advType = 2
                link = parameter.split('/pages/goodsDetail/goodsDetail?goodsId=')[1]
            } else if (parameter.indexOf('plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=') > -1) {
                // 直播间
                advType = 3
                link = parameter.split('plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=')[1]
            } else if (parameter.indexOf('/packageAgent/article/article?id=') > -1) {
                // 商品详情
                advType = 5
                link = parameter.split('/packageAgent/article/article?id=')[1]
            } else if (parameter.indexOf('/packageMainSecondary/couponReceive/couponReceive?id=') > -1) {
                // 商品详情
                advType = 6
                link = parameter.split('/packageMainSecondary/couponReceive/couponReceive?id=')[1]
            } else if (parameter.indexOf('/packageMainSecondary/series/series?id=') > -1) {
                // 商品详情
                advType = 7
                link = parameter.split('/packageMainSecondary/series/series?id=')[1]
            } else {
                // 自定义
                advType = 4
                link = parameter
            }
            this.$set(this.operationForm, 'link', link)
        }
    },
    methods: {
        // 跳转
        navigatePlate(index, cancel = false) {
            // 未保存返回 则删除新增的
            if (cancel) {
                for (let i = 0; i < this.addLayout.ContentList.length; i++) {
                    const element = this.addLayout.ContentList[i]
                    if (element.customId == this.operationForm.customId) {
                        if (element.isNew) {
                            this.addLayout.ContentList.splice(i, 1)
                        }
                        break
                    }
                }
            }
            this.$emit('navigatePlate', index)
        },
        // 删除图片
        deleteImg() {
            this.$confirm('确认删除该图片', '', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                if (this.operationForm.id) {
                    // 已保存过
                    deleteLayoutContent({ contentId: this.operationForm.id })
                        .then(res => {
                            if (res.code === 200) {
                                this.$notify({
                                    title: '删除成功',
                                    message: '',
                                    type: 'success',
                                    duration: 3000
                                })
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    message: '',
                                    type: 'error',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(() => {
                            console.log('取消')
                        })
                }
                let index = this.addLayout.ContentList.findIndex(item => item.customId == this.operationForm.customId)

                this.addLayout.ContentList.splice(index, 1)
                this.$store.commit('setAddLayout', this.addLayout)

                this.navigatePlate(3)
            })
        },
        // 图片上传前检测 首图
        beforeUpload(file) {
            if ((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') && file.size <= 1024 * 1024 * 5) {
                this.upload_loading = this.uploadLoading('上传中')
                this.uploadVisible = false
            } else {
                if (file.size > 1024 * 1024 * 5) {
                    this.$notify({
                        title: '照片大小应不超过5M',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                } else {
                    this.$notify({
                        title: '照片格式只支持JPG、PNG',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
                return false
            }
        },
        // 单张图片上传成功回调 首图
        uploadImgSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 2000
                })
                this.upload_loading.close()
                this.timg = fileList
                this.operationForm.img = this.timg[0].response.data.file_url
            } else {
                this.upload_loading.close()
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
            }
        },
        // 单张图片上传失败回调 首图
        uploadImgError(err, file, fileList) {
            this.upload_loading.close()
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            })
        },

        //  首图
        handleRemove(file, fileList) {
            this.timg = fileList
        },
        closePreview() {
            this.dialogVisiblePic = false
        },
        handlePictureCardPreview(file) {
            if (file.response) {
                this.previewUrlList = [file.response.data.file_url]
            } else {
                this.previewUrlList = [file.url]
            }
            this.dialogVisiblePic = true
        },
        // 切换链接类型
        chooseLinkType() {
            this.$nextTick(() => {
                this.$set(this.operationForm, 'link', '') // 清除link内容
            })
        },
        save() {
            const rLoading = this.openLoading()
            // format
            // this.operationForm.img = this.timg.length > 0 ? (this.timg[0].id ? this.timg[0].url : this.timg[0].response.data.file_url) : ''
            let new_link = ''
            if (this.operationForm.type === 1) {
                // 商品列表
                new_link = '/pages/goodsSearchResult/goodsSearchResult?' + this.operationForm.link
            } else if (this.operationForm.type === 2) {
                // 商品详情
                new_link = '/pages/goodsDetail/goodsDetail?goodsId=' + this.operationForm.link
            } else if (this.operationForm.type === 3) {
                // 直播间
                new_link = 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=' + this.operationForm.link
            } else if (this.operationForm.type === 4) {
                // 自定义
                new_link = this.operationForm.link
            } else if (this.operationForm.type === 5) {
                // 页面
                new_link = '/packageAgent/article/article?id=' + this.operationForm.link
            } else if (this.operationForm.type === 6) {
                // 优惠券
                new_link = '/packageMainSecondary/couponReceive/couponReceive?id=' + this.operationForm.link
            } else if (this.operationForm.type === 7) {
                // 产品系列
                new_link = '/packageMainSecondary/series/series?id=' + this.operationForm.link
            }
            this.operationForm.parameter = new_link
            this.$refs['formRef'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    // if (!this.operationForm.isNew) {
                    //     for (let i = 0; i < this.addLayout.ContentList.length; i++) {
                    //         const element = this.addLayout.ContentList[i]
                    //         if (element.customId == this.operationForm.customId) {
                    //             this.addLayout.ContentList[i] = _.cloneDeep(this.operationForm)
                    //             this.navigatePlate(4)
                    //             break
                    //         }
                    //     }
                    // } else {
                    //     this.addLayout.ContentList.push(_.cloneDeep(this.operationForm))
                    // }

                    this.navigatePlate(3)
                    rLoading.close()
                } else {
                    rLoading.close()
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
        }
    }
}
</script>

<style scoped="scoped" lang="less">
.module {
    display: flex;
    flex-direction: column;
    height: 100%;

    .caption {
        position: relative;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        height: 60px;
        border-bottom: 1px solid #dddddd;
        .title {
            display: flex;
            align-items: center;
            .iconfont {
                margin: 0 92px 0 20px;
                cursor: pointer;
            }
        }
        .shop-title {
            display: flex;
            align-items: center;
            cursor: pointer;
            .shop-title-icon {
                margin-right: 8px;
                width: 24px;
                height: 24px;
                border-radius: 24px;
            }
        }
    }
    .plate {
        display: flex;
        overflow-y: scroll;
        align-items: center;
        flex-direction: column;
        flex-grow: 1;
        padding-top: 15px;
        .create-plate {
            width: 280px;
            .type-radio {
                margin-top: 12px;
                width: 100px;
            }
            .tip-text {
                color: rgba(136, 136, 136, 0.85);
                font-size: 12px;
                line-height: 18px;
            }
        }
        & /deep/ .el-upload--picture-card {
            display: flex;
            align-items: center;
            flex-direction: column;
            .el-icon-plus {
                margin-top: 56px;
            }
            .tips {
                color: rgba(0, 0, 0, 0.65);
                line-height: 60px;
            }
        }
        .hide-upload {
            & /deep/ .el-upload--picture-card {
                display: none;
            }
        }
        .item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            width: 290px;
            height: 80px;
            border: 1px solid #f5f5f5;
            border-radius: 10px;
            background: #f5f5f5;
            cursor: pointer;

            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 12px;
                width: 56px;
                height: 56px;
                border: 1px solid #d8d8d8;
                border-radius: 3px;
                background: #e8e8e8;
                .icon-img {
                    width: 36px;
                    height: 36px;
                }
            }
            .title {
                margin-left: 15px;
                color: rgba(0, 0, 0, 0.65);
                font-size: 16px;
            }
            .visible {
                margin-left: auto;
                font-size: 18px;
                cursor: pointer;
            }
            .handle {
                margin-right: 10px;
                margin-left: 8px;
                font-size: 18px;
                cursor: pointer;
            }
            &.add {
                .icon {
                    border: none;
                    background: #f5f5f5;
                }
                .title {
                    color: #1890ff;
                }
            }
            &.active {
                border: 1px solid #1890ff;
                background: rgba(24, 144, 255, 0.08);
            }
        }
    }
    .bottom {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        justify-content: flex-end;
        box-sizing: border-box;
        padding: 0 20px;
        height: 60px;
        border-top: 1px solid #dddddd;
        .bottom-btn {
            width: 60px;
            height: 32px;
        }
    }
}

// 选择店铺
.shop-wrap {
    margin: 0 auto;
}
.shop-dropdown-ul {
    .shop-dropdown-li {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        .shop-icon {
            margin-right: 10px;
            width: 30px;
            height: 30px;
        }
    }
}
// 还原
.revoke-popover {
    position: absolute;
    top: 10px;
    left: 10px;
    .operate {
    }
    .text {
        display: flex;
        align-items: center;
        font-size: 10px;
        cursor: pointer;
        .dot {
            margin-right: 4px;
            width: 8px;
            height: 8px;
            border-radius: 8px;
            background: #faad14;
        }
    }
}
.el-form--label-top /deep/ .el-form-item__label {
    padding: 0;
}
</style>
