let hitSound;
let healSound;
let song;
let breakSound;
let shatterSound;
let soulSound;
let vanishSound;



function preload() {
  soundFormats('wav', 'mp3');
  song = loadSound("./audio/Undertale_Ievan_polkka.mp3");
  hitSound = loadSound("./audio/snd_hurt1.wav");
  healSound = loadSound("./audio/snd_heal_c.wav");
  breakSound = loadSound("./audio/snd_break1.wav");
  shatterSound = loadSound("./audio/snd_break2.wav");
  soulSound = loadSound("./audio/undertale_ping.mp3")
  vanishSound = loadSound("./audio/Vanish_Sound_Effect.mp3")
  
}

function setup() {
  soul = loadImage("./img/soul.png");
  soulBlue = loadImage("./img/soulBlue.png");
  health = document.getElementById("health");
  bullets = document.getElementById("bullets");
  sansImage = document.getElementById("img");
  
  playerSize = 60;
  speedNormal = 10;
  speedFast = speedNormal * 0.707;
  playerSpeed = speedNormal;
  gravity = 0.8; // Gravity strength
  velocityY = 0; // Vertical velocity
  jumpStrength = -15; // Jump force
  isJumping = false; // Prevent double jumps
  mode = 0;
  toggleKey = 70;
  keyReleasedToggle = true;
  musicToggle = false;
  muted = false;
  playerHealth = 100;
  maxHealth = 100;

  canvasHeight = 400;
  canvasWidth = 700;
  playerX = canvasWidth/2 - soul.width; 
  playerY = canvasHeight/2 - soul.width;

  
  groundLevel = canvasHeight; // Y-coordinate for the ground
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position((windowWidth / 2) - canvasWidth / 2, (windowHeight / 2) - canvasHeight / 2);

  particles = [];
  particlePadding = 10;
  particleSpeed = 2;
  particleFriction = 0.5;
  lastParticleSpawnTime = 0; // Track the last spawn time
  particleSpawnInterval = 1000; // Time between particle spawns in milliseconds (e.g., 1 second)


  isInvincible = false;
  invincibleTime = 0; // Store the time when invincibility starts
  invincibleDuration = 200; // Duration of invincibility in milliseconds

  bulletsHit = 0;

  isGameOver = false; // Track whether the game is over

  song.play()
  song.loop()
  song.amp(0.1)

}

function draw() {
  


  background("black");
  
  health.innerHTML = "HP: " + playerHealth + "/" + maxHealth  +"  <br>HITS: " + bulletsHit;

 
  if (isGameOver) {
    gameOverScreen();

    return; // Stop further updates
  }

  
  if (millis() - lastParticleSpawnTime >= particleSpawnInterval) {
    particles.push(new Particle());
    lastParticleSpawnTime = millis(); // Update the spawn time
  }

  for (let particle of particles) {
    // Update each snowflake position and display
    //particle.update(currentTime);
    particle.display();
    particle.checkCollision();
    particle.update();
  }

  // Manage invincibility
  if (isInvincible && millis() - invincibleTime > invincibleDuration) {
    isInvincible = false; // Reset invincibility after the duration
  }

  if (mode === 1) {
    // Apply gravity if not on the ground
    if (playerY < groundLevel - soul.width || velocityY < 0) {
      velocityY += gravity; // Increase downward velocity
      playerY += velocityY; // Update player position
    } else {
      // Stop falling when on the ground
      playerY = groundLevel - soul.width;
      velocityY = 0;
      isJumping = false; // Allow jumping again
    }
  }

  // TOGGLE MODE
  if (keyIsDown(toggleKey) && keyReleasedToggle) {
    mode = mode === 0 ? 1 : 0; // Toggle mode
    soulSound.play()
    keyReleasedToggle = false; // Prevent continuous toggling
    velocityY = 0; // Reset vertical velocity to prevent jumping
    if (mode === 0) {
      playerY = min(playerY, groundLevel - soul.width); // Ensure the player stays in bounds
      isJumping = false; // Ensure jumping is disabled in mode 0
    }
    console.log("Mode:", mode); // Optional: Log the mode
  }

  if (!keyIsDown(toggleKey)) {
    keyReleasedToggle = true; // Reset the flag when the key is released
  }

  drawPlayer(mode);

   // Check for Game Over
   if (playerHealth <= 0) {
    isGameOver = true;
  }

}

function gameOverScreen() {
  background("black");
  textAlign(CENTER, CENTER);
  fill(255, 0, 0);
  textSize(48);
  text("GAME OVER", canvasWidth / 2, canvasHeight / 2);

  fill(255);
  textSize(20);
  text("Press R to Restart", canvasWidth / 2, canvasHeight / 2 + 50);

  song.stop(); // Stop music
}

function restartGame() {
  playerHealth = maxHealth; // Reset health
  bulletsHit = 0; // Reset bullets hit counter
  particles = []; // Clear all particles
  isGameOver = false; // Resume game
  playerX = canvasWidth/2 - soul.width; // Reset player position
  playerY = canvasHeight/2 - soul.width;
  song.stop(); // Stop music
  song.loop(); // Restart music
}

function drawPlayer(mode) {
  let keyCount = 0;

  // LEFT
  if (keyIsDown(65)) {
    playerX = max(0, playerX - playerSpeed); // Constrain to left boundary
    keyCount++;
  }

  // RIGHT
  if (keyIsDown(68)) {
    playerX = min(canvasWidth - soul.width, playerX + playerSpeed); // Constrain to right boundary
    keyCount++;
  }

  // UP (only in mode 0)
  if (keyIsDown(87) && mode === 0) {
    playerY = max(0, playerY - playerSpeed); // Constrain to top boundary
    keyCount++;
  }

  // DOWN (only in mode 0)
  if (keyIsDown(83) && mode === 0) {
    playerY = min(canvasHeight - soul.width, playerY + playerSpeed); // Constrain to bottom boundary
    keyCount++;
  }

  // ADJUST SPEED
  if (keyCount >= 2) {
    playerSpeed = speedFast;
  } else {
    playerSpeed = speedNormal;
  }

  // PLACE PARTICLES
  if (keyIsDown(81)) {
    for (let i = 0; i < 3; i++) {
      // Add a new snowflake object to the array
      particles.push(new Particle());
    }
  }


  // MUTE MUSIC
  if (keyIsDown(77) && musicToggle) {
    musicToggle = false; // Prevent continuous toggling
    muted = !muted
    muteMusic(muted);
    console.log(muted);
  }
  if (!keyIsDown(77) && !musicToggle) {
    musicToggle = true; // Reset the flag when the key is released
    muteMusic(muted);
  }

  // DRAW PLAYER
  if (mode === 0) {
    image(soul, playerX, playerY )
  } else if (mode === 1) {
    image(soulBlue, playerX, playerY )
  }
}

function keyPressed() {
  // Prevent jumping if already in the air and in mode 1
  if (keyCode === 87 && !isJumping && mode === 1 && playerY === groundLevel - soul.width) { // Jump with W key in mode 1
    velocityY = jumpStrength; // Apply upward force
    isJumping = true; // Prevent double jumps
  }

   // Restart the game when R is pressed
   if (key === 'r' || key === 'R') {
    restartGame();
   }
}

function keyReleased() {
  // Reset the jumping flag when the W key is released, but only if the player is on the ground
  if (keyCode === 87 && playerY === groundLevel - soul.width) {
    isJumping = false; // Ensure player cannot keep jumping once on the ground
  }
}

function takeDamage(amount) {
  if (!isInvincible) { // Only take damage if the player is not invincible
    playerHealth -= amount; // Decrease health
    isInvincible = true; // Make player invincible
    invincibleTime = millis(); // Set the invincibility start time
  }
}

function muteMusic(muted){
  if(muted == false){
    song.amp(0.1);
  }else if(muted == true){
    song.amp(0)
  }
  
}

function healPlayer(){
   // HEAL PLAYER
    if(playerHealth < maxHealth ){
      playerHealth = maxHealth
      healSound.play()
    }
  
}

function removeImage(duration = 1000) {
  let opacity = 1; // Start fully visible
  const interval = 10; // Time between steps in milliseconds
  const step = interval / duration; // Opacity decrement per step
  vanishSound.play(); // Play the vanish sound

  const fadeEffect = setInterval(() => {
    opacity -= step; // Decrease opacity
    if (opacity <= 0) {
      clearInterval(fadeEffect); // Stop the interval
      sansImage.style.opacity = 0; // Ensure opacity is 0
      sansImage.remove(); // Remove the image from the DOM
      
    } else {
      sansImage.style.opacity = opacity; // Apply the new opacity
    }
  }, interval);
}

class Particle {
  constructor() {
    // Generate initial position
    const generatePosition = () => {
      let posX, posY;
      do {
        posX = random(0 + particlePadding, canvasWidth - particlePadding);
        posY = random(0 + particlePadding, canvasHeight - particlePadding);
      } while (
        (posX > playerX - particlePadding && posX < playerX + soul.width + particlePadding) &&
        (posY > playerY - particlePadding && posY < playerY + soul.width + particlePadding)
      );

      return { posX, posY };
    };

    const position = generatePosition();
    this.posX = position.posX;
    this.posY = position.posY;

    this.heal = random(); // Random value between 0 and 1
    this.size = 7;

    // Assign color based on heal value
    if (this.heal > 0.9) { // Example condition for healing particles
      this.color = color(0, 255, 0); // Green for healing
    } else {
      this.color = color(255); // Red for damaging particles
    }

    // Calculate velocity vector toward the player's current position
    const directionX = playerX + soul.width / 2 - this.posX;
    const directionY = playerY + soul.width / 2 - this.posY;
    const magnitude = sqrt(directionX ** 2 + directionY ** 2); // Normalize the vector
    this.velX = (directionX / magnitude) * random(2, 6);
    this.velY = (directionY / magnitude) * random(2, 6);

    this.deleteAfterHit = 1;
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.posX, this.posY, this.size);
  }

  update() {
    // Update position
    this.posX += this.velX;
    this.posY += this.velY;

    // Remove the particle if it goes out of bounds
    if (
      this.posX < 0 - this.size || // Left boundary
      this.posX > canvasWidth + this.size || // Right boundary
      this.posY < 0 - this.size || // Top boundary
      this.posY > canvasHeight + this.size // Bottom boundary
    ) {
      const index = particles.indexOf(this);
      if (index > -1) {
        particles.splice(index, 1);
      }
    }
  }

  checkCollision() {
    for (let i = 0; i < particles.length; i++) {
      let particle = particles[i];
      if (
        particle.posX > playerX &&
        particle.posX < playerX + soul.width &&
        particle.posY > playerY &&
        particle.posY < playerY + soul.width
      ) {
        if (!isInvincible) {
          if (particle.heal > 0.9) { 
            // Heal the player if the particle is a healing particle
            playerHealth = min(maxHealth, playerHealth + 10); 
            healSound.play();
          } else {
            // Take damage if it's a damaging particle
            takeDamage(10);
            hitSound.play();
            bulletsHit++; // Increment hits for damaging particles only
          }
  
          // Remove the particle after collision
          if (particle.deleteAfterHit == 1) {
            particles.splice(i, 1); // Remove the particle
          }
  
          break; // Exit the loop after handling the collision
        }
      }
    }
  }
}











