import { updateCoupons, creatCoupons, queryCouponsDetail, queryCouponGoodsList } from '@/api/coupons'
import { queryShopList, queryCategoryListAll } from '@/api/goods'
import { updateGoodsSeries } from '@/api/goodSeries'

import { formatMoney } from '@/plugin/tool'
import { ATTR, ATTR_NAME } from '@/plugin/constant'
import bus from '@/components/common/bus'
import commUtil from '@/utils/commUtil'
import EmptyList from '../common/empty-list/EmptyList'
import ElImageViewer from '@/components/common/image-viewer'
import addShopGoods from '@/components/common/add-shop-goods/addShopGoods'
import { construct } from '@/utils/json-tree'

export const mixinsGoodsSeries = {
    data() {
        return {
            ATTR_NAME,
            tableKey: 0,
            btnLoading: false,
            dialogImageUrl: '',
            operationTitle: '',
            shopList: [],
            options: {},
            operationForm: {
                title: '',
                remark: '',
                tag_ids: [], // 选择标签
            },
            searchForm: {
                goods_id: '',
                goods_name: '', // 商品名称
                other_id: '',
                goods_type: '',
                shop_goods_status: '',
                sku_name: '',
                sku_code: '',
                typeCategory: []
            },
            // 是否上架：1下架；2上架
            statusList: [
                { value: 1, label: '下架' },
                { value: 2, label: '上架' }
            ],
            saleStatusList: [
                { value: 1, label: '可出售' },
                { value: 2, label: '不可售' }
            ],
            rules: {
                title: [
                    { required: true, message: '请输入系列名称', trigger: 'blur' },
                    { min: 1, max: 150, message: '长度在 1 到 150 个字符', trigger: 'blur' }
                ],
                shop_id: [{ required: true, message: '请选择' }],
                tag_ids: [{ required: true, message: '请选择', trigger: 'change' }]
            },
            listLoading: false,
            saveIsClick: false,
            shopId: -1,
            checked_sku_list: [],
            cate_other_list: [], // 其它分类
            cate_group_list: [], // 布组分类
            cateKey: 1,
            categoryData: [],
            goodsData: [],
            tableHeight: 'calc(100vh - 374px)',
            goods_loading: false,
            goodsPage: 1,
            goodsLimit: 10,
            pageTotal: 0,
            tabPosition: 'selected',
            searchParams: {
                goods_name: '',
                cateArr: []
            },
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            imgList: [],
            selected_goods: [], // 已选中商品id数组
            checkedList: [], // 表格当前选中列表
            couponsDetail: {},
            showTags: [],
            cateLimit: 0, // 分类下总条数
            allLimit: 0, // 全部商品数量
            cateIsAtLast: false, // 最终请求分类商品
            loadingTip: {},
            addGoodsCount: 0,
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            sortValue: '',
            sortOptions: [
                {id: 1, name: '销量'},
                {id: 2, name: '最高价格'},
                {id: 3, name: '最低价格'},
                {id: 4, name: '时间'},
            ]
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
    computed: {},
    components: {
        ElImageViewer,
        EmptyList,
        addShopGoods
    },
    created() {
        if (this.$route.query.status === 'edit') {
            this.operationTitle = '编辑系列'
        } else if (this.$route.query.status === 'copy') {
            this.operationTitle = '复制系列'
        } else {
            this.operationTitle = '新增系列'
        }
        this.initData()
    },
    mounted() {},
    methods: {
        formatMoney: formatMoney,
        async initData() {
            const rLoading = this.openLoading()
            Promise.all([
                queryShopList({}),
                queryCategoryListAll({ type: 1 }),
                queryCategoryListAll({ type: 2 })
            ])
                .then(res => {
                    console.log('res', res)
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            this.shopList = res[0].data || []
                        }
                    }

                    if (res[1].code === 200) {
                        // 分类其它
                        if (res[1].data) {
                            this.cate_other_list = res[1].data
                        }
                    }
                    if (res[2].code === 200) {
                        // 分类布组
                        if (res[2].data) {
                            this.cate_group_list = res[2].data
                        }
                    }
                    this.creatCategoryData()
                    rLoading.close()
                    if (this.operationTitle !== '新增系列') {
                        // 请求系列详情
                        this.getDetail()
                    }
                })
                .catch(() => {})
        },

        // 生成类型 分类 级联列表
        creatCategoryData() {
            console.log('this.cate_other_list', this.cate_other_list)
            console.log('this.cate_group_list', this.cate_group_list)
            this.categoryData = [
                { value: 1, label: '布料', children: null },
                {
                    value: 2,
                    label: '其他',
                    children: construct(this.cate_other_list, {
                        id: 'id',
                        pid: 'parent_id',
                        children: 'children'
                    }).map(item => {
                        return {
                            label: item.name,
                            value: item.id,
                            children: item.children
                                ? item.children.map(son => {
                                    return { label: son.name, value: son.id }
                                })
                                : null
                        }
                    })
                },
                {
                    value: 3,
                    label: '布组',
                    children: construct(this.cate_group_list, {
                        id: 'id',
                        pid: 'parent_id',
                        children: 'children'
                    }).map(item => {
                        return {
                            label: item.name,
                            value: item.id,
                            children: item.children
                                ? item.children.map(son => {
                                    return { label: son.name, value: son.id }
                                })
                                : null
                        }
                    })
                }
            ]
            console.log('this.categoryData', this.categoryData)
        },
        // 详情回显
        setDetailInfo(info) {

            this.$set(this.operationForm, 'title', info.title)
            this.$set(this.operationForm, 'remark', info.remark)
            this.$set(this.operationForm, 'shop_id', Number(info.shop_id))

            // this.getListData()
            if (this.operationTitle === '编辑系列') {
            } else {
                this.$set(this.operationForm, 'title', '')
            }
        },

        // 获取系列详情
        getDetail() {
            return new Promise((resolve, reject) => {
                let id = this.$route.query.id
                if (!id) {
                    return
                }
                let params = { coupon_id: Number(id) }
                queryCouponsDetail(params)
                    .then(async res => {
                        let data = _.cloneDeep(res.data)
                        // 详情回显
                        this.setDetailInfo(data)
                    })
                    .catch(err => {
                        // console.log('err', err);
                        // reject(err.data)
                    })
            })
        },

        // 保存
        handleSave() {
            this.$refs['operationForm'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    // let params = _.cloneDeep(this.operationForm);
                    let params = {
                        title: this.operationForm.title,
                        remark: this.operationForm.remark,
                        shop_id: Number(this.operationForm.shop_id),
                    }

                    let editParams = {
                        id: Number(this.$route.query.id),
                        use_goods_ids: [],
                        use_goods_tag_ids: []
                    }
                    if (this.operationForm.use_goods_type === 2) {
                        editParams['use_goods_tag_ids'] = []
                        if (this.selected_goods.length > 0) {
                            params['use_goods_ids'] = this.selected_goods
                            editParams['use_goods_ids'] = this.selected_goods
                        } else {
                            this.$notify({
                                title: '请先指定商品',
                                message: '',
                                type: 'warning',
                                duration: 5000
                            })
                            return
                        }
                    }
                    if (this.operationTitle === '编辑系列') {
                        editParams['id'] = Number(this.$route.query.id)
                        // 请求编辑
                        this.queryEdit(editParams)
                    } else {
                        this.queryAdd(params)
                    }
                } else {
                    this.$notify({
                        title: '请检查数据是否符合要求后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
        },

        // 取消
        handleCancel() {
            bus.$emit('close_current_tags')
            this.$router.push({
                // path: 'mall-backend-coupons'
            })
        },

        // 请求 -- 添加
        queryAdd(params) {
            const rLoading = this.openLoading()
            let that = this
            creatCoupons(params)
                .then(async res => {
                    rLoading.close()
                    if (res.code === 200) {
                        that.$notify({
                            title: '添加成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        bus.$emit('close_current_tags')
                        that.$router.push({
                            path: 'mall-backend-coupons'
                        })
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
                })
        },

        // 请求 -- 编辑
        queryEdit(editParams) {
            const rLoading = this.openLoading()
            let that = this
            updateCoupons(editParams)
                .then(async res => {
                    rLoading.close()
                    if (res.code === 200) {
                        that.$notify({
                            title: '编辑成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        bus.$emit('close_current_tags')
                        that.$router.push({
                            path: 'mall-backend-coupons'
                        })
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
                })
        },

        // 按钮-切换 选中未选中
        tabClick() {
            this.goodsPage = 1
            this.getListData()
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.goodsPage = val
            this.searchForm = _.cloneDeep(this.searchParams)
            this.getListData()
        },

        // 按钮-触发搜索 -- 存储搜索条件
        handleSearch(formName) {
            this.goodsPage = 1
            this.searchParams = _.cloneDeep(this.searchForm)
            this.getListData()
        },

        // 重置
        resetForm(formName) {
            this.$refs['searchForm'].resetFields()
            this.searchParams = _.cloneDeep(this.searchForm)
            this.getListData()
        },

        // 勾选
        handleSelectionChange(val) {
            this.checkedList = val
        },

        goodsInit() {
            this.goodsPage = 1
            this.goodsData = []
            this.pageTotal = 0
            this.imgList = []
            this.previewIndex = 0
        },

        // 添加
        handleAdd() {
            console.log('operationForm.shop_id', this.operationForm.shop_id)
            if (this.operationForm.shop_id) {
                this.shopId = this.operationForm.shop_id
                this.$refs.goodsList.show()
            } else {
                this.$notify({
                    title: '请先选择店铺',
                    message: '',
                    type: 'error',
                    duration: 5000
                })
            }

        },

        // 输出 -- 分类id
        backCateId() {
            let cateId = -1
            if (this.searchParams.cateArr.length > 0) {
                const selected_cate = this.searchParams.cateArr
                if (selected_cate.length == 2) {
                    cateId = selected_cate[1]
                } else if (selected_cate.length == 3) {
                    cateId = selected_cate[2]
                } else {
                    cateId = 0
                }
            }
            console.log('输出 ~ cateId', cateId)
            return cateId
        },

        // 添加/删除分类
        addOrDelCate(type) {
            this.searchForm = _.cloneDeep(this.searchParams)
            if (this.searchParams.cateArr.length > 0) {
                this.loadingTip = this.uploadLoading('加载中')
                const cate_id = this.backCateId()
                if (this.searchParams.goods_name) {
                    // 搜索中 有商品名称  重新请求 该分类下商品列表数量 先获取商品总数
                    this.getGoodsListTotal(this.searchParams.goods_name,type, cate_id, 'cete')
                } else {
                    // 搜索中 不含有商品名称  可以直接获取到商品总数
                    this.cateLimit = this.pageTotal
                    this.getAllOrCateGoods('', type, cate_id, 'cate')
                }
            } else {
                this.$notify({
                    title: '请选择分类并搜索后再添加该分类',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 添加或移除全部/搜索
        addOrDelAll(type) {
            this.searchForm = _.cloneDeep(this.searchParams)
            if (this.goodsData.length > 0) {
                this.loadingTip = this.uploadLoading('加载中')
                const cate_id = this.backCateId()
                this.getGoodsListTotal(this.searchParams.goods_name,type, cate_id, 'all')
            } else {
                this.$notify({
                    title: type === 'add' ? '无可添加商品' : '无可移除商品',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 移除选中
        handleDelSelected() {
            if (this.checkedList.length > 0) {
                this.addOrDelSuccess(this.checkedList, 'del')
            } else {
                this.$notify({
                    title: '请勾选商品后再移除',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 移除该分类
        handleDelCate() {
            // 请选择分类并搜索后再移除该分类
            this.addOrDelCate('del')
        },

        // 清空已添加
        handleDelAll() {
            this.addOrDelAll('del')
        },

        // 移除单个
        handleDelItem(index, row) {
            let _arr = []
            _arr.push(row)
            this.addOrDelSuccess(_arr, 'del')
        },

        // 获取分类下商品数量/全部商品数量
        getGoodsListTotal(goods_name,type, cate_id, str) {
            let params = {
                page: 1,
                limit: 10,
                goods_name: goods_name,
                category_id: cate_id,
                goods_ids: [],
                not_goods_ids: []
            }
            if(type == 'add') {
                params['not_goods_ids'] = this.selected_goods
            } else {
                params['goods_ids'] = this.selected_goods
            }
            queryCouponGoodsList(params)
                .then(res => {
                    this.imgList = []
                    this.previewIndex = 0
                    if (res.code === 200) {
                        if (res.data) {
                            if (str === 'all') {
                                this.allLimit = res.data.total
                            } else {
                                this.cateLimit = res.data.total
                            }
                            if (res.data.total > 10) {
                                this.getAllOrCateGoods('', type, cate_id, str)
                            } else {
                                this.loadingTip.close()
                                this.addOrDelSuccess(res.data.lists || [], type)
                            }
                        }
                    } else {
                        this.loadingTip.close()
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {
                    this.loadingTip.close()
                })
        },
        // 添加成功/移除成功
        addOrDelSuccess(list, type) {
            if (list.length > 0) {
                let new_goods_list = []
                list.forEach(ev => {
                    new_goods_list.push(ev.goods_id)
                })
                let tipText = ''
                let num = new_goods_list.length
                if (type === 'add') {
                    let _text = ''
                    if (num > 1) {
                        _text = '确定要添加' + num + '件商品到已添加列表吗？'
                    } else {
                        _text = '确定要添加该件商品到已添加列表吗？'
                    }
                    this.$confirm(_text, '', {
                        customClass: 'message-delete',
                        type: 'warning'
                    })
                        .then(() => {
                            let old_list = _.cloneDeep(this.selected_goods)
                            this.selected_goods = [...old_list, ...new_goods_list]
                            tipText = "已移入到'已添加'列表"
                            this.$notify({
                                title: tipText,
                                message: '',
                                type: 'success',
                                duration: 3000
                            })
                            this.$refs.goodsList.close()
                            this.goodsInit()
                            this.getListData()
                        })
                        .catch(() => {})
                } else if (type === 'del') {
                    let del_text = ''
                    if (num > 1) {
                        del_text = '确定将' + num + '件商品从已添加列表移除吗？'
                    } else {
                        del_text = '确定将该件商品从已添加列表移除吗？'
                    }
                    this.$confirm(del_text, '', {
                        customClass: 'message-delete',
                        type: 'warning'
                    })
                        .then(() => {
                            let new_arr = _.cloneDeep(this.selected_goods)
                            new_arr = new_arr.filter(function(item) {
                                return new_goods_list.indexOf(item) == -1
                            })
                            this.selected_goods = new_arr
                            tipText = "已移除,可到'未添加'列表查看"
                            this.$notify({
                                title: tipText,
                                message: '',
                                type: 'success',
                                duration: 3000
                            })
                            this.goodsInit()
                            this.getListData()
                        })
                        .catch(() => {})
                }
            } else {
                this.$notify({
                    title: type === 'add' ? '无可添加商品' : '无可移除商品',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 获取 总商品 / 分类下商品
        getAllOrCateGoods(name, type, cate_id, str) {
            let params = {
                page: 1,
                limit: str === 'all' ? this.allLimit : this.cateLimit,
                goods_name: str === 'cate' ? '' : this.searchParams.goods_name,
                category_id: cate_id,
                goods_ids: [],
                not_goods_ids: []
            }
            if(type == 'add') {
                params['not_goods_ids'] = this.selected_goods
            } else {
                params['goods_ids'] = this.selected_goods
            }
            queryCouponGoodsList(params)
                .then(res => {
                    this.imgList = []
                    this.previewIndex = 0
                    this.loadingTip.close()
                    if (res.code === 200) {
                        if (res.data) {
                            if (str === 'all') {
                                // console.log('全部商品/搜索');
                            } else {
                                // console.log('分类商品');
                            }
                            this.loadingTip.close()
                            this.addOrDelSuccess(res.data.lists || [], type)
                        }
                    } else {
                        this.loadingTip.close()
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {
                    this.loadingTip.close()
                })
        },

        // 商品列表
        getListData() {
            let cateId = this.backCateId()
            let params = {
                page: this.goodsPage,
                limit: this.goodsLimit,
                goods_name: this.searchParams.goods_name,
                category_id: cateId,
                goods_ids: []
            }
            if (this.selected_goods.length > 0) {
                params['goods_ids'] = this.selected_goods
            } else {
                this.goodsInit()
                return
            }
            const rLoading = this.openLoading()
            queryCouponGoodsList(params)
                .then(res => {
                    rLoading.close()
                    this.imgList = []
                    this.previewIndex = 0
                    if (res.code === 200) {
                        if (res.data) {
                            this.goodsData = res.data.lists || []
                            this.pageTotal = res.data.total
                            this.addGoodsCount = res.data.total
                            this.goodsData.forEach(item => {
                                this.imgList.push(item.goods_img)
                            })
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

        // 打开大图预览
        openPreview(img, type, index) {
            this.previewUrlList = this.imgList
            this.previewIndex = index
            this.dialogVisiblePic = true
        },
        // 关闭大图
        closePreview() {
            this.dialogVisiblePic = false
        },
        // 格式化标签数据
        handlerData(arr) {
            let obj = {}
            arr.forEach((item, index) => {
                let { tag_category_id } = item
                if (!obj[tag_category_id]) {
                    obj[tag_category_id] = {
                        tag_category_id,
                        children: []
                    }
                }
                obj[tag_category_id].children.push(item)
            })
            let data = Object.values(obj)
            data.forEach(ev => {
                ev['name'] = ev.children[0].tag_category_name
                ev['id'] = ev.tag_category_id
            })
            // 最终输出
            return data
        },
        //时间格式化
        getTime(val) {
            if (val) {
                const dt = new Date(val)
                let year = dt.getFullYear() //年
                let month = dt.getMonth() + 1 //月
                let date = dt.getDate() //日
                let hh = dt.getHours() //时
                let mm = dt.getMinutes() //分
                let ss = dt.getSeconds() //秒
                month = month < 10 ? '0' + month : month
                date = date < 10 ? '0' + date : date
                hh = hh < 10 ? '0' + hh : hh
                mm = mm < 10 ? '0' + mm : mm
                ss = ss < 10 ? '0' + ss : ss
                let new_time = ''
                new_time = year + '-' + month + '-' + date + ' ' + hh + ':' + mm + ':' + ss
                return new_time
            } else {
                return '-1'
            }
        },

        // 确定添加 商品
        getAddSku(sku_arr){

        },
    }
}
