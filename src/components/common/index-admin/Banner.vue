<template>
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
    props: {
        list: {
            default: {},
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
                loop: false, //循环滚动
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
    mounted() {
        console.log('输出 ~ this.list banner', this.list)
    },
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
