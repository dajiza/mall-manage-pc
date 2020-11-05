<template>
    <div class="photo-detection-container"><!--container-wrap-->
        <div class="container container-table-no-search p-t-0">
            <div class="photo-detection-table-title clearfix">
                <div class="title clearfix">
                    <i></i>
                    <span>照片检测</span>
                    <div class="tip-text">注：上传zip文件不会立刻显示在下方列表中，请耐心等待1-5分钟，如果长时间未显示，请联系技术。</div>
                </div>
                <div class="right-btn-all">
                    <el-radio-group v-model="tabPosition" class="tabs-nav" @change="tabClick()">
                        <el-radio-button label="all">全部</el-radio-button>
                        <el-radio-button label="processing">进行中</el-radio-button>
                        <el-radio-button label="finish">已完成</el-radio-button>
                    </el-radio-group>
                    <el-button type="primary" v-hasPermission="'leaflet-query'" @click="handleLeafletQuery">单张查询</el-button>
                    <el-button type="success" v-hasPermission="'upload-zip-file'" @click="handleUploadFiles">上传文件</el-button>
                </div>
            </div>

            <el-table v-loading="is_loading" :data="tableData" ref="multipleTable"><!--:height="tableHeight"-->
                <el-table-column  label="编号" type="index" width="75">
                    <template scope="scope">
                        <span>{{(pageInfo.pageIndex - 1) * pageInfo.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="counts" label="图片数">
                    <template scope="scope">
                        <span>{{scope.row.status >  0 ? scope.row.counts : '计算中'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="wait_deal_total" label="待处理图片数">
                    <template scope="scope">
                        <span>{{scope.row.status >  0 ? scope.row.wait_deal_total : '计算中'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                    <template scope="scope">
                        <span class="status-ball" :class="scope.row.status > 0 ? 'color-success':'color-err'"></span>
                        <span :class="scope.row.status >  0 ? 'font-use' : 'font-stop'">{{scope.row.status > 0 ? '上传完成' : '上传中'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="查询进度" width="160">
                    <template scope="scope">
                        <el-progress v-show="scope.row.status < 1" :percentage="0"></el-progress>
                        <el-progress v-show="scope.row.status > 0 && scope.row.wait_deal_total === 0" :percentage="100" status="success"></el-progress>
                        <el-progress v-show="scope.row.status > 0 && scope.row.wait_deal_total !== 0" :percentage="query_progress(scope.row)"></el-progress>
                    </template>
                </el-table-column>
                <el-table-column prop="operator_name" label="操作员"></el-table-column>
                <el-table-column prop="created_time" label="日期" width="200"></el-table-column>
                <el-table-column label="操作" width="140">
                    <template slot-scope="scope">
                        <el-button type="text" :disabled="scope.row.status < 1" v-hasPermission="'batch-processing'"
                                   @click="handleView(scope.$index, scope.row)">查看</el-button>
                    </template>
                </el-table-column>
                <template slot="empty" >
                    <EmptyList class="empty-box"></EmptyList>
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
        <!-- 上传提示弹出框 -->
        <el-dialog :title="tipTitle" :visible.sync="uploadVisible" width="400px"
                   :destroy-on-close="true" :close-on-click-modal="false">
            <div v-show="tipTitle === '图片格式限制'" class="tip-text paddingBottom40">照片格式只支持JPG、PNG；大小不超过5M</div>
            <div v-show="tipTitle === '文件格式限制'" class="tip-text">
                <p>1、文件大小不超过500M</p>
                <p>2、压缩包只支持ZIP格式</p>
                <p>3、照片格式只支持JPG、PNG</p>
                <p>4、内部全部是图片，不能有多层文件夹。</p>
                <p>5、对外部文件夹压缩，不能对图片直接压缩。</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-upload
                        class="upload-demo"
                        v-if="tipTitle === '图片格式限制'"
                        :action="uploadImgUrl"
                        :headers="header"
                        :before-upload="beforeUpload"
                        :on-success="uploadImgSuccess"
                        :on-error="uploadImgError"
                        :show-file-list="false"
                >
                        <el-button size="small" type="primary">继续上传</el-button>
                </el-upload>
                <el-upload
                        class="upload-demo"
                        v-if="tipTitle === '文件格式限制'"
                        :action="uploadFilesUrl"
                        :headers="header"
                        :before-upload="beforeUploadFiles"
                        :on-success="uploadFilesSuccess"
                        :on-error="uploadFilesImgError"
                        :show-file-list="false"
                        :file-list="fileList">
                        <el-button size="small" type="primary">继续上传</el-button>
                </el-upload>
            </span>
        </el-dialog>

    </div>
</template>
<script>
import './PhotoDetection.less';
import { getPhotoDetectionList } from '../../../../api/photoDetection';
import EmptyList from '../../../common/empty-list/EmptyList';
import {getToken} from '../../../../utils/auth';
export default {
    name: 'PhotoDetection',
    data() {
        return {
            tableData: [],
            is_loading: false,
            pageInfo: {
                pageIndex: 1,
                pageSize: 10,
                pageTotal: 0
            },
            operationalIndex: -1,
            tableHeight: 'calc(100% - 134px)',
            tabPosition:'all',
            selectedStatus: -1,
            tipTitle:'',
            uploadVisible:false,
            fileList:[],
            uploadImgUrl:'',
            uploadFilesUrl:'',
            imgBaseUrl:'',
            token:'',
            header:{},
            upload_loading:{},
        };
    },
    components:{
        EmptyList
    },
    // 计算属性
    computed:{
        query_progress:function() {
            return (data) =>{
                // if(data.wait_deal_total > 0){
                //
                // }else {
                //     return 0
                // }
                let num;
                if(data.wait_deal_total < data.counts){
                    num = Number((data.counts - data.wait_deal_total) / data.counts) * 100
                    return Math.round(num);
                }else {
                    return 0;
                }
            }
        }
    },
    created() {
        // 图片读取地址
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
        this.uploadFilesUrl = process.env.VUE_APP_BASE_API + '/backend/upload-zip-file';
        this.token = getToken();
        this.header['token'] = getToken();
        // process.env.VUE_APP_BASE_API
    },
    mounted() {
        // 请求数据
        this.getListData();
    },
    methods: {
        // 请求-列表数据
        getListData() {
            this.loading = true;
            const request = {
                page: this.pageInfo.pageIndex || 1, // 页码
                limit: this.pageInfo.pageSize || 10,
                status: this.selectedStatus
            };
            // ajax
            const rLoading = this.openLoading();
            getPhotoDetectionList(request).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.tableData = res.data.lists;
                    // this.pageInfo = Object.assign({},this.pageInfo,pageInfo)
                    this.pageInfo = Object.assign({}, this.pageInfo, { pageTotal: res.data.total });
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

        // 按钮-切换状态
        tabClick(){
            if(this.tabPosition === 'all'){
                this.selectedStatus = -1;
            }else if(this.tabPosition === 'processing'){
                this.selectedStatus = 1;
            }else if(this.tabPosition === 'finish'){
                this.selectedStatus = 3;
            }
            this.$set(this.pageInfo, 'pageIndex', 1);
            this.getListData();
        },

        // 按钮-单张查询
        handleLeafletQuery(){
            this.tipTitle = '图片格式限制';
            this.uploadVisible = true;

        },
        // 图片上传前检测
        beforeUpload(file){
            if((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') && file.size <= 1024*1024*5){
                this.upload_loading = this.uploadLoading('上传中');
                this.uploadVisible = false;
            }else {
                if(file.size > 1024*1024*5){
                    this.$notify({
                        title: '照片大小应不超过5M',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }else {
                    this.$notify({
                        title: '照片格式只支持JPG、PNG',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
                return false
            }
        },

        // 单张图片上传成功回调
        uploadImgSuccess(response, file, fileList){
            if(response.code === 200){
                this.$notify({
                    title: '操作成功',
                    message: '',
                    type: 'success',
                    duration: 500
                });
                setTimeout(()=>{
                    this.upload_loading.close();
                    this.$router.push({ path: 'leaflet-query',query:{imgUrl:response.data.file_url}});
                },500)
            }else {
                this.upload_loading.close();
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'error',
                    duration: 5000
                });
            }

        },

        // 单张图片上传失败回调
        uploadImgError(err, file, fileList){
            this.upload_loading.close();
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            });
        },

        // 压缩文件上传前回调
        beforeUploadFiles(file){
            if((file.type.indexOf('/zip') > -1 || file.type === 'application/x-zip-compressed') && file.size < 1024*1024*500){
                this.upload_loading = this.uploadLoading('上传中');
                this.uploadVisible = false;
            }else {
                this.$notify({
                    title: '请按要求上传',
                    message: '',
                    type: 'error',
                    duration: 5000
                });
                return false
            }
        },

        // 压缩文件上传成功回调
        uploadFilesSuccess(response, file, fileList){
            if(response.code === 200){
                this.upload_loading.close();
                this.$notify({
                    title: '操作成功',
                    message: '',
                    type: 'success',
                    duration: 3000
                });
                this.getListData();
            }else {
                this.upload_loading.close();
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'error',
                    duration: 5000
                });
            }

        },

        // 压缩文件上传失败回调
        uploadFilesImgError(err, file, fileList){
            this.upload_loading.close();
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            });
        },

        // 按钮-上传文件（压缩包）
        handleUploadFiles() {
            this.tipTitle = '文件格式限制';
            this.uploadVisible = true;
        },
        // 按钮-查看
        handleView(index,row){
            if(row.status > 0){
                if(row.wait_deal_total === 0){
                    this.$router.push({ path: 'batch-processing',query: { id: row.id ,finished:'1'} });
                }else {
                    this.$router.push({ path: 'batch-processing',query: { id: row.id } });
                }
            }
        },
        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            this.getListData();
        },
    }
};
</script>