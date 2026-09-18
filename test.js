const { execSync } = require("child_process");
const XML = require("./index.js");
const fs = require('fs');

// SVG 
let svg = (XML.parseXml(fs.readFileSync('./tests/test.svg', 'utf-8'),{preserveBlank:true}))
fs.writeFileSync('./tests/test.reparsed.svg',(svg.toString()))
try{ execSync('diff -u ./tests/test.svg ./tests/test.reparsed.svg > ./tests/svg.diff') } catch {}
if(fs.readFileSync('./tests/svg.diff','utf8') == ''){
    console.log('[TESTS]: Success on svg')
} else {
    console.log('[TESTS]: Fail on svg')
}

// XML 
let xml = (XML.parseXml(fs.readFileSync('./tests/test.xml', 'utf-8'),{preserveBlank:true}))
fs.writeFileSync('./tests/test.reparsed.xml',(xml.toString()))
try{ execSync('diff -u ./tests/test.xml ./tests/test.reparsed.xml > ./tests/xml.diff') } catch {}
if(fs.readFileSync('./tests/xml.diff','utf8') == ''){
    console.log('[TESTS]: Success on xml')
} else {
    console.log('[TESTS]: Fail on xml')
}