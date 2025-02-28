//#region PlayerCharacter
// Player object with custom attributes
let playerChar = new ImageAnimObject({
    position		: new Vector2(0, -185),
	fps				: 24,
	animDirection	: 1,
	state			: ["idle", "moving", "jumping"],
	is_on_floor		: true,
	velocityY		: 0
});

// Player speed
let move_speed = 120.0

// Animation sheets for the players various animations
playerSheets = {
	idle	: ['Resources/Mask-Dude/Idle.png', 	new Vector2(11,1), 	14], 
	run		: ['Resources/Mask-Dude/Run.png', 	new Vector2(12,1), 	24],
	jump	: ['Resources/Mask-Dude/Jump.png', 	new Vector2(1,1), 	24],
	fall	: ['Resources/Mask-Dude/Fall.png', 	new Vector2(1,1), 	24]
}

async function setAnimation(anim){
	playerChar.image = await resManager.LoadImage(anim[0]);
	playerChar.SetSpriteDataByColRowCount(anim[1]);
	playerChar.fps = anim[2]
}

function moveCharacter(character, speed = 100, delta){
	character.position.x += speed * delta
}

// Inputs from the player
function UserInput(delta){
	if (Engine.IsKeyDown(' ') && playerChar.velocityY == 0) {
		if (playerChar.is_on_floor == false) return;
		playerChar.state = "jumping"
		playerChar.is_on_floor = false
		playerChar.velocityY += 2
		setAnimation(playerSheets.jump)
	}
	else if (Engine.IsKeyPressed('v')) {
		playerChar.is_on_floor = true
	}
	else if (Engine.IsKeyDown('d')){
		playerChar.scale.x = 1;
		moveCharacter(playerChar, move_speed, delta);
		if (playerChar.is_on_floor == false) return true;		
		playerChar.state = "moving"
		setAnimation(playerSheets.run)
		return true
	}
	else if (Engine.IsKeyDown('a')){
		playerChar.scale.x = -1
		moveCharacter(playerChar, -move_speed, delta);
		if (playerChar.is_on_floor == false) return true;		
		playerChar.state = "moving"
		setAnimation(playerSheets.run)
		return true
	}
	return false;
}
//#endregion