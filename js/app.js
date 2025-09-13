// --- STATE ---
let timerDuration = 60; // Default timer duration in seconds
let currentTimer = null;
let isQuestionActive = false;
let usedQuestions = {}; // To track used questions per box to avoid repeats in a session

// --- DOM ELEMENTS ---
const questionModal = document.getElementById('question-modal');
const questionCard = document.getElementById('question-card');
const questionBoxTitle = document.getElementById('question-box-title');
const questionTopic = document.getElementById('question-topic');
const questionList = document.getElementById('question-list');
const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.getElementById('timer-progress');
const settingsModal = document.getElementById('settings-modal');
const timerDurationInput = document.getElementById('timer-duration');

// --- FUNCTIONS ---

/**
 * Picks a random question from the specified box, displays it, and starts the timer.
 * @param {string} boxId - The ID of the box (e.g., 'BOX_1').
 */
function pickQuestion(boxId) {
    if (isQuestionActive) return; // Prevent picking a new card while one is active

    if (!questionsData[boxId] || questionsData[boxId].length === 0) {
        console.error(`No questions found for ${boxId}`);
        return;
    }

    // Initialize used questions for the box if not already
    if (!usedQuestions[boxId]) {
        usedQuestions[boxId] = new Set();
    }

    // Find an unused question
    let availableQuestions = questionsData[boxId].filter((_, index) => !usedQuestions[boxId].has(index));
    
    // If all questions in the box have been used, reset for this box
    if (availableQuestions.length === 0) {
        usedQuestions[boxId].clear();
        availableQuestions = questionsData[boxId];
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const questionData = availableQuestions[randomIndex];
    const originalIndex = questionsData[boxId].indexOf(questionData);
    usedQuestions[boxId].add(originalIndex);

    isQuestionActive = true;
    displayQuestion(boxId, questionData);
}

/**
 * Displays the question card with an animation.
 * @param {string} boxId - The ID of the box.
 * @param {object} questionData - The question object with topic and questions array.
 */
function displayQuestion(boxId, questionData) {
    questionBoxTitle.textContent = boxId.replace('_', ' ');
    questionTopic.textContent = questionData.topic;

    // Clear previous questions
    questionList.innerHTML = '';
    questionData.questions.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q;
        questionList.appendChild(li);
    });

    questionModal.classList.remove('hidden');
    
    // Flip the card
    setTimeout(() => {
        questionCard.classList.add('is-flipped');
        startTimer();
    }, 100); 
}

/**
 * Hides the question card with an animation and resets the state.
 */
function hideQuestion() {
    clearInterval(currentTimer);
    questionCard.classList.remove('is-flipped');
    
    setTimeout(() => {
        questionModal.classList.add('hidden');
        isQuestionActive = false;
    }, 600); // Match the CSS transition duration
}

/**
 * Starts the countdown timer for the question.
 */
function startTimer() {
    let timeLeft = timerDuration;
    
    // Update display immediately
    timerDisplay.textContent = `${timeLeft}s`;
    timerProgress.style.width = '100%';
    timerProgress.style.backgroundColor = '#6366f1'; // indigo-500

    currentTimer = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / timerDuration) * 100;

        timerDisplay.textContent = `${timeLeft}s`;
        timerProgress.style.width = `${percentage}%`;

        // Change color based on time left
        if (timeLeft <= timerDuration * 0.25) {
            timerProgress.style.backgroundColor = '#ef4444'; // red-500
        } else if (timeLeft <= timerDuration * 0.5) {
            timerProgress.style.backgroundColor = '#f59e0b'; // amber-500
        }

        if (timeLeft <= 0) {
            clearInterval(currentTimer);
            playBellSound();
            setTimeout(hideQuestion, 1000); // Wait a bit after bell before hiding
        }
    }, 1000);
}

/**
 * Plays a synthesized bell sound using Tone.js.
 */
function playBellSound() {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease("C5", "8n");
}

/**
 * Opens the settings modal.
 */
function openSettings() {
    timerDurationInput.value = timerDuration;
    settingsModal.classList.remove('hidden');
}

/**
 * Closes the settings modal.
 */
function closeSettings() {
    settingsModal.classList.add('hidden');
}

/**
 * Saves the settings from the modal.
 */
function saveSettings() {
    const newDuration = parseInt(timerDurationInput.value, 10);
    if (!isNaN(newDuration) && newDuration >= 5) {
        timerDuration = newDuration;
    }
    closeSettings();
}