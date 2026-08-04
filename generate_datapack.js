const fs = require("fs");

let lkupqt = {
  $_wood:{
    $_planks:4,
    $_stairs:5,
    $_slab:8,
    $_fence:8,
    $_fence_gate:4,
    $_door:8,
    $_trapdoor:12,
    $_pressure_plate:12
  },
  $_planks:{
    $_stairs:1,
    $_slab:2,
    $_fence:2,
    $_fence_gate:1,
    $_door:1,
    $_trapdoor:3,
    $_button:16
  }
}

lkupqt.stripped_$_wood = { ...lkupqt.$_wood };
lkupqt.$_log =  { ...lkupqt.$_wood };
lkupqt.stripped_$_log =  { ...lkupqt.$_wood };

let lkupqtNether = {
  $_stem:  { ...lkupqt.$_wood },
  stripped_$_stem:  { ...lkupqt.$_wood },
  $_hyphae:  { ...lkupqt.$_wood },
  stripped_$_hyphae:  { ...lkupqt.$_wood },
}

let lkupqtBamboo = {
    bamboo_block: { ...lkupqt.$_wood },
    stripped_bamboo_block: { ...lkupqt.$_wood },
    bamboo_planks: { ...lkupqt.$_planks },
    bamboo_mosaic: { ...lkupqt.$_planks },
}

lkupqt.
  $_wood.
  stripped_$_wood = 1
lkupqt.
  $_log.
  stripped_$_log = 1
lkupqtNether
  .$_stem.
  stripped_$_stem = 1
lkupqtNether
  .$_hyphae
  .stripped_$_hyphae = 1


lkupqtBamboo
  .bamboo_block
  .stripped_bamboo_block = 1
lkupqtBamboo
  .bamboo_block
  .bamboo_mosaic = 4
lkupqtBamboo
  .stripped_bamboo_block
  .bamboo_mosaic = 4
lkupqtBamboo
  .bamboo_planks
  .bamboo_mosaic = 1
lkupqtBamboo
  .bamboo_mosaic
  .bamboo_planks = 1

lkupqtBamboo
  .bamboo_planks
  .bamboo_mosaic_stairs = 1
lkupqtBamboo
  .bamboo_mosaic
  .bamboo_mosaic_stairs = 1
lkupqtBamboo
  .bamboo_planks
  .bamboo_mosaic_slab = 2
lkupqtBamboo
  .bamboo_mosaic
  .bamboo_mosaic_slab = 2

let woodtypes = "oak,spruce,birch,jungle,acacia,dark_oak,mangrove,cherry,pale_oak,poplar".split(",");
let stemtypes = ["crimson","warped"];

fs.mkdirSync("./datapack/data/stonecutter_cuts_wood/recipe/",{recursive:true})

fs.writeFileSync("./datapack/pack.mcmeta",JSON.stringify({
  pack:{
    description:"Adds recipes for wood variants to the stonecutter.",
    min_format:[88,0],max_format:[133,0]
  }},undefined,2))

for(let wood of woodtypes){
  for(let input of Object.keys(lkupqt)){
    for(let output of Object.keys(lkupqt[input])){
      
      fs.writeFileSync("./datapack/data/stonecutter_cuts_wood/recipe/"+input.replaceAll("$",wood)+"_to_"+output.replaceAll("$",wood)+".json", JSON.stringify({
        type: "minecraft:stonecutting",
        ingredient: "minecraft:"+input.replaceAll("$",wood),
        result:{
          id: "minecraft:"+output.replaceAll("$",wood),
          count: lkupqt[input][output]
        }
      },undefined,2))
    }
  }
}

for(let stem of stemtypes){
  for(let input of Object.keys(lkupqtNether)){
    for(let output of Object.keys(lkupqtNether[input])){
      
      fs.writeFileSync("./datapack/data/stonecutter_cuts_wood/recipe/"+input.replaceAll("$",stem)+"_to_"+output.replaceAll("$",stem)+".json", JSON.stringify({
        type: "minecraft:stonecutting",
        ingredient: "minecraft:"+input.replaceAll("$",stem),
        result:{
          id: "minecraft:"+output.replaceAll("$",stem),
          count: lkupqtNether[input][output]
        }
      },undefined,2))
    }
  }
}

let bamboo = "bamboo";
for(let input of Object.keys(lkupqtBamboo)){
  for(let output of Object.keys(lkupqtBamboo[input])){
      
      fs.writeFileSync("./datapack/data/stonecutter_cuts_wood/recipe/"+input.replaceAll("$",bamboo)+"_to_"+output.replaceAll("$",bamboo)+".json", JSON.stringify({
        type: "minecraft:stonecutting",
        ingredient: "minecraft:"+input.replaceAll("$",bamboo),
        result:{
          id: "minecraft:"+output.replaceAll("$",bamboo),
          count: lkupqtBamboo[input][output]
        }
    },undefined,2))
  }
}