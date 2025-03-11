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
	playerChar.Play();
	playerChar.is_on_floor = true
}

spriteY = 200-playerChar.spriteSize.y/2

function getNormal(playerX, playerY, object) {
    // Calculate the distances from the player to the rectangle's sides
    const dxLeft = object.position.x - playerX;
    const dxRight = playerX - (object.position.x + object.image.width);
    const dyTop = object.position.y - playerY;
    const dyBottom = (playerY-1) - (object.position.y + object.image.height);

    // Determine the closest side
    const distances = {
      left: dxLeft,
      right: dxRight,
      top: dyTop,
      bottom: dyBottom
    };

    // Find the minimum distance (ignoring negative distances)
    const minDistanceSide = Object.keys(distances).reduce((minKey, key) =>
      distances[key] >= 0 && (minKey === null || distances[key] < distances[minKey]) ? key : minKey
    );
	console.log(minDistanceSide)

    // Return the normal based on the closest side
    switch (minDistanceSide) {
      case 'left':
        return { x: -1, y: 0 };
      case 'right':
        return { x: 1, y: 0 };
      case 'top':
        return { x: 0, y: -1 };
      case 'bottom':
        return { x: 0, y: 1 };
      default:
        return { x: 0, y: 0 }; // Inside the rectangle, no collision
    }
  }


function collideWithPlayer(){
	let collisions = Engine.GetCollidingObjects(playerChar).find(obj => obj.tags.includes("STATIC"));
	if (collisions != undefined) {
		let colDir = getNormal(playerChar.position.x, playerChar.position.y, collisions)
		console.log(collisions)
		if (colDir.y = -1) {
			playerChar.is_on_floor = true;
			playerChar.position.y = (playerChar.position.y + collisions.image.height/2)-9
		}
	}
	else {
		// playerChar.is_on_floor = false
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


