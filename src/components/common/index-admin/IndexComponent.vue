<template>
    <div class="element">
        <banner class="row" v-if="list.kind == 5" :list="list"></banner>
        <type1 class="row" v-if="list.kind == 1" :list="list"></type1>
        <type2 class="row" v-if="list.kind == 2" :list="list"></type2>
        <type3 class="row" v-if="list.kind == 3" :list="list"></type3>
        <type4 class="row" v-if="list.kind == 4" :list="list"></type4>
    </div>
</template>

<script>
import Banner from '@/components/common/index-admin/Banner.vue'
import Type1 from '@/components/common/index-admin/Type1.vue'
import Type2 from '@/components/common/index-admin/Type2.vue'
import Type3 from '@/components/common/index-admin/Type3.vue'
import Type4 from '@/components/common/index-admin/Type4.vue'

export default {
    name: 'Index-Component',
    props: {
        list: {}
    },
    data() {
        return {}
    },
    components: {
        Banner,
        Type2,
        Type1,
        Type3,
        Type4
    },

    watch: {},
    created() {},
    mounted() {
        // console.log('输出 ~ list', this.list)
    },
    methods: {}
}
</script>

<style scoped="scoped" lang="less">
.row {
    margin-bottom: 20px;
}
</style>
