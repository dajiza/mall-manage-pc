<template>
    <div class="product-label-page">
        <div class="head-container" ref="searchBox">
            <el-form class="form-filter" :model="searchForm" :inline="true" ref="searchForm">
                <el-form-item label="标签名称：">
                    <el-input class="filter-item" v-model="searchForm.searchLabel" placeholder="请输入"> </el-input>
                </el-form-item>
                <el-form-item label="分类属性：">
                    <el-select class="filter-item" v-model="searchForm.category_type" placeholder="请选择" @change="handleCategorySelect">
                        <el-option v-for="state in typeOptions" :key="state.id" :value="state.id" :label="state.name" />
                    </el-select>
                </el-form-item>
                <el-form-item label="展示平台：" class="margin-right0">
                    <el-select class="filter-item" v-model="searchForm.label_type" placeholder="请选择" @change="handleDisplayPlatformSelect">
                        <el-option v-for="state in labelShowTypeOptions" :key="state.id" :value="state.id" :label="state.name" />
                    </el-select>
                </el-form-item>
                <el-form-item class="form-item-btn" label="">
                    <el-button class="filter-btn" type="" @click="handleSearchReset('searchForm')">重置</el-button>
                    <el-button class="filter-btn" type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                </el-form-item>
            </el-form>
            <div class="category-wrap" ref="desc">
                <div class="category-level">一级分类:</div>
                <div class="category-list" :class="{ packUpHeight: showExchangeButton && !isOpen }">
                    <div
                        v-for="(item, index) in categoryList"
                        :key="item.id"
                        class="category-item"
                        :class="{ 'is-select': selectedCategoryId === item.id }"
                        @click="selectCategory(item)"
                    >
                        <span>{{ item.name }}</span>
                        <div v-show="index > 0" class="edit-icon-box" v-hasPermission="'mall-backend-tag-category-update'" @click.stop="handleEditCategory(item)">
                            <div class="edit-icon" :class="{ 'edit-choose': selectedCategoryId === item.id }"></div>
                        </div>
                        <div v-show="index > 0" class="delete-icon-box" v-hasPermission="'mall-backend-tag-category-delete'" @click.stop="handleDeleteCategory(item)">
                            <div class="delete-icon" :class="{ 'delete-choose': selectedCategoryId === item.id }"></div>
                        </div>
                    </div>
                </div>
                <div class="open-or-close" @click="openOrClose">
                    <div class="open-or-close-btn" v-show="showExchangeButton">
                        <span>{{ isOpen ? '收起' : '展开' }}</span>
                        <i class="el-icon-arrow-down" :class="{ rotateZ180: isOpen }"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="container m-t-16 p-t-0 container-table-has-search">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>产品标签</span>
                </div>
                <div>
                    <el-button type="success" v-hasPermission="'mall-backend-tag-category-create'" @click="addCategory">新增分类</el-button>
                    <el-button type="primary" v-hasPermission="'mall-backend-tag-create'" @click="handleAddTags">新增标签</el-button>
                </div>
            </div>
            <el-table :data="tableData" style="width: 100%" :height="$tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column label="id" prop="id" width="80"></el-table-column>
                <el-table-column label="标签名称" prop="name"></el-table-column>
                <el-table-column label="父级" prop="category_name"></el-table-column>
                <el-table-column label="操作" width="200" align="left">
                    <template slot-scope="scope">
                        <el-button type="text" class="m-l-0 marginRight32" v-hasPermission="'mall-backend-tag-update'" @click="handleEditLabel(scope.$index, scope.row)"
                            >编辑</el-button
                        >
                        <el-button type="text" class="delete-color m-l-0" v-hasPermission="'mall-backend-tag-delete'" @click="handleDeleteTags(scope.$index, scope.row)"
                            >删除</el-button
                        >
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
        <!-- 分类 新增/编辑 弹出框 -->
        <el-dialog :title="categoryTitle" width="380px" :visible.sync="categoryVisible" :close-on-click-modal="false" :before-close="categoryClose">
            <el-form ref="categoryFormBox" :model="categoryForm" :rules="categoryRules" label-width="90px">
                <el-form-item label="分类名称:" prop="name">
                    <el-input placeholder="请输入分类名称" autofocus="autofocus" v-model="categoryForm.name"></el-input>
                </el-form-item>
                <el-form-item label="展示平台:" prop="label_type">
                    <el-select v-model="categoryForm.label_type" multiple :disabled="categoryTitle === '编辑分类'" placeholder="请选择" class="handle-select">
                        <el-option v-for="state in labelShowTypeOptions" :key="state.id" :value="state.id" :label="state.name" />
                    </el-select>
                </el-form-item>
                <el-form-item label="分类属性:" prop="category_type">
                    <el-select v-model="categoryForm.category_type" :disabled="categoryTitle === '编辑分类'" placeholder="请选择分类属性" class="handle-select">
                        <el-option v-for="state in typeOptions" :key="state.id" :value="state.id" :label="state.name" />
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="categoryClose">取 消</el-button>
                <el-button type="primary" @click="handleSaveCategory">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 标签 新增/编辑 弹出框 -->
        <el-dialog :title="tagsFormTitle" width="380px" :visible.sync="labelVisible" :close-on-click-modal="false" :before-close="dialogClose">
            <el-form ref="tagsFormBox" :model="labelForm" :rules="rules" label-width="90px">
                <el-form-item label="标签名称:" prop="name">
                    <el-input placeholder="请输入" autofocus="autofocus" v-model="labelForm.name"></el-input>
                </el-form-item>
                <el-form-item label="父级:" prop="category_id">
                    <el-select v-model="labelForm.category_id" placeholder="请选择" :disabled="tagsFormTitle === '编辑标签'" class="handle-select">
                        <el-option v-for="state in categoryOptions" :key="state.key" :value="state.key" :label="state.name" />
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose">取 消</el-button>
                <el-button type="primary" @click="handleSaveTags">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import './goodsLabel.less'
import EmptyList from '../../common/empty-list/EmptyList'

import { getLabelCategoryList, addLabelCategory, editLabelCategory, deleteLabelCategory, getLabelList, addLabel, editLabel, deleteLabel } from '../../../api/goodsLabel'

export default {
    name: 'goodsLabel',
    data() {
        return {
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            loading: false,
            tableData: [], // 标签列表数据
            categoryList: [], // 分类列表
            labelVisible: false, // 标签弹窗-新增编辑
            categoryVisible: false, // 分类弹窗-新增
            pageTotal: 0,
            searchForm: {
                searchLabel: '',
                category_type: '1', //1 布  2 其它
                label_type: '2' //  1 后台  2 小程序
            },
            categoryForm: {
                name: '',
                category_type: '', //1 布  2 其它
                label_type: [] //  1 后台  2 小程序
            },
            categoryRules: {
                name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { max: 20, message: '最多输入20个字符', trigger: 'blur' }
                ],
                category_type: [{ required: true, message: '请选择', trigger: 'blur' }],
                label_type: [{ required: true, message: '请选择', trigger: 'blur' }]
            },
            labelForm: {
                name: '',
                category_id: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入标签名称', trigger: 'blur' },
                    { max: 20, message: '最多输入20个字符', trigger: 'blur' }
                ]
            },
            id: -1,
            categoryId: -1,
            labelId: -1,
            categoryOptions: [],
            parentsCategory: '',
            categoryTitle: '', // 分类表单标题
            tagsFormTitle: '',
            selectedCategoryId: -1,
            showExchangeButton: false,
            isOpen: true,
            searchContent: '',
            delCategoryId: -1, // 点击删除分类 的分类id
            // tabPosition:'cloth',   //  布还是其它
            selectedType: 1, // 标签所属种类  1 布  2 其它
            displayPlatform: 2, //  1 后台  2 小程序
            typeOptions: [
                { id: '1', name: '布' },
                { id: '2', name: '其它' }
            ],
            labelShowTypeOptions: [
                { id: '1', name: '后台' },
                { id: '2', name: '小程序' }
            ]
        }
    },
    components: {
        EmptyList
    },
    watch: {
        categoryList: function() {
            this.$nextTick(
                function() {
                    if (!this.$refs.desc) {
                        return
                    }
                    let descHeight = window.getComputedStyle(this.$refs.desc).height.replace('px', '')
                    if (descHeight > 50) {
                        // 显示展开收起按钮
                        this.showExchangeButton = true
                        // 默认展开
                        this.isOpen = true
                    } else {
                        // 不显示展开收起按钮
                        this.showExchangeButton = false
                        // 没有超过1行就显示所有
                        this.isOpen = false
                    }
                }.bind(this)
            )
        }
    },
    created() {},
    mounted() {
        // 获取分类
        this.getTagsCategoryList()
    },
    methods: {
        // 请求 -- 获取标签分类列表
        getTagsCategoryList() {
            //根据商品分类以及展示平台请求标签分类列表
            const params = {
                type: this.selectedType,
                display_platform: this.displayPlatform
            }
            const rLoading = this.openLoading()
            getLabelCategoryList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data) {
                            this.categoryList = res.data
                        } else {
                            this.categoryList = []
                        }
                        // 填充分类下拉框
                        this.setCategoryOptions(this.categoryList)
                        this.categoryList.unshift({
                            name: '全部',
                            id: -1
                        })
                        // 获取标签
                        this.getTagsList()
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

        // 请求 -- 获取标签列表
        getTagsList(displayPlatform) {
            const params = {
                page: this.pageInfo.pageIndex || 1,
                limit: this.pageInfo.pageSize || 10,
                display_platform: displayPlatform ? displayPlatform : this.displayPlatform,
                tag_category_id: this.selectedCategoryId,
                tag_name: this.searchContent || '',
                type: this.selectedType
            }
            const rLoading = this.openLoading()
            getLabelList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists
                        } else {
                            this.tableData = []
                        }
                        this.pageTotal = res.data.total
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

        // 请求 - 新增分类
        addTagsCategory(params) {
            const rLoading = this.openLoading()
            addLabelCategory(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.categoryVisible = false
                        this.$notify({
                            title: '分类新增成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        // 刷新分类列表
                        this.getTagsCategoryList()
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

        // 请求 - 编辑分类
        editTagsCategory(params) {
            const rLoading = this.openLoading()
            editLabelCategory(params).then(res => {
                rLoading.close()
                if (res.code === 200) {
                    this.categoryVisible = false
                    this.$notify({
                        title: '分类编辑成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    })
                    // 刷新分类列表
                    this.getTagsCategoryList()
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    })
                }
            })
        },

        // 请求 - 删除分类
        deleteTagsCategory(params) {
            const rLoading = this.openLoading()
            deleteLabelCategory(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.$notify({
                            title: '分类删除成功',
                            message: '',
                            type: 'success',
                            duration: 5000
                        })
                        // 刷新分类列表
                        this.getTagsCategoryList()
                        if (this.delCategoryId === this.selectedCategoryId) {
                            this.selectedCategoryId = -1
                            this.$set(this.pageInfo, 'pageIndex', 1)
                            // 刷新标签列表
                            this.getTagsList()
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

        // 请求 - 新增标签
        addTags(params) {
            const rLoading = this.openLoading()
            addLabel(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.labelVisible = false
                        this.$notify({
                            title: '标签新增成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        // 刷新标签列表
                        this.getTagsList()
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

        // 请求 - 编辑标签
        editTags(params) {
            const rLoading = this.openLoading()
            editLabel(params).then(res => {
                rLoading.close()
                if (res.code === 200) {
                    this.labelVisible = false
                    this.$notify({
                        title: '标签编辑成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    })
                    // 刷新标签列表
                    this.getTagsList()
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    })
                }
            })
        },

        // 请求 - 删除标签
        deleteTags(params) {
            const rLoading = this.openLoading()
            deleteLabel(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.$notify({
                            title: '标签删除成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        // 刷新标签列表
                        this.getTagsList()
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

        // 触发搜索按钮
        handleSearch() {
            this.searchContent = this.searchForm.searchLabel
            this.$set(this.pageInfo, 'pageIndex', 1)
            this.selectedCategoryId = -1
            this.getTagsCategoryList()
        },

        handleTagsSearch(category) {
            this.searchContent = this.searchForm.searchLabel
            this.$set(this.pageInfo, 'pageIndex', 1)
            this.getTagsList(category.display_platform)
        },

        // 触发搜索按钮
        handleSearchReset() {
            this.searchForm.category_type = '1'
            this.searchForm.label_type = '2'
            this.displayPlatform = 2
        },

        // 分类-切换状态
        handleCategorySelect() {
            if (this.searchForm.category_type === '1') {
                this.selectedType = 1
            } else if (this.searchForm.category_type === '2') {
                this.selectedType = 2
            }
        },

        // 展示平台-切换状态
        handleDisplayPlatformSelect() {
            if (this.searchForm.label_type === '1') {
                this.displayPlatform = 1
            } else if (this.searchForm.label_type === '2') {
                this.displayPlatform = 2
            }
        },

        // 按钮-新增大类
        addCategory() {
            this.categoryTitle = '新增分类'
            this.categoryVisible = true
            this.$nextTick(() => {
                this.$set(this.categoryForm, 'name', '')
                if (this.selectedType === 1) {
                    this.$set(this.categoryForm, 'category_type', '1')
                } else if (this.selectedType === 2) {
                    this.$set(this.categoryForm, 'category_type', '2')
                }
                if (this.displayPlatform === 1) {
                    this.$set(this.categoryForm, 'label_type', ['1'])
                } else if (this.displayPlatform === 2) {
                    this.$set(this.categoryForm, 'label_type', ['2'])
                }
            })
        },
        // 按钮-编辑大类
        handleEditCategory(item) {
            this.categoryTitle = '编辑分类'
            this.categoryVisible = true
            this.categoryId = item.id
            this.$nextTick(() => {
                // let new_obj = {};
                // new_obj['name'] = item.name;
                if (this.selectedType === 1) {
                    this.$set(this.categoryForm, 'category_type', '1')
                } else if (this.selectedType === 2) {
                    this.$set(this.categoryForm, 'category_type', '2')
                }
                // 触发更新
                this.$set(this.categoryForm, 'name', item.name)
                this.$set(this.categoryForm, 'label_type', [item.display_platform + ''])
                // this.categoryForm = Object.assign({}, this.categoryForm, new_obj);
            })
        },

        // 按钮 - 确定 添加/编辑分类
        handleSaveCategory() {
            this.$refs['categoryFormBox'].validate(valid => {
                if (valid) {
                    let params = {}
                    params['name'] = this.categoryForm.name
                    // ajax
                    if (this.categoryTitle === '新增分类') {
                        if (this.categoryForm.category_type === '1') {
                            params['type'] = 1
                        } else if (this.categoryForm.category_type === '2') {
                            params['type'] = 2
                        } else {
                            params['type'] = -1
                        }
                        const displayPlatform = this.categoryForm.label_type.toString()
                        params['display_platform'] = displayPlatform
                        this.addTagsCategory(params)
                    } else {
                        params['id'] = this.categoryId
                        this.editTagsCategory(params)
                    }

                    // 重置分类下拉框数据
                    this.categoryOptions = []
                    this.categoryList.forEach((ev, i) => {
                        this.categoryOptions.push({
                            key: ev.id,
                            name: ev.name
                        })
                    })
                    this.categoryClose()
                    this.categoryVisible = false
                } else {
                }
            })
        },

        // 按钮-删除大类
        handleDeleteCategory(item) {
            // 二次确认删除
            this.$confirm('确定要删除该分类吗？', '', {
                customClass: 'message-delete',
                type: 'warning'
            })
                .then(() => {
                    let params = {}
                    params['id'] = item.id
                    this.delCategoryId = item.id
                    this.deleteTagsCategory(params)
                })
                .catch(() => {})
        },

        // 按钮-编辑标签
        handleEditLabel(index, row) {
            this.tagsFormTitle = '编辑标签'
            this.labelId = row.id
            this.labelVisible = true
            this.$nextTick(() => {
                const new_obj = {}
                new_obj['category_id'] = row.tag_category_id
                new_obj['name'] = row.name
                // 触发更新
                this.labelForm = Object.assign({}, this.labelForm, new_obj)
            })
        },

        // 按钮- 删除标签
        handleDeleteTags(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除该标签吗？', '', {
                customClass: 'message-delete',
                type: 'warning'
            })
                .then(() => {
                    let params = {}
                    params['id'] = row.id
                    this.deleteTags(params)
                })
                .catch(() => {})
        },

        // 按钮-新增标签
        handleAddTags() {
            if (this.selectedCategoryId === -1) {
                this.$notify({
                    title: '请先选择分类',
                    message: '',
                    type: 'error',
                    duration: 5000
                })
            } else {
                this.tagsFormTitle = '新增标签'
                this.labelVisible = true
                this.$nextTick(() => {
                    const new_obj = {}
                    new_obj['category_id'] = this.selectedCategoryId
                    new_obj['name'] = ''
                    // 触发更新
                    this.labelForm = Object.assign({}, this.labelForm, new_obj)
                })
            }
        },

        // 按钮- 新增/编辑标签
        handleSaveTags() {
            this.$refs['tagsFormBox'].validate(valid => {
                if (valid) {
                    let params = {}
                    params['name'] = this.labelForm.name
                    params['tag_category_id'] = this.labelForm.category_id
                    if (this.tagsFormTitle === '新增标签') {
                        this.addTags(params)
                    } else {
                        params['id'] = this.labelId
                        this.editTags(params)
                    }
                } else {
                    return false
                }
            })
        },

        // 分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val)
            this.getTagsList()
        },

        // 标签弹框关闭前操作
        dialogClose() {
            this.$refs['tagsFormBox'].resetFields()
            this.$refs['tagsFormBox'].clearValidate()
            this.labelVisible = false
        },

        // 分类弹窗关闭前
        categoryClose() {
            this.$refs['categoryFormBox'].resetFields()
            this.$refs['categoryFormBox'].clearValidate()
            this.categoryVisible = false
        },

        //  -- 切换分类
        selectCategory(category) {
            this.selectedCategoryId = category.id
            this.$set(this.searchForm, 'searchLabel', '')
            this.searchContent = ''
            // 搜索请求
            this.handleTagsSearch(category)
        },

        // 展开或者收起分类
        openOrClose() {
            this.isOpen = !this.isOpen
        },

        // 填充分类下拉框数据
        setCategoryOptions(data) {
            this.categoryOptions = []
            data.forEach((ev, i) => {
                this.categoryOptions.push({
                    key: ev.id,
                    name: ev.name
                })
            })
        }
    }
}
</script>
