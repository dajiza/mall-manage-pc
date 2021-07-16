<template>
    <div class="preview">
        <div class="box">
            <index-component :type="5" :list="banner"></index-component>
            <!-- <index-component :type="5"></index-component> -->
            <index-component v-for="item in plate" :list="item" :key="item.customId"></index-component>
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
                <div class="goods" v-for="item in 10">
                    <img class="timg" src="../../../assets/img/img.jpg" alt="" />
                    <div class="name">日本进口布料 QG玛…</div>
                    <div class="info">
                        <div class="price">¥ 56</div>
                        <div class="sales">236人付款</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { cacheData } from '@/api/plate'
import bus from '@/components/common/bus'

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
            plate: '',
            banner: ''
        }
    },
    components: {
        IndexComponent
    },

    computed: {},

    created() {},
    mounted() {
        bus.$on('change-plate', plate => {
            console.log('输出 ~ plate change', plate)
            let banner = plate.layoutList.find(item => item.kind == 5) || {
                id: 0, //0新增 大于0修改
                kind: 5, //板块类型：1.有边距横图，2.无边距横图，3.三竖图，4.滑动图 5.Banner
                ContentList: []
            }
            let newList = plate.layoutList.filter(item => item.kind != 5)
            this.plate = newList
            this.banner = banner
        })
    },
    destroyed() {
        bus.$off('change-plate')
    },
    methods: {}
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
