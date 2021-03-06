const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class CovidAPI{
    constructor(){
        this._url = "https://ncov.moh.gov.vn/";
    }

    getHTMLString(){
      return new Promise((resolve, reject) =>{
        try{
          request({
            url: this._url,
            rejectUnauthorized: false,
            strictSSL: false,
            method: "GET", 
          }, (err, response, body) => {
            if(err){
              reject(err);
            }
  
            resolve(body);
          })
        }
        catch(err){
          reject(err);
        }
      })
    }

    getData(){
      return new Promise(async (resolve, reject) => {
        try{
          const data = await this.getHTMLString();
          const {document} = (new JSDOM(data)).window
          let children = document.querySelector('.box-tke-V3.border.position-relative');
          let table = document.querySelector('tbody');
  
          const result = {
            general: {
              data: [
                {
                  country: children.children[0].textContent,
                  totalConfirmed: children.children[1].children[0].children[1].textContent,
                  treatment: children.children[1].children[1].children[1].textContent,
                  totalRecovered: children.children[1].children[2].children[1].textContent,
                  death: children.children[1].children[3].children[1].textContent
                },
                {
                  country: children.children[3].textContent,
                  totalConfirmed: children.children[4].children[0].children[1].textContent,
                  treatment: children.children[4].children[1].children[1].textContent,
                  totalRecovered: children.children[4].children[2].children[1].textContent,
                  death: children.children[4].children[3].children[1].textContent
                }
              ]
            },
            detail: {
              data: []
            }
          }
  
  
          for(let i=1; i<table.children.length; i++){
            let newConfirmed = table.children[i].children[2].textContent;
            if(newConfirmed !== "0"){
              if(newConfirmed.includes('+')){
                newConfirmed = newConfirmed.replace('+','');
              }
              result.detail.data.push({
                city: table.children[i].children[0].textContent,
                newConfirmed: newConfirmed,
              })
            }
            
          }
  
          resolve(result);
        }
        catch (err) {
          reject(err);
        }
      })
    }
}

module.exports = new CovidAPI();