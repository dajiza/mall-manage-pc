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
                    <el-upload
                        list-type="picture-card"
                        class="upload-demo"
                        :action="uploadImgUrl"
                        :headers="header"
                        :before-upload="beforeUpload"
                        :on-success="uploadImgSuccess"
                        :on-error="uploadImgError"
                        :on-remove="handleRemove"
                        :on-exceed="handleExceed"
                        :on-preview="handlePictureCardPreview"
                        multiple
                        :limit="6"
                    >
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </div>

                <el-form-item label="名称" prop="name">
                    <el-input style="width:280px" placeholder="名称" v-model="goods.name"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="name">
                    <el-select class="filter-item" v-model="formFilter.category_id" placeholder="请选择" style="width:280px">
                        <el-option v-for="item in categoryList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标签" prop="name">
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
                    <el-checkbox v-model="goods.is_free">是</el-checkbox>
                    <el-checkbox v-model="goods.is_free">是</el-checkbox>
                </el-form-item>
                <div class="divider"></div>
                <!-- <div class="sub-title">
                    <div class="text">自定义属性</div>
                </div> -->
                <el-form-item label="自定义属性">
                    <el-checkbox v-model="goods.is_free">是</el-checkbox>
                    <el-checkbox v-model="goods.is_free">是</el-checkbox>
                </el-form-item>
            </div>
            <!-- SKU信息 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">SKU信息</div>
                <el-button type="success" @click="addSku">成功按钮</el-button>
            </div>
            <div class="divider"></div>
            <div class="content">
                <el-table
                    :data="goods.sku_list"
                    v-loading.body="listLoading"
                    :header-cell-style="$tableHeaderColor"
                    element-loading-text="Loading"
                    fit
                    highlight-current-row
                >
                    <el-table-column label="操作" width="160">
                        <template slot-scope="scope">
                            <el-button class="opt-btn" type="primary" size="small" @click.native="deleteSku(scope.$index)">删除SKU</el-button>
                            <el-button class="opt-btn" type="danger" size="small" @click.native="setTimg(scope.row, scope.$index)">设为主商品</el-button>
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
                    <el-table-column label="最低售价(元)" width="">
                        <template slot-scope="scope">
                            <el-input class="default-input" placeholder="" v-model="scope.row.min_price"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="显示售价(元)" width="">
                        <template slot-scope="scope">
                            <el-input class="default-input" placeholder="" v-model="scope.row.display_price"></el-input>
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
                    <el-table-column label="库存预警" width="">
                        <template slot-scope="scope">
                            <el-input class="default-input" placeholder="" v-model="scope.row.stock_warning"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="品牌" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_brand }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="产地" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_origin }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="材质" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_material }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="颜色" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attr_color }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="花纹" width="">
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
                    <el-radio v-model="goods.is_free" :label="2">是</el-radio>
                    <el-radio v-model="goods.is_free" :label="1">否</el-radio>
                </el-form-item>

                <el-form-item label="是否上架商品">
                    <el-radio v-model="goods.is_free" :label="2">是</el-radio>
                    <el-radio v-model="goods.is_free" :label="1">否</el-radio>
                </el-form-item>
                <el-form-item label="虚拟销量" prop="name">
                    <el-input style="width:200px" placeholder="名称" v-model="goods.name"></el-input>
                </el-form-item>
                <div>
                    <el-form-item label="邮费模板" prop="name">
                        <el-select class="filter-item" v-model="formFilter.category_id" placeholder="请选择" style="width:280px">
                            <el-option v-for="item in categoryList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <el-form-item label="指定代理" prop="name">
                    <el-select class="filter-item" v-model="formFilter.category_id" placeholder="请选择" style="width:280px">
                        <el-option v-for="item in categoryList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>

                    <el-tag class="tag" v-for="tag in statusList" :key="tag.value" size="medium" closable @close="handleCloseTag(tag)">
                        {{ tag.label }}
                    </el-tag>
                </el-form-item>
            </div>
        </el-form>
        <!-- 仓库产品 -->
        <store-product-list ref="productList" @check-sku="getSku" :checkedSku="goods.sku_list"></store-product-list>
        <!-- 图片预览 -->
        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
    </div>
</template>
<script>
import { creatGoods } from '@/api/goods';
import { formatMoney } from '@/plugin/tool';
import { getToken } from '@/utils/auth';
import storeProductList from '@/components/common/store-product-list/StoreProductList';

export default {
    data() {
        return {
            header: {},
            dialogVisible: false,
            dialogImageUrl: '',
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
                tag_ids: '1,2,3', // //标签id，多个id ","逗号隔开
                category_id: 0, //'分类 0 布料  否则为其他的商品分类'
                consume_attr_ids: [1, 2, 8], //属性ids 数量最多为3 最少为1
                is_allow_agent: 1, //是否所有代理可以销售：1指定代理；2所有代理可以销售；是否分销
                allow_shop_ids: [1], //允许的店铺id
                display_sales: 998, //展示的销量
                status: 1, ////1下架；2上架
                freight_id: 1, //运费模版id
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
                    },
                    {
                        storehouse_pid: 78 //所选的仓库产品id
                    },
                    {
                        storehouse_pid: 73 //所选的仓库产品id
                    },
                    {
                        storehouse_pid: 71 //所选的仓库产品id
                    }
                ]
            },
            rules: {},

            value: null,
            list: null,
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            checkedList: [], //表格选中列表
            // 分类 0 布料  否则为其他的商品分类
            categoryList: [
                { value: '0', label: '布料' },
                { value: '1', label: '其他' }
            ],
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
    },
    methods: {
        formatMoney: formatMoney,
        // 合并单元格
        arraySpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 9) {
                return [1, 6];
            }
            if (columnIndex > 9) {
                return [0, 0];
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
        setTimg(row, index) {
            console.log('GOOGLE: row', row);
            console.log('GOOGLE: index', index);
            this.goods.sku_list.unshift(row);
            this.goods.sku_list.splice(index + 1, 1);

            // this.goods.sku_list.splice(index, 1);
        },
        // 图片上传前检测
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
        // 单张图片上传成功回调
        uploadImgSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.$notify({
                    title: '上传成功',
                    message: '',
                    type: 'success',
                    duration: 500
                });
                this.upload_loading.close();
                this.filePic = fileList;
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
        // 单张图片上传失败回调
        uploadImgError(err, file, fileList) {
            this.upload_loading.close();
            this.$notify({
                title: '上传失败',
                message: '',
                type: 'error',
                duration: 5000
            });
        },
        handleExceed(files, fileList) {
            this.$notify({
                title: '只能上传6张图片',
                message: '',
                type: 'warning',
                duration: 5000
            });
        },
        handleRemove(file, fileList) {
            this.filePic = fileList;
        },
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },

        handleSelectionChange(val) {
            this.checkedList = val;
            console.log('GOOGLE: val', val);
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
        }
    }
};
</script>
<style scoped="scoped" lang="less">
.table-title {
    margin-top: 16px;
}
.table-title:first {
    margin-top: 0px;
}
.content {
    background: #fff;
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
