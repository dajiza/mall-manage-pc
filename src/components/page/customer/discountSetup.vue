<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">会员折扣配置</div>
            <el-button class="add-btn" type="primary" size="mini" v-hasPermission="'mall-backend-discount-create'" @click="creatDiscount">新增</el-button>
        </div>

        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="会员折扣" width="">
                <template slot-scope="scope">
                    <span>{{ commUtil.numberMul(Number(scope.row.discount_value), 0.1) }}折</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="160">
                <template slot-scope="scope">
                    <el-button class="text-blue btn-opt table-btn" type="text" size="" v-hasPermission="'mall-backend-discount-update'" @click="editDiscount(scope.row)">
                        编辑
                    </el-button>
                    <el-button class="text-red btn-opt table-btn" type="text" size="" v-hasPermission="'mall-backend-discount-delete'" @click="deleteDiscount(scope.row)">
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

        <!-- 设置会员 -->
        <el-dialog :visible.sync="dialogVisibleCreat" :title="dialogTitle + '会员折扣'" width="380px" @closed="closeDialog">
            <el-form class="form-creat" :inline="true" size="small" label-position="left">
                <el-form-item label="会员折扣" class="">
                    <el-input class="" placeholder="请输入" v-model="discountValue" style="width:250px"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="closeDialog">取 消</el-button>
                <el-button type="primary" @click="saveDiscount">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { creatDiscount, deleteDiscount, queryDiscountList, updateDiscount } from '@/api/discount'
import { formatMoney } from '@/plugin/tool'
import commUtil from '@/utils/commUtil'
export default {
    name: 'customer-list',
    data() {
        return {
            commUtil,
            list: null,
            total: 0,
            listLoading: false,
            shopList: [],
            listQuery: {
                page: 1,
                limit: 10
            },

            tableHeight: 'calc(100vh - 194px)',
            // 设置会员弹框
            dialogVisibleCreat: false,
            discountValue: '',
            dialogTitle: ''
        }
    },

    created() {},
    mounted() {
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = {}

            params['page_size'] = this.listQuery.limit
            params['page_index'] = this.listQuery.page

            queryDiscountList(params)
                .then(res => {
                    console.log('输出 ~ res', res)
                    this.list = res.data.list
                    this.total = res.data.total
                })
                .catch(err => {})
        },

        // 打开弹框
        openDialog() {
            this.dialogVisibleCreat = true
        },
        // 打开弹框
        closeDialog() {
            this.discountValue = ''
            this.discountId = ''
            this.dialogVisibleCreat = false
        },
        // 新增折扣
        creatDiscount() {
            this.dialogTitle = '新增'
            this.openDialog()
        },
        // 编辑折扣
        editDiscount(row) {
            this.discountValue = commUtil.numberMul(Number(row.discount_value), 0.1)
            this.discountId = row.id
            this.dialogTitle = '编辑'
            this.openDialog()
        },
        // 删除折扣
        deleteDiscount(row) {
            this.$confirm('确认要删除该折扣吗?', '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        id: row.id
                    }
                    deleteDiscount(params)
                        .then(res => {
                            console.log('GOOGLE: res', res)
                            if (res.code == 200) {
                                this.$notify({
                                    title: '折扣删除成功',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.closeDialog()
                                this.getList()
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
                })
                .catch(() => {})
        },
        // 创建/编辑折扣
        saveDiscount() {
            // 正则 0-10 最多两位小数
            var pattern = /^(?!0(\.0{1,2})?$)(\d(\.\d{1,2})?)$/
            let verify = pattern.test(this.discountValue)
            if (!verify) {
                this.$notify({
                    title: '请输入正确折扣',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            if (this.discountId) {
                // 编辑
                let params = {
                    value: Number(this.discountValue),
                    id: this.discountId
                }
                updateDiscount(params)
                    .then(res => {
                        console.log('GOOGLE: res', res)
                        if (res.code == 200) {
                            this.$notify({
                                title: '折扣编辑成功',
                                type: 'success',
                                duration: 3000
                            })
                            this.closeDialog()
                            this.getList()
                        } else {
                            this.$notify({
                                title: res.msg,
                                type: 'warning',
                                duration: 5000
                            })
                        }
                    })
                    .catch(err => {})
            } else {
                // 新建
                let params = {
                    value: Number(this.discountValue)
                }
                creatDiscount(params)
                    .then(res => {
                        console.log('GOOGLE: res', res)
                        if (res.code == 200) {
                            this.$notify({
                                title: '折扣创建成功',
                                type: 'success',
                                duration: 3000
                            })
                            this.closeDialog()
                            this.getList()
                        } else {
                            this.$notify({
                                title: res.msg,
                                type: 'warning',
                                duration: 5000
                            })
                        }
                    })
                    .catch(err => {})
            }
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.setSearchValue()
            this.getList()
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields()
            this.formFilter.consumption_min = ''
            this.formFilter.consumption_max = ''
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
.timg {
    width: 40px;
    height: 40px;
}
.add-btn {
    margin: 0 30px 0 auto;
}
.type-tag {
    // display: block;
    padding: 0 11px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    word-break: keep-all;
    font-weight: 400;
    line-height: 26px;
    &.type-red {
        background-color: #ff4d4f;
    }
    &.type-purple {
        background-color: #a151ff;
    }
    &.type-yellow {
        background-color: #faad14;
    }
}
.status {
    display: flex;
    align-items: center;
    .text-grey {
        color: rgba(0, 0, 0, 0.25);
    }
    .dot {
        display: block;
        margin-right: 8px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
    }
}
</style>
