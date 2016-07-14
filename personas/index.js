var fs = require('fs');
var path = require('path');
var personaPath = './personas';
var redis = require('redis');
var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

function Personas(options) {

    var self = this;
    this.personas = {};
    options = options || {};

    this.init = function(cb) {
        fs.readdir(path.join(personaPath), function(err, stats){
            //console.log('stats', stats);
            stats.map(function(stat){
                fs.stat(path.join(personaPath, stat), function(err, fd){
                    if(!fd.isDirectory()){
                        fs.readFile(path.join(personaPath, stat), function(err, data){
                            if (err) {
                                cb(err);
                            }
                            self.addPersona(stat, data.toString());
                            cb();
                        });
                    }
                });
            })
        });
    }
}

Personas.prototype.addPersona = function addPersona(key, value) {

    //sensible defaults
    key = key.split('.')[0] || 'default';
    value = value || 'false';

    //add to personas
    this.personas[key] = {
        'strings' : value
    };

    //set in redis
    client.set(key, value);

};

Personas.prototype.getPersonas = function getPersonas(){
    //console.log('get personas')
    return Object.keys(this.personas);
};

Personas.prototype.getPersona = function getPersona(name, cb){

    var self = this;
    name = name || 'default';

    //console.log('getPersona', name);

    client.get(name, function (err, reply) {
        if (err){
            throw err;
        }
        self.personas[name]['quotes'] = reply.toString().replace(/(\r\n|\n|\r)/gm,'').split('.') || false;
        console.log('quotes', self.personas[name]['quotes']);
        //console.log('quotes', self.personas[name].quotes); // will print list of persona quotes
        self.personas[name].quotes.pop();
        cb(self.personas[name].quotes);

    });

};

Personas.prototype.quit = function quit(){
    client.quit();
};

module.exports = Personas;
