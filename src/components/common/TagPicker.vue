<template>
    <el-dialog
        title="提示"
        :visible.sync="tagPickerDialogVisible"
        width="643px"
        :show-close="false"
        :close-on-click-modal="false"
        custom-class="tab-picker-dialog"
        @close="reset"
    >
        <div slot="title">
            <div class="dialog-header">选择标签</div>
            <div style="background: #f0f0f0;">
                <el-row :gutter="1">
                    <el-col :span="12"><div class="product-label-title">小程序可展示</div></el-col>
                    <el-col :span="12"><div class="product-label-title">仅限后台</div></el-col>
                </el-row>
            </div>
        </div>
        <div class="product-label-container">
            <el-row :gutter="1">
                <el-col :span="12">
                    <cascader-two
                        v-if="!resetCascaderTwo"
                        custom-class="mini-program-cascader-two"
                        :options="miniProgramTagsOption"
                        primary-color="#FEFAF0"
                        ref="miniProgramTagPicker"
                    ></cascader-two>
                </el-col>
                <el-col :span="12">
                    <cascader-two
                        v-if="!resetCascaderTwo"
                        custom-class="backend-cascader-two"
                        :options="backendTagsOption"
                        primary-color="#F1F9FF"
                        ref="backendTagPicker"
                    ></cascader-two>
                </el-col>
            </el-row>
        </div>
        <span slot="footer">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import CascaderTwo from '@/components/common/CascaderTwo';

export default {
    name: 'TagPicker',
    components: { CascaderTwo },
    props: {
        tagPickerDialogVisible: {
            type: Boolean,
            default: false
        },
        options: Object,
        value: Array
    },
    data() {
        return {
            miniProgramTags: [],
            backendTags: [],
            resetCascaderTwo: false
        };
    },
    computed: {
        miniProgramTagsOption: function() {
            //计算属性作为最终的UI参数
            //整合已选列表
            let option = [];
            this.miniProgramTags.forEach(tag => {
                let checkedCount = 0;
                let newChildren = tag.children.map(child => {
                    if (
                        this.checkedTags.find(e => {
                            return e.id === child.id;
                        })
                    ) {
                        //child存在于已选列表中
                        child.isChecked = true;
                        checkedCount++;
                    }
                    return { ...child };
                });
                option.push({
                    label: tag.label,
                    children: newChildren,
                    checkAll: checkedCount === newChildren.length,
                    isIndeterminate: checkedCount > 0 && checkedCount < newChildren.length
                });
            });
            console.log(option);
            return option;
        },
        backendTagsOption: function() {
            let option = [];
            this.backendTags.forEach(tag => {
                let checkedCount = 0;
                let newChildren = tag.children.map(child => {
                    if (
                        this.checkedTags.find(e => {
                            return e.id === child.id;
                        })
                    ) {
                        //child存在于已选列表中
                        child.isChecked = true;
                        checkedCount++;
                    }
                    return { ...child };
                });
                option.push({
                    label: tag.label,
                    children: newChildren,
                    checkAll: checkedCount === newChildren.length,
                    isIndeterminate: checkedCount > 0 && checkedCount < newChildren.length
                });
            });
            console.log(option);
            return option;
        },
        checkedTags: function() {
            return this.value ? this.value : [];
        }
    },
    watch: {
        tagPickerDialogVisible: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.resetCascaderTwo = false;
                    if (this.options) {
                        this.miniProgramTags = this.toTagPickerData(this.options.miniProgramTags);
                        this.backendTags = this.toTagPickerData(this.options.backendTags);
                    }
                }
            }
        }
    },
    methods: {
        handleCancel() {
            this.$emit('cancel');
        },
        handleConfirm() {
            let miniProgramTags = this.$refs.miniProgramTagPicker.getCheckedTags();
            let backendTags = this.$refs.backendTagPicker.getCheckedTags();
            this.$emit('confirm', { miniProgramTags, backendTags });
        },
        toTagPickerData(tags = []) {
            //转换成UI需要的数据类型
            let store = {};
            //分组
            tags.forEach(tag => {
                let key = tag.tag_category_id.toString();
                let label = tag.tag_category_name;
                let tagName = tag.name;
                let id = tag.id;
                if (store[key]) {
                    store[key].push({
                        id: id,
                        label: label,
                        tagName: tagName
                    });
                } else {
                    store[key] = [
                        {
                            id: id,
                            label: label,
                            tagName: tagName
                        }
                    ];
                }
            });
            //分组之后的数据转换成array
            let pickerTags = [];
            Object.keys(store).forEach(key => {
                let value = store[key];
                if (value.length > 0) {
                    let childrenList = [];
                    let label = value[0].label;
                    value.forEach(tag => {
                        childrenList.push({
                            id: tag.id,
                            label: tag.tagName,
                            isChecked: false
                        });
                    });
                    pickerTags.push({
                        label: label,
                        children: childrenList
                    });
                }
            });
            console.log(pickerTags);
            return pickerTags;
        },
        reset() {
            this.resetCascaderTwo = true;
        }
    }
};
</script>

<style lang="less">
.tab-picker-dialog {
    .dialog-header {
        display: block;
        text-align: center;
        font-size: 18px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        line-height: 56px;
        height: 56px;
    }
    .el-dialog__header {
        padding: 0 !important;
    }
    .el-dialog__body {
        padding: 0 !important;
        height: 450px !important;
        overflow: hidden;
        overflow-y: auto;
    }
    .product-label-container {
        background: #f0f0f0;
        .mini-program-cascader-two {
            .el-checkbox__input.is-checked .el-checkbox__inner,
            .el-checkbox__input.is-indeterminate .el-checkbox__inner {
                background-color: #fa8c16;
                border-color: #fa8c16;
            }
        }
        .backend-cascader-two {
            .el-checkbox__input.is-checked .el-checkbox__inner,
            .el-checkbox__input.is-indeterminate .el-checkbox__inner {
                background-color: #1890ff;
                border-color: #1890ff;
            }
        }
    }
    .product-label-title {
        height: 56px;
        background: #ffffff;
        border-top: 1px solid #f0f0f0;
        border-bottom: 1px solid #f0f0f0;
        text-align: center;
        font-size: 18px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        line-height: 56px;
    }
}
</style>
