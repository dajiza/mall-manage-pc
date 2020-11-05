<template>
    <div class="product-category-page container-wrap">
        <div class="container container-table-no-search p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>产品分类</span>
                </div>
                <el-button type="primary" v-hasPermission="'category-add'" @click="handleCreateAuthority">新增大类</el-button>
            </div>
            <el-table
                    :data="tableData"
                    style="width: 100%"
                    :row-key="getRowKeys"
                    :expand-row-keys="expands"
                    :height="tableHeight"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
                <el-table-column label="分类名称" prop="display_name">
                    <template slot-scope="scope">
                        <span v-if="scope.row.level > 0" class="child-line marginRight10">|——</span>
                        <span>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="240" align="left">
                    <template slot-scope="scope">
                        <div style="display: inline-block" v-hasPermission="'category-add'">
                            <el-button
                                    type="text"
                                    class="marginRight32"
                                    v-show="scope.row.children"
                                    @click="addSubCategories( scope.$index, scope.row)"
                            >新增下级</el-button>
                        </div>
                        <el-button type="text" class="marginRight32 m-l-0" v-hasPermission="'category-edit'"
                                   @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" class="delete-color m-l-0" v-hasPermission="'category-del'"
                                   @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
                <template  slot="empty" >
                    <EmptyList></EmptyList>
                </template>
            </el-table>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="formTitle" :visible.sync="editVisible" width="380px"
                   :before-close="dialogClose" :destroy-on-close="true" :close-on-click-modal="false">
            <el-form ref="formBox" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="类别名称:" prop="name">
                    <el-input placeholder="请输入" autofocus="autofocus" v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="父级:" prop="parent_id" v-if="parentsCategoryShow">
                    <el-select v-model="form.parent_id" placeholder="请选择" class="handle-select">
                        <el-option v-for="state in parentsOptions" :key="state.key" :value="state.key" :label="state.name" />
                    </el-select>
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
    import {getCategoryList, addCategory, editCategory, deleteCategory} from '../../../../api/productCategory';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import './ProductCategory.less';
    export default {
        name: 'productCategory',
        data() {
            return {
                loading: false,
                tableData: [],
                editVisible: false,
                form: {
                    name: '',
                    parent_id:''
                },
                rules: {
                    parent_id: [{ required: true, message: '请选择父级', trigger: 'change' }],
                    name: [
                        { required: true, message: '请输入类别名称', trigger: 'blur' },
                        { max: 50, message: '最多输入50个字符', trigger: 'blur' }
                    ]
                },
                parentsCategoryShow:false,  // 弹框内 父级分类 是否显示
                idx: -1,
                id: -1,
                parentsOptions: [],
                parentsCategory: '',
                formTitle: '',
                getRowKeys(row) {
                    return row.id;
                },
                expands: [],
                listData:[],
                current_level:-1,
                current_id:-1,
                tableHeight: 'calc(100% - 62px - 26px)'
            };
        },
        components:{
            EmptyList
        },
        created() {
        },
        mounted() {
            // 控制对应id 行 展开
            // this.expands.push('1');
            // 获取 分类列表数据
            this.getData();
        },
        methods: {
            // 格式化数据
            processData(data){
                let dealOptions = []
                // 给每个数据加children属性
                data.forEach((ev, one) => {
                    ev.children = []
                })
                data.forEach((ev, one) => {
                    let findIndex = data.findIndex( (item) => item.id === ev.parent_id);
                    if ((!ev.parent_id && ev.parent_id !== 0 && ev.parent_id !== false) || findIndex === -1) {
                        dealOptions.push(ev);
                    } else {
                        data[findIndex].children.push(ev);
                    }
                })
                return dealOptions
            },

            // 获取 分类列表数据
            getData() {
                let params = {
                    page: 1,
                    limit: 9999
                };
                const rLoading = this.openLoading();
                getCategoryList(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        if(res.data){
                            this.listData = res.data;
                            this.tableData = this.processData(res.data);
                        }else {
                            this.listData = [];
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
                this.formTitle = '新增大类';
                this.parentsCategoryShow = false;
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
                this.idx = index;
                this.current_id = row.id;
                this.current_level = row.level;
                if (row.level > 0) {
                    this.formTitle = '编辑';
                    this.parentsCategoryShow = true;
                    // 把和当前元素父级level相同的找出组成数组，赋值给下拉选择框
                    let new_arr = [];
                    this.listData.forEach((e,i)=>{
                        if(e.level === row.level -1){
                            new_arr.push(e);
                        }
                    })
                    // 设置父级下拉框数据
                    this.setParentsOptions(new_arr);
                } else {
                    this.formTitle = '编辑';
                    this.parentsCategoryShow = false;
                }
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
                    // 判断 节点下是否有子节点
                    if(row.children.length > 0){
                        this.$notify({
                            title: '请先删除下级分类',
                            message: '',
                            type: 'error',
                            duration: 1000
                        });
                    }else {
                        params['id'] = row.id;
                        this.categoryDelete(params);
                    }

                }).catch(() => {});
            },

            // 获取嵌套数组下所有id
            getIds(arr, newArr){
                newArr = newArr || [];
                arr.forEach(item => {
                    // (item.id || item.id === 0) && newArr.push(item.id);
                    // item.children && this.getIds(item.children, newArr)
                    newArr.push(item.id);
                    if(item.children.length > 0){
                        newArr.push(item.id);
                        this.getIds(item.children, newArr)
                    }
                })
                return newArr;
            },

            // 按钮-新增下级
            addSubCategories( index, row) {
                this.parentsCategoryShow = true;
                this.current_level = row.level;
                this.formTitle = '新增下级';
                this.idx = index;
                // 把和当前元素level相同的找出组成数组，赋值给下拉选择框
                let new_arr = [];
                this.listData.forEach((e,i)=>{
                    if(e.level === row.level){
                        new_arr.push(e);
                    }
                })
                // 设置父级下拉框数据
                this.setParentsOptions(new_arr);
                this.editVisible = true;
                this.$nextTick(()=>{
                    let new_obj = {};
                    // const _obj = JSON.parse(JSON.stringify(row));
                    new_obj['parent_id'] = row.id;
                    new_obj['name'] = '';
                    // 触发更新
                    this.form = Object.assign({}, this.form,new_obj);
                })
            },

            // 按钮-保存编辑
            saveEdit() {
                let request = {};
                this.$refs['formBox'].validate(valid => {
                    if (valid) {
                        // 新增分类
                        request['name'] = this.form.name;
                        if (this.formTitle === '新增大类') {
                            request['level'] = 0;
                            request['parent_id'] = 0;
                            this.categoryAdd(request);
                        }else if(this.formTitle === '新增下级'){
                            request['level'] = Number(this.current_level + 1);
                            request['parent_id'] = this.form.parent_id;
                            this.categoryAdd(request);
                        }else if(this.formTitle === '编辑' && this.parentsCategoryShow){
                            request['level'] = this.current_level;
                            request['parent_id'] = this.form.parent_id;
                            request['id'] = this.current_id;
                            // 请求-编辑
                            this.categoryEdit(request);
                        }else if(this.formTitle === '编辑' && !this.parentsCategoryShow){
                            request['level'] = this.current_level;
                            request['parent_id'] = this.form.parent_id;
                            request['id'] = this.current_id;
                            this.categoryEdit(request);
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

            // 填充父级下拉框数据
            setParentsOptions(data){
                this.parentsOptions = [];
                data.forEach((ev,i)=>{
                    this.parentsOptions.push({
                        key: ev.id,
                        name: ev.name
                    })
                });
            },

        }
    };
</script>


