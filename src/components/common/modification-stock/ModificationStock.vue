<template>
    <el-dialog
        title="修改库存"
        :visible.sync="stockModalInfo.visible"
        width="420px"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        append-to-body
    >
        <el-form ref="stockForm" :model="stockForm" :rules="stockRules"
                 label-width="80px" class="record-form">
            <el-form-item label-width="8px">
                <el-radio-group v-model="stockForm.radio" @change="changeType">
                    <el-radio :label="0">加库存</el-radio>
                    <el-radio :label="1">减库存</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="现有库存:" prop="stock_total">
                <el-input v-model="stockForm.stock_total" :disabled="true" placeholder="请输入"></el-input>
                <span>{{unitName}}</span>
            </el-form-item>
            <el-form-item label="可用库存:" prop="stock_available">
                <el-input v-model="stockForm.stock_available" :disabled="true" placeholder="请输入"></el-input>
                <span>{{unitName}}</span>
            </el-form-item>
            <el-form-item label="修改数量:" prop="change_num">
                <el-input v-model.number="stockForm.change_num" placeholder="请输入" @mousewheel.native.prevent
                          @input="chang_num_blur"
                ></el-input>
                <span>{{unitName}}</span>
            </el-form-item>
            <el-form-item label="最终数量:" prop="lastNumber">
                <el-input v-model.number="stockForm.lastNumber" placeholder="请输入" @mousewheel.native.prevent
                          @input="last_num_blur"
                ></el-input>
                <span>{{unitName}}</span>
            </el-form-item>
            <el-form-item label="修改理由:" prop="reason">
                <el-select v-model="stockForm.reason" placeholder="请选择">
                    <el-option v-for="item in reasonOptions" style="width: 290px"
                               :key="item.id" :value="item.id" :label="item.name"/>
                </el-select>
            </el-form-item>
            <el-form-item label="备注:" prop="remarks">
                <el-input
                    type="textarea"
                    placeholder="请输入"
                    :autosize="{minRows: 4,maxRows: 10}"
                    v-model="stockForm.remarks"
                ></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleCloseStockModal">取 消</el-button>
            <el-button type="primary" @click="handleSureStockModal">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import './ModificationStock.less';
import { getReasonAllList } from '../../../api/configManagement';
import { changeProductNum } from '../../../api/productList';
export default {
    name: 'ModificationStock',
    props: ['stockModalInfo'],
    data() {
        var checkNum = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请输入修改数量'));
            }
            setTimeout(() => {
                if (!Number.isInteger(value)) {
                    callback(new Error('请输入数字值'));
                } else {
                    if (this.stockForm.radio > 0 && value > this.stockModalInfo.currentItem.stock_available) {
                        callback(new Error('减少数量不可大于可用库存'));
                    } else {
                        callback();
                    }
                }
            }, 10);
        };
        var checkLastNum = (rule, value, callback) => {
            // if (!value) {
            //     return callback(new Error('请输入最终数量'));
            // }
            setTimeout(() => {
                if (!Number.isInteger(value)) {
                    callback(new Error('请输入数字值'));
                } else {
                    if (this.stockForm.radio < 1 && value < Number(this.stockModalInfo.currentItem.stock_total)) {
                        callback(new Error('加库存，最终数量不可小于现有库存'));
                    } else {
                        callback();
                    }
                }
            }, 10);
        };
        var checkReason = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请选择修改理由'));
            }else {
                callback();
            }
        };
        return {
            stockForm: {
                radio: 0,
                stock_total: '',
                stock_available:'',
                change_num: '',
                lastNumber: '',
                reason: '',
                remarks: ''
            },
            stockRules:{
                change_num:{ validator: checkNum, trigger: ['blur','change'] },
                reason:{ validator: checkReason, trigger: 'blur' },
                lastNumber:{ validator: checkLastNum, trigger: ['blur','change']  },
                remarks: { max: 200, message: '最多可输入200位', trigger: 'blur' }
            },
            reasonOptions:[],
            unitName:''
        };
    },
    created() {
        // 获取修改理由
        this.getReasonList();
        this.unitName = this.stockModalInfo.unit_name;
    },
    mounted() {
        this.$set(this.stockForm,'stock_total', this.stockModalInfo.currentItem.stock_total);
        this.$set(this.stockForm,'stock_available', this.stockModalInfo.currentItem.stock_available);
    },
    methods: {
        //修改库存弹出关闭
        handleCloseStockModal() {
            this.$emit('handleCloseStockModal', false);
        },
        //修改库存弹出确定
        handleSureStockModal() {
            this.$refs['stockForm'].validate((valid) => {
                if (valid) {
                    //  确定修改库存
                    let changeNum = 0;
                    if(this.stockForm.radio > 0){  // 减
                        changeNum = changeNum - this.stockForm.change_num;
                    }else {  // 加
                        changeNum = Number(this.stockForm.change_num);
                    }
                    const params = {
                        product_detail_id: this.stockModalInfo.currentItem.id,
                        num: changeNum,
                        remark: this.stockForm.remarks,
                        reason_id: Number(this.stockForm.reason)
                    };
                    const rLoading = this.openLoading();
                    changeProductNum(params).then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            this.$notify({
                                title: '操作成功',
                                message: '',
                                type: 'success',
                                duration: 1000
                            });
                            this.$emit('handleSureStockModal', false);
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 1000
                            });
                        }
                    }).catch(() => {});
                }
            })
        },
        getReasonList(){
            const params = {type:0};
            const rLoading = this.openLoading();
            getReasonAllList(params).then((res) => {
                rLoading.close();
                if (res.code === 200) {
                    this.reasonOptions = res.data || [];
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    });
                }
            }).catch(() => {});
        },
        // 最终数量输入框失去焦点
        last_num_blur(){
            this.$refs['stockForm'].validateField('lastNumber', numError => { //验证是否正确
                if (!numError) {
                    let changeNum;
                    if(this.stockForm.radio > 0 ){  // 减
                        changeNum = Number(this.stockForm.stock_total - this.stockForm.lastNumber);
                    }else { // 加
                        changeNum = Number(this.stockForm.lastNumber - this.stockForm.stock_total);
                    }
                    this.$set(this.stockForm,'change_num', changeNum);
                } else {
                    return false;
                }
            });
        },
        // 修改数量输入框失去焦点
        chang_num_blur(){
            this.$refs['stockForm'].validateField('change_num', numError => { //验证是否正确
                if (!numError) {
                    let lastNum;
                    if(this.stockForm.radio > 0 ){  // 减
                        lastNum = Number(this.stockForm.stock_total - this.stockForm.change_num);
                    }else { // 加
                        lastNum = Number(this.stockForm.change_num + this.stockForm.stock_total);
                    }
                    this.$set(this.stockForm,'lastNumber', lastNum);
                } else {
                    return false;
                }
            });
        },
        //
        changeType(){
            this.$set(this.stockForm,'lastNumber', '');
            this.$set(this.stockForm,'change_num', '');
            this.$nextTick(()=>{
                this.$refs['stockForm'].clearValidate();
            });
        },
    }
};
</script>