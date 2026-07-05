const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function fib(index){
    if (index < 2) return 1;
    return fib(index-1) + fib(index-2);
}

sub.on('message', (channel, message) => {
    redisClient.hset('fib_values', message, fib(parseInt(message)));
});
sub.on('error', (err) => console.log('Redis Subscriber Error', err.message));
redisClient.on('error', (err) => console.log('Redis Client Error', err.message));
sub.subscribe('insert');