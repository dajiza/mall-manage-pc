<template>
    <div class="sidebar">
        <div class="logo">
            <img class="menu-logo" src="../../assets/img/menu-logo.svg" />
            <span class="marginLeft10" v-show="!collapse">川水商城管理系统</span>
        </div>
        <!-- 用户头像 -->
        <div class="user-wrap">
            <div class="user-avator">
                <img src="../../assets/img/img.jpg" />
            </div>
            <!-- 用户名下拉菜单 -->
            <el-dropdown class="user-name" trigger="click" @command="handleCommand" v-show="!collapse">
                <span class="el-dropdown-link">
                    {{ username }}
                    <i class="el-icon-caret-bottom"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <!--<el-dropdown-item divided command="updatePassword">修改密码</el-dropdown-item>-->
                    <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <!-- <span class="icon iconfont icon-lingdang message" v-show="!collapse"></span>
            <div class="point" v-show="!collapse"></div> -->
        </div>
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" unique-opened router>
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.name" :key="item.name">
                        <template slot="title">
                            <i class="iconfont" :class="item.icon"></i>
                            <span class="marginLeft10" slot="title">{{ item.display_name }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-menu-item :index="subItem.name" :key="subItem.index">{{ subItem.display_name }}</el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.name" :key="item.name">
                        <i class="iconfont" :class="item.icon"></i>
                        <span class="marginLeft10" slot="title">{{ item.display_name }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
        <div class="collapse-btn" :class="{ left64: collapse }" @click="collapseChage">
            <i v-if="!collapse" class="iconfont icon-collapse"></i>
            <i v-else class="iconfont icon-compose"></i>
        </div>
        <!-- 修改密码弹出框 -->
        <el-dialog
            title="修改密码"
            :visible.sync="changePasswordVisible"
            width="380px"
            destroy-on-close="destroy-on-close"
            :before-close="changePasswordClose"
            :close-on-click-modal="false"
            :append-to-body="true"
        >
            <el-form ref="changePasswordForm" :rules="changePasswordRules" :model="changePasswordForm">
                <el-form-item label="新密码" prop="password">
                    <el-input v-model="changePasswordForm.password" placeholder="输入新密码" show-password="show-password"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="passwordSure">
                    <el-input v-model="changePasswordForm.passwordSure" placeholder="确认新密码" show-password="show-password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="changePasswordClose">取 消</el-button>
                <el-button type="primary" @click="savePassword('changePasswordForm')">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import bus from '../common/bus'
import { editUserInfo } from '../../api/user'
export default {
    data() {
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'))
            } else if (value !== this.changePasswordForm.password) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        return {
            //用户信息
            collapse: false,
            fullscreen: false,
            name: 'cc',
            message: 2,
            changePasswordVisible: false, // 修改密码 弹窗是否显示
            changePasswordForm: {
                password: '',
                passwordSure: ''
            },
            changePasswordRules: {
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 16, message: '请输入6-16位密码', trigger: 'blur' }
                ],
                passwordSure: [{ required: true, validator: validatePass2, trigger: 'blur' }]
            },
            user_info: {},

            items: [],
            all_menu: [
                {
                    icon: 'iconfont icon-home',
                    name: 'mall-backend-dashboard',
                    display_name: '系统首页'
                },
                {
                    icon: 'iconfont icon-goods',
                    name: 'mall-backend-goods-management',
                    display_name: '商品管理',
                    subs: [
                        {
                            name: 'mall-backend-goods-list',
                            display_name: '商品列表'
                        },
                        {
                            name: 'mall-backend-shop-goods-list',
                            display_name: '店铺商品管理'
                        },
                        {
                            name: 'mall-backend-other-category',
                            display_name: '商品分类'
                        },
                        {
                            name: 'mall-backend-goodsLabel',
                            display_name: '商品标签'
                        },
                        {
                            name: 'mall-backend-freight',
                            display_name: '运费模板'
                        },
                        {
                            name: 'mall-backend-custom-attributes',
                            display_name: '自定义属性'
                        },
                        {
                            name: 'mall-backend-goods-detail-template',
                            display_name: '详情页模版'
                        },
                        {
                            name: 'mall-backend-goods-comment-list',
                            display_name: '评论管理'
                        },
                        {
                            name: 'mall-backend-goods-series',
                            display_name: '商品系列'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-list',
                    name: 'mall-backend-order-management',
                    display_name: '订单管理',
                    subs: [
                        {
                            name: 'mall-backend-order-list',
                            display_name: '订单列表'
                        },
                        {
                            name: 'mall-backend-afterSaleList',
                            display_name: '售后处理申请'
                        },
                        {
                            name: 'mall-backend-order-after-reason',
                            display_name: '售后原因设置'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-coupons',
                    name: 'mall-backend-marketing-management',
                    display_name: '营销管理',
                    subs: [
                        {
                            name: 'mall-backend-coupons',
                            display_name: '配置优惠券'
                        },
                        {
                            name: 'mall-backend-recipients-records',
                            display_name: '领用记录'
                        },
                        {
                            name: 'mall-backend-adv',
                            display_name: '广告管理'
                        },
                        {
                            name: 'mall-backend-activity',
                            display_name: '活动管理'
                        },
                        {
                            name: 'mall-backend-page',
                            display_name: '页面管理'
                        },
                        {
                            name: 'mall-backend-teamwork-list',
                            display_name: '团作列表'
                        },
                        {
                            name: 'mall-backend-page-share',
                            display_name: '小程序分享页'
                        },
                        {
                            name: 'mall-backend-points-shop-list',
                            display_name: '积分商城'
                        },
                        {
                            name: 'mall-backend-sales-promotion',
                            display_name: '促销管理'
                        },
                        {
                            name: '/mall-backend-sales-index-admin',
                            display_name: '编辑首页'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-money',
                    name: 'mall-backend-money-management',
                    display_name: '资金管理',
                    subs: [
                        {
                            name: 'mall-backend-commission',
                            display_name: '佣金统计'
                        },
                        {
                            name: 'mall-backend-performance',
                            display_name: '店铺业绩'
                        },
                        {
                            name: 'mall-backend-withdraw',
                            display_name: '提现管理'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-user-add',
                    name: 'mall-backend-agent-management',
                    display_name: '代理管理',
                    subs: [
                        {
                            name: 'mall-backend-agent-list',
                            display_name: '代理管理'
                        },
                        {
                            name: 'mall-backend-shop-list',
                            display_name: '店铺管理'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-users',
                    name: 'mall-backend-customer-management',
                    display_name: '客户管理',
                    subs: [
                        {
                            name: 'mall-backend-customer-list',
                            display_name: '客户列表'
                        },
                        {
                            name: 'mall-backend-discount-setup',
                            display_name: '会员折扣配置'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-tongji',
                    name: 'mall-backend-statistics-view',
                    display_name: '统计查询',
                    subs: [
                        {
                            name: 'mall-backend-statistics-sku',
                            display_name: 'SKU销量排行统计'
                        },
                        {
                            name: 'mall-backend-statistics-sales',
                            display_name: '销售统计'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-live-goods',
                    name: 'mall-backend-live-management',
                    display_name: '直播管理',
                    subs: [
                        {
                            name: 'mall-backend-live-goods',
                            display_name: '直播商品'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-setting',
                    name: 'mall-backend-system-setting',
                    display_name: '系统设置',
                    subs: [
                        {
                            name: 'mall-backend-parameter-setting',
                            display_name: '参数配置'
                        }
                    ]
                }
                // {
                //     icon: 'iconfont icon-setting',
                //     name: 'system-setting',
                //     display_name: '系统设置',
                //     subs: [
                //         {
                //             name: 'mall-backend-parameter-setting',
                //             display_name: '参数配置'
                //         }
                //     ]
                // }
            ],
            is_admin: 0,
            role_auth_list: []
        }
    },
    computed: {
        onRoutes() {
            return this.$route.path.replace('/', '')
        },
        username() {
            let username = localStorage.getItem('ms_username')
            return username ? username : this.name
        }
    },
    created() {
        // 通过 Event Bus 进行组件间通信，来折叠侧边栏
        bus.$on('collapse', msg => {
            this.collapse = msg
            bus.$emit('collapse-content', msg)
        })
        this.is_admin = localStorage.getItem('is_admin')
        if (this.is_admin > 0) {
            this.items = this.all_menu
            // 超级管理员 拥有全部权限
        } else {
            // 不是超级管理员,根据分配的权限显示菜单
            this.role_auth_list = JSON.parse(localStorage.getItem('roleAuthList'))
            let roleAuthList = []
            this.role_auth_list.forEach(ev => {
                roleAuthList.push(ev.name)
            })

            roleAuthList.unshift('mall-backend-dashboard')
            const menuList = this.commonMenu(this.all_menu, roleAuthList)
            const newList = this.filterMenu(menuList)
            this.items = newList
        }
    },
    mounted() {},
    methods: {
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command === 'loginout') {
                this.$signOut()
                console.log('loginout')
                // localStorage.removeItem('ms_username');
                // localStorage.removeItem('is_admin');
                // localStorage.removeItem('roleAuthList');
                // localStorage.removeItem('userId');
                // localStorage.removeItem('login_user_info');
                // removeToken();
                this.$router.push('/login')
            } else if (command === 'updatePassword') {
                this.user_info = JSON.parse(localStorage.getItem('login_user_info'))
                this.changePasswordVisible = true
            }
        },
        // 侧边栏折叠
        collapseChage() {
            this.collapse = !this.collapse
            bus.$emit('collapse', this.collapse)
        },
        // 修改密码弹窗关闭
        changePasswordClose() {
            this.$refs['changePasswordForm'].resetFields()
            this.$refs['changePasswordForm'].clearValidate()
            this.changePasswordVisible = false
        },
        // 保存更改密码
        savePassword(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let params = this.user_info
                    params['user_id'] = params.id
                    params['password'] = this.changePasswordForm.password
                    this.editUser(params)
                }
            })
        },
        // 请求-编辑用户
        editUser(params) {
            const rLoading = this.openLoading()
            editUserInfo(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.changePasswordVisible = false
                        this.$notify({
                            title: '修改成功,请重新登录',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        // 重新登录
                        this.$signOut()
                        this.$router.push('/login')
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
        // 格式化数据
        processData(data) {
            let dealOptions = []
            // 给每个数据加children属性
            data.forEach((ev, one) => {
                ev.subs = []
            })
            data.forEach((ev, one) => {
                let findIndex = data.findIndex(item => item.permission_id === ev.pid)
                if ((!ev.pid && ev.pid !== 0 && ev.pid !== false) || findIndex === -1) {
                    dealOptions.push(ev)
                } else {
                    data[findIndex].subs.push(ev)
                }
            })
            return dealOptions
        },
        addIcon(data) {
            let icon_class = ''
            if (data) {
                if (data === '商品管理') {
                    icon_class = 'icon-goods'
                } else if (data === '订单管理') {
                    icon_class = 'icon-list'
                } else if (data === '系统设置') {
                    icon_class = 'icon-setting'
                }
                return icon_class
            }
        },
        commonMenu(data1, data2) {
            data1.map(item1 => {
                data2.map(item2 => {
                    if (item1.name === item2) {
                        item1.is_show = true
                        if (item1.subs && item1.subs.length) {
                            this.commonMenu(item1.subs, data2)
                        }
                    }
                })
                // console.log('item1', item1);
            })
            return data1
        },
        filterMenu(menuList) {
            return menuList
                .filter(item => item.is_show)
                .map(item => {
                    item = Object.assign({}, item)
                    if (item.subs) {
                        item.subs = this.filterMenu(item.subs)
                    }
                    return item
                })
        }
    }
}
</script>

<style>
.sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: block;
    overflow-y: hidden;
    /* width: 64px; */
    background: #ffffff !important;
    box-shadow: 2px 0 6px 0 rgba(0, 21, 41, 0.12) !important;
}
.sidebar > ul::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 208px;
}
.sidebar > ul {
    overflow-y: scroll;
    height: calc(100% - 160px);
    background: #ffffff !important;
}

.el-submenu__title,
.el-menu-item {
    box-sizing: content-box !important;
    margin-bottom: 4px !important;
    height: 40px !important;
    color: rgba(0, 0, 0, 0.65) !important;
    line-height: 40px !important;
}
.el-menu-item {
    margin-top: 4px;
}
.el-menu-item:first-child {
    margin-top: 0;
}
.el-submenu__title {
    padding: 0 20px !important;
    border-top: 4px solid #fff;
    background: #fff !important;
}
.sidebar-el-menu > .el-menu-item:first-child {
    padding: 0 20px !important;
    border-top: none !important;
    /*background: #fff !important;*/
}
.sidebar-el-menu > .el-menu-item.is-active:first-child {
    background: #fff !important;
    font-weight: 500;
    font-family: PingFangSC-Medium, PingFang SC;
}
.sidebar-el-menu > .el-menu-item:first-child:not(.is-active):focus,
.sidebar-el-menu > .el-menu-item:first-child:not(.is-active):hover {
    color: #1890ff !important;
}
.sidebar-el-menu > .el-menu-item:first-child i {
    width: 16px;
    font-size: 16px;
}
.el-menu-item.is-active {
    position: relative;
    border-right: 2px solid #1890ff;
    background-color: #e6f7ff !important;
    color: #1890ff !important;
}
.el-menu-item:not(.is-active):focus,
.el-menu-item:not(.is-active):hover {
    background-color: #f2fbff !important;
    color: rgba(0, 0, 0, 0.65) !important;
}
.el-menu-item:hover i {
    color: inherit !important;
}
.el-submenu__title:hover {
    background-color: #f2fbff !important;
    color: rgba(0, 0, 0, 0.65) !important;
}
.el-submenu__title:hover,
.el-submenu__title:hover i,
.is-opened .el-submenu__title,
.is-opened .el-submenu__title i {
    color: #1890ff !important;
    font-weight: 500;
    font-family: PingFangSC-Medium, PingFang SC;
}
.is-active .el-submenu__title i {
    color: #1890ff !important;
}
.el-menu,
.is-opened .el-menu {
    background-color: #fff !important;
}
.el-menu {
    border-right: none;
}
.marginLeft10 {
    margin-left: 10px;
}
.el-submenu .el-menu-item {
    min-width: 0;
}
.logo {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-left: 14px;
    /*width: 208px;*/
    height: 60px;
    background-color: #fff;
    color: #002140;
    font-weight: 600;
    font-size: 17px;
    font-family: PingFangSC-Semibold, PingFang SC;
    line-height: 60px;
}
.el-submenu.is-active .el-submenu__title {
    color: #1890ff !important;
}

.collapse-btn {
    z-index: 10;
    float: left;
    box-sizing: border-box;
    padding: 0 21px;
    /* position: absolute; */
    /* top: 0;
    left: 208px; */
    width: 100%;
    border-top: 1px solid #eeeeee;
    /* background: #0b253d; */
    line-height: 40px !important;
    cursor: pointer;
    -webkit-transition: left 0.3s ease-in-out;
    transition: left 0.3s ease-in-out;
}
.left64 {
    left: 64px;
}

.user-name {
    margin-left: 10px;
}
.user-avator {
    margin-left: 16px;
}
.user-avator img {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
}
.el-dropdown-link {
    color: rgba(0, 0, 0, 0.65);
    font-weight: 400;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    cursor: pointer;
}
.el-dropdown-menu__item {
    text-align: center;
}
.user-wrap {
    position: relative;
    display: flex;
    align-items: center;
    height: 55px;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
}
.message {
    margin-right: 20px;
    margin-left: auto;
    font-size: 16px;
    cursor: pointer;
}
.point {
    position: absolute;
    top: 12px;
    right: 14px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #ff4d4f;
}
</style>
