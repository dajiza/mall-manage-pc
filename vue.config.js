const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    publicPath: './',
    assetsDir: 'static',
    productionSourceMap: false,
    chainWebpack: config => {
        config.resolve.symlinks(true);
    }, //自动热更新
    pluginOptions: {
        'style-resources-loader': {
            preProcessor: 'less',
            patterns: [
                //这个是加上自己的路径，
                //注意：试过不能使用别名路径
                path.resolve(__dirname, './src/assets/init.less')
            ]
        },
        pwa: {
            iconPaths: {
                favicon32: 'http://mall.backend.chuanshui.cn/favicon.ico',
                favicon16: 'http://mall.backend.chuanshui.cn/favicon.ico',
                appleTouchIcon: 'http://mall.backend.chuanshui.cn/favicon.ico',
                maskIcon: 'http://mall.backend.chuanshui.cn/favicon.ico',
                msTileImage: 'http://mall.backend.chuanshui.cn/favicon.ico'
            }
        }
    },
    devServer: {
        proxy: {
            '/api': {
                target: 'http://storehouse.api.chuanshui.cn',
                changeOrigin: true,
                pathRewrite: {
                    '/api': ''
                }
            }
        }
    }
    /*configureWebpack: config => {
        // if (process.env.VUE_APP_MODE === 'dev' || process.env.VUE_APP_MODE === 'local') {
            console.log('打包压缩',process.env);
            // 为生产环境修改配置
            config.plugins.push(
                new UglifyJsPlugin({
                    uglifyOptions: {
                        compress: {
                            drop_debugger: true,
                            drop_console: true,  //生产环境自动删除console
                        },
                        warnings: false,
                    },
                    cache:true,
                    sourceMap: false,
                    parallel: true,//使用多进程并行运行来提高构建速度。默认并发运行数：os.cpus().length - 1。
                })
            );
        // }
    }*/
};
