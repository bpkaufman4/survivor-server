
const express = require('express');
const controller = require('./controller');
const sequelize = require('./config/connection');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');
const cors = require('cors');
const models = require('./models')

app.enable('trust proxy');
app.use(cors());

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

const alter = process.env.SYNC_DB_ALTER === 'true';

sequelize.sync({force: false, alter}).then(() => {
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`);
    });
});
