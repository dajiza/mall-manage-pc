<template>
    <div class="empty-list">
        <div class="img-text">
            <img src="../../../assets/img/empty-list.png" alt="">
            <span>{{tipText}}</span>
        </div>
    </div>
</template>
<script>
import './EmptyList.less';
export default {
    name: 'EmptyList',
    props: {
        tipText:{
            type: String,
            default: '暂无数据'
        }
    },
    data() {
        return {
        };
    },
    methods: {

    }
};
</script>