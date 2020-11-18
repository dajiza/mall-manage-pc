<template>
    <div class="sidebar">
        <div class="logo">
            <img class="menu-logo" src="../../assets/img/menu-logo.svg" />
            <span class="marginLeft10" v-show="!collapse">川水商城管理系统</span>
        </div>
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" unique-opened router>
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.name" :key="item.name">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <span class="marginLeft10" slot="title">{{ item.display_name }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-menu-item :index="subItem.name" :key="subItem.index">{{ subItem.display_name }}</el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.name" :key="item.name">
                        <i :class="item.icon"></i>
                        <span class="marginLeft10" slot="title">{{ item.display_name }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
import bus from '../common/bus';
export default {
    data() {
        return {
            collapse: false,
            items: [],
            all_menu: [
                {
                    icon: 'iconfont icon-home',
                    name: 'dashboard',
                    display_name: '系统首页'
                },

                {
                    icon: 'iconfont icon-goods',
                    name: 'goods-management',
                    display_name: '商品管理',
                    subs: [
                        {
                            name: 'goods-list',
                            display_name: '商品列表'
                        },
                        {
                            name: 'otherCategory',
                            display_name: '其它商品分类'
                        },
                        {
                            name: 'goodsLabel',
                            display_name: '商品标签'
                        },
                        {
                            name: 'freight',
                            display_name: '运费模板'
                        },
                        {
                            name: 'customAttributes',
                            display_name: '自定义属性'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-list',
                    name: 'order-management',
                    display_name: '订单管理',
                    subs: [
                        /*{
                            name: 'order-list',
                            display_name: '订单列表'
                        },*/
                        {
                            name: 'after-sale-list',
                            display_name: '售后处理申请'
                        },
                        {
                            name: 'mall-order-after-reason',
                            display_name: '售后原因设置'
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-setting',
                    name: 'system-setting',
                    display_name: '系统设置',
                    subs: [
                        {
                            name: 'user-management',
                            display_name: '用户管理'
                        },
                        {
                            name: 'role-management',
                            display_name: '角色管理'
                        },
                        {
                            name: 'authority-management',
                            display_name: '权限管理'
                        }
                    ]
                }
            ],
            is_admin: 0,
            role_auth_list: []
        };
    },
    computed: {
        onRoutes() {
            return this.$route.path.replace('/', '');
        }
    },
    created() {
        // 通过 Event Bus 进行组件间通信，来折叠侧边栏
        bus.$on('collapse', msg => {
            this.collapse = msg;
            bus.$emit('collapse-content', msg);
        });
        this.is_admin = localStorage.getItem('is_admin');
        if (this.is_admin > 0) {
            this.items = this.all_menu;
            // 超级管理员 拥有全部权限
        } else {
            // 不是超级管理员,根据分配的权限显示菜单
            this.role_auth_list = JSON.parse(localStorage.getItem('roleAuthList'));
            const new_arr = this.processData(this.role_auth_list);
            new_arr.forEach((ev, index) => {
                if (ev.display_name === 'Android') {
                    new_arr.splice(index, 1);
                }
            });
            new_arr.unshift({ icon: 'icon-home', name: 'dashboard', display_name: '系统首页' });
            this.items = new_arr;
        }
    },
    mounted() {},
    methods: {
        // 格式化数据
        processData(data) {
            let dealOptions = [];
            // 给每个数据加children属性
            data.forEach((ev, one) => {
                ev.subs = [];
            });
            data.forEach((ev, one) => {
                let findIndex = data.findIndex(item => item.permission_id === ev.pid);
                if ((!ev.pid && ev.pid !== 0 && ev.pid !== false) || findIndex === -1) {
                    dealOptions.push(ev);
                } else {
                    data[findIndex].subs.push(ev);
                }
            });
            return dealOptions;
        },
        processData2(data) {
            let dealOptions = [];
            // 给每个数据加children属性
            data.forEach((ev, one) => {
                ev.children = [];
            });
            data.forEach((ev, one) => {
                let findIndex = data.findIndex(item => item.id === ev.pid);
                if ((!ev.pid && ev.pid !== 0 && ev.pid !== false) || findIndex === -1) {
                    dealOptions.push(ev);
                } else {
                    data[findIndex].children.push(ev);
                }
            });
            return dealOptions;
        }
    }
};
</script>

<style>
.sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: block;
    overflow-y: scroll;
    /* width: 208px; */
    background: #ffffff !important;
    box-shadow: 2px 0 6px 0 rgba(0, 21, 41, 0.12) !important;
}
.sidebar::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 208px;
}
.sidebar > ul {
    height: calc(100% - 60px);
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
    padding: 0 16px !important;
    border-top: 4px solid #fff;
    background: #fff !important;
}
.sidebar-el-menu > .el-menu-item:first-child {
    padding: 0 16px !important;
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
</style>
