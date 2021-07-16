<template>
    <div class="preview">
        <div class="box">
            <index-component></index-component>
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
        </div>
    </div>
</template>

<script>
// import { cacheData, saveLayout } from '@/api/plate'
import IndexComponent from '@/components/common/index-admin/IndexComponent.vue'
export default {
    name: 'Xcx-Preview',
    // props: {
    //     addActiveType: {
    //         type: Number
    //     }
    // },
    data() {},
    components: {
        IndexComponent
    },

    watch: {},
    created() {},
    mounted() {},
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
    background-color: #fff;
    background-size: contain;

    .box {
        box-sizing: border-box;
        padding: 45px 23px 40px;
        width: 100%;
        height: 100%;
    }
}

.sort-wrap {
    position: relative;
    padding: 30px 15px 0;
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
</style>
