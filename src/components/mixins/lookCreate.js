import { queryShopList, queryCategoryListAll } from '@/api/goods'
import { queryTutorialSave, queryTutorialDetail, updateApproveStatus, queryAuthorList, addTutorialAuthor,queryMaterialSKUList } from '@/api/look'
import { formatMoney } from '@/plugin/tool'
import { ATTR, ATTR_NAME } from '@/plugin/constant'
import bus from '@/components/common/bus'
import commUtil from '@/utils/commUtil'
import EmptyList from '../common/empty-list/EmptyList'
import ElImageViewer from '@/components/common/image-viewer'
import { construct } from '@/utils/json-tree'
import couponList from '@/components/common/coupon-list-pop/CouponListPop'
import addGoodsPop from '@/components/common/add-goods-pop/addGoodsPop'
import addSkuPop from '@/components/common/look-add-sku-pop/lookAddSkuPop'
import { getToken } from '@/utils/auth';

export const mixinsLook = {
    data() {
        return {
            ATTR_NAME,
            tableKey: 0,
            btnLoading: false,
            operationTitle: 'add',
            isShelf: false, // 是否上架
            shopList: [],
            operationForm: {
                author: '', // 作者
                title: '',
                shop_id: '', // 可用店铺
            },
            authorList: [],
            rules: {
                title: [
                    { required: true, message: '请输入标题', trigger: 'blur' },
                    { min: 1, max: 150, message: '长度在 1 到 150 个字符', trigger: 'blur' }
                ],
                shop_id: [{ required: true, message: '请选择' }],
                author: [{ required: true, message: '请选择', trigger: 'change' }],
            },
            listLoading: false,
            saveIsClick: false,
            cate_other_list: [], // 其它分类
            cate_group_list: [], // 布组分类
            cate_other_list_copy: [],
            cate_group_list_copy: [],
            tableHeight: 'calc(100vh - 334px)',
            goods_loading: false,
            skuPage: 1,
            skuLimit: 10,
            skuTotal: 0,
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            skuImgList: [],
            checkedList: [], // 表格当前选中列表
            checkedSkuCount: 0, // 表格当前选中条数
            materialList: [], // 材料清单
            couponsDetail: {},
            showTags: [],
            cateLimit: 0, // 分类下总条数
            allLimit: 0, // 全部商品数量
            cateIsAtLast: false, // 最终请求分类商品
            loadingTip: {},
            shopId: -1,
            checkedSkuList: [], // 选中 SKU 集合
            checkedSkuIds: [], // 选中 SKU ID集合
            allCheckedSkuList: [], // 所有 选中 SKU 集合
            delSkuIds: [], // 移除时选中sku ID集合
            addGoodsCount: 0,
            imageUrl: '', // 展示小图 （可访问，尺寸限制240）
            imgBaseUrl: '', //   图片读取地址（存储）
            uploadImgUrl: '', //   图片上传地址
            header: {},
            token: '',
            uploadingTip: {},
            timg: [],
            tfile: [], // 上传图片列表
            dialogImageUrl: 0,
            upLoadImgList: [],
            checkAll: false,
            indeterminate: false,
            tutorialsList: [],
            tutorialsIndex: 0,
            rejectReason: '',
            reasonDialogVisible: false,
            tutorialId: 0,
            detailInfo: {},
            userList: [], // 客户列表
            authorSelectKey: 1
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
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url') // 图片读取地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file' // 图片上传地址
        this.token = getToken()
        this.header['token'] = getToken()
        if (this.$route.query.status === 'edit') {
            this.operationTitle = 'edit'
        } else if (this.$route.query.status === 'audit') {
            this.operationTitle = 'audit'
        } else {
            this.operationTitle = 'add'
        }
        if (this.$route.query.id) {
            this.tutorialId = Number(this.$route.query.id)
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
                queryCategoryListAll({ type: 2 }),
            ])
                .then(res => {
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            this.shopList = res[0].data || []
                            this.shopList.forEach((ev)=>{
                                if (ev.id == 1 && this.operationTitle == 'add') {
                                    this.shopId = 1
                                    this.$set(this.operationForm, 'shop_id', 1)
                                    // 请求 作者列表
                                    this.getAuthorList(0)
                                }
                            })
                        }
                    }
                    if (res[1].code === 200) {
                        // 分类其它
                        if (res[1].data) {
                            this.cate_other_list = _.cloneDeep(res[1].data)
                            this.cate_other_list_copy = _.cloneDeep(res[1].data)
                        }
                    }
                    if (res[2].code === 200) {
                        // 分类其它
                        if (res[2].data) {
                            this.cate_group_list = _.cloneDeep(res[2].data)
                            this.cate_group_list_copy = _.cloneDeep(res[2].data)
                        }
                    }
                    rLoading.close()
                    if (this.operationTitle !== 'add') {
                        // 请求促销详情
                        this.getDetail()
                    }
                })
                .catch(() => {})
        },

        brandKeyChange(inputKey) {
            console.log('inputKey', inputKey)
            //inputKey为当前输入的数据
            //根据输入的数据请求，得到的结果作为渲染的下拉数据
            const list = this.userList.filter(item =>{ return item.nick_name.indexOf(inputKey) > -1})
            console.log('list', list)
            if (list.length > 0) {
                let add_list = list.filter(item => {return item.add_status == 2})
                let not_add_list = list.filter(item => {return item.add_status != 2})
                this.authorList = add_list.concat(not_add_list)
                this.$nextTick(()=>{
                    this.createLessonName()
                })
            } else {
                this.authorList = []
            }

        },

        // 加样式
        createLessonName() {
            // 渲染章节名称样式
            const array = document.getElementsByClassName('beforecontent');
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                // console.log('element', element)
                let type = this.authorList[index].add_status;
                if (type == 2) { // 已添加
                     // console.log(element.childNodes)
                } else {
                    // 未添加
                    console.log('element.childNodes', element.childNodes[0])
                    element.childNodes[0].classList.add("not-add")
                }
            }
        },
        // 作者列表
        getAuthorList(user_id) {
            const params = {
                nick_name: '',
                shop_id: this.shopId
            }
            const rLoading = this.openLoading()
            queryAuthorList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.authorSelectKey++
                        this.userList = res.data || []
                        this.authorList = res.data.filter(item=>{return item.add_status == 2})
                        console.log('this.authorList', this.authorList)
                        this.$nextTick(()=>{
                            console.log('218', user_id)
                            if (user_id > 0) {
                                this.$set(this.operationForm, 'author', user_id)
                            }
                        })
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {
                    rLoading.close()
                })
        },

        copyrightChange() {
            let _value = this.operationForm.author
            console.log('_value', _value)
            if (!this.shopId) {
                this.$notify({
                    title: '请先选择店铺',
                    message: '',
                    type: 'warning',
                    duration: 3000
                })
                return
            }
            if (_value) {
                console.log('_value',_value)
                const filterList = this.userList.filter(item => {return item.user_id == _value})
                console.log('filterList', filterList)
                if (filterList.length > 0) {
                    const add_status = filterList[0].add_status
                    if (add_status == 2) {
                        console.log('已添加')
                    } else {
                        console.log('未添加')
                        console.log('添加作者')
                        let params = {
                            shop_id: this.shopId,
                            user_id: filterList[0].user_id
                        }
                        console.log('params', params)
                        return;
                        this.attrAdd(params)
                    }
                    return;
                } else {
                    this.$notify({
                        title: '客户列表不存在该用户',
                        message: '',
                        type: 'warning',
                        duration: 3000
                    })
                    this.$set(this.operationForm, 'author' , '')
                }

            }
        },

        // 请求- 作者新增
        attrAdd(params) {
            // this.is_addAttr = true
            const rLoading = this.openLoading()
            addTutorialAuthor(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.attrDialogVisible = false
                        this.$notify({
                            title: '添加成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        // 获取作者列表
                        this.getAuthorList(params.user_id)
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

        // 详情回显
        setDetailInfo(info) {
            this.checkedSkuList = []
            this.$set(this.operationForm, 'title', info.tutorial.summary)
            this.$set(this.operationForm, 'shop_id', Number(info.tutorial.shop_id))
            this.shopId = Number(info.tutorial.shop_id)
            if (info.steps.length > 0) {
                this.tutorialsList = info.steps
            } else {
                this.tutorialsList = []
            }

            if (info.show_img_list.length > 0) {
                this.tfile = info.show_img_list
            } else {
                this.tfile = []
            }
            console.log('info.author.user_id', info.author.user_id)
            this.getAuthorList(info.author.user_id)

            if (info.material_list.length > 0) {
                this.checkedSkuIds = info.material_list.map(item => {return item.sku_id})
            }

            // 排序
            let imgList = _.cloneDeep(info.show_img_list)
            imgList = imgList.sort((a, b) => a.sort - b.sort)
            // format 图片
            imgList = imgList.map(item => {
                return {
                    url: item.img_url,
                    id: item.id,
                    sort: item.sort
                }
            })
            this.tfile = imgList
            this.getPromotionGoods()
        },

        // 获取详情
        getDetail() {
            return new Promise((resolve, reject) => {
                let id = this.$route.query.id
                if (!id) {
                    return
                }
                let params = { tutorial_id: Number(id) }
                queryTutorialDetail(params)
                    .then(async res => {
                        if (res.code == 200) {
                            let data = _.cloneDeep(res.data)
                            this.detailInfo = _.cloneDeep(res.data)
                            // 详情回显
                            this.setDetailInfo(data)
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            })
                        }
                    })
                    .catch(err => {
                        // reject(err.data)
                    })
            })
        },

        // 保存
        handleSave() {
            this.$refs['operationForm'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    let params = {
                        id: 0,
                        user_id: this.operationForm.author,
                        summary: this.operationForm.title,
                        shop_id: Number(this.operationForm.shop_id),
                        show_img_list: [],
                        steps: [],
                        material_list: []  // 材料清单
                    }
                    if (this.tfile.length < 1) {
                        this.$notify({
                            title: '至少上传一张图片',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                        return
                    }
                    // 重建sort 格式化图片
                    // params['show_img_list'] = this.tfile.map((item, index) => {
                    //     item.sort = index
                    //     item.img_url = item.response ? item.response.data.file_url : item.url
                    //     item.id = item.id || 0
                    //     return item
                    // })
                    let imgArr = []
                    this.tfile.forEach((item, i)=>{
                        imgArr.push({
                            sort: i,
                            id: item.id || 0,
                            img_url: item.response ? item.response.data.file_url : item.url
                        })
                    })
                    params['show_img_list'] = imgArr
                    console.log('this.allCheckedSkuList== 422', this.allCheckedSkuList)
                    this.allCheckedSkuList.forEach((ev)=>{
                        let obj = {
                            goods_id: ev.goods_id,
                            sku_id: ev.sku_id,
                            id: 0
                        }
                        if (this.operationTitle == 'edit') {
                            this.detailInfo.material_list.forEach((event,i)=>{
                                if (event.sku_id == ev.sku_id) {
                                    obj['id'] = event.id
                                }
                            })
                        }
                        params['material_list'].push(obj)
                    })
                    console.log('material_list', params['material_list'])

                    if (this.tutorialsList.length > 0) {
                        this.tutorialsList.forEach((ev, i)=>{
                            params['steps'].push({
                                id: ev.id || 0,
                                img_url: ev.img_url,
                                sort: i + 1,
                                summary: ev.summary,
                                title: '步骤' + (i < 9 ? '0' + (i + 1) : i )
                            })
                        })
                    }
                    if (params.material_list.length > 0) {
                    } else {
                        this.$notify({
                            title: '请先指定商品',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                        return
                    }


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
            queryTutorialSave(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        that.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        bus.$emit('refreshTutorialList', type);
                        setTimeout(()=>{
                            bus.$emit('close_current_tags')
                            that.$router.push({
                                path: 'mall-backend-look'
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

        // 按钮-分页导航
        handlePageChange(val) {
            this.skuPage = val
            this.addListPagination()
        },

        // 选中当前页
        handleCheckCurrentPage(bol) {
            this.materialList.forEach((ev)=>{
                ev['skuIsChecked'] = bol
            })
            this.allCheckedSkuList.forEach((ev)=>{
                this.materialList.forEach((item)=>{
                    if (ev.skuId == item.skuId) {
                        ev['skuIsChecked'] = bol
                    }
                })

            })
            this.setCheckAll()
        },

        // sku选中/取消
        skuChecked(bol, row, index) {
            row['skuIsChecked'] = bol
            this.allCheckedSkuList.forEach((ev)=>{
                if (ev.skuId == row.skuId) {
                    ev['skuIsChecked'] = bol
                }
            })
            this.setCheckAll()
        },
        setCheckAll() {
            this.checkedSkuCount = this.allCheckedSkuList.filter(item=>item.skuIsChecked).length
            let skuCheckedLength = this.materialList.filter(item=>item.skuIsChecked).length
            if (skuCheckedLength > 0) {
                this.checkAll = false
                this.indeterminate = true
                if (skuCheckedLength === this.materialList.length) {
                    this.checkAll = true
                    this.indeterminate = false
                } else if (skuCheckedLength < this.materialList.length) {
                    this.checkAll = false
                    this.indeterminate = true
                }
            } else {
                this.checkAll = false
                this.indeterminate = false
            }
        },

        skuInit() {
            this.skuPage = 1
            this.skuTotal = 0
            this.materialList = []
            this.allCheckedSkuList = []
            this.skuImgList = []
            this.previewIndex = 0
        },

        // 添加教程
        addTutorials() {
            if (this.operationTitle == 'audit') {
                return
            }
            const num = this.tutorialsList.length
            this.tutorialsList.push({
                id: 0,
                img_url: '',
                sort: num + 1,
                summary: '',
                title: '步骤' + (num < 9 ? '0' + (num + 1) : num )
            })
        },

        // 添加材料
        handleAdd() {
            if (this.shopId > 0) {
                this.$refs.skuList.show()
            } else {
                this.$notify({
                    title: '请先选择店铺',
                    message: '',
                    type: 'warning',
                    duration: 3000
                })
            }
        },

        // 移除选中
        handleDelSelected() {
            const _list = this.allCheckedSkuList.filter(item => {return item.skuIsChecked})
            if (_list.length > 0) {
                this.addOrDelSuccess(_list, 'del')
            } else {
                this.$notify({
                    title: '请勾选商品后再移除',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
            }
        },

        // 清空已添加
        handleDelAll() {
            // this.addOrDelAll('del')
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
                let new_sku_ids =list.map(item => {return item.skuId})
                let tipText = ''
                let num = new_sku_ids.length
                let del_text = num > 1 ? '确定将' + num + '件材料移除吗？' : '确定将该材料移除吗？'
                this.$confirm(del_text, '', {
                    customClass: 'message-delete',
                    type: 'warning'
                })
                    .then(() => {
                        let new_arr = _.cloneDeep(this.allCheckedSkuList)
                        new_arr = new_arr.filter(function(item) {
                            return new_sku_ids.indexOf(item.skuId) == -1
                        })
                        this.allCheckedSkuList = new_arr
                        if (this.allCheckedSkuList.length > 0) {
                            this.checkedSkuIds = this.allCheckedSkuList.map(item => {return item.skuId})
                        }
                        tipText = "已移除"
                        this.$notify({
                            title: tipText,
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        this.skuInit()
                        this.getPromotionGoods()
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

        // 打开大图预览 1 材料图 2 轮播图 3 步骤图
        openPreview(img, type, index) {
            if (type == 1) {
                this.previewUrlList = this.skuImgList
            } else if (type == 2) {
                this.previewUrlList = this.tfile.map((item)=>{ return item.url})
            } else {
                this.previewUrlList = [img]
                // this.previewUrlList.push(img)
            }
            this.previewIndex = index
            console.log('this.previewUrlList', this.previewUrlList)
            console.log('this.previewIndex', this.previewIndex)
            this.dialogVisiblePic = true

        },

        handlePictureCardPreview(file) {
            if (file.response) {
                this.dialogImageUrl = file.response.data.file_url
            } else {
                this.dialogImageUrl = file.url
            }
            this.previewUrlList = []
            for (let i = 0; i < this.tfile.length; i++) {
                const item = this.tfile[i]
                if (item.response) {
                    this.previewUrlList.push(item.response.data.file_url)
                } else {
                    this.previewUrlList.push(item.url)
                }
            }
            this.previewIndex = this.previewUrlList.indexOf(this.dialogImageUrl)
            this.dialogVisiblePic = true
        },

        // 关闭大图
        closePreview() {
            this.dialogVisiblePic = false
        },

        // 选择店铺切换
        chooseShop() {
            this.shopId = Number(this.operationForm.shop_id)
            this.getAuthorList(0)
            if (this.operationForm.author) {
                this.$set(this.operationForm, 'author', '')
            }
            this.checkedSkuIds = []
            this.skuInit()
            this.$nextTick(() => {
                this.$refs['operationForm'].clearValidate() // 清除验证
            })
        },

        // 图片上传前检测
        beforeUploadMultiple(file) {
            console.log('图片上传前检测', file)
            if ((file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') && file.size <= 1024 * 1024 * 5) {
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
                        title: '文件格式只支持JPG、PNG',
                        message: '',
                        type: 'warning',
                        duration: 5000
                    })
                }
                return false
            }
        },
        // 图片上传成功回调
        uploadImgSuccessMultiple(response, file, fileList) {
            console.log('===========620')
            let status = fileList.every(item => (item.response && item.response.code == 200))
            if (status) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                })
                this.upload_loading.close()
                fileList = fileList.map(item => {
                    if (item.type == 1 || item.type == 2) {
                        return item
                    }
                    return item
                })
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
                title: '只能上传9张图片/视频',
                message: '',
                type: 'warning',
                duration: 5000
            })
        },
        // 图片视频 其他五张
        handleRemoveMultiple(file) {
            console.log('handleRemoveMultiple', file)
            if (this.tfile.indexOf(file) > -1) {
                this.tfile.splice(this.tfile.indexOf(file), 1)
            }
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
        // 图片位置交换方法
        swapItems(index1, index2) {
            this.tfile[index1] = this.tfile.splice(index2, 1, this.tfile[index1])[0]
        },

        // 已添加SKU列表
        getPromotionGoods() {
            const sku_ids = this.checkedSkuIds
            if (sku_ids.length < 1) {
                this.skuImgList = []
                this.allCheckedSkuList = []
                this.materialList = []
                this.skuTotal = 0
                return
            }
            let params = {
                sku_ids: sku_ids,
                // shopId: this.shopId
            }
            this.skuPage = 1
            const rLoading = this.openLoading()
            queryMaterialSKUList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data) {
                            let _list = res.data || []
                            _list.forEach((ev)=>{
                                ev['skuIsChecked'] = false
                            })
                            this.allCheckedSkuList = _.cloneDeep(_list)
                            this.skuTotal = res.data.length || 0
                            // // 已添加材料清单（SKU） 分页处理
                            this.addListPagination()
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
        // 已添加材料清单（SKU） 分页处理
        addListPagination() {
            this.skuImgList = []
            this.previewIndex = 0
            const startNum = (this.skuPage - 1) * this.skuLimit,
                  endNum = this.skuPage * this.skuLimit
            this.materialList = this.allCheckedSkuList.slice(startNum,endNum)
            this.materialList.forEach(item => {
                this.skuImgList.push(item.sku_img)
            })
        },

        // 确定添加
        getAddSku(sku_arr){
            this.checkedSkuList = this.uniqueArr(sku_arr, this.checkedSkuList)
            const sku_ids = sku_arr.map(item=>{return item.sku_id})
            sku_ids.forEach((item)=>{
                if(this.checkedSkuIds.indexOf(item) == -1){
                    this.checkedSkuIds.push(item)
                }
            })
            this.getPromotionGoods()
            this.$refs.skuList.close()
            this.$notify({
                title: '添加成功',
                message: '',
                type: 'success',
                duration: 3000
            })
        },
        uniqueArr(arr1,arr2) {
            //合并两个数组
            let newArr = [...arr1,...arr2]
            //去重
            const res = new Map();
            return newArr.filter((arr) => !res.has(arr.sku_id) && res.set(arr.sku_id, 1));
        },

        // 删除教程
        handleDeleteTutorials(i, item) {
            this.$confirm('确认要删除该步骤吗?', '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then((res) => {
                    this.tutorialsList.splice(i, 1)
                })
                .catch(()=>{})
        },
        // 上传成功
        handleTutorialsImgSuccess(response, file, fileList) {
            if (response && response.code == 200) {
                const obj = this.tutorialsList[this.tutorialsIndex]
                this.$set(obj, 'img_url', response.data.file_url)
                // response.data.file_url
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 3000
                })
                this.upload_loading.close()
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
        handleTutorialsImgRemove() {

        },

        // 通过审核
        handleAgree() {
            this.changeStatus(2)
        },

        // 拒绝原因
        openReasonDialog() {
            this.rejectReason = ''
            this.reasonDialogVisible = true
        },

        reasonDialogClose() {
            this.reasonDialogVisible = false
        },

        // 确定拒绝
        handleSureReject() {
            if (this.rejectReason) {
                this.changeStatus(3)
            } else {
                this.$notify({
                    title: '请填写拒绝理由',
                    message: '',
                    type: 'error',
                    duration: 5000
                })
            }

        },

        // 修改审核状态
        changeStatus(status) {
            let params = {
                approve_reason: this.rejectReason || '',
                approve_status: status,
                tutorial_id: this.tutorialId
            }
            const rLoading = this.openLoading()
            updateApproveStatus(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        if (status > 2) {
                            // 拒绝
                        } else {
                            // 通过审核
                            bus.$emit('refreshTutorialList', 'add');
                        }
                        setTimeout(()=>{
                            bus.$emit('close_current_tags')
                            this.$router.push('/mall-backend-look')
                        },1000)

                        // this.getPromotionGoods()
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {
                    rLoading.close()
                })
        }
    }
}
