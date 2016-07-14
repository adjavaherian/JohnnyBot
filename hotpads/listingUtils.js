var _ = require('lodash');
var formatter = require('./formatter');
var numberUtils = require('./numberUtils');
var Area = require('./Area');
var areaUtils = require('./areaUtils');

/** Processing functions should not exist
* Rather processing should be done in the corresponding model: Summary, Unit, Building
* For now, use listingUtils for methods that would belong to a model.
*/

var listingUtils = {
    listingMinMaxPriceBeds: function(_listing) {
        var listing = _listing || {};
        var minPrice = Number.POSITIVE_INFINITY;
        var maxPrice = Number.NEGATIVE_INFINITY;
        var minBeds = Number.POSITIVE_INFINITY;
        var maxBeds = Number.NEGATIVE_INFINITY;
        var minBaths = Number.POSITIVE_INFINITY;
        var maxBaths = Number.NEGATIVE_INFINITY;
        var minSqft = Number.POSITIVE_INFINITY;
        var maxSqft = Number.NEGATIVE_INFINITY;
        var models = listing.models || [];
        var bedDisplay;
        var bathDisplay;
        var sqftDisplay;
        var priceDisplay;
        var model;
        var i;

        for (i = 0; i < models.length; i++) {
            model = {
                modelId: models[i].modelId,
                type: models[i].type,
                beds: Number(models[i].beds),
                baths: Number(models[i].baths),
                low: Number(models[i].low),
                high: Number(models[i].high),
                sqft: Number(models[i].sqft)
            };
            if (model.low > 0 && model.low < minPrice) {
                minPrice = model.low;
            }
            if (model.high > maxPrice) {
                maxPrice = model.high;
            }
            if (model.beds < minBeds) {
                minBeds = model.beds;
            }
            if (model.beds > maxBeds) {
                maxBeds = model.beds;
            }
            if (model.baths < minBaths) {
                minBaths = model.baths;
            }
            if (model.baths > maxBaths) {
                maxBaths = model.baths;
            }
            if (model.sqft < minSqft) {
                minSqft = model.sqft;
            }
            if (model.sqft > maxSqft) {
                maxSqft = model.sqft;
            }
        }

        bedDisplay = this.getMinMaxDisplay(minBeds, maxBeds, 'bed', 'beds', 'Studio');
        bathDisplay = this.getMinMaxDisplay(minBaths, maxBaths, 'bath', 'baths');
        sqftDisplay = this.getMinMaxDisplay(minSqft, maxSqft, 'sqft');
        priceDisplay = this.getPriceSummaryDisplay(minPrice, maxPrice);

        return {
            minPrice: minPrice,
            maxPrice: maxPrice,
            minBeds: minBeds,
            maxBeds: maxBeds,
            minBaths: minBaths,
            maxBaths: maxBaths,
            minSqft: minSqft,
            maxSqft: maxSqft,
            bedDisplay: bedDisplay,
            priceDisplay: priceDisplay,
            bathDisplay: bathDisplay,
            sqftDisplay: sqftDisplay
        };
    },
    parseListingAreas: function(_areas) {
        var breadcrumbs;
        var parsedAreas = {
            breadcrumbs: [],
            links: []
        };
        var areas = _areas || {};
        var links;

        if (areas) {
            breadcrumbs = areas.breadcrumbs;
            if (breadcrumbs) {
                breadcrumbs.forEach(function(area) {
                    if (Area.validType(area.type)) {
                        area.keywords = area.keywords ? area.keywords.replace('Rooms', 'Apartments') : null;
                        area.uri = area.uri ? area.uri.replace('sublets', 'apartments') : null;
                        area.uriV2 = area.uriV2 ? area.uriV2.replace('sublets', 'apartments') : null;
                        // TODO: We should be passing in the searchSlug so the uri is set properly.
                        parsedAreas.breadcrumbs.push(new Area(area));
                    }
                });
            }

            links = areas.links;
            if (links) {
                links.forEach(function(area) {
                    if (Area.validType(area.type)) {
                        area.keywords = area.keywords ? area.keywords.replace('Rooms', 'Apartments') : null;
                        area.uri = area.uri ? area.uri.replace('sublets', 'apartments') : null;
                        area.uriV2 = area.uriV2 ? area.uriV2.replace('sublets', 'apartments') : null;
                        parsedAreas.links.push(new Area(area));
                    }
                });
            }
        }

        return parsedAreas;
    },
    processSchoolDistricts: function(_listing) {
        // To do: This should be moved to models/Unit.js
        var listing = _listing || { areas: {} };
        var links = listing.areas.links || [];
        var districtLegend = {
            unifschdist: 'Unified School District',
            secschdist: 'Seconday School District',
            elemschdist: 'Elementary School District'
        };
        var schoolDistricts = [];
        var schoolDistrictTypes = ['unifschdist', 'secschdist', 'elemschdist'];
        var s;

        _.forEach(links, function(link) {
            if (_.includes(schoolDistrictTypes, link.type)) {
                s = _.clone(link);
                s.formattedName = districtLegend[link.type];
                schoolDistricts.push(s);
            }
        });

        return schoolDistricts;
    },
    processSchools: function(_listing) {
        // To do: This should be moved to models/Unit.js
        var listing = _listing || { areas: {} };
        var links = listing.areas.links;
        var schools = {
            primaryschool: [],
            middleschool: [],
            highschool: [],
            mixedschool: [],
            unifschdist: [],
            university: []
        };
        var schoolTypes = ['primaryschool', 'middleschool', 'highschool', 'mixedschool', 'unifschdist', 'university'];

        _.forEach(links, function(link) {
            if (_.includes(schoolTypes, link.type)) {
                schools[link.type].push(link);
            }
        });
        return schools;
    },
    fullDetails: function(models) {
        // To do: This should be moved to models/Unit.js
        var details = {
            models: {},
            summaries: {},
            overview: {
                bathsLow: [],
                bathsHigh: [],
                bedsLow: [],
                bedsHigh: [],
                sqftLow: [],
                sqftHigh: [],
                priceLow: [],
                priceHigh: []
            }
        };
        var overviewHigh = {};
        var re = new RegExp('Low');
        var high;

        models.forEach(function(model) {
            if (model.beds === '') {
                details.summaries[0] ?
                    '' :
                    details.summaries[0] = {
                        baths: [],
                        sqft: [],
                        price: []
                    };

                details.models[0] = details.models[0] || [];
                if (model.baths) {
                    details.summaries[0].baths.push(model.baths);
                }
                if (model.sqft) {
                    details.summaries[0].sqft.push(model.sqft);
                }
                if (model.low) {
                    details.summaries[0].price.push(model.low);
                }
                if (model.high) {
                    details.summaries[0].price.push(model.high);
                }

                details.models[0].push(model);
            } else {
                details.summaries[model.beds] ?
                    '' :
                    details.summaries[model.beds] = {
                        baths: [],
                        sqft: [],
                        price: []
                    };

                details.models[model.beds] = details.models[model.beds] || [];
                if (model.baths) {
                    details.summaries[model.beds].baths.push(model.baths);
                }
                if (model.sqft) {
                    details.summaries[model.beds].sqft.push(model.sqft);
                }
                if (model.low) {
                    details.summaries[model.beds].price.push(model.low);
                }
                if (model.high) {
                    details.summaries[model.beds].price.push(model.high);
                }
                details.models[model.beds].push(model);
            }

            if (model.baths) {
                details.overview.bathsLow.push(model.baths);
            }
            if (model.beds) {
                details.overview.bedsLow.push(model.beds);
            }
            if (model.sqft) {
                details.overview.sqftLow.push(model.sqft);
            }
            if (model.low) {
                details.overview.priceLow.push(model.low);
            }
            if (model.high) {
                details.overview.priceLow.push(model.high);
            }
        });

        _.forEach(details.summaries, function(summary, summaryType) {
            _.forEach(summary, function(v, k) {
                var sorted = v.sort(formatter.sort);

                details.summaries[summaryType][k] = _.uniq(sorted, true);
            });
            if (summary.baths.length < 1 && summary.sqft.length < 1 && summary.price.length < 1) {
                delete details.summaries[summaryType];
            }
        });

        // convert overview arrays into low and highs

        _.forEach(details.overview, function(summary, summaryType) {
            if (summary.length > 0) {
                details.overview[summaryType] = _.uniq(_.flatten(summary.sort(formatter.sort)));
                high = summaryType.replace(re, 'High');
                overviewHigh[high] = formatter.array.last(details.overview[summaryType]);
                details.overview[summaryType] = details.overview[summaryType][0];
            }
        });
        _.forEach(overviewHigh, function(v, k) {
            details.overview[k] = v;
        });

        // delete empty overviews
        _.forEach(details.overview, function(o, oType) {
            if (o.length < 1) {
                delete details.overview[oType];
            }
        });

        // delete empty models;
        _.forEach(details.models, function(model, modelType) {
            if (model.length < 1) {
                delete details.models[modelType];
            } else {
                // this will delete units from models array that don't have a price set
                // for (var i = models.length - 1; i >= 0; i--) {
                //     if (models[i].type === 'call') {
                //         models.splice(i, 1);
                //     }
                // }
            }
        });
        return details;
    },
    useNameAsTitle: function(listing) {
        var shouldUseName = (
            listing.address.hideStreet &&
            listing.address.street &&
            !_.includes(listing.name, listing.address.street)) ||
            _.includes(['large', 'medium', 'garden'], listing.propertyType
        );

        return shouldUseName;
    },
    getDisplayName: function(listing, building) {
        var displayName = this.useNameAsTitle(listing) ? listing.name : listing.address.street;

        if (listing.unit && !building) {
            displayName = displayName + ' ' + listing.unit;
        }

        displayName = displayName.replace(/&amp;/g, '&');
        return displayName;
    },
    getMinMaxDisplay: function(_min, _max, _singular, _plural, single) {
        var display;
        var min;
        var max;
        var singular;
        var plural;

        if (isNaN(_min) || isNaN(_max)) {
            return null;
        }

        if (!_singular) {
            return null;
        } else {
            singular = _singular;

            if (!_plural) {
                plural = _singular;
            } else {
                plural = _plural;
            }
        }

        if (_min > _max) {
            min = Number(_max);
            max = Number(_min);
        } else {
            min = Number(_min);
            max = Number(_max);
        }

        if (single) {
            if (min === 0) {
                min = single;
            }
            if (max === 0) {
                max = single;
            }
        }

        if (!min && !max) {
            return null;
        }

        if (single && min === single && max === single) {
            display = single;
        } else if (min !== max) {
            display = min + ' to ' + max + ' ' + plural;
        } else if (min === 1) {
            display = min + ' ' + singular;
        } else {
            display = min + ' ' + plural;
        }

        return display;
    },
    getPriceSummaryDisplay: function(minPrice, maxPrice) {
        var priceDisplay;

        if ((!minPrice && !maxPrice) || (minPrice === Infinity && maxPrice <= 0)) {
            priceDisplay = 'Call';
        } else if (minPrice === maxPrice) {
            priceDisplay = '$' + numberUtils.compact(minPrice);
        } else {
            priceDisplay = '$' + numberUtils.compact(minPrice) + '+';
        }
        return priceDisplay;
    },
    quickSummary: function(models) {
        var fullDetails = this.fullDetails(models);
        var arr = [];

        _.forEach(fullDetails.summaries, function(v, bedrooms) {
            var tempStr;

            if (bedrooms === '0') {
                tempStr = 'Studio:';
            } else if (bedrooms === '1') {
                tempStr = '1 bed:';
            } else {
                tempStr = bedrooms + ' beds:';
            }

            if (v.price.length === 0) {
                tempStr += ' Please Call';
            } else if (v.price.length > 1) {
                tempStr += ' $' + numberUtils.compact(v.price[0]) + ' to ' +
                    numberUtils.compact(v.price[v.price.length - 1]);
            } else {
                tempStr += ' $' + numberUtils.compact(v.price[0]);
            }
            arr.push(tempStr);
        });

        return arr;
    },
    beds: function(modelBeds) {
        var beds;

        if (modelBeds === '') {
            beds = 'Studio';
        } else if (modelBeds === '1') {
            beds = '1 bed';
        } else {
            beds = modelBeds + ' beds';
        }

        return beds;
    },
    baths: function(modelBaths) {
        if (!modelBaths) {
            return 'No baths';
        } else if (Number(modelBaths) < 2) {
            return modelBaths.replace('.0', '') + ' bath';
        } else {
            return modelBaths.replace('.0', '') + ' baths';
        }
    },
    checkFavorite: function(listing) {
        var favorited = false;

        if (listing.userItemTypes) {
            favorited = _.includes(listing.userItemTypes, 'favorite');
        }
        return favorited;
    },
    pets: function(listing) {
        var amenities;
        var i;
        var amenity;

        if ((listing.amenities || {}).amenities) {
            amenities = listing.amenities.amenities;
            dogs = false;
            cats = false;
            for (i = 0; i < amenities.length; i++) {
                amenity = amenities[i].toUpperCase();
                if (amenity === 'CATS ALLOWED') {
                    cats = true;
                }
                if (amenity === 'DOGS ALLOWED') {
                    dogs = true;
                }
            }
            return {
                dogs: dogs,
                cats: cats
            };
        }

        return {
            dogs: null,
            cats: null
        };
    },
    require: function(obj, arr) {
        var valid = true;

        _.forEach(arr, function(a) {
            if (!_.get(obj, a)) {
                valid = false;
            }
        });
        return valid;
    },
    matchModelsToFilter: function(models, _filter) {
        var filter = _filter || {};
        var minBeds = filter.minBedrooms;
        var minBaths = filter.minBathrooms;
        var lowPrice = Number(filter.lowPrice);
        var highPrice = Number(filter.highPrice);
        var minSqft = filter.minSqft;
        var maxSqft = filter.maxSqft;

        return models.filter(function(model) {
            var modelLow = Number(model.low);
            var modelHigh = Number(model.high);

            if (Number(model.beds) < Number(minBeds)) {
                return false;
            } else if (Number(model.baths) < Number(minBaths)) {
                return false;
            } else if (lowPrice && highPrice) {
                if (modelLow < lowPrice && modelHigh < lowPrice) {
                    return false;
                } else if (modelLow > highPrice) {
                    return false;
                }
            } else if (highPrice && modelLow > highPrice) {
                return false;
            } else if (lowPrice && modelLow < lowPrice) {
                return false;
            }

            if ((minSqft && model.sqft < minSqft) || (maxSqft && model.sqft > maxSqft)) {
                return false;
            }

            return true;
        });
    },
    fulfillsFilter: function(listing, _filter) {
        var listingValid;
        var i;
        var listingModel;
        // A building with 0-3 beds, and price 3300+, should not be a result for a
        // 3 beds filter with max price of 3300. .... We need to check the models for each listing.
        var filter = _filter || {}; //this.state.filter;

        if (filter.pets.dogs === true && listing.pets.dogs !== true) {
            return false;
        }
        if (filter.pets.cats === true && listing.pets.cats !== true) {
            return false;
        }
        if (filter.minBedrooms > listing.listingMinMaxPriceBeds.maxBeds ||
            (listing.listingMinMaxPriceBeds.maxBeds === 'Studio' && filter.minBedrooms > 0)) {
            return false;
        }
        if (parseInt(filter.maxBedrooms.substring(0, 1)) < listing.listingMinMaxPriceBeds.minBeds ||
            (parseInt(filter.maxBedrooms.substring(0, 1)) === 0 && listing.listingMinMaxPriceBeds.minBeds >= 1)) {
            return false;
        }
        if (filter.minBathrooms > listing.listingMinMaxPriceBeds.maxBaths) {
            return false;
        }
        if (parseInt(filter.maxBathrooms.substring(0, 1)) < listing.listingMinMaxPriceBeds.minBaths) {
            return false;
        }

        listingValid = (listing.models.length < 1);

        for (i = 0; i < listing.models.length; i++) {
            listingModel = listing.models[i];
            /*If no price filters added, show all price ased*/
            if (filter.lowPrice !== 0 || filter.highPrice !== null) {
                if (filter.includeVaguePricing === false) {
                    if (listingModel.high === '' || listingModel.low === '') {
                        continue;
                    } else if (filter.highPrice !== null && filter.highPrice < parseFloat(listingModel.low)) {
                        continue;
                    } else if (filter.lowPrice > parseFloat(listingModel.high)) {
                        continue;
                    }
                } else {
                    //If both are vague, fulfills Price filter. Else do the below steps.
                    if (listingModel.high !== '' || listingModel.low !== '') {
                        if (listingModel.high === '' &&
                        filter.highPrice !== null &&
                        filter.highPrice < parseFloat(listingModel.low)) {
                            continue;
                        } else if (listingModel.low === '' && filter.lowPrice > parseFloat(listingModel.high)) {
                            continue;
                        }
                    }
                }

            } else if (filter.minBedrooms > listingModel.beds) {
                continue;
            } else if (filter.maxBedrooms < listingModel.beds) {
                continue;
            } else if (filter.minBathrooms > listingModel.baths) {
                continue;
            } else if (filter.maxBathrooms < listingModel.baths) {
                continue;
            }
            /*May need to add checks for advanced filters, but since cache gets cleared as of now, not necessary*/
            listingValid = true;
        }
        return listingValid;
    },
    schoolLegend: {
        zip: 'Zip Code',
        neighborhood: 'Neighborhood',
        city: 'City',
        county: 'County',
        state: 'State',
        primaryschool: 'Primary School',
        middleschool: 'Middle School',
        highschool: 'High School',
        mixedschool: 'Mixed School',
        unifschdist: 'Unified School District'
    },
    /* pass in listing.areas.links and listing.pricingStats */
    getSurroundingStats: function(links, pricingStats) {
        var self = this;
        var relevantAreas = {
            zip: null,
            neighborhood: null,
            city: null,
            county: null,
            state: null,
            primaryschool: null,
            middleschool: null,
            highschool: null,
            mixedschool: null,
            unifschdist: null
        };
        var stat;
        var percentageNum;
        var strippedNum;

        links = areaUtils.removeUnwantedAreaNames(links);

        links.forEach(function(area) {
            if (relevantAreas[area.type] === null) {
                _.forEach(pricingStats, function(percentage, areaId) {
                    if (area.id === areaId) {
                        percentageNum = parseInt(percentage);
                        strippedNum = percentage.replace('-', '');

                        if (percentageNum === 0) {
                            stat = 'the same as';
                        } else if (percentageNum < 0) {
                            stat = strippedNum + ' less than';
                        } else {
                            stat = percentage + ' more than';
                        }
                        area.stat = stat;
                        relevantAreas[area.type] = area;
                    }
                });
            }
        });
        return _.filter(relevantAreas, function(area) {
            return area !== null;
        })
            .map(function(area) {
                area.name = self.schoolLegend[area.type];
                return area;
            });
    },
    getListingUri: function(listing) {
        if (listing.uriV2) {
            return listing.uriV2;
        }
    },
    matchListingTypeToDelimiter: function(listingTypes) {
        var listingTypeArray = listingTypes.split(',');
        var listingType = listingTypeArray[0];

        if (listingTypeArray.indexOf('rental') > -1) {
            return 'pad';
        } else if (listingType === 'sublet' || listingType === 'room') {
            return 'pad-for-sublet';
        } else if (listingType === 'sale' || listingType === 'land' || listingType === 'new_home') {
            return 'pad-for-sale';
        } else if (listingType === 'auction') {
            return 'pad-for-auction';
        } else if (listingType === 'corporate') {
            return 'pad-corporate-housing';
        } else if (listingType === 'foreclosure') {
            return 'pad-foreclosure';
        } else {
            return 'pad';
        }
    },
    getListingMetaDescription: function(listing) {
        var title = 'Listing title';
        var locationPortion;
        var type;
        var photoSummary;

        if (listing) {
            if ((listing.units || []).length) {
                listing = listing.units[0];
            }
            locationPortion = listing.address.hideStreet ? '' : listing.address.street;
            type = listing.keyword;
            photoSummary = (listing.photoCount > 1) ? ' photos' : 'photo';

            title = type;
            title += locationPortion !== '' ? (' at ' + locationPortion + ':') : '';
            title += ' ' + listing.listingMinMaxPriceBeds.bedDisplay + ',';
            title += ' ' + listing.listingMinMaxPriceBeds.priceDisplay + '.';
            title += ' Map it and view';
            title += ' ' + listing.photoCount + photoSummary;
            title += ' and details on HotPads';
        }
        return title;
    }
};


module.exports = listingUtils;
