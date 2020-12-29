/**
 * 格式化金额
 */
export function formatMoney(val) {
    if (val == 0) {
        return '0.00'
    }
    if (!val) {
        return ''
    }
    //金额转换 分->元 保留2位小数
    var str = (val / 100).toFixed(2) + ''
    // var intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ',') //取到整数部分
    var intSum = str.substring(0, str.indexOf('.')).replace('/B(?=(?:d{3})+$)', 'g', '.')
    var dot = str.substring(str.length, str.indexOf('.')) //取到小数部分搜索
    var ret = intSum + dot
    return ret
}
