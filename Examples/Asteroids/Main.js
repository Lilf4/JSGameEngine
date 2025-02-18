let Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(1200, 800)
);

//TODO:
//Add asteroids
//Three stages, big, medium and small
//When destroyed big turns to 2 mediums, medium turns to 2 small, small dissapears
//Points: Big - 20, Medium - 50, Small - 100
//Add ufo
//One stage
//When destroyed dessapears
//Points: 
Engine.SetInitFunction(INIT)
Engine.SetLoopFunction(GAMELOGIC)

let asteroidPath = new Path2D();
let size = 10;
asteroidPath.moveTo(size, 0);
asteroidPath.lineTo(size, -size * 0.4);
asteroidPath.lineTo(size * 0.2, -size);
asteroidPath.lineTo(-size * 0.6, -size);
asteroidPath.lineTo(-size * 0.2, -size * 0.4);
asteroidPath.lineTo(-size, -size * 0.4);
asteroidPath.lineTo(-size, size * 0.1);
asteroidPath.lineTo(-size * 0.4, size * 0.9);
asteroidPath.lineTo(size * 0.4, size * 0.7);
asteroidPath.lineTo(size * 0.6, size * 1);
asteroidPath.lineTo(size * 1, size * 0.6);
asteroidPath.lineTo(size * 0.5, size * 0.2);
asteroidPath.closePath();

let Player = new CustomShapeObject({shape: BasicTrianglePath, name: "Player", scale: new Vector2(1.5, 2), drawAsOutline: true, outlineThickness: 1.5, colliderSize: new Vector2(10, 10)})
let PlayerFlame = new CustomShapeObject({shape: BasicTrianglePath, name: "PlayerFlame", scale: new Vector2(1, -1.25), drawAsOutline: true, visible: false})
let Hearts = [
	new CustomShapeObject({shape: BasicTrianglePath, name: "HeartDisplay", scale: new Vector2(1.5, 2), drawAsOutline: true, outlineThickness: 1.5, position: new Vector2(-(Engine.screenSize.x / 2 - 15), (Engine.screenSize.y / 2 - 20))}),
	new CustomShapeObject({shape: BasicTrianglePath, name: "HeartDisplay", scale: new Vector2(1.5, 2), drawAsOutline: true, outlineThickness: 1.5, position: new Vector2(-(Engine.screenSize.x / 2 - 40), (Engine.screenSize.y / 2 - 20))}),
	new CustomShapeObject({shape: BasicTrianglePath, name: "HeartDisplay", scale: new Vector2(1.5, 2), drawAsOutline: true, outlineThickness: 1.5, position: new Vector2(-(Engine.screenSize.x / 2 - 65), (Engine.screenSize.y / 2 - 20))}),
]
Engine.AddObject(Hearts[0])
Engine.AddObject(Hearts[1])
Engine.AddObject(Hearts[2])
Engine.AddObject(Player)
Engine.AddObject(PlayerFlame)

Engine.Start()
async function INIT(){
	//console.log("INIT FUNCTION CALLED!")
}

let Velocity = Vector2.Zero;

let PlayerHealth = 3;

let Asteroids = [];
let AsteroidSpawnTime = 2;
let TimeTillSpawn = 0;
let AsteroidSpawnAmount = 6;
let AsteroidScales = [
	new Vector2(1,1),
	new Vector2(2,2),
	new Vector2(3,3)
]
let AsteroidPoints = [
	100,
	50,
	20
]
let Bullets = [];
let BulletSpeed = 600;
let BulletLifeTime = 600;
let ShootingCooldown = 200;
let LastShot = 0;

let flameState = true;
let flameSwitchTime = .05;

let GameIsOver = false;

let Score = 0;

let ScoreText = new TextObject({text: "0", position: new Vector2(-(Engine.screenSize.x / 2) + 5, (Engine.screenSize.y / 2) - 80)});
let FinalScoreText = new TextObject({text: "GameOver!\nYour final score was:\n{SCORE}", alignment: "center", position: new Vector2(0, 30), visible: false});
Engine.AddObject(ScoreText);
Engine.AddObject(FinalScoreText);

async function GAMELOGIC(delta){
	if(GameIsOver) {
		if (Bullets.length > 0){
			Bullets.forEach(bullet => {
				Engine.RemObject(bullet.object);
			});
			Bullets = [];
		}
		if (Asteroids.length > 0){
			Asteroids.forEach(asteroid => {
				Engine.RemObject(asteroid.object);
			});
			Asteroids = [];
		}
		Player.visible = false;
		return;
	}
	PlayerFlame.rotation = Player.rotation;
	PlayerFlame.position = Player.position.add(PlayerFlame.localUp.mult(-16));

	if(Asteroids.length <= 0){
		TimeTillSpawn -= delta;
		if (TimeTillSpawn <= 0){
			for (let i = 0; i < AsteroidSpawnAmount; i++) {
				spawnAsteroid(2);
			}
			TimeTillSpawn = 2;
		}
	}

	if(Engine.IsKeyDown("w")){
		Velocity = Velocity.add(Player.localUp.mult(100 * delta));
		PlayerFlame.visible = flameState;
		flameSwitchTime -= delta;
		if(flameSwitchTime <= 0){
			flameSwitchTime = .05;
			flameState = !flameState;
		}
	}
	else{
		Velocity = Velocity.add(Velocity.normalize().mult(50 * delta * -1))
		PlayerFlame.visible = false;
	}
	Velocity = clampVelocity(Velocity, 400);

	if(Engine.IsKeyDown("a")){
		Player.rotation += delta * -200;
	}
	if(Engine.IsKeyDown("d")){
		Player.rotation += delta * 200;
	}

	if(Engine.IsKeyDown(" ") && performance.now() - LastShot >= ShootingCooldown){
		LastShot = performance.now();
		let newBullet = new CustomShapeObject({shape: BasicSpherePath, name: "Bullet", scale: new Vector2(0.6, 0.6), position: Player.position, drawAsOutline: true, outlineThickness: 2, colliderSize: new Vector2(10, 10)});
		Engine.AddObject(newBullet);
		Bullets.push({object: newBullet, direction: Player.localUp, creationTime: LastShot});
	}
	bulletLogic(delta);
	asteroidLogic(delta);
	Player.position = Player.position.add(Velocity.mult(delta));
	Player.position = wallLoop(Player.position, 10);	
}

function gameOver(){
	GameIsOver = true;
	FinalScoreText.text = FinalScoreText.text.replace("{SCORE}", String(Score));
	FinalScoreText.visible = true;
	ScoreText.visible = false;
}

function killPlayer(){
	PlayerHealth--;
	Hearts[PlayerHealth].visible = false;
	Player.position = Vector2.Zero
	if (PlayerHealth <= 0){
		gameOver();
	}
}

function healPlayer(){
	if (PlayerHealth < 3){
		PlayerHealth += 1;
		Hearts[PlayerHealth-1].visible = true
	}
}

function asteroidLogic(delta){
	for (i = 0; i < Asteroids.length; i++){
		let collidingObjects = Engine.GetCollidingObjects(Asteroids[i].object);
		let toBeDestroyed = false;
		if(collidingObjects.length > 0){
			let foundAsteroids = collidingObjects.find(obj => obj.name === "Player");
			if (foundAsteroids != undefined){
				killPlayer()
				toBeDestroyed = true;
			}
		}

		if(!toBeDestroyed){
			let obj = Asteroids[i].object;
			obj.position = obj.position.add(Asteroids[i].velocity.mult(delta));
			obj.position = wallLoop(obj.position, AsteroidScales[Asteroids[i].size].x * 20);
		}
		else{
			destroyAsteroid(Asteroids[i].object)
		}
	}
}
let pointTillNextHeal = 10000
function updateScore(amount){
	Score += amount
	ScoreText.text = String(Score)
	pointTillNextHeal -= amount;
	if (pointTillNextHeal <= 0){
		pointTillNextHeal = 10000 - pointTillNextHeal;
		healPlayer();
	}
}
function destroyAsteroid(asteroidObj){
	let foundAsteroid = Asteroids.findIndex(obj => obj.object.id === asteroidObj.id);
	if(Asteroids[foundAsteroid].size > 0){
		updateScore(AsteroidPoints[Asteroids[foundAsteroid].size]);
		spawnAsteroid(Asteroids[foundAsteroid].size - 1, asteroidObj.position);
		spawnAsteroid(Asteroids[foundAsteroid].size - 1, asteroidObj.position);
	}
	Engine.RemObject(asteroidObj)
	Asteroids.splice(foundAsteroid, 1);
}

function spawnAsteroid(size, startPos = null){
	if (startPos == null){startPos = new Vector2((Math.random() * Engine.screenSize.x) - Engine.screenSize.x / 2, (Math.random() * Engine.screenSize.y) - Engine.screenSize.y / 2)}
	let newAsteroid = new CustomShapeObject({
		shape: asteroidPath, 
		name: "Asteroid", 
		scale: AsteroidScales[size],
		colliderSize: new Vector2(20, 20), 
		drawAsOutline: true,
		drawCollider: false,
		rotation: Math.random() * 360,
		position: startPos})
	Engine.AddObject(newAsteroid)
	Asteroids.push({object: newAsteroid, size: size, velocity: new Vector2(Math.random() * 10 - 5, Math.random() * 10 - 5).normalize().mult(100 + Math.random() * 300)})
}

function bulletLogic(delta){
	for (i = 0; i < Bullets.length; i++){
		let collidingObjects = Engine.GetCollidingObjects(Bullets[i].object);
		let toBeDestroyed = false;
		if(collidingObjects.length > 0){
			let foundAsteroids = collidingObjects.find(obj => obj.name === "Asteroid");
			if (foundAsteroids != undefined){
				destroyAsteroid(foundAsteroids)
				toBeDestroyed = true;
			}
		}
		if(!toBeDestroyed && (performance.now() - Bullets[i].creationTime < BulletLifeTime)){
			let obj = Bullets[i].object;
			obj.position = obj.position.add(Bullets[i].direction.mult(BulletSpeed * delta));
			obj.position = wallLoop(obj.position, 10);
		}
		else{
			Engine.RemObject(Bullets[i].object)
			Bullets.splice(i, 1);
		}
	}
}

function wallLoop(currPos, bufferSpace){
	let newPos = currPos;
	if(newPos.x > (Engine.screenSize.x / 2 + bufferSpace)){
		newPos.x = -(Engine.screenSize.x / 2 + bufferSpace);
	}
	if(newPos.x < -(Engine.screenSize.x / 2 + bufferSpace)){
		newPos.x = (Engine.screenSize.x / 2 + bufferSpace);
	}
	if(newPos.y > (Engine.screenSize.y / 2 + bufferSpace)){
		newPos.y = -(Engine.screenSize.y / 2 + bufferSpace);
	}
	if(newPos.y < -(Engine.screenSize.y / 2 + bufferSpace)){
		newPos.y = (Engine.screenSize.y / 2 + bufferSpace);
	}
	return newPos;
}

function clampVelocity(velocity, maxSpeed) {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y); // Calculate speed

    if (speed > maxSpeed) {
        // Normalize & scale to max speed
        const scale = maxSpeed / speed;
        return velocity.mult(scale);
    }

    return velocity; // Already within limit, return as is
}

