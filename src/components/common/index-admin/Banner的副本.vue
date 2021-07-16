<template>
    <div class="item">
        <swiper class="swiper" :options="swiperOption">
            <swiper-slide>
                <img class="banner" src="../../../assets/img/img.jpg" alt="" />
            </swiper-slide>
        </swiper>
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
    .swiper {
        width: 100%;
        height: 230px;
        .banner {
            width: 100%;
            height: 230px;
        }
    }
}
</style>
