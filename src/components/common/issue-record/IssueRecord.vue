<template>
    <el-dialog
        title="发放记录"
        custom-class="issue-record-dialog"
        :visible.sync="recordModalInfo.visible"
        width="1000px"
        :destroy-on-close="true"
        append-to-body
    >
        <el-table
            v-loading="loading"
            :data="tableData"
            ref="multipleTable" tooltip-effect="dark"
        >
            <el-table-column prop="coupon_title" label="优惠券名称" width="180px"></el-table-column>
            <el-table-column label="优惠券面额" width="100px">
                <template scope="scope">{{scope.row.coupon_type > 1 ? scope.row.coupon_amount / 10 : scope.row.coupon_amount / 100}} {{scope.row.coupon_type > 1 ? '折': '元' }}</template>
            </el-table-column>
            <el-table-column label="使用门槛" width="110">
                <template scope="scope">
                    <div v-if="scope.row.with_amount > 0 ">满{{scope.row.with_amount/100}}元可用</div>
                    <div v-else>无门槛</div>
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="发放时间" width="170"></el-table-column>
            <el-table-column prop="remark" label="发放说明" width="150"></el-table-column>
            <el-table-column prop="remark" label="发放用户名单">
                <template scope="scope">
                    <i class="el-icon-paperclip"></i>
                    {{scope.row.file_name}}
                </template>
            </el-table-column>
            <el-table-column prop="remark" label="" width="60">
                <template scope="scope">
                    <a class="down-mode" :href="scope.row.file_url">
                        <el-button type="text" class="marginLeft0">下载</el-button>
                    </a>
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
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageInfo.pageTotal"
                    @current-change="handlePageChange"
            ></el-pagination>
        </div>
    </el-dialog>
</template>
<script>
import './IssueRecord.less';
import { sendCouponsLog } from '../../../api/coupons.js';
import EmptyList from '../empty-list/EmptyList';
export default {
    name: 'IssueRecord',
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
                coupon_id: this.recordModalInfo.currentItem.id
            }
            const rLoading = this.openLoading();
            sendCouponsLog(params).then((res) => {
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
        handleDown(){},

    }
};
</script>