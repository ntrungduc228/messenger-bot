require("dotenv").config();
const request = require("request");
class GirlAPI{

    getRandomGirlImage(){
        const maxIndex = 37000;
        const perPage = 50;
        const pageIndex = Math.floor(Math.random() * Math.floor(maxIndex/perPage));
        const randomIndex = Math.floor(Math.random() * perPage);
        console.log('randomIndex', randomIndex, 'pageIndex', pageIndex);
        return new Promise((resolve, reject) => {
            request({
                url: `https://api.huynq.net/sosexy.php?api_key=28282300029828811123&api_user=j2team&app=gallery&page=${pageIndex}`,
                method: 'GET'
            }, (err, response, body) => {
                if(err){
                    reject(err);
                }

                var rs = JSON.parse(body);

                //var imageURL = rs; 
                var imageURL =  rs[1].data.photos[randomIndex].original.url;
                resolve(imageURL)
            })
        })
    }
}

module.exports = new GirlAPI();