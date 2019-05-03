const $ = sel => document.querySelector(sel)

// settings
const CANVAS_HEIGHT = 600
const CANVAS_WIDTH = 600

// canvas
const canvas = $("canvas")
const ctx = canvas.getContext("2d")
canvas.height = CANVAS_HEIGHT
canvas.width = CANVAS_WIDTH

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
            alive: this._cells[x][y]
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

// ui variables
let playing = false

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
    paint(thisGeneration)
}

function paint(generation){
    for (let x in generation.cells()) {
        for (let y in generation.cells(x)) {
            if (generation.get(x,y).alive) {
                ctx.fillStyle = "#222"
            }
            else {
                ctx.fillStyle = "#fff"
            }
            ctx.fillRect(x,y, 1, 1)
        }
    }
}

function seed(){
    for (let x=0; x < canvas.width; x ++) {
        for (let y=0; y < canvas.height; y ++) {
            let alive
            if (Math.random() < .25) {
                alive = true
            }
            else {
                alive = false
            }
            thisGeneration.set(x,y,alive)
        }
    }
    paint(thisGeneration)
}

window.addEventListener('keydown', e => {
    if (e.keyCode === 32) {
        if (!playing) {
            intervalId = setInterval(createNewGeneration, 500)
            playing = true
        }
        else {
            clearInterval(intervalId)
            playing = false
        }
    }
})

seed()

// seed the canvas with random cells
// every N ms
    // clear nextGeneration
    // fill nextGeneration by applying rules to cells in thisGeneration
    // thisGeneration = nextGeneration
    // paint thisGeneration

