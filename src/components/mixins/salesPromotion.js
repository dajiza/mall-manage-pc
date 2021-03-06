import { queryCouponGoodsList } from '@/api/coupons'
import { queryShopList, queryCategoryListAll } from '@/api/goods'
import { editPromotion, queryPromotionDetail } from '@/api/promotion'
import { getLabelAllList } from '@/api/goodsLabel'
import { formatMoney } from '@/plugin/tool'
import { ATTR, ATTR_NAME } from '@/plugin/constant'
import bus from '@/components/common/bus'
import commUtil from '@/utils/commUtil'
import EmptyList from '../common/empty-list/EmptyList'
import ElImageViewer from '@/components/common/image-viewer'
import { construct } from '@/utils/json-tree'
import couponList from '@/components/common/coupon-list-pop/CouponListPop'
import addGoodsPop from '@/components/common/add-goods-pop/addGoodsPop'
import addSkuPop from '@/components/common/add-sku-pop/addSkuPop'

export const mixinsPromotion = {
    data() {
        var checkAmount1 = (rule, value, callback) => {
            setTimeout(() => {
                if( Number(value) && Number(this.operationForm.discount1)){
                    const num1 = commUtil.numberMul(Number(value),100);
                    const num2 = commUtil.numberMul(Number(this.operationForm.discount1),100);
                    if ( num1 <= num2) {
                        callback(new Error('每满金额应大于优惠金额'));
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }
            }, 10);
        };
        var checkDiscount1 = (rule, value, callback) => {
            setTimeout(() => {
                if( Number(value) && Number(this.operationForm.amount1)){
                    const num1 = commUtil.numberMul(Number(value),100);
                    const num2 = commUtil.numberMul(Number(this.operationForm.amount1),100);
                    if ( num1 >= num2) {
                        callback(new Error('优惠金额应小于每满金额'));
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }
            }, 10);
        };
        return {
            ATTR_NAME,
            tableKey: 0,
            btnLoading: false,
            operationTitle: '',
            isShelf: false, // 是否上架
            shopList: [],
            operationForm: {
                type: 1,
                title: '',
                amount1: '',
                discount1: '',
                ladderList: [
                    {
                        needNum: '',
                        subNum: '',
                        coupon_title: '',
                        coupon_id: 0,
                        objId: 0,
                        exchGoodsList: [],
                        oldExchange:[],
                        showTipIcon: false
                    }
                ], // 阶梯
                topMoney: '', // 封顶优惠
                shop_id: '', // 可用店铺
                startTime: '', // 领用开始时间
                endTime: '', // 领用结束时间
                receive_user: 1, // 领用用户
                use_goods_type: 1, // 可用商品 0 全场通用 1 指定商品 2 指定标签
                tag_ids: [] // 选择标签
            },
            searchForm: {
                goods_name: '',
                cateArr: []
            },
            rules: {
                type: [{ required: true, message: '请选择类型', trigger: 'change' }],
                title: [
                    { required: true, message: '请输入促销名称', trigger: 'blur' },
                    { min: 1, max: 150, message: '长度在 1 到 150 个字符', trigger: 'blur' }
                ],
                amount1:[
                    { required: true, message: '请输入', trigger: 'blur' },
                    { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' },
                    { validator: checkAmount1, trigger: ['blur', 'change'] }
                ],
                discount1:[
                    { required: true, message: '请输入', trigger: 'blur' },
                    { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' },
                    { validator: checkDiscount1, trigger: ['blur', 'change'] }
                ],
                piecesValue:[
                    { required: true, message: '请输入', trigger: 'blur' },
                    { pattern: /(^[1-9]\d*$)/, message: '请输入大于零的整数' },
                ],
                needNum: [{ required: true, message: '请输入' },
                    { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '可保留两位小数' }
                ],
                discountValue: [
                    { required: true, message: '请输入' },
                    { pattern: /(^[1-9]([0-9]+)?(\.[0-9])?$)|(^(0){1}$)|(^[0-9]\.[0-9]?$)/, message: '可保留一位小数' },
                    {
                        type: 'number',
                        message: '最大值为9.9',
                        transform(value) {
                            return Number(value)
                        },
                        max: 9.9
                    }
                ],
                discountAmount: [
                    { required: true, message: '请输入' },
                    { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '可保留两位小数' }
                ],
                topMoney: [
                    { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '可保留两位小数' }
                ],
                shop_id: [{ required: true, message: '请选择' }],

                startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
                endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
                receive_user: [{ required: true, message: '请选择', trigger: 'change' }],
                use_goods_type: [{ required: true, message: '请选择', trigger: 'change' }],
                tag_ids: [{ required: true, message: '请选择', trigger: 'change' }]
            },
            listLoading: false,
            saveIsClick: false,
            pickerOptions1: {
                disabledDate: time => {
                    if (this.operationForm.endTime !== '') {
                        return time.getTime() > this.operationForm.endTime
                    } else {
                        // return time.getTime() > Date.now();
                    }
                }
            },
            pickerOptions2: {
                disabledDate: time => {
                    return time.getTime() < this.operationForm.startTime
                }
            },
            labelKey: 1,
            labelOptions: [], // 标签下拉列表
            labelCloth: [], // 标签(布)列表
            labelOther: [], // 标签(其它)列表
            label_cloth_list: [],
            label_other_list: [],
            cate_other_list: [], // 其它分类
            cate_group_list: [], // 布组分类
            cateKey: 1,
            categoryData: [],
            goodsData: [],
            tableHeight: 'calc(100vh - 334px)',
            goods_loading: false,
            goodsPage: 1,
            goodsLimit: 10,
            pageTotal: 0,
            tabPosition: 'selected',
            searchParams: {
                goods_name: '',
                cateArr: [],
                skuName: '',
                skuCode: ''
            },
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            imgList: [],
            selectedGoods: [], // 已选中商品id数组
            checkedList: [], // 表格当前选中列表
            couponsDetail: {},
            showTags: [],
            cateLimit: 0, // 分类下总条数
            allLimit: 0, // 全部商品数量
            cateIsAtLast: false, // 最终请求分类商品
            loadingTip: {},
            activeCoupon: [], // 优惠券列表
            ladderIndex: 0, // 阶梯下标
            couponId: 0, // 优惠券id
            couponInTitle: '', // 优惠券标题
            shopId: -1,
            checked_goods_list: [],
            checkedSkuList: [], // 全部阶梯使用的SKU ID集合
            addIds: [], // 单个阶梯已添加sku ID集合
            addGoodsCount: 0,
            activeTab: '1',
            originalRules: [] //  类型为加价购的促销编辑时存储 rules
        }
    },
    watch: {},
    computed: {},
    components: {
        ElImageViewer,
        EmptyList,
        couponList,
        addGoodsPop,
        addSkuPop
    },
    created() {
        if (this.$route.query.status === 'edit') {
            this.operationTitle = '编辑促销'
        } else if (this.$route.query.status === 'copy') {
            this.operationTitle = '复制优惠券'
        } else {
            this.operationTitle = '新增促销'
        }
        this.initData()
    },
    mounted() {},
    methods: {
        formatMoney: formatMoney,
        async initData() {
            const rLoading = this.openLoading()
            let labelAllArr = []
            let cateAllArr = [{ id: -1, name: '布料' }]
            Promise.all([
                queryShopList({}),
                getLabelAllList({ type: 1, display_platform: -1 }),
                getLabelAllList({ type: 2, display_platform: -1 }),
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
                        // 标签（布）
                        if (res[1].data) {
                            const label_cloth = res[1].data
                            this.label_cloth_list = res[1].data
                            this.labelCloth = this.handlerData(label_cloth)
                            if (this.labelCloth.length) {
                                labelAllArr.push({
                                    id: 2,
                                    name: '布',
                                    children: this.labelCloth
                                })
                            }
                        }
                    }
                    if (res[2].code === 200) {
                        // 标签（其它）
                        if (res[2].data) {
                            const label_other = res[2].data
                            this.label_other_list = res[2].data
                            this.labelOther = this.handlerData(label_other)
                            if (this.labelOther.length) {
                                labelAllArr.push({
                                    id: 1,
                                    name: '其它',
                                    children: this.labelOther
                                })
                            }
                        }
                    }
                    if (res[3].code === 200) {
                        // 分类其它
                        if (res[3].data) {
                            this.cate_other_list = res[3].data
                            if (this.cate_other_list.length) {
                                cateAllArr.push({
                                    id: 1,
                                    name: '其它',
                                    children: construct(this.cate_other_list, {
                                        id: 'id',
                                        pid: 'parent_id',
                                        children: 'children'
                                    }).map(item => {
                                        return {
                                            name: item.name,
                                            id: item.id,
                                            children: item.children
                                                ? item.children.map(son => {
                                                      return { name: son.name, id: son.id }
                                                  })
                                                : null
                                        }
                                    })
                                })
                            }
                        }
                    }
                    if (res[4].code === 200) {
                        // 分类其它
                        if (res[4].data) {
                            this.cate_group_list = res[4].data
                            if (this.cate_group_list.length) {
                                cateAllArr.push({
                                    id: 2,
                                    name: '布组',
                                    children: construct(this.cate_group_list, {
                                        id: 'id',
                                        pid: 'parent_id',
                                        children: 'children'
                                    }).map(item => {
                                        return {
                                            name: item.name,
                                            id: item.id,
                                            children: item.children
                                                ? item.children.map(son => {
                                                      return { name: son.name, id: son.id }
                                                  })
                                                : null
                                        }
                                    })
                                })
                            }
                        }
                    }
                    this.labelOptions = labelAllArr
                    this.categoryData = cateAllArr
                    rLoading.close()
                    if (this.operationTitle !== '新增促销') {
                        // 请求促销详情
                        this.getDetail()
                    }
                })
                .catch(() => {})
        },

        // 详情回显
        setDetailInfo(info) {
            this.checkedSkuList = []
            this.$set(this.operationForm, 'type', Number(info.type))
            this.$set(this.operationForm, 'title', info.title)
            this.$set(this.operationForm, 'shop_id', Number(info.shopId))
            this.$set(this.operationForm, 'use_goods_type', Number(info.useGoodsType))
            this.shopId = Number(info.shopId)
            if (info.status == 2) { // 上架
                this.isShelf = true
            } else {
                this.isShelf = false
            }
            if (info.type == 3 || info.type == 4) {
                if (info.topMoney > 0) {  // 封顶优惠
                    this.$set(this.operationForm, 'topMoney', Number(info.topMoney / 100))
                } else {
                    this.$set(this.operationForm, 'topMoney', '')
                }
            }

            if(info.rules && info.rules.length > 0) {
                if(info.type == 1) {
                    this.$set(this.operationForm, 'amount1', info.rules[0].needNum / 100)
                    this.$set(this.operationForm, 'discount1', info.rules[0].subNum / 100)
                } else {
                    let ladder_arr = []
                    info.rules.forEach((ev)=>{
                        let _subNum,_needNum
                        if(info.type == 3 ){
                            _subNum = ev.subNum ? (ev.subNum / 10) : ''
                            _needNum = ev.needNum ? (ev.needNum / 100) : ''
                        } else if(info.type == 4) {
                            _subNum = ev.subNum ? (ev.subNum / 10) : ''
                            _needNum = ev.needNum ? ev.needNum : ''
                        } else {
                            _subNum = ev.subNum ? (ev.subNum / 100) : ''
                            _needNum = ev.needNum ? (ev.needNum / 100) : ''
                        }
                        ladder_arr.push({
                            needNum: _needNum,
                            subNum: _subNum,
                            coupon_id: ev.objId,
                            coupon_title: ev.objName,
                            exchGoodsList: ev.exchGoodsList || [],
                            oldExchange: ev.exchGoodsList && ev.exchGoodsList.length > 0 ? _.cloneDeep(ev.exchGoodsList) : [],
                            showTipIcon: false
                        })
                        if(info.type == 5){
                            ev.exchGoodsList.forEach((sku_item)=>{
                                console.log('sku_item', sku_item)
                                if(this.checkedSkuList.indexOf(sku_item.skuId)){
                                    this.checkedSkuList.push(sku_item.skuId)
                                }
                            })
                        }
                    })
                    this.originalRules = ladder_arr
                    this.$set(this.operationForm, 'ladderList', ladder_arr)
                }
            }
            this.$set(this.operationForm, 'startTime', info.startTime)
            this.$set(this.operationForm, 'endTime', info.endTime)
            if (info.useGoodsType === 3) {
                const all_tags = this.label_cloth_list.concat(this.label_other_list)
                let select_tags = []
                let tags_arr = []
                info.tagIds.forEach(ev => {
                    select_tags.push(ev)
                })
                if (select_tags.length > 0) {
                    select_tags.forEach((event, index) => {
                        this.label_cloth_list.forEach((ev, i) => {
                            if (event === ev.id) {
                                tags_arr.push([2, ev.tag_category_id, ev.id])
                            }
                        })
                        console.log('this.label_other_list', this.label_other_list)
                        this.label_other_list.forEach((ev, i) => {
                            console.log('ev', ev)
                            if (event === ev.id) {
                                tags_arr.push([1, ev.tag_category_id, ev.id])
                            }
                        })
                    })
                }
                console.log('tags_arr', tags_arr)
                this.$set(this.operationForm, 'tag_ids', tags_arr)
                this.setTagsSelect()
            } else if (info.useGoodsType === 2) {
                this.tabPosition = 'selected'
                this.selectedGoods = info.goodsIds
                this.getListData()
            }
        },

        // 获取详情
        getDetail() {
            return new Promise((resolve, reject) => {
                let id = this.$route.query.id
                if (!id) {
                    return
                }
                let params = { promotionId: Number(id) }
                queryPromotionDetail(params)
                    .then(async res => {
                        let data = _.cloneDeep(res.data)
                        // 详情回显
                        this.setDetailInfo(data)
                    })
                    .catch(err => {
                        // reject(err.data)
                    })
            })
        },
        // 切换类型
        chooseCouponsType() {
            this.$set(this.operationForm, 'amount1', '')
            this.$set(this.operationForm, 'discount1', '')
            const _obj = {
                needNum: '',
                subNum: '',
                coupon_title: '',
                coupon_id: 0,
                objId: 0,
                exchGoodsList: [],
                oldExchange:[],
                showTipIcon: false
            }
            this.$set(this.operationForm, 'ladderList', [_obj])
            this.$nextTick(() => {
                this.$refs['operationForm'].clearValidate() // 清除验证
            })
        },

        // 保存
        handleSave() {
            this.$refs['operationForm'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    const Type = Number(this.operationForm.type)
                    let params = {
                        type: Type,
                        title: this.operationForm.title,
                        shopId: Number(this.operationForm.shop_id),
                        topMoney: 0,
                        useGoodsType: Number(this.operationForm.use_goods_type),
                        goodsIds: [],
                        excSkuIds: [],
                        tagIds: []
                    }
                    let type_list = []
                    if (Type == 1) {
                        let _obj = {
                            needNum: commUtil.numberMul(Number(this.operationForm.amount1), 100),
                            subNum: commUtil.numberMul(Number(this.operationForm.discount1), 100),
                            objId: 0,
                            objName: '',
                            exchGoodsList: []
                        }
                        type_list.push(_obj)
                    } else {
                        this.operationForm.ladderList.forEach((item,i)=>{
                            let _needNum = 0,
                                _subNum = 0,
                                _objId = 0,
                                _objName = '',
                                _exchangeGoodsList = []
                            _needNum = commUtil.numberMul(Number(item.needNum), 100)
                            if (Type == 6){
                                _objId = item.coupon_id
                                _objName = item.coupon_title
                            } else if(Type == 3) {
                                _subNum = commUtil.numberMul(Number(item.subNum), 10)
                            } else if(Type == 4) {
                                _needNum = Number(item.needNum)
                                _subNum = commUtil.numberMul(Number(item.subNum), 10)
                            } else {
                                _subNum = commUtil.numberMul(Number(item.subNum), 100)
                            }
                            if(Type == 5) {
                                if(i > 0){
                                    _needNum = commUtil.numberMul(Number(this.operationForm.ladderList[0].needNum ), 100)
                                }
                                _exchangeGoodsList = item.exchGoodsList
                            }
                            let _obj = {
                                needNum: _needNum,
                                subNum: _subNum,
                                objId: _objId,
                                objName: _objName,
                                exchGoodsList: _exchangeGoodsList
                            }
                            type_list.push(_obj)
                        })
                    }
                    if(type_list.length < 1) {
                        this.$notify({
                            title: '最少创建一个阶梯',
                            message: '',
                            type: 'error',
                            duration: 3000
                        })
                        return;
                    }
                    let need_arr = [],
                        sub_arr = []
                    type_list.forEach((ev)=>{
                        if(need_arr.indexOf(ev.needNum) == -1) {
                            need_arr.push(ev.needNum)
                        }
                        if(sub_arr.indexOf(ev.subNum) == -1) {
                            sub_arr.push(ev.subNum)
                        }
                    })
                    if(type_list.length != need_arr.length && Type != 5){
                        this.$notify({
                            title: '存在重复阶梯,请修改后再保存',
                            message: '',
                            type: 'error',
                            duration: 3000
                        })
                        return;
                    } else {
                        type_list = type_list.sort((a, b) => a.needNum - b.needNum)
                    }

                    if(Type == 5 && type_list.length != sub_arr.length){
                        // 下方统一报错
                    } else if(Type == 5 && type_list.length == sub_arr.length){
                        type_list = type_list.sort((a, b) => a.subNum - b.subNum)
                    }
                    if (Type == 5) {
                        let err_num = 0
                        type_list.forEach((ev)=>{
                            if(ev.exchGoodsList.length < 1){
                                err_num++
                            }
                        })
                        if(err_num > 0){
                            this.$notify({
                                title: '每个阶梯最少添加一个换购品',
                                message: '',
                                type: 'error',
                                duration: 3000
                            })
                            return
                        }
                    }

                    console.log('type_list', type_list)
                    if(Type > 1) {
                        let _list = []
                        type_list.forEach((ev)=>{
                            const _obj = {
                                needNum: Type == 4 ? ev.needNum : Number(ev.needNum/100),
                                subNum: (Type == 3 || Type == 4) ? Number(ev.subNum/10) : Number(ev.subNum/100),
                                coupon_id: ev.objId,
                                coupon_title: ev.objName,
                                exchGoodsList: ev.exchGoodsList
                            }
                            console.log('_obj', _obj)
                            _list.push(_obj)
                        })
                        console.log('_list', _list)
                        this.$set(this.operationForm,'ladderList',_list)
                        // 优惠额度、折扣金额、加价金额重复
                        if((type_list.length != sub_arr.length) && Type < 6) {
                            let msg = ''
                            if (Type == 3 || Type == 4) {
                                msg = '折扣额度存在重复,请修改后再保存'
                            } else if (Type == 2) {
                                msg = '优惠金额存在重复,请修改后再保存'
                            } else if (Type == 5) {
                                msg = '加价金额存在重复,请修改后再保存'
                            }
                            this.$notify({
                                title: msg,
                                message: '',
                                type: 'error',
                                duration: 3000
                            })
                            return;
                        }

                        let subNumArr = [],
                            sortSubNumArr = []
                        type_list.forEach((ev)=>{
                            subNumArr.push(ev.subNum)
                        })

                        console.log('subNumArr', subNumArr)
                        if(Type == 3 || Type == 4) {
                            sortSubNumArr = _.cloneDeep(subNumArr).sort((a, b) => b - a)
                        } else {
                            sortSubNumArr = _.cloneDeep(subNumArr).sort((a, b) => a - b)
                        }
                        console.log('sortSubNumArr', sortSubNumArr)
                        // 优惠额度、折扣金额、加价金额重复 大小顺序不正确
                        if ((JSON.stringify(subNumArr) != JSON.stringify(sortSubNumArr)) && Type < 6) {
                            let msg = ''
                            if (Type == 3 || Type == 4) {
                                msg = '折扣额度应逐阶梯减小,请修改后再保存'
                            } else if (Type == 2) {
                                msg = '优惠金额应逐阶梯增加,请修改后再保存'
                            } else if (Type == 5) {
                                msg = '加价金额应逐阶梯增加,请修改后再保存'
                            }
                            this.$notify({
                                title: msg,
                                message: '',
                                type: 'error',
                                duration: 3000
                            })
                            return;
                        }

                    }

                    if (Type == 3 || Type == 4) { // 折扣
                        if(this.operationForm.topMoney) {
                            params['topMoney'] = commUtil.numberMul(Number(this.operationForm.topMoney), 100) // 封顶优惠
                        }
                    }

                    if (this.operationForm.use_goods_type === 3) {
                        let _list = []
                        if (this.operationForm.tag_ids.length) {
                            this.operationForm.tag_ids.forEach(ev => {
                                _list.push(ev[2])
                            })
                        }
                        if (_list.length > 0) {
                        } else {
                            this.$notify({
                                title: '请选择标签',
                                message: '',
                                type: 'warning',
                                duration: 5000
                            })
                            return
                        }
                        params['tagIds'] = _list
                    }
                    if (this.operationForm.use_goods_type === 2) {
                        if (this.selectedGoods.length > 0) {
                            params['goodsIds'] = this.selectedGoods
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
                    // 促销时间
                    let grant_start = this.getTime(this.operationForm.startTime)
                    let grant_end = this.getTime(this.operationForm.endTime)
                    grant_start = new Date(grant_start)
                    grant_end = new Date(grant_end)
                    params['startTime'] = grant_start.getTime() / 1000
                    params['endTime'] = grant_end.getTime() / 1000
                    params['rules'] = type_list
                    if(this.$route.query.id) {
                        params['id'] = Number(this.$route.query.id)
                        this.queryAddOrEdit(params, 'edit')
                    } else {
                        this.queryAddOrEdit(params, 'add')
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
                path: 'mall-backend-sales-promotion'
            })
        },

        // 请求 -- 促销 添加、编辑
        queryAddOrEdit(params, type) {
            const rLoading = this.openLoading()
            let that = this
            editPromotion(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        that.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        bus.$emit('refreshPromotionList', type);
                        setTimeout(()=>{
                            bus.$emit('close_current_tags')
                            that.$router.push({
                                path: 'mall-backend-sales-promotion'
                            }).then(r => {})
                        },1000)
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

        getTimeLe(val) {},

        getTimeGe(val) {},

        // 可用商品类型类型
        useGoodsTypeChange() {
            if (Number(this.operationForm.use_goods_type) === 2) {
                // this.getListData()
            }
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
            this.$refs.goodsList.show()
        },

        // 添加该分类
        handleAddCate() {
            this.addOrDelCate('add')
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
                    this.getGoodsListTotal(type, cate_id, 'cate')
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

        // 移除全部/搜索
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
            // 如果是添加获取 未添加列表 如果是删除 获取已添加列表
            let params = {
                page: 1,
                limit: 10,
                goods_name: goods_name,
                category_id: cate_id,
                goods_ids: [],
                not_goods_ids: []
            }
            if(type == 'add') {
               params['not_goods_ids'] = this.selectedGoods
            } else {
                params['goods_ids'] = this.selectedGoods
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
                                this.getAllOrCateGoods(goods_name, type, cate_id, str)
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
                            let old_list = _.cloneDeep(this.selectedGoods)
                            this.selectedGoods = [...old_list, ...new_goods_list]
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
                            let new_arr = _.cloneDeep(this.selectedGoods)
                            new_arr = new_arr.filter(function(item) {
                                return new_goods_list.indexOf(item) == -1
                            })
                            this.selectedGoods = new_arr
                            tipText = "已移除"
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
                goods_name: name,
                category_id: cate_id,
                goods_ids: [],
                not_goods_ids: []
            }
            if(type == 'add') {
                params['not_goods_ids'] = this.selectedGoods
            } else {
                params['goods_ids'] = this.selectedGoods
            }
            queryCouponGoodsList(params)
                .then(res => {
                    this.imgList = []
                    this.previewIndex = 0
                    if (res.code === 200) {
                        if (res.data) {
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

        // 商品列表-已添加
        getListData() {
            let cateId = this.backCateId()
            let params = {
                page: this.goodsPage,
                limit: this.goodsLimit,
                goods_name: this.searchParams.goods_name,
                category_id: cateId,
                goods_ids: this.selectedGoods
            }
            if (this.selectedGoods.length > 0) {
                params['goods_ids'] = this.selectedGoods
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

        // 标签选中变化
        tagsChange(val) {
            this.setTagsSelect()
        },

        setTagsSelect() {
            let show_tags = []
            // 标签(布)列表 labelCloth 标签(其它)列表 labelOther
            let all_Label = [...this.label_cloth_list, ...this.label_other_list]
            all_Label.forEach(ev => {
                this.operationForm.tag_ids.forEach(item => {
                    if (ev.id === item[2]) {
                        show_tags.push(ev)
                    }
                })
            })
            this.showTags = show_tags
        },
        // 删除标签 （可用商品 - 指定标签）
        delTags(tag, index) {
            let new_tag = _.cloneDeep(this.operationForm.tag_ids)
            new_tag.forEach((item, i) => {
                if (tag.id === item[2]) {
                    new_tag.splice(i, 1)
                }
            })
            this.$set(this.operationForm, 'tag_ids', new_tag)
            this.setTagsSelect()
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

        // 按钮 - 添加阶梯
        handleAddLadder() {
            this.operationForm.ladderList.push({
                needNum: '',
                subNum: '',
                coupon_title: '',
                coupon_id: 0,
                objId: 0,
                exchGoodsList: [],
                oldExchange:[],
                showTipIcon: false
            });
        },

        // 按钮 - 删除单个优惠阶梯
        removeSingleGood(item, index) {
            const del_amount = 'ladderList.' + index + '.needNum';
            const del_discount = 'ladderList.' + index + '.subNum';
            this.$refs.operationForm.clearValidate(del_amount);
            this.$refs.operationForm.clearValidate(del_discount);
            this.operationForm.ladderList.splice(index,1);
        },
        // 选择优惠券
        selectCoupons(item, index) {
            this.ladderIndex = index
            if(item.coupon_title && item.coupon_id > 0){
                this.couponId = item.coupon_id
                this.couponInTitle = item.coupon_title
            } else {
                this.couponId = 0
                this.couponInTitle = ''
            }
            this.$refs.couponList.show()
        },
        // 确定选择优惠券
        getCoupon(coupon) {
            this.activeCoupon = []
            this.activeCoupon.push(coupon)
            if(coupon.id) {
                this.couponInTitle = coupon.title
                this.couponId = coupon.id
                this.operationForm.ladderList[this.ladderIndex].coupon_title = coupon.title
                this.operationForm.ladderList[this.ladderIndex].coupon_id = coupon.id
            }
        },
        // 选择店铺切换
        chooseShop() {
            console.log('店铺切换')
            this.shopId = Number(this.operationForm.shop_id)
            if (this.operationForm.type == 5 && this.operationForm.ladderList && this.operationForm.ladderList.length > 0) {
                const _obj = {
                    needNum: '',
                    subNum: '',
                    coupon_title: '',
                    coupon_id: 0,
                    objId: 0,
                    exchGoodsList: [],
                    oldExchange:[],
                    showTipIcon: false
                }
                this.$set(this.operationForm, 'ladderList', [_obj])
                this.$nextTick(() => {
                    this.$refs['operationForm'].clearValidate() // 清除验证
                })
            }
        },
        // 添加换购品
        AddSwapGoods(item,index) {
            console.log('item', item)
            //
            if (this.operationForm.shop_id) {
                console.log('this.operationForm.shop_id', this.operationForm.shop_id)
            } else {
                this.$notify({
                    title: '请先选择店铺',
                    message: '',
                    type: 'warning',
                    duration: 3000
                })
                return
            }
            if(item.exchGoodsList.length > 0){
                this.addIds = item.exchGoodsList.map(item=>{return item.skuId})
            } else {
                this.addIds = []
            }
            this.ladderIndex = index
            this.$refs.skuList.show()
        },

        // 确定添加换购商品
        getAddSku(sku_arr){
            const sku_ids = sku_arr.map(item=>{return item.sku_id})
            sku_ids.forEach((item)=>{
                if(this.checkedSkuList.indexOf(item) == -1){
                    this.checkedSkuList.push(item)
                }
                if(this.addIds.indexOf(item) == -1){
                    this.addIds.push(item)
                }
            })

            let ids = []
            let _exchGoodsList = this.operationForm.ladderList[this.ladderIndex].exchGoodsList
            if(this.operationForm.ladderList[this.ladderIndex].exchGoodsList.length > 0){
                ids = this.operationForm.ladderList[this.ladderIndex].exchGoodsList.map(item=>{return item.skuId})
            }

            sku_arr.forEach((ev)=>{
                if(ids.indexOf(ev.id) == -1){
                    _exchGoodsList.push({
                        skuId: ev.sku_id,
                        goodsId: ev.goods_id,
                        shopSkuId: ev.id,
                        shopGoodsId: ev.shop_goods_id
                    })
                }
            })
            this.$set(this.operationForm.ladderList[this.ladderIndex], 'exchGoodsList', _exchGoodsList)

            this.setExchangeTipShow()
            this.$notify({
                title: '添加成功，可点击已添加列表查看',
                message: '',
                type: 'success',
                duration: 3000
            })
        },

        // 移除换购商品
        getDelSku(list) {
            let _exchGoodsList = this.operationForm.ladderList[this.ladderIndex].exchGoodsList
            _exchGoodsList.forEach((ev)=>{
                list.forEach(item=>{
                    if(ev.skuId == item.skuId){
                        ev['goodsId'] = -1
                    }
                })
            })
            const new_exchGoodsList = _exchGoodsList.filter(item=>{return item.goodsId != -1})
            this.$set(this.operationForm.ladderList[this.ladderIndex], 'exchGoodsList', new_exchGoodsList)
            // 重新设置 checkedSkuList、
            let _checkedSkuList = []
            this.operationForm.ladderList.forEach((ev)=>{
                _checkedSkuList = _checkedSkuList.concat(ev.exchGoodsList)
            })
            this.checkedSkuList = _checkedSkuList.map(item=>{return item.skuId})
            this.addIds = this.operationForm.ladderList[this.ladderIndex].exchGoodsList.map(item=>{return item.skuId})

            this.$notify({
                title: '移除成功，可从未添加列表添加',
                message: '',
                type: 'success',
                duration: 3000
            })
            this.setExchangeTipShow()
        },

        setExchangeTipShow() {
            if(this.operationTitle === '编辑促销'){
                this.operationForm.ladderList.forEach((ev)=>{
                    let now_list = [],
                        new_list = []
                    console.log('ev.oldExchange', ev.oldExchange)
                    console.log('ev.exchGoodsList', ev.exchGoodsList)
                    if(ev.exchGoodsList.length > 0){
                        now_list = ev.exchGoodsList.map(item=>{return item.skuId}).sort()
                    }
                    if(ev.oldExchange.length > 0){
                        new_list = ev.oldExchange.map(item=>{return item.skuId}).sort()
                    }
                    if(JSON.stringify(now_list) == JSON.stringify(new_list)){
                        ev['showTipIcon'] = false
                    } else {
                        ev['showTipIcon'] = true
                    }
                })
                console.log('ladderList', this.operationForm.ladderList)
            }
        },

        // 单个添加、添加选中
        handleAddGoods(data){
            this.addOrDelSuccess(data,'add')
        },

        // 添加分类
        handleAddCateGoods(data) {
            this.loadingTip = this.uploadLoading('加载中')
            this.getGoodsListTotal(data.goods_name,'add', data.cate_id, 'cate')
        },
        // 添加全部、搜索商品
        handleAddAllGoods(data){
            this.loadingTip = this.uploadLoading('加载中')
            this.getGoodsListTotal(data.goods_name,'add', data.cate_id, 'all')
        },
    }
}
