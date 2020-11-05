<template>
    <el-dialog
        title="操作记录"
        custom-class="operation-record-dialog"
        :visible.sync="recordModalInfo.visible"
        width="808px"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        append-to-body
    >
        <el-form :inline="true">
            <el-form-item label="产品编号:">{{recordModalInfo.currentItem.product_code}}</el-form-item>
            <el-form-item label="货架编码:">{{recordModalInfo.currentItem.shelf_code}}</el-form-item>
        </el-form>
        <el-table v-loading="loading"
                  :data="tableData"
                  ref="multipleTable" tooltip-effect="dark"
        >
            <el-table-column prop="user_name" label="操作员" width="100px"></el-table-column>
            <el-table-column prop="operationType" label="操作类型" width="100px">
                <template scope="scope">{{scope.row.num > 0 ? '加库存':'减库存'}}</template>
            </el-table-column>
            <el-table-column prop="num" label="数量" width="100px">
                <template scope="scope">{{scope.row.num > 0 ? scope.row.num: -scope.row.num}}</template>
            </el-table-column>
            <el-table-column prop="new_num" label="操作后数量" width="100px"></el-table-column>
            <el-table-column prop="reason_name" label="理由"></el-table-column>
            <el-table-column prop="remark" label="备注"></el-table-column>
            <template slot="empty">
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
                    hide-on-single-page="hide-on-single-page"
                    @current-change="handlePageChange"
            ></el-pagination>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleCloseRecordModal">取 消</el-button>
            <el-button type="primary" @click="handleSureRecordModal">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import './OperationRecord.less';
import { getGoodDetailLogList } from '../../../api/productList';
import EmptyList from '../empty-list/EmptyList';
export default {
    name: 'OperationRecord',
    props: ['recordModalInfo'],
    data() {
        return {
            tableData: [],
            loading: false,
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 5,
                pageTotal: 0
            },
        };
    },
    components: {
        EmptyList
    },
    created() {
    },
    mounted() {
        this.getList();
    },
    methods: {
        //操作记录弹出关闭
        handleCloseRecordModal() {
            this.$emit('handleCloseRecordModal', false);
        },
        //操作记录弹出确定
        handleSureRecordModal() {
            this.$emit('handleSureRecordModal', false);
        },
        handlePageChange(val){
            this.$set(this.pageInfo, 'pageIndex', val);
            this.getList();
            // ajax
        },
        // 请求 - 操作记录列表
        getList(){
            const params ={
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                product_detail_id: this.recordModalInfo.currentItem.id
            }
            // getGoodDetailLogList
            const rLoading = this.openLoading();
            getGoodDetailLogList(params).then((res) => {
                rLoading.close();
                if (res.code === 200){
                    this.tableData = res.data.lists || [];
                    this.$set(this.pageInfo, 'pageTotal', res.data.total);
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


    }
};
</script>