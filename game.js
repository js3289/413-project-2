// Globals + constants start here. All comments until setup function
	var HEIGHT;
	var WIDTH;
	var gameState;

// Aliases
	TextureImage = PIXI.Texture.fromImage;
	TextureFrame = PIXI.Texture.fromFrame;
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
	var emptyTile;
	var tiles;
	
	var isAnimating;
	
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	
	PIXI.loader
		.add("Assets/assets.json")
		.load(setup);

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
	constructor(name, texture, pos) {
		super(name, false, texture);
		this.pos = pos;
		this.anchor.x = TOP;
		this.anchor.y = LEFT;
		this.position.x = tiles.getNextOpenX();
		this.position.y = tiles.getNextOpenY();
		this.interactive = true;
		
		this
			.on('mousedown', this.switchLocation);
			//.on('mouseup', this.switchLocation)
			//.on('mouseupoutside', this.switchLocation)
			//.on('touchstart', this.switchLocation)
			//.on('touchend', this.switchLocation)
			//.on('touchendoutside', this.switchLocation);
			
	}
	
	switchLocation() {
		if(!isAnimating && this.name != "emptyTile") {
				if(tiles.isAdjacent(this)) {
				isAnimating = !isAnimating;
				var tempX = this.position.x;
				var tempY = this.position.y;
				var tempPos = this.pos;
				createjs.Tween.get(this.position).to({x: emptyTile.position.x, y: emptyTile.position.y}, 425);
				createjs.Tween.get(emptyTile.position).to({x: tempX, y: tempY}, 425);
				this.pos = emptyTile.pos;
				emptyTile.pos = tempPos;
				setTimeout(function(){ isAnimating = false}, 425);
			}
		}
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
	
	isAdjacent(tile){
		if(Math.abs(tile.pos - emptyTile.pos) === 1 || Math.abs(tile.pos - emptyTile.pos) === this.cols) {
			return true;
		}
		else {
			return false;
		}
	}
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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
	
	isAnimating = false;
	
// Add renderer to gameport
	gameport.appendChild(renderer.view);
	
// Create background. Center background + add it to stage.
	var background = new Sprite(TextureFrame("background-final.png"));
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
	var posArr = [];
	var tilArr = [];
	var finArr = [];
	for(var i = 0; i < 24; i++){
		var temp = randInt(0, 23);
		while(posArr.indexOf(temp) >= 0){
			temp = randInt(0, 23);
		}
		posArr[i] = temp;
	}
	for(var i = 0; i < 24; i++) {
		var temp = new Tile("tile", TextureFrame(posArr[i] + ".png"), i);
		tilArr.push(temp);
		tiles.set(i, tilArr[i]);
		puzzleC.addChild(tilArr[i]);
	}
	
	emptyTile = new Tile("emptyTile", TextureFrame("empty-tile.png"), 24);
	emptyTile.visible = false;
	tiles.set(24, emptyTile);
	puzzleC.addChild(emptyTile);
}
