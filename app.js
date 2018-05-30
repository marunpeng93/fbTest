var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.set('port', 3000);
app.use(bodyParser.json());
app.use(cors());

app.listen(app.get('port'), function() {
    console.log('server: ' , app.get('port'));
});

require("./lib/bot")(app)