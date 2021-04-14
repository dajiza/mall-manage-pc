<template>
    <div class="app-container live-container" @click="searchShow = false">
        <div class="table-title">
            <div class="line"></div>
            <div class="text">直播商品</div>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <el-form-item label="SKU名称" prop="sku_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.sku_name"></el-input>
                        </el-form-item>
                        <el-form-item label="直播商品名称" prop="live_name">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.live_name"></el-input>
                        </el-form-item>
                        <el-form-item label="店铺" prop="shop_id">
                            <el-select class="filter-item" v-model="formFilter.shop_id" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="状态" prop="status">
                            <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                                <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
            <!--<div class="shop-icon shop-all" v-if="!filterShop.id"><span class="iconfont icon-shop"></span><span class="text">所有店铺</span></div>-->
            <div class="shop-icon shop-filter" v-if="filterShop.id">
                <img class="shop-img" :src="filterShop.shop_icon" alt="" /><span class="text">{{ filterShop.shop_name }}</span>
            </div>
            <div class="search-value" >
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
            <div class="tabs-wrap">
                <el-radio-group v-model="tabPosition" class="tabs-nav" @change="tabClick()">
                    <el-radio-button label="not_put">未入库</el-radio-button>
                    <el-radio-button label="is_put">已入库</el-radio-button>
                </el-radio-group>
            </div>
            <el-button type="primary" @click="goodsCreat" class="shop-goods" v-hasPermission="'mall-backend-shop-create'">添加商品</el-button>
        </div>
        <el-table :height="tableHeight" :data="list" v-loading.body="listLoading" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="直播商品图片" width="128">
                <template slot-scope="scope">
                    <img class="timg" :src="scope.row.live_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.live_img,scope.$index)" />
                </template>
            </el-table-column>
            <el-table-column label="直播商品名称" prop="live_title" width="120"></el-table-column>
            <el-table-column label="SKU名称" prop="sku_title"></el-table-column>
            <el-table-column label="价格(元)" width="120">
                <template slot-scope="scope">
                    <div class="replace-img-wrap">
                        <span>{{ formatMoney(scope.row.live_price) }}</span>
                        <el-popover
                                :key="scope.row.id"
                                popper-class="popper-price"
                                placement="top"
                                width="220"
                                trigger="hover"
                                content="价格产生变化，与直播间不一致。"
                        >
                            <div slot="reference" class="replace-tip-box" v-if="scope.row.ssku_price != scope.row.live_price">
                                <img class="replace-img"
                                     src="../../../assets/img/remark-tip.svg"
                                     alt="" />
                            </div>
                        </el-popover>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="店铺" width="140">
                <template slot-scope="scope">
                    <span>{{return_shop(scope.row.shop_id)}}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
                <template slot-scope="scope">
                    <span>{{return_live_goods_status(scope.row.status)}}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="196">
                <template slot-scope="scope">
                    <el-button
                            class="text-blue table-btn"
                            type="text"
                            size=""
                            @click.native="handleSubmitAudit(scope.row)"
                            v-if="scope.row.status == 0"
                    >提交审核</el-button>
                    <el-button
                            class="text-blue table-btn"
                            type="text"
                            size=""
                            @click.native="handleCancelAudit(scope.row)"
                            v-show="scope.row.status == 1"
                    >撤销审核</el-button>
                    <el-button
                            class="text-blue table-btn"
                            type="text"
                            size=""
                            @click.native="handleOnEdit(scope.row)"
                            v-show="scope.row.status == 0 || scope.row.status == 3"
                    >编辑</el-button>
                    <el-button
                            class="text-blue table-btn"
                            type="text"
                            size=""
                            @click.native="handleSyncPrice(scope.row)"
                            v-if="(scope.row.status == 0 || scope.row.status == 2) && (scope.row.live_price != scope.row.ssku_price)"
                    >同步价格</el-button>
                    <el-button
                            class="text-red table-btn delete-color"
                            type="text"
                            size=""
                            @click.native="handleDelete(scope.row, scope.$index)"
                            v-show="scope.row.status !== 1"
                    >删除</el-button>
                </template>
            </el-table-column>
            <template slot="empty" >
                <EmptyList></EmptyList>
            </template>
        </el-table>
        <div class="pagination-container">
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="listQuery.page"
                :page-sizes="[20, 50, 100]"
                :page-size="listQuery.limit"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </div>
        <!-- 编辑商品 -->
        <el-dialog :visible.sync="dialogVisibleEdit" :close-on-click-modal="false" :before-close="handleCloseCreat" :title="dialogTitle" width="480px">
            <el-form ref="formGoodsEdit" :rules="editRules" :model="formGoodsEdit" :inline="true" size="small" label-position="top">
                <el-form-item label="直播商品名称：" prop="live_title">
                    <el-input class="dialog-item" placeholder="请输入" v-model="formGoodsEdit.live_title"></el-input>
                </el-form-item>
                <el-form-item label="图片" prop="title">
                    <div class="preview" v-if="filePic">
                        <img class="fullimg" :src="filePic + '!upyun520/fw/300'" alt="" />
                        <!-- <i class="el-icon-close"></i> -->
                    </div>
                    <el-upload
                        class="upload-demo"
                        :action="uploadImgUrl"
                        :headers="header"
                        :before-upload="beforeUpload"
                        :on-success="uploadImgSuccess"
                        :on-error="uploadImgError"
                        :show-file-list="false"
                    >
                        <el-button type="primary" v-if="filePic">更换图片</el-button>
                        <!--<div slot="tip" class="el-upload__tip">支持扩展名：jpg、png…</div>-->
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <template v-if="false">
                    <el-checkbox v-model="isSureAudit"></el-checkbox>
                    <span style="margin: 0 12px 0 6px">同时提交商品审核</span>
                </template>
                <el-button type="primary" @click="submitEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 新增直播商品 -->
        <liveGoodsSelectList ref="goodsList" @check-sku="getAddSku" :checked="checked_sku_list" :shopId="shopId"></liveGoodsSelectList>

        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreview" :url-list="previewUrlList" :initial-index="previewIndex" />
    </div>
</template>
<script>
import { queryLiveGoodsList, addLiveGoods, querySynchronousPrice,updateLiveGoods, deleteLiveGoods,querySubmitAudit,queryCancelAudit } from '@/api/live'
import { queryShopList } from '@/api/goods'
import { formatMoney } from '@/plugin/tool'
import { getToken } from '@/utils/auth'

import ElImageViewer from '@/components/common/image-viewer'
import EmptyList from '@/components/common/empty-list/EmptyList'
import liveGoodsSelectList from '@/components/common/live-goods-select-list/liveGoodsSelectList'
export default {
    name: 'live-goods',
    data() {
        return {
            header: {},
            list: null,
            total: 0,
            listLoading: false,
            loadingSelect: false,
            shopList: [],
            shopId: -1, //选中的店铺id
            listQuery: {
                page: 1,
                limit: 20
            },
            statusList: [
                { id: '0', label: '待审核' },
                { id: '1', label: '审核中' },
                { id: '2', label: '审核通过' },
                { id: '3', label: '审核驳回' },
                { id: '4', label: '异常' }
            ],
            formFilter: {
                sku_name: '', // SKU名称
                live_name: '', // 商品名称
                shop_id: '', //店铺名称 不搜索为空
                status: '',  //0待审核 1审核中 2审核通过 3审核驳回 4异常
            },
            searchParams: {
                sku_name: '', // SKU名称
                live_name: '', // 商品名称
                shop_id: '', //店铺名称 不搜索为空
                status: '',  //0待审核 1审核中 2审核通过 3审核驳回 4异常
            },
            dialogVisibleEdit: false, // 编辑商品
            editRules: {
                live_title: [
                    { required: true, message: '请输入名称', trigger: 'change' },
                    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'change' }
                ]
            },
            isCreat: true,
            filePic: '',
            formGoodsEdit: {
                live_title: '', //max=50
            },
            editGoodsId: -1,
            formOrderSubmit: {},
            dialogVisibleOrder: false,
            formOrder: {},
            uploadImgUrl: '',
            dialogTitle: '新增店铺',
            skuImgList: [],
            liveImgList: [],
            previewUrlList: [],
            previewIndex:0,
            dialogVisiblePic: false,
            tabPosition:'not_put',
            filterShop: {},
            isSureAudit: true , // 是否同时提交商品审核
            goods: {
                type: 1,
                sku_list: []
            },
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList:[],
            showMaxIndex: 0,
            checked_sku_list: [],
            Not_in_storage: [0,1,3,4], // 未入库
            in_storage: [2], // 已入库
        }
    },
    components: {
        ElImageViewer,
        EmptyList,
        liveGoodsSelectList
    },
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
    computed:{
        return_live_goods_status: function() {
            return data => {
                let status_cn = ''
                if (data === 0) {
                    status_cn = '未审核'
                } else if (data === 1) {
                    status_cn = '审核中'
                } else if (data === 2) {
                    status_cn = '审核通过'
                } else if (data === 3) {
                    status_cn = '审核驳回'
                } else if (data === 4) {
                    status_cn = '异常'
                }
                return status_cn
            }
        },
        return_shop: function() {
            return data => {
                let shop_name = ''
                if (data) {
                   let shop_obj = this.shopList.find(item => item.id == data)
                    shop_name = shop_obj.shop_name
                }
                return shop_name
            }
        },
    },
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
        this.header['token'] = getToken();
    },
    mounted() {
        this.queryShopList();
    },
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = _.cloneDeep(this.searchParams);
            if(this.tabPosition == 'not_put'){
                params['status_in'] = [0,1,3,4];
            }else {
                params['status_in'] = [2];
            }
            if(params['status']){
                params['status_in'] = [];
                params['status_in'].push(Number(params['status']));
                if(params['status'] == 2){
                    this.tabPosition = 'is_put';
                }else {
                    this.tabPosition = 'not_put';
                }
            }
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            if (params['shop_id']) {
                this.filterShop = this.shopList.find(item => item.id == params['shop_id'])
            } else {
                this.filterShop = {}
            }
            console.log('params', params);
            const rLoading = this.openLoading();
            queryLiveGoodsList(params)
                .then(res => {
                    rLoading.close();
                    console.log('GOOGLE: res', res)
                    this.list = res.data.lists || [];
                    this.total = res.data.total;
                    this.previewUrlList = [];
                    this.liveImgList = this.list.map(item => item.live_img);
                    this.skuImgList = this.list.map(item => item.sku_img);
                })
                .catch(err => {})
        },

        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data;
                    if(this.shopList.length > 0){
                        this.formFilter['shop_id'] = this.shopList[0].id;
                        this.searchParams['shop_id'] = this.shopList[0].id;
                        this.setSearchValue();
                        console.log('searchParams', this.searchParams)
                        this.getList();
                    }
                })
                .catch(err => {})
        },

        // 新增商品
        goodsCreat() {
            // 获取全部直播商品
            const rLoading = this.openLoading();
            const params = {
                shop_id: this.searchParams.shop_id,
                page: 1,
                limit: 9999,
                status_in: [0,1,2,3,4],
                sku_name: '',
                live_name: '',
            }
            queryLiveGoodsList(params)
                .then(res => {
                    rLoading.close();
                    console.log('GOOGLE: res', res)
                    let all_list = res.data.lists || [];
                    this.checked_sku_list  = [];
                    all_list.forEach((ev)=>{
                        if(this.checked_sku_list.indexOf(ev.sku_id) == -1){
                            this.checked_sku_list.push(ev.sku_id)
                        }
                    })
                    this.shopId = this.searchParams.shop_id;
                    console.log('this.checked_sku_list ', this.checked_sku_list );
                    this.$refs.goodsList.show()
                })
                .catch(err => {})

        },

        // 确定添加 商品
        getAddSku(sku_arr){
            console.log('sku_arr', sku_arr);
            let skuInfo = _.cloneDeep(sku_arr).map(item => {
                return { shop_sku_id: item.id, url: 'pages/goodsDetail/goodsDetail?goodsId='+ item.goods_id +'&skuId='+ item.sku_id}
            });
            const params = {
                shop_id: this.searchParams.shop_id,
                sku_info: skuInfo
            };
            const rLoading = this.openLoading();
            addLiveGoods(params)
                .then(res => {
                    rLoading.close();
                    if (res.code == 200) {
                        this.$notify({
                            title: '操作成功',
                            type: 'success',
                            duration: 3000
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
        },

        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model)
            this.$refs[formName].resetFields();
            if(this.shopList.length > 0){
                this.formFilter['shop_id'] = this.shopList[0].id;
            }
            this.handleFilter()
        },

        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.searchShow = false;
            this.searchParams = _.cloneDeep(this.formFilter);
            this.setSearchValue();
            this.getList();
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = [];
            // SKU名称 sku_name
            if(this.formFilter['sku_name']){
                let obj = {
                    label: 'sku_name',
                    val: this.formFilter['sku_name']
                }
                _search.push(obj)
            }
            // 直播商品名称 live_name
            if(this.formFilter['live_name']){
                let obj = {
                    label: 'live_name',
                    val: this.formFilter['live_name']
                }
                _search.push(obj)
            }
            // 店铺名称 shop_id
            // if(this.formFilter['shop_id']){
            //     this.shopList.forEach((ev)=>{
            //         if(ev.id == this.formFilter['shop_id']){
            //             let obj = {
            //                 label: 'shop_id',
            //                 val: ev.shop_name
            //             }
            //             _search.push(obj)
            //         }
            //     })
            // }
            // 状态
            if(this.formFilter['status']){
                this.statusList.forEach((ev)=>{
                    if(ev.id == this.formFilter['status']){
                        let obj = {
                            label: 'status',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter,item.label, '');
            this.$set(this.searchParams,item.label, '');
            this.handleFilter()
        },

        // 图片上传前检测
        beforeUpload(file) {
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

        // 单张图片上传成功回调
        uploadImgSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                })
                this.upload_loading.close()
                this.filePic = file.response.data.file_url
                console.log('输出 ~ this.filePic', this.filePic)
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

        // 单张图片上传失败回调
        uploadImgError(err, file, fileList) {
            this.upload_loading.close()
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            })
        },

        // 确定-编辑商品
        submitEdit() {
            // isSureAudit  是否同时提交审核
            this.$refs['formGoodsEdit'].validate(valid => {
                if (valid) {
                    if (this.filePic == '') {
                        this.$notify({
                            title: '请上传图片',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        })
                        return
                    }
                    this.formGoodsEdit['shop_icon'] = this.filePic
                    let params = {
                        id: this.editGoodsId,
                        live_title: this.formGoodsEdit.live_title,
                        live_img: this.filePic
                    }
                    const rLoading = this.openLoading();
                    updateLiveGoods(params)
                        .then(res => {
                            rLoading.close();
                            if (res.code == 200) {
                                this.$notify({
                                    title: '操作成功',
                                    type: 'success',
                                    duration: 3000
                                })
                                this.getList();
                                this.handleCloseCreat();
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    type: 'warning',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
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

        // 按钮-切换 选中未选中
        tabClick(){
            console.log('tabPosition', this.tabPosition)
            if(this.tabPosition == 'is_put'){
                if(this.searchParams['status'] != 2){
                    this.$set(this.formFilter, 'status', '2');
                    this.$set(this.searchParams, 'status', '2');
                }
            }else {
                if(this.searchParams['status'] == 2){
                    this.$set(this.formFilter, 'status', '');
                    this.$set(this.searchParams, 'status', '');
                }
            }
            this.handleFilter();
        },

        // 按钮- 编辑商品
        handleOnEdit(row){
            console.log('row', row)
            this.dialogTitle = '编辑';
            // this.formGoodsEdit = _.cloneDeep(row);
            this.$set(this.formGoodsEdit,'live_title',row.live_title);
            this.editGoodsId = row.id;
            this.filePic = row.live_img
            this.dialogVisibleEdit = true
        },

        // 关闭编辑商品对话框
        handleCloseCreat() {
            this.filePic = '';
            this.$refs['formGoodsEdit'].resetFields();
            this.$refs['formGoodsEdit'].clearValidate();
            this.dialogVisibleEdit = false;
        },

        // 同步价格
        handleSyncPrice(row){
            const params = {
                id: row.id
            };
            const rLoading = this.openLoading();
            querySynchronousPrice(params)
                .then(res => {
                    rLoading.close();
                    if (res.code == 200) {
                        this.$notify({
                            title: '操作成功',
                            type: 'success',
                            duration: 3000
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
        },

        // 提交审核
        handleSubmitAudit(row){
            const params = {
                id: row.id
            };
            const rLoading = this.openLoading();
            querySubmitAudit(params)
                .then(res => {
                    rLoading.close();
                    if (res.code == 200) {
                        this.$notify({
                            title: '操作成功',
                            type: 'success',
                            duration: 3000
                        })
                        // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                        // if(this.listQuery.page > 1 && this.list.length < 2){
                        //     this.$set(this.listQuery, 'page', this.listQuery.page - 1);
                        // }
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
        },

        // 撤销审核
        handleCancelAudit(row, index){
            // 二次确认删除
            this.$confirm('确定撤回审核吗？', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            }).then(() => {
                console.log('确定')
                const params = {
                    id: row.id
                };
                const rLoading = this.openLoading();
                queryCancelAudit(params)
                    .then(res => {
                        rLoading.close();
                        if (res.code == 200) {
                            rLoading.close();
                            this.$notify({
                                title: '操作成功',
                                type: 'success',
                                duration: 3000
                            })
                            // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                            // if(this.listQuery.page > 1 && this.list.length < 2){
                            //     this.$set(this.listQuery, 'page', this.listQuery.page - 1);
                            // }
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
            }).catch(() => {
                console.log('取消')
            });

        },

        // 按钮- 删除
        handleDelete(row, index){
            // 二次确认删除
            this.$confirm('确定要删除商品吗？删除后不可恢复', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            }).then(() => {
                console.log('确定')
                const params = {
                    id: row.id
                };
                const rLoading = this.openLoading();
                deleteLiveGoods(params)
                    .then(res => {
                        rLoading.close();
                        if (res.code == 200) {
                            this.$notify({
                                title: '操作成功',
                                type: 'success',
                                duration: 3000
                            })
                            // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                            if(this.listQuery.page > 1 && this.list.length < 2){
                                this.$set(this.listQuery, 'page', this.listQuery.page - 1);
                            }
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
            }).catch(() => {
                console.log('取消')
            });

        },

        // 切换每页显示条数
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`)
            this.$set(this.listQuery, 'limit', val)
            this.$set(this.listQuery, 'page', 1)
            this.getList()
        },

        // 切换分页
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.formFilter = _.cloneDeep(this.searchParams);
            this.setSearchValue();
            this.getList();
        },

        // 打开大图预览
        openPreview(img, index) {
            this.previewUrlList = this.liveImgList;
            this.previewIndex = index;
            this.dialogVisiblePic = true;
        },

        // 关闭大图
        closePreview() {
            this.dialogVisiblePic = false;
        },
    }
}
</script>
<style scoped="scoped" lang="less">
.timg {
    width: 80px;
    height: 60px;
    display: inline-block;
    vertical-align: bottom;
    cursor: pointer;
}
.table-title {
    position: relative;
    .search {
        font-size: 18px;
        cursor: pointer;
    }
    .grey-line {
        margin: 0 20px;
        width: 1px;
        height: 26px;
        background: #e6e6e6;
    }
    .head-container {
        position: absolute;
        top: 63px;
        z-index: 9;
        // border: 1px solid #000;
        border-radius: 2px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
        // transition: all 3s ease-in-out;
    }
}
.shop-goods {
    margin-right: 24px;
    margin-left: 12px;
}
.dialog-item {
    width: 400px;
}
.preview {
    position: relative;
    width: 200px;
    height: 150px;
    .fullimg {
        width: 100%;
        height: 100%;
    }
    .el-icon-close {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background-color: rgba(165, 165, 165, 0.65);
        color: #fff;
        text-align: center;
        line-height: 20px;
    }
}
.upload-demo{
    margin-top: 16px;
}
.status {
    display: flex;
    align-items: center;
    .text-grey {
        color: rgba(0, 0, 0, 0.25);
    }
    .dot {
        display: block;
        margin-right: 8px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
    }
}
.tabs-wrap{
    margin-left: auto;
    .tabs-nav{
        /deep/.el-radio-button--small .el-radio-button__inner{
            width: 74px;
        }
        /deep/.el-radio-button__orig-radio:checked+.el-radio-button__inner{
            background: #fff;
            color: #1890FF;
            border-color: #1890FF;
            -webkit-box-shadow: -1px 0 0 0 #1890FF;
            box-shadow: -1px 0 0 0 #1890FF;
        }
        /deep/.el-radio-button:first-child .el-radio-button__inner{
            border-radius: 2px 0 0 2px;
        }
        /deep/.el-radio-button:last-child .el-radio-button__inner{
            border-radius: 0 2px 2px 0;
        }
    }
}
.shop-icon {
    display: flex;
    margin-left: 23px;
    padding: 0 10px;
    height: 30px;
    border-radius: 15px;
    background: #ffffff;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
    font-weight: 500;
    font-size: 14px;
    line-height: 30px;
    &.shop-all {
        color: #1890ff;
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .icon-shop {
            margin-right: 6px;
        }
    }
    &.shop-filter {
        color: rgba(0, 0, 0, 0.85);
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
        .shop-img {
            margin-top: 5px;
            margin-right: 6px;
            width: 20px;
            height: 20px;
            border-radius: 10px;
        }
    }
}
.el-form-item--mini.el-form-item, /deep/.el-form-item--small.el-form-item:last-child{
    margin-bottom: 0 !important;
}
.popper-price{
    display: flex;
}
.replace-img-wrap {
    display: flex;
    align-items: center;
}
.replace-tip-box{
    display: flex;
    align-items: center;
    margin-left: 8px;
    .replace-img{
        cursor:pointer;
    }
}
.el-popover__reference-wrapper{
    display: flex;
}
.table-btn{
    margin-bottom: 0 !important;
}
</style>
<style>
    .el-message-box--center{
        padding-bottom: 24px;
    }
    .el-message-box__message{
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        line-height: 24px;
    }
    .el-message-box__status{
        font-size: 32px !important;
    }
    .el-message-box__btns{
        padding: 26px 15px 0;
    }
</style>