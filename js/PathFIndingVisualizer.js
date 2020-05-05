var canvas = document.getElementById("gridCanvas")
var form = document.getElementById("setup-form")

const CANVASWIDTH = window.innerWidth/1.5
const CANVASHEIGHT = window.innerHeight - 30

canvas.width = CANVASWIDTH
canvas.height = CANVASHEIGHT

ctx = canvas.getContext("2d")

var sxBox = document.getElementById("sxBox")
var syBox = document.getElementById("syBox")
var exBox = document.getElementById("exBox")
var eyBox = document.getElementById("eyBox")

var visualizeCheckBox = document.getElementById("visualizeCheckBox")
var keepObsticlesCheckBox = document.getElementById("keepObsticlesCheckBox")

document.getElementById("setStartBtn").onclick = document.getElementById("setEndBtn").onclick = function(e){if(!running){setEndPoint(e)}}
document.getElementById("resetButton").onclick = reset
document.getElementById("runAlgorithmButton").onclick = function(){if(!running)runAlgorithm()}

var mouseIsDown = false
canvas.addEventListener("mousedown", function mousedown(e){mouseIsDown=true;if(!running)editGrid(e)})
canvas.addEventListener("mousemove", function mousemove(e){if(mouseIsDown && !running){editGrid(e)}})
canvas.addEventListener("mouseup", function mouseup(){mouseIsDown = false})

const OPENCOLOR = "#00FF00"
const CLOSEDCOLOR = "#FF0000"
const PATHCOLOR = "#fff700"
const UNBLOCKEDCOLOR = "#AA00FF"
const BACKGROUNDCOLOR = "#000000"
const BLOCKEDCOLOR = "#000000"

const COLS = 90
const ROWS = 60

const BLOCKBUFFER = 1 // 4200/(ROWS*COLS)
const BLOCKWIDTH = (CANVASWIDTH - BLOCKBUFFER*(COLS+1)) / COLS
const BLOCKHEIGHT = (CANVASHEIGHT - BLOCKBUFFER*(ROWS+1)) / ROWS

var grid = []
var startPos = {x: 0, y: 0}
var endPos = {x: 80, y: 45}

function getDisplayCoord(pos){

    xPix = pos.x * (BLOCKBUFFER + BLOCKWIDTH) + BLOCKBUFFER
    yPix = pos.y * (BLOCKBUFFER + BLOCKHEIGHT) + BLOCKBUFFER

    return {x: xPix, y: yPix}
}

function getGridCoord(pixel){

    gridX = Math.floor((pixel.x - BLOCKBUFFER) / (BLOCKBUFFER + BLOCKWIDTH))
    gridY = Math.floor((pixel.y - BLOCKBUFFER) / (BLOCKBUFFER + BLOCKHEIGHT))

    return {x: gridX, y: gridY}
}


function setEndPoint(e){
    let entryBoxes = [exBox, eyBox]
    let endpoint = endPos

    if(e.target.id == "setStartBtn"){
        entryBoxes = [sxBox, syBox]
        endpoint = startPos
    }
    
    if(!isValidEntry(entryBoxes)){
        entryBoxes[0].value = entryBoxes[1].value = "!"
        return
    }
    
    grid[endpoint.x][endpoint.y] = UNBLOCKED
    paintBlock(endpoint, UNBLOCKEDCOLOR)

    endpoint.x = parseInt(entryBoxes[0].value)
    endpoint.y = parseInt(entryBoxes[1].value)

    grid[endpoint.x][endpoint.y] = PATH
    paintBlock(endpoint, PATHCOLOR)
}

function isValidEntry(entryBoxes){
    let x = parseInt(entryBoxes[0].value); let y = parseInt(entryBoxes[1].value)
    if(x != NaN && y != NaN){
        if(-1 < x && x < COLS && -1 < y && y < ROWS){
            return true
        }
    }
    return false
}


function reset(){
    running = false
    if(keepObsticlesCheckBox.checked){
        for(let i = 0; i < COLS; i++){
            for(let j = 0; j < ROWS; j++){
                if(!isEndpoint({x: i, y: j})){
                    if(grid[i][j] != BLOCKED){
                        grid[i][j] = UNBLOCKED
                    }
                }
            }
        }
    }else{
        grid = []
        for (let i = 0; i < COLS; i ++){
            let row = []
            for(let j = 0; j < ROWS; j++){
                if(isEndpoint({x: i, y: j})){
                    row.push(PATH)
                }else{      
                    row.push(UNBLOCKED)
                }
            }
            grid.push(row)
        }
    }
    refreshGrid()
}

var running = false
function editGrid(e){
    gridCoord = getGridCoord({x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop})
    if(!isEndpoint(gridCoord)){
        grid[gridCoord.x][gridCoord.y] = BLOCKED
        paintBlock(gridCoord, BLOCKEDCOLOR)
    }
}


function runAlgorithm(){
    running = true
    let openSet = [new Node(startPos, null, 0, 0, 0)]
    if(visualizeCheckBox.checked){
        aStarVisualize(openSet)
    }else{
        paintPath(aStarAlgorithm(grid, startPos, endPos))
    }
}

function aStarVisualize(openSet){
    let path = null
    let finished = false
    for(let iteration = 0; iteration < 20; iteration ++){
        if((path = aStarIteration(grid, openSet, endPos)) != null){
            finished = true
            break
        }
    }
    if(!finished)setTimeout(function(){aStarVisualize(openSet)}, 1000/30)
    refreshGrid()
    
}

/*
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}
*/

function paintPath(path){
    for(let i = 0; i < path.length; i++){
        paintBlock(path[i], PATHCOLOR)
    }
}

function isEndpoint(pos){
    return ((startPos.x == pos.x && startPos.y == pos.y) || (endPos.x == pos.x && endPos.y == pos.y))
}

function paintBlock(pos, color){
    ctx.fillStyle = color
    let pixel = getDisplayCoord(pos)
    ctx.fillRect(pixel.x, pixel.y, BLOCKWIDTH, BLOCKHEIGHT)
}

function refreshGrid(){
    console.log("updating grid")
    ctx.fillStyle = BACKGROUNDCOLOR
    ctx.fillRect(0,0,CANVASWIDTH, CANVASHEIGHT)
    for(let i = 0; i < COLS; i++){
        for(let j = 0; j < ROWS; j++){
            let color = UNBLOCKEDCOLOR;
            if(isEndpoint({x: i, y: j})){
                color = PATHCOLOR
            }else{
                switch(grid[i][j]){
                    case PATH:
                        color = PATHCOLOR
                        break
                    case UNBLOCKED:
                        color = UNBLOCKEDCOLOR
                        break
                    case BLOCKED:
                        color = BLOCKEDCOLOR
                        break
                    case OPEN:
                        color = OPENCOLOR
                        break
                    case CLOSED:
                        color = CLOSEDCOLOR
                        break
                }
            }
            paintBlock({x: i, y: j}, color)
        }
    }
}

reset()
