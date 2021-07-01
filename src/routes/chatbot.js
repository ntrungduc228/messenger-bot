const express = require('express');
const router = express.Router();

const chatbotController = require('../controllers/chatbotController');

router.get('/', chatbotController.getHomePage);
router.get('/webhook', chatbotController.getWebhook);
router.post('/webhook', chatbotController.postWebhook);

module.exports = router;