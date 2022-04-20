class MazeGeogebra {
    constructor(maze, geogebra) {
        this.maze = maze;
        this.geogebra = geogebra;
        [this.mazeWidth, this.mazeHeight] = maze.getDims();
        this.transBounds = Math.max(this.mazeWidth, this.mazeHeight) * 4;

    }
    setupVariables() {
        this.geogebra.evalCommand("a = 1");
    }
}

export { MazeGeogebra }