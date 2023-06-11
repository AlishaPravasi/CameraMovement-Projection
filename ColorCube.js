/**
 * Lab 4 - COMP3801 Spring 2021
 *   ColorCube - draw a rotating cube with six different color faces
 */

"use strict";

/**
 * Constructor
 * 
 * @param canvasID - string containing name of canvas to render.
 */
var rotateXDegrees = 0; 
var rotateYDegrees = 0;
var rotateZDegrees = 0;

function ColorCube(canvasID) {
  var t = this;  // save reference to this object for callbacks
  this.canvasID = canvasID;
  var canvas = this.canvas = document.getElementById(canvasID);
  if (!canvas) {
      alert("Canvas ID '" + canvasID + "' not found.");
      return;
  }
  
  var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!gl) {
      alert("WebGL isn't available in this browser");
      return;
  }

  // Find ratio of canvas width to height to correct stretching
  // that occurs when the viewport is not exactly square
  // (later this will be incorporated into the projection matrix).
  // Build a scale matrix to perform this correction (it is used in
  // the Render function).
  gl.viewport(0, 0, canvas.width, canvas.height);
  var aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1.0) {
    this.aspectScale = scalem(1.0/aspectRatio, 1.0, 1.0);
  } else {
    this.aspectScale = scalem(1.0, aspectRatio, 1.0);
  }
  
  gl.clearColor(0.3, 0.1, 0.1, 1.0);
  
  // Enable hidden-surface removal (draw pixel closest to viewer)
  gl.enable(gl.DEPTH_TEST);

  // Compile and link shaders
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);

  // Load vertex coordinates and colors into WebGL buffer
  this.cubeBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer );
  gl.bufferData(gl.ARRAY_BUFFER, this.cubeArray, gl.STATIC_DRAW );
  
  // Specify locations of vertex coordinates in buffer for vPosition
  var floatBytes = 4;  // number of bytes in a float value
  this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 6 * floatBytes, 0);
  gl.enableVertexAttribArray(this.vPosition);

  // Specify locations of vertex colors in buffer for vColor
  this.vColor = gl.getAttribLocation(this.shaderProgram, "vColor");
  gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 6 * floatBytes, 3 * floatBytes);
  gl.enableVertexAttribArray(this.vColor);
  
  // Get uniform variable location for transform matrix
  this.transformMat = gl.getUniformLocation(this.shaderProgram, "transformMat");
  
  
  // Set up callback to render a frame
  var render = function () 
  {
    t.Render();
  };
  
  // Define callback for change of slider value
  var sliderCallback = function (e) {
    // Update text display for slider
    var v = e.target.valueAsNumber;
    e.target.valueDisplay.textContent = v.toFixed(2);
    
  };
  
  // Set up sliders for user interface
  this.sliderIDs = ["cLong", "cLat", "cr", "fov", "nP", "fP"];
  var sliders = [];         // array of slider HTML elements
  var sliderValues = [];    // array of slider value HTML elements
  var sliderDefaults = [];  // array of slider reser values

  // Set up an object with all the sliders
  for (var i in this.sliderIDs) {
    var id = this.sliderIDs[i];
    var sliderID = this.canvasID + "-" + id + "-slider";
    sliders[id] = document.getElementById(sliderID);
    if (sliders[id] === null) {
      alert("Slider ID not found: " + sliderID);
      return;
    }
    var valueID = this.canvasID + "-" + id + "-value";
    sliderValues[id] = document.getElementById(valueID);
    if (sliders[id] === null) {
      alert("Slider value ID not found: " + sliderID);
      return;
    }
    sliders[id].valueDisplay = sliderValues[id];  // attach to slider
    
    // Set callback on slider input
    sliders[id].addEventListener("input", sliderCallback);
    
    // Save initial value for reset
    sliderDefaults[id] = sliders[id].valueAsNumber;
  }
  this.sliders = sliders; 
    
    
    var butn1 = document.getElementById("btn");
    var isPlaying = false;
    butn1.addEventListener("click", function()
    {
        isPlaying = !isPlaying;
        if(isPlaying === true)
        {
            animate();
        }
    });
    var animate = function()
    {
        if(isPlaying === false)
        {
            return;
        }
        rotateYDegrees += 2;
        render();
        requestAnimationFrame(animate);
    }; 
};

ColorCube.prototype.cubeArray = Float32Array.of(
         0.25,  -0.25,  -0.25,  // +x face / cyan
         0.0,   1.0,   1.0,
         0.25,   0.25,  -0.25,
         0.0,   1.0,   1.0,
         0.25,  -0.25,   0.25,
         0.0,   1.0,   1.0,
         0.25,   0.25,   0.25,
         0.0,   1.0,   1.0,

        -0.25,  -0.25,   0.25,  // -x face / red
         1.0,   0.0,   0.0,
        -0.25,   0.25,   0.25,
         1.0,   0.0,   0.0,
        -0.25,  -0.25,  -0.25,
         1.0,   0.0,   0.0,
        -0.25,   0.25,  -0.25,
         1.0,   0.0,   0.0,

        -0.25,   0.25,  -0.25,  // +y face / magenta
         1.0,   0.0,   1.0,
        -0.25,   0.25,   0.25,
         1.0,   0.0,   1.0,
         0.25,   0.25,  -0.25,
         1.0,   0.0,   1.0,
         0.25,   0.25,   0.25,
         1.0,   0.0,   1.0,

         0.25,  -0.25,  -0.25,  // -y face / green
         0.0,   1.0,   0.0,
         0.25,  -0.25,   0.25,
         0.0,   1.0,   0.0,
        -0.25,  -0.25,  -0.25,
         0.0,   1.0,   0.0,
        -0.25,  -0.25,   0.25,
         0.0,   1.0,   0.0,

        -0.25,  -0.25,   0.25,  // +z face / yellow
         1.0,   1.0,   0.0,
         0.25,  -0.25,   0.25,
         1.0,   1.0,   0.0,
        -0.25,   0.25,   0.25,
         1.0,   1.0,   0.0,
         0.25,   0.25,   0.25,
         1.0,   1.0,   0.0,

        -0.25,   0.25,  -0.25,  // -z face / blue
         0.0,   0.0,   1.0,
         0.25,   0.25,  -0.25,
         0.0,   0.0,   1.0,
        -0.25,  -0.25,  -0.25,
         0.0,   0.0,   1.0,
         0.25,  -0.25,  -0.25,
         0.0,   0.0,   1.0
     );
ColorCube.prototype.numVertices = 24;  // total number of vertices
ColorCube.prototype.faceVertices = 4;  // number of vertices in a face


/**
 * Render - draw the scene on the canvas
 * 
 */
ColorCube.prototype.Render = function() 
{
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
  var fov = this.sliders["fov"].valueAsNumber;
  var nP = this.sliders["nP"].valueAsNumber;
  var fP = this.sliders["fP"].valueAsNumber;
  var cLong = this.sliders["cLong"].valueAsNumber;
  var cLat = this.sliders["cLat"].valueAsNumber;
  var cRad = this.sliders["cr"].valueAsNumber;
  
  var aspect = this.canvas.width / this.canvas.height;   
  var projectionMat = perspective(fov, aspect, nP, fP);  
  
  var eye = vec3(
    cRad * Math.cos(radians(cLat)) * Math.cos(radians(cLong)),
    cRad * Math.cos(radians(cLat)) * Math.sin(radians(cLong)),
    cRad * Math.sin(radians(cLat)));
  var at = vec3(0.0, 0.0, 0.0);
  var up = vec3(0.0, 1.0, 0.0);
  var viewMat = lookAt(eye, at, up);
        
  var modelMat = mat4();  // Identity - no movement of the model
  modelMat = mult(modelMat, rotateX(rotateXDegrees));
  modelMat = mult(modelMat, rotateY(rotateYDegrees));
  modelMat = mult(modelMat, rotateZ(rotateZDegrees));
 
  var modelViewMat = mult(viewMat, modelMat);
  var modelViewProjectionMat = mult(projectionMat, modelViewMat);
  
  // Set transformation matrix for shader
  gl.uniformMatrix4fv(this.transformMat, false, flatten(modelViewProjectionMat));

  // Draw each face as a 2-triangle (4-vertex) strip
  for (var start = 0; start < this.numVertices; start += this.faceVertices)
  {
    gl.drawArrays(gl.TRIANGLE_STRIP, start, this.faceVertices);
  }
};