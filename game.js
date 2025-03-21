document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('memory-game');
    const startButton = document.getElementById('start-game');
    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const bestTimeDisplay = document.getElementById('best-time');
    const diffButtons = document.querySelectorAll('.diff-btn');
    
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

    const emojis = {
        easy: ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪'],
        medium: ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎰', '🎳'],
        hard: ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎰', '🎳', '🎼', '🎵', '🎹', '🎸']
    };

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft === 0) {
            endGame(false);
        }
        timeLeft--;
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
        if (!isPlaying || flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            checkMatch();
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
            if (isPlaying) startGame();
        });
    });

    // Load best times
    Object.keys(difficulties).forEach(diff => {
        const bestTime = localStorage.getItem(`bestTime_${diff}`);
        if (bestTime) {
            bestTimeDisplay.textContent = `Best: ${Math.floor(bestTime / 60)}:${(bestTime % 60).toString().padStart(2, '0')}`;
        }
    });
}); 
