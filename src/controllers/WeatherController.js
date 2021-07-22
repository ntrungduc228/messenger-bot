require("dotenv").config();
const request = require('request');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

class WeatherAPI {

    getWeatherData(cityName){
        return new Promise((resolve, reject) => {
            try{
                request({
                    url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&lang=vi&appid=${WEATHER_API_KEY}&units=metric`,
                    method: 'GET',
                }, (err, response, body) =>{
                    if(err) {
                        console.log('err', err);
                        reject(err);
                    }

                    const rs = JSON.parse(body);
                    const data = rs;
                    
                    switch (data.cod){
                        case 400:
                            data.message = `Nhập tên tỉnh/thành phố cần tra theo cú pháp: thoitiet [city]\n\nVí dụ: thoitiet hanoi (hoặc thoitiet Hà Nội)`;
                            break;
                        case 401:
                            data.message = 'Sai API Key cmnr. Thằng Ad làm ăn chán quá, bot sẽ kiện nó. Các bạn thông cảm lần sau thử lại nhé !!!';
                            break;
                        case 404:
                            data.message = 'Không tìm thấy kết quả. Hãy chắc chắn là bạn nhập đúng tên tỉnh/thành phố cần tra!';
                            break;
                        case 429:
                            data.message = 'Quá 60 yêu cầu mỗi phút là server quá tải, các bạn thử lại sau nhé. Sorry'
                            break; 
                        default:
                            break; 
                    }
                    
                    // case 200 -> successfully !!!
                    resolve(data);
                })
            }
            catch(err){
                console.log('err ', err);
                reject(err);
            }
        })
    }
}

module.exports = new WeatherAPI();