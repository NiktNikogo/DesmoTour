import './style.css'
import {Maze} from './maze'
import Desmos from 'desmos'
const graphWidth = 2400;
const graphHeight = 1200;
const mazeWidth = 8;
const mazeHeight = 8;

const startNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
const endNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
const cornersX = [ - 1/2,  + mazeWidth * 1 - 1/2]
const cornersY = [ - 1/2,  + mazeHeight * 1 - 1/2]
function getMod(x, n) {
    return String.raw`\operatorname{mod}\left(${x},\ ${n}\right)`;
}
/*TODO:
 * -otworzenie wejśćia i wyjścia labiryntu
 * -bezier by to wszystko w kupie było
 * -naprawienie złączenia tak by offset i scale działały(powinno być łatwe ale nwm)
 * -rgb(może, może nie)
 */

let myMaze = new Maze(mazeWidth, mazeHeight);
myMaze.makeMaze(startNode, endNode);
const elt = document.createElement('div');
elt.style.width = `${graphWidth}px`;
elt.style.height = `${graphHeight}px`; 

const calculator = Desmos.GraphingCalculator(elt);
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
        latex: `(${start[0] * 1}(1-t) + ${end[0] * 1}t, ${start[1] * 1}(1-t) + ${end[1] * 1}t )`});
}

horLines.push(String.raw`${0}<x<${mazeWidth}: ${cornersY[1]} \left\{ ${cornersX[0]}<${getMod('x', mazeWidth) + (-1/2).toString()}<${cornersX[1]} \right\},`);
for(let i = mazeHeight - 1; i >= 1; i--) {
    let currX = -0.5;
    let currY = (i + i - 1)/2;
    let eq = "";
    while(currX < mazeWidth - 1) {
        if(!myMaze.findEdge([currX + 0.5, currY + 0.5], [currX + 0.5, currY - 0.5])) {
            eq += `,${currX} < ${getMod('x', mazeWidth) + (-1/2).toString()} < ${currX + 1 }`;
        }
        currX += 1;
    }
    if(eq.length > 1) {
        horLines.push(String.raw`${i*mazeWidth}<x<${(i + 1)*mazeWidth}:${currY} \left\{ ${eq.slice(1)} \right\},`);
    }
}
horLines.push(String.raw`${mazeWidth * mazeHeight}<x<${mazeWidth * (mazeHeight + 1)}:${cornersY[0]} \left\{ ${cornersX[0]}<${getMod('x', mazeWidth) + (-1/2).toString()}<${cornersX[1]} \right\}`);

verLines.push(String.raw`${0}<y<${mazeHeight}: ${cornersX[0]} \left\{ ${cornersY[0]}<${getMod('y', mazeHeight) + (-1/2).toString()}<${cornersY[1]} \right\},`)
for(let i = mazeWidth - 1; i >= 1; i --) {
    let currX = (i + i - 1)/2;
    let currY = -0.5; 
    let eq = "";
    while(currY < mazeHeight - 1) {
        if(!myMaze.findEdge([currX + 0.5, currY + 0.5], [currX - 0.5, currY + 0.5])) {
            eq += `,${currY} < ${getMod('y', mazeHeight) + (-1/2).toString()} < ${currY + 1 }`;
        }
        currY += 1;
    }
    if(eq.length > 1) {
        verLines.push(String.raw`${i*mazeHeight}<y<${(i + 1)*mazeHeight}:${currX} \left\{ ${eq.slice(1)} \right\},`);
    }
}
verLines.push(String.raw`${mazeHeight * mazeWidth}<y<${mazeHeight * (mazeWidth + 1)}:${cornersX[1]} \left\{ ${cornersY[0]}<${getMod('y', mazeHeight) + (-1/2).toString()}<${cornersY[1]} \right\} `)

let fullHori = String.raw`Y(x)=\left\{`;
for(let i = 0; i < horLines.length; i++) {
    fullHori += horLines[i];
}
fullHori += String.raw`\right\}`;
calculator.setExpression({
    latex: fullHori,
    hidden: true
})
calculator.setExpression({
    latex:String.raw`\left(\operatorname{mod}\left(t,\ ${mazeWidth}\right)\ ${-1/2},\ Y\left(t\right)\right)`,
    parametricDomain: {min:'0', max:`${mazeWidth * (mazeHeight + 1)}`}
})

let fullVert = String.raw`X(y)=\left\{`;
for(let i = 0; i < verLines.length; i++) {
    fullVert += verLines[i];
}
fullVert += String.raw`\right\}`;
calculator.setExpression({
    latex: fullVert,
    hidden: true
})
calculator.setExpression({
    latex:String.raw`\left(X\left(t\right),\ \operatorname{mod}\left(t,${mazeHeight}\right)\ ${-1/2}\right)`,
    parametricDomain: {min:'0', max:`${mazeHeight * (mazeWidth + 1)}`}
})
document.body.prepend(elt)