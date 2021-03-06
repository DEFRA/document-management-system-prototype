module.exports = function (router, versionDirectory, eprData) {

    router.get(['/' + versionDirectory + '/entry-points/ea/results-details'], function (req, res) {
        let thePageObject = {}
        let permitId = req.query.permitNumber || "EAWML403958"
        thePageObject = eprData.find((item) => {
            return item.caseReference === permitId
        })
        res.render(versionDirectory + '/entry-points/ea/existing/results-details.html', {
                pageObject: thePageObject
            }
        )
    })

    router.get(['/' + versionDirectory + '/entry-points/ea/results'], function (req, res) {
        let thePageObject = {}
        let sess = req.session
        thePageObject.results = eprData
        console.log(sess.streamlinedEpr)
        res.render(versionDirectory + '/entry-points/ea/existing/results.html', {
                pageObject: thePageObject,
                streamlinedEpr: sess.streamlinedEpr
            }
        )
    })

}