<template>
    <div class="product-category-page container-wrap">
        <div class="container container-table-no-search p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>其他商品分类</span>
                </div>
                <!-- v-hasPermission="'category-add'" -->
                <el-button type="primary" @click="handleCreateAuthority">新增分类</el-button>
            </div>
            <el-table
                    :data="tableData"
                    style="width: 100%"
            >
                <el-table-column label="图片" width="140">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.category_img)" alt="" @click="viewBigImg(scope.row.category_img)">
                    </template>
                </el-table-column>
                <el-table-column label="分类名称" prop="display_name">
                    <template slot-scope="scope">
                        <span>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="left">
                    <template slot-scope="scope">
                        <!--  v-hasPermission="'category-edit'" -->
                        <el-button type="text" class="marginRight32 m-l-0"
                                   @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <!--  v-hasPermission="'category-del'" -->
                        <el-button type="text" class="delete-color m-l-0"
                                   @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
                <template  slot="empty" >
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
                <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :current-page="pageIndex"
                        :page-size="pageLimit"
                        :total="pageTotal"
                        @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="formTitle" :visible.sync="editVisible" width="380px"
                   :before-close="dialogClose" :destroy-on-close="true" :close-on-click-modal="false">
            <el-form ref="formBox" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="类别名称:" prop="name">
                    <el-input placeholder="请输入" autofocus="autofocus" v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="上传图片:" style="width:160px;height: 160px">
                    <el-upload
                            class="avatar-uploader"
                            :action="uploadImgUrl"
                            :on-success="handleAvatarSuccess"
                            :on-error="uploadError"
                            :before-upload="beforeAvatarUpload"
                            :on-remove="handleRemove"
                            :show-file-list="false"
                            :headers="header"
                    >
                        <img
                                v-if="imageUrl"
                                :src="imageUrl"
                                class="avatar"
                        />
                        <div v-else class="avatar-uploader-icon">
                            <div class="avatar-wrap">
                                <img src="../../../assets/img/Icon-Plus.svg" alt="">
                            </div>
                            <span class="add-img-text">上传图片</span>
                        </div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!--大图预览-->
        <transition name="el-fade-in-linear">
            <el-image-viewer
                    v-if="dialogVisible"
                    :on-close="closeViewer"
                    :url-list="imgSrcList" />
        </transition>
    </div>
</template>

<script>
    import {queryCategoryList, addCategory, editCategory, deleteCategory} from '../../../api/otherCategory';
    import EmptyList from '../../common/empty-list/EmptyList';
    import './otherCategory.less';
    import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
    import { getToken } from '../../../utils/auth';
    export default {
        name: 'otherCategory',
        data() {
            return {
                pageIndex: 1,
                pageLimit: 10,
                pageTotal: 0,
                loading: false,
                tableData: [],
                editVisible: false,
                form: {
                    name: '',
                },
                rules: {
                    name: [
                        { required: true, message: '请输入类别名称', trigger: 'blur' },
                        { max: 100, message: '最多输入100个字符', trigger: 'blur' }
                    ]
                },
                formTitle: '',
                current_id:-1,
                tableHeight: 'calc(100% - 62px - 26px)',
                uploadImgUrl:'',  //   图片上传地址
                back_img_url:'',  //   上传后台返回图片地址（不完整）
                header:{},
                token:'',
                imageUrl: '',  // 展示小图 （可访问，尺寸限制240）
                completeImageUrl:'',  // 完整图片url（可访问，不加尺寸限制）
                dialogVisible: false,
                imgSrcList:[],
            };
        },
        components: {
            EmptyList,
            ElImageViewer
        },
        created() {
            // 图片上传地址
            this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
            this.token = getToken();
            this.header['token'] = getToken();
        },
        mounted() {
            // 获取 分类列表数据
            this.getData();
        },
        computed: {
            //  拼接图片地址
            getImg: function () {
                return (data) => {
                    if(data){
                        return data + '!/fw/' + 80;
                    }
                }
            },
        },
        methods: {

            // 获取 分类列表数据
            getData() {
                let params = {
                    page: this.pageIndex,
                    limit: this.pageLimit
                };
                const rLoading = this.openLoading();
                queryCategoryList(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        if(res.data){
                            console.log('tableData',res.data);
                            this.tableData = res.data.lists;
                            this.pageTotal = res.data.total;
                        }else {
                            this.tableData = [];
                        }
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 1000
                        });
                    }
                });
            },

            // 按钮-新增分类
            handleCreateAuthority() {
                this.formTitle = '新增分类';
                this.imageUrl = '';
                this.editVisible = true;
                this.$nextTick(()=>{
                    let new_obj = {};
                    new_obj['name'] = '';
                    // 触发更新
                    this.form = Object.assign({}, this.form,new_obj);
                })
            },

            // 按钮-编辑分类/编辑下级
            handleEdit(index, row) {
                this.current_id = row.id;
                this.completeImageUrl = row.category_img;
                this.imageUrl = this.completeImageUrl + '!/fw/200';
                this.formTitle = '编辑分类';
                this.editVisible = true;
                this.$nextTick(()=> {
                    const new_obj = JSON.parse(JSON.stringify(row));
                    // 触发更新
                    this.form = Object.assign({}, this.form,new_obj);
                })
            },

            // 按钮-删除操作
            handleDelete(index, row) {
                // 二次确认删除
                this.$confirm('确定要删除该分类吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning',
                    center: true
                }).then(() => {
                    let params = {};
                    params['id'] = row.id;
                    this.categoryDelete(params);

                }).catch(() => {});
            },

            // 按钮-保存编辑
            saveEdit() {
                let request = {};
                this.$refs['formBox'].validate(valid => {
                    if (valid) {
                        // 新增分类
                        if(this.completeImageUrl === ''){
                            this.$notify({
                                title: '请上传图片',
                                message: '',
                                type: 'error',
                                duration: 3000
                            });
                            return false
                        }else {
                            request['name'] = this.form.name;
                            request['category_img'] = this.completeImageUrl;
                            if (this.formTitle === '新增分类') {
                                this.categoryAdd(request);
                            }else {
                                request['id'] = this.current_id;
                                this.categoryEdit(request);
                            }
                        }

                    } else {
                        return false;
                    }
                });
            },

            // 请求-新增分类
            categoryAdd(params){
                const rLoading = this.openLoading();
                addCategory(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        this.editVisible = false;
                        this.$notify({
                            title: '添加成功',
                            message: '',
                            type: 'success',
                            duration: 1000
                        });
                        this.getData();
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 1000
                        });
                    }
                });
            },

            // 请求-编辑分类
            categoryEdit(params){
                const rLoading = this.openLoading();
                editCategory(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        this.editVisible = false;
                        this.$notify({
                            title: '编辑成功',
                            message: '',
                            type: 'success',
                            duration: 1000
                        });
                        this.getData();
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 1000
                        });
                    }
                });
            },

            // 请求-删除分类
            categoryDelete(params){
                const rLoading = this.openLoading();
                deleteCategory(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                        if(this.pageIndex > 1 && this.tableData.length < 2){
                            this.pageIndex = this.pageIndex -1;
                        }
                        this.$notify({
                            title: '删除成功',
                            message: '',
                            type: 'success',
                            duration: 1000
                        });
                        this.getData();
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 1000
                        });
                    }
                });
            },

            // 弹框关闭前操作
            dialogClose(){
                this.$refs['formBox'].clearValidate();
                this.$refs['formBox'].resetFields();
                this.editVisible = false;
            },

            // 图片上传成功
            handleAvatarSuccess(response, file) {
                // this.imageUrl = URL.createObjectURL(file.raw);
                this.uploadingTip.close();
                if(response.code === 200){
                    this.back_img_url = response.data.file_url;
                    this.completeImageUrl = response.data.file_url;
                    this.imageUrl = response.data.file_url + '!/fw/200';
                    this.bigImgUrl = response.data.file_url + '!/fw/640';
                }else {
                    this.$notify({ title: response.msg, message: '', type: 'error', duration: 3000 });
                }
            },

            // 上传失败
            uploadError(){
                this.uploadingTip.close();
                this.$notify({ title: '上传失败', message: '', type: 'error', duration: 3000 });
            },
            // 图片上传前检测
            beforeAvatarUpload(file) {
                if(file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg'){
                    this.uploadingTip = this.uploadLoading('上传中');
                }else {
                    this.$notify({
                        title: '图片格式只支持JPG、PNG',
                        message: '',
                        type: 'error',
                        duration: 3000
                    });
                    return false
                }
            },
            handleRemove(file, fileList) {
                this.imageUrl = '';
            },

            // 按钮-分页导航
            handlePageChange(val) {
                this.pageIndex = val;
                this.getData();
            },

            // 查看大图
            viewBigImg(pic_url){
                if(pic_url){
                    this.bigImgUrl =  pic_url + '!/fw/640';
                    // this.$refs.bigImg.show();
                    this.imgSrcList = [];
                    this.imgSrcList.push(this.bigImgUrl);
                    this.dialogVisible = true;
                }
            },

            // 关闭大图
            closeViewer(){
                this.dialogVisible = false;
            }


        }
    };
</script>


