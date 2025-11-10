// ==================== TIMELINE CHALLENGE MODULE ====================
// Handles drag-and-drop timeline activity

import { timelineEvents } from '../js/data.js';
import { saveTimelineProgress, loadTimelineProgress } from '../js/storage.js';

// State
let timelineMode = 'easy'; // Start in easy mode (show years)
let timelinePlaced = {}; // Maps slot index to event id
let draggedEvent = null;
let hasCheckedInEasyMode = false; // Track if user has checked answer in easy mode
let timelineProgress = loadTimelineProgress();

/**
 * Load and initialize the timeline challenge
 */
export function loadTimeline() {
    updateTimelineStats();
    renderTimeline();
}

/**
 * Render the timeline events and slots
 */
export function renderTimeline() {
    // Randomize events for display
    const shuffled = [...timelineEvents].sort(() => Math.random() - 0.5);

    // Render events list
    let eventsHTML = '';
    shuffled.forEach(event => {
        const isPlaced = Object.values(timelinePlaced).includes(event.id);
        if (!isPlaced) {
            eventsHTML += `
                <div class="timeline-event" draggable="true" data-event-id="${event.id}"
                    ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)">
                    <div class="event-title">
                        <span class="drag-handle">⋮⋮</span>
                        ${event.title}
                        ${timelineMode === 'easy' ? `<span class="event-year">${event.year}</span>` : ''}
                    </div>
                    <div class="event-description">${event.description}</div>
                </div>
            `;
        }
    });
    document.getElementById('timelineEventsList').innerHTML = eventsHTML || '<p style="text-align: center; color: #999; padding: 20px;">All events placed!</p>';

    // Render timeline slots
    let slotsHTML = '';
    for (let i = 1; i <= 10; i++) {
        const eventId = timelinePlaced[i];
        const event = timelineEvents.find(e => e.id === eventId);

        slotsHTML += `
            <div class="timeline-slot ${event ? 'filled' : ''}" data-slot="${i}"
                ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${i})" ondragleave="handleDragLeave(event)">
                <div class="slot-number">${i}</div>
        `;

        if (event) {
            slotsHTML += `
                <div class="timeline-event placed" data-event-id="${event.id}" draggable="true"
                    ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)" onclick="removeFromSlot(${i})">
                    <div class="event-title">
                        ${event.title}
                        ${timelineMode === 'easy' ? `<span class="event-year">${event.year}</span>` : ''}
                    </div>
                    <div class="event-description">${event.description}</div>
                    <p style="font-size: 0.8em; color: #999; margin-top: 8px; text-align: center;">Click to remove</p>
                </div>
            `;
        } else {
            slotsHTML += '<div class="empty-message">Drag an event here</div>';
        }

        slotsHTML += '</div>';
    }
    document.getElementById('timelineSlotsList').innerHTML = slotsHTML;
}

/**
 * Handle drag start event
 * @param {Event} e - Drag event
 */
export function handleDragStart(e) {
    const eventId = parseInt(e.target.closest('.timeline-event').dataset.eventId);
    draggedEvent = eventId;
    e.target.closest('.timeline-event').classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * Handle drag end event
 * @param {Event} e - Drag event
 */
export function handleDragEnd(e) {
    e.target.closest('.timeline-event').classList.remove('dragging');
}

/**
 * Handle drag over event
 * @param {Event} e - Drag event
 */
export function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.target.closest('.timeline-slot').classList.add('drag-over');

    // Auto-scroll when dragging near edges
    const slotsContainer = document.querySelector('.timeline-slots');
    const rect = slotsContainer.getBoundingClientRect();
    const scrollThreshold = 100;
    const scrollSpeed = 10;

    if (e.clientY - rect.top < scrollThreshold) {
        slotsContainer.scrollTop -= scrollSpeed;
    } else if (rect.bottom - e.clientY < scrollThreshold) {
        slotsContainer.scrollTop += scrollSpeed;
    }
}

/**
 * Handle drag leave event
 * @param {Event} e - Drag event
 */
export function handleDragLeave(e) {
    e.target.closest('.timeline-slot').classList.remove('drag-over');
}

/**
 * Handle drop event
 * @param {Event} e - Drag event
 * @param {number} slotIndex - Index of the slot
 */
export function handleDrop(e, slotIndex) {
    e.preventDefault();
    e.target.closest('.timeline-slot').classList.remove('drag-over');

    if (draggedEvent) {
        // Remove from previous slot if exists
        Object.keys(timelinePlaced).forEach(key => {
            if (timelinePlaced[key] === draggedEvent) {
                delete timelinePlaced[key];
            }
        });

        // Place in new slot
        timelinePlaced[slotIndex] = draggedEvent;
        draggedEvent = null;
        renderTimeline();
    }
}

/**
 * Remove event from a slot
 * @param {number} slotIndex - Index of the slot
 */
export function removeFromSlot(slotIndex) {
    delete timelinePlaced[slotIndex];
    renderTimeline();
}

/**
 * Set timeline mode (easy or challenge)
 * @param {string} mode - 'easy' or 'challenge'
 */
export function setTimelineMode(mode) {
    timelineMode = mode;
    document.getElementById('easyModeBtn').classList.toggle('active', mode === 'easy');
    document.getElementById('challengeModeBtn').classList.toggle('active', mode === 'challenge');

    // Reset the timeline when switching modes to prevent cheating
    timelinePlaced = {};
    document.getElementById('timelineResults').innerHTML = '';

    // Re-enable check button when switching to challenge mode and reset the flag
    if (mode === 'challenge') {
        document.getElementById('checkTimelineBtn').disabled = false;
        hasCheckedInEasyMode = false;
    }

    // Remove feedback classes
    setTimeout(() => {
        document.querySelectorAll('.timeline-event').forEach(el => {
            el.classList.remove('correct', 'incorrect');
        });
    }, 100);

    renderTimeline();
}

/**
 * Check timeline answer
 */
export function checkTimelineAnswer() {
    let correct = 0;
    const results = [];

    for (let i = 1; i <= 10; i++) {
        const placedEventId = timelinePlaced[i];
        const correctEventId = i;
        const isCorrect = placedEventId === correctEventId;

        if (isCorrect) correct++;

        results.push({
            slot: i,
            placedEventId,
            correctEventId,
            isCorrect
        });
    }

    // Update progress
    timelineProgress.attempts++;
    if (correct > timelineProgress.bestScore) {
        timelineProgress.bestScore = correct;
    }
    if (correct === 10) {
        timelineProgress.perfectCount++;
        showConfetti();
    }
    saveTimelineProgress(timelineProgress);
    updateTimelineStats();

    // Show visual feedback
    results.forEach(result => {
        const slot = document.querySelector(`.timeline-slot[data-slot="${result.slot}"]`);
        const eventCard = slot?.querySelector('.timeline-event');
        if (eventCard) {
            if (result.isCorrect) {
                eventCard.classList.add('correct');
            } else {
                eventCard.classList.add('incorrect');
            }
        }
    });

    // Show results
    let resultsHTML = `
        <div class="alert ${correct === 10 ? 'success' : 'info'}" style="margin-top: 30px;">
            <i class="fas ${correct === 10 ? 'fa-trophy' : 'fa-chart-line'}"></i>
            <div>
                <h3 style="margin-bottom: 10px;">Score: ${correct} out of 10 correct!</h3>
                ${correct === 10 ? '<p><strong>Perfect! You mastered the timeline!</strong></p>' : ''}
                ${correct < 10 ? '<p>Look at the events in red - those are in the wrong position. Try again!</p>' : ''}
            </div>
        </div>
    `;

    if (correct < 10) {
        resultsHTML += '<div style="margin-top: 20px; padding: 20px; background: #fff3cd; border-radius: 10px;">';
        resultsHTML += '<h4 style="color: #856404; margin-bottom: 15px;"><i class="fas fa-lightbulb"></i> Corrections:</h4>';
        results.forEach(result => {
            if (!result.isCorrect) {
                const correctEvent = timelineEvents.find(e => e.id === result.correctEventId);
                const placedEvent = timelineEvents.find(e => e.id === result.placedEventId);
                resultsHTML += `<p style="color: #856404; margin: 8px 0;">Position ${result.slot} should be <strong>${correctEvent?.title}</strong>${placedEvent ? `, not ${placedEvent.title}` : ' (empty)'}</p>`;
            }
        });
        resultsHTML += '</div>';
    }

    document.getElementById('timelineResults').innerHTML = resultsHTML;

    // If in easy mode and first time checking, show reminder and disable button
    if (timelineMode === 'easy' && !hasCheckedInEasyMode) {
        hasCheckedInEasyMode = true;
        // Note modal reminder would be called here
        console.log('Easy mode: Write down the timeline with dates');
        // Disable check button in easy mode
        document.getElementById('checkTimelineBtn').disabled = true;
    }
}

/**
 * Show the correct timeline answer
 */
export function showTimelineAnswer() {
    // Automatically place all events in correct order
    timelinePlaced = {};
    for (let i = 1; i <= 10; i++) {
        timelinePlaced[i] = i;
    }
    renderTimeline();

    // Disable check answer button to prevent cheating
    document.getElementById('checkTimelineBtn').disabled = true;

    document.getElementById('timelineResults').innerHTML = `
        <div class="alert info" style="margin-top: 30px;">
            <i class="fas fa-eye"></i>
            <div>
                <p><strong>Answer revealed!</strong> Study the correct order, then click "Try Again" to practice.</p>
            </div>
        </div>
    `;
}

/**
 * Reset timeline to start over
 */
export function resetTimeline() {
    timelinePlaced = {};
    renderTimeline();
    document.getElementById('timelineResults').innerHTML = '';

    // Re-enable check answer button and reset easy mode flag
    document.getElementById('checkTimelineBtn').disabled = false;
    hasCheckedInEasyMode = false;

    // Remove feedback classes
    document.querySelectorAll('.timeline-event').forEach(el => {
        el.classList.remove('correct', 'incorrect');
    });
}

/**
 * Update timeline statistics display
 */
export function updateTimelineStats() {
    timelineProgress = loadTimelineProgress();
    document.getElementById('timelineStats').style.display = timelineProgress.attempts > 0 ? 'block' : 'none';
    document.getElementById('timelineBestScore').textContent = timelineProgress.bestScore;
    document.getElementById('timelinePerfectCount').textContent = timelineProgress.perfectCount;
    document.getElementById('timelineAttempts').textContent = timelineProgress.attempts;
}

/**
 * Show confetti animation for perfect score
 */
export function showConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = window.innerHeight + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 2000);
        }, i * 30);
    }
}

/**
 * Get timeline progress for external use
 */
export function getTimelineProgress() {
    return loadTimelineProgress();
}

/**
 * Get timeline placed events
 */
export function getTimelinePlaced() {
    return timelinePlaced;
}

/**
 * Get timeline mode
 */
export function getTimelineMode() {
    return timelineMode;
}
