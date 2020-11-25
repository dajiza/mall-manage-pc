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
                            class="hide-upload"
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
                            class="hide-upload"
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
                                    <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                                        <i class="el-icon-zoom-in"></i>
                                    </span>
                                </span>
                            </div>
                        </el-upload>
                    </el-form-item>
                </div>
                <el-form-item label="名称" prop="title">
                    {{ goods.title }}
                </el-form-item>
                <el-form-item label="分类">
                    {{ goods.type == 1 ? '布类' : '其他' }}
                </el-form-item>
                <el-form-item label="标签">
                    <v-tag-picker
                        :tag-picker-dialog-visible="dialogVisibleTag"
                        @cancel="dialogCancelTag"
                        @confirm="dialogConfirmTag"
                        :options="options"
                        :value="pickerTag"
                    ></v-tag-picker>
                    <div>
                        <el-tag class="el-tag" type="warning" @close="handleCloseMiniApp(item)" v-for="item in miniProgramTags">{{ item.label }}</el-tag>
                    </div>
                    <div>
                        <el-tag class="el-tag" @close="handleCloseBack(item)" v-for="item in backendTags">{{ item.label }}</el-tag>
                    </div>
                    <!-- <el-button type="" size="mini" @click="dialogVisibleTag = true" icon="el-icon-plus">标签</el-button> -->
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
                        <el-checkbox disabled v-for="item in basicAttr" @change="handleCheckedBasic" :key="item.id" :label="item.id">
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
                        <el-checkbox disabled v-for="item in consumeAttr" @change="handleConsumeBasic" :key="item.id" :label="item.id">{{
                            item.title
                        }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </div>
            <!-- SKU信息 -->
            <div class="table-title">
                <div class="line"></div>
                <div class="text">SKU信息</div>
                <!-- <el-button class="add-sku" type="success" @click="addSku">添加</el-button> -->
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
                    <!-- <el-table-column label="操作" width="160">
                        <template slot-scope="scope">
                            <el-button class="opt-btn" type="danger" size="small" @click.native="deleteSku(scope.$index)" v-if="scope.row.sku_id == 0">
                                删除SKU
                            </el-button>
                            <el-button class="opt-btn" type="primary" size="small" @click.native="setFirsetSku(scope.row, scope.$index)">设为主商品</el-button>
                        </template>
                    </el-table-column> -->
                    <el-table-column label="状态" width="">
                        <template slot-scope="scope">
                            <span :class="[scope.row.status == 1 ? 'text-red' : 'text-blue', 'cursor']">
                                {{ scope.row.status == 1 ? '已下架' : '已上架' }}
                            </span>
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
                            <span>{{ scope.row.min_price }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="显示售价(元)" width="120">
                        <template slot-scope="scope">
                            <span>{{ scope.row.display_price }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="总库存" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_total }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="可用库存" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_available }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="库存预警" width="120">
                        <template slot-scope="scope">
                            <span>{{ scope.row.stock_warning }}</span>
                        </template>
                    </el-table-column>
                    <!-- 自定义属性 -->
                    <el-table-column :label="item.title" width="120" :property="item.id.toString()" v-for="(item, index) in attrDiyList" :key="item.id">
                        <template slot-scope="scope">
                            <span>{{ scope.row.attrDiyValue[index] }}</span>
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

                    <!-- <el-table-column label="分类" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.category_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="标签" width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.tag_names.join(',') }}</span>
                        </template>
                    </el-table-column> -->
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
                    <el-radio disabled v-model="goods.is_allow_agent" :label="2">是</el-radio>
                    <el-radio disabled v-model="goods.is_allow_agent" :label="1">否</el-radio>
                </el-form-item>

                <el-form-item label="是否上架商品">
                    <el-radio disabled v-model="goods.status" :label="2">是</el-radio>
                    <el-radio disabled v-model="goods.status" :label="1">否</el-radio>
                </el-form-item>
                <el-form-item label="虚拟销量" prop="display_sales">
                    {{ goods.display_sales }}
                </el-form-item>
                <div>
                    <el-form-item label="邮费模板" prop="freight_id">
                        <el-select disabled class="filter-item" v-model="goods.freight_id" placeholder="请选择" style="width:280px">
                            <el-option v-for="item in freightList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <el-form-item label="指定代理" :prop="goods.is_allow_agent == 2 ? '' : 'allow_shop_ids'">
                    <el-select
                        disabled
                        class="filter-item"
                        :disabled="goods.is_allow_agent == 2"
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
        <!-- <div class="submit-wrap">
            <el-button class="submit-btn" type="primary" size="small" @click.native="submit">提交</el-button>
        </div> -->

        <!-- 仓库产品 -->
        <store-product-list ref="productList" @check-sku="getSku" :checkedSku="goods.sku_list" :type="goods.type"></store-product-list>
        <!-- 图片预览 -->
        <el-dialog :visible.sync="dialogVisible" title="预览">
            <img width="100%" :src="dialogImageUrl" alt="" v-if="dialogViewType == 1" />
            <video-player
                class="video-player vjs-custom-skin"
                ref="videoPlayer"
                :playsinline="true"
                :options="playerOptions"
                v-if="dialogViewType == 2"
            ></video-player>
        </el-dialog>
        <el-dialog :visible.sync="dialogVisibleType" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" title="商品类型选择">
            <el-radio v-model="goods.type" :label="1">布料</el-radio>
            <el-radio v-model="goods.type" :label="2">其他</el-radio>
            <span slot="footer" class="dialog-footer">
                <el-button @click="gotoCreat">返 回</el-button>
                <el-button type="primary" @click="confirmType">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { creatGoods, queryAttrList, queryShopList, queryGoodsDetail, updateGoods } from '@/api/goods';
import { queryFreightList } from '@/api/freight';
import { getLabelAllList } from '@/api/goodsLabel';
import { formatMoney } from '@/plugin/tool';
import { getToken } from '@/utils/auth';
import { ATTR, ATTR_NAME } from '@/plugin/constant';
import storeProductList from '@/components/common/store-product-list/StoreProductList';
import vTagPicker from '../../common/TagPicker.vue';

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
            // 标签选择
            dialogVisibleTag: false,
            // 布料/其他 类型选择
            dialogVisibleType: false,
            options: {},
            miniProgramTags: [],
            backendTags: [],
            goods: {
                title: '', //商品名称 maxlength =200
                imgs: [],
                type: 1, //'类型：1布；2其他',
                tag_ids: '', //标签id，多个id ","逗号隔开
                tag_idsArray: [], //标签id数组 暂存
                category_id: 0, //'分类 0 布料  否则为其他的商品分类'
                consume_attr_ids: [], //属性ids 数量最多为3 最少为1
                is_allow_agent: 2, //是否所有代理可以销售：1指定代理；2所有代理可以销售；是否分销
                allow_shop_ids: [], //允许的店铺id
                display_sales: '', //展示的销量
                status: 2, //1下架；2上架
                freight_id: '', //运费模版id
                sku_list: []
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
            },
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
    computed: {
        pickerTag: function() {
            return this.miniProgramTags.concat(this.backendTags);
        }
    },
    components: {
        storeProductList,
        vTagPicker
    },
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
        this.header['token'] = getToken();
    },
    mounted() {
        this.initData();
    },
    methods: {
        formatMoney: formatMoney,
        async initData() {
            const rLoading = this.openLoading();
            Promise.all([
                getLabelAllList({
                    type: this.goods.type,
                    display_platform: 1
                }),
                getLabelAllList({
                    type: this.goods.type,
                    display_platform: 2
                }),
                queryFreightList(),
                queryAttrList(),
                queryShopList()
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
                    }
                    if (res[3].code === 200) {
                        this.basicAttr = res[3].data.consume_attr_basic_attr;
                        this.consumeAttr = res[3].data.consume_attr;
                    }
                    if (res[4].code === 200) {
                        this.shopList = res[4].data;
                    }
                    this.getDetail();
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
            let id = this.$route.params.id;
            console.log('GOOGLE: id', id);
            if (!id) {
                return;
            }
            let params = {
                goods_id: id
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

                    data['tag_detail_list'] = data['tag_detail_list'] == null ? [] : data['tag_detail_list'];
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
                    // format attr_list 及价格 title字段名 store_house_id=>storehouse_pid
                    console.log('GOOGLE: length', data['sku_list'].length);
                    for (let i = 0; i < data['sku_list'].length; i++) {
                        const skuItem = data['sku_list'][i];
                        console.log('GOOGLE: skuItem', skuItem);
                        skuItem.min_price = skuItem.min_price / 100;
                        skuItem.display_price = skuItem.display_price / 100;
                        skuItem['attrDiyValue'] = ['', '', ''];
                        skuItem['storehouse_pid'] = skuItem['store_house_id'];
                        skuItem['title'] = skuItem['sku_title'];
                        const attrList = skuItem['sku_attr_list'];
                        console.log('GOOGLE: attrList', attrList);
                        let diyAttrIndex = 0;
                        for (let j = 0; j < attrList.length; j++) {
                            const attrItem = attrList[j];
                            if (i == 0) {
                                if (attrItem.attr_id <= 6) {
                                    this.basicChecked.push(attrItem.attr_id);
                                } else {
                                    this.consumeChecked.push(attrItem.attr_id);
                                }
                            }
                            if (attrItem.attr_id > 6) {
                                skuItem['attrDiyValue'][diyAttrIndex] = attrItem.attr_value;
                                diyAttrIndex++;
                            }
                        }
                    }
                    console.log('GOOGLE: this.basicChecked', this.basicChecked);
                    console.log('GOOGLE: this.consumeChecked', this.consumeChecked);

                    this.goods = data;
                    console.log('GOOGLE: this.goods', this.goods);
                })
                .catch(err => {});
        },

        handleCheckedBasic(value) {
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
            }
        },
        getSku(pList) {
            for (let i = 0; i < this.goods.sku_list.length; i++) {
                const skuItem = this.goods.sku_list[i];
                let index = pList.findIndex(item => skuItem.storehouse_pid == item.storehouse_pid);
                if (index != -1) {
                    pList.splice(index, 1);
                }
            }
            this.goods.sku_list = this.goods.sku_list.concat(pList);
            this.setTimg();
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
        // 生成首图
        setTimg() {
            let firstSku = this.goods.sku_list[0];
            this.timg = [{ url: firstSku.sku_img }];
        },
        // sku上下架
        setSkuStatus(row, status, index) {
            if (row.stock_available == 0) {
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
                fileList = fileList.map(item => {
                    console.log('GOOGLE: item', item);
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
        handlePictureCardPreview(file) {
            console.log('GOOGLE: file', file);
            if (file.response) {
                this.dialogImageUrl = item.response.data.file_url;
                this.playerOptions['sources'][0]['src'] = this.dialogImageUrl;
                this.dialogViewType = file.raw.type == 'video/mp4' ? 2 : 1;
            } else {
                this.dialogImageUrl = file.type == 2 ? file.vedioUrl : file.url;
                this.playerOptions['sources'][0]['src'] = this.dialogImageUrl;
                this.dialogViewType = file.type;
            }
            this.dialogVisible = true;
        },

        // 搜索
        handleFilter() {
            this.listQuery.page = 1;
            this.getList();
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
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
            this.$router.push({
                path: 'goods-list'
            });
        },
        confirmType() {
            this.dialogVisibleType = false;
            this.initData();
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
    .cursor {
        cursor: pointer;
    }
    .el-tag {
        margin-right: 8px;
    }
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
