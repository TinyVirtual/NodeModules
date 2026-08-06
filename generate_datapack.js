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
let w = { ...lkupqt.$_wood }, p = { ...lkupqt.$_planks }

lkupqt.stripped_$_wood = { ...w };
lkupqt.$_log =  { ...w };
lkupqt.stripped_$_log =  { ...w };

let lkupqtNether = {
  $_stem:  { ...w },
  stripped_$_stem:  { ...w },
  $_hyphae:  { ...w },
  stripped_$_hyphae:  { ...w },
  $_planks: { ...p }
}

let lkupqtBamboo = {
    bamboo_block: { ...w },
    stripped_bamboo_block: { ...w },
    bamboo_planks: { ...p },
    bamboo_mosaic: { ...p },
}
let $w = "$_wood", $sw = "stripped_$_wood", $p = "$_planks", $l = "$_log", $sl = "stripped_$_log", $s = "$_stem", $ss = "stripped_$_stem", $h = "$_hyphae", $sh = "stripped_$_hyphae"

lkupqt[$w][$sw] = 1
lkupqt[$l][$sl] = 1
lkupqtNether[$s][$ss] = 1
lkupqtNether[$h][$sh] = 1

let $bb = "bamboo_block", $sbb = "stripped_bamboo_block", $bp = "bamboo_planks", $bm = "bamboo_mosaic"

lkupqtBamboo[$bb][$sbb] = 1
lkupqtBamboo[$bb][$bm] = 4
lkupqtBamboo[$sbb][$bm] = 4
lkupqtBamboo[$bp][$bm] = 1
lkupqtBamboo[$bm][$bp] = 1

lkupqtBamboo[$bp]
  .bamboo_mosaic_stairs = 1
lkupqtBamboo[$bm]
  .bamboo_mosaic_stairs = 1
lkupqtBamboo[$bb]
  .bamboo_mosaic_stairs = 5
lkupqtBamboo[$sbb]
  .bamboo_mosaic_stairs = 5

lkupqtBamboo[$bp]
  .bamboo_mosaic_slab = 2
lkupqtBamboo[$bm]
  .bamboo_mosaic_slab = 2
lkupqtBamboo[$sbb]
  .bamboo_mosaic_slab = 8
lkupqtBamboo[$bb]
  .bamboo_mosaic_slab = 8

let woodtypes = "oak,spruce,birch,jungle,acacia,dark_oak,mangrove,cherry,pale_oak,poplar".split(",");
let stemtypes = ["crimson","warped"];

fs.mkdirSync("./datapack/data/stonecutter_cuts_wood/recipe/",{recursive:true})

fs.writeFileSync("./datapack/pack.mcmeta",JSON.stringify({
  pack:{
    description:"Adds recipes for wood variants to the stonecutter.",
    min_format:[88,0],max_format:[133,0]
  }},void 0,2))

function makeRecipe(wood, table){
  for(let input of Object.keys(table)){
    for(let output of Object.keys(table[input])){
      
      fs.writeFileSync("./datapack/data/stonecutter_cuts_wood/recipe/"+input.replaceAll("$",wood)+"_to_"+output.replaceAll("$",wood)+".json", JSON.stringify({
        type: "minecraft:stonecutting",
        ingredient: "minecraft:"+input.replaceAll("$",wood),
        result:{
          id: "minecraft:"+output.replaceAll("$",wood),
          count: table[input][output]
        }
      },void 0,2))
    }
  }
}

for(let wood of woodtypes){
  makeRecipe(wood, lkupqt)
}

for(let stem of stemtypes){
  makeRecipe(stem, lkupqtNether)
}

makeRecipe("bamboo", lkupqtBamboo)
