const express = require('express');
const router = express.Router();

const chatbotController = require('../controllers/chatbotController');

router.get('/webhook', chatbotController.getWebhook);
router.post('/webhook', chatbotController.postWebhook);
router.get('/', chatbotController.getHomePage);

module.exports = router;