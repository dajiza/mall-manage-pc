import request from '../utils/request';

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params){
    return new Promise((resolve, reject) =>{
        request.get(url, {
            params: params
        })
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}
/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params) {
    return new Promise((resolve, reject) => {
        request.post(url, params)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}

/**
 * put 请求
 * @param  url
 * @param  params
 */
export function put(url,params){
    return new Promise((resolve,reject) => {
        request.put(url,params)
            .then(response => {
                resolve(response.data);
            },err => {
                reject(err)
            })
    })
}