<template>
    <el-dialog
            title="产品编码：KDJAKM345"
            :visible.sync="viewShelfInfo.visible"
            width="1000px"
            custom-class="add-goods-dialog"
            :show-close="false"
            :destroy-on-close="true"
    >
        <el-button class="btn-add-goods" type="success" @click="handleAdd">添加货物</el-button>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" @click="handleSureModal">确 定</el-button>
        </span>

    </el-dialog>
</template>
<script>
    import './PhotoDetection.less';
    export default {
        name: 'AddProductModal',
        props: ['viewShelfInfo'],
        components: {
        },
        data() {
            return {
                tableData: [], //列表
                multipleSelection: [], //多选

            };
        },
        methods: {
            //确定
            handleSureModal() {
                this.$emit('handleSureModal', false);
            },
            // 按钮-取消
            handleCancel(){
                this.handleSureModal();
            },

            //
            handleAdd(){
                this.$notify({
                    title: '抱歉，功能未上线',
                    message: '',
                    type: 'error',
                    duration: 5000
                });
            },

            //打印标贴
            handlePrintLabel() {},


        }
    };
</script>