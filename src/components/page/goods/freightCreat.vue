<template>
    <div class="app-container">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">新增模板</div>
        </div>
        <div class="divider"></div>

        <el-form class="freight-form" :model="info" :rules="rules" ref="formRef" label-width="80px" label-position="left">
            <el-form-item label="专题名称" prop="name">
                <el-input style="width:380px" placeholder="模板名称" v-model="info.name"></el-input>
            </el-form-item>
            <el-form-item label="是否包邮">
                {{ info.is_free }}
                {{ info.type }}
                <el-radio v-model="info.is_free" label="2">是</el-radio>
                <el-radio v-model="info.is_free" label="1">否</el-radio>
            </el-form-item>
            <el-form-item label="计价方式">
                <el-radio v-model="info.type" label="1">按数量</el-radio>
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
                            {{ index }}
                            <el-checkbox v-model="checkListNum[index]"></el-checkbox>
                            <div class="city">
                                {{ item.place.map(item => item.area_name).join('、') }}
                            </div>
                            <el-button class="" type="text">编辑</el-button>
                        </div>
                        <!-- 包邮 -->
                        <div class="row"><el-checkbox v-model="item.is_free"></el-checkbox></div>

                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.first_num'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" v-model="item.first_num"></el-input>
                            </el-form-item>
                        </div>
                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.first_money'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" v-model="item.first_money"></el-input>
                            </el-form-item>
                        </div>
                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.continue_num'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" v-model="item.continue_num"></el-input>
                            </el-form-item>
                        </div>
                        <div class="row">
                            <el-form-item label="" label-width="0px" :prop="'detail.' + index + '.continue_money'" :rules="rulesRequired">
                                <el-input class="row-input" placeholder="" v-model="item.continue_money"></el-input>
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
                        <el-checkbox class="check-all" v-model="isFree">全选</el-checkbox>
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
        </el-form>
        <div class="divider"></div>
        <div class="condition" v-if="info.is_free == 1">
            <el-checkbox v-model="isFree">指定条件包邮(选填)</el-checkbox>
            <div class="table">
                <div class="th">
                    <div class="row row-first">选择地区</div>
                    <div class="row">包邮条件</div>
                    <div class="row">金额/数量</div>
                    <div class="row"><el-button class="" type="text">新增</el-button></div>
                </div>
                <div class="tr">
                    <div class="row row-first">
                        <el-checkbox v-model="isFree"></el-checkbox>
                        <div class="city">
                            北京、天津、山西省、山东省、河北省、内蒙古自治区、南京市、无锡市、徐州市
                        </div>
                        <el-button class="" type="text">编辑</el-button>
                    </div>
                    <div class="row"><el-input class="row-input" placeholder="" v-model="isFree"></el-input></div>
                    <div class="row"><el-input class="row-input" placeholder="" v-model="isFree"></el-input></div>
                    <div class="row"><el-button class="" type="text">删除</el-button></div>
                </div>
            </div>
        </div>
        <el-button type="primary" @click="creat">主要按钮</el-button>
    </div>
</template>
<script>
import { creatFreight } from '@/api/freight';
import { formatMoney } from '@/plugin/tool';

export default {
    data() {
        return {
            list: null,
            isMultipleOperate: true,
            checkListNum: [false],
            // 空白
            detailBlank: {
                is_default: 1,
                is_free: 0,
                first_num: 0,
                first_money: 0,
                continue_num: 0,
                continue_money: 0,
                place: []
            },
            info: {
                name: '我的模版6677',
                is_default: 1,
                is_free: '1', //是否包邮，1:否，2是
                type: '1',
                is_strategy: 2,
                remark: 'ddd',
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
                    {
                        type: 2,
                        num: 2,
                        place: [
                            {
                                area_code: '222',
                                area_name: '北京'
                            },
                            {
                                area_code: '333',
                                area_name: '浙江'
                            }
                        ]
                    }
                ]
            },
            isFree: '',
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                ]
                // 'module.id': [{ required: true, message: '请选择模块', trigger: 'blur' }]
                // articleList: [{ required: true, message: '请选择测评文章', trigger: 'blur' }]
            },
            rulesRequired: [{ required: true, message: '请输入内容', trigger: 'blur' }]
        };
    },

    created() {},
    mounted() {
        // this.getList();
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            queryFreightList()
                .then(res => {
                    console.log('GOOGLE: res', res);
                    this.list = res.data;
                })
                .catch(err => {});
        },
        // 创建模板
        creat() {
            console.log('GOOGLE: this.info', this.info);
        },
        // 单个删除
        deleteDefault(index) {
            this.info.detail.splice(index, 1);
            this.checkListNum.splice(index, 1);
        },
        // 批量删除
        deleteMultiple(index) {
            console.log('GOOGLE: this.checkListNum', this.checkListNum);
        },
        addDefault() {
            this.info.detail.push(this.detailBlank);
            this.checkListNum.push(false);
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
    .el-form-item {
        margin-bottom: 0;
    }
    .default {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        // height: 50px;
        background: #ebf4ff;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);

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
    padding: 20px 40px 40px;
    background: #fff;
    .table {
        margin-top: 20px;
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
            width: 200px;
        }
        .row-first {
            width: 300px;
        }
    }
}
</style>
