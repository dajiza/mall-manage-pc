<template>
    <div class="print-express-page" @click.stop="">
        <div class="print-express-wrap" ref="imageWrapper">
            <div class="print-express-box" ref="print" style="width: 76mm;height: 130mm;margin: 0 auto;background: #FFFFFF;font-family: PingFangSC-Semibold, PingFang SC;">
                <div class="top-name" style="width: 100%;height: 54px!important;padding: 7px 8px;box-sizing:border-box;display: flex;align-items: center;border-bottom: 1px dashed #000000;">
                    <img class="company-logo" style="width: 40px;height: 40px!important;vertical-align: bottom;" src="data:image/png;base64,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" alt="">
                    <p class="company-name" style="font-size: 14px;font-weight: 600;color: #000000;line-height: 18px;width: 90px;margin-left: 4px">宁波川水文化创意有限公司</p>
                </div>
                <div class="express-no-type" style="height: 44px!important;width: 100%;display: flex;box-sizing:border-box;align-items: center;border-bottom: 1px dashed #000000;">
                    <div class="express-no" style="font-size: 24px;font-weight: 600;color: #000000;line-height: 44px;flex: 1;text-align: center;">{{expressInfo.logistics_order_bulkpen}}</div>
                    <div class="express-type" style="width: 51px;height: 44px;padding:4px 9px;font-size: 16px;box-sizing: border-box;font-weight: 500;color: #000000;line-height: 18px;position: relative;border-left: 1px dashed #000;">标准快递</div><!--border-left: 1px dashed rgba(0,0,0,.5);-->
                </div>
                <div class="ji-time" style="display: flex;width: 100%;height: 32px!important;box-sizing:border-box;position: relative">
                    <div class="ji-address" style="width: 50%;height: 32px!important;box-sizing: border-box;-webkit-box-sizing: border-box;line-height: 24px;padding:0 0 0 6px;display: flex;align-items: center;border-right: 1px dashed #000000;">
                        <div class="ji" style="width: 24px;height: 24px!important;border: 1px solid #000;box-sizing: border-box;display: flex;align-items: center;justify-content: center;font-weight: 600;font-size: 16px">集</div>
                        <div class="address" style="flex:1;text-align: center;font-weight: 600;font-size: 16px">宁波转运中心</div>
                    </div>
                    <div class="print-time" style="width: 50%;height: 32px!important;padding:4px 0 4px 6px;box-sizing:border-box;display: flex;font-size: 10px;font-weight: 500;line-height: 12px;">
                        <div class="text" style="width: 52px;height: 24px!important;font-size: 10px;box-sizing: border-box">打印时间：</div>
                        <div class="time" style="flex: 1;height: 24px!important;display: flex;align-items: center">{{current_time}}</div>
                    </div>
                    <div style="position: absolute;left: 0;top:100%;width: 100%;border-bottom: 1px solid #000000;-webkit-transform-origin: left bottom;transform-origin: left bottom;transform: scaleY(0.6);webkit-transform: scaleY(0.6);"></div>
                </div>
                <div class="receive-send-protect-code" style="width: 100%;height: 181px!important;display: flex;position: relative">
                    <div style="width: 14%;height: 181px!important;border-right: 1px dashed #000;box-sizing: border-box">
                        <div style="width: 100%;height:80px!important;position: relative">
                            <div style="position:absolute;top: 43px;left:8px;width: 0;height: 0!important;border-right: 12px solid transparent;border-left: 12px solid transparent;border-top: 12px solid #000;"></div>
                            <div style="position:absolute;top:22px;left:6px;background: #fff;width: 28px;height: 28px!important;line-height: 24px;text-align: center;border-radius: 100%;border: 2px solid #000;box-sizing: border-box;font-weight: 600;">收</div>
                        </div>
                        <div style="width: 100%;height: 65px!important;line-height: 20px;font-weight: 600;font-size: 16px;display: flex;justify-content: center;align-items: center">寄</div>
                        <div style="width: 100%;height: 36px!important;display: flex;justify-content: center;align-items: center">
                            <div style="width: 24px;height: 24px!important;line-height: 22px;text-align: center;font-weight: 500;border: 1px dashed #000;box-sizing: border-box;border-radius: 100%;">保</div>
                        </div>
                    </div>
                    <div class="receive-send-protect" style="width: 64%;height: 181px!important;position: relative;">
                        <div style="position: absolute;left: 100%;;top: 0;width:181px;border-bottom: 1px solid #000000;-webkit-transform-origin: left top;transform-origin: left top;transform: rotate(90deg) scaleY(0.6);;webkit-transform: rotate(90deg) scaleY(0.6);"></div>
                        <div class="receive-box" style="width: 100%;height: 80px!important;padding: 0 4px;box-sizing: border-box;
                        font-size: 12px;font-weight: 600;line-height: 16px;display: flex;flex-direction: column;justify-content: center">
                            <div style="width: 100%;box-sizing: border-box">
                                <div style="line-height: 16px">{{expressInfo.logistics_name}} {{expressInfo.logistics_phone}}</div>
                                <div>{{expressInfo.logistics_province}}{{expressInfo.logistics_city}}{{expressInfo.logistics_area}}{{expressInfo.logistics_address}}</div>
                            </div>
                        </div>
                        <div class="send-box" style="width: 100%;height: 65px!important;padding: 0 4px;box-sizing: border-box;
                        display: flex;flex-direction: column;justify-content: center;font-size: 11px;font-weight: 500;line-height: 13px;">
                            <div class="send-info" style="width: 100%;box-sizing: border-box">
                                <div>{{sysSenderAddress.name}} {{sysSenderAddress.phone}}</div>
                                <div>{{sysSenderAddress.address}}</div>
                            </div>
                        </div>
                        <div class="protect-box" style="width: 100%;height: 36px!important;font-weight: 500;display: flex;position: relative">
                            <div style="position: absolute;left: 0;top:19px;width: 100%;border-bottom: 1px dashed #000000;"></div>
                            <div style="width: 33.3%;height: 36px!important;box-sizing: border-box;border-right: 1px dashed #000">
                                <div style="width:100%;font-size: 12px;line-height: 20px;text-align: center">代收货款</div>
                                <div style="width:100%;font-size: 12px;line-height: 20px;text-align: center"></div>
                            </div>
                            <div style="width: 33.3%;height: 36px!important;box-sizing: border-box;border-right: 1px dashed #000">
                                <div style="width:100%;font-size: 12px;line-height: 18px;text-align: center">到付运费</div>
                                <div style="width:100%;font-size: 12px;line-height: 18px;text-align: center"></div>
                            </div>
                            <div style="width: 33.3%;height: 36px!important;box-sizing: border-box;">
                                <div style="width:100%;font-size: 12px;line-height: 18px;text-align: center">计费重量</div>
                                <div style="width:100%;font-size: 12px;line-height: 18px;text-align: center"></div>
                            </div>
                        </div>
                    </div>
                    <div class="" style="width: 22%;position: relative">
                        <div class="bar-code-box bar-code-box-x" style="width: 181px;height: 52px !important;position: absolute;bottom: 0;right: 0;
                    box-sizing: border-box;text-align: center;display: flex;flex-direction: column;align-items: center;
                    -webkit-transform-origin: right bottom;transform-origin: right bottom;transform: rotate(90deg) translateY(60px);webkit-transform: rotate(90deg)  translateY(60px);">
                            <img id="barcode2" style="width: 90%;height: 36px !important;display: inline-block;vertical-align: bottom" src="" alt=""/>
                            <span style="font-size: 12px;line-height: 16px">{{expressInfo.logistics_no}}</span>
                        </div>
                    </div>
                    <div style="position: absolute;left: 0;top:80px;width: 78%;border-bottom: 1px dashed #000000;"></div>
                    <div style="position: absolute;left: 0;top:144px;width: 78%;border-bottom: 1px solid #000000;-webkit-transform-origin: left bottom;transform-origin: left bottom;transform: scaleY(0.6);webkit-transform: scaleY(0.6);"></div>
                    <div style="position: absolute;left: 0;top:181px;width: 100%;border-bottom: 1px solid #000000;-webkit-transform-origin: left bottom;transform-origin: left bottom;transform: scaleY(0.6);webkit-transform: scaleY(0.6);"></div>
                    <div style="position: absolute;left: 14%;;top: 0;width:181px;border-bottom: 1px dashed #000000;-webkit-transform-origin: left top;transform-origin: left top;transform: rotate(90deg);webkit-transform: rotate(90deg);"></div>
                </div>
                <div class="bar-code-box bar-code-box-x" style="width: 100%;height: 52px !important;box-sizing: border-box;position: relative;text-align: center;margin-top: 6px;display: flex;flex-direction: column;align-items: center">
                    <img id="barcode" style="width: 80%;height: 36px !important;display: inline-block;vertical-align: bottom" src="" alt=""/>
                    <span style="font-size: 12px;line-height: 16px">{{expressInfo.logistics_no}}</span>
                    <div style="position: absolute;left: 0;top:100%;width: 100%;border-bottom: 1px solid #000000;-webkit-transform-origin: left bottom;transform-origin: left bottom;transform: scaleY(0.6);webkit-transform: scaleY(0.6);"></div>
                </div>
                <div class="remarks-box" style="width: 100%;height: 64px!important;padding: 0 5px;box-sizing: border-box;border-bottom: 1px dashed #000;position: relative;line-height: 16px;display: flex;flex-direction: column;justify-content: center">
                    <div style="width:78%;font-size: 12px;font-weight: 500;display: flex" v-show="false">
                        <div style="width: 30px">备注:</div>
                        <div style="flex: 1;max-width: 184px;"></div>
                    </div>
                    <div style="position: absolute;right: 10px;bottom: 5px;font-size: 14px;font-weight: 500;border: 1px solid #000;padding: 3px 4px;line-height: 1">已验视</div>
                </div>
                <div style="width: 100%;box-sizing: border-box;padding: 0 8px">
                    <div style="font-size: 13px;font-weight: 500;line-height: 20px">签收人/时间</div>
                    <div style="font-size: 9px;font-weight: 500;line-height: 12px">您的签收代表您已签收此包裹，并确认商品信息无误、包裹完好，没有划痕、破损等表面质量问题</div>
                </div>
            </div>
        </div>
        <div class="btn-print" @click="handleSurePrint">确认打印</div>
    </div>
</template>

<script>
    import './PrintExpress.less';
    import jsbarcode from 'jsbarcode'
    import html2canvas from "html2canvas"
    export default {
        name: 'PrintExpress',
        props: {
            // isShow: Boolean
            expressInfo: {
                type: Object,
                default: {}
            },
        },
        data() {
            return {
                isShow: false,
                isOpen: false,
                dialogTableVisible:false,
                imgUrl:'',
                sysSenderAddress:{
                    name:'',
                    phone:'',
                    address:''
                },
                current_time:''
            };
        },
        created() {
            this.current_time = this.getTime();
        },
        mounted() {
            this.$nextTick(()=>{
                if(localStorage.getItem('sys_sender_address') && localStorage.getItem('sys_sender_address')!=='undefined'){
                    const obj = JSON.parse(localStorage.getItem('sys_sender_address'));
                    const send_address = obj.province + obj.city + obj.area + obj.address;
                    this.$set(this.sysSenderAddress,'name', obj['name']);
                    this.$set(this.sysSenderAddress,'phone', obj['phone']);
                    this.$set(this.sysSenderAddress,'address', send_address);
                }
                const str = this.expressInfo.logistics_no;
                jsbarcode(
                    '#barcode',
                    str,
                    {
                        format: "code128",
                        displayValue: false, // 是否在条形码下方显示文字
                        margin: 0
                    }
                )
                jsbarcode(
                    '#barcode2',
                    str,
                    {
                        format: "code128",
                        displayValue: false, // 是否在条形码下方显示文字
                        margin: 0
                    }
                )
            })
        },
        methods: {
            show(){
                this.isShow = true;
                setTimeout(()=>{
                    this.isOpen = true;
                })
            },
            hide(){
                this.isOpen = false;
                setTimeout(()=>{
                    this.isShow = false;
                },300)
            },
            handleSurePrint(){
                setTimeout(()=>{
                    this.$print(this.$refs.print);
                },100)
            },

            // 获取当前时间
            getTime(){
                const dt = new Date();
                let year = dt.getFullYear(); //年
                let month = dt.getMonth() +1; //月
                let date = dt.getDate(); //日
                let hh = dt.getHours(); //时
                let mm = dt.getMinutes(); //分
                let ss = dt.getSeconds(); //秒
                month = month < 10 ? "0" + month : month;
                date  = date <10 ? "0" + date : date;
                hh  = hh <10 ? "0" + hh : hh;
                mm  = mm <10 ? "0" + mm : mm;
                ss  = ss <10 ? "0" + ss : ss;
                let new_time = ''
                new_time = year + "-" + month + "-" + date + ' ' + hh + ':' + mm + ':' + ss;
                return new_time;
            },
        }
    };
</script>