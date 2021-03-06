import { creatGoods, queryAttrList, queryShopList, queryGoodsDetail, updateGoods, queryCategoryListAll, queryStoreProductDetail } from '@/api/goods'
import { queryConfigList } from '@/api/configManagement'
import { queryFreightList } from '@/api/freight'
import { getLabelAllList } from '@/api/goodsLabel'
import { formatMoney } from '@/plugin/tool'
import { getToken } from '@/utils/auth'
import { queryDetailTemplateList } from '@/api/teamwork'
import { ATTR, ATTR_NAME } from '@/plugin/constant'
import storeProductList from '@/components/common/store-product-list/StoreProductList'
import vTagPicker from '@/components/common/TagPicker.vue'
import ElImageViewer from '@/components/common/image-viewer'
import bus from '@/components/common/bus'
import commUtil from '@/utils/commUtil'
import { construct } from '@/utils/json-tree'
import Editor from '@/components/common/editor/Editor'

export const mixinsGoods = {
    data() {
        return {
            ATTR_NAME,
            header: {},
            tableKey: 0,
            imgVedio: require('../../assets/img/vedio.png'),
            btnLoading: false,
            dialogVisible: false,
            dialogImageUrl: '',
            dialogViewType: '',
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: '',
            timg: [],
            tfile: [],
            rules: {
                imgs: [{ required: true, message: '请上传图片', trigger: 'blur' }],
                title: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
                ],
                display_sales: [
                    { required: true, message: '请输入销量', trigger: 'blur' },
                    { type: 'number', message: '请输入数字' }
                ],
                freight_id: [{ required: true, message: '请选择运费模板', trigger: 'blur' }],
                category_id: [{ required: true, message: '请选择分类', trigger: 'blur' }]
                // shelvesTime: [{ required: true, message: '请选择时间', trigger: 'blur' }]
                // allow_shop_ids: [{ required: true, message: '请选择代理', trigger: 'blur' }]
            },
            rulesTime: [{ required: true, message: '请输入内容', trigger: 'blur' }],
            rulesRequired: [{ required: true, message: '请输入内容', trigger: 'blur' }],
            rulesPrice: [
                { required: true, message: '请输入价格', trigger: 'blur' },
                {
                    type: 'number',
                    message: '请输入正确的价格',
                    transform(value) {
                        return Number(value)
                    },
                    min: 0.01
                }
            ],
            rulesStock: [
                { required: true, message: '请输入库存', trigger: 'blur' },
                {
                    type: 'number',
                    message: '请输入正确的库存',
                    transform(value) {
                        return Number(value)
                    },
                    min: 0
                }
            ],
            rulesInt: [
                { required: true, message: '请输入内容', trigger: 'blur' },
                {
                    type: 'integer',
                    message: '请输入非零整数',
                    transform(value) {
                        return Number(value)
                    },
                    min: 1
                }
            ],
            basicAttr: [], //固定属性
            consumeAttr: [], //自定义属性
            basicChecked: [], //固定属性 checkbox list
            consumeChecked: [], //自定义属性 checkbox list
            attrDiyList: [], //选中的自定义属性
            categoryData: [], // 分类下拉数据
            // 类型 1 布料  2其他 3成品布
            typeList: [
                { value: 1, label: '布料' },
                { value: 2, label: '其他' },
                { value: 3, label: '布组' }
            ],
            freightList: [], //运费模板列表
            shopList: [], //指定店铺列表
            // 标签选择
            dialogVisibleTag: false,
            // 布料/其他 类型选择
            dialogVisibleType: false,
            options: {},
            miniProgramTags: [],
            backendTags: [],
            startDatePicker: this.beginDate(), //定时上下架配置
            editContent: '', //编辑状态 初始文章
            content: '',
            goods: {
                title: '', //商品名称 maxlength =200
                imgs: [
                    //商品图片列表
                    // {
                    //     img_url: 'https://storehouse-upyun.chuanshui.cn/2020-08-19/0rY89WZdNBm4BDlN/386ZRRCVeHfzZLict3TqmgwmK0oevpqE.jpg',
                    //     type: 1, //1 图片 2视频
                    //     sort: 123 //排序 倒叙
                    // },
                    // {
                    //     img_url: 'https://storehouse-upyun.chuanshui.cn/2020-08-19/0rY89WZdNBm4BDlN/386ZRRCVeHfzZLict3TqmgwmK0oevpqE.jpg',
                    //     type: 1,
                    //     sort: 124
                    // }
                ],
                type: 1, //'类型：1布；2其他; 3成品布',
                tag_ids: '', //标签id，多个id ","逗号隔开
                tag_idsArray: [], //标签id数组 暂存
                category_id: '', //分类
                categoryCache: [], //分类 暂存
                consume_attr_ids: [], //属性ids 数量最多为3 最少为1
                is_allow_agent: 2, //是否所有代理可以销售：1指定代理；2所有代理可以销售；是否分销
                allow_shop_ids: [], //允许的店铺id
                display_sales: 0, //Math.floor(Math.random() * 100) + 1, //展示的销量
                status: 2, //1下架；2上架
                freight_id: '', //运费模版id
                set_time_status: 2, //定时上下架状态 1 设置 2 未设置
                // shelvesTime: [], //定时上下架时间 暂存
                set_time_on: '', //定时上架时间时间戳
                set_time_off: '', //定时下架时间时间戳
                sku_list: [
                    // {
                    //     storehouse_pid: 84, //所选的仓库产品id
                    //     title: '这是sku title', //sku名称 maxlenth =200
                    //     min_price: 1000, //最低价格 单位分
                    //     display_price: 2000, //展示价格 单位分
                    //     sku_img: 'https://storehouse-upyun.chuanshui.cn/2020-08-19/0rY89WZdNBm4BDlN/386ZRRCVeHfzZLict3TqmgwmK0oevpqE.jpg',
                    //     stock_warning: 9, //库存预警
                    //     attr_brand: '品牌',
                    //     attr_color: '颜色',
                    //     attr_material: '材质',
                    //     attr_unit: '米',
                    //     attr_pattern: '花纹',
                    //     status: 2, //1下架；2上架
                    //     tag_names: [1, 2],
                    //     attrDiyValue: ['', '', ''],
                    //     attr_list: [
                    //         //选择的sku展示的sku属性
                    //         {
                    //             attr_id: 8, //属性id
                    //             attr_title: '款式', //属性名称
                    //             attr_value: '这是款式' //属性值
                    //         },
                    //         {
                    //             attr_id: 1,
                    //             attr_title: '品牌',
                    //             attr_value: '一家'
                    //         },
                    //         {
                    //             attr_id: 2,
                    //             attr_title: '颜色',
                    //             attr_value: '蓝色'
                    //         }
                    //     ]
                    // }
                ]
            },

            // list: null,
            listLoading: false,

            // 视频播放
            playerOptions: {
                playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
                autoplay: false, //如果true,浏览器准备好时开始回放。
                muted: false, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [
                    {
                        type: '',
                        src: 'http://vjs.zencdn.net/v/oceans.mp4' //url地址
                        // src: "" //url地址
                    }
                ],
                poster: '', //你的封面地址
                // width: document.documentElement.clientWidth,
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                controlBar: {
                    timeDivider: true,
                    durationDisplay: true,
                    remainingTimeDisplay: false,
                    fullscreenToggle: true //全屏按钮
                }
            },
            // 设置会员弹框
            dialogVisibleCreat: false,
            discountValue: '',
            discountRow: '',
            importDialogShow: false,
            templateList: [],
            detailTemplateId: null
        }
    },
    watch: {
        'goods.type': {
            handler(newVal, oldVal) {
                this.tableKey++ // 为了保证table 每次都会重渲
            },
            deep: true,
            immediate: true
        },

        consumeChecked() {
            this.tableKey++ // 为了保证table 每次都会重渲
        },
        basicChecked() {
            this.tableKey++ // 为了保证table 每次都会重渲
        }
    },
    computed: {
        pickerTag: function() {
            return this.miniProgramTags.concat(this.backendTags)
        }
        // 动态生成验证规则 blank_rule空规则,初始化要有值才能正确初始化
        // shelvesTime: function() {
        //     return this.goods.set_time_status == 2 ? 'blank_rule' : 'shelvesTime'
        // }
    },

    components: {
        storeProductList,
        vTagPicker,
        ElImageViewer,
        Editor
    },
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
    },
    mounted() {
        let id = this.$route.query.id
        if (!id) {
            this.dialogVisibleType = true
        } else {
            this.initData()
        }
    },
    methods: {
        formatMoney: formatMoney,

        async initData() {
            const rLoading = this.openLoading()
            if (this.$route.query.id) {
                await this.getDetail()
            }

            Promise.all([
                getLabelAllList({
                    type: this.goods.type == 2 ? 2 : 1,
                    display_platform: 1
                }),
                getLabelAllList({
                    type: this.goods.type == 2 ? 2 : 1,
                    display_platform: 2
                }),
                queryFreightList({ type: 1 }),
                queryAttrList(),
                queryShopList(),
                queryCategoryListAll({ type: this.goods.type == 2 ? 1 : 2 }),
                queryConfigList({})
            ])
                .then(res => {
                    let options = {}
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            options.backendTags = res[0].data
                        }
                    }
                    if (res[1].code === 200) {
                        if (res[1].data) {
                            options.miniProgramTags = res[1].data
                        }
                    }
                    this.options = options
                    if (res[2].code === 200) {
                        this.freightList = res[2].data
                        // 新建默认选中默认的运费模板
                        if (!this.goods.goods_id) {
                            let defaultFreight = this.freightList.find(item => item.is_default == 2)
                            this.goods.freight_id = defaultFreight ? defaultFreight.id : ''
                        }
                    }
                    if (res[3].code === 200) {
                        this.basicAttr = res[3].data.consume_attr_basic_attr
                        // 其他只显示品牌 单位两个属性
                        if (this.goods.type == 1) {
                            this.basicAttr = this.basicAttr.filter(item => {
                                return (item.id <= 6 && item.id != 4) || item.id == 11
                            })
                        } else if (this.goods.type == 2) {
                            this.basicAttr = this.basicAttr.filter(item => {
                                return item.id == 1 || item.id == 11
                            })
                        } else if (this.goods.type == 3) {
                            this.basicAttr = this.basicAttr.filter(item => {
                                return item.id == 1 || item.id == 7 || item.id == 9 || item.id == 11
                            })
                        }
                        this.consumeAttr = res[3].data.consume_attr
                        console.log('输出 ~ this.consumeAttr', this.consumeAttr)
                    }
                    if (res[4].code === 200) {
                        this.shopList = res[4].data
                    }
                    if (res[5].code === 200) {
                        this.categoryData = construct(res[5].data, {
                            id: 'id',
                            pid: 'parent_id',
                            children: 'children'
                        }).map(item => {
                            return {
                                label: item.name,
                                value: item.id,
                                children: item.children ? item.children.map(son => ({ label: son.name, value: son.id })) : []
                            }
                        })
                        // 其他分类
                    }
                    if (res[6].code === 200) {
                        // 新建时默认填写库存预警
                        let stockWarn = res[6].data.find(item => item.config_key == 'SYS_STOCK_WARNGING')
                        this.stockWarn = Number(stockWarn.value)
                    }
                    rLoading.close()
                })
                .catch(() => {
                    rLoading.close()
                })
        },
        setCellColor({ row, column, rowIndex, columnIndex }) {
            // if (this.basicChecked == 0) {
            //     return;
            // }
            for (let i = 0; i < this.basicChecked.length; i++) {
                const element = this.basicChecked[i]
                if (column.property == element) {
                    return 'background: #e7f4ff;'
                }
            }
            for (let i = 0; i < this.consumeChecked.length; i++) {
                const element = this.consumeChecked[i]
                if (column.property == element) {
                    return 'background: #e7f4ff;'
                }
            }
        },
        // 定时上下架配置
        beginDate() {
            let self = this
            return {
                disabledDate(time) {
                    let start = new Date(new Date().toLocaleDateString())
                    let end = new Date(new Date().toLocaleDateString())
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
                    end.setTime(end.getTime() + 3600 * 1000 * 24 * 20)
                    return time.getTime() <= start || time.getTime() >= end //开始时间不选时，最小值为今天
                }
            }
        },

        // 编辑获取详情
        getDetail() {
            return new Promise((resolve, reject) => {
                let id = this.$route.query.id
                if (!id) {
                    return
                }
                let params = {
                    goods_id: Number(id)
                }
                queryGoodsDetail(params)
                    .then(async res => {
                        // this.goods = res.data;
                        let data = _.cloneDeep(res.data)
                        // 详情
                        this.editContent = data['detail']
                        // format 标签
                        // data.tag_detail_list
                        //display_platform,//展示平台1 后台 2 小程序' 不搜索-1,
                        //type-1    // '类型 1布料 2其他' 不搜索-1,
                        let tagListBack = await getLabelAllList({
                            type: data.type,
                            display_platform: 1
                        })
                        let tagListMiniApp = await getLabelAllList({
                            type: data.type,
                            display_platform: 2
                        })
                        data['categoryCache'] = data['category_id'] == 0 ? '' : data['category_id']
                        data['tag_detail_list'] = data['tag_detail_list'] == null ? [] : data['tag_detail_list']
                        data['allow_shop_ids'] = data['allow_shop_ids'] == null ? [] : data['allow_shop_ids']
                        for (let i = 0; i < data['tag_detail_list'].length; i++) {
                            const tagId = data['tag_detail_list'][i].tag_id
                            let findTag = tagListBack.data.find(item => tagId == item.id)
                            if (findTag) {
                                this.backendTags.push({
                                    id: findTag.id,
                                    label: findTag.name
                                })
                                continue
                            }
                            findTag = tagListMiniApp.data.find(item => tagId == item.id)
                            if (findTag) {
                                this.miniProgramTags.push({
                                    id: findTag.id,
                                    label: findTag.name
                                })
                            }
                        }
                        // 排序
                        data.imgs = data.imgs.sort((a, b) => a.sort - b.sort)
                        // format 图片
                        data.imgs = data.imgs.map(item => {
                            return {
                                url: item.type == 2 ? this.imgVedio : item.img_url,
                                vedioUrl: item.type == 2 ? item.img_url : null,
                                type: item.type
                            }
                        })

                        this.timg.push(data.imgs[0])
                        data.imgs.splice(0, 1)
                        this.tfile = data.imgs
                        // format attr_list 及价格 字段名  sku_title=>title store_house_id=>storehouse_pid sku_status=>status
                        for (let i = 0; i < data['sku_list'].length; i++) {
                            const skuItem = data['sku_list'][i]
                            skuItem.min_price = skuItem.min_price / 100
                            skuItem.display_price = skuItem.display_price / 100
                            skuItem['attrDiyValue'] = ['', '', '']
                            skuItem['storehouse_pid'] = skuItem['store_house_id']
                            skuItem['storehouse_code'] = skuItem['store_house_code']
                            skuItem['title'] = skuItem['sku_title']
                            skuItem['status'] = skuItem['sku_status']
                            skuItem['user_discount'] = commUtil.numberMul(Number(skuItem['user_discount']), 0.1) || 0
                            const attrList = skuItem['sku_attr_list']
                            let diyAttrIndex = 0
                            for (let j = 0; j < attrList.length; j++) {
                                const attrItem = attrList[j]
                                if (i == 0) {
                                    if (attrItem.attr_id <= 9 || attrItem.attr_id == 11) {
                                        this.basicChecked.push(attrItem.attr_id)
                                    } else {
                                        this.attrDiyList.push({
                                            id: attrItem.attr_id,
                                            title: attrItem.attr_title
                                        })
                                        this.consumeChecked.push(attrItem.attr_id)
                                    }
                                }

                                if (attrItem.attr_id > 9 && attrItem.attr_id != 11) {
                                    skuItem['attrDiyValue'][diyAttrIndex] = attrItem.attr_value
                                    diyAttrIndex++
                                }
                            }
                        }

                        this.goods = data
                        resolve(data)
                    })
                    .catch(err => {
                        reject()
                    })
            })
        },

        // 删除 children为空的元素
        deleteNullChildren(arr) {
            let childs = arr
            for (let i = childs.length; i--; i > 0) {
                if (childs[i].children) {
                    if (childs[i].children.length) {
                        this.deleteNullChildren(childs[i].children)
                    } else {
                        delete childs[i].children
                    }
                }
            }
            return arr
        },
        // 格式化分类数据
        processCateData(data) {
            let dealOptions = []
            // 给每个数据加children属性
            data.forEach((ev, one) => {
                ev.children = []
            })
            data.forEach((ev, one) => {
                let findIndex = data.findIndex(item => item.id === ev.parent_id)
                if ((!ev.parent_id && ev.parent_id !== 0 && ev.parent_id !== false) || findIndex === -1) {
                    dealOptions.push(ev)
                } else {
                    data[findIndex].children.push(ev)
                }
            })
            return dealOptions
        },
        handleCheckedBasic(value) {
            let length = this.consumeChecked.length + this.basicChecked.length
            if (length > 3) {
                this.basicChecked.splice(this.basicChecked.indexOf(value), 1)
                this.$notify({
                    title: '最多只能选择3个展示属性哦~',
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
            }
        },

        handleConsumeBasic(value) {
            let length = this.consumeChecked.length + this.basicChecked.length
            if (length > 3) {
                this.consumeChecked.splice(this.consumeChecked.indexOf(value), 1)
                this.$notify({
                    title: '最多只能选择3个展示属性哦~',
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
            } else {
                this.attrDiyList = this.consumeChecked.map(item => {
                    let myAttr = this.consumeAttr.find(attr => {
                        return item == attr.id
                    })
                    return myAttr
                })
            }
        },
        getSku(pList) {
            // this.goods.sku_list = pList;
            // for (let i = 0; i < pList.length; i++) {
            //     const pItem = pList[i];
            //     let index = this.goods.sku_list.findIndex(item => pItem.storehouse_pid == item.storehouse_pid);
            //     if (index != -1) {
            //         pList.splice(index, 1);
            //         i--;
            //     }
            // }
            for (let i = 0; i < this.goods.sku_list.length; i++) {
                const skuItem = this.goods.sku_list[i]
                let index = pList.findIndex(item => skuItem.storehouse_pid == item.storehouse_pid)
                if (index != -1) {
                    pList.splice(index, 1)
                }
            }
            for (let j = 0; j < pList.length; j++) {
                const element = pList[j]
                element.stock_warning = this.stockWarn
                element.stock_sell = 1
                element.stock_num = 1
            }
            this.goods.sku_list = this.goods.sku_list.concat(pList)
            // this.setTimg();
        },

        addSku() {
            this.$refs.productList.show()
        },
        // 删除sku
        deleteSku(index) {
            this.goods.sku_list.splice(index, 1)
        },
        // 设为主商品
        setFirsetSku(row, index) {
            this.goods.sku_list.unshift(row)
            this.goods.sku_list.splice(index + 1, 1)
            this.setTimg()
        },
        // 生成首图 以及标题
        setTimg() {
            let firstSku = this.goods.sku_list[0]
            this.timg = [{ url: firstSku.sku_img }]
            this.goods.title = firstSku.title
        },
        // sku上下架
        setSkuStatus(row, status, index) {
            if (row.stock_available == 0 && status == 1) {
                this.$notify({
                    title: '可用库存为0,不能上架',
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            status = status == 1 ? 2 : 1
            this.$set(this.goods.sku_list[index], 'status', status)
        },

        // 图片上传前检测 sku
        beforeUploadSku(file) {
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
        // 单张图片上传成功回调 sku
        uploadImgSuccessSku(response, file, fileList, row) {
            // this.$refs.upload.clearFiles() //去掉文件列表
            if (response.code === 200) {
                this.$notify({
                    title: '替换成功',
                    message: '',
                    type: 'success',
                    duration: 500
                })
                this.upload_loading.close()
                row.sku_img = file.response.data.file_url
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
        // 图片上传前检测 首图
        beforeUpload(file) {
            // let imgSrc = window.URL.createObjectURL(file)
            // let img = new Image()
            // img.onload = function() {
            // }
            // img.src = imgSrc

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
        // 单张图片上传成功回调 首图
        uploadImgSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 2000
                })
                this.upload_loading.close()
                this.timg = fileList
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
        // 单张图片上传失败回调 首图
        uploadImgError(err, file, fileList) {
            this.upload_loading.close()
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            })
        },
        //  首图
        // handleExceed(files, fileList) {
        //     this.$notify({
        //         title: '只能上传6张图片/视频',
        //         message: '',
        //         type: 'warning',
        //         duration: 5000
        //     });
        // },
        //  首图
        handleRemove(file, fileList) {
            this.timg = fileList
        },
        // 图片上传前检测 图片视频 其他五张
        beforeUploadMultiple(file) {
            if ((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'video/mp4') && file.size <= 1024 * 1024 * 5) {
                this.upload_loading = this.uploadLoading('上传中')
                this.uploadVisible = false
            } else {
                if (file.size > 1024 * 1024 * 5) {
                    this.$notify({
                        title: '文件大小应不超过5M',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                } else {
                    this.$notify({
                        title: '文件格式只支持JPG、PNG、MP4',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
                return false
            }
        },
        // 图片上传成功回调 图片视频 其他五张
        uploadImgSuccessMultiple(response, file, fileList) {
            let status = fileList.every(item => item.type || (item.response && item.response.code == 200))
            if (status) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                })
                this.upload_loading.close()
                // 上传视频 替换一张可显示图片
                // if (file.raw.type == 'video/mp4') {
                //     file.url = this.imgVedio;
                // }
                fileList = fileList.map(item => {
                    if (item.type == 1 || item.type == 2) {
                        return item
                    }
                    if (item.raw.type == 'video/mp4') {
                        item.url = this.imgVedio
                    }
                    return item
                })
                // this.tfile.push(file);
                this.tfile = fileList
            }
            if (response.code != 200) {
                this.upload_loading.close()
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'warning',
                    duration: 5000
                })
            }
        },
        // 单张图片上传失败回调 图片视频 其他五张
        uploadImgErrorMultiple(err, file, fileList) {
            this.upload_loading.close()
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            })
        },
        // 图片视频 其他五张
        handleExceedMultiple(files, fileList) {
            this.$notify({
                title: '只能上传6张图片/视频',
                message: '',
                type: 'warning',
                duration: 5000
            })
        },
        // 图片视频 其他五张
        handleRemoveMultiple(file) {
            this.tfile.splice(this.tfile.indexOf(file), 1)
            // this.tfile = fileList;
        },
        // 图片左移
        handlePictureLeft(file) {
            let index = this.tfile.indexOf(file)
            if (index == 0) {
                return
            }
            this.swapItems(index, index - 1)
        },
        // 图片右移
        handlePictureRight(file) {
            let index = this.tfile.indexOf(file)
            if (index == this.tfile.length - 1) {
                return
            }
            this.swapItems(index, index + 1)
            // this.tfile = fileList;
        },
        // 生成随机数 作为uid
        // generateCode() {
        // let time = new Date().getTime()
        // },
        // 图片位置交换方法
        swapItems(index1, index2) {
            this.tfile[index1] = this.tfile.splice(index2, 1, this.tfile[index1])[0]
        },
        closePreview() {
            this.dialogVisiblePic = false
        },
        handlePictureCardPreview(file) {
            if (file.response) {
                this.dialogImageUrl = file.response.data.file_url
                this.playerOptions['sources'][0]['src'] = this.dialogImageUrl
                this.dialogViewType = file.raw.type == 'video/mp4' ? 2 : 1
            } else {
                this.dialogImageUrl = file.type == 2 ? file.vedioUrl : file.url
                this.playerOptions['sources'][0]['src'] = this.dialogImageUrl
                this.dialogViewType = file.type
            }
            if (this.dialogViewType == 2) {
                this.dialogVisible = true
            } else {
                this.dialogVisiblePic = true
                this.previewUrlList = []
                let list = this.timg.concat(this.tfile)
                for (let i = 0; i < list.length; i++) {
                    const item = list[i]
                    if (item.response) {
                        let type = item.raw.type == 'video/mp4' ? 2 : 1
                        if (type == 1) {
                            this.previewUrlList.push(item.response.data.file_url)
                        }
                    } else {
                        let dialogImageUrl = item.type == 2 ? item.vedioUrl : item.url
                        if (item.type == 1) {
                            this.previewUrlList.push(dialogImageUrl)
                        }
                    }
                }
                this.previewIndex = this.previewUrlList.indexOf(this.dialogImageUrl)
            }
        },

        submit() {
            const rLoading = this.openLoading()

            this.$refs['formRef'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    let params = _.cloneDeep(this.goods)
                    // 详情
                    params['detail'] = this.content
                    // format is_allow_agent
                    params['allow_shop_ids'] = params['is_allow_agent'] == 2 ? [] : params['allow_shop_ids']
                    // format标签
                    params['tag_ids'] = this.pickerTag.map(item => item.id).join(',')
                    // format 图片
                    if (this.timg.length == 0) {
                        this.$notify({
                            title: '请上传首图',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                        rLoading.close()
                        return
                    }
                    // format 上下架时间
                    if (params.set_time_status == 2) {
                        params.set_time_on = 0
                        params.set_time_off = 0
                    } else {
                        if (params.set_time_on || params.set_time_off) {
                            params.set_time_on = params.set_time_on ? Number(this.$moment(params.set_time_on).format('X')) : 0
                            params.set_time_off = params.set_time_off ? Number(this.$moment(params.set_time_off).format('X')) : 0
                            if (params.set_time_on != 0 && params.set_time_off != 0 && params.set_time_off <= params.set_time_on) {
                                this.$notify({
                                    title: '下架时间不能早于上架时间',
                                    message: '',
                                    type: 'warning',
                                    duration: 5000
                                })
                                rLoading.close()
                                return
                            }
                        } else {
                            this.$notify({
                                title: '请选择上架或者下架时间',
                                message: '',
                                type: 'warning',
                                duration: 5000
                            })
                            rLoading.close()
                            return
                        }
                    }

                    this.timg[0]['type'] = 1
                    let imgList = this.timg.concat(this.tfile)
                    let length = 0
                    let imgs = imgList.map(item => {
                        let url, type
                        if (item.response) {
                            url = item.response.data.file_url
                            type = item.raw.type == 'video/mp4' ? 2 : 1
                        } else {
                            if (item.type == 2) {
                                url = item.vedioUrl
                                type = item.type
                            } else {
                                url = item.url
                                type = item.type
                            }
                        }
                        // 倒序sort
                        length++
                        return {
                            img_url: url,
                            type: type, //1 图片 2视频
                            sort: length //排序 倒叙 20200318改为顺序
                        }
                    })
                    params['imgs'] = imgs
                    // format category_id
                    if (typeof params['categoryCache'] == 'object') {
                        params['category_id'] = params['categoryCache'].length == 2 ? params['categoryCache'][1] : ''
                    } else {
                        params['category_id'] = params['categoryCache']
                    }
                    //生成attr_list数据 format 价格
                    let attrLength = this.consumeChecked.length + this.basicChecked.length
                    params['consume_attr_ids'] = [...this.consumeChecked, ...this.basicChecked].sort((a, b) => a - b)

                    if (attrLength == 0 || attrLength > 3) {
                        this.$notify({
                            title: '保存失败',
                            message: '请选择至少1条展示属性',
                            type: 'warning',
                            duration: 5000
                        })
                        rLoading.close()
                        return
                    }
                    // 判断sku数量
                    if (params.sku_list.length <= 0) {
                        this.$notify({
                            title: '保存失败',
                            message: '请添加至少一条sku',
                            type: 'warning',
                            duration: 5000
                        })
                        rLoading.close()
                        return
                    }
                    // 判断失少有一个sku为上架
                    let skuStatus = false
                    for (let i = 0; i < params.sku_list.length; i++) {
                        const skuItem = params.sku_list[i]
                        if (skuItem.status == 2) {
                            skuStatus = true
                            break
                        }
                    }
                    if (!skuStatus && this.goods.status == 2) {
                        this.$notify({
                            title: '保存失败',
                            message: '商品上架状态至少需要一个sku处于上架',
                            type: 'warning',
                            duration: 5000
                        })
                        rLoading.close()
                        return
                    }
                    console.log('输出 ~ params.sku_list', params.sku_list)
                    for (let i = 0; i < params.sku_list.length; i++) {
                        const skuItem = params.sku_list[i]
                        skuItem.min_price = commUtil.numberMul(Number(skuItem.min_price), 100)
                        skuItem.display_price = commUtil.numberMul(Number(skuItem.display_price), 100)
                        skuItem.user_discount = Number(skuItem.user_discount)
                        if (skuItem.min_price > skuItem.display_price) {
                            let num = i + 1
                            this.$notify({
                                title: '保存失败',
                                message: `第${num}条sku,显示售价不能低于最低售价`,
                                type: 'warning',
                                duration: 5000
                            })
                            rLoading.close()
                            return
                        }
                        skuItem.attr_list = []

                        for (let j = 0; j < this.basicChecked.length; j++) {
                            const checkId = this.basicChecked[j]
                            let attrInfo = this.basicAttr.find(item => checkId == item.id)
                            if (!attrInfo) {
                                continue
                            }

                            skuItem.attr_list.push({
                                attr_id: attrInfo.id, //属性id
                                attr_title: attrInfo.title, //属性名称
                                attr_value: skuItem[ATTR[attrInfo.id]] //属性值
                            })
                        }
                        console.log('输出 ~ this.consumeChecked', this.consumeChecked)
                        for (let j = 0; j < this.consumeChecked.length; j++) {
                            const checkId = this.consumeChecked[j]
                            let attrInfo = this.consumeAttr.find(item => checkId == item.id)
                            console.log('输出 ~ attrInfo', attrInfo)
                            console.log('输出 ~ skuItem[attrDiyValue][j]', skuItem['attrDiyValue'][j])
                            if (!attrInfo) {
                                continue
                            }
                            // skuItem[ATTR[attrInfo.id]]
                            skuItem.attr_list.push({
                                attr_id: attrInfo.id, //属性id
                                attr_title: attrInfo.title, //属性名称
                                attr_value: skuItem['attrDiyValue'][j] //属性值
                            })
                        }
                    }
                    // 判断任意两个上架商品 所选择的属性值不能完全一致 导致小程序区分不开sku
                    for (let i = 0; i < params.sku_list.length; i++) {
                        const skuItem = params.sku_list[i]
                        // 判断上下架
                        if (skuItem.status == 1) {
                            continue
                        }

                        for (let j = i + 1; j < params.sku_list.length; j++) {
                            const skuCompare = params.sku_list[j]
                            // 判断上下架
                            if (skuCompare.status == 1) {
                                continue
                            }
                            let allSame = skuCompare.attr_list.every((item, index) => {
                                return item.attr_value == skuItem.attr_list[index].attr_value
                            })
                            if (allSame) {
                                this.$notify({
                                    title: '保存失败',
                                    message: `SKU第${i + 1}条和第${j + 1}条的展示属性完全一致,请更改属性值或者下架其中一个`,
                                    type: 'warning',
                                    duration: 5000
                                })
                                rLoading.close()
                                return
                            }
                        }
                    }
                    if (params.goods_id) {
                        // 编辑
                        params['id'] = params['goods_id']
                        updateGoods(params)
                            .then(res => {
                                if (res.code === 200) {
                                    this.$notify({
                                        title: '商品编辑成功',
                                        message: '',
                                        type: 'success',
                                        duration: 3000
                                    })
                                    // this.initData();
                                    bus.$emit('close_current_tags')
                                    bus.$emit('refreshGoodsList', 'edit')
                                    this.$router.push({
                                        path: 'mall-backend-goods-list'
                                    })
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        message: '',
                                        type: 'error',
                                        duration: 5000
                                    })
                                }
                                rLoading.close()
                            })
                            .catch(err => {
                                rLoading.close()
                            })
                    } else {
                        // 创建
                        creatGoods(params)
                            .then(res => {
                                if (res.code === 200) {
                                    this.$notify({
                                        title: '商品创建成功',
                                        message: '',
                                        type: 'success',
                                        duration: 3000
                                    })
                                    bus.$emit('close_current_tags')
                                    bus.$emit('refreshGoodsList', 'add')
                                    this.$router.push({
                                        path: 'mall-backend-goods-list'
                                    })
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        message: '',
                                        type: 'error',
                                        duration: 5000
                                    })
                                }
                                rLoading.close()
                            })
                            .catch(err => {
                                rLoading.close()
                            })
                    }
                } else {
                    rLoading.close()
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
            })
        },
        // tag
        // getTagList() {
        //     Promise.all([
        //         getLabelAllList({
        //             type: this.goods.type,
        //             display_platform: 1
        //         }),
        //         getLabelAllList({
        //             type: this.goods.type,
        //             display_platform: 2
        //         })
        //     ])
        //         .then(res => {
        //             let options = {};
        //             if (res[0].code === 200) {
        //                 if (res[0].data) {
        //                     options.backendTags = res[0].data;
        //                 }
        //             }
        //             if (res[1].code === 200) {
        //                 if (res[1].data) {
        //                     options.miniProgramTags = res[1].data;
        //                 }
        //             }
        //             this.options = options;
        //         })
        //         .catch(() => {});
        // },

        handleCloseBack(tag) {
            this.backendTags.splice(this.backendTags.indexOf(tag), 1)
        },
        handleCloseMiniApp(tag) {
            this.miniProgramTags.splice(this.miniProgramTags.indexOf(tag), 1)
        },
        dialogCancelTag() {
            this.dialogVisibleTag = false
        },
        dialogConfirmTag(value) {
            this.dialogVisibleTag = false
            let miniProgramTags = value.miniProgramTags
            if (miniProgramTags) {
                this.miniProgramTags = miniProgramTags
            }
            let backendTags = value.backendTags
            if (backendTags) {
                this.backendTags = backendTags
            }
        },
        gotoCreat() {
            this.dialogVisibleType = false
            bus.$emit('close_current_tags')

            this.$router.push({
                path: 'mall-backend-goods-list'
            })
        },

        confirmType() {
            this.dialogVisibleType = false
            this.initData()
        },
        openPreview(img) {
            this.previewUrlList = []
            this.previewUrlList.push(img)
            this.previewIndex = 0
            this.dialogVisiblePic = true
        },
        // 设置用户折扣 0 1
        setUserDiscount(row, value) {
            row.user_discount = value
        },
        // 打开弹框
        openDialog(row) {
            this.dialogVisibleCreat = true
            this.discountRow = row
        },
        // 打开弹框
        closeDialog() {
            this.discountValue = ''
            this.dialogVisibleCreat = false
        },
        // 创建/编辑折扣
        saveDiscount() {
            // 正则 0-10 最多两位小数
            var pattern = /^(?!0(\.0{1,2})?$)(\d(\.\d{1,2})?)$/
            let verify = pattern.test(this.discountValue)
            if (!verify) {
                this.$notify({
                    title: '请输入正确折扣',
                    type: 'warning',
                    duration: 5000
                })
                return
            }
            this.discountRow.user_discount = this.discountValue
            this.closeDialog()
        },
        //同步sku 头图
        async syncImg(row) {
            let parameters = { sku_id: row.store_house_id || row.storehouse_pid }
            let data = await queryStoreProductDetail(parameters)
            row.sku_img = data.data.img
            this.$notify({
                title: '图片替换成功',
                message: '',
                type: 'success',
                duration: 500
            })
        },
        //同步sku name
        async syncName(row) {
            let parameters = { sku_id: row.store_house_id || row.storehouse_pid }
            let data = await queryStoreProductDetail(parameters)
            row.title = data.data.name
            this.$notify({
                title: '名称替换成功',
                message: '',
                type: 'success',
                duration: 500
            })
        },
        onImportTemplate() {
            if (this.content) {
                const str = '导入模板会覆盖当前已编辑的信息，' + '\n' + '是否继续？'
                this.$confirm(str, '', {
                    confirmButtonText: '继续',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                    .then(() => {
                        this.queryTemplateList()
                    })
                    .catch(() => {})
            } else {
                this.queryTemplateList()
            }
        },
        queryTemplateList() {
            const rLoading = this.openLoading()
            queryDetailTemplateList({})
                .then(res => {
                    rLoading.close()
                    this.templateList = res.data || []
                    this.importDialogShow = true
                })
                .catch(err => {
                    rLoading.close()
                })
        },
        // 关闭导入模版弹窗
        closeImportDialog() {
            this.detailTemplateId = null
            this.importDialogShow = false
        },
        saveTemplate() {
            if (this.detailTemplateId) {
                const obj = this.templateList.filter(item => {
                    return item.detailId == this.detailTemplateId
                })[0]
                this.content = ''
                this.editContent = ''
                this.$nextTick(() => {
                    this.editContent = obj.detail
                    this.content = this.editContent
                })
                this.importDialogShow = false
            } else {
                this.$notify({
                    title: '请选择模版',
                    type: 'warning',
                    duration: 3000
                })
            }
        }
    }
}
