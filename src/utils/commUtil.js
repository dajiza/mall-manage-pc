export default {
    processData(data){
        let dealOptions = []
        // 给每个数据加children属性
        data.forEach((ev, one) => {
            ev.subs = []
        })
        data.forEach((ev, one) => {
            let findIndex = data.findIndex((item) => item.permission_id === ev.pid);
            if ((!ev.pid && ev.pid !== 0 && ev.pid !== false) || findIndex === -1) {
                dealOptions.push(ev);
            } else {
                data[findIndex].subs.push(ev);
            }
        })
        return dealOptions
    },
    // 浮点数 + - x
    numberAdd(a, b) {
        let c, d, e;
        try {
            c = a.toString().split(".")[1].length;
        } catch (f) {
            c = 0;
        }
        try {
            d = b.toString().split(".")[1].length;
        } catch (f) {
            d = 0;
        }
        return e = Math.pow(10, Math.max(c, d)), (this.numberMul(a, e) + this.numberMul(b, e)) / e;
    },

    numberSub(a, b) {
        let c, d, e;
        try {
            c = a.toString().split(".")[1].length;
        } catch (f) {
            c = 0;
        }
        try {
            d = b.toString().split(".")[1].length;
        } catch (f) {
            d = 0;
        }
        return e = Math.pow(10, Math.max(c, d)), (this.numberMul(a, e) - this.numberMul(b, e)) / e;
    },
    numberMul(a, b) {
        let c = 0,
            d = a.toString(),
            e = b.toString();
        try {
            c += d.split(".")[1].length;
        } catch (f) {}
        try {
            c += e.split(".")[1].length;
        } catch (f) {}
        return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
    }
};