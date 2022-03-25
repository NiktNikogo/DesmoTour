function translate(point, vec) {
    let newPoint = [];
    for (let i = 0; i < point.length; i++) {
        newPoint.push(point[i] + vec[i]);
    }
    return newPoint;
}
function scale(point, vec) {
    let newPoint = [];
    for (let i = 0; i < point.length; i++) {
        newPoint.push(point[i] * vec[i]);
    }
    return newPoint;
}
function transform(point, scaleVec, transVec) {
    let newPoint = [];
    for (let i = 0; i < point.length; i++) {
        newPoint.push(point[i] * scaleVec[i] + transVec[i]);
    }
    return newPoint;
}

export {
    translate,
    scale
};