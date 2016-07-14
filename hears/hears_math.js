// hears.js
// all the things mearsebot can hear

var utils = require('../lib/utils.js');
var http = require('http');
var math = require('mathjs');

// all the hears go here
function hears(controller){

    //console.log(controller.hears());

    controller.hears(['what is \\d(.*)\\d', 'what\'s \\d(.*)\\d'],'direct_message,direct_mention,mention',function(bot, message) {

        var question = message.text.match(/(\d.*\d)/i)[0];
        console.log('question:', question);
        bot.reply(message, ':thinking_face: thinking mathy thoughts...' + question);
        question = question.replace(/x/i, '*');
        console.log('question:', question);
        var answer = math.eval(question);
        bot.reply(message, 'got it! ' + answer);
        setTimeout(function(){

        }, 3000);

    });

}

module.exports =  hears;