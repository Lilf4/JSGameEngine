/*
 * TODO
 * Way too many things ;-;
 * Input Handler
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

/**
 * Generates a random UUID
 * @returns {string}
 */
function GetUUID(){
	return Math.random().toString(16).slice(2)
}

class ResourceManager {
	constructor(){
		this.cache = new Map();
	}
	/**
	* Loads an image and saves it to cache
	* @param {String} path - Image path/url
	* @returns {Image} Loaded image
	*/
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
	/**
	 * Clears cache
	 */
	ClearCache(){
		this.cache.clear();
	}
}
const resManager = new ResourceManager();

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

		this.KeyDownEventHandler = this.#KeyDownEventHandler.bind(this);
		this.KeyUpEventHandler = this.#KeyUpEventHandler.bind(this);
		addEventListener("keydown", this.#KeyDownEventHandler);
		addEventListener("keyup", this.#KeyUpEventHandler);
	}

	/**
	 * Handles key down events
	 * @param {KeyboardEvent} event string representation of key to check
	 */
	#KeyDownEventHandler(event){
		event.preventDefault();
		if(!(event.key in this.KeysDown)){
			this.KeysDown[event.key] = { }
		}
	}

	/**
	 * Handles key up events
	 * @param {KeyboardEvent} event string representation of key to check
	 */
	#KeyUpEventHandler(event){
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

	/**
	 * Checks whether key has **just** been let go
	 * @param {string} key string representation of key to check
	 * @returns {boolean} **True** if key has just been let go, else returns **False**
	 */
	IsKeyPressed(key){
		if (key in this.KeysPressed && performance.now() - this.KeysPressed[key].pressed <= this.ClickLimit){
			delete this.KeysPressed[key];
			return true;
		}
		return false;
	}

	/**
	 * Checks whether key is currently being held down
	 * @param {string} key string representation of key to check
	 * @returns {boolean} **True** if key is currently held down, else returns **False**
	 */
	IsKeyDown(key){
		return (key in this.KeysDown);
	}
	
	/**
	 * Renderes current game frame
	 * @param {Number} delta - time since last frame
	 */
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
					var ImageSize = object.overrideDisplaySize == null ? new Vector2(object.image.width, object.image.height) : object.overrideDisplaySize;
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
					var objScreenPos = this.worldToScreenSpace(object.position);
					var displaySize = object.overrideDisplaySize == null ? object.spriteSize : object.overrideDisplaySize;
					this.ctx.save();
					this.ctx.translate(objScreenPos.x, objScreenPos.y);
					this.ctx.rotate(object.rotation * Math.PI / 180);
					this.ctx.scale(object.scale.x, object.scale.y);
					this.ctx.drawImage(
						object.image, 
						object.spriteSize.x * object.currentFrame.x,
						object.spriteSize.y * object.currentFrame.y,
						object.spriteSize.x,
						object.spriteSize.y,
						-(displaySize.x / 2), 
						-(displaySize.y / 2), 
						displaySize.x, 
						displaySize.y
					)
					this.ctx.restore();
					object.AddTime(delta)
					break
			}
		});
	}

	/**
	 * Adds a GameObject to the engine.
	 * Ensures the object is an instance of GameObject (or a subclass of it) and gives it a unique ID.
	 * @param {GameObject} object - The GameObject instance to add to the engine.
	 * @throws {Error} If the object is not an instance of GameObject or its subclass.
	 */
	AddObject(object){
		if (!(object instanceof GameObject)) {
			throw new Error(`The object must be an instance of GameObject or a subclass of it, but received: ${object}`);
		}
		let uuid = -1;
		do{
			uuid = GetUUID();
		} while(uuid in this.GameObjectDict);
		object.id = uuid
		this.GameObjectDict[uuid] = object
		this.#CreateObjectRenderOrderList()
	}

	/**
	 * Removes a GameObject from the engine.
	 * @param {GameObject} object - The GameObject instance to add to remove.
	 */
	RemObject(object){
		if(object.id in this.GameObjectDict){
			delete this.GameObjectDict[object.id]
		}
		this.#CreateObjectRenderOrderList();
	}

	/**
	 * Recreates internal layer ordered list of objects to be drawn
	 */
	#CreateObjectRenderOrderList(){
		this.GameObjectList = [];
		this.GameObjectList = Object.values(this.GameObjectDict).sort((a, b) => b.layer - a.layer);
	}

	/**
	 * Gets all objects that collides with object
	 * @param {GameObject} object - The GameObject instance to check collision for.
	 * @return {GameObject[]} List of GameObject's that collide with provided object
	 */
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

	/**
	 * Starts engine logic
	 */
	async Start(){
		this.running = true;
		if (this.InitCall != null) await this.InitCall()
		this.#Loop()
	}

	/**
	 * Engine main loop
	 */
	async #Loop(){
		if (!this.running) return;
		const now = performance.now();
		let dt = (now - this.lastFrameTime) / 1000;
		this.lastFrameTime = now;

		if (this.LoopCall != null) await this.LoopCall(dt)
		
		this.#DrawScene(dt);

		setTimeout(() => this.#Loop(), 1)
	}

	/**
	 * Stops engine logic when frame is finished processing
	 */
	Stop(){
		this.running = false;
	}

	/**
	 * Sets loop callback function, which gets called once every frame before draw call
	 * @param {CallableFunction} call
	 */
	SetLoopFunction(call){
		this.LoopCall = call
	}

	/**
	 * Sets initialize callback function, which gets called once before engine fully starts
	 * @param {CallableFunction} call
	 */
	SetInitFunction(call){
		this.InitCall = call
	}

	/**
	 * Converts a world position to a screen position
	 * @param {Vector2} pos - World position
	 * @returns {Vector2} Screen position
	 */
	worldToScreenSpace(pos){
		var relativePos = Vector2.sub(pos, this.CameraObject.position);
		relativePos.y *= -1;
		relativePos = Vector2.add(relativePos, Vector2.div(this.screenSize, 2));
		return relativePos
	}

	/**
	 * Converts a screen position to a world position
	 * @param {Vector2} pos - Screen position
	 * @returns {Vector2} World position
	 */
	screenToWorldSpace(pos){
		var relativePos = Vector2.sub(pos, Vector2.div(this.screenSize, 2));
		relativePos = Vector2.add(relativePos, this.CameraObject.position);
		relativePos.y *= -1;
		return relativePos
	}
}

class GameObject{
	constructor({
		position = new Vector2(0,0),
		rotation = 0,
		scale = new Vector2(1,1),
		colliderSize = new Vector2(10, 10), 
		colliderOffset = new Vector2(0, 0),
		drawCollider = false,
		name = 'GameObject',
		tags = []
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
		this.tags = tags;
	}

	/**
	 * Gets the current up vector based on the current object rotation
	 * @returns {Vector2} Up vector
	 */
	get localUp(){
		let radians = (this.rotation - 90) * (Math.PI / 180);
		return new Vector2(Math.cos(radians), Math.sin(-radians));
	}

	/**
	 * Gets the current right vector based on the current object rotation
	 * @returns {Vector2} Right vector
	 */
	get localRight(){
		let radians = this.rotation * (Math.PI / 180);
		return new Vector2(Math.cos(radians), Math.sin(-radians));
	}

	/**
	 * Gets the position of object collider after applying rotation and offset
	 * @returns {Vector2} Collider position
	 */
	get movedColliderPosition(){
		return this.position.add(this.localUp.mult(this.colliderOffset.y)).add(this.localRight.mult(this.colliderOffset.x));
	}

	/**
	 * Gets the collider size after applying scale
	 * @returns {Vector2} Collider size
	 */
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
		overrideDisplaySize = null,
		overrideImgSourceSize = null,
		overrideImgSourcePosition = null,
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)
		this.image = image;
		this.repeat = repeat;
		this.overrideDisplaySize = overrideDisplaySize;
		this.overrideImgSourceSize = overrideImgSourceSize;
		this.overrideImgSourcePosition = overrideImgSourcePosition;
	}
}

class ImageAnimObject extends VisibleObject{
	constructor({
		image = new Image(),
		horizontalStacked = true,
		spriteColRowCount = new Vector2(0,0),
		spriteSize = new Vector2(0,0),
		overrideDisplaySize = null,
		spriteAmount = 0,
		currentFrame = 0,
		fps = 24,
		stopAtEnd = false,
		reverseAtEnd = false,
		animDirection = 1,
		colRowStartOffset = new Vector2(0,0),
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)
		this.image = image;
		this.horizontalStacked = horizontalStacked;
		this.spriteColRowCount = spriteColRowCount;
		this.overrideDisplaySize = overrideDisplaySize,
		this.spriteSize = spriteSize;
		this.spriteAmount = spriteAmount,
		this.currentFrame = currentFrame;
		this.fps = fps;
		this.stopAtEnd = stopAtEnd;
		this.reverseAtEnd = reverseAtEnd;
		this.animDirection = animDirection;
		this.colRowStartOffset = colRowStartOffset;
		this.isPlaying = false;
		this.timePassed = 0;
		this.totalAnimDuration = 0;
		this.#calcAnimTime();
		this.#calcSpriteSize();
	}

	/**
	 * Calculates the total duration of animation
	 */
	#calcAnimTime(){
		this.totalAnimDuration = this.spriteAmount / this.fps;
	}

	/**
	 * Sets necessary sprite/animation data by using given Coloumn and Row count
	 * @param {Vector2} ColRowCount - Column and Row count
	 * @param {Number} SpriteAmount - Amount of sprites in animation
	 * @param {Vector2} ColRowStartOffset - Column and Row offset for animation start position in spritesheet
	 */
	SetSpriteDataByColRowCount(ColRowCount, SpriteAmount = -1, ColRowStartOffset = new Vector2(0,0)){
		this.colRowStartOffset = ColRowStartOffset;
		this.spriteColRowCount = ColRowCount;
		if(SpriteAmount != -1){
			this.spriteAmount = SpriteAmount;
		}
		else{
			this.SpriteAmount = this.spriteColRowCount.x * this.spriteColRowCount.y;
		}
		
		this.#calcAnimTime();
		this.#calcSpriteSize();
	}

	/**
	 * Calculates sprite size based on the coloum and row counts
	 */
	#calcSpriteSize(){
		this.spriteSize = new Vector2(
			this.image.width / this.spriteColRowCount.x,
			this.image.height / this.spriteColRowCount.y
		);
	}

	/**
	 * Sets *isPlaying* flag to true allowing animation to be played, aswell as resetting animation time if it's finished playing
	 */
	Play(){
		if (!this.isPlaying && (this.timePassed <= 0 || this.timePassed >= this.totalAnimDuration)){
			this.Reset();
		}
		this.isPlaying = true;
	}

	/**
	 * Sets *isPlaying* flag to false stopping animation from being played
	 */
	Pause(){
		this.isPlaying = false;
	}

	/**
	 * Resets animation time based on animation direction
	 */
	Reset(){
		if(this.animDirection == -1){
			this.timePassed = this.totalAnimDuration;
		}
		else{
			this.timePassed = 0;
		}
		this.#updateFrame();
	}

	/**
	 * Sets *currentFrame* based on animation time
	 */
	#updateFrame(){
		let frameIndex = Math.max(Math.min(
			Math.ceil(this.timePassed / (this.totalAnimDuration / this.spriteAmount)) - 1,
			this.spriteAmount - 1
		), 0);

		let frameX = this.horizontalStacked ? frameIndex % this.spriteColRowCount.x : Math.floor(frameIndex / this.spriteColRowCount.y);
		frameX += this.colRowStartOffset.x;
		let frameY = this.horizontalStacked ? Math.floor(frameIndex / this.spriteColRowCount.x) : frameIndex % this.spriteColRowCount.y;
		frameY += this.colRowStartOffset.y;

		this.currentFrame = new Vector2(frameX, frameY)
	}

	/**
	 * Tries to add time to animation time if allowed, applies end of animation rules if set and calls #updateFrame
	 * @param {Number} delta - time to add
	 */
	AddTime(delta){
		if(!this.isPlaying){return;}

		this.timePassed += delta * this.animDirection;

		if(this.timePassed > this.totalAnimDuration || this.timePassed < 0){
			if(this.stopAtEnd){
				this.Pause();
			}
			else if(this.reverseAtEnd){
				this.animDirection = -this.animDirection;
				this.Reset();
			}
			else{
				this.timePassed += this.totalAnimDuration * -this.animDirection;
			}
		}

		this.#updateFrame();
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

	/**
	 * Adds vector **a** to vector **b**
	 * @param {Vector2} a
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	static add(a, b)
	{
		return new Vector2(a.x + b.x, a.y + b.y);
	}
	/**
	 * Adds vector **b** to current vector
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	add(b)
	{
		return new Vector2(this.x + b.x, this.y + b.y);
	}

	/**
	 * Subtracts vector **b** from vector **a**
	 * @param {Vector2} a
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	static sub(a, b)
	{
		return new Vector2(a.x - b.x, a.y - b.y);
	}
	/**
	 * Subtracts vector **b** from current vector
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	sub(b)
	{
		return new Vector2(this.x - b.x, this.y - b.y);
	}

	/**
	 * Multiplies vector **a** with vector **b**
	 * @param {Vector2} a
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	static mult(a, x)
	{
		return new Vector2(a.x * x, a.y * x);
	}
	/**
	 * Multiplies current vector with vector **b** 
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	mult(x)
	{
		return new Vector2(this.x * x, this.y * x);
	}

	/**
	 * Divides vector **a** with vector **b**
	 * @param {Vector2} a
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	static div(a, x)
	{
		return new Vector2(a.x / x, a.y / x);
	}
	/**
	 * Divides current vector with vector **b**
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	div(x)
	{
		return new Vector2(this.x / x, this.y / x);
	}

	/**
	 * Calculates the magnitude of vector **a**
	 * @param {Vector2} a
	 * @returns {Vector2}
	 */
	static magnitude(a){
		return Math.sqrt(a.x * a.x + a.y * a.y);
	}
	/**
	 * Calculates the magnitude of current vector
	 * @returns {Vector2}
	 */
	magnitude(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	/**
	 * Calculates the normal of vector **a**
	 * @param {Vector2} a
	 * @returns {Vector2}
	 */
	static normalize(a){
		let mag = Vector2.magnitude(a);
		if (mag === 0){
			return Vector2.Zero;
		}
		return new Vector2(a.x / mag, a.y / mag);
	}
	/**
	 * Calculates the normal of current vector
	 * @returns {Vector2}
	 */
	normalize(){
		let mag = Vector2.magnitude(this);
		if (mag === 0){
			return Vector2.Zero;
		}
		return new Vector2(this.x / mag, this.y / mag);
	}

	/**
	 * Calculates the dot product of vector **a**
	 * @param {Vector2} a
	 * @returns {Vector2}
	 */
	static dot(a, b){
		return a.x * b.x + a.y * b.y
	}
	/**
	 * Calculates the dot product of current vector
	 * @returns {Vector2}
	 */
	dot(b){
		return this.x * b.x + this.y * b.y
	}
}
