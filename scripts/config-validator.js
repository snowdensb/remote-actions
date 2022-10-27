#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');
const SwaggerParser = require('@apidevtools/swagger-parser'); 
const args = process.argv.slice(2); 
const folder = args?.[0]+"/config"; 
const {errorMessage  , printMessage} = require('./utils/tools')
const validator_name = 'DED VALIDATOR'; 
const validateDir = async (dir) => {
let check = false;

  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    files?.forEach(async file => {

     if (file.name === 'document-explorer-definition.yaml'){ 
        try {
          const fileName = `${dir}/${file.name}`;
          const content = fs.readFileSync(fileName, 'utf8');
          const apiJson = yaml.load(content);
          
          //linkcheck(apiJson);

        } catch (e) {
          errorMessage(validator_name  ,e?.message);
        }
      } 

      if (file.name === 'tenant.json'){

        try{ 
          const fileName = `${dir}/${file.name}`;
          const content = fs.readFileSync(fileName, 'utf8'); 
          JSON.parse(content)

        }catch (e){
          errorMessage(validator_name  ,e?.message);
        } 
      }
      
    });
  });
};

function linkcheck(jsonArray){

    jsonArray.forEach((item) => { 
        for (res of item?.sections){  
            
            if (res instanceof Object){
              //console.log(res);
                if (res?.link){
                  console.log(res?.link);
                }
                for (res1 of res?.sections){
                  console.log(res1?.link);
                  if (res1?.sections instanceof Object){
                    linkcheck(res1?.sections)
                  }
                 
                }
            }
          
        } 
      }); 
    return true;
}

try {
  printMessage(`External Dir ---->>> ${folder}`);   
  if ( args?.length > 0){ 
  validateDir(folder);
 }else{
  errorMessage('YAML VALIDATOR'  ,'No Path for reference dir. defined');
 }
} catch (e) {
  errorMessage('YAML VALIDATOR'  ,e.message);
}
