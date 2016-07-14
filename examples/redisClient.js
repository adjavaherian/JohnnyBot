var redis = require('redis');
var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
//Testing (Node.js)
client.set('foo', 'bar');
client.get('foo', function (err, reply) {
    console.log(reply.toString()); // Will print `bar`
});