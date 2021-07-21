require("dotenv").config();
const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const girlAPI = require("./GirlController");
const simsimiAPI = require("./SimsimiController");

class Chatbot {
  constructor() {
    this._helpCommand = `Các tính năng hiện có:\n\n- girl: Ảnh gái ngẫu nhiên từ 10 năm trở lại\n\n Và các câu lệnh hữu ích khác sẽ được cập nhật thêm 🎉`;
  }

  setUpMessengerPlatform(){
    return new Promise( async (resolve, reject) => {
      try {
        let request_body = {
            "get_started": {
              "payload": "GET_STARTED"
          },
          "whitelisted_domains": [
            "https://chat-messenger-bot.herokuapp.com/"
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
            if (!err) {
              console.log("Setup user profile success!");
              resolve("Setup user profile success!");
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

  sendMarkSeen(sender_psid) {
    return new Promise((resolve, reject) => {
      try {
        let request_body = {
          recipient: {
            id: sender_psid,
          },
          sender_action: "mark_seen",
        };

        let url = `https://graph.facebook.com/v6.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
        request(
          {
            uri: url,
            method: "POST",
            json: request_body,
          },
          (err, res, body) => {
            if (!err) {
              resolve("done!");
            } else {
              reject("Unable to send message:" + err);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  sendTypingOn(sender_psid) {
    return new Promise((resolve, reject) => {
      try {
        let request_body = {
          recipient: {
            id: sender_psid,
          },
          sender_action: "typing_on",
        };

        let url = `https://graph.facebook.com/v6.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
        request(
          {
            uri: url,
            method: "POST",
            json: request_body,
          },
          (err, res, body) => {
            if (!err) {
              resolve("done!");
            } else {
              reject("Unable to send message:" + err);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  sendOptionContinue(sender_psid) {
    return new Promise((resolve, reject) => {
      try {
        // Construct the message body
        let request_body = {
          recipient: {
            id: sender_psid,
          },
          //"messaging_type": "RESPONSE",
          message: {
            text: "Bạn muốn xem tiếp không?",
            quick_replies: [
              {
                content_type: "text",
                title: "Ok luôn",
                payload: "continue",
              },
              {
                content_type: "text",
                title: "Tiếp đê",
                payload: "continue",
              },
            ],
          },
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
      } catch (e) {
        reject(e);
      }
    });
  }

  // Sends response messages via the Send API
  callSendAPI(sender_psid, response) {
    return new Promise( async (resolve, reject) => {
      try {
        // Action sender
        await this.sendTypingOn(sender_psid);
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
              resolve("message sent!");
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

  async handleSendGirlImage(sender_psid) {
    let response;
    try {
      const imageURL = await girlAPI.getRandomGirlImage();
      response = {
        attachment: {
          type: "image",
          payload: {
            url: imageURL,
            is_reusable: true,
          },
        },
      };

      await this.callSendAPI(sender_psid, response);
      await this.sendOptionContinue(sender_psid);
    } catch (err) {
      response = {
        text: `Bot ốm rùi. Lần sau bot gửi ảnh cho bạn nhé. Sorry !!!`,
      };
      await this.callSendAPI(sender_psid, response);
    }
  }

  async handleMessage(sender_psid, received_message) {
    let response = {};
    this.sendMarkSeen(sender_psid);
    // Check if the message contains text
    if (received_message.text) {
      console.log("---------", received_message.text);

      let reqMessage = received_message.text;
      reqMessage = encodeURI(reqMessage.toLowerCase());

      switch (reqMessage) {
        case "help":
          response = {
            text: this._helpCommand,
          };
          break;
        case "girl":
          await this.handleSendGirlImage(sender_psid);
          return;
          break;
        default:
          try {
            response.text = await simsimiAPI.getMessage(reqMessage);
          } catch (err) {
            console.log("error", err);
          }

        //await console.log('response', response);
        // Create the payload for a basic text message
        /*response = {
            text: `You sent the message: "${received_message.text}". Now send me an image!`,
          };*/
      }
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
    await this.callSendAPI(sender_psid, response);
  }

  async handleQuickReply(sender_psid, received_payload) {
    let payload = received_payload;
    if(payload === "continue"){
      await this.sendMarkSeen(sender_psid);
      await this.handleSendGirlImage(sender_psid);
    }
  }
  // Handles messaging_postbacks events
  async handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;
    await this.sendMarkSeen();

    switch(payload){
      case "yes":
        response = { text: "Thanks!" };
        break;
      case "no":
        response = { text: "Oops, try sending another image." };
        break;
      case "GET_STARTED":
        response = { 
          text: `Hello , mời bạn gõ "help" để xem các câu lệnh 😊`
         };
        break;
      default:
        response = { 
          text: `Oop! I don't know response, please type "help" for seeing my commands 😊`
         };
    }

    this.callSendAPI(sender_psid, response);
    
  }
}

module.exports = new Chatbot();
