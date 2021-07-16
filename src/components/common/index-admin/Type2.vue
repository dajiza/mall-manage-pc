<template>
    <div class="item">
        <slider class="swiper" ref="slider" :options="options">
            <slideritem> <img class="banner" src="../../../assets/img/img.jpg" alt=""/></slideritem>
            <slideritem> <img class="banner" src="../../../assets/img/wx.jpeg" alt=""/></slideritem>
            <slideritem> <img class="banner" src="../../../assets/img/plate-add.png" alt=""/></slideritem>
            <!-- 设置loading,可自定义 -->
            <div slot="loading">loading...</div>
        </slider>

        <div class="input">
            <span class="iconfont icon-glass"></span>
            <span class="text">输入想搜索的信息</span>
            <span class="iconfont icon-camera"></span>
        </div>
    </div>
</template>

<script>
import { slider, slideritem } from 'vue-concise-slider' // 引入slider组件
export default {
    name: 'Banner',
    // props: {
    //     addActiveType: {
    //         type: Number
    //     }
    // },
    data() {
        return {
            options: {
                currentPage: 0, //当前页码
                thresholdDistance: 50, //滑动判定距离
                thresholdTime: 1000, //滑动判定时间
                autoplay: 3000, //自动滚动[ms]
                loop: true //循环滚动
            }
            // swiperOption: {
            //     autoplay: false,
            //     loop: true,
            //     delay: 3000,
            //     pagination: {
            //         el: '.swiper-pagination',
            //         clickable: true,
            //         type: 'bullets',
            //         renderBullet: function(index, className) {
            //             return '<span class="' + className + '">' + '</span>'
            //         }
            //     }
            // }
        }
    },
    components: {
        slider,
        slideritem
    },

    watch: {},
    created() {},
    mounted() {},
    methods: {}
}
</script>

<style scoped="scoped" lang="less">
.item {
    position: relative;
    width: 100%;
    height: 230px;
    .swiper {
        width: 100%;
        height: 230px;
        .banner {
            width: 100%;
            height: 230px;
        }
    }
    .input {
        position: absolute;
        top: 23px;
        right: 0;
        left: 0;
        z-index: 99;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        margin: 0 auto;
        padding: 0 14px;
        width: 272px;
        height: 28px;
        border: 1px solid #efefef;
        border-radius: 18px;
        background: rgba(0, 0, 0, 0.26);
        color: #ffffff;
        font-size: 13px;
        .icon-camera {
            margin-left: auto;
        }
        .text {
            margin-left: 12px;
        }
    }
    .swiper-pagination {
        position: absolute;
        right: 0;
        bottom: 15px;
        left: 0;
        margin: auto;
        /deep/ .swiper-pagination-bullet {
            margin: 0 2px;
            width: 8px;
            height: 3px;
            border-radius: 3px;
            background: #efefef;
            opacity: 1;
            &.swiper-pagination-bullet-active {
                width: 11px;
                height: 3px;
                border-radius: 3px;
                background: #fb6090;
            }
        }
    }
}
</style>
