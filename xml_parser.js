
function xmlEscape(str){
    return str.replaceAll('&','&amp;')
            .replaceAll('"','&quot;')
            .replaceAll('<','&lt;')
            .replaceAll('>','&gt;')
            .replaceAll("'",'&apos;')
            
}
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
    constructor(message) {
        super(message);
        this.name = "ParseError";
    }
}
class GenericTextXmlTag {
    constructor(text) {
        this.content = xmlUnescape(text)
        this.rawContent = text
        this.parent = null
        this.type = "Generic"
        this.isRaw = false
        this.textTag = ['','']
    }

    removeParent = function(){
        if(this.parent){
            this.parent.children = this.parent.children.filter(v=>v!=this)
            this.parent = null
        }
    }

    toJsonStruc = function(){
        return {
            content: this.content,
            textElementType: this.type
        }
    }

    toString = function(depth=0,identation=4){
        return (this.isRaw?(' ').repeat(((depth>0)?depth:0)*identation):'')+this.textTag[0]+this.rawContent+this.textTag[1]
    }
}

class XmlAttributes {
    constructor(name,value) {
        this.name = name
        this.value = value
    }
}


class XmlTextNode extends GenericTextXmlTag {
    constructor(sup) {
        super(sup)
        this.type = 'TextNode'
    }
}
class XmlCDATA extends GenericTextXmlTag {
    constructor(sup) {
        super(sup)
        this.textTag = ['<![CDATA[',']]>']
        this.type = 'CDATA'
    }
}
class XmlEntity extends GenericTextXmlTag {
    constructor(entity,value) {
        super(entity+' '+value)
        this.textTag = ['<!','>']
        this.type = 'Entity'

        this.entity = entity
        this.value = value
    }
    toJsonStruc = function(){
        return {
            textElementType: this.type,
            entity: this.entity,
            value: this.value
        }
    }

    toString = function(depth=0,identation=4){
        return this.textTag[0]+this.entity+' '+this.value+this.textTag[1]
    }
}

class XmlComment extends GenericTextXmlTag {
    constructor(sup) {
        super(sup)
        this.textTag = ['<!--','-->']
        this.type = 'Comment'
    }
}
class XmlInstructions {
    constructor(tag,attributes=[]) {
        this.textTag = ['<?','?>']
        this.type = 'Instructions'
        this.parent = null
        this.tag = tag
        this.attributes = (attributes&&attributes.length)?[...attributes]:[]
    }

    removeParent = function(){
        if(this.parent){
            this.parent.children = this.parent.children.filter(v=>v!=this)
            this.parent = null
        }
    }
    toJsonStruc = function(){
        return {
            textElementType: this.type,
            tag: this.tag,
            attributes: this.attributes.map(l=>({name:l.name,value:l.value}))
        }
    }

    toString = function(depth=0,identation=4){
        return this.textTag[0]+this.tag+(this.attributes.map(k=>' '+k.name+(k.value?('="'+xmlEscape(k.value)+'"'):"")).join(('')))
        +this.textTag[1]
    }
}

class XmlElement {
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

    setParent = function(parent){
        this.removeParent()
        parent?.appendChild(this)
    }

    toJsonStruc = function(){
        return {
            tag: this.tag,
            children: this.children.map(l=>l.toJsonStruc()),
            attributes: this.attributes.map(att=>({name:att.name,value:att.value})),
            selfClosing: this.selfClosing
        }
    }

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
    removeParent = function(){
        if(this.parent){
            this.parent.children = this.parent.children.filter(v=>v!=this)
            this.parent = null
        }
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
    attributeSelector = function(tag){
        return this.attributes.find(l=>l.name==tag)
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
    getAttribute = function(attribute){
        let myAtt = this.attributes.find(a=>a.name==(attribute+''))
        //console.log(this.attributes,attribute,myAtt)
        if(myAtt){
            return myAtt.value
        }
        return null
    }
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
    removeAttribute = function(attribute){
        let myAtt = this.attributes.findIndex(a=>a.name==(attribute+''))
        if(myAtt!=-1){
            let oldVal = this.attributes[myAtt].value
            this.attributes = this.attributes.filter(x=>x.name!=(attribute+''))

        } else {
            return false
        }
    }
    hasAttribute = function(attribute){
        return !!this.attributes.find(a=>a.name==attribute)
    }
}

class HtmlElement extends XmlElement {
    constructor(...sup){
        super(...sup)
        this.classList = this.getAttribute('class')
        this.id = this.getAttribute('id')
        this.style = this.getAttribute('style')
    }

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
    getElementsByClass = function(clas){
        let childs = [...this.children.filter(l=>l.classList.includes(clas))]

        for(let c of this.children){
            if(typeof c.type !== "string"){
                childs.push(...c.getElementsByClass(clas))
            }
        }
        return childs
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