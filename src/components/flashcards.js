// ==================== FLASHCARD MODULE ====================
// Handles vocabulary flashcard functionality

import { vocabulary } from '../js/data.js';
import { saveVocabProgress, loadVocabProgress } from '../js/storage.js';

// State
let currentCardIndex = 0;
let cardFlipped = false;
let vocabProgress = loadVocabProgress();

/**
 * Load and display the current flashcard
 */
export function loadFlashcard() {
    cardFlipped = false;
    const card = vocabulary[currentCardIndex];

    const cardHTML = `
        <div class="flashcard" onclick="flipCard()">
            <div id="cardFront">
                <h3>${card.term}</h3>
                <p style="margin-top: 10px; opacity: 0.8;">(${card.category})</p>
            </div>
            <div id="cardBack" style="display: none;">
                <div class="definition">${card.definition}</div>
                <div class="example"><strong>Example:</strong> ${card.example}</div>
            </div>
        </div>
    `;

    document.getElementById('flashcardContainer').innerHTML = cardHTML;
}

/**
 * Flip the flashcard between term and definition
 */
export function flipCard() {
    cardFlipped = !cardFlipped;
    document.getElementById('cardFront').style.display = cardFlipped ? 'none' : 'block';
    document.getElementById('cardBack').style.display = cardFlipped ? 'block' : 'none';
}

/**
 * Move to the next flashcard
 */
export function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % vocabulary.length;
    loadFlashcard();
    updateVocabProgress();
}

/**
 * Move to the previous flashcard
 */
export function prevCard() {
    currentCardIndex = (currentCardIndex - 1 + vocabulary.length) % vocabulary.length;
    loadFlashcard();
    updateVocabProgress();
}

/**
 * Mark current card as known and move to next
 */
export function markKnown() {
    const term = vocabulary[currentCardIndex].term;
    if (!vocabProgress.includes(term)) {
        vocabProgress.push(term);
        saveVocabProgress(vocabProgress);
        // Badge checking would be called here
    }
    nextCard();
}

/**
 * Shuffle the vocabulary cards randomly
 */
export function shuffleCards() {
    for (let i = vocabulary.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vocabulary[i], vocabulary[j]] = [vocabulary[j], vocabulary[i]];
    }
    currentCardIndex = 0;
    loadFlashcard();
}

/**
 * Update the vocabulary progress display
 */
export function updateVocabProgress() {
    vocabProgress = loadVocabProgress();
    const percent = (vocabProgress.length / vocabulary.length * 100).toFixed(0);
    document.getElementById('vocabProgress').textContent = `${vocabProgress.length}/${vocabulary.length} terms mastered (${percent}%)`;
    document.getElementById('vocabProgressBar').style.width = `${percent}%`;

    // Add mini progress by category
    updateCategoryProgress();
}

/**
 * Update progress display by category
 */
export function updateCategoryProgress() {
    const categories = {};
    vocabulary.forEach(v => {
        if (!categories[v.category]) {
            categories[v.category] = { total: 0, known: 0 };
        }
        categories[v.category].total++;
        if (vocabProgress.includes(v.term)) {
            categories[v.category].known++;
        }
    });

    let categoryHTML = '<div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">';
    categoryHTML += '<h4 style="margin-bottom: 15px; color: #667eea;">Progress by Category:</h4>';

    Object.entries(categories).forEach(([category, stats]) => {
        const percent = (stats.known / stats.total * 100).toFixed(0);
        categoryHTML += `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 0.9em; font-weight: 600;">${category}</span>
                    <span style="font-size: 0.9em; color: #666;">${stats.known}/${stats.total} (${percent}%)</span>
                </div>
                <div class="mini-progress">
                    <div class="mini-progress-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    });

    categoryHTML += '</div>';

    const existingCategory = document.getElementById('categoryProgress');
    if (existingCategory) {
        existingCategory.innerHTML = categoryHTML;
    } else {
        const container = document.getElementById('vocab');
        const progressBar = container.querySelector('.progress-bar');
        const newDiv = document.createElement('div');
        newDiv.id = 'categoryProgress';
        newDiv.innerHTML = categoryHTML;
        progressBar.parentNode.insertBefore(newDiv, progressBar.nextSibling);
    }
}

/**
 * Reset all vocabulary progress
 */
export function resetVocabProgress() {
    if (confirm('Are you sure you want to reset your vocabulary progress?')) {
        vocabProgress = [];
        saveVocabProgress(vocabProgress);
        updateVocabProgress();
    }
}

/**
 * Get current vocab progress for external use
 */
export function getVocabProgress() {
    return loadVocabProgress();
}

/**
 * Get current card index
 */
export function getCurrentCardIndex() {
    return currentCardIndex;
}

/**
 * Set current card index
 */
export function setCurrentCardIndex(index) {
    currentCardIndex = index;
}
