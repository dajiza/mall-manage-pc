<template>
    <div class="select-wrap-box">
        <div></div>
        <div></div>
    </div>
</template>
<script>
    export default {
        name: 'listFieldShow',
        props: {
            // checked: {
            //     type: Boolean,
            //     default: true
            // },
            size: {
                type: String,
                default: 'big'
            },
            needDelete: {
                type: Boolean,
                default: true
            },
            closePopOperation: {
                type: Boolean,
                default: true
            },
            detail: {
                type: Object,
                default: null
            },
            showMore: {
                type: Boolean,
                default: false
            },
            allList: {
                type: Array,
                default: []
            },
            local: {
                type: String,
                default: ''
            },
        },
        data() {
            return {
                items: [
                    { type: '', label: '标签一' },
                    { type: 'success', label: '标签二' },
                    { type: 'info', label: '标签三' },
                    { type: 'danger', label: '标签四' },
                    { type: 'warning', label: '标签五' }
                ]
            }
        },
        created() {
            console.log('local', this.local)
            console.log('allList', this.allList)
        },
        mounted() {
        },
        methods: {
            onChecked() {
                // console.log('输出 ~ this.check', this.checked)
                // this.checked = !this.checked
                this.$emit('onChecked', this.detail)
            },
            openPreview() {
                this.$emit('openPreview', this.detail)
            },
            unique() {
                this.$emit('onUnique', this.detail)
            },
            deletePic() {
                this.$confirm('删除后可在回收站内查看', '是否确认要删除该设计图？', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                    .then(() => {
                        this.$emit('onDelete', this.detail)
                    })
                    .catch(() => {})
            }
        }
    }
</script>
<style scoped="scoped" lang="less">

</style>
