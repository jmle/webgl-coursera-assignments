"use strict";

var canvas;
var gl;

var points = [];
var transformedPoints = [];

var NumTimesToSubdivide = 5;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Initialize our data for the Sierpinski Gasket
    // First, initialize the corners of our gasket with three points.
    var vertices = [
        vec2( -0.43, -0.25 ),
        vec2(  0,  0.5 ),
        vec2(  0.43, -0.25 )
    ];

    divideTriangle(vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

	prepareData();

    render();
};

function prepareData() {
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(transformedPoints), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

// Rotates the triangle the given amount of degrees
function rotateTriangles(degrees) {
	for (var i = 0; i < points.length; i++) {
		var v = points[i];
		var x = v[0], y = v[1];

		var d = Math.sqrt(x * x + y * y);
		var amount = degrees * d;

		var newX = x * Math.cos(amount) - y * Math.sin(amount);
		var newY = x * Math.sin(amount) + y * Math.cos(amount);
		transformedPoints[i] = vec2(newX, newY);
	}
}

function triangle( a, b, c ) {
    points.push( a, b, c );
    transformedPoints.push( a, b, c );
}

function divideTriangle( a, b, c, count ) {
    // check for end of recursion
    if ( count === 0 ) {
        triangle( a, b, c );
    } else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // four new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function changeDegrees(percentage) {
	// PI/2 is 90 degrees, multiplied by a certaing percentage
	var degrees = Math.PI / 2 * ((percentage - 50) * 8) / 100;
	rotateTriangles(degrees);

	prepareData();

    render();
}

