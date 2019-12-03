const express = require('express');
const app = express();
const PORT = 8000;

app.use(express.static('public'))
    .use(express.static('libs'))
    .use(express.static('images'));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));