<template>
    <div class="product-locking-contain"> <!-- container-wrap-->
        <div class="container clearfix" ref="searchBox">
            <el-form :model="searchForm" :inline="true" :rules="searchRules"
                     class="clearfix search-box" ref="searchFormBox" label-width="80px">
                <el-form-item label="产品名称:" prop="product_name">
                    <el-input v-model="searchForm.product_name"></el-input>
                </el-form-item>
                <div class="lock-num clearfix">
                    <el-form-item label="锁定数量:" prop="num_ge">
                        <el-input v-model="searchForm.num_ge" placeholder="数量"
                                  onKeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" type="number"></el-input>

                    </el-form-item>
                    <span class="center-spacer">-</span>
                    <el-form-item label="" prop="num_le">
                        <el-input v-model="searchForm.num_le" placeholder="数量"
                                  onKeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" type="number"></el-input>

                    </el-form-item>
                </div>
                <div class="cut-off-time">
                    <el-form-item label="截止时间:" prop="end_time_ge">
                        <el-date-picker
                                v-model="searchForm.end_time_ge"
                                type="datetime"
                                placeholder="选择时间"
                                :picker-options="pickerOptions1"
                                @change="getTimeLe"
                                format="yyyy-MM-dd HH:mm:ss"
                                default-time="00:00:00">
                        </el-date-picker>
                    </el-form-item>
                    <span class="center-spacer">-</span>
                    <el-form-item label="" prop="end_time_le">
                        <el-date-picker
                                v-model="searchForm.end_time_le"
                                type="datetime"
                                placeholder="选择时间"
                                :picker-options="pickerOptions2"
                                @change="getTimeGe"
                                format="yyyy-MM-dd HH:mm:ss"
                                default-time="00:00:00">
                        </el-date-picker>
                    </el-form-item>
                </div>

                <div class="btn-right">
                    <el-button @click="resetForm('searchFormBox')">重置</el-button>
                    <el-button type="primary" @click="handleSearch('searchFormBox')">搜索</el-button>
                </div>
            </el-form>
        </div>
        <div class="container m-t-16 p-t-0 container-table-has-search table-has-img">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>锁定产品列表</span>
                </div>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                ref="multipleTable"
                tooltip-effect="dark"
            >
                <el-table-column label="图片" width="120">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.product_img)" alt="" @click="viewBigImg(scope.row.product_img)">
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称" width="200"></el-table-column>
                <el-table-column prop="product_code" label="产品编码" width="140"></el-table-column>
                <el-table-column prop="num" label="锁定数量" width="120"></el-table-column>
                <el-table-column prop="end_time" label="预计解锁时间"></el-table-column>
                <el-table-column prop="remark" label="备注"></el-table-column>
                <el-table-column label="操作" width="100" v-hasPermission="'product-lock-free'">
                    <template slot-scope="scope">
                        <el-button type="text" @click="handleUnlock(scope.$index, scope.row)">解锁</el-button>
                    </template>
                </el-table-column>
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
        <!--放大图片-->
        <transition name="el-fade-in-linear"> <!-- v-if="bigImgShow"-->
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
    </div>
</template>
<script>
import './ProductList.less';
import { getLockProductList, getProductLockFree} from '../../../../api/productList';
import EmptyList from '../../../common/empty-list/EmptyList';
import BigImg from '../../../common/big-img/BigImg';
export default {
    name: 'LockingProductList',
    data() {
        var ValitaNumLe = (rule, value, callback) => {
            setTimeout(()=>{
                if (this.searchForm.num_ge !== '' && this.searchForm.num_le !== '' ) {
                    if(Number(this.searchForm.num_le) < Number(this.searchForm.num_ge)){
                        callback(new Error('应大于初始数量!'));
                    }else {
                        callback();
                    }
                }
            },50)
        };
        var ValitaNumGe = (rule, value, callback) => {
            setTimeout(()=>{
                if (this.searchForm.num_ge !== '' && this.searchForm.num_le !== '' ) {
                    if(Number(this.searchForm.num_ge) > Number(this.searchForm.num_le)){
                        callback(new Error('应小于结束数量!'));
                    }else {
                        callback();
                    }
                }
            })
        };
        return {
            pageInfo: {
                pageIndex: 1,
                pageSize: 10,
                pageTotal: 0
            },
            searchForm: {
                product_name:'',
                num_le: '',
                num_ge: '',
                end_time_le:'',
                end_time_ge:'',
            },
            searchRules:{
                num_le:[{validator: ValitaNumLe, trigger: ['blur','change'] }],
                num_ge:[{validator: ValitaNumGe, trigger: ['blur','change'] }]
            },
            searchParams:{
                product_name:'',
                num_le: -1,
                num_ge: -1,
                end_time_le:'-1',
                end_time_ge:'-1',
            },  // 已搜索参数
            pickerOptions1: {
                disabledDate: (time) => {
                    if (this.searchForm.end_time_le !== "") {
                        return time.getTime() > this.searchForm.end_time_le;
                    } else {
                        // return time.getTime() > Date.now();
                    }

                }
            },
            pickerOptions2: {
                disabledDate: (time) => {
                    return time.getTime() < this.searchForm.end_time_ge;
                }
            },
            tableData: [],
            loading: false,
            tableHeight: 'calc(100% - 134px)',
            time1:'',
            bigImgUrl:'',  // 需要放大图片url
            imgBaseUrl:'',
            bigImgShow:false
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
                if(data){
                    if(data.indexOf('http') === -1){
                        return this.imgBaseUrl + data + '!/fw/' + 80;
                    }else {
                        return data + '!/fw/' + 80;
                    }
                }
            }
        },
    },
    created() {
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
    },
    mounted() {
        this.getDataList();
        // 获取搜索容器高度
        /*const searchBoxHeight = this.$refs.searchBox.offsetHeight;
        const containerHasSearch = document.getElementsByClassName('container-table-has-search')[0];
        containerHasSearch.style.height = `calc(100% - 16px - ${searchBoxHeight}px)`;*/
    },
    methods: {
        // 请求获取列表数据
        getDataList() {
            const params ={
                id: -1,
                product_id:-1,
                user_id:-1,
                created_time_le: '-1',
                created_time_ge: '-1',
                num_le: this.searchParams.num_le?Number(this.searchParams.num_le):-1,
                num_ge: this.searchParams.num_ge?Number(this.searchParams.num_ge):-1,
                end_time_le: this.searchParams.end_time_le,
                end_time_ge: this.searchParams.end_time_ge,
                product_name: this.searchParams.product_name,
                limit:this.pageInfo.pageSize,
                page:this.pageInfo.pageIndex
            }
            const rLoading = this.openLoading();
            getLockProductList(params).then((res) => {
                rLoading.close();
                if (res.code === 200){
                    this.tableData = res.data.lists || [];
                    this.$set(this.pageInfo, 'pageTotal', res.data.total);
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

         // 按钮-重置
        resetForm(formName) {
            this.$refs['searchFormBox'].resetFields();
            this.$refs['searchFormBox'].clearValidate();
            this.$set(this.pageInfo, 'pageIndex', 1);
            this.$set(this.searchParams,'product_name', '');
            this.$set(this.searchParams,'num_le', -1);
            this.$set(this.searchParams,'num_ge', -1);
            this.$set(this.searchParams,'end_time_le', '-1');
            this.$set(this.searchParams,'end_time_ge', '-1');
            this.getDataList();
        },
        getTimeLe(val){
        },

        getTimeGe(val){
        },

        //时间格式化
        getTime(val){
            if(val){
                const dt = new Date(val);
                let year = dt.getFullYear(); //年
                let month = dt.getMonth() +1; //月
                let date = dt.getDate(); //日
                let hh = dt.getHours(); //时
                let mm = dt.getMinutes(); //分
                let ss = dt.getSeconds(); //秒
                month = month < 10 ? "0" + month : month;
                date  = date <10 ? "0" + date : date;
                hh  = hh <10 ? "0" + hh : hh;
                mm  = mm <10 ? "0" + mm : mm;
                ss  = ss <10 ? "0" + ss : ss;
                let new_time = ''
                new_time = year + "-" + month + "-" + date + ' ' + hh + ':' + mm + ':' + ss;
                return new_time;
            }else {
                return '-1'
            }
        },

        // 按钮-触发搜索按钮
        handleSearch(formName) {
            if( this.searchForm.num_ge !=='' && this.searchForm.num_le !== ''){
                if(Number(this.searchForm.num_le) >= Number(this.searchForm.num_ge)){
                    this.$refs['searchFormBox'].clearValidate();
                    this.$set(this.pageInfo, 'pageIndex', 1);
                    this.$set(this.searchParams,'product_name', this.searchForm.product_name);
                    this.$set(this.searchParams,'num_le', this.searchForm.num_le);
                    this.$set(this.searchParams,'num_ge', this.searchForm.num_ge);
                    this.$set(this.searchParams,'end_time_le', this.getTime(this.searchForm.end_time_le));
                    this.$set(this.searchParams,'end_time_ge', this.getTime(this.searchForm.end_time_ge));
                    this.getDataList();
                }

            }else {
                this.$refs['searchFormBox'].clearValidate();
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.$set(this.searchParams,'product_name', this.searchForm.product_name);
                this.$set(this.searchParams,'num_le', this.searchForm.num_le);
                this.$set(this.searchParams,'num_ge', this.searchForm.num_ge);
                this.$set(this.searchParams,'end_time_le', this.getTime(this.searchForm.end_time_le));
                this.$set(this.searchParams,'end_time_ge', this.getTime(this.searchForm.end_time_ge));
                this.getDataList();
            }
        },

        // 按钮-解锁
        handleUnlock(index,row){
            this.$confirm('确定要解锁该产品吗？', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            }).then(() => {
                const params = {
                    id: row.id
                }
                const rLoading = this.openLoading();
                getProductLockFree(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200){
                        this.$notify({
                            title: '解锁成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                        if(this.pageInfo.pageIndex > 1 && this.tableData.length < 2){
                            this.$set(this.pageInfo, 'pageIndex', this.pageInfo.pageIndex - 1);
                        }
                        this.getDataList();
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                });
            }).catch(() => {});

        },

        // 分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            if (this.searchParams['product_name']) {
                this.$set(this.searchForm, 'name', this.searchParams['product_name']);
            }
            if (this.searchParams['num_le'] > 0) {
                this.$set(this.searchForm, 'num_le', this.searchParams['num_le']);
            }else {
                this.$set(this.searchForm, 'num_le', '');
            }
            if (this.searchParams['num_ge'] > 0) {
                this.$set(this.searchForm, 'num_ge', this.searchParams['num_ge']);
            }else {
                this.$set(this.searchForm, 'num_ge', '');
            }
            if (this.searchParams['end_time_le'] && this.searchParams['end_time_le'] !=='-1') {
                this.$set(this.searchForm, 'end_time_le', this.searchParams['end_time_le']);
            }else {
                this.$set(this.searchForm, 'end_time_le', '');
            }
            if (this.searchParams['end_time_ge'] && this.searchParams['end_time_ge'] !=='-1') {
                this.$set(this.searchForm, 'end_time_ge', this.searchParams['end_time_ge']);
            }else {
                this.$set(this.searchForm, 'end_time_ge', '');
            }
            this.getDataList();
        },
        // 查看大图
        viewBigImg(pic_url){
            if(pic_url){
                if(pic_url.indexOf('http') === -1){
                    this.bigImgUrl =  this.imgBaseUrl + pic_url + '!/fw/640';
                }else {
                    this.bigImgUrl =  pic_url + '!/fw/640';
                }
                // this.bigImgShow = true;
                this.$refs.bigImg.show();
            }
        },
    }
};
</script>