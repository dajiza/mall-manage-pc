<template>
    <div class="app-container goods-list" @click.stop="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">小程序分享页</div>
            <div class="grey-line" v-if="false"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow" v-if="false"></i>
            <transition name="slide-fade" v-if="false">
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
            <div class="search-value" v-if="false">
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
            <el-button type="primary" @click="pageCreat" class="creat-page" v-hasPermission="'mall-backend-page-share-add'">新增</el-button>
        </div>
        <el-table :height="tableHeight" class="table" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading">
            <el-table-column label="名称" width="200">
                <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                </template>
            </el-table-column>
            <el-table-column label="类型" width="110">
                <template slot-scope="scope">
                    <span>{{ back_type(scope.row.type) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="Link">
                <template slot-scope="scope">
                    <span>{{ scope.row.wx_page }}</span>
                </template>
            </el-table-column>
            <el-table-column label="分享链接" width="300">
                <template slot-scope="scope">
                    <div class="link-wrap" @mouseenter="mouseEnter(scope.$index)" @mouseleave="mouseLeave(scope.$index)">
                        <div class="url-box">{{ scope.row.h5_url }}</div>
                        <div class="copy-box" v-if="scope.$index == showCopyIndex" @click="handleOnCopy(scope.row.h5_url)">
                            <img src="../../../../assets/img/ic_copy.png" alt=""/>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="描述">
                <template slot-scope="scope">
                    <span>{{ scope.row.comment }}</span>
                </template>
            </el-table-column>
            <el-table-column label="可用店铺" width="90">
                <template slot-scope="scope">
                    <span>{{ scope.row.shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="90">
                <template slot-scope="scope">
                    <el-button
                        class="text-red btn-opt table-btn delete-color"
                        type="text"
                        size=""
                        v-hasPermission="'mall-backend-page-share-delete'"
                        @click="pageDelete(scope.row.id, scope.$index)"
                    >
                        删除
                    </el-button>
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
        <input style="z-index: -1;position: fixed;top: -99px" type="text" id="copyInput">

        <!-- 新增弹出框 -->
        <el-dialog
                title="新增"
                :visible.sync="showAddDialog"
                custom-class="send-coupons-dialog"
                width="1080px"
                :before-close="addDialogClose"
                :destroy-on-close="true"
                :close-on-click-modal="false"
        >
            <el-form class="send-coupons-form" ref="addDialogForm" :model="addDialogForm" :rules="formRules" label-width="85px" label-position="right">
                <el-form-item class="form-item" label="名称:" prop="title">
                    <el-input class="w300" placeholder="请输入名称" type="text" v-model="addDialogForm.title"></el-input>
                </el-form-item>
                <el-form-item class="form-item" label="类型:" prop="type">
                    <el-radio-group
                            v-model="addDialogForm.type"
                            @change="chooseLinkType"
                    >
                        <!--<el-radio :label="6">商品列表页</el-radio>-->
                        <el-radio :label="7">商品详情页</el-radio>
                        <el-radio :label="3">直播间</el-radio>
                        <el-radio :label="5">页面</el-radio>
                        <el-radio :label="1">团作列表页</el-radio>
                        <el-radio :label="4">团作详情页</el-radio>
                        <el-radio :label="2">优惠券领取页</el-radio>
                        <el-radio :label="0">自定义(手填)</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item class="form-item" :label="back_link_label(addDialogForm.type)" prop="link" v-if="addDialogForm.type!=1">
                    <el-input type="textarea" :rows="3" class="w450" placeholder="请输入" v-model="addDialogForm.link"/>
                    <template v-if="addDialogForm.type==6">
                        <div class="tip-text">
                            <div>示例：name=布组&brand=川水&color=红色||灰色&material=棉&origin=中国&pattern=&other_id=-1&tag_id=34||3 。</div>
                            <div>其中other_id最多只能有一个值,属性和标签可以有多个值。</div>
                        </div>
                    </template>
                    <template v-if="addDialogForm.type==7">
                        <div class="tip-text">商品id可以在商品列表页中查看。</div>
                    </template>
                    <template v-if="addDialogForm.type==3">
                        <div class="tip-text">房间号可以通过在微信后台查看。</div>
                    </template>
                    <template v-if="addDialogForm.type==0">
                        <div class="tip-text">请填写完整路径，如果您不知道如何填写，请勿使用该选项。</div>
                    </template>
                    <template v-if="addDialogForm.type==5">
                        <div class="tip-text">页面id可以在页面列表页中查看。</div>
                    </template>
                </el-form-item>
                <el-form-item class="form-item" label="描述:" prop="comment">
                    <el-input class="w300" placeholder="请输入描述" v-model="addDialogForm.comment"/>
                </el-form-item>
                <el-form-item class="form-item" label="店铺:" prop="shop_id">
                    <el-select class="w300" filterable placeholder="请选择店铺" v-model="addDialogForm.shop_id">
                        <el-option
                                v-for="item in shopList"
                                :key="item.id"
                                :label="item.shop_name"
                                :value="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handleSave">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { queryList , createShare, deleteShare} from '@/api/pageShare'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import bus from '@/components/common/bus'
import { createAdv } from '../../../../api/activity';

export default {
    name: 'pageShare',
    data() {
        return {
            listLoading: false,
            loading: false,
            list: [],
            total: 0,
            shopList: [],
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
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
            saveIsClick: false,
            showCopyIndex: -1,
            showAddDialog: false,
            addDialogForm:{
                title:'', // 标题
                type: 7, // 类型 0自定义 1 团作列表 2优惠卷领取 3 直播间  4 团作详情 5 页面 6 商品列表  7 商品详情
                link: '', // 链接 参数
                comment:'', // 描述
                shop_id: '', // 可用店铺
            },
            formRules:{
                title: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 255, message: '长度在 1 到 255 个字符', trigger: 'blur' }
                ],
                link: [
                    { required: true, message: '请输入', trigger: 'blur' },
                    { min: 1, max: 255, message: '长度在 1 到 255 个字符', trigger: 'blur' }
                ],
                comment: [{ required: true, message: '请输入描述', trigger: 'blur' }],
                shop_id: [{ required: true, message: '请选择' }],
            }
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
    computed: {
        // back_link_label
        back_link_label: function() {
            let link_label = ''
            return data => {
                // 0自定义 1 团作列表 2优惠券领取 3 直播间  4 团作详情 5 页面 6 商品列表  7 商品详情
                if (data === 0) {
                    link_label = 'link:'
                } else if (data === 1) {
                    link_label = '无参数:'
                } else if (data === 2) {
                    link_label = '优惠券ID:'
                } else if (data === 3) {
                    link_label = '房间号:'
                } else if (data === 4) {
                    link_label = '团作ID:'
                } else if (data === 5)  {
                    link_label = '页面ID:'
                } else if (data === 6)  {
                    link_label = '参数:'
                } else if (data === 7)  {
                    link_label = '商品ID:'
                }
                return link_label
            }
        },
        back_type: function() {
            let link_label = ''
            return data => {
                // 0自定义 1 团作列表 2 优惠券领取 3 直播间  4 团作详情 5 页面 6 商品列表  7 商品详情
                if (data === 0) {
                    link_label = '自定义'
                } else if (data === 1) {
                    link_label = '团作列表'
                } else if (data === 2) {
                    link_label = '优惠券领取'
                } else if (data === 3) {
                    link_label = '直播间'
                } else if (data === 4) {
                    link_label = '团作详情'
                } else if (data === 5)  {
                    link_label = '页面'
                } else if (data === 6)  {
                    link_label = '商品列表'
                } else if (data === 7)  {
                    link_label = '商品详情'
                }
                return link_label
            }
        }
    },
    mounted() {
        // 默认搜索7天
        // this.setDefaultDate()

        bus.$on('refresh-page-manage', () => {
            this.getList()
        })
        this.initData()
    },
    methods: {
        formatMoney: formatMoney,
        async initData() {
            Promise.all([queryShopList({})])
                .then(res => {
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            this.shopList = res[0].data || []
                        }
                    }
                    this.getList()
                })
                .catch(() => {})
        },
        getList() {
            const rLoading = this.openLoading()
            // let params = _.cloneDeep(this.$refs['formFilter'].model)
            // if (params['searchTime'] && params['searchTime'].length == 2) {
            //     params['created_at_ge'] = params.searchTime[0]
            //     params['created_at_le'] = params.searchTime[1]
            // } else {
            //     params['created_at_ge'] = ''
            //     params['created_at_le'] = ''
            // }
            let params = {}
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            queryList(params)
                .then(res => {
                    rLoading.close()
                    this.list = res.data.lists
                    this.total = res.data.total
                    this.list.forEach((ev)=>{
                        this.shopList.forEach((item)=>{
                            if(ev.shop_id == item.id){
                                ev['shop_name'] = item.shop_name
                            }
                        })
                    })
                })
                .catch(err => {
                    rLoading.close()
                })
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

        // 新增
        pageCreat() {
            this.showAddDialog = true
        },

        pageDelete(id, index) {
            this.$confirm('确定删除?', '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    deleteShare({ id: id })
                        .then(res => {
                            if (res.code == 200) {
                                // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                                if (this.listQuery.page > 1 && this.list.length < 2) {
                                    this.listQuery.page = this.listQuery.page - 1
                                }
                                this.$notify({
                                    title: '删除成功',
                                    message: '',
                                    type: 'success',
                                    duration: 2000
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

        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
        },
        mouseEnter(i){
            console.log('鼠标移入')
            this.showCopyIndex = i
        },
        mouseLeave(){
            console.log('鼠标移出')
            this.showCopyIndex = -1
        },
        async handleOnCopy(text){
            let target = document.getElementById('copyInput') // 创建input节点
            target.value = text // 给input的value赋值
            target.select() // 选中input
            try {
                await document.execCommand('Copy') // 执行浏览器复制命令
                console.log('复制成功')
                this.$notify({
                    title: '复制成功',
                    message: '',
                    type: 'success',
                    duration: 2000
                })
            } catch {
                console.log('复制失败')
                this.$notify({
                    title: '复制失败',
                    message: '',
                    type: 'success',
                    duration: 2000
                })
            }
        },

        addDialogClose() {
            this.$refs['addDialogForm'].resetFields()
            this.$refs['addDialogForm'].clearValidate()
            this.showAddDialog = false
        },

        // 切换链接类型
        chooseLinkType() {
            this.$nextTick(() => {
                this.$set(this.addDialogForm, 'link', '') // 清除link内容
            })
        },

        // 保存
        handleSave() {
            if (!this.saveIsClick) {
                this.$refs['addDialogForm'].validate(valid => {
                    // 验证表单内容
                    if (valid) {
                        // let params = _.cloneDeep(this.addDialogForm)
                        let params = {
                            title: this.addDialogForm.title,
                            type: this.addDialogForm.type,
                            comment: this.addDialogForm.comment,
                            shop_id: this.addDialogForm.shop_id
                        }
                        console.log('params', params)
                        let new_link = '',
                            new_query = ''
                        // 0 自定义 1 团作列表 2优惠卷领取 3 直播间  4 团作详情 5 页面 6 商品列表  7 商品详情
                        if (this.addDialogForm.type === 0) {
                            // 自定义
                            let new_link_list = this.addDialogForm.link.split('?')
                            console.log('new_link_list', new_link_list)
                            new_link = new_link_list[0]
                            if(new_link_list.length > 1){
                                new_query = this.addDialogForm.link.replace(new_link+'?',"");
                            }
                        } else if (this.addDialogForm.type === 1) {
                            // 团作列表
                            new_link = '/pages/teamworkIndex/teamworkIndex'
                        } else if (this.addDialogForm.type === 2) {
                            // 优惠卷领取
                            new_link = '/packageMainSecondary/couponReceive/couponReceive'
                            new_query = 'id='+ this.addDialogForm.link
                        } else if (this.addDialogForm.type === 3) {
                            // 直播间
                            new_link = 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin'
                            new_query = 'room_id='+ this.addDialogForm.link
                        } else if (this.addDialogForm.type === 4) {
                            // 团作详情
                            new_link = '/packageTeamwork/teamworkDetail/teamworkDetail'
                            new_query = 'id=' + this.addDialogForm.link
                        } else if (this.addDialogForm.type === 5) {
                            // 页面
                            new_link = '/packageAgent/article/article'
                            new_query = 'id=' + this.addDialogForm.link
                        } else if (this.addDialogForm.type === 6) {
                            // 商品列表
                            new_link = '/pages/goodsSearchResult/goodsSearchResult'
                            new_query = this.addDialogForm.link
                        } else if (this.addDialogForm.type === 7) {
                            // 商品详情
                            new_link = '/pages/goodsDetail/goodsDetail'
                            new_query = 'goodsId=' + this.addDialogForm.link
                        }
                        // console.log('new_link', new_link)
                        params['path'] = new_link
                        params['query'] = new_query
                        this.queryAdd(params)
                    } else {
                        this.$notify({
                            title: '请填写完成数据后提交',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                    }
                })
            }
        },

        // 请求 -- 添加
        queryAdd(params) {
            this.saveIsClick = true
            const rLoading = this.openLoading()
            let that = this
            createShare(params)
                .then(async res => {
                    rLoading.close()
                    that.saveIsClick = false
                    if (res.code === 200) {
                        that.$notify({
                            title: '添加成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        this.$refs['addDialogForm'].resetFields()
                        this.$refs['addDialogForm'].clearValidate()
                        that.showAddDialog = false
                        this.listQuery.page = 1
                        this.getList()
                    } else {
                        that.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(err => {
                    rLoading.close()
                    that.saveIsClick = false
                })
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
.link-wrap{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 30px;
    .url-box{
        width: 240px;
    }
    .copy-box{
        width: 30px;
        height: 30px;
        background: rgba(24, 144, 255, 0.08);
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        img{
            width: 14px;
        }
    }
    .copy-input{
        position: absolute;
        z-index: -1;
        left: -999px;
        top: 0;
    }
}
.w300{
    width: 300px !important;
}
.w450{
    width: 450px !important;
}
</style>
