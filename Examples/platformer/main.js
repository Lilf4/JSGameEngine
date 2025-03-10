Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(600, 400)
);

Engine.AddObject(playerChar)
CreateLeveL(Engine);

const gravity = 8

// Objects above ^
Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);
Engine.Start();

async function INIT(){
	setAnimation(playerSheets.idle);
	setImage('Resources/Block.png');
	playerChar.Play();
	playerChar.is_on_floor = true
}

spriteY = 200-playerChar.spriteSize.y/2

function collideWithPlayer(){
	let collisions = Engine.GetCollidingObjects(playerChar);
	if (collisions.length >= 1){
		for(let i = 0; i < collisions.length; i++){
			if (collisions[i].tag != "" || null) {
				if (collisions[i].tag == "static") {
					console.log("asd")

				}
			}
		}
	}

}

async function GAMELOGIC(delta){
	if (!playerChar.is_on_floor) {
		playerChar.velocityY -= gravity * delta
	}
	else if (playerChar.is_on_floor && playerChar.state != "jumping") {
		playerChar.velocityY 	= 0
		playerChar.state 		= "idle"
	}

	collideWithPlayer();

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

	if (playerChar.position.y <= -spriteY) { 
		playerChar.is_on_floor 	= true 
		playerChar.position.y 	= -spriteY
	}
}


