// hears.js
// all the things mearsebot can hear
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var sinon = require('sinon');
var assert = require('assert');

describe('hears math test', function(){

    var hearsMath = require('../hears/hears_math');
    var hearsHotpads = require('../hears/hears_hotpads');
    var hearsEtc = require('../hears/hears_etc');

    function MockController(){
        // Super constructor
        EventEmitter.call( this );
        this.events = {};
        return( this );
    }

    util.inherits(MockController, EventEmitter);

    //mock controller instance
    var mockController = new MockController();

    //mock on
    mockController.on = function(event, cb) {
        //console.log('Setting up a handler for', event, cb);
        var events = (typeof(event) === 'string') ? event.split(/\,/g) : event;

        for (var e in events) {
            //console.log('events', events);
            if (!this.events[events[e]]) {
                this.events[events[e]] = [];
            }
            this.events[events[e]].push(cb);
        }

        return this;
    };

    //and hears
    mockController.hears = function(keywords, events, cb){

        if (typeof(keywords) == 'string') {
            keywords = [keywords];
        }
        if (typeof(events) == 'string') {
            events = events.split(/\,/g);
        }

        var match;
        for (var k = 0; k < keywords.length; k++) {
            var keyword = keywords[k];
            for (var e = 0; e < events.length; e++) {
                (function(keyword) {
                    //console.log('invoked', events[e])
                    mockController.on(events[e], function(bot, message) {
                        //console.log('bot, message', bot, message);
                        if (message.text) {
                            if (match = message.text.match(new RegExp(keyword, 'i'))) {
                                console.log('I HEARD ', keyword, message);
                                message.match = match;
                                cb.apply(this, [bot, message]);
                                return false;
                            }
                        }
                    });
                })(keyword);
            }
        }

    };



    it('should hear a natural math expression', function(){

        hearsMath(mockController);

        sinon.spy(bot, 'reply');

        mockController.events['direct_mention'][0].apply(null, [bot, {text: '5 x 5'}]);

        assert(bot.reply.calledOnce);

        bot.reply.restore();


    });

    it('should list hotpads apartments', function(done){

        //mock bot reply
        var bot = {
            reply: function(message, reply){
                console.log('bot reply', reply);
                done();

            }
        };

        hearsHotpads(mockController);

        //sinon.spy(bot, 'reply');

        mockController.events['direct_mention'][0].apply(null, [bot, {text: 'list apartments'}]);

        //assert(bot.reply.calledOnce);

        //bot.reply.restore();


    });

    it('should return suggestions', function(done){

        //mock bot reply
        var bot = {
            reply: function(message, reply){
                console.log('bot reply', reply);
                done();

            }
        };

        hearsHotpads(mockController);

        //sinon.spy(bot, 'reply');

        mockController.events['direct_mention'].map(function(hear){
            hear.apply(null, [bot, {text: 'rentals in brooklyn, ny'}]);
        });

        //assert(bot.reply.calledOnce);

        //bot.reply.restore();


    });

    it('hears how you doin', function(){

        //mock bot reply
        var bot = {
            reply: function(message, reply){
                console.log('bot reply', reply);

            }
        };

        hearsEtc(mockController);

        sinon.spy(bot, 'reply');

        mockController.events['direct_mention'].map(function(hear){
            hear.apply(null, [bot, {text: 'it going'}]);
            hear.apply(null, [bot, {text: 'it doing'}]);
            hear.apply(null, [bot, {text: 'you doin'}]);
            hear.apply(null, [bot, {text: 'you doing'}]);
        });

        console.log('mention--------------', bot.reply.callCount);
        assert(bot.reply.callCount === 4);

        bot.reply.restore();


    });

});

