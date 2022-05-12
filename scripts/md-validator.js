#!/usr/bin/env node

const showdown = require('showdown');
const fs = require('fs'); 
const markdownlint = require("markdownlint");
const args = process.argv.slice(2); 
const folder = args?.[0]+"/docs";
const { enrichHTMLFromMarkup, showdownHighlight, mdExtension } = require('./utils/md-utils'); 
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

const generateZipCollection = async (dir) => { 

    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      files.forEach(async file => { 
        if (file.isDirectory()) {
          generateZipCollection(`${dir}/${file.name}`);
        } else if (/\.md$/.test(file.name)){ 
          try {
            let fileName = `${dir}/${file.name}`;
            const content = fs.readFileSync(fileName, 'utf8'); 
            //const htmlData = converter.makeHtml(content); 
  const options = {
    "files": [ "/Users/f2zdirk/Desktop/WRKSPACE/remote-actions/docs/getting-started.md" ],
  };
  
  const result = markdownlint.sync(options);
  console.log(result.toString());
          } catch (e) {
            failValidation(e.message);
          }
        }else{
          failValidation('Invalid subdir or file extension.');
        }
      });   
    });  
};


try {
  console.log(`External Dir ---->>> ${args}`);   
 if ( args?.length > 0){ 
  generateZipCollection(folder); 
 }else{  
  failValidation('No Path for docs dir. defined');
 }
} catch (e) {
  failValidation(e.message);
}
