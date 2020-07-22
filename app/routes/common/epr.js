module.exports = function (router) {

    router.get(['/v2/entry-points/ea/results-details'], function (req, res) {
        let thePageObject = {}
        thePageObject.results = [
            {registration: '123'},
            {registration: '2342'}
            ]
        res.render('v2/entry-points/ea/existing/results-details.html', {
                pageObject: thePageObject
            }
        )
    })

}