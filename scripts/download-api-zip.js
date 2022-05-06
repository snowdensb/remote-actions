#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');
const SwaggerParser = require('@apidevtools/swagger-parser');
const AdmZip = require("adm-zip");
const args = process.argv.slice(2);
console.log(`External Dir ---->>> ${args}`); 
const folder = args?.[0]+"/reference";
let zip = new AdmZip(); 
const failValidation = (message) => {
  console.log('------------------------- ZIP GENERATOR FAILED --------------------------')
  console.log(message)
};
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
            failValidation('No path provided!');
          }
          const parsedData = await SwaggerParser.validate(apiJson);
          if (parsedData){ 
              const folder = dir.replace('../reference/','');
             console.log(`Sub Dir accessed ---${ dir.replace('../reference/','')}`); 
      
            if (folder === '../reference'){
               zip.addFile(file.name, Buffer.from(content, "utf8"), "entry comment goes here"); 
            } 
            else {
               zip.addFile(`${folder}/${file.name}`, Buffer.from(content, "utf8"), "entry comment goes here");  
            }  
             downloadFile = 'tennat_spec';   
             await zip.writeZip(`${args}/assets/${downloadFile}.zip`); 
             console.log(`File downloaded ---${file.name}`); 
          } 
        } catch (e) {
          failValidation(e.message);
        }
      }
    });  
 
  }); 
};


try {
  generateZipCollection(folder);
} catch (e) {
  failValidation(e.message);
}
