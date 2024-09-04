// Global variables
let tileSize = 32; // Size of a tile
let rows = 16; // Number of rows on the board
let columns = 16; // Number of columns on the board
let boardWidth = tileSize * columns; // Width of the game board
let boardHeight = tileSize * rows; // Height of the game board
let enemyBaseVelocityX = 4 ; // Base horizontal velocity of enemies
let enemyVelocityX = enemyBaseVelocityX; // Current horizontal velocity of enemies
let enemyVelocityY = tileSize; // Vertical velocity of enemies, used for descending
let gameOver = false; // Flag to check if the game is over
let isPaused = false; // Flag to check if the game is paused
let score = 0; // Player's score
let startTime = Date.now(); // Start time for the game timer
let enemies = []; // Array to hold all enemy objects
let player; // Player object
let wave = 1; // Current wave number
let elapsedTime = 0; // Time that has already passed before the pause
let pauseStartTime = 0; // Temps au début de la pause
let speedIncreaseFactor = 2; // Facteur d'augmentation de la vitesse




// Main game loop that updates the game state
function updateGame() {
    if (gameOver || isPaused) return; // Exit if the game is over or paused

    player.moveProjectiles(enemies); // Move projectiles and check for collisions
    const collision = limitDetected(enemies); // Check if enemies hit the board edges
    enemies.forEach(enemy => enemy.moveEnemy(collision, player)); // Move each enemy

    // If all enemies are destroyed
    if (enemies.length === 0) {
        // If it's the final wave
        if (wave === 4) {
            gameOver = true;
            document.getElementById("victoryMessage").classList.remove("hidden");
            return;
        }
        wave += 1; // Move to the next wave
        enemyVelocityX = enemyBaseVelocityX * speedIncreaseFactor;
         // Increase enemy speed slightly
        enemies = createEnemies(wave); // Create new enemies for the new wave
    }

    requestAnimationFrame(updateGame); // Continue the game loop
}

// Function to restart the current wave of enemies
// Function to restart the current wave of enemies
// function restartWave() {
//     console.log("Restarting wave");
//     enemies.forEach(enemy => enemy.resetPosition()); // Reset all enemies' positions
//     player.reset(); // Reset player

//     // Ensure that enemies are not immediately moving by briefly stopping their movement
//     setTimeout(() => {
//         enemies.forEach(enemy => enemy.enemyVelocityX = enemyBaseVelocityX + wave); // Reset enemies' velocity
//         updateGame(); // Continue the game loop
//     }, 100); // Delay to allow time for enemies to reset  
// }


// Function to create a new set of enemies based on the current wave
function createEnemies(wave) {
    let enemiesArray = [];
    let enemySpacingX = tileSize * 2; // Horizontal spacing between enemies
    let enemySpacingY = tileSize; // Vertical spacing between enemies
    let enemyOffsetX = (boardWidth - (enemySpacingX * 5)) / 2; // Offset to center enemies horizontally
    let startPosY = tileSize * 2 + tileSize * 2 * wave; // Starting vertical position based on wave

    for (let row = 0; row < 3; row++) { // 3 rows of enemies
        for (let col = 0; col < 5; col++) { // 5 enemies per row
            let enemyPosX = enemyOffsetX + col * enemySpacingX; // Calculate enemy's horizontal position
            let enemyPosY = startPosY + row * enemySpacingY; // Calculate enemy's vertical position
            let enemy = new Enemy(enemyPosX, enemyPosY); // Create a new enemy
            enemiesArray.push(enemy); // Add the enemy to the array
        }
    }
    return enemiesArray; // Return the array of enemies
}

// Function to check if any enemy has reached the board edges
function limitDetected(enemies) {
    for (let enemy of enemies) {
        if (enemy.enemyPosX + enemy.enemyVelocityX < 0 || enemy.enemyPosX + enemy.enemyWidth + enemy.enemyVelocityX > boardWidth) {
            return true; // If any enemy hits the edge, return true
        }
    }
    return false; // If no enemies hit the edge, return false
}

// Function to format elapsed time into minutes and seconds
    function formatTime(milliseconds) {
    let totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0); // Assurer que totalSeconds est non négatif
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // Formatage MM:SS
}



// Function to update the game timer
function updateTimer() {
    if (gameOver || isPaused) return; // Ne pas mettre à jour le timer si le jeu est terminé ou en pause

    let currentTime = Date.now(); // Obtenir le temps actuel
    // let elapsedTime = currentTime - startTime; // Calculer le temps écoulé depuis le début du jeu ou la reprise
    let totalElapsedTime = elapsedTime + (currentTime - startTime); // Calculer le temps total écoulé
    document.getElementById("timer").textContent = `Time: ${formatTime(totalElapsedTime)}`; // Mettre à jour l'affichage du temps
    
    // Continuer à mettre à jour le timer
    requestAnimationFrame(updateTimer);
}






// Player class
class Player {
    constructor(boardWidth, boardHeight, playerWidth = tileSize * 2, playerHeight = tileSize, playerVelocityX = tileSize) {
        this.playerWidth = playerWidth; // Width of the player
        this.playerHeight = playerHeight; // Height of the player
        this.playerPosX = boardWidth / 2 - playerWidth / 2; // Initial horizontal position
        this.playerPosY = boardHeight - tileSize * 2; // Initial vertical position
        this.playerVelocityX = playerVelocityX; // Horizontal velocity
        this.projectiles = []; // Array to hold all projectiles
        this.lives = 3; // Number of lives
    }

    // Function to move the player based on keyboard input
    movePlayer(e) {
        if (gameOver || isPaused) return; // Exit if the game is over or paused
        if (e.code === "ArrowLeft" && this.playerPosX - this.playerVelocityX >= 0) {
            this.playerPosX -= this.playerVelocityX; // Move left
        } else if (e.code === "ArrowRight" && this.playerPosX + this.playerVelocityX + this.playerWidth <= boardWidth) {
            this.playerPosX += this.playerVelocityX; // Move right
        }
        this.updatePlayerPosition(); // Update player's position on the screen
    }

    // Function to update the player's position on the screen
    updatePlayerPosition() {
        const playerElement = document.getElementById('player');
        playerElement.style.left = `${this.playerPosX}px`;
        playerElement.style.top = `${this.playerPosY}px`;
    }

    // Function to shoot a projectile
    shoot(e) {
        if (gameOver || isPaused) return; // Exit if the game is over or paused
        if (e.code === "Space") {
            const projectilePosX = this.playerPosX + this.playerWidth / 2 - tileSize / 16; // Calculate projectile's horizontal position
            const projectilePosY = this.playerPosY; // Set projectile's vertical position
            const newProjectile = new Projectile(projectilePosX, projectilePosY); // Create a new projectile
            this.projectiles.push(newProjectile); // Add projectile to the array
            this.moveProjectiles(enemies); // Move projectiles and check for collisions
        }
    }

    // Function to move projectiles and handle collisions with enemies
    moveProjectiles(enemies) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let projectile = this.projectiles[i];
            projectile.moveUpProjectile(); // Move projectile upwards
            if (projectile.projectilePosY <= 0) {
                projectile.projectileElement.remove(); // Remove projectile if it goes off screen
                this.projectiles.splice(i, 1); // Remove projectile from array
            } else {
                for (let j = 0; j < enemies.length; j++) {
                    if (projectile.checkCollisionWithEnemy(enemies[j])) {
                        projectile.projectileElement.remove(); // Remove projectile if it hits an enemy
                        this.projectiles.splice(i, 1); // Remove projectile from array
                        enemies[j].destroy(); // Destroy the enemy
                        enemies.splice(j, 1); // Remove enemy from array
                        score += 10; // Increase score
                        document.getElementById('score').textContent = `${score}`; // Update score display
                        break;
                    }
                }
            }
        }
    }

    // Function to handle losing a life
   // Function to handle losing a life
loseLife() {
    if (isPaused || gameOver) return; // Exit if the game is already paused or over

    this.lives = Math.max(this.lives - 1, 0); // Ensure lives don't go below 0
    document.getElementById("lives").textContent = `Lives: ${this.lives}`; // Update lives display
    
    if (this.lives > 0) {
        isPaused = true; // Pause the game
        document.getElementById("pauseMenu").classList.remove("hidden"); // Show pause menu
     // Ajuster elapsedTime pour compenser le temps écoulé avant la collision
     elapsedTime += Date.now() - startTime;
     startTime = Date.now(); // Réinitialiser startTime pour la 
        // Augmenter la vitesse des ennemis
        enemyVelocityX = enemyBaseVelocityX * speedIncreaseFactor;
    } else if (this.lives === 0) {
        gameOver = true; // End the game
        document.getElementById("gameOverMessage").classList.remove("hidden"); // Show game over message
    }
}


    // Function to reset the player's position and projectiles
    reset() {
        this.playerPosX = boardWidth / 2 - this.playerWidth / 2; // Reset horizontal position
        this.playerPosY = boardHeight - tileSize * 2; // Reset vertical position
        this.projectiles.forEach(projectile => projectile.projectileElement.remove()); // Remove all projectiles
        this.projectiles = []; // Clear projectiles array
        this.updatePlayerPosition(); // Update player's position on the screen
    }
}

// Projectile class
class Projectile {
    constructor(projectilePosX, projectilePosY, projectileVelocityY = tileSize / 2) {
        this.projectileWidth = tileSize / 8; // Width of the projectile
        this.projectileHeight = tileSize / 2; // Height of the projectile
        this.projectilePosX = projectilePosX; // Initial horizontal position
        this.projectilePosY = projectilePosY; // Initial vertical position
        this.projectileVelocityY = projectileVelocityY; // Vertical velocity
        this.createProjectileElement(); // Create the projectile element in the DOM
    }

    // Function to create the projectile element
    createProjectileElement() {
        this.projectileElement = document.createElement("div");
        this.projectileElement.className = 'projectile';
        this.projectileElement.style.width = `${this.projectileWidth}px`;
        this.projectileElement.style.height = `${this.projectileHeight}px`;
        this.projectileElement.style.left = `${this.projectilePosX}px`;
        this.projectileElement.style.top = `${this.projectilePosY}px`;
        const board = document.getElementById("board");
        board.appendChild(this.projectileElement);
    }

    // Function to move the projectile upwards
    moveUpProjectile() {
        this.projectilePosY -= this.projectileVelocityY;
        this.updateProjectilePosition(); // Update projectile's position on the screen
    }

    // Function to update the projectile's position on the screen
    updateProjectilePosition() {
        this.projectileElement.style.top = `${this.projectilePosY}px`;
    }

    // Function to check collision with an enemy
    checkCollisionWithEnemy(enemy) {
        const projectileRight = this.projectilePosX + this.projectileWidth;
        const projectileBottom = this.projectilePosY + this.projectileHeight;
        const enemyRight = enemy.enemyPosX + enemy.enemyWidth;
        const enemyBottom = enemy.enemyPosY + enemy.enemyHeight;
        const collisionX = this.projectilePosX < enemyRight && projectileRight > enemy.enemyPosX;
        const collisionY = this.projectilePosY < enemyBottom && projectileBottom > enemy.enemyPosY;
        if (collisionX && collisionY) {
            this.projectileTouchEnemy = true;
            return true; // Return true if there is a collision
        }
        return false; // Return false if no collision
    }
}

// Enemy class
class Enemy {
    constructor(enemyPosX = tileSize, enemyPosY = tileSize * 2) {
        this.initialPosX = enemyPosX; // Initial horizontal position
        this.initialPosY = enemyPosY; // Initial vertical position
        this.enemyWidth = tileSize * 2; // Width of the enemy
        this.enemyHeight = tileSize; // Height of the enemy
        this.enemyPosX = enemyPosX; // Current horizontal position
        this.enemyPosY = enemyPosY; // Current vertical position
        this.enemyVelocityX = enemyVelocityX; // Horizontal velocity
        this.enemyVelocityY = enemyVelocityY; // Vertical velocity
        this.createEnemyElement(); // Create the enemy element in the DOM
        this.resetting = false; // Flag to indicate if the enemy is resetting
    }

    // Function to reset the enemy's position
    resetPosition() {
        this.resetting = true; // Indicate that the enemy is resetting
        this.enemyPosX = this.initialPosX; // Reset to initial horizontal position
        this.enemyPosY = this.initialPosY; // Reset to initial vertical position
        this.updateEnemyElement(); // Update enemy's position on the screen
        setTimeout(() => this.resetting = false, 100); // Delay to prevent immediate movement
    }

    // Function to create the enemy element
    createEnemyElement() {
        this.enemyElement = document.createElement("div");
        this.enemyElement.className = 'enemy';
        this.enemyElement.style.width = `${this.enemyWidth}px`;
        this.enemyElement.style.height = `${this.enemyHeight}px`;
        this.enemyElement.style.left = `${this.enemyPosX}px`;
        this.enemyElement.style.top = `${this.enemyPosY}px`;
        const board = document.getElementById("board");
        board.appendChild(this.enemyElement);
    }

    // Function to move the enemy
    moveEnemy(collision, player) {
        if (this.resetting) return; // Skip movement if the enemy is resetting

        if (collision) {
            this.enemyPosY += this.enemyVelocityY; // Move down if edge collision is detected
            this.enemyVelocityX *= -1; // Change direction
        }
        this.enemyPosX += this.enemyVelocityX; // Move horizontally
        this.updateEnemyElement(); // Update enemy's position on the screen

        if (this.enemyPosY + this.enemyHeight >= boardHeight) {
            if (!gameOver) {
                player.loseLife(); // If enemies reach the bottom, the player loses a life
                return;
            }
        }
        
        this.checkCollisionWithPlayer(player); // Check for collision with the player
    }

    // Function to check collision with the player
    checkCollisionWithPlayer(player) {
        const playerRight = player.playerPosX + player.playerWidth;
        const playerBottom = player.playerPosY + player.playerHeight;
        const enemyRight = this.enemyPosX + this.enemyWidth;
        const enemyBottom = this.enemyPosY + this.enemyHeight;
        const collisionX = player.playerPosX < enemyRight && playerRight > this.enemyPosX;
        const collisionY = player.playerPosY < enemyBottom && playerBottom > this.enemyPosY;
        if (collisionX && collisionY) {
            player.loseLife(); // If collision occurs, the player loses a life
            if (player.lives > 0) {
                isPaused = true; // Pause the game when collision occurs
                elapsedTime = 0
                document.getElementById("pauseMenu").classList.remove("hidden"); // Show pause menu
            }
        }
    }
    // Function to update the enemy's position on the screen
    updateEnemyElement() {
        console.log(`Updating enemy DOM to (${this.enemyPosX}, ${this.enemyPosY})`);
        this.enemyElement.style.left = `${this.enemyPosX}px`;
        this.enemyElement.style.top = `${this.enemyPosY}px`;
    }

    // Function to stop the enemy's movement
    stopEnemy(player) {
        const playerRight = player.playerPosX + player.playerWidth;
        const playerBottom = player.playerPosY + player.playerHeight;
        const enemyRight = this.enemyPosX + this.enemyWidth;
        const enemyBottom = this.enemyPosY + this.enemyHeight;
        const collisionX = player.playerPosX <= enemyRight && playerRight >= this.enemyPosX;
        const collisionY = player.playerPosY <= enemyBottom && playerBottom >= this.enemyPosY;
        if (collisionX && collisionY) {
            this.enemyVelocityX = 0; // Stop horizontal movement
            this.enemyVelocityY = 0; // Stop vertical movement
        }
    }

    // Function to destroy the enemy
    destroy() {
        this.enemyElement.remove(); // Remove the enemy from the DOM
        this.isDestroyed = true; // Mark the enemy as destroyed
    }
}

// Initialization function
document.addEventListener('DOMContentLoaded', function () {
    player = new Player(boardWidth, boardHeight); // Create a new player
    enemies = createEnemies(wave); // Create initial enemies
    const playerElement = document.getElementById('player');
    playerElement.style.left = `${player.playerPosX}px`;
    playerElement.style.top = `${player.playerPosY}px`;
    playerElement.style.width = `${player.playerWidth}px`;
    playerElement.style.height = `${player.playerHeight}px`;

    // Function to restart the game
    // Function to restart the game
    function restartGame() {
        if (gameOver) {
            // Remove remaining enemies
            enemies.forEach(enemy => enemy.enemyElement.remove());
            enemies = []; // Clear the enemies array
        }
        
        if (player.lives > 0) {
            enemies.forEach(enemy => enemy.enemyElement.remove()); // Supprimer tous les ennemis existants
            enemies = []; // Effacer le tableau des ennemis
        }
    
        // Réinitialiser le joueur et ses propriétés
        player.reset(); // Réinitialiser la position et les projectiles du joueur
        player.lives = 3; // Réinitialiser les vies du joueur à 3
        document.getElementById("lives").textContent = `Lives: ${player.lives}`; // Mettre à jour l'affichage des vies
    
        gameOver = false; // Réinitialiser le drapeau de fin de jeu
        isPaused = false; // Réinitialiser le drapeau de pause
        score = 0; // Réinitialiser le score
        wave = 1; // Réinitialiser le nombre de vagues
        startTime = Date.now(); // Réinitialiser le temps de début
        elapsedTime = 0; // Réinitialiser le temps écoulé
        
    
        document.getElementById('score').textContent = `${score}`; // Mettre à jour l'affichage du score
        document.getElementById("victoryMessage").classList.add("hidden"); // Masquer le message de victoire
        document.getElementById("gameOverMessage").classList.add("hidden"); // Masquer le message de fin de jeu
        document.getElementById("pauseMenu").classList.add("hidden"); // Masquer le menu de pause
    
        enemies = createEnemies(wave); // Créer des ennemis initiaux pour le nouveau jeu
        updateGame(); // Démarrer la boucle de jeu
        updateTimer(); // Démarrer le timer
    }
    
    

    // Event listeners for player controls and game actions
    document.addEventListener('keydown', (e) => player.movePlayer(e));
    document.addEventListener('keydown', (e) => player.shoot(e));

    document.getElementById('continueButton').addEventListener('click', function () {
        isPaused = false; // Dépause le jeu
        document.getElementById("pauseMenu").classList.add("hidden"); // Masquer le menu de pause
        enemies.forEach(enemy => enemy.enemyVelocityX *= speedIncreaseFactor); // Réinitialiser la vitesse des ennemis
        
      
        // Réinitialiser les ennemis et le joueur
        enemies.forEach(enemy => enemy.resetPosition()); // Réinitialiser les positions des ennemis
        player.reset(); // Réinitialiser le joueur
        elapsedTime = 0
         // Ajuster startTime pour compenser le temps de pause
    elapsedTime += Date.now() - pauseStartTime;
      // Réinitialiser le temps pour compenser le temps de pause
    startTime += Date.now() - pauseStartTime;
        updateGame(); // Reprendre la boucle de jeu
        updateTimer(); // Reprendre le timer
    });
    
    

    document.getElementById('restartButton').addEventListener('click', function () {
        restartGame(); // Restart the game
    });

   // Lors de la pause
   document.addEventListener('keydown', (e) => {
    if (e.code === "Escape") {
        if (isPaused) {
            // Reprise du jeu
            isPaused = false;
            document.getElementById("pauseMenu").classList.add("hidden"); // Masquer le menu de pause
              // Ajuster startTime pour compenser le temps de pause
              elapsedTime += Date.now() - pauseStartTime;
              startTime = Date.now(); // Réinitialiser startTime pour continuer correctement
            // startTime += Date.now() - pauseStartTime; // Ajuster startTime pour compenser le temps de pause
            updateGame(); // Reprendre la boucle de jeu
            updateTimer(); // Reprendre le timer
        } else {
            // Pause du jeu
            isPaused = true;
            document.getElementById("pauseMenu").classList.remove("hidden"); // Afficher le menu de pause
            pauseStartTime = Date.now(); // Enregistrer le moment où la pause a commencé
        }
    }
});

    updateGame(); // Start the game loop
    updateTimer(); // Start the timer
});
