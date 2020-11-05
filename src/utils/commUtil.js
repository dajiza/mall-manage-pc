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
    }
};