var Geo = function(geo) {
    geo = geo || {};
    if (geo.lat && geo.lon) {
        this.lat = geo.lat;
        this.lon = geo.lon;
        this.quad = geo.quad;
    } else {
        console.error('Error in Geo constructor: one of \'lat\', \'lon\', \'quad\' was not provided');
    }
};


module.exports = Geo;
