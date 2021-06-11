<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title" style="height: 56px;border-bottom: 1px solid #E8E8E8">
            <el-tabs class="tabs" v-model="activeTab" @tab-click="onTabClick" :before-leave="beforeLeave">
                <el-tab-pane label="商品" name="1"></el-tab-pane>
                <el-tab-pane label="优惠券" name="2"></el-tab-pane>
            </el-tabs>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <el-form-item label="优惠券名称" prop="couponTitle" label-width="" v-if="activeTab == 2">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.couponTitle"></el-input>
                        </el-form-item>
                        <el-form-item label="积分订单号" prop="orderNo" label-width="" v-if="activeTab == 1">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.orderNo"></el-input>
                        </el-form-item>
                        <el-form-item label="客户微信名" prop="wxNickName" label-width="">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.wxNickName"></el-input>
                        </el-form-item>
                        <el-form-item class="long-time" label="兑换时间" prop="createdTime">
                            <el-date-picker
                                    class="filter-item"
                                    v-model="formFilter.createdTime"
                                    value-format="timestamp"
                                    type="datetimerange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    :default-time="['00:00:00', '23:59:59']"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="用户ID" prop="userId" label-width="">
                            <el-input class="filter-item" placeholder="请输入"
                                      v-model.number="formFilter.userId"></el-input>
                        </el-form-item>
                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置
                            </el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
            <div class="shop-icon shop-all" v-if="!filterShop.id"><span class="iconfont icon-shop"></span><span
                    class="text">所有店铺</span></div>
            <div class="shop-icon shop-filter" v-if="filterShop.id">
                <img class="shop-img" :src="filterShop.shop_icon" alt=""/><span
                    class="text">{{ filterShop.shop_name }}</span>
            </div>
            <div class="search-value">
                <template v-for="(item, i) in searchList">
                    <div class="search-item" v-if="i <= showMaxIndex">
                        {{ item.val }}
                        <span class="tags-li-icon" @click="closeSearchItem(item, i)"><i
                                class="el-icon-close"></i></span>
                    </div>
                </template>
                <span style="width: 20px;display: inline-block"
                      v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                <div class="search-value-clone" ref="searchValueBox">
                    <template v-for="(item, i) in searchList">
                        <div class="search-item" :ref="'searchItem' + i">
                            {{ item.val }}
                            <span class="tags-li-icon"><i class="el-icon-close"></i></span>
                        </div>
                    </template>
                    <span>{{ showMaxIndex }}</span>
                    <span style="width: 20px;display: inline-block"
                          v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                </div>
            </div>
            <el-radio-group v-model="isSend" class="tab-way" @change="statusChange" v-if="activeTab == 1">
                <el-radio-button :label="0">未发货({{ notShippedCount }})</el-radio-button>
                <el-radio-button :label="1">已发货</el-radio-button>
            </el-radio-group>
        </div>
        <template v-if="activeTab == 1">
            <el-table :height="tableHeight" :data="list" v-loading.body="listLoading"
                      :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
                <el-table-column label="积分订单号" prop="orderNo" width="160">
                    <template slot-scope="scope">
                        <div class="son-wrap" v-if="scope.row.son && scope.row.son.length > 0">
                            <div class="son-item" v-for="(item, i) in scope.row.son">
                                <span>{{ item.orderNo }}</span>
                                <div class="line"></div>
                            </div>
                        </div>
                        <span v-else>{{ scope.row.orderNo }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="商品数量" prop="num" width="90">
                    <template slot-scope="scope">
                        <div class="son-wrap" v-if="scope.row.son && scope.row.son.length > 0">
                            <div class="son-item" v-for="(item, i) in scope.row.son">
                                <span>{{ item.num }}</span>
                                <div class="line"></div>
                            </div>
                        </div>
                        <span v-else>{{ scope.row.num }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="积分总额" prop="pointsTotal" width="100">
                    <template slot-scope="scope">
                        <div class="son-wrap" v-if="scope.row.son && scope.row.son.length > 0">
                            <div class="son-item" v-for="(item, i) in scope.row.son">
                                <span>{{ item.pointsTotal }}</span>
                                <div class="line"></div>
                            </div>
                        </div>
                        <span v-else>{{ scope.row.pointsTotal }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="兑换时间" width="180">
                    <template slot-scope="scope">
                        <div class="son-wrap" v-if="scope.row.son && scope.row.son.length > 0">
                            <div class="son-item" v-for="(item, i) in scope.row.son">
                                <span>{{ $moment(item.redeemTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                                <div class="line"></div>
                            </div>
                        </div>
                        <span v-else>{{ $moment(scope.row.redeemTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="用户ID" prop="userId" width="84"></el-table-column>
                <el-table-column label="客户微信名" prop="wxNickName"></el-table-column>
                <el-table-column label="店铺" prop="orderNo" width="120">
                    <template slot-scope="scope">
                        <span>{{ filterShop.shop_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template slot-scope="scope">
                        <span>{{ scope.row.isSend ? '已发货' : '未发货' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                    <template slot-scope="scope">
                        <el-button class="text-blue opt-btn" type="text" size="small" @click="gotoDetail(scope.row)"
                                   v-hasPermission="'mall-backend-points-order-detail'">{{
                            scope.row.isSend ? '详情' : '发货'
                            }}
                        </el-button>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
        </template>
        <template v-if="activeTab == 2">
            <el-table :height="tableHeight" :data="list" v-loading.body="listLoading"
                      :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
                <el-table-column label="用户ID" width="84">
                    <template slot-scope="scope">
                        <span>{{ scope.row.userId }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="客户微信名">
                    <template slot-scope="scope">
                        <span>{{ scope.row.wxNickName }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="客户手机号" prop="phone">
                    <template slot-scope="scope">
                        <span>{{ scope.row.phone }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="店铺" prop="orderNo">
                    <template slot-scope="scope">
                        <span>{{ filterShop.shop_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="优惠券名称" prop="couponTitle" v-if="activeTab == 2"></el-table-column>
                <el-table-column label="兑换数量" prop="num" width="90" v-if="activeTab == 2"></el-table-column>
                <el-table-column label="积分总额" prop="pointsTotal" width="100">
                    <template slot-scope="scope">
                        <span>{{ scope.row.pointsTotal }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="兑换时间" width="180">
                    <template slot-scope="scope">
                        <span>{{ $moment(scope.row.redeemTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
        </template>
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
    </div>
</template>
<script>
    import { queryGoodsList, queryCouponList, cacheData } from '@/api/points';
    // import * as teamwork from '@/api/teamwork'
    import { formatMoney } from '@/plugin/tool';
    import { queryShopList } from '@/api/goods';
    import commUtil from '@/utils/commUtil';
    import EmptyList from '@/components/common/empty-list/EmptyList';
    import bus from '@/components/common/bus'
    export default {
        name: 'customer-list',
        data() {
            return {
                filterShop: {},
                commUtil,
                list: [],
                total: 0,
                listLoading: false,
                shopList: [],
                listQuery: {
                    page: 1,
                    limit: 10
                },
                formFilter: {
                    couponTitle: '',
                    orderNo: '',
                    wxNickName: '',
                    createdTime: [],
                    shopId: '' //不搜索 为-1
                },
                tableHeight: 'calc(100vh - 194px)',
                searchShow: false,
                searchList: [],
                showMaxIndex: 0,
                // 图片预览
                dialogVisiblePic: false,
                previewIndexPic: 0,
                activeTab: '1',
                notShippedCount: 0,
                shopId: 0,
                isSend: '0'
            };
        },
        components: {
            EmptyList
        },
        watch: {
            searchList: function() {
                this.$nextTick(
                    function() {
                        if (!this.$refs.searchValueBox) {
                            return;
                        }
                        let maxWidth = window.getComputedStyle(this.$refs.searchValueBox).width.replace('px', '') - 20;
                        let showWidth = 0;
                        for (let i = 0; i < this.searchList.length; i++) {
                            let el = 'searchItem' + i;
                            let _width = this.$refs[el][0].offsetWidth;
                            showWidth = showWidth + Math.ceil(Number(_width)) + 8;
                            if (showWidth > maxWidth) {
                                this.showMaxIndex = i - 1;
                                // console.log('this.showMaxIndex', this.showMaxIndex)
                                return;
                            }
                            if (i == this.searchList.length - 1) {
                                if (showWidth <= maxWidth - 20) {
                                    this.showMaxIndex = this.searchList.length - 1;
                                }
                            }
                        }
                    }.bind(this)
                );
            }
        },
        computed: {
            backShopName: function() {
                let shop_name = '';
                return data => {
                    const filter_arr = this.shopList.filter(item => {
                        return item.id == data;
                    });
                    if (filter_arr.length > 0) {
                        shop_name = filter_arr[0].name;
                    }
                    return shop_name;
                };
            }
        },
        created() {
            this.shopId = Number(this.$route.query.shopId);
            console.log('this.shopId', this.shopId);
            bus.$on('refreshPointOrderList', target => {
                console.log('target', target);
                // this.$set(this.pageInfo, 'pageIndex', 1);
                if (target == 'sandSuccess') {

                }
                this.getList();
            });
        },
        async mounted() {
            await this.queryShopList();
            this.getList();
        },
        methods: {
            formatMoney: formatMoney,
            getList() {
                console.log('activeTab', this.activeTab);
                const search_obj = _.cloneDeep(this.$refs['formFilter'].model);
                let params = {
                    userId: search_obj['userId'] ? Number(search_obj['userId']) : 0,
                    shopId: this.shopId,
                    wxNickName: search_obj['wxNickName'] || ''
                };
                if (this.activeTab == 1) {
                    params['isSend'] = this.isSend == 1;
                    params['orderNo'] = search_obj['orderNo'] || '';
                } else {
                    params['couponTitle'] = search_obj['couponTitle'] || '';
                }
                if (search_obj.createdTime.length == 2) {
                    params['redeemStartTime'] = Number(this.$moment(search_obj.createdTime[0]).format('X'));
                    params['redeemEndTime'] = Number(this.$moment(search_obj.createdTime[1]).format('X'));
                } else {
                    params['redeemStartTime'] = 0;
                    params['redeemEndTime'] = 0;
                }
                console.log('this.isSend', this.isSend);
                params['ps'] = this.listQuery.limit;
                params['pi'] = this.listQuery.page;
                console.log(params);
                const rLoading = this.openLoading();
                if (this.activeTab == 1) {
                    queryGoodsList(params)
                        .then(res => {
                            console.log('输出 ~ res', res);
                            rLoading.close();
                            this.list = res.data.list;
                            this.total = res.data.total;
                            if (this.isSend == '0') {
                                this.notShippedCount = res.data.total;
                                // 未发货
                                if(res.data.list && res.data.list.length > 0){
                                    const new_arr = this.returnNewArr(res.data.list, 'uniqueNo')
                                    console.log('new_arr', new_arr)
                                    let new_list = []
                                    new_arr.forEach((ev)=>{
                                        let obj = {}
                                        if(ev.length > 1){
                                            obj = ev[0]
                                            obj['son'] = ev

                                        } else {
                                            obj =  ev[0]
                                            obj['son'] = []
                                        }
                                        console.log('obj', obj)
                                        new_list.push(obj)
                                    })
                                    console.log('new_list', new_list)
                                    this.list = new_list
                                }
                            }
                        })
                        .catch(err => {
                            rLoading.close();
                        });
                } else {
                    queryCouponList(params)
                        .then(res => {
                            console.log('输出 ~ res', res);
                            rLoading.close();
                            this.list = res.data.list;
                            this.total = res.data.total;
                        })
                        .catch(err => {
                            rLoading.close();
                        });
                }
            },
            returnNewArr(_list,key) {
                let map = new Map();
                let newArr = [];
                _list.forEach(item => {
                    map.has(item[key]) ? map.get(item[key]).push(item) : map.set(item[key], [item]);
                })
                newArr = [...map.values()];
                return newArr
            },

            // 代理店铺列表
            queryShopList() {
                return new Promise((resolve, reject) => {
                    queryShopList()
                        .then(res => {
                            this.shopList = res.data || [];
                            this.shopList.forEach((ev) => {
                                if (ev.id == this.shopId) {
                                    this.filterShop = ev;
                                }
                            });
                            resolve(res);
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
            },
            // 搜索
            handleFilter() {
                this.listQuery.page = 1;
                this.searchShow = false;
                this.setSearchValue();
                this.getList();
            },
            // 重置
            resetForm(formName) {
                console.log(this.$refs[formName].model);
                this.$refs[formName].resetFields();
                this.handleFilter();
            },
            // 跳转详情
            gotoDetail(row) {
                console.log('row', row)
                cacheData.orderInfo = _.cloneDeep(row);
                this.$router.push({
                    path: '/mall-backend-points-order-detail',
                    query: {
                        shopId: this.filterShop.id,
                        uniqueNo: row.uniqueNo,
                        shopName: this.filterShop.shop_name,
                        isSend: row.isSend ? 1 : 0,
                        logisticsNo: row.logisticsNo || '',
                        logisticsCompanyId: row.logisticsCompanyId || 0
                    }
                });
            },

            // 设置显示的搜索条件
            setSearchValue() {
                let _search = [];
                console.log('this.formFilter', this.formFilter);
                // userId
                if (this.formFilter['userId']) {
                    let obj = {
                        label: 'userId',
                        val: this.formFilter['userId']
                    };
                    _search.push(obj);
                }
                // wxNickName
                if (this.formFilter['wxNickName']) {
                    let obj = {
                        label: 'wxNickName',
                        val: this.formFilter['wxNickName']
                    };
                    _search.push(obj);
                }
                // orderNo
                if (this.formFilter['orderNo']) {
                    let obj = {
                        label: 'orderNo',
                        val: this.formFilter['orderNo']
                    };
                    _search.push(obj);
                }
                // 时间 createdTime
                if (this.formFilter['createdTime'] && this.formFilter['createdTime'].length === 2) {
                    let _ge_arr = this.$moment(this.formFilter.createdTime[0])
                        .format('YYYY-MM-DD ')
                        .split('-');
                    let _le_arr = this.$moment(this.formFilter.createdTime[1])
                        .format('YYYY-MM-DD ')
                        .split('-');
                    let _ge = _ge_arr[1] + '.' + _ge_arr[2];
                    let _le = _le_arr[1] + '.' + _le_arr[2];
                    let obj = {
                        label: 'createdTime',
                        val: _ge + ' - ' + _le
                    };
                    _search.push(obj);
                }

                this.searchList = _.cloneDeep(_search);
            },

            // 清除单个搜索条件
            closeSearchItem(item, i) {
                this.$set(this.formFilter, item.label, '');
                if (item.label == 'createdTime') {
                    this.$set(this.formFilter, 'createdTime', []);
                }
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
            },
            beforeLeave(activeName, oldActiveName) {
                this.activeTab = activeName;
                // console.log('activeName', activeName)
                // console.log('oldActiveName', oldActiveName)
                this.isSend = '0';
                this.resetForm('formFilter');
            },
            // tab
            onTabClick(e) {
            },
            statusChange() {
                this.listQuery.page = 1;
                this.getList();
            }
        }
    };
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

    .tabs {
        margin-left: 30px;

        & /deep/ .el-tabs__header {
            margin: 0;
        }

        & /deep/ .el-tabs__nav {
            height: 56px;
        }

        & /deep/ .el-tabs__item {
            line-height: 56px;
        }
    }
    .son-wrap{

    }
    .son-item{
        height: 54px;
        line-height: 54px;
        /*border-bottom: 1px solid #EBEEF5;*/
        position: relative;
    }
    .son-item .line{
        position: absolute;
        top: 54px;
        left: -24px;
        width: 180px;
        height: 1px;
        background: #EBEEF5;
    }
    .son-wrap .son-item:first-child{
        height: 38px;
        line-height: 22px;
        .line{
            top: 38px;
        }
    }
    .son-wrap .son-item:last-child{
        height: 38px;
        line-height: 54px;
        border-bottom: none;
        box-sizing: border-box;
        .line{
            height: 0px;
        }
    }
</style>
<style>
    .el-tabs__nav-wrap::after {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 2px;
        background-color: transparent !important;
        content: '';
    }
</style>
