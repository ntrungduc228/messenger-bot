const express = require('express');
let router = express.Router();
const homeController = require('../controllers/homeController');

function route(app) {

    router.get('/webhook', homeController.getWebhook);
    router.post('/webhook', homeController.postWebhook);
    router.get('/', homeController.getHomePage);

    app.use('/', router);
}

module.exports = route;