<template>
    <div class="element">
        <banner v-if="type == 5"></banner>
        <type2 v-if="type == 2"></type2>
    </div>
</template>

<script>
import Banner from '@/components/common/index-admin/Banner.vue'
import Type2 from '@/components/common/index-admin/Type2.vue'

export default {
    name: 'Index-Component',
    props: {
        type: {
            type: Number
        }
    },
    data() {
        return {}
    },
    components: {
        Banner,
        Type2
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
