<template>
    <div class="app-container">
        <div class="page-title">
            运费模板
            <el-radio-group v-model="type" class="tab-way" size="mini" @change="onTabClick">
                <el-radio-button :label="1">普通用户</el-radio-button>
                <el-radio-button :label="2">批发用户</el-radio-button>
            </el-radio-group>
            <el-button size="mini" type="primary" :disabled="type == 2 && list != null" @click="gotoCreat" icon="el-icon-plus" v-hasPermission="'mall-backend-freight-creat'">
                新增模板
            </el-button>
        </div>
        <div class="list">
            <div class="item" v-for="(item, index) in list" :key="item.id">
                <div class="title">
                    <div class="title-left">
                        <span class="name">{{ item.name }}</span>
                        <div class="is-default" v-show="item.is_default === 2">默认</div>
                        <div class="is-free" v-show="item.is_free === 1 && item.is_strategy === 2">
                            <div class="icon-tip"></div>
                            <span class="tip-text">指定条件包邮</span>
                        </div>
                    </div>
                    <div class="btn">
                        <el-button class="title-btn" type="text" v-show="item.is_default !== 2" @click="handleSetDefault(index, item)">设为默认</el-button>
                        <div class="line" v-show="item.is_default !== 2"></div>
                        <el-button class="title-btn" type="text" v-hasPermission="'mall-backend-freight-copy'" @click="copy(item.id)">复制模板</el-button>
                        <div class="line"></div>
                        <el-button class="title-btn" type="text" v-hasPermission="'mall-backend-freight-update'" @click="edit(item.id)">修改</el-button>
                        <div class="line" v-show="item.is_default !== 2"></div>
                        <el-button class="title-btn" type="text" @click="handleDelete(index, item)" v-show="item.is_default !== 2">删除</el-button>
                        <!--<div class="line"></div>-->
                    </div>
                </div>
                <el-table :data="item.detail" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
                    <el-table-column label="运送到">
                        <template slot-scope="scope">
                            <span class="area" v-if="scope.row.is_default === 2">默认其它</span>
                            <span class="area" v-else>{{ backArea(scope.row.place) }}</span>
                            <span class="tag" v-if="scope.row.is_free === 2">包邮</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="item.type == 1 ? '首件数(件)' : '首重量(g)'" width="120">
                        <template slot-scope="scope">
                            <span>{{ scope.row.is_free === 2 ? '0' : scope.row.first_num }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="运费(元)" width="120">
                        <template slot-scope="scope">
                            <span>{{ scope.row.is_free === 2 ? '0' : scope.row.first_money / 100 }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="item.type == 1 ? '续件数(件)' : '续重量(g)'" width="120">
                        <template slot-scope="scope">
                            <span>{{ scope.row.is_free === 2 ? '0' : scope.row.continue_num }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="运费(元)" width="120">
                        <template slot-scope="scope">
                            <span>{{ scope.row.is_free === 2 ? '0' : scope.row.continue_money / 100 }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>
<script>
import { queryFreightList, deleteFreight, updateDefaultFreight } from '@/api/freight'
import { formatMoney } from '@/plugin/tool'

export default {
    data() {
        return {
            list: null,
            total: 0,
            type: 1
        }
    },

    created() {},
    mounted() {
        this.getList()
    },
    computed: {
        backArea: function() {
            return data => {
                let includeArea = '',
                    includeAreaArr = []

                if (data) {
                    data.forEach(ev => {
                        includeAreaArr.push(ev.area_name)
                    })
                    includeArea = includeAreaArr.join(',')
                }
                return includeArea
            }
        }
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            const rLoading = this.openLoading()
            queryFreightList({ type: this.type })
                .then(res => {
                    rLoading.close()
                    console.log('GOOGLE: res', res)
                    this.list = res.data
                })
                .catch(err => {})
        },
        edit(id) {
            this.$router.push({
                name: 'freightCreat',
                query: {
                    id: id
                }
            })
        },
        copy(id) {
            this.$router.push({
                name: 'freightCreat',
                query: {
                    id: id,
                    mark: 'copy'
                }
            })
        },

        /**
         * 删除 运费模版
         */
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除该模版吗？', '', {
                customClass: 'message-delete',
                type: 'warning'
            })
                .then(() => {
                    let params = {}
                    params['id'] = row.id
                    const rLoading = this.openLoading()
                    deleteFreight(params)
                        .then(res => {
                            rLoading.close()
                            if (res.code === 200) {
                                this.$notify({
                                    title: '删除成功',
                                    message: '',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.getList()
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    message: '',
                                    type: 'error',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
                })
                .catch(() => {})
        },

        /**
         * 设为默认
         */
        handleSetDefault(index, item) {
            let params = {
                is_default: 2
            }
            params['id'] = item.id
            updateDefaultFreight(params)
                .then(res => {
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        this.getList()
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(err => {})
        },
        gotoCreat() {
            this.$router.push({
                path: '/mall-backend-freightCreat',
                query: {
                    is_discount: this.type
                }
            })
        },
        // tab
        onTabClick() {
            this.getList()
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.page-title {
    display: flex;
    align-items: center;
    // justify-content: space-between;
    box-sizing: border-box;
    padding: 16px 24px;
    width: 100%;
    border-radius: 2px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 20px;
}
.tab-way {
    margin: 0 30px 0 auto;
}
.list {
    .area {
        margin-right: 20px;
    }
    .tag {
        padding: 2px 8px;
        border-radius: 11px;
        background: #1890ff;
        color: #ffffff;
        white-space: nowrap;
        font-weight: 400;
        font-size: 12px;
        line-height: 21px;
    }
    .item {
        margin-top: 20px;
        border-radius: 2px;
        .title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            height: 40px;
            border: 1px solid #bae7ff;
            background: #e6f7ff;
            color: rgba(0, 0, 0, 0.8);
            .title-left {
                display: flex;
                align-items: center;
                .name {
                    color: rgba(0, 0, 0, 0.8);
                    font-weight: 600;
                    font-size: 14px;
                    font-family: PingFangSC-Semibold, PingFang SC;
                    line-height: 20px;
                }
                .is-default {
                    margin-left: 12px;
                    width: 40px;
                    height: 20px;
                    border-radius: 11px;
                    background: #52c41a;
                    color: #ffffff;
                    text-align: center;
                    font-weight: 400;
                    font-size: 12px;
                    font-family: PingFangSC-Regular, PingFang SC;
                    line-height: 20px;
                }
                .is-free {
                    display: flex;
                    align-items: center;
                    margin-left: 30px;
                    .icon-tip {
                        display: inline-block;
                        margin-right: 5px;
                        width: 17px;
                        height: 16px;
                        background: url('../../../assets/img/Shape.png') no-repeat center center;
                        background-size: 100%;
                        vertical-align: text-bottom;
                    }
                    .tip-text {
                        color: rgba(0, 0, 0, 0.8);
                        font-weight: 400;
                        font-size: 14px;
                        font-family: PingFangSC-Regular, PingFang SC;
                        line-height: 20px;
                    }
                }
            }
            .btn {
                display: flex;
                align-items: center;
                padding-right: 9px;
                .title-btn {
                    color: rgba(0, 0, 0, 0.65);
                }
                .line {
                    margin: 0 12px;
                    width: 1px;
                    height: 16px;
                    background: #b6e2fa;
                }
            }
        }
    }
}
</style>
