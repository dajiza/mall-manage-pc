<template>
    <div class="order-list-container" id="containerWrap" @click="searchShow = false">
        <div class="container container-table-has-search p-t-0 pos-relative">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">优惠券列表</div>
                <div class="grey-line"></div>
                <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                <transition name="slide-fade">
                    <div class="container clearfix head-container" ref="searchBox" v-show="searchShow" @click.stop="">
                        <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left" @keydown.enter.native="handleSearch()">
                            <el-form-item label="优惠券名称" prop="title" class="">
                                <el-input class="filter-item" v-model="searchForm.title" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="优惠券类型" prop="type" class="">
                                <el-select class="filter-item" v-model="searchForm.type" placeholder="请选择" clearable>
                                    <el-option v-for="state in typeOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>
                           <!-- <el-form-item label="优惠券状态" prop="status" class="">
                                <el-select class="filter-item" v-model="searchForm.status" placeholder="请选择" clearable>
                                    <el-option v-for="state in statusOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>-->
                            <el-form-item label="可用店铺" prop="shop_id" class="">
                                <el-select class="filter-item" v-model="searchForm.shop_id" placeholder="请选择" clearable>
                                    <el-option v-for="state in shopOptions" :key="state.id" :value="state.id" :label="state.shop_name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="来源" prop="get_way" class="">
                                <el-select class="filter-item" v-model="searchForm.get_way" placeholder="请选择" clearable>
                                    <el-option v-for="state in wayOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="优惠券面额" prop="coupon_amount" class="">
                                <el-input class="filter-item" v-model="searchForm.coupon_amount" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item class="form-item-btn" label="">
                                <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                                <el-button class="filter-btn" type="primary" @click="handleSearch()">搜索</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </transition>
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
                        <span style="width: 20px;display: inline-block">...</span>
                    </div>
                </div>
                <el-radio-group v-model="useStatus" class="tabs-nav" @change="handleTabClick">
                    <el-radio-button label="1">已启用</el-radio-button>
                    <el-radio-button label="2">已停用</el-radio-button>
                </el-radio-group>
                <el-button style="margin-right: 24px" type="primary" @click="handleAdd" v-hasPermission="'mall-backend-coupon-create'">新增优惠券</el-button>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column label="操作" width="190">
                    <template slot-scope="scope">
                        <div v-if="scope.row.status === 1">
                            <el-button
                                type="text"
                                class="marginLeft0 delete-color marginRight15"
                                v-hasPermission="'mall-backend-coupon-update-status'"
                                @click="handleChangeStatus(scope.$index, scope.row)"
                                >停用</el-button
                            >
                            <el-button
                                type="text"
                                class="marginLeft0 marginRight15"
                                :class="{ 'delete-color': scope.row.grant_status < 2 }"
                                v-hasPermission="'mall-backend-coupon-update-grant-status'"
                                @click="handleChangeGrantStatus(scope.$index, scope.row)"
                                >{{ scope.row.grant_status > 1 ? '启用发放' : '停止发放' }}</el-button
                            >
                            <div style="display: inline-block" v-show="scope.row.grant_status < 2">
                                <el-button
                                    type="text"
                                    class="marginLeft0 marginRight0"
                                    v-hasPermission="'mall-backend-coupon-user-import-excel'"
                                    @click="handleSendStamps(scope.$index, scope.row, 'edit')"
                                    >发券</el-button
                                >
                            </div>
                            <div style="display: inline-block" v-show="scope.row.grant_status > 1">
                                <el-button type="text" class="marginLeft0" v-hasPermission="'mall-backend-coupons-copy'" @click="handleEditOrCopy(scope.$index, scope.row, 'copy')"
                                    >复制</el-button
                                >
                            </div>
                            <el-button
                                type="text"
                                class="marginLeft0 marginRight15"
                                v-hasPermission="'mall-backend-coupon-update'"
                                @click="handleEditOrCopy(scope.$index, scope.row, 'edit')"
                                >编辑</el-button
                            >
                            <el-button
                                type="text"
                                class="marginLeft0 marginRight15"
                                v-hasPermission="'mall-backend-coupon-user-import-excel-record'"
                                @click="handleIssueRecord(scope.$index, scope.row)"
                                >发放记录</el-button
                            >
                            <div style="display: inline-block" v-show="scope.row.grant_status < 2">
                                <el-button type="text" class="marginLeft0" v-hasPermission="'mall-backend-coupons-copy'" @click="handleEditOrCopy(scope.$index, scope.row, 'copy')"
                                    >复制</el-button
                                >
                            </div>
                        </div>
                        <div v-if="scope.row.status === 2">
                            <el-button type="text" class="marginLeft0 marginRight15" @click="handleChangeStatus(scope.$index, scope.row)">启用</el-button>
                            <el-button
                                type="text"
                                class="marginLeft0 marginRight15"
                                v-hasPermission="'mall-backend-coupons-copy'"
                                @click="handleEditOrCopy(scope.$index, scope.row, 'copy')"
                                >复制</el-button
                            >
                            <el-button
                                type="text"
                                class="marginLeft0"
                                v-hasPermission="'mall-backend-coupon-user-import-excel-record'"
                                @click="handleIssueRecord(scope.$index, scope.row)"
                                >发放记录</el-button
                            >
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="50"></el-table-column>
                <el-table-column prop="title" label="优惠券名称" width="170"></el-table-column>
                <el-table-column prop="shop_name" label="可用店铺" min-width="100"></el-table-column>
                <el-table-column prop="status" label="状态" width="85">
                    <template slot-scope="scope">
                        <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已停用' : '已启用' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="优惠券类型" width="100">
                    <template slot-scope="scope">
                        {{ scope.row.type > 1 ? '折扣' : '满减' }}
                    </template>
                </el-table-column>
                <el-table-column label="优惠券面额" width="100">
                    <template slot-scope="scope">
                        <div v-if="scope.row.type > 1">{{ scope.row.coupon_amount / 10 }}折</div>
                        <div v-else>{{ (scope.row.coupon_amount / 100) | rounding }}元</div>
                    </template>
                </el-table-column>
                <el-table-column label="使用门槛" width="100">
                    <template slot-scope="scope">
                        <div v-if="scope.row.with_amount > 0">满{{ (scope.row.with_amount / 100) | rounding }}元</div>
                        <div v-else>无门槛</div>
                    </template>
                </el-table-column>
                <el-table-column label="使用期限" width="176">
                    <template slot-scope="scope">
                        <div v-if="Number(scope.row.valid_type) === 1">领券后{{ scope.row.valid_days }}天内</div>
                        <div v-else>{{ scope.row.valid_start_time }} - {{ scope.row.valid_end_time }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="quota" label="发放数量" width="100"></el-table-column>
                <el-table-column prop="take_count" label="已领取数量" width="100"></el-table-column>
                <el-table-column prop="used_count" label="已使用数量" width="100"></el-table-column>
                <el-table-column label="可用商品" width="100">
                    <template slot-scope="scope">{{ useGoods(scope.row.use_goods_type) }}</template>
                </el-table-column>
                <el-table-column label="来源" width="110">
                    <template slot-scope="scope">{{ backSourceText(scope.row.get_way) }}</template>
                </el-table-column>
                <el-table-column prop="status_invalid_reason" label="停用理由" width="110"></el-table-column>
                <el-table-column prop="status_valid_reason" label="重新启用理由" width="110"></el-table-column>
                <template slot="empty">
                    <EmptyList v-show="false"></EmptyList>
                </template>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
            <div class="empty-list-box" v-show="tableData.length === 0">
                <EmptyList></EmptyList>
            </div>
        </div>
        <!--停用/启用 理由弹出框 reasonDialog -->
        <el-dialog
            :title="reasonTitle"
            :visible.sync="reasonDialog"
            custom-class="reason-dialog"
            width="360px"
            :before-close="reasonClose"
            :destroy-on-close="true"
            :close-on-click-modal="false"
        >
            <el-form ref="reasonDialogBox" class="reason-form" :model="reasonDialogForm" :rules="reasonFormRules" label-width="90px" label-position="left">
                <el-form-item label="" prop="reason" style="margin-bottom: 0" label-width="0px">
                    <el-input type="text" placeholder="请输入" v-model="reasonDialogForm.reason"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="reasonClose">取 消</el-button>
                <el-button type="primary" @click="handleSureChangeStatus">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 发放优惠券弹出框 sendCouponsDialog -->
        <el-dialog
            title="发放优惠券"
            :visible.sync="sendCouponsDialog"
            custom-class="send-coupons-dialog"
            width="380px"
            :before-close="sendCouponsClose"
            :destroy-on-close="true"
            :close-on-click-modal="false"
        >
            <el-form class="send-coupons-form" ref="sendCouponsDialogBox" :model="sendCouponsDialogForm" :rules="sendCouponsFormRules" label-width="90px" label-position="left">
                <el-form-item label="优惠券名称:">
                    <el-input type="text" disabled v-model="couponsTitle"></el-input>
                </el-form-item>
                <el-form-item label="优惠券面额:">
                    <el-input type="text" disabled v-model="couponsAmount"></el-input>
                </el-form-item>
                <el-form-item label="使用门槛:">
                    <el-input type="text" disabled v-model="couponsWithAmount"></el-input>
                </el-form-item>
                <el-form-item label="发放说明:" prop="instructions" style="margin-bottom: 0">
                    <el-input type="text" placeholder="请输入" v-model="sendCouponsDialogForm.instructions"></el-input>
                </el-form-item>
            </el-form>
            <div class="upload-box" :class="{ paddingTOP0: fileUrl }">
                <el-upload
                    ref="upload"
                    class="upload-demo"
                    :action="uploadFilesUrl"
                    :headers="header"
                    :data="uploadParams"
                    :before-upload="beforeUploadFiles"
                    :on-success="uploadFilesSuccess"
                    :on-error="uploadFilesImgError"
                    :on-remove="handleRemove"
                    :file-list="fileList"
                >
                    <el-button v-if="!fileUrl"><i class="el-icon-upload el-icon-upload-class"></i>上传文件</el-button>
                </el-upload>
                <div class="file-type">只支持.xlsx格式</div>
                <a class="down-mode" href="https://storehouse-upyun.chuanshui.com/coupon/coupon-excel.xlsx">
                    <el-button type="text" class="marginLeft0">下载模版</el-button>
                </a>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="sendCouponsClose">取 消</el-button>
                <el-button type="primary" @click="handleSureSendCoupons">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 发放记录弹出框 -->
        <IssueRecord
            v-if="recordModalInfo.visible"
            :recordModalInfo="recordModalInfo"
            @handleCloseRecordModal="handleCloseRecordModal"
            @handleSureRecordModal="handleSureRecordModal"
        />
    </div>
</template>

<script>
import { queryList, changeStatus, changeGrantStatus, querySendCoupons, sendCouponsLog } from '../../../../api/coupons'
import EmptyList from '../../../common/empty-list/EmptyList'
import './coupons.less'
import { queryShopList } from '@/api/goods'
import IssueRecord from '../../../common/issue-record/IssueRecord.vue'
import commUtil from '@/utils/commUtil'
import { getToken } from '@/utils/auth'

export default {
    name: 'OrderList',
    data() {
        return {
            searchForm: {
                title: '', // 优惠券名称
                type: '', // 优惠券类型
                shop_id: '', // 优惠券店铺
                coupon_amount: '' // 优惠券面额
            },
            searchParams: {
                title: '', // 优惠券名称
                type: '', // 优惠券类型
                shop_id: '', // 优惠券店铺
                coupon_amount: '' // 优惠券面额
            },
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            loading: false,
            tableData: [],
            pageTotal: 0, // 总条数
            id: -1,
            statusOptions: [
                { id: 1, name: '已启用' },
                { id: 2, name: '已停用' }
            ], // 状态下拉
            shopOptions: [], // 代理店铺下拉列表
            typeOptions: [
                { id: 1, name: '满减' },
                { id: 2, name: '折扣' }
            ], // 类型下拉列表
            tableHeight: 'calc(100vh - 194px)',
            recordModalInfo: {
                visible: false,
                currentItem: {}
            }, // 发放记录信息
            reasonDialog: false,
            reasonDialogForm: {
                reason: ''
            },
            reasonFormRules: {
                reason: [{ required: true, message: '请输入原因', trigger: 'blur' }]
            },
            reasonTitle: '',
            couponsId: -1,
            sendCouponsDialog: false, // 发放优惠券
            couponsTitle: '',
            couponsAmount: '',
            couponsWithAmount: '',
            sendCouponsDialogForm: {
                instructions: ''
            },
            sendCouponsFormRules: {
                instructions: [{ required: true, message: '请输入发放说明', trigger: 'blur' }]
            },
            uploadFilesUrl: '',
            header: {},
            fileList: [],
            upload_loading: {},
            uploadVisible: false,
            fileUrl: '',
            fileName: '',
            uploadParams: {},
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            wayOptions:[
                {id:1, name: '页面可领取'},
                {id:2, name: '新人优惠券'},
                {id:3, name: '积分商城'},
                {id:4, name: '促销满券赠送'},
                {id:5, name: '后台导入'}
            ],
            useStatus: 1, // 启用状态
        }
    },
    components: {
        EmptyList,
        IssueRecord
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
    computed: {
        statusClass: function() {
            return data => {
                if (data === 0) {
                    return 'order-paid'
                } else if (data === 1) {
                    return 'order-paid'
                } else if (data === 2) {
                    return 'order-cancelled'
                }
            }
        },
        useGoods: function() {
            let str = ''
            return data => {
                if (data === 1) {
                    str = '全场可用'
                } else if (data === 2) {
                    str = '指定商品'
                } else if (data === 3) {
                    str = '指定标签'
                }
                return str
            }
        },
        backSourceText: function() {
            let str = ''
            return data => {
                if (data === 1) {
                    str = '页面可领取'
                } else if (data === 2) {
                    str = '新人优惠券'
                } else if (data === 3) {
                    str = '积分商城'
                } else if (data === 4) {
                    str = '促销满券赠送'
                } else if (data === 5) {
                    str = '后台导入'
                }
                return str
            }
        },
    },
    created() {
        // 图片上传地址
        this.uploadFilesUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
    },
    mounted() {
        this.queryShopList() // 获取代理店铺列表
        // 获取订单列表数据
        this.getListData()
    },
    methods: {
        // 请求-获取订单列表数据
        getListData() {
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                title: this.searchParams.title,
                type: this.searchParams.type ? this.searchParams.type : -1,
                status: Number(this.useStatus),
                shop_id: this.searchParams.shop_id ? this.searchParams.shop_id : -1,
                get_way: this.searchParams.get_way || 0,
                coupon_amount: -1
            }
            if (this.searchParams.coupon_amount) {
                params['coupon_amount'] = commUtil.numberMul(Number(this.searchParams.coupon_amount), 100)
            }
            const rLoading = this.openLoading()
            queryList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists
                            this.pageTotal = res.data.total
                        } else {
                            this.tableData = []
                            this.pageTotal = 0
                        }
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {})
        },

        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopOptions = res.data || []
                })
                .catch(err => {})
        },
        handleTabClick() {
            console.log('useStatus',this.useStatus)
            this.resetForm('searchForm')
        },
        // 按钮 - 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleSearch()
        },

        // 按钮-触发搜索按钮
        handleSearch() {
            this.$set(this.pageInfo, 'pageIndex', 1)
            // 存储搜索条件
            this.searchParams = _.cloneDeep(this.searchForm)
            this.searchShow = false
            this.setSearchValue()
            this.getListData()
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            console.log('status', this.searchParams['status'])
            console.log('this.searchParams', this.searchParams)
            // 优惠券名称 title
            if (this.searchParams['title']) {
                let obj = {
                    label: 'title',
                    val: this.searchParams['title']
                }
                _search.push(obj)
            }
            // 优惠券类型 type
            if (this.searchParams['type']) {
                this.typeOptions.forEach(ev => {
                    if (ev.id == this.searchParams['type']) {
                        let obj = {
                            label: 'type',
                            val: ev.name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 优惠券状态 status
            if (this.searchParams['status']) {
                this.statusOptions.forEach(ev => {
                    if (ev.id == this.searchParams['status']) {
                        let obj = {
                            label: 'status',
                            val: ev.name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 可用店铺 shop_id
            if (this.searchParams['shop_id']) {
                this.shopOptions.forEach(ev => {
                    if (ev.id == this.searchParams['shop_id']) {
                        let obj = {
                            label: 'shop_id',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }
            // 来源 get_way
            if (this.searchParams['get_way']) {
                this.wayOptions.forEach(ev => {
                    if (ev.id == this.searchParams['get_way']) {
                        let obj = {
                            label: 'get_way',
                            val: ev.name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 优惠券面额 user_phone
            if (this.searchParams['coupon_amount']) {
                let obj = {
                    label: 'coupon_amount',
                    val: this.searchParams['coupon_amount']
                }
                _search.push(obj)
            }
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            console.log('item',item)
            this.$set(this.searchForm, item.label, '')
            this.$set(this.searchParams, item.label, '')
            this.handleSearch()
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val)
            this.searchForm = _.cloneDeep(this.searchParams)
            this.getListData()
        },
        // 启用/停用
        handleChangeStatus(index, row) {
            this.couponsId = row.id
            if (row.status > 1) {
                this.reasonTitle = '重新启用理由'
            } else {
                this.reasonTitle = '停用理由'
            }
            this.reasonDialog = true
        },

        //
        handleAdd() {
            this.$router.push({ path: '/mall-backend-coupon-create' })
        },

        // 编辑/复制优惠券
        handleEditOrCopy(index, row, status) {
            this.$router.push({
                path: status === 'edit' ? '/mall-backend-coupon-update' : '/mall-backend-coupons-copy',
                query: { id: row.id, status }
            })
        },

        //打开操作记录弹出框
        handleIssueRecord(index, row) {
            this.recordModalInfo = Object.assign({}, this.recordModalInfo, { currentItem: row, visible: true })
        },

        //修改库存记录关闭回调
        handleCloseRecordModal(visible) {
            this.$set(this.recordModalInfo, 'visible', visible)
        },
        //操作记录确定回调
        handleSureRecordModal(visible) {
            this.$set(this.recordModalInfo, 'visible', visible)
        },

        // 停用启用弹窗关闭
        reasonClose() {
            this.$refs['reasonDialogBox'].resetFields()
            this.$refs['reasonDialogBox'].clearValidate()
            this.reasonDialog = false
        },

        // 确定停用启用
        handleSureChangeStatus() {
            let params = {
                id: this.couponsId
            }
            this.$refs['reasonDialogBox'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    const rLoading = this.openLoading()
                    if (this.reasonTitle === '停用理由') {
                        params['status'] = 2
                        params['status_invalid_reason'] = this.reasonDialogForm.reason
                    } else {
                        params['status'] = 1
                        params['status_valid_reason'] = this.reasonDialogForm.reason
                    }
                    changeStatus(params)
                        .then(res => {
                            rLoading.close()
                            if (res.code === 200) {
                                this.$notify({
                                    title: '操作成功',
                                    message: '',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.getListData()
                                this.reasonClose()
                                // this.reasonDialog = false;
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
                } else {
                }
            })
        },

        // 按钮-停止发放
        handleChangeGrantStatus(index, row) {
            let params = {}
            params['id'] = row.id
            if (row.grant_status > 1) {
                params['grant_status'] = 1
                this.grantStop(params)
            } else {
                // 二次确认
                this.$confirm('确定要停止发放吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning'
                })
                    .then(() => {
                        params['grant_status'] = 2
                        this.grantStop(params)
                    })
                    .catch(() => {})
            }
        },
        // 请求-停止发放
        grantStop(params) {
            const rLoading = this.openLoading()
            changeGrantStatus(params).then(res => {
                rLoading.close()
                if (res.code === 200) {
                    // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                    if (this.pageIndex > 1 && this.tableData.length < 2) {
                        this.pageIndex = this.pageIndex - 1
                    }
                    this.$notify({
                        title: '操作成功',
                        message: '',
                        type: 'success',
                        duration: 1000
                    })
                    this.getListData()
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 3000
                    })
                }
            })
        },

        // 按钮-发券
        handleSendStamps(index, row) {
            if (row.type > 1) {
                this.couponsAmount = row.coupon_amount / 10 + '折'
            } else {
                this.couponsAmount = row.coupon_amount / 100 + '元'
            }
            if (row.with_amount > 0) {
                this.couponsWithAmount = '满' + row.with_amount / 100 + '元可用'
            } else {
                this.couponsWithAmount = '无门槛'
            }
            this.fileUrl = ''
            this.fileList = []
            this.couponsId = row.id
            this.couponsTitle = row.title
            this.sendCouponsDialog = true
        },
        // 发券弹窗关闭
        sendCouponsClose() {
            this.$refs['sendCouponsDialogBox'].resetFields()
            this.$refs['sendCouponsDialogBox'].clearValidate()
            this.sendCouponsDialog = false
        },
        handleSureSendCoupons() {
            let params = {
                coupon_id: this.couponsId
            }
            this.$refs['sendCouponsDialogBox'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    if (this.fileUrl) {
                        // const rLoading = this.openLoading();
                        params['file_name'] = this.fileName
                        params['remark'] = this.sendCouponsDialogForm.instructions
                        params['file_url'] = this.fileUrl
                        this.querySendCoupons(params)
                    } else {
                        this.$notify({
                            title: '请上传文件',
                            message: '',
                            type: 'error',
                            duration: 3000
                        })
                    }
                } else {
                    this.$notify({
                        title: '请填写发放说明',
                        message: '',
                        type: 'error',
                        duration: 3000
                    })
                }
            })
        },
        //
        querySendCoupons(params) {
            const rLoading = this.openLoading('操作中')
            // this.upload_loading = this.uploadLoading('操作中');
            querySendCoupons(params)
                .then(res => {
                    rLoading.close()
                    // this.upload_loading.close();
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        // this.sendCouponsDialog = false;
                        this.sendCouponsClose()
                        this.getListData()
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {})
        },

        // 压缩文件上传前回调
        beforeUploadFiles(file) {
            // const list = ['rar','zip','doc','docx','pdf','jpg','xlsx'];
            this.uploadVisible = false
            this.uploadParams['file_name'] = file.name
            let nameLength = file.name.length
            const _str = file.name.substring(nameLength - 5, nameLength)
            if (_str.indexOf('.xlsx') > -1) {
                this.upload_loading = this.uploadLoading('上传中')
                this.uploadVisible = false
            } else {
                this.$notify({
                    title: '只支持.xlsx格式,请按要求上传',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
                return false
            }
        },

        // 压缩文件上传成功回调
        uploadFilesSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.upload_loading.close()
                this.$notify({
                    title: '操作成功',
                    message: '',
                    type: 'success',
                    duration: 3000
                })
                // console.log('response', response);
                this.fileName = file.name
                this.fileUrl = response.data.file_url
            } else {
                this.upload_loading.close()
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'error',
                    duration: 5000
                })
            }
        },

        // 压缩文件上传失败回调
        uploadFilesImgError(err, file, fileList) {
            this.upload_loading.close()
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            })
        },
        handleRemove() {
            this.fileUrl = ''
        }
    }
}
</script>
<style scoped lang="less">
    .tabs-nav{
        margin-right: 20px;
    }
    .tabs-nav /deep/ .el-radio-button__orig-radio:checked+.el-radio-button__inner {
        background: #fff;
        color: #1890ff;
        border-color: #1890ff;
        -webkit-box-shadow: -1px 0 0 0 #1890ff;
        box-shadow: -1px 0 0 0 #1890ff;
    }
    .tabs-nav /deep/ .el-radio-button:first-child .el-radio-button__inner{
        border-radius: 2px 0 0 2px;
    }
    .tabs-nav /deep/ .el-radio-button:last-child .el-radio-button__inner{
        border-radius: 0 2px 2px 0;
    }
</style>
