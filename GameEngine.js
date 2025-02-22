/*
 * TODO
 * Way too many things ;-;
 * Input Handler
 * Object Handler
 * Don't draw objects not currently on screen
 * */
const BasicSquarePath = new Path2D();
BasicSquarePath.rect(-5, -5, 10, 10);

const BasicSpherePath = new Path2D();
BasicSpherePath.ellipse(0, 0, 5, 5, 0, 0, 360);

const BasicTrianglePath = new Path2D();
BasicTrianglePath.moveTo(0, -5);
BasicTrianglePath.lineTo(-5, 5);
BasicTrianglePath.lineTo(5, 5);
BasicTrianglePath.closePath();

function GetUUID(){
	return Math.random().toString(16).slice(2)
}

class ResourceManager {
	constructor(){
		this.cache = new Map();
	}

	async LoadImage(path){
		if (this.cache.has(path)){
			return this.cache.get(path);
		}
		let img = new Image();
		img.src = path;
		await new Promise(res => {
			if (img.complete) {
				return res();
			}
			img.onload = () => res();
			img.onerror = () => res();
		});
		this.cache.set(path, img);
		return img;
	}

	ClearCache(){
		this.cache.clear();
	}
}
const resManager = new ResourceManager();

//function LoadSpriteSheet(path){
//	let img = new Image();
//	img.src = path;
//	return img;
//}

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
		event.preventDefault();
		if(!(event.key in this.KeysDown)){
			this.KeysDown[event.key] = { }
		}
	}

	KeyUpEventHandler(event){
		event.preventDefault();
		if(event.key in this.KeysDown){
			this.KeysPressed[event.key] = { pressed: performance.now() };
			delete this.KeysDown[event.key];
			
			setTimeout(() => {
				if (event.key in this.KeysPressed && performance.now() - this.KeysPressed[event.key]?.pressed > this.ClickLimit) {
					delete this.KeysPressed[event.key];
				}
			}, this.ClickLimit + 10);
		}
	}

	IsKeyPressed(key){
		if (key in this.KeysPressed && performance.now() - this.KeysPressed[key].pressed <= this.ClickLimit){
			delete this.KeysPressed[key];
			return true;
		}
		return false;
	}

	IsKeyDown(key){
		return (key in this.KeysDown);
	}

	#DrawScene(delta){
		this.ctx.fillStyle = this.background
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.GameObjectList.forEach(object => {
			if (!(object instanceof VisibleObject) || !object.visible) {return;}
			switch(true){
				case object instanceof CustomShapeObject:
					var objScreenPos = this.worldToScreenSpace(object.position);
					this.ctx.save();
					this.ctx.translate(objScreenPos.x, objScreenPos.y);
					this.ctx.rotate(object.rotation * Math.PI / 180);
					this.ctx.scale(object.scale.x, object.scale.y);
					if(object.drawAsOutline){
						this.ctx.strokeStyle = object.color;
						this.ctx.lineWidth = object.outlineThickness;
						this.ctx.stroke(object.shape);
					}
					else{
						this.ctx.fillStyle = object.color;
						this.ctx.fill(object.shape);
					}
					this.ctx.restore();
					if (object.drawCollider){
						let colliderPos = this.worldToScreenSpace(object.movedColliderPosition)
						this.ctx.save();
						this.ctx.translate(colliderPos.x, colliderPos.y);
						this.ctx.rotate(object.rotation * Math.PI / 180);
						this.ctx.scale(object.scale.x, object.scale.y);
						this.ctx.beginPath();
						this.ctx.strokeStyle = 'red';
						this.ctx.lineWidth = 1;
						this.ctx.rect(-(object.colliderSize.x / 2), -(object.colliderSize.y / 2), object.colliderSize.x, object.colliderSize.y)
						this.ctx.closePath();
						this.ctx.stroke();
						this.ctx.restore();
					}
					break;
				case object instanceof TextObject:
					var objScreenPos = this.worldToScreenSpace(object.position)
					this.ctx.save();
					this.ctx.translate(objScreenPos.x, objScreenPos.y);
					this.ctx.rotate(object.rotation * Math.PI / 180);
					this.ctx.scale(object.scale.x, object.scale.y);
					this.ctx.font = object.font;
					this.ctx.textAlign = object.alignment;
					let y = 0;
					let lines = object.text.split("\n");
					if(object.drawAsOutline){
						this.ctx.strokeStyle = object.color;
						this.ctx.lineWidth = object.outlineThickness;
						lines.forEach(line => {
							this.ctx.strokeText(line, 0, y);
							y += object.lineHeight;
						});
					}
					else{
						this.ctx.fillStyle = object.color;
						lines.forEach(line => {
							this.ctx.fillText(line, 0, y);
							y += object.lineHeight;
						});
					}
					this.ctx.restore();
					break
				case object instanceof ImageObject:
					var objScreenPos = this.worldToScreenSpace(object.position)
					var ImageSize = object.useSourceSize ? new Vector2(object.image.width, object.image.height) : object.size;
					var SourceImagePosition = object.overrideImgSourcePosition == null ? Vector2.Zero : object.overrideImgSourcePosition;
					var SourceImageSize = object.overrideImgSourceSize == null ? new Vector2(object.image.width, object.image.height) : object.overrideImgSourceSize;
					this.ctx.save();
					this.ctx.translate(objScreenPos.x, objScreenPos.y);
					this.ctx.rotate(object.rotation * Math.PI / 180);
					this.ctx.scale(object.scale.x, object.scale.y);
					if (!object.repeat){
						this.ctx.drawImage(
							object.image, 
							SourceImagePosition.x,
							SourceImagePosition.y,
							SourceImageSize.x,
							SourceImageSize.y,
							-(ImageSize.x / 2), 
							-(ImageSize.y / 2), 
							ImageSize.x, 
							ImageSize.y
						)
					}
					else{
						let repeatMode = 'repeat';
						let patternTransform = this.ctx.getTransform();

						patternTransform.e = -(ImageSize.x / 2);
						patternTransform.f = -(ImageSize.y / 2);

						let imgPattern = this.ctx.createPattern(object.image, repeatMode);
						this.ctx.fillStyle = imgPattern;
						if(imgPattern != null){
							imgPattern.setTransform(patternTransform);
							this.ctx.fillRect(-(ImageSize.x / 2), -(ImageSize.y / 2), ImageSize.x, ImageSize.y)
						}
					}
					this.ctx.restore();
					break
				case object instanceof ImageAnimObject:
					//TODO
					var objScreenPos = this.worldToScreenSpace(object.position)
					this.ctx.save();
					this.ctx.translate(objScreenPos.x, objScreenPos.y);
					this.ctx.rotate(object.rotation * Math.PI / 180);
					this.ctx.scale(object.scale.x, object.scale.y);
					console.log(object)
					this.ctx.drawImage(
						object.image, 
						0,
						0,
						object.horizontalStacked ? object.spriteSize : object.image.width,
						!object.horizontalStacked ? object.spriteSize : object.image.height,
						-(object.horizontalStacked ? object.spriteSize : object.image.width / 2), 
						-(!object.horizontalStacked ? object.spriteSize : object.image.height / 2), 
						object.horizontalStacked ? object.spriteSize : object.image.width, 
						!object.horizontalStacked ? object.spriteSize : object.image.height
					)
					this.ctx.restore();
					object.AddTime(delta)
					break
			}
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

	RemObject(object){
		if(object.id in this.GameObjectDict){
			delete this.GameObjectDict[object.id]
		}
		this.CreateObjectRenderOrderList();
	}
	
	CreateObjectRenderOrderList(){
		this.GameObjectList = [];
		this.GameObjectList = Object.values(this.GameObjectDict).sort((a, b) => b.layer - a.layer);
	}

	GetCollidingObjects(object){
		let collidingObjects = []
		let colliderPosition = object.movedColliderPosition;
		let colliderSize = object.scaledColliderSize;
		this.GameObjectList.forEach(checkObject => {
			if (object.id != checkObject.id){
				if (this.#checkOBBCollision(colliderPosition, colliderSize, object.rotation, checkObject.movedColliderPosition, checkObject.scaledColliderSize, checkObject.rotation)){
					collidingObjects.push(checkObject);
				}
			}
		});
		return collidingObjects;
	}

	#getRotatedCorners(position, size, rotation){
		let radians = rotation * (Math.PI / 180);
		let cosA = Math.cos(radians);
		let sinA = Math.sin(-radians);

		let halfSize = size.mult(.5);

		let corners = [
			new Vector2(-halfSize.x, -halfSize.y),
			new Vector2(halfSize.x, -halfSize.y),
			new Vector2(halfSize.x, halfSize.y),
			new Vector2(-halfSize.x, halfSize.y),
		].map(v => new Vector2(
			position.x + v.x * cosA - v.y * sinA,
        	position.y + v.x * sinA + v.y * cosA
		));

		return corners;
	}

	#projectVertices(vertices, axis) {
		let min = axis.dot(vertices[0]);
		let max = min;
	
		for (let i = 1; i < vertices.length; i++) {
			let projection = axis.dot(vertices[i]);
			if (projection < min) min = projection;
			if (projection > max) max = projection;
		}
	
		return { min, max };
	}

	#overlaps(projA, projB) {
		return projA.max >= projB.min && projB.max >= projA.min;
	}

	#checkOBBCollision(posA, zA, angleA, posB, zB, angleB) {
		const rectA = this.#getRotatedCorners(posA, zA, angleA);
		const rectB = this.#getRotatedCorners(posB, zB, angleB);
	
		const axes = [
			rectA[1].sub(rectA[0]).normalize(), // Edge 1 of A
			rectA[3].sub(rectA[0]).normalize(), // Edge 2 of A
			rectB[1].sub(rectB[0]).normalize(), // Edge 1 of B
			rectB[3].sub(rectB[0]).normalize()  // Edge 2 of B
		];
	
		for (let axis of axes) {
			let projA = this.#projectVertices(rectA, axis);
			let projB = this.#projectVertices(rectB, axis);
	
			if (!this.#overlaps(projA, projB)) {
				return false; // No collision found
			}
		}
	
		return true; // If no gaps, collision detected
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
		
		this.#DrawScene(dt);

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
		rotation = 0,
		scale = new Vector2(1,1),
		colliderSize = new Vector2(10, 10), 
		colliderOffset = new Vector2(0, 0),
		drawCollider = false,
		name = 'GameObject'
	} = {})
	{
		this.id = -1;
		this.name = name;
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.colliderSize = colliderSize;
		this.colliderOffset = colliderOffset;
		this.drawCollider = drawCollider;
	}

	get localUp(){
		let radians = (this.rotation - 90) * (Math.PI / 180);
		return new Vector2(Math.cos(radians), Math.sin(-radians));
	}

	get localRight(){
		let radians = this.rotation * (Math.PI / 180);
		return new Vector2(Math.cos(radians), Math.sin(-radians));
	}

	get movedColliderPosition(){
		return this.position.add(this.localUp.mult(this.colliderOffset.y)).add(this.localRight.mult(this.colliderOffset.x));
	}

	get scaledColliderSize(){
		return new Vector2(this.colliderSize.x * this.scale.x, this.colliderSize.y * this.scale.y);
	}
}

class VisibleObject extends GameObject{
	constructor({
		layer = 0,
		visible = true,
		...GameObjectOptions
	})
	{
		super(GameObjectOptions)
		this.layer = layer;
		this.visible = visible;
	}
}

class CustomShapeObject extends VisibleObject{
	constructor({
		shape = new Path2D(),
		color = 'white',
		drawAsOutline = false,
		outlineThickness = 1,
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)
		this.drawAsOutline = drawAsOutline;
		this.outlineThickness = outlineThickness;
		this.shape = shape;
		this.color = color;
	}
}

class ImageObject extends VisibleObject{
	constructor({
		image = new Image(),
		repeat = false,
		useSourceSize = true,
		size = null,
		overrideImgSourceSize = null,
		overrideImgSourcePosition = null,
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)
		this.image = image;
		this.repeat = repeat;
		this.useSourceSize = useSourceSize;
		this.size = size;
		this.overrideImgSourceSize = overrideImgSourceSize;
		this.overrideImgSourcePosition = overrideImgSourcePosition;
	}
}

class ImageAnimObject extends VisibleObject{
	//TODO
	constructor({
		image = new Image(),
		horizontalStacked = true,
		spriteSize = Vector2.Zero,
		currentFrame = 0,
		isPlaying = false,
		fps = 24,
		stopAtEnd = false,
		reverseAtEnd = false,
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)
		this.image = image;
		this.horizontalStacked = horizontalStacked;
		this.spriteSize = spriteSize;
		this.currentFrame = currentFrame;
		this.isPlaying = isPlaying;
		this.fps = fps;
		this.stopAtEnd = stopAtEnd;
		this.reverseAtEnd = reverseAtEnd;
		this.timePassed = 0;
		this.animDirection = 1;
	}

	SetSpriteSizeBySpriteAmount(amount){
		if(this.horizontalStacked){
			this.spriteSize = this.image.width / amount;
		}
		else{
			this.spriteSize = this.image.height / amount;
		}
	}

	SetFrame(frame){

	}

	AddTime(delta){

	}
}

class TextObject extends VisibleObject{
	constructor({
		text = "new text!",
		color = 'white',
		drawAsOutline = false,
		outlineThickness = 1,
		font = "30px Verdana",
		alignment = "left",
		lineHeight = 30,
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)
		this.drawAsOutline = drawAsOutline;
		this.outlineThickness = outlineThickness;
		this.color = color;
		this.text = text;
		this.font = font;
		this.alignment = alignment;
		this.lineHeight = lineHeight;
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
	add(b)
	{
		return new Vector2(this.x + b.x, this.y + b.y);
	}
	static sub(a, b)
	{
		return new Vector2(a.x - b.x, a.y - b.y);
	}
	sub(b)
	{
		return new Vector2(this.x - b.x, this.y - b.y);
	}
	static mult(a, x)
	{
		return new Vector2(a.x * x, a.y * x);
	}
	mult(x)
	{
		return new Vector2(this.x * x, this.y * x);
	}
	static div(a, x)
	{
		return new Vector2(a.x / x, a.y / x);
	}
	div(x)
	{
		return new Vector2(this.x / x, this.y / x);
	}
	static magnitude(a){
		return Math.sqrt(a.x * a.x + a.y * a.y);
	}
	magnitude(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	static normalize(a){
		let mag = Vector2.magnitude(a);
		if (mag === 0){
			return Vector2.Zero;
		}
		return new Vector2(a.x / mag, a.y / mag);
	}
	normalize(){
		let mag = Vector2.magnitude(this);
		if (mag === 0){
			return Vector2.Zero;
		}
		return new Vector2(this.x / mag, this.y / mag);
	}
	static dot(a, b){
		return a.x * b.x + a.y * b.y
	}
	dot(b){
		return this.x * b.x + this.y * b.y
	}
}
