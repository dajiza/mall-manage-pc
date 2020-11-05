<template>
    <el-dialog
            :title="dialogTitle"
            :visible.sync="addGoodsModalInfo.visible"
            width="1000px"
            :destroy-on-close="true"
            :close-on-click-modal="false"
            custom-class="add-goods-modal"
            append-to-body
    >
        <el-button class="btn-add-goods" type="success" @click="handleAddGoods">添加货物</el-button>
        <el-form ref="goodsForm" :model="goodsForm" :rules="goodsRules">
            <div class="add-goods-box clearfix" v-for="(item, index) in goodsForm.goods" :key="index">
                <el-form-item v-show="false" class="add-goods-item" label="货物编码:" label-width="75px"
                              :prop="'goods.' + index + '.detail_code'">
                    <el-input v-model="item.detail_code" placeholder="请输入" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item class="add-goods-item" label="货架编码:" label-width="75px"
                              :prop="'goods.' + index + '.shelf_code'">
                    <el-select v-model="item.shelf_code" placeholder="请选择">
                        <el-option
                                v-for="state in available_shelf_list"
                                :key="state.code"
                                :value="state.code"
                                :label="state.code"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item class="add-goods-item stock-num-input" label="库存:" :prop="'goods.' + index + '.stock_num'"
                              :rules="goodsRules.stock_num" label-width="45px">
                    <el-input v-model.number="item.stock_num" placeholder="请输入" @mousewheel.native.prevent></el-input>&nbsp;&nbsp;码
                </el-form-item>
                <div class="btn-box">
                    <el-button type="danger" @click.prevent="removeSingleGood(item, index)">删除</el-button>
                </div>
            </div>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="handleSure" :disabled="saveIsClick">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import './AddGoodsModal.less';
    import { getGoodsCreate } from '../../../api/productList';
    import { getProductDetailCodeCreate, getShelfCodeCreate } from '../../../api/createCode';
    import { getShelfList } from '../../../api/shelf';
    export default {
        name: 'AddGoodsModal',
        props: ['addGoodsModalInfo'],
        data() {
            var checkNum = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('请输入大于0的整数'));
                }
                setTimeout(() => {
                    if (!Number.isInteger(value)) {
                        callback(new Error('请输入数字值'));
                    } else {
                        callback();
                    }
                }, 10);
            };
            return {
                goodsForm: {
                    goods:[
                    ]
                },
                goodsRules:{
                    stock_num:[{ validator: checkNum, trigger: 'blur' }]
                },
                dialogTitle:'',
                add_goods:[],
                goodsCreatedNum:0, // 已创建货物数量（从后台请求到的已存在货物数量）
                goodsNum:0, // 现有货物数量（包括已添加未保存）
                shelfCode:'',  // 货架编码
                printPageShow:false,
                product_code:'',
                available_shelf_list:[],
                product_type:0,
                saveIsClick:false
            };
        },
        created() {
            this.product_code = this.addGoodsModalInfo.currentItem.product_code;
            this.dialogTitle = '产品编码：' + this.addGoodsModalInfo.currentItem.product_code;
            this.product_type = this.addGoodsModalInfo.currentItem.type;
        },
        mounted() {
            const params = { product_id:Number(this.addGoodsModalInfo.currentItem.id)};
            this.getAllCode(params);
        },
        methods: {

            // 按钮 - 添加货物
            handleAddGoods() {
                // 获取 货物编码 - 查看或者编辑 (产品编码不改变)
                this.goodsNum = Number(this.goodsNum + 1);
                const good_code = this.splicingGoodsCode(this.product_code,this.goodsNum);
                this.goodsForm.goods.push({
                    detail_code: good_code,
                    shelf_code: this.shelfCode,
                    stock_num:''
                });
            },
            // 按钮 - 删除单个货物
            removeSingleGood(item, index) {
                const del_goods = 'goods.' + index + '.stock_num';
                this.$refs.goodsForm.clearValidate(del_goods);
                this.goodsForm.goods.splice(index,1);
                this.reassignCode(); // 删除后 如果新增货物数大于 0 ，重新赋值货物编码
            },

            // 删除或者切换属性后 如果新增货物数大于 0 ，重新赋值货物编码
            reassignCode(){
                this.goodsNum = this.goodsCreatedNum;
                this.goodsForm.goods.forEach((ev,i)=>{
                    this.goodsNum = Number(this.goodsNum + 1);
                    const new_good_code = this.splicingGoodsCode(this.product_code,this.goodsNum);
                    this.$set(ev,'detail_code',new_good_code); // 货物编码赋值
                    // this.$set(ev,'shelf_code',this.shelfCode);  // 货架编码赋值
                })
            },

            // 拼接货物编码
            splicingGoodsCode(product_code,num){
                const random_str = this.randomString(3);
                if(num > 0 && num < 10){
                    return product_code + '-' + random_str + '00' + num;
                }else if(num > 9 && num < 99){
                    return product_code + '-' + random_str + '0' + num;
                }else {
                    return product_code + '-' + random_str + num;
                }
            },

            // 按钮 - 关闭
            handleClose() {
                this.$emit('handleCloseAddGoodsModal', false);
            },
            // 按钮 - 确定（添加货物）
            handleSure() {
                this.$refs['goodsForm'].validate((valid) => {
                    if (valid) {
                        //  确定修改库存
                        this.add_goods = [];
                        this.goodsForm.goods.forEach((ev,index) =>{
                            if(ev.stock_num > 0){
                                this.add_goods.push(ev);
                            }
                        });
                        this.$set(this.goodsForm, 'goods', this.add_goods)
                        if(this.add_goods.length > 0){
                            let goods_arr = [];
                            this.add_goods.forEach((ev,index) =>{
                                let request = {};
                                request['price_in'] = 0;
                                request['product_id'] = this.addGoodsModalInfo.currentItem.id;
                                request['status'] = 0;
                                request['detail_code'] = ev.detail_code;
                                request['shelf_code'] = ev.shelf_code;
                                request['stock_total'] = Number(ev.stock_num);
                                request['type'] = this.product_type;
                                goods_arr.push(request);
                            });
                            let params = {
                                data:goods_arr
                            }
                            this.addGoods(params);
                        }
                    }
                })
            },

            // 请求 - 新增货物
            addGoods(params){
                const rLoading = this.openLoading();
                getGoodsCreate(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.saveIsClick = false;
                        this.$emit('handleCloseAddGoodsModal', false);
                    } else {
                        this.saveIsClick = false;
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 获取所有code
            getAllCode(params){
                const that = this;
                const rLoading = this.openLoading();
                const shelf_params ={
                    floor_code: '-1',
                    room_code: '-1',
                    shelf_code: -1
                };
                this.$ajax.all([
                    getProductDetailCodeCreate(params),
                    getShelfCodeCreate(params),
                    getShelfList(shelf_params)
                ]).then(that.$ajax.spread(function(res1, res2, res3) {
                    rLoading.close();
                    if (res1.code === 200){  // 产地
                        if(res1.data){
                            that.goodsCreatedNum = res1.data.count;
                            that.goodsNum = res1.data.count;
                        }
                    }else {
                        that.$notify({
                            title: '货物编码获取失败',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                    if (res2.code === 200){  // 品牌(布)
                        if(res2.data){
                            that.shelfCode = res2.data.shelf_code;
                        }
                    }else {
                        that.$notify({
                            title: res2.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                    if (res3.code === 200){  // 货架列表
                        if(res3.data){
                            const shelf_list = res3.data;
                            that.available_shelf_list = shelf_list.filter(value => (value.type === that.product_type && value.status === 0));
                        }
                    }else {
                        that.$notify({
                            title: res3.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                    setTimeout(()=>{
                        that.handleAddGoods();
                    },10)

                })).catch((err)=>{});
            },
            // 生成随机(n位)字符
            randomString(len) {
                len = len || 32;
                /**
                 * 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
                 * */
                const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz';
                const maxPos = $chars.length;
                let pwd = '';
                for (let i = 0; i < len; i++) {
                    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
                }
                return pwd;
            }
        }
    };
</script>