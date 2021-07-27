require("dotenv").config();
const request = require("request");

class SimsimiAPI{

    getMessage(text){
        return new Promise((resolve, reject) => {
            request({
                url: `https://api.simsimi.net/v1/?text=${text}&lang=vi_VN`,
                method: "GET",
            }, (err, res, body) => {
                if(err){
                    reject(err);
                }
                var rs = {};
                try{
                  rs = JSON.parse(body);
                }
                catch(err){ console.log(err); 
                  rs.success = "BOT ốm rùi không nói chuyện với bạn được. Sorry !!!"
                }
                resolve(rs.success);
            });
        });
    }
}

module.exports = new SimsimiAPI();