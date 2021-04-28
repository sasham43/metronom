/*
 * Entry point for the watch app
 */
import document from "document"
import { vibration } from "haptics"
import { readFileSync, existsSync, writeFileSync } from "fs"

var tickInterval;
var ticking = false
var bpm = 120
var bpmMax = 300
var bpmMin = 20
var selectedVibration = 'bump' // tiny little tap
var selectedBPMStep = 2
var dataPath = 'data.json'

function initValues(){
  // check if previous values exist
  var exists = existsSync(dataPath)
  if(exists){
    // read value from file
    var fileObj = readFileSync(dataPath, 'json')
    var savedData = JSON.parse(fileObj)
    // console.log('savedData', savedData, savedData.bpm, savedData.selectedVibration)
    if(savedData.bpm){
      bpm = savedData.bpm
    }
    if(savedData.selectedVibration){
      selectedVibration = savedData.selectedVibration
    }
    if(savedData.selectedBPMStep){
      selectedBPMStep = savedData.selectedBPMStep
    }
    // console.log('set values from saved data', bpm, selectedVibration, selectedBPMStep)
  } else {
    bpm = 120
  }
}

// init values
initValues()

function saveData(){
    writeFileSync(dataPath, JSON.stringify({
      selectedVibration,
      selectedBPMStep,
      bpm
    }), 'json')
}

console.log("App code started");


function getById(id){
  return document.getElementById(id)
}

var btn = getById('#btn')
var btnArc = getById('#btn-arc')
var statusText = getById('#status')
var animated = getById('#animate-instance-arc')
var bpmText = getById('#bpm')
var bpmLabel = getById('#bpm-label')
var plusBtn = getById('#btn-tr')
var minusBtn = getById('#btn-lr')

var vibrateBtn = getById('#vibration-btn')
var vibrationChevron = getById('#vibration-pattern-chevron')
var vibrationList = getById('#vibration-list')
var vibrationBack = getById('#vibration-back')
// let selectedVibration = 'bump' // tiny little tap
let patterns = [
  '', // the Back option is included in the list, so we offset it here
  'alert',
  'bump',
  'confirmation',
  'nudge',
  'ping',
  'ring',
  'off'
]
var vibrationOptions = document.getElementsByClassName('vibration-item')

// var selectedBPMStep = 2
var bpmStepBtn = getById('#bpm-step-btn')
var bpmStepList = getById('#bpm-step-list')
var bpmStepOptions = document.getElementsByClassName('bpm-step-item')
var bpmStepBackBtn = getById('#bpm-step-back')
var bpmChevron = getById('#bpm-step-chevron')
var bpmSteps = [
  null,
  1,
  2,
  3,
  4,
  5,
  10
]

var tapBtn = getById('#tap-btn')
var tapBtnArc = getById('#tap-btn-arc')
var tapTempoText = getById('#tap-tempo-text')
var tapLabel = getById('#tap-label')
var presentTempo = bpm
var tapAnimate = getById('#tap-animate-instance-arc')
var tapBtnSet = getById('#tap-btn-tr')
tapTempoText.text = presentTempo


var panorama = getById('#container')

bpmText.text = `${bpm}`



// bpm functions
plusBtn.onclick = plusClick
minusBtn.onclick = minusClick

document.onkeypress = function(e){
  if(e.key == 'up' && panorama.value == 0){
    incrementBPM()
  } else if (e.key == 'down' && panorama.value == 0){
    decrementBPM()
  }
}

function plusClick(){
  incrementBPM()
}
function minusClick(){
  decrementBPM()
}

function updateBPMText(){
  bpmText.text = `${bpm}`
}
function incrementBPM(){
  bpm = Number(bpm) + selectedBPMStep
  if(bpm > bpmMax){
    bpm = bpmMax
  }
  updateBPMText()
  
  if(ticking){
    cancelTick()
    tick(bpm)
  }
}
function decrementBPM(){
  bpm = Number(bpm) - selectedBPMStep
  if(bpm < bpmMin){
    bpm = bpmMin
  }
  updateBPMText()
  
  if(ticking){
    cancelTick()
    tick(bpm)
  }
}

function bpmToMs(bpm){
  return 60000 / bpm
}


// metronome ticking
btn.onmouseup = startTick
bpmText.onmouseup = startTick
bpmLabel.onmouseup = startTick
btnArc.onmouseup = startTick
function startTick(){
  if(!ticking){
    tick(bpm)    
  } else {
    cancelTick()
  }
}
function tick(bpm=120){
  var speed = bpmToMs(bpm)
    btnArc.style.fill = 'white'
  ticking = true
 tickInterval = setInterval(()=>{
     // do a thing
      if(selectedVibration != 'off'){
        vibration.start(selectedVibration)        
      }
     animated.animate('enable')
     setTimeout(()=>{
         vibration.stop()
         animated.animate('disable')
     }, 200)
 }, speed)
  
  saveData()
}

function cancelTick(){
  clearInterval(tickInterval)
    btnArc.style.fill = '#fbcd00'
  ticking = false
  
  // write data to file 
  saveData()
}


vibrationBack.onclick = function(){
  vibrationList.style.display = 'none'
}
vibrateBtn.onmousedown = function(){
  vibrationChevron.href =  "btn_combo_next_press_p.png"
}
vibrateBtn.onmouseup = function(){
  vibrationChevron.href = "btn_combo_next_p.png"
  vibrationList.style.display = 'inline'
  
  initVibrationOptions()
}

function initVibrationOptions(){
  // set up check list options
  vibrationOptions.forEach((element, index)=>{
    if(index == 0) return
    var check = getById(`vibrate-check-${index}`)
    if(patterns[index] == selectedVibration){
      check?.style.display = 'inline'
    } else {
      check?.style.display = 'none'
    }
    element.onclick = function(){
      selectedVibration = patterns[index]
      updateChecks()
      
      saveData()
    }
  })
}
function updateChecks(){
  vibrationOptions.forEach((element, index)=>{
    var check = getById(`vibrate-check-${index}`)
    if(patterns[index] == selectedVibration){
      check?.style.display = 'inline'
    } else {
      check?.style.display = 'none'
    }
  })
}

    
// bpm step change
bpmStepBtn.onclick = function(){
  // show bpm list
  bpmStepList.style.display = 'inline'
}
bpmStepBackBtn.onclick = function(){
  bpmStepList.style.display = 'none'
}
bpmStepBtn.onmousedown = function(){
  bpmChevron.href = "btn_combo_next_press_p.png"
}
bpmStepBtn.onmouseup = function(){
  bpmChevron.href = "btn_combo_next_p.png"
}
bpmStepOptions.forEach((element, index)=>{
  if(index == 0) return // skip Back button
  
  var check = getById(`bpm-step-check-${index}`)
  if(bpmSteps[index] == selectedBPMStep){
    check?.style.display = 'inline'
  } else {
    check?.style.display = 'none'
  }
    
  element.onclick = function(){
    selectedBPMStep = bpmSteps[index]
    updateBPMChecks()
    
    saveData()
  }
})

function updateBPMChecks(){
  bpmStepOptions.forEach((element, index)=>{
    var check = getById(`bpm-step-check-${index}`)
    if(bpmSteps[index] == selectedBPMStep){
      check?.style.display = 'inline'
    } else {
      check?.style.display = 'none'
    }
  })
}

tapBtn.onclick = tapTempo
tapBtnArc.onclick = tapTempo
tapLabel.onclick = tapTempo

tapBtn.onmousedown = mouseDownTap
tapBtnArc.onmousedown = mouseDownTap
tapLabel.onmousedown = mouseDownTap

tapBtn.onmouseup = mouseUpTap
tapBtnArc.onmouseup = mouseUpTap
tapLabel.onmouseup = mouseUpTap
    
tapBtnSet.onclick = function(){
  bpm = presentTempo
  panorama.value = 0
  console.log('bpm', bpm, presentTempo)
  cancelTick()
  tick(bpm)
  updateBPMText()
}

function mouseDownTap(){
  tapBtnArc.style.fill = 'white'
  tapAnimate.animate('enable')
     setTimeout(()=>{
         tapAnimate.animate('disable')
     }, 200)
}
function mouseUpTap(){
    tapBtnArc.style.fill = 'teal'
}

var tap = {
  prev: 0,
  count: 0,
  current: 0,
  bpm: 0,
  difference: 0,
  total: 0,
  final: 0
}
function reset(){
  for(var value in tap){
    tap[value] = 0
  }
}

function tapTempo(){

  var now = Date.now()
  
  if(tap.prev == 0){
    tap.prev = now 
  } else if ((Date.now()-tap.prev) > 2200){
    reset()
  } else {
    tap.current = now
    tap.difference = tap.current - tap.prev
    tap.prev = tap.current
    tap.bpm = 60 / tap.difference
    tap.total += tap.bpm
    tap.count++
    tap.final = (tap.total / tap.count) * 1000
    presentTempo = tap.final.toFixed(0)
  }
  
  tapTempoText.text = `${presentTempo}`
}