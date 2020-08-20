const version = '4'
const versionDirectory = 'v' + version
const previousVersionDirectory = 'v3'
const axios = require('axios');
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
        if (!map.has(item.documentType)) {
            map.set(item.documentType, true);    // set any value to Map
            docTypeItems.push({
                text: item.documentType + ' (' + getDocCountByType(documents, item.documentType) + ')',
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
        if (!map.has(item['permitType'])) {
            map.set(item['permitType'], true);    // set any value to Map
            permitTypeItems.push({
                text: item['permitType'] + ' (' + getPermitCountByType(documents, item['permitType']) + ')',
                value: item['permitType']
            });
        }
    }

    permitTypeItems = permitTypeItems.sort(function (a, b) {
        let nameA = a.text.toUpperCase(); // ignore upper and lowercase
        let nameB = b.text.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    })

    return permitTypeItems
}

function getPermitCountByType(documents, docType) {
    let count = documents.filter(item => item.permitType === docType)
    return count.length.toString()
}

function getDocCountByType(documents, docType) {
    let count = documents.filter(item => item.documentType === docType)
    return count.length.toString()
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

async function getEPRData(permitNumber, registerName) {
    const url = "https://environment.data.gov.uk/public-register/" + registerName + "/registration/" + permitNumber + ".json"
    try {
        return await axios.get(url)
    } catch (error) {
        console.error(error);
    }
}

function mapEPRData(data) {
    console.log(data)
    let organisedData = {
        "permitId": data.registrationNumber,
        "name": data.site.siteOf.name,
        "permit-holder": data.holder.name,
        // "registration": "403958",
        "Addressee": "Andrew Orr",
        "register": data.register.label,
        "startDate": data.effectiveDate,
        "caseReference": "EAWML403958",
        "site": {
            "name": data.site.label,
            "type": data.site.siteType.comment,
            "address": data.site.siteAddress.address,
            "postcode": data.site.siteAddress.postcode,
            "region": data.site.siteAddress.region,
            "grid-reference": data.site.siteAddress.location.gridReference,
            "easting": data.site.siteAddress.location.easting,
            "northing": data.site.siteAddress.location.northing,
            "LA": data.localAuthority.altLabel
        }
    }
    return organisedData
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

    // Set session for variants in EPR journey
    router.get(['/' + versionDirectory + '/entry-points/ea', '/' + versionDirectory + '/entry-points/ea/'], (req, res) => {
        let thePageObject = {}
        let sess = req.session
        sess.streamlinedEpr = req.query.onerecord || false
        res.render(versionDirectory + '/entry-points/ea/index.html', {
            pageObject: thePageObject
        })
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

    router.get(['/' + versionDirectory + '/all-in-one/:permitNumber',
        '/' + versionDirectory + '/all-in-one/:permitNumber/',
        '/' + versionDirectory + '/all-in-one/:registerName/:permitNumber',
        '/' + versionDirectory + '/all-in-one/:registerName/:permitNumber/'
    ], function (req, res) {
        const permitNumber = req.params.permitNumber || defaultPermitId
        let thePageObject = {}
        thePageObject.documents = createDataFromJson(permitNumber)
        thePageObject.docTypeItems = getDocTypeItems(thePageObject.documents)
        thePageObject.permitTypeItems = getPermitTypeItems(thePageObject.documents)
        thePageObject.permitNumber = permitNumber
        if (req.params.registerName) {
            // const eprApiData = getEPRData(permitNumber, req.params.registerName)
            // axios.get("").then(
            getEPRData(permitNumber, req.params.registerName).then(
                data => {
                    console.log(data.data.items)
                    thePageObject.details = mapEPRData(data.data.items[0])
                    res.render(versionDirectory + '/all-in-one/index.html',
                        {
                            pageObject: thePageObject
                        }
                    )
                }
            )
            // console.log(eprData)
        } else {
            thePageObject.details = eprData.filter((item) => permitNumber === item.caseReference)[0]
        }

        // console.log(thePageObject)

    })

    router.get(['/' + versionDirectory + '/all-in-one-doc-tree/:permitNumber',
        '/' + versionDirectory + '/all-in-one-doc-tree/:permitNumber/'
    ], function (req, res) {
        const permitNumber = req.params.permitNumber || defaultPermitId
        let thePageObject = {}
        thePageObject.details = eprData.filter((item) => permitNumber === item.caseReference)[0]
        thePageObject.documents = createDataFromJson(permitNumber)
        thePageObject.docTypeItems = getDocTypeItems(thePageObject.documents)
        thePageObject.permitTypeItems = getPermitTypeItems(thePageObject.documents)
        thePageObject.permitNumber = permitNumber
        // console.log(thePageObject.permitTypeItems)
        res.render(versionDirectory + '/all-in-one/documentTree.html',
            {
                pageObject: thePageObject
            }
        )
    })

    // @todo - put the documents into an iframe or similar
    router.get(['/' + versionDirectory + '/all-in-one-doc-tree/:permitNumber/:docId', '/' + versionDirectory + '/all-in-one-doc-tree//:permitNumber/:docId/'], function (req, res) {
        const permitNumber = req.params.permitNumber || defaultPermitId
        let thePageObject = {}
        thePageObject.details = eprData.filter((item) => permitNumber === item.caseReference)[0]
        thePageObject.documents = createDataFromJson(permitNumber)
        thePageObject.docTypeItems = getDocTypeItems(thePageObject.documents)
        thePageObject.permitTypeItems = getPermitTypeItems(thePageObject.documents)
        thePageObject.permitNumber = permitNumber
        // console.log(thePageObject)
        res.render(versionDirectory + '/all-in-one/documentTree.html',
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
