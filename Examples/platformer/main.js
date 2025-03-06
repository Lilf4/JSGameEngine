Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(600, 400)
);

Engine.AddObject(playerChar)
Engine.AddObject(block)

const gravity = 8

// Objects above ^
Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);
Engine.Start();

async function INIT(){
	// CreateLeveL();
	setAnimation(playerSheets.idle);
	setImage('Resources/Block.png');
	playerChar.Play();
	playerChar.is_on_floor = true
}

async function GAMELOGIC(delta){
	if (!playerChar.is_on_floor) {
		playerChar.velocityY -= gravity * delta
	}
	else if (playerChar.is_on_floor && playerChar.state != "jumping") {
		playerChar.velocityY 	= 0
		playerChar.state 		= "idle"
	}

	if (!UserInput(delta)) {
		if (playerChar.state != "jumping" || playerChar.is_on_floor) {
			playerChar.state = "idle"
			setAnimation(playerSheets.idle)
		}
	}
	
	if (playerChar.velocityY < 0) {
		playerChar.position.y += playerChar.velocityY * 2
		setAnimation(playerSheets.fall)
	} else { playerChar.position.y += playerChar.velocityY }

	spriteY = 200-playerChar.spriteSize.y/2
	if (playerChar.position.y <= -spriteY) { 
		playerChar.is_on_floor 	= true 
		playerChar.position.y 	= -spriteY
	}
}


