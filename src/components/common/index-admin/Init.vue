<template>
    <div class="module">
        <div class="caption">
            <!-- 还原 -->

            <el-popover placement="bottom" trigger="click" class="revoke-popover" width="" v-if="status == 1">
                <el-button class="operate" size="mini" type="primary" @click="revoke">还 原</el-button>

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
            <div :class="['item', activePlate == 'banner' ? 'active' : '']" @click="plateChoose('banner')">
                <div class="icon">
                    <img class="icon-img" :src="iconBanner" alt="" />
                </div>
                <div class="title">Banner</div>
            </div>
            <draggable @end="end" animation="300">
                <div
                    :class="['item', activePlate == item.customId ? 'active' : '']"
                    v-for="item in plate.layoutList"
                    @click="plateChoose(item.customId, item.id)"
                    :key="item.customId"
                    v-if="item.kind != 5"
                >
                    <div class="icon">
                        <img class="icon-img" :src="iconList[item.kind - 1]" alt="" />
                    </div>
                    <div class="title">{{ item.layoutName }}</div>
                    <div class="visible">
                        <el-tooltip class="" :content="item.status == 2 ? '显示' : '隐藏'">
                            <span class="iconfont icon-yincang" v-if="item.status == 2" @click="setVisible(item, 1)"></span>
                            <span class="iconfont icon-a-yincang1" v-else @click="setVisible(item, 2)"></span>
                        </el-tooltip>
                    </div>
                    <div class="handle">
                        <el-tooltip class="" content="拖动排序">
                            <span class="iconfont icon-tuozhuai"></span>
                        </el-tooltip>
                    </div>
                </div>
            </draggable>
            <div class="item add" @click="gotoPlatePick">
                <div class="icon">
                    <img class="icon-img" :src="iconAdd" alt="" />
                </div>
                <div class="title">添加板块</div>
            </div>
        </div>
        <div class="bottom">
            <el-button class="bottom-btn" type="danger" @click="deletePlate" v-if="activePlateId">删 除</el-button>
            <el-button class="bottom-btn" type="" @click="edit" v-if="activePlate">编 辑</el-button>
            <el-button class="bottom-btn" type="primary" @click="save(2)">发 布</el-button>
        </div>
    </div>
</template>

<script>
import { queryLayoutDetail, saveLayout, recoverLayout, deleteLayout } from '@/api/plate'
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'

import { queryShopList } from '@/api/goods'
import draggable from 'vuedraggable'

export default {
    name: 'Index-Init',
    props: {
        // init: {
        //     type: Boolean
        // }
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
            versionId: '',
            status: '', //1.草稿/有改动 2.发布版本 3.废弃版(前端目前暂时忽略);上传参数时根据该字段的值进行草稿存储或者发布
            plate: {},
            shopList: [],
            shopActive: '',
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
            activePlate: '', //customId
            activePlateId: '' //接口的id
        }
    },

    computed: {
        ...mapState(['plateStore', 'addLayout', 'shopIdStore'])
        // plateStore: {
        //     //get 和 set 都需要设置
        //     get() {
        //         return this.$store.state.plateStore
        //     },
        //     set(val) {
        //         this.$store.state.plateStore = val
        //     }
        // }
    },
    components: {
        draggable
    },
    created() {
        this.$store.commit('setScrollToId', '')
    },
    async mounted() {
        await this.queryShopList()
        this.getList()
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
                console.log('输出 ~ res', res)
                let plateStore = res.data || {
                    layoutList: [],
                    version: {
                        id: 0,
                        shopId: this.shopActive.id,
                        status: 2
                    }
                }
                this.status = plateStore.version.status
                this.versionId = plateStore.version.id
                plateStore.layoutList = plateStore.layoutList
                    .map((item, index) => {
                        item.customId = 'old' + index
                        return item
                    })
                    .sort((a, b) => {
                        return a.sort - b.sort
                    })
                this.plate = plateStore
                this.$store.commit('setPlateStore', plateStore)
            })
        },

        // 代理店铺列表
        queryShopList() {
            return new Promise((resolve, reject) => {
                queryShopList()
                    .then(res => {
                        this.shopList = res.data
                        if (!this.shopIdStore) {
                            this.shopActive = res.data[0]
                            this.$store.commit('setShopIdStore', res.data[0])
                        } else {
                            this.shopActive = this.shopIdStore
                        }

                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        },
        // 排序
        end(e) {
            let bannerItem = this.plate.layoutList.find(item => item.kind == 5)
            let newList = this.plate.layoutList.filter(item => item.kind != 5)
            let oldIndex = e.oldIndex
            let newIndex = e.newIndex
            let currRow = newList[oldIndex]
            let newItems = [...newList]
            // 删除老的节点
            newItems.splice(oldIndex, 1)
            // 增加新的节点
            newItems.splice(newIndex, 0, currRow)
            // items结构发生变化触发transition-group的动画
            if (bannerItem) {
                newItems.push(bannerItem)
            }
            this.plate.layoutList = []
            this.$nextTick(() => {
                this.plate.layoutList = [...newItems]
                this.activePlate = ''
                this.$store.commit('setPlateStore', this.plate)

                this.save(1)
            })
        },
        // 设置可见
        setVisible(item, value) {
            item.status = value
            this.save(1)
        },
        // 选择店铺
        handleCommandShop(shop) {
            this.shopActive = shop
            this.$store.commit('setShopIdStore', shop)

            this.getList()
        },
        // 还原
        revoke() {
            let params = {
                shopId: this.shopActive.id,
                versionId: this.versionId
            }
            recoverLayout(params).then(res => {
                if (res.code === 200) {
                    this.$notify({
                        title: '还原成功',
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
                this.getList()
            })
        },
        // 跳转添加选择模块
        gotoPlatePick() {
            let customId = 'new' + new Date().getTime()
            let addLayout = {
                id: 0, //0新增 大于0修改
                kind: '', //板块类型：1.有边距横图，2.无边距横图，3.三竖图，4.滑动图 5.Banner
                shopId: this.shopActive.id,
                showSubtitle: 2, //副标题，1不显示 2显示
                showTitle: 2, //标题，1不显示 2显示
                status: 2, //模块显示状态：1 不显示 2显示
                subtitle: '', //副标题
                title: '', //标题
                layoutName: '', //板块名称
                ContentList: [],
                customId: customId,
                isNew: true,
                sort: this.plate.layoutList.length + 1
            }
            let plateStore = this.plateStore
            plateStore.layoutList.push(addLayout)
            this.$store.commit('setPlateStore', plateStore)

            for (let i = 0; i < this.plate.layoutList.length; i++) {
                const element = this.plate.layoutList[i]
                if (element.customId == customId) {
                    this.$store.commit('setAddLayout', element)
                    this.$store.commit('setIsBanner', false)
                    this.navigatePlate(2)
                    break
                }
            }
        },

        plateChoose(customId, id) {
            this.activePlate = customId
            this.activePlateId = id || 0

            this.$store.commit('setScrollToId', customId)
        },
        // 删除板块
        deletePlate() {
            this.$confirm('确认删除该板块', '', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteLayout({ layoutId: this.activePlateId })
                    .then(res => {
                        if (res.code === 200) {
                            this.$notify({
                                title: '删除成功',
                                message: '',
                                type: 'success',
                                duration: 3000
                            })
                            this.getList()
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            })
                        }
                    })
                    .catch(() => {
                        console.log('取消')
                    })
            })
        },
        edit() {
            if (this.activePlate == 'banner') {
                let bannerExist = this.plate.layoutList.find(item => item.kind == 5)
                if (!bannerExist) {
                    let customId = 'new' + new Date().getTime()
                    let addLayout = {
                        id: 0, //0新增 大于0修改
                        kind: 5, //板块类型：1.有边距横图，2.无边距横图，3.三竖图，4.滑动图 5.Banner
                        shopId: this.shopActive.id,
                        showSubtitle: 1, //副标题，1不显示 2显示
                        showTitle: 1, //标题，1不显示 2显示
                        status: 2, //模块显示状态：1 不显示 2显示
                        subtitle: '', //副标题
                        title: '', //标题
                        layoutName: '', //板块名称
                        ContentList: [],
                        customId: customId,
                        isNew: true
                    }
                    let plateStore = this.plateStore
                    plateStore.layoutList.push(addLayout)
                    this.$store.commit('setPlateStore', plateStore)
                }
                for (let i = 0; i < this.plate.layoutList.length; i++) {
                    const element = this.plate.layoutList[i]
                    if (element.kind == 5) {
                        this.$store.commit('setAddLayout', element)
                        this.$store.commit('setIsBanner', true)
                        break
                    }
                }

                this.navigatePlate(3)
            } else {
                for (let i = 0; i < this.plate.layoutList.length; i++) {
                    const element = this.plate.layoutList[i]
                    if (element.customId == this.activePlate) {
                        this.$store.commit('setAddLayout', element)
                        this.$store.commit('setIsBanner', false)
                        this.navigatePlate(3)
                        break
                    }
                }
            }
            this.$store.commit('setScrollToId', this.addLayout.customId)
        },
        save(status = 2) {
            if (status == 2) {
                this.$confirm('确认发布', '', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                    .then(() => {
                        this.saveLayoutFun(status)
                    })
                    .catch(() => {})
            } else {
                this.saveLayoutFun(status)
            }
        },
        saveLayoutFun(status) {
            const rLoading = this.openLoading()
            // 排序
            let plateStore = this.plateStore
            plateStore.layoutList = plateStore.layoutList.map((item, index) => {
                item.sort = index
                return item
            })

            plateStore.version.status = status
            saveLayout(plateStore).then(res => {
                if (res.code === 200) {
                    this.$notify({
                        title: status == 2 ? '发布成功' : '保存草稿成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    })
                    this.getList()
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
            flex-shrink: 0;
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
