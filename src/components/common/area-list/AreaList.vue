<template>
    <!-- dialog 城市列表 -->
    <el-dialog title="选择区域" :visible.sync="isShow" width="800" @open="open">
        <div class="area-list">
            <div class="item">
                <el-checkbox v-model="countryCheck" class="check" @change="countryChange">全国</el-checkbox>
            </div>
            <div class="item" v-for="(item, index) in area">
                <el-checkbox
                    v-model="checkAll[index]"
                    :indeterminate="isIndeterminate[index]"
                    class="check check-all"
                    @change="val => checkAllChange(val, index)"
                    >{{ item.region_name }}</el-checkbox
                >
                <el-checkbox-group v-model="checkedCities[index]" @change="val => checkedCitiesChange(val, index)">
                    <el-checkbox class="check check-city" :label="city.area_code" :key="city.area_code" v-for="city in item.children">
                        {{ city.area_name }}
                    </el-checkbox>
                </el-checkbox-group>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="close">取 消</el-button>
            <el-button type="primary" @click="save">保存</el-button>
        </div>
    </el-dialog>
</template>

<script>
// import './AreaList.less';
import { area } from '@/plugin/area';

export default {
    name: 'CheckList',
    props: {
        // isShow: Boolean
        initArea: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            checkAll: [],
            checkedCities: [],
            isIndeterminate: [],
            area,
            isShow: false,
            countryCheck: false
        };
    },
    created() {},
    mounted() {},
    methods: {
        open() {
            // 参数初始化
            this.countryCheck = false;
            this.checkAll = [];
            this.isIndeterminate = [];
            this.checkedCities = [];
            for (let i = 0; i < this.area.length; i++) {
                this.checkAll.push(false);
                this.isIndeterminate.push(false);
                this.checkedCities.push([]);
            }
            // 生成默认选中
            console.log('GOOGLE: initArea', this.initArea);
            if (this.initArea.length > 0) {
                for (let i = 0; i < this.initArea.length; i++) {
                    const initAreaItem = this.initArea[i];
                    for (let j = 0; j < this.area.length; j++) {
                        const areaItem = this.area[j];
                        for (let k = 0; k < areaItem.children.length; k++) {
                            const cityItem = areaItem.children[k];
                            if (cityItem.area_code == initAreaItem.area_code) {
                                this.checkedCities[j].push(cityItem.area_code);
                            }
                        }
                    }
                }
            }
            // 生成全选状态
            for (let i = 0; i < this.checkedCities.length; i++) {
                this.checkedCitiesChange(this.checkedCities[i], i);
            }
        },
        // 全国选择
        countryChange(val) {
            this.checkAll = [];
            this.isIndeterminate = [];
            this.checkedCities = [];
            for (let i = 0; i < this.area.length; i++) {
                this.checkAll.push(false);
                this.isIndeterminate.push(false);
                this.checkedCities.push([]);
            }
            if (val) {
                for (let i = 0; i < this.area.length; i++) {
                    const areaItem = this.area[i];
                    for (let j = 0; j < areaItem.children.length; j++) {
                        const cityItem = areaItem.children[j];
                        this.checkedCities[i].push(cityItem.area_code);
                    }
                }
            }
            // 生成全选状态
            for (let i = 0; i < this.checkedCities.length; i++) {
                this.checkedCitiesChange(this.checkedCities[i], i);
            }
        },
        checkAllChange(val, index) {
            let checked = this.area[index].children.map(item => {
                return item.area_code;
            });

            this.checkedCities[index] = val ? checked : [];
            this.isIndeterminate[index] = false;
        },
        checkedCitiesChange(value, index) {
            let checkedCount = value.length;
            this.checkAll[index] = checkedCount === this.area[index].children.length;
            let status = checkedCount > 0 && checkedCount < this.area[index].children.length;
            this.$set(this.isIndeterminate, index, status);
        },
        save() {
            let list = [];
            for (let i = 0; i < this.checkedCities.length; i++) {
                const cityList = this.checkedCities[i];
                for (let j = 0; j < cityList.length; j++) {
                    const cityId = cityList[j];

                    for (let k = 0; k < this.area[i].children.length; k++) {
                        const cityObj = this.area[i].children[k];
                        if (cityObj.area_code == cityId) {
                            list.push(cityObj);
                        }
                    }
                }
            }
            this.close();
            this.$emit('check-area', list);
        },
        show() {
            this.isShow = true;
        },
        close() {
            this.isShow = false;
        }
    }
};
</script>
<style scoped="scoped" lang="less">
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
