
var Area = {};

Area.validType = function validType(type) {
    return _.contains([
            'state',
            'city',
            'neighborhood',
            'university',
            'zip',
            'county',
            'primaryschool', 'middleschool', 'highschool', 'mixedschool',
            'secschdist', 'unifschdist', 'elemschdist'], type
    );
};

module.exports = Area;