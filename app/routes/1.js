const version = '1'
const versionDirectory = 'v' + version

const documentData = require('../views/' + versionDirectory + '/data/documents.json');

module.exports = function (router) {

    // include common / userflows.js

    router.get(['/' + versionDirectory + '/search-results', '/' + versionDirectory + '/search-results/:variant'], (req, res) => {
        let thePageObject = documentData
        let pageVariant = req.params.variant || 1
        let filterType = req.query.filterType || 1
        let resultsType = req.query.resultsType || 1
        if (pageVariant == 2) {
            filterType = 2
            resultsType = 2
        }
        console.log(req.params.variant)
        res.render( versionDirectory + '/search-results.html', {
            pageObject: thePageObject,
            pageVariant: pageVariant,
            resultsType:resultsType,
            filterType: filterType
        })
    })
    //
    // router.get(['/' + versionDirectory + '/search-results/:variant'], function (req, res) {
    //     let thePageObject = documentData
    //     thePageObject.filterType = req.params.variant
    //     res.render( versionDirectory + '/search-results.html', {
    //         pageObject: thePageObject
    //     })
    // })

}
