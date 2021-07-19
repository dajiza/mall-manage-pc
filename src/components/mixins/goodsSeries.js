import { queryShopList, queryCategoryListAll } from '@/api/goods'
import { updateGoodsSeries, queryGoodsSeriesDetail } from '@/api/goodsSeries'
import { queryShopGoodsList } from '@/api/live'
import { formatMoney } from '@/plugin/tool'
import { ATTR, ATTR_NAME } from '@/plugin/constant'
import bus from '@/components/common/bus'
import commUtil from '@/utils/commUtil'
import EmptyList from '../common/empty-list/EmptyList'
import ElImageViewer from '@/components/common/image-viewer'
import addShopGoods from '@/components/common/add-shop-goods/addShopGoods'
import { construct } from '@/utils/json-tree'
import draggable from 'vuedraggable'
import { console } from 'vuedraggable/src/util/helper';

export const mixinsGoodsSeries = {
    data() {
        return {
            commUtil,
            ATTR_NAME,
            tableKey: 0,
            operationTitle: '',
            shopList: [],
            operationForm: {
                title: '',
                remark: '',
                shop_id: '',
            },
            rules: {
                title: [
                    { required: true, message: '请输入系列名称', trigger: 'blur' },
                    { min: 1, max: 150, message: '长度在 1 到 150 个字符', trigger: 'blur' }
                ],
                shop_id: [{ required: true, message: '请选择' }],
                tag_ids: [{ required: true, message: '请选择', trigger: 'change' }]
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
            searchParams: {},
            statusList: [
                { value: 1, label: '下架' },
                { value: 2, label: '上架' }
            ],
            saleStatusList: [
                { value: 1, label: '可出售' },
                { value: 2, label: '不可售' }
            ],
            listLoading: false,
            saveIsClick: false,
            shopId: -1,
            cate_other_list: [], // 其它分类
            cate_group_list: [], // 布组分类
            cateKey: 1,
            categoryData: [],
            goodsData: [],
            tableHeight: 'calc(100vh - 254px)',
            goods_loading: false,
            goodsPage: 1,
            limit: 10,
            pageTotal: 0,
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            imgList: [],
            timgList: [], //主图预览列表
            skuImgList: [], //sku图预览列表
            checkedList: [], // 表格当前选中列表
            checked_goods_ids: [], // 选中商品id集合
            checked_goods_list: [], // 选中商品集合
            couponsDetail: {},

            loadingTip: {},
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            sortValue: '',
            sortOptions: [
                {id: 5, name: '销量'},
                {id: 1, name: '价格倒序'},
                {id: 2, name: '价格顺序'},
                {id: 3, name: '上架时间倒序'},
                {id: 4, name: '上架时间顺序'},
                {id: 6, name: '手动'}
            ],
            is_all: false,
            is_loading: false,
            isSort: false, // 是否启用排序
            allChecked: false,
            checked_goods_count: 0,
            isIndeterminate: false
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
        backGoodsOtherName: function() {
            return data => {
                let _name = ''
                this.cate_other_list.forEach(ev => {
                    if (ev.id == data) {
                        _name = ' > ' + ev.name
                    }
                })
                return _name
            }
        },
        backGoodsCategoryName: function() {
            return data => {
                let _name = ''
                this.cate_group_list.forEach(ev => {
                    if (ev.id == data) {
                        _name = ' > ' + ev.name
                    }
                })
                return _name
            }
        }
    },
    components: {
        ElImageViewer,
        EmptyList,
        addShopGoods,
        draggable
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
    mounted() {
        this.searchParams = _.cloneDeep(this.searchForm)
    },
    methods: {
        formatMoney: formatMoney,
        goodsTable(row) {
            if (row.columnIndex == 2) {
                return 'checkboxColumn'
            }
        },
        async initData() {
            const rLoading = this.openLoading()
            Promise.all([
                queryShopList({}),
                queryCategoryListAll({ type: 1 }),
                queryCategoryListAll({ type: 2 })
            ])
                .then(res => {
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
        },

        // 详情回显
        setDetailInfo(info) {
            this.$set(this.operationForm, 'title', info.goods_group.title)
            this.$set(this.operationForm, 'remark', info.goods_group.remark)
            this.$set(this.operationForm, 'shop_id', info.goods_group.shop_id ? Number(info.goods_group.shop_id) : '')
            this.checked_goods_list = []
            this.checked_goods_ids = []
            if (this.operationTitle === '编辑系列') {
                const list = info.goods_relations.list || []
                if(list.length > 0) {
                    this.checked_goods_list = list
                    this.checked_goods_ids  = list.map(item=>{return item.id})
                    this.getShopGoodsList()
                }
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
                let params = {
                    id: Number(id),
                    page: 1,
                    limit: 99999
                }
                queryGoodsSeriesDetail(params)
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
                    console.log('goodsData===307', this.goodsData)
                    let params = {
                        goods_group: {
                            id: 0,
                            title: this.operationForm.title,
                            remark: this.operationForm.remark,
                            shop_id: Number(this.operationForm.shop_id),
                            sort_type: this.sortValue,
                        },
                        goods_group_relations: [
                            {
                                shop_goods_id: 153,
                                sort: 0,
                            },
                            {
                                shop_goods_id: 159,
                                sort: 1,
                            },
                            {
                                shop_goods_id: 234,
                                sort: 2,
                            },
                            {
                                shop_goods_id: 235,
                                sort: 3,
                            },
                            {
                                shop_goods_id: 237,
                                sort: 4,
                            },
                            {
                                shop_goods_id: 238,
                                sort: 5,
                            },
                            {
                                shop_goods_id: 241,
                                sort: 6,
                            },
                            {
                                shop_goods_id: 242,
                                sort: 7,
                            },
                            {
                                shop_goods_id: 233,
                                sort: 8,
                            },
                            {
                                shop_goods_id: 232,
                                sort: 9,
                            },
                            {
                                shop_goods_id: 236,
                                sort: 10,
                            },
                            {
                                shop_goods_id: 240,
                                sort: 11,
                            },
                            {
                                shop_goods_id: 239,
                                sort: 12,
                            },
                            {
                                shop_goods_id: 216,
                                sort: 13,
                            },
                            {
                                shop_goods_id: 157,
                                sort: 14,
                            },
                        ]

                    }
                    let selectedList = []
                    if(this.goodsData.length > 0) {
                        this.goodsData.forEach((ev,i)=>{
                            selectedList.push({
                                shop_goods_id: ev.id,
                                sort: i + 1
                            })
                        })
                    }
                    params['goods_group_relations'] = selectedList

                    if (this.operationTitle === '编辑系列') {
                        params['goods_group']['id'] = Number(this.$route.query.id)
                        // 请求编辑
                        // this.queryEdit(editParams)
                        this.querySave(params,'edit')
                    } else {
                        this.querySave(params,'add')
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

        // 请求 -- 保存
        querySave(params, type) {
            const rLoading = this.openLoading()
            let that = this
            updateGoodsSeries(params)
                .then(async res => {
                    rLoading.close()
                    if (res.code === 200) {
                        that.$notify({
                            title: '保存成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        bus.$emit('close_current_tags')
                        bus.$emit('refreshGoodsSeriesList', type)
                        that.$router.push({
                            path: 'mall-backend-goods-series'
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

        // 按钮-分页导航
        handlePageChange(val) {
            this.goodsPage = val
            this.searchForm = _.cloneDeep(this.searchParams)
            this.getShopGoodsList()
        },

        // 按钮-触发搜索 -- 存储搜索条件
        handleSearch(formName) {
            this.goodsPage = 1
            this.searchParams = _.cloneDeep(this.searchForm)
            this.getShopGoodsList()
        },

        // 重置
        resetForm(formName) {
            this.$refs['searchForm'].resetFields()
            this.searchParams = _.cloneDeep(this.searchForm)
            this.getShopGoodsList()
        },

        goodsInit() {
            this.goodsPage = 1
            this.goodsData = []
            this.pageTotal = 0
            this.imgList = []
            this.skuImgList = []
            this.previewIndex = 0
            this.is_all = false
        },

        // 添加
        handleAdd() {
            if (this.operationForm.shop_id) {
                this.shopId = this.operationForm.shop_id
                this.$refs.goodsList.show()
            } else {
                this.$notify({
                    title: '请先选择店铺',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }

        },

        // 批量移除
        handleDelCate() {
            const select_list = this.goodsData.filter(item=>{return item.goodsIsChecked})
            if (select_list.length > 0) {
                this.addOrDelSuccess(select_list, 'del')
            } else {
                this.$notify({
                    title: '请勾选商品后再移除',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },


        // 移除单个
        handleDelItem(index, row) {
            let _arr = []
            _arr.push(row)
            this.addOrDelSuccess(_arr, 'del')
        },

        // 移除成功
        addOrDelSuccess(list, type) {
            if (list.length > 0) {
                let new_goods_list = []
                list.forEach(ev => {
                    new_goods_list.push(ev.id)
                })
                let tipText = ''
                let num = new_goods_list.length
                let del_text = ''
                if (num > 1) {
                    del_text = '确定将' + num + '件商品移除吗？'
                } else {
                    del_text = '确定将该件商品移除吗？'
                }
                this.$confirm(del_text, '', {
                    customClass: 'message-delete',
                    type: 'warning'
                })
                    .then(() => {
                        let new_arr = _.cloneDeep(this.checked_goods_ids)
                        new_arr = new_arr.filter(function(item) {
                            return new_goods_list.indexOf(item) == -1
                        })
                        this.checked_goods_ids = new_arr
                        let newCheckedGoodsList  = []
                        this.checked_goods_list.forEach((ev)=>{
                            if(this.checked_goods_ids.includes(ev.id)) {
                                newCheckedGoodsList.push(ev)
                            }
                        })
                        this.checked_goods_list = newCheckedGoodsList
                        tipText = "已移除,可到'未添加'列表查看"
                        this.$notify({
                            title: tipText,
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        this.goodsInit()
                        this.getShopGoodsList()
                    })
                    .catch(() => {})
            } else {
                this.$notify({
                    title: type === 'add' ? '无可添加商品' : '无可移除商品',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 打开大图预览 type 1主图 2sku图
        openPreview(img, type, index) {
            if (type == 1) {
                this.previewUrlList = this.imgList
            } else if (type == 2) {
                this.previewUrlList = this.skuImgList
            } else if (type == 3) {
                let _list = []
                img.forEach(item => {
                    _list.push(item.sku_sku_img)
                })
                this.previewUrlList = _list
                // return
            }
            // this.previewUrlList = this.imgList
            this.previewIndex = index
            this.dialogVisiblePic = true
        },
        // 关闭大图
        closePreview() {
            this.dialogVisiblePic = false
        },

        // 确定添加 商品
        sureAddGoods(data){
            console.log('data', data)
            // 请求 店铺商品列表
            this.checked_goods_list = this.unique(this.checked_goods_list.concat(data));
            this.isAdd = true
            this.goodsPage = 1
            this.getShopGoodsList()
        },

        // 请求店铺商品列表
        getShopGoodsList() {
            if(!this.shopId) {
                console.log('请先选择店铺')
                return
            }
            const rLoading = this.openLoading()
            let params = _.cloneDeep(this.searchParams)
            params['limit'] = this.limit
            params['page'] = this.goodsPage
            params['goods_id'] = Number(this.searchParams.goods_id)
            if (params['typeCategory'].length == 1) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = ''
            } else if (params['typeCategory'].length == 2) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = params['typeCategory'][1]
            } else if (params['typeCategory'].length == 3) {
                params['goods_type'] = params['typeCategory'][0]
                params['other_id'] = params['typeCategory'][2]
            }
            if (params['goods_type'] == 1) {
                params['other_id'] = 0
            }
            params['goods_ids'] = []
            if (this.checked_goods_list.length > 0) {
                params['goods_ids'] = this.checked_goods_list.map(item=>{return item.goods_id})
            }
            params['shop_id'] = this.shopId
            params['sort'] = this.sortValue
            this.is_loading = true
            this.skuImgList = []
            this.imgList = []
            let skuImgIndex = 0
            queryShopGoodsList(params)
                .then((res)=>{
                    rLoading.close()
                    if (res.code == 200) {
                        if (this.isAdd) {
                            this.goodsData = []
                        }
                        this.pageTotal = res.data.total || 0
                        const new_list = res.data.lists || []
                        this.goodsData = this.goodsData.concat(new_list)
                        if (this.goodsData.length == this.pageTotal) {
                            this.is_all = true
                        }
                        if (res.data.total == 0) {
                            this.is_all = true
                            this.goodsData = []
                        }
                        this.goodsData.forEach((goods)=>{
                            goods['open'] = false
                            goods['goodsIsChecked'] = false
                            goods['onShelfNum'] = goods.shop_skus.filter(item=>{return item.status == 2}).length
                            this.imgList.push(goods.goods_img)
                            goods.shop_skus.forEach((sku, sku_i) => {
                                this.skuImgList.push(sku.sku_sku_img)
                            })
                            for (let j = 0; j < goods.shop_skus.length; j++) {
                                const sku = goods.shop_skus[j]
                                sku.skuImgIndex = skuImgIndex
                                skuImgIndex++
                            }
                        })
                        let that = this
                        setTimeout(()=>{
                            that.is_loading = false
                        },500)
                    } else {
                        // this.is_all = true
                        this.is_loading = false
                        this.$notify({
                            title: res.message,
                            type: 'warning',
                            duration: 5000
                        })
                    }
                })
                .catch()
        },
        goodsOpenSKU(i,bol) {
            console.log('bol', bol)
            let obj = _.cloneDeep(this.goodsData[i])
            obj['open'] = bol
            this.$set(this.goodsData, i, obj)
        },
        // 商品选中/取消
        goodsChecked(value,row, index) {
            const bol = row.goodsIsChecked
            console.log('bol', bol)
            this.$nextTick(()=>{
                let obj = _.cloneDeep(row)
                obj['goodsIsChecked'] = value
                this.$set(this.goodsData, index, obj)
                console.log('this.goodsData', this.goodsData)
                this.checked_goods_count = this.goodsData.filter(item=>{return item.goodsIsChecked}).length
                this.isIndeterminate = this.checked_goods_count > 0 && this.checked_goods_count < this.goodsData.length
                console.log('checked_goods_count', this.checked_goods_count)
            })

            // console.log('this.goodsData', this.goodsData)
        },

        goodsAllChecked(bol) {
            this.allChecked = bol
            this.goodsData.forEach((ev, i)=>{
                ev['goodsIsChecked'] = bol
                // this.goodsChecked(bol, ev, i)
            })
            this.$nextTick(()=>{
                this.checked_goods_count = this.goodsData.filter(item=>{return item.goodsIsChecked}).length
                this.isIndeterminate = this.checked_goods_count > 0 && this.checked_goods_count < this.goodsData.length
            })

            console.log('this.goodsData', this.goodsData)
        },

        shopChange() {
            this.shopId = this.operationForm.shop_id
            console.log('this.shopId', this.shopId)
        },
        //
        sortTypeChange() {
            console.log('sortValue', this.sortValue)
            if(this.sortValue == 6) {
                this.isSort = true
            } else {
                this.isSort = false
            }
            if(this.goodsData.length > 0) {
                this.goodsInit()
                this.getShopGoodsList()
            }

        },

        handleScroll(e) {
            let ele = e.srcElement ? e.srcElement : e.target;
            const ulScrollTop = this.$refs.listUl.scrollTop;
            const ulHeight = this.$refs.listUl.offsetHeight;
            const ulScrollHeight = this.$refs.listUl.scrollHeight;
            if(Number(ulScrollTop + ulHeight) > ulScrollHeight - 30){
                if (!this.is_all && !this.is_loading) {
                    // 滚动到底，该刷新页面
                    this.goodsPage = Number(this.goodsPage + 1);
                    this.getShopGoodsList();
                } else {
                    // 滚动到底，没有更多了
                }

            }else {
                // 未滚动到底
            }
        },
        dragStart() {
            console.log('goodsData====694', this.goodsData)
        },

        end(e) {
            let oldIndex = e.oldIndex
            let newIndex = e.newIndex
            console.log('e', e)
            let currRow = this.goodsData[oldIndex]
            let newItems = [...this.goodsData]
            // 删除老的节点
            newItems.splice(oldIndex, 1)
            // 增加新的节点
            newItems.splice(newIndex, 0, currRow)
            // items结构发生变化触发transition-group的动画
            this.$nextTick(() => {
                this.goodsData = [...newItems]
                this.activeImg = ''
                console.log('goodsData====701', this.goodsData)
            })
        },

        // 对象数组去重
        unique(arr) {
            const res = new Map();
            return arr.filter((arr) => !res.has(arr.id) && res.set(arr.id, 1))
        },
    }
}
