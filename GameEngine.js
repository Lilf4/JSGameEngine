var canvas = null;
var ctx = null;

var background = 'black'

function SetupRender(Canvas, Width, Height)
{
	canvas = Canvas;
	ctx = canvas.getContext('2d');
	canvas.width = Width;
	canvas.height = Height;
}

function DrawScene()
{
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function InstantiateObject(object)
{
	
}
/*
 * TODO
 * Input Handler
 * Object Handler
 * Game Loop
 * */

class GameObject{
	constructor(position = new Vector2(), shape = new Shape2D, scale = new Vector2(1,1), colliderSize = new Vector2(1, 1), colliderOffset = new Vector2(0, 0), name = 'GameObject')
	{
		this.id = -1;
		this.name = name;
		this.position = position;
		this.shape = shape;
		this.scale = scale;
		this.colliderSize = colliderSize;
		this.colliderOffset = colliderOffset;
		this.layer = 0;
	}
}

class Vector2{
	constructor(x = 0, y = 0)
	{
		this.x = x;
		this.y = y;
	}

	static Add(a, b)
	{
		return new Vector2(a.x + b.x, a.y + b.y);
	}
	static Sub(a, b)
	{
		return new Vector2(a.x - b.x, a.y - b.y);
	}
	static Mult(a, x)
	{
		return new Vector2(a.x * x, a.y * x);
	}
	static Div(a, x)
	{
		return new Vector2(a.x / x, a.y / x);
	}
}
