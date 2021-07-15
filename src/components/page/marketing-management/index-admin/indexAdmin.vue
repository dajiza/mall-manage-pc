<template>
    <div class="app-container">
        <div class="edit">
            <!-- 初始页 -->
            <init v-if="showIndex == 1" @navigatePlate="navigatePlate" :init="init" @initLoaded="initLoaded"></init>
            <!-- 选择添加模块 -->
            <plate-pick v-if="showIndex == 2" @navigatePlate="navigatePlate"></plate-pick>
            <!-- 创建模块 -->
            <plate-create v-if="showIndex == 3" @navigatePlate="navigatePlate"></plate-create>
            <!-- 创建模块图片 -->
            <img-create v-if="showIndex == 4" @navigatePlate="navigatePlate"></img-create>
        </div>
        <div class="preview"></div>
    </div>
</template>
<script>
import { queryLayoutDetail, cacheData } from '@/api/plate'

import Init from '@/components/common/index-admin/Init.vue'
import PlatePick from '@/components/common/index-admin/PlatePick.vue'
import PlateCreate from '@/components/common/index-admin/PlateCreate.vue'
import ImgCreate from '@/components/common/index-admin/ImgCreate.vue'
export default {
    name: 'index-admin',
    data() {
        return {
            init: true,
            addActiveType: '', //选择要添加的模块
            // 模块显示
            showIndex: 1
            // stepInitShow: true, //初始模块 1
            // stepAddPlateShow: false, //选择添加模块 2
            // stepCreatPlateShow: false, //创建模块 3
            // stepCreatImgShow: false //创建模块图片 4
        }
    },
    components: {
        Init,
        PlatePick,
        PlateCreate,
        ImgCreate
    },
    watch: {},
    created() {},
    mounted() {},
    methods: {
        initLoaded() {
            this.init = false
        },
        handleCommandShop(shopId) {
            this.shopId = shopId
        },
        navigatePlate(index) {
            this.showIndex = index
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.app-container {
    display: flex;
    height: 100%;
}
.timg {
    width: 40px;
    height: 40px;
}
.type-tag {
    // display: block;
    padding: 0 11px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    word-break: keep-all;
    font-weight: 400;
    line-height: 26px;
    &.type-red {
        background-color: #ff4d4f;
    }
    &.type-purple {
        background-color: #a151ff;
    }
    &.type-yellow {
        background-color: #faad14;
    }
}
.status {
    display: flex;
    align-items: center;
    .text-grey {
        color: rgba(0, 0, 0, 0.25);
    }
    .dot {
        display: block;
        margin-right: 8px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
    }
}
.edit {
    flex: 0 0 320px;
    height: 100%;
    background: #fff;
}
.preview {
    flex: 0 0 341px;
    margin-left: 200px;
    height: 700px;
    background: url('../../../../assets/img/ipx.png') no-repeat center center;
    background-size: contain;
}
</style>
