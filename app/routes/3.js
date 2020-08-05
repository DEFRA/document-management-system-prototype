const version = '3'
const versionDirectory = 'v' + version
const previousVersionDirectory = 'v2'
const pf = require('@benwatsonuk/page-flow')
let pageFlow = require('../data/pages')
let userFlow = require('../views/' + versionDirectory + '/user-flows.json')
let previousUserFlow = require('../views/' + previousVersionDirectory + '/user-flows.json')
let eprData = require('../views/' + versionDirectory + '/data/ePR/results.json')
const defaultPermitId = 'EAWML403958'

const documentData = require('../views/' + versionDirectory + '/data/documents.json');

function convertToReadableDate(theDateString) {
    theDateString = theDateString.toString()
    // console.log(theDateString.toString().slice(0,4))
    const yyyy = theDateString.slice(0, 4)
    const mm = theDateString.slice(5, 6)
    const dd = theDateString.slice(7, 8)
    return dd + '/' + mm + '/' + yyyy
}

function getDocTypeItems(documents) {

    let docTypeItems = []
    const map = new Map();
    for (const item of documents) {
        if(!map.has(item.documentType)){
            map.set(item.documentType, true);    // set any value to Map
            docTypeItems.push({
                text: item.documentType + ' (99)',
                value: item.documentType
            });
        }
    }

    return docTypeItems
}
function getPermitTypeItems(documents) {

    let permitTypeItems = []
    const map = new Map();
    for (const item of documents) {
        if(!map.has(item['permitType'])){
            map.set(item['permitType'], true);    // set any value to Map
            permitTypeItems.push({
                text: item['permitType'] + ' (99)',
                value: item['permitType']
            });
        }
    }

    return permitTypeItems
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
    const dataObject = []
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

    require('./common/epr')(router, versionDirectory, eprData)

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
        console.log('1')

        res.render('./includes/user-flow.html',
            {
                userFlow: pf.renderUserFlowPage(pageFlow, userFlow, req.params.page, req.params.theJourneyDirectory, versionDirectory, req.params.journeyId, req.params.stage)
            }
        )
    })

    router.get(['/' + versionDirectory + '/search/search-results', '/' + versionDirectory + '/search/search-results/:variant'], (req, res) => {
        const permitNumber = req.query.permitNumber || defaultPermitId
        let thePageObject = {}
        thePageObject.documents = createDataFromJson(permitNumber)
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

    router.get(['/' + versionDirectory + '/search/search-results-grouped', '/' + versionDirectory + '/search/search-results-grouped/:variant'], (req, res) => {
        const permitNumber = req.params.permitNumber || defaultPermitId
        // let thePageObject = {}
        let thePageObject = eprData
        thePageObject.documents = createDataFromJson(permitNumber)
        thePageObject.permitNumber = permitNumber
        let pageVariant = req.params.variant || 2
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
        res.render(versionDirectory + '/search/search-results-grouped.html', {
            pageObject: thePageObject,
            searchType: searchType,
            pageVariant: pageVariant,
            resultsType: resultsType,
            filterType: filterType
        })
    })

    /* The 'All in One' page - similar to https://trademarks.ipo.gov.uk/ipo-tmcase/page/Results/4/EU002925709 or https://beta.companieshouse.gov.uk/company/11868746 */

    router.get(['/' + versionDirectory + '/all-in-one/:permitNumber', '/' + versionDirectory + '/all-in-one/:permitNumber/'], function (req, res) {
        const permitNumber = req.params.permitNumber || defaultPermitId
        let thePageObject = {}
        thePageObject.details = eprData.filter((item) => permitNumber === item.caseReference)[0]
        thePageObject.documents = createDataFromJson(permitNumber)
        thePageObject.docTypeItems = getDocTypeItems(thePageObject.documents)
        thePageObject.permitTypeItems = getPermitTypeItems(thePageObject.documents)
        thePageObject.permitNumber = permitNumber
        // console.log(thePageObject)
        res.render(versionDirectory + '/all-in-one/index.html',
            {
                pageObject: thePageObject
            }
        )
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