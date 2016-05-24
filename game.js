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

// Misc globals used in game
	var player;
	var emptyTile;
	var keysActive;
	var tiles;
	var menu;
	var hasWon;
	var posArr;
	var slide;
	var isAnimating;
	
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	
	PIXI.loader
		.add("Assets/assets.json")
		.add("TileSlide.mp3")
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

/**
 *	Tile class
 *	Extends from our enhanced sprite, used to populate our game board
 *  @param {name} - Name of sprite, used for reference
 *	@param {texture} - Texture to create sprite out of
 *	@param {pos} - Position in our Tile Matrix
 */
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
			
	}
	
	switchLocation() {
	
		console.log(this.x + " --- " + this.y);
		
		if(!isAnimating && this.name != "emptyTile" && !hasWon) {
			if(tiles.isAdjacent(this)) {
				isAnimating = !isAnimating;
				
				var tempX = this.position.x;
				var tempY = this.position.y;
				var tempPos = this.pos;
				
				createjs.Tween.get(this.position).to({x: emptyTile.position.x, y: emptyTile.position.y}, 450);
				createjs.Tween.get(emptyTile.position).to({x: tempX, y: tempY}, 450);
				slide.play();
				
				
				this.pos = emptyTile.pos;
				emptyTile.pos = tempPos;
				
				console.log("This: " + this.pos + " Empty: " + emptyTile.pos);
				
				var temp = posArr[this.pos];
				posArr[this.pos] = posArr[emptyTile.pos];
				posArr[emptyTile.pos] = temp;
				
				console.log(posArr);
				
				var wonCheck = true;
				for(var i = 0; i < posArr.length; i++) {
					if(posArr[i] != i) {
						wonCheck = false;
					}
				}
				if(wonCheck) {
						hasWon = true;
						setTimeout(function() { controlState("win") }, 3000 );
					}
				setTimeout(function(){ isAnimating = false}, 475);
			}
		}
	}
}

/**
 * 	Simple Matrix class.
 *	@param {rows} - Rows of matrix
 *	@param {cols} - Columns of matrix
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

/**
 * 	Simple Matrix class used for storing and interacting with tiles in an easier way.
 * 	Will be used to store tiles for our puzzle.
 *	@param {rows} - Rows of matrix
 *	@param {cols} - Columns of matrix
 */
class TileMatrix extends Matrix {
	constructor(rows, cols) {
		super(rows, cols);
		this.nextX = 0;
		this.nextY = 0;
	}
	
	// 3 functions to fill our background correctly, positions tiles in appropriate X/Y
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
	
	// Checks if our tile is adjacent to the "empty" tile - used to validate sliding of tiles in our game board
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
	handleKeys();
	renderer.render(stage);
}

// Setup does all of the setup for our game, from defining variables to starting the game.
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
	winC			= new Container();
	mainMenuC		= new Container();

	LEFT = 0;
	TOP = 0;
	MIDDLE = .5;
	BOTTOM = 1;
	RIGHT = 1;
	
	keysActive = [];

	isAnimating = false;
	menu = false;
	hasWon = false;
	slide = PIXI.audioManager.getAudio("TileSlide.mp3");

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

	
// Main menu
	mainMenuC.addChild(new Sprite(TextureFrame("menu.png")));
	
	// play button
	playButton = new Sprite(TextureFrame("Play-button.png"));
	playButton.anchor.x = LEFT;
	playButton.anchor.y = TOP;
	playButton.x = 154;
	playButton.y = 150;
	
	playButton.interactive = true;
	playButton.on('mousedown', function() { controlState("play") } );
	
	mainMenuC.addChild(playButton);
	
	// instructions button
	instructionsButton = new Sprite(TextureFrame("Instructions-button.png"));
	instructionsButton.anchor.x = LEFT;
	instructionsButton.anchor.y = TOP;
	instructionsButton.x = 154;
	instructionsButton.y = 260;
	
	instructionsButton.interactive = true;
	instructionsButton.on('mousedown', function() { controlState("instructions") } );
	
	mainMenuC.addChild(instructionsButton);
	
	// credits button
	creditsButton = new Sprite(TextureFrame("Credits-button.png"));
	creditsButton.anchor.x = LEFT;
	creditsButton.anchor.y = TOP;
	creditsButton.x = 154;
	creditsButton.y = 370;
	
	
	creditsButton.interactive = true;
	creditsButton.on('mousedown', function() { controlState("credits") } );
	
	mainMenuC.addChild(creditsButton);
	
// Instructions
	instructionsC.addChild(new Sprite(TextureFrame("Instructions.png")));

	// back button
	backButton = new Sprite(TextureFrame("Back-button.png"));
	backButton.anchor.x = LEFT;
	backButton.anchor.y = TOP;
	backButton.x = 154;
	backButton.y = 370;
	
	
	backButton.interactive = true;
	backButton.on('mousedown', function() { controlState("main") } );
	
	instructionsC.addChild(backButton);
	
// Credits
	creditsC.addChild(new Sprite(TextureFrame("Credits.png")));

	// back button
	backButton = new Sprite(TextureFrame("Back-button.png"));
	backButton.anchor.x = LEFT;
	backButton.anchor.y = TOP;
	backButton.x = 154;
	backButton.y = 370;
	
	
	backButton.interactive = true;
	backButton.on('mousedown', function() { controlState("main") } );
	
	creditsC.addChild(backButton);
	
	

// Take image and generate + place tiles.
	generateTiles();
	titleC.addChild(new Sprite(TextureFrame("title.png")));
	var menuComplete = new Sprite(TextureFrame("Easy-mode.png"));
	menuComplete.scale.x = 1.25;
	menuComplete.scale.y = 1.25;
	menuC.addChild(menuComplete);
	winC.addChild(new Sprite(TextureFrame("you-win.png")));
	
	controlState("title");
	setTimeout(function() { controlState("main") }, 3000 );
	setTimeout(function() { 
							document.addEventListener('keydown', function(e) { 
											keysActive[e.keyCode] = true; e.preventDefault(); } ) 
						  }, 8000 );
	setTimeout(function() { 
							document.addEventListener('keyup', function(e) { 
											keysActive[e.keyCode] = false; e.preventDefault(); } ) 
						  }, 8000 );

// Pass control to animate
	animate();
}

function handleKeys(e) {
	if(keysActive[9] && gameState === "play") {
		if(menu === false) {
			menu = true;
			controlState("menu");
		}
	}
	if(!keysActive[9] && gameState === "menu") {
		if(menu) {
			menu = false;
			controlState("play");
		}
	}
		
}

//controlState function makes it easy to handle changing containers and dealing with the stage
function controlState(state) {
	for(var i = stage.children.length - 1; i >= 0; i--){
		stage.removeChild(stage.children[i]);
	}
	
	gameState = state;
	
	if(gameState === "play") {
		stage.addChild(gameplayC);
		stage.addChild(puzzleC);
	}
	else if(gameState === "main") {
		stage.addChild(mainMenuC);
	}
	else if (gameState === "title"){
		stage.addChild(titleC);
	}
	else if (gameState === "instructions"){
		stage.addChild(instructionsC);
	}
	else if(gameState === "win") {
		stage.addChild(winC);
	}
	
	else if(gameState === "menu") {
		stage.addChild(menuC);
	}
	
	else if(gameState === "credits") {
		stage.addChild(creditsC);
	}
	
}

// generateTiles creates all of the tile objects from our sprites and shuffles them.
function generateTiles() { 
	posArr = [];
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
	
	emptyTile = new Tile("emptyTile", TextureFrame("24.png"), 24);
	posArr.push(24)
	emptyTile.visible = false;
	tiles.set(24, emptyTile);
	puzzleC.addChild(emptyTile);
	
	console.log(posArr);
	console.log(tilArr);
}
