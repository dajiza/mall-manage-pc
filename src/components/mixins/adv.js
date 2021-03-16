import { createAdv, updateAdv, queryAdvDetail } from '@/api/activity'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import { ATTR, ATTR_NAME } from '@/plugin/constant'
import bus from '@/components/common/bus'
import commUtil from '@/utils/commUtil'
import EmptyList from '../common/empty-list/EmptyList'
import ElImageViewer from '@/components/common/image-viewer'
import { getToken } from '../../utils/auth'

export const mixinsAdv = {
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
                status: 1,
                location: '', // 位置
                logo: '', // logo
                title: '', // 广告标题
                link: '', // 链接
                description: '', // 描述
                shop_id: '', // 可用店铺
                start_time: '', // 开始时间
                end_time: '', // 结束时间
                adv_type: 1 // 广告类型 1 商品列表  2 商品详情 3 直播间 4 自定义 5 页面
            },
            rules: {
                status: [{ required: true, message: '请选择类型', trigger: 'change' }],
                logo: [{ required: true, message: '请上传logo', trigger: 'change' }],
                location: [{ required: true, message: '请选择', trigger: 'change' }],
                title: [
                    { required: true, message: '请输入广告名称', trigger: 'blur' },
                    { min: 1, max: 255, message: '长度在 1 到 255 个字符', trigger: 'blur' }
                ],
                link: [
                    { required: true, message: '请输入', trigger: 'blur' },
                    { min: 1, max: 255, message: '长度在 1 到 255 个字符', trigger: 'blur' }
                ],
                description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
                shop_id: [{ required: true, message: '请选择' }],
                start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
                end_time: []
            },
            listLoading: false,
            saveIsClick: false,
            optionsStart: {
                disabledDate: time => {
                    if (this.operationForm.end_time !== '') {
                        return time.getTime() > this.operationForm.end_time
                    } else {
                        // return time.getTime() > Date.now();
                    }
                }
            },
            optionsEnd: {
                disabledDate: time => {
                    return time.getTime() < this.operationForm.start_time
                }
            },
            locationOptions: [
                { id: 1, name: '首页banner位' },
                { id: 2, name: '首页分享位' }
            ], // location下拉列表
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            imgSrcList: [],
            loadingTip: {},
            imageUrl: '', // 展示小图 （可访问，尺寸限制240）
            imgBaseUrl: '', //   图片读取地址（存储）
            uploadImgUrl: '', //   图片上传地址
            back_img_url: '', //   上传后台返回图片地址（不完整）
            header: {},
            token: '',
            uploadingTip: {}
        }
    },
    watch: {},
    computed: {
        // back_link_label
        back_link_label: function() {
            let link_label = ''
            return data => {
                if (data === 1) {
                    link_label = '参数:'
                } else if (data === 2) {
                    link_label = '商品ID:'
                } else if (data === 3) {
                    link_label = '房间号:'
                } else if (data === 5) {
                    link_label = '页面ID:'
                } else {
                    link_label = 'link:'
                }
                return link_label
            }
        }
    },
    components: {
        ElImageViewer,
        EmptyList
    },
    created() {
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url') // 图片读取地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file' // 图片上传地址
        this.token = getToken()
        this.header['token'] = getToken()
        if (this.$route.query.status === 'edit') {
            this.operationTitle = '编辑广告'
        } else if (this.$route.query.status === 'copy') {
            this.operationTitle = '复制广告'
        } else {
            this.operationTitle = '新增广告'
        }
        this.initData()
    },
    mounted() {},
    methods: {
        formatMoney: formatMoney,
        async initData() {
            const rLoading = this.openLoading()
            Promise.all([queryShopList({})])
                .then(res => {
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            this.shopList = res[0].data || []
                        }
                    }
                    rLoading.close()
                    if (this.operationTitle !== '新增广告') {
                        // 请求优惠券详情
                        this.getDetail()
                    }
                })
                .catch(() => {})
        },
        // 详情回显
        setDetailInfo(info) {
            this.operationForm = _.cloneDeep(info)
            console.log('link', info.link)
            let advType = 1,
                _link = ''
            if (info.link.indexOf('/pages/goodsSearchResult/goodsSearchResult?') > -1) {
                // 商品列表
                advType = 1
                _link = info.link.split('/pages/goodsSearchResult/goodsSearchResult?')[1]
            } else if (info.link.indexOf('/pages/goodsDetail/goodsDetail?goodsId=') > -1) {
                // 商品详情
                advType = 2
                _link = info.link.split('/pages/goodsDetail/goodsDetail?goodsId=')[1]
            } else if (info.link.indexOf('plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=') > -1) {
                // 直播间
                advType = 3
                _link = info.link.split('plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=')[1]
            } else if (info.link.indexOf('/packageAgent/article/article?id=') > -1) {
                // 商品详情
                advType = 5
                _link = info.link.split('/packageAgent/article/article?id=')[1]
            } else {
                // 自定义
                advType = 4
                _link = info.link
            }
            console.log('_link', _link)
            this.$set(this.operationForm, 'adv_type', advType)
            this.$set(this.operationForm, 'link', _link)
            // this.$set(this.operationForm,'status', Number(info.status));
            // this.$set(this.operationForm,'title', info.title);
            // this.$set(this.operationForm,'shop_id', Number(info.shop_id));
            // this.$set(this.operationForm,'start_time', info.start_time);
            // this.$set(this.operationForm,'end_time',info.end_time);
            // this.$set(this.operationForm,'logo',info.logo);
            this.imageUrl = info.logo + '!/fw/240'
            this.bigImgUrl = info.logo + '!/fw/640'
            this.imgSrcList = []
            this.imgSrcList.push(this.bigImgUrl)
        },

        // 获取优惠券详情
        getDetail() {
            return new Promise((resolve, reject) => {
                let id = this.$route.query.id
                if (!id) {
                    return
                }
                let params = { id: Number(id) }
                queryAdvDetail(params)
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
        // 切换上下架
        chooseStatusType() {
            this.$nextTick(() => {
                // this.$refs['fullReduction'].clearValidate(); // 清除优惠券面额的验证
            })
        },

        // 切换链接类型
        chooseLinkType() {
            this.$nextTick(() => {
                this.$set(this.operationForm, 'link', '') // 清除link内容
            })
        },

        // 切换location
        locationChange() {
            // console.log('this.operationForm.location', this.operationForm.location);
            this.imageUrl = ''
            this.back_img_url = ''
            this.bigImgUrl = ''
            this.imgSrcList = []
            this.$set(this.operationForm, 'logo', '')
        },

        // 保存
        handleSave() {
            if (!this.saveIsClick) {
                this.$refs['operationForm'].validate(valid => {
                    // 验证表单内容
                    if (valid) {
                        let params = _.cloneDeep(this.operationForm)
                        let new_link = ''
                        if (this.operationForm.adv_type === 1) {
                            // 商品列表
                            new_link = '/pages/goodsSearchResult/goodsSearchResult?' + this.operationForm.link
                        } else if (this.operationForm.adv_type === 2) {
                            // 商品详情
                            new_link = '/pages/goodsDetail/goodsDetail?goodsId=' + this.operationForm.link
                        } else if (this.operationForm.adv_type === 3) {
                            // 直播间
                            new_link = 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=' + this.operationForm.link
                        } else if (this.operationForm.adv_type === 4) {
                            // 自定义
                            new_link = this.operationForm.link
                        } else if (this.operationForm.adv_type === 5) {
                            // 页面
                            new_link = '/packageAgent/article/article?id=' + this.operationForm.link
                        }
                        // console.log('new_link', new_link)
                        params['link'] = new_link
                        let time_start, time_end
                        time_start = this.getTime(this.operationForm.start_time).toString()
                        if (this.operationForm.end_time) {
                            time_end = this.getTime(this.operationForm.end_time)
                            time_end = new Date(time_end)
                            params['end_time'] = time_end.getTime() / 1000
                        } else {
                            params['end_time'] = 0
                        }
                        time_start = new Date(time_start)
                        params['start_time'] = time_start.getTime() / 1000
                        if (this.operationTitle === '编辑广告') {
                            // 请求编辑
                            params['id'] = Number(this.$route.query.id)
                            this.queryEdit(params)
                        } else {
                            this.queryAdd(params)
                        }
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

        // 取消
        handleCancel() {
            if (!this.saveIsClick) {
                this.saveIsClick = false
                bus.$emit('close_current_tags')
                this.$router.push({ path: 'mall-backend-adv' })
            }
        },

        // 请求 -- 添加
        queryAdd(params) {
            this.saveIsClick = true
            const rLoading = this.openLoading()
            let that = this
            createAdv(params)
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
                        bus.$emit('close_current_tags')
                        that.$router.push({ path: 'mall-backend-adv' })
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

        // 请求 -- 编辑
        queryEdit(editParams) {
            this.saveIsClick = true
            const rLoading = this.openLoading()
            let that = this
            updateAdv(editParams)
                .then(async res => {
                    rLoading.close()
                    that.saveIsClick = false
                    if (res.code === 200) {
                        that.$notify({
                            title: '编辑成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        bus.$emit('close_current_tags')
                        that.$router.push({ path: 'mall-backend-adv' })
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

        getTimeLe(val) {},

        getTimeGe(val) {},

        // 查看大图
        viewBigImg() {
            this.dialogVisiblePic = true
        },

        // 关闭大图
        closePreview() {
            this.dialogVisiblePic = false
        },
        // 图片上传成功
        handleAvatarSuccess(response, file) {
            this.uploadingTip.close()
            if (response.code === 200) {
                this.back_img_url = response.data.file_url
                this.imageUrl = response.data.file_url + '!/fw/200'
                this.bigImgUrl = response.data.file_url + '!/fw/640'
                this.imgSrcList = []
                this.imgSrcList.push(this.bigImgUrl)
                this.$set(this.operationForm, 'logo', this.back_img_url)
            } else {
                this.$notify({ title: response.msg, message: '', type: 'error', duration: 3000 })
            }
        },

        // 上传失败
        uploadError() {
            this.uploadingTip.close()
            this.$notify({ title: '上传失败', message: '', type: 'error', duration: 3000 })
        },

        // 图片上传前检测
        beforeAvatarUpload(file) {
            if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
                this.uploadingTip = this.uploadLoading('上传中')
            } else {
                this.$notify({
                    title: '图片格式只支持JPG、PNG',
                    message: '',
                    type: 'error',
                    duration: 3000
                })
                return false
            }
        },

        handleRemove(file, fileList) {
            this.imageUrl = ''
            this.back_img_url = ''
            this.bigImgUrl = ''
            this.imgSrcList = []
            this.$set(this.operationForm, 'logo', '')
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
        }
    }
}
