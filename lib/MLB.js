var utils = require('./utils.js');
var axios = require('axios');

var options = {
    api_key: process.env.FLICKR_KEY,
    secret: process.env.FLICKR_SECRET
};

var makeUrl = function(mmddyyyy){
    var url = '';

    url += 'http://gd2.mlb.com/components/game/mlb/year_' + mmddyyyy.yyyy +
        '/month_' + mmddyyyy.mm +
        '/day_' + mmddyyyy.dd +
        '/master_scoreboard.json';

    return url;
};

module.exports = {
    games: function games(searchTerm, cb){

        searchTerm = searchTerm || 'today';
        var url = '';

        if(searchTerm === 'today') {
            var date = utils.getMMDDYYYY();
            console.log('date object', date);
            url = makeUrl(date);
        }

        console.log('got url', url);

        return axios.get(url)
            .catch(function(err){
                console.log("error: ", err);
            })
            .then(function(res){
                if (res.status !== 200) {
                    return undefined;
                } else {

                    var result = res.data;

                    if (typeof result !== 'undefined') {

                        var games = result.data.games.game;
                        var descriptions = games.map(function(game, i){
                            return game.description;

                        });

                        return(descriptions);

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
    pbp: function pbp(team, cb){

        team = team || 'Mets';
        var url = '';

        var date = utils.getMMDDYYYY();
        console.log('date object', date);
        url = makeUrl(date);

        return axios.get(url)
            .catch(function(err){
                console.log("error: ", err);
            })
            .then(function(res){
                if (res.status !== 200) {
                    return undefined;
                } else {

                    var result = res.data;

                    if (typeof result !== 'undefined') {

                        var games = result.data.games.game;
                        var teamRegex = new RegExp(team, 'i');
                        var game = games.filter(function(game, i) {
                            console.log('map', game.home_team_name.match(teamRegex));
                            if (game.home_team_name.match(teamRegex) !== null || game.away_team_name.match(teamRegex) !== null) {
                                console.log('found an active game', game.description);
                                return game
                            }
                        });

                        console.log('game length', game.length);
                        if (game.length) {
                            return game[0];
                        } else {
                            return false
                        }


                    }else {
                        console.log('res.statusCode', res);
                        return undefined;
                    }
                }
            })
            .catch(function(err){
                console.log("error: ", err);
            });


    }

};