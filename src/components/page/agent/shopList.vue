<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">店铺管理</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
                        <el-form-item label="店铺名称" prop="name">
                            <el-select class="filter-item" v-model="formFilter.name" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.shop_name"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="绑定代理" prop="agent_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.agent_name"></el-input>
                        </el-form-item>
                        <el-form-item label="代理手机号" prop="agent_phone">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.agent_phone"></el-input>
                        </el-form-item>
                        <el-form-item label="管理员微信昵称" prop="admin_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.admin_name"></el-input>
                        </el-form-item>
                        <el-form-item label="店铺状态" prop="status">
                            <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                                <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
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
            <el-button type="primary" @click="shopCreat" class="shop-goods" v-hasPermission="'mall-backend-shop-create'">新增店铺</el-button>
        </div>
        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <div v-hasPermission="'mall-backend-shop-update'">
                        <el-button class="text-blue table-btn" type="text" size="" @click.native="updateOrder(scope.row)">订单配置</el-button>
                        <el-button class="text-blue table-btn" type="text" size="" @click.native="editShop(scope.row)">编辑</el-button>
                        <el-button class="text-blue table-btn" type="text" size="" @click.native="updateCommission(scope.row)">佣金配置</el-button>
                        <el-button class="text-blue table-btn" type="text" size="" @click.native="updateConfig(scope.row)">小程序配置</el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="店铺名称" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺logo" width="90">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.shop_icon" alt="" @click="openPreview(scope.row.img)" />
                </template>
            </el-table-column>
            <el-table-column label="开店时间" width="176">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_at }}</span>
                </template>
            </el-table-column>
            <el-table-column label="绑定代理">
                <template slot-scope="scope">
                    <span>{{ scope.row.agent_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="代理手机号" width="110">
                <template slot-scope="scope">
                    <span>{{ scope.row.agent_phone }}</span>
                </template>
            </el-table-column>
            <el-table-column label="管理员微信昵称" width="130">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_admin_wx_nick_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="可提现金额" width="110">
                <template slot-scope="scope">
                    <span>{{ formatMoney(scope.row.withdrawal_amount) }}</span>
                </template>
            </el-table-column>

            <el-table-column label="店铺状态" width="100">
                <template slot-scope="scope">
                    <div class="type-tag type-green" v-if="scope.row.status == 1">营业中</div>
                    <div class="type-tag type-grey" v-if="scope.row.status == 2">已打样</div>
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
        <!-- 新增 / 编辑店铺 -->
        <el-dialog :visible.sync="dialogVisibleCreat" :before-close="handleCloseCreat" :title="dialogTitle" width="390px">
            <el-form ref="formCreat" :rules="creatRules" :model="formCreat" :inline="true" size="small" label-position="left" label-width="80px">
                <el-form-item label="店铺名称" prop="name">
                    <el-input class="dialog-item" placeholder="请输入" v-model="formCreat.name"></el-input>
                </el-form-item>
                <el-form-item label="绑定代理" prop="agent_id">
                    <el-select class="dialog-item" v-model="formCreat.agent_id" placeholder="请选择" filterable>
                        <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="店铺logo" prop="title">
                    <el-upload
                        class="upload-demo"
                        :action="uploadImgUrl"
                        :headers="header"
                        :before-upload="beforeUpload"
                        :on-success="uploadImgSuccess"
                        :on-error="uploadImgError"
                        :show-file-list="false"
                    >
                        <el-button icon="el-icon-upload2" size="mini" type="" v-if="!filePic">点击上传</el-button>
                        <div class="preview" v-if="filePic">
                            <img class="fullimg" :src="filePic" alt="" />
                            <!-- <i class="el-icon-close"></i> -->
                        </div>
                        <div slot="tip" class="el-upload__tip">支持扩展名：jpg、png…</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleCloseCreat">取 消</el-button>
                <el-button type="primary" @click="submitCreat">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 小程序配置 -->
        <el-dialog :visible.sync="dialogVisibleConfig" :before-close="handleCloseConfig" title="小程序配置" width="390px">
            <el-form ref="formConfig" :rules="configRules" :model="formConfig" :inline="true" size="small" label-position="left" label-width="130px">
                <el-form-item label="店铺状态" prop="status">
                    <el-radio v-model="formConfig.status" :label="1">营业</el-radio>
                    <el-radio v-model="formConfig.status" :label="2">打烊</el-radio>
                </el-form-item>
                <el-form-item label="店铺域名" prop="shop_domain">
                    <el-input class="dialog-item" placeholder="请输入" style="width:190px" v-model="formConfig.shop_domain"></el-input>
                </el-form-item>
                <el-form-item label="微信appid" prop="app_id">
                    <el-input class="dialog-item" placeholder="请输入" style="width:190px" v-model="formConfig.app_id"></el-input>
                </el-form-item>
                <el-form-item label="微信app_secret" prop="app_secret">
                    <el-input class="dialog-item" placeholder="请输入" style="width:190px" v-model="formConfig.app_secret"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleCloseConfig">取 消</el-button>
                <el-button type="primary" @click="submitConfig">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 订单配置 -->
        <el-dialog :visible.sync="dialogVisibleOrder" :before-close="handleCloseOrder" title="订单配置" width="940px">
            <el-form class="form-wrap" ref="formOrder" :model="formOrder" :inline="true" size="small" label-position="left">
                <div class="form-item form-left">
                    <el-form-item label="订单未付款失效时间" prop="shop_domain">
                        <el-input class="dialog-item" placeholder="请输入" style="width:158px" v-model.number="formOrder.order_timeout"></el-input>
                        <span class="order-unit">分</span>
                        <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.order_timeout, 'order_timeout')">保 存</el-button>
                    </el-form-item>
                    <el-form-item label="发货后自动收货时间" prop="shop_domain">
                        <el-input class="dialog-item" placeholder="请输入" style="width:158px" v-model.number="formOrder.order_sand_to_success_time"></el-input>
                        <span class="order-unit">分</span>
                        <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.order_sand_to_success_time, 'order_sand_to_success_time')"
                            >保 存</el-button
                        >
                    </el-form-item>
                    <el-form-item label="收货后允许售后时间" prop="shop_domain">
                        <el-input class="dialog-item" placeholder="请输入" style="width:158px" v-model.number="formOrder.order_apply_stop_time"></el-input>
                        <span class="order-unit">分</span>
                        <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.order_apply_stop_time, 'order_apply_stop_time')">
                            保 存
                        </el-button>
                    </el-form-item>
                    <el-form-item label="允许单人未付款sku数">
                        <el-input class="dialog-item" placeholder="请输入" style="width:150px" v-model.number="formOrder.bad_sku_count"></el-input>
                        <span class="order-unit">个</span>
                        <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.bad_sku_count, 'bad_sku_count')">保 存</el-button>
                    </el-form-item>
                    <el-form-item label="允许单人未付款订单数">
                        <el-input class="dialog-item" placeholder="请输入" style="width:144px" v-model.number="formOrder.bad_order_count"></el-input>
                        <span class="order-unit">个</span>
                        <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.bad_order_count, 'bad_order_count')">保 存</el-button>
                    </el-form-item>
                    <el-form-item label="允许单人未付款商品总数">
                        <el-input class="dialog-item" placeholder="请输入" style="width:130px" v-model.number="formOrder.bad_num_count"></el-input>
                        <span class="order-unit">个</span>
                        <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.bad_num_count, 'bad_num_count')">保 存</el-button>
                    </el-form-item>
                </div>
                <div class="form-item form-right">
                    <el-form-item label="" label-width="120px">
                        <span slot="label">绑定管理员<br />(输入手机号搜索)</span>
                        <el-select
                            class="dialog-item"
                            v-model="adminSelected"
                            style="width:190px;margin-top:12px"
                            filterable
                            remote
                            placeholder="请输入手机搜索"
                            :loading="loadingSelect"
                            :remote-method="queryUserList"
                        >
                            <el-option v-for="item in userList" :key="item.user_id" :label="item.phone + ' (' + item.nick_name + ')'" :value="item.user_id"> </el-option>
                        </el-select>
                        <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.adminList, 'shop_admin_ids_add')">添 加</el-button>
                        <!-- <el-button class="order-btn" size="" type="primary" @click="submitOrder(formOrder.shop_admin_ids, 'shop_admin_ids')">保 存</el-button> -->
                    </el-form-item>
                    <div class="admin-wrap">
                        <template v-for="user in formOrder.adminList">
                            <div class="user-item" :key="user.id">
                                <div class="name">
                                    {{ (user.name || user.nick_name) + ' (' + user.phone + ')' }}
                                    <span class="tag-blue" v-if="user.id == formOrder.shop_admin_id">可提现</span>
                                </div>
                                <div class="btn">
                                    <el-button class="text-red" size="" type="text" @click="submitOrder(formOrder.adminList, 'shop_admin_ids_delete', user.id)">
                                        删除
                                    </el-button>
                                    <el-button class="text-blue" size="" type="text" @click="submitOrder(user.id, 'shop_admin_id')" v-if="user.id != formOrder.shop_admin_id"
                                        >可提现</el-button
                                    >
                                </div>
                            </div>
                            <div class="divider"></div>
                        </template>
                    </div>
                </div>
            </el-form>
            <!-- <span slot="footer" class="dialog-footer">
                <el-button @click="handleCloseConfig">取 消</el-button>
                <el-button type="primary" @click="submitConfig">确 定</el-button>
            </span> -->
        </el-dialog>
        <!-- 佣金配置 -->
        <el-dialog :visible.sync="dialogVisibleCommission" :before-close="handleCloseCommission" title="佣金配置" width="390px">
            <el-form ref="formCommission" :rules="commissionRules" :model="formCommission" :inline="true" size="small" label-position="left" label-width="110px">
                <el-form-item label="基础奖励占比" prop="basic_rate">
                    <el-input class="dialog-item" placeholder="请输入" style="width:190px" v-model="formCommission.basic_rate"></el-input>
                    <span class="order-unit">%</span>
                </el-form-item>
                <el-form-item label="额外奖励占比" prop="additional_rate">
                    <el-input class="dialog-item" placeholder="请输入" style="width:190px" v-model="formCommission.additional_rate"></el-input>
                    <span class="order-unit">%</span>
                </el-form-item>
                <el-form-item label="看看提成比例" prop="tutorial_rate">
                    <el-input class="dialog-item" placeholder="请输入" style="width:190px" v-model="formCommission.tutorial_rate"></el-input>
                    <span class="order-unit">%</span>
                </el-form-item>
                <el-form-item label="看看分享有效期" prop="tutorial_days" label-width="120">
                    <el-input class="dialog-item" placeholder="请输入" style="width:180px" v-model.number="formCommission.tutorial_days"></el-input>
                    <span class="order-unit">天</span>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleCloseCommission">取 消</el-button>
                <el-button type="primary" @click="submitCommission">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { queryShopListPage, queryAgentListAll, creatShop, updateShop, queryUserList } from '@/api/agent'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import { getToken } from '@/utils/auth'

export default {
    name: 'shop-list',
    data() {
        return {
            header: {},
            list: null,
            total: 0,
            listLoading: false,
            loadingSelect: false,
            shopList: [],
            agentList: [],
            userList: [],
            shopIdSelected: '', //选中的店铺id
            listQuery: {
                page: 1,
                limit: 10
            },
            statusList: [
                {
                    id: 1,
                    label: '使用中'
                },
                {
                    id: 2,
                    label: '停止使用'
                }
            ],
            formFilter: {
                status: '', // 状态 '1 使用中 2 停止使用' 不搜索为-1
                name: '', // 店铺名称 不搜索为空
                agent_name: '', //代理商名称 不搜索为空
                agent_phone: '', //代理商手机号 不搜索为空
                admin_name: '' //管理员名称 不搜索为空
            },
            dialogVisibleCreat: false,
            creatRules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'change' },
                    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'change' }
                ],
                agent_id: [{ required: true, message: '请选择代理', trigger: 'change' }]
            },
            isCreat: true,
            filePic: '',
            formCreat: {
                name: '', //max=50
                agent_id: '', //代理商id
                shop_icon: '' //店铺icon max=255
            },

            dialogVisibleConfig: false,
            configRules: {
                status: [{ required: true, message: '请选择状态', trigger: 'change' }],
                shop_domain: [
                    { required: true, message: '请输入内容', trigger: 'change' },
                    { min: 1, max: 200, message: '请输入正确数据', trigger: 'change' }
                ],
                app_id: [
                    { required: true, message: '请输入内容', trigger: 'change' },
                    { min: 1, max: 200, message: '请输入正确数据', trigger: 'change' }
                ],
                app_secret: [
                    { required: true, message: '请输入内容', trigger: 'change' },
                    { min: 1, max: 200, message: '请输入正确数据', trigger: 'change' }
                ]
            },
            formConfig: {
                status: '',
                name: '', //max=50
                agent_id: '', //代理商id
                shop_icon: '' //店铺icon max=255
            },
            formOrderSubmit: {},
            dialogVisibleOrder: false,
            formOrder: {},
            adminSelected: '', //选中待添加的管理员

            formCommission: {},
            dialogVisibleCommission: false,
            commissionRules: {
                basic_rate: [
                    { required: true, message: '请输入内容', trigger: 'change' },
                    {
                        min: 0,
                        max: 40,
                        message: '基础奖励0-40%',
                        type: 'number',
                        transform(value) {
                            return Number(value)
                        },
                        trigger: 'change'
                    }
                ],
                additional_rate: [
                    { required: true, message: '请输入内容', trigger: 'change' },
                    {
                        min: 0,
                        max: 100,
                        message: '额外奖励0-100%',
                        type: 'number',
                        transform(value) {
                            return Number(value)
                        },
                        trigger: 'change'
                    }
                ],
                tutorial_rate: [
                    { required: true, message: '请输入内容', trigger: 'change' },
                    {
                        min: 0,
                        max: 40,
                        message: '看看0-40%',
                        type: 'number',
                        transform(value) {
                            return Number(value)
                        },
                        trigger: 'change'
                    }
                ],
                tutorial_days: [
                    { required: true, message: '请输入内容', trigger: 'change' }
                ],
            },
            uploadImgUrl: '',
            dialogTitle: '新增店铺',
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0
        }
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
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
    },
    mounted() {
        this.queryShopList()
        this.queryAgentListAll()
        this.getList()
    },
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)

            params['status'] = params['status'] == '' ? -1 : params['status']

            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page

            console.log(params)
            queryShopListPage(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.lists
                    this.total = res.data.total
                })
                .catch(err => {})
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data
                })
                .catch(err => {})
        },

        // 代理列表
        queryAgentListAll() {
            queryAgentListAll()
                .then(res => {
                    this.agentList = res.data
                    console.log('输出 ~ this.agentList', this.agentList)
                })
                .catch(err => {})
        },
        // 用户列表
        queryUserList(e) {
            // if (e == '') {
            //     return
            // }
            this.loadingSelect = true
            let params = {
                phone: e,
                shop_id: Number(this.shopIdSelected)
            }
            queryUserList(params)
                .then(res => {
                    this.userList = res.data
                    this.loadingSelect = false
                })
                .catch(err => {
                    this.loadingSelect = false
                })
        },
        // 更新状态
        updateAgentStatus(id, status) {
            let params = {
                id: id,
                status: status //2审核通过（待绑定）；3拒绝；4合作中；5取消合作
            }
            let title
            let type
            switch (status) {
                case 3:
                    title = '确认要取消与该代理的合作吗？'
                    type = 'warning'
                    break
                case 4:
                    title = '确认要通过该代理申请吗？'
                    type = 'success'

                    break
                case 5:
                    title = '确认要拒绝该代理申请吗？'
                    type = 'error'
                    break
            }

            this.$confirm(title, '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: type
            })
                .then(() => {
                    updateAgentStatus(params)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '状态设置成功',
                                    type: 'success',
                                    duration: 5000
                                })
                                this.reload()
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

        // 新增店铺
        shopCreat() {
            this.dialogTitle = '新增店铺'
            this.isCreat = true
            this.dialogVisibleCreat = true
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.setSearchValue()
            this.getList()
        },
        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            // 店铺名称 name
            if (this.formFilter['name']) {
                this.shopList.forEach(ev => {
                    if (ev.shop_name == this.formFilter['name']) {
                        let obj = {
                            label: 'name',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 绑定代理 agent_name
            if (this.formFilter['agent_name']) {
                let obj = {
                    label: 'agent_name',
                    val: this.formFilter['agent_name']
                }
                _search.push(obj)
            }
            // 代理手机号 agent_phone
            if (this.formFilter['agent_phone']) {
                let obj = {
                    label: 'agent_phone',
                    val: this.formFilter['agent_phone']
                }
                _search.push(obj)
            }

            // 管理员微信昵称 shop_admin_phone
            if (this.formFilter['admin_name']) {
                let obj = {
                    label: 'admin_name',
                    val: this.formFilter['admin_name']
                }
                _search.push(obj)
            }

            // 店铺状态
            if (this.formFilter['status']) {
                this.statusList.forEach(ev => {
                    if (ev.id == this.formFilter['status']) {
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
            this.handleFilter()
        },
        // 图片上传前检测
        beforeUpload(file) {
            if ((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') && file.size <= 1024 * 1024 * 5) {
                this.upload_loading = this.uploadLoading('上传中')
                this.uploadVisible = false
            } else {
                if (file.size > 1024 * 1024 * 5) {
                    this.$notify({
                        title: '照片大小应不超过5M',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                } else {
                    this.$notify({
                        title: '照片格式只支持JPG、PNG',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
                return false
            }
        },

        // 单张图片上传成功回调
        uploadImgSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                })
                this.upload_loading.close()
                this.filePic = file.response.data.file_url
                console.log('输出 ~ this.filePic', this.filePic)
            } else {
                this.upload_loading.close()
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
            }
        },

        // 单张图片上传失败回调
        uploadImgError(err, file, fileList) {
            this.upload_loading.close()
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            })
        },

        submitCreat() {
            this.$refs['formCreat'].validate(valid => {
                if (valid) {
                    if (this.filePic == '') {
                        this.$notify({
                            title: '请上传logo',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                        return
                    }
                    if (this.isCreat) {
                        let params = {
                            name: this.formCreat.name, //max=50
                            agent_id: this.formCreat.agent_id, //代理商id
                            shop_icon: this.filePic //店铺icon max=255
                        }
                        creatShop(params)
                            .then(res => {
                                if (res.code == 200) {
                                    this.$notify({
                                        title: '店铺创建成功',
                                        type: 'success',
                                        duration: 5000
                                    })
                                    this.handleCloseCreat()
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
                    } else {
                        this.formCreat['shop_icon'] = this.filePic
                        updateShop(this.formCreat)
                            .then(res => {
                                if (res.code == 200) {
                                    this.$notify({
                                        title: '店铺编辑成功',
                                        type: 'success',
                                        duration: 5000
                                    })
                                    this.handleCloseCreat()
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
                    }
                } else {
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
        },

        editShop(row) {
            console.log('输出 ~ row', row)
            this.dialogTitle = '编辑店铺'
            this.formCreat = _.cloneDeep(row)
            this.filePic = this.formCreat.shop_icon
            this.isCreat = false
            this.dialogVisibleCreat = true
        },

        handleCloseCreat() {
            this.formCreat = {
                name: '', //max=50
                agent_id: '', //代理商id
                shop_icon: '' //店铺icon max=255
            }
            this.filePic = ''
            this.dialogVisibleCreat = false
        },
        updateConfig(row) {
            this.formConfig = _.cloneDeep(row)
            this.dialogVisibleConfig = true
        },

        submitConfig() {
            this.$refs['formConfig'].validate(valid => {
                if (valid) {
                    updateShop(this.formConfig)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '小程序配置编辑成功',
                                    type: 'success',
                                    duration: 5000
                                })
                                this.handleCloseConfig()
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
                } else {
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
        },

        handleCloseConfig() {
            this.formConfig = {
                status: '',
                shop_domain: '',
                app_id: '',
                app_secret: ''
            }
            this.dialogVisibleConfig = false
        },

        submitOrder(sendValue, argument, deleteUserId) {
            let value = _.cloneDeep(sendValue)
            let adminType = 0 // 管理员编辑状态 0非管理员编辑 1添加 2删除
            // 管理员设置
            if (argument == 'shop_admin_ids_add') {
                value = value.map(item => item.id)
                if (value.indexOf(this.adminSelected) == -1) {
                    value.push(this.adminSelected)
                    argument = 'shop_admin_ids'
                    adminType = 1
                } else {
                    this.$notify({
                        title: '已存在该管理员',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                    return
                }
            }
            if (argument == 'shop_admin_ids_delete') {
                value = value.map(item => item.id)
                let index = value.indexOf(deleteUserId)
                value.splice(index, 1)
                argument = 'shop_admin_ids'
                adminType = 2
            }
            if (!value) {
                this.$notify({
                    title: '请输入参数',
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            let oldValue = this.formOrderSubmit[argument]
            this.formOrderSubmit[argument] = value
            if (argument == 'order_timeout' || argument == 'order_apply_stop_time' || argument == 'order_sand_to_success_time') {
                this.formOrderSubmit[argument] = value * 60
            }
            updateShop(this.formOrderSubmit).then(res => {
                if (res.code == 200) {
                    this.$notify({
                        title: '保存成功',
                        type: 'success',
                        duration: 5000
                    })
                    if (adminType == 1) {
                        // 添加
                        let addItem = this.userList.find(item => item.user_id == this.adminSelected)
                        this.formOrder.adminList.push({
                            id: addItem.user_id,
                            name: addItem.nick_name,
                            phone: addItem.phone
                        })
                    } else if (adminType == 2) {
                        for (let i = 0; i < this.formOrder.adminList.length; i++) {
                            const element = this.formOrder.adminList[i]
                            if (element.id == deleteUserId) {
                                this.formOrder.adminList.splice(i, 1)
                            }
                        }
                    }
                    if (argument == 'shop_admin_id') {
                        this.formOrder['shop_admin_id'] = value
                    }
                    this.getList()
                } else {
                    this.formOrderSubmit[argument] = oldValue
                    this.$notify({
                        title: res.msg,
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
        },

        // 删除订单配置 绑定管理员
        deleteAdminuser(id) {
            let adminIndex = this.formOrder.adminList.findIndex(item => item.id == id)
            this.formOrder.adminList.splice(adminIndex, 1)
            let adminShopIndex = this.formOrder.shop_admin_ids.findIndex(item => item.id == id)
            this.formOrder.shop_admin_ids.splice(adminShopIndex, 1)
        },
        async updateOrder(row) {
            row.shop_admin_ids = row.admins.map(item => item.id)
            row.adminList = row.admins.map(item => ({ id: item.id, phone: item.phone, name: item.nick_name }))
            this.shopIdSelected = row.id
            await this.queryUserList('1')
            this.formOrder = _.cloneDeep(row)
            this.formOrderSubmit = _.cloneDeep(row)
            this.formOrder['order_timeout'] = row['order_timeout'] / 60
            this.formOrder['order_apply_stop_time'] = row['order_apply_stop_time'] / 60
            this.formOrder['order_sand_to_success_time'] = row['order_sand_to_success_time'] / 60
            this.dialogVisibleOrder = true
        },
        handleCloseOrder(row) {
            this.formOrder = {}
            this.dialogVisibleOrder = false
            this.userList = []
            this.getList()
        },

        submitCommission() {
            this.$refs['formCommission'].validate(valid => {
                if (valid) {
                    this.formCommission.basic_rate = Number(this.formCommission.basic_rate)
                    this.formCommission.additional_rate = Number(this.formCommission.additional_rate)
                    this.formCommission.tutorial_rate = Number(this.formCommission.tutorial_rate)
                    this.formCommission.tutorial_days = Number(this.formCommission.tutorial_days)
                    updateShop(this.formCommission)
                        .then(res => {
                            if (res.code == 200) {
                                this.$notify({
                                    title: '佣金配置成功',
                                    type: 'success',
                                    duration: 5000
                                })
                                this.handleCloseCommission()
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
                } else {
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
        },
        updateCommission(row) {
            this.formCommission = _.cloneDeep(row)
            this.dialogVisibleCommission = true
        },
        handleCloseCommission(row) {
            this.formCommission = {}
            this.dialogVisibleCommission = false
            this.getList()
        },
        // imgPreview(img) {
        //     this.imgVisible = true;
        //     this.imgCertificate = img;
        // },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields()
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
.timg {
    width: 40px;
    height: 40px;
}
.shop-goods {
    margin-right: 24px;
    margin-left: auto;
}
.dialog-item {
    width: 250px;
}
.form-wrap {
    display: flex;
    .form-item {
        box-sizing: border-box;
        width: 50%;
        &.form-left {
            padding-right: 17px;
            border-right: 1px solid #dddddd;
        }
        &.form-right {
            padding-left: 27px;
        }
    }
}
.preview {
    position: relative;
    width: 60px;
    height: 60px;
    .fullimg {
        width: 100%;
        height: 100%;
    }
    .el-icon-close {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background-color: rgba(165, 165, 165, 0.65);
        color: #fff;
        text-align: center;
        line-height: 20px;
    }
}
.order-btn {
    margin-left: 30px;
}
.order-unit {
    padding-left: 10px;
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
    &.type-blue {
        background-color: #1890ff;
    }
    &.type-grey {
        background-color: rgba(0, 0, 0, 0.25);
    }
    &.type-green {
        background-color: #52c41a;
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
.admin-wrap {
    .tag-blue {
        margin-left: 10px;
        padding: 0 7px;
        width: fit-content;
        height: 22px;
        border-radius: 15px;
        background-color: #1890ff;
        color: rgba(255, 255, 255, 0.85);
        word-break: keep-all;
        font-weight: 400;
        font-size: 10px;
        line-height: 22px;
    }
    .user-item {
        display: flex;
        justify-content: space-between;
        margin: 16px auto;
        width: 90%;
    }
}
</style>
