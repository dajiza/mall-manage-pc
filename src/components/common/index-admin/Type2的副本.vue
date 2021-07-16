<template>
    <!-- 2.无边距横图， -->
    <div class="item">
        <swiper class="swiper" :options="swiperOption2">
            <swiper-slide>
                <img class="banner" src="../../../assets/img/img.jpg" alt="" />
            </swiper-slide>
            <swiper-slide>
                <img class="banner" src="../../../assets/img/wx.jpeg" alt="" />
            </swiper-slide>
            <swiper-slide>
                <img class="banner" src="../../../assets/img/plate-add.png" alt="" />
            </swiper-slide>
        </swiper>
        <div class="swiper-pagination"></div>
    </div>
</template>

<script>
// import { cacheData, saveLayout } from '@/api/plate'
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
export default {
    name: 'No-Margin-Img',
    // props: {
    //     addActiveType: {
    //         type: Number
    //     }
    // },
    data() {
        return {
            swiperOption2: {
                autoplay: false,
                loop: true,
                delay: 3000,
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                    clickable: true,
                    renderBullet: function(index, className) {
                        return '<span class="' + className + '">' + '</span>'
                    }
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
    height: 142px;
    .swiper {
        width: 100%;
        height: 142px;
        .banner {
            width: 100%;
            height: 230px;
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
