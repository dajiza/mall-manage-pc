<template>
    <div class="preview">
        <div class="box" id="box">
            <index-component :type="5" :list="banner" :id="banner.customId"></index-component>
            <!-- <index-component :type="5"></index-component> -->
            <index-component :id="item.customId" v-for="item in plate.filter(e => e.status == 2)" :list="item" :key="item.customId"></index-component>
            <div class="sort-wrap">
                <div class="sort-box">
                    <div class="sort-item active">
                        <div class="filter-text">热门</div>
                    </div>
                    <div class="sort-item">
                        <div class="filter-text">新品</div>
                    </div>
                    <div class="sort-item sort-price">
                        <div class="filter-text">价格</div>
                        <div class="sort-icon-wrap" style="margin-top: -6px;">
                            <div class="iconfont icon-arrow_up_s"></div>
                            <div class="iconfont icon-arrow_down_s"></div>
                        </div>
                    </div>
                </div>
                <div class="slider-wrap">
                    <div class="slider"></div>
                </div>
            </div>
            <div class="goods-list">
                <div class="goods" v-for="item in goodsList" :key="item.id">
                    <img class="timg" :src="item.goods_img" alt="" />
                    <div class="name">{{ item.goods_name }}</div>
                    <div class="info">
                        <div class="price">¥ {{ formatMoney(item.goods_price) }}</div>
                        <div class="sales">{{ item.goods_sales }}人付款</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { queryLayoutGoodsList } from '@/api/plate'
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'

import IndexComponent from '@/components/common/index-admin/IndexComponent.vue'
export default {
    name: 'Xcx-Preview',
    // props: {
    //     addActiveType: {
    //         type: Number
    //     }
    // },
    data() {
        return {
            plate: [],
            banner: '',
            shopActive: '',
            goodsList: []
        }
    },
    components: {
        IndexComponent
    },

    computed: {
        ...mapState(['plateStore', 'scrollToId', 'shopActiveStore'])
    },
    watch: {
        plateStore: {
            handler(newValue, oldValue) {
                let banner = newValue.layoutList.find(item => item.kind == 5) || {
                    id: 0, //0新增 大于0修改
                    kind: 5, //板块类型：1.有边距横图，2.无边距横图，3.三竖图，4.滑动图 5.Banner
                    ContentList: []
                }
                banner.ContentList = banner.ContentList || []
                let newList = newValue.layoutList
                    .filter(item => item.kind != 5)
                    .sort((a, b) => {
                        return a.sort - b.sort
                    })
                console.log('输出 ~ newList', newList)

                this.plate = newList
                this.banner = banner
            },
            deep: true
        },
        scrollToId: {
            handler(newValue, oldValue) {
                if (!newValue) {
                    return
                }
                this.$nextTick(() => {
                    console.log('输出 ~ newValue', newValue)
                    if (newValue == 'banner') {
                        document.getElementById(this.banner.customId).scrollIntoView()
                    } else {
                        document.getElementById(newValue).scrollIntoView()
                    }
                })
            }
        }
    },
    created() {},
    async mounted() {
        await this.queryShopList()
        this.getGoodsList()
    },
    destroyed() {},
    methods: {
        formatMoney: formatMoney,

        // 代理店铺列表
        queryShopList() {
            return new Promise((resolve, reject) => {
                queryShopList()
                    .then(res => {
                        this.shopActive = res.data[0]

                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        },
        getGoodsList() {
            let params = {
                limit: 20,
                page: 1,
                sort_field: 1,
                shop_id: this.shopActive.id
            }
            queryLayoutGoodsList(params).then(res => {
                this.goodsList = res.data.lists
            })
        }
    }
}
</script>

<style scoped="scoped" lang="less">
.preview {
    overflow: hidden;
    flex: 0 0 341px;
    margin-left: 200px;
    height: 700px;
    background: url('../../../assets/img/ipx.png') no-repeat center center;
    background-color: #f5f5f5;
    background-size: contain;

    .box {
        overflow: hidden;
        overflow-y: scroll;
        box-sizing: border-box;
        margin-top: 45px;
        padding: 0 23px 0px;
        width: 100%;
        height: 605px;
        &::-webkit-scrollbar {
            width: 0 !important;
        }
    }
}

.sort-wrap {
    position: relative;
    padding: 0px 15px 0;
    .sort-box {
        position: relative;
        z-index: 2;
        display: flex;
        font-size: 16px;
        .sort-item {
            margin-right: 30px;
            color: #b2b2b2;
            font-weight: 400;
            &.active {
                color: #564b4e;
                font-weight: 600;
            }
            &.sort-price {
                display: flex;
            }
            .sort-icon-wrap {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                margin-top: -5rpx !important;
                transform: scale(0.3, 0.3);
                .icon-arrow_up_s {
                    margin-bottom: 3px;
                }
            }
        }
    }
    .slider-wrap {
        position: absolute;
        bottom: 9px;
        z-index: 1;
        .slider {
            margin-left: 7px;
            width: 24px;
            height: 6px;
            border-radius: 6px;
            background: linear-gradient(90deg, #fb749f 0%, #ffe9e9 100%);
        }
    }
}
.goods-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    width: 100%;
    color: #564b4e;
    .goods {
        overflow: hidden;
        flex: 0 0 130px;
        margin-bottom: 10px;
        width: 130px;
        height: 184px;
        border-radius: 10px;
        background: #ffffff;
        .timg {
            width: 130px;
            height: 130px;
        }
        .name {
            overflow: hidden;
            padding: 6px 6px 4px;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
        }
        .info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0px 6px 0px;

            .price {
                font-weight: 500;
                font-size: 14px;
            }
            .sales {
                color: #c3c3c3;
                font-size: 11px;
            }
        }
    }
}
</style>
