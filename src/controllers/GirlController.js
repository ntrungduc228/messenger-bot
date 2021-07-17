require("dotenv").config();
const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

class GirlAPI{
    constructor(){
        this._pageID = "697332711026460";
    }

    async getRandomGirlImage(){
        const maxIndex = 5000;
        let randomIndex = Math.floor(Math.random() * maxIndex);

        let imageURL = "";

        try{
            let data = await request({
                url: `https://graph.facebook.com/v11.0/${this._pageID}/photos/`,
                qs: {
                     type : "uploaded",
                     fields: "images",
                     offset: randomIndex,
                     limit: 1,
                     access_token: PAGE_ACCESS_TOKEN
                },
                method: "GET"
            });
            
            data = await JSON.parse(data);
        }
        catch(err){
            console.log(err); return;
        }

        return imageURL;

    }
}

module.exports = new GirlAPI();