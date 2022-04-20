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


export {
    getCut,
    getBezier1st,
    getBezier2nd,
    getBezier3rd,
    makeTransformable
};