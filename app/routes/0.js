const version = '0'
const versionDirectory = 'v' + version


module.exports = function (router) {

    // include common / userflows.js

    router.get(['/' + versionDirectory + '/dir/'], function (req, res) {
        res.redirect('/' + versionDirectory + '/dir/example')
    })

}
