<template>
    <div class="cut-sheet-container" id="containerWrap"> <!--container-wrap-->
        <div class="container clearfix" ref="searchBox">
            <div class="handle-box">
                <el-form :model="searchForm" :inline="true" ref="searchForm" label-width="80px">
                    <el-form-item label="产品名称：" prop="name" class="marginRight45">
                        <el-input v-model="searchForm.name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="产品编码：" prop="code">
                        <el-input v-model="searchForm.code" placeholder="请输入"></el-input>
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
                    <span>裁布单：{{end_time}}</span>
                </div>
                <el-button type="success" @click="printSelected" :disabled="multipleSelection.length < 1">打印</el-button>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                ref="multipleTable"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column label="产品图片" width="130">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.img)" alt="" @click="viewBigImg(scope.row.img)">
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称"></el-table-column>
                <el-table-column prop="product_detail_code" label="货物编码" width="180"></el-table-column>
                <el-table-column prop="shelf_code" label="货架号" width="180"></el-table-column>
                <el-table-column prop="color" label="颜色" width="120">
                    <template scope="scope">
                        <span>{{getColor(scope.row.color)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="unit" label="单位" width="94"></el-table-column>
                <el-table-column prop="total" label="总数" width="100"></el-table-column>
                <el-table-column prop="detail_arr" label="详情">
                    <template scope="scope">
                        <ul>
                            <li v-for="(item,i) in scope.row.detail_arr" :key="i"><span>{{item}}</span></li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                class="marginLeft0"
                                v-hasPermission="'print-sand-order'"
                                @click="printOrder(scope.$index, scope.row)"
                        >打印裁布单</el-button>
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
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
        <!--打印裁布单-->
        <div style="width:210mm;position: absolute;z-index: -1;top: -1000px;left: -1000px;display: none">
            <div id="printMe" ref="print" style="width: 100%;margin: 0 auto;background: #fff;box-sizing: border-box;">
                <div style="page-break-after:always;width: 100%;" v-for="(goods_item,i) in printInfo" :key="i">
                    <div style="width: 100%;padding-top: 10px;">
                        <div style="width: 100%;box-sizing: border-box;-webkit-box-sizing: border-box;font-size: 14px;padding: 5px 0 10px;">
                            <span style="margin-right: 10px">裁布单：{{end_time}} </span>
                        </div>
                        <table headerRows='1' style="width: 100% !important;border-color: rgba(0,0,0,1);border-collapse:collapse;font-size: 12px">
                            <thead>
                            <tr>
                                <th style="width: 18%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">产品名称</th>
                                <th style="width: 18%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">货物编码</th>
                                <th style="width: 14%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">货架号</th>
                                <th style="width: 12%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">颜色</th>
                                <th style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">单位</th>
                                <th style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">总数</th>
                                <th style="width: 18%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">详情</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td style="width: 18%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.product_name}}</td>
                                <td style="width: 18%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                    {{goods_item.product_detail_code}}</td>
                                <td style="width: 14%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                    {{goods_item.shelf_code}}</td>
                                <td style="width: 12%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{getColor(goods_item.color)}}</td>
                                <td style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.unit}}</td>
                                <td style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.total}}</td>
                                <td style="width: 18%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                    <p v-for="(detail_item,i) in goods_item.detail_arr" :key="i"><span>{{detail_item}}</span></p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getCutSheetList } from '../../../../api/cutCloth';
import EmptyList from '../../../common/empty-list/EmptyList';
import BigImg from '../../../common/big-img/BigImg';
import './CutCloth.less';
export default {
    name: 'CutSheet',
    data() {
        return {
            searchForm: {
                name:'',
                code:''
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
            },
            tableHeight: 'calc(100% - 134px)',
            imgBaseUrl:'',
            bigImgUrl:'',
            end_time:'',
            printInfo:[],
            multipleSelection:[],
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
        },
        getColor: function () {
            return (data) =>{
                let color = '';
                if(data){
                    // color = data.join('、');
                    color = data.replace(/,/g,"、");
                }
                return color;
            }
        },
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
        // 请求-获取裁布单列表数据
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
            getCutSheetList(params)
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
            this.searchParams['product_name'] = this.searchForm.name;
            this.searchParams['product_code'] = this.searchForm.code;
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
            this.getListData();
        },

        // 按钮-重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$set(this.pageInfo, 'pageIndex', 1);
            this.$set(this.searchParams, 'product_name', '');
            this.$set(this.searchParams, 'product_code', '');
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

        // 多选操作  -- 选择值发生变化
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },

        // 打印裁布单
        printOrder(index,row){
            this.printInfo = [];
            let obj = {};
            obj['product_name'] = row.product_name;
            obj['product_detail_code'] = row.product_detail_code;
            obj['shelf_code'] = row.shelf_code;
            obj['color'] = row.color;
            obj['total'] = row.total;
            obj['unit'] = row.unit;
            obj['detail_arr'] = row.detail_arr;
            this.printInfo.push(obj);
            this.$nextTick(()=>{
                this.$print(this.$refs.print);
            })
        },

        // 打印选中
        printSelected(){
            this.printInfo = [];
            this.multipleSelection.forEach((ev)=>{
                let obj = {};
                obj['product_name'] = ev.product_name;
                obj['product_detail_code'] = ev.product_detail_code;
                obj['shelf_code'] = ev.shelf_code;
                obj['color'] = ev.color;
                obj['total'] = ev.total;
                obj['unit'] = ev.unit;
                obj['detail_arr'] = ev.detail_arr;
                this.printInfo.push(obj);
            })
            this.$nextTick(()=>{
                this.$print(this.$refs.print);
            })
        }
    }
};
</script>
