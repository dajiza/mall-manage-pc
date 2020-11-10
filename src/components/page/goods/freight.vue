<template>
    <div class="app-container">
        <div class="page-title">
            运费模板
            <router-link class="" to="./freightCreat">
                <el-button size="small" type="primary" icon="el-icon-plus">新增模板</el-button>
            </router-link>
        </div>
        <div class="list">
            <div class="item" v-for="item in list">
                <div class="title">
                    <span class="name">{{ item.name }}</span>
                    <div class="btn">
                        <el-button class="title-btn" type="text">复制模板</el-button>
                        <div class="line"></div>
                        <el-button class="title-btn" type="text">修改</el-button>
                        <div class="line"></div>
                        <el-button class="title-btn" type="text">删除</el-button>
                        <div class="line"></div>
                    </div>
                </div>
                <el-table :data="item.detail" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit highlight-current-row>
                    <el-table-column label="运送到">
                        <template slot-scope="scope">
                            <span>{{ scope.row.goods_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="首件数(件)">
                        <template slot-scope="scope">
                            <span>{{ scope.row.goods_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="运费(元)">
                        <template slot-scope="scope">
                            <span>{{ scope.row.goods_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="续件数(件)">
                        <template slot-scope="scope">
                            <span>{{ scope.row.goods_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="运费(元)">
                        <template slot-scope="scope">
                            <span>{{ scope.row.goods_name }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>
<script>
import { queryFreightList } from '@/api/freight';
import { formatMoney } from '@/plugin/tool';

export default {
    data() {
        return {
            list: null,
            total: 0
        };
    },

    created() {},
    mounted() {
        this.getList();
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
        }
    }
};
</script>
<style scoped="scoped" lang="less">
.page-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 16px 24px;
    width: 100%;
    border-radius: 2px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 20px;
}
.list {
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
            .btn {
                display: flex;
                align-items: center;
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
