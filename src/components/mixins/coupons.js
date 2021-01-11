import { updateCoupons, creatCoupons, queryCouponsDetail, queryAllCate, queryCouponGoodsList } from '@/api/coupons'
import { queryShopList } from '@/api/goods'
import { getLabelAllList } from '@/api/goodsLabel'
import { formatMoney } from '@/plugin/tool'
import { ATTR, ATTR_NAME } from '@/plugin/constant'
import bus from '@/components/common/bus'
import commUtil from '@/utils/commUtil'
import EmptyList from '../common/empty-list/EmptyList'
import ElImageViewer from '@/components/common/image-viewer'

export const mixinsCoupons = {
    data() {
        var checkFullReductionAmount = (rule, value, callback) => {
            setTimeout(() => {
                if(Number(this.operationForm.threshold) === 2 && Number(this.operationForm.with_amount) > 1 ){
                    if(value > Number(this.operationForm.with_amount)){
                        callback(new Error('优惠券面额应小于门槛数值'));
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            }, 10);
        };
        return {
            ATTR_NAME,
            tableKey: 0,
            btnLoading: false,
            dialogImageUrl: '',
            operationTitle: '',
            shopList:[],
            rulesTime: [{ required: true, message: '请输入内容', trigger: 'blur' }],
            options: {},
            miniProgramTags: [],
            backendTags: [],
            operationForm: {
                type: 1,
                title: '',
                valid_type: 1,
                valid_days: '',
                valid_start_time: '',
                valid_end_time: '',
                coupon_amount:'', // 优惠券面额 - 满减/折扣
                threshold: 1,     // 有无门槛
                with_amount: '',  // 有门槛时最低消费
                have_discount_top: 1, // 有无最高优惠限制
                discount_top: '', // 最高优惠
                person_get_type: 1, // 单个用户领取次数限制 1 无限制 2 有限制
                person_get_count: '', // 单个用户领取次数
                quota: '', // 发放数量
                shop_id: '', // 可用店铺
                grant_start_time: '', // 领用开始时间
                grant_end_time: '', // 领用结束时间
                receive_user: 1, // 领用用户
                use_goods_type: 1, // 可用商品 0 全场通用 1 指定商品 2 指定标签
                tag_ids: [] // 选择标签
            },
            searchForm:{
                goods_name:'',
                cateArr:[]
            },
            rules_coupon_amount1:[
                { required: true, message: '请输入优惠券面额', trigger: 'blur'  },
                {   type: 'number',
                    message: '最小值为1',
                    transform(value) {
                        return Number(value)
                    },
                    min: 1
                },
                {   type: 'number',
                    message: '最大值为100',
                    transform(value) {
                        return Number(value)
                    },
                    max: 100
                },
                {validator: checkFullReductionAmount, trigger: ['blur','change'] }
            ],
            rules_coupon_amount2: [
                { required: true, message: '请输入优惠券面额', trigger: 'blur'  },
                { pattern: /(^[1-9]([0-9]+)?(\.[0-9])?$)|(^(0){1}$)|(^[0-9]\.[0-9]?$)/, message: '请输入正确格式,可保留一位小数' },
                {   type: 'number',
                    message: '最小值为0.1',
                    transform(value) {
                        return Number(value)
                    },
                    min: 0.1
                },
                {   type: 'number',
                    message: '最大值为10',
                    transform(value) {
                        return Number(value)
                    },
                    max: 10
                },
            ],
            rules: {
                type: [{ required: true, message: '请选择类型', trigger: 'change' }],
                title: [
                    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
                    { min: 1, max: 150, message: '长度在 1 到 150 个字符', trigger: 'blur' }
                ],
                quota:[{ required: true, message: '请输入发放数量', trigger: 'blur' }],
                valid_type:[{ required: true, message: '请选择', trigger: 'change' }],
                shop_id:[{ required: true, message: '请选择'}],
                with_amount:[],
                valid_days:[
                    { required: true, message: '请输入', trigger: 'blur'  },
                    { pattern: /(^[1-9]\d*$)/, message: '请输入大于零的整数' },
                    {   type: 'number',
                        message: '最小值为1',
                        transform(value) {
                            return Number(value)
                        },
                        min: 1
                    },],
                valid_start_time: [{ required: true, message: '请选择开始时间', trigger: 'change'  }],
                valid_end_time: [{ required: true, message: '请选择结束时间', trigger: 'change'  }],
                grant_start_time: [{ required: true, message: '请选择开始时间', trigger: 'change'  }],
                grant_end_time: [{ required: true, message: '请选择结束时间', trigger: 'change'  }],
                receive_user:[{ required: true, message: '请选择', trigger: 'change' }],
                use_goods_type:[{ required: true, message: '请选择', trigger: 'change' }],
                tag_ids:[{ required: true, message: '请选择', trigger: 'change' }]
            },
            listLoading: false,
            saveIsClick: false,
            validityOptionsStart: {
                disabledDate: (time) => {
                    if (this.operationForm.valid_end_time !== "") {
                        return time.getTime() > this.operationForm.valid_end_time;
                    } else {
                        // return time.getTime() > Date.now();
                    }
                }
            },
            validityOptionsEnd:{
                disabledDate: (time) => {
                    return time.getTime() < this.operationForm.valid_start_time;
                }
            },
            pickerOptions1: {
                disabledDate: (time) => {
                    if (this.operationForm.grant_end_time !== "") {
                        return time.getTime() > this.operationForm.grant_end_time;
                    } else {
                        // return time.getTime() > Date.now();
                    }
                }
            },
            pickerOptions2: {
                disabledDate: (time) => {
                    return time.getTime() < this.operationForm.grant_start_time;
                }
            },
            labelKey: 1,
            labelOptions: [], // 标签下拉列表
            labelCloth: [],   // 标签(布)列表
            labelOther: [],   // 标签(其它)列表
            label_cloth_list: [],
            label_other_list: [],
            cate_other_list: [], // 其它分类
            cate_group_list: [], // 布组分类
            cateKey: 1,
            categoryData:[],
            goodsData:[],
            tableHeight: 'calc(100vh - 374px)',
            goods_loading: false,
            goodsPage: 1,
            goodsLimit: 10,
            pageTotal: 0,
            tabPosition:'no_select',
            searchParams:{
                goods_name:'',
                cateArr:[]
            },
            dialogVisiblePic: false,
            previewUrlList: [],
            previewIndex: 0,
            imgList:[],
            selected_goods:[], // 已选中商品id数组
            checkedList: [], // 表格当前选中列表
            couponsDetail:{},
            showTags:[],
            cateLimit: 0, // 分类下总条数
            allLimit: 0,  // 全部商品数量
            cateIsAtLast: false, // 最终请求分类商品
            loadingTip:{},
        }
    },
    watch: {},
    computed: {},
    components: {
        ElImageViewer,
        EmptyList
    },
    created() {
        if(this.$route.query.status === 'edit'){
            this.operationTitle = '编辑优惠券';
        } else if(this.$route.query.status === 'copy'){
            this.operationTitle = '复制优惠券';
        }else {
            this.operationTitle = '新增优惠券';
        }
        this.initData();
    },
    mounted() {},
    methods: {
        formatMoney: formatMoney,
        async initData() {
            const rLoading = this.openLoading();
            let labelAllArr = [];
            let cateAllArr = [
                {id: -1,name:'布'}
            ];
            Promise.all([
                queryShopList({}),
                getLabelAllList({ type:  1, display_platform: -1 }),
                getLabelAllList({ type: 2, display_platform: -2 }),
                queryAllCate({type:1}),
                queryAllCate({type:2}),
            ])
                .then(res => {
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            this.shopList = res[0].data || [];
                        }
                    }
                    if (res[1].code === 200) { // 标签（布）
                        if (res[1].data) {
                            const label_cloth = res[1].data;
                            this.label_cloth_list = res[1].data;
                            this.labelCloth = this.handlerData(label_cloth);
                            if(this.labelCloth.length){
                                labelAllArr.push({
                                    id:2,
                                    name:'布',
                                    children: this.labelCloth
                                })
                            }
                        }
                    }
                    if (res[2].code === 200) { // 标签（其它）
                        if (res[2].data) {
                            const label_other = res[2].data;
                            this.label_other_list = res[2].data;
                            this.labelOther = this.handlerData(label_other);
                            if(this.labelOther.length){
                                labelAllArr.push({
                                    id: 1,
                                    name:'其它',
                                    children: this.labelOther
                                })
                            }
                        }
                    }
                    if (res[3].code === 200) { // 分类其它
                        if (res[3].data) {
                            this.cate_other_list = res[3].data;
                            if(this.cate_other_list.length){
                                cateAllArr.push({
                                    id:1,
                                    name:'其它',
                                    children: this.cate_other_list
                                })
                            }
                        }
                    }
                    if (res[4].code === 200) { // 分类其它
                        if (res[4].data) {
                            this.cate_group_list = res[4].data;
                            if(this.cate_group_list.length){
                                cateAllArr.push({
                                    id:2,
                                    name:'布组',
                                    children: this.cate_group_list
                                })
                            }
                        }
                    }
                    this.labelOptions = labelAllArr;
                    this.categoryData = cateAllArr;
                    rLoading.close();
                    if(this.operationTitle !== '新增优惠券'){
                        // 请求优惠券详情
                        this.getDetail();
                    }
                })
                .catch(() => {})
        },
        // 详情回显
        setDetailInfo(info){
            this.$set(this.operationForm,'type', Number(info.type));
            this.$set(this.operationForm,'title', info.title);
            this.$set(this.operationForm,'valid_type', Number(info.valid_type));
            this.$set(this.operationForm,'shop_id', Number(info.shop_id));
            this.$set(this.operationForm,'use_goods_type', Number(info.use_goods_type));
            this.$set(this.operationForm,'quota', Number(info.quota));
            if(info.type > 1){
                this.$set(this.operationForm,'coupon_amount', Number(info.coupon_amount/10));
                // 封顶优惠
                if(info.discount_top > 0){
                    this.$set(this.operationForm,'have_discount_top', 2);
                    this.$set(this.operationForm,'discount_top', Number(info.discount_top/100));
                }else {
                    this.$set(this.operationForm,'have_discount_top', 1);
                }
            }else {
                this.$set(this.operationForm,'coupon_amount', Number(info.coupon_amount/100));
            }
            if(info.person_get_count > 0){
                this.$set(this.operationForm,'person_get_type', 2);
                this.$set(this.operationForm,'person_get_count', Number(info.person_get_count));
            }else {
                this.$set(this.operationForm,'person_get_type', 1);
            }
            if(info.with_amount > 0){
                this.$set(this.operationForm,'threshold', 2);
                this.$set(this.operationForm,'with_amount', Number(info.with_amount/100));
            }
            if(info.valid_type > 1){
               this.$set(this.operationForm,'valid_start_time', info.valid_start_time);
               this.$set(this.operationForm,'valid_end_time',info.valid_end_time);
            }else {
                this.$set(this.operationForm,'valid_days', Number(info.valid_days));
            }
            // const use_start_time =  new Date(parseInt(info.grant_start_time) * 1000);
            // const use_end_time =  new Date(parseInt(info.grant_end_time) * 1000);
            this.$set(this.operationForm,'grant_start_time', info.grant_start_time);
            this.$set(this.operationForm,'grant_end_time',info.grant_end_time);
            if(info.use_goods_type === 3){
                let select_tags = [];
                let tags_arr = [];
                info.use_goods_tag_ids.forEach((ev)=>{
                    select_tags.push(ev.tag_id);
                });
                if(select_tags.length > 0){
                    select_tags.forEach((event,index)=>{
                        this.label_cloth_list.forEach((ev,i)=>{
                            if(event === ev.id){
                                tags_arr.push([2,ev.tag_category_id, ev.id]);
                            }
                        })
                        this.label_other_list.forEach((ev,i)=>{
                            if(event === ev.id){
                                tags_arr.push([1,ev.category_id, ev.id]);
                            }
                        })
                    })
                }
                this.$set(this.operationForm,'tag_ids',tags_arr);
                this.setTagsSelect();
            }else if(info.use_goods_type === 2){
                this.tabPosition = 'selected';
                this.selected_goods = info.use_goods_ids;
                this.getListData();
            }
            if (this.operationTitle === '编辑优惠券') {

            } else {
                this.$set(this.operationForm,'title', '');
                this.$set(this.operationForm,'coupon_amount', '');
                this.$set(this.operationForm,'with_amount', '');
            }
        },

        // 获取优惠券详情
        getDetail() {
            return new Promise((resolve, reject) => {
                let id = this.$route.query.id;
                if (!id) { return }
                let params = { coupon_id: Number(id) }
                queryCouponsDetail(params)
                    .then(async res => {
                        let data = _.cloneDeep(res.data);
                        // 详情回显
                        this.setDetailInfo(data);
                    })
                    .catch(err => {
                        console.log('err', err);
                        // reject(err.data)
                    })
            })
        },
        // 切换类型
        chooseCouponsType() {
            this.$set(this.operationForm, 'coupon_amount' , ''); // 清除优惠券面额
            this.$nextTick(()=>{
                this.$refs['fullReduction'].clearValidate(); // 清除优惠券面额的验证
            })
        },
        chooseValidityType(){

        },
        // 使用门槛切换
        chooseThresholdType(){
            this.$refs['fullReduction'].clearValidate(); // 清除优惠券面额的验证
        },

        // 有无封顶优惠切换
        disTopChange() {

        },

        // 保存
        handleSave() {
            this.$refs['operationForm'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    // let params = _.cloneDeep(this.operationForm);
                    let params = {
                        type: Number(this.operationForm.type),
                        title: this.operationForm.title,
                        valid_type: Number(this.operationForm.valid_type),
                        valid_days : 0,
                        shop_id: Number(this.operationForm.shop_id),
                        quota: Number(this.operationForm.quota),
                        with_amount: 0,
                        discount_top: 0,
                        coupon_amount: 0,
                        person_get_count: 0,
                        use_goods_type: Number(this.operationForm.use_goods_type),
                        use_goods_ids: [],
                        use_goods_tag_ids: []
                    }

                    if(this.operationForm.type===2){
                        params['discount_top'] = commUtil.numberMul(Number(this.operationForm.discount_top), 100); // 封顶优惠
                        params['coupon_amount'] = commUtil.numberMul(Number(this.operationForm.coupon_amount), 10); // 优惠券金额-折扣
                    }else {
                        params['coupon_amount'] = commUtil.numberMul(Number(this.operationForm.coupon_amount), 100); // 优惠券金额
                    }
                    // 使用门槛
                    if(this.operationForm.threshold===2){
                        params['with_amount'] = commUtil.numberMul(Number(this.operationForm.with_amount), 100);
                    }else {
                        params['with_amount'] = 0;
                    }
                    if(this.operationForm.person_get_type===2){
                        params['person_get_count'] = this.operationForm.person_get_count;
                    }
                    let editParams = {
                        id: Number(this.$route.query.id),
                        use_goods_ids:[],
                        use_goods_tag_ids:[],
                    };
                    if (this.operationForm.use_goods_type === 3) {
                        let _list = [];
                        if (this.operationForm.tag_ids.length) {
                            this.operationForm.tag_ids.forEach((ev)=>{
                                _list.push(ev[3]);
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
                        params['use_goods_tag_ids'] = _list;
                        editParams['use_goods_tag_ids'] = _list;
                    }
                    if (this.operationForm.use_goods_type === 2) {
                        editParams['use_goods_tag_ids'] = [];
                        if (this.selected_goods.length > 0) {
                            params['use_goods_ids'] = this.selected_goods;
                            editParams['use_goods_ids'] = this.selected_goods;
                        }else {
                            this.$notify({
                                title: '请先指定商品',
                                message: '',
                                type: 'warning',
                                duration: 5000
                            })
                            return
                        }
                    }
                    if(this.operationTitle === '编辑优惠券'){
                        editParams['id'] = Number(this.$route.query.id);
                        // 请求编辑
                        this.queryEdit(editParams);
                    }else {
                        if(this.operationForm.valid_type===2){ // 有效期间
                            // params['valid_start_time'] = this.getTime(this.operationForm.valid_start_time);
                            // params['valid_end_time'] = this.getTime(this.operationForm.valid_end_time);
                            let valid_start = this.getTime(this.operationForm.valid_start_time).toString();
                            let valid_end = this.getTime(this.operationForm.valid_end_time);
                            valid_start = new Date(valid_start);
                            valid_end = new Date(valid_end);
                            params['valid_start_time'] = valid_start.getTime()/1000;
                            params['valid_end_time'] = valid_end.getTime()/1000;
                        }else {
                            params['valid_days'] = Number(this.operationForm.valid_days);
                        }
                        // 领用时间
                        let grant_start = this.getTime(this.operationForm.grant_start_time);
                        let grant_end = this.getTime(this.operationForm.grant_end_time);
                        grant_start = new Date(grant_start);
                        grant_end = new Date(grant_end);
                        params['grant_start_time'] = grant_start.getTime()/1000;
                        params['grant_end_time'] = grant_end.getTime()/1000;
                        this.queryAdd(params);
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
        },

        // 取消
        handleCancel(){
            bus.$emit('close_current_tags')
            this.$router.push({
                path: 'mall-backend-coupons'
            })
        },

        // 请求 -- 添加
        queryAdd(params){
            const rLoading = this.openLoading();
            let that = this;
            creatCoupons(params)
                .then(async res => {
                    rLoading.close();
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
                    rLoading.close();
                })
        },

        // 请求 -- 编辑
        queryEdit(editParams){
            const rLoading = this.openLoading();
            let that = this;
            updateCoupons(editParams)
                .then(async res => {
                    rLoading.close();
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
                    rLoading.close();
                })
        },

        getTimeLe(val){
        },

        getTimeGe(val){
        },

        // 商品筛选 -- 分类选中值变化
        cateChange(ev) {
            // const arrIndex = this.searchForm.cateArr.length - 1;
            // const cateId = this.searchForm.cateArr[arrIndex];
            // console.log('cateId =====>', cateId);
            // this.$set(this.searchForm, 'category', cateId);
            if (this.$refs.refHandle) {
                const children = this.$refs.refHandle.getCheckedNodes();
                if(children.length > 0){
                    if (children[0].children.length < 1) {
                        //判断有没有下级
                        this.$refs.refHandle.dropDownVisible = false; //监听值发生变化就关闭它
                    }
                }else{
                    this.$refs.refHandle.dropDownVisible = false; //监听值发生变化就关闭它
                }
            }
        },

        // 选中分类
        handleSelectCate(e, data) {
            let parentPreviousElement = e.target.parentElement.previousElementSibling;
            let inputRadio = parentPreviousElement.children[0].children[1];
            if (!data.children) {
                inputRadio.click();
            }
        },

        // 可用商品类型类型
        useGoodsTypeChange(){
            if(Number(this.operationForm.use_goods_type) === 2){
                this.getListData();
            }
        },

        // 按钮-切换 选中未选中
        tabClick(){
            this.goodsPage = 1;
            this.getListData();
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.goodsPage = val;
            this.searchForm = _.cloneDeep(this.searchParams);
            this.getListData();
        },

        // 按钮-触发搜索 -- 存储搜索条件
        handleSearch(formName) {
            this.goodsPage = 1;
            this.searchParams = _.cloneDeep(this.searchForm);
            this.getListData();
        },

        // 重置
        resetForm(formName){
            this.$refs['searchForm'].resetFields();
            this.searchParams = _.cloneDeep(this.searchForm);
            this.getListData();
        },

        // 勾选
        handleSelectionChange(val) {
            this.checkedList = val;
        },

        goodsInit(){
            this.goodsPage = 1;
            this.goodsData = [];
            this.pageTotal = 0;
            this.imgList = [];
            this.previewIndex = 0;
        },

        // 添加选中
        handleAddSelected(){
            if(this.checkedList.length > 0){
                this.loadingTip = this.uploadLoading('加载中');
                this.addOrDelSuccess(this.checkedList,'add');
                this.goodsInit();
                this.getListData();
            }else {
                this.$notify({
                    title: '请勾选商品后再添加',
                    message: '',
                    type: 'error',
                    duration: 3000
                });
            }
        },

        // 添加该分类
        handleAddCate(){
            this.addOrDelCate('add');
        },

        // 输出 -- 分类id
        backCateId(){
            let cateId = -1;
            if(this.searchParams.cateArr.length > 0){
                const selected_cate = this.searchParams.cateArr;
                if(selected_cate.length > 1){
                    cateId = selected_cate[1];
                }else {
                    cateId = 0;
                }
            }
            return cateId
        },

        // 添加/删除分类
        addOrDelCate(type){
            this.searchForm = _.cloneDeep(this.searchParams);
            if(this.searchParams.cateArr.length > 0){
                this.loadingTip = this.uploadLoading('加载中');
                const cate_id = this.backCateId();
                if(this.searchParams.goods_name){
                    // 搜索中 有商品名称  重新请求 该分类下商品列表数量 先获取商品总数
                    this.getGoodsListTotal(type, cate_id, 'cete');
                }else {
                    // 搜索中 不含有商品名称  可以直接获取到商品总数
                    this.cateLimit = this.pageTotal;
                    this.getAllOrCateGoods('', type, cate_id, 'cate');
                }
            }else {
                this.$notify({
                    title: '请选择分类并搜索后再添加该分类',
                    message: '',
                    type: 'error',
                    duration: 3000
                });
            }
        },

        // 添加全部商品
        handleAddAll(){
            this.addOrDelAll('add');
        },

        // 添加或移除全部/搜索
        addOrDelAll(type){
            this.searchForm = _.cloneDeep(this.searchParams);
            if (this.goodsData.length > 0) {
                this.loadingTip = this.uploadLoading('加载中');
                const cate_id = this.backCateId();
                this.getGoodsListTotal(type, cate_id, 'all');
            } else {
                this.$notify({
                    title: type === 'add'?"无可添加商品":"无可移除商品",
                    message: '',
                    type: 'error',
                    duration: 3000
                });
            }
        },

        // 移除选中
        handleDelSelected(){
            if(this.checkedList.length > 0){
                this.addOrDelSuccess(this.checkedList,'del');
                this.goodsInit();
                this.getListData();
            }else {
                this.$notify({
                    title: '请勾选商品后再移除',
                    message: '',
                    type: 'error',
                    duration: 3000
                });
            }
        },

        // 移除该分类
        handleDelCate(){
            // 请选择分类并搜索后再移除该分类
            this.addOrDelCate('del');
        },

        // 清空已添加
        handleDelAll(){
            this.addOrDelAll('del');
        },

        // 添加单个
        handleAddItem(index,row){
            let _arr = [];
            _arr.push(row);
            this.loadingTip = this.uploadLoading('加载中');
            this.addOrDelSuccess(_arr,'add');
            this.goodsInit();
            this.getListData();
        },

        // 移除单个
        handleDelItem(index,row){
            let _arr = [];
            _arr.push(row);
            this.loadingTip = this.uploadLoading('加载中');
            this.addOrDelSuccess(_arr,'del');
            this.goodsInit();
            this.getListData();
        },

        // 获取分类下商品数量/全部商品数量
        getGoodsListTotal(type, cate_id, str){
            let params = {
                page: 1,
                limit: 10,
                goods_name: str === 'cate' ? '' : this.searchParams.goods_name,
                category_id: cate_id,
                goods_ids: this.tabPosition === 'selected' ? this.selected_goods:[],
                not_goods_ids: this.tabPosition === 'selected' ? []:this.selected_goods,
            };
            queryCouponGoodsList(params).then((res) => {
                this.imgList = [];
                this.previewIndex = 0;
                if(res.code === 200){
                    if(res.data){
                        if(str === 'all'){
                            this.allLimit = res.data.total;
                        }else {
                            this.cateLimit = res.data.total;
                        }
                        if(res.data.total > 10){
                            this.getAllOrCateGoods('', type, cate_id, str);
                        }else {
                            this.addOrDelSuccess(res.data.lists || [],type);
                        }
                    }
                }else {
                    this.loadingTip.close();
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }

            }).catch(() => {
                this.loadingTip.close();
            });
        },
        // 添加成功/移除成功
        addOrDelSuccess(list, type){
            this.loadingTip.close();
            if (list.length > 0) {
                let new_goods_list = [];
                list.forEach((ev)=>{
                    new_goods_list.push(ev.goods_id);
                });
                let tipText = '';
                if(type === 'add'){
                    let old_list = _.cloneDeep(this.selected_goods);
                    this.selected_goods = [...old_list, ...new_goods_list];
                    tipText = "已移入到'已添加'列表";
                }else if(type === 'del'){
                    let new_arr = _.cloneDeep(this.selected_goods);
                    new_arr = new_arr.filter(function(item){
                        return new_goods_list.indexOf(item) == -1;
                    });
                    this.selected_goods = new_arr;
                    tipText = "已移除,可到'未添加'列表查看";
                }
                this.$notify({
                    title: tipText,
                    message: '',
                    type: 'success',
                    duration: 3000
                });
                this.goodsInit();
                this.getListData();
            } else {
                this.$notify({
                    title: type === 'add'?'无可添加商品':'无可移除商品',
                    message: '',
                    type: 'error',
                    duration: 3000
                });
            }
        },

        // 获取 总商品 / 分类下商品
        getAllOrCateGoods(name, type, cate_id, str){
            let params = {
                page: 1,
                limit: str === 'all' ? this.allLimit : this.cateLimit,
                goods_name: str === 'cate' ? '' : this.searchParams.goods_name,
                category_id: cate_id,
                goods_ids: this.tabPosition === 'selected' ? this.selected_goods:[],
                not_goods_ids: this.tabPosition === 'selected' ? []:this.selected_goods,
            };
            queryCouponGoodsList(params).then((res) => {
                this.imgList = [];
                this.previewIndex = 0;
                if(res.code === 200){
                    if(res.data){
                        if(str === 'all'){
                            // console.log('全部商品/搜索');
                        }else {
                            // console.log('分类商品');
                        }
                        this.addOrDelSuccess(res.data.lists || [], type);
                    }
                }else {
                    this.loadingTip.close();
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }

            }).catch(() => {
                this.loadingTip.close();
            });
        },

        // 商品列表
        getListData(){
            let cateId = this.backCateId();
            let params = {
                page: this.goodsPage,
                limit: this.goodsLimit,
                goods_name: this.searchParams.goods_name,
                category_id: cateId,
                goods_ids: this.tabPosition === 'selected' ? this.selected_goods:[]
            };
            if(this.tabPosition === 'selected'){
                if(this.selected_goods.length > 0){
                    params['goods_ids'] = this.selected_goods;
                }else {
                    this.goodsInit();
                    return
                }
            }else {
                params['goods_ids'] = [];
                params['not_goods_ids'] = this.selected_goods;
            }
            const rLoading = this.openLoading();
            queryCouponGoodsList(params).then((res) => {
                rLoading.close();
                this.imgList = [];
                this.previewIndex = 0;
                if(res.code === 200){
                    if(res.data){
                        this.goodsData = res.data.lists || [];
                        this.pageTotal = res.data.total;
                        this.goodsData.forEach((item)=>{
                            this.imgList.push(item.goods_img);
                        });
                    }
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }

            }).catch(() => {});
        },

        // 标签选中变化
        tagsChange(val){
            this.setTagsSelect();
        },
        setTagsSelect(){
            let show_tags = [];
            // 标签(布)列表 labelCloth 标签(其它)列表 labelOther
            let all_Label = [...this.label_cloth_list, ...this.label_other_list];
            all_Label.forEach((ev)=>{
                this.operationForm.tag_ids.forEach((item)=>{
                    if(ev.id === item[2]){
                        show_tags.push(ev);
                    }
                })
            });
            this.showTags = show_tags;
        },
        // 删除标签 （可用商品 - 指定标签）
        delTags(tag, index){
            let new_tag = _.cloneDeep(this.operationForm.tag_ids);
            new_tag.forEach((item,i)=>{
                if(tag.id === item[2]){
                    new_tag.splice(i,1);
                }
            })
            this.$set(this.operationForm,'tag_ids',new_tag)
            this.setTagsSelect();
        },
        // 打开大图预览
        openPreview(img, type, index) {
            this.previewUrlList = this.imgList;
            this.previewIndex = index
            this.dialogVisiblePic = true
        },
        // 关闭大图
        closePreview() {
            this.dialogVisiblePic = false
        },
        // 格式化标签数据
        handlerData(arr) {
            let obj = {};
            arr.forEach((item, index) => {
                let { tag_category_id } = item;
                if (!obj[tag_category_id]) {
                    obj[tag_category_id] = {
                        tag_category_id,
                        children: []
                    };
                }
                obj[tag_category_id].children.push(item);
            });
            let data = Object.values(obj);
            data.forEach(ev => {
                ev['name'] = ev.children[0].tag_category_name;
                ev['id'] = ev.tag_category_id;
            });
            // 最终输出
            return data;
        },
        //时间格式化
        getTime(val){
            if(val){
                const dt = new Date(val);
                let year = dt.getFullYear(); //年
                let month = dt.getMonth() +1; //月
                let date = dt.getDate(); //日
                let hh = dt.getHours(); //时
                let mm = dt.getMinutes(); //分
                let ss = dt.getSeconds(); //秒
                month = month < 10 ? "0" + month : month;
                date  = date <10 ? "0" + date : date;
                hh  = hh <10 ? "0" + hh : hh;
                mm  = mm <10 ? "0" + mm : mm;
                ss  = ss <10 ? "0" + ss : ss;
                let new_time = ''
                new_time = year + "-" + month + "-" + date + ' ' + hh + ':' + mm + ':' + ss;
                return new_time;
            }else {
                return '-1'
            }
        },
    }
}
