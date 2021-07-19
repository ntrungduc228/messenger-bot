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
                    return;
                }

                var rs = JSON.parse(body);
                resolve(rs.success);
            });
        });
    }
}

module.exports = new SimsimiAPI();