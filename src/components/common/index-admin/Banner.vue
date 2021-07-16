<template>
    <div class="item">
        <swiper class="swiper" :options="swiperOption">
            <swiper-slide>
                <img class="banner" src="../../../assets/img/img.jpg" alt="" />
            </swiper-slide>
        </swiper>
        <div class="input">
            <span class="iconfont icon-glass"></span>
            <span class="text">输入想搜索的信息</span>
            <span class="iconfont icon-camera"></span>
        </div>
    </div>
</template>

<script>
// import { cacheData, saveLayout } from '@/api/plate'
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
export default {
    name: 'Xcx-Preview',
    // props: {
    //     addActiveType: {
    //         type: Number
    //     }
    // },
    data() {
        return {
            swiperOption: {
                autoplay: true,
                loop: true,
                delay: 3000,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev'
                }
            }
        }
    },
    components: {
        Swiper,
        SwiperSlide
    },
    directives: {
        swiper: directive
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
}
</style>
