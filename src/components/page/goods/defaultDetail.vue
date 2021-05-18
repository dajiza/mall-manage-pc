<template>
    <div class="app-container ">
        <!-- 原订单信息 -->
        <div class="wrap detail">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">商品默认详情</div>
            </div>
            <Editor class="editor" :content="editContent" v-model="content"></Editor>
            <el-button class="save-btn" type="primary">保存</el-button>
        </div>
    </div>
</template>
<script>
import { creatDefaultDetail, queryDefaultDetail } from '@/api/teamwork'

import Editor from '@/components/common/editor/Editor'
export default {
    data() {
        return {
            editContent: '', //编辑状态 初始文章

            content: ''
        }
    },
    components: {
        Editor
    },
    created() {},
    mounted() {
        this.getDetail()
    },
    inject: ['reload'],
    methods: {
        getDetail() {
            queryDefaultDetail()
                .then(res => {
                    console.log('输出 ~ res', res)
                })
                .catch(err => {})
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
    margin-bottom: 20px;
    border-radius: 2px;
    background: #fff;
}
.editor {
    margin-left: 20px;
}
.save-btn {
    margin: 40px 0 40px 280px;
}
</style>
