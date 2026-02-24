
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

// Niveaux de difficulté
let difficulty = 'moyen'; // facile, moyen, difficile
let difficultySettings = {
    facile: { speed: -1.5, interval: 2000, name: 'Facile' },
    moyen: { speed: -2, interval: 1500, name: 'Moyen' },
    difficile: { speed: -3, interval: 1200, name: 'Difficile' },
    hardcore: { speed: -6, interval: 600, name: 'Hardcore' }
};

let gameOver = false;
let gameStarted = false; // Nouvel état pour savoir si le jeu a démarré
let gameOverTriggered = false; // Pour éviter les redirections multiples
let waitingForRestart = false; // En attente de redémarrage après une question de maths
let showDifficultySelect = true; // Afficher le sélecteur de difficulté
let score = 0;
let pipeInterval = null; // Intervalle pour générer les tuyaux

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
    
    // Charger et afficher les scores
    displayScores();
    
    // Récupérer la difficulté sauvegardée ou utiliser 'moyen' par défaut
    difficulty = localStorage.getItem('gameDifficulty') || 'moyen';
    velocityX = difficultySettings[difficulty].speed;
    
    // Vérifier si on continue le jeu après un calcul réussi
    const continueGame = localStorage.getItem('continueGame');
    if (continueGame === 'true') {
        // Récupérer le score sauvegardé
        const savedScore = parseInt(localStorage.getItem('lastScore') || '0');
        score = savedScore;
        
        // Ne pas démarrer automatiquement, attendre que le joueur appuie sur Espace
        waitingForRestart = true;
        gameStarted = false;
        gameOverTriggered = false; // Reset le flag
        showDifficultySelect = false; // Ne pas montrer le sélecteur si on continue
        
        // Nettoyer le flag
        localStorage.removeItem('continueGame');
    }

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./images/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./images/bottompipe.png";

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Si on attend le redémarrage après une question de maths
    if (waitingForRestart) {
        // Fond semi-transparent vert (succès)
        context.fillStyle = "rgba(34, 197, 94, 0.3)";
        context.fillRect(0, 0, board.width, board.height);

        // Titre
        context.fillStyle = "white";
        context.font = "bold 28px sans-serif";
        context.textAlign = "center";
        context.fillText("Bonne réponse ! ✓", board.width / 2, 150);

        // Score actuel
        context.font = "24px sans-serif";
        context.fillText("Score : " + Math.floor(score), board.width / 2, 200);

        // Instructions
        context.font = "20px sans-serif";
        context.fillText("Appuie sur Espace", board.width / 2, 280);
        context.fillText("pour continuer", board.width / 2, 320);
        
        context.textAlign = "left";
        return; // Ne pas exécuter le reste du jeu
    }

    // Si le jeu n'a pas démarré, afficher l'écran d'accueil
    if (!gameStarted) {
        // Fond semi-transparent gris
        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.fillRect(0, 0, board.width, board.height);

        // Titre
        context.fillStyle = "white";
        context.font = "bold 32px sans-serif";
        context.textAlign = "center";
        context.fillText("Flappy Math Bird", board.width / 2, 80);

        if (showDifficultySelect) {
            // Afficher les options de difficulté
            context.font = "20px sans-serif";
            context.fillText("Choisis ton niveau :", board.width / 2, 150);
            // Bouton Facile
            const easyColor = difficulty === 'facile' ? "#22c55e" : "rgba(255, 255, 255, 0.3)";
            context.fillStyle = easyColor;
            context.fillRect(board.width / 2 - 80, 180, 160, 50);
            context.fillStyle = "white";
            context.font = "bold 20px sans-serif";
            context.fillText("1 - FACILE", board.width / 2, 212);
            // Bouton Moyen
            const mediumColor = difficulty === 'moyen' ? "#f59e0b" : "rgba(255, 255, 255, 0.3)";
            context.fillStyle = mediumColor;
            context.fillRect(board.width / 2 - 80, 250, 160, 50);
            context.fillStyle = "white";
            context.font = "bold 20px sans-serif";
            context.fillText("2 - MOYEN", board.width / 2, 282);
            // Bouton Difficile
            const hardColor = difficulty === 'difficile' ? "#ef4444" : "rgba(255, 255, 255, 0.3)";
            context.fillStyle = hardColor;
            context.fillRect(board.width / 2 - 80, 320, 160, 50);
            context.fillStyle = "white";
            context.font = "bold 20px sans-serif";
            context.fillText("3 - DIFFICILE", board.width / 2, 352);
            // Bouton Hardcore
            const hardcoreColor = difficulty === 'hardcore' ? "#000" : "rgba(255, 255, 255, 0.3)";
            context.fillStyle = hardcoreColor;
            context.fillRect(board.width / 2 - 80, 390, 160, 50);
            context.fillStyle = "white";
            context.font = "bold 20px sans-serif";
            context.fillText("4 - HARDCORE", board.width / 2, 422);
            // Instructions
            context.font = "16px sans-serif";
            context.fillStyle = "rgba(255, 255, 255, 0.7)";
            context.fillText("Appuie sur 1, 2, 3 ou 4 pour choisir", board.width / 2, 470);
            context.fillText("puis Espace pour commencer", board.width / 2, 500);
        } else {
            // Instructions simples si on ne montre pas le sélecteur
            context.font = "20px sans-serif";
            context.fillStyle = "white";
            context.fillText("Appuie sur la barre espace", board.width / 2, 200);
            context.fillText("pour commencer", board.width / 2, 250);

            // Sous-texte
            context.font = "italic 16px sans-serif";
            context.fillStyle = "rgba(255, 255, 255, 0.7)";
            context.fillText("Niveau: " + difficultySettings[difficulty].name, board.width / 2, 320);
        }
        
        context.textAlign = "left";
        return; // Ne pas exécuter le reste du jeu
    }

    if (gameOver) {
        return;
    }

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        saveScore(Math.floor(score));
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            saveScore(Math.floor(score));
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        // Redirection immédiate vers Math.html pour résoudre un calcul
        if (!gameOverTriggered) {
            gameOverTriggered = true;
            window.location.href = 'Math.html';
        }
    }
}

function startPipeGeneration() {
    // Ne démarrer qu'une seule fois
    if (pipeInterval === null) {
        const interval = difficultySettings[difficulty].interval;
        pipeInterval = setInterval(placePipes, interval);
    }
}

function stopPipeGeneration() {
    if (pipeInterval !== null) {
        clearInterval(pipeInterval);
        pipeInterval = null;
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    // Sélection de la difficulté avec les touches 1, 2, 3
    if (!gameStarted && showDifficultySelect) {
        if (e.code === "Digit1" || e.code === "Numpad1") {
            difficulty = 'facile';
            velocityX = difficultySettings.facile.speed;
            localStorage.setItem('gameDifficulty', difficulty);
            return;
        } else if (e.code === "Digit2" || e.code === "Numpad2") {
            difficulty = 'moyen';
            velocityX = difficultySettings.moyen.speed;
            localStorage.setItem('gameDifficulty', difficulty);
            return;
        } else if (e.code === "Digit3" || e.code === "Numpad3") {
            difficulty = 'difficile';
            velocityX = difficultySettings.difficile.speed;
            localStorage.setItem('gameDifficulty', difficulty);
            return;
        } else if (e.code === "Digit4" || e.code === "Numpad4") {
            difficulty = 'hardcore';
            velocityX = difficultySettings.hardcore.speed;
            localStorage.setItem('gameDifficulty', difficulty);
            return;
        }
    }
    
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Si on attend le redémarrage après une question de maths
        if (waitingForRestart) {
            waitingForRestart = false;
            gameStarted = true;
            // Recharger la difficulté sauvegardée
            difficulty = localStorage.getItem('gameDifficulty') || 'moyen';
            velocityX = difficultySettings[difficulty].speed;
            startPipeGeneration(); // Démarrer la génération des tuyaux
            return; // Ne pas faire sauter l'oiseau au redémarrage
        }

        // Si le jeu n'a pas démarré, le démarrer
        if (!gameStarted) {
            gameStarted = true;
            showDifficultySelect = false;
            startPipeGeneration(); // Démarrer la génération des tuyaux
            return; // Ne pas faire sauter l'oiseau au premier démarrage
        }

        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            gameStarted = false; // Retour à l'écran d'accueil
            gameOverTriggered = false;
            waitingForRestart = false; // Reset aussi cet état
            showDifficultySelect = true; // Réafficher le sélecteur
            // Réinitialiser la difficulté des calculs
            localStorage.removeItem('mathDifficulty');
            // Réinitialiser la difficulté du jeu
            localStorage.removeItem('gameDifficulty');
            difficulty = 'moyen';
            velocityX = difficultySettings.moyen.speed;
            // Arrêter la génération de tuyaux
            stopPipeGeneration();
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function saveScore(newScore) {
    // Sauvegarder le dernier score pour la page score.html
    localStorage.setItem('lastScore', newScore);
    
    // Récupérer les scores existants
    let scores = JSON.parse(localStorage.getItem('scores') || '[]');
    
    // Récupérer le nom du joueur et le niveau
    const playerName = localStorage.getItem('playerName') || 'Anonyme';
    const savedDifficulty = localStorage.getItem('gameDifficulty') || difficulty || 'moyen';
    
    // Ajouter le nouveau score avec la date, le nom et le niveau
    scores.push({
        score: newScore,
        name: playerName,
        difficulty: savedDifficulty,
        date: new Date().toLocaleString('fr-FR')
    });
    
    // Trier par score décroissant
    scores.sort((a, b) => b.score - a.score);
    
    // Garder seulement les 5 meilleurs scores
    scores = scores.slice(0, 5);
    
    // Sauvegarder
    localStorage.setItem('scores', JSON.stringify(scores));
    
    // Mettre à jour l'affichage
    displayScores();
}

function clearScores() {
    if (confirm('Effacer tous les scores enregistrés ?')) {
        localStorage.removeItem('scores');
        displayScores();
    }
}

function displayScores() {
    const scoreList = document.getElementById('scoreList');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    
    if (scores.length === 0) {
        scoreList.innerHTML = '<p class="no-scores">Aucun score pour le moment</p>';
        return;
    }
    
    const difficultyColors = {
        facile: '#22c55e',
        moyen: '#f59e0b',
        difficile: '#ef4444',
        hardcore: '#000000'
    };
    const difficultyLabels = {
        facile: 'F',
        moyen: 'M',
        difficile: 'D',
        hardcore: 'HC'
    };
    scoreList.innerHTML = scores.map((item, index) => {
        const diff = item.difficulty || 'moyen';
        const color = difficultyColors[diff] || '#f59e0b';
        const label = difficultyLabels[diff] || 'M';
        return `
        <div class="score-item ${index === 0 ? 'top-score' : ''}">
            <span class="score-rank">#${index + 1}</span>
            <span class="score-name">${item.name || 'Anonyme'}</span>
            <span class="score-difficulty" style="background:${color}">${label}</span>
            <span class="score-value">${item.score}</span>
        </div>`;
    }).join('');
}