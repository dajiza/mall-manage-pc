<template>
    <div>
        <v-tag-picker
            :tag-picker-dialog-visible="dialogVisible"
            @cancel="dialogCancel"
            @confirm="dialogConfirm"
            :options="options"
            :value="pickerTag"
        ></v-tag-picker>
        <div>
            <p>小程序标签</p>
            <el-tag v-for="item in miniProgramTags">{{item.label}}</el-tag>
        </div>
        <div>
            <p>后台标签</p>
            <el-tag v-for="item in backendTags">{{item.label}}</el-tag>
        </div>
        <el-button type="primary" @click="dialogVisible = true">标签选择</el-button>
    </div>
</template>

<script>
import vTagPicker from '../../common/TagPicker.vue';
import { getLabelAllList } from '@/api/goodsLabel';

export default {
    name: 'TagPickerDemo',
    data: function() {
        return {
            dialogVisible: false,
            options: {},
            miniProgramTags: [],
            backendTags: []
        };
    },
    components: {
        vTagPicker
    },
    computed: {
        pickerTag: function() {
            return this.miniProgramTags.concat(this.backendTags);
        }
    },
    mounted() {
        const rLoading = this.openLoading();
        Promise.all([
            getLabelAllList({
                type: 1,
                display_platform: 1
            }),
            getLabelAllList({
                type: 1,
                display_platform: 2
            })
        ])
            .then(res => {
                rLoading.close();
                console.log(res);
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
                console.log(this.options);
            })
            .catch(() => {});
    },
    methods: {
        dialogCancel() {
            console.log('dialogCancel');
            this.dialogVisible = false;
        },
        dialogConfirm(value) {
            console.log('dialogConfirm');
            console.log(value);
            this.dialogVisible = false;
            let miniProgramTags = value.miniProgramTags;
            if (miniProgramTags) {
                this.miniProgramTags = miniProgramTags;
            }
            let backendTags = value.backendTags;
            if (backendTags) {
                this.backendTags = backendTags;
            }

        }
    }
};
</script>

<style scoped></style>
