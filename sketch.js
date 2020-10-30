//game variables
let canvasSize = 500;
let player;
let tiles = [];
const tileMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 4, 5, 6, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 4, 5, 5, 6, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 4, 5, 5, 5, 6, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 3]
];
let graves = [];
let gravity = 0.2;
let covids = [];
let covidCount = 5;
let deaths = 0;

//direction variables
let up = 0;
let down = 0;
let left = 0;
let right = 0;
let jumping = false;

// load in all of our graphical assets
function preload() {
  //bgArtwork = loadImage("grass.png");
  charArtwork = loadImage("MS_Warrior_art.png");
  tiles[1] = loadImage("Tile_1.png");
  tiles[2] = loadImage("Tile_2.png");
  tiles[3] = loadImage("Tile_3.png");
  tiles[4] = loadImage("Tile_10.png");
  tiles[5] = loadImage("Tile_11.png");
  tiles[6] = loadImage("Tile_12.png");
  covidArtwork = loadImage("covid.png");
}

function setup() {
  let canvas = createCanvas(canvasSize, canvasSize + 100);
  canvas.parent('game-container');

  player = new Character(0, canvasSize/2);
  for(let i = 0; i < covidCount; i++) {
    covid = new Covid();
    covids.push(covid);
  }
  
  imageMode(CORNER)
  fill(200,200,200)
  rect(0,400, 500, 100)
}

function draw() {
  // draw our background image
  clear();
  noStroke();
  imageMode(CORNER);

  fill(0)
  rect(0,500, 500, 50)

  fill(255)
  textSize(10)
  text("LEVEL " + player.level, 25, 525)
  //console.log(player.level)
  text(" HP" + player.hp, 60, 525)

  for(let r = 0; r < 10; r++) {
    for(let c = 0; c < 10; c++) {
      let tileIndex = tileMap[r][c];
      if(tileIndex > 0) {
        image(tiles[tileIndex], c*50, r*50, 50, 50);
      }
    }
  }

  imageMode(CENTER);
  covids.forEach(c => c.draw());
  player.display();

  if(deaths >= covidCount) {
    fill(255);
    rect(0, 0, 500, 500);
    fill(0);
    text('YOU WIN! :D', 200, 200);
  }
}

function collision(r1, r2) {
  if (r1.xPos + r1.size > r2.xPos &&
      r1.xPos < r2.xPos + r2.size &&
      r2.yPos + r2.size > r1.yPos &&
      r2.yPos < r1.yPos + r1.size) {
        return true;
  } else {
    return false;
  }
};

function placeFree(xNew, yNew) {
  let temp = {xPos: xNew, yPos: yNew, size: 50};
  if(xNew < 0 || xNew > 500 || yNew < 0 || yNew > 480) {
    return false;
  }
  let xTile = Math.floor(xNew / 50);
  let yTile = Math.floor(yNew / 50);
  let tileIndex = tileMap[yTile][xTile];
  if(tileIndex > 0 && up < 1) {
    return false;
  }
  return true;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function keyPressed() {
  if (keyCode === UP_ARROW && jumping === false) {
    up = 1;
    jumping = true;
    player.jump();
  }
  if (keyCode === DOWN_ARROW) {
    down = 1;
  }
  if (keyCode === LEFT_ARROW) {
    left = 1;
  }
  if (keyCode === RIGHT_ARROW) {
    right = 1;
  }
  if(keyCode === 32) {
    covids.forEach(c => {
      if(player.distance(c) <= 50 && !c.dead) {
        c.hurt(player.hitPoints);
      }
    })
  }
};

function keyReleased() {
  if (keyCode === UP_ARROW) {
    up = 0;
  }
  if (keyCode === DOWN_ARROW) {
    down = 0;
  }
  if (keyCode === LEFT_ARROW) {
    left = 0;
  }
  if (keyCode === RIGHT_ARROW) {
    right = 0;
  }
};

window.onload=function(){

}

class Character {
  constructor(x, y) {
    this.xPos = x;
    this.yPos = y;
    this.size = 50;
    this.speed = 3;
    this.gravitySpeed = 0;
    this.hitPoints = 40;
    this.hp = 1000;
    this.attacking = false;
    this.level = 1
  }

  display() {
    this.move();
    image(charArtwork, this.xPos, this.yPos, 30, 46);
  }

  direction() {
    if(left - right > 0) {
      this.left = true;
    }
    if(right - left > 0) {
      this.left = false;
    }
  }

  move() {
    this.gravitySpeed += gravity;
    let xDir = right - left;
    let yDir = this.gravitySpeed;
    up = ((this.gravitySpeed < 0) ? 1 : 0);
    if (placeFree(this.xPos + this.speed * xDir, this.yPos)) {
       this.xPos += this.speed * xDir;
    }
    if (placeFree(this.xPos, this.yPos + yDir)) {
       this.yPos += yDir;
    } else {
      jumping = false;
      this.gravitySpeed = 0;
    }
  }

  jump() {
    this.gravitySpeed = -8;
  }

  attack() {
    this.attacking = true;
  }

  distance(monster) {
    return Math.sqrt(Math.pow(monster.xPos - this.xPos, 2) + Math.pow(monster.yPos - this.yPos, 2));
  }
}

class Covid {
  constructor() {
    this.xPos = random(100,400);
    this.xStart = this.xPos;
    this.yPos = random(100,400);
    this.hp = 100;
    this.hit = 50;
    this.dead = false;
    this.seed = random(1, 25);
  }

  draw() {
    if(!this.dead) {
      let x = noise(this.seed);
		  let r = map(x, 0, 1, -50, 50);
      this.xPos = this.xStart + r;
      image(covidArtwork, this.xPos, this.yPos, 50, 50);
      fill(0);
      text('HP: ' + this.hp, this.xPos - 20, this.yPos - 30);
      this.seed += 0.01;
    }
  }

  hurt(pts) {
    this.hp -= pts;
    if(this.hp < 0) {
      this.dead = true;
      deaths++;
    }
  }
}
