require("dotenv").config();
const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const girlAPI = require("../services/girlAPI");
const simsimiAPI = require("../services/simAPI");
const weatherAPI = require("../services/weatherAPI");
const covidAPI = require("../services/covidAPI");

class Chatbot {
  constructor() {
    this._helpCommand = `Các tính năng hiện có:

- girl: Ảnh gái ngẫu nhiên từ 10 năm trở lại

- thoitiet (hoặc weather) [thành phố]: Xem thời tiết. Ví dụ: thoitiet Hà Nội

- covid (hoặc corona): Xem thống kê về COVID-19

Và các câu lệnh hữu ích khác sẽ được cập nhật thêm 🎉`;
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

  getUserName(sender_psid){
    return new Promise( async (resolve, reject) => {
      try {
        // Send the HTTP request to the Messenger Platform
        request(
          {
            uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
            method: "GET",
          },
          (err, res, body) => {
            if (!err) {
              console.log("message sent!");
              let response = JSON.parse(body);
              let username = `${response.last_name} ${response.first_name}`;
              resolve(username);
            } else {
              console.error("Unable to send message:" + err);
              reject(err);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  async handleGetStarted(sender_psid){
    return new Promise ( async (resolve, reject) => {
      try{
        let username = await this.getUserName(sender_psid);
        let openText;
        if(username !== "undefined undefined"){
          openText = `Hi ${username}`;
        }else { openText = `Hello`};

        let response = {
          text: `${openText}, cảm ơn tin nhắn của bạn.\n\nMời bạn gõ "help" để xem các câu lệnh mà tôi hỗ trợ 😊`
        }
        await this.callSendAPI(sender_psid, response);
        resolve('done');
      }
      catch(e){
        reject(e);
      }
    })
  }

  async handleGetWeatherData(sender_psid, cityName){
    let response;
    try{
      if(cityName){
        cityName = cityName.trim();
        const data = await weatherAPI.getWeatherData(cityName);
        if(data.cod === 200){
          data.weather[0].description = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)
          response = {
            text: `Tình hình thời tiết lúc này tại ${data.name}:

+ Nhiệt độ: ${Math.round(data.main.temp)}°C / ${Math.round(data.main.temp_min)} - ${Math.round(data.main.temp_max)}°C
            
+ Độ ẩm: ${data.main.humidity}%

+ Sức gió: ${(data.wind.speed * 3.6).toFixed(2)} (km/h)

+ ${data.weather[0].description}`,
          }
        }else {
          response = {
            text: data.message,
          }
        }
      }else{
        response = {
          text: `Nhập tên tỉnh/thành phố cần tra theo cú pháp: thoitiet [city]\n\nVí dụ: thoitiet ha noi (hoặc thoitiet Hà Nội)`
        }
      }
      
      
      await this.callSendAPI(sender_psid, response);
    }
    catch(err){ 
      response = {
        text: `Bot ốm rùi. Lần sau bạn thử lại nhé. Sorry !!!`,
      };
      await this.callSendAPI(sender_psid, response);
    }
  }

  async handleGetCovidData(sender_psid){
    let response = {};
  try{
    let result = await covidAPI.getData();
    let details = result.detail.data;
    let totalConfirmed = 0;
    let detailCity = ``;
    
    details.forEach((data) =>{
      while(data.newConfirmed.includes(".")){
        data.newConfirmed = data.newConfirmed.replace(".", "");
      }

      totalConfirmed += parseInt(data.newConfirmed);
      detailCity += `+ ${data.city}: ${data.newConfirmed}

`;
    });

    response = {
      text: `🌏 Thế giới:
+ Số ca nhiễm: ${result.general.data[1].totalConfirmed}
+ Đang nhiễm:  ${result.general.data[1].treatment}
+ Tử vong: ${result.general.data[1].death}
+ Đã hồi phục: ${result.general.data[1].totalRecovered}

-----

🇻🇳 Việt Nam:
+ Số ca nhiễm: ${result.general.data[0].totalConfirmed}
+ Đang nhiễm: ${result.general.data[0].treatment} 
+ Tử vong: ${result.general.data[0].death}
+ Đã hồi phục: ${result.general.data[0].totalRecovered}

-----

Có ${totalConfirmed} ca mắc mới hôm nay:

${detailCity}
`,
    };
      
    await this.callSendAPI(sender_psid, response)
  
  } 
  catch(e){ console.log(e);
    response = {
      text: `Bot ốm rùi. Lần sau bạn thử lại nhé. Sorry !!!`,
    };
    await this.callSendAPI(sender_psid, response)
  }   
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
        text: `Bot ốm rùi. Lần sau bạn thử lại nhé. Sorry !!!`,
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

      let reqMessage = received_message.text.toLowerCase();
      let cityName;
      if(reqMessage.includes("thoitiet")) {
        cityName = reqMessage.slice(9);
        reqMessage = "weather";
      }else if(reqMessage.includes("weather")){
        cityName = reqMessage.slice(8);
        reqMessage = "weather";
      }

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
        case "weather":
          console.log('city name:', cityName);
          await this.handleGetWeatherData(sender_psid, encodeURI(cityName));
          return;
          break;
        case "covid":  case "corona":
          await this.handleGetCovidData(sender_psid);
          return;
          break;
        default:
          //reqMessage = encodeURI(reqMessage);
          try {
            response.text = await simsimiAPI.getMessage(encodeURI(reqMessage));
          } catch (err) {
            console.log("error", err);
          }

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
        await this.handleGetStarted(sender_psid);
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
