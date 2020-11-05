<template>
    <div class="author-container container-wrap">
        <div class="container container-table-no-search p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>权限管理</span>
                </div>
                <el-button type="primary" v-hasPermission="'permission-create'" @click="handleCreateAuthority">新建权限</el-button>
            </div>
            <el-table
                    :data="tableData"
                    style="width: 100%"
                    :row-key="getRowKeys"
                    :expand-row-keys="expands"
                    :height="tableHeight"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
                <el-table-column label="权限名称" prop="display_name">
                    <template slot-scope="scope">
                        <span v-if="scope.row.level !== 1" class="child-line marginRight10">|——</span>
                        <span>{{scope.row.display_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="别名"></el-table-column>
                <el-table-column prop="route_url" label="路由"></el-table-column>
                <el-table-column label="操作" width="240" align="left">
                    <template slot-scope="scope">
                        <div style="display: inline-block" v-hasPermission="'permission-create'">
                            <el-button
                                    type="text"
                                    class="marginRight32"
                                    v-show="scope.row.children"
                                    @click="addSubCategories( scope.$index, scope.row)"
                            >新增下级</el-button>
                        </div>
                        <el-button type="text" class="marginRight32 m-l-0" v-hasPermission="'permission-update'" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" class="delete-color m-l-0" v-hasPermission="'permission-delete'" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
                <template  slot="empty" >
                    <EmptyList></EmptyList>
                </template>
            </el-table>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="formTitle" :visible.sync="editVisible" width="380px"
                   :before-close="dialogClose" :destroy-on-close="true"
                   :close-on-click-modal="false">
            <el-form ref="formBox" :model="form" :rules="rules">
                <el-form-item label="父级:" prop="pid" v-if="parentsCategoryShow">
                    <el-select v-model="form.pid" placeholder="请选择" class="handle-select">
                        <el-option v-for="state in categoryOptions" :key="state.key" :value="state.key" :label="state.name" />
                    </el-select>
                </el-form-item>
                <el-form-item label="别名" prop="name">
                    <el-input v-model="form.name" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="路由" prop="route_url">
                    <el-input v-model="form.route_url" placeholder="请输入"></el-input>
                    <span class="router-message">如果是路由要绝对路径哦,例如/main/index</span>
                </el-form-item>

                <el-form-item label="权限名称" prop="display_name">
                    <el-input
                            v-model="form.display_name"
                            placeholder="请输入"
                    ></el-input>
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
    import {getAuthorityList, addAuthority, editAuthority, deleteAuthority} from '../../../../api/authority';
    import './AuthorityManagement.less';
    import EmptyList from '../../../common/empty-list/EmptyList';
    export default {
        name: 'AuthorityManagement',
        data() {
            return {
                loading: false,
                tableData: [],
                editVisible: false,
                form: {
                    name: '',
                    pid:'',
                    route_url:'',
                    display_name:''
                },
                rules: {
                    pid: [{ required: true, message: '请选择父级', trigger: 'change' }],
                    name: [{ required: true, message: '请输入别名', trigger: 'blur' }],
                    route_url: [],
                    display_name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
                },
                parentsCategoryShow:false,  // 弹框内 父级分类 是否显示
                idx: -1,
                id: -1,
                categoryOptions: [],
                parentsCategory: '',
                formTitle: '',
                getRowKeys(row) {
                    return row.id;
                },
                expands: [],
                listData:[],
                current_level:1,
                current_id:-1,
                tableHeight: 'calc(100% - 84px)'
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
            // 获取 权限列表数据
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
                    let findIndex = data.findIndex( (item) => item.id === ev.pid);
                    if ((!ev.pid && ev.pid !== 0 && ev.pid !== false) || findIndex === -1) {
                        dealOptions.push(ev);
                    } else {
                        data[findIndex].children.push(ev);
                    }
                })
                return dealOptions
            },

            // 获取 权限列表数据
            getData() {
                let params = {
                    page: 1,
                    limit: 9999
                };
                const rLoading = this.openLoading();
                getAuthorityList(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        if(res.data.lists){
                            this.listData = res.data.lists;
                            this.tableData = this.processData(res.data.lists);
                        }else {
                            this.listData = [];
                            this.tableData = [];
                        }
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 按钮-新增权限
            handleCreateAuthority() {
                this.formTitle = '新增权限';
                this.parentsCategoryShow = false;
                this.editVisible = true;
                this.$nextTick(()=>{
                    let new_obj = {};
                    // const _obj = JSON.parse(JSON.stringify(row));
                    new_obj['name'] = '';
                    new_obj['route_url'] = '';
                    new_obj['display_name'] = '';
                    // 触发更新
                    this.form = Object.assign({}, this.form,new_obj);
                })
            },

            // 按钮-编辑权限/编辑下级
            handleEdit(index, row) {
                this.idx = index;
                this.current_id = row.id;
                this.current_level = row.level;
                if (row.level > 1) {
                    this.formTitle = '编辑下级';
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
                    this.formTitle = '编辑权限';
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
                this.$confirm('确定要删除该权限吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning',
                    center: true
                }).then(() => {
                    let params = {};
                    // 判断 节点下是否有子节点
                    if(row.children.length > 0){
                        let idsArr = [];
                        idsArr.push(row.id);
                        const ids = this.getIds(row.children, idsArr);
                        params['ids'] = ids.join();
                    }else {
                        params['ids'] = row.id.toString();
                    }
                    this.authorityDelete(params);
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
                    new_obj['pid'] = row.id;
                    new_obj['name'] = '';
                    new_obj['route_url'] = '';
                    new_obj['display_name'] = '';
                    // 触发更新
                    this.form = Object.assign({}, this.form,new_obj);
                })
            },

            // 按钮-保存编辑
            saveEdit() {
                let request = {};
                this.$refs['formBox'].validate(valid => {
                    if (valid) {
                        // 新增权限
                        request['name'] = this.form.name;
                        request['display_name'] = this.form.display_name;
                        request['route_url'] = this.form.route_url;
                        if (this.formTitle === '新增权限') {
                            request['level'] = 1;
                            request['pid'] = 0;
                            this.authorityAdd(request);
                        }else if(this.formTitle === '新增下级'){
                            request['level'] = Number(this.current_level + 1);
                            request['pid'] = this.form.pid;
                            this.authorityAdd(request);
                        }else if(this.formTitle === '编辑权限'){
                            request['level'] = this.current_level;
                            request['pid'] = this.form.pid;
                            request['id'] = this.current_id;
                            // 请求-编辑
                            this.authorityEdit(request);
                        }else if(this.formTitle === '编辑下级'){
                            request['level'] = this.current_level;
                            request['pid'] = this.form.pid;
                            request['id'] = this.current_id;
                            this.authorityEdit(request);
                        }
                    } else {
                        return false;
                    }
                });
            },

            // 请求-新增权限
            authorityAdd(params){
                const rLoading = this.openLoading();
                addAuthority(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        this.editVisible = false;
                        this.$notify({
                            title: '添加成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.getData();
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 请求-编辑权限
            authorityEdit(params){
                const rLoading = this.openLoading();
                editAuthority(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        this.editVisible = false;
                        this.$notify({
                            title: '编辑成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.getData();
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 请求-删除权限
            authorityDelete(params){
                const rLoading = this.openLoading();
                deleteAuthority(params).then(res => {
                    rLoading.close();
                    if(res.code === 200){
                        this.$notify({
                            title: '删除成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.getData();
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 弹框关闭前操作
            dialogClose(){
                this.$refs['formBox'].clearValidate();
                this.$refs['formBox'].resetFields();
                this.editVisible = false;
            },

            // 填充父级下拉框数据
            setParentsOptions(data){
                this.categoryOptions = [];
                data.forEach((ev,i)=>{
                    this.categoryOptions.push({
                        key: ev.id,
                        name: ev.display_name
                    })
                });
            },

        }
    };
</script>


