/*
 * TODO
 * Way too many things ;-;
 * Input Handler
 * Object Handler
 * */
const BasicSquarePath = new Path2D();
BasicSquarePath.rect(-5, -5, 10, 10);

function GetUUID(){
	return Math.random().toString(16).slice(2)
}

class GameEngine {
	background = 'black';
	lastFrameTime = performance.now();
	GameObjectDict = {}
	GameObjectList = []
	KeysDown = {}
	KeysPressed = {}
	ClickLimit = 200;
	constructor(Canvas, Size = new Vector2(500, 500)){
		this.canvas = Canvas;
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = Size.x;
		this.canvas.height = Size.y;
		this.screenSize = Size;
		this.CameraObject = new GameObject({colliderSize: Size, name: "Camera"});

		this.KeyDownEventHandler = this.KeyDownEventHandler.bind(this);
		this.KeyUpEventHandler = this.KeyUpEventHandler.bind(this);
		addEventListener("keydown", this.KeyDownEventHandler);
		addEventListener("keyup", this.KeyUpEventHandler);
	}

	KeyDownEventHandler(event){
		if(!(event.key in this.KeysDown)){
			this.KeysDown[event.key] = { }
		}
	}

	KeyUpEventHandler(event){
		if(event.key in this.KeysDown){
			this.KeysPressed[event.key] = { pressed: performance.now() };
			delete this.KeysDown[event.key];
		}
	}

	IsKeyPressed(key){
		if (key in this.KeysPressed && this.KeysPressed[key].pressed - performance.now() <= this.ClickLimit){
			delete this.KeysPressed[key];
			return true;
		}
		return false;
	}

	IsKeyDown(key){
		return (key in this.KeysDown);
	}

	#DrawScene(){
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
		
		this.#DrawScene();

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
		relativePos.y *= -1;
		relativePos = Vector2.add(relativePos, Vector2.div(this.screenSize, 2));
		return relativePos
	}

	screenToWorldSpace(pos){
		var relativePos = Vector2.sub(pos, Vector2.div(this.screenSize, 2));
		relativePos = Vector2.add(relativePos, this.CameraObject.position);
		relativePos.y *= -1;
		return relativePos
	}
}

class GameObject{
	constructor({
		position = Vector2.Zero, 
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
	static Up = new Vector2(0, 1);
	static Down = new Vector2(0, -1);
	static Left = new Vector2(-1, 0);
	static Right = new Vector2(1, 0);
	static Zero = new Vector2(0, 0);

	constructor(x, y)
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
	static #magnitude(a){
		return Math.sqrt(a.x * a.x + a.y * a.y);
	}
	static normalize(a){
		let mag = Vector2.#magnitude(a);
		if (mag === 0){
			return Vector2.Zero;
		}
		return new Vector2(a.x / mag, a.y / mag);
	}
}
