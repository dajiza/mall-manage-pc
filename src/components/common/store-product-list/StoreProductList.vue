<template>
    <!-- dialog 城市列表 -->
    <el-dialog title="挑选仓库商品" :visible.sync="isShow" width="90%" @open="open" @opened="opened">
        <div class="app-container">
            <div class="head-container">
                <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="right" label-width="40px">
                    <el-form-item label="名称" prop="name">
                        <el-input class="filter-item" placeholder="输入内容" v-model="formFilter.name"></el-input>
                    </el-form-item>

                    <el-form-item label="标签" prop="tag_id">
                        <el-cascader
                            class="cascader"
                            v-model="formFilter.tag_id"
                            placeholder="请选择"
                            :options="labelOptions"
                            :show-all-levels="false"
                            :props="{ multiple: true, label: 'name', value: 'id' }"
                            filterable
                        ></el-cascader>
                    </el-form-item>
                    <el-form-item label="品牌" prop="attr_brand">
                        <el-select class="filter-item" v-model="formFilter.attr_brand" placeholder="请选择">
                            <el-option v-for="item in brandData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="材质" prop="attr_material" v-if="type == 1">
                        <el-select class="filter-item" v-model="formFilter.attr_material" placeholder="请选择">
                            <el-option v-for="item in materialData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产地" prop="attr_origin" v-if="type == 1">
                        <el-select class="filter-item" v-model="formFilter.attr_origin" placeholder="请选择">
                            <el-option v-for="item in placeOfOriginData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="颜色" prop="attr_color" v-if="type == 1">
                        <el-select class="filter-item" v-model="formFilter.attr_color" placeholder="请选择">
                            <el-option v-for="item in colorData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-button class="filter-item" size="" type="" icon="el-icon-edit-outline" @click="resetForm('formFilter')">重置</el-button>
                    <el-button class="filter-item" size="" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
                    <el-popover placement="bottom" width="300" trigger="click">
                        <div class="row-list">
                            <span v-if="checkedList.length == 0">无数据</span>
                            <div class="row-item" v-for="item in checkedList" :key="item.id">
                                <div class="name">{{ item.name }}</div>
                                <i class="el-icon-error row-delete" @click="cancelSelection(item)"></i>
                            </div>
                        </div>
                        <el-button slot="reference" class="filter-item" size="" type="success" style="margin-right:13px;">已选商品</el-button>
                    </el-popover>
                </el-form>
            </div>

            <el-table
                ref="multipleTable"
                :data="list"
                row-key="id"
                v-loading.body="listLoading"
                @selection-change="handleSelectionChange"
                :header-cell-style="$tableHeaderColor"
                element-loading-text="Loading"
                fit
            >
                <el-table-column type="selection" width="55" :reserve-selection="true"> </el-table-column>
                <el-table-column label="产品图片" width="120">
                    <template slot-scope="scope">
                        <img class="timg" :src="scope.row.img" alt="" />
                    </template>
                </el-table-column>

                <el-table-column label="产品名称" width="240">
                    <template slot-scope="scope">
                        <span>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="品牌">
                    <template slot-scope="scope">
                        <span>{{ scope.row.attr_brand_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="产地">
                    <template slot-scope="scope">
                        <span>{{ scope.row.attr_origin_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="材质">
                    <template slot-scope="scope">
                        <span>{{ scope.row.attr_material_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="颜色">
                    <template slot-scope="scope">
                        <span>{{ scope.row.attr_color_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="花纹">
                    <template slot-scope="scope">
                        <span>{{ scope.row.attr_pattern_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="分类">
                    <template slot-scope="scope">
                        <span>{{ scope.row.category_name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="标签">
                    <template slot-scope="scope">
                        <span>{{ scope.row.tag_names.join('、') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="总库存">
                    <template slot-scope="scope">
                        <span>{{ scope.row.stock_total }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="可用库存">
                    <template slot-scope="scope">
                        <span>{{ scope.row.stock_available }}</span>
                    </template>
                </el-table-column>

                <!-- <el-table-column label="操作"  width="250">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click.native="edit(scope.row.id)">修改</el-button>
                    <el-button :type="scope.row.status ? 'success' : 'warning'" size="mini" @click.native="setStatus(scope.row, scope.$index)">{{ scope.row.status ? '已启用' : '已禁用' }}</el-button>
                    <el-button type="danger" size="mini" @click.native="del(scope.row.id, scope.$index)" :disabled="scope.row.isDelete">删除</el-button>
                </template>
            </el-table-column> -->
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="listQuery.page"
                    :page-size="listQuery.size"
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
import { getAllAttrList, queryProduceList, getLabelAllList, queryProduceDetail } from '@/api/goods';

export default {
    name: 'CheckList',
    props: {
        checkedSku: {
            type: Array,
            default: []
        },
        type: {
            type: Number,
            default: 1
        }
    },
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

            formFilter: {
                name: '', //产品名称
                category_id: '', //产品分类
                tag_ids: '', //标签
                tag_id: '', //标签
                type: 0, //'0布 1其他',
                product_code: '',

                attr_brand: '',
                attr_color: '',
                attr_material: '',
                attr_origin: '',
                attr_unit: '',
                attr_pattern: '',
                ids: []
            },

            brandData: [], // 品牌下拉列表
            brandDataCloth: [], // 品牌下拉列表（布）
            brandDataOther: [], // 品牌下拉列表（其它）
            placeOfOriginData: [], // 产地下拉列表
            colorData: [], // 颜色下拉列表
            patternData: [], // 花纹下拉列表
            materialData: [], // 材质下拉列表
            materialDataCloth: [], // 材质下拉列表（布）
            materialDataOther: [], // 材质下拉列表（其它）
            materialDataAll: [], // 材质总
            brandDataAll: [], // 品牌总
            labelOptions: [], // 标签下拉列表
            labelCloth: [], // 标签(布)列表
            labelOther: [], // 标签(其它)列表
            labelAll: [] // 标签(布和其它)列表
        };
    },
    created() {},
    mounted() {
        // this.getAllAttr();
        // this.getList();
    },
    methods: {
        open() {
            // this.getAllAttr();
            // this.getList();
        },
        opened() {
            this.getAllAttr();
            this.getList();
            this.$refs.multipleTable.clearSelection();
            let list = this.checkedSku.map(item => {
                return {
                    id: item.storehouse_pid
                };
            });
            list.forEach(row => {
                this.$refs.multipleTable.toggleRowSelection(row);
            });
        },
        toggleSelection() {
            this.checkedList.forEach(row => {
                this.$refs.multipleTable.toggleRowSelection(row);
            });
        },
        refreshSelection() {
            let firstRow = this.list[0];
            let state = this.checkedList.some(item => item.id == firstRow.id);

            this.$nextTick(() => {
                // 为触发selection-change
                this.$refs.multipleTable.toggleRowSelection(this.list[0], !state);
                this.$refs.multipleTable.toggleRowSelection(this.list[0], state);
            });
            // this.$refs.multipleTable.toggleRowSelection(this.list[0], state);

            // this.$refs.multipleTable.toggleAllSelection();
            // this.$refs.multipleTable.toggleAllSelection();

            // this.checkedList = this.list.filter(item => {
            //     for (let i = 0; i < this.list.length; i++) {
            //         const element = array[i];
            //     }
            //     return item.id;
            // });
        },
        cancelSelection(row) {
            if (row) {
                this.$refs.multipleTable.toggleRowSelection(row, false);
                // this.checkedList.forEach(row => {
                //     this.$refs.multipleTable.toggleRowSelection(row, false);
                //     this.getList();
                // });
            }
        },

        getList() {
            this.listLoading = true;
            let params = this.$refs['formFilter'].model;
            params['type'] = this.type == 1 ? 0 : 1;
            if (params.tag_id) {
                params['tag_ids'] = params.tag_id.map(item => item[1]);
                // params['tag_ids'].push(params.tag_id);
            } else {
                params['tag_ids'] = [];
            }

            params['limit'] = this.listQuery.limit;
            params['page'] = this.listQuery.page;
            queryProduceList(params)
                .then(async res => {
                    this.list = res.data.list;
                    this.total = res.data.total;
                    this.refreshSelection();
                    this.listLoading = false;
                })
                .catch(err => {});
        },
        handleSelectionChange(val) {
            this.checkedList = val;
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
        // 获取所有搜索用到的数据
        getAllAttr() {
            const that = this;
            const labelClothParams = {
                display_platform: 1, //展示平台1 后台 2 小程序' 不搜索-1,
                type: 1 // '类型 1布料 2其他' 不搜索-1,
            };
            const labelOtherParams = {
                display_platform: 1, //展示平台1 后台 2 小程序' 不搜索-1,
                type: 2 // '类型 1布料 2其他' 不搜索-1,
            };

            const rLoading = that.openLoading();
            // 获取 产品分类、产品标签（布）、产品标签（其它）
            this.$ajax
                .all([
                    // getCategoryList({}),
                    getLabelAllList(labelClothParams),
                    getLabelAllList(labelOtherParams),
                    getAllAttrList({ type: 1, category: 1 }),
                    getAllAttrList({ type: 2 }),
                    getAllAttrList({ type: 3 }),
                    getAllAttrList({ type: 5, category: 1 }),
                    getAllAttrList({ type: 5, category: 2 }),
                    getAllAttrList({ type: 1, category: 2 }),
                    getAllAttrList({ type: 6 })
                ])
                .then(
                    that.$ajax.spread(function(res2, res3, res4, res5, res6, res7, res8, res9, res10) {
                        let label_cloth = [];
                        let label_other = [];
                        let err_arr = [];
                        // if (res1.code === 200) {
                        //     // 产品分类
                        //     that.categoryList = res1.data || [];
                        //     that.categoryOptions = that.categoryList;
                        // } else {
                        //     if (res1.code === -1 && res1.msg.indexOf('无权限') > -1) {
                        //         err_arr.push(res1.code);
                        //     }
                        //     // that.$notify({ title: res1.msg, message: '', type: 'error', duration: 3000 });
                        // }
                        if (res2.code === 200) {
                            // 产品标签（布）
                            label_cloth = res2.data || [];
                            that.labelCloth = that.handlerData(label_cloth);
                        } else {
                            if (res2.code === -1 && res2.msg.indexOf('无权限') > -1) {
                                err_arr.push(res2.code);
                            }
                            // that.$notify({ title: res2.msg, message: '', type: 'error', duration: 3000 });
                        }
                        if (res3.code === 200) {
                            // 产品标签（其它）
                            label_other = res3.data || [];
                            that.labelOther = that.handlerData(label_other);
                        } else {
                            if (res3.code === -1 && res3.msg.indexOf('无权限') > -1) {
                                err_arr.push(res3.code);
                            }
                            // that.$notify({ title: res3.msg, message: '', type: 'error', duration: 3000 });
                        }
                        if (res4.code === 200) {
                            // 品牌(布)
                            that.brandDataCloth = res4.data || [];
                        } else {
                            if (res4.code === -1 && res4.msg.indexOf('无权限') > -1) {
                                err_arr.push(res4.code);
                            }
                            // that.$notify({ title: res4.msg, message: '', type: 'error', duration: 5000 });
                        }
                        if (res5.code === 200) {
                            // 颜色
                            that.colorData = res5.data || [];
                        } else {
                            if (res5.code === -1 && res5.msg.indexOf('无权限') > -1) {
                                err_arr.push(res5.code);
                            }
                            // that.$notify({ title: res5.msg, message: '', type: 'error', duration: 5000 });
                        }
                        if (res6.code === 200) {
                            // 产地
                            that.placeOfOriginData = res6.data || [];
                        } else {
                            if (res6.code === -1 && res6.msg.indexOf('无权限') > -1) {
                                err_arr.push(res6.code);
                            }
                            // that.$notify({ title: res6.msg, message: '', type: 'error', duration: 5000 });
                        }
                        if (res7.code === 200) {
                            // 材质（布）
                            that.materialDataCloth = res7.data || [];
                        } else {
                            if (res7.code === -1 && res7.msg.indexOf('无权限') > -1) {
                                err_arr.push(res7.code);
                            }
                            // that.$notify({ title: res7.msg, message: '', type: 'error', duration: 5000 });
                        }
                        if (res8.code === 200) {
                            // 材质（其它）
                            that.materialDataOther = res8.data || [];
                        } else {
                            if (res8.code === -1 && res8.msg.indexOf('无权限') > -1) {
                                err_arr.push(res8.code);
                            }
                            // that.$notify({ title: res8.msg, message: '', type: 'error', duration: 5000 });
                        }
                        if (res9.code === 200) {
                            // 品牌(其它)
                            that.brandDataOther = res9.data || [];
                        } else {
                            if (res9.code === -1 && res9.msg.indexOf('无权限') > -1) {
                                err_arr.push(res9.code);
                            }
                            // that.$notify({ title: res9.msg, message: '', type: 'error', duration: 5000 });
                        }
                        if (res10.code === 200) {
                            // 花纹
                            that.patternData = res10.data || [];
                        } else {
                            if (res10.code === -1 && res10.msg.indexOf('无权限') > -1) {
                                err_arr.push(res10.code);
                            }
                        }
                        // patternData
                        // const label_all = label_cloth.concat(label_other);
                        // that.labelAll = that.handlerData(label_all);
                        const label_all = label_cloth;
                        that.labelAll = that.handlerData(label_all);
                        that.brandDataAll = that.brandDataCloth.concat(that.brandDataOther);
                        that.materialDataAll = that.materialDataCloth.concat(that.materialDataOther);
                        that.labelOptions = that.labelAll;
                        that.brandData = that.brandDataAll;
                        that.materialData = that.materialDataAll;
                        rLoading.close();

                        // 获取产品列表
                        that.getProductList();
                        if (err_arr.length > 0) {
                            that.$notify({ title: '产品列表搜索条件权限不足，请联系管理员添加', message: '', type: 'error', duration: 5000 });
                        }
                    })
                )
                .catch(error => {}); //捕获异常
        },
        // 选择产品类型，根据类型取标签
        selectType() {
            if (this.searchForm.product_type === 0) {
                this.labelOptions = this.labelCloth;
                this.brandData = this.brandDataCloth; // 品牌
                this.materialData = this.materialDataCloth; // 材质
            } else if (this.searchForm.product_type === 1) {
                this.labelOptions = this.labelOther;
                this.brandData = this.brandDataOther; // 品牌
                this.materialData = this.materialDataOther; // 材质
            }
        },
        // 格式化数据
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
        show() {
            this.isShow = true;
        },
        close() {
            this.isShow = false;
        },
        async save() {
            let listClone = _.cloneDeep(this.checkedList);

            let skuList = await Promise.all(
                listClone.map(async m => {
                    let item = {};
                    if (m.title) {
                        item = m;
                    } else {
                        // 商品创建页面传入sku id列表,回传前查询详情数据返回
                        item = await this.queryDetail(m.id);
                    }
                    return {
                        sku_id: 0,
                        storehouse_pid: item.id, //所选的仓库产品id
                        title: item.name,
                        min_price: item.price_out / 100,
                        display_price: item.price_out / 100,
                        sku_img: item.img,
                        stock_warning: 1,
                        stock_total: item.stock_total,
                        stock_available: item.stock_available,
                        attr_origin: item.attr_origin_name,
                        attr_brand: item.attr_brand_name,
                        attr_color: item.attr_color_name,
                        attr_material: item.attr_material_name,
                        attr_unit: item.attr_unit_name,
                        attr_pattern: item.attr_pattern_name,
                        status: item.stock_available > 0 ? 2 : 1,
                        // tag_names: item.tag_names,
                        // category_name: item.category_name,
                        attrDiyValue: ['', '', ''],
                        attr_list: [
                            // {
                            //     attr_id: item.attr_brand,
                            //     attr_title: '品牌',
                            //     attr_value: item.attr_brand_name
                            // },
                            // {
                            //     attr_id: item.attr_color,
                            //     attr_title: '颜色',
                            //     attr_value: item.attr_color_name
                            // },
                            // {
                            //     attr_id: item.attr_material,
                            //     attr_title: '材质',
                            //     attr_value: item.attr_material_name
                            // },
                            // {
                            //     attr_id: item.attr_origin,
                            //     attr_title: '产地',
                            //     attr_value: item.attr_origin_name
                            // },
                            // {
                            //     attr_id: item.attr_pattern,
                            //     attr_title: '花纹',
                            //     attr_value: item.attr_origin_name
                            // },
                            // {
                            //     attr_id: item.attr_unit,
                            //     attr_title: '单位',
                            //     attr_value: item.attr_unit_name
                            // }
                        ]
                    };
                })
            );
            this.$emit('check-sku', skuList);
            this.checkedList = [];
            this.$refs.multipleTable.toggleAllSelection(false);
            this.isShow = false;
        },

        queryDetail(skuId) {
            let params = { sku_id: skuId };
            return new Promise(function(resolve, reject) {
                queryProduceDetail(params)
                    .then(res => {
                        resolve(res.data);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        }
    }
};
</script>
<style scoped="scoped" lang="less">
.timg {
    width: 80px;
    height: 60px;
}
.row-list {
    width: 300px;
    .row-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        border-bottom: 1px solid #e8e8e8;
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
    }
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
</style>
