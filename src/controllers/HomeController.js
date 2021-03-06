require("dotenv").config();
const request = require("request");
const bot = require("./ChatbotController");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

class Home {
  getHomePage = (req, res, next) => {
    res.render("homepage.ejs");
  };
  setupPersistentMenu(req, res, next) {
    return new Promise(async (resolve, reject) => {
      try {
        let request_body = {
          persistent_menu: [
            {
              locale: "default",
              composer_input_disabled: false,
              call_to_actions: [
                {
                  type: "postback",
                  title: "Restart Bot",
                  payload: "RESTART_BOT",
                },
                // {
                //     "type": "web_url",
                //     "title": "Shop now",
                //     "url": "https://www.originalcoastclothing.com/",
                //     "webview_height_ratio": "full"
                // }
              ],
            },
          ],
        };

        await request(
          {
            uri: `https://graph.facebook.com/v11.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: "POST",
            json: request_body,
          },
          (err, res, body) => {
            console.log(body);
            if (!err) {
              console.log("Setup persistent menu success!");
              resolve("Setup persistent menu success!");
            } else {
              console.error("Unable to send message:" + err);
              reject("Unable to send message:" + err);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  handleSetup = async (req, res, next) => {
    try {
      await bot.setUpMessengerPlatform();
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  };

  getWebhook(req, res, next) {
    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        console.log("challenge ", challenge);
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }

  postWebhook(req, res, next) {
    let body = req.body;
    console.log("req body ", req.body);

    // Checks this is an event from a page subscription
    if (body.object === "page") {
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function (entry) {
        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log("webhook_event ", webhook_event);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log("Sender PSID: " + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message?.quick_reply) {
          bot.handleQuickReply(
            sender_psid,
            webhook_event.message.quick_reply.payload
          );
        } else if (webhook_event.message) {
          bot.handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          bot.handlePostback(sender_psid, webhook_event.postback);
        }
      });

      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED");
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  }
}

module.exports = new Home();
