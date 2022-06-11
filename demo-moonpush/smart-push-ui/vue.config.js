const { options } = require('less')

module.exports = {
    lintOnSave: false,
    configureWebpack: {

        plugins: [
            require('unplugin-element-plus/webpack')({
                // options
            }),
        ],
    },

    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    'arcoblue-6': '#08ef9c',
                },
                javascriptEnabled: true,
            },
        }
    },
}