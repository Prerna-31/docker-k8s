const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Bye There');
});

// 8080 is the target port which is nothing but the port of the container.
app.listen(8080, () => {
    console.log('Listening on port 8080');
});