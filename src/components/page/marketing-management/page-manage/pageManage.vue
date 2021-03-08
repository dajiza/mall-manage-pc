<template>
    <div class="app-container goods-list">
        <div class="head-container">
            <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left">
                <el-form-item label="页面名称" prop="product_code" class="">
                    <el-input class="filter-item" v-model="formFilter.product_code" placeholder="请输入"></el-input>
                </el-form-item>

                <el-form-item label="创建时间" prop="searchTime" class="long-time">
                    <el-date-picker
                        class="filter-item"
                        v-model="formFilter.searchTime"
                        type="datetimerange"
                        range-separator="至"
                        align="left"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :default-time="['00:00:00', '23:59:59']"
                        :picker-options="pickerOptions"
                    >
                    </el-date-picker>
                </el-form-item>

                <el-form-item class="form-item-btn" label="">
                    <el-button class="filter-btn" @click="resetForm('formFilter')">重置</el-button>
                    <el-button class="filter-btn" type="primary" @click="handleFilter">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-title">
            <div class="line"></div>
            <div class="text">页面管理</div>
            <el-button type="primary" @click="pageCreat" class="creat-page" v-hasPermission="'mall-backend-goods-add'">新增商品</el-button>
        </div>
        <el-table :height="$tableHeight" class="table" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading">
            <el-table-column label="页面ID" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.product_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="页面名称">
                <template slot-scope="scope">
                    <span>{{ scope.row.product_code }}</span>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" width="300">
                <template slot-scope="scope">
                    <span>{{ scope.row.goods_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="126">
                <template slot-scope="scope">
                    <el-button class="text-blue btn-opt table-btn" type="text" size="">
                        编辑
                    </el-button>
                    <el-button class="text-red btn-opt table-btn" type="text" size="">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="listQuery.page"
                :page-size="listQuery.limit"
                layout="total, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </div>
    </div>
</template>

<script>
import { queryShopList } from '@/api/goods'
import { queryOrderReportSku } from '@/api/statistics'
import { formatMoney } from '@/plugin/tool'
// import { filter } from 'vue/types/umd';

export default {
    name: 'skuStatistics',
    data() {
        return {
            pageInfo: {
                pageIndex: 1,
                pageSize: 10
            },
            listLoading: false,
            loading: false,
            tableData: [],
            list: null,
            total: 0,
            listQuery: {
                page: 1,
                limit: 10
            },
            formFilter: {
                product_code: '',
                searchTime: '',
                created_time_le: '',
                created_time_ge: '',
                shop_id: ''
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            }
        }
    },

    mounted() {
        // 默认搜索一个月
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        let timeStart = start
        let timeEnd = end
        timeStart = this.$moment(timeStart).format('yyyy-MM-DD HH:mm:ss')
        timeEnd = this.$moment(timeEnd).format('yyyy-MM-DD HH:mm:ss')
        this.formFilter.searchTime = [timeStart, timeEnd]

        // 默认显示全部列表
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,

        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            if (params['searchTime'].length == 2) {
                params['created_time_ge'] = params.searchTime[0]
                params['created_time_le'] = params.searchTime[1]
            } else {
                params['created_time_ge'] = ''
                params['created_time_le'] = ''
            }
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryOrderReportSku(params)
                .then(res => {
                    if (res.data.lists == null) {
                        this.list = res.data.lists
                        return
                    }
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const element = res.data.lists[i]
                        element['goods_attr'] = JSON.parse(element['goods_attr'])
                        element['goods_attr'] = element['goods_attr'].map(item => item.Value)
                    }

                    this.list = res.data.lists
                    this.total = res.data.total
                })
                .catch(err => {})
        },
        pageCreat() {
            this.$router.push({
                path: 'mall-backend-page-creat'
            })
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleFilter()
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.tab-way {
    margin-left: auto;
}
.icon-open1 {
    margin: 0 30px;
    cursor: pointer;
}
.el-col {
    margin-top: 10px;
}

.creat-page {
    margin-right: 24px;
    margin-left: auto;
}

// .timg {
//     width: 80px;
//     height: 60px;
// }
// .shop-icon {
//     display: flex;
//     margin-left: 23px;
//     padding: 0 10px;
//     height: 30px;
//     border-radius: 15px;
//     background: #ffffff;
//     box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
//     font-weight: 500;
//     font-size: 14px;
//     line-height: 30px;
//     &.shop-all {
//         color: #1890ff;
//         text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
//         .icon-shop {
//             margin-right: 6px;
//         }
//     }
//     &.shop-filter {
//         color: rgba(0, 0, 0, 0.85);
//         text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
//         .shop-img {
//             margin-top: 5px;
//             margin-right: 6px;
//             width: 20px;
//             height: 20px;
//             border-radius: 10px;
//         }
//     }
// }
</style>
