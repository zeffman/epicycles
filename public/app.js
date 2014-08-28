var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;
var cx = w/2;
var cy = h/2;
var drawing = false;
var DFT_epicycles = false;
var DFT_Rep;
var series_epicycles = false;
var series_rep;
var smoothness = 100;

var t = 0;

var x, y;
var X = [];
var Y = [];
var DFT_X = [];
var DFT_Y = [];
var series_X = [];
var series_Y = [];

canvas.onmousedown = function(e){
    if (X.length > 0){alert("Reset the canvas to continue drawing.");}
    else {
        drawing = true;
        //ctx.beginPath();
        //ctx.strokeStyle = "black";
        x = e.offsetX; y =  e.offsetY;
        //ctx.moveTo(x, y);
        X = X.concat(x);
        Y = Y.concat(y);
    }
};

canvas.onmousemove = function(e){
    if (drawing){
        x = e.offsetX; y =  e.offsetY;
        X.push(x);
        Y.push(y);
        //ctx.rect(20,20,50,50);
    }
};

canvas.onmouseup = function(e){drawing = false;};


function draw(){
    requestAnimationFrame(draw);
    drawSun();

    var N = X.length;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    drawPath(X, Y);
    if (!drawing){
        ctx.lineTo(X[0], Y[0]);
    }
    ctx.stroke();

    if (DFT_epicycles && DFT_X.length/smoothness < X.length){
        coords = DFT_Rep(t);
        DFT_X.push(coords[0]);
        DFT_Y.push(coords[1]);
        t += 1/smoothness;
    }
    ctx.beginPath()
    ctx.strokeStyle = "red";
    drawPath(DFT_X, DFT_Y);
    ctx.stroke();
    ctx.strokeStyle = "green";
    ctx
    if (series_epicycles && FX.length/smoothness < X.length){

    }
}

draw();


function drawSun(){
    ctx.beginPath();
    ctx.arc(cx, cy, w/10, 0, 2 * Math.PI, false);
    ctx.fillStyle = "yellow";
    ctx.strokeStyle = "yellow";
    ctx.fill();
    ctx.stroke();
}

function drawPath(X, Y){
    ctx.moveTo(X[0], Y[0]);
    var l = X.length;
    for (var i = 0; i < l; i++){ctx.lineTo(X[i], Y[i]);}
    ctx.stroke();
}

function clearCanvas(){
    X = [];
    Y = [];
    ctx.clearRect(0, 0, w, h);
    drawSun();
    DFT_epicycles = false;
    series_epicycles = false;
    DFT_X = [];
    DFT_Y = [];
    series_X = [];
    series_Y = [];
}

var math = mathjs();

function nth_root(n, k){ // nth root of unity to kth power
    return math.complex({r: 1, phi: 2*Math.PI * k/n})
}

function DFT_matrix(n){ //create the DFT matrix
    var matrix = [];
    for (var i = 0; i < n; i++){
        var row = new Array;
        for (var j = 0; j < n; j++){
            row.push( math.multiply(nth_root(n, -i*j), 1 / Math.sqrt(n)) );
        }
        matrix.push(row);
    }
    return matrix;
}


function R2toC(x,y){ //interpret the canvas as the square of side length 20 around the origin in the complex plane
    return math.complex((x - cx)/cx * 10, (cy - y)/cy * 10);
}

function CtoR2(z){
    return [z.re * cx/10 + cx, -(z.im * cy/10 - cy)]
}

function cis(phi){
    return math.complex({r : 1, phi: phi});
}

function DFT_Epicycles(){
    var signal = [];
    var N = X.length;
    for (var i = 0; i < N; i++){ //interpret the orbit as a periodic signal in C
        signal.push(R2toC(X[i], Y[i]));
    }
    var Signal = math.multiply(DFT_matrix(N), signal); //apply the DFT to the signal to decompose it into sums of circular orbits
    DFT_Rep = function(t){
        sum = math.complex(0,0);
        for (var k = 0; k < N; k++){
            var exponetial = cis(2*Math.PI * k*t/N);
            var new_term = math.multiply(exponetial, Signal[k]);
            sum = math.add(sum, new_term);
        }
        re