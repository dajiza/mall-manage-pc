<template>
    <div class="element">
        <banner></banner>
    </div>
</template>

<script>
import Banner from '@/components/common/index-admin/Banner.vue'

export default {
    name: 'Index-Component',
    // props: {
    //     addActiveType: {
    //         type: Number
    //     }
    // },
    data() {
        return {}
    },
    components: {
        Banner
    },

    watch: {},
    created() {},
    mounted() {},
    methods: {}
}
</script>

<style scoped="scoped" lang="less">
.element {
}
</style>
