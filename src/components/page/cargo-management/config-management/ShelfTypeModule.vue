<template>
    <el-dialog
            :title="moduleInfo.title"
            :visible.sync="moduleInfo.visible"
            width="400px"
            :before-close="dialogClose"
            :close-on-click-modal="false"
            :destroy-on-close="true"
            custom-class="add-shelf-dialog"
    >
        <el-form
                ref="moduleForm"
                :rules="rules"
                :model="ShelfForm"
        >
            <el-form-item label="配置属性：" prop="type" class="select-type">
                <el-radio-group v-model="ShelfForm.type" :disabled="moduleInfo.title === '编辑货架类型'">
                    <el-radio :label="0">布</el-radio>
                    <el-radio :label="1">其他</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="货架类型名称:" prop="name">
                <el-input v-model="ShelfForm.name" placeholder="请输入货架类型名称"></el-input>
            </el-form-item>
            <div class="add-floor-box">
                <div>
                    <span>货架层：</span>
                    <span v-show="ShelfForm.floors.length > 0" class="shelf-capacity">共{{ShelfForm.floors.length}}层 总容量{{back_shelf_capacity(ShelfForm.floors)}}</span>
                </div>
                <div class="add-floor" @click="addFloor">
                    <i class="el-icon-circle-plus"></i>
                    <span class="add-text">添加</span>
                </div>
            </div>
            <div class="floors-box"
                 v-for="(item, index) in ShelfForm.floors" :key="index"
            >
                <el-form-item
                        :prop="'floors.' + index + '.value'" label="容量："
                        :rules="[{required: true, message: '请填写该层的总容量', trigger: ['blur']}]">
                    <el-input v-model="item.value" placeholder="请填写该层的总容量"
                              onKeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" type="number"></el-input>
                    <el-button type="danger" @click.prevent="removeFloor(item)">删除</el-button>
                </el-form-item>
            </div>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogClose">取 消</el-button>
            <el-button type="primary" @click="handleSure">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import './ConfigManagement.less';
    export default {
        name: 'ShelfTypeModule',
        data(){
            return{
                rules:{
                    name: [
                        { required: true, message: '请输入货架类型名称', trigger: ['blur'] },
                        { max: 50, message: '最多输入50个字符', trigger: 'blur' }
                    ],
                }
            }
        },
        props:{
            moduleInfo: {
                type: Object,
                default: function () {
                    return {
                        visible:false,
                        title: '',
                        id:-1
                    }
                }
            },
            ShelfForm: {
                type: Object,
                default: function () {
                    return {
                        type: 0,
                        name:'',
                        floors:[{
                            value: ''
                        }]
                    }
                }
            },

        },
        mounted() {
        },
        watch:{
        },
        computed:{
            back_shelf_capacity: function () {
                return (data) => {
                    let shelf_capacity = 0;
                    if(data){
                        data.forEach((ev)=>{
                            console.log('ev', ev.value);
                            shelf_capacity = Number(shelf_capacity) + Number(ev.value);
                        })
                    }
                    return shelf_capacity;
                }
            },
        },
        methods:{
            // 弹窗关闭前操作
            dialogClose(){
                //
                this.$refs['moduleForm'].clearValidate();
                this.$refs['moduleForm'].resetFields();
                this.$emit('closeModule');
            },
            handleSure(){
                this.$refs['moduleForm'].validate((valid) => {
                    if (valid) {
                        let params ={};
                        params['name'] = this.ShelfForm.name;
                        if(this.ShelfForm.floors.length > 0){
                            let arr = [];
                            this.ShelfForm.floors.forEach((ev)=>{
                                arr.push(ev.value);
                            })
                            params['content'] = arr.join();
                            if(this.moduleInfo.title !== '新增货架类型'){
                                params['id'] = this.moduleInfo.id;
                            }else {
                                params['type'] = Number(this.ShelfForm.type);
                            }
                            this.$emit('handleModuleSure', params);
                        }else {
                            this.$notify({
                                title: '至少添加一层货架层',
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                            this.addFloor();
                        }
                    }
                })
            },
            // 删除货架层
            removeFloor(item){
                const index = this.ShelfForm.floors.indexOf(item)
                if (index !== -1) {
                    this.ShelfForm.floors.splice(index, 1);
                }
            },
            // 添加货架层
            addFloor() {
                this.ShelfForm.floors.push({
                    // key: Date.now(),
                    value: ''
                });
            }
        }
    };
</script>