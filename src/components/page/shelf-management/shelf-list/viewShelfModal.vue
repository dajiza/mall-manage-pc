<template>
    <el-dialog
        :title="dialogTitle"
        :visible.sync="viewShelfInfo.visible"
        width="1180px"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        :before-close="dialogClose"
        custom-class="view-product-dialog table-has-img"
    >
        <div class="selectedKeys-module" v-if="multipleSelection.length > 1">
            <div class="info-icon">
                <span></span>
                已选择
                <span>{{multipleSelection.length}}</span>项
            </div>
            <span class="print-all" @click="handlePrintSelectedKeys">打印选中货物标贴</span>
        </div>
        <el-table
            v-loading="loading"
            :data="tableData"
            ref="multipleTable"
            tooltip-effect="dark"
            :close-on-click-modal="false"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column label="产品图片" align="center" width="100">
                <template slot-scope="scope">
                    <img class="product-img" :src="back_url(scope.row.product_data)" alt="" @click="viewBigImg(scope.row.product_data)">
                </template>
            </el-table-column>
            <el-table-column label="产品名称">
                <template slot-scope="scope">
                    <span>{{back_name(scope.row.product_data)}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="shelf_code" label="货架编码"></el-table-column>
            <el-table-column prop="stock_total" label="总库存" width="100"></el-table-column>
            <el-table-column prop="stock_locked" label="待出库库存" width="100"></el-table-column>
            <el-table-column prop="created_time" label="创建时间" width="170"></el-table-column>
            <el-table-column label="操作" width="300" align="left">
                <template slot-scope="scope">
                    <el-button type="text" v-hasPermission="'product-num-update'" @click="handleEditStock(scope.$index, scope.row)">修改库存</el-button>
                    <el-button
                        type="text"
                        class="operate-record" v-hasPermission="'product-detail-log-list'"
                        @click="handleOperateRecord(scope.$index, scope.row)"
                    >操作记录</el-button>
                    <el-button type="success" v-hasPermission="'shelf-print-goods-tags'" @click="handlePrintLabel(scope.row)">打印标贴</el-button>
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
        <!-- 修改库存弹出框 -->
        <ModificationStock
            v-if="stockModalInfo.visible"
            :stockModalInfo="stockModalInfo"
            @handleCloseStockModal="handleCloseStockModal"
            @handleSureStockModal="handleSureStockModal"
        />
        <!-- 操作记录弹出框 -->
        <OperationRecord
            v-if="recordModalInfo.visible"
            :recordModalInfo="recordModalInfo"
            @handleCloseRecordModal="handleCloseRecordModal"
            @handleSureRecordModal="handleSureRecordModal"
        />
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
        <!-- 打印标贴 -->
        <div v-if="printPageShow" class="print-cargo-label-page" @click.stop="">
            <div id="printMe" ref="print" style="background: #fff;box-sizing: border-box;">
                <div class="label-box" v-for="(item,i) in cargoLabelInfo" :key="i" style="page-break-after:always;width: 100%;height: 100%;display: flex;justify-content: center;align-items: center">
                    <div class="label-content" style="width: 36mm;height: 53mm;border-radius: 2px;box-sizing: border-box;display: flex;flex-direction: column" :style="i > 0?'margin-top:2.5mm':'margin-top:2mm'">
                        <table class="print-table" headerRows='1' style="width: 100% !important;border-color: #000;border-collapse:collapse;font-size: 9px!important;box-sizing: border-box">
                            <tr style="height: 30px;line-height: 15px;box-sizing: border-box;">
                                <th style="width: 40%;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 400!important;font-size: 9px!important;">产品名称</th>
                                <td style="width: 60%;border: 1px solid #000;text-align: left;padding: 2px;box-sizing: border-box;font-size: 9px!important;">{{item.product_name}}</td>
                            </tr>
                            <tr style="height: 30px;line-height: 15px;box-sizing: border-box;">
                                <th style="width: 40%;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 400!important;font-size: 9px!important;">货物编码</th>
                                <td style="width: 60%;border: 1px solid #000;text-align: left;padding: 2px;box-sizing: border-box;font-size: 9px!important;">{{item.detail_code}}</td>
                            </tr>
                            <tr style="height: 30px;line-height: 15px;box-sizing: border-box;">
                                <th style="width: 40%;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 400!important;font-size: 9px!important;">货架编码</th>
                                <td style="width: 60%;border: 1px solid #000;text-align: left;padding: 2px;box-sizing: border-box;font-size: 9px!important;">{{item.shelf_code}}</td>
                            </tr>
                        </table>
                        <div class="QRCode-box" style="width: 36mm;flex: 1;box-sizing: border-box;border: 1px solid #000;border-top: none">
                            <div class="qrcode" style="width: 100%;height: 100%;box-sizing:border-box;padding: 8px 0;display: flex;justify-content: center;align-items: center;" :id="'qrCodeUrl' + item.id" :ref="'qrCodeUrl' + item.id"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>
<script>
import './ShelfList.less';
import ModificationStock from '../../../common/modification-stock/ModificationStock';
import OperationRecord from '../../../common/operation-record/OperationRecord';
import BigImg from '../../../common/big-img/BigImg';
import { getGoodsList } from '../../../../api/productList';
import EmptyList from '../../../common/empty-list/EmptyList';
import QRCode from 'qrcodejs2';
export default {
    name: 'ViewShelfModal',
    props: ['viewShelfInfo'],
    components: {
        ModificationStock,
        OperationRecord,
        BigImg,
        EmptyList
    },
    data() {
        return {
             pageInfo: {
                pageIndex: 1,
                pageSize: 5,
                pageTotal: 0
            }, //页码信息
            dialogTitle:'',
            tableData: [], //列表
            loading: false,
            multipleSelection: [], //多选
            stockModalInfo: {
                visible: false,
                currentItem: {},
                unit_name:''
            }, //修改库存信息
            recordModalInfo: {
                visible: false,
                currentItem: {}
            }, //操作记录信息
            bigImgUrl:'',  // 需要放大图片url
            imgBaseUrl:'',
            printPageShow:false,
            cargoLabelInfo:[]
        };
    },
    // 计算属性
    computed:{
        back_url:function() {
            return (data)=>{
                if(data.img){
                    return data.img + '!/fw/80';
                }else {
                    return ''
                }
            }
        },
        back_name:function() {
            return (data)=>{
                if(data.name){
                    return data.name
                }else {
                    return ''
                }
            }
        },
    },
    created() {
        // 图片读取地址
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
        this.dialogTitle = '货架：' + this.viewShelfInfo.currentItem.code;
    },
    mounted() {
        this.getGoodsListData();
    },
    methods: {

        //确定
        handleSureModal() {
            this.$emit('handleSureModal', false);
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        //打印标贴
        handlePrintLabel(row) {
            this.printPageShow = false;
            this.$nextTick(()=>{
                this.cargoLabelInfo = [];
                this.cargoLabelInfo.push({
                    id:row.id,
                    product_name:row.product_data.name || '',
                    detail_code:row.detail_code,
                    shelf_code:row.shelf_code,
                    type:1
                })
                this.printPageShow = true;
                this.showCode(this.cargoLabelInfo);
            })
        },

        // 按钮-打印全部
        handlePrintSelectedKeys() {
            this.printPageShow = false;
            this.cargoLabelInfo = [];
            this.multipleSelection.forEach((ev)=>{
                this.cargoLabelInfo.push({
                    id:ev.id,
                    product_name:ev.product_data.name || '',
                    detail_code:ev.detail_code,
                    shelf_code:ev.shelf_code,
                    type:1
                })
            });
            this.$nextTick(()=>{
                this.printPageShow = true;
                this.showCode(this.cargoLabelInfo);
            })
        },
        // 显示二维码
        showCode(info){
            info.forEach((ev,index)=>{
                let obj = {
                    code:ev.detail_code,
                    type:1
                }
                this.$nextTick(()=>{
                    let params = JSON.stringify(obj);
                    this.creatQrCode(params,ev.id);
                })
            })
            setTimeout(()=>{
                this.$print(this.$refs.print);
            },100)
        },

        // 生成二维码
        creatQrCode(params, id) {
            const QR = 'qrCodeUrl' + id;
            var qrcode = new QRCode(document.getElementById("qrCodeUrl"+id), {
                render: "canvas", //table方式
                text: params, // 需要转换为二维码的内容
                width: 96,
                height: 96,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            })
        },

        //打开修改库存弹出框
        handleEditStock(index, row) {
            this.$set(this.stockModalInfo, 'unit_name', row.product_data.attr_unit_name);
            this.stockModalInfo = Object.assign({}, this.stockModalInfo, { currentItem: row, visible: true });
        },
        //修改库存记录关闭回调
        handleCloseStockModal(visible) {
            this.$set(this.stockModalInfo, 'visible', visible);
        },
        //修改库存记录确定回调
        handleSureStockModal(visible) {
            this.$set(this.stockModalInfo, 'visible', visible);
            this.getGoodsListData();
        },
        //打开操作记录弹出框
        handleOperateRecord(index, row) {
            this.recordModalInfo = Object.assign({}, this.recordModalInfo, { currentItem: row, visible: true });
        },
        //修改库存记录关闭回调
        handleCloseRecordModal(visible) {
            this.$set(this.recordModalInfo, 'visible', visible);
        },
        //修改库存记录确定回调
        handleSureRecordModal(visible) {
            this.$set(this.recordModalInfo, 'visible', visible);
        },
         // 分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            this.getGoodsListData();
        },

        // 查看大图
        viewBigImg(data){
            // this.bigImgShow = true;
            // this.bigImgUrl = pic_url;
            if(data.img){
                if(data.img.indexOf('http') === -1){
                    this.bigImgUrl =  this.imgBaseUrl + data.img + '!/fw/640';
                }else {
                    this.bigImgUrl =  data.img + '!/fw/640';
                }
                this.$refs.bigImg.show();
            }
        },

        //
        dialogClose(){
            this.$refs.multipleTable.clearSelection();
            this.multipleSelection = [];
            this.$emit('handleSureModal', false);
        },

        // 请求 - 货物列表
        getGoodsListData(){
            const params ={
                product_id: 0,
                product_code: '',
                shelf_code: this.viewShelfInfo.currentItem.code,
                limit: this.pageInfo.pageSize,
                page:this.pageInfo.pageIndex,
                stock_available_le: -1, //不检索传-1
                stock_available_ge: -1 //不检索传-1
            }
            const rLoading = this.openLoading();
            getGoodsList(params)
                .then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.tableData = res.data.lists || [];
                        this.$set(this.pageInfo,'pageTotal', res.data.total);
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                })
                .catch(() => {});
        },
    }
};
</script>
<style>
    .print-cargo-label-page{
        position: absolute;
        top: -9999px;
        left: -9999px;
        z-index: -1;
    }
    /* 去除页眉页脚 */
    @page {
        size: auto;
        margin: 10mm 0 8mm 0;
    }
    @media print {
    }
</style>