Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(400, 400)
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

async function GAMELOGIC(delta){
	//console.log(delta)
	test.position = Vector2.add(Vector2.mult(Vector2.mult(new Vector2(1, 0), 10), delta), test.position);
}


