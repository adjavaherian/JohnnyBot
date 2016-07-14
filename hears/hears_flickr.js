// hears.js
// all the things mearsebot can hear

var utils = require('../lib/utils.js');
var flickrWrapper = require('../lib/flickrWrapper');

// all the hears go here
function hears(controller){

    controller.hears(['flickr (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message){
        var searchTerm = message.text.match(/flickr (.*)/i)[0] || 'panda';

        flickrWrapper.search(searchTerm, function(err, photo){
            if(err) {
                bot.reply('Hmm, something went sidewayz.. err, try again?')
            } else {
                bot.reply(message, '=) I found this: ' + photo);
            }
        });

    });



}

module.exports =  hears;