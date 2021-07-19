require("dotenv").config();
const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const girlAPI = require("./GirlController");
const simsimiAPI = require("./SimsimiController");

class Chatbot {

  constructor(){
    this._helpCommand = `Đây là các lệnh mà tôi hỗ trợ:
    - girl: Ảnh ngẫu nhiên
    
    Và nhiều câu lệnh khác sẽ được cập nhật thêm`;
  }
  
  sendTypingOn(sender_psid){
      return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "typing_on"
            };

            let url = `https://graph.facebook.com/v6.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
            request({
                "uri": url,
                "method": "POST",
                "json": request_body

            }, (err, res, body) => {
                if (!err) {
                    resolve("done!");
                } else {
                    reject("Unable to send message:" + err);
                }
            });

        } catch (e) {
            reject(e);
        }
    });
  }

  // Sends response messages via the Send API
  async callSendAPI(sender_psid, response) {
    // Action sender
    await this.sendTypingOn(sender_psid)

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

  async handleMessage(sender_psid, received_message) {
    let response = {};

    // Check if the message contains text
    if (received_message.text) {
      console.log("---------", received_message.text);

      let reqMessage = received_message.text;

      switch(reqMessage){
        case "help":
            response = { 
              text: this._helpCommand
            }
            break;
        case "girl":
          const imageURL = await girlAPI.getRandomGirlImage();
          response = { 
              attachment:{
                type:"image", 
                payload:{
                  url:imageURL,
                  is_reusable:true
                }
              }
            }
          
          break;
        default:
           reqMessage = encodeURI(reqMessage);
           try{
            response.text = await simsimiAPI.getMessage(reqMessage);
           }
           catch(err){
             console.log('error', err);
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
