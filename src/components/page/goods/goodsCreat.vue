<template>
    <div class="app-container">
        <el-form class="freight-form" :inline="true" label-position="top" :model="goods" :rules="rules" ref="formRef">
            <!-- 新增商品 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">新增商品</div>
            </div>
            <div class="divider"></div>
            <div class="content">
                <div class="upload">
                    <el-form-item label="首图 可上传图片">
                        <el-upload
                            list-type="picture-card"
                            :class="timg.length > 0 ? 'hide-upload' : ''"
                            :action="uploadImgUrl"
                            :headers="header"
                            :before-upload="beforeUpload"
                            :on-success="uploadImgSuccess"
                            :on-error="uploadImgError"
                            :on-remove="handleRemove"
                            :on-preview="handlePictureCardPreview"
                            :file-list="timg"
                            :limit="1"
                        >
                            <i class="el-icon-plus"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="可上传图片/视频">
                        <el-upload
                            list-type="picture-card"
                            :class="tfile.length > 4 ? 'hide-upload' : ''"
                            :action="uploadImgUrl"
                            :headers="header"
                            :before-upload="beforeUploadMultiple"
                            :on-success="uploadImgSuccessMultiple"
                            :on-error="uploadImgErrorMultiple"
                            :on-remove="handleRemoveMultiple"
                            :on-exceed="handleExceedMultiple"
                            :on-preview="handlePictureCardPreview"
                            :file-list="tfile"
                            multiple
                            :limit="5"
                        >
                            <i class="el-icon-plus"></i>
                            <div slot="file" slot-scope="{ file }">
                                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                                <span class="el-upload-list__item-actions">
                                    <span class="el-upload-list__item-delete" @click="handlePictureLeft(file)">
                                        <i class="el-icon-arrow-left"></i>
                                    </span>
                                    <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                                        <i class="el-icon-zoom-in"></i>
                                    </span>
                                    <span class="el-upload-list__item-delete" @click="handleRemoveMultiple(file)">
                                        <i class="el-icon-delete"></i>
                                    </span>
                                    <span class="el-upload-list__item-delete" @click="handlePictureRight(file)">
                                        <i class="el-icon-arrow-right"></i>
                                    </span>
                                </span>
                            </div>
                        </el-upload>
                    </el-form-item>
                </div>
                <el-form-item label="名称" prop="name">
                    <el-input style="width:280px" placeholder="名称" v-model="goods.name"></el-input>
                </el-form-item>
                <el-form-item label="分类">
                    {{ goods.type == 0 ? '布类' : '其他' }}
                </el-form-item>
                <el-form-item label="标签">
                    <el-button type="" size="mini" icon="el-icon-plus">标签</el-button>
                </el-form-item>
            </div>
            <!-- 展示属性 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">展示属性</div>
            </div>
            <div class="divider"></div>
            <div class="content">
                <el-form-item label="">
                    <el-checkbox-group v-model="basicChecked">
                        <el-checkbox v-for="item in basicAttr" @change="handleCheckedBasic" :key="item.id" :label="item.id">
                            {{ item.title }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <div class="divider"></div>
                <!-- <div class="sub-title">
                    <div class="text">自定义属性</div>
                </div> -->
                <el-form-item label="自定义属性">
                    <el-checkbox-group v-model="consumeChecked">
                        <el-checkbox v-for="item in consumeAttr" @change="handleConsumeBasic" :key="item.id" :label="item.id">{{ item.title }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </div>
            <!-- SKU信息 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">SKU信息</div>
                <el-button class="add-sku" type="success" @click="addSku">添加</el-button>
            </div>
            <div class="divider"></div>
            <div class="content content-table">
                <el-table
                    :data="goods.sku_list"
                    v-loading.body="listLoading"
                    :header-cell-style="$tableHeaderColor"
                    element-loading-text="Loading"
                    fit
                    highlight-current-row
                    :cell-style="setCellColor"
                >
                    <el-table-column label="操作" width="160">
                        <template slot-scope="scope">
                            <el-button class="opt-btn" type="danger" size="small" @click.native="deleteSku(scope.$index)">删除SKU</el-button>
                            <el-button class="opt-btn" type="primary" size="small" @click.native="setFirsetSku(scope.row, scope.$index)">设为主商品</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="">
                        <template slot-scope="scope">
                            <span :class="scope.row.status == 0 ? 'text-red' : 'text-blue'">{{ scope.row.status == 0 ? '下架' : '上架' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="SKU图片" width="130">
                        <template slot-scope="scope">
                            <img class="timg" :src="scope.row.sku_img" alt="" />
                        </template>
                    </el-table-column>
                    <el-table-column label="SKU名称" width="240">
                        <template slot-scope="scope">
                            <span>{{ scope.row.title }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="最低售价(元)" width="120">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.min_price'" :rules="rulesRequired">
                                <el-input class="default-input" placeholder="" v-model="scope.row.min_price"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="显示售价(元)" width="120">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.display_price'" :rules="rulesRequired">
                                <el-input class="default-input" placeholder="" v-model="scope.row.display_price"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="总库存" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_total }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="可用库存" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_apply }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="库存预警" width="120">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.stock_warning'" :rules="rulesInt">
                                <el-input class="default-input" placeholder="" v-model="scope.row.stock_warning"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <!-- 自定义属性 -->
                    <el-table-column :label="item.title" width="120" :property="item.id.toString()" v-for="(item, index) in attrDiyList" :key="item.id">
                        <template slot-scope="scope">
                            <el-form-item label="" label-width="0px" :prop="'sku_list.' + scope.$index + '.attrDiyValue.' + index" :rules="rulesRequired">
                                <el-input class="default-input" placeholder="" v-model="scope.row.attrDiyValue[index]"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[1]" width="" property="1">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_brand }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[2]" width="" property="2">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_color }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[3]" width="" property="3">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_origin }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[4]" width="" property="4">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_unit }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[5]" width="" property="5">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_material }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="ATTR_NAME[6]" width="" property="6">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_pattern }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="分类" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.category_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="标签" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.tag_names.join(',') }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!-- 销售设置 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">销售设置</div>
            </div>
            <div class="divider"></div>
            <div class="content">
                <el-form-item label="是否分销商品">
                    <el-radio v-model="goods.is_allow_agent" :label="2">是</el-radio>
                    <el-radio v-model="goods.is_allow_agent" :label="1">否</el-radio>
                </el-form-item>

                <el-form-item label="是否上架商品">
                    <el-radio v-model="goods.status" :label="2">是</el-radio>
                    <el-radio v-model="goods.status" :label="1">否</el-radio>
                </el-form-item>
                <el-form-item label="虚拟销量" prop="display_sales">
                    <el-input style="width:200px" placeholder="名称" v-model="goods.display_sales"></el-input>
                </el-form-item>
                <div>
                    <el-form-item label="邮费模板" prop="freight_id">
                        <el-select class="filter-item" v-model="goods.freight_id" placeholder="请选择" style="width:280px">
                            <el-option v-for="item in freightList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <el-form-item label="指定代理" :prop="goods.is_allow_agent == 1 ? '' : 'allow_shop_ids'">
                    <el-select
                        class="filter-item"
                        :disabled="goods.is_allow_agent == 1"
                        v-model="goods.allow_shop_ids"
                        placeholder="请选择"
                        style="width:280px"
                        multiple
                    >
                        <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                    </el-select>

                    <!-- <el-tag class="tag" v-for="tag in statusList" :key="tag.value" size="medium" closable @close="handleCloseTag(tag)">
                        {{ tag.label }}
                    </el-tag> -->
                </el-form-item>
            </div>
        </el-form>
        <div class="submit-wrap">
            <el-button class="submit-btn" type="primary" size="small" @click.native="submit">提交</el-button>
        </div>

        <!-- 仓库产品 -->
        <store-product-list ref="productList" @check-sku="getSku" :checkedSku="goods.sku_list"></store-product-list>
        <!-- 图片预览 -->
        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
    </div>
</template>
<script>
import { creatGoods, queryAttrList, queryShopList } from '@/api/goods';
import { queryFreightList } from '@/api/freight';

import { formatMoney } from '@/plugin/tool';
import { getToken } from '@/utils/auth';
import storeProductList from '@/components/common/store-product-list/StoreProductList';
import { ATTR, ATTR_NAME } from '@/plugin/constant';

export default {
    data() {
        return {
            ATTR_NAME,
            header: {},
            imgVedio: require('../../../assets/img/vedio.png'),
            dialogVisible: false,
            dialogImageUrl: '',
            timg: [],
            tfile: [],
            rules: {
                imgs: [{ required: true, message: '请上传图片', trigger: 'blur' }],
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
                ],
                display_sales: [{ required: true, message: '请输入销量', trigger: 'blur' }],
                freight_id: [{ required: true, message: '请选择运费模板', trigger: 'blur' }],
                allow_shop_ids: [{ required: true, message: '请选择代理', trigger: 'blur' }]
            },
            rulesRequired: [{ required: true, message: '请输入内容', trigger: 'blur' }],
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
            // 分类 0 布料  否则为其他的商品分类
            typeList: [
                { value: 0, label: '布料' },
                { value: 1, label: '其他' }
            ],
            freightList: [], //运费模板列表
            shopList: [
                { id: 1, shop_name: '川' },
                { id: 2, shop_name: '川家' },
                { id: 3, shop_name: '川家布' },
                { id: 4, shop_name: '川家布布' }
            ], //指定店铺列表
            goods: {
                title: 'this is title', //商品名称 maxlength =200
                imgs: [
                    //商品图片列表
                    {
                        img_url: 'https://storehouse-upyun.chuanshui.cn/2020-08-19/0rY89WZdNBm4BDlN/386ZRRCVeHfzZLict3TqmgwmK0oevpqE.jpg',
                        type: 1, //1 图片 2视频
                        sort: 123 //排序 倒叙
                    },
                    {
                        img_url: 'https://storehouse-upyun.chuanshui.cn/2020-08-19/0rY89WZdNBm4BDlN/386ZRRCVeHfzZLict3TqmgwmK0oevpqE.jpg',
                        type: 1,
                        sort: 124
                    }
                ],
                type: 1, //'类型：1布；2其他',
                tag_ids: '1,2,3', //标签id，多个id ","逗号隔开
                tag_idsArray: [], //标签id数组 暂存
                category_id: 0, //'分类 0 布料  否则为其他的商品分类'
                consume_attr_ids: [1, 2, 8], //属性ids 数量最多为3 最少为1
                is_allow_agent: 2, //是否所有代理可以销售：1指定代理；2所有代理可以销售；是否分销
                allow_shop_ids: [], //允许的店铺id
                display_sales: 998, //展示的销量
                status: 1, ////1下架；2上架
                freight_id: '', //运费模版id
                sku_list: [
                    {
                        storehouse_pid: 84, //所选的仓库产品id
                        title: '这是sku title', //sku名称 maxlenth =200
                        min_price: 1000, //最低价格 单位分
                        display_price: 2000, //展示价格 单位分
                        sku_img: 'https://storehouse-upyun.chuanshui.cn/2020-08-19/0rY89WZdNBm4BDlN/386ZRRCVeHfzZLict3TqmgwmK0oevpqE.jpg',
                        stock_warning: 9, //库存预警
                        attr_brand: '品牌',
                        attr_color: '颜色',
                        attr_material: '材质',
                        attr_unit: '米',
                        attr_pattern: '花纹',
                        status: 2, //1下架；2上架
                        tag_names: [1, 2],
                        attrDiyValue: ['', '', ''],
                        attr_list: [
                            //选择的sku展示的sku属性
                            {
                                attr_id: 8, //属性id
                                attr_title: '款式', //属性名称
                                attr_value: '这是款式' //属性值
                            },
                            {
                                attr_id: 1,
                                attr_title: '品牌',
                                attr_value: '一家'
                            },
                            {
                                attr_id: 2,
                                attr_title: '颜色',
                                attr_value: '蓝色'
                            }
                        ]
                    }
                    // {
                    //     storehouse_pid: 78 //所选的仓库产品id
                    // },
                    // {
                    //     storehouse_pid: 73 //所选的仓库产品id
                    // },
                    // {
                    //     storehouse_pid: 71 //所选的仓库产品id
                    // }
                ]
            },

            value: null,
            list: null,
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            checkedList: [], //表格选中列表

            // 是否上架：1下架；2上架
            statusList: [
                { value: '1', label: '下架' },
                { value: '2', label: '上架' }
            ],
            // 是否库存不足 1 足 2 不足(只有当所有sku 全部库存不足 为2
            shortageList: [
                { value: '1', label: '足' },
                { value: '2', label: '不足' }
            ],
            // 是否所有代理可以销售：1指定代理；2所有代理可以销售
            agentList: [
                { value: '1', label: '指定代理' },
                { value: '2', label: '所有代理可以销售' }
            ],

            reasonList: [],

            formFilter: {
                id: '',
                title: '',
                category_id: '',
                status: '',
                is_store_shortage: '',
                allow_agent: ''
            }
        };
    },
    components: {
        storeProductList
    },
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
        this.header['token'] = getToken();
    },
    mounted() {
        // this.getList();
        this.queryAttrList();
        this.queryFreightList();
        // this.queryShopList();
    },
    methods: {
        formatMoney: formatMoney,
        // 合并单元格
        // arraySpanMethod({ row, column, rowIndex, columnIndex }) {
        //     if (columnIndex === 9) {
        //         return [1, 6];
        //     }
        //     if (columnIndex > 9) {
        //         return [0, 0];
        //     }
        // },
        // reflashCellColor() {
        //     if (this.goods.sku_list.length > 0) {
        //         let value = this.goods.sku_list[0].min_price;
        //         this.goods.sku_list[0].min_price = value + 1;
        //         this.goods.sku_list[0].min_price = value;
        //         console.log('GOOGLE: this.goods.sku_list[0].min_price', this.goods.sku_list[0].min_price);
        //     }
        // },
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
        getList() {
            this.listLoading = true;
            let params = this.$refs['formFilter'].model;
            console.log('GOOGLE: params', params);

            params['limit'] = this.listQuery.limit;
            params['page'] = this.listQuery.page;
            queryGoodsList(params)
                .then(async res => {
                    if (res.data.lists == null) {
                        this.list = res.data.lists;
                        this.total = res.data.total;
                        this.listLoading = false;
                        return;
                    }
                    // 逐个获取库存信息
                    for (let i = 0; i < res.data.lists.length; i++) {
                        const product = res.data.lists[i];
                        if (!product.goods_sku) {
                            continue;
                        }
                        for (let j = 0; j < product.goods_sku.length; j++) {
                            const sku = product.goods_sku[j];
                            let parameters = { sku_id: sku.storehouse_pid };
                            let data = await queryStoreProduct(parameters);
                            sku.stock_total = data.data.stock_total;
                            sku.stock_apply = data.data.stock_apply;
                        }
                    }

                    this.list = res.data.lists;
                    this.total = res.data.total;
                    this.listLoading = false;
                })
                .catch(err => {});
        },
        // 运费列表
        queryFreightList() {
            queryFreightList()
                .then(res => {
                    this.freightList = res.data;
                })
                .catch(err => {});
        },
        // 属性列表
        queryAttrList() {
            queryAttrList()
                .then(res => {
                    console.log('GOOGLE: res', res);
                    this.basicAttr = res.data.consume_attr_basic_attr;
                    this.consumeAttr = res.data.consume_attr;
                    // 生成选中列表
                    // this.basicChecked = this.basicAttr.map(item => false);
                    // this.consumeChecked = this.consumeAttr.map(item => false);
                })
                .catch(err => {});
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    console.log('GOOGLE: res', res);
                    this.shopList = res.data;
                })
                .catch(err => {});
        },
        handleCheckedBasic(value) {
            console.log('GOOGLE: value', value);
            console.log('GOOGLE: this.consumeChecked', this.basicChecked);
            let length = this.consumeChecked.length + this.basicChecked.length;
            if (length > 3) {
                this.basicChecked.splice(this.basicChecked.indexOf(value), 1);
                this.$notify({
                    title: '最多只能选择3个属性',
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
                    title: '最多只能选择3个属性',
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
                console.log('GOOGLE:  this.attrDiyList', this.attrDiyList);
            }
        },
        getSku(e) {
            console.log('GOOGLE: e', e);
            this.goods.sku_list = e;
        },
        handleCloseTag(tag) {
            console.log('GOOGLE: tag', tag);
        },
        addSku() {
            this.$refs.productList.show();
        },
        // 删除sku
        deleteSku(index) {
            console.log('GOOGLE: index', index);
            this.goods.sku_list.splice(index, 1);
        },
        // 设为主商品
        setFirsetSku(row, index) {
            this.goods.sku_list.unshift(row);
            this.goods.sku_list.splice(index + 1, 1);
            this.setTimg();
        },
        // 生成首图
        setTimg() {
            let firstSku = this.goods.sku_list[0];
            this.timg = [{ url: firstSku.sku_img }];
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
            if (response.code === 200) {
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
                fileList.map(item => {
                    if (item.raw.type == 'video/mp4') {
                        item.url = this.imgVedio;
                    }
                    return item;
                });
                // this.tfile.push(file);
                this.tfile = fileList;
                console.log('GOOGLE: this.tfile', this.tfile);
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
            console.log('GOOGLE: file', file);
            this.tfile.splice(this.tfile.indexOf(file), 1);
            // this.tfile = fileList;
        },
        // 左移
        handlePictureLeft(file) {
            let index = this.tfile.indexOf(file);
            console.log('GOOGLE: index', index);
            if (index == 0) {
                return;
            }
            this.swapItems(index, index - 1);
        },
        // 右移
        handlePictureRight(file) {
            let index = this.tfile.indexOf(file);
            console.log('GOOGLE: index', index);
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
            console.log('GOOGLE: this.tfile', this.tfile);
        },
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },

        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.getList();
        },
        // 重置
        resetForm(formName) {
            console.log(this.$refs[formName].model);
            this.$refs[formName].resetFields();
            console.log(this.$refs[formName].model);
            this.handleFilter();
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val;
            this.getList();
        },
        handleCurrentChange(val) {
            this.listQuery.page = val;
            this.getList();
        },
        submit() {
            console.log('GOOGLE: goods.allow_shop_ids', this.goods.allow_shop_ids);
            this.$refs['formRef'].validate(valid => {
                // 验证表单内容
                if (valid) {
                    if (this.timg.length == 0) {
                        this.$notify({
                            title: '请上传首图',
                            message: '',
                            type: 'warning',
                            duration: 5000
                        });
                        return;
                    }
                    let imgList = this.timg.concat(this.tfile);
                    let length = imgList.length + 1;
                    let imgs = imgList.map(item => {
                        let url, type;
                        if (item.response) {
                            url = item.response.data.file_url;
                            type = item.raw.type == 'image/jpeg' ? 2 : 1;
                        } else {
                            url = item.url;
                            type = item.type;
                        }
                        length--;
                        return {
                            img_url: url,
                            type: type, //1 图片 2视频
                            sort: length //排序 倒叙
                        };
                    });
                    console.log('GOOGLE: imgs', imgs);
                }
            });
        }
    }
};
</script>
<style scoped="scoped" lang="less">
.table-title {
    margin-top: 16px;
    .add-sku {
        margin-right: 20px;
        margin-left: auto;
    }
}
.table-title:first {
    margin-top: 0px;
}
.content-table {
    .el-form-item {
        margin-right: 0 !important;
        margin-bottom: 0;
        padding: 14px 0;
    }
    .blue-column {
        background: #e7f4ff;
    }
}
.submit-wrap {
    text-align: center;
    .submit-btn {
        margin: 50px auto 0;
    }
}
.content {
    background: #fff;

    .hide-upload {
        & /deep/ .el-upload--picture-card {
            display: none;
        }
    }
    .opt-btn {
        margin: 0 0 10px 0;
        width: 105px;
    }
    .timg {
        width: 80px;
        height: 60px;
    }
    & /deep/ .el-form-item__label {
        color: #000000;
        font-weight: 500;
        font-size: 14px;
    }
    .el-form-item {
        margin-right: 80px;
    }
    .tag {
        margin-left: 10px;
    }
    .upload-demo {
        margin-bottom: 40px;
    }
    .sub-title {
        margin: 12px 0 20px;
        color: #000000;
        font-weight: 500;
        font-size: 14px;
    }
}
</style>
