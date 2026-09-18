# Lite JS XML Parser

A (Work in progress) simple and light XML parser and editor for Node.js

> [!WARNING]
> This project is still in development, make sure to backup your XML files and make diffs on the original and output to avoid data loss and errors
> 
> Report bugs and errors [here](https://github.com/TinyVirtual/lite-js-xml-parser/issues)

[![License: MIT](https://shields.io/badge/License-MIT-blue)](https://opensource.org)
![Status: Pre-Alpha](https://img.shields.io/badge/Status-Pre--alpha-orange)
![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FTinyVirtual%2Flite-js-xml-parser%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.version&prefix=Version&label=Version&color=blue)

----

## Features:
| Feature | Description | Coverage |
| --- | --- | --- | 
| Elements | Elements such as `<a>` | 90% |
| Attributes | Attributes such as `<a attribute="">`, featuring line breaks, escapes and empty attributes | 75% |
| Self Closing | Elements like `<meta />` | 90% |
| Comments | Comments like `<!-- This is a comment -->` | 90% |
| CDATA | Cdatas like `<![CDATA[ Data ]]>` | 85% |
| Entities | Entities like `<!DOCTYPE html>` | 10% |
| Escape | Escapes like `\&quot;` | 75% |
| HTML Support | Support to editing HTML files (limited, to edit HTML files, make **SURE** they are with correct syntax, my parser is not made to html and is not forgiving) | 35% |
| Namespaces | Namespaces like `<ns:element/>` are considered tag name, and namespaces in attributes like `ns:attribute=""` are considered attribute name | 15% |
| White space preserving | Preserves white space in relevant places such as inside attributes and inside elements | 65% |
| Processing Instructions | Instructions like `<?xml version="1.0" encoding="UTF-8"?>` | 85% |
| Error Handling | Not currently implemented, requires testing and contributions | 2.5% |

## Instalation:
You can install it by running
```bash
npm install @tinyvirtual/lite-js-xml-parser
```
> * Note: this is a ES Module

## Usage: 

Here is an example to replace every comment from a xml file with a &lt;comment&gt; element
```js
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
```

Here is the diff file:
```diff
--- my-xml.xml	2026-09-18 11:11:11.890277595 -0300
+++ my-xml-modified.xml	2026-09-18 11:23:38.842891102 -0300
@@ -2,7 +2,7 @@
 
 <root>
     <val>
-        <!-- This person has logged on recently -->
+        <comment> This person has logged on recently </comment>
         <name>Sarah</name>
         <age>19</age>
         <money>
@@ -16,13 +16,13 @@
         </friends>
     </val>
     <val>
-        <!-- This person hasn't logged on in 28 months -->
+        <comment> This person hasn't logged on in 28 months </comment>
         <name>Luca</name>
         <age>21</age>
         <money>
             <currency type="dollar">112</currency>
             <currency type="euro">0.8</currency>
-            <!-- Money purse has been deactivated -->
+            <comment> Money purse has been deactivated </comment>
         </money>
         <friends>
             <friend name="Sarah"/>
```

## Todo:

Right now I still have some goals to reach and achieve in this project:
- [X] Minimally functional
- [ ] Extend support
- [ ] More functions and methods
- [ ] Better error handling support
- [ ] Rename variables in code to be more understandable
- [ ] Better API closer to Browsers JS DOM WebAPI
- [ ] Throw errors on invalid XML file instead of outputting weird file

## Reference:

Here is a little reference for you to start using it

### parseXml
- Type: Function
- Syntax: `parseXml(xml: string, settings?: {preserveBlank?: boolean, isHtml?: boolean}): XmlDocument`

This function turns an XML string into an XML structure you can manipulate.

`preserveBlank` controls whether whitespace is preserved and defaults to `true`.
Set it to `false` to normalize the document when it is serialized. `isHtml` enables
HTML parsing rules, including HTML void elements, and defaults to `false`.

### XmlDocument
- Type: Class
- Constructor: `new XmlDocument(children?: Array)`

This class wraps the top-level nodes from the XML document. A parsed HTML document
may contain internal `HtmlElement` nodes, which use the same core element API.

Properties:
- `children: Array<XmlElement|XmlTextNode|XmlComment|XmlCDATA|XmlEntity|XmlInstructions>` - Holds the document's top-level nodes.
- `identated: boolean` - Indicates whether the document should be serialized using the nodes' preserved formatting.
Methods:
- `toJsonStruc(): {children: Array}` - Returns a JSON-compatible representation of the document.
- `toRawString(depth?: number, identation?: number): string` - Returns the document without applying `indentXml`.
- `toString(identation?: number): string` - Returns the document as an XML string. The indentation size defaults to four spaces.
- `appendChild(...children): void` - Appends nodes and sets their `parent` to this document.
- `removeChild(child): Array| null` - Removes a node, clears its `parent`, and returns the removed-item array or `null` when it is not present.
- `tagSelector(tag: string): XmlElement|undefined` - Returns the first descendant element with the given tag name.
- `tagSelectorAll(tag: string): XmlElement[]` - Returns every descendant element with the given tag name.

### XmlElement
- Type: Class
- Constructor: `new XmlElement(tag: string, attributes?: XmlAttributes[], parent?, children?: Array)`

Represents an XML element. `XmlElement` is also the base class for the HTML elements
created when `isHtml` is enabled.

Properties:
- `tag: string` - The element tag name.
- `attributes: XmlAttributes[]` - The element attributes.
- `children: Array` - The child nodes.
- `parent: XmlDocument|XmlElement|null` - The parent node.
- `type: string` - Usually `Element`.
- `selfClosing: boolean` - Whether the element is serialized as self-closing.
- `isRaw: boolean` - Whether preserved formatting is used for this node.

Methods:
- `setParent(parent): void` - Moves the element under a new parent.
- `appendChild(...children): void` - Adds children and sets their parent.
- `removeChild(child): Array| null` - Removes one child and returns the removed-item array or `null`.
- `clearChild(filter?: string|((child) => boolean)): XmlElement[]` - Removes children matching a tag name or callback.
- `removeParent(): void` - Detaches the element from its parent.
- `toJsonStruc(): object` - Returns the element and its descendants as JSON-compatible data.
- `toString(depth?: number, identation?: number): string` - Serializes the element.
- `tagSelector(tag: string): XmlElement|undefined` - Finds the first descendant with a tag name.
- `tagSelectorAll(tag: string): XmlElement[]` - Finds all descendants with a tag name.
- `attributeSelector(name: string): XmlAttributes|undefined` - Finds an attribute by name.
- `getAttribute(name: string): string|null` - Returns an attribute value.
- `setAttribute(name: string, value?: string): XmlAttributes` - Adds or updates an attribute.
- `removeAttribute(name: string): boolean` - Removes an attribute and reports whether it existed.
- `hasAttribute(name: string): boolean` - Checks whether an attribute exists.

Example:
```js
const root = xmlDocument.tagSelector('root')
const name = root.tagSelector('name')
name.setAttribute('data-id', '42')
console.log(name.children[0].content)
```

### XmlAttributes
- Type: Class
- Constructor: `new XmlAttributes(name: string, value?: string)`

Represents an element or processing-instruction attribute.

Properties:
- `name: string` - The attribute name.
- `value: string|null` - The attribute value. An attribute without a value is `null`.

### Text and markup nodes
The following classes can be imported and appended to an element with `appendChild`.

- `XmlTextNode(content: string)` - Ordinary text. Its `content` is unescaped and `rawContent` is the source text.
- `XmlComment(comment: string)` - A `<!-- comment -->` node.
- `XmlCDATA(content: string)` - A `<![CDATA[content]]>` node.
- `XmlEntity(entity: string, value: string)` - An entity such as `<!DOCTYPE html>`.
- `XmlInstructions(tag: string, attributes?: XmlAttributes[])` - A processing instruction such as `<?xml version="1.0"?>`.

All text and markup nodes provide `toJsonStruc()` and `toString(depth?, identation?)`.
They also expose `type`, `parent`, and `removeParent()`.

### indentXml
- Type: Function
- Syntax: `indentXml(xml: string, identation?: number, config?: {lineEnding?: string}): string`

Formats an XML string that is not already indented. `identation` defaults to four
spaces. `config.lineEnding` accepts Unix (`lf`), Windows (`crlf`), or classic Mac
(`cr`) names as well as the corresponding newline values.

### Imports:
```js
import {
  indentXml, parseXml, XmlAttributes,
  XmlCDATA, XmlComment, XmlDocument,
  XmlElement, XmlEntity, XmlInstructions,
  XmlTextNode
} from '@tinyvirtual/lite-js-xml-parser'
```

or

```js
import * as XML from '@tinyvirtual/lite-js-xml-parser'
```

## Contribution:

To contribute, please [contact me](https://discord.com/users/1505726165405405205) or [open a issue](https://github.com/TinyVirtual/lite-js-xml-parser/issues)

## License

[MIT License](LICENSE) © 2026 TinyVirtual