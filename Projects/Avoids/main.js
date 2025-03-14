Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(720, 720),
);

Engine.background = 'rgb(50, 50, 50)';

let ListOfTargets = []

function CreateTargets(amount = 5) {
	for (let i = 0; i < amount; i++){
		target = new CustomShapeObject({
			shape: BasicSpherePath,
			scale: new Vector2(5, 5),
			drawCollider: true,
			tags: ['TARGET']
		})
		ListOfTargets.push(target);
	}
}

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

let score = 0;

Engine.Start();

let Player = new ImageObject({
	scale: new Vector2(1, 1),
	imageUrl: 'Resources/cross.png',
	drawCollider: true,
});

let t = new TextObject({
	text: "",
	position: new Vector2(32, 32),
})
Engine.AddObject(t, "ui");
Engine.AddObject(Player);

t.text = `Score: ${score}`;


async function INIT(){
	//Gets called once when the engine is started
	CreateTargets();
	if (ListOfTargets.length > 0) {
		for(let i = 0; i < ListOfTargets.length; i++){
			Engine.AddObject(ListOfTargets[i])
			ListOfTargets[i].position = new Vector2(96+(-Engine.screenSize.x/2+i*128), 0)
		}
	}
}
async function GAMELOGIC(delta){
	//Game loop, gets called once every frame
	if (Engine.IsMousePressed("0")) {
		if (Engine.GetCollidingObjects(Player).length > 0){
			let colObj = Engine.GetCollidingObjects(Player)[0];
			if (colObj.tags.includes("TARGET")) {
				Engine.RemObject(colObj)
				t.text = `Score: ${score += 10}`;
			}
		}
	}
	Player.position = Engine.screenToWorldSpace(Engine.GetMousePosition())
}


