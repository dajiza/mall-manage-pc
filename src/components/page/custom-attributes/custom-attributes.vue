<template>
    <div class="product-category-page container-wrap">
        <div class="container container-table-no-search p-t-0">
            <!-- <div class="global-table-title"> -->
            <!-- <div class="title">
                    <i></i>
                    <span>自定义属性</span>
                </div> -->
            <div class="tabs-and-add">
                <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <el-tab-pane label="可修改" name="change"></el-tab-pane>
                    <el-tab-pane label="不可修改" name="unchange"></el-tab-pane>
                </el-tabs>
                <div>
                    <el-button
                        class="btn-add"
                        type="primary"
                        v-hasPermission="'mall-backend-consume-attr-create'"
                        @click="handleCreateAuthority"
                        v-if="activeName == 'change'"
                    >
                        新增属性
                    </el-button>
                </div>
            </div>
            <!-- </div> -->
            <el-table :data="tableData" style="width: 100%">
                <el-table-column label="自定义属性名称">
                    <template slot-scope="scope">
                        <span>{{ scope.row.title }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="left">
                    <template slot-scope="scope" v-if="scope.row.is_edit == 1">
                        <el-button
                            type="text"
                            class="marginRight32 m-l-0"
                            v-hasPermission="'mall-backend-consume-attr-update'"
                            @click="handleEdit(scope.$index, scope.row)"
                            >编辑</el-button
                        >
                        <el-button
                            type="text"
                            class="delete-color m-l-0"
                            v-hasPermission="'mall-backend-consume-attr-delete'"
                            @click="handleDelete(scope.$index, scope.row)"
                            >删除</el-button
                        >
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
                    :current-page="pageIndex"
                    :page-size="pageLimit"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog
            :title="formTitle"
            :visible.sync="editVisible"
            width="380px"
            :before-close="dialogClose"
            :destroy-on-close="true"
            :close-on-click-modal="false"
        >
            <el-form ref="formBox" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="属性名称:" prop="title">
                    <el-input placeholder="请输入" autofocus="autofocus" v-model="form.title"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { queryCustomAttrList, addCustomAttr, editCustomAttr, deleteCustomAttr } from '../../../api/customAttributes';
import EmptyList from '../../common/empty-list/EmptyList';
import './custom-attributes.less';
export default {
    name: 'customAttributes',
    data() {
        return {
            activeName: 'change',
            pageIndex: 1,
            pageLimit: 10,
            pageTotal: 0,
            loading: false,
            tableData: [],
            editVisible: false,
            form: {
                title: ''
            },
            rules: {
                title: [
                    { required: true, message: '请输入类别名称', trigger: 'blur' },
                    { max: 100, message: '最多输入100个字符', trigger: 'blur' }
                ]
            },
            formTitle: '',
            current_id: -1,
            tableHeight: 'calc(100% - 62px - 26px)'
        };
    },
    components: {
        EmptyList
    },
    created() {},
    mounted() {
        // 获取 属性列表数据
        this.getData();
    },
    methods: {
        // 获取 属性列表数据
        getData() {
            //是否可以修改删除1 可以 2不可以
            let is_edit = this.activeName == 'change' ? 1 : 2;
            let params = {
                page: this.pageIndex,
                limit: this.pageLimit,
                is_edit: is_edit
            };
            const rLoading = this.openLoading();
            queryCustomAttrList(params).then(res => {
                rLoading.close();
                if (res.code === 200) {
                    if (res.data) {
                        console.log('tableData', res.data);
                        this.tableData = res.data.lists;
                        this.pageTotal = res.data.total;
                    } else {
                        this.tableData = [];
                    }
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    });
                }
            });
        },

        // 按钮-新增属性
        handleCreateAuthority() {
            this.formTitle = '新增属性';
            this.editVisible = true;
            this.$nextTick(() => {
                let new_obj = {};
                new_obj['title'] = '';
                // 触发更新
                this.form = Object.assign({}, this.form, new_obj);
            });
        },

        // 按钮-编辑
        handleEdit(index, row) {
            this.current_id = row.id;
            this.formTitle = '编辑属性';
            this.editVisible = true;
            this.$nextTick(() => {
                const new_obj = JSON.parse(JSON.stringify(row));
                // 触发更新
                this.form = Object.assign({}, this.form, new_obj);
            });
        },

        // 按钮-删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除该属性吗？', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            })
                .then(() => {
                    let params = {};
                    params['id'] = row.id;
                    this.categoryDelete(params);
                })
                .catch(() => {});
        },

        // 按钮-保存编辑
        saveEdit() {
            let request = {};
            this.$refs['formBox'].validate(valid => {
                if (valid) {
                    // 新增属性
                    request['title'] = this.form.title;
                    if (this.formTitle === '新增属性') {
                        this.categoryAdd(request);
                    } else {
                        request['id'] = this.current_id;
                        this.categoryEdit(request);
                    }
                } else {
                    return false;
                }
            });
        },

        // 请求-新增属性
        categoryAdd(params) {
            const rLoading = this.openLoading();
            addCustomAttr(params).then(res => {
                rLoading.close();
                if (res.code === 200) {
                    this.editVisible = false;
                    this.$notify({
                        title: '添加成功',
                        message: '',
                        type: 'success',
                        duration: 1000
                    });
                    this.getData();
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    });
                }
            });
        },

        // 请求-编辑属性
        categoryEdit(params) {
            const rLoading = this.openLoading();
            editCustomAttr(params).then(res => {
                rLoading.close();
                if (res.code === 200) {
                    this.editVisible = false;
                    this.$notify({
                        title: '编辑成功',
                        message: '',
                        type: 'success',
                        duration: 1000
                    });
                    this.getData();
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    });
                }
            });
        },

        // 请求-删除属性
        categoryDelete(params) {
            const rLoading = this.openLoading();
            deleteCustomAttr(params).then(res => {
                rLoading.close();
                if (res.code === 200) {
                    // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                    if (this.pageIndex > 1 && this.tableData.length < 2) {
                        this.pageIndex = this.pageIndex - 1;
                    }
                    this.$notify({
                        title: '删除成功',
                        message: '',
                        type: 'success',
                        duration: 1000
                    });
                    this.getData();
                } else {
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
        dialogClose() {
            this.$refs['formBox'].clearValidate();
            this.$refs['formBox'].resetFields();
            this.editVisible = false;
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.pageIndex = val;
            this.getData();
        },
        // 按钮-切换列表
        handleTabClick(tab, event) {
            console.log('输出 ~ tab, event', tab, event);
            this.pageIndex = 1;
            // this.selectedType = Number(tab.index);
            // this.configLabel = tab.label;
            // if (tab.label === '修改运费理由') {
            //     this.selectedType = 6;
            //     this.configLabel = '修改运费理由';
            // }
            this.getData();
        }
    }
};
</script>
