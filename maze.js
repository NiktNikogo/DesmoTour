class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.visited = new Array(this.width * this.height).fill(false);
        this.edges = new Array();
        this.path = new Array();
        this.adjMap = new Map();
        this.visitedBFS = new Set();
        this.prevNode = new Array(this.width * this.height).fill(-1);
        this.root = -1;
        for(let i = 0; i < this.width * this.height; i++) {
            this.adjMap.set(i, []);
        }
    }
    getDims() {
        return [this.width, this.height];
    }
    XYToNum(node) {
        if(this.height >= this.width) {
            return node[0] + node[1] * this.width;
        } else {
            return node[0] * this.height + node[1];
        }
    }
    numToXY(num) {
        if(this.height >= this.width)
            return [num % this.width, Math.floor(num / this.width)];
        else 
            return [Math.floor(num / this.height), num % this.height];
    }
    getNeighbours(node) {
        let res = []
        const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        dirs.forEach(dir => {
            const newNode = [node[0] + dir[0], node[1] + dir[1]];
            if(newNode[0] >= 0 && newNode[0] < this.width && newNode[1] >= 0 && newNode[1] < this.height) {
                res.push(newNode);
            }
        });
        return res;
    }
    addEdge(start, end) {
        this.edges.push([start, end]);
        this.adjMap.get(this.XYToNum(start)).push(this.XYToNum(end));
        this.adjMap.get(this.XYToNum(end)).push(this.XYToNum(start));
    }
    
    shuffle(array) {
        let currentIndex = array.length,  randomIndex;
        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    generate(node) {
        this.visited[this.XYToNum(node)] = true;
        let neighbours = this.getNeighbours(node);
        neighbours = this.shuffle(neighbours);
        for(let i = 0; i < neighbours.length; i++) {
            if(!this.visited[this.XYToNum(neighbours[i])]) {
                this.addEdge(node, neighbours[i])
                this.generate(neighbours[i]);
            }
        }
    }
    makeBFS(startingNode) {
        const queue = [startingNode];
        this.visitedBFS.add(startingNode);
        this.prevNode[startingNode] = startingNode;
        while(queue.length > 0) {
            const node = queue.shift();   
            const neighbours = this.adjMap.get(node);
            neighbours.forEach(item => {
                if(!this.visitedBFS.has(item)) {
                    this.prevNode[item] = node;
                    this.visitedBFS.add(item);
                    queue.push(item);
                }
            });
            
        }
    }
    findPath(node) {
        let path = [node];
        while(this.prevNode[node] != this.root || this.prevNode[node] == -1) {
           node = this.prevNode[node];

           path.push(node);
        }
        return path;

    }
    makeMaze(startingNode, endingNode) {
        this.root = this.XYToNum(startingNode);
        this.prevNode.fill(this.root);
        this.generate(startingNode);
        this.makeBFS(this.root);
        
        this.prevNode[this.root] = -1;
        this.path = this.findPath(this.XYToNum(endingNode));
        for (let i = 0; i < this.path.length; i++) {
            this.path[i] = this.numToXY(this.path[i]);
        }
        this.path.push(this.numToXY(this.root));
    }
    findEdge(start, end) {
        let found = false;
        this.edges.forEach(edge => {
            const case0 = (start[0] == edge[0][0]) && (start[1] == edge[0][1]) &&
                (end[0] == edge[1][0]) && (end[1] == edge[1][1])
            const case1 = (end[0] == edge[0][0]) && (end[1] == edge[0][1]) &&
                (start[0] == edge[1][0]) && (start[1] == edge[1][1])
            if(case0 || case1) {
                found = true;
            }
        });
        return found;
    }

 
}
export {Maze};