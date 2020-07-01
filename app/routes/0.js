const version = '0'
const versionDirectory = 'v' + version

const documentData = require('../views/' + versionDirectory + '/data/documents.json');

module.exports = function (router) {

    // include common / userflows.js

    router.get(['/' + versionDirectory + '/dir/'], function (req, res) {
        res.redirect('/' + versionDirectory + '/dir/example')
    })

    router.get(['/' + versionDirectory + '/search-results'], (req, res) => {
        let thePageObject = documentData
        res.render( versionDirectory + '/search-results.html', {
            pageObject: thePageObject
        })
    })

}
