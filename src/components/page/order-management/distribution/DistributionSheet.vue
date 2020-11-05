<template>
    <div class="distribution-sheet-container" id="containerWrap"> <!--container-wrap-->
        <div class="container clearfix" ref="searchBox">
            <div class="handle-box">
                <el-form :model="searchForm" :inline="true" ref="searchForm" label-width="80px">
                    <el-form-item label="产品名称：" prop="name">
                        <el-input v-model="searchForm.name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="产品编码：" prop="code">
                        <el-input v-model="searchForm.code" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="购买渠道：" prop="buy_way">
                        <el-select v-model="searchForm.buy_way" placeholder="请选择" class="handle-select">
                            <!--style="width: 200px!important;"-->
                            <el-option v-for="state in buyWayOptions" :key="state.id" :value="state.id" :label="state.name"/>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <div class="btn-right">
                <el-button @click="resetForm('searchForm')">重置</el-button>
                <el-button type="primary" @click="handleSearch('searchForm')">搜索</el-button>
            </div>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0 table-has-img">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>配货单：{{end_time}}</span>
                </div>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                ref="multipleTable"
            >
                <el-table-column label="产品图片" width="130">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.img)" alt="" @click="viewBigImg(scope.row.img)">
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称"></el-table-column>
                <el-table-column prop="product_detail_code" label="货物编码"></el-table-column>
                <el-table-column prop="shelf_code" label="货架号" width="180"></el-table-column>

                <el-table-column prop="unit" label="单位" width="120"></el-table-column>
                <el-table-column prop="total" label="总数" width="120"></el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageInfo.pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
    </div>
</template>

<script>
import { getDistributionSheetList } from '../../../../api/cutCloth';
import EmptyList from '../../../common/empty-list/EmptyList';
import BigImg from '../../../common/big-img/BigImg';
import './Distribution.less';
export default {
    name: 'CutSheet',
    data() {
        return {
            searchForm: {
                name:'',
                code:'',
                buy_way:''
            },
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 10,
                pageTotal:0
            },
            loading: false,
            tableData: [],
            operationalInfo: {},
            operationalId: -1,
            operationalIndex: -1,
            searchParams: {
                product_name: '',
                product_code: '',
                buy_way: -1
            },
            tableHeight: 'calc(100% - 134px)',
            imgBaseUrl:'',
            bigImgUrl:'',
            buyWayOptions:[],
            end_time:''
        };
    },
    components: {
        EmptyList,
        BigImg
    },
    computed:{
        //  拼接图片地址
        getImg: function () {
            return (data) => {
                if(data.indexOf('http') === -1){
                    return this.imgBaseUrl + data + '!/fw/' + 80;
                }else {
                    return data + '!/fw/' + 80;
                }
            }
        }
    },
    created() {
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
        this.end_time = this.getUrlKey('end_time', window.location.href);
    },
    mounted() {
        // 获取用户列表数据
        this.getListData();

        // 获取搜索容器高度
        /*const searchBoxHeight = this.$refs.searchBox.offsetHeight;
        const containerHasSearch = document.getElementsByClassName('container-table-has-search')[0];
        containerHasSearch.style.height = `calc(100% - 16px - ${searchBoxHeight}px)`;*/
    },
    methods: {
        indexMethod(index) {
            index = index + 1 + (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize;
            return index;
        },
        getUrlKey(name, url) {
            return (
                decodeURIComponent(
                    (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ''])[1].replace(/\+/g, '%20')
                ) || null
            );
        },
        // 请求-获取配货单列表数据
        getListData() {
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                product_name: this.searchParams.product_name ? this.searchParams.product_name : '',
                product_code: this.searchParams.product_code ? this.searchParams.product_code : '',
                status: -1,
                process_id: Number(this.$route.query.id)
            };
            const rLoading = this.openLoading();
            getDistributionSheetList(params)
                .then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists;
                            this.$set(this.pageInfo,'pageTotal',res.data.total);
                        } else {
                            this.tableData = [];
                            this.$set(this.pageInfo,'pageTotal',0);
                        }
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                })
                .catch(() => {});
        },

        // 按钮-触发搜索按钮
        handleSearch(formName) {
            this.$set(this.pageInfo, 'pageIndex', 1);
            //  存储搜索条件
            this.$set(this.searchParams,'product_name', this.searchForm.name);
            this.$set(this.searchParams,'product_code', this.searchForm.code);
            this.$set(this.searchParams,'buy_way', this.searchForm.buy_way);
            this.getListData();
        },

        // 按钮-打印裁布单
        handlePrintCutSheet(index, row){
            this.$notify({
                title: '抱歉，功能未上线',
                message: '',
                type: 'error',
                duration: 5000
            });
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            if (this.searchParams['product_name']) {
                this.$set(this.searchForm, 'name', this.searchParams['product_name']);
            }
            if (this.searchParams['product_code']) {
                this.$set(this.searchForm, 'code', this.searchParams['product_code']);
            }
            if (this.searchParams['buy_way']){
                this.$set(this.searchForm,'buy_way', this.searchParams['buy_way']);
            }
            this.getListData();
        },

        // 按钮-重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$set(this.searchParams,'product_name', '');
            this.$set(this.searchParams,'product_code', '');
            this.$set(this.searchParams,'buy_way', '');
            this.$set(this.pageInfo, 'pageIndex', 1);
            this.getListData();
        },
        // 查看大图
        viewBigImg(pic_url){
            if(pic_url){
                if(pic_url.indexOf('http') === -1){
                    this.bigImgUrl =  this.imgBaseUrl + pic_url + '!/fw/640';
                }else {
                    this.bigImgUrl =  pic_url + '!/fw/640';
                }
                this.$refs.bigImg.show();
            }
        },
    }
};
</script>
