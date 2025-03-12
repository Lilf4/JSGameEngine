Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(1000, 800)
);

let RepeatingImageObj = new ImageObject({
	position: new Vector2(-400, 300), 
	overrideDisplaySize: new Vector2(64, 64), 
	repeat: true
});
Engine.AddObject(RepeatingImageObj);

let ResizingImageObj = new ImageObject({
	imageUrl: 'Resources/TestImage.png',
	position: new Vector2(-400, 150), 
	overrideDisplaySize: new Vector2(64, 64), 
	repeat: false
});
Engine.AddObject(ResizingImageObj);

let AnimatedImageObj1 = new ImageAnimObject({
	position: new Vector2(-400, 0),
	fps: 24,
	animDirection: 1
});
Engine.AddObject(AnimatedImageObj1);

let AnimatedImageObj2 = new ImageAnimObject({
	position: new Vector2(-400, -150),
	fps: 24,
	stopAtEnd: true,
	animDirection: 1
});
Engine.AddObject(AnimatedImageObj2);

let AnimatedImageObj3 = new ImageAnimObject({
	position: new Vector2(-400, -300),
	overrideDisplaySize: new Vector2(20, 20),
	fps: 24,
	reverseAtEnd: true,
	animDirection: 1
});
Engine.AddObject(AnimatedImageObj3);

let AnimatedImageObj4 = new ImageAnimObject({
	position: new Vector2(0, 250),
	fps: 24,
	animDirection: 1
});
Engine.AddObject(AnimatedImageObj4);

let SlimeBuddy;

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

Engine.Start();
async function INIT(){
	RepeatingImageObj.image = await resManager.LoadImage('Resources/TestImage.png');

	AnimatedImageObj1.image = await resManager.LoadImage('Resources/FinishFlagRaising-sheet.png');
	AnimatedImageObj1.SetSpriteDataByColRowCount(new Vector2(8, 1));
	AnimatedImageObj1.Play();

	AnimatedImageObj2.image = await resManager.LoadImage('Resources/FinishFlagRaising-sheet.png');
	AnimatedImageObj2.SetSpriteDataByColRowCount(new Vector2(8, 1));
	AnimatedImageObj2.Play();

	AnimatedImageObj3.image = await resManager.LoadImage('Resources/FinishFlagRaising-sheet.png');
	AnimatedImageObj3.SetSpriteDataByColRowCount(new Vector2(8, 1));
	AnimatedImageObj3.Play();

	AnimatedImageObj4.image = await resManager.LoadImage('Resources/RealisticSmoke/512/Smoke_1_512.png');
	AnimatedImageObj4.SetSpriteDataByColRowCount(new Vector2(5, 5));
	AnimatedImageObj4.Play();

	let slimeSheet = await resManager.LoadImage('Resources/slimebuddy.png');
	SlimeBuddyIdle = new ImageAnimObject({
		position: new Vector2(0, 0),
		image: slimeSheet,
		fps: 8,
		animDirection: 1,
	});
	Engine.AddObject(SlimeBuddyIdle);
	SlimeBuddyIdle.SetSpriteDataByColRowCount(new Vector2(6, 11), 6, new Vector2(0, 0));
	SlimeBuddyIdle.Play();

	let SlimeBuddyLeft = new ImageAnimObject({
		position: new Vector2(0, -50),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,1),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyLeft);
	SlimeBuddyLeft.Play();
	
	let SlimeBuddyRight = new ImageAnimObject({
		position: new Vector2(0, -100),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,2),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyRight);
	SlimeBuddyRight.Play();

	let SlimeBuddyUp = new ImageAnimObject({
		position: new Vector2(0, -150),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,3),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyUp);
	SlimeBuddyUp.Play();

	let SlimeBuddyDown = new ImageAnimObject({
		position: new Vector2(50, 0),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,4),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyDown);
	SlimeBuddyDown.Play();

	let SlimeBuddyUpLeft = new ImageAnimObject({
		position: new Vector2(50, -50),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,5),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyUpLeft);
	SlimeBuddyUpLeft.Play();

	let SlimeBuddyUpRight = new ImageAnimObject({
		position: new Vector2(50, -100),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,6),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyUpRight);
	SlimeBuddyUpRight.Play();

	let SlimeBuddyDownLeft = new ImageAnimObject({
		position: new Vector2(50, -150),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,7),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyDownLeft);
	SlimeBuddyDownLeft.Play();

	let SlimeBuddyDownRight = new ImageAnimObject({
		position: new Vector2(100, 0),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		colRowStartOffset: new Vector2(0,8),
		fps: 8,
		animDirection: 1
	});
	Engine.AddObject(SlimeBuddyDownRight);
	SlimeBuddyDownRight.Play();

	SlimeBuddy = new ImageAnimObject({
		position: new Vector2(300, -250),
		image: slimeSheet,
		spriteColRowCount: new Vector2(6, 11),
		spriteAmount: 6,
		fps: 8,
		animDirection: 1,
		overrideDisplaySize: new Vector2(64, 64)
	});
	Engine.AddObject(SlimeBuddy);
	SlimeBuddy.Play();
}

let RepeatingImageObjSizeDir = 1;

//Small Randomly Walking Test
let SlimeBuddyOffset = new Vector2(300, -250);
let SlimeBuddyConstraints = new Vector2(100, 100);
let SlimeBuddyLocalPosition = new Vector2(0, 0);
let SlimeBuddyNewPosition = new Vector2(0, 0);
let SlimeBuddyMoveSafeMargin = new Vector2(5, 5);
let RestTime = 0;
let SlimeBuddyMoveSpeed = 30;

async function GAMELOGIC(delta){
	//Game loop, gets called once every frame
	RepeatingImageObj.overrideDisplaySize = RepeatingImageObj.overrideDisplaySize.add(new Vector2(1,1).mult(10 * delta * RepeatingImageObjSizeDir));
	ResizingImageObj.overrideDisplaySize = ResizingImageObj.overrideDisplaySize.add(new Vector2(1,1).mult(10 * delta * RepeatingImageObjSizeDir));
	if (RepeatingImageObj.overrideDisplaySize.x > 128 || RepeatingImageObj.overrideDisplaySize.x < 32){
		RepeatingImageObjSizeDir = -RepeatingImageObjSizeDir;
	}

	SlimeBuddy.position = SlimeBuddyLocalPosition.add(SlimeBuddyOffset);

	if(
		SlimeBuddyLocalPosition.x >= SlimeBuddyNewPosition.x - SlimeBuddyMoveSafeMargin.x &&
		SlimeBuddyLocalPosition.x <= SlimeBuddyNewPosition.x + SlimeBuddyMoveSafeMargin.x &&
		SlimeBuddyLocalPosition.y >= SlimeBuddyNewPosition.y - SlimeBuddyMoveSafeMargin.y &&
		SlimeBuddyLocalPosition.y <= SlimeBuddyNewPosition.y + SlimeBuddyMoveSafeMargin.y
	){
		if(RestTime <= 0){
			SlimeBuddyNewPosition = new Vector2(Math.random() * (SlimeBuddyConstraints.x * 2) - SlimeBuddyConstraints.x, Math.random() * (SlimeBuddyConstraints.y * 2) - SlimeBuddyConstraints.y);
			RestTime = Math.random() * 5;
		}
		else{
			RestTime -= delta;
			SlimeBuddy.colRowStartOffset.y = 0;
		}
	}
	else{
		let moveDirection = SlimeBuddyNewPosition.sub(SlimeBuddyLocalPosition).normalize();
		if (moveDirection.y < -0.7) {
			if (moveDirection.x < -0.7) SlimeBuddy.colRowStartOffset.y = 7;
			else if (moveDirection.x > 0.7) SlimeBuddy.colRowStartOffset.y = 8;
			else SlimeBuddy.colRowStartOffset.y = 4;
		}
		else if (moveDirection.y > 0.7) {
			if (moveDirection.x < -0.7) SlimeBuddy.colRowStartOffset.y = 5;
			else if (moveDirection.x > 0.7) SlimeBuddy.colRowStartOffset.y = 6;
			else SlimeBuddy.colRowStartOffset.y = 3;
		}
		else if (moveDirection.x < -0.7) SlimeBuddy.colRowStartOffset.y = 1;
		else if (moveDirection.x > 0.7) SlimeBuddy.colRowStartOffset.y = 2;
		SlimeBuddyLocalPosition = SlimeBuddyLocalPosition.add(moveDirection.mult(SlimeBuddyMoveSpeed * delta));
	}
}