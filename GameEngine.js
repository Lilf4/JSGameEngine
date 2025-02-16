/*
 * TODO
 * Way too many things ;-;
 * Input Handler
 * Object Handler
 * */
const BasicSquarePath = new Path2D();
BasicSquarePath.rect(-25, -25, 25, 25);

function GetUUID(){
	return Math.random().toString(16).slice(2)
}

class GameEngine {
	background = 'black';
	lastFrameTime = performance.now();
	GameObjectDict = {}
	GameObjectList = []
	
	constructor(Canvas, Size = new Vector2(500, 500)){
		this.canvas = Canvas;
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = Size.x;
		this.canvas.height = Size.y;
		this.screenSize = Size;
		this.CameraObject = new GameObject({colliderSize: Size, name: "Camera"})
	}

	DrawScene(){
		//TODO
		//Expand functionality to change draw style depending on object type
		//Don't draw objects not currently on screen
		this.ctx.fillStyle = this.background
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.GameObjectList.forEach(object => {
			let objScreenPos = this.worldToScreenSpace(object.position);
			this.ctx.save();
			this.ctx.translate(objScreenPos.x, objScreenPos.y);
			this.ctx.fillStyle = object.color;
			this.ctx.fill(object.shape);
			this.ctx.restore();
		});
	}

	AddObject(object){
		let uuid = -1;
		do{
			uuid = GetUUID();
		} while(uuid in this.GameObjectDict);
		object.id = uuid
		this.GameObjectDict[uuid] = object
		this.CreateObjectRenderOrderList()
	}
	
	CreateObjectRenderOrderList(){
		this.GameObjectList = [];
		this.GameObjectList = Object.values(this.GameObjectDict).sort((a, b) => b.layer - a.layer);
	}

	async Start(){
		this.running = true;
		if (this.InitCall != null) await this.InitCall()
		this.Loop()
	}

	async Loop(){
		if (!this.running) return;
		const now = performance.now();
		let dt = (now - this.lastFrameTime) / 1000;
		this.lastFrameTime = now;

		if (this.LoopCall != null) await this.LoopCall(dt)
		
		this.DrawScene();

		setTimeout(() => this.Loop(), 1)
	}

	Stop(){
		this.running = false;
	}

	SetLoopFunction(call){
		this.LoopCall = call
	}

	SetInitFunction(call){
		this.InitCall = call
	}

	worldToScreenSpace(pos){
		var relativePos = Vector2.sub(pos, this.CameraObject.position);
		relativePos = Vector2.add(relativePos, Vector2.div(this.screenSize, 2));
		return relativePos
	}

	screenToWorldSpace(pos){
		var relativePos = Vector2.sub(pos, Vector2.div(this.screenSize, 2));
		relativePos = Vector2.add(relativePos, this.CameraObject.position);
		return relativePos
	}
}

class GameObject{
	constructor({
		position = new Vector2(), 
		scale = new Vector2(1,1), 
		colliderSize = new Vector2(1, 1), 
		colliderOffset = new Vector2(0, 0), 
		name = 'GameObject'
	} = {})
	{
		this.id = -1;
		this.name = name;
		this.position = position;
		this.scale = scale;
		this.colliderSize = colliderSize;
		this.colliderOffset = colliderOffset;
	}
}

class CustomShapeObject extends GameObject{
	constructor({
		layer = 0,
		shape = new Path2D(),
		color = 'white',
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)
		this.shape = shape;
		this.layer = layer;
		this.color = color;
	}
}

class Vector2{
	constructor(x = 0, y = 0)
	{
		this.x = x;
		this.y = y;
	}

	static add(a, b)
	{
		return new Vector2(a.x + b.x, a.y + b.y);
	}
	static sub(a, b)
	{
		return new Vector2(a.x - b.x, a.y - b.y);
	}
	static mult(a, x)
	{
		return new Vector2(a.x * x, a.y * x);
	}
	static div(a, x)
	{
		return new Vector2(a.x / x, a.y / x);
	}
}
