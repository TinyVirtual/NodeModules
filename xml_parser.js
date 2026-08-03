
/**
 * Escape a string with XAML encoding
 * @param {String} str - String to escape
 * @returns {String} - The escaped string
 */
function xmlEscape(str){
    return str.replaceAll('&','&amp;')
            .replaceAll('"','&quot;')
            .replaceAll('<','&lt;')
            .replaceAll('>','&gt;')
            .replaceAll("'",'&apos;')
            
}
/**
 * Unescape a string from XAML encoding
 * @param {String} str - String to unescape
 * @returns {String} - The unescaped string
 */
function xmlUnescape(str){
    return str.replaceAll('&amp;',"&")
            .replaceAll('&quot;','"')
            .replaceAll('&lt;','<')
            .replaceAll('&gt;',">")
            .replaceAll('&apos;',"'")
            .replaceAll(/&#((x[a-fA-F0-9]{1,6})|[0-9]{1,6});/gu,l=>{
                let m = l.replace(/&#|;/g,'') 
                if(m[0] == 'x'){
                    return String.fromCodePoint(+('0'+m))
                } else {
                    return String.fromCodePoint(+m)
                }
            })
}

class ParseError extends Error {
    /**
     * Makes a new ParseError
     * @param {String} message - Error description
     * @returns {ParseError} - The error
     */
    constructor(message) {
        super(message);
        this.name = "ParseError";
    }
}
class GenericTextXmlTag {

    /**
     * Creates a new Generic XML text element
     * @param {String} text - The text content
     */
    constructor(text) {
        this.content = xmlUnescape(text)
        this.rawContent = text
        this.parent = null
        this.type = "Generic"
        this.isRaw = false
        this.textTag = ['','']
    }

    /**
     * Removes the parent of a element
     */
    removeParent = function(){
        if(this.parent){
            this.parent.children = this.parent.children.filter(v=>v!=this)
            this.parent = null
        }
    }

    /**
     * Turns element into a JSON compatible structure
     * @returns {Object} - The JSON compatible structure
     */
    toJsonStruc = function(){
        return {
            content: this.content,
            textElementType: this.type
        }
    }

    /**
     * Turn this node into a XML String
     * @param {Number} [depth] - The depth of current node
     * @param {Number} [identation] - Ammount of identation
     * @returns 
     */
    toString = function(depth=0,identation=4){
        return (this.isRaw?(' ').repeat(((depth>0)?depth:0)*identation):'')+this.textTag[0]+this.rawContent+this.textTag[1]
    }
}

class XmlAttributes {

    /**
     * Creates a new XML Attribute object
     * @param {String} name - The name of the attribute
     * @param {String} [value] - The value of the tag
     */
    constructor(name,value="") {
        this.name = name
        this.value = value
    }
}


class XmlTextNode extends GenericTextXmlTag {

    /**
     * Creates a new XML text node
     * @param {String} content - The text content 
     */
    constructor(content) {
        super(content)
        this.type = 'TextNode'
    }
}
class XmlCDATA extends GenericTextXmlTag {

    /**
     * Creates a new XML CDATA Element
     * @param {String} content - The content of the CDATA code 
     */
    constructor(content) {
        super(content)
        this.textTag = ['<![CDATA[',']]>']
        this.type = 'CDATA'
    }
}
class XmlEntity extends GenericTextXmlTag {

    /**
     * Creates a new XML entity node (Supports only basic single entities)
     * @param {String} entity - The entity type 
     * @param {String} value - The entity value 
     */
    constructor(entity,value) {
        super(entity+' '+value)
        this.textTag = ['<!','>']
        this.type = 'Entity'

        this.entity = entity
        this.value = value
    }

    /**
     * Turns element into a JSON compatible structure
     * @returns {Object} - The JSON compatible structure
     */
    toJsonStruc = function(){
        return {
            textElementType: this.type,
            entity: this.entity,
            value: this.value
        }
    }

    /**
     * Turn this node into a XML String
     * @param {Number} [depth] - The depth of current node
     * @param {Number} [identation] - Ammount of identation
     * @returns 
     */
    toString = function(depth=0,identation=4){
        return this.textTag[0]+this.entity+' '+this.value+this.textTag[1]
    }
}

class XmlComment extends GenericTextXmlTag {

    /**
     * Creates a new XML Comment Element
     * @param {String} comment - The content of the Comment Node 
     */
    constructor(comment) {
        super(comment)
        this.textTag = ['<!--','-->']
        this.type = 'Comment'
    }
}
class XmlInstructions {

    /**
     * Creates a new XML Instruction Element
     * @param {String} tag - The tag of the instruction
     * @param {XmlAttributes[]} [attributes=[]] - The Attributes to add
     */
    constructor(tag,attributes=[]) {
        this.textTag = ['<?','?>']
        this.type = 'Instructions'
        this.parent = null
        this.tag = tag
        this.attributes = (attributes&&attributes.length)?[...attributes]:[]
    }

    /**
     * Removes the parent of a element
     */
    removeParent = function(){
        if(this.parent){
            this.parent.children = this.parent.children.filter(v=>v!=this)
            this.parent = null
        }
    }

    /**
     * Turns element into a JSON compatible structure
     * @returns {Object} - The JSON compatible structure
     */
    toJsonStruc = function(){
        return {
            textElementType: this.type,
            tag: this.tag,
            attributes: this.attributes.map(l=>({name:l.name,value:l.value}))
        }
    }

    /**
     * Turn this node into a XML String
     * @param {Number} [depth] - The depth of current node
     * @param {Number} [identation] - Ammount of identation
     * @returns 
     */
    toString = function(depth=0,identation=4){
        return this.textTag[0]+this.tag+(this.attributes.map(k=>' '+k.name+(k.value?('="'+xmlEscape(k.value)+'"'):"")).join(('')))
        +this.textTag[1]
    }
}

class XmlElement {
    /**
     * Creates a new XML element
     * @param {String} tag - the Tag of the element
     * @param {XmlAttributes[]} [attributes] - The attributes of the element
     * @param {XmlElement} [parent] - The parent of this element
     * @param {XmlElement[]} [children] - All the child attached to this node
     */
    constructor(tag,attributes=[],parent,children=[]) {
        this.tag = tag
        this.attributes = (attributes ?? []).length?[...attributes]:[]
        this.content = ''
        this.selfClosing = false
        this.isHtml = false
        this.children = []
        this.parent = parent || null
        this.isRaw = false

        if(parent){
            parent.appendChild(this)
        }
        if(children && children.length){
            this.appendChild(...children)
        }
    }
    /**
     * Defines the parent of this node
     * @param {XmlElement} parent 
     */
    setParent = function(parent){
        this.removeParent()
        parent?.appendChild(this)
    }

    /**
     * Turns element into a JSON compatible structure
     * @returns {Object} - The JSON compatible structure
     */
    toJsonStruc = function(){
        return {
            tag: this.tag,
            children: this.children.map(l=>l.toJsonStruc()),
            attributes: this.attributes.map(att=>({name:att.name,value:att.value})),
            selfClosing: this.selfClosing
        }
    }

    /**
     * Turn this node into a XML String
     * @param {Number} [depth] - The depth of current node
     * @param {Number} [identation] - Ammount of identation
     * @returns 
     */
    toString = function(depth=0,identation=4){
        let m

        let identatedStart = this.isRaw?(' '.repeat(((depth>0)?(depth):0)*identation)):''
        let identated = this.isRaw?(' '.repeat(((depth>0)?(depth+1):0)*identation)):''
        let ln = this.isRaw?'\n':''
        let lnB = ln
        
        let head = identatedStart+`<${this.tag}${
            this.attributes.map(l=>' '+l.name+((typeof l.value == 'string')?('="'+xmlEscape(l.value)+'"'):'')).join('')
        }${
            (
                this.selfClosing && !this.isHtml
            )?'/':''}>`
        if(this.selfClosing){
            return head
        }

        let closure = identatedStart+`</${this.tag}>`

        if(this.children.length == 1 && typeof this.children[0].type == 'string' && this.children[0].type == 'TextNode'){
            ln=lnB=''
            identated=''

            closure = `</${this.tag}>`
        }
 
        let childsStrings = [];
        [...this.children].forEach(child=>childsStrings.push([child.toString(depth+1,identation),child]));
        childsStrings = childsStrings.map(l=>{
            if(typeof l[1].type == 'string' && l[1].type == 'TextNode') l[0]=identated+l[0]
            return l
        }).map(l=>l[0]).join(ln)
        
        //.replaceAll(/([\p{L}\p{N}.,:+?!]<(?!\/)|(?<!\/([\p{L}\p{N}.:\-\s_])*)>[\p{L}\p{N}.,:+?!])/gu,p=>p.split('').join(' '))

        m = head+ln+childsStrings+lnB+closure
        return m//.split('\n').filter(l=>Boolean(l.trim())).join('\n')+'\n'
    }

    /**
     * Appends and defines the parent of given nodes to this element
     * @param  {...XmlElement} childs - The children nodes to append
     */
    appendChild = function(...childs){
        childs.forEach(child=>{
            child.parent = this
            this.children.push(child)
        })
    }
    /**
     * Removes a children from the node
     * @param {XmlElement} child - The children to remove
     * @returns {XmlElement} - The removed element
     */

    removeChild = function(child){
        child.parent = null

        let i = this.children.findIndex(k=>k==child), l = null
        if(i!=-1){
            l = this.children.splice(i,1)
        }
        return l
    }
    /**
     * Removes all children with given callback or tag from a node
     * @param {(condition: XmlElement) => Boolean|String} filter - 
     *   - Funtion: The callback to compare the children in order to remove, will remove is condition is met.
     *   - String: The tag name of the children to filter out.
     * @returns {XmlElement[]} - Removed children
     */
    clearChild = function(filter=(p=>true)){
        if(typeof filter == 'string'){
            let opl = filter
            filter = p=>((typeof p.tag != 'undefined')&&p.tag==opl||false)
        }
        let removed = []
        for(let p of children){
            if(filter(p)){
                removed.push(p)
                p.removeParent()
            }
        }
        return removed
    }
    /**
     * Removes the parent of a element
     */
    removeParent = function(){
        if(this.parent){
            this.parent.children = this.parent.children.filter(v=>v!=this)
            this.parent = null
        }
    }
    /**
     * Returns the first element with desired tag
     * @param {String} tag - The element's tag to select
     * @returns {XmlElement} - The element
     */
    tagSelector = function(tag){
        if(!this.children.length){ return}
        let v = this.children.find(l=>l.tag==tag)
        if(!v){
            v = (()=>{
                for(let i of this.children){
                    if(typeof i.children == "undefined") continue
                    let o = i.tagSelector(tag)
                    if(o){
                        return o
                    }
                }
            })()
        }
        return v
    }
    /**
     * Select every attribute with tag name in this node, (WIP)
     * @param {String} tag - The tag
     * @returns {XmlAttributes[]}
     */
    attributeSelector = function(tag){
        return this.attributes.find(l=>l.name==tag)
    }
    /**
     * Returns the every element with desired tag
     * @param {String} tag - The element's tag to select
     * @returns {XmlElement[]} - The matched elements
     */
    tagSelectorAll = function(tag){
        let childs = [...this.children.filter(l=>l.tag==tag)]

        for(let c of this.children){
            if(typeof c.type !== "string"){
                childs.push(...c.tagSelectorAll(tag))
            }
        }
        return childs
    }
    /**
     * Returns the value of given attribute
     * @param {String} attribute - The attribute name
     * @returns {String|null} - The Attribute value or null if not found
     */
    getAttribute = function(attribute){
        let myAtt = this.attributes.find(a=>a.name==(attribute+''))
        //console.log(this.attributes,attribute,myAtt)
        if(myAtt){
            return myAtt.value
        }
        return null
    }
    /**
     * Sets the attribute with value in this node
     * @param {String} attribute - The attribute name
     * @param {String} [value] - The attribute value
     * @returns {XmlAttribute} - The attrbute setted
     */
    setAttribute = function(attribute,value){
        let myAtt = this.attributes.findIndex(a=>a.name==(attribute+''))
        if(typeof value != 'string' && value != null){
            value +=''
        }
        if(myAtt!=-1){
            this.attributes[myAtt].value = value
            return this.attributes[myAtt]
        } else {
            let att = new XmlAttributes((attribute+''),value)
            this.attributes.push(att)
            return att
        }
    }
    /**
     * Removes an attribute from this node
     * @param {String} attribute - The name of the attribute to remove
     * @returns {Boolean} - Returns ```true``` if the element was successfully removed
     */
    removeAttribute = function(attribute){
        let myAtt = this.attributes.findIndex(a=>a.name==(attribute+''))
        if(myAtt!=-1){
            let oldVal = this.attributes[myAtt].value
            this.attributes = this.attributes.filter(x=>x.name!=(attribute+''))
            return true
        } else {
            return false
        }
    }
    /**
     * Checks whether this element has given attribute or not
     * @param {String} attribute - Attribute name to check
     * @returns {Boolean} - ```true``` if the attribute exists
     */
    hasAttribute = function(attribute){
        return !!this.attributes.find(a=>a.name==attribute)
    }
}

class HtmlElement extends XmlElement {
    /**
     * Creates a new HTML element, it's just like the XML element, but with a bit more flavour
     * @param {...String|XmlAttributes[]|XmlElement|XmlElement[]} sup - 
     *   @param {String} tag - the Tag of the element
     *   @param {XmlAttributes[]} [attributes] - The attributes of the element
     *   @param {XmlElement} [parent] - The parent of this element
     *   @param {XmlElement[]} [children] - All the child attached to this node
     */
    constructor(...sup){
        super(...sup)
    }

    /**
     * Gets the _(first)_ element with designed id
     * @param {String} id - The id of the element
     * @returns {XmlElement|HtmlElement} - The element
     */
    getElementById = function(id){
        if(!this.children.length){ return}
        let v = this.children.find(l=>l.id==id)
        if(!v){
            v = (()=>{
                for(let i of this.children){
                    if(typeof i.children == "undefined") continue
                    let o = i.getElementById(id)
                    if(o){
                        return o
                    }
                }
            })()
        }
        return v
    }
    /**
     * Returns an array of elements matching a class name
     * @param {String} elementClass - The matching class name
     * @returns {XmlElement[]|HtmlElement[]} A array of elements with that class
     */
    getElementsByClass = function(elementClass){
        let childs = [...this.children.filter(l=>l.classList.includes(elementClass))]

        for(let c of this.children){
            if(typeof c.type !== "string"){
                childs.push(...c.getElementsByClass(elementClass))
            }
        }
        return childs
    }
    classList = {
        /**
         * Add classes to the element
         * @param  {...String} clases - The classes to add to this element
         */
        add: function(...clases){
            this.attributes.setAttribute('class',(this.attributes.getAttribute('class')||"")+" "+clases.join(' '))
        },
        /**
         * Revoke classes from the element
         * @param  {...String} clases - The classes to remove from this element
         */
        remove: function(...clases){
            this.attributes.setAttribute('class',(this.attributes.getAttribute('class').split(' ').filter(l=>!clases.includes(l)).join(' ')))
        },
        /**
         * Defines the entire class list to a string of classes separated by spaces
         * @param {String} value - The class list to set
         */
        set: function(value){
            this.attributes.setAttribute('class',value)
        }
    }

    get id (){
        return this.getAttribute('id')
    }
    set id (id){
        this.setAttribute('id',id)
    }

    get style (){
        return this.getAttribute('style')
    }
    set style (style){
        this.setAttribute('style',style)
    }
}

let htmlEnclose = [
    'img','meta','area','br','hr','embed','input','link','param','source','track','wbr','col'
]

let rawNodes = [
    [XmlCDATA,['<![CDATA[',']]>']], [XmlComment,['<!--','-->']]
]
let rawTags = [
    'script', 'style', 'textarea', 'plaintext'
]

let rawTagsRegxp = (()=>{
    let me = {}
    for(let k of rawTags){
        me[k] = ({
            start: new RegExp('<\\s*'+k+'[\\s>]+','gu'),
            end: new RegExp('<\\s*/\\s*'+k+'\\s*>','gu'),
            head: (new RegExp('<\\s*'+k+'\\s*((\\s+[\\p{L}\\p{N}_\\.:\\-]+)(="([\\u0000-\\u0021\\u0023-\\u{10FFFF}]+)?")?\\s*)*\\s*/?\\s*>','gu'))
        })
    }
    return me
})();

let attributeRegexp = /(?<=\s)([\p{L}\p{N}_\.:\-]+)(="([\u0000-\u0021\u0023-\u{10FFFF}]+)?")?\/?(?=[\s?>])/gu;

class XmlDocument {
    constructor(children) {
        this.documentTags = []
        this.children = []
        this.parent = null
        this.identated = false

        if(children && children.length){
            this.appendChild(...children)
        }
    }

    toJsonStruc = function(){
        return {
            children: this.children.map(l=>l.toJsonStruc()),
            documentTags: []
        }
    }

    toRawString = function(depth=0,identation=4){
        //console.log(this.children)
        return this.children.map(l=>l.toString(depth+1, identation)).join('')
    }
    toString = function(identation){
        if(this.identated){
            return this.children.map(l=>l.toString(1, identation)).join('')
        }
        return indentXml(this.toRawString(),identation)
    }

    appendChild = function(...childs){
        childs.forEach(child=>{
            child.parent = this
            this.children.push(child)
        })
    }
    removeChild = function(child){
        child.parent = null

        let i = this.children.findIndex(k=>k==child), l = null
        if(i!=-1){
            l = this.children.splice(i,1)
        }
        return l
    }
    tagSelector = function(tag){
        if(!this.children.length){ return}
        let v = this.children.find(l=>l.tag==tag)
        if(!v){
            v = (()=>{
                for(let i of this.children){
                    if(typeof i.children == "undefined") continue
                    let o = i.tagSelector(tag)
                    if(o){
                        return o
                    }
                }
            })()
        }
        return v
    }
    tagSelectorAll = function(tag){
        let childs = [...this.children.filter(l=>l.tag==tag)]

        for(let c of this.children){
            if(typeof c.type !== "string"){
                childs.push(...c.tagSelectorAll(tag))
            }
        }
        return childs
    }
}

function xmlToElement(xml,settings={preserveBlank:true,isHtml:false}){
    let pover = 0
    let depth = 0
    let elements = [], pilds = []
    let doc = new XmlDocument
    let lastTag = ""
    let active = null

    let preserveBlank = !!settings.preserveBlank
    doc.identated = !!settings.preserveBlank
    let isHtml = !!settings.isHtml

    let constr = isHtml?HtmlElement:XmlElement

    let xovial = xml.split('<').filter(l=>!!(l.trim())).map(k=>'<'+k)
    xml = ''

    xovial = xovial.filter(Boolean)

    mainNoverLoop:
    for(let nover in xovial){
        let og = xovial[+nover][preserveBlank?"trimStart":"trim"]()
        if(!og){
            xovial[+nover] = ''
            continue
        }
        let tag = og[preserveBlank?"trimStart":"trim"]().split('>').map((k,i,j)=>((i!=j.length-1)?(k+'>'):k)).filter(Boolean)
        let realTag = tag[0].match(/(?<=<([\s]*[/])?[\s]*)[\w:\._-]+(?=[\s\/>])/u)?.[0]
        let attributes = [...tag[0].matchAll(attributeRegexp)].map(k=>new XmlAttributes(k[1],
            (typeof k[2] == 'string')?
            (xmlUnescape(k[3]||''))
            :null))
        

        if(realTag && realTag?.toLowerCase() == 'html'){
            isHtml = true
            constr = HtmlElement
        }
        
        if(tag[0].startsWith('<?') && tag[0].endsWith('?>')){
            (active||doc).appendChild(new XmlInstructions(tag[0].match(/(?<=<\?)[\p{L}\p{N}\-_\.:]+/u)[0],attributes))
            let content = tag.splice(1).join('\n')
            if(content) {
                if(!preserveBlank){
                    content = content.trim()
                }
                let textElement = new XmlTextNode(content);
                (active||doc).appendChild(textElement)
            }
            xovial[+nover] = ''
            continue
        }
        /*
        if(tag[0].startsWith('<!--') && tag[0].endsWith('-->')){
            (active||doc).appendChild(new XmlComment(tag[0].replaceAll(/<!--|-->/g,'') ))

            let content = tag.splice(1).join('\n')
            if(content) {
                if(!preserveBlank){
                    content = content.trim()
                }
                let textElement = new XmlTextNode(content);
                (active||doc).appendChild(textElement)
            }
            continue
        }
        if(og.startsWith('<![CDATA[')){
            let overs = []
            for(let _yover = nover; _yover < xovial.length; _yover++){
                let goover = xovial[_yover]
                overs.push(goover.split(']]>')[0]+']]>')
                xovial[_yover] = ''
                if(goover.includes(']]>')){
                    xovial[_yover] = '';

                    (active||doc).appendChild(new XmlCDATA(overs.join('\n').replaceAll(']]>','').replaceAll('<![CDATA[','')))

                    if(goover.split(']]>')[1]){
                        let textElement = new XmlTextNode(goover.split(']]>')[1]);
                        (active||doc).appendChild(textElement)
                    }
                
                    break
                }
            }
            //console.log(overs)
            
            continue
        }
        */


        for(let kon of rawNodes){
            if(og.startsWith(kon[1][0])){
                let overs = []
                for(let _yover = nover; _yover < xovial.length; _yover++){
                    let goover = xovial[_yover]
                    overs.push(goover.split(kon[1][1])[0]+kon[1][1])
                    xovial[_yover] = ''
                    if(goover.includes(kon[1][1])){
                        xovial[_yover] = '';
                        let kment = new kon[0](overs.join('').replaceAll(kon[1][1],'').replaceAll(kon[1][0],''));

                        (active||doc).appendChild(kment)
                        //console.log(kon,kment)

                        if(goover.split(kon[1][1])[1][preserveBlank?'charAt':'trim'](0)){
                            let textElement = new XmlTextNode(goover.split(kon[1][1])[1]);
                            (active||doc).appendChild(textElement)
                        }
                        

                        xovial[+nover] = ''
                        continue mainNoverLoop
                    }
                }
            }
        }



        for(let scron of rawTags){
            let rgxp = rawTagsRegxp[scron].start
            if(rgxp.test(og)){
                let overs = []
                let endRgxp = rawTagsRegxp[scron].end
                
                for(let _yover = nover; _yover < xovial.length; _yover++){
                    let goover = xovial[_yover]
                    overs.push(goover)
                    if(goover.match(endRgxp)){
                        overs = overs.filter(l=>!endRgxp.test(l)).map(l=>l.replace(rawTagsRegxp[scron].head,''))
                        //overs[overs.length-1] += '';


                        let scrChl = new constr(scron,attributes)
                        let scrTxt = new XmlTextNode(overs.join(''))
                        scrChl.appendChild(scrTxt);
                        (active||doc).appendChild(scrChl)

                        let leftOver = goover.split(endRgxp).splice(1).join('')
                        if(leftOver[(preserveBlank?'charAt':'trim')](0)){
                            let loTxt = new XmlTextNode(leftOver);
                            (active||doc).appendChild(loTxt)
                        }
                        //if(overs.length>1){
                        //console.log(scrChl.toString())}
                        xovial[+_yover] = ''
                        continue mainNoverLoop
                    } else {
                        xovial[+_yover] = ''
                    }
                }

            }
        }


        if(tag[0].startsWith('<!') && !tag[0].startsWith('<!--')){
            let pav = [...(tag[0].replaceAll(/<!|>/g,'') ).split(' ')]
            let nam = pav[0]
            let entity = new XmlEntity(nam,pav.splice(1).join(' '));
            (active||doc).appendChild(entity)
            if(nam.toUpperCase()+','+entity.value.toUpperCase() == "DOCTYPE,HTML"){
                isHtml = true
            }


            let content = tag.splice(1).join('')
            if(content) {
                if(!preserveBlank){
                    content = content.trim()
                }
                let textElement = new XmlTextNode(content);
                (active||doc).appendChild(textElement)
            }

            xovial[+nover] = ''
            continue
        }

        let isClosing = /^<\s*\//.test(tag[0])

        if(tag[0]=='</'){
            if(tag.length > 1){
                tag[0] = tag[0]+tag[1]
            } else {
                throw new ParseError('Error 0xC000: Missing closure tag')
            }
        } 

        let selfClosing = /\/\s*>/.test(tag[0])

        if(isHtml && htmlEnclose.includes(realTag)){
            selfClosing = true
        }
        

        if(!selfClosing){
            pover -= (tag[0].startsWith('</')*2)-1
        }

        if(tag[0].startsWith('</')){
            depth = pover+1
        } else {
            depth = pover
        }

        if(selfClosing){
            depth++
        }



        if(!selfClosing){
            if(!isClosing){
                let xml_elemt = new constr(realTag,attributes,active,[])
                xml_elemt.isRaw = !preserveBlank
                if(depth == 1){
                    doc.appendChild(xml_elemt)
                }
                //console.log(attributes)
                let content = tag.splice(1).join('')
                if(content) {
                if(!preserveBlank){
                    content = content.trim()
                }
                    let textElement = new XmlTextNode(content)
                    xml_elemt.appendChild(textElement)

                }
                active = xml_elemt
                lastTag = realTag
            } else {
                let content = tag.splice(1).join('')
                active = active.parent
                if(content) {
                if(!preserveBlank){
                    content = content.trim()
                }
                    let textElement = new XmlTextNode(content)
                    active.appendChild(textElement)
                }
            }
        } else {
            let xml_elemt = new constr(realTag,attributes,active,[])
            xml_elemt.isRaw = !preserveBlank
            xml_elemt.selfClosing = true
            xml_elemt.isHtml = isHtml
            if(depth == 1){
                doc.appendChild(xml_elemt)
            }
            let content = tag.splice(1).join('')
            if(content) {
                if(!preserveBlank){
                    content = content.trim()
                }
                let textElement = new XmlTextNode(content)
                active.appendChild(textElement)
            }
        }
        xovial[+nover] = ''
        //console.log('  '.repeat(depth)+(" /"[+isClosing])+realTag+(" /"[+selfClosing]),depth)
    }
    if(depth < 1){
        console.error("Depth Error: Unknown Error")
    }
    return doc
}

function indentXml(xml,identation=4,config={}){

    let xovial = xml.trim().split('<').filter(l=>!!(l.trim())).map(k=>'<'+k)
    let depth = 0
    let pover = 0
    let ln = '\n'

    lineIdentification:
    if(typeof config.lineEnding !== 'undefined'){
        let lkupUnix = 'unix,linux,lf,\\n,\n,0,undefined, ,'.split(',')
        let lkupDos = 'dos,windows,crlf,\\r\\n,\r\n,win,win32,windows 11,windows 10,windows11,windows10'.split(',')
        let lkupCr = 'macintosh,classic mac,classicmac,cr,\\r,\r,legacy mac,legacimac'.split(',')

        for(let m of lkupUnix){
            if((config.lineEnding+'')==m){
                ln = '\n'
                break lineIdentification;
            }
        }
        for(let m of lkupDos){
            if((config.lineEnding+'')==m){
                ln = '\r\n'
                break lineIdentification;
            }
        }
        for(let m of lkupCr){
            if((config.lineEnding+'')==m){
                ln = '\r'
                break lineIdentification;
            }
        }
    }
    
    xovial = xovial.filter(Boolean)

    let mapol = []


    for(let nover in xovial){
        let og = xovial[+nover]
        let tag = og.trim().split('>').map((k,i,j)=>((i!=j.length-1)?(k+'>'):k)).filter(Boolean)
        let realTag = tag[0].match(/(?<=<([\s]*[/])?[\s]*)[\w:\._-]+(?=[\s\/>])/u)?.[0]
        
        for(let scron of rawTags){
            let rgxp = rawTagsRegxp[scron].start
            if(rgxp.test(og)){
                tag.map((k,i)=>((i)?(k+'>'):k))
            }
        }

        let vaqbra = true

        if(tag[0].startsWith('<!') || tag[0].startsWith('<?')){
            mapol.push(ln+' '.repeat(((depth>0)?depth:0)*identation)+og+'')
            continue
        }


        let isClosing = /^<\s*\//.test(tag[0])
        if(isClosing){
            tag[1]=' '+tag[1]
        }

        if(tag[0]=='</'){
            if(tag.length > 1){
                tag[0] = tag[0]+tag[1]
            } else {
                throw new ParseError('Error 0xC000: Missing closure tag')
            }
        } 

        let selfClosing = /\/\s*>/.test(tag[0])

        if(htmlEnclose.includes(realTag) && !selfClosing){
            selfClosing = true
        }
        

        if(!selfClosing){
            pover -= (tag[0].startsWith('</')*2)-1
        }

        if(tag[0].startsWith('</')){
            depth = pover+1
            if(!xovial[(+nover)-1].endsWith('>') && !rawTags.includes(realTag)){
                vaqbra = false
            }
        } else {
            depth = pover
        }

        if(selfClosing){
            depth++
        }
        try {
            mapol.push((vaqbra?ln+(' '.repeat(((depth>0)?(depth-1):0)*identation)):'')+og)
        } catch(e) {
            e.message += '\n\n\twith depth='+depth+' and identation='+identation+';'
            throw e
        }
    }
    return mapol.filter(g=>!!g.replaceAll(ln,'').trim()).join('').trim()+ln
}

export {indentXml, xmlToElement as parseXml, XmlAttributes, XmlCDATA, XmlComment, XmlDocument, XmlElement, XmlEntity, XmlInstructions, XmlTextNode}
//*/