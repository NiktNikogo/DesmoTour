import './style.css'
import {Maze} from './maze'
import Desmos from 'desmos'
import BezierSpline from 'bezier-spline'

const graphWidth = 2400;
const graphHeight = 1200;
const mazeWidth = 8;
const mazeHeight = 8;
const transBounds = Math.max(mazeWidth, mazeHeight) * 4;

//const startNode = [0, 0];
//const endNode = [mazeWidth - 1, mazeHeight - 1];
const startNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
const endNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];

function getCut(roots, variable, func) {
    let eq = '-'
    roots.forEach(root => {
        eq += String.raw`\left(${variable} - ${root}\right)`;
    });
    return String.raw`0.5\left(\frac{${eq}}{\left|${eq}\right|}+1\right)${func}`;
}
function getBezier3rd(p0, p1, p2, p3, variable) {
    variable = String.raw`\left(${variable}\right)`;
    return String.raw`${p0}\left(1-${variable}\right)^{3}+${p1}\cdot3${variable}\left(1-${variable}\right)^{2}+${p2}\cdot3${variable}^{2}\left(1-${variable}\right)+${p3}${variable}^{3}`
}
function getBezier2nd(p0, p1, p2, variable) {
    variable = String.raw`\left(${variable}\right)`;
    return String.raw`${p0}\cdot\left(1-${variable}\right)^{2}+${p1}\cdot2${variable}\left(1-${variable}\right)+${p2}\cdot ${variable}^{2}`;
}
function getBezier1st(p0, p1, variable) {
    variable = String.raw`\left(${variable}\right)`;
    return String.raw`${p0}(1-${variable}) + ${p1}${variable}`;
}
function makeTransformable(xFunc, yFunc){
    return String.raw`{\left( a\left(${xFunc}\right) + b\left(${yFunc}\right), c\left(${xFunc}\right) + d\left(${yFunc}\right)\right)}`
}
//code to bypass the "Expressions nested too deeply" nuisance
//thanks to our saviour u/ScaredArea5563, link to the thread: 
window.Worker = new Proxy(Worker, {
    construct(target, args) {
        if (args[0].startsWith("blob:")) {
            const xhr = new XMLHttpRequest
            xhr.open("GET", args[0], false)
            xhr.send()
            const hooked = xhr.responseText
                .replace(/throw \w\.deeplyNested\(\)/g, `console.log("Bypassed nesting prevention")`)
            args[0] = URL.createObjectURL(new Blob([hooked]))
        }
        return new target(...args)
    }
})
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
//seting up the matrix and new axis
calculator.setExpressions([
    {latex: 'a = 1'},
    {latex: 'b = 0'},
    {latex: 'c = 0'},
    {latex: 'd = 1'},
    {latex: 'dx - by = 0', color:`#1C1CAE`},
    {latex: 'cx - ay = 0', color:`#1C1CAE`}
])
calculator.setExpressions([
    {latex:`v_x = 1`, sliderBounds: { min: -transBounds, max: transBounds, step: 0.01 }},
    {latex:`v_y = 1`, sliderBounds: { min: -transBounds, max: transBounds, step: 0.01 }},
    {latex:String.raw`\left(v_x,v_y\right)`, label:'Translation vector', showLabel: true},
    {latex:makeTransformable(String.raw`v_x`, String.raw`v_y`), label:'Translation vector after transformation', showLabel: true, dragMode: Desmos.DragModes.NONE}
])

calculator.setExpressions([
    {latex:String.raw`N_{start} = ${makeTransformable(String.raw`${startNode[0]} + v_x`, String.raw`${startNode[1]} + v_y`)}`, dragMode: Desmos.DragModes.NONE,
        label:'Starting point', showLabel: true},
    {latex:String.raw`N_{start} = ${makeTransformable(String.raw`${endNode[0]} + v_x`, String.raw`${endNode[1]} + v_y`)}`, dragMode: Desmos.DragModes.NONE,
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
    normalPathX += getCut([i, i + 1], 'x', xline);
    normalPathY += getCut([i, i + 1], 'y', yline);
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
    {color: '#ff0011', latex: makeTransformable(String.raw`x_{RegularPath}\left(t\right)` ,String.raw`y_{RegularPath}\left(t\right)`), parametricDomain:{min:'0', max:`${myMaze.path.length}`}},
    {color: '#E30163', latex: makeTransformable(String.raw`x_{RegularPath}\left(t_{time}\right)`, String.raw`y_{RegularPath}\left(t_{time}\right)`), label:'Current point', showLabel: true},
]);

//spline curve
let spline = new BezierSpline(myMaze.path);
let splineX = "";
let splineY = "";
console.log(spline);
for(let i = 0; i < spline.curves.length; i++) {
    const bezier = spline.curves[i];
    splineX += getCut([i, i + 1], 'x', String.raw`\left( ${getBezier3rd(bezier[0][0], bezier[1][0], bezier[2][0], bezier[3][0], `x - ${i}`)} \right)`);
    splineY += getCut([i, i + 1], 'y', String.raw`\left( ${getBezier3rd(bezier[0][1], bezier[1][1], bezier[2][1], bezier[3][1], `y - ${i}`)} \right)`);
    if(i == spline.curves.length - 1) {
        splineX += '+ v_x';
        splineY += '+ v_y';
    } else {
        splineX += '+';
        splineY += '+';
    }
}
calculator.setExpressions([
    {color: `#C11B00`, latex:String.raw`x_{splinePath}\left(x\right)=${splineX}`, hidden: true},
    {color: `#C11B00`, latex:String.raw`y_{splinePath}\left(y\right)=${splineY}`, hidden: true},
    {latex: 't_{timeSpline} = 0', sliderBounds:{min:0,  max:spline.curves.length, step:0.1}},
    {color: '#39DA54', latex: makeTransformable(String.raw`x_{splinePath}\left(t\right)`, String.raw`y_{splinePath}\left(t\right)`), parametricDomain:{min:'0', max:`${spline.curves.length}`}},
    {color: '#EB3138', latex: makeTransformable(String.raw`x_{splinePath}\left(t_{timeSpline}\right)`, String.raw`y_{splinePath}\left(t_{timeSpline}\right)`), label:'Current spline', showLabel: true}

])

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
        xBezier += getCut([bezierCount, bezierCount + 1], 'x',
            String.raw`\left(${getBezier2nd(start[0], middle[0], end[0], 'x').replaceAll('x', `x -${bezierCount}`)} + v_x\right)+`);
        yBezier += getCut([bezierCount, bezierCount + 1], 'y',
            String.raw`\left(${getBezier2nd(start[1], middle[1], end[1], 'y').replaceAll('y', `y -${bezierCount}`)} + v_y\right)+`);
        bezierCount++;
        i++;
    } else {
        xBezier += getCut([bezierCount, bezierCount + 1], 'x',
            String.raw`\left(${getBezier1st(start[0], middle[0], 'x').replaceAll('x', `x -${bezierCount}`)} + v_x\right)+`);
        yBezier += getCut([bezierCount, bezierCount + 1], 'y',
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
    {color: '#682845', latex: makeTransformable(String.raw`x_{bezierPath}\left(t\right)`,String.raw`y_{bezierPath}\left(t\right)`), parametricDomain:{min:'0', max:`${bezierCount}`}},
    {color: '#20BC97', latex: makeTransformable(String.raw`x_{bezierPath}\left(t_{timeBezier}\right)`, String.raw`y_{bezierPath}\left(t_{timeBezier}\right)`), label:'Current bezier', showLabel: true}
])

//horizontal lines:
let finalHori = '';
for(let i = mazeHeight + 1; i-- ; i > 0) {
    let currSign = '-';
    let roots = [];
    for(let j = 0; j <= mazeWidth; j++) {
        let sign = '-';
        if(j == mazeWidth) sign = '-';
        else if(!myMaze.findEdge([j, i], [j, i - 1])) sign = '+';
        if(sign != currSign) roots.push(j - 0.5 + mazeWidth * i);
        currSign = sign;
    }
    if(roots.length> 0) finalHori += getCut(roots, 'x', String.raw`\left(${i - 0.5}+v_y\right)`);
    if(i > 0) {
        finalHori += "+";
    }
}
//vertical lines:
let finalVert = '';
for(let i = mazeWidth + 1; i-- ; i > 0) {
    let currSign = '-';
    let roots = [];
    for(let j = 0; j <= mazeHeight; j++) {
        let sign = '-';
        if(j == mazeHeight) sign = '-';
        else if(!myMaze.findEdge([i, j], [i - 1, j]))sign = '+';
        if(sign != currSign) roots.push(j - 0.5 + mazeHeight * i);
        currSign = sign
    }
    if(roots.length > 0) finalVert += getCut(roots, 'y', String.raw`\left(${i - 0.5}+v_x\right)`);
    if(i > 0) {
        finalVert += "+";
    }
}
let combinedX = getCut([-0.5, mazeWidth - 0.5 + mazeWidth*mazeHeight], 'x', String.raw`\left(\operatorname{mod}\left(x+0.5,${mazeWidth}\right)-0.5+v_x\right) + `) +
            getCut([mazeWidth - 0.5 + mazeWidth*mazeHeight, mazeWidth - 0.5 + 2 * mazeWidth*mazeHeight + mazeHeight], 'x',
            `y_{horizonalOnly}(x - ${mazeHeight * mazeWidth + mazeHeight})`);
let combinedY = getCut([-0.5, mazeWidth - 0.5 + mazeWidth*mazeHeight], 'y', String.raw`x_{vertiaclOnly}\left(y\right) + `) + 
            getCut([mazeWidth - 0.5 + mazeWidth*mazeHeight, mazeWidth - 0.5 + 2 * mazeWidth*mazeHeight + mazeHeight], 'y',
            String.raw`\left(\operatorname{mod}\left(y+0.5 - ${mazeHeight * mazeWidth + mazeHeight},${mazeHeight}\right)-0.5+v_y\right)`)
calculator.setExpressions([
    { color:'#ff00aa', latex: String.raw`x_{vertiaclOnly}\left(x\right)=${finalHori}`, hidden:true},
    { color:'#ff00aa', latex: String.raw`y_{horizonalOnly}\left(y\right)=${finalVert}`, hidden:true},
    { color:`#ffaaaa`, latex: String.raw`x_{fullMaze}\left(x\right)=${combinedX}`, hidden:true},
    { color:`#ffaaaa`, latex: String.raw`y_{fullMaze}\left(y\right)=${combinedY}`, hidden:true},
    { color:`#22aaaa`, latex: makeTransformable(String.raw`x_{fullMaze}\left(t\right)`, String.raw`y_{fullMaze}\left(t\right)`), 
    parametricDomain:{min: '-0.5', max:`${mazeWidth - 0.5 + 2 * mazeWidth*mazeHeight + mazeHeight}`}}
]);

document.body.prepend(elt)