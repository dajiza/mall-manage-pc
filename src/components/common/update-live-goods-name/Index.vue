<template>
    <el-dialog
        title="请修改以下商品名称，不得超过28个字符（ps：1个汉字占两个字符）"
        custom-class="update-dialog"
        :visible.sync="isShow"
        width="828px"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        append-to-body
        @opened="opened"
    >
        <el-form ref="formGoodsEdit" :model="list_obj" :rules="editRules" >
            <el-table
                    v-loading="loading"
                    :data="list_obj.tableData"
                    ref="multipleTable" tooltip-effect="dark"
            >
                <el-table-column prop="coupon_title" label="商品名称" width="280">
                    <template slot-scope="scope" v-if="scope.row.nameLength > 28">
                        <div class="goods-name-wrap" v-if="!scope.row.is_update">
                            <span class="goods-name text-ellipsis">{{scope.row.goods_name}}</span>
                            <span class="iconfont icon-update" @click="handleUpdate(scope.row)"></span>
                        </div>
                        <div class="goods-name-input" v-else>
                            <el-form-item label="" :prop="'tableData.' + scope.$index + '.goods_name'" :rules="editRules.goodsName" >
                                <el-input
                                        class="parameter-input"
                                        placeholder="请输入"
                                        v-model="scope.row.goods_name"
                                        @blur="inputBlur(scope.row)"
                                ></el-input>
                            </el-form-item>
                        </div>

                    </template>
                </el-table-column>
                <el-table-column label="SKU图片" width="128">
                    <template slot-scope="scope">
                        <img class="timg" :src="scope.row.sku_sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.live_img,scope.$index)" />
                    </template>
                </el-table-column>
                <el-table-column label="SKU名称" prop="sku_title" width="280"></el-table-column>
                <el-table-column label="SKU编码" width="140">
                    <template slot-scope="scope">{{scope.row.product_storage_data.product_code}}</template>
                </el-table-column>
            </el-table>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleSure">确定</el-button>
        </div>
    </el-dialog>
</template>
<script>
import './Index.less';
import EmptyList from '../empty-list/EmptyList';
export default {
    name: 'UpdateLiveGoods',
    props: {
        list: {
            type: Array,
            default: []
        }
    },
    data() {
        const validateNum = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入商品名称'));
                return
            }
            if (this.getByteLen(value) > 28) {
                callback(new Error('名称应少于28个字符'));
                return
            }
            callback();
        }
        return {
            list_obj: {
                tableData: [],
            },
            loading: false,
            editRules: {
                goodsName: [
                    { required: true, validator: validateNum, trigger: 'change', message: '' }
                ]
            },
            isShow: false,
            tableHeight: 'calc(100vh - 280px)',
        };
    },
    components: {
        EmptyList
    },
    created() {
    },
    mounted() {

    },
    methods: {
        show() {
            this.isShow = true
        },
        close() {
            this.isShow = false
        },
        opened(){
            const list = _.cloneDeep(this.list.filter(item => item.nameLength > 28));
            this.$set(this.list_obj, 'tableData', list);
        },
        // 确定
        handleSure() {
            this.list_obj.tableData.forEach((ev)=>{
                ev['is_update'] = true;
            })
            this.$nextTick(()=>{
                this.$refs['formGoodsEdit'].validate(valid => {
                    // 验证表单内容
                    if (valid) {
                        console.log('this.list', this.list)
                        console.log('this.list_obj.tableData', this.list_obj.tableData)
                        let back_list = [];
                        this.list.forEach((old_item)=>{
                            let _obj = _.cloneDeep(old_item);
                            this.list_obj.tableData.forEach((new_item)=>{
                                if(old_item.sku_id == new_item.sku_id && old_item.shop_sku_id == new_item.shop_sku_id) {
                                    _obj['new_title'] = new_item.goods_name
                                }
                            })
                            back_list.push(_obj);
                        })

                        this.$emit('handleSureUpdateModal', back_list);

                    } else {
                        console.log('22222')
                    }
                })
            })


        },

        handleUpdate(row){
            row['is_update'] = true;
        },

        inputBlur(row){
            // row['is_update'] = false;
        },
        openPreview(){},

        getByteLen(val) {
            let len = 0;
            for (let i = 0; i < val.length; i++) {
                let a = val.charAt(i);
                if (a.match(/[^\x00-\xff]/ig) != null) {
                    len += 2;
                } else {
                    len += 1;
                }
            }
            return len;
        }
    }
};
</script>
<style scoped lang="less">
    /deep/.el-dialog__title{
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500 !important;
    }
    .icon-update{
        cursor: pointer;
    }
    .el-form-item{
        margin-bottom: 0 !important;
        width: 100%;
    }
</style>