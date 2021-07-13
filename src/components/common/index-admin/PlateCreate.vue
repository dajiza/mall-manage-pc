<template>
    <div class="module">
        <div class="caption">
            <div class="title" @click="backPrevious">
                <span class="iconfont icon-fanhui"></span>
                {{ TYPE[addActiveType] }}
            </div>
        </div>
        <div class="plate">
            <el-form class="create-plate" label-position="top" :model="createPlate" :rules="createPlateRules" ref="formRef">
                <el-form-item label="" prop="title">
                    <el-checkbox v-model="createPlate.title">显示大标题</el-checkbox>
                </el-form-item>
                <el-form-item label="" prop="title">
                    <el-checkbox v-model="createPlate.title">显示小标题</el-checkbox>
                </el-form-item>
                <el-form-item label="板块名称" prop="title">
                    <el-input style="width:280px" placeholder="板块名称" v-model="createPlate.title"></el-input>
                </el-form-item>
                <el-form-item label="大标题" prop="title">
                    <el-input style="width:280px" placeholder="大标题" v-model="createPlate.title"></el-input>
                </el-form-item>
                <el-form-item label="小标题" prop="title">
                    <el-input style="width:280px" placeholder="小标题" v-model="createPlate.title"></el-input>
                </el-form-item>
                <el-form-item label="内容" prop="title">
                    <div class="img-list">
                        <draggable @start="start" @end="end">
                            <div :class="['item', activeImg == index ? 'active' : '']" v-for="(item, index) in plateType" :key="index" @click="imgChoose(index)">
                                <div class="icon">
                                    <img class="icon-img" :src="iconList[index]" alt="" />
                                </div>
                                <div class="title">{{ item.name }}</div>
                                <div class="visible">
                                    <span class="iconfont icon-yincang"></span>
                                    <span class="iconfont icon-a-yincang1"></span>
                                </div>
                                <div class="handle">
                                    <span class="iconfont icon-tuozhuai"></span>
                                </div>
                            </div>
                        </draggable>
                        <div class="item add" @click="gotoCreateImg">
                            <div class="icon">
                                <img class="icon-img" :src="iconAdd" alt="" />
                            </div>
                            <div class="title">继续添加</div>
                        </div>
                    </div>
                </el-form-item>
            </el-form>
        </div>
        <div class="bottom">
            <el-button class="bottom-btn" type="" @click="backPrevious">取 消</el-button>
            <el-button class="bottom-btn" type="primary" @click="">确 认</el-button>
        </div>
    </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
    name: 'Index-Init',
    props: {
        addActiveType: {
            type: Number
        }
    },
    data() {
        return {
            activeImg: '',
            // 创建模块
            createPlate: {
                title: ''
            },
            createPlateRules: {},
            iconBanner: require('@/assets/img/plate-banner.png'),
            iconAdd: require('@/assets/img/plate-add.png'),
            iconList: [
                require('@/assets/img/plate-icon1.png'),
                require('@/assets/img/plate-icon2.png'),
                require('@/assets/img/plate-icon3.png'),
                require('@/assets/img/plate-icon4.png')
            ],
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
            }
        }
    },
    components: {
        draggable
    },
    watch: {},
    created() {},
    mounted() {},
    methods: {
        // 返回
        backPrevious() {},
        // 跳转创建模块
        gotoCreatPlate() {
            if (!this.addActiveType) {
                this.$notify({
                    title: '请选择一个类型',
                    type: 'warning',
                    duration: 3000
                })
                return
            }
            this.stepAddPlateShow = false
            this.stepCreatPlateShow = true
        },
        // 添加模块 选择模块
        imgChoose(index) {
            this.activeImg = index
        },
        // 新建推按
        gotoCreateImg() {
            this.$emit('gotoCreateImg')
        },
        start(e) {
            console.log(e)
        },
        end(e) {
            console.log(e)
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
