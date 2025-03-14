Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(800, 800),
	60,
	true
);

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

Engine.vertexShader = VertexShader;
Engine.fragmentShader = HoleThingie;

Engine.Start();

async function INIT(){
	//Gets called once when the engine is started
}

async function GAMELOGIC(delta){
	//Game loop, gets called once every frame
}

let u_timescale = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_timeScale");

function ChangeShader(val){
	switch (val){
		case "1":
			Engine.fragmentShader = HoleThingie;
			break;
		case "2":
			Engine.fragmentShader = FancyLights;
			break;
		case "3":
			Engine.fragmentShader = Pipes;
			break;
	}
	Engine.RecompileShader();
	u_timescale = Engine.postProcessingCtx.getUniformLocation(Engine.PostProcessingProgram, "u_timeScale");
}


function ChangeTimeScale(val){
	Engine.postProcessingCtx.uniform1f(u_timescale, val);
}