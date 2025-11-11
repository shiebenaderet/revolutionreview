// ==================== ANALYTICS MODULE ====================
// Client-side analytics tracking using localStorage
// Tracks study patterns, question difficulty, topic performance, and engagement

// ==================== DATA STRUCTURE ====================
// Analytics data structure stored in localStorage:
// {
//   sessions: Array of study session objects
//   questionAttempts: Object mapping question IDs to attempt stats
//   vocabMastery: Object mapping terms to mastery timestamps
//   topicPerformance: Object mapping categories to performance stats
//   featureUsage: Object mapping features to usage stats
//   testHistory: Array of test result objects
// }

/**
 * Initialize analytics tracking
 * Loads existing analytics data or creates new structure
 * @returns {void}
 */
export function initAnalytics() {
    const analytics = getAnalyticsData();
    console.log('Analytics initialized with', Object.keys(analytics).length, 'data categories');

    // Track page load
    trackPageView('home');
}

/**
 * Get all analytics data from localStorage
 * @returns {Object} Complete analytics data structure
 */
export function getAnalyticsData() {
    const defaultData = {
        sessions: [],
        questionAttempts: {},
        vocabMastery: {},
        topicPerformance: {},
        featureUsage: {
            vocab: { visits: 0, totalTime: 0 },
            practice: { visits: 0, totalTime: 0 },
            test: { visits: 0, totalTime: 0 },
            timeline: { visits: 0, totalTime: 0 },
            shortanswer: { visits: 0, totalTime: 0 },
            focused: { visits: 0, totalTime: 0 }
        },
        testHistory: []
    };

    const stored = localStorage.getItem('analyticsData');
    if (stored) {
        try {
            return { ...defaultData, ...JSON.parse(stored) };
        } catch (e) {
            console.error('Error parsing analytics data:', e);
            return defaultData;
        }
    }

    return defaultData;
}

/**
 * Save analytics data to localStorage
 * @param {Object} data - Analytics data to save
 * @returns {void}
 */
function saveAnalyticsData(data) {
    try {
        localStorage.setItem('analyticsData', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving analytics data:', e);
    }
}

/**
 * Track a study session
 * @param {string} section - Section name (vocab, practice, test, etc.)
 * @param {number} duration - Duration in milliseconds
 * @param {Date} startTime - Session start time
 * @returns {void}
 */
export function trackStudySession(section, duration, startTime = new Date()) {
    const analytics = getAnalyticsData();

    const timeOfDay = getTimeOfDay(startTime);
    const date = startTime.toISOString().split('T')[0]; // YYYY-MM-DD

    const session = {
        section,
        duration,
        startTime: startTime.getTime(),
        endTime: startTime.getTime() + duration,
        date,
        timeOfDay
    };

    analytics.sessions.push(session);

    // Update feature usage
    if (analytics.featureUsage[section]) {
        analytics.featureUsage[section].visits += 1;
        analytics.featureUsage[section].totalTime += duration;
    }

    saveAnalyticsData(analytics);
    console.log(`📊 Session tracked: ${section} for ${Math.round(duration / 1000)}s`);
}

/**
 * Track a question attempt
 * @param {number} questionId - Question ID or index
 * @param {boolean} correct - Whether answer was correct
 * @param {string} category - Question category/topic
 * @param {number} timeSpent - Time spent on question in milliseconds
 * @returns {void}
 */
export function trackQuestionAttempt(questionId, correct, category, timeSpent = 0) {
    const analytics = getAnalyticsData();

    // Track per-question performance
    if (!analytics.questionAttempts[questionId]) {
        analytics.questionAttempts[questionId] = {
            attempts: 0,
            correct: 0,
            incorrect: 0,
            lastAttempt: Date.now(),
            totalTime: 0
        };
    }

    const qData = analytics.questionAttempts[questionId];
    qData.attempts += 1;
    qData[correct ? 'correct' : 'incorrect'] += 1;
    qData.lastAttempt = Date.now();
    qData.totalTime += timeSpent;

    // Track topic performance
    if (category) {
        if (!analytics.topicPerformance[category]) {
            analytics.topicPerformance[category] = {
                attempts: 0,
                correct: 0,
                incorrect: 0
            };
        }

        const topicData = analytics.topicPerformance[category];
        topicData.attempts += 1;
        topicData[correct ? 'correct' : 'incorrect'] += 1;
    }

    saveAnalyticsData(analytics);
    console.log(`📊 Question ${questionId}: ${correct ? '✓' : '✗'} (${category})`);
}

/**
 * Track vocabulary term mastery
 * @param {string} term - Vocabulary term
 * @param {number} reviewCount - Number of times reviewed before mastery
 * @param {number} timeToMaster - Time from first view to mastery in milliseconds
 * @returns {void}
 */
export function trackVocabMastery(term, reviewCount = 1, timeToMaster = 0) {
    const analytics = getAnalyticsData();

    if (!analytics.vocabMastery[term]) {
        analytics.vocabMastery[term] = {
            markedKnown: Date.now(),
            reviewCount,
            timeToMaster
        };
    } else {
        // Update if re-marked as known
        analytics.vocabMastery[term].reviewCount += 1;
    }

    saveAnalyticsData(analytics);
    console.log(`📊 Vocab mastered: "${term}"`);
}

/**
 * Track test completion
 * @param {number} score - Score percentage
 * @param {number} totalQuestions - Total number of questions
 * @param {number} correct - Number of correct answers
 * @param {number} duration - Test duration in milliseconds
 * @param {Object} topicBreakdown - Performance by topic
 * @returns {void}
 */
export function trackTestCompletion(score, totalQuestions, correct, duration, topicBreakdown = {}) {
    const analytics = getAnalyticsData();

    const testResult = {
        date: Date.now(),
        score,
        totalQuestions,
        correct,
        incorrect: totalQuestions - correct,
        duration,
        topicBreakdown
    };

    analytics.testHistory.push(testResult);

    saveAnalyticsData(analytics);
    console.log(`📊 Test completed: ${score}% (${correct}/${totalQuestions})`);
}

/**
 * Track badge earned
 * @param {string} badgeId - Badge ID
 * @param {string} badgeName - Badge name
 * @returns {void}
 */
export function trackBadgeEarned(badgeId, badgeName) {
    console.log(`🏆 Badge earned: ${badgeName}`);
    // Badges are already tracked in earnedBadges via storage.js
    // This is just for logging/future external analytics
}

/**
 * Track page/section view
 * @param {string} sectionName - Section name
 * @returns {void}
 */
export function trackPageView(sectionName) {
    const analytics = getAnalyticsData();

    // Increment feature usage visit count
    if (analytics.featureUsage[sectionName]) {
        analytics.featureUsage[sectionName].visits += 1;
        saveAnalyticsData(analytics);
    }

    console.log(`📊 Page view: ${sectionName}`);
}

/**
 * Get time of day category
 * @param {Date} date - Date object
 * @returns {string} Time of day (morning, afternoon, evening, night)
 */
function getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
}

// ==================== ANALYTICS DASHBOARD ====================

/**
 * Get analytics dashboard data
 * @returns {Object} Processed analytics for dashboard display
 */
export function getAnalyticsDashboard() {
    const analytics = getAnalyticsData();

    return {
        studyPatterns: calculateStudyPatterns(analytics),
        questionDifficulty: calculateQuestionDifficulty(analytics),
        topicPerformance: calculateTopicPerformance(analytics),
        engagementMetrics: calculateEngagementMetrics(analytics),
        progressVelocity: calculateProgressVelocity(analytics),
        testTrends: calculateTestTrends(analytics)
    };
}

/**
 * Calculate study patterns (session duration, frequency, time of day)
 * @param {Object} analytics - Analytics data
 * @returns {Object} Study pattern metrics
 */
function calculateStudyPatterns(analytics) {
    const sessions = analytics.sessions || [];

    if (sessions.length === 0) {
        return {
            totalSessions: 0,
            averageDuration: 0,
            totalTime: 0,
            timeOfDayDistribution: {},
            recentSessions: []
        };
    }

    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageDuration = totalTime / sessions.length;

    const timeOfDayDistribution = sessions.reduce((dist, s) => {
        dist[s.timeOfDay] = (dist[s.timeOfDay] || 0) + 1;
        return dist;
    }, {});

    const recentSessions = sessions.slice(-10).reverse();

    return {
        totalSessions: sessions.length,
        averageDuration: Math.round(averageDuration),
        totalTime: Math.round(totalTime),
        timeOfDayDistribution,
        recentSessions
    };
}

/**
 * Calculate question difficulty (highest wrong answer rates)
 * @param {Object} analytics - Analytics data
 * @returns {Array} Top 10 most difficult questions
 */
function calculateQuestionDifficulty(analytics) {
    const attempts = analytics.questionAttempts || {};

    const difficulties = Object.entries(attempts).map(([qId, data]) => {
        const wrongRate = data.attempts > 0 ? (data.incorrect / data.attempts) * 100 : 0;
        return {
            questionId: parseInt(qId),
            attempts: data.attempts,
            correct: data.correct,
            incorrect: data.incorrect,
            wrongRate: Math.round(wrongRate),
            averageTime: data.totalTime > 0 ? Math.round(data.totalTime / data.attempts) : 0
        };
    });

    // Sort by wrong rate descending
    difficulties.sort((a, b) => b.wrongRate - a.wrongRate);

    return difficulties.slice(0, 10);
}

/**
 * Calculate topic performance
 * @param {Object} analytics - Analytics data
 * @returns {Object} Performance by topic/category
 */
function calculateTopicPerformance(analytics) {
    const topics = analytics.topicPerformance || {};

    return Object.entries(topics).map(([category, data]) => {
        const successRate = data.attempts > 0 ? (data.correct / data.attempts) * 100 : 0;
        return {
            category,
            attempts: data.attempts,
            correct: data.correct,
            incorrect: data.incorrect,
            successRate: Math.round(successRate)
        };
    }).sort((a, b) => b.attempts - a.attempts);
}

/**
 * Calculate engagement metrics (feature usage)
 * @param {Object} analytics - Analytics data
 * @returns {Object} Feature engagement metrics
 */
function calculateEngagementMetrics(analytics) {
    const usage = analytics.featureUsage || {};

    const totalVisits = Object.values(usage).reduce((sum, f) => sum + f.visits, 0);
    const totalTime = Object.values(usage).reduce((sum, f) => sum + f.totalTime, 0);

    const features = Object.entries(usage).map(([feature, data]) => {
        const visitPercentage = totalVisits > 0 ? (data.visits / totalVisits) * 100 : 0;
        const timePercentage = totalTime > 0 ? (data.totalTime / totalTime) * 100 : 0;
        const avgTimePerVisit = data.visits > 0 ? data.totalTime / data.visits : 0;

        return {
            feature,
            visits: data.visits,
            totalTime: data.totalTime,
            visitPercentage: Math.round(visitPercentage),
            timePercentage: Math.round(timePercentage),
            avgTimePerVisit: Math.round(avgTimePerVisit)
        };
    }).sort((a, b) => b.visits - a.visits);

    return {
        totalVisits,
        totalTime,
        features
    };
}

/**
 * Calculate progress velocity
 * @param {Object} analytics - Analytics data
 * @returns {Object} Progress velocity metrics
 */
function calculateProgressVelocity(analytics) {
    const vocabMastery = analytics.vocabMastery || {};
    const questionAttempts = analytics.questionAttempts || {};

    const totalVocabMastered = Object.keys(vocabMastery).length;
    const avgTimeToMaster = Object.values(vocabMastery).reduce((sum, v) => sum + (v.timeToMaster || 0), 0) / Math.max(totalVocabMastered, 1);

    const totalQuestionsAttempted = Object.keys(questionAttempts).length;
    const avgAttemptsPerQuestion = Object.values(questionAttempts).reduce((sum, q) => sum + q.attempts, 0) / Math.max(totalQuestionsAttempted, 1);

    return {
        totalVocabMastered,
        avgTimeToMaster: Math.round(avgTimeToMaster),
        totalQuestionsAttempted,
        avgAttemptsPerQuestion: Math.round(avgAttemptsPerQuestion * 10) / 10
    };
}

/**
 * Calculate test trends
 * @param {Object} analytics - Analytics data
 * @returns {Array} Test history with trends
 */
function calculateTestTrends(analytics) {
    const tests = analytics.testHistory || [];

    if (tests.length === 0) {
        return {
            totalTests: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            improvement: 0,
            recentTests: []
        };
    }

    const scores = tests.map(t => t.score);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Calculate improvement (compare first 3 vs last 3 tests)
    let improvement = 0;
    if (tests.length >= 6) {
        const firstThree = tests.slice(0, 3).reduce((sum, t) => sum + t.score, 0) / 3;
        const lastThree = tests.slice(-3).reduce((sum, t) => sum + t.score, 0) / 3;
        improvement = lastThree - firstThree;
    }

    return {
        totalTests: tests.length,
        averageScore: Math.round(averageScore),
        highestScore: Math.round(highestScore),
        lowestScore: Math.round(lowestScore),
        improvement: Math.round(improvement),
        recentTests: tests.slice(-5).reverse()
    };
}

/**
 * Clear all analytics data
 * @returns {void}
 */
export function clearAnalyticsData() {
    localStorage.removeItem('analyticsData');
    console.log('Analytics data cleared');
}

/**
 * Export analytics data as JSON
 * @returns {string} JSON string of analytics data
 */
export function exportAnalyticsData() {
    const analytics = getAnalyticsData();
    return JSON.stringify(analytics, null, 2);
}
