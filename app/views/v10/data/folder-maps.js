module.exports = function folderMap(currentFolder) {
    // Takes EDRM folder name and converts to SPOL folder name
    let newFolderName = ''
    switch (currentFolder) {
        case 'License Applications' :
            newFolderName = 'Application and associated docs'
            break
        case 'Inspections' :
            newFolderName = 'Compliance'
            break
        case 'License Supervision' :
            newFolderName = 'Compliance'
            break
        case 'Enforcement Action' :
            newFolderName = 'Enforcement Action'
            break
        case 'Waste Returns' :
            newFolderName = 'Returns'
            break
        case 'Environment Monitoring' :
            newFolderName = 'Monitoring'
            break
        case 'Engineering' :
            newFolderName = 'Pre-operational criteria'
            break
        default:
            newFolderName = 'General'
    }
    return newFolderName;
}