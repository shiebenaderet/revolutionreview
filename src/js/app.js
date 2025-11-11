// ==================== APP MODULE ====================
// Main application orchestrator - initializes and coordinates all modules

// ==================== IMPORTS ====================
import { timelineEvents, vocabulary, questions, badges } from './data.js';
import {
    loadVocabProgress,
    loadPracticeProgress,
    loadWrongAnswerCount,
    loadTestResults,
    loadTotalStudyTime,
    loadStudyStreak,
    loadEarnedBadges,
    loadTimelineProgress,
    loadShortAnswerResponses
} from './storage.js';
import {
    initUIState,
    showSection,
    updateHomeProgress,
    closeNoteModal,
    toggleTimer,
    showEmailTeacherForm,
    closeEmailModal,
    sendEmailToTeacher,
    showDefinition,
    closeTooltip,
    // Test functions
    loadTest,
    selectTestOption,
    gradeTest,
    // Short answer functions
    loadShortAnswers,
    revealNextStarter,
    revealExemplar,
    reviseAnswer,
    nextShortAnswer,
    // Focused mode functions
    loadFocusedMode,
    startFocusedSession,
    selectFocusedOption,
    markFocusedKnown,
    nextFocusedItem,
    // Timeline & print guide (placeholders for now)
    loadTimeline,
    loadPrintGuide,
    // Analytics dashboard
    loadAnalyticsDashboard
} from './ui.js';
import { initAuth } from './auth.js';
import { initAnalytics } from './analytics.js';

// TODO: Import flashcards, practice, timeline modules when they're created
// import { loadFlashcard, flipCard, nextCard, prevCard, markKnown, shuffleCards, updateVocabProgress, resetVocabProgress } from './flashcards.js';
// import { loadNewPracticeSet, selectPracticeOption, checkPracticeAnswer, nextPracticeQuestion } from './practice.js';
// import { renderTimeline, checkTimelineAnswer, resetTimeline } from './timeline.js';

// ==================== GLOBAL STATE ====================
export const appState = {
    // Flashcard state
    currentCardIndex: 0,
    cardFlipped: false,

    // Progress tracking
    vocabProgress: [],
    practiceProgress: {},
    wrongAnswerCount: {},
    testResults: [],
    testAnswers: {},

    // Practice questions state
    currentPracticeQuestions: [],
    currentPracticeIndex: 0,
    selectedPracticeOption: -1,

    // Study timer
    timerInterval: null,
    sessionStartTime: null,
    sessionElapsedTime: 0,
    timerPaused: false,
    totalStudyTime: 0,

    // Streak & badges
    studyStreak: { current: 0, longest: 0, lastStudyDate: null },
    earnedBadges: [],

    // Timeline challenge
    timelineProgress: { bestScore: 0, perfectCount: 0, attempts: 0 },
    timelineMode: 'easy',
    timelinePlaced: {},
    draggedEvent: null,
    hasCheckedInEasyMode: false,

    // Short answer
    currentShortAnswerIndex: 0,
    shortAnswerResponses: {},

    // Focused mode
    focusedVocab: [],
    focusedQuestions: [],
    focusedIndex: 0,
    focusedType: 'vocab',
    selectedFocusedOption: -1,

    // Print guide
    printSelection: []
};

// ==================== INITIALIZATION ====================

/**
 * Initialize the application
 * Loads all progress, sets up modules, and starts the app
 */
export function init() {
    console.log('Initializing Revolution Review app...');

    // Load all progress from localStorage
    loadAllProgress();

    // Initialize authentication module (placeholder for Firebase)
    initAuth();

    // Initialize analytics module (placeholder for GA)
    initAnalytics();

    // Pass state to UI module
    initUIState(appState);

    // Set up event listeners
    setupEventListeners();

    // Set up keyboard navigation
    setupKeyboardNavigation();

    // Set up tooltip close listener
    setupTooltipListener();

    // Show home section and update progress
    showSection('home');
    updateHomeProgress();

    console.log('App initialized successfully!');
}

/**
 * Load all progress data from localStorage
 */
function loadAllProgress() {
    appState.vocabProgress = loadVocabProgress();
    appState.practiceProgress = loadPracticeProgress();
    appState.wrongAnswerCount = loadWrongAnswerCount();
    appState.testResults = loadTestResults();
    appState.totalStudyTime = loadTotalStudyTime();
    appState.studyStreak = loadStudyStreak();
    appState.earnedBadges = loadEarnedBadges();
    appState.timelineProgress = loadTimelineProgress();
    appState.shortAnswerResponses = loadShortAnswerResponses();

    console.log('Progress loaded:', {
        vocab: appState.vocabProgress.length,
        practice: Object.keys(appState.practiceProgress).length,
        tests: appState.testResults.length,
        studyTime: appState.totalStudyTime,
        streak: appState.studyStreak.current
    });
}

/**
 * Set up all event listeners for navigation and controls
 */
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('[data-section]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sectionId = e.currentTarget.dataset.section;
            showSection(sectionId);
        });
    });

    // Timer controls
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', toggleTimer);
    }

    // Modal close button
    const modalCloseBtn = document.querySelector('.close-modal');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeNoteModal);
    }

    // Tooltip close button
    const tooltipCloseBtn = document.querySelector('.close-tooltip');
    if (tooltipCloseBtn) {
        tooltipCloseBtn.addEventListener('click', closeTooltip);
    }

    console.log('Event listeners set up');
}

/**
 * Set up keyboard navigation shortcuts
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        const activeSection = document.querySelector('.section.active')?.id;

        // Don't trigger keyboard shortcuts if user is typing
        if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
            return;
        }

        // Vocabulary section controls
        if (activeSection === 'vocab') {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                window.prevCard?.();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                window.nextCard?.();
            } else if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                window.flipCard?.();
            } else if (event.key === 'k' || event.key === 'K') {
                event.preventDefault();
                window.markKnown?.();
            }
        }

        // Practice section controls
        if (activeSection === 'practice') {
            if (event.key >= '1' && event.key <= '4') {
                event.preventDefault();
                const optionIndex = parseInt(event.key) - 1;
                if (appState.currentPracticeQuestions[appState.currentPracticeIndex]) {
                    const question = appState.currentPracticeQuestions[appState.currentPracticeIndex];
                    const questionId = questions.indexOf(question);
                    window.selectPracticeOption?.(questionId, optionIndex);
                }
            }
        }

        // Test section controls
        if (activeSection === 'test') {
            if (event.key >= '1' && event.key <= '4') {
                // Find which question is in view
                const questionCards = document.querySelectorAll('#testQuestions .question-card');
                questionCards.forEach((card, qIndex) => {
                    const rect = card.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                        const optionIndex = parseInt(event.key) - 1;
                        selectTestOption(qIndex, optionIndex);
                    }
                });
            }
        }

        // Timeline section controls
        if (activeSection === 'timeline') {
            if (event.key === 'r' || event.key === 'R') {
                event.preventDefault();
                window.resetTimeline?.();
            }
        }

        // Global: Escape to go home
        if (event.key === 'Escape' && activeSection !== 'home') {
            showSection('home');
        }
    });

    console.log('Keyboard navigation set up');
}

/**
 * Set up tooltip close listener (click outside to close)
 */
function setupTooltipListener() {
    document.addEventListener('click', function(event) {
        const tooltip = document.getElementById('definitionTooltip');
        if (tooltip && !event.target.classList.contains('vocab-term') && !tooltip.contains(event.target)) {
            closeTooltip();
        }
    });
}

// ==================== WINDOW EXPORTS ====================
// Export functions to window for onclick handlers in HTML
// This maintains compatibility with inline event handlers

window.showSection = showSection;
window.showEmailTeacherForm = showEmailTeacherForm;
window.closeEmailModal = closeEmailModal;
window.sendEmailToTeacher = sendEmailToTeacher;
window.showDefinition = showDefinition;
window.closeTooltip = closeTooltip;

// Test functions
window.loadTest = loadTest;
window.selectTestOption = selectTestOption;
window.gradeTest = gradeTest;

// Short answer functions
window.loadShortAnswers = loadShortAnswers;
window.revealNextStarter = revealNextStarter;
window.revealExemplar = revealExemplar;
window.reviseAnswer = reviseAnswer;
window.nextShortAnswer = nextShortAnswer;

// Focused mode functions
window.startFocusedSession = startFocusedSession;
window.selectFocusedOption = selectFocusedOption;
window.markFocusedKnown = markFocusedKnown;
window.nextFocusedItem = nextFocusedItem;

// Timeline functions (when extracted)
window.loadTimeline = loadTimeline;

// Print guide functions (when extracted)
window.loadPrintGuide = loadPrintGuide;

// Analytics dashboard
window.loadAnalyticsDashboard = loadAnalyticsDashboard;

// TODO: Export flashcard and practice functions when modules are created
// window.loadFlashcard = loadFlashcard;
// window.flipCard = flipCard;
// window.nextCard = nextCard;
// window.prevCard = prevCard;
// window.markKnown = markKnown;
// window.shuffleCards = shuffleCards;
// window.updateVocabProgress = updateVocabProgress;
// window.resetVocabProgress = resetVocabProgress;
// window.loadNewPracticeSet = loadNewPracticeSet;
// window.selectPracticeOption = selectPracticeOption;
// window.checkPracticeAnswer = checkPracticeAnswer;
// window.nextPracticeQuestion = nextPracticeQuestion;

// ==================== START APP ====================
// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

// Export for testing/debugging
export { appState as state };
