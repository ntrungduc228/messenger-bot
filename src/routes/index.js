const express = require('express');
let router = express.Router();
const homeController = require('../controllers/HomeController');

function route(app) {

    router.get('/webhook', homeController.getWebhook);
    router.post('/webhook', homeController.postWebhook);
    router.get('/setup', homeController.handleSetup);

    router.get('/', homeController.getHomePage);

    app.use('/', router);
}

module.exports = route;