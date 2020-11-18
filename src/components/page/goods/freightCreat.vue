<template>
    <div class="app-container">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">{{ this.info.id ? '编辑' : '新增' }}模板</div>
        </div>
        <div class="divider"></div>

        <el-form class="freight-form" :model="info" :rules="rules" ref="formRef" label-width="80px" label-position="left">
            <el-form-item label="专题名称" prop="name">
                <el-input style="width:380px" placeholder="模板名称" v-model="info.name"></el-input>
            </el-form-item>
            <el-form-item label="是否包邮">
                <el-radio v-model="info.is_free" :label="2">是</el-radio>
                <el-radio v-model="info.is_free" :label="1">否</el-radio>
            </el-form-item>
            <el-form-item label="计价方式">
                <el-radio v-model="info.type" :label="1">按数量</el-radio>
            </el-form-item>
            <!-- <el-form-item label="" label-width="0px" v-if="info.is_free == 1"> -->
            <template v-if="info.is_free == 1">
                <div class="default">
                    <div class="caption">默认其他运费</div>
                    <el-form-item label="" label-width="0px" prop="detail.0.first_num" :rules="rulesRequired">
                        <el-input class="default-input" placeholder="" v-model="info.detail[0].first_num"></el-input>
                    </el-form-item>
                    <div class="quantifier">件内</div>
                    <el-form-item label="" label-width="0px" prop="detail.0.first_money" :rules="rulesRequired">
                        <el-input class="default-input" placeholder="" v-model="info.detail[0].first_money"></el-input>
                    </el-form-item>
                    <div class="quantifier">元</div>
                    <div class="label">每增加</div>
                    <el-form-item label="" label-width="0px" prop="detail.0.continue_num" :rules="rulesRequired">
                        <el-input class="default-input" placeholder="" v-model="info.detail[0].continue_num"></el-input>
                    </el-form-item>
                    <div class="quantifier">件</div>
                    <div class="label">增加运费</div>
                    <el-form-item label="" label-width="0px" prop="detail.0.continue_money" :rules="rulesRequired">
                        <el-input class="default-input" placeholder="" v-model="info.detail[0].continue_money"></el-input>
                    </el-form-item>
                    <div class="quantifier">元</div>
                </div>
                <div class="table" v-if="info.detail.length > 1">
                    <div class="th">
                        <div class="row row-first">运送到</div>
                        <div class="row">包邮</div>
                        <div class="row">首数量(件)</div>
                        <div class="row">首费(元)</div>
                        <div class="row">续数量(件)</div>
                        <div class="row">续费(元)</div>
                        <div class="row">操作</div>
                    </div>
                    <div class="tr" v-for="(item, index) in info.detail" v-if="index > 0">
                        <div class="row row-first">
                            <!-- 批量操作 -->
                            <el-checkbox v-model="checkListNum[index]"></el-checkbox>
                            <div class="city">
                                {{ item.place.map(item => item.area_name).join('、') || '未添加地区' }}
                            </div>
                            <el-button class="" type="text" @click="openAreaList(index, 1)">编辑</el-button>
                        </div>
                        <!-- 包邮 -->
                        <div class="row">
                            <el-checkbox v-model="item.is_free" :true-label="2" :false-label="1" @change="val => handleCheckChange(val, index)"></el-checkbox>
                        </div>

                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.first_num'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" :disabled="item.is_free == 2" v-model="item.first_num"></el-input>
                            </el-form-item>
                        </div>
                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.first_money'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" :disabled="item.is_free == 2" v-model="item.first_money"></el-input>
                            </el-form-item>
                        </div>
                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.continue_num'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" :disabled="item.is_free == 2" v-model="item.continue_num"></el-input>
                            </el-form-item>
                        </div>
                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.continue_money'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" :disabled="item.is_free == 2" v-model="item.continue_money"></el-input>
                            </el-form-item>
                        </div>

                        <div class="row">
                            <el-popconfirm class="confirm" title="确定删除" @onConfirm="deleteDefault(index)">
                                <el-button slot="reference" class="" type="text">删除</el-button>
                            </el-popconfirm>
                        </div>
                    </div>
                </div>
                <div class="operation">
                    <div class="select-all" v-if="isMultipleOperate">
                        <el-checkbox class="check-all" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                        <el-popconfirm class="confirm" title="确定删除" @onConfirm="deleteMultiple">
                            <el-button slot="reference" class="delete-multiple" type="text">批量删除</el-button>
                        </el-popconfirm>
                    </div>
                    <div class="entry">
                        <div class="text" @click="addDefault">为指定地区城市设置运费</div>
                        <el-button class="" type="text" @click="isMultipleOperate = !isMultipleOperate">{{
                            isMultipleOperate ? '取消批量' : '批量操作'
                        }}</el-button>
                    </div>
                </div>
            </template>
            <!-- </el-form-item> -->

            <!-- <el-form-item label="模块" prop="">
                <el-select v-model="info.module.id" style="width:250px">
                    <el-option v-for="item in mdList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                </el-select>
            </el-form-item> -->

            <div class="divider"></div>
            <div class="condition" v-if="info.is_free == 1">
                <el-checkbox v-model="info.is_strategy" :true-label="2" :false-label="1">指定条件包邮(选填)</el-checkbox>
                <div class="table" v-if="info.is_strategy == 2">
                    <div class="th">
                        <div class="row row-first">选择地区</div>
                        <div class="row">包邮条件</div>
                        <div class="row">金额/数量</div>
                        <div class="row"><el-button class="" type="text" @click="addCondition">新增</el-button></div>
                    </div>
                    <div class="tr" v-for="(item, index) in info.strategy">
                        <div class="row row-first">
                            <div class="city">
                                {{ item.place.map(item => item.area_name).join('、') || '未添加地区' }}
                            </div>
                            <el-button class="" type="text" @click="openAreaList(index, 2)">编辑</el-button>
                        </div>
                        <div class="row">
                            <el-select v-model="item.type" style="width:100px">
                                <el-option v-for="item in strategyTypeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </div>
                        <div class="row  row-num">
                            <div class="quantifier">满</div>
                            <el-form-item label="" label-width="0px" :prop="'strategy.' + index + '.num'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" v-model="item.num"></el-input>
                            </el-form-item>
                            <div class="label">包邮</div>
                        </div>

                        <div class="row">
                            <el-popconfirm class="confirm" title="确定删除" @onConfirm="deleteCondition(index)">
                                <el-button slot="reference" class="" type="text">删除</el-button>
                            </el-popconfirm>
                        </div>
                    </div>
                </div>
            </div>
            <el-button type="primary" @click="creat">保存并返回</el-button>
        </el-form>
        <!-- 区域弹窗 -->
        <area-list ref="areaList" @check-area="getArea" :initArea="initArea"></area-list>
    </div>
</template>
<script>
import { creatFreight, queryFreight, updateFreight } from '@/api/freight';
import { formatMoney } from '@/plugin/tool';
import areaList from '@/components/common/area-list/AreaList';
export default {
    data() {
        return {
            list: null,
            isMultipleOperate: false,
            checkAll: false,
            initArea: [], //选中的区域
            checkListNum: [false],
            areaIndex: 0, //选中的区域运费index
            areaMark: 0, //记录哪里打开的地址添加 1:按数量 2:按条件

            info: {
                name: '',
                is_default: 1, //是否默认 1:否，2是
                is_free: 1, //是否包邮，1:否，2是
                type: 1, //计价方式
                is_strategy: 1, //是否有条件模板，1:否，2是
                remark: ' ',
                detail: [
                    {
                        is_default: 2,
                        is_free: 1,
                        first_num: 0,
                        first_money: 0,
                        continue_num: 0,
                        continue_money: 0
                    }
                    // {
                    //     is_default: 1,
                    //     is_free: 1,
                    //     first_num: 1,
                    //     first_money: 5,
                    //     continue_num: 2,
                    //     continue_money: 2,
                    //     place: [
                    //         {
                    //             area_code: '222',
                    //             area_name: '北京'
                    //         },
                    //         {
                    //             area_code: '333',
                    //             area_name: '浙江'
                    //         }
                    //     ]
                    // }
                ],
                strategy: [
                    // {
                    //     type: '2', //1按件  2按金额
                    //     num: 2,
                    //     place: [
                    //         {
                    //             area_code: '222',
                    //             area_name: '北京'
                    //         },
                    //         {
                    //             area_code: '333',
                    //             area_name: '浙江'
                    //         }
                    //     ]
                    // }
                ]
            },
            strategyTypeList: [
                {
                    label: '件数',
                    value: 1
                },
                {
                    label: '金额',
                    value: 2
                }
            ],
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                ]
                // 'module.id': [{ required: true, message: '请选择模块', trigger: 'blur' }]
                // articleList: [{ required: true, message: '请选择测评文章', trigger: 'blur' }]
            },
            rulesNone: [],
            rulesRequired: [{ required: true, message: '请输入内容', trigger: 'change' }]
        };
    },
    components: {
        areaList
    },
    created() {
        var id = this.$route.params.id;
        var mark = this.$route.params.mark;
        console.log('GOOGLE: mark', mark);
        if (id) {
            let params = {
                id: id
            };
            queryFreight(params)
                .then(res => {
                    var detail = res.data;
                    console.log('GOOGLE: detail', detail);
                    // format 金额
                    for (let i = 0; i < detail.detail.length; i++) {
                        const element = detail.detail[i];
                        element.first_money = Number(element.first_money) / 100;
                        element.continue_money = Number(element.continue_money) / 100;
                    }
                    if (detail.strategy) {
                        for (let i = 0; i < detail.strategy.length; i++) {
                            const element = detail.strategy[i];
                            if (element.type == 2) {
                                element.num = Number(element.num) / 100;
                            }
                        }
                    } else {
                        detail.strategy = [];
                    }
                    if (mark == 'copy') {
                        delete detail.id;
                    }
                    this.info = detail;
                    console.log('GOOGLE: this.info', this.info);
                })
                .catch(err => {});
        }
    },
    mounted() {},
    methods: {
        formatMoney: formatMoney,

        /**
         * 打开区域选择
         * @param   mark 1:按数量 2:按条件
         */
        openAreaList(index, mark) {
            this.areaIndex = index;
            if (mark == 1) {
                this.initArea = this.info.detail[index].place;
            } else {
                this.initArea = this.info.strategy[index].place;
            }
            this.areaMark = mark;
            this.$refs.areaList.show();
        },
        // 单个删除
        deleteDefault(index) {
            this.info.detail.splice(index, 1);
            this.checkListNum.splice(index, 1);
        },
        // 批量删除
        deleteMultiple(index) {
            console.log('GOOGLE: this.checkListNum', this.checkListNum);
            for (let i = 0; i < this.checkListNum.length; i++) {
                const element = this.checkListNum[i];
                if (element) {
                    this.info.detail.splice(i, 1);
                    this.checkListNum.splice(i, 1);
                    i--;
                }
            }
        },
        // 全选
        handleCheckAllChange(val) {
            // this.checkedCities = val ? cityOptions : [];
            this.checkAll = val;
            for (let i = 1; i < this.checkListNum.length; i++) {
                this.$set(this.checkListNum, i, val);
            }
        },
        // check 单选
        handleCheckChange(val, indexSign) {
            if (!val) {
                return;
            }
            this.info.detail.map((item, index) => {
                if (indexSign == index) {
                    item.first_num = item.first_num || 0;
                    item.first_money = item.first_money || 0;
                    item.continue_num = item.continue_num || 0;
                    item.continue_money = item.continue_money || 0;
                    return item;
                }
            });
        },
        addDefault() {
            this.info.detail.push({
                is_default: 1,
                is_free: false,
                first_num: 0,
                first_money: 0,
                continue_num: 0,
                continue_money: 0,
                place: []
            });
            this.checkListNum.push(false);
        },
        getArea(data) {
            if (this.areaMark == 1) {
                this.info.detail[this.areaIndex].place = data;
            } else {
                this.info.strategy[this.areaIndex].place = data;
            }
            // this.$set(this.checkListNum, i, val);
            console.log('GOOGLE: data', data);
        },

        // 新增条件包邮
        addCondition() {
            this.info.strategy.push({
                type: 1, //1按件  2按金额
                num: 1,
                place: []
            });
        },
        // 单个删除条件包邮
        deleteCondition(index) {
            this.info.strategy.splice(index, 1);
        },
        // 创建模板
        creat() {
            this.$refs['formRef'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    // 深拷贝
                    var params = _.cloneDeep(this.info);

                    params.is_default = Number(params.is_default);
                    params.is_free = Number(params.is_free);
                    params.type = Number(params.type);
                    params.is_strategy = Number(params.is_strategy);
                    // 包邮
                    if (this.info.is_free == 2) {
                        delete params.detail;
                        delete params.strategy;
                    } else {
                        // 验证按数量计价的地区
                        for (let i = 0; i < params.detail.length; i++) {
                            const element = params.detail[i];
                            element.is_default = Number(element.is_default);
                            element.first_num = Number(element.first_num);
                            element.first_money = Number(element.first_money) * 100;
                            element.continue_num = Number(element.continue_num);
                            element.continue_money = Number(element.continue_money) * 100;
                            if (i == 0) {
                                continue;
                            }
                            if (element.place.length == 0) {
                                this.$notify({
                                    title: '请编辑按数量计价第' + i + '条策略的地区',
                                    type: 'warning',
                                    duration: 3000
                                });
                                return;
                            }
                        }
                        // 验证指定条件的地区 及处理件数/金额 数据
                        if (params.is_strategy == 2) {
                            if (params.strategy.length == 0) {
                                this.$notify({
                                    title: '请添加指定条件包邮的策略',
                                    type: 'warning',
                                    duration: 3000
                                });
                                return;
                            } else {
                                for (let i = 0; i < params.strategy.length; i++) {
                                    const element = params.strategy[i];

                                    if (element.place.length == 0) {
                                        let index = i + 1;
                                        this.$notify({
                                            title: '请编辑指定条件包邮第' + index + '条策略的地区',
                                            type: 'warning',
                                            duration: 3000
                                        });
                                        return;
                                    }
                                    element.type = Number(element.type);
                                    if (element.type == 2) {
                                        element.num = Number(element.num) * 100;
                                    }
                                }
                            }
                        } else {
                            delete params.strategy;
                        }
                    }
                    if (this.info.id) {
                        // 修改
                        updateFreight(params)
                            .then(res => {
                                console.log('GOOGLE: res', res);
                                if (res.code == 200) {
                                    this.$notify({
                                        title: '运费模板修改成功',
                                        type: 'success',
                                        duration: 3000
                                    });
                                    this.$router.push({
                                        path: 'mall-backend-freight'
                                    });
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        type: 'warning',
                                        duration: 3000
                                    });
                                }
                            })
                            .catch(err => {});
                    } else {
                        // 新建
                        creatFreight(params)
                            .then(res => {
                                console.log('GOOGLE: res', res);
                                if (res.code == 200) {
                                    this.$notify({
                                        title: '运费模板创建成功',
                                        type: 'success',
                                        duration: 3000
                                    });
                                    this.$router.push({
                                        path: 'mall-backend-freight'
                                    });
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        type: 'warning',
                                        duration: 3000
                                    });
                                }
                            })
                            .catch(err => {});
                    }
                } else {
                    this.$notify({
                        title: '请填写完整后再提交',
                        type: 'warning',
                        duration: 3000
                    });
                }
            });

            // 格式化数据
            // params.detail.map((item, index) => {
            //     if (index == 0) {
            //         return item;
            //     } else {
            //         // 是否包邮，1:否，2是
            //         item.is_free = item.is_free ? '2' : '1';
            //         return item;
            //     }
            // });
            // console.log('GOOGLE: params', params);
        }
    }
};
</script>
<style scoped="scoped" lang="less">
.divider {
    width: 100%;
    height: 1px;
    background: #e9e9e9;
}
.freight-form {
    padding: 40px;
    background: #fff;
    .divider {
        margin: 40px 0 20px;
    }
    .default {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 15px 20px;
        max-width: 800px;
        // height: 50px;
        background: #ebf4ff;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
        .el-form-item {
            margin-bottom: 0;
        }

        & /deep/ .el-form-item__error {
            margin-left: 10px;
        }
        .default-input {
            margin: 0 10px;
            width: 80px;
        }
        .caption {
            margin-right: 20px;
        }
        .label {
            margin-left: 20px;
        }
        .quantifier {
            color: rgba(0, 0, 0, 0.6);
        }
    }
    .table {
        max-width: 800px;

        .el-form-item {
            margin-bottom: 0;
        }
        .th {
            display: flex;
            align-items: center;
            padding: 0px 20px;
            height: 50px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: #f4f4f4;
            color: rgba(0, 0, 0, 0.85);
            font-weight: 600;
        }
        .tr {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-top: none;
            .row-first {
                display: flex;
                align-items: center;
                box-sizing: border-box;
                padding-right: 30px;
                .city {
                    padding: 0 10px;
                }
            }
            .row-input {
                width: 60px;
            }
        }
        .row {
            width: 100px;
        }
        .row-first {
            width: 300px;
        }
    }
    .operation {
        padding-top: 20px;
        .select-all {
            margin: 00px 20px 10px;
            .delete-multiple {
                color: #ff4d4f;
            }
            .check-all {
                width: 180px;
            }
        }
        .entry {
            display: flex;
            .text {
                width: 200px;
                color: #1890ff;
                cursor: pointer;
            }
        }
    }
}
.condition {
    padding: 0px 0px 40px;
    background: #fff;
    .table {
        margin-top: 20px;
        max-width: 800px;
        & /deep/ .el-form-item__error {
            margin-left: 10px;
        }
        .th {
            display: flex;
            align-items: center;
            padding: 0px 20px;
            height: 50px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: #f4f4f4;
            color: rgba(0, 0, 0, 0.85);
            font-weight: 600;
        }
        .tr {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-top: none;
            .row-first {
                display: flex;
                align-items: center;
                box-sizing: border-box;
                // padding-right: 30px;
                .city {
                    padding: 0 10px;
                }
            }
            .row-input {
                width: 60px;
            }
        }
        .row {
            width: 200px;
        }
        .row-num {
            display: flex;
            align-items: center;
            .row-input {
                margin: 0 10px;
            }
        }
        .row-first {
            width: 300px;
        }
    }
}
</style>
