<template>
    <div class="leaflet-query-page container-wrap">
        <div class="leaflet-query-container">
            <div class="picture-box"
                @mouseover="mouseOver()"
                @mouseleave="mouseLeave"
                @click.stop="viewBigImg(leafletImgUrl)"
            >
                <div class="img-box">
                    <img :src="getImg(leafletImgUrl, 240)" alt="">
                </div>
                <div class="btn-box" :class="{'btn-box-show':btnInquireShow}" v-hasPermission="'baidu-img-check-search'">
                    <div class="btn-inquire w100"
                         @click.stop="handleInquire(leafletImgUrl)">查询</div>
                </div>
            </div>
        </div>
        <div class="searching-box" v-show="inquireStart">
            <img src="../../../../assets/img/search.svg" />
            <span>正在搜索中......</span>
        </div>
        <div class="global-table-title result-search-box" v-show="!inquireStart && inquireResultShow">
            <div class="title">
                <i></i>
                <span class="text-check-result">查询结果</span>
                <el-input v-model="searchValue" placeholder="请输入产品编码搜索" class="input-with-search"
                          @keyup.enter.native="handleSearch()">
                    <el-button type="primary" class="btn-search" slot="append" @click="handleSearch()">搜索</el-button>
                </el-input>
            </div>
            <div class="btn-right">
                <el-button type="success" v-hasPermission="'pic-add-product'" @click="handleAddProduct()">添加产品</el-button>
            </div>
        </div>
        <div class="inquire-result-box" v-show="!inquireStart && inquireResultShow">
            <ul v-show="inquireResultData.length > 0"> <!--class="clearfix"-->
                <li class="list-li" v-for="(item,index) in inquireResultData" :key="index">
                    <div class="img-box">
                        <img :src="getImg(item.info.img, 240)" @click="viewBigImg(item.info.img)" alt="">
                    </div>
                    <div class="info-box">
                        <p class="product-name text-ellipsis">{{item.info.name}}</p>
                        <p class="other-attr text-ellipsis">产品编码：{{item.info.product_code}}</p>
                        <p class="other-attr text-ellipsis" v-show="!isPreciseSearch">相似度：{{item.similarity}}</p>
                        <div class="view-add-btn">
                            <el-button type="primary" v-hasPermission="'pic-view-product'" @click="handleViewProduct(item.info.id)">查看产品</el-button>
                            <el-button v-hasPermission="'pic-product-detail-create'" @click="handleAddGoods(item.info)">添加货物</el-button>
                        </div>
                    </div>
                </li>
                <i v-for="item in i_list"></i>
            </ul>
            <EmptyList class="EmptyList" v-show="inquireResultData.length === 0"></EmptyList>
        </div>
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
        <!-- 添加货物弹出框 -->
        <AddGoodsModal
                v-if="addGoodsModalInfo.visible"
                :addGoodsModalInfo="addGoodsModalInfo"
                @handleCloseAddGoodsModal="handleCloseAddGoodsModal"
                @handleSureAddGoodsModal="handleSureAddGoodsModal"
        ></AddGoodsModal>
    </div>
</template>
<script>
import './PhotoDetection.less';
import { getDetailList ,pictureCheckSearch, pictureProcessing} from '../../../../api/photoDetection';
import EmptyList from '../../../common/empty-list/EmptyList';
import BigImg from '../../../common/big-img/BigImg';
import AddGoodsModal from '../../../common/add-goods-modal/AddGoodsModal';
import { getProductDetail, getProductList } from '../../../../api/productList';

export default {
    name: 'LeafletQuery',
    data() {
        return {
            is_loading: false,
            pageInfo: {
                pageIndex: 1,
                pageSize: 999,
                pageTotal: 0
            },
            operationalIndex: -1,
            tableHeight: 'calc(100% - 134px)',
            tabPosition:'all',
            selectedStatus: 0,
            imgBaseUrl:'',
            selectedIndex: -1,
            bigImgVisible:true,
            bigImgShow: false,
            bigImgUrl:'',
            searchValue:'',
            inquireResultShow:false,  // 查询结果展示
            inquireStart:false,       // 开始查询
            inquireResultData:[],     // 查询结果列表
            leafletImgUrl:'',  // 单张图片地址
            btnInquireShow: false,
            addGoodsModalInfo:{
                visible:false,
                currentItem:{}
            },
            isPreciseSearch:false,    // 精准搜索 （输入产品编码搜索）
            i_list : [1,2,3,4,5,6,7,8,9,10],
        };
    },
    components:{
        EmptyList,
        BigImg,
        AddGoodsModal
    },
    // 计算属性
    computed:{
    },
    created() {
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
        // 单张图片地址 this.$route.query.imgUrl
        this.leafletImgUrl = this.$route.query.imgUrl;
    },
    mounted() {
    },
    methods: {

        //  拼接图片地址
        getImg(url,num){
            // return this.imgBaseUrl + url;
            if(url){
                if(url.indexOf('http') === -1){
                    return this.imgBaseUrl + url + '!/fw/' + num;
                }else {
                    return url + '!/fw/' + num;
                }
            }

        },
        // 鼠标移入
        mouseOver(){
            this.btnInquireShow = true;
        },
        // 鼠标移出
        mouseLeave(){
            this.btnInquireShow = false;
        },
        // 查看大图
        viewBigImg(pic_url){
            if(pic_url){
                this.bigImgUrl = this.imgBaseUrl + pic_url + '!/fw/640';
                this.$refs.bigImg.show();
            }
        },

        // 按钮--查询
        handleInquire(url){
            const params = {
                pic_url:this.imgBaseUrl + url
            }
            // 请求 -- 照片检测百度云库
            this.picCheckSearch(params);
        },

        // 按钮-添加产品
        handleAddProduct(){
            this.$router.push({
                path: '/product-add',
                query:{
                    pic_img: this.leafletImgUrl
                }
            });
        },
        // 按钮-添加货物
        handleAddGoods(obj){
            this.addGoodsModalInfo = Object.assign({}, this.addGoodsModalInfo, { currentItem: { ...obj }, visible: true });
        },
        // 按钮-查看产品
        handleViewProduct(product_id){
            this.$router.push({ path: '/view-product-goods', query: { id: product_id, status: 'view' } });
        },
        // 搜索
        handleSearch(){
            this.inquireResultData = [];
            this.isPreciseSearch = true;
            let params = {};
            params['id'] = '';
            params['product_code'] = this.searchValue;
            const str =  '100%'
            this.getProductDetailData(params, str);
        },
        // 请求 -- 照片检测百度云库
        picCheckSearch(params){
            const rLoading = this.openLoading();
            this.inquireStart = true;
            pictureCheckSearch(params).then((res)=>{
                rLoading.close();
                this.inquireStart = false;
                this.inquireResultShow = true;
                if(res.code === 200){
                    this.inquireResultData = [];
                    if(res.Data){
                        let ids = [];
                        this.initialQueryList = res.Data;
                        res.Data.forEach((ev)=>{
                            ids.push(ev.product_id);
                        })
                        this.getProductListData(ids);
                    }else {
                        this.$notify({
                            title: '暂无相似，可输入产品编码搜索',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch((err)=>{});
        },

        // 请求 - 产品详情（查询列表产品）
        getProductDetailData(params, str){
            const rLoading = this.openLoading();
            getProductDetail(params)
                .then((res) => {
                    if (res.code === 200) {
                        this.inquireResultData.push({
                            info:res.data,
                            similarity: str
                        });
                    } else {
                        if(this.isPreciseSearch){
                            this.$notify({ title: res.msg, message: '', type: 'error', duration: 5000 });
                        }
                    }
                    rLoading.close();
                })
                .catch(() => {});
        },

        // 获取 - 产品列表
        getProductListData(ids) {
            const params ={
                name: '',
                category_id:-1,
                tag_ids: [],
                type: -1,
                product_code: '',
                status: -1,
                attr_brand: 0,
                attr_color: 0,
                attr_material: 0,
                attr_origin: 0,
                attr_pattern: 0,
                attr_unit: 0,
                limit:10,
                page:1,
                ids:ids
            }
            const rLoading = this.openLoading();
            getProductList(params).then((res) => {
                rLoading.close();
                if (res.code === 200){
                    const productListData = res.data.list || [];
                    this.initialQueryList.forEach((ev)=>{
                        productListData.forEach((item)=>{
                            if(ev.product_id === item.id){
                                this.inquireResultData.push({
                                    info:item,
                                    similarity: ev.similarity * 100 + '%'
                                })
                            }
                        })
                    })
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch((err)=>{});
        },

        // 添加货物弹窗关闭
        handleSureAddGoodsModal(visible) {
            this.$set(this.addGoodsModalInfo, 'visible', visible);
        },
        handleCloseAddGoodsModal(visible) {
            this.$set(this.addGoodsModalInfo, 'visible', visible);
        },
    }
};
</script>