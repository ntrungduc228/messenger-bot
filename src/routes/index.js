const chatbotRouter = require('./chatbot');

function route(app) {
    app.use('/', chatbotRouter);
}

module.exports = route;