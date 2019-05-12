## Motivation 

I wrote this implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) for fun because I am very interested in the question of how complex self-organizing patterns emerge from far simpler conditions. It seems to me to be one of the most fundamental questions we can ask about our realities. Writing and observing Conway's Game seemed like a great way of exploring this problem on a personal level, on the smallest scale that I've been made aware of. 

## How it works

The game consists of a simple grid, with each cell on that grid marked as either alive or dead. In most implementations, including mine, a living cell is rendered with a black pixel on the grid and a dead one is rendered with a white pixel. The grid then moves through an indefinite number of "generations", according to a short set of rules which define the transition from one generation to the next: 

- Any live cell with fewer than two live neighbours dies, as if by underpopulation.

- Any live cell with two or three live neighbours lives on to the next generation.

- Any live cell with more than three live neighbours dies, as if by overpopulation.
  
- Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

From these simple rules, startling complexity emerges.

## Working with the UI

Hopefully, this little interface is pretty self-explanatory. If it's your first go, you might try a small world size, maximum speed, a blank pattern, and a randomness factor of .5. Another suggestion: Pick a more structured pattern, such as "thatch", and apply a randomness factor of .0001. You can also eschew all those more programmatic starting patterns and just use your cursor to paint on a blank canvas, playing around with different brush sizes, and then seeing what happens when you bring that canvas to life. I recommend always using the "zoom" functionality to get a close look at what's happening.
