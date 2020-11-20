<template>
    <div :class="['cascader-two-container', customClass]">
        <div class="cascader-parent">
            <div
                v-for="(option, index) in checkOptions"
                :key="option.index"
                class="checkbox-container"
                :style="{ background: option.index === currentIndex ? primaryColor : '#ffffff' }"
                @click="handleParentCheck(index)"
            >
                <el-checkbox :indeterminate="option.isIndeterminate" v-model="option.checkAll" @change="handleCheckAllChange" :data-index="index">
                </el-checkbox>
                <span class="checkbox-label">{{ option.label }}</span>
            </div>
        </div>
        <div class="cascader-child" :style="{ background: primaryColor }">
            <div v-if="checkOptions.length > 0" class="custom-checkbox-group">
                <el-checkbox
                    v-for="(item, index) in children"
                    :label="item.label"
                    :key="item.id"
                    :value="item.isChecked"
                    @change="handleCheckedTagsChange"
                    :data-index="index"
                ></el-checkbox>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CascaderTwo',
    props: {
        customClass: {
            type: String,
            default: ''
        },
        primaryColor: {
            type: String,
            default: '#ffffff'
        },
        options: Array
    },
    data() {
        return {
            checkOptions: [],
            currentIndex: 0
        };
    },
    watch: {
        options: {
            immediate: true,
            handler(value) {
                if (value) {
                    value.forEach((val, index) => {
                        let children = val.children.map(child => {
                            return { ...child };
                        });
                        this.checkOptions.push({
                            index: index,
                            label: val.label,
                            checkAll: val.checkAll,
                            children: children,
                            isIndeterminate: val.isIndeterminate
                        });
                    });
                }
            }
        }
    },
    computed: {
        children: function() {
            return this.checkOptions[this.currentIndex].children;
        },
        parent: function() {
            return this.checkOptions[this.currentIndex];
        }
    },
    methods: {
        handleParentCheck(index) {
            if (this.currentIndex === index) {
                return;
            }
            //保存上一个item的值
            this.$set(this.checkOptions, this.currentIndex, this.parent);
            //触发计算属性更新
            this.currentIndex = index;
            //保存当前item的值
            this.$set(this.checkOptions, index, this.parent);
        },
        handleCheckAllChange(val, e) {
            let index = Number(e.path[2].dataset.index);
            console.log(index);
            if (this.currentIndex !== index) {
                //切换item，保存上一个item的值
                this.$set(this.checkOptions, this.currentIndex, this.parent);
            }
            //触发计算属性更新
            this.currentIndex = index;
            //当前item的child选中状态变更
            this.children.forEach(child => {
                child.isChecked = val;
            });
            this.parent.isIndeterminate = false;
            this.parent.checkAll = val;
            //保存当前item的值
            this.$set(this.checkOptions, index, this.parent);
        },
        handleCheckedTagsChange(val, e) {
            let index = Number(e.path[2].dataset.index);
            console.log(index);
            //更新当前child的选中状态
            this.children[index].isChecked = val;
            //重新计算选中个数
            let checkedCount = 0;
            this.children.forEach(child => {
                if (child.isChecked && child.isChecked === true) {
                    checkedCount++;
                }
            });
            this.parent.checkAll = checkedCount === this.children.length;
            this.parent.isIndeterminate = checkedCount > 0 && checkedCount < this.children.length;
            //保存当前item的值
            this.$set(this.checkOptions, this.currentIndex, this.parent);
        },
        getCheckedTags() {
            let checkedTags = [];
            this.checkOptions.forEach(option => {
                option.children.forEach(tag => {
                    if (tag.isChecked) {
                        checkedTags.push({
                            id: tag.id,
                            label: tag.label
                        });
                    }
                });
            });
            return checkedTags;
        }
    }
};
</script>

<style lang="less">
.cascader-two-container {
    background: #ffffff;
    display: flex;
    width: 321px;
    height: 450px;

    .cascader-parent {
        border-right: 1px solid #f0f2f5;
        width: 160px;
        height: 100%;
        overflow: hidden;
        overflow-y: auto;
        .checkbox-container {
            height: 50px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            padding: 0 10px 0 19px;
            .checkbox-label {
                margin-left: 8px;
                width: 109px;
                height: 22px;
                font-size: 14px;
                font-weight: 400;
                color: rgba(0, 0, 0, 0.65);
                line-height: 22px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
        }
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
    }

    .el-checkbox__label {
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .cascader-child {
        width: 160px;
        overflow: hidden;
        overflow-y: auto;
        height: 100%;
        .custom-checkbox-group {
            display: flex;
            flex-direction: column;
            .el-checkbox {
                width: 160px;
                height: 50px;
                margin-right: 0;
                box-sizing: border-box;
                padding: 0 10px 0 19px;
                display: flex;
                align-items: center;
            }
        }
    }
}
</style>
