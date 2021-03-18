<template>
    <div class="dashboard-page page-contain">
        <div class="wrap-box-item marginRight24" v-if="show_home">
            <div class="top-box">
                <el-main class="box-el-main" v-loading="statusCountLoading">
                    <div class="left-box">
                        <div class="count-value">{{statusCountObj.count_status_new}}</div>
                        <div class="count-text">待付款</div>
                    </div>
                    <div class="center-box">
                        <div class="count-value">{{statusCountObj.count_status_pending}}</div>
                        <div class="count-text">待发货</div>
                    </div>
                    <div class="right-box">
                        <div class="count-value">{{statusCountObj.count_status_apply}}</div>
                        <div class="count-text">待处理售后</div>
                    </div>
                </el-main>
            </div>
            <div class="sku-sales-box">
                <div class="title-box">
                    <div class="title-left-box">SKU七日销量排名</div>
                    <div class="title-more" @click="onGoSKUSalesRanking">更多</div>
                </div>
                <div class="sku-list">
                    <el-main v-loading="skuLoading">
                        <div class="sku-item" v-for="(item,index) in skuList" :key="index">
                            <div class="ranking" :class="{'ranking-other': index > 2}">{{index+1}}</div>
                            <div class="sku-name text-ellipsis">{{item.sku_title}}</div>
                            <div class="sku-amount"><span style="margin-right: 4px">¥</span>{{formatMoney(item.money)}}</div>
                        </div>
                    </el-main>
                </div>
            </div>
            <div class="bottom-box">
                <div class="title-box">
                    <div class="title-left-box">七日新用户统计</div>
                    <div class="box-channel">
                        <el-select class="filter-channel" v-model="new_user_shop_id" placeholder="全部店铺" @change="newUserShopChange">
                            <el-option v-for="state in shopOptions" :key="state.id" :value="state.id" :label="state.shop_name" />
                        </el-select>
                    </div>
                </div>
                <el-main class="h380" v-loading="newUserLoading">
                    <div ref="userSourceChart" class="single-chart"></div>
                </el-main>
            </div>
        </div>
        <div class="wrap-box-item" v-if="show_home">
            <div class="sales-statistics-wrap">
                <div class="title-box">
                    <div class="title-left-box">销售统计</div>
                    <el-radio-group v-model="tabPosition" class="tabs-nav" @change="tabClick()">
                        <el-radio-button label="今日">今日</el-radio-button>
                        <el-radio-button label="7天">7天</el-radio-button>
                        <el-radio-button label="14天">14天</el-radio-button>
                    </el-radio-group>
                    <div class="box-channel">
                        <el-select class="filter-channel" v-model="shop_id" placeholder="全部店铺" @change="shopChange">
                            <el-option v-for="state in shopOptions" :key="state.id" :value="state.id" :label="state.shop_name" />
                        </el-select>
                    </div>
                    <div class="title-more" @click="onGoSalesRanking">更多</div>
                </div>
                <el-main v-loading="salesLoading">
                    <div class="sale-trend">
                        <div class="trend-item">
                            <div class="trend-title">销售额</div>
                            <div class="trend-value">
                                <div class="amount"><span style="margin-right: 2px">¥</span>{{salesInfo.all_money}}</div>
                                <div class="percentage-value">
                                    <template v-if="salesInfo.money_change < 0">
                                        <i class="iconfont icon-downArrow"></i>
                                        <span>{{0 - salesInfo.money_change < 1000 ? 0 - salesInfo.money_change : '≥1000.00' }}%</span>
                                    </template>
                                    <template v-else>
                                        <i class="iconfont icon-upArrow"></i>
                                        <span v-if="salesInfo.money_change == 0">0.00%</span>
                                        <span v-else>{{salesInfo.money_change < 1000 ? salesInfo.money_change : '≥1000.00'}}%</span>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <div class="trend-item">
                            <div class="trend-title">销量</div>
                            <div class="trend-value">
                                <div class="amount">{{salesInfo.all_num}}</div>
                                <div class="percentage-value">
                                    <template v-if="salesInfo.num_change < 0">
                                        <i class="iconfont icon-downArrow"></i>
                                        <span>{{0 - salesInfo.num_change < 1000 ? 0 - salesInfo.num_change : '≥1000.00' }}%</span>
                                    </template>
                                    <template v-else>
                                        <i class="iconfont icon-upArrow"></i>
                                        <span v-if="salesInfo.num_change == 0">0.00%</span>
                                        <span v-else>{{salesInfo.num_change < 1000 ? salesInfo.num_change : '≥1000.00'}}%</span>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <div class="trend-item">
                            <div class="trend-title">订单量</div>
                            <div class="trend-value">
                                <div class="amount">{{salesInfo.all_order_count}}</div>
                                <div class="percentage-value">
                                    <template v-if="salesInfo.order_count_change < 0">
                                        <i class="iconfont icon-downArrow"></i>
                                        <span>{{0 - salesInfo.order_count_change < 1000 ? 0 - salesInfo.order_count_change : '≥1000.00' }}%</span>
                                    </template>
                                    <template v-else>
                                        <i class="iconfont icon-upArrow"></i>
                                        <span v-if="salesInfo.order_count_change == 0">0.00%</span>
                                        <span v-else>{{salesInfo.order_count_change < 1000 ? salesInfo.order_count_change : '≥1000.00'}}%</span>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                            ref="saleTrendEChart"
                            class="single-chart"
                    ></div>
                </el-main>
            </div>
        </div>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import commUtil from '@/utils/commUtil'
    import { formatMoney } from '@/plugin/tool'
    import { queryShopList } from '@/api/goods'
    import { queryOrderStatusReport, querySKUReport, queryNewCustomer, queryOrderDaily, queryOrderHour } from '@/api/homePageReport'
    const baseUrl = process.env.VUE_APP_BASE_API
    export default {
        name: 'mall-backend-dashboard',
        data() {
            return {
                name: localStorage.getItem('ms_username'),
                shopOptions: [], // 店铺
                new_user_shop_id: -1, // 新用户选中店铺
                shop_id: -1, // 选中店铺
                userSourceChart: null, // 用户来源
                saleTrendEChart: null, // 销售趋势
                skuList:[],
                statusCountLoading: true, // 订单状态数量
                skuLoading: true,
                newUserLoading: false,
                salesLoading: true,
                tabPosition: '14天',   //  布还是其它
                selectedTime: '',
                statusCountObj: {
                    count_status_new: 0, // 待付款
                    count_status_pending: 0, // 处理中
                    count_status_apply: 0, // 处理售后
                },
                dateList:[],
                dateList_28:[],
                allSalesData: [],
                showSaleData: [],
                salesInfo:{
                    all_money: 0,
                    money_change: 0,
                    money_is_up: true,
                    all_num: 0,
                    num_change: 0,
                    num_is_up: true,
                    all_order_count: 0,
                    order_count_change: 0,
                    order_count_is_up: true,
                },
                allNewUserData: [],
                showNewUserData: [],
                todayHourList: [], // 今日时间
                yesterdayHourList: [], // 昨日时间
                allHourList: [], // 昨天今日时间
                show_home: false
            };
        },
        components: {

        },
        computed: {
            role() {
                return this.name === 'admin' ? '超级管理员' : '普通用户';
            }
        },
        created() {
            let _arr = [7,6,5,4,3,2,1]
            _arr.forEach((ev)=>{
                this.dateList.push(this.returnDate(ev))
            })
            this.todayHourList = this.returnHourList(0)
            this.yesterdayHourList = this.returnHourList(1)
            this.allHourList = this.yesterdayHourList.concat(this.todayHourList)
            const name_list = [
                baseUrl +'_' + 'mall_sku_sales',
                baseUrl +'_' + 'mall_seven_new_user',
                baseUrl +'_' + 'mall_daily_sales_data'
            ]
            // 清空首页缓存
            localStorage.removeItem(baseUrl +'_' + 'mall_sku_sales')
            localStorage.removeItem(baseUrl +'_' + 'mall_seven_new_user')
            localStorage.removeItem(baseUrl +'_' + 'mall_daily_sales_data')
            this.clearLocalStorageData(name_list)
        },
        mounted() {
            let is_admin = localStorage.getItem('is_admin') > 0
            if(!is_admin) {
                // 普通用户
                // console.log('普通用户')
                const PermissionsList = this.returnPermissionsList()
                // console.log('PermissionsList', PermissionsList)
                if( PermissionsList.indexOf('mall-backend-order-report-index-status') > -1 &&
                    PermissionsList.indexOf('mall-backend-order-report-index-sku') > -1 &&
                    PermissionsList.indexOf('mall-backend-order-report-index-order-daily') > -1 &&
                    PermissionsList.indexOf('mall-backend-order-report-index-order-hourly') > -1 &&
                    PermissionsList.indexOf('mall-backend-report-index-customer') > -1 &&
                    PermissionsList.indexOf('mall-backend-home-shop-all') > -1){
                    console.log('有首页权限')
                    this.show_home = true
                } else {
                    console.log('无首页权限')
                    this.show_home = false
                    return
                }
            } else {
                this.show_home = true
            }
            this.$nextTick(()=>{
                this.userSourceChart = this.$echarts.init(this.$refs.userSourceChart);
                this.saleTrendEChart = this.$echarts.init(this.$refs.saleTrendEChart);

                this.queryShopList()  // 请求店铺列表

                this.getOrderReport() // 请求订单状态数量接口

                this.getSKUReport() // 请求sku销量排行数据

                if(this.userSourceChart && this.saleTrendEChart){
                    window.addEventListener('resize', this.resizeChart);
                }
            })
        },
        beforeDestroy() {
            if(this.userSourceChart && this.saleTrendEChart){
                window.removeEventListener('resize', this.resizeChart)
            }
        },
        methods: {
            formatMoney: formatMoney,
            /**
             * 跳转到sku排行
             */
            onGoSKUSalesRanking() {
                this.$router.push('/mall-backend-statistics-sku')
            },
            /**
             * 跳转到销售报表
             */
            onGoSalesRanking() {
                this.$router.push('/mall-backend-statistics-sales')
            },
            // 请求订单状态数量接口
            getOrderReport() {
                this.statusCountLoading = true
                queryOrderStatusReport()
                    .then(res => {
                        if(res.data) {
                            this.statusCountObj = res.data
                        }
                        this.statusCountLoading = false
                    })
                    .catch(err => {})
            },

            // 请求sku排名接口
            getSKUReport() {
                let mall_sku_sales = localStorage.getItem(baseUrl +'_' + 'mall_sku_sales')
                if(mall_sku_sales){
                    // console.log('mall_sku_sales', JSON.parse(JSON.parse(mall_sku_sales).value))
                    this.skuList = JSON.parse(JSON.parse(mall_sku_sales).value)
                    this.skuLoading = false
                } else {
                    querySKUReport()
                        .then(res => {
                            this.skuList = res.data || []
                            this.skuLoading = false
                            this.store(baseUrl +'_' + 'mall_sku_sales', JSON.stringify(this.skuList));
                        })
                        .catch(err => {})
                }

            },

            // 代理店铺列表
            queryShopList() {
                queryShopList()
                    .then(res => {
                        this.shopOptions = res.data || []
                        this.shopOptions.unshift({
                            id: -1,
                            shop_name: '所有店铺'
                        })
                        this.getNewUserData() // 七日新用户统计
                        this.getSalesStatistics()  // 销售统计 - 7日/14日
                    })
                    .catch(err => {})
            },

            /**
             * 新用户统计 选择店铺
             */
            newUserShopChange() {
                if(this.new_user_shop_id > -1){
                    this.showNewUserData = this.allNewUserData.filter((ev)=>{return ev.shop_id === this.new_user_shop_id})
                } else {
                    this.showNewUserData = this.allNewUserData
                }
                this.setNewUserOptions()
            },
            /**
             * 销售统计 选择店铺
             */
            shopChange() {
                this.tabClick()
            },

            /**
             * 销售统计-切换时间
             */
            tabClick(){
                if(this.tabPosition === '今日'){
                    this.getSalesDataToday()
                } else {
                    if(this.shop_id > -1){
                        this.showSaleData = this.allSalesData.filter((ev)=>{return ev.shop_id === this.shop_id})
                    } else {
                        this.showSaleData = this.allSalesData
                    }
                    if(this.tabPosition === '14天'){
                        // 默认 14天 全部店铺
                        this.setSalesOptions(14)
                    }else if(this.tabPosition === '7天'){
                        this.setSalesOptions(7)
                    }
                }
            },

            // 请求七日新用户数据
            getNewUserData() {
                let mall_seven_new_user = localStorage.getItem(baseUrl +'_' + 'mall_seven_new_user')
                if(mall_seven_new_user){
                    // console.log('mall_seven_new_user', JSON.parse(JSON.parse(mall_seven_new_user).value))
                    this.allNewUserData = JSON.parse(JSON.parse(mall_seven_new_user).value)
                    this.showNewUserData = this.allNewUserData
                    this.setNewUserOptions()
                    return
                }
                queryNewCustomer()
                    .then((res) => {
                        if (res.code === 200) {
                            if (res.data) {
                                this.allNewUserData = res.data || []
                                this.showNewUserData = this.allNewUserData
                                this.setNewUserOptions()
                                this.store(baseUrl +'_' + 'mall_seven_new_user', JSON.stringify(this.allNewUserData));
                            }
                        } else {
                            this.newUserLoading = false
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {
                        this.newUserLoading = false
                    });
            },

            // 七日新用户统计柱形图数据填充
            setNewUserOptions(){
                this.newUserLoading = true
                this.userSourceChart = this.$echarts.init(this.$refs.userSourceChart);
                let x_axis = this.returnXData(this.dateList)
                let new_data = []
                this.showNewUserData.forEach((event, index)=>{
                    let new_data_children = {}
                    new_data_children['shop_id'] = event.shop_id
                    new_data_children['shop_name'] = '未知店铺'
                    this.shopOptions.forEach((shop_item)=>{
                        if(shop_item.id === event.shop_id) {
                            new_data_children['shop_name'] = shop_item.shop_name
                        }
                    })
                    new_data_children['report_index_customer_info'] = []
                    this.dateList.forEach((item)=>{
                        new_data_children['report_index_customer_info'].push({
                            date: item,
                            count_total: 0,
                            count_natural: 0,
                            count_invite: 0
                        })
                    })
                    event.report_index_customer_info.forEach((ev)=>{
                        new_data_children['report_index_customer_info'].forEach((item)=>{
                            if(ev.date === item.date){
                                item.count_total = ev.count_total
                                item.count_natural = ev.count_natural
                                item.count_invite = ev.count_invite
                            }
                        })
                    })
                    new_data.push(new_data_children)
                })
                let _list = []
                new_data.forEach((event,index)=>{
                    event.report_index_customer_info.forEach((ev,i)=>{
                        let obj = ev
                        obj['shop_id'] = event.shop_id
                        obj['shop_name'] = event.shop_name
                        _list.push(obj)
                    })
                })
                let map = new Map();
                let newArr = [];
                _list.forEach(item => {
                    map.has(item.date) ? map.get(item.date).push(item) : map.set(item.date, [item]);
                })
                newArr = [...map.values()];
                let series_data = [],
                    y_value_arr = []
                newArr.forEach((event)=>{
                    let _obj = {
                        value: 0,
                        count_natural: 0,
                        count_invite: 0,
                        date: '',
                        list: []
                    }
                    event.forEach((ev)=>{
                        _obj.list.push({
                            name: ev.shop_name,
                            count_total: ev.count_total,
                            count_natural: ev.count_natural,
                            count_invite: ev.count_invite,
                        })
                        _obj.value += ev.count_total
                        _obj.count_natural += ev.count_natural
                        _obj.count_invite += ev.count_invite
                        _obj.date = ev.date
                    })
                    y_value_arr.push(_obj.value)
                    series_data.push(_obj)
                })
                let max_value = 0;
                max_value = Math.max.apply(null,y_value_arr)
                // console.log('max_value', max_value)
                let option = {
                    title: {
                        text: '',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        },
                        formatter: function(params) {
                            let point = '<span style="width: 6px;height: 6px;border-radius: 100%;background: #1890FF;display: inline-block;margin: 0 5px 2px 0"></span>'
                            let x_name = '',res = ''
                            for (var i = 0; i < params.length; i++) {
                                res += point + '<span style="color: #000">' + params[i].seriesName + '：' + params[i].value + '</span><br/>';
                                x_name = params[i].data.date
                                res += point + '自然流量：' + params[i].data.count_natural + '<br/>';
                                res += point + '用户邀请：' + params[i].data.count_invite + '<br/>';
                            }
                            res = x_name + '<br/>' + res
                            return res
                        }
                    },
                    legend: {
                        show: false
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: x_axis
                        }
                    ],
                    yAxis: [
                        {
                            max: max_value,
                            splitNumber: max_value,
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '总数',
                            type: 'bar',
                            barMaxWidth: 30,
                            center: ['50%', '50%'],
                            roseType: 'radius',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#1890FF'
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    color: '#ffffff'
                                }
                            },
                            data: series_data
                        }
                    ]
                };
                this.userSourceChart.setOption(option);
                this.newUserLoading = false
            },

            /**
             * 销售统计 - 7日/14日
             */
            getSalesStatistics() {
                let mall_daily_sales_data = localStorage.getItem(baseUrl +'_' + 'mall_daily_sales_data')
                if(mall_daily_sales_data){
                    // console.log('mall_daily_sales_data', JSON.parse(JSON.parse(mall_daily_sales_data).value))
                    this.allSalesData = JSON.parse(JSON.parse(mall_daily_sales_data).value)
                    this.showSaleData = this.allSalesData
                    // 默认 14天 全部店铺
                    // console.log('showSaleData', this.showSaleData)
                    this.setSalesOptions(14)
                    return
                }
                queryOrderDaily()
                    .then(res => {
                        this.allSalesData = res.data || []
                        this.showSaleData = this.allSalesData
                        // 默认 14天 全部店铺
                        this.setSalesOptions(14)
                        this.store(baseUrl +'_' + 'mall_daily_sales_data', JSON.stringify(this.allSalesData));
                    })
                    .catch(err => {})
            },

            /**
             * 销售统计 - 今日
             */
            getSalesDataToday() {
                queryOrderHour()
                    .then(res => {
                        let allHourData = res.data || []
                        if(this.shop_id > -1){
                            this.showSaleData = allHourData.filter((ev)=>{return ev.shop_id === this.shop_id})
                        } else {
                            this.showSaleData = allHourData
                        }
                        this.setSalesHoursOptions()
                    })
                    .catch(err => {})
            },

            // 销售统计 14日/7日 填充
            setSalesOptions(n){
                this.salesLoading = true
                this.saleTrendEChart = this.$echarts.init(this.$refs.saleTrendEChart);
                let x_axis = [],x_list = []
                let date_list = []
                if(n > 1) {
                    for(let i= n; i > 0; i--){
                        x_list.push(this.returnDate(i))
                    }
                    for(let i= 2*n; i > 0; i--){
                        date_list.push(this.returnDate(i))
                    }
                }
                x_axis = this.returnXData(x_list)
                let new_data = []
                this.showSaleData.forEach((event, index)=>{
                    let new_data_children = {}
                    new_data_children['shop_id'] = event.shop_id
                    new_data_children['shop_name'] = '未知店铺'
                    this.shopOptions.forEach((shop_item)=>{
                        if(shop_item.id === event.shop_id) {
                            new_data_children['shop_name'] = shop_item.shop_name
                        }
                    })
                    new_data_children['daily_report_info'] = []
                    date_list.forEach((item)=>{
                        new_data_children['daily_report_info'].push({
                            date: item,
                            money: 0,
                            num: 0,
                            order_count: 0,
                        })
                    })
                    event.daily_report_info.forEach((ev)=>{
                        new_data_children['daily_report_info'].forEach((item)=>{
                            if(ev.date === item.date){
                                item.money = ev.money
                                item.num = ev.num
                                item.order_count = ev.order_count
                            }
                        })
                    })
                    new_data.push(new_data_children)
                })
                let _list = []
                new_data.forEach((event,index)=>{
                    event.daily_report_info.forEach((ev,i)=>{
                        let obj = ev
                        obj['shop_id'] = event.shop_id
                        obj['shop_name'] = event.shop_name
                        _list.push(obj)
                    })
                })
                this.fillSalesOptions(x_axis,_list)
            },

            // 销售统计 今日 填充
            setSalesHoursOptions(){
                this.salesLoading = true
                this.saleTrendEChart = this.$echarts.init(this.$refs.saleTrendEChart);
                let x_axis = []
                let date_list = this.allHourList
                for(let i= 0; i < 25; i++){
                    x_axis.push(i+'点')
                }
                let new_data = []
                this.showSaleData.forEach((event, index)=>{
                    let new_data_children = {}
                    new_data_children['shop_id'] = event.shop_id
                    new_data_children['shop_name'] = '未知店铺'
                    this.shopOptions.forEach((shop_item)=>{
                        if(shop_item.id === event.shop_id) {
                            new_data_children['shop_name'] = shop_item.shop_name
                        }
                    })
                    new_data_children['hourly_report_info'] = []
                    date_list.forEach((item)=>{
                        new_data_children['hourly_report_info'].push({
                            date: item,
                            money: 0,
                            num: 0,
                            order_count: 0,
                        })
                    })
                    event.hourly_report_info.forEach((ev)=>{
                        new_data_children['hourly_report_info'].forEach((item)=>{
                            if(ev.hour === item.date){
                                item.money = ev.money
                                item.num = ev.num
                                item.order_count = ev.order_count
                            }
                        })
                    })
                    new_data.push(new_data_children)
                })
                let _list = []
                new_data.forEach((event,index)=>{
                    event.hourly_report_info.forEach((ev,i)=>{
                        let obj = ev
                        obj['shop_id'] = event.shop_id
                        obj['shop_name'] = event.shop_name
                        _list.push(obj)
                    })
                })
                this.fillSalesOptions(x_axis,_list)

            },
            // 填充 option
            fillSalesOptions(x_axis, _list) {
                let all_data = this.returnNewArr(_list)
                let series_data = this.returnSeriesData(all_data)
                const half = Math.ceil(series_data.length / 2);
                const series_data_before = series_data.splice(0, half)  //
                const series_data_now = series_data.splice(-half)

                // 比较
                let all_money_now = 0, all_num_now = 0, all_order_count_now = 0
                let all_money_before = 0, all_num_before = 0, all_order_count_before = 0
                series_data_now.forEach((ev)=>{
                    all_money_now = commUtil.numberAdd(ev.value, all_money_now)
                    all_num_now = commUtil.numberAdd(ev.all_num, all_num_now)
                    all_order_count_now = commUtil.numberAdd(ev.all_order_count, all_order_count_now)
                })
                // all_money_now = all_money_now.toFixed(2)
                this.$set(this.salesInfo,'all_money', all_money_now)
                this.$set(this.salesInfo,'all_num', all_num_now)
                this.$set(this.salesInfo,'all_order_count', all_order_count_now)
                series_data_before.forEach((ev)=>{
                    all_money_before += ev.value
                    all_num_before += ev.all_num
                    all_order_count_before += ev.all_order_count
                })
                let money_change = 0, num_change = 0, order_count_change = 0
                if(all_money_before != 0 && all_money_now != 0 ) {
                    money_change = ((commUtil.numberSub(all_money_now, all_money_before) / all_money_before) * 100).toFixed(2)
                } else if(all_money_before == 0 && all_money_now != 0){
                    money_change = 1000
                } else if(all_money_before == 0 && all_money_now == 0){
                    money_change = 0
                }

                if(all_num_now != 0 && all_num_before != 0 ) {
                    num_change = ((commUtil.numberSub(all_num_now, all_num_before) / all_num_before) * 100).toFixed(2)
                } else if(all_num_before == 0 && all_num_now != 0){
                    num_change = 1000
                } else if(all_num_before == 0 && all_num_now == 0){
                    num_change = 0
                }
                if(all_order_count_now != 0 && all_order_count_before != 0 ) {
                    order_count_change = ((commUtil.numberSub(all_order_count_now, all_order_count_before) / all_order_count_before) * 100).toFixed(2)
                } else if(all_order_count_before == 0 && all_order_count_now != 0){
                    order_count_change = 1000
                } else if(all_order_count_before == 0 && all_order_count_now == 0){
                    order_count_change = 0
                }
                this.$set(this.salesInfo,'money_change', money_change)
                this.$set(this.salesInfo,'num_change', num_change)
                this.$set(this.salesInfo,'order_count_change', order_count_change)
                let option = {
                    title: {
                        text: '',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
                        },
                        formatter: function(params) {
                            let point = '<span style="width: 6px;height: 6px;border-radius: 100%;background: #1890FF;display: inline-block;margin: 0 5px 2px 0"></span>'
                            let point2 = '<span style="width: 6px;height: 6px;border-radius: 100%;background: #c3c3c3;display: inline-block;margin: 0 5px 2px 0"></span>'
                            let line = '<div style="width: 100%;height: 1px;background: #E8E8E8;position: absolute;top: 100px;left: 0"></div>'
                            let unit = '<span style="margin-right: 2px">¥</span>'
                            let x_name = '',res = ''
                            for (var i = 0; i < params.length; i++) {
                                if(i === 1){
                                    res += '<div style="height: 15px"></div>'
                                    res += params[i].data.date + '<br/>';
                                    res += point2 + params[i].seriesName + '：' + unit + params[i].data.value.toFixed(2) + '<br/>';
                                    res += point2 + '销量：' + params[i].data.all_num + '<br/>';
                                    res += point2 + '订单数：' + params[i].data.all_order_count + '<br/>';
                                } else {
                                    res += params[i].data.date + '<br/>';
                                    res += point + params[i].seriesName + '：' + unit + params[i].data.value.toFixed(2) + '<br/>';
                                    res += point + '销量：' + params[i].data.all_num + '<br/>';
                                    res += point + '订单数：' + params[i].data.all_order_count + '<br/>';
                                }

                                if(i < params.length - 1){
                                    res += line
                                }
                                x_name = params[i].name
                            }
                            return res
                        }
                    },
                    legend: {
                        show: false
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: x_axis
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '销售额',
                            type: 'line',
                            lineStyle:{
                                width:2,
                                color: '#1890FF'
                            },
                            data: series_data_now
                        },
                        {
                            name: '销售额',
                            type: 'line',
                            smooth: false, // 是否支持虚线
                            lineStyle:{
                                width:2,
                                color: '#c3c3c3',
                                type:'dashed'  //'dotted'点 'solid'实线 'dashed'虚线
                            },
                            data: series_data_before
                        }
                    ]
                };
                this.saleTrendEChart.setOption(option);
                this.salesLoading = false
            },
            resizeChart() {
                this.userSourceChart.resize();
                this.saleTrendEChart.resize();
            },
            returnDate(n){
                let curDate = new Date();
                let date = new Date(curDate.getTime() - n * 24*60*60*1000);
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                if (month < 10) {
                    month = "0" + month;
                }
                if (day < 10) {
                    day = "0" + day;
                }
                const nowDate = year + "-" + month + "-" + day;
                return nowDate
            },

            returnHourList(n){
                let curDate = new Date();
                let date = new Date(curDate.getTime() - n * 24*60*60*1000);
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                if (month < 10) {
                    month = "0" + month;
                }
                if (day < 10) {
                    day = "0" + day;
                }
                const nowDate = year + "-" + month + "-" + day;
                const list = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24']
                let hourList = []
                list.forEach((ev)=>{
                    hourList.push(nowDate + ' ' + ev)
                })
                return hourList
            },

            returnXData(list) {
                let x_axis = []
                list.forEach((ev,i)=>{
                    let new_date_text = ev
                    if(new_date_text.indexOf('-') > -1) {
                        let date_text_arr = new_date_text.split('-')
                        let new_date_arr = []
                        date_text_arr.forEach((item)=>{
                            if(item.length < 4) {
                                new_date_arr.push(item)
                            }
                        })
                        new_date_text = new_date_arr.join('.')
                    }
                    x_axis.push(new_date_text)
                })
                return x_axis
            },

            // 把一维数组 合并为二维数组 （具有相同键值对的合并到一起）
            // 例：[{age: 8, name: '小米'},{age: 9, name: '小明'},{age: 8, name: '小红'},{age: 9, name: '阿花'},{age: 10, name: '大壮'}]
            // 转为 [[{age: 8, name: '小米'},{age: 8, name: '小红'}],[{age: 9, name: '小明'}, {age: 9, name: '阿花'}], [{age: 10, name: '大壮'}]]
            returnNewArr(_list) {
                let map = new Map();
                let newArr = [];
                _list.forEach(item => {
                    map.has(item.date) ? map.get(item.date).push(item) : map.set(item.date, [item]);
                })
                newArr = [...map.values()];
                return newArr
            },

            returnSeriesData(newArr) {
                let series_data = []
                newArr.forEach((event)=>{
                    let _obj = {
                        value: 0,
                        all_num: 0,
                        all_order_count: 0,
                        date: '',
                        list: [],
                    }
                    event.forEach((ev)=>{
                        _obj.list.push({
                            shop_name: ev.shop_name,
                            money: ev.money,
                            num: ev.num,
                            order_count: ev.order_count,
                        })
                        _obj.value += ev.money
                        _obj.all_num += ev.num
                        _obj.all_order_count += ev.order_count
                        _obj.date = ev.date
                    })
                    _obj.value = commUtil.numberMul(_obj.value, 0.01)
                    series_data.push(_obj)
                })
                return series_data
            },

            // 获取指定时间的时间戳
            convertTime(nowDate, deadLine){
                // 分割参数Deadline
                let _dateArr = deadLine.split(':');
                // 分别获取参数中对应的时、分、秒
                let hours = parseInt(_dateArr[0]);
                let minutes = parseInt(_dateArr[1]);
                let seconds = parseInt(_dateArr[2]);
                // 设置对应时分秒
                nowDate.setHours(hours);
                nowDate.setMinutes(minutes);
                nowDate.setSeconds(seconds);
                // 获取当前天中指定时分秒对应的毫秒数
                return  Date.parse(nowDate);
            },
            // 超过时间，清除缓存数据
            clearLocalStorageData(local_name_list){
                let len = localStorage.length
                for(var i = 0; i < len; i++) {
                    const getKey = localStorage.key(i);
                    if(localStorage.getItem(getKey)){
                        const name = localStorage.getItem(getKey);
                        // 清除自己设置的key
                        if (local_name_list.indexOf(getKey) > -1) {
                            const nameObj = JSON.parse(name);
                            // console.log('getKey===>', getKey)
                            if (nameObj.time && nameObj.expire) {
                                // console.log('nameObj.time', nameObj.time)
                                // console.log('nameObj.expire', nameObj.expire)
                                if(new Date().getTime() - nameObj.time >= nameObj.expire){
                                    localStorage.removeItem(getKey)
                                }
                            }
                        }
                    }
                }
            },
            // 写入缓存
            store(key, value) {
                const curDate = new Date();
                // 获取当前日期对应的时间戳
                const curTime = curDate.getTime();
                // 获取指定时间的时间戳
                const endTime = this.convertTime(curDate, '24:00:00');
                // 计算出指定时间与当前时间的时间差
                const disTime = endTime - curTime;
                let obj = {
                    time: new Date().getTime(),
                    value: value,
                    expire: disTime,
                };
                let objStr = JSON.stringify(obj);
                localStorage.setItem(key,objStr);
            },

            // 返回普通用户权限
            returnPermissionsList(){
                const role_auth_list = JSON.parse(localStorage.getItem('roleAuthList') || '[]')
                let permissions = []
                role_auth_list.forEach((ev)=>{
                    permissions.push(ev.name)
                })
                return permissions
            }

        }
    };
</script>
<style scoped lang="less">
    .test{
        float: left;
    }
    .dashboard-page{
        display: flex;
        flex-wrap: wrap;
        .wrap-box-item{
            width: 580px;
            margin-bottom: 24px;
        }
        .top-box{
            width: 100%;
            padding: 0 20px;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
            background: #fff;
            .box-el-main{
                width: 100%;
                display: flex;
                justify-content: space-between;
            }
            .left-box,.center-box,.right-box{
                width: 180px;
                height: 100px;
                text-align: center;
                .count-value{
                    font-size: 26px;
                    font-family: PingFangSC-Medium, PingFang SC;
                    font-weight: 500;
                    color: #1890FF;
                    line-height: 37px;
                    margin-top: 17px;
                }
                .count-text{
                    font-size: 14px;
                    font-family: PingFangSC-Regular, PingFang SC;
                    font-weight: 400;
                    color: rgba(0, 0, 0, 0.85);
                    line-height: 20px;
                    margin-top: 4px;
                }
            }
        }
        .bottom-box{
            width: 100%;
            margin-top: 24px;
            background: #fff;
            .single-chart{
                display: flex;
                width: 100%;
                min-width: 380px;
                height: 360px;
            }
        }
        .sku-sales-box{
            width: 580px;
            background: #fff;
            margin-top: 24px;
            .sku-list{
                width: 100%;
                height: 308px;
                padding: 17px 32px 25px;
                box-sizing: border-box;
                -webkit-box-sizing: border-box;
                .sku-item{
                    width: 100%;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    font-family: PingFangSC-Regular, PingFang SC;
                    font-weight: 400;
                    color: rgba(0, 0, 0, 0.65);
                    line-height: 22px;
                    .ranking{
                        width: 20px;
                        height: 20px;
                        background: #314659;
                        border-radius: 100%;
                        color: #FFFFFF;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .ranking-other{
                        background: #F0F2F5;
                        color: rgba(0, 0, 0, 0.65);
                    }
                    .sku-name{
                        margin-left: 24px;
                        width: 360px;
                    }
                    .sku-amount{
                        margin-left: auto;
                    }
                }
            }
        }
        .title-box{
            height: 50px;
            padding: 0 32px;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
            border-bottom: 1px solid #E8E8E8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title-left-box{
                font-size: 16px;
                font-family: PingFangSC-Medium, PingFang SC;
                font-weight: 500;
                color: rgba(0, 0, 0, 0.85);
                line-height: 22px;
            }
            .tabs-nav{

            }
            .tabs-nav{
                margin-left: auto;
                margin-right: 10px;
                /deep/ .el-radio-button--small .el-radio-button__inner{
                    width: 48px;
                }
                /deep/ .el-radio-button__orig-radio:checked+.el-radio-button__inner{
                    background: #fff;
                    color: #1890FF;
                    border-color: #1890FF;
                    -webkit-box-shadow: -1px 0 0 0 #1890FF;
                    box-shadow: -1px 0 0 0 #1890FF;
                }
                /deep/ .el-radio-button:first-child .el-radio-button__inner{
                    border-radius: 2px 0 0 2px;
                }
                /deep/ .el-radio-button:last-child .el-radio-button__inner{
                    border-radius: 0 2px 2px 0;
                }
                /deep/ .el-radio-button--small .el-radio-button__inner{
                    padding: 9px 0;
                    color: rgba(0, 0, 0, 0.3);
                }
            }
            .title-more{
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: rgba(0, 0, 0, 0.85);
                line-height: 22px;
                padding-left: 20px;
                cursor: pointer;
            }
            .box-channel{
                .filter-channel{
                    width: 140px !important;
                }
            }
        }
        .el-main{
            padding: 0;
        }
        .sales-statistics-wrap{
            background: #fff;
            width: 100%;
            .sale-trend{
                width: 100%;
                padding: 12px 32px 0;
                box-sizing: border-box;
                -webkit-box-sizing: border-box;
                display: flex;
                justify-content: space-between;
                .trend-item{
                    width: 168px;
                    height: 80px;
                    background: #F6F6F6;
                    border-radius: 2px;
                    box-sizing: border-box;
                    -webkit-box-sizing: border-box;
                    padding: 0 6px 0 10px;
                    .trend-title{
                        height: 17px;
                        font-size: 12px;
                        font-family: PingFangSC-Medium, PingFang SC;
                        font-weight: 500;
                        color: rgba(0, 0, 0, 0.35);
                        line-height: 17px;
                        margin-top: 16px;
                    }
                    .trend-value{
                        margin-top: 8px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        height: 22px;
                        .amount{
                            height: 22px;
                            font-size: 16px;
                            font-family: PingFangSC-Medium, PingFang SC;
                            font-weight: 500;
                            color: rgba(0, 0, 0, 0.85);
                            line-height: 22px;
                        }
                        .percentage-value{
                            height: 17px;
                            font-size: 12px;
                            font-family: PingFangSC-Regular, PingFang SC;
                            font-weight: 400;
                            color: rgba(0, 0, 0, 0.85);
                            line-height: 17px;
                            display: flex;
                            align-items: center;
                            .icon-upArrow{
                                color: #3BA508;
                                font-size: 14px;
                                margin-right: 2px;
                            }
                            .icon-downArrow{
                                color: #B5090B;
                                font-size: 14px;
                                margin-right: 2px;
                            }
                        }
                    }
                }
            }
            .single-chart{
                display: flex;
                width: 100%;
                min-width: 380px;
                height: 360px;
                /*padding-top: 20px;*/
                margin-top: -20px;
            }
        }
        .h380{
            height: 380px;
        }
        .marginRight24{
            margin-right: 24px;
        }
    }
</style>