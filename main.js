import './style.css'
import {Maze} from './maze'
import Desmos from 'desmos'
const graphWidth = 2400;
const graphHeight = 1200;
const mazeWidth = 8;
const mazeHeight = 8;
const transBounds = Math.max(mazeWidth, mazeHeight) * 4;

const startNode = [0, 0];
const endNode = [mazeWidth - 1, mazeHeight - 1];
//const startNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
//const endNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
function getCut(listOfPoints, line) {
    return String.raw`\frac{1}{2}\sqrt{2\left(\frac{${listOfPoints}}{\left|\left(${listOfPoints}\right)\right|}+1\right)}${line}`;
}   
/*TODO:
 * -połączenie path jako jednej krzywej
 * -stowrzenie bezier jako jednej krzywej
 * -rgb(może, może nie)
 */

let myMaze = new Maze(mazeWidth, mazeHeight);
myMaze.makeMaze(startNode, endNode);
const elt = document.createElement('div');
elt.style.width = `${graphWidth}px`;
elt.style.height = `${graphHeight}px`; 

const calculator = Desmos.GraphingCalculator(elt);
calculator.setExpressions([
    {latex:`v_x = ${transBounds/4}`, sliderBounds: { min: -transBounds, max: transBounds, step: 0.01 }},
    {latex:`v_y = ${transBounds/4}`, sliderBounds: { min: -transBounds, max: transBounds, step: 0.01 }},
    {latex:String.raw`\left(v_x,v_y\right)`}
])
let horLines = [];
let verLines = [];
// myMaze.edges.forEach(edge => {
//     calculator.setExpression({
//         color: '#ff00ff',
//         latex: `(${edge[0][0] * 1}(1-t) + ${edge[1][0] * 1}t, ${edge[0][1] * 1}(1-t) + ${edge[1][1] * 1}t )`});
// });
for (let i = 0; i < myMaze.path.length - 1; i++) {
    const start = myMaze.path[i];
    const end = myMaze.path[i + 1];
    calculator.setExpression({
        color: '#00ffff',
        latex: `(${start[0] * 1}(1-t) + ${end[0] * 1}t + v_x, ${start[1] * 1}(1-t) + ${end[1] * 1}t + v_y)`});
}

//horizontal lines:
let finalHori = '';
for(let i = mazeHeight + 1; i-- ; i > 0) {
    let wall = [];
    let passage = [];
    for(let j = 0; j <= mazeWidth; j++) {
        wall.push(-0.5 + j);
    }
    passage = passage.slice(1);
    for(let j = 0; j < mazeWidth; j++) {
        if(myMaze.findEdge([wall[j] + 0.5, i], [wall[j] + 0.5, i - 1])) passage.push('-');
        else passage.push('+');
    
    } 
    passage.push('-');
    let eq = '-';
    let currSign = '-';
    for(let j = 0; j <= mazeWidth; j++) {
        if(passage[j] == currSign) eq += String.raw`\left(x - ${wall[j]}\right)^2`;
        else eq += String.raw`\left(x - ${wall[j]}\right)`;
        currSign = passage[j]
    }
    finalHori += getCut(eq.replaceAll('x', `x - ${mazeWidth * i}`), String.raw`\left(${i - 0.5}+v_y\right)`);
    if(i > 0) {
        finalHori += "+";
    }
}
calculator.setExpression({
    color:'#ff00aa',
    latex:String.raw`f\left(x\right)=${finalHori}`,
    hidden:true
})
calculator.setExpression({
    color:`#ffaa00`,
    latex: String.raw`\left(\operatorname{mod}\left(t+0.5,${mazeWidth}\right)-0.5+v_x,f\left(t\right)\right)`,
    parametricDomain:{ min:'-0.5', max:`${mazeWidth -0.5 + mazeWidth*mazeHeight}`}
})

//vertical lines:
let finalVert = '';
for(let i = mazeWidth + 1; i-- ; i > 0) {
    let wall = [];
    let passage = [];
    for(let j = 0; j <= mazeHeight; j++) {
        wall.push(-0.5 + j);
    }
    passage = passage.slice(1);
    for(let j = 0; j < mazeHeight; j++) {
        //[i, wall[j]+ 0.5], [i - 1, wall[j] +0.5
        if(myMaze.findEdge([i, wall[j] + 0.5], [i - 1, wall[j] + 0.5])) passage.push('-');
        else passage.push('+');
    
    } 
    passage.push('-');
    let eq = '-';
    let currSign = '-';
    for(let j = 0; j <= mazeHeight; j++) {
        if(passage[j] == currSign) eq += String.raw`\left(y - ${wall[j]}\right)^2`;
        else eq += String.raw`\left(y - ${wall[j]}\right)`;
        currSign = passage[j]
    }
    finalVert += getCut(eq.replaceAll('y', `y - ${mazeHeight * i}`), String.raw`\left(${i - 0.5}+v_x\right)`);
    if(i > 0) {
        finalVert += "+";
    }
}
calculator.setExpression({
    color:'#ff00aa',
    latex:String.raw`g\left(y\right)=${finalVert}`,
    hidden:true
})
calculator.setExpression({
    color:`#ffaa00`,
    latex: String.raw`\left(g\left(t\right),\operatorname{mod}\left(t+0.5,${mazeHeight}\right)-0.5+v_y\right)`,
    parametricDomain:{ min:'-0.5', max:`${mazeHeight -0.5 + mazeWidth*mazeHeight}`}
})

document.body.prepend(elt)