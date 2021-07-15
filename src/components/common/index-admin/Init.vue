<template>
    <div class="module">
        <div class="caption">
            <!-- 还原 -->
            <el-popover placement="right" trigger="click" class="revoke-popover" width="40" v-if="revokeShow">
                <div class="operate" style="cursor: pointer;" @click="revoke">
                    还原
                </div>
                <div class="text" slot="reference">
                    <div class="dot"></div>
                    有改动
                </div>
            </el-popover>
            <!-- 选择店铺 -->
            <el-dropdown trigger="click" class="shop-wrap" @command="handleCommandShop">
                <div class="shop-title">
                    <img class="shop-title-icon" :src="shopActive.shop_icon" alt="" />{{ shopActive.shop_name }}<i class="el-icon-arrow-down el-icon--right"></i>
                </div>
                <el-dropdown-menu slot="dropdown" class="shop-dropdown-ul">
                    <el-dropdown-item class="shop-dropdown-li" v-for="item in shopList" :key="item.id" :command="item">
                        <img class="shop-icon" :src="item.shop_icon" alt="" />{{ item.shop_name }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div class="plate">
            <div class="item">
                <div class="icon">
                    <img class="icon-img" :src="iconBanner" alt="" />
                </div>
                <div class="title">Banner</div>
            </div>
            <div :class="['item', activePlate == item.customId ? 'active' : '']" v-for="item in plate.layoutList" @click="plateChoose(item.customId)" :key="item.customId">
                <div class="icon">
                    <img class="icon-img" :src="iconList[item.kind]" alt="" />
                </div>
                <div class="title">{{ item.layoutName }}</div>
                <div class="visible">
                    <span class="iconfont icon-yincang" v-if="item.status == 2" @click="item.status = 1"></span>
                    <span class="iconfont icon-a-yincang1" v-else @click="item.status = 2"></span>
                </div>
                <div class="handle">
                    <span class="iconfont icon-tuozhuai"></span>
                </div>
            </div>
            <div class="item add" @click="gotoPlatePick">
                <div class="icon">
                    <img class="icon-img" :src="iconAdd" alt="" />
                </div>
                <div class="title">添加板块</div>
            </div>
        </div>
        <div class="bottom">
            <el-button class="bottom-btn" type="" @click="edit" v-if="activePlate">编辑</el-button>
            <el-button class="bottom-btn" type="primary" @click="save">发 布</el-button>
        </div>
    </div>
</template>

<script>
import { queryLayoutDetail, cacheData, saveLayout } from '@/api/plate'

import { queryShopList } from '@/api/goods'

export default {
    name: 'Index-Init',

    props: {
        init: {
            type: Boolean
        }
        // plate: {
        //     type: Object
        // }
    },
    // watch: {
    //     plate(val, oldVal) {

    //     }
    // },
    data() {
        return {
            plate: {},
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
            TYPE: {
                1: '有边距横图',
                2: '无边距横图',
                3: '三竖图',
                4: '滑动横图'
            },
            // 选中的板块
            activePlate: ''
        }
    },

    created() {},
    async mounted() {
        await this.queryShopList()
        console.log('输出 ~ this.init', this.init)
        if (this.init) {
            this.getList()
        } else {
            this.plate = cacheData.plate
            console.log('输出 ~ this.plate init', this.plate)
        }
        this.$emit('initLoaded')
    },
    methods: {
        // 跳转
        navigatePlate(index) {
            this.$emit('navigatePlate', index)
        },
        getList() {
            let params = {
                shopId: this.shopActive.id
            }
            queryLayoutDetail(params).then(res => {
                cacheData.plate = res.data || {
                    layoutList: [],
                    version: {
                        id: 0,
                        shopId: this.shopActive.id,
                        status: 2
                    }
                }
                cacheData.plate.layoutList = cacheData.plate.layoutList.map((item, index) => {
                    item.customId = 'old' + index
                    return item
                })
                this.plate = cacheData.plate
            })
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {})
                .catch(err => {})
        },
        // 代理店铺列表
        queryShopList() {
            return new Promise((resolve, reject) => {
                queryShopList()
                    .then(res => {
                        this.shopList = res.data
                        this.shopActive = res.data[0]
                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        },
        // 选择店铺
        handleCommandShop(shop) {
            this.shopActive = shop
            this.getList()
        },
        // 还原
        revoke() {
            this.revokeShow = false
        },
        // 跳转添加选择模块
        gotoPlatePick() {
            cacheData.addPlate = {
                id: 0, //0新增 大于0修改
                kind: '', //1.有边距横图，2.无边距横图，3.三竖图，4.滑动图
                shopId: this.shopActive.id,
                showSubtitle: 2, //副标题，1不显示 2显示
                showTitle: 2, //标题，1不显示 2显示
                status: 2, //模块显示状态：1 不显示 2显示
                subtitle: '', //副标题
                title: '', //标题
                layoutName: '', //板块名称
                ContentList: []
            }
            this.navigatePlate(2)
        },

        plateChoose(id) {
            this.activePlate = id
        },
        edit() {
            for (let i = 0; i < this.plate.layoutList.length; i++) {
                const element = this.plate.layoutList[i]
                if (element.customId == this.activePlate) {
                    cacheData.addPlate = _.cloneDeep(element)
                    this.navigatePlate(3)
                    break
                }
            }
        },
        save() {
            const rLoading = this.openLoading()

            console.log('输出 ~ cacheData.plate', cacheData.plate)

            // cacheData.plate.version = {
            //     id: 0,
            //     shopId: this.shopActive.id
            // }
            cacheData.plate.version.status = 2
            saveLayout(cacheData.plate).then(res => {
                console.log('输出 ~ res', res)
                if (res.code === 200) {
                    this.$notify({
                        title: '发布成功',
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
                rLoading.close()
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
