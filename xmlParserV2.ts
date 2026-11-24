/**
 * Unescape a string from XAML encoding
 * @param {String} str - String to unescape
 * @returns {String} - The unescaped string
 */
function xmlUnescape(str: string): string{
    return str.replaceAll('&amp;',"&")
            .replaceAll('&quot;','"')
            .replaceAll('&lt;','<')
            .replaceAll('&gt;',">")
            .replaceAll('&apos;',"'")
            .replaceAll(/&#((x[a-fA-F0-9]{1,6})|[0-9]{1,6});/gu,(l:string)=>{
                let m = l.replace(/&#|;/g,'') 
                if(m[0] == 'x'){
                    return String.fromCodePoint(+('0'+m))
                } else {
                    return String.fromCodePoint(+m)
                }
            })
}
/**
 * Escape a string with XAML encoding
 * @param {String} str - String to escape
 * @returns {String} - The escaped string
 */
function xmlEscape(str: string): string{
    return str.replaceAll('&','&amp;')
            .replaceAll('"','&quot;')
            .replaceAll('<','&lt;')
            .replaceAll('>','&gt;')
            .replaceAll("'",'&apos;')
            
}

enum NodeType {
    INVALID = "Unknown",
    TEXT = "TextNode",
    COMMENT = "Comment",
    CDATA = "CData",
    INSTRUCTION = "Instruction",
    ENTITY = "Entity",
    ELEMENT = "Element"
}

interface XmlAttributes {
    name: string,
    value: string
}

class XTextNode {
    contents: string
    parent: any

    constructor(contents: string){
        this.contents = contents
    }
    static type: NodeType.TEXT = NodeType.TEXT;
}

class XElement {
    children: Array<XElement|XTextNode>;
    parent: XElement|null;

    constructor(children: Array<XElement|XTextNode>|undefined,parent: XElement|undefined){
        this.children = children||[];
        this.parent = parent||null;
    }
    static type: NodeType.ELEMENT = NodeType.ELEMENT;

}