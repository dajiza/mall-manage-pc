<template>
    <div class="app-container">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">{{pageTitle}}</div>
        </div>
        <div class="form-content">
            <el-form>
                <el-form-item label="名称">
                    <!-- <span>菜单名称：</span> -->
                    <el-input placeholder="请输入" v-model="title" style="width:300px;"></el-input>
                </el-form-item>
            </el-form>

            <Editor :content="editContent" v-model="content"></Editor>
        </div>
        <div class="submit-wrap">
            <el-button class="submit-btn" type="primary" size="small" @click="save">保存</el-button>
        </div>
    </div>
</template>

<script>
    import { queryDetailTemplateList, creatDetailTemplate } from '@/api/teamwork'
    import Editor from '@/components/common/editor/Editor'
    import bus from '@/components/common/bus'
    import global from '../../../utils/global';

    export default {
        data() {
            return {
                pageTitle:'新增模版',
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
                this.pageTitle = '编辑模版'
                queryDetailTemplateList({ detailId: Number(this.id) })
                    .then(res => {
                        const info = res.data[0] || {}
                        this.title = info.title || ''
                        this.editContent = info.detail || ''
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
                    let params = {
                        detailId: 0,
                        title: this.title,
                        detail: this.content
                    }
                    if (this.id) {
                        params['detailId'] = Number(this.id)
                    }
                    creatDetailTemplate(params)
                        .then(res => {
                            if (res.code == 200) {
                                if(this.id){
                                    this.$notify({
                                        title: '编辑成功',
                                        message: '',
                                        type: 'success',
                                        duration: 2000
                                    })
                                } else {
                                    this.$notify({
                                        title: '创建成功',
                                        message: '',
                                        type: 'success',
                                        duration: 2000
                                    })
                                }
                                bus.$emit('refresh-goods-detail-template')
                                setTimeout(()=>{
                                    bus.$emit('close_current_tags')
                                    this.$router.push({
                                        path: 'mall-backend-goods-detail-template'
                                    })
                                },2000)
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 3000
                                })
                            }
                        })
                        .catch(err => {
                            // console.log(err.response.data.message)
                        })
                } else {
                    this.$notify({
                        title: '请输入名称和内容',
                        message: '',
                        type: 'warning',
                        duration: 3000
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
        padding: 3px 24px 40px 260px;
        background: #fff;
    }
</style>
