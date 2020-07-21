const version = '2'
const versionDirectory = 'v' + version
const previousVersionDirectory = 'v1'
const pf = require('@benwatsonuk/page-flow')
let pageFlow = require('../data/pages')
let userFlow = require('../views/' + versionDirectory + '/user-flows.json')
let previousUserFlow = require('../views/' + previousVersionDirectory + '/user-flows.json')

const documentData = require('../views/' + versionDirectory + '/data/documents.json');

function createDataFromJson(permitId) {
    permitId = permitId || 'EAWML403958'
    const dataObject =  [{
        "registration": "EPR-AA1234FQ",
        "docTitle" : "Issued transfer notice",
        "name" : "Carter Plant Limited",
        "uploadedOn" : "03/12/2019",
        "permitType" : "Installation",
        "documentType" : "Permit",
        "fileType" :"PDF"
    }]
    return dataObject
}

module.exports = function (router) {

    router.get(['/' + versionDirectory + '/page-flow/'], function (req, res) {
        res.render('./includes/page-flow.html',
            {
                pageIndex: pf.renderPageIndex(pageFlow)
            }
        )
    })

    router.get(['/' + versionDirectory + '/user-flow/'], function (req, res) {
        res.render('./includes/user-flow.html',
            {
                userFlow: pf.renderUserFlow(userFlow, pageFlow, previousUserFlow, version)
            }
        )
    })

    router.get(['/' + versionDirectory + '/user-flow/:journeyId/:theJourneyDirectory/:page', '/' + versionDirectory + '/user-flow/:journeyId/:theJourneyDirectory/:stage/:page'], function (req, res) {
        res.render('./includes/user-flow.html',
            {
                userFlow: pf.renderUserFlowPage(pageFlow, userFlow, req.params.page, req.params.theJourneyDirectory, versionDirectory, req.params.journeyId, req.params.stage)
            }
        )
    })
    // include common / userflows.js

    router.get(['/' + versionDirectory + '/search/search-results', '/' + versionDirectory + '/search/search-results/:variant'], (req, res) => {
        let thePageObject = createDataFromJson()
        let pageVariant = req.params.variant || 1
        let searchType = req.query.searchType || 1
        let filterType
        let resultsType
        if (pageVariant == 3) {
            filterType = req.query.filterType || 3
            resultsType = req.query.resultsType || 1
            searchType = req.query.resultsType || 2
        } else if (pageVariant == 2) {
            filterType = req.query.filterType || 2
            resultsType = req.query.resultsType || 2
        } else {
            filterType = req.query.filterType || 1
            resultsType = req.query.resultsType || 1
        }
        res.render(versionDirectory + '/search/search-results.html', {
            pageObject: thePageObject,
            searchType: searchType,
            pageVariant: pageVariant,
            resultsType: resultsType,
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
