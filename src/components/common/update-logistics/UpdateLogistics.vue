<template>
    <el-dialog
        title="修改收货信息"
        custom-class="update-logistics-dialog"
        :visible.sync="updateLogisticsInfo.visible"
        width="490px"
        :destroy-on-close="true"
        :before-close="handleClose"
        append-to-body
        @opened="opened"
    >
        <el-form
                ref="logisticsChangeForm"
                :rules="rules"
                :model="updateForm"
                label-position="top"
        >
            <div class="row-wrap">
                <el-form-item label="收货人姓名" prop="name">
                    <el-input class="w200" v-model="updateForm.name" placeholder="请输入收货人姓名"></el-input>
                </el-form-item>
                <el-form-item label="收货人手机号" prop="phone">
                    <el-input class="w200" v-model="updateForm.phone" placeholder="请输入收货人手机号"></el-input>
                </el-form-item>
            </div>
            <div class="el-form-item__label required">收货地址</div>
            <div class="row-wrap">
                <el-form-item label="" prop="province" required>
                    <el-select class="w136" v-model="updateForm.province" filterable placeholder="请选择" @change="provinceChange">
                        <el-option
                                v-for="item in provinceList"
                                :key="item.code"
                                :label="item.name"
                                :value="item.code">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="" prop="city">
                    <el-select class="w136" v-model="updateForm.city" filterable placeholder="请选择" @change="cityChange">
                        <el-option
                                v-for="item in cityOptions"
                                :key="item.code"
                                :label="item.name"
                                :value="item.code">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="" prop="area">
                    <el-select class="w136" v-model="updateForm.area" filterable placeholder="请选择">
                        <el-option
                                v-for="item in areaOptions"
                                :key="item.code"
                                :label="item.name"
                                :value="item.code">
                        </el-option>
                    </el-select>
                </el-form-item>
            </div>
            <div class="row-wrap">
                <el-form-item label="" prop="address">
                    <el-input style="width: 430px" v-model="updateForm.address" placeholder="请输入详细地址"></el-input>
                </el-form-item>
            </div>
        </el-form>
        <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handleUpdate('logisticsChangeForm')">修 改</el-button>
            </span>
    </el-dialog>
</template>
<script>
import './UpdateLogistics.less';
import EmptyList from '../empty-list/EmptyList';
import { queryCity, queryArea } from '@/api/configManagement';
export default {
    name: 'OperationRecord',
    props: ['provinceList','updateLogisticsInfo'],
    data() {
        // 自定义手机号验证
        var checkMobile = (rule, value, callback) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[3678]|18[0-9]|14[57])[0-9]{8}$/;
            if (regMobile.test(value)) {
                return callback();
            }
            callback(new Error('请输入合法的手机号'));
        };
        return {
            loading: false,
            updateForm:{
                name: '',
                phone: '',
                province: '',
                city: '',
                area: '',
                address: ''
            },
            rules:{
                name: [
                    { required: true, message: '请输入收货人姓名', trigger: 'blur' }],
                phone: [
                    { required: true, message: '请输入收货人手机号', trigger: 'blur' },
                    {
                        validator: checkMobile,
                        trigger: 'blur'
                    }
                ],
                province: [{ required: true, message: '请选择省份', trigger: 'blur' }],
                city: [{ required: true, message: '请选择城市', trigger: ['blur','change'] }],
                area: [{ required: true, message: '请选择区', trigger: ['blur','change'] }],
                address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
            },
            cityOptions: [],
            areaOptions: [],
        };
    },
    components: {
        EmptyList
    },
    computed:{},
    created() {},
    mounted() {},
    methods: {
        opened() {
            console.log('opened')
            console.log('updateLogisticsInfo', this.updateLogisticsInfo.info)
            this.$set(this.updateForm,'name', this.updateLogisticsInfo.info.logistics_name)
            this.$set(this.updateForm,'phone', this.updateLogisticsInfo.info.logistics_phone)
            this.$set(this.updateForm,'address', this.updateLogisticsInfo.info.logistics_address)
            const province = this.updateLogisticsInfo.info.logistics_province
            const city = this.updateLogisticsInfo.info.logistics_city
            const area = this.updateLogisticsInfo.info.logistics_area

            const loading = this.$loading({
                lock: true,
                text: '加载中'
            })
            const province_arr = this.provinceList.filter((item)=>{return item.name == province})
            if (province_arr.length > 0) {
                this.$set(this.updateForm,'province', province_arr[0].code)
                queryCity({parent_code: province_arr[0].code})
                    .then(res => {
                        console.log('res', res)
                        this.cityOptions = res.data || []
                        const city_arr = this.cityOptions.filter((item)=>{return item.name == city})
                        console.log('city_arr', city_arr)
                        if (city_arr.length > 0) {
                            this.$set(this.updateForm,'city', city_arr[0].code)
                            queryArea({parent_code: city_arr[0].code})
                                .then(res => {
                                    console.log('res', res)
                                    this.areaOptions = res.data || []
                                    const area_arr = this.areaOptions.filter((item)=>{return item.name == area})
                                    console.log('area_arr', area_arr)
                                    if(area_arr.length > 0) {
                                        this.$set(this.updateForm,'area', area_arr[0].code)
                                    }
                                    loading.close()
                                })
                                .catch(err => {})
                        } else {
                            loading.close()
                        }
                    })
                    .catch(err => {})
            } else {
                loading.close()
            }
            this.provinceList.forEach((ev)=>{
                if(ev.name == province) {
                    console.log(ev, ev)
                    this.$set(this.updateForm,'province', ev.code)

                }
            })
            console.log('provinceList', this.provinceList)
        },
        getCity(code) {
            const params = {
                parent_code: code
            }
            const loading = this.$loading({
                lock: true,
                text: '加载中'
            })
            queryCity(params)
                .then(res => {
                    console.log('res', res)
                    this.cityOptions = res.data || []
                    loading.close()
                })
                .catch(err => {})
        },
        getArea(code) {
            const params = {
                parent_code: code
            }
            const loading = this.$loading({
                lock: true,
                text: '加载中'
            })
            queryArea(params)
                .then(res => {
                    console.log('res', res)
                    this.areaOptions = res.data || []
                    loading.close()
                })
                .catch(err => {})
        },
        provinceChange() {
            console.log('this.updateForm.province', this.updateForm.province)
            // 请求市
            if(this.updateForm.province) {
                this.$set(this.updateForm,'city', '')
                this.$set(this.updateForm,'area', '')
                this.getCity(this.updateForm.province)
            }
        },

        cityChange() {
            console.log('this.updateForm.city', this.updateForm.city)
            // 请求市
            if(this.updateForm.city) {
                this.$set(this.updateForm,'area', '')
                this.getArea(this.updateForm.city)
            }
        },

        // 弹出关闭
        handleClose() {
            this.$emit('handleClose', false);
        },

        handleUpdate(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    const params = _.cloneDeep(this.updateForm)
                    params['province'] = this.provinceList.filter((item)=>{return item.code == this.updateForm.province})[0].name
                    params['city'] = this.cityOptions.filter((item)=>{return item.code == this.updateForm.city})[0].name
                    params['area'] = this.areaOptions.filter((item)=>{return item.code == this.updateForm.area})[0].name
                    this.$emit('update', params);
                }
            })

        },
    }
};
</script>