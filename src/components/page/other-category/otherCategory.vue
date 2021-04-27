<template>
    <div class="product-category-page container-wrap">
        <div class="container container-table-no-search p-t-0">
            <div class="tab">
                <el-tabs v-model="type" tab-position="left" class="tabs" @tab-click="handleTabClick">
                    <el-tab-pane label="其他商品分类" name="1"></el-tab-pane>
                    <el-tab-pane label="布组分类" name="2"></el-tab-pane>
                </el-tabs>
            </div>
            <div class="content">
                <div class="global-table-title">
                    <el-button class="add-btn" type="primary" v-hasPermission="'mall-backend-other-category-create'" @click="handleCreateFather">
                        新增分类
                    </el-button>
                </div>
                <el-table
                    :data="tableData"
                    id="outTable"
                    class="table"
                    row-key="id"
                    style="width: 100%"
                    :height="tableHeight"
                    :header-cell-style="$tableHeaderColor"
                    @expand-change="getRowDataOut"
                    :expand-row-keys="expands"
                >
                    <el-table-column label="-" type="expand" width="60">
                        <template slot-scope="props">
                            <el-table class="sku-table" :data="props.row.son" row-key="id" :id="'innerTable' + props.row.id" :header-cell-style="$tableHeaderColor">
                                <el-table-column label="图片" width="140">
                                    <template slot-scope="scope">
                                        <img class="product-img" :src="getImg(scope.row.category_img)" alt="" @click="viewBigImg(scope.row.category_img)" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="分类名称">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.name }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="160" align="left">
                                    <template slot-scope="scope">
                                        <el-button
                                            type="text"
                                            class="marginRight32 m-l-0"
                                            v-hasPermission="'mall-backend-other-category-update'"
                                            @click="handleEdit(scope.$index, scope.row)"
                                            >编辑</el-button
                                        >
                                        <el-button
                                            type="text"
                                            class="delete-color m-l-0"
                                            v-hasPermission="'mall-backend-other-category-delete'"
                                            @click="handleDelete(scope.$index, scope.row)"
                                            >删除</el-button
                                        >
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>

                    <el-table-column label="分类名称" prop="display_name">
                        <template slot-scope="scope">
                            <span>{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="240" align="left">
                        <template slot-scope="scope">
                            <el-button type="text" class="marginRight32 m-l-0" v-hasPermission="'mall-backend-other-category-update'" @click="handleCreat(scope.$index, scope.row)">
                                新增下级
                            </el-button>
                            <el-button
                                type="text"
                                class="marginRight32 m-l-0"
                                v-hasPermission="'mall-backend-other-category-update'"
                                @click="handleEditFather(scope.$index, scope.row)"
                            >
                                编辑
                            </el-button>
                            <el-button type="text" class="delete-color m-l-0" v-hasPermission="'mall-backend-other-category-delete'" @click="handleDelete(scope.$index, scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                    <template slot="empty">
                        <EmptyList></EmptyList>
                    </template>
                </el-table>
                <!-- <div class="pagination-container">
                    <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :current-page="pageIndex"
                        :page-size="pageLimit"
                        :total="pageTotal"
                        @current-change="handlePageChange"
                    ></el-pagination>
                </div> -->
            </div>
        </div>

        <!-- 新增子类 弹出框 -->
        <el-dialog :title="formTitle" :visible.sync="editVisible" width="380px" :before-close="dialogClose" :destroy-on-close="true" :close-on-click-modal="false">
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
                        <img v-if="form.category_img" :src="form.category_img" class="avatar" />
                        <div v-else class="avatar-uploader-icon">
                            <div class="avatar-wrap">
                                <img src="../../../assets/img/Icon-Plus.svg" alt="" />
                            </div>
                            <span class="add-img-text">上传图片</span>
                        </div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="父级" prop="parent_id">
                    <el-select v-model="form.parent_id" placeholder="请选择" :disabled="cateData != null">
                        <el-option v-for="item in tableData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增父类 弹出框 -->
        <el-dialog
            :title="formTitleFather"
            :visible.sync="editVisibleFather"
            width="380px"
            :before-close="dialogCloseFather"
            :destroy-on-close="true"
            :close-on-click-modal="false"
        >
            <el-form ref="formFatherBox" :model="formFather" :rules="rulesFather" label-width="90px">
                <el-form-item label="类别名称:" prop="name">
                    <el-input placeholder="请输入" autofocus="autofocus" v-model="formFather.name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogCloseFather">取 消</el-button>
                <el-button type="primary" @click="saveEditFather">确 定</el-button>
            </span>
        </el-dialog>
        <!--大图预览-->
        <transition name="el-fade-in-linear">
            <el-image-viewer v-if="dialogVisible" :on-close="closeViewer" :url-list="imgSrcList" />
        </transition>
    </div>
</template>

<script>
import { addCategory, editCategory, deleteCategory, updateCategoryAsc } from '../../../api/otherCategory'
import { queryCategoryListAll } from '../../../api/goods'
import EmptyList from '../../common/empty-list/EmptyList'
import './otherCategory.less'
import ElImageViewer from '@/components/common/image-viewer'
import { getToken } from '../../../utils/auth'
import Sortable from 'sortablejs'
import { construct } from '@/utils/json-tree'
export default {
    name: 'otherCategory',
    data() {
        return {
            type: '1', //1 其他 2 成品布
            pageIndex: 1,
            pageLimit: 10,
            pageTotal: 0,
            loading: false,
            tableData: [],
            editVisible: false,
            form: {
                name: '', //max length =100
                category_img: '',
                parent_id: '' //0为最大分类
            },
            rules: {
                name: [
                    { required: true, message: '请输入类别名称', trigger: 'blur' },
                    { max: 100, message: '最多输入100个字符', trigger: 'blur' }
                ],
                cate: [{ required: true, message: '请选择', trigger: 'blur' }]
            },
            cateList: [
                { value: '1', label: '布料' },
                { value: '2', label: '其他' },
                { value: '3', label: '布组' }
            ],
            formTitle: '',
            // current_id: -1,
            tableHeight: 'calc(100% - 98px)',
            uploadImgUrl: '', //   图片上传地址
            back_img_url: '', //   上传后台返回图片地址（不完整）
            header: {},
            token: '',
            imageUrl: '', // 展示小图 （可访问，尺寸限制240）
            completeImageUrl: '', // 完整图片url（可访问，不加尺寸限制）
            dialogVisible: false,
            imgSrcList: [],
            expands: [],
            cateData: null, //编辑的分类数据
            // 添加父类
            editVisibleFather: false,
            formFather: {
                name: '',
                cate: ''
            },
            formTitleFather: '',
            rulesFather: {
                name: [
                    { required: true, message: '请输入类别名称', trigger: 'blur' },
                    { max: 100, message: '最多输入100个字符', trigger: 'blur' }
                ]
            },
            parentId: 0 //添加分类父类id 0为最大分类
        }
    },
    components: {
        EmptyList,
        ElImageViewer
    },
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.token = getToken()
        this.header['token'] = getToken()
    },
    mounted() {
        // 获取 分类列表数据
        this.getData()
        this.rowDrop()
    },
    computed: {
        //  拼接图片地址
        getImg: function() {
            return data => {
                if (data) {
                    return data + '!/fw/' + 80
                }
            }
        }
    },
    methods: {
        // 获取 分类列表数据
        getData() {
            let params = {
                type: Number(this.type) //1 其他 2 成品布
            }
            const rLoading = this.openLoading()
            queryCategoryListAll(params).then(res => {
                rLoading.close()
                if (res.code === 200) {
                    if (res.data) {
                        console.log('tableData', res.data)
                        // 结构化
                        let tableData = construct(res.data, {
                            id: 'id',
                            pid: 'parent_id',
                            children: 'son'
                        })
                        // 排序
                        for (let i = 0; i < tableData.length; i++) {
                            const item = tableData[i]
                            if (item.son) {
                                item.son.sort((a, b) => a.asc - b.asc)
                            }
                        }
                        tableData.sort((a, b) => a.asc - b.asc)
                        this.tableData = tableData
                    } else {
                        this.tableData = []
                    }
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    })
                }
            })
        },

        handleTabClick(tab, event) {
            console.log(tab, event)
            this.getData()
        },
        // 按钮-编辑分类/编辑下级 内表格
        handleCreat(index, row) {
            console.log('输出 ~ row', row)
            this.formTitle = this.type == 1 ? '新增二级分类-其他' : '新增二级分类-布组'
            this.editVisible = true
            this.form = {
                name: '', //max length =100
                category_img: '',
                parent_id: row.id //0为最大分类
            }
            this.cateData = null
        },
        // 按钮-新增分类 外表格
        handleCreateFather() {
            this.formTitleFather = this.type == 1 ? '新增分类-其他' : '新增分类-布组'
            this.editVisibleFather = true
            this.parentId = 0
            this.formFather.name = ''
            this.cateData = null
        },

        // 按钮-编辑分类/编辑下级 内表格
        handleEdit(index, row) {
            // this.current_id = row.id
            // this.completeImageUrl = row.category_img
            // this.imageUrl = this.completeImageUrl + '!/fw/200'
            this.formTitle = '编辑分类'
            this.editVisible = true
            this.form.name = row.name
            this.form.parent_id = row.parent_id
            this.form.category_img = row.category_img
            this.cateData = _.cloneDeep(row)
        },
        // 按钮-编辑分类/编辑下级 外表格
        handleEditFather(index, row) {
            // this.current_id = row.id
            // this.completeImageUrl = row.category_img
            // this.imageUrl = this.completeImageUrl + '!/fw/200'
            this.formTitleFather = '编辑分类'
            this.editVisibleFather = true
            this.formFather.name = row.name
            this.cateData = _.cloneDeep(row)
        },

        // 按钮-删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除该分类吗？', '', {
                customClass: 'message-delete',
                type: 'warning'
            })
                .then(() => {
                    let params = {}
                    params['id'] = row.id
                    this.categoryDelete(params)
                })
                .catch(() => {})
        },

        // 按钮-保存编辑 内表格
        saveEdit() {
            let request = {}
            this.$refs['formBox'].validate(valid => {
                if (valid) {
                    // 新增分类
                    if (this.form.category_img === '') {
                        this.$notify({
                            title: '请上传图片',
                            message: '',
                            type: 'error',
                            duration: 3000
                        })
                        return false
                    } else {
                        let asc = 0
                        for (let i = 0; i < this.tableData.length; i++) {
                            const item = this.tableData[i]
                            if (item.id == this.form.parent_id) {
                                asc = item.son ? item.son[item.son.length - 1].asc + 1 : 0
                                break
                            }
                        }

                        let params = {
                            name: this.form.name, //max length =100
                            category_img: this.form.category_img,
                            type: Number(this.type),
                            parent_id: this.form.parent_id,
                            asc: this.cateData ? this.cateData.asc : asc
                        }
                        if (this.formTitle !== '编辑分类') {
                            this.categoryAdd(params)
                        } else {
                            params['id'] = this.cateData.id
                            this.categoryEdit(params)
                        }
                    }
                } else {
                    this.$notify({
                        title: '请完整填写数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 3000
                    })
                }
            })
        },
        // 按钮-保存编辑 外表格
        saveEditFather() {
            this.$refs['formFatherBox'].validate(valid => {
                if (valid) {
                    // 新增分类
                    let asc = this.tableData[this.tableData.length - 1].asc + 1
                    let params = {
                        name: this.formFather.name,
                        type: Number(this.type), //1 其他 2 成品布
                        parent_id: this.parentId, //0为最大分类
                        asc: this.cateData ? this.cateData.asc : asc //排序 正序。前端实现排序  仅记录
                    }
                    if (this.formTitleFather !== '编辑分类') {
                        this.categoryAdd(params)
                    } else {
                        params['id'] = this.cateData.id
                        this.categoryEdit(params)
                    }
                } else {
                    this.$notify({
                        title: '请完整填写数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 3000
                    })
                }
            })
        },

        // 请求-新增分类
        categoryAdd(params) {
            const rLoading = this.openLoading()
            addCategory(params).then(res => {
                rLoading.close()
                if (res.code === 200) {
                    this.editVisibleFather = false
                    this.editVisible = false
                    this.$notify({
                        title: '添加成功',
                        message: '',
                        type: 'success',
                        duration: 1000
                    })
                    this.getData()
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    })
                }
            })
        },

        // 请求-编辑分类
        categoryEdit(params) {
            const rLoading = this.openLoading()
            editCategory(params).then(res => {
                rLoading.close()
                if (res.code === 200) {
                    this.editVisible = false
                    this.editVisibleFather = false
                    this.$notify({
                        title: '编辑成功',
                        message: '',
                        type: 'success',
                        duration: 1000
                    })
                    this.getData()
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    })
                }
            })
        },

        // 请求-删除分类
        categoryDelete(params) {
            const rLoading = this.openLoading()
            deleteCategory(params).then(res => {
                rLoading.close()
                if (res.code === 200) {
                    // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                    if (this.pageIndex > 1 && this.tableData.length < 2) {
                        this.pageIndex = this.pageIndex - 1
                    }
                    this.$notify({
                        title: '删除成功',
                        message: '',
                        type: 'success',
                        duration: 1000
                    })
                    this.getData()
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    })
                }
            })
        },

        // 弹框关闭前操作 子类
        dialogClose() {
            this.$refs['formBox'].clearValidate()
            this.$refs['formBox'].resetFields()
            this.editVisible = false
        },
        // 弹框关闭前操作 父类
        dialogCloseFather() {
            this.$refs['formFatherBox'].clearValidate()
            this.$refs['formFatherBox'].resetFields()
            this.editVisibleFather = false
        },

        // 图片上传成功
        handleAvatarSuccess(response, file) {
            // this.imageUrl = URL.createObjectURL(file.raw);
            this.uploadingTip.close()
            if (response.code === 200) {
                // this.back_img_url = response.data.file_url
                // this.completeImageUrl = response.data.file_url
                // this.imageUrl = response.data.file_url + '!/fw/200'
                // this.bigImgUrl = response.data.file_url + '!/fw/640'
                this.form.category_img = response.data.file_url
            } else {
                this.$notify({ title: response.msg, message: '', type: 'error', duration: 3000 })
            }
        },

        // 上传失败
        uploadError() {
            this.uploadingTip.close()
            this.$notify({ title: '上传失败', message: '', type: 'error', duration: 3000 })
        },
        // 图片上传前检测
        beforeAvatarUpload(file) {
            if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
                this.uploadingTip = this.uploadLoading('上传中')
            } else {
                this.$notify({
                    title: '图片格式只支持JPG、PNG',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
                return false
            }
        },
        handleRemove(file, fileList) {
            this.imageUrl = ''
            this.completeImageUrl = ''
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.pageIndex = val
            this.getData()
        },

        // 查看大图
        viewBigImg(pic_url) {
            if (pic_url) {
                this.bigImgUrl = pic_url + '!/fw/640'
                // this.$refs.bigImg.show();
                this.imgSrcList = []
                this.imgSrcList.push(this.bigImgUrl)
                this.dialogVisible = true
            }
        },

        // 关闭大图
        closeViewer() {
            this.dialogVisible = false
        },
        // 外表格-行拖动
        rowDrop() {
            const tbody = document.querySelector('#outTable .el-table__body-wrapper tbody')
            const that = this
            this.dropOut = Sortable.create(tbody, {
                onEnd({ newIndex, oldIndex }) {
                    const currRow = that.tableData.splice(oldIndex, 1)[0]
                    that.tableData.splice(newIndex, 0, currRow)

                    // 上传排序
                    let sort = that.tableData.map((e, index) => {
                        return { id: e.id, asc: index + 1 }
                    })
                    let params = {
                        data: sort
                    }
                    updateCategoryAsc(params).then(res => {
                        if (res.code === 200) {
                            that.$notify({
                                title: '排序成功',
                                message: '',
                                type: 'success',
                                duration: 1000
                            })
                        } else {
                            that.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 1000
                            })
                        }
                    })
                }
            })
        },
        // 内表格-行拖动
        async columnDropInner(id) {
            console.log('输出 ~ columnDropInner id', id)
            const innerTbody = document.querySelector(`#innerTable${id} .el-table__body-wrapper tbody`)
            console.log('输出 ~ innerTbody', innerTbody)
            const that = this
            this[`dropInner${id}`] = await Sortable.create(innerTbody, {
                // disabled: that.innerDisable,
                onEnd({ newIndex, oldIndex }) {
                    for (let i = 0; i < that.tableData.length; i++) {
                        const group = that.tableData[i]
                        if (group.id == id) {
                            const currRow = group.son.splice(oldIndex, 1)[0]
                            group.son.splice(newIndex, 0, currRow)

                            // 上传排序
                            let sort = group.son.map((e, index) => {
                                return { id: e.id, asc: index + 1 }
                            })
                            let params = {
                                data: sort
                            }
                            updateCategoryAsc(params).then(res => {
                                if (res.code === 200) {
                                    that.$notify({
                                        title: '排序成功',
                                        message: '',
                                        type: 'success',
                                        duration: 1000
                                    })
                                } else {
                                    that.$notify({
                                        title: res.msg,
                                        message: '',
                                        type: 'error',
                                        duration: 1000
                                    })
                                }
                            })
                        }
                    }
                }
            })
        },
        // 外表格-行监听事件-展开
        async getRowDataOut(row, expandedRows) {
            this.lectureSelectId = expandedRows.map(i => i.id)
            // 每次只打开一个expand
            if (expandedRows.length) {
                this.expands = []
                if (row) {
                    this.expands.push(row.id) // 每次push进去的是每行的ID
                }
            } else {
                this.expands = [] // 默认不展开
            }
            // 清除内表格拖动事件
            this.lectureSelectId.map(i => {
                if (this[`dropInner${i}`]) {
                    this[`dropInner${i}`].options.disabled = true
                }
            })
            // 绑定内表格拖动 开关外表格拖动
            if (expandedRows.length > 0) {
                expandedRows.shift()
                await this.$nextTick()
                this.columnDropInner(row.id)
                // this.lectureSelectId.map(i => {
                //     this.columnDropInner(i)
                // })
                this.dropOut.options.disabled = true
            } else if (expandedRows.length == 0) {
                this.dropOut.options.disabled = false
            }
        }
    }
}
</script>
