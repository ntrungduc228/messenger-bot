require("dotenv").config();
const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

class Chatbot {
  

  // Sends response messages via the Send API
  callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };

    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body,
      },
      (err, res, body) => {
        if (!err) {
          console.log("message sent!");
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
  }

  handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {
      console.log("---------", received_message.text);

      // Create the payload for a basic text message
      response = {
        text: `You sent the message: "${received_message.text}". Now send me an image!`,
      };
    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: "Is this your picture?",
                subtitle: "Tap a button to answer.",
                image_url: attachment_url,
                buttons: [
                  {
                    type: "postback",
                    title: "Yes!",
                    payload: "yes",
                  },
                  {
                    type: "postback",
                    title: "No!",
                    payload: "no",
                  },
                ],
              },
            ],
          },
        },
      };
    }

    // Sends the response message
    this.callSendAPI(sender_psid, response);
  }

  // Handles messaging_postbacks events
  handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === "yes") {
      response = { text: "Thanks!" };
    } else if (payload === "no") {
      response = { text: "Oops, try sending another image." };
    }
    // Send the message to acknowledge the postback
    this.callSendAPI(sender_psid, response);
  }

  
}

module.exports = new Chatbot();
