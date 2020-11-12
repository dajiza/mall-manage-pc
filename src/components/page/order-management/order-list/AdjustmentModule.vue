<template>
    <el-dialog
        :title="'共需要 ' + recordModalInfo.need_num + ' ' + recordModalInfo.product_unit +'，请在下方的货物中选配'"
        custom-class="manual-adjust-dialog"
        :visible.sync="recordModalInfo.visible"
        width="1040px"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        append-to-body
    >
        <el-table v-loading="loading"
                  :data="tableData"
                  ref="multipleTable" tooltip-effect="dark"
        >
            <el-table-column prop="detail_code" label="货物编码"></el-table-column>
            <el-table-column prop="shelf_code" label="货架编码"></el-table-column>
            <el-table-column label="总库存" width="100">
                <template slot-scope="scope">{{scope.row.stock_total}}{{recordModalInfo.product_unit}}</template>
            </el-table-column>
            <el-table-column label="待出库库存" width="100">
                <template slot-scope="scope">{{scope.row.stock_locked}}{{recordModalInfo.product_unit}}</template>
            </el-table-column>
            <el-table-column label="可用库存" width="100">
                <template slot-scope="scope">{{scope.row.stock_available}}{{recordModalInfo.product_unit}}</template>
            </el-table-column>
            <el-table-column prop="created_time" label="创建时间" width="180"></el-table-column>
            <el-table-column label="选配数量" width="200">
                <template slot-scope="scope">
                    <!--<el-input :disabled="scope.row.stock_available === 0" class="parameter-input" placeholder="请输入"
                              v-model.number="scope.row.select_num" @mousewheel.native.prevent></el-input>-->
                    <el-input :disabled="scope.row.stock_available === 0" placeholder="请输入"  v-model.number="scope.row.select_num"
                            onKeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" type="number" @input="numChange(scope.$index, scope.row)"></el-input>
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
                    :total="pageTotal"
                    @current-change="handlePageChange"
            ></el-pagination>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleOnlySure">仅确定</el-button>
            <el-button type="primary" @click="handleSureRecordModal">确定并打印</el-button>
        </span>
        <div class="print-A5-page">
            <div id="printMe" ref="print" style="width: 100%;margin: 0 auto;background: #fff;box-sizing: border-box;">
                <div style="page-break-after:always;width: 100%;" v-for="(item,i) in printInfo" :key="item.id">
                    <div style="width: 100%;padding-top: 10px;">
                        <div style="width: 100%;box-sizing: border-box;-webkit-box-sizing: border-box;font-size: 14px;padding: 5px 0 10px;">
                            <span style="margin-right: 10px">订单号：{{item.order_no}} </span>
                            <span style="margin-right: 10px">产品编码：{{item.product_code}}</span>
                            <span>共需要 {{item.order_num}}{{item.unit}}</span>
                        </div>
                        <table headerRows='1' style="width: 100% !important;border-color: rgba(0,0,0,1);border-collapse:collapse;font-size: 12px">
                            <thead>
                            <tr>
                                <th style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">货物编码</th>
                                <th style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">货架编码</th>
                                <th style="width: 20%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">选配数量</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="(goods_item,i) in item.detail" :key="i">
                                <td style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.detail_code}}</td>
                                <td style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                    {{goods_item.shelf_code}}</td>
                                <td style="width: 20%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                    {{goods_item.num}}{{item.unit}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>
<script>
// import './OperationRecord.less';
// import { getGoodsList } from '../../../../api/productList';
import { getOrderErrProcess } from '../../../../api/orderList';
import EmptyList from '../../../common/empty-list/EmptyList';
export default {
    name: 'adjustmentModule',
    props: ['recordModalInfo'],
    data() {
        const checkNum = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请输入选配数量'));
            }
            setTimeout(() => {
                if (!Number.isInteger(value)) {
                    callback(new Error('请输入数字值'));
                } else {
                    if (value > this.stockModalInfo.currentItem.stock_available) {
                        callback(new Error('减少数量不可大于可用库存'));
                    } else {
                        callback();
                    }
                }
            }, 10);
        };
        return {
            tableData: [],
            loading: false,
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 5,
            },
            pageTotal: 0,
            stockForm: {
                change_num: '',
            },
            stockRules:{
                // change_num:{ validator: checkNum, trigger: ['blur','change'] },
            },
            all_select_num:0,
            data_all:[],
            sure_print:false,
            printInfo:[]
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
        // 仅确定
        handleOnlySure() {
            let selected_goods_arr = [];
            let all_selected_num = 0;
            this.data_all.forEach((ev)=>{
                ev.list.forEach((item)=>{
                    if(item.select_num > 0){
                        selected_goods_arr.push(item);
                        all_selected_num = all_selected_num + Number(item.select_num);
                    }
                })
            })
            if(Number(all_selected_num) !== Number(this.recordModalInfo.need_num)){
                this.$notify({
                    title: '选配总数与所需要的数量不符，请重新选配。',
                    message: '',
                    type: 'error',
                    duration: 5000
                });
            }else {
                let params = {};
                let select_obj = [];
                selected_goods_arr.forEach((item)=>{
                    let obj = {};
                    obj['product_detail_id'] = item.id;
                    obj['num'] = item.select_num;
                    obj['detail_code'] = item.detail_code;
                    obj['shelf_code'] = item.shelf_code;
                    obj['unit'] = item.product_data.attr_unit_name;
                    select_obj.push(obj);
                });
                params['order_detail_id'] = this.recordModalInfo.order_detail_id;
                params['data'] = select_obj;
                const rLoading = this.openLoading();
                getOrderErrProcess(params).then((res)=>{
                    rLoading.close();
                    if (res.code === 200){
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        if(this.sure_print){
                            let obj = {};
                            obj['product_code'] = this.recordModalInfo.product_code;
                            obj['order_no'] = this.recordModalInfo.order_no;
                            obj['order_num'] = this.recordModalInfo.need_num;
                            obj['detail'] = select_obj;
                            obj['unit'] = this.recordModalInfo.product_unit;
                            this.printInfo.push(obj);
                            setTimeout(()=>{
                                this.$print(this.$refs.print);
                                this.sure_print = false;
                                this.$emit('handleCloseRecordModal', false);
                            },50)
                        }else {
                            this.$emit('handleCloseRecordModal', false);
                        }
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(()=>{});
            }
        },
        // 确定并打印
        handleSureRecordModal() {
            this.printInfo = [];
            this.sure_print = true;
            this.handleOnlySure();
        },
        handlePageChange(val){
            this.$set(this.pageInfo, 'pageIndex', val);
            let new_arr = [];  // 当前页数据是否已存在
            new_arr = this.data_all.filter(value => value.page === val);
            if(new_arr.length < 1){
                this.getList();
            }else {
                this.tableData = new_arr[0].list;
            }
            // ajax
        },
        // 请求 - 可用货物列表
        getList(){
            const params ={
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                product_id: this.recordModalInfo.product_id,
                product_code: '',
                shelf_code:'',
                stock_available_le: -1, //不检索传-1
                stock_available_ge: 1 //不检索传-1
            }
            const rLoading = this.openLoading();
            // this.loading = true;
            getGoodsList(params).then((res) => {
                rLoading.close();
                // this.loading = false;
                if (res.code === 200){
                    this.tableData = res.data.lists || [];
                    this.pageTotal = res.data.total;
                    if(this.tableData){
                        let obj = {}
                        obj['page'] = params.page;
                        obj['list'] = this.tableData;
                        // 当前页数据是否已存在
                        let new_arr = this.data_all.filter(value => value.page === params.page);
                        if(new_arr.length < 1){
                            this.data_all.push(obj);
                        }
                    }
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

        numChange(index,row){
            if(row.select_num > row.stock_available){
                this.$set(row,'select_num', row.stock_available);
            }
        }


    }
};
</script>
<style>
    .manual-adjust-dialog .el-dialog__header{
        padding: 13px 24px !important;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
    }
    .manual-adjust-dialog .el-dialog__body{
        padding: 20px 0 !important;
    }
    .manual-adjust-dialog .el-dialog__footer{
        padding-right: 16px !important;
    }
    .manual-adjust-dialog .el-input{
        width: 170px;
    }
</style>