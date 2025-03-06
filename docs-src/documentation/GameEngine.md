# GameEngine Class

## Overview
The `GameEngine` class is responsible for managing the game loop, handling input, rendering objects, and managing game objects. It provides methods to start and stop the game, handle keyboard events, and manage game objects.

## Constructor
### `constructor(Canvas, Size = new Vector2(500, 500))`
Creates an instance of the GameEngine.

- **Canvas**: The canvas element used for rendering the game.
- **Size**: The size of the game screen (default is `new Vector2(500, 500)`).

## Instance Methods

### `IsKeyPressed(key)`
Checks whether a key has just been let go.

- **key**: string representation of key to check.
- **Returns**: `boolean` **True** if key has just been let go, else returns **False**.

### `IsKeyDown(key)`
Checks whether a key is currently being held down.

- **key**: string representation of key to check.
- **Returns**: `boolean` **True** if key is currently held down, else returns **False**.

### `AddObject(object)`
Adds a `GameObject` to the engine.

- **object**: The `GameObject` instance to add to the engine.
- **Throws**: `Error` if the object is not an instance of `GameObject` or its subclass.

### `RemObject(object)`
Removes a `GameObject` from the engine.

- **object**: The `GameObject` instance to remove.

### `GetCollidingObjects(object)`
Gets all objects that collide with the specified object.

- **object**: The `GameObject` instance to check collision for.
- **Returns**: `GameObject[]` List of `GameObject`s that collide with the provided object.

### `Start()`
Starts the engine logic.

### `Stop()`
Stops the engine logic when the frame is finished processing.

### `SetLoopFunction(call)`
Sets the loop callback function, which gets called once every frame before the draw call.

- **call**: `CallableFunction` to be called every frame.

### `SetInitFunction(call)`
Sets the initialize callback function, which gets called once before the engine fully starts.

- **call**: `CallableFunction` to be called during initialization.

### `worldToScreenSpace(pos)`
Converts a world position to a screen position.

- **pos**: `Vector2` World position.
- **Returns**: `Vector2` Screen position.

### `screenToWorldSpace(pos)`
Converts a screen position to a world position.

- **pos**: `Vector2` Screen position.
- **Returns**: `Vector2` World position.

## Private Methods
These methods are intended for internal use only and are not part of the public API.
### `KeyDownEventHandler(event)`
Handles key down events.

- **event**: `KeyboardEvent` string representation of key to check.

### `KeyUpEventHandler(event)`
Handles key up events.

- **event**: `KeyboardEvent` string representation of key to check.

### `#DrawScene(delta)`
Renders the current game frame.

- **delta**: Time since the last frame.

### `#CreateObjectRenderOrderList()`
Recreates the internal layer-ordered list of objects to be drawn.

### `#getRotatedCorners(position, size, rotation)`
Calculates the rotated corners of a rectangle.

- **position**: `Vector2` Position of the rectangle.
- **size**: `Vector2` Size of the rectangle.
- **rotation**: Rotation angle in degrees.
- **Returns**: `Vector2[]` Array of rotated corners.

### `#projectVertices(vertices, axis)`
Projects vertices onto an axis.

- **vertices**: Array of `Vector2` vertices.
- **axis**: `Vector2` axis to project onto.
- **Returns**: Object with `min` and `max` projection values.

### `#overlaps(projA, projB)`
Checks if two projections overlap.

- **projA**: First projection.
- **projB**: Second projection.
- **Returns**: `boolean` **True** if projections overlap, else **False**.

### `#checkOBBCollision(posA, zA, angleA, posB, zB, angleB)`
Checks for collision between two oriented bounding boxes (OBB).

- **posA**: Position of the first OBB.
- **zA**: Size of the first OBB.
- **angleA**: Rotation angle of the first OBB.
- **posB**: Position of the second OBB.
- **zB**: Size of the second OBB.
- **angleB**: Rotation angle of the second OBB.
- **Returns**: `boolean` **True** if collision detected, else **False**.

### `#Loop()`
Engine main loop.
