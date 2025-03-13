Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(600, 400)
);

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

let focusText = new TextObject({
	position: new Vector2(10, 26),
	alignment: 'left',
	font: "16px Verdana"
})

Engine.AddObject(focusText, "ui")

async function INIT(){
	//Gets called once when the engine is started

}

let mouseCursor = new CustomShapeObject({
	shape: BasicSpherePath,
	scale: new Vector2(2, 2)
})
Engine.AddObject(mouseCursor, "ui")
let lastState = false

async function GAMELOGIC(delta){
	focusText.text = `Game in focus: ${Engine.inFocus}`

	if(Engine.IsKeyPressed("Escape")){
		//Engine.inFocus = false;
	}
	
	if(Engine.inFocus && lastState == false){
		await Engine.LockPointer()
	}
	else if(!Engine.inFocus && lastState == true){
		await Engine.ReleasePointer()
	}

	if(Engine.pointerLockState){
		mouseCursor.position = mouseCursor.position.add(Engine.mouseMovement)
		Engine.inFocus = true;
	}
	else {
		mouseCursor.position = Engine.GetMousePosition()
		Engine.inFocus = false;
	}	

	lastState = Engine.inFocus;
}

Engine.Start();