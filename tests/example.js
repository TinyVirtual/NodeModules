import { parseXml, XmlElement, XmlTextNode } from '@tinyvirtual/lite-js-xml-parser';
import fs from 'node:fs';

// Load the XML file string
const xmlString = fs.readFileSync('./my-xml.xml', 'utf-8')

// Convert the string to XML data structure
let xmlDocument = parseXml(xmlString,{preserveBlank:true})

// Function to convert comments to elements
function convertComments(element){
    element.children = element.children.map(child=>{
        console.log(child.type)
        // When we reach a comment
        if(child.type == "Comment"){
            // Creates a new element with "comment" tag name
            let commentElement = new XmlElement("comment")
            // Add a new child of text node type with the raw content inside
            commentElement.appendChild(new XmlTextNode(child.rawContent))
            // Return the comment element to the parent element
            return commentElement
        } 
        // In case we reach another element
        else if(child.type == "Element"){
            // Process recursivelly the children
            convertComments(child)
        }
        // Returns the original element if not matched
        return child
    })
}

// Run the conversion
convertComments(xmlDocument)

// Write the modified XML to file
fs.writeFileSync('./my-xml-modified.xml',(xmlDocument.toString()))