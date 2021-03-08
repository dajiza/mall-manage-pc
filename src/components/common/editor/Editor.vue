<template>
    <div class="editor_warp">
        <!-- <div ref="editor" class="text" /> -->
        <textarea ref="editor" id="editor" name="editor" class="text"></textarea>
        <!-- <div style="margin: 12px 5px;font-size: 16px;font-w/api/wechateight: bold;color: #696969">HTML渲染如下：</div> -->
        <!-- <div class="editor-content">
            <div class="content" v-html="editorContent" />
        </div> -->
    </div>
</template>

<script>
// import '@/assets/styles/jodit.min.css'

// import Jodit from 'jodit/build/jodit.es2018.min.js'
// import { mapGetters } from 'vuex'
// import { getToken } from '@/utils/auth'
// import { uploadImages, uploadImg } from '@/api/wechat'

import { Jodit } from 'jodit'
import 'jodit/build/jodit.es2018.min.css'
import { getToken } from '@/utils/auth'
export default {
    name: 'Editor',
    props: {
        // 此处一定要用value
        // value: {
        //     type: String
        // },
        // 增加content 用作编辑时从父组件传入已有文章 解决文章末尾回车问题
        content: {
            type: String
        }
    },
    data() {
        return {
            // headers: {
            //     Authorization: ' ' + getToken()
            // },
            header: {},
            editorContent: ``,
            editor: ''
        }
    },
    watch: {
        // value(val) {
        //     this.editorContent = val
        //     this.editor.value = this.editorContent
        // },
        content(val) {
            console.log('GOOGLE: watch')
            this.editorContent = val
            this.editor.value = this.editorContent
        }
    },
    created() {
        // 图片上传地址
        this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file'
        this.header['token'] = getToken()
    },
    mounted() {
        const that = this
        // var editor = new E(this.$refs.editor)
        // var editor = new Jodit(this.$refs.editor)

        // const editor = Jodit.make('#editor')
        // editor.value = '<p>start</p>'
        // var editor = new Jodit('#editor')
        // editor.value = '<p>start</p>'

        var editor = new Jodit(this.$refs.editor, {
            width: 600,
            height: 680,
            askBeforePasteHTML: false,
            language: 'zh_cn',
            uploader: {
                url: this.uploadImgUrl,
                filesVariableName: function(e) {
                    return 'files'
                },
                insertImageAsBase64URI: false,
                imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
                withCredentials: true,
                headers: this.header,

                prepareData: function(data) {
                    console.log(data)
                    data.append('id', 24)
                    return data
                },
                isSuccess: function(resp) {
                    console.log('0>>>' + JSON.stringify(resp[0]))
                    return resp
                },
                process: function(resp) {
                    console.log('GOOGLE: resp', resp)
                    return {
                        files: ['', resp.data[0] + '?time=' + new Date().valueOf()],
                        isImages: [false, true],
                        baseurl: ''
                    }
                }
            },
            events: {
                beforePaste: function(event) {
                    console.log('GOOGLE: beforePaste')
                },
                processPaste: function(event, html) {
                    console.log('GOOGLE: html', html)
                    html = '1234'
                },
                afterPaste: function(event) {
                    console.log('GOOGLE: afterPaste')
                }
            }
        })
        this.editor = editor
        // 监听编辑器内容改变 给预览 父组件赋值
        editor.events.on('change', function(value, aa, bb) {
            console.log('GOOGLE: change')
            that.editorContent = value
            that.editorContent = that.editorContent.replace(/crossorigin=\"anonymous\"/g, '')
            // that.editor.value = that.editorContent
            that.$emit('input', that.editorContent)
        })

        // 监听编辑器内容从粘贴来 处理图片跨域 给预览 父组件赋值 并返回给编辑器本身 给编辑器本身赋值会使光标返回开头
        // processPaste 触发不稳定
        // editor.events.on('processPaste', function(event, clipboard_html, types_str) {
        //     console.log('GOOGLE: processPaste')
        //     that.editor.selection.insertHTML(clipboard_html)
        //     that.editor.tempContent = that.editor.getEditorValue()
        // })
        // 获取的数据不对
        // editor.events.on('paste', function(event) {
        //     console.log('GOOGLE: paste', that.editor.value)
        //     that.editorContent = that.editor.getEditorValue()
        //     that.editorContent = that.editorContent.replace(/crossorigin=\"anonymous\"/g, '')
        //     that.editor.value = that.editorContent
        //     that.$emit('input', that.editorContent)
        // })
        // 第一次粘贴不触发
        // editor.events.on('afterPaste', function(event) {
        //     console.log('GOOGLE: afterPaste', that.editor.value)
        //     that.editorContent = that.editor.value
        //     that.editorContent = that.editorContent.replace(/crossorigin=\"anonymous\"/g, '')
        //     that.editor.value = that.editorContent
        //     that.$emit('input', that.editorContent)
        // })

        // 初始化数据
        // editor.value = this.value
        // console.log('GOOGLE: value', this.value)
    }
}
</script>

<style scoped="scoped">
.editor_warp {
    /* display: flex; */
    /* justify-content: space-around; */
}

/*  */

/* .text {
    float: left;
    margin: 5px;
    width: 60% !important;
    text-align: left;
}

.editor_warp >>> .jodit_container {
    float: left;
    margin: 5px;
    width: 60%;
    text-align: left;
} */
</style>

<style>
.w-e-text-container {
    min-height: 600px;
}
.jodit_workplace {
    min-height: 600px !important;
}
</style>
