<template>
    <div class="role-container container-wrap">
        <div class="container container-table-no-search p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>角色管理</span>
                </div>
                <el-button type="primary" v-hasPermission="'role-create'" @click="handleCreateRole">新建角色</el-button>
            </div>

            <el-table v-loading="is_loading" :data="tableData" ref="multipleTable" :height="tableHeight">
                <el-table-column prop="name" label="角色名称"></el-table-column>
                <el-table-column prop="remark" label="描述"></el-table-column>
                <el-table-column label="操作" width="156">
                    <template slot-scope="scope">
                        <!-- <router-link :to="'/edit-role2/'+scope.row.id">
                            <el-button type="text">编辑</el-button>
                        </router-link>-->
                        <el-button type="text" class="marginRight32" v-hasPermission="'role-update'"
                                   @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" class="delete-color marginLeft0" v-hasPermission="'role-delete'"
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
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageInfo.pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>
<script>
import './RoleManagement.less';
import { getRoleList, deleteRole } from '../../../../api/role';
import EmptyList from '../../../common/empty-list/EmptyList';
import { deleteAuthority } from '../../../../api/authority';
export default {
    name: 'RoleManagement',
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
            tableHeight: 'calc(100% - 134px)'
        };
    },
    components:{
        EmptyList
    },
    created() {
        if(sessionStorage.getItem('roleManagementPage')){
            const page_num = Number(sessionStorage.getItem('roleManagementPage'));
            this.$set(this.pageInfo,'pageIndex', page_num);
        }
    },
    mounted() {
        // 请求数据
        this.getListData();
    },
    destroyed() {
        sessionStorage.removeItem('roleManagementPage');
    },
    methods: {
        // 请求-列表数据
        getListData() {
            this.loading = true;
            const request = {
                page: this.pageInfo.pageIndex || 1, // 页码
                limit: this.pageInfo.pageSize || 10
            };
            // ajax
            const rLoading = this.openLoading();
            getRoleList(request).then((res) => {
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
            }).catch(() => {});
        },

        // 按钮-删除
        handleDelete(index, row) {
            this.$confirm('确认要删除该角色吗？', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            }).then(() => {
                let params = {};
                params['role_id'] = row.id ;
                this.roleDelete(params);
            }).catch(() => {});
        },

        // 按钮-新建角色
        handleCreateRole() {
            // sessionStorage.setItem('roleManagementPage', this.pageInfo.pageIndex);
            this.$router.push({ path: '/role-create' });
        },

        // 按钮-编辑
        handleEdit(index, row) {  // role-update
            // sessionStorage.setItem('role_info', JSON.stringify(role_obj));
            sessionStorage.setItem('roleManagementPage', this.pageInfo.pageIndex);
            this.$router.push({ path: 'role-update',query: { id: row.id, name:row.name,remark:row.remark } });
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            this.getListData();
        },

        // 请求-删除角色
        roleDelete(params){
            const rLoading = this.openLoading();
            deleteRole(params).then(res => {
                rLoading.close();
                if(res.code === 200){
                    // 获取当前页码 以及当前页存在条数是否超过1条
                    // 如果当前页超过1条 删除后 页码不用改变
                    // 如果当前页只有1条时  删除后 如果当前页为1不变，否则页码-1
                    if(this.pageInfo.pageIndex > 1){
                        if(this.tableData.length < 2){
                            this.$set(this.pageInfo, 'pageIndex', this.pageInfo.pageIndex - 1);
                        }else {

                        }
                    }
                    this.$notify({
                        title: '删除成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    this.getListData();
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
    }
};
</script>