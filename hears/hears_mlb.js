// hears.js
// all the things mearsebot can hear

var utils = require('../lib/utils.js');
var mlb = require('../lib/MLB');

// all the hears go here
function hears(controller){

    controller.hears(['mlb games (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message){
        var date = message.text.match(/mlb games (.*)/i)[1] || 'today';

        console.log('date', date);

        mlb.games(date)
            .catch(function(err){
                bot.reply('Hmm, something went sidewayz.. err, try again?')
            })
            .then(function(descriptions){
                console.log('descriptions', descriptions);
                bot.reply(message, 'here are the games for ' + date);
                bot.reply(message, descriptions.join('\n'));
            });

    });

    controller.hears(['lets go (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message){
        var team = message.text.match(/lets go (.*)/i)[1] || 'Mets!!';

        bot.reply(message, 'yeah, lets go ' + team + '!');

    });

    controller.hears(['play by play (.*)'], 'direct_message,direct_mention,mention', function(bot, message){

        var team = message.text.match(/play by play (.*)/i)[1] || 'Mets';

        team = team.split(' ') ? team.split(' ')[1] : team;

        var start = function(response, convo) {

            var previous = '';
            var pbp;

            convo.on('end',function(convo) {

                var res = convo.extractResponses();
                console.log('conversation end======================');

                if (convo.status == 'completed') {
                    clearInterval(pbp);
                } else {
                    // something happened that caused the conversation to stop prematurely
                }

            });

            pbp = setInterval(function(){
                mlb.pbp(team)
                    .catch(function(err){
                        bot.reply('Hmm, something went sidewayz.. err, try again?')
                    })
                    .then(function(game){
                        if (game) {

                            if(game.pbp.last !== previous) {
                                console.log('game pbp', game.pbp.last);
                                bot.reply(message, team + ' pbp: ' + game.pbp.last);
                                previous = game.pbp.last;
                            }

                        } else {
                            bot.reply(message, 'It looks like the ' + team + ' aren\'t playing right now');
                            clearInterval(pbp);
                            convo.next();
                        }

                    });
            }, 10000);

            convo.ask('Okay, lets go ' + team + '!', [

                {
                    pattern: 'stop',
                    callback: function(response, convo) {
                        convo.say('Stopping play by play for the ' + team);
                        clearInterval(pbp);
                        convo.next(); 
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        //convo.next();
                    }
                }
            ]);
        };


        bot.startConversation(message, start);



    });

    controller.hears(['chill'], 'direct_message,direct_mention,mention', function(bot, message){

        var pbp;

        var start = function(response, convo) {

            convo.on('end',function(convo) {

                var res = convo.extractResponses();
                console.log('conversation end======================');

                if (convo.status == 'completed') {
                    clearInterval(pbp);
                } else {
                    // something happened that caused the conversation to stop prematurely
                }

            });

            pbp = setInterval(function(){
                bot.reply(message, 'chillin...');
            }, 5000);

            convo.ask('Okay, chillin... ', [

                {
                    pattern: 'stop',
                    callback: function(response, convo) {
                        convo.say('Stopping chillin.');
                        clearInterval(pbp);
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        //convo.next();
                    }
                }
            ]);
        };


        bot.startConversation(message, start);



    });

}

module.exports =  hears;