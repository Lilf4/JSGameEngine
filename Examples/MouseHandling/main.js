Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(800, 800)
);

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

Engine.Start();

let Test = new CustomShapeObject({
	shape: BasicSpherePath,
	scale: new Vector2(5, 5)
})

Engine.AddObject(Test)

async function INIT(){
	//Gets called once when the engine is started
}

let baseScale = new Vector2(5, 5);
let growShrinkSpeed = 0.01;

async function GAMELOGIC(delta){
	let growDirection = baseScale.sub(Test.scale).normalize().mult(growShrinkSpeed);
	Test.scale = Test.scale.add(growDirection);

	Test.position = Engine.screenToWorldSpace(Engine.GetMousePosition())

	if(Engine.IsMousePressed(0)){
		Test.scale = new Vector2(8, 8);
		Engine.AddObject(new CustomShapeObject({
			position: Engine.screenToWorldSpace(Engine.GetMousePosition()),
			shape: BasicSpherePath,
			scale: new Vector2(5, 5)
		}))
	}
	if(Engine.IsMouseReleased(0)){
		Test.scale = new Vector2(2,2);
	}

	if(Engine.IsMouseDown(0)){
		Test.color = 'rgb(255, 200, 100)';
	}
	else{
		Test.color = 'rgb(255,255,255)';
	}
}


