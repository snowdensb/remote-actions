#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');
const SwaggerParser = require('@apidevtools/swagger-parser');
const AdmZip = require("adm-zip");
const args = process.argv.slice(2); 
const folder = args?.[0]+"/reference";
let zip = new AdmZip(); 
const {errorMessage  , printMessage} = require('./utils/tools')
// const failValidation = (message) => {
//   console.log('------------------------- ZIP GENERATOR FAILED --------------------------')
//   console.log(message)
// };
let downloadFile; 
const generateZipCollection = async (dir) => { 
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    files.forEach(async file => { 
      if (file.isDirectory()) {
        generateZipCollection(`${dir}/${file.name}`);
      } else if (/\.yaml$/.test(file.name)){ 
        try {
          let fileName = `${dir}/${file.name}`;
          const content = fs.readFileSync(fileName, 'utf8');
          const apiJson = yaml.load(content);
          if (!apiJson.paths || !Object.keys(apiJson.paths).length) {
            errorMessage('ZIP GENERATOR' ,'No path provided!');
          }
          const parsedData = await SwaggerParser.validate(apiJson);
          if (parsedData){ 

            for (const [path, obj] of Object.entries(apiJson.paths)) {
              for (const [reqType, api] of Object.entries(obj)) {
                if (typeof api !== 'object' || api === null) { continue; }
                  if( (api['x-group-name']) && api['x-proxy-name']){
                    check = true;
                  } else{ 
                    if (!api.hasOwnProperty('x-proxy-name')){ 
                      errorMessage('ZIP GENERATOR'`${fileName} - Missing 'x-proxy-name'`);
                    } 
                    // if (!api.hasOwnProperty('x-group-name')){ 
                    //   errorMessage('ZIP GENERATOR'`${fileName} - Missing 'x-group-name'`);
                    // } 
                    check = false;
                    return;
                  }
              }
            } 
              if (check){ 
                const folder = dir.replace('../reference/','');
                printMessage(`Sub Dir accessed ---${ dir.replace('../reference/','')}`); 
               if (folder === '../reference'){
                  zip.addFile(file.name, Buffer.from(content, "utf8"), 'Adding folders');
               }
               else {
                  zip.addFile(`${folder}/${file.name}`, Buffer.from(content, "utf8"), 'Adding file');  
               }  

               if (args[0]?.includes("/")){
                downloadFile = args[0].split('/').pop(); 
                downloadFile= downloadFile+"_spec"
               }else{
                downloadFile = 'tennat_spec';  
               }
                await zip.writeZip(`${args}/assets/${downloadFile}.zip`); 
                printMessage(`File downloaded ---${file.name}`); 
              } 
          } 
        } catch (e) {
          errorMessage('ZIP GENERATOR', e.message);
        }
      }else{
        errorMessage('ZIP GENERATOR', 'Invalid subdir or file extension.');
      }
    });  
 
  }); 
};


try {
  printMessage(`External Dir ---->>> ${args}`);   
  if ( args?.length > 0){ 
  generateZipCollection(folder);
  }else{
    errorMessage('ZIP GENERATOR','No Path for reference dir. defined');
 }
} catch (e) {
  errorMessage('ZIP GENERATOR',e.message);
}
