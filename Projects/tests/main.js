Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(600, 400)
);

Engine.SetInitFunction(INIT)
Engine.SetLoopFunction(GAMELOGIC)

Engine.Start()

async function INIT(){
	//Gets called once when the engine is started
}

async function GAMELOGIC(delta){
	//Game loop, gets called once every frame
}


