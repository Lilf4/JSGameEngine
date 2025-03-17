Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(800, 800),
	60,
	true
);

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

Engine.vertexShader = VertexShader;

Engine.inFocus = false;
Engine.Start();

async function INIT(){
	//Gets called once when the engine is started
}

let u_custom_time = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_c_time");
let timeScaleValue = 1.0;
let time = 0;

async function GAMELOGIC(delta){
	Engine.postProcessingCtx.uniform1f(u_custom_time, time);
	time += delta * timeScaleValue;
}


let u_timescale = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_timeScale");
let u_color_thingie = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_colorThingie");
let u_pipe_color_thingie = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_pipeColorThingie");

let colorThing = {x: 0.6, y: -0.4, z: -1.0}
let pipeColorThing = {x: 0.9, y: 0.9, z: 1.1}
function ChangeShader(val){
	document.getElementById("HoleThingie").classList.add("hide")
	document.getElementById("PipeThingie").classList.add("hide")

	switch (val){
		case "1":
			Engine.fragmentShader = HoleThingie;
			document.getElementById("HoleThingie").classList.remove("hide")
			break;
		case "2":
			Engine.fragmentShader = FancyLights;
			break;
		case "3":
			Engine.fragmentShader = Pipes;
			document.getElementById("PipeThingie").classList.remove("hide")
			break;
	}

	Engine.RecompileShader();
	u_custom_time = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_c_time");
	u_color_thingie = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_colorThingie");
	u_pipe_color_thingie = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_pipeColorThingie");
	UpdateColorThingie()
	UpdatePipeColorThingie()
}

function ChangeTimeScale(val){
	timeScaleValue = val
}

function UpdateColorThingie(){
	colorThing.x = document.getElementById("colorThingieX").value;
	colorThing.y = document.getElementById("colorThingieY").value;
	colorThing.z = document.getElementById("colorThingieZ").value;
	Engine.postProcessingCtx.uniform3f(u_color_thingie, colorThing.x, colorThing.y, colorThing.z);
}

function UpdatePipeColorThingie(){
	pipeColorThing.x = document.getElementById("PipeColorThingieX").value;
	pipeColorThing.y = document.getElementById("PipeColorThingieY").value;
	pipeColorThing.z = document.getElementById("PipeColorThingieZ").value;
	Engine.postProcessingCtx.uniform3f(u_pipe_color_thingie, pipeColorThing.x, pipeColorThing.y, pipeColorThing.z);
}

ChangeShader("1")
