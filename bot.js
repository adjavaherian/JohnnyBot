/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var hears_etc = require('./hears/hears_etc');
var hears_math = require('./hears/hears_math');
var hears_flickr = require('./hears/hears_flickr');
var hears_hotpads = require('./hears/hears_hotpads');
var hears_mlb = require('./hears/hears_mlb');
var http = require('http');
var request = require('request');
var os = require('os');

var controllerOptions = {
    debug: true,
    port: process.env.PORT || 5000
};

var botOptions = {
    token: process.env.token
};

var webhookOptions = {
    url: process.env.WEBHOOK || false
};

// setup controller and bot
var controller = Botkit.slackbot(controllerOptions);
var bot = controller.spawn(botOptions).startRTM();

// send webhooks
if(webhookOptions.url){
    bot.configureIncomingWebhook(webhookOptions);
    bot.sendWebhook({
        text: 'Hey Hey, I\'m Alive!',
        channel: '#mearsebot_testing'
    },function(err,res) {
        if(err){
            console.log('error from webhook', err);
        }
    });
}


//add all your hears here
hears_etc(controller);
hears_hotpads(controller);
hears_flickr(controller);
hears_math(controller);
hears_mlb(controller);

// to keep heroku's free dyno awake
http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Ok, mearsebot is awake.');
}).listen(process.env.PORT || 5000);

// send an http request every 5 minutes to keep mearsebot running
setInterval(function(){
    request.get('https://mearsebot.herokuapp.com', function(error, response, body){
        if (!error && response.statusCode == 200) {
            console.log('mearsebot keepalive: ', body);
            if(webhookOptions.url) {
                //bot.sendWebhook({
                //    text: 'I\'m awake... barely.',
                //    channel: '#mearsebot_testing'
                //});
            }
        }
    });
}, 300000);
