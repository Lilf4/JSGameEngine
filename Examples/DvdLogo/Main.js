Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(600, 400)
);

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

Engine.SetInitFunction(INIT)
Engine.SetLoopFunction(GAMELOGIC)

test = new CustomShapeObject({shape: BasicSquarePath, layer: 0, name: "Test1"})
Engine.AddObject(test)

Engine.Start()
async function INIT(){
	//console.log("INIT FUNCTION CALLED!")
}

moveDir = new Vector2(1, 1);

async function GAMELOGIC(delta){
	//console.log(test.position)
	test.position = Vector2.add(Vector2.mult(Vector2.mult(moveDir, 100), delta), test.position);
	if (test.position.x < -(Engine.screenSize.x / 2 - 10)){
		moveDir.x = 1;
	}
	if (test.position.x > (Engine.screenSize.x / 2 - 10)){
		moveDir.x = -1;
	}
	if (test.position.y < -(Engine.screenSize.y / 2 - 10)){
		moveDir.y = 1;
	}
	if (test.position.y > (Engine.screenSize.y / 2 - 10)){
		moveDir.y = -1;
	}
	//Engine.CameraObject.position = Vector2.add(Engine.CameraObject.position, Vector2.mult(Vector2.mult(moveDir, 100), delta))
}


