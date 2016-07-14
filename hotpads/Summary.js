var Geo = require('./Geo');
var Address = require('./Address');
var listingUtils = require('./listingUtils');
var dateUtils = require('./dateUtils');


/*
 * Summary Data Model
 * -- summary of contents at the lot, whether there is a MF, building, or single listing
 * -- used for map markers, preview cards, row items, etc
 * -- Summary can be a summary of a building or of a unit!
 */

var createSummary = function createSummary(data) {
    var summaryObject = {};
    var propertyType;

    data = data || {};

    // if things go terribly wrong, re-add checks for maloneLotId
    if (!data.aliasEncoded) {
        console.warn('Summary constructor failed. No aliasEncoded was passed.',
            data);
        return false;
    }

    // some api calls are currently returning listings with no models
    if (!data.models || data.models.length < 1) {
        console.warn('Unit constructor failed. No models were passed.',
            data);
        return false;
    }

    summaryObject.maloneLotIdEncoded = data.maloneLotIdEncoded ? String(data.maloneLotIdEncoded) : null; // 'u57jtq'
    summaryObject.aliasEncoded = String(data.aliasEncoded); // '2uw5r9fjmnenv'
    summaryObject.unit = String(data.unit || ''); // 'Unit A'
    summaryObject.urlMaloneUnit = String(summaryObject.unit.toLowerCase().replace(' ', '-')); // 'unit-a'
    summaryObject.keyword = String(data.keyword || 'Keyword not set'); // 'Homes for Rent'
    summaryObject.searchKeyword = String(data.searchKeyword || 'Search keyword not set'); // 'house'
    summaryObject.propertyType = String(data.propertyType || 'Property type not set'); // 'house'
    summaryObject.listingType = String(data.listingType || 'Listing type not set'); // 'rental'
    summaryObject.name = String(data.name || 'For rent'); // use displayName!
    summaryObject.geo = new Geo(data.geo);
    summaryObject.address = new Address(data.address);
    summaryObject.created = Number(data.created || 1442702491000); //1442702491000 // do we use this?
    summaryObject.updated = Number(data.updated);
    summaryObject.photoCount = Number(data.photoCount || 0);
    summaryObject.photos = data.photos || []; // summaries will not have photos (yet)
    summaryObject.active = Boolean(data.active) || false;
    summaryObject.priority = Number(data.priority || 0);
    summaryObject.building = Boolean(data.building) || false;
    summaryObject.userItemTypes = data.userItemTypes || []; // ['viewed','favorite'];
    summaryObject.uri = String(data.uri || 'No uri set'); // old v1 uri!
    summaryObject.uriBuilding = String(decodeURI(data.uriBuilding) || 'No uriBuilding set');
    summaryObject.uriMalone = String(decodeURI(data.uriMalone) || 'No uriMalone set');


    // Calculated
    summaryObject.displayName = listingUtils.getDisplayName(summaryObject);
    summaryObject.listingMinMaxPriceBeds = listingUtils.listingMinMaxPriceBeds(data);
    summaryObject.uriV2 = summaryObject.building ? summaryObject.uriBuilding : summaryObject.uriMalone;
    summaryObject.recencyTime = dateUtils.recencyTime(summaryObject.created, new Date());
    summaryObject.updatedRecencyTime = dateUtils.recencyTime(summaryObject.updated, new Date());
    summaryObject.isActivatedWithin1d = false;
    summaryObject.isActivatedWithin5d = false;
    if (summaryObject.recencyTime.daysDiff < 5) {
        summaryObject.isActivatedWithin5d = true;
    }
    if (summaryObject.recencyTime.daysDiff < 2) {
        summaryObject.isActivatedWithin1d = true;
    }

    propertyType = summaryObject.propertyType;
    summaryObject.multiFamily = summaryObject.listingType === 'rental' &&
        (propertyType === 'large' || propertyType === 'garden' || propertyType === 'medium');


    if (summaryObject.propertyType === 'large' ||
        summaryObject.propertyType === 'medium' || summaryObject.propertyType === 'garden') {
        summaryObject.iconType = 'building';
    } else if (summaryObject.propertyType === 'condo' ||
        summaryObject.propertyType === 'divided') {
        summaryObject.iconType = 'condo';
    } else if (summaryObject.propertyType === 'house' ||
        summaryObject.propertyType === 'townhouse' || summaryObject.propertyType === 'land') {
        summaryObject.iconType = 'house';
    } else {
        summaryObject.iconType = 'house'; // shouldn't happen. but if so, show something
    }

    return summaryObject;
};

module.exports = {
    create: createSummary
};
