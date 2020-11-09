<template>
    <div class="app-container" v-if="detail">
        <div class="page-title">退款状态：{{ REFUND_STATUS[detail.status] }}</div>
        <!-- 退款详情 -->
        <div class="wrap detail">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">退款详情</div>
            </div>
            <div class="divider"></div>
            <div class="substance">
                <div class="info">
                    <div class="sheet">
                        <span class="label">退款类型：</span>
                        <span class="value text-blue">{{ REFUND_TYPE[detail.type] }}</span>
                    </div>
                    <div class="sheet">
                        <span class="label">订单号：</span>
                        <span class="value">{{ detail.order_no }}</span>
                    </div>
                    <div class="sheet">
                        <span class="label">退款总金额：</span>
                        <span class="value text-red">￥{{ formatMoney(detail.money) }}</span>
                    </div>
                    <div class="sheet">
                        <span class="label">申请时间：</span>
                        <span class="value">{{ detail.created_time }}</span>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="sheet">
                    <span class="label">退款理由：</span>
                    <span class="value">{{ detail.reason }}</span>
                </div>
                <div class="sheet sheet-img">
                    <span class="label">退款凭证：</span>
                    <div class="img-list">
                        <img class="apply-img" :src="item" v-for="item in detail.imgs" :key="item" />
                    </div>
                </div>
            </div>
        </div>
        <!-- 退款商品 -->
        <div class="wrap goods">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">退款商品</div>
            </div>
            <div class="divider"></div>

            <div class="substance">
                <el-table
                    :data="list"
                    v-loading.body="listLoading"
                    :header-cell-style="$tableHeaderColor"
                    element-loading-text="Loading"
                    fit
                    highlight-current-row
                >
                    <el-table-column label="图片" width="">
                        <template slot-scope="scope">
                            <img class="goods-img" :src="scope.row.goods_img" />
                        </template>
                    </el-table-column>
                    <el-table-column label="商品名称">
                        <template slot-scope="scope">
                            <span>{{ scope.row.goods_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="单价(元)">
                        <template slot-scope="scope">
                            <span>{{ formatMoney(scope.row.order_detail_money) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="数量">
                        <template slot-scope="scope">
                            <span>{{ scope.row.order_detail_num }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="总价(元)">
                        <template slot-scope="scope">
                            <span>{{ formatMoney(scope.row.money) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="折扣优惠(元)">
                        <template slot-scope="scope">
                            <!-- <span>{{ formatMoney(scope.row.goods_name) }}</span> -->
                        </template>
                    </el-table-column>
                    <el-table-column label="实付(元)">
                        <template slot-scope="scope">
                            <span>{{ formatMoney(scope.row.money) }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <!-- 操作日志 -->
        <div class="wrap goods" v-if="showLog">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">操作日志</div>
            </div>
            <div class="divider"></div>

            <div class="substance">
                <el-table
                    :data="logList"
                    v-loading.body="listLoading"
                    :header-cell-style="$tableHeaderColor"
                    element-loading-text="Loading"
                    fit
                    highlight-current-row
                >
                    <el-table-column label="操作类型" width="">
                        <template slot-scope="scope">
                            <span>{{ REFUND_STEP[scope.row.step] }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="执行结果" fit>
                        <template slot-scope="scope">
                            <div class="status">
                                <span class="dot dot-red" v-if="scope.row.result == 0"></span>
                                <span class="dot dot-green" v-if="scope.row.result == 1"></span>
                                <span>
                                    {{ scope.row.result == 0 ? '拒绝' : '同意' }}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="理由/凭证">
                        <template slot-scope="scope">
                            <span v-if="!scope.row.imgs">{{ scope.row.reason }}</span>
                            <img class="certificate-img" :src="scope.row.imgs" alt="" v-if="scope.row.imgs" @click="imgPreview(scope.row.imgs)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作人">
                        <template slot-scope="scope">
                            <span>{{ scope.row.user_id }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作时间">
                        <template slot-scope="scope">
                            <span>{{ scope.row.created_time }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <!-- 选择退款方式 -->
        <div class="wrap goods" v-if="showRefund">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">选择退款方式</div>
            </div>
            <div class="divider"></div>

            <div class="substance">
                <div class="radio-wrap">
                    <el-radio v-model="refundType" label="1">原路返回</el-radio>
                    <el-radio v-model="refundType" label="2">手动打款</el-radio>
                </div>
                <div class="divider" v-if="refundType == 2"></div>
                <div class="certificate" v-if="refundType == 2">
                    <div class="sheet sheet-certificate">
                        <span class="label">打款凭证：</span>
                        <div class="upload">
                            <!-- <el-upload
                                action="https://jsonplaceholder.typicode.com/posts/"
                                list-type="picture-card"
                                :on-preview="handlePictureCardPreview"
                                :on-remove="handleRemove"
                            >
                                <i class="el-icon-plus"></i>
                            </el-upload> -->
                            <el-upload
                                list-type="picture-card"
                                class="upload-demo"
                                :action="uploadImgUrl"
                                :headers="header"
                                :before-upload="beforeUpload"
                                :on-success="uploadImgSuccess"
                                :on-error="uploadImgError"
                                :on-remove="handleRemove"
                                :on-exceed="handleExceed"
                                :limit="1"
                            >
                                <i class="el-icon-plus"></i>
                            </el-upload>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 客户发回物流信息 -->
        <div class="wrap goods" v-if="showChangeCustomer">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">客户发回物流信息</div>
            </div>
            <div class="divider"></div>

            <div class="substance">
                <div class="express">
                    <div class="sheet">
                        <span class="label">快递公司：</span>
                        <span class="value">{{ detail.logistics_company_name }}</span>
                    </div>
                    <div class="sheet">
                        <span class="label">快递单号：</span>
                        <span class="value">{{ detail.logistics_no }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 平台发货物流信息 -->
        <div class="wrap goods" v-if="showChangeSeller">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">客户发回物流信息</div>
            </div>
            <div class="divider"></div>

            <div class="substance">
                <div class="express">
                    <el-form :inline="true" size="small" label-position="right" label-width="100px">
                        <el-form-item label="快递公司：">
                            <!-- <el-select v-model="value" placeholder="请选择">
                                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select> -->
                        </el-form-item>
                        <el-form-item label="快递单号：">
                            <el-input v-model="input" placeholder="请输入内容"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
        <div class="brn-wrap">
            <!-- 退款提交 -->
            <el-popconfirm class="confirm" title="确定提交" @onConfirm="submitRefund">
                <el-button slot="reference" class="" size="" type="primary" v-if="showRefund">提交</el-button>
            </el-popconfirm>
            <!-- 审核 -->
            <el-popconfirm class="confirm" title="确定审核同意" @onConfirm="checkApply('1')">
                <el-button slot="reference" class="" size="" type="primary" v-if="showCheck">同意</el-button>
            </el-popconfirm>
            <el-popconfirm class="confirm" title="确定审核拒绝" @onConfirm="checkApply('0')">
                <el-button slot="reference" class="" size="" type="danger" v-if="showCheck">拒绝</el-button>
            </el-popconfirm>
            <!-- 客户发回物流信息 -->
            <el-button class="" size="" type="primary" @click="handleFilter" v-if="showChangeCustomer">同意</el-button>
            <el-button class="" size="" type="danger" @click="handleFilter" v-if="showChangeCustomer">拒绝</el-button>
        </div>
        <!-- 申请拒绝理由 -->
        <el-dialog title="拒绝理由" :visible.sync="reasonVisible" width="30%" :before-close="beforeClose">
            <el-input v-model="reasonRefuse" placeholder="请输入拒绝理由"></el-input>

            <span slot="footer" class="dialog-footer">
                <el-button @click="reasonVisible = false">取 消</el-button>
                <el-button type="primary" @click="checkRefuse">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 操作记录凭证 预览-->
        <el-dialog :visible.sync="imgVisible">
            <img width="100%" :src="imgCertificate" alt="" />
        </el-dialog>
    </div>
</template>
<script>
import { queryAfterSaleDetail, queryAfterSaleLog, putApplyApprove, putRefundVx, putRefund } from '@/api/afterSale';
import { REFUND_TYPE, REFUND_STATUS, REFUND_STEP } from '@/plugin/constant';
import { getToken } from '@/utils/auth';

import { formatMoney } from '@/plugin/tool';

export default {
    data() {
        return {
            input: '',

            id: '',

            REFUND_TYPE,
            REFUND_STATUS,
            REFUND_STEP,
            detail: null,
            list: null,
            logList: null,
            listLoading: false,
            refundType: '1', //1 原路 2 财务打款
            dialogImageUrl: '',
            dialogVisible: false,

            reasonVisible: false, //申请拒绝理由弹窗
            reasonRefuse: '', //拒绝理由

            showLog: true, //操作日志
            showCheck: false, //审核按钮
            showRefund: false, //退款方式
            showChangeCustomer: false, //换货 客户发回物流
            showChangeSeller: false, //换货 平台发货物流信息填写

            imgVisible: false,
            imgCertificate: '',
            filePic: '',
            header: {}
        };
    },

    created() {
        this.id = this.$route.params.id || 51;
        console.log('GOOGLE: this.id', this.id);
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
        this.header['token'] = getToken();
        this.getDetail();
        this.getLog();
    },
    mounted() {},
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        getDetail() {
            let params = {
                id: this.id
            };

            console.log(params);
            queryAfterSaleDetail(params)
                .then(res => {
                    console.log('GOOGLE: res', res);
                    // 处理用户上传凭证图片
                    if (res.data.imgs != '') {
                        res.data.imgs = res.data.imgs.split(',');
                    }
                    this.detail = res.data;
                    // 处理商品显示
                    this.list = [];
                    this.list.push(res.data);
                    // 处理模块显示
                    const type = res.data.type;
                    const status = res.data.status;
                    // showLog: true, //操作日志
                    // showCheck: false, //审核按钮
                    // showRefund: false, //退款方式
                    // showChangeCustomer: false, //换货 客户发回物流
                    // showChangeSeller: false //换货 平台发货物流信息填写
                    if (status == 0) {
                        this.showLog = false;
                        this.showCheck = true;
                    } else if (status == 1) {
                        this.showRefund = true;
                    } else if (status == 5 && type == 2) {
                        this.showChangeCustomer = true;
                    } else if (status == 6 && type == 2) {
                        this.showChangeSeller = true;
                    }
                })
                .catch(err => {});
        },
        getLog() {
            let params = {
                apply_id: this.id
            };

            queryAfterSaleLog(params)
                .then(res => {
                    console.log('GOOGLE: getLog', res);
                    this.logList = res.data;
                })
                .catch(err => {});
        },
        // 审核同意/拒绝 按钮
        checkApply(result) {
            if (result == 0) {
                this.reasonVisible = true;
                return;
            }
            let params = {
                order_apply_id: this.id,
                result: result, //审核结果：0拒绝；1同意',
                reason: '审核同意'
            };

            putApplyApprove(params)
                .then(res => {
                    if (res.code == 200) {
                        this.$notify({
                            title: '审核同意成功',
                            type: 'success',
                            duration: 5000
                        });
                        this.reload();
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 5000
                        });
                    }
                    console.log('GOOGLE: putApplyApprove', res);
                })
                .catch(err => {});
        },

        // 审核拒绝 弹窗
        checkRefuse() {
            if (this.reasonRefuse == '') {
                this.$notify({
                    title: '请填写拒绝理由',
                    type: 'warning',
                    duration: 5000
                });
                return;
            }

            let params = {
                order_apply_id: this.id,
                result: '0', //审核结果：0拒绝；1同意',
                reason: this.reasonRefuse
            };
            putApplyApprove(params)
                .then(res => {
                    if (res.code == 200) {
                        this.$notify({
                            title: '审核拒绝成功',
                            type: 'success',
                            duration: 5000
                        });
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 5000
                        });
                    }
                    this.reload();

                    console.log('GOOGLE: putApplyApprove', res);
                })
                .catch(err => {});
        },
        // 提交退款
        submitRefund() {
            console.log(this.refundType);
            if (this.refundType == 1) {
                this.refundVx();
            } else if (this.refundType == 2) {
                this.refundFinancial();
            }
        },
        // 原路退款
        refundVx() {
            let params = {
                order_apply_id: Number(this.detail.id),
                order_no: this.detail.order_no.toString(),
                apply_no: this.detail.apply_no.toString(),
                order_money: Number(this.detail.order_money), //整个订单的总金额，支付时金额
                apply_money: Number(this.detail.money), //申请的退款金额
                shop_id: Number(this.detail.shop_id)
            };
            putRefundVx(params)
                .then(res => {
                    if (res.code == 200) {
                        this.$notify({
                            title: '原路退款成功',
                            type: 'success',
                            duration: 5000
                        });
                        this.reload();
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 5000
                        });
                    }

                    console.log('GOOGLE: putRefundVx', res);
                })
                .catch(err => {});
        },
        // 财务退款
        refundFinancial() {
            console.log(this.filePic);
            if (this.filePic.length > 0) {
                let params = {
                    order_apply_id: this.detail.id,
                    imgs: this.filePic[0].response.data.file_url
                };

                putRefund(params)
                    .then(res => {
                        if (res.code == 200) {
                            this.$notify({
                                title: '财务退款成功',
                                type: 'success',
                                duration: 5000
                            });
                            this.reload();
                        } else {
                            this.$notify({
                                title: res.msg,
                                type: 'warning',
                                duration: 5000
                            });
                        }
                    })
                    .catch(err => {});
            } else {
                this.$notify({
                    title: '请上传凭证',
                    message: '',
                    type: 'warning',
                    duration: 5000
                });
            }
        },
        // 图片上传前检测
        beforeUpload(file) {
            if ((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') && file.size <= 1024 * 1024 * 5) {
                this.upload_loading = this.uploadLoading('上传中');
                this.uploadVisible = false;
            } else {
                if (file.size > 1024 * 1024 * 5) {
                    this.$notify({
                        title: '照片大小应不超过5M',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    });
                } else {
                    this.$notify({
                        title: '照片格式只支持JPG、PNG',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    });
                }
                return false;
            }
        },

        // 单张图片上传成功回调
        uploadImgSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.$notify({
                    title: '操作成功',
                    message: '',
                    type: 'success',
                    duration: 500
                });
                this.upload_loading.close();
                this.filePic = fileList;
            } else {
                this.upload_loading.close();
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'warning',
                    duration: 5000
                });
            }
        },

        // 单张图片上传失败回调
        uploadImgError(err, file, fileList) {
            this.upload_loading.close();
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            });
        },
        handleExceed(files, fileList) {
            this.$notify({
                title: '只能上传一张图片',
                message: '',
                type: 'warning',
                duration: 5000
            });
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
            this.filePic = fileList;
        },
        imgPreview(img) {
            this.imgVisible = true;
            this.imgCertificate = img;
        },

        // 理由弹框关闭
        beforeClose() {
            this.reasonRefuse = '';
            this.reasonVisible = false;
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.getList();
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model);
            this.$refs[formName].resetFields();
            this.handleFilter();
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        }
    }
};
</script>
<style scoped="scoped" lang="less">
.page-title {
    box-sizing: border-box;
    padding-left: 24px;
    width: 100%;
    height: 80px;
    border-radius: 2px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 20px;
    line-height: 80px;
}
.divider {
    width: 100%;
    height: 1px;
    background: #e9e9e9;
}
.wrap {
    margin-top: 16px;
    border-radius: 2px;
    background: #fff;
}
.detail {
    .substance {
        padding: 32px;
        .divider {
            margin: 32px 0;
        }
        .label {
            color: rgba(0, 0, 0, 0.85);
        }
        .info {
            display: flex;
            justify-content: space-between;
        }
        .sheet-img {
            display: flex;
            margin-top: 32px;
        }
        .apply-img {
            margin-right: 12px;
            width: 120px;
            height: 120px;
        }
    }
}
.goods {
    .substance {
        padding: 32px;
        .label {
            color: rgba(0, 0, 0, 0.85);
        }
        .divider {
            margin: 30px 0 20px;
        }
        .goods-img {
            width: 80px;
            height: 60px;
        }
        .express {
            display: flex;
            .sheet {
                margin-right: 240px;
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
        // .thimg {
        //     height: 148px;
        //     position: absolute;
        //     left: 150px;
        // }
        // .upload-demo {
        //     position: relative;
        // }
        .sheet-certificate {
            .upload {
                margin-top: 20px;
            }
        }
        .certificate-img {
            height: 60px;
        }
    }
}
.brn-wrap {
    display: flex;
    justify-content: center;
    padding-top: 40px;
    .confirm {
        margin-right: 20px;
        // padding-right: 20px;
    }
}
</style>
