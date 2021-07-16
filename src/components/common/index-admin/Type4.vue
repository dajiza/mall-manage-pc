<template>
    <!-- 4.滑动图 -->

    <div class="wrap">
        <div class="title" v-if="list.showTitle == 2">
            {{ list.title }}
            <div class="subtitle" v-if="list.showSubtitle == 2">{{ list.subtitle }}</div>
        </div>
        <div class="item">
            <slider class="swiper" ref="slider" :options="options">
                <slideritem v-for="item in list.ContentList" :key="item.customId" :style="item.style">
                    <img class="banner" :src="item.img" alt="" />
                </slideritem>
                <!-- 设置loading,可自定义 -->
                <div slot="loading">loading...</div>
            </slider>
        </div>
    </div>
</template>

<script>
import { slider, slideritem } from 'vue-concise-slider' // 引入slider组件
export default {
    name: 'Banner',
    props: {
        list: {
            type: Object
        }
    },
    data() {
        return {
            options: {
                currentPage: 0, //当前页码
                thresholdDistance: 30, //滑动判定距离
                thresholdTime: 1000, //滑动判定时间
                autoplay: 0, //自动滚动[ms]
                loop: true, //循环滚动
                pagination: false
            }
        }
    },
    components: {
        slider,
        slideritem
    },

    watch: {},
    created() {},
    mounted() {
        this.list.ContentList = this.list.ContentList.map(item => {
            item.style = {
                width: '244px',
                'margin-right': '8px'
            }
            return item
        })
    },
    methods: {}
}
</script>

<style scoped="scoped" lang="less">
.wrap {
    color: #564b4e;
    .title {
        margin-bottom: 15px;
        padding: 0 15px;
        font-weight: 600;
        font-size: 16px;
    }
    .subtitle {
        margin-top: 3px;
        font-weight: 600;
        font-size: 12px;
    }
}
.item {
    position: relative;
    margin-left: 15px;
    width: calc(100% - 15px);
    height: 114px;
    .swiper {
        width: 100%;
        height: 114px;
        .banner {
            width: 244px;
            height: 114px;
        }
    }

    /deep/ .slider-item {
        justify-content: flex-start;
    }
    /deep/ .slider-pagination {
        position: absolute;
        right: 0;
        bottom: 15px;
        left: 0;
        display: flex;
        justify-content: center;
        margin: auto;
        .swiper-pagination-bullet {
            margin: 0 2px;
            width: 8px;
            height: 3px;
            border-radius: 3px;
            background: #efefef;
            opacity: 1;
            &.slider-pagination-bullet-active-render {
                width: 11px;
                height: 3px;
                border-radius: 3px;
                background: #fb6090;
            }
        }
    }
}
</style>
