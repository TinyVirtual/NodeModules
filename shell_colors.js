if(typeof globalThis.document == 'object'){
    console.log('You are using a browser console, things might not show as expected! This is meant to be run in a terminal console.')
    window.process = {
        stdout: {
            write: console.log,
            columns: 127
        },
        argv: ['','','']
    }
}

const __ANSI_CODES = {
    __Internal__RGB__Foreground: '\x1b[38;2;R;G;Bm',
    __Internal__RGB__Background: '\x1b[48;2;R;G;Bm',
    Reset: '\x1b[0m\x1b[22m\x1b[24m\x1b[27m',
    Bold: '\x1b[1m',
    Underline: '\x1b[4m',
    Reverse: '\x1b[7m',
    Foreground: {
        Black: '\x1b[30m',
        Red: '\x1b[31m',
        Green: '\x1b[32m',
        Yellow: '\x1b[33m',
        Blue: '\x1b[34m',
        Magenta: '\x1b[35m',
        Cyan: '\x1b[36m',
        LightGray: '\x1b[37m',

        DarkGray: '\x1b[90m',
        LightRed: '\x1b[91m',
        LightGreen: '\x1b[92m',
        LightYellow: '\x1b[93m',
        LightBlue: '\x1b[94m',
        LightMagenta: '\x1b[95m',
        LightCyan: '\x1b[96m',
        White: '\x1b[97m',
    },
    Background: {
        Black: '\x1b[40m',
        Red: '\x1b[41m',
        Green: '\x1b[42m',
        Yellow: '\x1b[43m',
        Blue: '\x1b[44m',
        Magenta: '\x1b[45m',
        Cyan: '\x1b[46m',
        LightGray: '\x1b[47m',

        DarkGray: '\x1b[100m',
        LightRed: '\x1b[101m',
        LightGreen: '\x1b[102m',
        LightYellow: '\x1b[103m',
        LightBlue: '\x1b[104m',
        LightMagenta: '\x1b[105m',
        LightCyan: '\x1b[106m',
        White: '\x1b[107m',
    }
}

let __LoadingStyles = {
    __Replacer: "*",
    Colors: {
        Fire: "FF0000,FFFF00,FFFF00,FF0000",
        Aqua: "4C61FF,0CFBFF,0CFBFF,4C61FF",
        Galaxy: "4DFFDB,4DFFDB,4FB9FF,3B76FF,BE3DFF,FF0DF3,F05FFB,4DFFDB",
        Soft: "ff0f7b,f89b29,f89b29,ff0f7b",
        TokTiks: "ff1b6b,45caff,45caff,ff1b6b"
    },
    Capsule: {
        "Default": [
            '\x1b[0m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━^┓',
            '┃ \x1b[33m# \x1b[32m\x1b[1mLoading... * \x1b[34mXXXX \x1b[0m┃',
            '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━^┛\x1b[0m',
            '[*] @'
        ],
        "Double": [
            '\x1b[0m╔═════════════════════════════^╗',
            '║ \x1b[33m# \x1b[32m\x1b[1mLoading... * \x1b[34mXXXX \x1b[0m║',
            '╚═════════════════════════════^╝\x1b[0m',
            '[*] @'
        ],
        "Simple": [
            '','',
            '\x1b[33m# \x1b[32m\x1b[1mLoading... * \x1b[34mXXXX \x1b[0m',
            '[*] @'
        ],
    },
    __CapsuleExt: {
        "Default": ['━','*','━',''],
        "Double": ['═','*','═',''],
        "Simple": ['*','']
    },
    Rotating: {
        "Mini": "-\\|/",
        "Node": "⠋⠙⠸⢰⣠⣄⡆⠇",
        "Tetris": "⠁⠂⠄⡀⡀⡈⡙⡲⣤⣤⣬⣾⣾⣿⣿ ⣿ ⣿ ⠉⠓⠧⣆⣆⣎⣞⣿⣿ ⣿ ⣿ ⠉⠛⠾⣴⣴⣵⣿⣿ ⣿ ⣿ ",
        "Dropping": "⠁⠂⠄⡀⡀⡈⡐⡠⣀⣀⣁⣂⣄⣄⣌⣔⣤⣤⣥⣦⣦⣮⣶⣶⣷⣷⣿⣿ ⣿ ",
        "Numbers": "0123456789",
        "Arrows": "↖↑↗→↘↓↙←",
        "Floating": "⠁⠂⠄⡀⡀⠄⠂⠁⠁",
        "Sliding": "⠁⠉⠊⠒⠔⠤⡠⣀⢀⢁",
        "Spinning": "◜◠◝◞◡◟"
    },
    Filler: {
        "Default":"█░",
        "Shade": "▓ ",
        "Min": "#-"
    }
}


let __LoadingStatus = {
    Loading: false,
    LoadingStatus: 0,
    Phase: 0,
    RotatingPhase: 0,
    LoadingStyle: "Double",
    RotatingStyle: "Dropping",
    Filler: "Default",
    Color: "Galaxy",
    Message: "Loading...",
    Log: []
}

let __CurrentStyle = {
    Color: "\x1b[97m",
    Background: "\x1b[40m",
    Bold: false,
    Underline: false,
    Reset: true,
    Debug: false
}

function shellLoadingSetStyle(target,style){
    if(__LoadingStatus.Loading){
        __LoadingStatus.Log.push(['Attempt to change style occured!',(new Date()).toISOString().substring(11,19)])
        return
    }
    let comp = {
        'Colors':'Color',
        'Capsule':'LoadingStyle',
        'Rotating':'RotatingStyle',
        'Filler':'Filler'
    }
    if(comp[target] && __LoadingStyles[target][style]){
        __LoadingStatus[comp[target]] = style
    }
}

class ShellDitator {
    constructor(){
        this.__color = "White"
        this.__background = "Black"
        this.__bright = false
        this.__brightBg = false
        this.__bold = false
        this.__underline = false
        this.__lines = []
    }

    #buildString = function(str){
        return __ANSI_CODES.Foreground[(this.__bright?'Light':'')+this.__color]+
            __ANSI_CODES.Background[(this.__brightBg?'Light':'')+this.__background]+
            (this.__bold?__ANSI_CODES.Bold:'')+
            (this.__underline?__ANSI_CODES.underline:'')+
            ((typeof str == "string")?str:(
                (typeof str == 'undefined')?'':JSON.stringify(str)
            ))
    }

    red = function(str){
        this.__color = 'Red'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    green = function(str){
        this.__color = 'Green'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    blue = function(str){
        this.__color = 'Blue'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    black = function(str){
        this.__color = 'Black'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }

    magenta = function(str){
        this.__color = 'Magenta'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    cyan = function(str){
        this.__color = 'Cyan'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    yellow = function(str){
        this.__color = 'Yellow'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    white = function(str){
        this.__color = 'White'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }

    bright = function(){
        this.__bright = !this.__bright
        return this
    }



    redBg = function(str){
        this.__background = 'Red'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    greenBg = function(str){
        this.__background = 'Green'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    blueBg = function(str){
        this.__background = 'Blue'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    blackBg = function(str){
        this.__background = 'Black'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }

    magentaBg = function(str){
        this.__background = 'Magenta'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    cyanBg = function(str){
        this.__background = 'Cyan'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    yellowBg = function(str){
        this.__background = 'Yellow'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }
    whiteBg = function(str){
        this.__background = 'White'
        if(str){
            this.__lines.push(this.#buildString(str))
        }
        return this
    }

    brightBg = function(){
        this.__brightBg = !this.__brightBg
        return this
    }


    bold = function(){
        this.__bold = !this.__bold
        return this
    }
    underline = function(){
        this.__underline = !this.__underline
        return this
    }

    reset = function(){
        this.__color = "White"
        this.__background = "Black"
        this.__bright = false
        this.__brightBg = false
        this.__bold = false
        this.__underline = false
        if(this.__lines.length){
            this.__lines[(this.__lines.length-1)]+=__ANSI_CODES.Reset
        }
        return this
    }

    exec = function(){
        process.stdout.write(this.__lines.join(' ')+__ANSI_CODES.Reset+'\r\n')
        this.reset()
        this.__lines = []
        return this
    }
}

function shellSetColor(color_name){
    __CurrentStyle.Color = __ANSI_CODES.Foreground[color_name] || __ANSI_CODES.Foreground.White
    return this
}
function shellSetBackground(color_name){
    __CurrentStyle.Background = __ANSI_CODES.Background[color_name] || __ANSI_CODES.Background.White
    return this
}
function shellToggleBold(boolean){
    __CurrentStyle.Bold = !!boolean
    return this
}
function shellToggleUnderline(boolean){
    __CurrentStyle.Underline = !!boolean
    return this
}
function shellResetStyle(){
    __CurrentStyle = {
        Color: "\x1b[97m",
        Background: "\x1b[40m",
        Bold: false,
        Underline: false,
        Reset: true
    }
    return this
}

function shellSetRgbColor(color){
    switch(typeof color){
        case 'object':
            if(Array.isArray(color) && color.length == 3 && !isNaN((+color[0]+color[1]+color[2])) ){
                __CurrentStyle.Color = __ANSI_CODES.__Internal__RGB__Foreground
                    .replace('R',+color[0])
                    .replace('G',+color[1])
                    .replace('B',+color[2])
            } else if ((color.RED && color.GREEN && color.BLUE) && !isNaN((+color.RED+color.GREEN+color.BLUE))){
                __CurrentStyle.Color = __ANSI_CODES.__Internal__RGB__Foreground
                    .replace('R',+color.RED)
                    .replace('G',+color.GREEN)
                    .replace('B',+color.BLUE) 
            }
        break
        case 'string':
            if( [3,6].find(l=>l== color.replace('#','').length )){
                let col = color.replace('#','')
                col=col.split("")
                if(col.length == 6){
                    col = [
                        col[0]+col[1],
                        col[2]+col[3],
                        col[4]+col[5]
                    ]
                } else {
                    col = col.map(l=>l+l)
                }
                col=col.map(l=>+('0x'+l))
                __CurrentStyle.Color = __ANSI_CODES.__Internal__RGB__Foreground
                    .replace('R',+col[0])
                    .replace('G',+col[1])
                    .replace('B',+col[2])
            }
        break
    }
    return this
}

function shellSetRgbBackground(color){
    switch(typeof color){
        case 'object':
            if(Array.isArray(color) && color.length == 3 && !isNaN((+color[0]+color[1]+color[2])) ){
                __CurrentStyle.Background = __ANSI_CODES.__Internal__RGB__Background
                    .replace('R',+color[0])
                    .replace('G',+color[1])
                    .replace('B',+color[2])
            } else if ((color.RED && color.GREEN && color.BLUE) && !isNaN((+color.RED+color.GREEN+color.BLUE))){
                __CurrentStyle.Background = __ANSI_CODES.__Internal__RGB__Background
                    .replace('R',+color.RED)
                    .replace('G',+color.GREEN)
                    .replace('B',+color.BLUE) 
            }
        break
        case 'string':
            if( [3,6].find(l=>l== color.replace('#','').length )){
                let col = color.replace('#','')
                col=col.split("")
                if(col.length == 6){
                    col = [
                        col[0]+col[1],
                        col[2]+col[3],
                        col[4]+col[5]
                    ]
                } else {
                    col = col.map(l=>l+l)
                }
                col=col.map(l=>+('0x'+l))
                __CurrentStyle.Background = __ANSI_CODES.__Internal__RGB__Background
                    .replace('R',+col[0])
                    .replace('G',+col[1])
                    .replace('B',+col[2])
            }
        break
    }
    return this
}

let deleteLastLine = ()=>{
    if(process){
        process.stdout.write('\x1b[1A');
        process.stdout.write('\x1b[2K');
        process.stdout.write('\r');
    }
    return this
}

let debug = []

let loadingBasis = function(is_start){
        if(__LoadingStatus.Loading && is_start){
            shell.loading.update(__LoadingStatus.LoadingStatus,'\x1b[38;2;255;255;0m[SC WARN]: Cannot start loading, it\'s already running!')
        }

        __LoadingStatus.Loading = is_start
        if(!is_start){
            shell.info((__LoadingStatus.LoadingStatus>=100)?"Loading Complete!":"Loading Stopped...")
        } else {
            console.log("\n".repeat(__LoadingStyles.Capsule[__LoadingStatus.LoadingStyle].length+1))
        }

        (async function(){
            while(__LoadingStatus.Loading){
                let Capsule = __LoadingStyles.Capsule[__LoadingStatus.LoadingStyle]
                for(let u in [...Capsule]){deleteLastLine()}


                
                let hat_len = Math.max(32,Math.min(90,(process.stdout.columns-12)*0.8333))-31;
                let repl_len = Math.max(9,9+(hat_len));

                let Loadings = __LoadingStyles.Rotating[__LoadingStatus.RotatingStyle]
                let ThisLoading = Loadings[Math.floor(__LoadingStatus.RotatingPhase)]

                __LoadingStatus.RotatingPhase = (__LoadingStatus.RotatingPhase+1) % Loadings.length

                __LoadingStatus.Phase = (__LoadingStatus.Phase+1) % repl_len
                
                let Filler = __LoadingStyles.Filler[__LoadingStatus.Filler]
                let FillerDone = (Filler[0].repeat(
                                    Math.ceil(repl_len*(Math.max(Math.min(__LoadingStatus.LoadingStatus,100),0)/100))
                                ) + 
                                Filler[1].repeat(
                                    repl_len-(Math.ceil(repl_len*(Math.max(Math.min(__LoadingStatus.LoadingStatus,100),0)/100)))
                                )).split("")


                let Colors = __LoadingStyles.Colors[__LoadingStatus.Color].split(",") ;
                

                Colors.forEach((a,i)=>{
                    Colors[i] = {
                        red : parseInt(a.slice(0,2),16),
                        grn : parseInt(a.slice(2,4),16),
                        blu : parseInt(a.slice(4,6),16),
                    };
                })


                let FinalColors = []
                for(let i in [...FillerDone]){
                    i=+i
                    let ThisStep = (i/FillerDone.length)

                    let SurroundingColors = [
                        (Math.floor(ThisStep*(Colors.length-1))),
                        Math.min(Math.floor(ThisStep*(Colors.length-1))+1,Colors.length-1)
                    ]
                    let MyColor = (ThisStep*(Colors.length-1)) %1
                    

                    
                    FinalColors[i] = `\x1b[38;2;${
                        Math.round(lerp(Colors[SurroundingColors[0]].red,Colors[SurroundingColors[1]].red,MyColor))
                    };${
                        Math.round(lerp(Colors[SurroundingColors[0]].grn,Colors[SurroundingColors[1]].grn,MyColor))
                    };${
                        Math.round(lerp(Colors[SurroundingColors[0]].blu,Colors[SurroundingColors[1]].blu,MyColor))
                    }m`

                }
                if(debug.length<-1){
                debug.push(FinalColors)
                }   
                for(let i in [...FillerDone]){
                    i=+i
                    FillerDone[i] = FinalColors[Math.round((__LoadingStatus.Phase+i))%FinalColors.length]+FillerDone[i]
                    //imo.push([i,Math.round((__LoadingStatus.Phase+i))%FinalColors.length,(__LoadingStatus.Phase)])
                }

                Capsule = Capsule.map(l=>l.replace("#",ThisLoading) )
                Capsule.forEach((a,i)=>{
                    if(a.includes(__LoadingStyles.__Replacer)){
                        Capsule[i] = a.replace(__LoadingStyles.__Replacer,
                            FillerDone.join("")+__ANSI_CODES.Reset
                        ).replace("XXXX",((__LoadingStatus.LoadingStatus%1000)+"%").padEnd(4," ")).replaceAll(__LoadingStyles.__Replacer,'')
                    }
                    if(a.includes("[*] @")){
                        Capsule[i] = a.replace("[*] @",`[${(new Date()).toISOString().substring(11,19)}] ${__LoadingStatus.Message.substring(0,Math.max(8,hat_len))+"..."}`)
                    }
                    if(a.includes('^')){
                        Capsule[i] = Capsule[i].replace('^',__LoadingStyles.__CapsuleExt[__LoadingStatus.LoadingStyle][i]?.repeat(hat_len))
                    }
                })

                for(let i of Capsule){
                    console.log(i)
                }
                await new Promise(r=>setTimeout(r,80))
            } 
            for(let i of __LoadingStatus.Log){
                console.log(__ANSI_CODES.Foreground.Blue+`[${i[1]} LOADING LOG]: `+i[0]+__ANSI_CODES.Reset)
            }
            __LoadingStatus.Log = []
        })()
    }

function lerp(a, b, t){
    return a + (b - a) * t
}

let quickConf = {
    color: "White",
    background: "Black",
    bold: false,
    underline: false,
}

let shell = {
    log: function(...data){
        console.log(
            __CurrentStyle.Color+
            __CurrentStyle.Background+
            (
                (__CurrentStyle.Bold && __ANSI_CODES.Bold || "")+
                (__CurrentStyle.Underline && __ANSI_CODES.Underline || "")+
                (__CurrentStyle.Reverse && __ANSI_CODES.Reverse || "")
            )+
            [...data].join(" ")+__ANSI_CODES.Reset
        )
        return this
    },
    // rgb(31, 179, 199)
    debug: function(...data){
        console.log("\x1b[4;38;2;31;179;199m["+(new Date()).toISOString().substring(11,19)+" DEBUG]: "+[...data].map(l=>(typeof l == 'string'?l:JSON.stringify(l))).join(" ")+__ANSI_CODES.Reset)
        return this
    },
    warn: function(...data){
        console.log("\x1b[38;2;255;224;0m["+(new Date()).toISOString().substring(11,19)+" WARN]: "+[...data].map(l=>(typeof l == 'string'?l:JSON.stringify(l))).join(" ")+__ANSI_CODES.Reset)
        return this
    },
    error: function(...data){
        console.log("\x1b[38;2;255;0;0m["+(new Date()).toISOString().substring(11,19)+" ERROR]: "+[...data].map(l=>(typeof l == 'string'?l:JSON.stringify(l))).join(" ")+__ANSI_CODES.Reset)
        return this
    },
    info: function(...data){
        console.log("\x1b[38;2;48;121;255m["+(new Date()).toISOString().substring(11,19)+" INFO]: "+[...data].map(l=>(typeof l == 'string'?l:JSON.stringify(l))).join(" ")+__ANSI_CODES.Reset)
        return this
    },
    delete: deleteLastLine,
    loading: {
        start: _=>loadingBasis(true),
        update: function(progress,message=""){
            __LoadingStatus.LoadingStatus = progress
            if(message && message != __LoadingStatus.Message){
                __LoadingStatus.Message = message
                __LoadingStatus.Log.push([message,(new Date()).toISOString().substring(11,19)])
            }
        },
        stop: _=>loadingBasis(false),
        getProgress: ()=>__LoadingStatus.LoadingStatus,
        setStyle: shellLoadingSetStyle,
        getStyle: ()=>({
            'Capsule':__LoadingStatus.LoadingStyle,
            'Colors':__LoadingStatus.Color,
            'Rotating': __LoadingStatus.RotatingStyle,
            'Filler': __LoadingStatus.Filler
        }),
        getAllStyles: ()=>{
            shell.log(
            __ANSI_CODES.Reset+'\t\x1b[1;32mLoading Styles:\x1b[0m\n\t- '+
            Object.keys(__LoadingStyles).map((l,i)=>(!l.startsWith('__')?(__ANSI_CODES.Foreground.Cyan+l+': '+__ANSI_CODES.Foreground.White+(Object.keys(__LoadingStyles[l])?.join(', '))):'')).filter(Boolean).join(';\n\t- ')
            )
        }
    },
    setRgbBackground: shellSetRgbBackground,
    setRgbColor: shellSetRgbColor,
    resetStyle: shellResetStyle,
    toggleUnderline: shellToggleUnderline,
    toggleBold: shellToggleBold,
    setBackground: shellSetBackground,
    setColor: shellSetColor,
    setDebug: (value)=>{
        if(typeof value == 'undefined'){
            __CurrentStyle.Debug = !__CurrentStyle.Debug
        } else {
            __CurrentStyle.Debug = !!value
        }
    },
    Codes: __ANSI_CODES,
    ShellDitator: ShellDitator
}

shell.parseString = function(string,...contents){
    for(let i in contents){
        string = string.replaceAll('$%s'+i,(typeof contents[i] == 'string')?contents[i]:JSON.stringify(contents[i]))
            .replaceAll('$%f'+i,+contents[i])
            .replaceAll('$%d'+i,+contents[i]|0)
            .replaceAll('$%b'+i,"0b"+(+contents[i]|0).toString(2).padStart(8,'0'))
            .replaceAll('$%x'+i,"0x"+(+contents[i]|0).toString(16).padStart(8,'0'))
            .replaceAll('$%o'+i,"0o"+(+contents[i]|0).toString(8))
            .replaceAll('$%v'+i,!!contents[i])
    }
    string = string.replace(/\$%[a-z]\d{1,10}/g,'??')
    return string
}


shell.gradient = (function(_colors,_text){
    let text = [..._text], colors = _colors;
    if(typeof _colors == 'string'){
        colors = _colors.split(',')
    }

    colors=colors.map(a=>{
        let u = a.trim().replace('#','')
        if(u.length == 3){
            u=u.split('').map(l=>l+l).join("")
        }
        return u
    })
    colors.forEach((a,i)=>{
        colors[i] = {
            red : parseInt(a.slice(0,2),16),
            grn : parseInt(a.slice(2,4),16),
            blu : parseInt(a.slice(4,6),16),
        };

        if(Number.isNaN(colors[i].red)||Number.isNaN(colors[i].grn)||Number.isNaN(colors[i].blu)){
        colors[i] = {
            red : 0,
            grn : 0,
            blu : 0,
        };
        }
    })
    
    for(let sub in text){
        let mypos = sub/text.length,
        mycols = [Math.floor(mypos*(colors.length-1)), Math.min( Math.floor(mypos*(colors.length-1))+1,colors.length-1)],
        mystep = (mypos*(colors.length-1))%1

        text[sub] = "\x1b[38;2;"
        +Math.round(lerp(colors[mycols[0]].red,colors[mycols[1]].red,mystep))+";"
        +Math.round(lerp(colors[mycols[0]].grn,colors[mycols[1]].grn,mystep))+";"
        +Math.round(lerp(colors[mycols[0]].blu,colors[mycols[1]].blu,mystep))
        +"m"+text[sub]
    }
    
    return (text.join('')+__ANSI_CODES.Reset)
})

shell.gradientExt = (function(_colors,_backgrounds,_text){
    let text = [..._text], colors = _colors, bgs = _backgrounds
    if(typeof _colors == 'string'){
        colors = _colors.split(',')
    }    
    if(typeof _backgrounds == 'string'){
        bgs = _backgrounds.split(',')
    }

    colors=colors.map(a=>{
        let u = a.trim().replace('#','')
        if(u.length == 3){
            u=u.split('').map(l=>l+l).join("")
        }
        return u
    })
    colors.forEach((a,i)=>{
        colors[i] = {
            red : parseInt(a.slice(0,2),16),
            grn : parseInt(a.slice(2,4),16),
            blu : parseInt(a.slice(4,6),16),
        };

        if(Number.isNaN(colors[i].red)||Number.isNaN(colors[i].grn)||Number.isNaN(colors[i].blu)){
        colors[i] = {
            red : 0,
            grn : 0,
            blu : 0,
        };
        }
    })
    bgs=bgs.map(a=>{
        let u = a.trim().replace('#','')
        if(u.length == 3){
            u=u.split('').map(l=>l+l).join("")
        }
        return u
    })
    bgs.forEach((a,i)=>{
        bgs[i] = {
            red : parseInt(a.slice(0,2),16),
            grn : parseInt(a.slice(2,4),16),
            blu : parseInt(a.slice(4,6),16),
        };

        if(Number.isNaN(bgs[i].red)||Number.isNaN(bgs[i].grn)||Number.isNaN(bgs[i].blu)){
        bgs[i] = {
            red : 0,
            grn : 0,
            blu : 0,
        };
        }
    })
    
    for(let sub in text){
        let mypos = sub/text.length,
        mycols = [Math.floor(mypos*(colors.length-1)), Math.min( Math.floor(mypos*(colors.length-1))+1,colors.length-1)],
        mystep = (mypos*(colors.length-1))%1
        
        let mybg = [Math.floor(mypos*(bgs.length-1)), Math.min( Math.floor(mypos*(bgs.length-1))+1,bgs.length-1)],
        mybgstep = (mypos*(bgs.length-1))%1


        text[sub] = "\x1b[38;2;"
        +Math.round(lerp(colors[mycols[0]].red,colors[mycols[1]].red,mystep))+";"
        +Math.round(lerp(colors[mycols[0]].grn,colors[mycols[1]].grn,mystep))+";"
        +Math.round(lerp(colors[mycols[0]].blu,colors[mycols[1]].blu,mystep))
        +"m"+"\x1b[48;2;"
        +Math.round(lerp(bgs[mybg[0]].red,bgs[mybg[1]].red,mybgstep))+";"
        +Math.round(lerp(bgs[mybg[0]].grn,bgs[mybg[1]].grn,mybgstep))+";"
        +Math.round(lerp(bgs[mybg[0]].blu,bgs[mybg[1]].blu,mybgstep))
        +"m"+text[sub]
    }
    
    return (text.join('')+__ANSI_CODES.Reset)
})


shell.help = function(){
    shell.log('# '+shell.gradient(__LoadingStyles.Colors.Galaxy,'Thank you for using shell_colors.js'),
    '\n   '+__ANSI_CODES.Foreground.Cyan+__ANSI_CODES.Underline+'* This is a simple help dialog to minimally help you use this shell cli helper\n'+__ANSI_CODES.Reset+
    __ANSI_CODES.Reset+'\t\x1b[1;32mLoading Styles:\x1b[0m\n\t- '+
    Object.keys(__LoadingStyles).map((l,i)=>(!l.startsWith('__')?(__ANSI_CODES.Foreground.Cyan+l+': '+__ANSI_CODES.Foreground.White+(Object.keys(__LoadingStyles[l])?.join(', '))):'')).filter(Boolean).join(';\n\t- ')+
    ';\n\t\x1b[1;32mColors:\x1b[0m\n\t- '+Object.keys(__ANSI_CODES.Foreground).map((l,i,j)=>l+((i%3==2)?',\n\t- ':(i!=(j.length-1)?', ':';'))).join('')+
    '\n\t\x1b[1;32mFunctions:\x1b[0m\n\t- '+
    [   
        '\x1b[1;35mshell.setColor(color: String)\x1b[0m -> Sets foreground color to set color, ONLY ACCEPTS the colors listed above',
        '\x1b[1;35mshell.setBackground(color: String)\x1b[0m -> Sets background color to set color, ONLY ACCEPTS the colors listed above',
        '\x1b[1;35mshell.toggleUnderline(boolean: Boolean)\x1b[0m -> Enables or disables underline when printing',
        '\x1b[1;35mshell.toggleBold(boolean: Boolean)\x1b[0m -> Enables or disables bold text when printing',
        '\x1b[1;35mshell.setRgbColor(color: (String<"#RRGGBB"> | number[3]) )\x1b[0m -> Sets foreground color to set hex color',
        '\x1b[1;35mshell.setRgbBackground(color: (String<"#RRGGBB"> | number[3]) )\x1b[0m -> Sets background color to set hex color',
        '\x1b[1;35mshell.resetStyle()\x1b[0m -> Resets to default terminal colors',
        '\x1b[1;35mshell.log(...data: any[])\x1b[0m -> Outputs string data, just like console.log(), but with the color set via shell.setColor()',
        '\x1b[1;35mshell.info(...data: any[])\x1b[0m -> Displays a blue info message with timestamp, prefix and colors',
        '\x1b[1;35mshell.warn(...data: any[])\x1b[0m -> Displays a yellow warn message with timestamp, prefix and colors',
        '\x1b[1;35mshell.error(...data: any[])\x1b[0m -> Displays a red error message with timestamp, prefix and colors',
        '\x1b[1;35mshell.delete()\x1b[0m -> Deletes last line output into console',
        '\x1b[1;35mshell.loading.start()\x1b[0m -> Starts Loading box',
        '\x1b[1;35mshell.loading.stop()\x1b[0m -> Finishes and stops Loading box',
        '\x1b[1;35mshell.loading.update(progress: number<0..100>, message: String?)\x1b[0m -> Updates loading progress and display message',
        '\x1b[1;35mshell.loading.getStyle()\x1b[0m -> Gets current loading style, returns a object',
        '\x1b[1;35mshell.loading.setStyle(target: String, style: String)\x1b[0m -> Set style property of loading box to desired style',
        '\x1b[1;35mshell.loading.getAllStyles()\x1b[0m -> Displays every built-in avaliable style',
        '\x1b[1;35mshell.gradient(colors: String<"#RRGGBB">[], text: String)\x1b[0m -> Sets foreground text to display in entered gradient, \n\t   must be either a string of hex colors like "#RRGGBB,#RRGGBB", sepparated by commas, \n\t   or a array of hex colors, like ["#RRGGBB","#RRGGBB"] ',
        '\x1b[1;35mshell.gradientExt(colors: String<"#RRGGBB">[], backgrounds: String<"#RRGGBB">[], text: String)\x1b[0m -> \n\t   Sets foreground and backgrund text to display in \n\t   said gradients, must be either a string of hex colors, sepparated \n\t   by commas, or a array of hex colors, just shown above, \n\t   applies to both background and foreground ',

    ].join('\n\n\t- ')
    )
}

if(['help','-h','?','--help','-?'].includes(process.argv[2])){
    shell.help()
}
if(['-t','--test'].includes(process.argv[2])){
    switch(process.argv[3]){
        case 'loading':
            // Here we make a async function to allow us to wait and then imidiately execute it
            (async()=>{
                // Defines loading box style
                shell.loading.setStyle('Colors','TokTiks')
                shell.loading.setStyle('Capsule','Double')

                // Displays current style table
                // console.log(shell.loading.getStyle()) 

                // Starts the loading box
                shell.loading.start()
                // Sets starter message
                shell.loading.update(0,"Loading something")

                // Wait a bit...
                await new Promise(r=>setTimeout(r,500))

                // Loops variable progress from 0 to 100
                for(let progress = 0; progress <= 105; progress++){
                    // Chooses a message based on progress (not important)
                    let message = [
                        'Loading something','Building schema',
                        'Deploying it','Failure: Reverting changes',
                        'Commiting updates','Clean up','Done!'][0|(progress/18)]

                    // Updates progress with our chosen message
                    shell.loading.update(progress,message)
                    // Waits 5ms and each iteration makes it lasts 6ms
                    await new Promise(r=>setTimeout(r,2+((progress>90)?progress*7:progress*2)))
                }
                // Finishes loading
                shell.loading.stop()
            })();
        break
        case 'messages':
            shell.log('This is a log message')
            shell.setColor('Cyan')
            shell.log('This is a log with style')
            shell.info('This is a info message')
            shell.warn('This is a warn message')
            shell.error('This is a error message')
        break
    }
}

export {shell}
