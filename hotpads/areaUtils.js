var _ = require('lodash');

module.exports = {
    removeUnwantedAreaNames: function(areas) {
        var areaArray;

        if (!_.isArray(areas)) {
            return false;
        }

        areaArray = [].concat(areas);

        _.remove(areaArray, function(area) {
            return area.name === 'Unnamed Neighborhood';
        });

        return areaArray;
    },
    removeAreasWithNoListings: function(areas, searchSlug) {
        return _.filter(areas, function(area) {
            return area.listingCounts[searchSlug];
        });
    }
};
