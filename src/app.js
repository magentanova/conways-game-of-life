const $ = sel => document.querySelector(sel)
const $$ = sel => document.querySelectorAll(sel)

// settings
const ZOOM_FACTOR = 3
const CANVAS_HEIGHT = 792 / ZOOM_FACTOR
const CANVAS_WIDTH = 1440 / ZOOM_FACTOR
let PAINTBRUSH_SIZE = 10
const COLORS = [null,null,"orange","crimson","red", "crimson","purple","indigo","blue"]

// canvas
const canvas = $("canvas")
const ctx = canvas.getContext("2d")
const canvasRect = canvas.getBoundingClientRect()
canvas.height = CANVAS_HEIGHT
canvas.width = CANVAS_WIDTH

// ui els
const brushSize = $("#brush-size")
const patternChoices = $$('#radio-group input[type="radio"]')
const initButton = $("#initialize")
const randomnessInput = $("#randomness")
const goStopButton = $("#go-stop")
const zoomButton = $("#zoom")
const patternCallbacks = {
    stripes: (x,y) => x % 6 === 0,
    diagonals: (x,y) => (x - y) % 6 === 0,
    thatch: (x,y) => (x * y) % 6 === 0
}

// ui variables
let playing = false
// let randomness = 0
// let seedCallback = (x,y) => false

// generations
const Generation = function(){
    this._cells = []
}
Generation.prototype = {
    cells: function(x) {
        return x ? this._cells[x] : this._cells
    },
    get: function(x,y) {
        return {
            x,
            y,
            alive: this._cells[x] ? this._cells[x][y] : null
        }
    },
    set: function(x,y,alive) {
        if (!this._cells[x]) {
            this._cells[x] = []
        }
        this._cells[x][y] = alive
    }
}
let thisGeneration = new Generation()
let nextGeneration = new Generation()
let generationCount = 1

function applyRules(cell) {
    const { x, y, alive } = cell
    let liveNeighborCount = 0
    for (let nx = Math.max(x - 1, 0); nx <= Math.min(x + 1, CANVAS_WIDTH - 1); nx ++) {
        for (let ny = Math.max(y - 1, 0); ny <= Math.min(y + 1, CANVAS_HEIGHT - 1); ny ++) {
            if (nx === x && ny === y) {
                // don't count yourself
                continue
            }
            if ( thisGeneration.get(nx,ny).alive ) {
                liveNeighborCount ++ 
            } 
        }
    }

    let aliveNext
    if ( alive ) {
        // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        if ( liveNeighborCount < 2 ) {
            aliveNext = false
        }

        // Any live cell with two or three live neighbours lives on to the next generation.
        if ( liveNeighborCount === 2 || liveNeighborCount === 3 ) {
            aliveNext = true
        }

        // Any live cell with more than three live neighbours dies, as if by overpopulation.
        if ( liveNeighborCount > 3 ) {
            aliveNext = false
        }
    }   
    if ( !alive ) {
            // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if ( liveNeighborCount === 3 ) {
            aliveNext = true
        }
        else {
            aliveNext = false
        }
    }
    return aliveNext
}

function createNewGeneration() {
    nextGeneration = new Generation()
    for (let x = 0; x < CANVAS_WIDTH; x ++) {
        for (let y = 0; y < CANVAS_HEIGHT; y ++) {
            const aliveNext = applyRules(thisGeneration.get(x,y))
            nextGeneration.set(x,y,aliveNext)
        }
    }
    thisGeneration = nextGeneration
    paintCanvas(thisGeneration)
    generationCount ++
}

function paintCanvas(generation){
    for (let x in generation.cells()) {
        for (let y in generation.cells(x)) {
            if (generation.get(x,y).alive) {
                ctx.fillStyle = "#222"
            }
            else {
                ctx.fillStyle = "#fff"
            }
            // ctx.fillStyle = generation.get(x,y).alive || "#fff"
            // ctx.fillStyle = fillStyle
            ctx.fillRect(x,y, 1, 1)
        }
    }
}

function paintBlock(x,y,brushSize=1) {
    ctx.fillStyle = "#222"
    for (let pixelX = Math.floor(x - brushSize / 2); pixelX <= Math.floor(x + brushSize / 2); pixelX ++) {
        for (let pixelY = Math.floor(y - brushSize / 2); pixelY <= Math.floor(y + brushSize / 2); pixelY ++) {
            thisGeneration.set(pixelX,pixelY,true)
        }
    }
    ctx.fillRect(Math.floor(x - brushSize / 2),Math.floor(y - brushSize / 2),brushSize - 1, brushSize - 1)
}

const sentence = "the quick brown fox jumped over the lazy cow"

function seed(cb=(x,y) => false, randomFactor=0){
    for (let x=0; x < canvas.width; x ++) {
        for (let y=0; y < canvas.height; y ++) {
            let alive
            if (cb && cb(x,y)) {
                alive = true
            }
            else if (Math.random() < randomFactor)   {
                alive = true
            }
            else {
                alive = false
            }
            thisGeneration.set(x,y,alive)
        }
    }
    paintCanvas(thisGeneration)
}

// initialization 

$("#initialize").onclick = () => {
    let seedCallback
    for (let i = 0; i < patternChoices.length; i ++) {
        const patternEl = patternChoices[i]
        if (patternEl.checked) {
            console.log(patternEl.value)
            seedCallback = patternCallbacks[patternChoices[i].value]
        }
    }
    const randomFactor = parseFloat($("#randomness").value)
    console.log(seedCallback, randomFactor)
    seed(seedCallback, randomFactor)
}

// playback
const togglePlaying = () => {
    if (!playing) {
        intervalId = setInterval(createNewGeneration, 250)
        goStopButton.innerHTML = "STOP"
        playing = true
    }
    else {
        clearInterval(intervalId)
        goStopButton.innerHTML = "GO"
        playing = false
    }
}

window.addEventListener('keydown', e => {
    if (e.keyCode === 32) {
        e.preventDefault()
        e.stopPropagation()
        togglePlaying()
    }
})

goStopButton.onclick = togglePlaying

$("#zoom").onclick = () => {
    canvas.style.zoom = ZOOM_FACTOR
    canvas.scrollIntoView()
    window.scrollTo({
        left: canvasRect.left,
    })

    window.addEventListener("keydown", e => {
        if (e.keyCode === 27) {
            canvas.style.zoom = 1
        }
    })
}

// painting

brushSize.onchange = e => PAINTBRUSH_SIZE = parseInt(e.target.value)

canvas.addEventListener('mousedown', e => {
    const onmousemove = e => {
        var x = e.pageX - e.target.offsetLeft; 
        var y = e.pageY - e.target.offsetTop; 
        paintBlock(x,y,PAINTBRUSH_SIZE)
    }
    canvas.addEventListener('mousemove', onmousemove)
    canvas.addEventListener('mouseup', e => {
        canvas.removeEventListener('mousemove', onmousemove)
    })
})


// NEXT draw the seed pattern


// ALGORITHM

    // seed the canvas with random cells
    // every N ms
        // clear nextGeneration
        // fill nextGeneration by applying rules to cells in thisGeneration
        // thisGeneration = nextGeneration
        // paintCanvas thisGeneration



// GOOD ONES

    // sentence

        // const sentence = "the quick brown fox jumped over the lazy cow"

        //             const codeX = sentence[x % sentence.length].charCodeAt()
        //             const codeY = sentence[y % sentence.length].charCodeAt()
        //             if (codeX * codeY > 11550) {
        //                 alive = true
        //             }

    // product + modulo + random

        // if ((x * y) % 6 === 0 && Math.random() < .999)   {
