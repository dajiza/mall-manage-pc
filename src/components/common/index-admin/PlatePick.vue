<template>
    <div class="module">
        <div class="caption">
            <div class="title" @click="navigatePlate(1)">
                <span class="iconfont icon-fanhui"></span>
                添加板块
            </div>
        </div>
        <div class="plate">
            <div :class="['item', addActiveType == item.type ? 'active' : '']" v-for="(item, index) in plateType" :key="item.type" @click="addChoose(item.type)">
                <div class="icon">
                    <img class="icon-img" :src="iconList[index]" alt="" />
                </div>
                <div class="title">{{ item.name }}</div>
            </div>
        </div>
        <div class="bottom">
            <el-button class="bottom-btn" type="" @click="navigatePlate(1)">取 消</el-button>
            <el-button class="bottom-btn" type="primary" @click="gotoPlateCreat">选 择</el-button>
        </div>
    </div>
</template>

<script>
import { cacheData } from '@/api/plate'

export default {
    name: 'Index-Init',
    props: {
        content: {
            type: String
        }
    },
    data() {
        return {
            shopList: [],
            shopActive: '',
            revokeShow: true,
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
            // 板块类型：1.有边距横图，2.无边距横图，3.三竖图，4.滑动图
            TYPE: {
                1: '有边距横图',
                2: '无边距横图',
                3: '三竖图',
                4: '滑动横图'
            },
            // 选中的添加类型
            addActiveType: ''
        }
    },

    watch: {},
    created() {},
    mounted() {},
    methods: {
        // 跳转
        navigatePlate(index) {
            this.$emit('navigatePlate', index)
        },

        // 跳转创建模块
        gotoPlateCreat() {
            if (!this.addActiveType) {
                this.$notify({
                    title: '请选择一个类型',
                    type: 'warning',
                    duration: 3000
                })
                return
            }
            cacheData.addPlate.kind = this.addActiveType
            this.navigatePlate(3)
        },
        // 添加模块 选择模块
        addChoose(type) {
            this.addActiveType = type
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
</style>
