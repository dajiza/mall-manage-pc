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
                    <el-input placeholder="标题" v-model="title" style="width:532px;"></el-input>
                </el-form-item>
            </el-form>

            <Editor :content="editContent" v-model="content"></Editor>
        </div>
        <div class="submit-wrap">
            <el-button class="submit-btn" type="primary" size="small" @click="save">提交</el-button>
        </div>
    </div>
</template>

<script>
// import { newArticle, fetchArticle, editArticle, uploadImg, imageList } from '@/api/wechat'
// import { getToken } from '@/utils/auth'
import { createAbout, queryAbout, updateAbout } from '@/api/pageManage'
import Editor from '@/components/common/editor/Editor'
import bus from '@/components/common/bus'

export default {
    data() {
        return {
            headers: { Authorization: ' ' + '' },
            editContent: '', //编辑状态 初始文章

            title: '',
            content: '',

            id: null
        }
    },
    components: { Editor },
    created() {},
    mounted() {
        this.id = this.$route.query.id
        if (this.id) {
            queryAbout({ id: Number(this.id) })
                .then(res => {
                    this.title = res.data.title
                    this.editContent = res.data.content
                })
                .catch(err => {
                    // console.log(err.response.data.message)
                })
        }
    },

    methods: {
        save() {
            // 判断标题和内容
            if (this.title && this.content) {
                // 根据是否有id 判别新建\编辑
                if (this.id) {
                    let params = {
                        id: Number(this.id),
                        title: this.title,
                        content: this.content
                    }
                    updateAbout(params)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '编辑成功',
                                    message: '',
                                    type: 'success',
                                    duration: 2000
                                })
                                bus.$emit('refresh-page-manage')
                                bus.$emit('close_current_tags')
                                this.$router.push({
                                    path: 'mall-backend-page'
                                })
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {
                            // console.log(err.response.data.message)
                        })
                } else {
                    let params = {
                        title: this.title,
                        content: this.content
                    }
                    createAbout(params)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '创建成功',
                                    message: '',
                                    type: 'success',
                                    duration: 2000
                                })
                                bus.$emit('refresh-page-manage')
                                bus.$emit('close_current_tags')
                                this.$router.push({
                                    path: 'mall-backend-page'
                                })
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {
                            // console.log(err.response.data.message)
                        })
                }
            } else {
                this.$notify({
                    title: '请输入标题和内容',
                    message: '',
                    type: 'warning',
                    duration: 2500
                })
            }
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
