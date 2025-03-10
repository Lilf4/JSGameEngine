Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(800, 800),
	60
);

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

let fpsText = new TextObject({
	text: "200fps",
	position: new Vector2(10, 40),
	alignment: "left"
})

let deltaText = new TextObject({
	text: "010",
	position: new Vector2(10, 80),
	alignment: "left"
})

let totalObjText = new TextObject({
	text: "010",
	position: new Vector2(10, 120),
	alignment: "left"
})

Engine.AddObject(fpsText, "ui")
Engine.AddObject(deltaText, "ui")
Engine.AddObject(totalObjText, "ui")

Engine.Start();

async function INIT(){
	//Gets called once when the engine is started
}

let maxReadings = 50
let fpsReadings = []

let backgroundObjects = []

let minObjSpeed = 50
let MaxObjSpeed = 100

async function GAMELOGIC(delta){
	//Game loop, gets called once every frame
	fpsReadings.push(Engine.avgFPS);
	if(fpsReadings.length > maxReadings){
		fpsReadings.shift();
	}

	let avg = 0;
	fpsReadings.forEach(val => {
		avg += val;
	}); 
	avg /= fpsReadings.length;

	fpsText.text = Math.round(avg) + "fps"
	deltaText.text = String(delta);

	if(Engine.IsKeyDown(" ")){
		let newObj = new CustomShapeObject({
			shape: BasicSpherePath,
			color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
			drawAsOutline: false,
		})
		newObj.moveDir = new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
		newObj.speed = minObjSpeed + Math.random() * (MaxObjSpeed - minObjSpeed)

		Engine.AddObject(newObj)
		backgroundObjects.push(newObj)
	}

	backgroundObjects.forEach(e => {
		e.position = e.position.add(e.moveDir.mult(delta * e.speed))
		if(e.position.x >= Engine.screenSize.x / 2 - 5|| e.position.x <= -(Engine.screenSize.x / 2 - 5)){
			e.moveDir.x *= -1
		}
		if(e.position.y >= Engine.screenSize.y / 2 - 5 || e.position.y <= -(Engine.screenSize.y / 2 - 5)){
			e.moveDir.y *= -1
		}
	})

	totalObjText.text = `${backgroundObjects.length} Total objects`
}


function updateValue(){
	console.log("s")
}