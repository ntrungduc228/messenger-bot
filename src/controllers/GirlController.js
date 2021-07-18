require("dotenv").config();
const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

class GirlAPI{
    constructor(){
        //this._pageID = "697332711026460"; 637434912950811
        this._pageID = "637434912950811";
    }

    getRandomGirlImage(){
        var randomIndex = Math.floor((Math.random() * maxIndex));

        return new Promise((resolve, reject) => {
            request({
                url: `https://graph.facebook.com/v2.6/${this._pageID}/photos/`,
                qs: {
                    type : "uploaded",
                    fields: "images",
                    limit: 1,
                    offset: randomIndex,
                    access_token: PAGE_ACCESS_TOKEN
                },
                method: "GET"
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                var rs = JSON.parse(body);
                var imageUrl = rs.data[0].images[0].source; 
                resolve(imageUrl);
            });
        });

    }
}

module.exports = new GirlAPI();