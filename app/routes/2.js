const version = '2'
const versionDirectory = 'v' + version
const previousVersionDirectory = 'v1'
const pf = require('@benwatsonuk/page-flow')
let pageFlow = require('../data/pages')
let userFlow = require('../views/' + versionDirectory + '/user-flows.json')
let previousUserFlow = require('../views/' + previousVersionDirectory + '/user-flows.json')
const defaultPermitId = 'EAWML403958'

const documentData = require('../views/' + versionDirectory + '/data/documents.json');

function convertToReadableDate (theDateString) {
    theDateString = theDateString.toString()
    // console.log(theDateString.toString().slice(0,4))
    const yyyy = theDateString.slice(0,4)
    const mm = theDateString.slice(5,6)
    const dd = theDateString.slice(7,8)
    return dd + '/' + mm + '/' + yyyy
}

function createDataFromJson(permitId) {
    const validPermitIds = [
        'EAWML65519',
        'EPRZP3821GK',
        'T3945884O',
        'EAWML403958',
    ]
    if (validPermitIds.includes(permitId)) {
        permitId = permitId || defaultPermitId
    } else {
        permitId = defaultPermitId
    }
    let dataSrc = require('../views/' + versionDirectory + '/data/EDRM/' + permitId + 'documents.json')
    const dataObject =  []
    for (item in dataSrc) {
        if (dataSrc[item]["Disclosure Status"] === "Public Register") {
            dataObject.push({
                "registration": dataSrc[item]["Case Reference"],
                "docTitle": dataSrc[item]["Title/Subject"],
                "name": dataSrc[item]["Customer Name"],
                "uploadedOn": convertToReadableDate(dataSrc[item]["Date Loaded"]),
                "permitType": dataSrc[item]["Sub-Folder"],
                "documentType": dataSrc[item]["Document Type"],
                "documentLink": dataSrc[item]["Tif File Names"],
                "fileType": ""
            })
        }
    }
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

    router.get(['/' + versionDirectory + '/search/search-results', '/' + versionDirectory + '/search/search-results/:variant'], (req, res) => {
        const permitNumber = req.query.permitNumber || defaultPermitId
        let thePageObject = createDataFromJson(permitNumber)
        thePageObject.permitNumber = permitNumber
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
