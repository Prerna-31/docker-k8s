const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
        
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Set-up
const { Pool } = require('pg');
const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    user: keys.pgUser,
    password: keys.pgPassword
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS fib_values (number INT)")
    .catch((err) => console.error(err));
});

// Redis Client Set-up
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

redisClient.on('error', (err) => console.log('Redis Client Error', err.message));
redisPublisher.on('error', (err) => console.log('Redis Publisher Error', err.message));

// Express route handlers
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    try {
        const values = await pgClient.query('SELECT * from fib_values');
        res.send(values.rows);
        // This is the test-code to validate server sync using skaffold.
        // res.send([{"number":1},{"number":2},{"number":3}]);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Database error' });
    }
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('fib_values', (err, values) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Redis error' });
        }
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40){
        return res.status(422).send('Index too high');
    }

    redisClient.hset('fib_values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);

    try {
        await pgClient.query('INSERT INTO fib_values(number) VALUES($1)', [index]);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Database error' });
    }

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening');
});