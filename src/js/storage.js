// ==================== STORAGE MODULE ====================
// Handles all localStorage operations for progress tracking

// Firebase Firestore imports for cloud sync
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Auth module imports
import { getCurrentUser, isAuthenticated, getDatabase, onAuthChange } from './auth.js';

/**
 * Save vocabulary progress to localStorage
 * @param {Array<string>} vocabProgress - Array of known vocabulary terms
 */
export function saveVocabProgress(vocabProgress) {
    localStorage.setItem('vocabProgress', JSON.stringify(vocabProgress));
}

/**
 * Load vocabulary progress from localStorage
 * @returns {Array<string>} Array of known vocabulary terms
 */
export function loadVocabProgress() {
    return JSON.parse(localStorage.getItem('vocabProgress')) || [];
}

/**
 * Save practice progress to localStorage
 * @param {Object} practiceProgress - Object mapping question IDs to boolean results
 */
export function savePracticeProgress(practiceProgress) {
    localStorage.setItem('practiceProgress', JSON.stringify(practiceProgress));
}

/**
 * Load practice progress from localStorage
 * @returns {Object} Object mapping question IDs to boolean results
 */
export function loadPracticeProgress() {
    return JSON.parse(localStorage.getItem('practiceProgress')) || {};
}

/**
 * Save wrong answer count to localStorage
 * @param {Object} wrongAnswerCount - Object mapping question IDs to wrong answer counts
 */
export function saveWrongAnswerCount(wrongAnswerCount) {
    localStorage.setItem('wrongAnswerCount', JSON.stringify(wrongAnswerCount));
}

/**
 * Load wrong answer count from localStorage
 * @returns {Object} Object mapping question IDs to wrong answer counts
 */
export function loadWrongAnswerCount() {
    return JSON.parse(localStorage.getItem('wrongAnswerCount')) || {};
}

/**
 * Save test results to localStorage
 * @param {Array<Object>} testResults - Array of test result objects
 */
export function saveTestResults(testResults) {
    localStorage.setItem('testResults', JSON.stringify(testResults));
}

/**
 * Load test results from localStorage
 * @returns {Array<Object>} Array of test result objects
 */
export function loadTestResults() {
    return JSON.parse(localStorage.getItem('testResults')) || [];
}

/**
 * Save total study time to localStorage
 * @param {number} totalStudyTime - Total study time in milliseconds
 */
export function saveTotalStudyTime(totalStudyTime) {
    localStorage.setItem('totalStudyTime', totalStudyTime.toString());
}

/**
 * Load total study time from localStorage
 * @returns {number} Total study time in milliseconds
 */
export function loadTotalStudyTime() {
    return parseInt(localStorage.getItem('totalStudyTime')) || 0;
}

/**
 * Save study streak to localStorage
 * @param {Object} studyStreak - Object with current, longest, and lastStudyDate
 */
export function saveStudyStreak(studyStreak) {
    localStorage.setItem('studyStreak', JSON.stringify(studyStreak));
}

/**
 * Load study streak from localStorage
 * @returns {Object} Object with current, longest, and lastStudyDate
 */
export function loadStudyStreak() {
    return JSON.parse(localStorage.getItem('studyStreak')) || { current: 0, longest: 0, lastStudyDate: null };
}

/**
 * Save earned badges to localStorage
 * @param {Array<string>} earnedBadges - Array of earned badge IDs
 */
export function saveEarnedBadges(earnedBadges) {
    localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
}

/**
 * Load earned badges from localStorage
 * @returns {Array<string>} Array of earned badge IDs
 */
export function loadEarnedBadges() {
    return JSON.parse(localStorage.getItem('earnedBadges')) || [];
}

/**
 * Save timeline progress to localStorage
 * @param {Object} timelineProgress - Object with bestScore, perfectCount, and attempts
 */
export function saveTimelineProgress(timelineProgress) {
    localStorage.setItem('timelineProgress', JSON.stringify(timelineProgress));
}

/**
 * Load timeline progress from localStorage
 * @returns {Object} Object with bestScore, perfectCount, and attempts
 */
export function loadTimelineProgress() {
    return JSON.parse(localStorage.getItem('timelineProgress')) || {
        bestScore: 0,
        perfectCount: 0,
        attempts: 0
    };
}

/**
 * Save short answer responses to localStorage
 * @param {Object} shortAnswerResponses - Object mapping question indices to response text
 */
export function saveShortAnswerResponses(shortAnswerResponses) {
    localStorage.setItem('shortAnswerResponses', JSON.stringify(shortAnswerResponses));
}

/**
 * Load short answer responses from localStorage
 * @returns {Object} Object mapping question indices to response text
 */
export function loadShortAnswerResponses() {
    return JSON.parse(localStorage.getItem('shortAnswerResponses')) || {};
}

/**
 * Clear all progress from localStorage
 */
export function clearAllProgress() {
    localStorage.clear();
}

/**
 * Export all progress data as a JSON object
 * @returns {Object} Complete progress data for export
 */
export function exportAllProgress() {
    return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        vocabProgress: loadVocabProgress(),
        practiceProgress: loadPracticeProgress(),
        wrongAnswerCount: loadWrongAnswerCount(),
        testResults: loadTestResults(),
        totalStudyTime: loadTotalStudyTime(),
        studyStreak: loadStudyStreak(),
        earnedBadges: loadEarnedBadges(),
        timelineProgress: loadTimelineProgress(),
        shortAnswerResponses: loadShortAnswerResponses()
    };
}

/**
 * Import progress data from a JSON object
 * @param {Object} importData - Progress data to import
 * @returns {boolean} Success status
 */
export function importAllProgress(importData) {
    try {
        if (!importData.version) {
            throw new Error('Invalid file format');
        }

        // Import all data
        if (importData.vocabProgress) saveVocabProgress(importData.vocabProgress);
        if (importData.practiceProgress) savePracticeProgress(importData.practiceProgress);
        if (importData.wrongAnswerCount) saveWrongAnswerCount(importData.wrongAnswerCount);
        if (importData.testResults) saveTestResults(importData.testResults);
        if (importData.totalStudyTime !== undefined) saveTotalStudyTime(importData.totalStudyTime);
        if (importData.studyStreak) saveStudyStreak(importData.studyStreak);
        if (importData.earnedBadges) saveEarnedBadges(importData.earnedBadges);
        if (importData.timelineProgress) saveTimelineProgress(importData.timelineProgress);
        if (importData.shortAnswerResponses) saveShortAnswerResponses(importData.shortAnswerResponses);

        return true;
    } catch (error) {
        console.error('Import error:', error);
        return false;
    }
}

// ==================== CLOUD SYNC FUNCTIONALITY ====================
// Sync localStorage data with Firebase Firestore for cross-device access

let syncInterval = null;

/**
 * Sync all localStorage data to Firestore
 * @returns {Promise<boolean>} Success status
 */
export async function syncToCloud() {
    if (!isAuthenticated()) {
        console.log('Not authenticated, skipping cloud sync');
        return false;
    }

    try {
        const user = getCurrentUser();
        const db = getDatabase();

        // Get all progress data from localStorage
        const progressData = {
            vocabProgress: loadVocabProgress(),
            practiceProgress: loadPracticeProgress(),
            wrongAnswerCount: loadWrongAnswerCount(),
            testResults: loadTestResults(),
            totalStudyTime: loadTotalStudyTime(),
            studyStreak: loadStudyStreak(),
            earnedBadges: loadEarnedBadges(),
            timelineProgress: loadTimelineProgress(),
            shortAnswerResponses: loadShortAnswerResponses(),
            lastSynced: Date.now()
        };

        // Save progress data to Firestore
        await setDoc(doc(db, 'users', user.uid, 'data', 'progress'), progressData, { merge: true });

        console.log('✅ Synced to cloud successfully');
        return true;
    } catch (error) {
        console.error('❌ Cloud sync error:', error);
        return false;
    }
}

/**
 * Load data from Firestore to localStorage
 * @returns {Promise<boolean>} True if data was loaded, false if no cloud data
 */
export async function syncFromCloud() {
    if (!isAuthenticated()) {
        console.log('Not authenticated, skipping cloud sync');
        return false;
    }

    try {
        const user = getCurrentUser();
        const db = getDatabase();

        // Get progress data from Firestore
        const progressRef = doc(db, 'users', user.uid, 'data', 'progress');
        const progressDoc = await getDoc(progressRef);

        if (!progressDoc.exists()) {
            console.log('No cloud data found');
            return false;
        }

        const cloudData = progressDoc.data();

        // Save to localStorage
        if (cloudData.vocabProgress) saveVocabProgress(cloudData.vocabProgress);
        if (cloudData.practiceProgress) savePracticeProgress(cloudData.practiceProgress);
        if (cloudData.wrongAnswerCount) saveWrongAnswerCount(cloudData.wrongAnswerCount);
        if (cloudData.testResults) saveTestResults(cloudData.testResults);
        if (cloudData.totalStudyTime !== undefined) saveTotalStudyTime(cloudData.totalStudyTime);
        if (cloudData.studyStreak) saveStudyStreak(cloudData.studyStreak);
        if (cloudData.earnedBadges) saveEarnedBadges(cloudData.earnedBadges);
        if (cloudData.timelineProgress) saveTimelineProgress(cloudData.timelineProgress);
        if (cloudData.shortAnswerResponses) saveShortAnswerResponses(cloudData.shortAnswerResponses);

        console.log('✅ Synced from cloud successfully');
        return true;
    } catch (error) {
        console.error('❌ Cloud sync error:', error);
        return false;
    }
}

/**
 * Enable automatic background syncing
 * Sets up auth state listener and periodic sync interval
 * @returns {void}
 */
export function enableAutoSync() {
    // Set up auth state change listener
    onAuthChange(async (user) => {
        if (user) {
            console.log('🔄 User signed in, syncing data...');

            // First sync from cloud (load existing data)
            await syncFromCloud();

            // Then sync to cloud (merge with local data)
            await syncToCloud();
        }
    });

    // Set up periodic sync every 30 seconds
    if (syncInterval) {
        clearInterval(syncInterval);
    }

    syncInterval = setInterval(async () => {
        if (isAuthenticated()) {
            console.log('🔄 Auto-syncing to cloud...');
            await syncToCloud();
        }
    }, 30000); // 30 seconds

    console.log('✅ Auto-sync enabled');
}

/**
 * Disable automatic syncing
 * Clears the sync interval
 * @returns {void}
 */
export function disableAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏹️ Auto-sync disabled');
    }
}
