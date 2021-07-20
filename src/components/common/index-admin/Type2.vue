<template>
    <!-- 2.无边距横图， -->

    <div class="wrap">
        <div class="title" v-if="list.showTitle == 2">
            {{ list.title }}
            <div class="subtitle" v-if="list.showSubtitle == 2">{{ list.subtitle }}</div>
        </div>
        <div class="item">
            <slider class="swiper" ref="slider" :options="options" :key="new Date().getTime()">
                <slideritem
                    v-for="item in list.ContentList.length > 0
                        ? list.ContentList.filter(e => e.status == 2).sort((a, b) => {
                              return a.sort - b.sort
                          })
                        : blankList"
                    :key="item.customId"
                >
                    <img class="banner" :src="item.img || placeholder" alt="" />
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
            placeholder: require('@/assets/img/placeholder.png'),
            blankList: [{ img: require('@/assets/img/placeholder.png') }],

            options: {
                currentPage: 0, //当前页码
                thresholdDistance: 30, //滑动判定距离
                thresholdTime: 1000, //滑动判定时间
                autoplay: 0, //自动滚动[ms]
                loop: true, //循环滚动
                renderPagination: (h, index) => {
                    if (this.list.ContentList.filter(e => e.status == 2).length > 1) {
                        return h('div', {
                            class: 'swiper-pagination-bullet'
                        })
                    }
                }
            }
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
