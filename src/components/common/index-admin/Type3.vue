<template>
    <!-- 3.三竖图 -->
    <div class="wrap">
        <div class="title" v-if="list.showTitle == 2">
            {{ list.title }}
            <div class="subtitle" v-if="list.showSubtitle == 2">{{ list.subtitle }}</div>
        </div>
        <div class="item">
            <img
                v-for="item in list.ContentList.length > 0
                    ? list.ContentList.filter(e => e.status == 2).sort((a, b) => {
                          return a.sort - b.sort
                      })
                    : blankList"
                :key="item.customId"
                class="banner"
                :src="item.img || placeholder"
                alt=""
            />
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
        return {
            placeholder: require('@/assets/img/placeholder.png'),
            blankList: [{ img: require('@/assets/img/placeholder.png') }]
        }
    },
    components: {},

    watch: {
        list: {
            handler(newValue, oldValue) {
                // this.$forceUpdate()
            },
            deep: true
        }
    },
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
    display: grid;
    box-sizing: border-box;
    margin-bottom: 8px;
    padding: 0 15px;
    width: 100%;

    gap: 5px 5px;
    grid-template-columns: repeat(auto-fill, 85px);
    .banner {
        // margin-right: 14px;
        // margin-bottom: 8px;
        width: 85px;
        height: 114px;
        border-radius: 5px;
    }
}
</style>
