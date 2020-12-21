import { creatGoods, queryAttrList, queryShopList, queryGoodsDetail, updateGoods, queryCategoryListAll } from '@/api/goods';
import { queryConfigList } from '@/api/configManagement';
import { queryFreightList } from '@/api/freight';
import { getLabelAllList } from '@/api/goodsLabel';
import { formatMoney } from '@/plugin/tool';
import { getToken } from '@/utils/auth';
import { ATTR, ATTR_NAME } from '@/plugin/constant';
import storeProductList from '@/components/common/store-product-list/StoreProductList';
import vTagPicker from '@/components/common/TagPicker.vue';
import ElImageViewer from '@/components/common/image-viewer';
import bus from '@/components/common/bus';
import commUtil from '@/utils/commUtil';

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
                // allow_shop_ids: [{ required: true, message: '请选择代理', trigger: 'blur' }]
            },
            rulesRequired: [{ required: true, message: '请输入内容', trigger: 'blur' }],
            rulesPrice: [
                { required: true, message: '请输入价格', trigger: 'blur' },
                {
                    type: 'number',
                    message: '请输入正确的价格',
                    transform(value) {
                        return Number(value);
                    },
                    min: 0.01
                }
            ],
            rulesInt: [
                { required: true, message: '请输入内容', trigger: 'blur' },
                {
                    type: 'integer',
                    message: '请输入非零整数',
                    transform(value) {
                        return Number(value);
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
                category_id: '', //'分类
                consume_attr_ids: [], //属性ids 数量最多为3 最少为1
                is_allow_agent: 2, //是否所有代理可以销售：1指定代理；2所有代理可以销售；是否分销
                allow_shop_ids: [], //允许的店铺id
                display_sales: 0, //Math.floor(Math.random() * 100) + 1, //展示的销量
                status: 2, //1下架；2上架
                freight_id: '', //运费模版id
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
            }
        };
    },
    watch: {
        'goods.type': {
            handler(newVal, oldVal) {
                this.tableKey++; // 为了保证table 每次都会重渲
            },
            deep: true,
            immediate: true
        },
        consumeChecked() {
            this.tableKey++; // 为了保证table 每次都会重渲
        },
        basicChecked() {
            this.tableKey++; // 为了保证table 每次都会重渲
        }
    },
    computed: {
        pickerTag: function() {
            return this.miniProgramTags.concat(this.backendTags);
        }
    },

    components: {
        storeProductList,
        vTagPicker,
        ElImageViewer
    },
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
        this.header['token'] = getToken();
    },
    mounted() {
        let id = this.$route.query.id;
        if (!id) {
            this.dialogVisibleType = true;
        } else {
            this.initData();
        }
    },
    methods: {
        formatMoney: formatMoney,

        async initData() {
            const rLoading = this.openLoading();
            if (this.$route.query.id) {
                await this.getDetail();
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
                queryFreightList(),
                queryAttrList(),
                queryShopList(),
                queryCategoryListAll({ type: this.goods.type == 2 ? 1 : 2 }),
                queryConfigList({})
            ])
                .then(res => {
                    let options = {};
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            options.backendTags = res[0].data;
                        }
                    }
                    if (res[1].code === 200) {
                        if (res[1].data) {
                            options.miniProgramTags = res[1].data;
                        }
                    }
                    this.options = options;
                    if (res[2].code === 200) {
                        this.freightList = res[2].data;
                        // 新建默认选中默认的运费模板
                        if (!this.goods.goods_id) {
                            this.goods.freight_id = this.freightList.find(item => item.is_default == 2).id;
                        }
                    }
                    if (res[3].code === 200) {
                        this.basicAttr = res[3].data.consume_attr_basic_attr;
                        // 其他只显示品牌 单位两个属性
                        if (this.goods.type == 1) {
                            this.basicAttr = this.basicAttr.filter(item => {
                                return item.id <= 6 && item.id != 4;
                            });
                        } else if (this.goods.type == 2) {
                            this.basicAttr = this.basicAttr.filter(item => {
                                return item.id == 1;
                            });
                        } else if (this.goods.type == 3) {
                            this.basicAttr = this.basicAttr.filter(item => {
                                return item.id == 1 || item.id == 7 || item.id == 9;
                            });
                        }
                        this.consumeAttr = res[3].data.consume_attr;
                    }
                    if (res[4].code === 200) {
                        this.shopList = res[4].data;
                    }
                    if (res[5].code === 200) {
                        this.categoryData = res[5].data;
                        // 其他分类
                    }
                    if (res[6].code === 200) {
                        // 新建时默认填写库存预警
                        let stockWarn = res[6].data.find(item => item.config_key == 'ORDER_MONEY_CHANGE_MAX');
                        this.stockWarn = Number(stockWarn.value);
                        console.log('输出 ~ this.stockWarn', this.stockWarn);
                    }
                    rLoading.close();
                })
                .catch(() => {});
        },
        setCellColor({ row, column, rowIndex, columnIndex }) {
            // if (this.basicChecked == 0) {
            //     return;
            // }
            for (let i = 0; i < this.basicChecked.length; i++) {
                const element = this.basicChecked[i];
                if (column.property == element) {
                    return 'background: #e7f4ff;';
                }
            }
            for (let i = 0; i < this.consumeChecked.length; i++) {
                const element = this.consumeChecked[i];
                if (column.property == element) {
                    return 'background: #e7f4ff;';
                }
            }
        },
        // 编辑获取详情
        getDetail() {
            return new Promise((resolve, reject) => {
                let id = this.$route.query.id;
                console.log('GOOGLE: id', id);
                if (!id) {
                    return;
                }
                let params = {
                    goods_id: Number(id)
                };
                queryGoodsDetail(params)
                    .then(async res => {
                        console.log('GOOGLE: goods', res);
                        // this.goods = res.data;
                        let data = _.cloneDeep(res.data);

                        // format 标签
                        // data.tag_detail_list
                        //display_platform,//展示平台1 后台 2 小程序' 不搜索-1,
                        //type-1    // '类型 1布料 2其他' 不搜索-1,
                        let tagListBack = await getLabelAllList({
                            type: data.type,
                            display_platform: 1
                        });
                        let tagListMiniApp = await getLabelAllList({
                            type: data.type,
                            display_platform: 2
                        });
                        data['category_id'] = data['category_id'] == 0 ? '' : data['category_id'];
                        data['tag_detail_list'] = data['tag_detail_list'] == null ? [] : data['tag_detail_list'];
                        data['allow_shop_ids'] = data['allow_shop_ids'] == null ? [] : data['allow_shop_ids'];
                        for (let i = 0; i < data['tag_detail_list'].length; i++) {
                            const tagId = data['tag_detail_list'][i].tag_id;
                            let findTag = tagListBack.data.find(item => tagId == item.id);
                            if (findTag) {
                                this.backendTags.push({
                                    id: findTag.id,
                                    label: findTag.name
                                });
                                continue;
                            }
                            findTag = tagListMiniApp.data.find(item => tagId == item.id);
                            if (findTag) {
                                this.miniProgramTags.push({
                                    id: findTag.id,
                                    label: findTag.name
                                });
                            }
                        }
                        // format 图片
                        data.imgs = data.imgs.map(item => {
                            return {
                                url: item.type == 2 ? this.imgVedio : item.img_url,
                                vedioUrl: item.type == 2 ? item.img_url : null,
                                type: item.type
                            };
                        });
                        this.timg.push(data.imgs[0]);
                        data.imgs.splice(0, 1);
                        this.tfile = data.imgs;
                        // format attr_list 及价格 字段名  sku_title=>title store_house_id=>storehouse_pid sku_status=>status
                        for (let i = 0; i < data['sku_list'].length; i++) {
                            const skuItem = data['sku_list'][i];
                            skuItem.min_price = skuItem.min_price / 100;
                            skuItem.display_price = skuItem.display_price / 100;
                            skuItem['attrDiyValue'] = ['', '', ''];
                            skuItem['storehouse_pid'] = skuItem['store_house_id'];
                            skuItem['title'] = skuItem['sku_title'];
                            skuItem['status'] = skuItem['sku_status'];
                            const attrList = skuItem['sku_attr_list'];
                            let diyAttrIndex = 0;
                            for (let j = 0; j < attrList.length; j++) {
                                const attrItem = attrList[j];
                                if (i == 0) {
                                    if (attrItem.attr_id <= 9) {
                                        this.basicChecked.push(attrItem.attr_id);
                                    } else {
                                        this.attrDiyList.push({
                                            id: attrItem.attr_id,
                                            title: attrItem.attr_title
                                        });
                                        this.consumeChecked.push(attrItem.attr_id);
                                    }
                                }

                                if (attrItem.attr_id > 9) {
                                    skuItem['attrDiyValue'][diyAttrIndex] = attrItem.attr_value;
                                    diyAttrIndex++;
                                }
                            }
                        }

                        this.goods = data;
                        resolve(data);
                    })
                    .catch(err => {
                        reject();
                    });
            });
        },

        // 删除 children为空的元素
        deleteNullChildren(arr) {
            let childs = arr;
            for (let i = childs.length; i--; i > 0) {
                if (childs[i].children) {
                    if (childs[i].children.length) {
                        this.deleteNullChildren(childs[i].children);
                    } else {
                        delete childs[i].children;
                    }
                }
            }
            return arr;
        },
        // 格式化分类数据
        processCateData(data) {
            let dealOptions = [];
            // 给每个数据加children属性
            data.forEach((ev, one) => {
                ev.children = [];
            });
            data.forEach((ev, one) => {
                let findIndex = data.findIndex(item => item.id === ev.parent_id);
                if ((!ev.parent_id && ev.parent_id !== 0 && ev.parent_id !== false) || findIndex === -1) {
                    dealOptions.push(ev);
                } else {
                    data[findIndex].children.push(ev);
                }
            });
            return dealOptions;
        },
        handleCheckedBasic(value) {
            let length = this.consumeChecked.length + this.basicChecked.length;
            if (length > 3) {
                this.basicChecked.splice(this.basicChecked.indexOf(value), 1);
                this.$notify({
                    title: '最多只能选择3个展示属性哦~',
                    message: '',
                    type: 'warning',
                    duration: 5000
                });
            }
        },

        handleConsumeBasic(value) {
            let length = this.consumeChecked.length + this.basicChecked.length;
            if (length > 3) {
                this.consumeChecked.splice(this.consumeChecked.indexOf(value), 1);
                this.$notify({
                    title: '最多只能选择3个展示属性哦~',
                    message: '',
                    type: 'warning',
                    duration: 5000
                });
            } else {
                this.attrDiyList = this.consumeChecked.map(item => {
                    let myAttr = this.consumeAttr.find(attr => {
                        return item == attr.id;
                    });
                    return myAttr;
                });
                console.log('GOOGLE: this.attrDiyList', this.attrDiyList);
            }
        },
        getSku(pList) {
            console.log('GOOGLE: pList', pList);
            // this.goods.sku_list = pList;
            // for (let i = 0; i < pList.length; i++) {
            //     const pItem = pList[i];
            //     let index = this.goods.sku_list.findIndex(item => pItem.storehouse_pid == item.storehouse_pid);
            //     console.log('GOOGLE: index', index);
            //     if (index != -1) {
            //         pList.splice(index, 1);
            //         console.log('GOOGLE: pList.length', pList.length);
            //         console.log('GOOGLE: pList.i', i);
            //         i--;
            //     }
            // }
            for (let i = 0; i < this.goods.sku_list.length; i++) {
                const skuItem = this.goods.sku_list[i];
                let index = pList.findIndex(item => skuItem.storehouse_pid == item.storehouse_pid);
                if (index != -1) {
                    pList.splice(index, 1);
                }
            }
            for (let j = 0; j < pList.length; j++) {
                const element = pList[j];
                element.stock_warning = this.stockWarn;
            }
            this.goods.sku_list = this.goods.sku_list.concat(pList);
            // this.setTimg();
        },

        addSku() {
            this.$refs.productList.show();
        },
        // 删除sku
        deleteSku(index) {
            this.goods.sku_list.splice(index, 1);
        },
        // 设为主商品
        setFirsetSku(row, index) {
            this.goods.sku_list.unshift(row);
            this.goods.sku_list.splice(index + 1, 1);
            this.setTimg();
        },
        // 生成首图 以及标题
        setTimg() {
            let firstSku = this.goods.sku_list[0];
            this.timg = [{ url: firstSku.sku_img }];
            this.goods.title = firstSku.title;
        },
        // sku上下架
        setSkuStatus(row, status, index) {
            if (row.stock_available == 0 && status == 1) {
                this.$notify({
                    title: '可用库存为0,不能上架',
                    message: '',
                    type: 'warning',
                    duration: 5000
                });
                return;
            }
            status = status == 1 ? 2 : 1;
            this.$set(this.goods.sku_list[index], 'status', status);
        },

        // 图片上传前检测 首图
        beforeUpload(file) {
            if ((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') && file.size <= 1024 * 1024 * 5) {
                this.upload_loading = this.uploadLoading('上传中');
                this.uploadVisible = false;
            } else {
                if (file.size > 1024 * 1024 * 5) {
                    this.$notify({
                        title: '照片大小应不超过5M',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    });
                } else {
                    this.$notify({
                        title: '照片格式只支持JPG、PNG',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    });
                }
                return false;
            }
        },
        // 单张图片上传成功回调 首图
        uploadImgSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                });
                this.upload_loading.close();
                this.timg = fileList;
            } else {
                this.upload_loading.close();
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'warning',
                    duration: 5000
                });
            }
        },
        // 单张图片上传失败回调 首图
        uploadImgError(err, file, fileList) {
            this.upload_loading.close();
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            });
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
            this.timg = fileList;
        },
        // 图片上传前检测 图片视频 其他五张
        beforeUploadMultiple(file) {
            if (
                (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'video/mp4') &&
                file.size <= 1024 * 1024 * 5
            ) {
                this.upload_loading = this.uploadLoading('上传中');
                this.uploadVisible = false;
            } else {
                if (file.size > 1024 * 1024 * 5) {
                    this.$notify({
                        title: '文件大小应不超过5M',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    });
                } else {
                    this.$notify({
                        title: '文件格式只支持JPG、PNG、MP4',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    });
                }
                return false;
            }
        },
        // 图片上传成功回调 图片视频 其他五张
        uploadImgSuccessMultiple(response, file, fileList) {
            console.log('GOOGLE: fileList', fileList);
            console.log('GOOGLE: file', file);
            let status = fileList.every(item => item.type || (item.response && item.response.code == 200));
            console.log('输出 ~ file: goodsCreat.vue ~ line 926 ~ status', status);
            if (status) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                });
                this.upload_loading.close();
                // 上传视频 替换一张可显示图片
                // if (file.raw.type == 'video/mp4') {
                //     file.url = this.imgVedio;
                // }
                fileList = fileList.map(item => {
                    if (item.type == 1 || item.type == 2) {
                        return item;
                    }
                    if (item.raw.type == 'video/mp4') {
                        item.url = this.imgVedio;
                    }
                    return item;
                });
                // this.tfile.push(file);
                this.tfile = fileList;
            }
            if (response.code != 200) {
                this.upload_loading.close();
                this.$notify({
                    title: response.msg,
                    message: '',
                    type: 'warning',
                    duration: 5000
                });
            }
        },
        // 单张图片上传失败回调 图片视频 其他五张
        uploadImgErrorMultiple(err, file, fileList) {
            this.upload_loading.close();
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            });
        },
        // 图片视频 其他五张
        handleExceedMultiple(files, fileList) {
            this.$notify({
                title: '只能上传6张图片/视频',
                message: '',
                type: 'warning',
                duration: 5000
            });
        },
        // 图片视频 其他五张
        handleRemoveMultiple(file) {
            this.tfile.splice(this.tfile.indexOf(file), 1);
            // this.tfile = fileList;
        },
        // 图片左移
        handlePictureLeft(file) {
            let index = this.tfile.indexOf(file);
            if (index == 0) {
                return;
            }
            this.swapItems(index, index - 1);
        },
        // 图片右移
        handlePictureRight(file) {
            let index = this.tfile.indexOf(file);
            if (index == this.tfile.length - 1) {
                return;
            }
            this.swapItems(index, index + 1);
            // this.tfile = fileList;
        },
        // 生成随机数 作为uid
        // generateCode() {
        // let time = new Date().getTime()
        // },
        // 图片位置交换方法
        swapItems(index1, index2) {
            this.tfile[index1] = this.tfile.splice(index2, 1, this.tfile[index1])[0];
        },
        closePreview() {
            this.dialogVisiblePic = false;
        },
        handlePictureCardPreview(file) {
            if (file.response) {
                this.dialogImageUrl = file.response.data.file_url;
                this.playerOptions['sources'][0]['src'] = this.dialogImageUrl;
                this.dialogViewType = file.raw.type == 'video/mp4' ? 2 : 1;
            } else {
                this.dialogImageUrl = file.type == 2 ? file.vedioUrl : file.url;
                this.playerOptions['sources'][0]['src'] = this.dialogImageUrl;
                this.dialogViewType = file.type;
            }
            if (this.dialogViewType == 2) {
                this.dialogVisible = true;
            } else {
                this.dialogVisiblePic = true;
                this.previewUrlList = [];
                let list = this.timg.concat(this.tfile);
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.response) {
                        let type = item.raw.type == 'video/mp4' ? 2 : 1;
                        if (type == 1) {
                            this.previewUrlList.push(item.response.data.file_url);
                        }
                    } else {
                        let dialogImageUrl = item.type == 2 ? item.vedioUrl : item.url;
                        if (item.type == 1) {
                            this.previewUrlList.push(dialogImageUrl);
                        }
                    }
                }
                this.previewIndex = this.previewUrlList.indexOf(this.dialogImageUrl);
            }
        },

        submit() {
            console.log('GOOGLE: goods', this.goods);
            const rLoading = this.openLoading();

            this.$refs['formRef'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    let params = _.cloneDeep(this.goods);
                    // format is_allow_agent
                    params['allow_shop_ids'] = params['is_allow_agent'] == 2 ? [] : params['allow_shop_ids'];
                    // format标签
                    params['tag_ids'] = this.pickerTag.map(item => item.id).join(',');
                    // format 图片
                    if (this.timg.length == 0) {
                        this.$notify({
                            title: '请上传首图',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        });
                        rLoading.close();
                        return;
                    }
                    this.timg[0]['type'] = 1;
                    let imgList = this.timg.concat(this.tfile);
                    let length = imgList.length + 1;
                    let imgs = imgList.map(item => {
                        let url, type;
                        if (item.response) {
                            url = item.response.data.file_url;
                            type = item.raw.type == 'video/mp4' ? 2 : 1;
                        } else {
                            if (item.type == 2) {
                                url = item.vedioUrl;
                                type = item.type;
                            } else {
                                url = item.url;
                                type = item.type;
                            }
                        }
                        // 倒序sort
                        length--;
                        return {
                            img_url: url,
                            type: type, //1 图片 2视频
                            sort: length //排序 倒叙
                        };
                    });
                    params['imgs'] = imgs;
                    // format category_id
                    params['category_id'] = params['category_id'] == '' ? 0 : params['category_id'];
                    //生成attr_list数据 format 价格
                    let attrLength = this.consumeChecked.length + this.basicChecked.length;
                    params['consume_attr_ids'] = [...this.consumeChecked, ...this.basicChecked].sort((a, b) => a - b);

                    if (attrLength == 0 || attrLength > 3) {
                        this.$notify({
                            title: '请选择至少1条展示属性',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        });
                        rLoading.close();
                        return;
                    }
                    // 判断sku数量
                    if (params.sku_list <= 0) {
                        this.$notify({
                            title: '请添加至少一条sku',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        });
                        rLoading.close();
                        return;
                    }
                    // 判断失少有一个sku为上架
                    let skuStatus = false;
                    for (let i = 0; i < params.sku_list.length; i++) {
                        const skuItem = params.sku_list[i];
                        if (skuItem.status == 2) {
                            skuStatus = true;
                            break;
                        }
                    }
                    if (!skuStatus && this.goods.status == 2) {
                        this.$notify({
                            title: '商品上架状态至少需要一个sku处于上架',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        });
                        rLoading.close();
                        return;
                    }
                    for (let i = 0; i < params.sku_list.length; i++) {
                        const skuItem = params.sku_list[i];
                        skuItem.min_price = commUtil.numberMul(Number(skuItem.min_price), 100);
                        skuItem.display_price = commUtil.numberMul(Number(skuItem.display_price), 100);
                        if (skuItem.min_price > skuItem.display_price) {
                            let num = i + 1;
                            this.$notify({
                                title: `第${num}条sku,显示售价不能低于最低售价`,
                                message: '',
                                type: 'warning',
                                duration: 5000
                            });
                            rLoading.close();
                            return;
                        }
                        skuItem.attr_list = [];
                        for (let j = 0; j < this.basicChecked.length; j++) {
                            const checkId = this.basicChecked[j];
                            let attrInfo = this.basicAttr.find(item => checkId == item.id);
                            // skuItem[ATTR[attrInfo.id]]
                            skuItem.attr_list.push({
                                attr_id: attrInfo.id, //属性id
                                attr_title: attrInfo.title, //属性名称
                                attr_value: skuItem[ATTR[attrInfo.id]] //属性值
                            });
                        }
                        for (let j = 0; j < this.consumeChecked.length; j++) {
                            const checkId = this.consumeChecked[j];
                            let attrInfo = this.consumeAttr.find(item => checkId == item.id);
                            // skuItem[ATTR[attrInfo.id]]
                            skuItem.attr_list.push({
                                attr_id: attrInfo.id, //属性id
                                attr_title: attrInfo.title, //属性名称
                                attr_value: skuItem['attrDiyValue'][j] //属性值
                            });
                        }
                    }
                    console.log('GOOGLE: params', params);
                    if (params.goods_id) {
                        // 编辑
                        params['id'] = params['goods_id'];
                        updateGoods(params)
                            .then(res => {
                                console.log('GOOGLE: res', res);
                                if (res.code === 200) {
                                    this.$notify({
                                        title: '商品编辑成功',
                                        message: '',
                                        type: 'success',
                                        duration: 3000
                                    });
                                    // this.initData();
                                    bus.$emit('close_current_tags');
                                    this.$router.push({
                                        path: 'mall-backend-goods-list'
                                    });
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        message: '',
                                        type: 'error',
                                        duration: 5000
                                    });
                                }
                                rLoading.close();
                            })
                            .catch(err => {
                                rLoading.close();
                            });
                    } else {
                        // 创建
                        creatGoods(params)
                            .then(res => {
                                console.log('GOOGLE: res', res);
                                if (res.code === 200) {
                                    this.$notify({
                                        title: '商品创建成功',
                                        message: '',
                                        type: 'success',
                                        duration: 3000
                                    });
                                    bus.$emit('close_current_tags');
                                    this.$router.push({
                                        path: 'mall-backend-goods-list'
                                    });
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        message: '',
                                        type: 'error',
                                        duration: 5000
                                    });
                                    rLoading.close();
                                }
                            })
                            .catch(err => {
                                rLoading.close();
                            });
                    }
                } else {
                    rLoading.close();
                    this.$notify({
                        title: '请填写完成数据后提交',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    });
                }
            });
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
        //             console.log('GOOGLE: 1111', res);
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
            this.backendTags.splice(this.backendTags.indexOf(tag), 1);
        },
        handleCloseMiniApp(tag) {
            this.miniProgramTags.splice(this.miniProgramTags.indexOf(tag), 1);
        },
        dialogCancelTag() {
            this.dialogVisibleTag = false;
        },
        dialogConfirmTag(value) {
            this.dialogVisibleTag = false;
            let miniProgramTags = value.miniProgramTags;
            if (miniProgramTags) {
                this.miniProgramTags = miniProgramTags;
            }
            let backendTags = value.backendTags;
            if (backendTags) {
                this.backendTags = backendTags;
            }
        },
        gotoCreat() {
            this.dialogVisibleType = false;
            bus.$emit('close_current_tags');

            this.$router.push({
                path: 'mall-backend-goods-list'
            });
        },

        confirmType() {
            this.dialogVisibleType = false;
            this.initData();
        },
        openPreview(img) {
            this.previewUrlList = [];
            this.previewUrlList.push(img);
            this.previewIndex = 0;
            this.dialogVisiblePic = true;
        }
    }
};
