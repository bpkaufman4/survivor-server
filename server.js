
const express = require('express');
const controller = require('./controller');
const sequelize = require('./config/connection');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');
const cors = require('cors');
const models = require('./models')
const http = require('http');
const { setupWebSocket } = require('./websocket');
const busboy = require('connect-busboy');

app.enable('trust proxy');

app.use(cors());

app.use(busboy());

process.env.TZ = "UTC";


if(!process.env.LOCAL_HOSTED) {
    app.all('*', function(req, res, next){
        if (req.secure) {
            return next();
        }
        res.redirect('https://'+req.hostname+req.originalUrl);
    });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(controller);


const server = http.createServer(app);

setupWebSocket(server);

const alter = process.env.SYNC_DB_ALTER === 'true';

sequelize.sync({force: false, alter}).then(() => {
    server.listen(PORT, () => {
        console.log(`listening on port ${PORT}`);
    });
});
