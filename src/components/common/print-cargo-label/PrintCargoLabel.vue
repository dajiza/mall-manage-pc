<template>
    <div class="print-cargo-label-page" @click.stop="">
        <div id="printMe" ref="print">
            <div class="label-box">
                <div class="label-content">
                    <div class="product-name">
                        <div class="title">产品名称</div>
                        <div class="name-text">韩货进口纯棉好布料皇上专用布料市场价今年</div>
                    </div>
                    <div class="detail-code">
                        <div class="title">货物编码</div>
                        <div class="code-text">CKKN8769-001</div>
                    </div>
                    <div class="shelf-code">
                        <div class="title">货架编码</div>
                        <div class="code-text">01-01-A30-1</div>
                    </div>
                    <div class="QRCode-box">
                        <div class="qrcode" ref="qrCodeUrl"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import './PrintCargoLabel.less';
    import QRCode from 'qrcodejs2';
    export default {
        name: 'PrintCargoLabel',
        props: {
            // isShow: Boolean
            cargoLabelInfo: {
                type: Array,
                default: []
            },
            bigImgWidth:{
                type: String,
                default: '640px'
            }
        },
        data() {
            return {
                isShow: false,
                isOpen: false,
            };
        },
        created() {
        },
        mounted() {
            this.showCode();
        },
        methods: {
            // 显示二维码
            showCode(userItem){
                this.codeIsShow = true;
                let obj = {
                    code:'jkl3123123',
                    type:1
                }
                this.$nextTick(()=>{
                    let params = JSON.stringify(obj);
                    this.creatQrCode(params);
                })
            },
            // 生成二维码
            creatQrCode(params) {
                var qrcode = new QRCode(this.$refs.qrCodeUrl, {
                    text: params, // 需要转换为二维码的内容
                    width: 180,
                    height: 180,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                })
            },
        }
    };
</script>