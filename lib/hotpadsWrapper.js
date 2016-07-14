var util = require('util');
var utils = require('./utils');
var axios = require('axios');
var Promise  = require('promise');

module.exports = {
    autoComplete: function autoComplete(partial, bot) {

        partial = partial || '';

        var url = 'http://hotpads.com:80/api/v2/area/autocomplete?types=neighborhood,city&limit=20&partial=' + partial;

        return axios.get(url)
            .catch(function(err){
                console.log("error: ", err);
                return undefined;
            })
            .then(function(res){
                if (res.status !== 200) {
                    return undefined;
                } else {

                    var result = res.data;

                    if (result.success) {
                        console.log('result', util.inspect(result.data, depth=3, colorize=true));
                        return(result.data.suggestedAreas);
                    }else {
                        console.log('res.statusCode', res);
                        return undefined;
                    }
                }
            })
            .catch(function(err){
                console.log("error: ", err);
            });

    },

    byAreaId: function byAreaId(id, bot) {

        id = id || 337910527;

        var url = 'http://hotpads.com:80/api/v2/area/byAreaId?id=' + id;

        return axios.get(url)
            .catch(function(err){
                console.log("error: ", err);
            })
            .then(function(res){
                if (res.status !== 200) {
                    return undefined;
                } else {

                    var result = res.data;

                    if (result.success) {
                        console.log('result', util.inspect(result.data, depth=3, colorize=true));
                        return(result.data);
                    }else {
                        console.log('res.statusCode', res);
                        return undefined;
                    }
                }
            })
            .catch(function(err){
                console.log("error: ", err);
            });

    },

    byQuads: function byQuads(quads) {
        var url = 'http://hotpads.com/node/api/v2/listing/byQuads?components=basic,useritem,quality,model&limit=4&quads='+quads.join(',')+'&bedrooms=0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8plus&bathrooms=0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8plus&lowPrice=0&includeVaguePricing=false&listingTypes=rental,sublet,room&propertyTypes=house,divided,condo,townhouse,medium,large,land,garden&minPhotos=0&maxCreated=&visible=new,viewed,favorite,inquiry,note&pets='
        var listings = [];
        var listing;

        console.log('get apartments');

        return axios.get(url)
            .catch(function(err){
                console.log("error: ", err);
            })
            .then(function(res){
                if (res.status !== 200) {
                    return undefined;
                } else {
                    console.log('res.end');
                    var result = res.data;
                    var processedListing;
                    var quadCountHash = {};

                    console.log('result.success', result.success);
                    if (result.success && result.data.length > 0) {
                        console.log('result.data.length', result.data.length);
                        result.data.forEach(function(listingByQuad) {
                            quadCountHash[listingByQuad.name] = {
                                totalInQuad: listingByQuad.numTotal,
                                cachedInQuad: listingByQuad.totalIncluded
                            };
                            if (listingByQuad.listingsGroup.length > 0) {
                                listingByQuad.listingsGroup.forEach(function(listingByMaloneLot) {
                                    if (listingByMaloneLot[0] && listingByMaloneLot[0].active) {
                                        processedListing = Summary.create(listingByMaloneLot[0]);
                                        if (processedListing.maloneLotIdEncoded) {
                                            listings.push(processedListing);
                                        }
                                    }
                                });
                            }
                        });
                        console.log(listings[0].uriV2, listings[1].uriV2);
                        return listings;
                    }else {
                        console.log('res.statusCode', res.statusCode);
                        return undefined;
                    }
                }
            })
            .catch(function(err){
                console.log("error: ", err);
            });
    },

    byCoords: function byCoords(options) {

        console.log('get apartments by coords');

        var url = 'http://hotpads.com:80/api/v2/listing/byCoords?minLat=%d&maxLat=%d&minLon=%d&maxLon=%d&components=listing&bedrooms=%s&highPrice=%d&limit=20';

        url = util.format(url, options.minLat, options.maxLat, options.minLon, options.maxLon, options.beds, options.price);

        var listings = [];

        console.log('get apartments by coords url', url);

        return axios.get(url)
            .catch(function(err){
                console.log("error: ", err);
            })
            .then(function(res){
                if (res.status !== 200) {
                    return undefined;
                } else {
                    console.log('res.end');
                    var result = res.data;

                    console.log('result.success', result.success);
                    if (result.success && result.data.listingsGroup.length > 0) {
                        console.log('result.data.length', result.data.listingsGroup.length);
                        result.data.listingsGroup.forEach(function(listingByCoord) {
                            listings.push(listingByCoord[0]);
                        });
                        console.log(listings[0].uriV2, listings[1].uriV2);
                        return listings;
                    }else {
                        console.log('res.statusCode', res.statusCode);
                        return undefined;
                    }
                }
            })
            .catch(function(err){
                console.log("error: ", err);
            });
    },

    getPlaces: function getPlaces(responses, sorryResponse) {

        console.log('getting places' , Object.keys(responses).length);

        var self = this;

        if(Object.keys(responses).length > 0) {

            var where = responses.where || 'Brooklyn, NY';
            var price = responses.price || 5000;
            var beds = responses.beds || 1;

            return Promise.resolve(self.autoComplete(encodeURIComponent(where)))
                .then(function(result){

                    if(typeof result === 'undefined' || result.length === 0) {
                        return sorryResponse();
                    } else {
                        //console.log('==========get places result', result[0]);
                        var id = result[0].id;
                        return self.byAreaId(id)
                            .then(function(areaObj){
                                if(typeof areaObj === 'undefined') {
                                    return sorryResponse();
                                } else {
                                    //console.log('area obj--------------', areaObj);
                                    var params = {
                                        minLat: areaObj.minLat,
                                        minLon: areaObj.minLon,
                                        maxLat: areaObj.maxLat,
                                        maxLon: areaObj.maxLon,
                                        price: price,
                                        beds: beds
                                    };
                                    return self.byCoords(params)
                                        .then(function(listings){
                                            if(typeof listings === 'undefined') {
                                                return sorryResponse();
                                            } else {
                                                console.log('returning promise---');
                                                return listings;
                                            }
                                        });
                                }
                            });
                    }
                });
        } else {
            return sorryResponse();
        }

    }

};


