<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" unique-opened router>
            <!--<template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.name" :key="item.name">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">{{
                                    threeItem.title
                                }}</el-menu-item>
                            </el-submenu>
                            <el-menu-item v-else :index="subItem.index" :key="subItem.index">{{ subItem.title }}</el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="item.icon"></i>
                        <span slot="title">{{ item.title }}</span>
                    </el-menu-item>
                </template>
            </template>-->
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.name" :key="item.name">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <!-- <i :class="back_icon(item.display_name)"></i> -->
                            <span slot="title">{{ item.display_name }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <!--<el-submenu v-if="subItem.subs" :index="subItem.name" :key="subItem.name">
                                <template slot="title">{{ subItem.display_name }}</template>
                                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.name">{{
                                    threeItem.display_name
                                    }}</el-menu-item>
                            </el-submenu>-->
                            <el-menu-item :index="subItem.name" :key="subItem.index">{{ subItem.display_name }}</el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.name" :key="item.name">
                        <i :class="item.icon"></i>
                        <span slot="title">{{ item.display_name }}</span>
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
                        }
                    ]
                },
                {
                    icon: 'iconfont icon-list',
                    name: 'order-management',
                    display_name: '订单管理',
                    subs: [
                        {
                            name: 'order-list',
                            display_name: '订单列表'
                        },
                        {
                            name: 'afterSaleList',
                            display_name: '售后处理申请'
                        },
                        {
                            name: 'cut-cloth',
                            display_name: '裁布'
                        },
                        {
                            name: 'distribution',
                            display_name: '配货管理'
                        },
                        {
                            name: 'order-delivery',
                            display_name: '打单发货'
                        },
                        {
                            name: 'order-sent',
                            display_name: '已发订单'
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
                        },
                        {
                            name: 'parameter-configuration',
                            display_name: '参数配置'
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
        },
        back_icon: function() {
            return data => {
                let icon_class = '';
                if (data) {
                    if (data === '货物管理') {
                        icon_class = 'menu-cargo-icon';
                    } else if (data === '货架管理') {
                        icon_class = 'menu-shelf-icon';
                    } else if (data === '订单管理') {
                        icon_class = 'menu-order-icon';
                    } else if (data === '系统设置') {
                        icon_class = 'menu-setting-icon';
                    }

                    return icon_class;
                }
            };
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
            new_arr.unshift({ icon: 'el-icon-s-home', name: 'dashboard', display_name: '系统首页' });
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
    top: 60px;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: block;
    overflow-y: scroll;
    /* width: 208px; */
    background: #001529 !important;
    box-shadow: 2px 0px 6px 0px rgba(0, 21, 41, 0.35) !important;
}
.sidebar::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 208px;
}
.sidebar > ul {
    height: 100%;
    background: #001529 !important;
    box-shadow: 2px 0px 6px 0px rgba(0, 21, 41, 0.35) !important;
}
.menu-cargo-icon,
.menu-shelf-icon,
.menu-order-icon,
.menu-setting-icon {
    display: inline-block;
    margin-right: 5px;
    width: 16px;
    height: 16px;
    background-size: 100%;
}
.is-opened .menu-cargo-icon,
.el-submenu__title:hover .menu-cargo-icon {
    background: url('../../assets/img/menu-icon/menu-cargo-icon.svg') no-repeat 50%;
}
.menu-cargo-icon {
    background: url('../../assets/img/menu-icon/menu-product.svg') no-repeat 50%;
}
.menu-shelf-icon {
    background: url('../../assets/img/menu-icon/menu-shelf-icon.svg') no-repeat 50%;
}
.is-opened .menu-shelf-icon,
.el-submenu__title:hover .menu-shelf-icon {
    background: url('../../assets/img/menu-icon/menu-shelf-close.svg') no-repeat 50%;
}
.menu-order-icon {
    background: url('../../assets/img/menu-icon/menu-order-icon.svg') no-repeat 50%;
}
.is-opened .menu-order-icon,
.el-submenu__title:hover .menu-order-icon {
    background: url('../../assets/img/menu-icon/menu-order-close.svg') no-repeat 50%;
}
.menu-setting-icon {
    background: url('../../assets/img/menu-icon/menu-setting-icon.svg') no-repeat 50%;
}
.is-opened .menu-setting-icon,
.el-submenu__title:hover .menu-setting-icon {
    background: url('../../assets/img/menu-icon/menu-setting-close.svg') no-repeat 50%;
}

.el-submenu.is-active .el-submenu__title {
    /*border-bottom-color: #409EFF;*/
}

.el-submenu__title,
.el-menu-item {
    box-sizing: content-box !important;
    margin-bottom: 4px !important;
    height: 40px !important;
    color: rgba(255, 255, 255, 0.65) !important;
    line-height: 40px !important;
}
.el-menu-item {
    border-top: 4px solid #000d17;
    background: #000d17 !important;
}
.el-submenu__title {
    padding: 0 16px !important;
    border-top: 4px solid #001529;
    background: #001529 !important;
}
.sidebar-el-menu > .el-menu-item:first-child {
    padding: 0 16px !important;
    border-top: none !important;
    background: #001529 !important;
}
.sidebar-el-menu > .el-menu-item.is-active:first-child {
    background: #1890ff !important;
}
.sidebar-el-menu > .el-menu-item:first-child i {
    width: 16px;
    font-size: 16px;
}
.el-menu-item.is-active {
    background-color: #1890ff !important;
    color: #fff !important;
}
.el-menu-item:not(.is-active):focus,
.el-menu-item:not(.is-active):hover {
    background-color: #0b253d !important;
    color: #fff !important;
}
.el-menu-item:hover i {
    color: inherit !important;
}
.el-submenu__title:hover {
    background-color: #0b253d !important;
}
.el-submenu__title:hover,
.el-submenu__title:hover i,
.is-opened .el-submenu__title,
.is-opened .el-submenu__title i {
    /*background-color: rgb(50, 65, 87)!important;*/
    color: #fff !important;
}
.el-menu,
.is-opened .el-menu {
    background-color: #000d17 !important;
}
</style>
