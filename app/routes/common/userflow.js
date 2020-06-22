const pf = require('@benwatsonuk/page-flow')
let pageFlow = require('../data/pages')
let userFlow = require('../views/' + versionDirectory + '/user-flows.json')
let previousUserFlow = false

module.exports = function (router) {


    router.get(['/' + versionDirectory + '/page-flow/'], function (req, res) {
        res.render('./includes/page-flow.html',
            {
                pageIndex: pf.renderPageIndex(pageFlow)
            }
        )
    })

    router.get(['/' + versionDirectory + '/user-flow/'], function (req, res) {
        // console.log(pf.getUserFlow(userFlow, pageFlow))
        res.render('./includes/user-flow.html',
            {
                userFlow: pf.renderUserFlow(userFlow, pageFlow, previousUserFlow, version)
            }
        )
    })

    router.get(['/' + versionDirectory + '/user-flow/:journeyId/:stage/:page'], function (req, res) {
        // console.log(pf.getUserFlowPage(pageFlow, userFlow, req.params.page, req.params.stage, versionDirectory, req.params.journeyId))
        res.render('./includes/user-flow.html',
            {
                userFlow: pf.renderUserFlowPage(pageFlow, userFlow, req.params.page, req.params.stage, versionDirectory, req.params.journeyId)
            }
        )
    })
}