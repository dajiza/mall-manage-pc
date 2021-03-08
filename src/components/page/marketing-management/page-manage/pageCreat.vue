<template>
    <div class="app-container">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">新建页面</div>
        </div>
        <div class="form-content">
            <el-form>
                <el-form-item label="页面名称">
                    <!-- <span>菜单名称：</span> -->
                    <el-input placeholder="标题" v-model="validate.title" style="width:532px;"></el-input>
                </el-form-item>
            </el-form>

            <Editor :content="editContent" v-model="validate.content"></Editor>
        </div>
        <div class="submit-wrap">
            <el-button class="submit-btn" type="primary" size="small" @click.native="submit">提交</el-button>
        </div>
    </div>
</template>

<script>
// import { newArticle, fetchArticle, editArticle, uploadImg, imageList } from '@/api/wechat'
// import { getToken } from '@/utils/auth'
import Editor from '@/components/common/editor/Editor'

export default {
    data() {
        return {
            headers: { Authorization: ' ' + '' },
            editContent: '', //编辑状态 初始文章
            author: '',
            validate: {
                title: '',
                content: ''
            },

            id: null,
            file: '',
            filename: '',
            uploadImg: '',
            showCoverPic: true, //是否展示封面
            thumbUrl: '', //封面地址
            contentSourceUrl: '', //原文链接
            rules: {
                title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
                content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
            },
            // 弹框显示控制
            dialogImage: false
        }
    },
    components: { Editor },
    created() {
        this.id = this.$route.query.id
    },
    mounted() {
        if (this.id) {
            fetchArticle(this.id)
                .then(res => {
                    console.log('TCL: res', res)
                    this.validate.title = res.title
                    this.author = res.author
                    // this.validate.content = res.content
                    this.showCoverPic = res.showCoverPic
                    this.thumbUrl = res.thumbUrl
                    this.contentSourceUrl = res.contentSourceUrl
                    this.editContent = res.content
                    this.validate.content = res.content
                })
                .catch(err => {
                    // console.log(err.response.data.message)
                })
        }
    },

    methods: {
        save() {
            console.log('GOOGLE: validate', this.validate)
            // 判断标题和内容
            if (this.validate.title && this.validate.content) {
                // 封面判断
                if (this.thumbUrl == '' && this.showCoverPic) {
                    this.$notify({
                        title: '请上传封面',
                        message: '选择显示封面后，需要上传封面',
                        type: 'error',
                        duration: 2500
                    })
                } else {
                    // 根据是否有id 判别新建\编辑
                    if (this.id) {
                        // this.thumbUrl = this.file
                        editArticle(this.id, this.validate.title, this.author, this.validate.content, this.showCoverPic, this.thumbUrl, this.contentSourceUrl)
                            .then(res => {
                                this.$notify({
                                    title: '编辑成功',
                                    message: '',
                                    type: 'success',
                                    duration: 2500
                                })
                            })
                            .catch(err => {
                                // console.log(err.response.data.message)
                            })
                    } else {
                        newArticle(this.validate.title, this.author, this.validate.content, this.showCoverPic, this.thumbUrl, this.contentSourceUrl)
                            .then(res => {
                                this.id = res.id
                                this.$notify({
                                    title: '保存成功',
                                    message: '跳转本文章编辑页面',
                                    type: 'success',
                                    duration: 2500
                                })
                            })
                            .catch(err => {
                                // console.log(err.response.data.message)
                            })
                    }
                }
            } else {
                this.$notify({
                    title: '请输入标题和内容',
                    message: '',
                    type: 'error',
                    duration: 2500
                })
            }
        },
        // 图片上传方法
        handleSuccess(response, file, fileList) {
            console.log('GOOGLE: file', file)
            console.log('GOOGLE: response', response)
            // this.file = response.data
            this.filename = file.name
            this.thumbUrl = response.data
            this.$notify({
                title: '文件上传成功',
                type: 'success',
                duration: 2500
            })
        },
        // 删除前处理 暂未用
        handleBeforeRemove(file, fileList) {
            // for (let i = 0; i < this.files.length; i++) {
            //     if (this.files[i].uid === file.uid) {
            //         del(this.files[i].id).then(res => {})
            //         return true
            //     }
            // }
        },
        handlePictureCardPreview(file) {
            // this.dialogImageUrl = file.url
            // this.dialogVisible = true
        },
        // 图片上传前判断
        beforePicUpload(file) {
            let typeArr = ['image/jpeg', 'image/png']
            const isJPG = typeArr.includes(file.type)
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isJPG) {
                this.$message.error('上传头像图片只能是 图片 格式!')
            }
            if (!isLt2M) {
                this.$message.error('上传文件大小不能超过 2MB!')
            }
            return isJPG && isLt2M
        },
        getInfo(info) {
            // console.log('GOOGLE: data', info)
            this.thumbUrl = info
            this.cancel()
        },
        cancel() {
            this.dialogImage = false
        },
        openIamge() {
            this.dialogImage = true
            // this.getList()
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.form-content {
    padding: 37px 24px;
    background: #fff;
}
.table-title {
    border-bottom: 1px solid #e9e9e9;
}
.submit-wrap {
    // text-align: center;
    padding: 3px 24px 40px;
    background: #fff;
}
</style>
