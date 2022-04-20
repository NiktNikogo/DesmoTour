import { Maze } from './maze'
import Desmos from 'desmos'
import BezierSpline from 'bezier-spline'
import { makeTransformable, getCut, getBezier1st, getBezier2nd, getBezier3rd } from './graphUtils'

class MazeDesmos {
    constructor(maze, desmos) {
        this.maze = maze;
        this.desmos = desmos;
        [this.mazeWidth, this.mazeHeight] = maze.getDims();
        this.transBounds = Math.max(this.mazeWidth, this.mazeHeight) * 4;

    }
    setupVariables() {
        this.desmos.setExpressions([
            { latex: 'a = 1' },
            { latex: 'b = 0' },
            { latex: 'c = 0' },
            { latex: 'd = 1' },
            { latex: 'dx - by = 0', color: `#1C1CAE` },
            { latex: 'cx - ay = 0', color: `#1C1CAE` }
        ])
        this.desmos.setExpressions([
            { latex: `v_x = 1`, sliderBounds: { min: -this.transBounds, max: this.transBounds, step: 0.01 } },
            { latex: `v_y = 1`, sliderBounds: { min: -this.transBounds, max: this.transBounds, step: 0.01 } },
            { latex: String.raw`\left(v_x,v_y\right)`, label: 'Translation vector', showLabel: true },
            { latex: makeTransformable(String.raw`v_x`, String.raw`v_y`), label: 'Translation vector after transformation', showLabel: true, dragMode: Desmos.DragModes.NONE }
        ])
    }
    setupStartEnd(startNode, endNode) {
        this.desmos.setExpressions([
            {
                latex: String.raw`N_{start} = ${makeTransformable(String.raw`${startNode[0]} + v_x`, String.raw`${startNode[1]} + v_y`)}`, dragMode: Desmos.DragModes.NONE,
                label: 'Starting point', showLabel: true
            },
            {
                latex: String.raw`N_{start} = ${makeTransformable(String.raw`${endNode[0]} + v_x`, String.raw`${endNode[1]} + v_y`)}`, dragMode: Desmos.DragModes.NONE,
                label: 'Ending point', showLabel: true
            }
        ]);
    }
    makeNormalPath() {
        this.normalPathX = '';
        this.normalPathY = '';
        for (let i = 0; i < this.maze.path.length - 1; i++) {
            const start = this.maze.path[i];
            const end = this.maze.path[i + 1];
            let xline = String.raw`\left(${start[0]}(1-x) + ${end[0]}x +`.replaceAll('x', String.raw`\left(x - ${i}\right)`) + String.raw`v_x\right)`;
            let yline = String.raw`\left(${start[1]}(1-y) + ${end[1]}y +`.replaceAll('y', String.raw`\left(y - ${i}\right)`) + String.raw`v_y\right)`;
            this.normalPathX += getCut([i, i + 1], 'x', xline);
            this.normalPathY += getCut([i, i + 1], 'y', yline);
            if (i < this.maze.path.length - 2) {
                this.normalPathX += "+";
                this.normalPathY += "+";
            }
        }
    }
    graphNornalPath() {
        this.desmos.setExpressions([
            { color: '#00ff11', latex: String.raw`x_{RegularPath}\left(x\right)=` + this.normalPathX, hidden: true },
            { color: '#00ff11', latex: String.raw`y_{RegularPath}\left(y\right)=` + this.normalPathY, hidden: true },
            { latex: 't_{time} = 0', sliderBounds: { min: 0, max: this.maze.path.length - 2, step: 0.1 } },
            { color: '#ff0011', latex: makeTransformable(String.raw`x_{RegularPath}\left(t\right)`, String.raw`y_{RegularPath}\left(t\right)`), parametricDomain: { min: '0', max: `${this.maze.path.length}` } },
            { color: '#E30163', latex: makeTransformable(String.raw`x_{RegularPath}\left(t_{time}\right)`, String.raw`y_{RegularPath}\left(t_{time}\right)`), label: 'Current point', showLabel: true },
        ]);
    }
    makeSplinePath() {
        this.spline = new BezierSpline(this.maze.path);
        this.splineX = "";
        this.splineY = "";
        for (let i = 0; i < this.spline.curves.length; i++) {
            const bezier = this.spline.curves[i];
            this.splineX += getCut([i, i + 1], 'x', String.raw`\left( ${getBezier3rd(bezier[0][0], bezier[1][0], bezier[2][0], bezier[3][0], `x - ${i}`)} \right)`);
            this.splineY += getCut([i, i + 1], 'y', String.raw`\left( ${getBezier3rd(bezier[0][1], bezier[1][1], bezier[2][1], bezier[3][1], `y - ${i}`)} \right)`);
            if (i == this.spline.curves.length - 1) {
                this.splineX += '+ v_x';
                this.splineY += '+ v_y';
            } else {
                this.splineX += '+';
                this.splineY += '+';
            }
        }
    }
    graphSplinePath() {
        this.desmos.setExpressions([
            { color: `#C11B00`, latex: String.raw`x_{splinePath}\left(x\right)=${this.splineX}`, hidden: true },
            { color: `#C11B00`, latex: String.raw`y_{splinePath}\left(y\right)=${this.splineY}`, hidden: true },
            { latex: 't_{timeSpline} = 0', sliderBounds: { min: 0, max: this.spline.curves.length, step: 0.1 } },
            { color: '#39DA54', latex: makeTransformable(String.raw`x_{splinePath}\left(t\right)`, String.raw`y_{splinePath}\left(t\right)`), parametricDomain: { min: '0', max: `${this.spline.curves.length}` } },
            { color: '#EB3138', latex: makeTransformable(String.raw`x_{splinePath}\left(t_{timeSpline}\right)`, String.raw`y_{splinePath}\left(t_{timeSpline}\right)`), label: 'Current spline', showLabel: true }

        ])

    }
    makeBezierPath() {
        this.bezierPathX = '';
        this.bezierPathY = '';
        this.bezierCount = 0;
        this.maze.path.push(this.maze.path[this.maze.path.length - 1]);
        for (let i = 0; i < this.maze.path.length - 2; i++) {
            const start = this.maze.path[i];
            const middle = this.maze.path[i + 1];
            const end = this.maze.path[i + 2];
            const distSq = (start[0] - end[0]) * (start[0] - end[0]) + (start[1] - end[1]) * (start[1] - end[1]);

            let xBezier = '';
            let yBezier = '';
            if (distSq == 2) {
                xBezier += getCut([this.bezierCount, this.bezierCount + 1], 'x',
                    String.raw`\left(${getBezier2nd(start[0], middle[0], end[0], 'x').replaceAll('x', `x -${this.bezierCount}`)} + v_x\right)+`);
                yBezier += getCut([this.bezierCount, this.bezierCount + 1], 'y',
                    String.raw`\left(${getBezier2nd(start[1], middle[1], end[1], 'y').replaceAll('y', `y -${this.bezierCount}`)} + v_y\right)+`);
                this.bezierCount++;
                i++;
            } else {
                xBezier += getCut([this.bezierCount, this.bezierCount + 1], 'x',
                    String.raw`\left(${getBezier1st(start[0], middle[0], 'x').replaceAll('x', `x -${this.bezierCount}`)} + v_x\right)+`);
                yBezier += getCut([this.bezierCount, this.bezierCount + 1], 'y',
                    String.raw`\left(${getBezier1st(start[1], middle[1], 'y').replaceAll('y', `y -${this.bezierCount}`)} + v_y\right)+`);
                this.bezierCount++;
            }
            this.bezierPathX += xBezier;
            this.bezierPathY += yBezier;
        }
        this.maze.path.pop();
        this.bezierPathX = this.bezierPathX.slice(0, -1);
        this.bezierPathY = this.bezierPathY.slice(0, -1);

    }
    graphBezierPath() {
        this.desmos.setExpressions([
            { color: `#20BC97`, latex: String.raw`x_{bezierPath}\left(x\right)=${this.bezierPathX}`, hidden: true },
            { color: `#20BC97`, latex: String.raw`y_{bezierPath}\left(y\right)=${this.bezierPathY}`, hidden: true },
            { latex: 't_{timeBezier} = 0', sliderBounds: { min: 0, max: this.bezierCount, step: 0.1 } },
            { color: '#682845', latex: makeTransformable(String.raw`x_{bezierPath}\left(t\right)`, String.raw`y_{bezierPath}\left(t\right)`), parametricDomain: { min: '0', max: `${this.bezierCount}` } },
            { color: '#20BC97', latex: makeTransformable(String.raw`x_{bezierPath}\left(t_{timeBezier}\right)`, String.raw`y_{bezierPath}\left(t_{timeBezier}\right)`), label: 'Current bezier', showLabel: true }
        ])
    }
    makeMazeEdges() {
        //horizontal lines:
        this.finalHori = '';
        for (let i = this.mazeHeight + 1; i--; i > 0) {
            let currSign = '-';
            let roots = [];
            for (let j = 0; j <= this.mazeWidth; j++) {
                let sign = '-';
                if (j == this.mazeWidth) sign = '-';
                else if (!this.maze.findEdge([j, i], [j, i - 1])) sign = '+';
                if (sign != currSign) roots.push(j - 0.5 + this.mazeWidth * i);
                currSign = sign;
            }
            if (roots.length > 0) this.finalHori += getCut(roots, 'x', String.raw`\left(${i - 0.5}+v_y\right)`);
            if (i > 0) {
                this.finalHori += "+";
            }
        }
        //vertical lines:
        this.finalVert = '';
        for (let i = this.mazeWidth + 1; i--; i > 0) {
            let currSign = '-';
            let roots = [];
            for (let j = 0; j <= this.mazeHeight; j++) {
                let sign = '-';
                if (j == this.mazeHeight) sign = '-';
                else if (!this.maze.findEdge([i, j], [i - 1, j])) sign = '+';
                if (sign != currSign) roots.push(j - 0.5 + this.mazeHeight * i);
                currSign = sign
            }
            if (roots.length > 0) this.finalVert += getCut(roots, 'y', String.raw`\left(${i - 0.5}+v_x\right)`);
            if (i > 0) {
                this.finalVert += "+";
            }
        }

        this.combinedX = getCut([-0.5, this.mazeWidth - 0.5 + this.mazeWidth*this.mazeHeight], 'x', String.raw`\left(\operatorname{mod}\left(x+0.5,${this.mazeWidth}\right)-0.5+v_x\right) + `) +
            getCut([this.mazeWidth - 0.5 + this.mazeWidth*this.mazeHeight, this.mazeWidth - 0.5 + 2 * this.mazeWidth*this.mazeHeight + this.mazeHeight], 'x',
            `y_{horizonalOnly}(x - ${this.mazeHeight * this.mazeWidth + this.mazeHeight})`);
        this.combinedY = getCut([-0.5, this.mazeWidth - 0.5 + this.mazeWidth*this.mazeHeight], 'y', String.raw`x_{vertiaclOnly}\left(y\right) + `) + 
            getCut([this.mazeWidth - 0.5 + this.mazeWidth*this.mazeHeight, this.mazeWidth - 0.5 + 2 * this.mazeWidth*this.mazeHeight + this.mazeHeight], 'y',
            String.raw`\left(\operatorname{mod}\left(y+0.5 - ${this.mazeHeight * this.mazeWidth + this.mazeHeight},${this.mazeHeight}\right)-0.5+v_y\right)`)
    }
    graphMazeEdges() {
        this.desmos.setExpressions([
            { color:'#ff00aa', latex: String.raw`x_{vertiaclOnly}\left(x\right)=${this.finalHori}`, hidden:true},
            { color:'#ff00aa', latex: String.raw`y_{horizonalOnly}\left(y\right)=${this.finalVert}`, hidden:true},
            { color:`#ffaaaa`, latex: String.raw`x_{fullMaze}\left(x\right)=${this.combinedX}`, hidden:true},
            { color:`#ffaaaa`, latex: String.raw`y_{fullMaze}\left(y\right)=${this.combinedY}`, hidden:true},
            { color:`#22aaaa`, latex: makeTransformable(String.raw`x_{fullMaze}\left(t\right)`, String.raw`y_{fullMaze}\left(t\right)`), 
            parametricDomain:{min: '-0.5', max:`${this.mazeWidth - 0.5 + 2 * this.mazeWidth*this.mazeHeight + this.mazeHeight}`}}
        ]);
        
    }
}



export { MazeDesmos };
