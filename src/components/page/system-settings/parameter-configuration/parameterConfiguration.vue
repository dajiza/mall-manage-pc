<template>
    <div class="parameter-config-container container-wrap">
        <div class="container container-table-no-search p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>参数配置</span>
                </div>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" :height="tableHeight">
                <el-table-column prop="sort" label="编号" width="75" align="left" type="index">
                </el-table-column>
                <el-table-column prop="config_key" label="参数名称"></el-table-column>
                <el-table-column prop="remark" label="备注"></el-table-column>
                <el-table-column prop="parameterValue" width="280" label="参数值">
                    <template slot-scope="scope">
                        <el-popover
                                placement="bottom"
                                title=""
                                width="228"
                                trigger="click"
                                :content="scope.row.value">
                            <el-input
                                slot="reference"
                                class="parameter-input"
                                placeholder="请输入"
                                v-model="scope.row.value"
                                :disabled="scope.row.status === 1"
                            ></el-input>
                        </el-popover>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="156">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            v-hasPermission="'mall-backend-config-update'"
                            :disabled="scope.row.status === 1"
                            @click="handleSave(scope.$index, scope.row)"
                        >保存</el-button>
                    </template>
                </el-table-column>
                <template  slot="empty" >
                    <EmptyList></EmptyList>
                </template>
            </el-table>
        </div>
    </div>
</template>
<script>
import './parameterConfiguration.less';
import { queryConfigList, updateConfig } from '../../../../api/configManagement';
import EmptyList from '../../../common/empty-list/EmptyList';
export default {
    name: 'ParameterConfiguration',
    data() {
        return {
            tableData: [],
            loading: false,
            tableHeight: 'calc(100% - 134px)'
        };
    },
    components:{
        EmptyList
    },
    mounted() {
        // 获取配置列表
        this.getListData();
    },
    methods: {
        // 获取配置列表
        getListData(){
            const rLoading = this.openLoading();
            let params = {};
            queryConfigList(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    if(res.data){
                        this.tableData = res.data;
                    }else {
                        this.tableData = [];
                    }
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }

            }).catch(() => {});
        },
        // 保存操作
        handleSave(index,row){
            const rLoading = this.openLoading();
            let params = {
                id: row.id,
                value: row.value,
            };
            updateConfig(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.$notify({
                        title: '保存成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    this.getListData();
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }

            }).catch(() => {});
        },
    }
};
</script>