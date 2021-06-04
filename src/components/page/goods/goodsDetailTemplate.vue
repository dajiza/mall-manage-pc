<template>
    <div class="app-container goods-list" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">详情页模版</div>
            <template v-if="false">
                <div class="grey-line"></div>
                <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                <transition name="slide-fade">
                    <div class="head-container" v-show="searchShow" @click.stop="">
                        <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left">
                            <el-form-item label="页面名称" prop="title" class="">
                                <el-input class="filter-item" v-model="formFilter.title" placeholder="请输入"></el-input>
                            </el-form-item>

                            <el-form-item label="创建时间" prop="searchTime" class="long-time">
                                <el-date-picker
                                        class="filter-item"
                                        v-model="formFilter.searchTime"
                                        type="datetimerange"
                                        range-separator="至"
                                        align="left"
                                        start-placeholder="开始时间"
                                        end-placeholder="结束时间"
                                        value-format="yyyy-MM-dd HH:mm:ss"
                                        :default-time="['00:00:00', '23:59:59']"
                                        :picker-options="pickerOptions"
                                >
                                </el-date-picker>
                            </el-form-item>

                            <el-form-item class="form-item-btn" label="">
                                <el-button class="filter-btn" @click="resetForm('formFilter')">重置</el-button>
                                <el-button class="filter-btn" type="primary" @click="handleFilter">搜索</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </transition>
                <div class="search-value" >
                    <template v-for="(item,i) in searchList">
                        <div class="search-item" v-if="i <= showMaxIndex">
                            {{item.val}}
                            <span class="tags-li-icon" @click="closeSearchItem(item,i)"><i class="el-icon-close"></i></span>
                        </div>
                    </template>
                    <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                    <div class="search-value-clone" ref="searchValueBox">
                        <template v-for="(item,i) in searchList">
                            <div class="search-item" :ref="'searchItem'+ i">
                                {{item.val}}
                                <span class="tags-li-icon"><i class="el-icon-close"></i></span>
                            </div>
                        </template>
                        <span style="width: 20px;display: inline-block">...</span>
                    </div>
                </div>
            </template>
            <el-button type="primary" @click="templateCreat" class="creat-page" v-hasPermission="'mall-backend-goods-detail-template-create'">新增</el-button>
        </div>
        <el-table :height="tableHeight" class="table" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading">
            <el-table-column prop="detailId" label="页面ID" width="100"></el-table-column>
            <el-table-column prop="title" label="页面名称"></el-table-column>
            <el-table-column prop="nickName" label="创建人" width="120"></el-table-column>
            <el-table-column label="创建时间" width="180">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_at }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="126">
                <template slot-scope="scope">
                    <el-button class="text-blue btn-opt table-btn" type="text" size="" v-hasPermission="'mall-backend-goods-detail-template-edit'" @click="templateEdit(scope.row)">
                        编辑
                    </el-button>
                    <el-button
                        class="text-red btn-opt table-btn"
                        type="text"
                        size=""
                        v-hasPermission="'mall-backend-goods-detail-template-delete'"
                        @click="templateDelete(scope.row.detailId, scope.$index)"
                    >
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { queryDetailTemplateList, deleteDetailTemplate, cacheData } from '@/api/teamwork'
import { formatMoney } from '@/plugin/tool'
import bus from '@/components/common/bus'
// import { filter } from 'vue/types/umd';

export default {
    name: 'skuStatistics',
    data() {
        return {
            listLoading: false,
            loading: false,
            list: null,
            total: 0,
            listQuery: {
                page: 1,
                limit: 10
            },
            formFilter: {
                limit: 1,
                page: 1,
                title: '',
                searchTime: '',
                created_at_le: '', // created_at <= created_at_le
                created_at_ge: ''
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            tableHeight: 'calc(100vh - 144px)',
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
        }
    },
    inject: ['reload'],
    watch:{
        'searchList':function() {
            this.$nextTick(function() {
                if (!this.$refs.searchValueBox) {
                    return;
                }
                let maxWidth = window.getComputedStyle(this.$refs.searchValueBox).width.replace('px', '')  - 20;
                let showWidth = 0;
                for(let i=0; i<this.searchList.length; i++){
                    let el = 'searchItem' + i;
                    let _width = this.$refs[el][0].offsetWidth;
                    showWidth = showWidth + Math.ceil(Number(_width)) + 8;
                    if(showWidth > maxWidth){
                        this.showMaxIndex = i-1;
                        // console.log('this.showMaxIndex', this.showMaxIndex)
                        return;
                    }
                    if(i == this.searchList.length - 1){
                        if(showWidth <= maxWidth - 20){
                            this.showMaxIndex = this.searchList.length - 1;
                        }
                    }
                }
            }.bind(this));
        }
    },
    mounted() {
        // 默认搜索7天
        // this.setDefaultDate()

        bus.$on('refresh-goods-detail-template', () => {
            this.getList()
        })
        // 默认显示全部列表
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,

        getList() {
            // let params = _.cloneDeep(this.$refs['formFilter'].model)
            //
            // if (params['searchTime'] && params['searchTime'].length == 2) {
            //     params['created_at_ge'] = params.searchTime[0]
            //     params['created_at_le'] = params.searchTime[1]
            // } else {
            //     params['created_at_ge'] = ''
            //     params['created_at_le'] = ''
            // }
            let params = {}
            // params['limit'] = this.listQuery.limit
            // params['page'] = this.listQuery.page

            queryDetailTemplateList(params)
                .then(res => {
                    console.log('res', res)
                    const _list = res.data
                    _list.forEach((ev)=>{
                        ev['created_at'] = this.renderTime(ev.createdAt)
                    })
                    this.list = _list
                    console.log('this.list', this.list)
                })
                .catch(err => {})
        },
        renderTime(date) {
            let _date = new Date(date).toJSON();
            return new Date(+new Date(_date) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
        },
        // 设置默认时间 搜索7天
        setDefaultDate() {
            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            let timeStart = start
            let timeEnd = end
            timeStart = this.$moment(timeStart).format('yyyy-MM-DD HH:mm:ss')
            timeEnd = this.$moment(timeEnd).format('yyyy-MM-DD HH:mm:ss')
            this.formFilter.searchTime = [timeStart, timeEnd]
        },
        templateCreat() {
            this.$router.push({
                path: 'mall-backend-goods-detail-template-create'
            })
        },
        templateEdit(info) {
            this.$router.push({
                path: 'mall-backend-goods-detail-template-edit',
                query: {
                    id: info.detailId
                }
            })
        },
        templateDelete(id, index) {
            this.$confirm('确定删除?', '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    deleteDetailTemplate({ detailId: id })
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '删除成功',
                                    message: '',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.reload()
                                // this.list.splice(index, 1)
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
                })
                .catch(() => {})
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.searchShow = false;
            this.setSearchValue();
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            // this.setDefaultDate()

            this.handleFilter()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            // console.log('status', this.formFilter['status'])
            // console.log('this.formFilter', this.formFilter);
            // 页面名称 title
            if(this.formFilter['title']){
                let obj = {
                    label: 'title',
                    val: this.formFilter['title']
                }
                _search.push(obj)
            }
            // 创建时间 searchTime
            if(this.formFilter['searchTime'] && this.formFilter['searchTime'].length == 2){
                console.log('searchTime', this.formFilter.searchTime);
                console.log('111', this.$moment(this.formFilter.searchTime[0]).format('YYYY-MM-DD '))
                let _ge_arr = (this.$moment(this.formFilter.searchTime[0]).format('YYYY-MM-DD ')).split('-');
                let _le_arr = (this.$moment(this.formFilter.searchTime[1]).format('YYYY-MM-DD ')).split('-');
                //  + ' '+ this.formFilter['created_time_ge'].split(' ')[1]
                let _ge = _ge_arr[1]+ '.' + _ge_arr[2];
                //  + ' '+ this.formFilter['created_time_le'].split(' ')[1]
                let _le = _le_arr[1]+ '.' + _le_arr[2];
                let obj = {
                    label: 'searchTime',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter,item.label, '');
            if(item.label == 'searchTime'){
                this.$set(this.formFilter, 'searchTime', null)
            }
            this.handleFilter()
        },
    }
}
</script>
<style scoped="scoped" lang="less">
    .head-container{
        width: 100%;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
    }
.tab-way {
    margin-left: auto;
}
.icon-open1 {
    margin: 0 30px;
    cursor: pointer;
}
.el-col {
    margin-top: 10px;
}

.creat-page {
    margin-right: 24px;
    margin-left: auto;
}
</style>
