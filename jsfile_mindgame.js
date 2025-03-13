document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('memory-game');
    const startButton = document.getElementById('start-game');
    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const bestTimeDisplay = document.getElementById('best-time');
    const diffButtons = document.querySelectorAll('.diff-btn');
    const scoreList = document.getElementById('score-list');
    const scoreTabs = document.querySelectorAll('.score-tab');
    const nameModal = document.getElementById('name-modal');
    const playerNameInput = document.getElementById('player-name');
    const saveScoreButton = document.getElementById('save-score');
    
    const difficulties = {
        easy: { pairs: 6, time: 60 },
        medium: { pairs: 8, time: 90 },
        hard: { pairs: 12, time: 120 }
    };

    let currentDifficulty = 'easy';
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let timer;
    let timeLeft;
    let score = 0;
    let isPlaying = false;
    let pendingScore = null;
    let isChecking = false;

    const emojis = {
        easy: ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪'],
        medium: ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎰', '🎳'],
        hard: ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎰', '🎳', '🎼', '🎵', '🎹', '🎸']
    };

    // High Score Functions
    function getHighScores(difficulty) {
        const scores = localStorage.getItem(`highScores_${difficulty}`);
        return scores ? JSON.parse(scores) : [];
    }

    function saveHighScore(difficulty, name, score, time) {
        let scores = getHighScores(difficulty);
        const newScore = { name, score, time, date: Date.now() };
        
        if (scores.length < 10 || score > scores[scores.length - 1].score || 
            (score === scores[scores.length - 1].score && time < scores[scores.length - 1].time)) {
            scores.push(newScore);
            scores.sort((a, b) => b.score - a.score || a.time - b.time);
            scores = scores.slice(0, 10);
            localStorage.setItem(`highScores_${difficulty}`, JSON.stringify(scores));
            displayHighScores(difficulty);
        }
    }

    function displayHighScores(difficulty) {
        const scores = getHighScores(difficulty);
        scoreList.innerHTML = scores.length ? scores.map((score, index) => `
            <div class="score-item">
                <span class="score-rank">#${index + 1}</span>
                <span class="score-name">${score.name}</span>
                <span class="score-value">${score.score} pts (${Math.floor(score.time / 60)}:${(score.time % 60).toString().padStart(2, '0')})</span>
            </div>
        `).join('') : '<div class="score-item">No scores yet</div>';
    }

    function showNameModal(finalScore, finalTime) {
        pendingScore = { score: finalScore, time: finalTime };
        nameModal.classList.add('show');
        playerNameInput.focus();
    }

    function updateTimer() {
        if (timeLeft > 0) {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            endGame(false);
        }
    }

    function createCard(emoji) {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.innerHTML = `
            <div class="card-front">?</div>
            <div class="card-back">${emoji}</div>
        `;
        return card;
    }

    function flipCard(card) {
        if (!isPlaying || flippedCards.length >= 2 || isChecking || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            isChecking = true;
            setTimeout(checkMatch, 800);
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const emoji1 = card1.querySelector('.card-back').textContent;
        const emoji2 = card2.querySelector('.card-back').textContent;
        
        if (emoji1 === emoji2) {
            matchedPairs++;
            score += 10;
            scoreDisplay.textContent = score;
            flippedCards = [];
            
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            if (matchedPairs === difficulties[currentDifficulty].pairs) {
                endGame(true);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
            score = Math.max(0, score - 5);
            scoreDisplay.textContent = score;
        }
        isChecking = false;
    }

    function celebrate() {
        const celebration = document.getElementById('celebration');
        celebration.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 50%, 50%)`;
            celebration.appendChild(confetti);
        }
        
        setTimeout(() => {
            celebration.innerHTML = '';
        }, 4000);
    }

    function endGame(won) {
        isPlaying = false;
        clearInterval(timer);
        
        if (won) {
            celebrate();
            const currentTime = difficulties[currentDifficulty].time - timeLeft;
            const bestTime = localStorage.getItem(`bestTime_${currentDifficulty}`) || 999999;
            
            if (currentTime < bestTime) {
                localStorage.setItem(`bestTime_${currentDifficulty}`, currentTime);
                bestTimeDisplay.textContent = `Best: ${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`;
                
                // Also update the specific difficulty best time display
                const diffBestTimeElement = document.getElementById(`best-time-${currentDifficulty}`);
                if (diffBestTimeElement) {
                    diffBestTimeElement.textContent = `Best: ${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`;
                }
            }

            // Check if score qualifies for high scores
            const highScores = getHighScores(currentDifficulty);
            if (highScores.length < 10 || score > highScores[highScores.length - 1].score) {
                showNameModal(score, currentTime);
            }
        }
        
        startButton.innerHTML = '<i class="fas fa-redo"></i> Play Again';
    }

    function startGame() {
        // Reset game state
        gameContainer.innerHTML = '';
        matchedPairs = 0;
        score = 0;
        flippedCards = [];
        scoreDisplay.textContent = '0';
        
        // Set up timer
        timeLeft = difficulties[currentDifficulty].time;
        if (timer) clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
        
        // Create and shuffle cards
        const currentEmojis = emojis[currentDifficulty];
        cards = [...currentEmojis, ...currentEmojis]
            .sort(() => Math.random() - 0.5);
        
        // Add cards to container
        cards.forEach(emoji => {
            const card = createCard(emoji);
            card.addEventListener('click', () => flipCard(card));
            gameContainer.appendChild(card);
        });
        
        isPlaying = true;
        startButton.innerHTML = '<i class="fas fa-stop"></i> Reset';
    }

    // Event Listeners
    startButton.addEventListener('click', startGame);
    
    diffButtons.forEach(button => {
        button.addEventListener('click', () => {
            diffButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDifficulty = button.dataset.diff;
            
            // Update the main best time display for the new difficulty
            const bestTime = localStorage.getItem(`bestTime_${currentDifficulty}`);
            if (bestTime) {
                bestTimeDisplay.textContent = `Best: ${Math.floor(bestTime / 60)}:${(bestTime % 60).toString().padStart(2, '0')}`;
            } else {
                bestTimeDisplay.textContent = 'Best: --:--';
            }
            
            startGame(); // Reset game on difficulty change
        });
    });

    scoreTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            scoreTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayHighScores(tab.dataset.diff);
        });
    });

    saveScoreButton.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (name && pendingScore) {
            saveHighScore(currentDifficulty, name, pendingScore.score, pendingScore.time);
            nameModal.classList.remove('show');
            playerNameInput.value = '';
            pendingScore = null;
        }
    });

    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const name = playerNameInput.value.trim();
            if (name && pendingScore) {
                saveScoreButton.click();
            }
        }
    });

    // Function to load best times for all difficulties
    function loadBestTimes() {
        Object.keys(difficulties).forEach(difficulty => {
            const bestTime = localStorage.getItem(`bestTime_${difficulty}`);
            const bestTimeElement = document.getElementById(`best-time-${difficulty}`);
            
            if (bestTime && bestTimeElement) {
                bestTimeElement.textContent = `Best: ${Math.floor(bestTime / 60)}:${(bestTime % 60).toString().padStart(2, '0')}`;
            } else if (bestTimeElement) {
                bestTimeElement.textContent = "No Best Time";
            }
            
            // Also update the main best time display for the current difficulty
            if (difficulty === currentDifficulty && bestTime) {
                bestTimeDisplay.textContent = `Best: ${Math.floor(bestTime / 60)}:${(bestTime % 60).toString().padStart(2, '0')}`;
            }
        });
    }

    // Load best times on page load
    loadBestTimes();

    // Initialize high scores display
    displayHighScores('easy');
}); 
