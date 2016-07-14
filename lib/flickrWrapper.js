var Flickr = require('flickrapi');
var utils = require('./utils.js');

var flickrOptions = {
    api_key: process.env.FLICKR_KEY,
    secret: process.env.FLICKR_SECRET
};

var makeUrl = function(photo){
    var url = '';

        url += 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server +'/' + photo.id + '_' + photo.secret + '_m.jpg';

    return url;
};

module.exports = {
    search: function search(searchTerm, cb){

        searchTerm = searchTerm || 'red-panda';

        Flickr.tokenOnly(flickrOptions, function(error, flickr) {

            flickr.photos.search({
                text: searchTerm
            }, function(err, result) {
                if(err) {
                    console.log('flickr error', err);
                    cb('err', 'Sorry, Something errored out..');
                }
                console.log('result', result.photos.photo[0]);

                /*
                * example response
                * https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg

                 farm-id: 1
                 server-id: 2
                 photo-id: 1418878
                 secret: 1e92283336
                 size: m

                 { id: '24911155880',
                 owner: '59716410@N06',
                 secret: '45c384cd41',
                 server: '1535',
                 farm: 2,
                 title: 'Day 52',
                 ispublic: 1,
                 isfriend: 0,
                 isfamily: 0 }

                * */

                var url = makeUrl(utils.randomPicker(result.photos.photo));

                console.log('url', url);
                cb(null, url);
                // do something with result
            });
            // we can now use "flickr" as our API object,
            // but we can only call public methods and access public data
        });

    }

};