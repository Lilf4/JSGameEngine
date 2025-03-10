/*
 * TODO
 * Way too many things ;-;
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

/**
 * Handles resources such as loaded images and allows for caching of these.
 */
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
	 * Clears cache of resource manager
	 */
	ClearCache(){
		this.cache.clear();
	}
}

const resManager = new ResourceManager();

/**
 * Handles game objects, input, rendering, and game loop.
 */
class GameEngine {
	background = 'black';
	lastFrameTime = performance.now();
	GameObjectDict = {}
	GameObjectUIRenderList = []
	GameObjectWorldRenderList = []
	GameObjectList = []
	KeysDown = {}
	KeysPressed = {}
	ClickLimit = 200;

	/**
	 * Creates an instance of the GameEngine.
	 * @param {HTMLCanvasElement} Canvas - The canvas element used for rendering the game.
	 * @param {Vector2} [Size=new Vector2(500, 500)] - The size of the game screen.
	 */
	constructor(Canvas, Size = new Vector2(500, 500)){
		this.canvas = Canvas;
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = Size.x;
		this.canvas.height = Size.y;
		this.screenSize = Size;
		this.CameraObject = new GameObject({colliderSize: Size, name: "Camera"});

		this.MouseMoveEventHandler = this.MouseMoveEventHandler.bind(this);
		this.KeyDownEventHandler = this.KeyDownEventHandler.bind(this);
		this.KeyUpEventHandler = this.KeyUpEventHandler.bind(this);
		this.MouseDownEventHandler = this.MouseDownEventHandler.bind(this);
		this.MouseUpEventHandler = this.MouseUpEventHandler.bind(this);
		addEventListener("mousemove", this.MouseMoveEventHandler);
		addEventListener("mousedown", this.MouseDownEventHandler);
		addEventListener("mouseup", this.MouseUpEventHandler);
		addEventListener("keydown", this.KeyDownEventHandler);
		addEventListener("keyup", this.KeyUpEventHandler);
	}

	#mouseState = {
		screenPosition: new Vector2(),
		isOverCanvas: false
	}

	MouseMoveEventHandler(event){
		let rect = this.canvas.getBoundingClientRect();
		this.#mouseState.screenPosition = new Vector2(event.clientX - rect.left, event.clientY - rect.top)
		this.#mouseState.isOverCanvas = event.target == this.canvas || (this.#mouseState.screenPosition.x >= 0 && this.#mouseState.screenPosition.x <= this.screenSize.y && this.#mouseState.screenPosition.y >= 0 && this.#mouseState.screenPosition.y <= this.screenSize.y);
	}

	/**
	 * Handles mouse down events
	 * @param {MouseEvent} event
	 */
	MouseDownEventHandler(event){
		event.preventDefault();
		let ButtonCode = `MOUSE${event.button}`
		if(!(ButtonCode in this.KeysDown)){
			this.KeysDown[ButtonCode] = { pressed: performance.now(), checked: false}
		}
	}

	/**
	 * Handles mouse up events
	 * @param {MouseEvent} event
	 */
	MouseUpEventHandler(event){
		event.preventDefault();
		let ButtonCode = `MOUSE${event.button}`
		if(ButtonCode in this.KeysDown){
			this.KeysPressed[ButtonCode] = { pressed: performance.now() };
			delete this.KeysDown[ButtonCode];
			
			setTimeout(() => {
				if (ButtonCode in this.KeysPressed && performance.now() - this.KeysPressed[ButtonCode]?.pressed > this.ClickLimit) {
					delete this.KeysPressed[ButtonCode];
				}
			}, this.ClickLimit + 10);
		}
	}

	/**
	 * Handles key down events
	 * @param {KeyboardEvent} event
	 */
	KeyDownEventHandler(event){
		event.preventDefault();
		if(!(event.key in this.KeysDown)){
			this.KeysDown[event.key] = { pressed: performance.now(), checked: false}
		}
	}

	/**
	 * Handles key up events
	 * @param {KeyboardEvent} event
	 */
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

	/**
	 * Checks whether key has **just** been released
	 * @param {string} key string representation of key to check
	 * @returns {boolean} **True** if key has just been let go, else returns **False**
	 */
	IsKeyReleased(key){
		if (key in this.KeysPressed && performance.now() - this.KeysPressed[key].pressed <= this.ClickLimit){
			delete this.KeysPressed[key];
			return true;
		}
		return false;
	}

	/**
	 * Checks whether key has **just** been pressed
	 * @param {string} key string representation of key to check
	 * @returns {boolean} **True** if key has just been pressed, else returns **False**
	 */
	IsKeyPressed(key){
		if (key in this.KeysDown && !this.KeysDown[key].checked && performance.now() - this.KeysDown[key].pressed <= this.ClickLimit){
			this.KeysDown[key].checked = true;
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
	 * Checks whether mouse button has just been pressed
	 * @param {string} button string representation of key to check
	 * @returns {boolean} **True** if button has just been pressed, else returns **False**
	 */
	IsMousePressed(button){
		let ButtonCode = `MOUSE${button}`
		if (ButtonCode in this.KeysDown && !this.KeysDown[ButtonCode].checked && performance.now() - this.KeysDown[ButtonCode].pressed <= this.ClickLimit){
			this.KeysDown[ButtonCode].checked = true;
			return true;
		}
		return false;
	}

	/**
	 * Checks whether mouse button has just been released
	 * @param {string} button string representation of key to check
	 * @returns {boolean} **True** if button has just been released, else returns **False**
	 */
	IsMouseReleased(button){
		let ButtonCode = `MOUSE${button}`
		if (ButtonCode in this.KeysPressed && performance.now() - this.KeysPressed[ButtonCode].pressed <= this.ClickLimit){
			delete this.KeysPressed[ButtonCode];
			return true;
		}
		return false;
	}

	/**
	 * Checks whether mouse button is being held down
	 * @param {string} button string representation of key to check
	 * @returns {boolean} **True** if button is being held down, else returns **False**
	 */
	IsMouseDown(button){
		let ButtonCode = `MOUSE${button}`
		return (ButtonCode in this.KeysDown);
	}

	/**
	 * Returns the current mouse position in screen space
	 * @returns {Vector2} - mouse position in screen space
	 */
	GetMousePosition(){
		return this.#mouseState.screenPosition;
	}

	/**
	 * Returns check of whether the mouse is over the game screen
	 * @returns {boolean} - **True** if mouse is over the game screen, else returns **False**
	 */
	IsMouseOverCanvas(){
		return this.#mouseState.isOverCanvas;
	}

	#cursorObject = new GameObject({position: new Vector2(0,0), colliderSize: new Vector2(1,1)})
	/**
	 * Returns a list of gameobjects that the mouse is currently over/colliding with
	 * @returns {GameObject[]} - list of colliding GameObjects
	 */
	GetMouseCollisions(){
		this.#cursorObject.position = this.screenToWorldSpace(this.#mouseState.screenPosition);
		return this.GetCollidingObjects(this.#cursorObject)
	}


	/**
	 * Renderes current game frame
	 * @param {Number} delta - time since last frame
	 */
	#DrawScene(delta){
		this.ctx.fillStyle = this.background
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.save();
		this.ctx.translate(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);

		//Apply camera properties
		this.ctx.rotate(this.CameraObject.rotation * Math.PI / 180);
		this.ctx.scale(this.CameraObject.scale.x, this.CameraObject.scale.y);
		
		this.ctx.translate(-this.ctx.canvas.width / 2, -this.ctx.canvas.height / 2);

		//WORLD PASS
		this.GameObjectWorldRenderList.forEach(object => {
			if (!(object instanceof VisibleObject) || !object.visible) {return;}

			var objScreenPos = this.worldToScreenSpace(object.position);

			this.ctx.save();
			this.ctx.translate(objScreenPos.x, objScreenPos.y);
			this.ctx.rotate(object.rotation * Math.PI / 180);
			this.ctx.scale(object.scale.x, object.scale.y);

			object.draw(delta, this.ctx);

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
		});
		this.ctx.restore();
		//UI PASS
		this.GameObjectUIRenderList.forEach(object => {
			if (!(object instanceof VisibleObject) || !object.visible) {return;}

			var objScreenPos = object.position;

			this.ctx.save();
			this.ctx.translate(objScreenPos.x, objScreenPos.y);
			this.ctx.rotate(object.rotation * Math.PI / 180);
			this.ctx.scale(object.scale.x, object.scale.y);

			object.draw(delta, this.ctx);

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
		});
	}

	/**
	 * Adds a GameObject to the engine.
	 * Ensures the object is an instance of GameObject (or a subclass of it) and gives it a unique ID.
	 * @param {GameObject} object - The GameObject instance to add to the engine.
	 * @param {string} renderMode - The render mode/pass the object should be under (world/ui)
	 * @throws {Error} If the object is not an instance of GameObject or its subclass.
	 */
	AddObject(object, renderMode = 'world'){
		if (!(object instanceof GameObject)) {
			throw new Error(`The object must be an instance of GameObject or a subclass of it, but received: ${object}`);
		}
		let uuid = -1;
		do{
			uuid = GetUUID();
		} while(uuid in this.GameObjectDict);
		object.id = uuid
		this.GameObjectDict[uuid] = object
		if(renderMode == 'world'){
			this.GameObjectWorldRenderList.push(object)
		}
		else if(renderMode == 'ui'){
			this.GameObjectUIRenderList.push(object);
		}
		this.#CreateObjectRenderOrderList()
	}

	/**
	 * Removes a GameObject from the engine.
	 * @param {GameObject} object - The GameObject instance to add to remove.
	 */
	RemObject(object){
		if(object.id in this.GameObjectDict){
			delete this.GameObjectDict[object.id]

			let objIndex = this.GameObjectUIRenderList.findIndex(o => o.id == object.id)
			if(objIndex >= 0){
				this.GameObjectUIRenderList.splice(objIndex, 1);
			}

			objIndex = this.GameObjectWorldRenderList.findIndex(o => o.id == object.id)
			if(objIndex >= 0){
				this.GameObjectWorldRenderList.splice(objIndex, 1);
			}
		}
		this.#CreateObjectRenderOrderList();
	}

	/**
	 * Recreates internal layer ordered list of objects to be drawn
	 */
	#CreateObjectRenderOrderList(){
		this.GameObjectList = [];
		this.GameObjectList = Object.values(this.GameObjectDict).sort((a, b) => b.layer - a.layer);
		this.GameObjectUIRenderList.sort((a, b) => b.layer - a.layer);
		this.GameObjectWorldRenderList.sort((a, b) => b.layer - a.layer);
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

		var angle = (this.CameraObject.rotation * Math.PI) / 180;
		var cosA = Math.cos(angle);
    	var sinA = -Math.sin(angle);

		var rotatedX = relativePos.x * cosA - relativePos.y * sinA;
    	var rotatedY = relativePos.x * sinA + relativePos.y * cosA;

		var rotatedPos = new Vector2(rotatedX, -rotatedY);
		
		return rotatedPos
	}
}

/**
 * The base class for all game objects in the scene.
 * 
 * A `GameObject` represents an entity with a position, rotation, scale, 
 * and optional collision properties. It serves as the foundation for 
 * other more complex game objects by providing essential transformation 
 * and collision-handling features.
 * 
 * This class is designed to be extended by other object types.
 */
class GameObject{
	/**
	 * Represents a basic game object with position, rotation, scale, and collision properties.
	 * @param {Object} options - Configuration options for the game object.
	 * @param {Vector2} [options.position=new Vector2(0,0)] - The position of the object.
	 * @param {number} [options.rotation=0] - The rotation angle of the object in degrees.
	 * @param {Vector2} [options.scale=new Vector2(1,1)] - The scale of the object.
	 * @param {Vector2} [options.colliderSize=new Vector2(10, 10)] - The size of the collider.
	 * @param {Vector2} [options.colliderOffset=new Vector2(0, 0)] - The offset of the collider relative to position.
	 * @param {boolean} [options.drawCollider=false] - Whether to visually draw the collider for debugging.
	 * @param {string} [options.name='GameObject'] - The name of the game object.
	 * @param {string[]} [options.tags=[]] - An array of tags for categorization or filtering.
	 */
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

/**
 * @extends GameObject
 * A game object that can be rendered on-screen.
 * Inherits from `GameObject` and introduces visibility and layering.
 * Other renderable objects, such as images, text, and shapes, extend this class.
 */
class VisibleObject extends GameObject{
	/**
	 * Represents an object that can be rendered on the screen.
	 * @extends GameObject
	 * @param {Object} options - Configuration options for the object.
	 * @param {number} [options.layer=0] - The rendering layer of the object.
	 * @param {boolean} [options.visible=true] - Determines if the object is visible.
	 */
	constructor({
		layer = 0,
		visible = true,
		...GameObjectOptions
	})
	{
		super(GameObjectOptions)
		this.layer = layer;
		this.visible = visible;
		if (this.draw === VisibleObject.prototype.draw) {
            throw new Error(`${this.constructor.name} must override the draw() method.`);
        }
	}

	/**
	 * Function that engine calls after applying local transformations to canvas context
	 * @param {Number} dt - time since last frame
	 * @param {CanvasRenderingContext2D} ctx - context to canvas that is being drawn on
	 */
	draw(dt, ctx) {
        throw new Error("draw() method must be implemented in a subclass.");
    }
}

/**
 * A visible game object that renders a custom shape using Path2D.
 * Allows for filled or outlined shapes with configurable properties.
 * Useful for drawing vector graphics.
 *
 * @extends VisibleObject
 */
class CustomShapeObject extends VisibleObject{
	/**
	 * Represents an object with a custom drawable shape.
	 * @extends VisibleObject
	 * @param {Object} options - Configuration options for the object.
	 * @param {Path2D} [options.shape=new Path2D()] - The shape to be drawn.
	 * @param {string} [options.color='white'] - The fill color of the shape.
	 * @param {boolean} [options.drawAsOutline=false] - Whether to draw the shape as an outline.
	 * @param {number} [options.outlineThickness=1] - The thickness of the shape outline.
	 */
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

	draw(dt, ctx){
		if(this.drawAsOutline){
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.outlineThickness;
			ctx.stroke(this.shape);
		}
		else{
			ctx.fillStyle = this.color;
			ctx.fill(this.shape);
		}
	}
}

/**
 * A visible game object that renders an image.
 * Supports image repetition, scaling, and source cropping overrides.
 *
 * @extends VisibleObject 
 */
class ImageObject extends VisibleObject{
	/**
	 * Represents an object that displays an image.
	 * @extends VisibleObject
	 * @param {Object} options - Configuration options for the object.
	 * @param {HTMLImageElement} [options.image=new Image()] - The image to be displayed.
	 * @param {boolean} [options.repeat=false] - Determines if the image should repeat.
	 * @param {Vector2|null} [options.overrideDisplaySize=null] - Custom display size for the image.
	 * @param {Vector2|null} [options.overrideImgSourceSize=null] - Custom source size for the image.
	 * @param {Vector2|null} [options.overrideImgSourcePosition=null] - Custom source position for the image.
	 */
	constructor({
		image = null,
		imageUrl = null,
		repeat = false,
		overrideDisplaySize = null,
		overrideImgSourceSize = null,
		overrideImgSourcePosition = null,
		...GameObjectOptions
	} = {})
	{
		super(GameObjectOptions)

		if(image != null){
			this.image = image;
		}
		else if(imageUrl != null)
		{
			this.imageUrl = imageUrl;
		}
		else{
			this.image = new Image();
		}

		this.repeat = repeat;
		this.overrideDisplaySize = overrideDisplaySize;
		this.overrideImgSourceSize = overrideImgSourceSize;
		this.overrideImgSourcePosition = overrideImgSourcePosition;
	}

	set imageUrl(val){
		(async function test(val) {
			return (await resManager.LoadImage(val))
		})(val).then((v) => this.image = v);
	}

	get imageUrl(){
		return this.image.src;
	}

	draw(dt, ctx){
		var ImageSize = this.overrideDisplaySize == null ? new Vector2(this.image.width, this.image.height) : this.overrideDisplaySize;
		var SourceImagePosition = this.overrideImgSourcePosition == null ? Vector2.Zero : this.overrideImgSourcePosition;
		var SourceImageSize = this.overrideImgSourceSize == null ? new Vector2(this.image.width, this.image.height) : this.overrideImgSourceSize;
		if (!this.repeat){
			ctx.drawImage(
				this.image, 
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
			let patternTransform = ctx.getTransform();

			patternTransform.e = -(ImageSize.x / 2);
			patternTransform.f = -(ImageSize.y / 2);

			let imgPattern = ctx.createPattern(this.image, repeatMode);
			ctx.fillStyle = imgPattern;
			if(imgPattern != null){
				imgPattern.setTransform(patternTransform);
				ctx.fillRect(-(ImageSize.x / 2), -(ImageSize.y / 2), ImageSize.x, ImageSize.y)
			}
		}
	}
}

/**
 * A visible game object that plays frame-based animations using a sprite sheet.
 * Supports sprite sheets arranged in horizontal or vertical stacks.
 * Includes animation controls such as FPS, playback direction, looping, and frame offsets.
 *
 * @extends VisibleObject
 */
class ImageAnimObject extends VisibleObject{
	/**
	 * Represents an animated object using a spritesheet.
	 * @extends VisibleObject
	 * @param {Object} options - Configuration options for the object.
	 * @param {HTMLImageElement} [options.image=new Image()] - The spritesheet image.
	 * @param {boolean} [options.horizontalStacked=true] - Defines whether frames are stacked horizontally.
	 * @param {Vector2} [options.spriteColRowCount=new Vector2(0,0)] - The column and row count of the spritesheet.
	 * @param {Vector2} [options.spriteSize=new Vector2(0,0)] - The size of each sprite frame.
	 * @param {Vector2|null} [options.overrideDisplaySize=null] - Custom display size for the sprite.
	 * @param {number} [options.spriteAmount=0] - The total number of sprite frames in the animation.
	 * @param {number} [options.currentFrame=0] - The current frame index.
	 * @param {number} [options.fps=24] - Frames per second for animation.
	 * @param {boolean} [options.stopAtEnd=false] - Whether the animation stops at the last frame.
	 * @param {boolean} [options.reverseAtEnd=false] - Whether the animation reverses direction at the last frame.
	 * @param {number} [options.animDirection=1] - The animation playback direction (1 for forward, -1 for reverse).
	 * @param {Vector2} [options.colRowStartOffset=new Vector2(0,0)] - Column and row offset for starting the animation.
	 */
	constructor({
		image = null,
		imageUrl = null,
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
		if(image != null){
			this.image = image;
		}
		else if(imageUrl != null)
		{
			this.imageUrl = imageUrl;
		}
		else{
			this.image = new Image();
		}
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

	set imageUrl(val){
		(async function test(val) {
			return (await resManager.LoadImage(val))
		})(val).then((v) => this.image = v);
	}

	get imageUrl(){
		return this.image.src;
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
			this.spriteAmount = this.spriteColRowCount.x * this.spriteColRowCount.y;
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

	draw(dt, ctx){
		var displaySize = this.overrideDisplaySize == null ? this.spriteSize : this.overrideDisplaySize;
		ctx.drawImage(
			this.image, 
			this.spriteSize.x * this.currentFrame.x,
			this.spriteSize.y * this.currentFrame.y,
			this.spriteSize.x,
			this.spriteSize.y,
			-(displaySize.x / 2), 
			-(displaySize.y / 2), 
			displaySize.x, 
			displaySize.y
		)
		this.AddTime(dt)
	}
}

/**
 * A visible game object that renders text on-screen.
 * Supports customizable font, color, alignment, line height, and optional outline drawing.
 * Useful for UI elements, dialogue, or in-game labels.
 *
 * @extends VisibleObject
 */
class TextObject extends VisibleObject{
	/**
	 * Represents an object that renders text on the screen.
	 * @extends VisibleObject
	 * @param {Object} options - Configuration options for the object.
	 * @param {string} [options.text="new text!"] - The text content.
	 * @param {string} [options.color='white'] - The text color.
	 * @param {boolean} [options.drawAsOutline=false] - Whether to draw the text as an outline.
	 * @param {number} [options.outlineThickness=1] - The thickness of the text outline.
	 * @param {string} [options.font="30px Verdana"] - The font styling for the text.
	 * @param {string} [options.alignment="left"] - The text alignment ("left", "center", "right").
	 * @param {number} [options.lineHeight=30] - The line height for multi-line text.
	 */
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

	draw(dt, ctx){
		ctx.font = this.font;
		ctx.textAlign = this.alignment;
		let y = 0;
		let lines = this.text.split("\n");
		if(this.drawAsOutline){
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.outlineThickness;
			lines.forEach(line => {
				ctx.strokeText(line, 0, y);
				y += this.lineHeight;
			});
		}
		else{
			ctx.fillStyle = this.color;
			lines.forEach(line => {
				ctx.fillText(line, 0, y);
				y += this.lineHeight;
			});
		}
	}
}

/**
 * Represents a 2D vector with basic vector operations such as addition, subtraction, 
 * multiplication, division, normalization, and dot product. 
 * This class is useful for handling positions, velocities, and directions in 2D space.
 *
 * @param {number} x - The x-coordinate of the vector.
 * @param {number} y - The y-coordinate of the vector.
 */
class Vector2{
	static Up = new Vector2(0, 1);
	static Down = new Vector2(0, -1);
	static Left = new Vector2(-1, 0);
	static Right = new Vector2(1, 0);
	static Zero = new Vector2(0, 0);

	/**
	* Creates an instance of a 2D vector with the given coordinates.
	* 
	* @param {number} x - The x-coordinate of the vector.
	* @param {number} y - The y-coordinate of the vector.
	*/
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
