// ==================== PRACTICE MODE MODULE ====================
// Handles practice question functionality

import { questions } from '../js/data.js';
import { savePracticeProgress, loadPracticeProgress, saveWrongAnswerCount, loadWrongAnswerCount } from '../js/storage.js';

// State
let currentPracticeQuestions = [];
let currentPracticeIndex = 0;
let selectedPracticeOption = -1;
let practiceProgress = loadPracticeProgress();
let wrongAnswerCount = loadWrongAnswerCount();

/**
 * Load a new practice set with random questions
 */
export function loadNewPracticeSet() {
    // Select 10 random questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    currentPracticeQuestions = shuffled.slice(0, 10);
    currentPracticeIndex = 0;
    loadPracticeQuestion();
}

/**
 * Load and display the current practice question
 */
export function loadPracticeQuestion() {
    if (currentPracticeIndex >= currentPracticeQuestions.length) {
        document.getElementById('practiceContainer').innerHTML = `
            <div class="alert success">
                <span style="font-size: 2em;">🎉</span>
                <div>
                    <strong>Practice Set Complete!</strong> You've finished this set of questions. Click "New Practice Set" to try more!
                </div>
            </div>
        `;
        updatePracticeProgress();
        return;
    }

    const question = currentPracticeQuestions[currentPracticeIndex];
    const questionId = questions.indexOf(question);

    let questionHTML = `
        <div class="question-card">
            <h3>Question ${currentPracticeIndex + 1} of ${currentPracticeQuestions.length}</h3>
            <p style="margin: 15px 0; font-size: 1.1em;"><strong>${question.question}</strong></p>
            <div class="options">
    `;

    question.options.forEach((option, index) => {
        questionHTML += `
            <div class="option" onclick="selectPracticeOption(${questionId}, ${index})" id="practice-option-${index}">
                <strong>${String.fromCharCode(65 + index)}.</strong> ${option}
            </div>
        `;
    });

    questionHTML += `
            </div>
            <div id="practice-feedback" class="feedback"></div>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" id="check-btn" onclick="checkPracticeAnswer(${questionId})" style="display: none;">Check Answer</button>
                <button class="btn btn-primary" id="next-btn" onclick="nextPracticeQuestion()" style="display: none;">Next Question →</button>
            </div>
        </div>
    `;

    document.getElementById('practiceContainer').innerHTML = questionHTML;
    updatePracticeProgress();
}

/**
 * Handle option selection
 * @param {number} questionId - ID of the question
 * @param {number} optionIndex - Index of the selected option
 */
export function selectPracticeOption(questionId, optionIndex) {
    // Remove previous selection
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Mark new selection
    document.getElementById(`practice-option-${optionIndex}`).classList.add('selected');
    selectedPracticeOption = optionIndex;

    // Show check button
    document.getElementById('check-btn').style.display = 'inline-block';
}

/**
 * Check the selected answer
 * @param {number} questionId - ID of the question
 */
export function checkPracticeAnswer(questionId) {
    const question = questions[questionId];
    const isCorrect = selectedPracticeOption === question.correct;

    // Update progress
    practiceProgress[questionId] = isCorrect;
    savePracticeProgress(practiceProgress);

    // Track wrong answers
    if (!isCorrect) {
        wrongAnswerCount[questionId] = (wrongAnswerCount[questionId] || 0) + 1;
        saveWrongAnswerCount(wrongAnswerCount);

        // Show note reminder if wrong 2+ times (would integrate with note modal here)
        if (wrongAnswerCount[questionId] >= 2) {
            console.log(`Wrong ${wrongAnswerCount[questionId]} times - suggest updating notes`);
        }
    }

    // Show visual feedback on options
    document.querySelectorAll('.option').forEach((opt, index) => {
        opt.style.pointerEvents = 'none';
        if (index === question.correct) {
            opt.classList.add('correct');
        } else if (index === selectedPracticeOption && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });

    // Show detailed feedback
    const feedbackDiv = document.getElementById('practice-feedback');
    feedbackDiv.className = `feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `
        <h4>${isCorrect ? '<i class="fas fa-check-circle"></i> Yes! You got it!' : '<i class="fas fa-times-circle"></i> Not quite - but that\'s okay!'}</h4>
        <p><strong>Why this answer:</strong> ${question.explanation}</p>
        <p style="margin-top: 10px;"><strong>Topic:</strong> ${question.topic}</p>
    `;

    // Hide check button, show next button
    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';
}

/**
 * Move to the next practice question
 */
export function nextPracticeQuestion() {
    currentPracticeIndex++;
    selectedPracticeOption = -1;
    loadPracticeQuestion();
}

/**
 * Update practice progress display
 */
export function updatePracticeProgress() {
    const text = `Question ${currentPracticeIndex + 1} of ${currentPracticeQuestions.length}`;
    const percent = ((currentPracticeIndex) / currentPracticeQuestions.length * 100).toFixed(0);
    document.getElementById('practiceProgress').textContent = text;
    document.getElementById('practiceProgressBar').style.width = `${percent}%`;
}

/**
 * Get practice progress for external use
 */
export function getPracticeProgress() {
    return loadPracticeProgress();
}

/**
 * Get wrong answer count for external use
 */
export function getWrongAnswerCount() {
    return loadWrongAnswerCount();
}

/**
 * Get current practice question set
 */
export function getCurrentPracticeQuestions() {
    return currentPracticeQuestions;
}

/**
 * Get current practice question index
 */
export function getCurrentPracticeIndex() {
    return currentPracticeIndex;
}
