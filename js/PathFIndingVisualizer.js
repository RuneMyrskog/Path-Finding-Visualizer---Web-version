const CANVAS_WIDTH = window.innerWidth/1.5
const CANVAS_HEIGHT = window.innerHeight - 30

var canvas = document.getElementById("grid_canvas")
var form = document.getElementById("setup-form")

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT

var mouse_is_down = false
canvas.addEventListener("mousedown", function mousedown(e){mouse_is_down=true;edit_grid(e)})
canvas.addEventListener("mousemove", function mousemove(e){if(mouse_is_down){edit_grid(e)}})
canvas.addEventListener("mouseup", function mouseup(){mouse_is_down = false})
//canvas.addEventListener("mouseout", mouseup)

var can_edit = true
function edit_grid(e){
    if(can_edit){
        grid_coord = get_grid_coord({x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop})
        grid[grid_coord.x][grid_coord.y] = BLOCKED
    }
}



ctx = canvas.getContext("2d")

const OPEN_COLOR = "#00FF00"
const CLOSED_COLOR = "#FF0000"
const PATH_COLOR = "#000000"
const UNBLOCKED_COLOR = "#AA00FF"
const BACKGROUND_COLOR = "#000000"
const BLOCKED_COLOR = "#000000"

const BLOCKED = 0
const UNBLOCKED = 1
const CLOSED = 2
const OPEN = 3
const PATH = 4

var can_edit = true

const COLS = 90
const ROWS = 60

const BLOCK_BUFFER = 1 // 4200/(ROWS*COLS)
const BLOCK_WIDTH = (CANVAS_WIDTH - BLOCK_BUFFER*(COLS+1)) / COLS
const BLOCK_HEIGHT = (CANVAS_HEIGHT - BLOCK_BUFFER*(ROWS+1)) / ROWS


const DIRECTIONS = [{x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}]


class Node{
    /*
    *  Node in astar
    */
    constructor(pos, parent, g, h, f){
        this.pos = pos
        this.g = g
        this.h = h
        this.f = f

    }


}


function get_final_path(node){

    path = []
    while (node != null){
        path.push(node.pos)
        node = node.parent
    }

    return path //note in reverse order
}

function distance(pos_1, pos_2){

    return Math.sqrt((pos_1.x - pos_2.x)**2 + (pos_1.x - pos_2.x)**2)
}

function get_neighbour_position(curr_pos, direction){
    return {x:(curr_pos.x + direction.x), y:(curr_pos.y + direction.y)}
}

function is_accessible(curr_pos, direction, grid){

    let neighbour_pos = get_neighbour_position(curr_pos, direction)

    if (-1 < neighbour.x && neighbour.x < grid.length 
        && -1 < neighbour.y && neighbour.y < grid[0].length){
        

        
        if ([BLOCKED, CLOSED].includes(grid[neighbour_pos.x][neighbour_pos.y])){
            return false
        }

        if (direction.x != 0  && direction.y != 0){
            if (grid[curr_pos.x + direction.x][curr_pos.y] == BLOCKED 
                && grid[curr_pos.x][curr_pos.y + direction.y] == BLOCKED){
                    return false
                }
        }
        return true
    }
    return false
}

function get_valid_neighbour_positions(node, grid){

    positions =[]
    for(let i = 0; i < DIRECTIONS.length; i++){
        if(is_accessible(node.pos, DIRECTIONS[i], grid)){
            positions.push(get_neighbour_position(node.pos, DIRECTIONS[i]))
        }
    }
}


//open_set = [new Node(start_pos, null, 0, 0, 0)]
function a_star_iteration(grid, open_set, start_pos, end_pos){

    if (open_set.length > 0){

        curr_best = open_set.reduce((min, node) => node.f < min ? node.f : min, open_set[0].f)
        if((index=open_set.indexOf(curr_best)) != -1){
            open_set.splice(open_set.indexOf(curr_best, 1))
        }else{


        }

        grid[curr_best.pos.x][curr_best.pos.y] = CLOSED

        if(curr_best.pos.x == end_pos.x && curr_best.pos.y == end_pos.y){
            let path = get_final_path(curr_best)
            for(let i = 0; i < path.length; i++){
                let path_node = path[i]
                grid[path_node.x][path_node.y] = PATH
            }
            open_set = []
            return
        }

        neighbour_positions = get_valid_neighbour_positions(curr_best, grid)
        for(let i = 0; i < neighbour_positions.length; i++){
            neighbour_pos = neighbour_positions[i]
            let g = curr_best.g + distance(neighbour_pos, curr_best.pos)
            let h = distance(neighbour_pos, end_pos)
            let f = g + h

            let in_open_set = false
            for(let j = 0; j < open_set.length; j++){
                open_node = open_set[j]
                if(open_node.pos.x == neighbour_pos.x && open_node.pos.y == neighbour_pos.y){
                    in_open_set = true
                    if(g < open_node.g){
                        open_node.parent = curr_best
                        open_node.g = g
                        open_node.f = f
                    }
                    break
                }
            }

            if(!in_open_set){
                neighbour = new Node(neighbour_pos, curr_best, g, h, f)
                open_set.push(neighbour)
                grid[neighbour_pos.x][neighbour_pos.y] = OPEN
            }
        }
        return null
    }
}


let grid = []
for (let i = 0; i < COLS; i ++){
    let row = []
    for(let j = 0; j < ROWS; j++){
        row.push(UNBLOCKED)
    }
    grid.push(row)
}

start_pos = {x: 10, y: 10}
end_pos = {x: 70, y: 50}

function is_endpoint(pos){
    return ((start_pos.x == pos.x && start_pos.y == pos.y) || (end_pos.x == pos.x && end_pos.y == pos.y))
}

function get_display_coord(pos){

    x_pix = pos.x * (BLOCK_BUFFER + BLOCK_WIDTH) + BLOCK_BUFFER
    y_pix = pos.y * (BLOCK_BUFFER + BLOCK_HEIGHT) + BLOCK_BUFFER

    return {x: x_pix, y: y_pix}
}

function get_grid_coord(pixel){

    grid_x = Math.floor((pixel.x - BLOCK_BUFFER) / (BLOCK_BUFFER + BLOCK_WIDTH))
    grid_y = Math.floor((pixel.y - BLOCK_BUFFER) / (BLOCK_BUFFER + BLOCK_HEIGHT))

    return {x: grid_x, y: grid_y}
}


function paint_block(pos, color){
    ctx.fillStyle = color
    let pixel = get_display_coord(pos)
    ctx.fillRect(pixel.x, pixel.y, BLOCK_WIDTH, BLOCK_HEIGHT)
}

function update_grid(){
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT)
    for(let i = 0; i < COLS; i++){
        for(let j = 0; j < ROWS; j++){
            let color = UNBLOCKED_COLOR;
            switch(grid[i][j]){
                case PATH:
                    color = PATH_COLOR
                    break
                case UNBLOCKED:
                    color = UNBLOCKED_COLOR
                    break
                case BLOCKED:
                    color = BLOCKED_COLOR
                    break
                case OPEN:
                    color = OPEN_COLOR
                    break
                case CLOSED:
                    color = CLOED_COLOR
                    break
            }
            paint_block({x: i, y: j}, color)
        }
    }
}

setInterval(update_grid, 1000/30)



