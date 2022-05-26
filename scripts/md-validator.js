#!/usr/bin/env node

const showdown = require('showdown');
const fs = require('fs'); 
const markdownlint = require("markdownlint");
const args = process.argv.slice(2); 
const folder = args?.[0]+"/docs";
const { enrichHTMLFromMarkup, showdownHighlight, mdExtension } = require('./utils/md-utils'); 
const html_validator = require('html-validator')

const failValidation = (message) => {
  console.log('------------------------- MD VALIDATOR FAILED --------------------------')
  console.log(message)
};
const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    emoji: true,
    disableForced4SpacesIndentedSublists: true,
    literalMidWordUnderscores: true,
    tables: true,
    extensions: [enrichHTMLFromMarkup(), showdownHighlight, mdExtension],
  });
  converter.addExtension(() => {
    return [
      {
        type: 'output',
        regex: /<a\shref[^>]+>/g,
        replace: function (text) {
          const url = text.match(/"(.*?)"/)[1];
          if (url.startsWith('http:') || url.startsWith('https:')) {
            return '<a href="' + url + '" target="_blank">';
          }
          return text;
        },
      },
    ];
  }, 'externalLink');

const markdownlinter = async (dir) => {  
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      files.forEach(async file => { 
        if (file.isDirectory()) {
          markdownlinter(`${dir}/${file.name}`);
        } else if (/\.md$/.test(file.name)){ 
          try {
            let fileName = `${dir}/${file.name}`;   
              const options = { 
                "files": [ fileName],  
                "config": {
                    "default": true,
                    "no-hard-tabs": false,
                    "whitespace": false,
                    "line_length": false,
                }
              };
            const result = markdownlint.sync(options);
            if (result.toString().length > 0){ 
              failValidation(`PLEASE CHECK FOLLOWING LINTER ISSUES WITHIN THE FILE : ${fileName}`);
              console.log(result);
            }else{
              console.log(`${fileName} - PASSED`);
            }
          } catch (e) {
            failValidation(e.message);
          }
        }else{
          failValidation('Invalid subdir or file extension.');
        }
      });   
    });  
};

const markdownValidator= async (dir) => {  
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    files.forEach(async file => { 
      if (file.isDirectory()) {
        markdownValidator(`${dir}/${file.name}`);
      } else if (/\.md$/.test(file.name)){ 
        try {
          let fileName = `${dir}/${file.name}`; 
          const content = fs.readFileSync(fileName, 'utf8'); 
          const htmlData = converter.makeHtml(content);   
          console.log(htmlData);
          const options = {
            validator: 'WHATWG',
            data: htmlData,
            isFragment: true
          }
          const result = await html_validator(options)
          console.log(`************************************************************************************************************************************
          **********************************************************************************************************************************************`); 
          console.log(result);
        } catch (e) {
          failValidation(e.message);
        }
      }else{
        failValidation('Invalid subdir or Not a markdown file.');
      }
    });   
  });  
};

try {
  console.log(`External Dir ---->>> ${args}`);   
 if ( args?.length > 0){ 
  markdownlinter(folder); 
  //markdownValidator(folder);
 }else{  
  failValidation('No Path for docs dir. defined');
 }
} catch (e) {
  failValidation(e.message);
}
