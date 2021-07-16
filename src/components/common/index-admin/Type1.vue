<template>
    <!-- 1.有边距横图 -->
    <div class="wrap">
        <div class="title" v-if="list.showTitle == 2">
            {{ list.title }}
            <div class="subtitle" v-if="list.showSubtitle == 2">{{ list.subtitle }}</div>
        </div>
        <div class="item" v-for="item in list.ContentList" :key="item.customId">
            <img class="banner" :src="item.img" alt="" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'Banner',
    props: {
        list: {
            type: Object
        }
    },
    data() {
        return {}
    },
    components: {},

    watch: {},
    created() {},
    mounted() {
        console.log('输出 ~ list type1', this.list)
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
    box-sizing: border-box;
    margin-bottom: 8px;
    padding: 0 15px;
    width: 100%;
    height: 97px;
    .banner {
        width: 100%;
        height: 97px;
        border-radius: 5px;
    }
}
</style>
