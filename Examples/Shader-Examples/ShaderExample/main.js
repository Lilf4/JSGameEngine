Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(800, 600),
	60,
	true
);

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);


async function INIT(){
	//Gets called once when the engine is started
}

let gObj = new CustomShapeObject({
	shape: BasicSquarePath,
	scale: new Vector2(4, 4),
	color: 'red'
})

Engine.AddObject(gObj)

async function GAMELOGIC(delta){
	let moveDir = new Vector2(0,0);
	if(Engine.IsKeyDown("a")){
		moveDir.x += -1;
	}
	if(Engine.IsKeyDown("d")){
		moveDir.x += 1;
	}
	if(Engine.IsKeyDown("s")){
		moveDir.y += -1;
	}
	if(Engine.IsKeyDown("w")){
		moveDir.y += 1;
	}

	gObj.position = gObj.position.add(moveDir.mult(delta * 100))
}

Engine.vertexShader = `attribute vec2 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);  // Positions of the vertices
    vTexCoord = aTexCoord;  // Pass texture coordinates
}`
Engine.fragmentShader = `precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vTexCoord;

void main() {
    vec4 O = vec4(0.0);
    float i = 1.0; // Start at 1.0 to prevent division by zero

    vec2 r = uResolution.xy;
    vec2 F = vTexCoord * uResolution; // Convert UV to pixel coordinates

    vec2 p = (F + F - r) / r.y / 0.7;
    vec2 d = vec2(-1.0, 1.0);
    vec2 q = 5.0 * p - d;

    vec2 c = p * mat2(1.0, 1.0, d / (0.1 + 5.0 / dot(q, q)));
    vec2 v = c * mat2(cos(log(length(c)) + uTime * 0.2 + vec4(0.0, 33.0, 11.0, 0.0))) * 5.0;

    for (int j = 0; j < 9; j++) { // Using an integer loop variable instead
        O += 1.0 + sin(v.xyyx);
        v += 0.7 * sin(v.yx * float(j) + uTime) / float(j + 1) + 0.5;
    }

    i = length(sin(v / 0.3) * 0.2 + c * vec2(1.0, 2.0)) - 1.0;

    O = 1.0 - exp(
        -exp(c.x * vec4(0.6, -0.4, -1.0, 0.0)) 
        / O
        / (1.0 + i * i)
        / (0.5 + 3.5 * exp(0.3 * c.y - dot(c, c)))
        / (0.03 + abs(length(p) - 0.7))
    );

    vec4 originalColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = originalColor += O;
}
`

Engine.Start();