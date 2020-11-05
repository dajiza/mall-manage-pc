<template>
    <div class="big-img-mask" v-if="isShow">
        <!--<div class="img-box" :class="{'w640':isOpen}">
            <img :src="imgUrl" alt="">
        </div>-->
        <!--大图预览-->
        <el-image-viewer
                v-if="dialogVisible"
                :on-close="closeViewer"
                :url-list="imgSrcList" />
    </div>
</template>
<script>
import './BigImg.less';
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
export default {
    name: 'BigImg',
    props: {
        // isShow: Boolean
        imgUrl: {
            type: String,
            default: ''
        },
        bigImgWidth:{
            type: String,
            default: '640px'
        }
    },
    data() {
        return {
            isShow: false,
            isOpen: false,
            imgSrcList:[],
            dialogVisible:false
        };
    },
    components: {
        ElImageViewer
    },
    watch:{
        imgUrl(newVal,oldValue){
            this.imgSrcList = [];
            this.imgSrcList.push(newVal)
            this.dialogVisible = true;
        }
    },
    created() {
        // console.log('imgUrl-created', this.imgUrl);
    },
    methods: {
        show(){
            this.isShow = true;
            setTimeout(()=>{
                this.isOpen = true;
            })
        },
        hide(){
            this.isOpen = false;
            setTimeout(()=>{
                this.isShow = false;
            },300)
        },
        closeViewer(){
            this.dialogVisible = true;
            this.isShow = false;
        }
    }
};
</script>