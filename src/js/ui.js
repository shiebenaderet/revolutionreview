// ==================== UI MODULE ====================
// Contains all UI utility functions and page rendering logic

import { vocabulary, questions, timelineEvents, badges } from './data.js';
import {
    saveVocabProgress,
    savePracticeProgress,
    saveWrongAnswerCount,
    saveTestResults,
    saveTotalStudyTime,
    saveStudyStreak,
    saveEarnedBadges,
    saveTimelineProgress,
    saveShortAnswerResponses
} from './storage.js';
import { trackTestCompletion, trackQuestionAttempt, trackPageView, trackStudySession, getAnalyticsDashboard } from './analytics.js';

// ==================== STATE REFERENCES ====================
// These will be set by app.js to access shared state
let state = null;

export function initUIState(appState) {
    state = appState;
}

// ==================== MODAL FUNCTIONS ====================

export function showNoteModal(title, message, icon = '📝') {
    const modal = document.getElementById('noteModal');
    document.getElementById('noteModalTitle').textContent = title;
    document.getElementById('noteModalMessage').textContent = message;
    document.getElementById('noteModalIcon').textContent = icon;
    modal.classList.add('active');
}

export function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    modal.classList.remove('active');
}

// ==================== TIMER FUNCTIONS ====================

export function checkAndUpdateStreak() {
    const today = new Date().toDateString();
    const lastStudy = state.studyStreak.lastStudyDate;

    if (lastStudy !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastStudy === yesterday.toDateString()) {
            // Continue streak
            state.studyStreak.current++;
        } else if (lastStudy === null) {
            // First time
            state.studyStreak.current = 1;
        } else {
            // Streak broken
            state.studyStreak.current = 1;
        }

        state.studyStreak.lastStudyDate = today;
        state.studyStreak.longest = Math.max(state.studyStreak.longest, state.studyStreak.current);
        saveStudyStreak(state.studyStreak);
    }
}

export function checkBadges() {
    let newBadges = [];

    // Define badge check functions inline
    const badgeChecks = {
        'first_study': () => state.totalStudyTime > 0,
        'vocab_5': () => state.vocabProgress.length >= 5,
        'vocab_all': () => state.vocabProgress.length >= vocabulary.length,
        'streak_3': () => state.studyStreak.current >= 3,
        'streak_7': () => state.studyStreak.current >= 7,
        'practice_10': () => Object.keys(state.practiceProgress).length >= 10,
        'test_pass': () => state.testResults.some(t => t.score >= 80),
        'perfect_test': () => state.testResults.some(t => t.score >= 100),
        'study_hour': () => state.totalStudyTime >= 3600000,
        'timeline_master': () => state.timelineProgress.perfectCount >= 3
    };

    badges.forEach(badge => {
        if (!state.earnedBadges.includes(badge.id) && badgeChecks[badge.id] && badgeChecks[badge.id]()) {
            state.earnedBadges.push(badge.id);
            newBadges.push(badge);
        }
    });

    if (newBadges.length > 0) {
        saveEarnedBadges(state.earnedBadges);

        // Show notification for new badges
        newBadges.forEach(badge => {
            showBadgeNotification(badge);
        });
    }
}

export function showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 3px solid #667eea;
        border-radius: 20px;
        padding: 30px;
        z-index: 10000;
        box-shadow: 0 10px 50px rgba(0,0,0,0.3);
        text-align: center;
        animation: badge-pop 0.5s ease;
    `;

    notification.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 15px;">${badge.icon}</div>
        <h2 style="color: #667eea; margin-bottom: 10px;">Achievement Unlocked!</h2>
        <h3 style="margin-bottom: 10px;">${badge.name}</h3>
        <p style="color: #666;">${badge.description}</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 10px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1em;
        ">Awesome!</button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

export function startTimer() {
    if (!state.timerInterval) {
        checkAndUpdateStreak();
        state.sessionStartTime = Date.now() - state.sessionElapsedTime;
        state.timerInterval = setInterval(updateTimer, 1000);
        state.timerPaused = false;
        updateTimerButton();
    }
}

export function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        // Save session time to total
        state.totalStudyTime += state.sessionElapsedTime;
        saveTotalStudyTime(state.totalStudyTime);
        state.sessionElapsedTime = 0;
        updateTotalTimeDisplay();
    }
}

export function toggleTimer() {
    if (state.timerPaused) {
        // Resume
        state.sessionStartTime = Date.now() - state.sessionElapsedTime;
        state.timerInterval = setInterval(updateTimer, 1000);
        state.timerPaused = false;
    } else {
        // Pause
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.timerPaused = true;
    }
    updateTimerButton();
}

export function updateTimer() {
    state.sessionElapsedTime = Date.now() - state.sessionStartTime;
    const seconds = Math.floor(state.sessionElapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;

    document.getElementById('timerDisplay').textContent =
        `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
}

export function updateTimerButton() {
    const btn = document.getElementById('pauseBtn');
    if (state.timerPaused) {
        btn.className = 'timer-btn resume';
        btn.innerHTML = '<i class="fas fa-play"></i> Resume';
    } else {
        btn.className = 'timer-btn pause';
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

export function updateTotalTimeDisplay() {
    const totalMinutes = Math.floor(state.totalStudyTime / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    document.getElementById('totalTime').textContent = `Total: ${hours}h ${minutes}m`;
}

export function showTimer() {
    document.getElementById('studyTimer').style.display = 'block';
    startTimer();
    updateTotalTimeDisplay();
}

export function hideTimer() {
    document.getElementById('studyTimer').style.display = 'none';
    stopTimer();
}

// ==================== PROGRESS FUNCTIONS ====================

export function createCircularProgress(percent, label) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return `
        <div class="stat-card">
            <div class="circular-progress">
                <svg viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle class="bg-circle" cx="60" cy="60" r="${radius}"/>
                    <circle class="progress-circle" cx="60" cy="60" r="${radius}"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${offset}"/>
                </svg>
                <div class="percentage">${percent}%</div>
            </div>
            <div class="label">${label}</div>
        </div>
    `;
}

export function getProgressLevel(percent) {
    if (percent >= 90) return 'expert';
    if (percent >= 70) return 'proficient';
    if (percent >= 40) return 'learning';
    return 'beginner';
}

export function getProgressLabel(percent) {
    if (percent >= 90) return 'Expert';
    if (percent >= 70) return 'Proficient';
    if (percent >= 40) return 'Learning';
    return 'Beginner';
}

export function updateHomeProgress() {
    const vocabMastery = vocabulary.length > 0 ? (state.vocabProgress.length / vocabulary.length * 100).toFixed(0) : 0;
    const practiceTotal = Object.keys(state.practiceProgress).length;
    const practiceCorrect = Object.values(state.practiceProgress).filter(v => v === true).length;
    const practicePercent = practiceTotal > 0 ? (practiceCorrect / practiceTotal * 100).toFixed(0) : 0;

    const testsTotal = state.testResults.length;
    const avgTestScore = testsTotal > 0
        ? (state.testResults.reduce((sum, r) => sum + r.score, 0) / testsTotal).toFixed(0)
        : 0;

    let progressHTML = '<div class="stats-grid">';
    progressHTML += createCircularProgress(vocabMastery, 'Vocabulary Mastery');
    progressHTML += createCircularProgress(practicePercent, 'Practice Accuracy');

    if (testsTotal > 0) {
        progressHTML += createCircularProgress(avgTestScore, 'Test Average');
    }

    progressHTML += `
        <div class="stat-card">
            <div class="number">${testsTotal}</div>
            <div class="label">Practice Tests Taken</div>
        </div>
    `;

    progressHTML += '</div>';

    // Add progress badges
    const overallProgress = (parseFloat(vocabMastery) * 0.4) + (parseFloat(practicePercent) * 0.4) + (parseFloat(avgTestScore) * 0.2);
    const level = getProgressLevel(overallProgress);
    const levelLabel = getProgressLabel(overallProgress);

    progressHTML += `
        <div style="text-align: center; margin: 20px 0;">
            <span class="progress-badge ${level}">
                ${levelLabel} Level (${overallProgress.toFixed(0)}% Overall)
            </span>
        </div>
    `;

    // Add "Email My Teacher" button if proficient or expert AND studied for at least 1 hour
    const hasStudiedEnough = state.totalStudyTime >= 3600000; // 1 hour in milliseconds
    if (overallProgress >= 70 && hasStudiedEnough) {
        progressHTML += `
            <div style="text-align: center; margin: 20px 0;">
                <button class="btn btn-primary" onclick="window.showEmailTeacherForm()" style="font-size: 1.1em; padding: 15px 30px;">
                    <i class="fas fa-envelope"></i> Email My Teacher
                </button>
                <p style="margin-top: 10px; color: #666; font-size: 0.9em;">
                    You've reached ${overallProgress.toFixed(0)}% proficiency and studied for over 1 hour! Share your progress with your teacher.
                </p>
            </div>
        `;
    } else if (overallProgress >= 70 && !hasStudiedEnough) {
        const minutesRemaining = Math.ceil((3600000 - state.totalStudyTime) / 60000);
        progressHTML += `
            <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f0f4ff; border-radius: 10px;">
                <p style="color: #666; font-size: 0.95em;">
                    <i class="fas fa-lock"></i> You're at ${overallProgress.toFixed(0)}% proficiency!
                    Study for ${minutesRemaining} more minutes to unlock the "Email My Teacher" feature.
                </p>
            </div>
        `;
    }

    // Add streak display
    if (state.studyStreak.current > 0) {
        progressHTML += `
            <div class="streak-display">
                <div class="streak-emoji">${state.studyStreak.current >= 7 ? '🔥🔥🔥' : state.studyStreak.current >= 3 ? '🔥🔥' : '🔥'}</div>
                <div class="streak-number">${state.studyStreak.current}</div>
                <div>Day Study Streak!</div>
                <div style="margin-top: 10px; font-size: 0.9em; opacity: 0.9;">Longest: ${state.studyStreak.longest} days</div>
            </div>
        `;
    }

    // Add recently earned badges
    const recentBadges = state.earnedBadges.slice(-3).reverse();
    if (recentBadges.length > 0) {
        progressHTML += '<h3 style="margin: 20px 0;">Recent Achievements</h3><div class="badge-display">';
        recentBadges.forEach(badgeId => {
            const badge = badges.find(b => b.id === badgeId);
            if (badge) {
                progressHTML += `
                    <div class="achievement-badge earned">
                        <div class="badge-icon">${badge.icon}</div>
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-desc">${badge.description}</div>
                    </div>
                `;
            }
        });
        progressHTML += '</div>';
    }

    // Add readiness assessment with more encouraging language
    const totalProgress = (parseFloat(vocabMastery) * 0.4) + (parseFloat(practicePercent) * 0.4) + (parseFloat(avgTestScore) * 0.2);

    if (totalProgress >= 80) {
        progressHTML += `
            <div class="alert success">
                <i class="fas fa-star"></i>
                <div>
                    <strong>You're crushing it!</strong> Your progress is ${totalProgress.toFixed(0)}%. You're totally ready for the real test!
                </div>
            </div>
        `;
    } else if (totalProgress >= 60) {
        progressHTML += `
            <div class="alert info">
                <i class="fas fa-dumbbell"></i>
                <div>
                    <strong>You're doing great!</strong> Your progress is ${totalProgress.toFixed(0)}%. Keep practicing and you'll be ready soon!
                </div>
            </div>
        `;
    } else if (practiceTotal > 0 || state.vocabProgress.length > 0) {
        progressHTML += `
            <div class="alert info">
                <i class="fas fa-book-open"></i>
                <div>
                    <strong>Good start!</strong> Your progress is ${totalProgress.toFixed(0)}%. Keep studying the vocabulary and doing practice questions!
                </div>
            </div>
        `;
    } else {
        progressHTML += `
            <div class="alert info">
                <i class="fas fa-hand-wave"></i>
                <div>
                    <strong>Welcome!</strong> Start by learning vocabulary, then try some practice questions. You've got this!
                </div>
            </div>
        `;
    }

    const progressContainer = document.getElementById('overallProgress');
    if (progressContainer) {
        progressContainer.innerHTML = progressHTML;
    }
}

// ==================== SECTION NAVIGATION ====================

// Track current section for study session analytics
let currentSection = null;
let sectionStartTime = null;

export function showSection(sectionId) {
    // Track study session for previous section
    if (currentSection && currentSection !== 'home' && sectionStartTime) {
        const duration = Date.now() - sectionStartTime;
        trackStudySession(currentSection, duration, new Date(sectionStartTime));
    }

    // Track page view for new section
    trackPageView(sectionId);

    // Update current section tracking
    currentSection = sectionId;
    sectionStartTime = Date.now();

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    // Show/hide timer based on section
    if (sectionId === 'home') {
        hideTimer();
        updateHomeProgress();
    } else {
        showTimer();
        if (sectionId === 'vocab') {
            window.loadFlashcard();
            window.updateVocabProgress();
        } else if (sectionId === 'practice') {
            window.loadNewPracticeSet();
        } else if (sectionId === 'shortanswer') {
            loadShortAnswers();
        } else if (sectionId === 'test') {
            loadTest();
        } else if (sectionId === 'progress') {
            loadProgressPage();
        } else if (sectionId === 'printguide') {
            loadPrintGuide();
        } else if (sectionId === 'focused') {
            loadFocusedMode();
        } else if (sectionId === 'timeline') {
            loadTimeline();
        } else if (sectionId === 'analytics') {
            loadAnalyticsDashboard();
        }
    }
}

// ==================== VOCABULARY DEFINITIONS & HIGHLIGHTING ====================

// Build vocabulary definitions lookup
const vocabDefinitions = {};
vocabulary.forEach(v => {
    vocabDefinitions[v.term.toLowerCase()] = {
        definition: v.definition,
        example: v.example,
        category: v.category
    };
});

export function highlightVocabTerms(text) {
    let highlighted = text;

    // Sort by length (longest first) to avoid partial matches
    const terms = Object.keys(vocabDefinitions).sort((a, b) => b.length - a.length);

    terms.forEach(term => {
        // Only highlight if it's a full word
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        highlighted = highlighted.replace(regex, function(match) {
            return `<span class="vocab-term" onclick="window.showDefinition('${term}', event)">${match}</span>`;
        });
    });

    return highlighted;
}

export function showDefinition(term, event) {
    const tooltip = document.getElementById('definitionTooltip');
    const content = document.getElementById('tooltipContent');

    const vocab = vocabDefinitions[term.toLowerCase()];
    if (!vocab) return;

    content.innerHTML = `
        <h4>${term}</h4>
        <p><strong>Definition:</strong> ${vocab.definition}</p>
        <p><strong>Example:</strong> ${vocab.example}</p>
        <p style="color: #666; font-size: 0.9em; margin-top: 8px;">${vocab.category}</p>
    `;

    // Add close button with icon
    tooltip.querySelector('.close-tooltip').innerHTML = '<i class="fas fa-times"></i>';

    // Position tooltip near click
    tooltip.style.display = 'block';
    tooltip.style.left = Math.min(event.clientX + 10, window.innerWidth - 320) + 'px';
    tooltip.style.top = (event.clientY + 10) + 'px';
}

export function closeTooltip() {
    document.getElementById('definitionTooltip').style.display = 'none';
}

// ==================== TEST FUNCTIONS ====================

export function loadTest() {
    state.testAnswers = {};

    let testHTML = `
        <div class="progress-bar">
            <div class="progress-fill" id="testProgressBar" style="width: 0%"></div>
            <div class="progress-text" id="testProgress">0 of 30 answered</div>
        </div>
        <div id="testQuestions">
    `;

    questions.forEach((question, qIndex) => {
        testHTML += `
            <div class="question-card">
                <h3>Question ${qIndex + 1}</h3>
                <p style="margin: 15px 0; font-size: 1.1em;"><strong>${question.question}</strong></p>
                <div class="options">
        `;

        question.options.forEach((option, optIndex) => {
            testHTML += `
                <div class="option" onclick="window.selectTestOption(${qIndex}, ${optIndex})" id="test-q${qIndex}-opt${optIndex}">
                    <strong>${String.fromCharCode(65 + optIndex)}.</strong> ${option}
                </div>
            `;
        });

        testHTML += `
                </div>
            </div>
        `;
    });

    testHTML += `
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <button class="btn btn-primary" onclick="window.gradeTest()" style="font-size: 1.2em; padding: 15px 40px;">
                Submit Test for Grading
            </button>
        </div>
    `;

    document.getElementById('testContainer').innerHTML = testHTML;
    updateTestProgress();
}

export function selectTestOption(questionIndex, optionIndex) {
    // Clear previous selection for this question
    for (let i = 0; i < 4; i++) {
        const opt = document.getElementById(`test-q${questionIndex}-opt${i}`);
        if (opt) opt.classList.remove('selected');
    }

    // Mark new selection
    document.getElementById(`test-q${questionIndex}-opt${optionIndex}`).classList.add('selected');
    state.testAnswers[questionIndex] = optionIndex;

    updateTestProgress();
}

export function updateTestProgress() {
    const answered = Object.keys(state.testAnswers).length;
    const percent = (answered / questions.length * 100).toFixed(0);
    document.getElementById('testProgress').textContent = `${answered} of ${questions.length} answered`;
    document.getElementById('testProgressBar').style.width = `${percent}%`;
}

export function gradeTest() {
    if (Object.keys(state.testAnswers).length < questions.length) {
        if (!confirm(`You've only answered ${Object.keys(state.testAnswers).length} of ${questions.length} questions. Submit anyway?`)) {
            return;
        }
    }

    let correct = 0;
    let topicScores = {};
    let incorrectQuestions = [];

    questions.forEach((question, qIndex) => {
        const userAnswer = state.testAnswers[qIndex];
        const isCorrect = userAnswer === question.correct;

        if (isCorrect) {
            correct++;
        } else {
            incorrectQuestions.push({
                question: question.question,
                topic: question.topic,
                correctAnswer: question.options[question.correct],
                explanation: question.explanation
            });
        }

        // Track by topic
        if (!topicScores[question.topic]) {
            topicScores[question.topic] = { correct: 0, total: 0 };
        }
        topicScores[question.topic].total++;
        if (isCorrect) topicScores[question.topic].correct++;

        // Track question attempt in analytics
        trackQuestionAttempt(qIndex, isCorrect, question.category, 0);

        // Visual feedback
        const optDiv = document.getElementById(`test-q${qIndex}-opt${question.correct}`);
        if (optDiv) optDiv.classList.add('correct');

        if (userAnswer !== undefined && userAnswer !== question.correct) {
            const wrongDiv = document.getElementById(`test-q${qIndex}-opt${userAnswer}`);
            if (wrongDiv) wrongDiv.classList.add('incorrect');
        }
    });

    const score = (correct / questions.length * 100).toFixed(0);

    // Calculate topic breakdown for analytics
    const topicBreakdown = {};
    Object.entries(topicScores).forEach(([topic, scores]) => {
        topicBreakdown[topic] = {
            correct: scores.correct,
            total: scores.total,
            percentage: (scores.correct / scores.total * 100).toFixed(0)
        };
    });

    // Track test completion in analytics
    trackTestCompletion(parseInt(score), questions.length, correct, 0, topicBreakdown);

    // Save result
    state.testResults.push({
        score: parseInt(score),
        date: new Date().toISOString(),
        topicScores: topicScores
    });
    saveTestResults(state.testResults);
    checkBadges();

    // Show note reminder if score is below 70%
    if (score < 70) {
        showNoteModal(
            'Time to Review! 📖',
            `You scored ${score}%. Review the questions you missed below and write the correct answers and explanations in your notebook. This will help you do better next time!`,
            '📖'
        );
    }

    // Display results
    let resultsHTML = `
        <div class="alert ${score >= 80 ? 'success' : 'info'}">
            <i class="fas ${score >= 80 ? 'fa-trophy' : 'fa-chart-bar'}"></i>
            <div>
                <h2 style="margin-bottom: 10px;">Test Complete!</h2>
                <p style="font-size: 1.3em;"><strong>You got ${correct} out of ${questions.length} correct (${score}%)</strong></p>
                ${score >= 90
                    ? '<p>Wow! You totally know this stuff! You\'re definitely ready! <i class="fas fa-star"></i></p>'
                    : score >= 80
                    ? '<p>Great job! You\'re ready for the real test!</p>'
                    : score >= 70
                    ? '<p>Good work! Check out what you missed below and you\'ll be ready!</p>'
                    : score >= 60
                    ? '<p>You\'re getting there! Study the topics below and try again!</p>'
                    : '<p>Keep studying! Focus on the areas below where you need more practice.</p>'
                }
            </div>
        </div>

        <h3 style="margin: 30px 0 15px 0;">How You Did On Each Topic:</h3>
        <div class="stats-grid">
    `;

    Object.entries(topicScores).forEach(([topic, scores]) => {
        const topicPercent = (scores.correct / scores.total * 100).toFixed(0);
        resultsHTML += `
            <div class="stat-card">
                <div class="number">${topicPercent}%</div>
                <div class="label">${topic}<br>(${scores.correct}/${scores.total})</div>
            </div>
        `;
    });

    resultsHTML += '</div>';

    if (incorrectQuestions.length > 0) {
        resultsHTML += `
            <div class="weakness-list">
                <h3><i class="fas fa-pencil-alt"></i> Questions to Study Again:</h3>
        `;

        incorrectQuestions.forEach((q, index) => {
            resultsHTML += `
                <div class="weakness-item">
                    <div>
                        <strong>${q.question}</strong><br>
                        <small style="color: #666;">Topic: ${q.topic}</small><br>
                        <small style="color: #059669;"><strong>The right answer:</strong> ${q.correctAnswer}</small><br>
                        <small>${highlightVocabTerms(q.explanation)}</small>
                    </div>
                </div>
            `;
        });

        resultsHTML += '</div>';
    }

    resultsHTML += `
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn btn-primary" onclick="window.loadTest()">Take Another Practice Test</button>
            <button class="btn btn-secondary" onclick="window.showSection('home')">Back to Home</button>
        </div>
    `;

    document.getElementById('testContainer').innerHTML = resultsHTML;
}

// ==================== PROGRESS PAGE ====================

export function loadProgressPage() {
    // Calculate stats
    const vocabMastery = (state.vocabProgress.length / vocabulary.length * 100).toFixed(0);
    const practiceTotal = Object.keys(state.practiceProgress).length;
    const practiceCorrect = Object.values(state.practiceProgress).filter(v => v === true).length;
    const practicePercent = practiceTotal > 0 ? (practiceCorrect / practiceTotal * 100).toFixed(0) : 0;

    const testsTotal = state.testResults.length;
    const avgTestScore = testsTotal > 0
        ? (state.testResults.reduce((sum, r) => sum + r.score, 0) / testsTotal).toFixed(0)
        : 0;

    // Format study time
    const totalMinutes = Math.floor(state.totalStudyTime / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const studyTimeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Stats cards
    let statsHTML = `
        <div class="stat-card">
            <div class="number">${state.vocabProgress.length}/${vocabulary.length}</div>
            <div class="label">Vocabulary Words You Know</div>
        </div>
        <div class="stat-card">
            <div class="number">${practiceCorrect}/${practiceTotal}</div>
            <div class="label">Practice Questions Right</div>
        </div>
        <div class="stat-card">
            <div class="number">${testsTotal}</div>
            <div class="label">Practice Tests Done</div>
        </div>
        <div class="stat-card">
            <div class="number">${studyTimeDisplay}</div>
            <div class="label">Total Study Time</div>
        </div>
    `;

    if (testsTotal > 0) {
        statsHTML += `
            <div class="stat-card">
                <div class="number">${avgTestScore}%</div>
                <div class="label">Average Test Score</div>
            </div>
        `;
    }

    document.getElementById('statsContainer').innerHTML = statsHTML;

    // Weakness analysis
    const unknownVocab = vocabulary.filter(v => !state.vocabProgress.includes(v.term));
    const incorrectPractice = Object.entries(state.practiceProgress)
        .filter(([qId, correct]) => !correct)
        .map(([qId]) => questions[parseInt(qId)]);

    let weaknessHTML = '';

    if (unknownVocab.length > 0 || incorrectPractice.length > 0) {
        weaknessHTML = '<div class="weakness-list"><h3><i class="fas fa-exclamation-triangle"></i> What You Should Study More:</h3>';

        if (unknownVocab.length > 0) {
            weaknessHTML += `<p><strong>Vocabulary words you haven't learned yet (${unknownVocab.length} words):</strong></p>`;
            unknownVocab.slice(0, 5).forEach(v => {
                weaknessHTML += `<div class="weakness-item">${v.term} <span style="color: #666;">(${v.category})</span></div>`;
            });
            if (unknownVocab.length > 5) {
                weaknessHTML += `<p style="margin-top: 10px;"><em>...and ${unknownVocab.length - 5} more. Go study them in the Vocabulary section!</em></p>`;
            }
        }

        if (incorrectPractice.length > 0) {
            const topicCounts = {};
            incorrectPractice.forEach(q => {
                topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
            });

            weaknessHTML += `<p style="margin-top: 15px;"><strong>Topics where you got questions wrong:</strong></p>`;
            Object.entries(topicCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([topic, count]) => {
                    weaknessHTML += `<div class="weakness-item">${topic} <span class="mastery-badge low">${count} wrong</span></div>`;
                });
        }

        weaknessHTML += '</div>';
    }

    document.getElementById('weaknessContainer').innerHTML = weaknessHTML;

    // Strength analysis
    let strengthHTML = '';

    if (state.vocabProgress.length > 0 || practiceCorrect > 0) {
        strengthHTML = '<div class="strength-list"><h3><i class="fas fa-check-circle"></i> What You Already Know Really Well:</h3>';

        if (state.vocabProgress.length > 0) {
            const byCategory = {};
            state.vocabProgress.forEach(term => {
                const vocab = vocabulary.find(v => v.term === term);
                if (vocab) {
                    byCategory[vocab.category] = (byCategory[vocab.category] || 0) + 1;
                }
            });

            strengthHTML += '<p><strong>Vocabulary you know, by category:</strong></p>';
            Object.entries(byCategory).forEach(([category, count]) => {
                const total = vocabulary.filter(v => v.category === category).length;
                const percent = (count / total * 100).toFixed(0);
                strengthHTML += `
                    <div class="weakness-item">
                        ${category}
                        <span class="mastery-badge ${percent >= 80 ? 'high' : percent >= 60 ? 'medium' : 'low'}">
                            ${count}/${total} (${percent}%)
                        </span>
                    </div>
                `;
            });
        }

        if (testsTotal > 0) {
            const lastTest = state.testResults[state.testResults.length - 1];
            strengthHTML += '<p style="margin-top: 15px;"><strong>Your last test scores by topic:</strong></p>';
            Object.entries(lastTest.topicScores || {}).forEach(([topic, scores]) => {
                const percent = (scores.correct / scores.total * 100).toFixed(0);
                strengthHTML += `
                    <div class="weakness-item">
                        ${topic}
                        <span class="mastery-badge ${percent >= 80 ? 'high' : percent >= 60 ? 'medium' : 'low'}">
                            ${scores.correct}/${scores.total} (${percent}%)
                        </span>
                    </div>
                `;
            });
        }

        strengthHTML += '</div>';
    }

    document.getElementById('strengthContainer').innerHTML = strengthHTML;
}

// ==================== SHORT ANSWER FUNCTIONS ====================

// Short answer questions data - TODO: could be moved to data.js
const shortAnswerQuestions = [
    {
        question: "The Tipping Point: Look at where you spent the MOST outrage points. Why did that event deserve the most? What made it cross the line from 'annoying' to 'unacceptable'?",
        topic: "Causes of Unrest",
        rubric: [
            "Names a SPECIFIC event (like Boston Massacre, Intolerable Acts, etc.)",
            "Explains WHY this event caused the most anger (3-4 sentences)",
            "Uses specific details from what you learned (not just 'it was unfair')",
            "Explains what made it a 'tipping point' - what was different about this event?"
        ],
        exemplar: "I gave the Intolerable Acts the most outrage points because they didn't just punish the people who did the Boston Tea Party - they punished everyone in Massachusetts. Britain closed Boston Harbor, which meant people couldn't work or get supplies, and they took away Massachusetts' right to govern themselves. What made this cross the line was that it showed Britain would use collective punishment and destroy an entire colony's freedom just to make a point. It proved that Britain didn't care about colonists' rights at all.",
        sentenceStarters: [
            "I gave __________ the most points because...",
            "This event was more serious than others because...",
            "What made this cross the line was...",
            "This showed colonists that..."
        ]
    },
    {
        question: "The Build-Up: The colonists didn't rebel after the Proclamation of 1763, but they DID rebel after Lexington and Concord. What changed over those 12 years? Why does the ORDER of events matter?",
        topic: "Causes of Unrest - Escalation",
        rubric: [
            "Identifies the TIME SPAN (12 years from 1763-1775)",
            "Explains that multiple events built up over time",
            "Uses the word 'escalation' or describes how conflicts got worse",
            "Gives at least 2-3 specific examples of events",
            "Explains that peaceful solutions failed"
        ],
        exemplar: "Over those 12 years, the colonists tried many peaceful ways to solve problems with Britain, but each time Britain responded with harsher punishments. After the Stamp Act protests, Britain sent more troops. After the Boston Tea Party, they passed the Intolerable Acts. Each event made colonists angrier and more convinced that Britain wouldn't listen to them. The order matters because it shows escalation - how small conflicts built into bigger ones when neither side would compromise. By 1775 at Lexington and Concord, colonists felt they had no choice but to fight back because twelve years of petitions, boycotts, and peaceful protests had failed.",
        sentenceStarters: [
            "Over 12 years, colonists...",
            "Each event made things worse because...",
            "The order matters because it shows...",
            "By 1775, colonists felt..."
        ]
    },
    {
        question: "The Slavery Debate in 1776: Explain the 'impossible choice' that John Adams and Benjamin Franklin faced. What did Jefferson originally write? Who objected? What was removed and why?",
        topic: "1776 Musical",
        rubric: [
            "States what Jefferson ORIGINALLY wrote (anti-slavery language)",
            "Names who objected (Edward Rutledge or South Carolina)",
            "Explains WHY they objected (economy, slavery was their 'way of life')",
            "Describes the 'impossible choice' clearly",
            "Explains what was removed",
            "Shows understanding this wasn't because Adams/Franklin supported slavery"
        ],
        exemplar: "Jefferson originally wrote language in the Declaration blaming King George for the slave trade and condemning slavery. Edward Rutledge from South Carolina objected because slavery was central to the Southern economy and their entire way of life. The impossible choice was this: keep the anti-slavery language and lose Southern support for independence, or remove it to keep all 13 colonies united. Adams and Franklin chose to remove the anti-slavery language because they believed that without all colonies united, they couldn't win independence at all. This meant slavery would continue in America even though the Declaration said 'all men are created equal.'",
        sentenceStarters: [
            "Jefferson originally wrote...",
            "South Carolina objected because...",
            "The impossible choice was...",
            "Adams and Franklin removed it because...",
            "This meant that..."
        ]
    },
    {
        question: "Multiple Perspectives: Choose ONE group (enslaved people, Native Americans, women, or wealthy colonists). Explain why their perspective on independence was different from the 'standard' Patriot narrative.",
        topic: "Uncovering Loyalties",
        rubric: [
            "Chooses ONE specific group clearly",
            "Explains how their IDENTITY shaped their perspective",
            "Gives specific reasons why their viewpoint differed",
            "Uses examples from the activities",
            "Shows understanding that different groups had different concerns",
            "4-5 complete sentences"
        ],
        exemplar: "Enslaved people had a very different perspective on independence than white Patriots. While Patriots fought for 'liberty' from British 'tyranny,' enslaved people had no liberty at all and many of their oppressors were the same people declaring independence. Some enslaved people actually sided with the British because Lord Dunmore's Proclamation promised freedom to any enslaved person who joined British forces. From their perspective, the Revolution's talk of freedom was hypocritical since the Declaration said 'all men are created equal' but didn't include them. Their main concern was escaping slavery, not whether Britain or colonists controlled the government.",
        sentenceStarters: [
            "[Group] had a different perspective because...",
            "While Patriots wanted...",
            "From their perspective...",
            "Their main concern was...",
            "They might have sided with..."
        ]
    },
    {
        question: "Unalienable Rights vs. Reality: The Declaration states 'all men are created equal' with rights to 'life, liberty, and the pursuit of happiness.' Whose rights were protected in 1776? Whose rights were ignored? Give specific examples.",
        topic: "Declaration of Independence",
        rubric: [
            "Identifies whose rights WERE protected (white men, property owners)",
            "Names at least 2-3 groups whose rights were NOT protected",
            "Gives specific examples of how they were excluded",
            "Explains the CONTRADICTION between ideals and reality",
            "Uses vocabulary from the Declaration",
            "4-5 complete sentences"
        ],
        exemplar: "In 1776, the Declaration's rights were really only protected for white men who owned property. They could vote, own land, participate in government, and make decisions for the new nation. However, the rights were completely ignored for several groups. Enslaved people had no liberty at all and were considered property, not people with rights. Women couldn't vote, hold office, or own property independently because of coverture laws. Native Americans were excluded and even called 'savages' in the Declaration, with their land rights completely ignored. The contradiction is huge - Jefferson wrote 'all men are created equal' while he himself enslaved people, showing that 'unalienable rights' were actually very alienable depending on your race and gender.",
        sentenceStarters: [
            "The Declaration's rights protected...",
            "However, these groups were excluded:...",
            "For example, enslaved people...",
            "Women could not...",
            "This shows that..."
        ]
    }
];

let revealedStartersCount = 0;

export function loadShortAnswers() {
    state.currentShortAnswerIndex = 0;
    revealedStartersCount = 0;
    loadShortAnswerQuestion();
}

export function loadShortAnswerQuestion() {
    if (state.currentShortAnswerIndex >= shortAnswerQuestions.length) {
        document.getElementById('shortAnswerContainer').innerHTML = `
            <div class="alert success">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>All Questions Complete!</strong> You've practiced all 5 short answer questions. Review your responses or start over to practice again!
                </div>
            </div>
        `;
        updateShortAnswerProgress();
        return;
    }

    const question = shortAnswerQuestions[state.currentShortAnswerIndex];
    const savedResponse = state.shortAnswerResponses[state.currentShortAnswerIndex] || '';

    let questionHTML = `
        <div class="question-card">
            <h3>Question ${state.currentShortAnswerIndex + 1} of ${shortAnswerQuestions.length}</h3>
            <p style="margin: 15px 0; font-size: 1.1em; line-height: 1.6;"><strong>${question.question}</strong></p>
            <p style="color: #666; margin-bottom: 15px;"><strong>Topic:</strong> ${question.topic}</p>

            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #ffc107;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong><i class="fas fa-hands-helping"></i> Need help getting started?</strong>
                    <button class="btn btn-secondary" onclick="window.revealNextStarter()" id="starterBtn" style="padding: 5px 15px;">
                        <i class="fas fa-lightbulb"></i> Show Sentence Starter
                    </button>
                </div>
                <div id="sentenceStarters" style="margin-top: 10px; display: none;">
                    <ul style="margin: 10px 0 0 20px;" id="startersList">
                        <!-- Starters will be revealed one at a time -->
                    </ul>
                </div>
            </div>

            <div style="margin: 20px 0;">
                <label for="shortAnswerText" style="display: block; margin-bottom: 10px; font-weight: 600;">Write your answer (4-5 sentences):</label>
                <textarea
                    id="shortAnswerText"
                    name="shortAnswerText"
                    aria-label="Write your short answer here"
                    style="width: 100%; min-height: 200px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1em; font-family: inherit; line-height: 1.6;"
                    placeholder="Start typing your answer here... Try writing on your own first before revealing sentence starters!"
                >${savedResponse}</textarea>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <button class="btn btn-primary" onclick="window.revealExemplar()"><i class="fas fa-eye"></i> Show Example Answer & Rubric</button>
                <p style="margin-top: 10px; color: #666; font-size: 0.85em;">
                    <i class="fas fa-lightbulb"></i> Try writing your own answer first for the best learning!
                </p>
            </div>

            <div id="answer-warning" style="display: none;"></div>

            <div id="exemplar-section" style="display: none;">
                <div style="background: #d1fae5; padding: 20px; border-radius: 10px; border-left: 5px solid #10b981; margin: 20px 0;">
                    <h4 style="color: #065f46; margin-bottom: 10px;"><i class="fas fa-star"></i> Example Answer (What a good response looks like):</h4>
                    <p style="line-height: 1.8;">${question.exemplar}</p>
                </div>

                <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 5px solid #ffc107; margin: 20px 0;">
                    <h4 style="color: #856404; margin-bottom: 10px;"><i class="fas fa-clipboard-check"></i> Self-Assessment Checklist:</h4>
                    <p style="margin-bottom: 10px;">Compare your answer to this checklist. Did you:</p>
                    <ul style="margin-left: 20px;">
                        ${question.rubric.map(item => `<li style="margin: 8px 0;"><label><input type="checkbox"> ${item}</label></li>`).join('')}
                    </ul>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <button class="btn btn-secondary" onclick="window.reviseAnswer()"><i class="fas fa-edit"></i> Revise My Answer</button>
                    <button class="btn btn-primary" onclick="window.nextShortAnswer()"><i class="fas fa-arrow-right"></i> Next Question</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('shortAnswerContainer').innerHTML = questionHTML;
    updateShortAnswerProgress();
}

export function revealNextStarter() {
    const question = shortAnswerQuestions[state.currentShortAnswerIndex];
    const startersDiv = document.getElementById('sentenceStarters');
    const startersList = document.getElementById('startersList');
    const starterBtn = document.getElementById('starterBtn');

    startersDiv.style.display = 'block';

    if (revealedStartersCount < question.sentenceStarters.length) {
        const starter = question.sentenceStarters[revealedStartersCount];
        const li = document.createElement('li');
        li.textContent = starter;
        li.style.marginBottom = '8px';
        li.style.animation = 'fadeIn 0.5s';
        startersList.appendChild(li);

        revealedStartersCount++;

        if (revealedStartersCount >= question.sentenceStarters.length) {
            starterBtn.innerHTML = '<i class="fas fa-check"></i> All Starters Shown';
            starterBtn.disabled = true;
        }
    }
}

export function revealExemplar() {
    // Save current response
    const response = document.getElementById('shortAnswerText').value;
    state.shortAnswerResponses[state.currentShortAnswerIndex] = response;
    saveShortAnswerResponses(state.shortAnswerResponses);

    // Check if they had a substantial attempt (more than 20 characters)
    const hadSubstantialAttempt = response.trim().length > 20;

    // Show warning if they haven't tried much
    const warningDiv = document.getElementById('answer-warning');
    if (!hadSubstantialAttempt) {
        warningDiv.innerHTML = `
            <div class="alert info" style="margin: 20px 0;">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Challenge yourself first!</strong> You'll learn more if you try writing your own answer before viewing the example. Once you view the answer, you won't be able to revise your response.
                </div>
            </div>
        `;
        warningDiv.style.display = 'block';
    }

    // Show exemplar section
    document.getElementById('exemplar-section').style.display = 'block';

    // Make textarea read-only
    const textarea = document.getElementById('shortAnswerText');
    textarea.readOnly = true;
    textarea.style.background = '#f8f9fa';
    textarea.style.cursor = 'not-allowed';

    // Scroll to exemplar
    document.getElementById('exemplar-section').scrollIntoView({ behavior: 'smooth' });
}

export function reviseAnswer() {
    // Re-enable the textarea for revisions
    const textarea = document.getElementById('shortAnswerText');
    textarea.readOnly = false;
    textarea.style.background = 'white';
    textarea.style.cursor = 'text';

    // Hide exemplar and let them revise
    document.getElementById('exemplar-section').style.display = 'none';
    textarea.focus();

    // Scroll back to text area
    textarea.scrollIntoView({ behavior: 'smooth' });
}

export function nextShortAnswer() {
    // Save current response
    const response = document.getElementById('shortAnswerText').value;
    state.shortAnswerResponses[state.currentShortAnswerIndex] = response;
    saveShortAnswerResponses(state.shortAnswerResponses);

    // Reset starter count for next question
    revealedStartersCount = 0;

    // Move to next question
    state.currentShortAnswerIndex++;
    loadShortAnswerQuestion();
}

export function updateShortAnswerProgress() {
    const percent = ((state.currentShortAnswerIndex) / shortAnswerQuestions.length * 100).toFixed(0);
    const progressEl = document.getElementById('shortAnswerProgress');
    const progressBarEl = document.getElementById('shortAnswerProgressBar');
    if (progressEl) {
        progressEl.textContent = `Question ${state.currentShortAnswerIndex + 1} of ${shortAnswerQuestions.length}`;
    }
    if (progressBarEl) {
        progressBarEl.style.width = `${percent}%`;
    }
}

// ==================== FOCUSED MODE FUNCTIONS ====================

export function loadFocusedMode() {
    // Analyze weak areas
    const unknownVocab = vocabulary.filter(v => !state.vocabProgress.includes(v.term));
    const incorrectQuestions = Object.entries(state.practiceProgress)
        .filter(([qId, correct]) => !correct)
        .map(([qId]) => questions[parseInt(qId)]);

    // Get topics where performance is poor
    const topicPerformance = {};
    questions.forEach((q, qIndex) => {
        if (!topicPerformance[q.topic]) {
            topicPerformance[q.topic] = { correct: 0, total: 0 };
        }
        if (state.practiceProgress[qIndex] !== undefined) {
            topicPerformance[q.topic].total++;
            if (state.practiceProgress[qIndex]) {
                topicPerformance[q.topic].correct++;
            }
        }
    });

    const weakTopics = Object.entries(topicPerformance)
        .filter(([topic, perf]) => perf.total > 0 && (perf.correct / perf.total) < 0.7)
        .map(([topic]) => topic);

    // Generate analysis
    let analysisHTML = '<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">';
    analysisHTML += '<h3 style="margin-bottom: 15px; color: #667eea;"><i class="fas fa-chart-bar"></i> Your Weak Areas:</h3>';

    if (unknownVocab.length > 0) {
        analysisHTML += `
            <div style="margin: 15px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px;">
                <strong><i class="fas fa-book"></i> Vocabulary:</strong> ${unknownVocab.length} terms to master
                <div style="margin-top: 8px; font-size: 0.9em;">
                    ${unknownVocab.slice(0, 5).map(v => v.term).join(', ')}${unknownVocab.length > 5 ? ` and ${unknownVocab.length - 5} more...` : ''}
                </div>
            </div>
        `;
    }

    if (weakTopics.length > 0) {
        analysisHTML += `
            <div style="margin: 15px 0; padding: 15px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px;">
                <strong><i class="fas fa-exclamation-triangle"></i> Topics needing practice:</strong>
                <div style="margin-top: 8px;">
                    ${weakTopics.map(topic => {
                        const perf = topicPerformance[topic];
                        const percent = (perf.correct / perf.total * 100).toFixed(0);
                        return `<div style="margin: 5px 0;">${topic}: ${percent}% (${perf.correct}/${perf.total})</div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    if (unknownVocab.length === 0 && weakTopics.length === 0) {
        analysisHTML += `
            <div style="margin: 15px 0; padding: 15px; background: #d1fae5; border-left: 4px solid #10b981; border-radius: 8px;">
                <strong><i class="fas fa-star"></i> Great job!</strong> You're doing well across all areas. Consider taking a practice test to verify your knowledge.
            </div>
        `;
    }

    analysisHTML += '</div>';

    document.getElementById('focusedAnalysis').innerHTML = analysisHTML;
}

export function startFocusedSession() {
    // Gather weak vocabulary
    state.focusedVocab = vocabulary.filter(v => !state.vocabProgress.includes(v.term));

    // Gather questions from weak topics
    const topicPerformance = {};
    questions.forEach((q, qIndex) => {
        if (!topicPerformance[q.topic]) {
            topicPerformance[q.topic] = { correct: 0, total: 0, questions: [] };
        }
        if (state.practiceProgress[qIndex] !== undefined) {
            topicPerformance[q.topic].total++;
            if (state.practiceProgress[qIndex]) {
                topicPerformance[q.topic].correct++;
            }
        }
        topicPerformance[q.topic].questions.push({ question: q, index: qIndex });
    });

    const weakTopics = Object.entries(topicPerformance)
        .filter(([topic, perf]) => perf.total > 0 && (perf.correct / perf.total) < 0.7)
        .map(([topic]) => topic);

    state.focusedQuestions = [];
    weakTopics.forEach(topic => {
        const topicQuestions = topicPerformance[topic].questions
            .filter(q => state.practiceProgress[q.index] === false || state.practiceProgress[q.index] === undefined)
            .slice(0, 3);
        state.focusedQuestions.push(...topicQuestions);
    });

    // Shuffle both arrays
    state.focusedVocab.sort(() => Math.random() - 0.5);
    state.focusedQuestions.sort(() => Math.random() - 0.5);

    // Limit to reasonable size
    state.focusedVocab = state.focusedVocab.slice(0, 10);
    state.focusedQuestions = state.focusedQuestions.slice(0, 10);

    if (state.focusedVocab.length === 0 && state.focusedQuestions.length === 0) {
        alert('Great work! You have no weak areas to focus on. Try taking a full practice test!');
        return;
    }

    state.focusedIndex = 0;
    state.focusedType = state.focusedVocab.length > 0 ? 'vocab' : 'question';

    document.getElementById('focusedAnalysis').style.display = 'none';
    document.querySelector('#focused .btn-primary').style.display = 'none';

    showNextFocusedItem();
}

export function showNextFocusedItem() {
    // Alternate between vocab and questions
    let contentHTML = '<div class="progress-bar" style="margin-bottom: 30px;">';
    const totalItems = state.focusedVocab.length + state.focusedQuestions.length;
    const progress = ((state.focusedIndex) / totalItems * 100).toFixed(0);
    contentHTML += `<div class="progress-fill" style="width: ${progress}%"></div>`;
    contentHTML += `<div class="progress-text">${state.focusedIndex}/${totalItems} completed (${progress}%)</div>`;
    contentHTML += '</div>';

    if (state.focusedIndex >= totalItems) {
        // Session complete
        contentHTML += `
            <div class="alert success">
                <i class="fas fa-trophy"></i>
                <div>
                    <h2 style="margin-bottom: 10px;">Focused Session Complete!</h2>
                    <p>You've practiced ${totalItems - state.focusedQuestions.length} vocabulary terms and ${totalItems - state.focusedVocab.length} questions from your weak areas.</p>
                    <button class="btn btn-primary" onclick="window.showSection('home')" style="margin-top: 15px;">
                        Back to Home
                    </button>
                    <button class="btn btn-secondary" onclick="window.startFocusedSession()" style="margin-top: 15px;">
                        Start Another Session
                    </button>
                </div>
            </div>
        `;
        document.getElementById('focusedContent').innerHTML = contentHTML;
        checkBadges();
        return;
    }

    // Show vocab or question
    if (state.focusedType === 'vocab' && state.focusedVocab.length > 0) {
        const vocab = state.focusedVocab.shift();
        contentHTML += `
            <div class="flashcard" id="focusedCard" style="cursor: pointer; position: relative;">
                <div class="card-front">
                    <h3>${vocab.term}</h3>
                    <p style="margin-top: 10px; opacity: 0.8;">(${vocab.category})</p>
                    <p style="margin-top: 15px; font-size: 0.9em; color: rgba(255,255,255,0.8);">Click to see definition</p>
                </div>
            </div>
            <div id="vocabDefinition" style="display: none; background: white; padding: 25px; border-radius: 15px; margin-top: 20px; border: 2px solid #667eea;">
                <p style="margin: 10px 0; color: #333;"><strong>Definition:</strong> ${vocab.definition}</p>
                <p style="margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; color: #333;"><strong>Example:</strong> ${vocab.example}</p>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="window.markFocusedKnown('${vocab.term.replace(/'/g, "\\'")}')">
                        <i class="fas fa-check"></i> I Know This Now
                    </button>
                    <button class="btn btn-secondary" onclick="window.nextFocusedItem()">
                        Skip <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        state.focusedType = 'question';

        // Set up after DOM updates
        setTimeout(() => {
            const card = document.getElementById('focusedCard');
            if (card) {
                card.addEventListener('click', function() {
                    document.getElementById('vocabDefinition').style.display = 'block';
                });
            }
        }, 0);
    } else if (state.focusedQuestions.length > 0) {
        const qData = state.focusedQuestions.shift();
        const question = qData.question;
        contentHTML += `
            <div class="question-card">
                <h3>Question from ${question.topic}</h3>
                <p style="margin: 15px 0; font-size: 1.1em;"><strong>${question.question}</strong></p>
                <div class="options">
        `;

        question.options.forEach((option, index) => {
            contentHTML += `
                <div class="option" onclick="window.selectFocusedOption(${index}, ${question.correct})" id="focused-opt-${index}">
                    <strong>${String.fromCharCode(65 + index)}.</strong> ${option}
                </div>
            `;
        });

        contentHTML += `
                </div>
                <div id="focused-feedback" class="feedback"></div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-primary" id="focused-next-btn" onclick="window.nextFocusedItem()" style="display: none;">
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        state.focusedType = 'vocab';
    }

    document.getElementById('focusedContent').innerHTML = contentHTML;
}

export function selectFocusedOption(optionIndex, correctIndex) {
    state.selectedFocusedOption = optionIndex;
    const isCorrect = optionIndex === correctIndex;

    // Visual feedback
    document.querySelectorAll('#focusedContent .option').forEach((opt, index) => {
        opt.style.pointerEvents = 'none';
        if (index === correctIndex) {
            opt.classList.add('correct');
        } else if (index === optionIndex && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });

    // Show feedback
    const feedback = document.getElementById('focused-feedback');
    feedback.className = `feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `
        <h4>${isCorrect ? '<i class="fas fa-check-circle"></i> Correct!' : '<i class="fas fa-times-circle"></i> Not quite'}</h4>
        <p>Keep practicing this topic!</p>
    `;

    document.getElementById('focused-next-btn').style.display = 'inline-block';
}

export function markFocusedKnown(term) {
    if (!state.vocabProgress.includes(term)) {
        state.vocabProgress.push(term);
        saveVocabProgress(state.vocabProgress);
        checkBadges();
    }
    nextFocusedItem();
}

export function nextFocusedItem() {
    state.focusedIndex++;
    showNextFocusedItem();
}

// ==================== TIMELINE FUNCTIONS ====================
// TODO: Extract these from index.html to a separate timeline.js module
// Functions needed: loadTimeline, renderTimeline, handleDragStart, handleDragEnd,
// handleDragOver, handleDragLeave, handleDrop, removeFromSlot, setTimelineMode,
// checkTimelineAnswer, showTimelineAnswer, resetTimeline, updateTimelineStats, showConfetti

export function loadTimeline() {
    // Placeholder - needs to be extracted from index.html
    console.log('loadTimeline - TODO: extract from index.html');
}

// ==================== PRINT GUIDE FUNCTIONS ====================

/**
 * Load and render the print study guide
 * Shows vocabulary terms with known/unknown status indicators
 */
export function loadPrintGuide() {
    updatePrintGuide();
}

/**
 * Update print guide content based on selected category
 */
export function updatePrintGuide() {
    const category = document.getElementById('printCategory')?.value || 'all';
    const container = document.getElementById('printGuideContent');

    if (!container) {
        console.error('Print guide container not found');
        return;
    }

    const vocabProgress = state?.vocabProgress || [];

    // Filter vocabulary by category
    let filteredVocab = vocabulary;
    if (category !== 'all') {
        filteredVocab = vocabulary.filter(v => v.category === category);
    }

    let html = '<div class="print-guide-content">';

    // Group by category
    const categories = {};
    filteredVocab.forEach(term => {
        if (!categories[term.category]) {
            categories[term.category] = [];
        }
        categories[term.category].push(term);
    });

    // Render each category
    Object.entries(categories).forEach(([cat, terms]) => {
        html += `
            <div class="print-category" style="margin-bottom: 30px; page-break-inside: avoid;">
                <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px;">
                    ${cat}
                </h3>
        `;

        terms.forEach(term => {
            const isKnown = vocabProgress.includes(term.term);
            const statusBadge = isKnown
                ? '<span class="mastery-badge high" style="margin-left: 10px;"><i class="fas fa-check"></i> Known</span>'
                : '<span class="mastery-badge low" style="margin-left: 10px;"><i class="fas fa-question"></i> Unknown</span>';

            html += `
                <div class="vocab-item" style="margin-bottom: 20px; padding: 15px; background: ${isKnown ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${isKnown ? '#10b981' : '#ef4444'}; border-radius: 8px; page-break-inside: avoid;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333; flex: 1;">${term.term}</h4>
                        ${statusBadge}
                    </div>
                    <p style="margin: 10px 0; color: #555; line-height: 1.6;"><strong>Definition:</strong> ${term.definition}</p>
                    <p style="margin: 10px 0; color: #666; font-style: italic; line-height: 1.6;"><strong>Example:</strong> ${term.example}</p>
                </div>
            `;
        });

        html += '</div>';
    });

    // Summary stats
    const totalTerms = filteredVocab.length;
    const knownTerms = filteredVocab.filter(v => vocabProgress.includes(v.term)).length;
    const unknownTerms = totalTerms - knownTerms;

    html += `
        <div class="print-summary" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px; page-break-inside: avoid;">
            <h3 style="color: #667eea; margin-bottom: 15px;">Progress Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #667eea;">${totalTerms}</div>
                    <div style="color: #666;">Total Terms</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #10b981;">${knownTerms}</div>
                    <div style="color: #666;">Known</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #ef4444;">${unknownTerms}</div>
                    <div style="color: #666;">Need Practice</div>
                </div>
            </div>
        </div>
    `;

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Mark all terms for printing (select all)
 */
export function markAllForPrint() {
    const category = document.getElementById('printCategory')?.value || 'all';

    // Filter vocabulary by category
    let filteredVocab = vocabulary;
    if (category !== 'all') {
        filteredVocab = vocabulary.filter(v => v.category === category);
    }

    alert(`✅ Displaying all ${filteredVocab.length} terms from ${category === 'all' ? 'all categories' : category}.\n\nClick "Print Study Guide" to print!`);
    updatePrintGuide();
}

/**
 * Mark only unknown terms for printing
 */
export function markUnknownForPrint() {
    const category = document.getElementById('printCategory')?.value || 'all';
    const vocabProgress = state?.vocabProgress || [];

    // Filter vocabulary by category
    let filteredVocab = vocabulary;
    if (category !== 'all') {
        filteredVocab = vocabulary.filter(v => v.category === category);
    }

    const unknownTerms = filteredVocab.filter(v => !vocabProgress.includes(v.term));

    if (unknownTerms.length === 0) {
        alert('🎉 Great job! You know all the terms in this category!\n\nNo unknown terms to display.');
        return;
    }

    // Create a custom filtered view showing only unknown terms
    const container = document.getElementById('printGuideContent');
    if (!container) return;

    let html = `
        <div class="alert info" style="margin-bottom: 20px;">
            <i class="fas fa-info-circle"></i>
            <div>
                <strong>Showing Unknown Terms Only:</strong> These are the ${unknownTerms.length} terms you haven't marked as known yet. Focus on these for maximum study efficiency!
            </div>
        </div>
    `;

    // Group unknown terms by category
    const categories = {};
    unknownTerms.forEach(term => {
        if (!categories[term.category]) {
            categories[term.category] = [];
        }
        categories[term.category].push(term);
    });

    // Render each category
    Object.entries(categories).forEach(([cat, terms]) => {
        html += `
            <div class="print-category" style="margin-bottom: 30px; page-break-inside: avoid;">
                <h3 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> ${cat} - Need Practice
                </h3>
        `;

        terms.forEach(term => {
            html += `
                <div class="vocab-item" style="margin-bottom: 20px; padding: 15px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; page-break-inside: avoid;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333; flex: 1;">${term.term}</h4>
                        <span class="mastery-badge low"><i class="fas fa-question"></i> Unknown</span>
                    </div>
                    <p style="margin: 10px 0; color: #555; line-height: 1.6;"><strong>Definition:</strong> ${term.definition}</p>
                    <p style="margin: 10px 0; color: #666; font-style: italic; line-height: 1.6;"><strong>Example:</strong> ${term.example}</p>
                </div>
            `;
        });

        html += '</div>';
    });

    container.innerHTML = html;
    alert(`📝 Now showing ${unknownTerms.length} unknown terms.\n\nThese are the terms you should focus on!\n\nClick "Print Study Guide" to print.`);
}

// ==================== ANALYTICS DASHBOARD ====================

/**
 * Load and render the analytics dashboard
 * Shows study patterns, question difficulty, topic performance, engagement, progress velocity, and test trends
 */
export function loadAnalyticsDashboard() {
    const dashboard = getAnalyticsDashboard();
    const container = document.getElementById('analyticsContent');

    if (!container) {
        console.error('Analytics container not found');
        return;
    }

    let html = '';

    // ==================== STUDY PATTERNS SECTION ====================
    html += '<h3 style="margin-top: 20px;"><i class="fas fa-clock"></i> Study Patterns</h3>';

    if (dashboard.studyPatterns.totalSessions === 0) {
        html += `
            <div class="alert info">
                <i class="fas fa-info-circle"></i>
                <div>No study sessions tracked yet. Start studying to see your patterns!</div>
            </div>
        `;
    } else {
        const patterns = dashboard.studyPatterns;
        const avgMinutes = Math.floor(patterns.averageDuration / 60000);
        const avgSeconds = Math.floor((patterns.averageDuration % 60000) / 1000);
        const totalMinutes = Math.floor(patterns.totalTime / 60000);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        html += '<div class="stats-grid">';
        html += `
            <div class="stat-card">
                <div class="number">${patterns.totalSessions}</div>
                <div class="label">Total Sessions</div>
            </div>
            <div class="stat-card">
                <div class="number">${avgMinutes}m ${avgSeconds}s</div>
                <div class="label">Average Duration</div>
            </div>
            <div class="stat-card">
                <div class="number">${totalHours}h ${remainingMinutes}m</div>
                <div class="label">Total Study Time</div>
            </div>
        `;
        html += '</div>';

        // Time of day distribution
        if (Object.keys(patterns.timeOfDayDistribution).length > 0) {
            html += '<div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">';
            html += '<h4 style="margin-bottom: 15px; color: #667eea;"><i class="fas fa-sun"></i> When You Study Most</h4>';
            html += '<div class="stats-grid">';

            const timeLabels = {
                morning: { icon: '🌅', label: 'Morning (6am-12pm)' },
                afternoon: { icon: '☀️', label: 'Afternoon (12pm-6pm)' },
                evening: { icon: '🌆', label: 'Evening (6pm-10pm)' },
                night: { icon: '🌙', label: 'Night (10pm-6am)' }
            };

            Object.entries(patterns.timeOfDayDistribution).forEach(([timeOfDay, count]) => {
                const timeInfo = timeLabels[timeOfDay] || { icon: '⏰', label: timeOfDay };
                const percentage = ((count / patterns.totalSessions) * 100).toFixed(0);
                html += `
                    <div class="stat-card">
                        <div class="number">${timeInfo.icon} ${count}</div>
                        <div class="label">${timeInfo.label}<br>(${percentage}%)</div>
                    </div>
                `;
            });

            html += '</div></div>';
        }
    }

    // ==================== QUESTION DIFFICULTY SECTION ====================
    html += '<h3 style="margin-top: 30px;"><i class="fas fa-exclamation-triangle"></i> Most Challenging Questions</h3>';

    if (dashboard.questionDifficulty.length === 0) {
        html += `
            <div class="alert info">
                <i class="fas fa-info-circle"></i>
                <div>No question data yet. Try some practice questions to see which ones are most challenging!</div>
            </div>
        `;
    } else {
        html += '<div class="weakness-list">';
        html += '<p style="margin-bottom: 15px;">These are the questions you\'ve gotten wrong most often. Focus on understanding these!</p>';

        dashboard.questionDifficulty.forEach((q, index) => {
            // Get the actual question text from the questions array
            const question = questions[q.questionId];
            if (question) {
                html += `
                    <div class="weakness-item">
                        <div>
                            <strong>Question ${q.questionId + 1}:</strong> ${question.question}<br>
                            <small style="color: #666;">Topic: ${question.topic}</small><br>
                            <small style="color: #ef4444;">
                                <strong>Wrong ${q.wrongRate}% of the time</strong> (${q.incorrect} wrong out of ${q.attempts} attempts)
                            </small>
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
    }

    // ==================== TOPIC PERFORMANCE SECTION ====================
    html += '<h3 style="margin-top: 30px;"><i class="fas fa-trophy"></i> Topic Performance</h3>';

    if (dashboard.topicPerformance.length === 0) {
        html += `
            <div class="alert info">
                <i class="fas fa-info-circle"></i>
                <div>No topic data yet. Answer practice questions to see your performance by topic!</div>
            </div>
        `;
    } else {
        html += '<div class="strength-list">';
        html += '<p style="margin-bottom: 15px;">Your success rate by topic/category:</p>';

        dashboard.topicPerformance.forEach(topic => {
            const badgeClass = topic.successRate >= 80 ? 'high' : topic.successRate >= 60 ? 'medium' : 'low';
            html += `
                <div class="weakness-item">
                    ${topic.category}
                    <span class="mastery-badge ${badgeClass}">
                        ${topic.successRate}% (${topic.correct}/${topic.attempts})
                    </span>
                </div>
            `;
        });

        html += '</div>';
    }

    // ==================== ENGAGEMENT METRICS SECTION ====================
    html += '<h3 style="margin-top: 30px;"><i class="fas fa-chart-pie"></i> Feature Usage</h3>';

    if (dashboard.engagementMetrics.totalVisits === 0) {
        html += `
            <div class="alert info">
                <i class="fas fa-info-circle"></i>
                <div>No feature usage data yet. Explore different sections to see your engagement patterns!</div>
            </div>
        `;
    } else {
        const metrics = dashboard.engagementMetrics;
        html += '<div style="margin: 20px 0;">';

        const featureLabels = {
            vocab: { icon: '📚', label: 'Vocabulary' },
            practice: { icon: '✍️', label: 'Practice Questions' },
            test: { icon: '📝', label: 'Practice Tests' },
            timeline: { icon: '📅', label: 'Timeline Challenge' },
            shortanswer: { icon: '💭', label: 'Short Answer' },
            focused: { icon: '🎯', label: 'Focused Mode' }
        };

        metrics.features.forEach(feature => {
            const featureInfo = featureLabels[feature.feature] || { icon: '📊', label: feature.feature };
            const avgMinutes = Math.floor(feature.avgTimePerVisit / 60000);
            const avgSeconds = Math.floor((feature.avgTimePerVisit % 60000) / 1000);
            const totalMinutes = Math.floor(feature.totalTime / 60000);

            html += `
                <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px;">
                    <strong>${featureInfo.icon} ${featureInfo.label}</strong><br>
                    <div style="margin-top: 8px; font-size: 0.9em; color: #666;">
                        <i class="fas fa-eye"></i> ${feature.visits} visits (${feature.visitPercentage}% of total) |
                        <i class="fas fa-clock"></i> ${totalMinutes}m total (${feature.timePercentage}% of time) |
                        <i class="fas fa-tachometer-alt"></i> ${avgMinutes}m ${avgSeconds}s per visit
                    </div>
                </div>
            `;
        });

        html += '</div>';
    }

    // ==================== PROGRESS VELOCITY SECTION ====================
    html += '<h3 style="margin-top: 30px;"><i class="fas fa-tachometer-alt"></i> Progress Velocity</h3>';

    const velocity = dashboard.progressVelocity;

    if (velocity.totalVocabMastered === 0 && velocity.totalQuestionsAttempted === 0) {
        html += `
            <div class="alert info">
                <i class="fas fa-info-circle"></i>
                <div>No progress data yet. Start learning vocabulary and practicing questions to track your velocity!</div>
            </div>
        `;
    } else {
        html += '<div class="stats-grid">';

        if (velocity.totalVocabMastered > 0) {
            html += `
                <div class="stat-card">
                    <div class="number">${velocity.totalVocabMastered}</div>
                    <div class="label">Vocab Terms Mastered</div>
                </div>
            `;
        }

        if (velocity.totalQuestionsAttempted > 0) {
            html += `
                <div class="stat-card">
                    <div class="number">${velocity.totalQuestionsAttempted}</div>
                    <div class="label">Questions Attempted</div>
                </div>
                <div class="stat-card">
                    <div class="number">${velocity.avgAttemptsPerQuestion}</div>
                    <div class="label">Avg Attempts per Question</div>
                </div>
            `;
        }

        html += '</div>';

        if (velocity.avgAttemptsPerQuestion < 1.5) {
            html += `
                <div class="alert success" style="margin-top: 15px;">
                    <i class="fas fa-star"></i>
                    <div>Amazing! You're getting most questions right on the first try!</div>
                </div>
            `;
        } else if (velocity.avgAttemptsPerQuestion < 2.5) {
            html += `
                <div class="alert info" style="margin-top: 15px;">
                    <i class="fas fa-thumbs-up"></i>
                    <div>Good progress! You're learning from your mistakes.</div>
                </div>
            `;
        }
    }

    // ==================== TEST TRENDS SECTION ====================
    html += '<h3 style="margin-top: 30px;"><i class="fas fa-chart-line"></i> Test Performance Trends</h3>';

    const trends = dashboard.testTrends;

    if (trends.totalTests === 0) {
        html += `
            <div class="alert info">
                <i class="fas fa-info-circle"></i>
                <div>No test data yet. Take a practice test to start tracking your progress!</div>
            </div>
        `;
    } else {
        html += '<div class="stats-grid">';
        html += `
            <div class="stat-card">
                <div class="number">${trends.totalTests}</div>
                <div class="label">Total Tests Taken</div>
            </div>
            <div class="stat-card">
                <div class="number">${trends.averageScore}%</div>
                <div class="label">Average Score</div>
            </div>
            <div class="stat-card">
                <div class="number">${trends.highestScore}%</div>
                <div class="label">Highest Score</div>
            </div>
        `;

        if (trends.improvement !== 0 && trends.totalTests >= 6) {
            const improvementColor = trends.improvement > 0 ? '#10b981' : '#ef4444';
            const improvementIcon = trends.improvement > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            html += `
                <div class="stat-card" style="border-left: 4px solid ${improvementColor};">
                    <div class="number" style="color: ${improvementColor};">
                        <i class="fas ${improvementIcon}"></i> ${Math.abs(trends.improvement)}%
                    </div>
                    <div class="label">Score Change<br>(first 3 vs last 3 tests)</div>
                </div>
            `;
        }

        html += '</div>';

        // Show improvement message
        if (trends.improvement > 10) {
            html += `
                <div class="alert success" style="margin-top: 15px;">
                    <i class="fas fa-trophy"></i>
                    <div>
                        <strong>Great improvement!</strong> Your scores have increased by ${trends.improvement}% from your first tests to your most recent ones. Keep it up!
                    </div>
                </div>
            `;
        } else if (trends.improvement < -10) {
            html += `
                <div class="alert info" style="margin-top: 15px;">
                    <i class="fas fa-book-open"></i>
                    <div>
                        <strong>More practice needed.</strong> Your recent scores are lower than earlier ones. Review your weak areas and try focused practice!
                    </div>
                </div>
            `;
        }

        // Recent test history
        if (trends.recentTests.length > 0) {
            html += '<div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">';
            html += '<h4 style="margin-bottom: 15px; color: #667eea;"><i class="fas fa-history"></i> Recent Test Results</h4>';

            trends.recentTests.forEach((test, index) => {
                const date = new Date(test.date).toLocaleDateString();
                const scoreColor = test.score >= 80 ? '#10b981' : test.score >= 60 ? '#fbbf24' : '#ef4444';

                html += `
                    <div style="margin: 10px 0; padding: 12px; background: white; border-left: 4px solid ${scoreColor}; border-radius: 8px;">
                        <strong>Test ${trends.totalTests - index}</strong> - ${date}<br>
                        <span style="color: ${scoreColor}; font-size: 1.2em; font-weight: bold;">${test.score}%</span>
                        <span style="color: #666; font-size: 0.9em;"> (${test.correct}/${test.totalQuestions} correct)</span>
                    </div>
                `;
            });

            html += '</div>';
        }
    }

    // Set the HTML
    container.innerHTML = html;
}

// ==================== EMAIL TEACHER FUNCTIONS ====================

export function showEmailTeacherForm() {
    const vocabMastery = vocabulary.length > 0 ? (state.vocabProgress.length / vocabulary.length * 100).toFixed(0) : 0;
    const practiceTotal = Object.keys(state.practiceProgress).length;
    const practiceCorrect = Object.values(state.practiceProgress).filter(v => v === true).length;
    const practicePercent = practiceTotal > 0 ? (practiceCorrect / practiceTotal * 100).toFixed(0) : 0;
    const testsTotal = state.testResults.length;
    const avgTestScore = testsTotal > 0
        ? (state.testResults.reduce((sum, r) => sum + r.score, 0) / testsTotal).toFixed(0)
        : 0;
    const overallProgress = (parseFloat(vocabMastery) * 0.4) + (parseFloat(practicePercent) * 0.4) + (parseFloat(avgTestScore) * 0.2);

    const totalMinutes = Math.floor(state.totalStudyTime / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const studyTimeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const formHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;" id="emailModal">
            <div style="background: white; padding: 30px; border-radius: 20px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h2 style="color: #667eea; margin-bottom: 20px;"><i class="fas fa-envelope"></i> Email My Teacher</h2>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Your Progress Summary:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 10px 0;"><strong>Overall Proficiency:</strong> ${overallProgress.toFixed(0)}%</li>
                        <li style="margin: 10px 0;"><strong>Vocabulary Mastery:</strong> ${state.vocabProgress.length}/${vocabulary.length} terms (${vocabMastery}%)</li>
                        <li style="margin: 10px 0;"><strong>Practice Accuracy:</strong> ${practiceCorrect}/${practiceTotal} correct (${practicePercent}%)</li>
                        <li style="margin: 10px 0;"><strong>Practice Tests:</strong> ${testsTotal} taken, ${avgTestScore}% average</li>
                        <li style="margin: 10px 0;"><strong>Study Time:</strong> ${studyTimeDisplay}</li>
                        <li style="margin: 10px 0;"><strong>Current Streak:</strong> ${state.studyStreak.current} days</li>
                        <li style="margin: 10px 0;"><strong>Badges Earned:</strong> ${state.earnedBadges.length}/${badges.length}</li>
                    </ul>
                </div>

                <form id="teacherEmailForm" onsubmit="window.sendEmailToTeacher(event)">
                    <div style="margin-bottom: 20px;">
                        <label for="studentName" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Your Name:</label>
                        <input type="text" id="studentName" name="studentName" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label for="studentFeedback" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Feedback (Optional):</label>
                        <textarea id="studentFeedback" name="studentFeedback" rows="5" placeholder="How helpful was this study tool? What could be improved?" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; resize: vertical;"></textarea>
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" style="padding: 12px 30px; font-size: 1.1em;">
                            <i class="fas fa-paper-plane"></i> Send Email
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="window.closeEmailModal()" style="padding: 12px 30px; font-size: 1.1em; margin-left: 10px;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = formHTML;
    document.body.appendChild(modalDiv);
}

export function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.parentElement.remove();
    }
}

export function sendEmailToTeacher(event) {
    event.preventDefault();

    const studentName = document.getElementById('studentName').value;
    const feedback = document.getElementById('studentFeedback').value;

    const vocabMastery = vocabulary.length > 0 ? (state.vocabProgress.length / vocabulary.length * 100).toFixed(0) : 0;
    const practiceTotal = Object.keys(state.practiceProgress).length;
    const practiceCorrect = Object.values(state.practiceProgress).filter(v => v === true).length;
    const practicePercent = practiceTotal > 0 ? (practiceCorrect / practiceTotal * 100).toFixed(0) : 0;
    const testsTotal = state.testResults.length;
    const avgTestScore = testsTotal > 0
        ? (state.testResults.reduce((sum, r) => sum + r.score, 0) / testsTotal).toFixed(0)
        : 0;
    const overallProgress = (parseFloat(vocabMastery) * 0.4) + (parseFloat(practicePercent) * 0.4) + (parseFloat(avgTestScore) * 0.2);

    const totalMinutes = Math.floor(state.totalStudyTime / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const studyTimeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Build email subject and body
    const subject = `Revolutionary War Study Progress - ${studentName}`;
    const body = `Hello,

${studentName} has reached ${overallProgress.toFixed(0)}% proficiency on the Revolutionary War Study Tool!

PROGRESS SUMMARY:
Overall Proficiency: ${overallProgress.toFixed(0)}%
Vocabulary Mastery: ${state.vocabProgress.length}/${vocabulary.length} terms (${vocabMastery}%)
Practice Accuracy: ${practiceCorrect}/${practiceTotal} correct (${practicePercent}%)
Practice Tests Taken: ${testsTotal} (Average score: ${avgTestScore}%)
Total Study Time: ${studyTimeDisplay}
Current Study Streak: ${state.studyStreak.current} days
Longest Streak: ${state.studyStreak.longest} days
Badges Earned: ${state.earnedBadges.length}/${badges.length}

STUDENT FEEDBACK:
${feedback || 'No feedback provided.'}

Sent from Revolutionary War Study Tool
Generated: ${new Date().toLocaleString()}`;

    // Create mailto link
    const mailtoLink = `mailto:benaderets885@edmonds.wednet.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Close modal after a brief delay
    setTimeout(() => {
        closeEmailModal();
        alert('Email opened! Please send the email from your email client.');
    }, 500);
}
