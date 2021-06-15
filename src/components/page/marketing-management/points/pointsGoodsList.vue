<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">商品管理</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <!-- <el-form-item label="店铺" prop="shop_id">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item> -->
                        <el-form-item label="名称" prop="title" label-width="">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.title"></el-input>
                        </el-form-item>
                        <el-form-item label="状态" prop="status">
                            <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择" filterable>
                                <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
            <!-- <div class="shop-icon shop-all" v-if="!shopId"><span class="iconfont icon-shop"></span><span class="text">所有店铺</span></div> -->
            <div class="shop-icon shop-filter" v-if="shopId">
                <img class="shop-img" :src="shopList.find(item => item.id == shopId).shop_icon" alt="" /><span class="text">
                    {{ shopList.find(item => item.id == shopId).shop_name }}
                </span>
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
            <el-radio-group v-model="tabIndex" class="tab-way" @change="onTabClick">
                <el-radio-button :label="1">商品</el-radio-button>
                <el-radio-button :label="2">优惠券</el-radio-button>
            </el-radio-group>
            <el-button type="primary" @click="creatGoods" class="goods-put" v-hasPermission="'mall-backend-points-goods-creat'">新增</el-button>
        </div>
        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="图片" width="128">
                <template slot-scope="scope">
                    <div class="img-wrap">
                        <img class="timg" :src="scope.row.img" alt="" @click="openPreviewPic(scope.$index)" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="名称" min-width="200">
                <template slot-scope="scope">
                    <span class="edit-goods" @click="editGoods(scope.row)" v-hasPermission="'mall-backend-points-goods-detail'">
                        {{ scope.row.title }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="需要积分" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.points }}</span>
                </template>
            </el-table-column>
            <el-table-column label="已兑/总数" width="120">
                <template slot-scope="scope">
                    <span>{{ scope.row.salesQty }}/{{ scope.row.stockQty + scope.row.salesQty }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺" width="120">
                <template slot-scope="scope">
                    <span>{{ shopList.find(item => item.id == scope.row.shopId).shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="170">
                <template slot-scope="scope">
                    <span class="text-red cursor" @click="setSkuStatus(props.row, scope.row, props.$index, scope.$index)" v-if="scope.row.status == 1">
                        已下架
                    </span>
                    <span class="text-blue cursor" @click="setSkuStatus(props.row, scope.row, props.$index, scope.$index)" v-if="scope.row.status == 2">
                        已上架
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button class="text-blud opt-btn" type="text" size="small" @click="editGoods(scope.row)" v-hasPermission="'mall-backend-points-goods-creat'">编辑</el-button>
                    <el-button
                        class="text-red opt-btn"
                        type="text"
                        size="small"
                        @click="setStatus(scope.row)"
                        v-if="scope.row.status == 2"
                        v-hasPermission="'mall-backend-change-points-goods-status'"
                        >下架</el-button
                    >
                    <el-button
                        class="text-blue opt-btn"
                        type="text"
                        size="small"
                        @click="setStatus(scope.row)"
                        v-if="scope.row.status == 1"
                        v-hasPermission="'mall-backend-change-points-goods-status'"
                        >上架</el-button
                    >
                    <el-button class="text-red opt-btn" type="text" size="small" @click="deleteGoods(scope.row)" v-hasPermission="'mall-backend-points-goods-delete'"
                        >删除</el-button
                    >
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
import { queryPointsGoodsList, deletePointsGoods, putPointsGoodsStatus } from '@/api/points'
// import * as teamwork from '@/api/teamwork'
import { formatMoney } from '@/plugin/tool'
import { queryShopList } from '@/api/goods'
import ElImageViewer from '@/components/common/image-viewer'
import bus from '@/components/common/bus'

export default {
    name: 'points-goods-list',
    data() {
        return {
            filterShop: {},
            list: null,
            total: 0,
            listLoading: false,
            shopList: null,
            tabIndex: 1,
            listQuery: {
                page: 1,
                limit: 10
            },
            statusList: [
                {
                    value: 1,
                    label: '下架'
                },
                {
                    value: 2,
                    label: '上架'
                }
            ],
            formFilter: {
                title: '',
                status: '' // 1下架 2 上架
            },
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            shopId: '',
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
    created() {
        bus.$on('refreshPointsGoodsList', target => {
            if (target === 'add') {
                this.listQuery.page = 1
                this.getList()
            } else {
                this.getList()
            }
        })
    },
    destroyed() {
        bus.$off('refreshPointsGoodsList')
    },
    async mounted() {
        await this.queryShopList()
        this.shopId = Number(this.$route.query.shopId)
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        addSku() {
            this.$refs.productList.show()
        },
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['status'] = params['status'] || 0
            params['shopId'] = this.shopId
            params['ps'] = this.listQuery.limit
            params['pi'] = this.listQuery.page

            queryPointsGoodsList(params)
                .then(res => {
                    console.log('输出 ~ res', res)
                    this.list = res.data.list
                    this.total = res.data.total
                    this.previewUrlListPic = this.list.map(item => item.img)
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
        editGoods(row) {
            this.$router.push({
                path: '/mall-backend-points-goods-creat',
                query: {
                    id: row.goodsId,
                    shopId: this.shopId
                }
            })
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            console.log('this.formFilter', this.formFilter)
            // 商品名称
            if (this.formFilter['title']) {
                let obj = {
                    label: 'title',
                    val: this.formFilter['title']
                }
                _search.push(obj)
            }
            // 上下架
            if (this.formFilter['status']) {
                this.statusList.forEach(ev => {
                    if (ev.value == this.formFilter['status']) {
                        let obj = {
                            label: 'status',
                            val: ev.label
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
        },
        // tab
        onTabClick(e) {
            console.log('输出 ~ e', e)
            if (e == 2) {
                this.$router.push({
                    path: '/mall-backend-points-coupon-list',
                    query: {
                        shopId: this.shopId
                    }
                })
            }
            this.tabIndex = 1
        },
        creatGoods() {
            this.$router.push({
                path: '/mall-backend-points-goods-creat',
                query: {
                    id: 0,
                    shopId: this.shopId
                }
            })
        },
        // 上下架
        setStatus(row) {
            let params = {
                goodsId: row.goodsId,
                status: row.status == 1 ? 2 : 1 // 1下架 2上架
            }
            putPointsGoodsStatus(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: row.status == 1 ? '上架成功' : '下架成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.getList()
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 5000
                        })
                    }
                })
                .catch(err => {})
        },
        deleteGoods(row) {
            this.$confirm('确认要删除该商品吗?', '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        goodsId: row.goodsId
                    }
                    deletePointsGoods(params)
                        .then(res => {
                            console.log('GOOGLE: res', res)
                            if (res.code == 200) {
                                this.$notify({
                                    title: '商品删除成功',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.getList()
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
    width: 80px;
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
.tab-way {
    margin-right: 10px;
}
.goods-put {
    margin-right: 32px;
}
.edit-goods {
    color: #1890ff;
    cursor: pointer;
}
</style>
