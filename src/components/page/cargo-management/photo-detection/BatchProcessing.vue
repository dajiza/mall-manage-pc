<template>
    <div class="batch-processing-page container-wrap">
        <div class="batch-processing-container p-t-0 height500">
            <el-tabs v-show="!is_finished" v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="待处理" name="待处理"></el-tab-pane>
                <el-tab-pane label="已处理" name="已处理"></el-tab-pane>
            </el-tabs>
            <el-tabs v-show="is_finished" v-model="activeName">
                <el-tab-pane label="已处理" name="已处理"></el-tab-pane>
            </el-tabs>
            <div class="list-box">
                <div v-show="tableData.length > 0" class="pic-list-ul-wrap" ref="listUl" @scroll="monitorUlScroll">
                    <ul> <!--class="clearfix"-->
                        <li class="picture-box" v-for="(item,index) in tableData" :key="item.id"
                            @mouseover="mouseOver(index)"
                            @mouseleave="mouseLeave"
                            @click="viewBigImg(item.pic_url)"
                        >
                            <div class="img-box" :id="'anchor-'+index">
                                <img :src="getImg(item.pic_url, 200)" alt="">
                            </div>
                            <div class="btn-box" :class="{'btn-box-show':index === selectedIndex}">
                                <div class="btn-inquire" :class="{'w100':activeName === '已处理'}" v-hasPermission="'baidu-img-check-search'"
                                     @click.stop="handleInquire(item.pic_url, item)">查询</div>
                                <div class="btn-not-process" @click.stop="handleNotProcess(item.id,index)" v-hasPermission="'pic-check-detail-update'"
                                     v-show="activeName === '待处理'">不处理</div>
                                <div class="delimiter" v-show="activeName === '待处理'"></div>
                            </div>
                        </li>
                        <i v-for="item in i_list"></i>
                    </ul>
                    <div class="view-all" v-show="tableData.length > 0 && activeName === '已处理' && processed_is_all">没有更多了哦～</div>
                    <div class="view-all" id="isAll" v-show="tableData.length > 0 && activeName === '待处理' && pending_is_all">没有更多了哦～</div>
                </div>
                <EmptyList class="EmptyList" v-show="tableData.length === 0"></EmptyList>
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
import AddGoodsModal from '../../../common/add-goods-modal/AddGoodsModal';
import BigImg from '../../../common/big-img/BigImg';
import { getProductDetail, getProductList } from '../../../../api/productList';

export default {
    name: 'BatchProcessing',
    data() {
        return {
            tableData: [],
            pageInfo: {
                pageIndex: 1,
                pageSize: 20,
                pageTotal: 0
            },
            pendingPageNum:1,      // 待处理 页数
            processedPageNum:1,    // 已处理 页数
            pageLimit:20,   //  每页条数
            operationalIndex: -1,
            tableHeight: 'calc(100% - 134px)',
            tabPosition:'all',
            selectedStatus: 0,
            activeName:'待处理',
            imgBaseUrl:'',
            selectedIndex: -1,
            bigImgVisible:true,
            bigImgShow: false,
            bigImgUrl:'',
            searchValue:'',
            inquireResultShow:false,  // 查询结果展示
            inquireStart:false,       // 开始查询
            inquireResultData:[],     // 查询结果列表
            currentItem: {},
            addGoodsModalInfo:{
                visible:false,
                currentItem:{}
            },
            isPreciseSearch:false,    // 精准搜索 （输入产品编码搜索）
            i_list : [1,2,3,4,5,6,7,8,9,10],
            is_finished:false, // 是否是从已完成进入
            pending_pic_list:[],   // 请求获得的 待处理 照片
            processed_pic_list:[],   // 请求获得的 已处理 照片
            pending_is_all:false,  // 待处理 已经是全部了'
            processed_is_all:false,  // 已处理已经是全部了
            is_loading:false,
            processed_last_num:0,  // 已处理 上次请求数量
            pending_last_num:0,  // 待处理 上次请求数量
            is_delete:false,
            ulScrollTop:0,
            anchorIndex:-1,
            initialQueryList:[],    // 百度云 初始查询列表
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
        if(this.$route.query.finished){
            this.is_finished = true;
            this.activeName = '已处理'
        }
    },
    mounted() {
        // 请求数据
        this.getListData();
    },
    methods: {
        // 请求-列表数据
        getListData() {
            this.is_loading = true;
            const id = Number(this.$route.query.id);
            const request = {
                page: this.activeName === '已处理' ? this.processedPageNum : this.is_delete? 1 :this.pendingPageNum, // 页码
                limit: this.is_delete ? this.pendingPageNum * this.pageLimit :this.pageLimit, // 每页条数
                status: this.activeName === '已处理'? 1 : 0,
                pic_check_id: id
            };
            // ajax
            const rLoading = this.openLoading();
            getDetailList(request).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    if(res.data.lists){
                        if(this.activeName === '已处理'){
                            this.processed_pic_list = this.unique(this.processed_pic_list.concat(res.data.lists));
                            this.tableData = this.processed_pic_list;
                        }else {
                            if(this.is_delete){
                                this.pending_pic_list = [];
                                // this.$refs.listUl.scrollTop = this.ulScrollTop - 55;
                            }
                            this.pending_pic_list = this.unique(this.pending_pic_list.concat(res.data.lists));
                            this.tableData = this.pending_pic_list;
                            if(this.is_delete){
                                // this.$refs.listUl.scrollTo(0, this.ulScrollTop - 55);
                                if(this.anchorIndex > 0){
                                    const anchorID =  'anchor-' + (this.anchorIndex - 1);
                                    document.getElementById(anchorID).scrollIntoView(true);
                                }

                            }
                            this.is_delete = false;
                        }
                        if( this.tableData.length === res.data.total){
                            if(this.activeName === '已处理'){
                                this.processed_is_all = true;
                            }else {
                                this.pending_is_all = true;
                            }
                        }else {
                            if(this.activeName === '已处理'){
                                this.processed_is_all = false;
                            }else {
                                this.pending_is_all = false;
                            }
                        }
                    }else {
                        if(this.activeName === '已处理'){
                            this.processed_is_all = true;
                            this.tableData = this.processed_pic_list;
                        }else {
                            this.pending_is_all = true;
                            this.tableData = this.pending_pic_list;
                        }
                    }
                    this.is_loading = false;
                }else {
                    this.is_delete = false;
                    this.is_loading = false;
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            });
        },

        //  拼接图片地址
        getImg(url,num){
            if(url){
                if(url.indexOf('http') === -1){
                    return this.imgBaseUrl + url + '!/fw/' + num;
                }else {
                    return url + '!/fw/' + num;
                }
            }
        },
        // 鼠标移入
        mouseOver(index){
            this.$nextTick(()=>{
                this.selectedIndex = index;
            });
        },
        // 鼠标移出
        mouseLeave(){
            this.selectedIndex = -1;
        },
        // 查看大图
        viewBigImg(url){
            if(url){
                if(url.indexOf('http') === -1){
                    this.bigImgUrl =  this.imgBaseUrl + url + '!/fw/640';
                }else {
                    this.bigImgUrl =  url + '!/fw/640';
                }
                this.$refs.bigImg.show();
            }
        },

        // 按钮-切换列表
        handleTabClick(tab, event) {
            // event.stopPropagation();
            this.$refs.listUl.scrollTop = 0;
            this.inquireStart = false;
            this.inquireResultShow = false;
            this.inquireResultData = [];
            this.searchValue = '';
            this.processedPageNum = 1;
            this.pendingPageNum = 1;
            this.pending_pic_list = [];  // 请求获得的 待处理 照片
            this.processed_pic_list =[];
            this.pending_is_all = false;
            this.processed_is_all = false;
            this.getListData();
        },
        // 按钮--查询
        handleInquire(url,item){
            this.isPreciseSearch = false;
            this.searchValue = '';
            this.currentItem = {...item};
            const params = {
                pic_url:this.imgBaseUrl + url
            }
            // 请求 -- 照片检测百度云库
            this.picCheckSearch(params);
        },

        // 按钮--不处理
        handleNotProcess(id,index){
            this.anchorIndex = index;
            const params = {
                id:id
            }
            const rLoading = this.openLoading();
            // 照片处理
            pictureProcessing(params).then((res)=>{
                rLoading.close();
                if(res.code === 200){
                    this.$notify({
                        title: '操作成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    this.is_delete = true;
                    this.ulScrollTop = this.$refs.listUl.scrollTop;
                    // this.$refs.listUl.scrollTop = 0;
                    this.getListData();
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            })
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
            // this.$notify({ title: '抱歉，功能未上线', message: '', type: 'error', duration: 1000 });
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
            })
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

        // 按钮-添加产品
        handleAddProduct(){
            if(this.currentItem){
                this.$router.push({
                    path: '/product-add',
                    query:{
                        pic_id: this.currentItem.id,
                        pic_img: this.currentItem.pic_url
                    }
                });
            }
        },

        // 按钮-添加货物
        handleAddGoods(obj){
            this.addGoodsModalInfo = Object.assign({}, this.addGoodsModalInfo, { currentItem: { ...obj }, visible: true });
        },

        // 按钮 - 查看产品
        handleViewProduct(product_id){
            this.$router.push({ path: '/view-product-goods', query: { id: product_id, status: 'view' } });
        },

        // 添加货物弹窗关闭
        handleSureAddGoodsModal(visible) {
            this.$set(this.addGoodsModalInfo, 'visible', visible);
        },
        handleCloseAddGoodsModal(visible) {
            this.$set(this.addGoodsModalInfo, 'visible', visible);
        },

        //
        monitorUlScroll(e){
            // e.stopPropagation();
            let ele = e.srcElement ? e.srcElement : e.target;
            const ulScrollTop = this.$refs.listUl.scrollTop;
            const ulHeight = this.$refs.listUl.offsetHeight;
            const ulScrollHeight = this.$refs.listUl.scrollHeight;
            if(Number(ulScrollTop + ulHeight) > ulScrollHeight - 50){
                if(!this.pending_is_all && !this.is_loading && this.activeName === '待处理'){
                    // 滚动到底，该刷新页面
                    this.pendingPageNum = Number(this.pendingPageNum + 1);
                    this.getListData();
                }else if(!this.processed_is_all && !this.is_loading && this.activeName === '已处理'){
                    this.processedPageNum = Number(this.processedPageNum + 1);
                    this.getListData();
                } else {
                    // 滚动到底，没有更多了
                }

            }else {
                // 未滚动到底
            }
        },

        // 对象数组去重
        unique(arr) {
            const res = new Map();
            return arr.filter((arr) => !res.has(arr.id) && res.set(arr.id, 1))
        }
    }
};
</script>