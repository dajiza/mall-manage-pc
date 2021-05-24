<template>
    <div class="app-container teamwork-container">
        <!-- 原订单信息 -->
        <div class="wrap detail">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">团作信息</div>
            </div>
            <div class="divider"></div>
            <div class="substance" style="padding: 22px 32px 32px">
                <div class="order-info">
                    <div class=" w280">
                        <img class="head-img" :src="detail.poster_link" alt="" />
                    </div>
                </div>
                <div class="order-info">
                    <div class="sheet w280">
                        <span class="label">团作名称：</span>
                        <span class="value">{{ detail.title }}</span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">团作ID：</span>
                        <span class="value">{{ detail.id }}</span>
                    </div>
                    <div class="sheet w280" v-if="shopList">
                        <span class="label">店铺名称：</span>
                        <span class="value" v-if="detail.shop_id">{{ shopList.find(item => item.id == detail.shop_id).shop_name }}</span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">团作时间：</span>
                        <span class="value">
                            <span class="value">{{ $moment(detail.start_time_txt).format('YYYY-MM-DD') }} ~ {{ $moment(detail.end_time_txt).format('YYYY-MM-DD') }}</span>
                        </span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">创建时间：</span>
                        <span class="value">{{ $moment(detail.created_at_txt).format('YYYY-MM-DD') }}</span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">状态：</span>
                        <span class="value">{{ detail.time_status }}</span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">报名人数：</span>
                        <span class="value">{{ detail.join_num }} / {{ detail.limit_num }} </span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">团作模式：</span>
                        <span class="value" v-if="detail.type == 1">免费</span>
                        <span class="value" v-else-if="detail.type == 2">付费</span>
                        <span class="value" v-else>押金</span>
                    </div>
                    <div class="sheet w280" v-if="detail.course_price">
                        <span class="label">价格：</span>
                        <span class="value">{{ formatMoney(detail.course_price) }}</span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">老师昵称：</span>
                        <span class="value">{{ detail.nick_name }}</span>
                    </div>
                    <div class="sheet w280">
                        <span class="label">是否删除：</span>
                        <span class="value">{{ detail.deleted_at_txt ? '是' : '否' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 订单备注 -->
        <div class="wrap detail">
            <div class="tabs-and-add">
                <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <el-tab-pane label="团作介绍" name="1"></el-tab-pane>
                    <el-tab-pane label="课程资料" name="2"></el-tab-pane>
                    <el-tab-pane label="学员列表" name="3"></el-tab-pane>
                </el-tabs>
            </div>
            <div class="tab-content" v-show="activeName == 1" key="1">
                <textarea ref="editor" id="editor" name="editor" class="text"></textarea>
            </div>
            <div class="tab-content" v-show="activeName == 2" key="2">
                <div class="video">
                    <div class="title">课程视频</div>
                    <div class="list">
                        <div class="img" v-for="item in videoList" :key="item.id" @click="openPreviewVideo(item.link)">
                            <img class="fullimg" :src="item.video_img_url || imgVedio" alt="" />
                            <img class="play" :src="imgPlay" alt="" />
                        </div>
                    </div>
                </div>
                <div class="video">
                    <div class="title">课程图片</div>
                    <div class="list">
                        <div class="img" v-for="(item, index) in imgList" :key="item.id">
                            <img class="fullimg" :src="item.link" alt="" @click="openPreviewPic(index)" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="tab-content" v-show="activeName == 3" key="3">
                <el-table :data="studentList" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
                    <el-table-column label="真实姓名" min-width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.user_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="客户微信头像" width="">
                        <template slot-scope="scope">
                            <img class="wx-img" :src="scope.row.avatar_url" alt="" />
                        </template>
                    </el-table-column>
                    <el-table-column label="客户微信昵称" min-width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.nick_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="客户手机号" min-width="">
                        <template slot-scope="scope">
                            <span>{{ scope.row.user_phone }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <!-- 视频预览 -->
        <el-dialog :visible.sync="dialogVisibleVideo" title="预览">
            <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true" :options="playerOptions"></video-player>
        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreviewPic" :url-list="previewUrlListPic" :initial-index="previewIndexPic" />
    </div>
</template>
<script>
import { cacheData, queryCourseMediaList, queryCourseApplyList } from '@/api/teamwork'
import ElImageViewer from '@/components/common/image-viewer'
import { queryShopList } from '@/api/goods'
import bus from '@/components/common/bus'
import { formatMoney } from '@/plugin/tool'

import { Jodit } from '@/plugin/jodit.es2018'
import '@/plugin/jodit.es2018.min.css'

export default {
    data() {
        return {
            id: '',
            detail: {},
            editor: '',
            studentList: null,
            activeName: '1',
            shopList: null,
            videoList: [],
            imgList: [],
            imgVedio: require('@/assets/img/vedio.png'),
            imgPlay: require('@/assets/img/play.png'),
            // 预览
            dialogVisibleVideo: false,
            dialogVisiblePic: false,
            previewUrlListPic: [],
            previewIndexPic: '',
            // 视频播放参数
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
        }
    },
    components: {
        ElImageViewer
    },
    created() {},
    async mounted() {
        await this.queryShopList()
        this.id = Number(this.$route.params.id)

        this.getDetail()
        var editor = new Jodit(this.$refs.editor, {
            toolbar: false,
            readonly: true,
            // preset: 'inline',
            maxWidth: 500,
            // height: 680,
            askBeforePasteHTML: false,
            toolbarSticky: false,
            toolbarButtonSize: 'small',
            language: 'zh_cn',
            method: 'POST',
            format: 'json',
            uploader: {
                url: this.uploadImgUrl,
                filesVariableName: function(e) {
                    return 'file'
                },
                insertImageAsBase64URI: false,
                imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
                withCredentials: false,
                headers: this.header
            }
        })
        this.editor = editor
        // 刷新或者数据为空 则返回列表
        if (!cacheData.teamworkData) {
            bus.$emit('close_current_tags')
            this.$router.push({
                path: '/mall-backend-teamwork-list'
            })
            return
        }
        this.detail = _.cloneDeep(cacheData.teamworkData)
        this.editor.value = this.detail.introduction
    },
    inject: ['reload'],
    methods: {
        formatMoney: formatMoney,
        getDetail() {
            queryCourseMediaList({ course_id: this.id })
                .then(res => {
                    let list = res.data
                    let videoList = []
                    let imgList = []
                    for (let i = 0; i < list.length; i++) {
                        const element = list[i]
                        if (element.type == 1) {
                            videoList.push(element)
                        } else {
                            imgList.push(element)
                        }
                    }
                    this.videoList = _.cloneDeep(videoList)
                    this.imgList = _.cloneDeep(imgList)
                    this.previewUrlListPic = imgList.map(item => item.link)
                })
                .catch(err => {})
            queryCourseApplyList({ course_id: this.id })
                .then(res => {
                    this.studentList = res.data
                })
                .catch(err => {})
        },
        // 代理店铺列表
        queryShopList() {
            return new Promise((resolve, reject) => {
                queryShopList()
                    .then(res => {
                        this.shopList = res.data
                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        },
        // 按钮-切换列表
        handleTabClick(tab) {},
        // 图片预览
        closePreviewPic() {
            this.dialogVisiblePic = false
        },
        openPreviewPic(index) {
            this.previewIndexPic = index
            this.dialogVisiblePic = true
        },
        // 视频预览

        openPreviewVideo(src) {
            this.playerOptions['sources'][0]['src'] = src
            this.dialogVisibleVideo = true
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.page-title {
    box-sizing: border-box;
    padding-left: 24px;
    width: 100%;
    height: 80px;
    border-radius: 2px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 20px;
    line-height: 80px;
}

.wrap {
    margin-bottom: 20px;
    border-radius: 2px;
    background: #fff;
}
.detail {
    .substance {
        padding: 32px;
        .divider {
            margin: 20px 0;
        }
        .label {
            color: rgba(0, 0, 0, 0.85);
        }
        .order-info {
            display: flex;
            flex-wrap: wrap;
            .head-img {
                width: 250px;
                height: 120px;
                border-radius: 3px;
            }
            // padding-top: 10px;

            .sheet {
                margin-right: 20px;
                padding-top: 32px;
            }
            .w280 {
                /*width: 300px;*/
                min-width: 280px;
            }
            &:first-child {
                padding-top: 0;
                /*.sheet{*/
                /*    padding-top: 0;*/
                /*}*/
            }
            .remark-box {
                display: flex;
                .label {
                    width: 72px;
                }
                .value {
                    flex: 1;
                }
            }
        }
        .info {
            display: flex;
            justify-content: space-between;
        }
        .sheet-img {
            display: flex;
            margin-top: 32px;
        }
        .apply-img {
            margin-right: 12px;
            width: 120px;
            height: 120px;
            cursor: pointer;
        }
    }
}
.tab-content {
    padding: 0 24px 45px 24px;
    .introduction {
        width: 500px;
    }
    .video {
        margin-bottom: 30px;
        .title {
            margin-bottom: 20px;
            color: rgba(0, 0, 0, 0.85);
        }
        .list {
            display: flex;
            flex-wrap: wrap;
            .img {
                position: relative;
                flex-shrink: 0;
                margin-right: 10px;
                margin-bottom: 10px;
                width: 120px;
                height: 120px;
                border-radius: 2px;
                .fullimg {
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }
                .play {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    margin: auto;
                    width: 40px;
                    height: 40px;
                }
            }
        }
    }
    .wx-img {
        width: 40px;
        height: 40px;
        border-radius: 2px;
    }
}
</style>
<style>
.teamwork-container .tabs-and-add .el-tabs__nav {
    height: 60px;
    line-height: 60px;
}
.teamwork-container .tabs-and-add .el-tabs--top .el-tabs__item.is-top {
    padding: 0 40px;
}
.teamwork-container .tabs-and-add .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
    padding-right: 40px;
    padding-left: 24px;
}
</style>
