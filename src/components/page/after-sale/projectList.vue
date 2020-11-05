<template>
    <div class="app-container">
        <div class="head-container">
            <span style="font-size:12px; padding-right:30px;">全部专题</span>
            <el-input class="filter-item" style="width: 200px;" @keyup.enter.native="handleFilter" placeholder="专题名称" v-model="title"></el-input>
            <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
            <el-button class="filter-item" size="mini" @click="newAt" type="primary" icon="el-icon-edit-outline">新建</el-button>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :header-cell-style="tableHeaderColor" element-loading-text="Loading" border fit highlight-current-row>
            <el-table-column label="名称" width="" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                </template>
            </el-table-column>
            <el-table-column label="封面图" align="center" width="">
                <template slot-scope="scope">
                    <img :src="scope.row.picture" alt="" class="fullimg" />
                </template>
            </el-table-column>
            <el-table-column label="板块" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.module.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="浏览数" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.visits }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="250">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click.native="edit(scope.row.id)">修改</el-button>
                    <el-button :type="scope.row.status ? 'success' : 'warning'" size="mini" @click.native="setStatus(scope.row, scope.$index)">{{ scope.row.status ? '已启用' : '已禁用' }}</el-button>
                    <el-button type="danger" size="mini" @click.native="del(scope.row.id, scope.$index)" :disabled="scope.row.isDelete">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page + 1" :page-sizes="[10, 20, 50, 100]" :page-size="listQuery.size" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
        </div>
    </div>
</template>
<script>
import { getProjectList, delProject, projectStatus } from '@/api/project'

export default {
    data() {
        return {
            list: null,
            date: '',
            total: 0,
            listLoading: false,
            listQuery: {
                page: 0,
                size: 10
            },
            title: '',
            companyLists: [],
            sellingLists: [
                {
                    value: true,
                    label: '在售'
                },
                {
                    value: false,
                    label: '下架'
                }
            ],
            status: [], //顶部数据一连串
            atlList: '' //选中的文章列表
        }
    },

    created() {
        this.getList()
    },
    methods: {
        //设置表头行的样式
        tableHeaderColor({ row, column, rowIndex, columnIndex }) {
            return 'font-size:12px;text-align:center;padding:2px 0;background:#f7f7f7;'
        },
        getList() {
            getProjectList(this.listQuery.page, this.listQuery.size, this.title)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.content
                    this.total = res.totalElements
                })
                .catch(err => {
                    // console.log(err.response.data.message)
                })
        },

        del(id, index) {
            this.$confirm('此操作将删除产品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                delProject(id)
                    .then(res => {
                        this.$notify({
                            title: '删除成功',
                            type: 'success',
                            duration: 2500
                        })
                        this.list.splice(index, 1)
                    })
                    .catch(err => {
                        // console.log(err.response.data.message)
                    })
            })
        },
        edit(id) {
            this.$router.push({
                // path: '/goods/goods_edit',
                name: 'projectAdd',
                query: {
                    id: id
                }
            })
        },
        // 设置上下架
        setStatus(row, index) {
            projectStatus(row.id, !row.status)
                .then(res => {
                    this.$set(this.list[index], 'status', !row.status)
                    this.$notify({
                        title: !row.status ? '禁用成功' : '启用成功',
                        type: 'success',
                        duration: 2500
                    })
                    // this.list.splice(index, 1)
                })
                .catch(err => {
                    // console.log(err.response.data.message)
                })
        },
        newAt() {
            this.$router.push({
                name: 'projectAdd'
            })
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 0
            this.getList()
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.size = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val - 1
            this.getList()
        }
    }
}
</script>
<style scoped="scoped">
.timg {
    width: 100px;
    height: 100px;
}

.tags {
    margin-bottom: 5px;
}
.filter-container {
    margin-bottom: 20px;
}
.filter-container .el-input {
    width: 200px;
    margin-right: 20px;
}
.topInfo .el-form-item {
    margin-right: 28px;
}
.fullimg {
    width: 120px;
}
</style>
