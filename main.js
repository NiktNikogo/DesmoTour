/*TODO:
 * -maybe add the use of cubic bezier curves to make it more pretty?
 * -rgb(maybe, maybe not)
 */

import './style.css'
import { Maze } from './maze'
import Desmos from 'desmos'
import { MazeDesmos } from './mazeDesmos'
import { MazeGeogebra } from './mazeGeogebra'

const mazeWidth = 8;
const mazeHeight = 8;

//const startNode = [0, 0];
//const endNode = [mazeWidth - 1, mazeHeight - 1];
const startNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];
const endNode = [Math.floor(Math.random() * mazeWidth), Math.floor(Math.random() * mazeHeight)];

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

let myMaze = new Maze(mazeWidth, mazeHeight);

myMaze.makeMaze(startNode, endNode);
const desmosElt = document.getElementById('desmos');
const geogebraElt = document.getElementById('geogebra');

const calculator = Desmos.GraphingCalculator(desmosElt);
let myDesmos = new MazeDesmos(myMaze, calculator);
//seting up the matrix, new axis, trtansalation vector, start and end nodes
myDesmos.setupVariables();
myDesmos.setupStartEnd(startNode, endNode);

//generating all the equations
myDesmos.makeNormalPath();
myDesmos.makeSplinePath();
myDesmos.makeBezierPath();
myDesmos.makeMazeEdges();

//adding all the equations to desmos

myDesmos.graphNornalPath();
myDesmos.graphSplinePath();
myDesmos.graphBezierPath();
myDesmos.graphMazeEdges();

let params = { "appName": "graphing", "width": geogebraElt.offsetWidth, "height": geogebraElt.offsetHeight, "showToolBar": true, "showAlgebraInput": true, "showMenuBar": true };
let geogebra = new GGBApplet(params, true);
window.addEventListener("load", function () {
    geogebra.inject('geogebra');
});
let myGeogebra = new MazeGeogebra(maze, geogebra);
for(var i =0;i<10;i++) 
    geogebra.evalCommand("A_"+i+"=(random()*10,random()*10)");
myGeogebra.setupVariables();