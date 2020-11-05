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
                        <span class="value text-yellow">{{ formatMoney(detail.money) }}</span>
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
        <div class="wrap goods">
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
                            <span>{{ scope.row.reason }}</span>
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
        <div class="wrap goods">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">选择退款方式</div>
            </div>
            <div class="divider"></div>

            <div class="substance">
                <div class="radio-wrap">
                    <el-radio v-model="radio" label="1">备选项</el-radio>
                    <el-radio v-model="radio" label="2">备选项</el-radio>
                </div>
                <div class="divider"></div>
                <div class="certificate">
                    <div class="sheet sheet-img">
                        <span class="label">打款凭证：</span>
                    </div>
                </div>
            </div>
        </div>
        <el-button class="" size="" type="primary" @click="handleFilter">提交</el-button>
    </div>
</template>
<script>
import { queryAfterSaleDetail, queryAfterSaleLog } from '@/api/afterSale';
import { REFUND_TYPE, REFUND_STATUS, REFUND_STEP } from '@/plugin/constant';
import { formatMoney } from '@/plugin/tool';

export default {
    data() {
        return {
            id: '',

            REFUND_TYPE,
            REFUND_STATUS,
            REFUND_STEP,
            detail: null,
            list: null,
            logList: null,
            listLoading: false,
            radio: ''
        };
    },

    created() {
        this.id = this.$route.params.id || 61;
        console.log('GOOGLE: this.id', this.id);
        this.getDetail();
        this.getLog();
    },
    mounted() {},
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
                    if (res.data.imgs != '') {
                        res.data.imgs = res.data.imgs.split(',');
                    }
                    this.detail = res.data;
                    this.list = [];
                    this.list.push(res.data);
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
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val;
            this.getList();
        },
        handleCurrentChange(val) {
            this.listQuery.page = val;
            this.getList();
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
    }
}
</style>
