<template>
    <div class="module">
        <div class="caption">
            <div class="title" @click="navigatePlate(1, true)">
                <span class="iconfont icon-fanhui"></span>
                {{ isBanner ? 'Banner' : TYPE[createPlate.kind] }}
            </div>
        </div>

        <div class="plate">
            <el-form class="create-plate" label-position="top" :model="createPlate" :rules="rules" ref="formRef">
                <template v-if="!isBanner">
                    <el-form-item label="">
                        <el-checkbox v-model="createPlate.showTitle" :true-label="2" :false-label="1">显示大标题</el-checkbox>
                    </el-form-item>
                    <el-form-item label="">
                        <el-checkbox v-model="createPlate.showSubtitle" :true-label="2" :false-label="1">显示小标题</el-checkbox>
                    </el-form-item>
                    <el-form-item label="板块名称" prop="layoutName">
                        <el-input style="width:280px" placeholder="板块名称" v-model="createPlate.layoutName"></el-input>
                    </el-form-item>
                    <el-form-item label="大标题" prop="title" v-if="createPlate.showTitle == 2">
                        <el-input style="width:280px" placeholder="大标题" v-model="createPlate.title"></el-input>
                    </el-form-item>
                    <el-form-item label="小标题" prop="subtitle" v-if="createPlate.showSubtitle == 2">
                        <el-input style="width:280px" placeholder="小标题" v-model="createPlate.subtitle"></el-input>
                    </el-form-item>
                </template>
                <el-form-item label="内容">
                    <div class="img-list">
                        <draggable @end="end" animation="300">
                            <div
                                :class="['item', activeImg == item.customId ? 'active' : '']"
                                v-for="(item, index) in createPlate.ContentList"
                                :key="item.customId"
                                @click="imgChoose(item.customId)"
                            >
                                <div class="icon">
                                    <img class="icon-img" :src="item.img" alt="" />
                                </div>
                                <div class="title">{{ item.title }}</div>
                                <div class="visible">
                                    <span class="iconfont icon-yincang" v-if="item.status == 2" @click="setVisible(index, 1)"></span>
                                    <span class="iconfont icon-a-yincang1" v-else @click="setVisible(index, 2)"></span>
                                </div>
                                <div class="handle">
                                    <span class="iconfont icon-tuozhuai"></span>
                                </div>
                            </div>
                        </draggable>
                        <div class="item add" @click="addImg">
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
            <el-button class="bottom-btn" type="" @click="navigatePlate(1, true)">取 消</el-button>
            <el-button class="bottom-btn" type="danger" @click="deletePlate" v-if="!isBanner && createPlate.id">删 除</el-button>
            <el-button class="bottom-btn" type="" @click="edit" v-if="activeImg">编 辑</el-button>
            <el-button class="bottom-btn" type="primary" @click="save">确 认</el-button>
        </div>
    </div>
</template>

<script>
import { saveLayout, deleteLayout } from '@/api/plate'
import draggable from 'vuedraggable'
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'

export default {
    name: 'Index-Init',
    // props: {
    //     addActiveType: {
    //         type: Number
    //     }
    // },
    data() {
        return {
            activeImg: '',
            // 创建模块
            createPlate: this.$store.state.addLayout,
            rules: {
                layoutName: [{ required: true, trigger: 'blur', message: '请输入名称' }],
                title: [{ required: true, trigger: 'blur', message: '请输入大标题' }],
                subtitle: [{ required: true, trigger: 'blur', message: '请输入小标题' }]
            },
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
                    name: '1有边距横图'
                },
                {
                    type: 2,
                    name: '2无边距横图'
                },
                {
                    type: 3,
                    name: '3三竖图'
                },
                {
                    type: 4,
                    name: '4滑动横图'
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
    computed: {
        ...mapState(['isBanner'])
    },
    components: {
        draggable
    },
    watch: {},
    created() {},
    mounted() {
        this.createPlate.ContentList = this.createPlate.ContentList.map((item, index) => {
            item.customId = 'old' + index
            return item
        }).sort((a, b) => {
            return a.sort - b.sort
        })
    },
    methods: {
        // 跳转
        navigatePlate(index, cancel = false) {
            // 未保存返回 则删除新增的
            // if (cancel) {
            //     let plateStore = this.$store.state.plateStore
            //     for (let i = 0; i < plateStore.layoutList.length; i++) {
            //         const element = plateStore.layoutList[i]
            //         if (element.customId == this.createPlate.customId) {
            //             if (element.isNew) {
            //                 plateStore.layoutList.splice(i, 1)
            //             }
            //             break
            //         }
            //     }
            // }
            this.$emit('navigatePlate', index)
        },

        // 添加模块 选择模块
        imgChoose(customId) {
            this.activeImg = customId
        },

        end(e) {
            let oldIndex = e.oldIndex
            let newIndex = e.newIndex
            let currRow = this.createPlate.ContentList[oldIndex]

            let newItems = [...this.createPlate.ContentList]
            // 删除老的节点
            newItems.splice(oldIndex, 1)
            // 增加新的节点
            newItems.splice(newIndex, 0, currRow)
            // items结构发生变化触发transition-group的动画
            this.createPlate.ContentList = []
            newItems = newItems.map((item, index) => {
                item.sort = index
                return item
            })
            this.$nextTick(() => {
                this.createPlate.ContentList = [...newItems]
                this.activeImg = ''
            })
        },
        addImg() {
            let customId = 'new' + new Date().getTime()
            let addImg = {
                link: '',
                id: 0, //0新增 大于0修改
                img: '', //
                parameter: '', //
                remarks: '', //
                title: '', //
                type: '', //类型：1.商品列表，2.商品详情，3.直播间，4.页面，5.自定义，6.优惠券领取，7.产品系列
                status: 2, //内容显示状态：1不显示，2显示
                customId: customId,
                isNew: true
            }
            this.createPlate.ContentList.push(addImg)
            for (let i = 0; i < this.createPlate.ContentList.length; i++) {
                const element = this.createPlate.ContentList[i]
                if (element.customId == customId) {
                    this.$store.commit('setAddImg', element)
                    this.navigatePlate(4)
                    break
                }
            }

            // this.$store.commit('setAddImg', false)
            // this.navigatePlate(4)
        },
        edit() {
            for (let i = 0; i < this.createPlate.ContentList.length; i++) {
                const element = this.createPlate.ContentList[i]
                if (element.customId == this.activeImg) {
                    element.isNew = false
                    this.$store.commit('setAddImg', element)
                    this.navigatePlate(4)
                    break
                }
            }
        },
        setVisible(index, value) {
            this.$set(this.createPlate.ContentList[index], 'status', value)
        },
        // 删除板块
        deletePlate() {
            this.$confirm('确认删除该板块', '', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                deleteLayout({ layoutId: this.createPlate.id })
                    .then(res => {
                        if (res.code === 200) {
                            this.$notify({
                                title: '删除成功',
                                message: '',
                                type: 'success',
                                duration: 3000
                            })
                            this.navigatePlate(1)
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
        save() {
            const rLoading = this.openLoading()

            this.$refs['formRef'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    if (this.createPlate.ContentList.length == 0) {
                        rLoading.close()
                        this.$notify({
                            title: '请至少添加一条图片内容',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                        return
                    }
                    this.createPlate.ContentList = this.createPlate.ContentList.map((item, index) => {
                        item.sort = index
                        return item
                    })
                    let plateStore = this.$store.state.plateStore

                    // if (this.createPlate.id == 0) {
                    //     // 新增
                    //     this.createPlate.customId = 'new' + new Date().getTime()
                    //     plateStore.layoutList.push(_.cloneDeep(this.createPlate))
                    // } else {
                    //     // 编辑
                    //     for (let i = 0; i < plateStore.layoutList.length; i++) {
                    //         const element = plateStore.layoutList[i]
                    //         if (element.customId == this.createPlate.customId) {
                    //             plateStore.layoutList[i] = _.cloneDeep(this.createPlate)
                    //             break
                    //         }
                    //     }
                    // }
                    plateStore.version.status = 1
                    saveLayout(plateStore).then(res => {
                        if (res.code === 200) {
                            this.$notify({
                                title: '保存草稿成功',
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
                        this.navigatePlate(1)
                    })
                } else {
                    rLoading.close()
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
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
.el-form--label-top /deep/ .el-form-item__label {
    padding: 0;
}
</style>
