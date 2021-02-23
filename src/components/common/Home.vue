<template>
    <div class="wrapper">
        <v-head></v-head>
        <v-sidebar></v-sidebar>
        <div class="content-box" :class="{ 'content-collapse': collapse }">
            <v-tags></v-tags>
            <div class="content">
                <transition name="move" mode="out-in">
                    <keep-alive :include="tagsList">
                        <router-view :key="$route.fullPath"></router-view>
                    </keep-alive>
                    <!--<router-view  :key="key"></router-view>-->
                </transition>
                <!-- <el-backtop class="backtop" target=".content" :right="20" :bottom="20"></el-backtop> -->
            </div>
        </div>
    </div>
</template>

<script>
import vHead from './Header.vue'
import vSidebar from './Sidebar.vue'
import vTags from './Tags.vue'
import bus from './bus'
export default {
    data() {
        return {
            tagsList: [],
            collapse: false
        }
    },
    computed: {},
    components: {
        vHead,
        vSidebar,
        vTags
    },
    created() {
        bus.$on('collapse-content', msg => {
            this.collapse = msg
        })

        // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
        bus.$on('tags', msg => {
            let arr = []
            for (let i = 0, len = msg.length; i < len; i++) {
                // console.log('msg[i]', msg[i]);
                // msg[i].name && arr.push(msg[i].name);
                if (msg[i].name !== 'productList') {
                    msg[i].name && arr.push(msg[i].name)
                }
            }
            this.tagsList = arr
        })
    }
}
</script>
<style scoped="scoped" lang="less">
.backtop {
    background: rgba(255, 255, 255, 0.4);
}
</style>
