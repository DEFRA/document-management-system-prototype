const version = '1'
const versionDirectory = 'v' + version

const documentData = require('../views/' + versionDirectory + '/data/documents.json');

module.exports = function (router) {

    // include common / userflows.js

    router.get(['/' + versionDirectory + '/search-results', '/' + versionDirectory + '/search-results/:variant'], (req, res) => {
        let thePageObject = documentData
        let pageVariant = req.params.variant || 1
        let searchType = req.query.searchType || 1
        let filterType
        let resultsType
        if (pageVariant == 2) {
            filterType = req.query.filterType || 2
            resultsType = req.query.resultsType || 2
        } else {
            filterType = req.query.filterType || 1
            resultsType = req.query.resultsType || 1
        }
        res.render( versionDirectory + '/search-results.html', {
            pageObject: thePageObject,
            searchType: searchType,
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
