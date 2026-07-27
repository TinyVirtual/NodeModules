import fs from 'fs';
import path from 'path';

class LocalDatabase {
    constructor(name='Database'){
        this.name = name
        this.folder = process.cwd()+'/JsonDB/'+name.replaceAll(/[^\w\-]/g,'-')+'/'

        if(!fs.existsSync(this.folder)){
            console.log('Folder '+this.folder+' doesn\'t exists. Creating new one')
            fs.mkdirSync(this.folder,{recursive:true})
        }

        this.orchestrator = []

        if(fs.existsSync(this.folder+'orchestrator.json')){
            this.orchestrator = JSON.parse(fs.readFileSync(this.folder+'orchestrator.json','utf-8'))
        } else {
            console.log('Orchestrator JSON not found. creating new one')
            fs.writeFileSync(this.folder+'orchestrator.json','[]')
            this.orchestrator = []
        }
    }

    setItem = function(key,value){
        let thisId = this.orchestrator.length.toString(16).padStart(8,'0')

        let pd = this.orchestrator.findIndex(p=>p.formal==key)
        if(pd!=-1){
            thisId = pd.toString(16).padStart(8,'0')
        }

        if(!fs.existsSync(this.folder+thisId.substring(0,2)+'/')){
            fs.mkdirSync(this.folder+thisId.substring(0,2)+'/',{recursive:true})
        }
        let fName = this.folder+thisId.substring(0,2)+'/'+thisId+'.json'
        fs.writeFileSync(fName,JSON.stringify(value))
        if(pd==-1){
            this.orchestrator.push({formal:key,path:fName,id:thisId})
        }
        fs.writeFileSync(this.folder+'orchestrator.json',JSON.stringify(this.orchestrator))
    }
    getItem = function(key){
        let thisId = this.orchestrator.findIndex(p=>p.formal==key)
        //console.log(this.orchestrator)
        if(thisId!=-1){
            let jsonContent = fs.readFileSync(this.orchestrator[thisId].path,'utf-8')
            return JSON.parse(jsonContent)
        } 
        return null
    }
}

export {LocalDatabase}