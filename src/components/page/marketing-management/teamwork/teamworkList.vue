<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">团作管理</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="店铺" prop="shop_id">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
            <div class="shop-icon shop-all" v-if="!filterShop.id"><span class="iconfont icon-shop"></span><span class="text">所有店铺</span></div>
            <div class="shop-icon shop-filter" v-if="filterShop.id">
                <img class="shop-img" :src="filterShop.shop_icon" alt="" /><span class="text">{{ filterShop.shop_name }}</span>
            </div>
            <div class="search-value">
                <template v-for="(item, i) in searchList">
                    <div class="search-item" v-if="i <= showMaxIndex">
                        {{ item.val }}
                        <span class="tags-li-icon" @click="closeSearchItem(item, i)"><i class="el-icon-close"></i></span>
                    </div>
                </template>
                <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                <div class="search-value-clone" ref="searchValueBox">
                    <template v-for="(item, i) in searchList">
                        <div class="search-item" :ref="'searchItem' + i">
                            {{ item.val }}
                            <span class="tags-li-icon"><i class="el-icon-close"></i></span>
                        </div>
                    </template>
                    <span>{{ showMaxIndex }}</span>
                    <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                </div>
            </div>
        </div>
        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="团作ID" min-width="80">
                <template slot-scope="scope">
                    <span>{{ scope.row.id }}</span>
                </template>
            </el-table-column>

            <el-table-column label="团作海报" width="176">
                <template slot-scope="scope">
                    <div class="img-wrap">
                        <img class="timg" :src="scope.row.poster_link" alt="" @click="openPreviewPic(scope.$index)" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="团作名称" min-width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                </template>
            </el-table-column>
            <el-table-column label="课程时间" width="120">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.start_time_txt).format('YYYY-MM-DD') }}至{{ $moment(scope.row.end_time_txt).format('YYYY-MM-DD') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="报名人数" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.join_num }}/{{ scope.row.limit_num }}</span>
                </template>
            </el-table-column>
            <el-table-column label="模式" width="80">
                <template slot-scope="scope">
                    <span v-if="scope.row.type == 1">免费</span>
                    <span v-else-if="scope.row.type == 2">付费</span>
                    <span v-else>押金</span>
                </template>
            </el-table-column>
            <el-table-column label="价格" width="80">
                <template slot-scope="scope">
                    <span v-if="scope.row.course_price">{{ formatMoney(scope.row.course_price) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺" width="100">
                <template slot-scope="scope">
                    <span>{{ shopList.find(item => item.id == scope.row.shop_id).shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="老师昵称" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.nick_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
                <template slot-scope="scope">
                    <span>{{ scope.row.time_status }}</span>
                </template>
            </el-table-column>
            <el-table-column label="是否删除" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.deleted_at_txt ? '是' : '否' }}</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="80">
                <template slot-scope="scope">
                    <el-button class="btn-blud opt-btn" type="text" size="small" @click="gotoDetail(scope.row)">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="listQuery.page"
                :page-size="listQuery.limit"
                layout="total, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </div>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreviewPic" :url-list="previewUrlListPic" :initial-index="previewIndexPic" />
    </div>
</template>
<script>
import { queryCourseList, cacheData } from '@/api/teamwork'
// import * as teamwork from '@/api/teamwork'
import { formatMoney } from '@/plugin/tool'
import { queryShopList } from '@/api/goods'
import commUtil from '@/utils/commUtil'
import ElImageViewer from '@/components/common/image-viewer'

export default {
    name: 'customer-list',
    data() {
        return {
            filterShop: {},
            commUtil,
            list: null,
            total: 0,
            listLoading: false,
            shopList: [],
            listQuery: {
                page: 1,
                limit: 10
            },

            formFilter: {
                shop_id: '' //不搜索 为-1
            },
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            // 图片预览
            dialogVisiblePic: false,
            previewUrlListPic: [],
            previewIndexPic: 0
        }
    },
    components: {
        ElImageViewer
    },
    watch: {
        searchList: function() {
            this.$nextTick(
                function() {
                    if (!this.$refs.searchValueBox) {
                        return
                    }
                    let maxWidth = window.getComputedStyle(this.$refs.searchValueBox).width.replace('px', '') - 20
                    let showWidth = 0
                    for (let i = 0; i < this.searchList.length; i++) {
                        let el = 'searchItem' + i
                        let _width = this.$refs[el][0].offsetWidth
                        showWidth = showWidth + Math.ceil(Number(_width)) + 8
                        if (showWidth > maxWidth) {
                            this.showMaxIndex = i - 1
                            // console.log('this.showMaxIndex', this.showMaxIndex)
                            return
                        }
                        if (i == this.searchList.length - 1) {
                            if (showWidth <= maxWidth - 20) {
                                this.showMaxIndex = this.searchList.length - 1
                            }
                        }
                    }
                }.bind(this)
            )
        }
    },
    created() {},
    async mounted() {
        await this.queryShopList()

        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        addSku() {
            this.$refs.productList.show()
        },
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)
            if (params['shop_id']) {
                this.filterShop = this.shopList.find(item => item.id == params['shop_id'])
            } else {
                params['shop_id'] = -1
                this.filterShop = {}
            }
            params['shop_id'] = params['shop_id'] == '' ? -1 : params['shop_id']
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryCourseList(params)
                .then(res => {
                    console.log('输出 ~ res', res)
                    this.list = res.data.lists
                    this.total = res.data.total
                    this.previewUrlListPic = this.list.map(item => item.poster_link)
                })
                .catch(err => {})
        },
        closePreviewPic() {
            this.dialogVisiblePic = false
        },
        openPreviewPic(index) {
            this.previewIndexPic = index
            this.dialogVisiblePic = true
        },
        // 代理店铺列表
        queryShopList() {
            return new Promise((resolve, reject) => {
                queryShopList()
                    .then(res => {
                        this.shopList = res.data
                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.setSearchValue()
            this.getList()
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields()
            this.formFilter.consumption_min = ''
            this.formFilter.consumption_max = ''
            this.handleFilter()
        },
        // 跳转详情
        gotoDetail(row) {
            cacheData.teamworkData = _.cloneDeep(row)
            this.$router.push({
                name: 'teamwork-detail',
                params: {
                    id: row.id
                }
            })
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            console.log('this.formFilter', this.formFilter)
            // 所属店铺 shop_id
            if (this.formFilter['shop_id']) {
                this.shopList.forEach(ev => {
                    if (ev.id == this.formFilter['shop_id']) {
                        let obj = {
                            label: 'shop_id',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }

            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter, item.label, '')
            if (item.label == 'consumption_count') {
                this.$set(this.formFilter, 'consumption_min', '')
                this.$set(this.formFilter, 'consumption_max', '')
            }
            this.handleFilter()
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.img-wrap {
    overflow: hidden;
    width: 125px;
    height: 60px;
}
.timg {
    width: 125px;
    height: auto;
}
.type-tag {
    // display: block;
    padding: 0 11px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    word-break: keep-all;
    font-weight: 400;
    line-height: 26px;
    &.type-red {
        background-color: #ff4d4f;
    }
    &.type-purple {
        background-color: #a151ff;
    }
    &.type-yellow {
        background-color: #faad14;
    }
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
.shop-icon {
    display: flex;
    margin-left: 23px;
    padding: 0 10px;
    height: 30px;
    border-radius: 15px;
    background: #ffffff;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
    font-weight: 500;
    font-size: 14px;
    line-height: 30px;
    &.shop-all {
        color: #1890ff;
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .icon-shop {
            margin-right: 6px;
        }
    }
    &.shop-filter {
        color: rgba(0, 0, 0, 0.85);
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .shop-img {
            margin-top: 5px;
            margin-right: 6px;
            width: 20px;
            height: 20px;
            border-radius: 10px;
        }
    }
}
</style>
