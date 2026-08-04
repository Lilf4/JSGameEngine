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

let scaleDir = 1;
async function GAMELOGIC(delta){
	let moveDir = new Vector2(0,0);
	if(Engine.IsKeyPressed(" ")){
		test.position = Vector2.Zero;
	}
	if(Engine.IsKeyDown("a")){
		moveDir.x -= 1;
	}
	if(Engine.IsKeyDown("d")){
		moveDir.x += 1;
	}
	if(Engine.IsKeyDown("w")){
		moveDir.y += 1;
	}
	if(Engine.IsKeyDown("s")){
		moveDir.y -= 1;
	}
	test.position = test.position.add(moveDir.normalize().mult(100 * delta))
	test.rotation += delta * 100;
	if (test.scale.x >= 20){
		scaleDir = -1;
	}
	else if(test.scale.x <= 1){
		scaleDir = 1;
	}
	test.scale = test.scale.add(new Vector2(1,1).mult(scaleDir).mult(delta * 10));
}


