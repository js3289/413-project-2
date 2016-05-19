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
		super(texture)
		super.name = name;
		this.collides = collides;
	}
}

function animate() { 
	requestAnimationFrame(animate);
	handleKeys();
	keepInBounds();
	renderer.render(stage);
}

function setup() {
	HEIGHT = 500;
	WIDTH = 500;
	gameState = "title";
	
	tiles = [];
	
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
}

setup();