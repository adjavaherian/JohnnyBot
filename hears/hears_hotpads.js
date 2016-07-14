// hears.js
// all the things the bot can hear

/*
*
* https://hotpads.com/node/api/v2/area/byResourceId?resourceId=san-francisco-ca
*
* https://hotpads.com/node/api/v2/listing/byQuads?components=basic,useritem,quality,model&limit=4&quads=023010203102,023010203103,023010203112,023010203113,023010212002,023010212003,023010212012,023010203120,023010203121,023010203130,023010203131,023010212020,023010212021,023010212030,023010203122,023010203123,023010203132,023010203133,023010212022,023010212023,023010212032,023010203300,023010203301,023010212210,023010203302,023010203303,023010212212,023010203320,023010203321,023010212230,023010203322,023010203323,023010212232,023010221100,023010221101,023010230010,023010221102,023010221103,023010230012,023010221120,023010221121,023010221130,023010221131,023010230020,023010230021,023010230030,023010221122,023010221123,023010221132,023010221133,023010230022,023010230023,023010230032,023010221300,023010221301,023010221310,023010221311,023010230200,023010230201,023010230210&bedrooms=0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8plus&bathrooms=0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8plus&lowPrice=0&includeVaguePricing=false&listingTypes=rental,sublet,room&propertyTypes=house,divided,condo,townhouse,medium,large,land,garden&minPhotos=0&maxCreated=&visible=new,viewed,favorite,inquiry,note&pets=
*
 * */
var util = require('util');
var utils = require('../lib/utils.js');
var hotpadsWrapper = require('../lib/hotpadsWrapper.js');
var urljoin = require('url-join');
var http = require('http');
var hotpads = 'http://hotpads.com';

// all the hears go here
function hears(controller){

    controller.on('user_channel_join',function(bot, message) {

        if (message.channel !== 'C0S9MGE6Q') {
            return true;
        }

        var responses = {};

        var sentences = {
            welcome : [
                'Welcome to Urban Living. I’m HotBot.' ,
                'I\'ll be helping our Agents process your rental application.',
                'To get started, please tell me your First and Last Name.'
            ],
            email: [
                'I\'ll also need your email address so we can contact you',
                'in case we get  disconnected.'
            ],
            lookingForPlace: [
                'How can we help you today?',
                 'You can say, “I’m looking for a place in the Bronx”',
                 '...or “I need a townhouse in Brooklyn”'
            ],
            priceRange : [
                'What\'s your price range?',
                'You can reply with a number ',
                'like “$5000” as a max or a range like $1000-3000.'
            ],
            sorry: [
                ':confused: Sorry, couldn\'t find any apartments that matched.'
            ],
            amenities: [
                'What about amenities and pets?',
                'Please list anything that’s important to your search',
                '...like washer, dryer, cats, dogs, hamsters =) ',
                'We’ll try to make sure that you see only results that match your preferences.'
            ],
            wrapUp: [
                'Great, this is looking good. We still have 20 places that match. ' ,
                'Okay, that\'s pretty much all I need for now. ' ,
                'It looks like Corrine is available to chat with you in the next few minutes. ' ,
                'Hang on a sec while I get her. In the mean time, here’s the listings that matched your search. ' ,
                'Lemme know if you need anything else.',
                'Just say “hey, Hotbot!”'
            ]
        };

        function sorryResponse(type) {
            type = type || 'sorry';
            console.log('sorryResponse', type);
            bot.reply(message, sentences[type].join('\n'));
        }


        var intro = function(response, convo) {
            convo.on('end',function(convo) {
                var finalResponses = convo.extractResponses();
                console.log('conversation end======================', finalResponses);
                if (convo.status=='completed') {
                    // do something useful with the users responses
                    console.log('responses', util.inspect(responses, {depth: 3, colorize: true}));
                } else {
                    // something happened that caused the conversation to stop prematurely
                }
            });

            convo.ask(sentences.welcome.join('\n'), function(response, convo) {
                responses.name = response.text;
                responses.firstName = responses.name.split(' ')[0];

                convo.say('Okay, ' + responses.firstName);
                email(response, convo);
                convo.next();
            }, { key: 'name'} );
        };

        var email = function(response, convo) {
            convo.ask(sentences.email.join('\n'), function(response, convo) {
                convo.say('Thanks '+ responses.firstName + '.\n');
                lookingForPlace(response, convo);
                responses.email = response.text;
                convo.next();
            }, { key: 'email'});
        };

        var lookingForPlace = function(response, convo) {
            convo.ask(sentences.lookingForPlace.join('\n'), function(response, convo) {
                convo.say('Okay, lemme check... ');
                responses.place = response.text.match(/in (.*)/i)[1] + ', ny';
                placeSearch(response, convo, getPriceRange);

            }, { key: 'place'});
        };

        var placeSearch = function(response, convo, andThen) {

            var placeResponses = {
                where: responses.place,
                price: responses.price || 20000,
                beds: [1,2,3,4,5]
            };
            hotpadsWrapper.getPlaces(placeResponses, sorryResponse)
                .then(function(listings){
                    console.log('----------got listings', listings.length);
                    responses.listings = listings;
                    andThen(response, convo);
                    convo.next();
                });

        };

        var getPriceRange = function(response, convo) {
            console.log('in get price range', typeof convo.say);

            convo.say('Great, it looks like we have '+ responses.listings.length +' places.');
            convo.ask(sentences.priceRange.join('\n'), function(response, convo) {
                responses.priceRange = response.text;
                placeSearch(response, convo, amenities);

            }, { key: 'price'})
        };

        var amenities = function(response, convo) {
            console.log('in amenities');
            convo.ask(sentences.amenities.join('\n'), function(response, convo) {
                wrapUp(response, convo);
                convo.next();
            }, { key: 'price'})
        };

        var wrapUp = function(response, convo) {
            console.log('in wrap up');
            convo.say(sentences.wrapUp.join('\n'));
            for(var i = 0; i <= 3; i++){
                convo.say((i + 1) + '. '+'http://hotpads.com' + responses.listings[i].uriBuilding + '?price=0-'+
                    responses.priceRange +'&beds=' + '1,2,3,4,5' );
            }
            convo.next();
        };

        console.log('user joined, will welcome');
        bot.startConversation(message, intro);
    });


    controller.hears(['zillow (.*)'], 'direct_message,direct_mention,mention', function(bot, message){
        var matches = message.text.match(/zillow (.*)/i);
        var name = matches[1];
            name = name.replace(/\s/ig, '+');
        bot.reply(message, 'https://www.google.com/#q=zillow+' + name + '&btnI');
    });

    controller.hears(['craigslist'], 'ambient,direct_message,direct_mention,mention', function(bot, message){
        bot.reply(message, 'Craigslist?  Craigslist has lots of scammers.\nStick with http://hotpads.com \n' +
            'It\'s got all the quality listings =)');
    });

    controller.hears(['expensive listing'], 'ambient,direct_message,direct_mention,mention', function(bot, message){
        setTimeout(function(){
            bot.reply(message, 'Whoa, check this out! https://hotpads.com/93-cumberland-st-san-francisco-ca-94110-wdmjpn/pad');
        }, 1000);
    });

    controller.hears(['sign me up'], 'ambient,direct_message,direct_mention,mention', function(bot, message){

        bot.reply(message, 'Got it!  I\'ll start sending you search alerts.');

    });

    controller.hears(['you rock'], 'direct_message,direct_mention,mention', function(bot, message){

        bot.reply(message, 'Hey, that\'s my job.');

    });

    controller.hears(['help'], 'direct_message,direct_mention,mention', function(bot, message){

        var sentences = {
            intro: [
                'Okay, let\'s help you find a place.',
                'First off, where are we looking?',
                'Say, San Francisco or Brooklyn, NY'
            ],
            howMuch: [
                'Okay, how much are we willing to spend?',
                'Say, 500, 1000, 1250 (just a number)'
            ],
            beds: [
                'About how many bedrooms?',
                'Say, studio, one, two, etc.'
            ],
            recap: [
                'I think I got it.'
            ],
            results: [
                'Here\'s some search results!'
            ],
            hmm: [
                ':confused: Hmm, something went wrong...',
                'Let\'s try again later.',
                'http://hotpads.com'
            ],
            sorry: [
                ':confused: Sorry, couldn\'t find any apartments.'
            ],
            tryAgain: [
                'Wanna try again?'
            ],
                thatsAll: [
                'Hmm, looks like that\'s all we got.'
            ],
            more: [
                'Would you like to see more?',
                'Say, yes, no, or a number less than 20.',
                '...or done.'
            ],
            lemmeKnow: [
                'Okay, I\'ll be here.',
                'Just say "help me find a place"'
            ],
            done: [
                'Okay, we\'re done.',
                'If you need me again, just say:',
                '"help me find a place"'
            ],
            great: [
                'Great! Gimme a second to look for some places that match.'
            ],
            proceed: [
                'Shall we proceed?',
                'Say, yes, no or done to quit.'
            ]
        };
        var allListings = [];
        var displayCount = 0;
        var placeResponses = {};

        function showPlaces(index, limit, convo) {
            console.log('showPlaces+++++++++++++++++++++++', index, limit,  util.inspect(convo, {depth: 3, colorize: true}));

            index = index || displayCount;
            limit = limit || index;

            var responses = placeResponses;

            if(typeof responses === 'undefined') {
                console.log('responses are undefined');
                convo.stop();
                sorryResponse('hmm');
                return false
            }

            if(index >= allListings.length - 1) {
                console.log('index too high');
                convo.stop();
                sorryResponse('thatsAll');
                return false
            }

            if(limit) {
                limit = limit > allListings.length - 1 ? allListings.length : limit;
                convo.say('Check these out.\n');
                for(var i = index; i <= limit; i++){
                    displayCount ++;
                    convo.say((i + 1) + '. '+'http://hotpads.com' + allListings[i].uriBuilding + '?price=0-'+
                        responses.price +'&beds=' + responses.beds );
                }
            } else {
                displayCount++;
                convo.say('Check this out.\n' + (index + 1) + '. ' + 'http://hotpads.com' +
                    allListings[index].uriBuilding + '?price=0-'+ responses.price +'&beds=' + responses.beds );
            }

        }

        function sorryResponse(type) {
            type = type || 'sorry';

            console.log('sorryResponse', type);

            if (type === 'sorry' || type === 'thatsAll') {
                console.log('trying again', type);
                bot.reply(message, sentences[type].join('\n'));
                bot.startConversation(message, tryAgain);
            } else {
                bot.reply(message, sentences[type].join('\n'));
            }
        }


        var intro = function(response, convo) {

            displayCount = 0;

            convo.on('end',function(convo) {

                var res = convo.extractResponses();
                console.log('conversation end======================');

                if (convo.status=='completed') {
                    // do something useful with the users responses
                    console.log('responses', util.inspect(res, {depth: 3, colorize: true}));

                } else {
                    // something happened that caused the conversation to stop prematurely
                }

            });

            convo.ask(sentences.intro.join('\n'), function(response, convo) {
                convo.say('Cool, you said: ' + response.text);
                howMuch(response, convo);
                convo.next();
            }, { key: 'where'} );
        };

        var howMuch = function(response, convo) {
            convo.ask(sentences.howMuch.join('\n'), function(response, convo) {
                convo.say('Awesome. I\'ll set a max of $'+ response.text);
                beds(response, convo);
                convo.next();
            }, { key: 'price'});
        };

        var beds = function(response, convo) {
            convo.ask(sentences.beds.join('\n'), function(response, convo) {
                convo.say('"' + response.text + '"' + ' got it.');
                recap(response, convo);
                convo.next();
            }, { key: 'beds'});
        };

        var recap = function(response, convo) {

            var where = convo.extractResponse('where');

            var answers = util.format(
                'Looking in %s\n' +
                'Max price: %s\n' +
                'Bed(s): %s'
                ,
                convo.extractResponse('where'),
                convo.extractResponse('price'),
                convo.extractResponse('beds')
            );

            convo.say('Here are your answers:\n' + answers);
            confirm(response, convo);
            convo.next();

        };

        var confirm = function(response, convo) {
            convo.ask(sentences.proceed.join('\n'),[
                {
                    pattern: 'done',
                    callback: function(response,convo) {
                        convo.say(sentences.done.join('\n'));
                        convo.next();
                    }
                },
                {
                    pattern: bot.utterances.yes,
                    callback: function(response,convo) {
                        //convo.say(sentences.great.join('\n'));
                        placeResponses = {
                            where: convo.extractResponse('where'),
                            price: convo.extractResponse('price'),
                            beds: convo.extractResponse('beds')
                        };
                        hotpadsWrapper.getPlaces(convo.extractResponses(), sorryResponse)
                            .then(function(listings){
                                allListings = listings;
                                console.log('----------got listings', listings.length);
                                bot.startConversation(message, showSearchResults);
                                convo.next();
                            });
                    }
                },
                {
                    pattern: bot.utterances.no,
                    callback: function(response,convo) {
                        convo.say('Perhaps later.');
                        // do something else...
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        // just repeat the question
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);
        };

        var showSearchResults = function(response, convo){
            console.log("in search results", response);
            bot.reply(message, 'I found ' + allListings.length + ' places.');
            showPlaces(displayCount, null, convo);

            convo.ask(sentences.more.join('\n'),[
                {
                    pattern: 'done',
                    callback: function(response,convo) {
                        convo.say(sentences.done.join('\n'));
                        convo.next();
                    }
                },
                {
                    pattern: '^(yes|yea|yup|yep|ya|sure|ok|y|yeah|yah)|more',
                    callback: function(response,convo) {
                        convo.say('Okay, here\'s a few more.');
                        showPlaces(displayCount, (displayCount + 2), convo);
                        if(displayCount <= allListings.length) {
                            convo.repeat();
                        }
                        convo.next();
                    }
                },
                {
                    pattern: bot.utterances.no,
                    callback: function(response,convo) {
                        convo.say(sentences.lemmeKnow.join('\n'));
                        // do something else...
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        // just repeat the question
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);

        };

        var tryAgain = function(response, convo) {
            convo.ask(sentences.tryAgain.join('\n'),[
                {
                    pattern: 'done',
                    callback: function(response,convo) {
                        convo.say('OK, done.');
                        convo.next();
                    }
                },
                {
                    pattern: bot.utterances.yes,
                    callback: function(response,convo) {
                        convo.say('Great! let\'s try again...');
                        bot.startConversation(message, intro);
                        convo.next();

                    }
                },
                {
                    pattern: bot.utterances.no,
                    callback: function(response,convo) {
                        convo.say(sentences.lemmeKnow.join('\n'));
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        // just repeat the question
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);
        };

        /*
            start an intro conversation to handle this response
            intro > howMuch > beds > recap > confirm > getPlaces > showSearchResults
            showSearchResults > done|no
            showSearchResults > \d|yes|more > showMore

        */

        bot.startConversation(message, intro);


    });

    controller.hears(['[places|rentals|apartments] in (.*)'], 'direct_message,direct_mention,mention', function(bot, message){

        console.log('whoohoo rentals in');
        var matches = message.text.match(/in (.*)/i);
        var name = matches[1];

        hotpadsWrapper.autoComplete(encodeURIComponent(name))
            .then(function(suggestedAreas){

                var areas = [];

                if (typeof suggestedAreas !== 'undefined') {

                    suggestedAreas.map(function(area) {
                        //console.log('---------', hotpads, util.inspect(area, depth=3, colorize=true));
                        areas.push('<' + urljoin(hotpads, area.resourceId, 'apartments-for-rent') + '|'+ area.name
                            + ' , ' + area.city + ' , ' + area.state + '>\n');
                    });

                    var post = {
                        'text': 'OK, Here\'s some places matching ' + '"' + name + '"',
                        'attachments': [
                            {
                                'text': areas.join(''),
                                'color': '#7CD197'
                            }
                        ]
                    };

                    bot.reply(message, post);
                } else {
                    sorryResponse()
                }

            });

    });

    controller.hears(['[casa|apartamentos] para rentar en el (.*) baratos'], 'direct_message,direct_mention,mention', function(bot, message){

        var place =  message.text.match(/el (.*) baratos/i)[1];

        var sentences = {
            intro: [
                'De acuerdo, en los ',
                ' lo barato?'
            ],
            proceed: [
                'Es esto correcto?'
            ],
            more: [
                'Mostrar más?'
            ],
            lemmeKnow: [
                'Está bien, voy a estar aquí '
            ],
            sorry: [
                ':confused: Lo sentimos',
                'no pudo encontrar ningún apartamentos.'
            ]
        };
        var allListings = [];
        var displayCount = 0;
        var placeResponses = {};

        function showPlaces(index, limit, convo) {
            console.log('showPlaces+++++++++++++++++++++++', index, limit,  util.inspect(convo, {depth: 3, colorize: true}));

            index = index || displayCount;
            limit = limit || index;

            var responses = placeResponses;

            if(typeof responses === 'undefined') {
                console.log('responses are undefined');
                convo.stop();
                sorryResponse('hmm');
                return false
            }

            if(index >= allListings.length - 1) {
                console.log('index too high');
                convo.stop();
                sorryResponse('thatsAll');
                return false
            }

            if(limit) {
                limit = limit > allListings.length - 1 ? allListings.length : limit;
                convo.say('Check these out.\n');
                for(var i = index; i <= limit; i++){
                    displayCount ++;
                    convo.say((i + 1) + '. '+'http://hotpads.com' + allListings[i].uriBuilding + '?price=0-'+
                        responses.price +'&beds=' + responses.beds );
                }
            } else {
                displayCount++;
                convo.say('Mira esto.\n' + (index + 1) + '. ' + 'http://hotpads.com' +
                    allListings[index].uriBuilding + '?price=0-'+ responses.price +'&beds=' + responses.beds );
            }

        }

        function sorryResponse(type) {
            type = type || 'sorry';

            console.log('sorryResponse', type);

            if (type === 'sorry' || type === 'thatsAll') {
                console.log('trying again', type);
                bot.reply(message, sentences[type].join('\n'));
            } else {
                bot.reply(message, sentences[type].join('\n'));
            }
        }

        var intro = function(response, convo) {

            displayCount = 0;

            convo.on('end',function(convo) {

                var res = convo.extractResponses();
                console.log('conversation end======================');

                if (convo.status == 'completed') {
                    // do something useful with the users responses
                    console.log('responses', util.inspect(res, {depth: 3, colorize: true}));

                } else {
                    // something happened that caused the conversation to stop prematurely
                }

            });

            convo.ask(sentences.intro[0] + place + sentences.intro[1], function(response, convo) {
                convo.say('tu dijiste: ' + response.text);
                confirm(response, convo);
                convo.next();
            }, { key: 'price'} );
        };


        var confirm = function(response, convo) {
            convo.ask(sentences.proceed.join('\n'),[

                {
                    pattern: 'si',
                    callback: function(response,convo) {
                        //convo.say(sentences.great.join('\n'));
                        placeResponses = {
                            where: place,
                            price: convo.extractResponse('price'),
                            beds: '1,1.5,2,2.5,3,3.5,4'
                        };
                        hotpadsWrapper.getPlaces(placeResponses, sorryResponse)
                            .then(function(listings){
                                allListings = listings;
                                console.log('----------got listings', listings.length);
                                if(listings.length > 0) {
                                    bot.startConversation(message, showSearchResults);
                                }
                                convo.next();
                            });
                    }
                },
                {
                    pattern: 'no',
                    callback: function(response,convo) {
                        convo.say('Quizás mas tarde.');
                        // do something else...
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        // just repeat the question
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);
        };

        var showSearchResults = function(response, convo){
            console.log("in search results", response);
            bot.reply(message, 'encontré ' + allListings.length + ' lugares.');
            showPlaces(displayCount, null, convo);

            convo.ask(sentences.more.join('\n'),[
                {
                    pattern: 'done',
                    callback: function(response,convo) {
                        convo.say(sentences.done.join('\n'));
                        convo.next();
                    }
                },
                {
                    pattern: '^(yes|yea|yup|yep|ya|sure|ok|y|yeah|yah|si)|more',
                    callback: function(response,convo) {
                        convo.say('Bueno, aquí está un poco más...');
                        showPlaces(displayCount, (displayCount + 2), convo);
                        if(displayCount <= allListings.length) {
                            convo.repeat();
                        }
                        convo.next();
                    }
                },
                {
                    pattern: bot.utterances.no,
                    callback: function(response,convo) {
                        convo.say(sentences.lemmeKnow.join('\n'));
                        // do something else...
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        // just repeat the question
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);

        };

        bot.startConversation(message, intro);


    });

    //apartamentos para rentar en el
    controller.hears(['[casa|apartamentos] para rentar en el (.*)'], 'direct_message,direct_mention,mention', function(bot, message){

        console.log('whoohoo rentals in spanish');
        var matches = message.text.match(/el (.*)/i);
        var name = matches[1];

        hotpadsWrapper.autoComplete(encodeURIComponent(name))
            .then(function(suggestedAreas){

                var areas = [];

                if (typeof suggestedAreas !== 'undefined') {

                    suggestedAreas.map(function(area) {
                        //console.log('---------', hotpads, util.inspect(area, depth=3, colorize=true));
                        areas.push('<' + urljoin(hotpads, area.resourceId, 'apartments-for-rent') + '|'+ area.name
                            + ' , ' + area.city + ' , ' + area.state + '>\n');
                    });

                    var post = {
                        'text': 'Hola!, He aquí algunos lugares' + '"' + name + '"',
                        'attachments': [
                            {
                                'text': areas.join(''),
                                'color': '#7CD197'
                            }
                        ]
                    };

                    bot.reply(message, post);
                } else {
                    sorryResponse()
                }

            });

    });

    controller.hears(['how much are places in (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message){
        bot.say('lemme find out...');
    });

    //controller.hears([
    //    'list apartments',
    //    'show apartments',
    //    'suggest apartments',
    //    'new apartments'
    //],'ambient,direct_message,direct_mention,mention',function(bot, message) {
    //
    //    var hotpads = 'http://hotpads.com';
    //
    //    hotpadsWrapper.byQuads([])
    //        .then(function(results){
    //            if(typeof results !== 'undefined') {
    //                bot.reply(message, ':thinking_face: here\'s a couple listings...\n' +
    //                    hotpads + results[0].uriV2 + '\n' + hotpads + results[1].uriV2);
    //            } else {
    //                sorryResponse();
    //            }
    //        });
    //
    //});
}

module.exports =  hears;