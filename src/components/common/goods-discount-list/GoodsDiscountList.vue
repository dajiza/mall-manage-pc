<template>
    <!-- dialog 城市列表 -->
    <el-dialog title="挑选商品" :visible.sync="isShow" width="90%" @open="open" @opened="opened">
        <div class="app-container goods-list">
            <div class="head-container">
                <el-form ref="formFilter" :model="formFilter" class="form-filter" :inline="true" size="small" label-position="left">
                    <el-form-item label="商品名称" prop="title" label-width="">
                        <el-input class="filter-item" placeholder="请输入" v-model="formFilter.title"></el-input>
                    </el-form-item>
                    <el-form-item label="商品ID" prop="id">
                        <el-input class="filter-item" placeholder="请输入" v-model="formFilter.id"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="typeCategory">
                        <el-cascader class="filter-item" :props="{ checkStrictly: true }" v-model="formFilter.typeCategory" placeholder="请选择" :options="typeList"></el-cascader>
                    </el-form-item>

                    <el-form-item label="商品状态" prop="status">
                        <el-select class="filter-item" v-model="formFilter.status" placeholder="请选择">
                            <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="出售状态" prop="is_sale">
                        <el-select class="filter-item" v-model="formFilter.is_sale" placeholder="请选择">
                            <el-option v-for="item in saleStatusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否售罄" prop="is_store_shortage">
                        <el-select class="filter-item" v-model="formFilter.is_store_shortage" placeholder="请选择">
                            <el-option v-for="item in shortageList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否指定店铺" prop="allow_agent">
                        <el-select class="filter-item" v-model="formFilter.allow_agent" placeholder="请选择">
                            <el-option v-for="item in agentList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="SKU编码" prop="storehouse_code" class="">
                        <el-input class="filter-item" v-model="formFilter.storehouse_code" placeholder="请输入"></el-input>
                    </el-form-item>

                    <el-form-item class="form-item-btn" label="">
                        <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                        <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        <el-popover placement="bottom" width="300" trigger="click" popper-class="group-popper">
                            <div class="row-list">
                                <div class="nodata" v-if="checkedList.length == 0">无数据</div>
                                <div class="row-item" v-for="item in checkedList" :key="item.id">
                                    <div class="item-content">
                                        <span class="iconfont icon-plus" v-show="!item.open" @click="triggerImg(item)"></span>
                                        <span class="iconfont icon-minus" v-show="item.open" @click="triggerImg(item)"></span>
                                        <div class="name">{{ item.title }}</div>
                                        <i class="el-icon-error row-delete" @click="cancelSelection(item)"></i>
                                    </div>
                                    <div class="son" v-show="item.open">
                                        <div class="son-item" v-for="img in item.imgCheckdList">
                                            <div class="son-timg-wrap">
                                                <img alt="" class="fullimg" :src="img.sku_img + '!upyun520/fw/300'" />
                                            </div>
                                            <div class="name">{{ img.title }}</div>
                                            <i class="el-icon-error row-delete" @click="cancelSelectionImg(item, img)"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <el-button slot="reference" class="filter-btn" size="" style="margin-left:20px">已选商品</el-button>
                        </el-popover>
                    </el-form-item>
                </el-form>
            </div>

            <el-table
                ref="multipleTable"
                :height="$tableHeight"
                class="table"
                :data="list"
                v-loading.body="listLoading"
                :header-cell-style="$tableHeaderColor"
                element-loading-text="Loading"
                :default-expand-all="false"
                row-key="id"
            >
                <el-table-column label="-" type="expand" width="60">
                    <template slot-scope="props">
                        <el-table class="sku-table" :data="props.row.goods_sku" :header-cell-style="$tableHeaderColor">
                            <el-table-column width="55">
                                <template slot-scope="scope">
                                    <el-checkbox v-model="scope.row.checked" :key="scope.row.id" @change="value => imgChecked(value, scope.row, props.row)"></el-checkbox>
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" width="90">
                                <template slot-scope="scope">
                                    <template v-hasPermission="'mall-backend-goods-sku-status-update'">
                                        <span v-show="scope.row.status == 1">已下架</span>
                                        <span v-show="scope.row.status == 2">已上架</span>
                                    </template>
                                </template>
                            </el-table-column>
                            <el-table-column label="SKU图片" width="120">
                                <template slot-scope="scope">
                                    <img class="timg" :src="scope.row.sku_img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.sku_img, 2, scope.row.skuImgIndex)" />
                                </template>
                            </el-table-column>
                            <el-table-column label="SKU名称">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.title }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="SKU编码">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.storehouse_code }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="售价(元)" width="90">
                                <template slot-scope="scope">
                                    <span>{{ formatMoney(scope.row.min_price) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="实际销量" width="90">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.real_sales }}</span>
                                </template>
                            </el-table-column>

                            <el-table-column label="总库存" width="90">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.stock_total }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="可用库存" width="90">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.stock_available }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="是否售罄" width="90">
                                <template slot-scope="scope">
                                    <div class="type-tag type-yellow" v-if="scope.row.stock_available == 0">售罄</div>
                                    <div class="type-tag type-blue" v-else>否</div>
                                </template>
                            </el-table-column>
                            <el-table-column label="会员折扣" width="90">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.user_discount == 0">是</span>
                                    <span v-else-if="scope.row.user_discount == 1">否</span>
                                    <span v-else>{{ commUtil.numberMul(Number(scope.row.user_discount), 10) }}折</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </template>
                </el-table-column>

                <el-table-column label="" width="70">
                    <template slot-scope="scope">
                        <span>({{ scope.row.onsaleNum || 0 }}/{{ scope.row.goods_sku.length }})</span>
                    </template>
                </el-table-column>
                <el-table-column width="55">
                    <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.checked" :key="scope.row.id" @change="value => groupChecked(value, scope.row)"></el-checkbox>
                    </template>
                </el-table-column>
                <el-table-column label="商品ID" width="80">
                    <template slot-scope="scope">
                        <span>
                            {{ scope.row.id }}
                        </span>
                    </template>
                </el-table-column>

                <el-table-column label="商品主图" width="120">
                    <template slot-scope="scope">
                        <img class="timg" :src="scope.row.img + '!upyun520/fw/300'" alt="" @click="openPreview(scope.row.img, 1, scope.$index)" />
                    </template>
                </el-table-column>
                <el-table-column label="商品名称" width="">
                    <template slot-scope="scope">
                        {{ scope.row.title }}
                    </template>
                </el-table-column>

                <el-table-column label="商品分类" width="80">
                    <template slot-scope="scope">
                        <span v-if="scope.row.type == 1">布料</span>
                        <span v-if="scope.row.type == 2">
                            其他{{ scope.row.category_id > 0 ? ' > ' + categoryListOther.find(item => item.id == scope.row.category_id).name : '' }}
                        </span>
                        <span v-if="scope.row.type == 3">
                            布组{{ scope.row.category_id > 0 ? ' > ' + categoryListClothGroup.find(item => item.id == scope.row.category_id).name : '' }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <div class="status">
                            <span class="dot dot-grey" v-if="scope.row.status == 1"></span>
                            <span class="dot dot-green" v-if="scope.row.status == 2"></span>

                            <span :class="[scope.row.status == 1 ? 'text-grey' : '', 'status-text']">
                                {{ scope.row.status == 1 ? '已下架' : '已上架' }}
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="出售状态" width="110">
                    <template slot-scope="scope">{{ scope.row.is_sale == 1 ? '可出售' : '不可售' }}</template>
                </el-table-column>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="listQuery.page"
                    :page-size="listQuery.limit"
                    layout="total, prev, pager, next, jumper"
                    :total="total"
                >
                </el-pagination>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="close">取 消</el-button>
            <el-button type="primary" @click="save">确定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { queryGoodsListNew, queryStoreProductDetail, queryShopList, queryCategoryListAll } from '@/api/goods'
import { updateSkuDiscountBatch } from '@/api/discount'
import { formatMoney } from '@/plugin/tool'

export default {
    name: 'CheckList',
    props: {},
    data() {
        return {
            list: [],
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            isShow: false,
            checkedList: [],

            // 类型 1 布料 2其他 3成品布
            typeList: [
                { value: '1', label: '布料' },
                { value: '2', label: '其他' },
                { value: '3', label: '布组' }
            ],
            // 分类 先选择商品类型 在获取分类列表
            categoryList: [], //筛选列表
            categoryListOther: [], //其他分类
            categoryListClothGroup: [], //布组分类
            // 是否上架：1下架；2上架
            statusList: [
                { value: '1', label: '下架' },
                { value: '2', label: '上架' }
            ],
            saleStatusList: [
                { value: 1, label: '可出售' },
                { value: 2, label: '不可售' }
            ],
            // 是否库存不足 1 足 2 不足(只有当所有sku 全部库存不足 为2
            shortageList: [
                { value: '2', label: '是' },
                { value: '1', label: '否' }
            ],
            // 是否所有代理可以销售：1指定代理；2所有代理可以销售
            agentList: [
                { value: '1', label: '指定店铺' },
                { value: '2', label: '所有店铺都可以' }
            ],
            formFilter: {
                id: '',
                title: '',
                category_id: '',
                type: '',
                status: '',
                is_sale: '',
                is_store_shortage: '',
                allow_agent: '',
                storehouse_code: '',
                typeCategory: [], //cache数据
                discount_condition: 1
            }
        }
    },
    created() {},
    mounted() {},
    methods: {
        formatMoney: formatMoney,
        open() {},
        opened() {
            this.queryCategoryListAllInit()
            this.queryShopList()
            this.getList()
        },

        getList() {
            const rLoading = this.openLoading()
            let params = _.cloneDeep(this.$refs['formFilter'].model)
            console.log('GOOGLE: params', params)
            params['limit'] = this.listQuery.limit
            params['page'] = this.listQuery.page
            console.log('输出 ~ paramsh', params['typeCategory'].length)
            if (params['typeCategory'].length == 1) {
                params['type'] = params['typeCategory'][0]
                params['category_id'] = ''
            } else if (params['typeCategory'].length == 2) {
                params['type'] = params['typeCategory'][0]
                params['category_id'] = params['typeCategory'][1].toString()
            } else {
                params['type'] = ''
                params['category_id'] = ''
            }
            // params['category_id'] = params['category_id'].toString()
            if (params['type'] == 1) {
                params['category_id'] = 0
            }
            if (params['discount_condition'] == '') {
                params['discount_condition'] = 0
            }

            queryGoodsListNew(params)
                .then(async res => {
                    console.log('输出 ~ res', res)
                    if (res.data.goods_list == null) {
                        this.list = []
                        this.total = 0
                        rLoading.close()
                        return
                    }
                    // 拼合goods和sku
                    let goods = res.data.goods_list
                    let sku = res.data.goods_sku_list
                    for (let i = 0; i < goods.length; i++) {
                        const goodsItem = goods[i]
                        goodsItem.goods_sku = []
                        for (let j = 0; j < sku.length; j++) {
                            const skuItem = sku[j]
                            if (goodsItem.id == skuItem.goods_id) {
                                goodsItem.goods_sku.push(skuItem)
                            }
                        }
                    }
                    // 逐个获取库存信息 同时生成主图 sku图预览列表
                    let skuImgIndex = 0
                    this.timgList = []
                    this.skuImgList = []
                    for (let i = 0; i < goods.length; i++) {
                        const product = goods[i]
                        this.timgList.push(product.img)
                        if (!product.goods_sku) {
                            product.goods_sku = []
                            continue
                        }
                        product.onsaleNum = product.goods_sku.filter(item => item.status == 2).length
                        for (let j = 0; j < product.goods_sku.length; j++) {
                            const sku = product.goods_sku[j]
                            sku.skuImgIndex = skuImgIndex
                            skuImgIndex++
                        }
                    }

                    this.list = goods
                    this.total = res.data.total
                    rLoading.close()
                })
                .catch(err => {
                    rLoading.close()
                })
        },

        // 获取分类列表
        queryCategoryListAll(type) {
            if (type == 1) {
                this.categoryList = this.categoryListOther
            } else {
                this.categoryList = this.categoryListClothGroup
            }
        },
        // 生成类型 分类 级联列表
        creatCategoryData() {
            this.typeList = [
                { value: '1', label: '布料', children: [] },
                {
                    value: '2',
                    label: '其他',
                    children: _.cloneDeep(this.categoryListOther).map(item => {
                        return { label: item.name, value: item.id }
                    })
                },
                {
                    value: '3',
                    label: '布组',
                    children: _.cloneDeep(this.categoryListClothGroup).map(item => {
                        return { label: item.name, value: item.id }
                    })
                }
            ]
            console.log('输出 ~ this.typeList', this.typeList)
        },

        queryCategoryListAllInit() {
            Promise.all([
                // type 1其他 2布组
                queryCategoryListAll({ type: 1 }),
                queryCategoryListAll({ type: 2 })
            ])
                .then(res => {
                    let options = {}
                    if (res[0].code === 200) {
                        if (res[0].data) {
                            this.categoryListOther = res[0].data
                        }
                    }
                    if (res[1].code === 200) {
                        if (res[1].data) {
                            this.categoryListClothGroup = res[1].data
                        }
                    }
                    this.creatCategoryData()
                })
                .catch(() => {})
        },

        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data
                })
                .catch(err => {})
        },
        // 预览goods显示/关闭
        triggerImg(group) {
            group.open = !group.open
            this.$forceUpdate()
        },
        // goods详情 type0 默认查询 1全选 2反全选
        getGroupDetail(groupData, type = 0) {
            let group = _.cloneDeep(groupData)

            let imgList = group.goods_sku

            // 全选或范全选
            let imgList_copy = _.cloneDeep(imgList)
            imgList_copy.forEach(ev => {
                ev['checked'] = type == 1
            })
            if (type == 1) {
                let exist = false
                for (let i = 0; i < this.checkedList.length; i++) {
                    const element = this.checkedList[i]
                    if (group.id == element.id) {
                        element.imgCheckdList = imgList_copy
                        exist = true
                    }
                }
                if (!exist) {
                    group.open = false
                    group.imgCheckdList = imgList_copy
                    this.checkedList.push(_.cloneDeep(group))
                }
            } else if (type == 2) {
                for (let i = 0; i < this.checkedList.length; i++) {
                    const element = this.checkedList[i]
                    if (group.id == element.id) {
                        this.checkedList.splice(i, 1)
                    }
                }
            }
            this.refreshSelection()
        },
        // 监听goods选中
        groupChecked(val, group) {
            console.log('输出 ~ group', group.id)
            if (val == true) {
                this.getGroupDetail(group, 1)
            } else {
                this.getGroupDetail(group, 2)
            }
        },
        // 监听sku选中
        imgChecked(val, imgData, groupData) {
            let group = _.cloneDeep(groupData)
            let img = _.cloneDeep(imgData)
            if (val) {
                let exist = false
                for (let i = 0; i < this.checkedList.length; i++) {
                    const element = this.checkedList[i]
                    if (element.id == group.id) {
                        element.imgCheckdList.push(img)
                        exist = true
                    }
                }
                if (!exist) {
                    groupData.checked = true
                    group.open = false
                    group.imgCheckdList = []
                    group.imgCheckdList.push(img)
                    this.checkedList.push(group)
                }
            } else {
                this.cancelSelectionImg(group, img)
            }
        },
        // sku取消选中
        cancelSelectionImg(group, img) {
            for (let i = 0; i < this.checkedList.length; i++) {
                const element = this.checkedList[i]
                if (group.id == element.id) {
                    for (let j = 0; j < element.imgCheckdList.length; j++) {
                        const imgElement = element.imgCheckdList[j]
                        if (img.id == imgElement.id) {
                            element.imgCheckdList.splice(j, 1)
                        }
                    }
                    // 没有选中图片时 删除组
                    if (element.imgCheckdList.length == 0) {
                        this.checkedList.splice(i, 1)
                    }
                }
            }
            this.refreshSelection()
        },
        // goods取消选中
        cancelSelection(group) {
            for (let i = 0; i < this.checkedList.length; i++) {
                const element = this.checkedList[i]
                if (group.id == element.id) {
                    this.checkedList.splice(i, 1)
                }
            }
            this.refreshSelection()
        },
        // 刷新显示列表的checkbox显示状态
        refreshSelection() {
            for (let j = 0; j < this.list.length; j++) {
                let groupExist = false
                const listItem = this.list[j]
                for (let i = 0; i < this.checkedList.length; i++) {
                    const checkedItem = this.checkedList[i]
                    if (listItem.id == checkedItem.id) {
                        groupExist = true
                        listItem.checked = true
                        if (!listItem.goods_sku) {
                            continue
                        }
                        for (let m = 0; m < listItem.goods_sku.length; m++) {
                            const imgItem = listItem.goods_sku[m]
                            imgItem.checked = false
                            for (let k = 0; k < checkedItem.imgCheckdList.length; k++) {
                                const imgCheckedItem = checkedItem.imgCheckdList[k]
                                if (imgItem.id == imgCheckedItem.id) {
                                    imgItem.checked = true
                                }
                            }
                        }
                    }
                }
                // 整组都被删的情况下
                if (!groupExist && listItem.goods_sku) {
                    listItem.checked = false
                    for (let n = 0; n < listItem.goods_sku.length; n++) {
                        const imgItem = listItem.goods_sku[n]
                        imgItem.checked = false
                    }
                }
            }
        },
        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.formFilter.tag_id = ''
            this.handleFilter()
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
        },

        show() {
            this.isShow = true
        },
        close() {
            this.isShow = false
        },
        async save() {
            let listClone = _.cloneDeep(this.checkedList)
            console.log('输出 ~ listClone', listClone)
            let goods_sku_ids = []
            for (let i = 0; i < listClone.length; i++) {
                const goods = listClone[i]
                for (let j = 0; j < goods.imgCheckdList.length; j++) {
                    const sku = goods.imgCheckdList[j]
                    goods_sku_ids.push(sku.id)
                }
            }
            if (goods_sku_ids.length == 0) {
                this.checkedList = []
                this.isShow = false
                return
            }
            let params = {
                goods_sku_ids: goods_sku_ids
            }

            updateSkuDiscountBatch(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    if (res.code == 200) {
                        this.$notify({
                            title: '添加成功',
                            type: 'success',
                            duration: 3000
                        })
                        this.checkedList = []
                        this.isShow = false
                        this.$emit('add-success')
                    } else {
                        this.$notify({
                            title: res.msg,
                            type: 'warning',
                            duration: 5000
                        })
                    }
                })
                .catch(err => {})
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.timg {
    width: 80px;
    height: 60px;
}

.item {
    display: flex;
    margin-bottom: 10px;
    min-height: 50px;
    .check {
        color: rgba(0, 0, 0, 0.65);
        font-weight: 400;
        font-size: 14px;
    }
    .check-all {
        margin-right: 120px;
    }
    .check-city {
        margin-bottom: 20px;
    }
}
.type-tag {
    padding: 0 11px;
    min-width: 50px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    text-align: center;
    word-break: keep-all;
    font-weight: 400;
    line-height: 26px;
    &.type-red {
        background-color: #ff4d4f;
    }
    &.type-purple {
        background-color: #a151ff;
    }
    &.type-yellow {
        background-color: #faad14;
    }
    &.type-blue {
        background-color: #1890ff;
    }
}
.gotoDetail {
    color: #1890ff;
    cursor: pointer;
}

.goods-list .table /deep/ .el-table__expand-icon > .el-icon {
    margin-top: -10px;
}
.goods-list .table /deep/ .el-table__expand-icon--expanded {
    transform: rotate(0deg);
}
.goods-list .table /deep/ .el-icon-arrow-right:before {
    color: #1890ff;
    content: '\e61a';
    font-size: 19px;
    font-family: 'iconfont';
}
.goods-list .table /deep/ .el-table__expand-icon--expanded .el-icon-arrow-right:before {
    color: #6d7278;
    content: '\e617';
}
.row-list {
    width: 300px;
    .nodata {
        padding: 12px;
    }
    .row-item {
        // border-bottom: 1px solid #e8e8e8;

        .item-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            height: 50px;
            border-bottom: 1px solid #e8e8e8;
            .iconfont {
                margin-right: 16px;
                font-size: 14px;
                cursor: pointer;
            }
        }
        &:last-child {
            border-bottom: none;
        }
        .row-delete {
            cursor: pointer;
        }
        .name {
            overflow: hidden;
            padding-right: 10px;
            width: 250px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .son-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0 12px 0 46px;
            height: 50px;
            border-bottom: 1px solid #e8e8e8;
            .son-timg-wrap {
                flex-basis: 40px;
                flex-shrink: 0;
                margin-right: 10px;
                height: 40px;
                .fullimg {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}
.table /deep/ .el-table__expanded-cell {
    padding: 10px 0 0 115px !important;
}
</style>
