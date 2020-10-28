// letiables to hold our artwork
let ghostArtwork;
let ghostLeftArtwork;
let candy1Artwork;
let candy2Artwork;
let tombStoneArtwork;
let spiderArtwork;
let bgArtwork;
let hammerArtwork;
let hammerLeftArtwork;
let startscreenArtwork;
let endscreenArtwork;
let fontBold;
let fontSkinny;
let breakSound;

//game variables
let canvasSize = 500;
let character;
let graves = [];
let spiders = [];
let candy = [];
let closestGrave = -1;
let tombstone;
let score = 0;
let deceased = 0;
let gameState = 1;
let delay = 50;
let graveCount = {
    1: 10,
    2: 15,
    3: 20
};
let level = 0;

//direction variables
let up = 0;
let down = 0;
let left = 0;
let right = 0;

// load in all of our graphical assets
function preload() {
  bgArtwork = loadImage("grass.png");
  ghostArtwork = loadImage("ghost.png");
  ghostLeftArtwork = loadImage("ghost-left.png");
  hammerArtwork = loadImage("hammer.png");
  hammerLeftArtwork = loadImage("hammer-left.png");
  candy1Artwork = loadImage("candy1.png");
  candy2Artwork = loadImage("candy2.png");
  tombStoneArtwork = loadImage("tombstone.png");
  spiderArtwork = loadImage("spider.png");
  startscreenArtwork = loadImage("startscreen.png");
  endscreenArtwork = loadImage("endscreen.png");
  fontBold = loadFont('pixel_noir/Pixel-Noir.ttf');
  fontSkinny = loadFont('pixel_noir/Pixel-Noir_Skinny_Short.ttf');
  breakSound = loadSound("break.mp3");
}

function setup() {
  let canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent('game-container');

  character = new Ghost(0, canvasSize/2);
}

let bgYPos = 0;
let visible = true;
let time = 0;

function draw() {
  // draw our background image
  clear();
  noStroke();
  textFont(fontSkinny);
  imageMode(CORNER);

  if(gameState === 1) {
    image(startscreenArtwork, 0, bgYPos, 500, 590);
    fill(255);
    textSize(30);
    textAlign(CENTER);
    textFont(fontBold);
    if(bgYPos > -90) {
      bgYPos--;
    } else {
      text('TRICK OR TREAT', canvasSize/2, 150);
      fill(0);
      rect(80, 160, 340, 25);
      fill(255);
      textFont(fontSkinny);
      textSize(14);
      if(time % 40 === 0) {
        visible = !visible;
      }
      if(visible) {
        text('PRESS 1, 2, OR 3 TO START', canvasSize/2, 180);
      }
    }

    if(keyIsDown(49)) {
      userStartAudio().then(function() {
        console.log('audio started');
      });
      level = 1;
      setupGame(1);
      gameState = 2;
    }
    if(keyIsDown(50)) {
      userStartAudio().then(function() {
        console.log('audio started');
      });
      level = 2;
      setupGame(2);
      gameState = 2;
    }
    if(keyIsDown(51)) {
      userStartAudio().then(function() {
        console.log('audio started');
      });
      level = 3;
      setupGame(3);
      gameState = 2;
    }
    
  } else if(gameState === 2) {
    image(bgArtwork, 0, 0, 500, 500);

    let removedSpiders = [];
    graves.forEach(grave => grave.display());
    spiders.forEach((item, index) => {
      item.display();
      if(item.collision(character, 40) && !item.dead) {
        character.freeze();
        item.kill();
        score--;
        removedSpiders.push(index);
      }
    });
    candy.forEach(item => item.display());

    removedSpiders.forEach(index => spiders.splice(index, 1));

    character.display();

    fill(255);
    textSize(14);
    textAlign(LEFT);
    text("POINTS: " + score, 30, 50);

    if(keyIsDown(65)) {
      hammer();
    }
    if(deceased >= graveCount[level]) {
      delay--;
    }
    if(delay <= 0) {
      gameState = 3;
    }
  } else if(gameState === 3) {
    image(endscreenArtwork, 0, 0, 500, 500);
    fill(255);
    textSize(30);
    textAlign(CENTER);
    textFont(fontBold);
    text('GAME OVER', canvasSize/2, 150);
    fill(0);
    rect(110, 160, 280, 25);
    fill(255);
    textFont(fontSkinny);
    textSize(14);
    text('FINAL SCORE: ' + score, canvasSize/2, 180);
  }

  time++;
}

function setupGame(level) {
  for(let i = 0; i < graveCount[level]; i++) {
    tombstone = new Tombstone(i);
    graves.push(tombstone);
  }
}

function hammer() {
  if(closestGrave >= 0) {
    if(graves[closestGrave].collision(character, 60)) {
      let state = graves[closestGrave].break();
      if(state === 0) {
        candy.push(graves.splice(closestGrave, 1)[0]);
      } else {
        spiders.push(graves.splice(closestGrave, 1)[0]);
      }
      closestGrave = -1;
    }
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
  if(xNew < 0 || xNew > 500 || yNew < 0 || yNew > 500) {
    return false;
  }
  for(let i = 0; i < graves.length; i++ ) {
    let grave = graves[i];
    if(collision(temp, grave)) {
      closestGrave = i;
      return false;
    } 
  }
  return true;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    up = 1;
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
  let speedVariable = document.getElementById('speed');
  speedVariable.addEventListener("change", function(event) {
    character.setSpeed();
  });

  let transparency = document.querySelector('.pop-up').style.opacity;
  let link = document.getElementById('doc');
  link.addEventListener("click", function(event) {
    if(transparency === "1") {
      document.querySelector('.pop-up').style.opacity = 0;
    } else if(transparency === "0") {
      document.querySelector('.pop-up').style.opacity = 1;
    } else {
      document.querySelector('.pop-up').style.opacity = 1;
    }
  });

  let close = document.getElementById('close');
  close.addEventListener("click", function(event) {
    document.querySelector('.pop-up').style.opacity = 0;
  });
}

class Ghost {
  constructor(x, y) {
    this.xPos = x;
    this.yPos = y;
    this.size = 50;
    this.speed = 2;
    this.frozen = 0;
    this.left = false;
  }

  display() {
    if(this.frozen <= 0) {
      this.move();
    } else {
      this.frozen -= 1;
    }
    imageMode(CENTER);
    this.direction();
    if(this.left) {
      image(ghostLeftArtwork, this.xPos, this.yPos, this.size, this.size);
      image(hammerLeftArtwork, this.xPos - this.size/2 - 5, this.yPos - 5, 20, 20);
    } else {
      image(ghostArtwork, this.xPos, this.yPos, this.size, this.size);
      image(hammerArtwork, this.xPos + this.size/2 + 5, this.yPos - 5, 20, 20);
    }
    if(this.frozen > 0) {
      fill(255, 0, 0, 50);
      rect(0, 0, 500, 500);
    }
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
    let xDir = right - left;
    let yDir = down - up;
    if (placeFree(this.xPos + this.speed * xDir, this.yPos)) {
       this.xPos += this.speed * xDir;
    }
    if (placeFree(this.xPos, this.yPos + this.speed * yDir)) {
       this.yPos += this.speed * yDir;
    }
  }

  distance(grave) {
    return Math.sqrt(Math.pow(grave.xPos - this.xPos, 2) + Math.pow(grave.yPos - this.yPos, 2));
  }

  freeze() {
    this.frozen = 20;
  }

  setSpeed() {
    this.speed = document.getElementById("speed").value;
  }
}

const stuff = ['treat', 'trick'];
const positions = [];

class Tombstone {
  constructor(i) {
    let x, y;
    while(true) {
      x = randomNumber(1, 10) * 50;
      y = randomNumber(1, 10) * 50;
      let match = positions.filter(obj => obj[0] === x && obj[1] === y);
      if(match.length > 0) {
        continue;
      } else {
        positions.push([x, y]);
        break;
      }
    }
    this.xPos = x;
    this.yPos = y;
    this.size = 50;
    this.state = Math.floor(Math.random() * Math.floor(2));
    this.broken = false;
    this.id = i;
    this.dead = false;
    this.delay = 25;
  }

  display() {
    imageMode(CENTER);
    //console.log(this.broken);
    if(this.broken && this.state === 0) {
      if(this.delay > 0) {
        image(candy1Artwork, this.xPos, this.yPos, 30, 30);
        this.delay--;
      } else {
        this.kill();
      }
    } else if(this.broken && this.state === 1) {
      if(this.xPos >= 495 || this.xPos <= 5 || this.yPos <= 5 || this.yPos >= 495) {
        this.kill();
      } 
      if(!this.dead) {
        this.chase();
        image(spiderArtwork, this.xPos, this.yPos, 30, 30);
      }
    } else {
      image(tombStoneArtwork, this.xPos, this.yPos, this.size, this.size);
    }
  }

  collision(ghost, radius) {
    if(ghost.distance(this) < radius) {
      return true;
    } else {
      return false;
    }
  }

  chase() {
    if(this.delay > 0) {
      this.delay--;
    } else {
      if(this.xPos > character.xPos) {
        this.xPos -= 1;
      } else if(this.xPos < character.xPos) {
        this.xPos += 1;
      }
      if(this.yPos > character.yPos) {
        this.yPos -= 1;
      } else if(this.yPos < character.yPos) {
        this.yPos += 1;
      }
    }
  }

  break() {
    if(!this.broken) {
      this.broken = true;
      if(this.state === 0) {
        score++;
      }
      breakSound.play();
      return this.state;
    }
  }

  kill() {
    if(!this.dead) {
      this.dead = true;
      deceased++;
    }
  }
}
