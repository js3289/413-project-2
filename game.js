// Globals + constants start here. All comments until setup function
	var HEIGHT;
	var WIDTH;
	var gameState;

// Aliases
	TextureImage = PIXI.Texture.fromImage;
	Sprite = PIXI.Sprite;
	Container = PIXI.Container;
	Renderer = PIXI.autoDetectRenderer;

// Gameport, renderer, All containers + stage
	var gameport;
	var renderer;
	
	var stage;
	var titleC;
	var instructionsC;
	var puzzleC;
	var menuC;
	var creditsC;

// Constants for anchoring sprites
	var LEFT;
	var TOP;
	var MIDDLE;
	var BOTTOM;
	var RIGHT;

	var player;
	var tiles;

/**
 *	EnhSprite is just an extension of PIXI.Sprite, keeps track of the name of the sprite as well as collision boolean
 *	Will also contain any further information we need on our Sprites
 */
class EnhSprite extends PIXI.Sprite {
	constructor(name, collides, texture) {
		super(texture);
		super.name = name;
		this.collides = collides;
	}
}

class Tile extends EnhSprite {
	constructor(name, texture, position) {
		super(name, false, texture);
		this.pos;
		this.anchor.x = TOP;
		this.anchor.y = LEFT;
		this.position.x = tiles.getNextOpenX();
		this.position.y = tiles.getNextOpenY();
	}
}

/**
 * Simple Matrix class used for storing and interacting with tiles in an easier way.
 * Will be used to store tiles for our puzzle
 */
class Matrix {

	constructor(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.size = rows*cols;
		this.data = [];
		this.size;
	}
	
	get(row, col) {
	
		// Primitive overloading
		// this.data[row]; has the effect of this.data[index];
		// so that set can be used as if it was just an array instead of a matrix
		if(arguments.length == 1) {
			return this.data[row];
		}
		else if(row < 0 || col < 0 || row*col >= this.size) {
			console.log("Out of bounds");
		}
		else{
			return this.data[(row*rows) + (col*cols - 1)];
		}
	}
	
	set(row, col, newdata) {
	
		// Primitive overloading
		// this.data[row] = col; has the effect of this.data[index] = newdata;
		// so that set can be used as if it was just an array instead of a matrix
		if(arguments.length == 2) {
			this.data[row] = col;
		}
		else if(row < 0 || col < 0 || row*col >= this.size) {
			console.log("Out of bounds");
		}
		else{
			this.data[(row*rows) + (col*cols - 1)] = newdata;
		}
	}
	
	
	
}

class TileMatrix extends Matrix {
	constructor(rows, cols) {
		super(rows, cols);
		this.nextX = 0;
		this.nextY = 0;
	}
	
	getNextPos() {
		if(this.nextX === 0) {
			this.nextX = 20;
		}
		if(this.nextY === 0) {
			this.nextY = 20;
		}
		else {
			this.nextX = (this.nextX + 95) % WIDTH;
		}
		
		if(this.nextX > 400) {
			this.nextX = 20;
			this.nextY = this.nextY + 95;
		}
		
		if(this.nextY > 400) {
			console.log("Matrix full!");
		}
	}
	
	getNextOpenX() {
		this.getNextPos();
		return this.nextX;
	}
	
	getNextOpenY() {
		return this.nextY;
	}
}

function animate() { 
	requestAnimationFrame(animate);
	renderer.render(stage);
}

function setup() {
	HEIGHT = 500;
	WIDTH = 500;
	gameState = "title";
	
	tiles = new TileMatrix(5, 5);
	
	gameport = document.getElementById("gameport");
	renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
	
	stage 			= new Container();
	gameplayC		= new Container();
	titleC 			= new Container();
	instructionsC 	= new Container();
	puzzleC 		= new Container();
	menuC 			= new Container();
	creditsC 		= new Container();
	
	LEFT = 0;
	TOP = 0;
	MIDDLE = .5;
	BOTTOM = 1;
	RIGHT = 1;
	
// Add renderer to gameport
	gameport.appendChild(renderer.view);
	
// Create background. Center background + add it to stage.
	var background = new Sprite(TextureImage("Assets/png/background.png"));
	background.anchor.x = MIDDLE;
	background.anchor.y = MIDDLE;
	background.position.x = WIDTH / 2;
	background.position.y = HEIGHT / 2;

// Add background to stage
	gameplayC.addChild(background);
	stage.addChild(gameplayC);
	
// Take image and generate + place tiles.
	generateTiles();
	stage.addChild(puzzleC);
	
// Pass control to animate
	animate();
}

function generateTiles() {
	for(var i = 0; i < 24; i++) {
		var temp = new Tile("tile", TextureImage("Assets/png/test-tile.png", i) );
		tiles.set(i, temp);
		puzzleC.addChild(temp);
	}
}
setup();