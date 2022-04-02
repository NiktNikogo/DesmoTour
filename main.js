import './style.css'
import {Maze} from './maze'
import Desmos from 'desmos'
const graphWidth = 2400;
const graphHeight = 1200;
const mazeWidth = 10;
const mazeHeight = 10;
const transBounds = Math.max(mazeWidth, mazeHeight) * 4;

const startNode = [0, 0];
const endNode = [mazeWidth - 1, mazeHeight - 1];
//const startNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
//const endNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
function comparePoints(p0, p1) {
    return p0[0] == p1[0] && p0[1] == p1[1];
}
function getCut(boundingPolynomial, func) {
    return String.raw`\frac{1}{2}\sqrt{2\left(\frac{${boundingPolynomial}}{\left|\left(${boundingPolynomial}\right)\right|}+1\right)}${func}`;
}
function getBezier2nd(p0, p1, p2, variable) {
    variable = String.raw`\left(${variable}\right)`;
    return String.raw`${p0}\cdot\left(1-${variable}\right)^{2}+${p1}\cdot2${variable}\left(1-${variable}\right)+${p2}\cdot ${variable}^{2}`;
}
function getBezier1st(p0, p1, variable) {
    variable = String.raw`\left(${variable}\right)`;
    return String.raw`${p0}(1-${variable}) + ${p1}${variable}`;
}
/*TODO:
 * -maybe add the use of cubic bezier curves to make it more pretty?
 * -rgb(maybe, maybe not)
 */

let myMaze = new Maze(mazeWidth, mazeHeight);
myMaze.makeMaze(startNode, endNode);
const elt = document.createElement('div');
elt.style.width = `${graphWidth}px`;
elt.style.height = `${graphHeight}px`; 

const calculator = Desmos.GraphingCalculator(elt);
calculator.setExpressions([
    {latex:`v_x = 1`, sliderBounds: { min: -transBounds, max: transBounds, step: 0.01 }},
    {latex:`v_y = 1`, sliderBounds: { min: -transBounds, max: transBounds, step: 0.01 }},
    {latex:String.raw`\left(v_x,v_y\right)`}
])

calculator.setExpressions([
    {latex:String.raw`N_{start} = \left(${startNode[0]} + v_x, ${startNode[1]} + v_y \right)`, dragMode: Desmos.DragModes.NONE,
        label:'Starting point', showLabel: true},
    {latex:String.raw`N_{start} = \left(${endNode[0]} + v_x, ${endNode[1]} + v_y \right)`, dragMode: Desmos.DragModes.NONE,
        label:'Ending point', showLabel: true}
]);
//path from startingNode to endNode:
let normalPathX = '';
let normalPathY = '';
for(let i = 0; i < myMaze.path.length -1; i++) {
    const start = myMaze.path[i];
    const end = myMaze.path[i + 1];
    let xline = String.raw`\left(${start[0]}(1-x) + ${end[0]}x +`.replaceAll('x', String.raw`\left(x - ${i}\right)`) + String.raw`v_x\right)`;
    let yline = String.raw`\left(${start[1]}(1-y) + ${end[1]}y +`.replaceAll('y', String.raw`\left(y - ${i}\right)`) + String.raw`v_y\right)`;

    normalPathX += getCut(String.raw`-\left(x - ${i}\right)\left(x - ${i + 1}\right)`, xline);
    normalPathY += getCut(String.raw`-\left(y - ${i}\right)\left(y - ${i + 1}\right)`, yline);
    if(i < myMaze.path.length - 2) {
        normalPathX += "+";
        normalPathY += "+";
    }
}

//drawing path
calculator.setExpressions([
    {color: '#00ff11', latex: String.raw`x_{RegularPath}\left(x\right)=` + normalPathX, hidden: true},
    {color: '#00ff11', latex: String.raw`y_{RegularPath}\left(y\right)=` + normalPathY, hidden: true},
    {latex: 't_{time} = 0', sliderBounds:{min:0,  max:myMaze.path.length - 2, step:0.1}},
    {color: '#ff0011', latex: String.raw`\left( x_{RegularPath}\left(t\right), y_{RegularPath}\left(t\right) \right)`, parametricDomain:{min:'0', max:`${myMaze.path.length}`}},
    {color: '#E30163', latex: String.raw`\left( x_{RegularPath}\left(t_{time}\right), y_{RegularPath}\left(t_{time}\right) \right)`, label:'Current point', showLabel: true}
]);


//path fromed from bezier curves
let bezierPathX = '';
let bezierPathY = '';
let bezierCount = 0;
myMaze.path.push(myMaze.path[myMaze.path.length - 1]);
for(let i = 0; i < myMaze.path.length - 2; i++) {
    const start = myMaze.path[i];
    const middle = myMaze.path[i + 1];
    const end = myMaze.path[i + 2];
    const distSq = (start[0] - end[0]) * (start[0] - end[0]) + (start[1] - end[1]) * (start[1] - end[1]);

    let xBezier = '';
    let yBezier = '';
    if(distSq == 2) {
        xBezier += getCut(String.raw`-\left(x - ${bezierCount}\right)\left(x - ${bezierCount + 1}\right)`, 
            String.raw`\left(${getBezier2nd(start[0], middle[0], end[0], 'x').replaceAll('x', `x -${bezierCount}`)} + v_x\right)+`);
        yBezier += getCut(String.raw`-\left(y - ${bezierCount}\right)\left(y - ${bezierCount + 1}\right)`, 
            String.raw`\left(${getBezier2nd(start[1], middle[1], end[1], 'y').replaceAll('y', `y -${bezierCount}`)} + v_y\right)+`);
        bezierCount++;
        i++;
    } else {
        xBezier += getCut(String.raw`-\left(x - ${bezierCount}\right)\left(x - ${bezierCount + 1}\right)`, 
            String.raw`\left(${getBezier1st(start[0], middle[0], 'x').replaceAll('x', `x -${bezierCount}`)} + v_x\right)+`);
        yBezier += getCut(String.raw`-\left(y - ${bezierCount}\right)\left(y - ${bezierCount + 1}\right)`, 
            String.raw`\left(${getBezier1st(start[1], middle[1], 'y').replaceAll('y', `y -${bezierCount}`)} + v_y\right)+`);
        bezierCount++;
    }
    bezierPathX += xBezier;
    bezierPathY += yBezier;
}
myMaze.path.pop();
bezierPathX = bezierPathX.slice(0, -1);
bezierPathY = bezierPathY.slice(0, -1);

//drawing bezierpath
calculator.setExpressions([
    {color: `#20BC97`, latex:String.raw`x_{bezierPath}\left(x\right)=${bezierPathX}`, hidden: true},
    {color: `#20BC97`, latex:String.raw`y_{bezierPath}\left(y\right)=${bezierPathY}`, hidden: true},
    {latex: 't_{timeBezier} = 0', sliderBounds:{min:0,  max:bezierCount, step:0.1}},
    {color: '#682845', latex: String.raw`\left( x_{bezierPath}\left(t\right), y_{bezierPath}\left(t\right) \right)`, parametricDomain:{min:'0', max:`${bezierCount}`}},
    {color: '#20BC97', latex: String.raw`\left( x_{bezierPath}\left(t_{timeBezier} \right), y_{bezierPath}\left(t_{timeBezier} \right) \right)`, label:'Current bezier', showLabel: true}
])

//horizontal lines:
let finalHori = '';
for(let i = mazeHeight + 1; i-- ; i > 0) {
    let wall = [];
    let passage = [];
    let eq = '-';
    let currSign = '-';

    for(let j = 0; j <= mazeWidth; j++) {
        wall.push(-0.5 + j);
        if(j == mazeWidth) {
            passage.push('-');
        } else {
            if(myMaze.findEdge([wall[j] + 0.5, i], [wall[j] + 0.5, i - 1])) passage.push('-');
            else passage.push('+');
        }
        if(passage[j] == currSign) eq += String.raw`\left(x - ${wall[j]}\right)^2`;
        else eq += String.raw`\left(x - ${wall[j]}\right)`;
        currSign = passage[j]
    }

    finalHori += getCut(eq.replaceAll('x', `x - ${mazeWidth * i}`), String.raw`\left(${i - 0.5}+v_y\right)`);
    if(i > 0) {
        finalHori += "+";
    }
}
//vertical lines:
let finalVert = '';
for(let i = mazeWidth + 1; i-- ; i > 0) {
    let wall = [];
    let passage = [];
    let eq = '-';
    let currSign = '-';

    for(let j = 0; j <= mazeHeight; j++) {
        wall.push(-0.5 + j);
        if(j == mazeWidth) {
            passage.push('-');
        } else {
            if(myMaze.findEdge([i, wall[j] + 0.5], [i - 1, wall[j] + 0.5])) passage.push('-');
            else passage.push('+');
        }
        if(passage[j] == currSign) eq += String.raw`\left(y - ${wall[j]}\right)^2`;
        else eq += String.raw`\left(y - ${wall[j]}\right)`;
        currSign = passage[j]
    }
    finalVert += getCut(eq.replaceAll('y', `y - ${mazeHeight * i}`), String.raw`\left(${i - 0.5}+v_x\right)`);
    if(i > 0) {
        finalVert += "+";
    }
}
let combinedX = getCut(String.raw`-\left( x - -0.5\right)\left( x - ${mazeWidth - 0.5 + mazeWidth*mazeHeight} \right)`, 
            String.raw`\left(\operatorname{mod}\left(x+0.5,${mazeWidth}\right)-0.5+v_x\right) + `) +
            getCut(String.raw`-\left( x - ${mazeWidth - 0.5 + mazeWidth*mazeHeight}\right)\left(x - ${mazeWidth - 0.5 + 2 * mazeWidth*mazeHeight + mazeHeight }\right)`,
            `y_{horizonalOnly}(x - ${mazeHeight * mazeWidth + mazeHeight})`);
let combinedY = getCut(String.raw`-\left( y - -0.5\right)\left( y - ${mazeWidth - 0.5 + mazeWidth*mazeHeight} \right)`,
            String.raw`x_{vertiaclOnly}\left(y\right) + `) + 
            getCut(String.raw`-\left( y - ${mazeWidth - 0.5 + mazeWidth*mazeHeight}\right)\left(y - ${mazeWidth - 0.5 + 2 * mazeWidth*mazeHeight + mazeHeight }\right)`,
            String.raw`\left(\operatorname{mod}\left(y+0.5 - ${mazeHeight * mazeWidth + mazeHeight},${mazeHeight}\right)-0.5+v_y\right)`)
//drawing verical and horizontal lines of the maze
calculator.setExpressions([
    { color:'#ff00aa', latex: String.raw`x_{vertiaclOnly}\left(x\right)=${finalHori}`, hidden:true},
    { color:'#ff00aa', latex: String.raw`y_{horizonalOnly}\left(y\right)=${finalVert}`, hidden:true},
    { color:`#ffaaaa`, latex: String.raw`x_{fullMaze}\left(x\right)=${combinedX}`, hidden:true},
    { color:`#ffaaaa`, latex: String.raw`y_{fullMaze}\left(y\right)=${combinedY}`, hidden:true},
    { color:`#22aaaa`, latex: String.raw`\left(x_{fullMaze}\left(t\right), y_{fullMaze}\left(t\right)\right)`, parametricDomain:{min: '-0.5', max:`${mazeWidth - 0.5 + 2 * mazeWidth*mazeHeight + mazeHeight}`}}
]);


document.body.prepend(elt)