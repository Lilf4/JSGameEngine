Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(600, 400)
);

Engine.AddObject(playerChar)

// Objects above ^
Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);
Engine.Start();

async function INIT(){
	setAnimation(playerSheets.idle);
	playerChar.Play();
}

async function GAMELOGIC(delta){
	if (!UserInput()) {
		if (playerChar.state != "jumping" || playerChar.is_on_floor) {
			playerChar.state = "idle"
			setAnimation(playerSheets.idle) 
		}
	}

}


