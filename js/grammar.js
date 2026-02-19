// js/grammar.js - Logic for the interactive grammar exercises on grammar.html
// Attaches listeners to static HTML and provides feedback.

document.addEventListener('DOMContentLoaded', () => {

    // --- DATA (Source of Truth) ---
    const unscrambleData = [
        { jumbled: "Leo young is picture in the first", correctQuestion: "Is Leo young in the first picture", answerKeywords: ["yes"], answerMatchMode: "any" },
        { jumbled: "Sofia shy adolescent an as is", correctQuestion: "Is Sofia shy as an adolescent", answerKeywords: ["yes"], answerMatchMode: "any" },
        { jumbled: "Leo's personality like what is he meets Sofia when", correctQuestion: "What is Leo's personality like when he meets Sofia", answerKeywords: ["friendly"], answerMatchMode: "any" },
        { jumbled: "Sofia's trait main what is project the during science", correctQuestion: "What is Sofia's main trait during the science project", answerKeywords: ["serious"], answerMatchMode: "any" },
        { jumbled: "Leo handsome is man a as older when", correctQuestion: "Is Leo handsome when he is an older man", answerKeywords: ["yes"], answerMatchMode: "any" },
        { jumbled: "talkative Sofia adult an as is", correctQuestion: "Is Sofia talkative as an adult", answerKeywords: ["yes", "talkative"], answerMatchMode: "any" }, // From vocab page
        { jumbled: "Leo and Sofia happy are end the in story of the", correctQuestion: "Are Leo and Sofia happy in the end of the story", answerKeywords: ["yes"], answerMatchMode: "any" },
        { jumbled: "dog their cute is", correctQuestion: "Is their dog cute", answerKeywords: ["yes"], answerMatchMode: "any" },
        { jumbled: "what Sofia like is she helps Leo when study", correctQuestion: "What is Sofia like when she helps Leo study", answerKeywords: ["smart", "kind"], answerMatchMode: "all" },
        { jumbled: "unfriendly Sofia is argument the after moment for a", correctQuestion: "Is Sofia unfriendly for a moment after the argument", answerKeywords: ["yes"], answerMatchMode: "any" }
    ];

    const quizData = [
        { question: "Is Leo friendly in Scene 1?", answerKeywords: ["yes"], answerMatchMode: "any" },
        { question: "Is Sofia serious about the school project in Scene 2?", answerKeywords: ["yes"], answerMatchMode: "any" },
        { question: "What is Sofia like when she helps Leo study for the test in Scene 3?", answerKeywords: ["smart", "kind"], answerMatchMode: "all" },
        { question: "Is Sofia unfriendly during the argument in Scene 4?", answerKeywords: ["yes"], answerMatchMode: "any" },
        { question: "Where are Leo and Sofia in Scene 6? Is the place interesting?", answerKeywords: ["interesting"], contextKeywords: ["market", "trip"], answerMatchMode: "all" },
        { question: "Is Sofia slim and pleasant in Scene 7?", answerKeywords: ["yes"], answerMatchMode: "any" },
        { question: "Are Leo and Sofia good-looking in Scene 10?", answerKeywords: ["yes"], answerMatchMode: "any" },
        { question: "Is their dog cute?", answerKeywords: ["yes"], answerMatchMode: "any" }
    ];

    // --- LOGIC ---
    const unscrambleSection = document.getElementById('unscramble-section');
    const quizSection = document.getElementById('quiz-section');
    const checkedCountEl = document.getElementById('grammarCheckedCount');
    const correctCountEl = document.getElementById('grammarCorrectCount');
    const streakCountEl = document.getElementById('grammarStreakCount');
    const resetGrammarProgressBtn = document.getElementById('resetGrammarProgress');
    const grammarStatsStorageKey = 'grammarPracticeStats';
    let draggedToken = null;

    function readGrammarStats() {
        const fallback = { checked: 0, correct: 0, streak: 0 };
        try {
            const raw = localStorage.getItem(grammarStatsStorageKey);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return {
                checked: Number.isFinite(parsed.checked) ? parsed.checked : 0,
                correct: Number.isFinite(parsed.correct) ? parsed.correct : 0,
                streak: Number.isFinite(parsed.streak) ? parsed.streak : 0
            };
        } catch (error) {
            return fallback;
        }
    }

    function writeGrammarStats(stats) {
        localStorage.setItem(grammarStatsStorageKey, JSON.stringify(stats));
    }

    function updateGrammarStatsUI(stats) {
        if (checkedCountEl) checkedCountEl.textContent = String(stats.checked);
        if (correctCountEl) correctCountEl.textContent = String(stats.correct);
        if (streakCountEl) streakCountEl.textContent = String(stats.streak);
    }

    let grammarStats = readGrammarStats();
    updateGrammarStatsUI(grammarStats);

    /**
     * Creates a draggable token button for the word builder.
     * @param {string} word The token text.
     * @param {string} tokenId Unique token id.
     * @param {number} itemIndex Unscramble item index.
     * @returns {HTMLButtonElement}
     */
    function createWordToken(word, tokenId, itemIndex) {
        const token = document.createElement('button');
        token.type = 'button';
        token.className = 'word-token';
        token.draggable = true;
        token.dataset.word = word;
        token.dataset.tokenId = tokenId;
        token.dataset.itemIndex = String(itemIndex);
        token.textContent = word;

        token.addEventListener('dragstart', (event) => {
            draggedToken = token;
            token.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
        });

        token.addEventListener('dragend', () => {
            token.classList.remove('dragging');
            draggedToken = null;
        });

        // Tap/click fallback for environments with poor drag support.
        token.addEventListener('click', () => {
            const index = Number(token.dataset.itemIndex);
            const bank = document.getElementById(`word-bank-${index}`);
            const drop = document.getElementById(`drop-zone-${index}`);
            if (!bank || !drop) return;

            if (token.parentElement === bank) {
                drop.appendChild(token);
            } else {
                bank.appendChild(token);
            }
            updateUnscrambleQuestionInput(index);
        });

        return token;
    }

    /**
     * Syncs the hidden/readonly question input with the current drop-zone token order.
     * @param {number} index Unscramble item index.
     */
    function updateUnscrambleQuestionInput(index) {
        const dropZone = document.getElementById(`drop-zone-${index}`);
        const questionInput = document.getElementById(`unscramble-q-${index}`);
        if (!dropZone || !questionInput) return;

        const orderedWords = Array.from(dropZone.querySelectorAll('.word-token')).map((token) => token.dataset.word || '');
        questionInput.value = orderedWords.join(' ').trim();
    }

    /**
     * Handles drop behavior for word-bank and drop-zone containers.
     * @param {DragEvent} event Drag event.
     * @param {HTMLElement} container Target container.
     */
    function handleTokenDrop(event, container) {
        event.preventDefault();
        if (!draggedToken) return;

        const targetElement = event.target instanceof Element ? event.target : null;
        const hoverToken = targetElement ? targetElement.closest('.word-token') : null;
        if (hoverToken && hoverToken !== draggedToken && hoverToken.parentElement === container) {
            const bounds = hoverToken.getBoundingClientRect();
            const placeAfter = event.clientX > bounds.left + bounds.width / 2;
            if (placeAfter) {
                hoverToken.after(draggedToken);
            } else {
                hoverToken.before(draggedToken);
            }
        } else {
            container.appendChild(draggedToken);
        }

        const index = Number(draggedToken.dataset.itemIndex);
        updateUnscrambleQuestionInput(index);
    }

    /**
     * Initializes drag-and-drop builders for each unscramble item.
     */
    function initializeUnscrambleBuilders() {
        const exerciseItems = document.querySelectorAll('#unscramble-section .exercise-item');

        exerciseItems.forEach((item, index) => {
            const jumbledWordsEl = item.querySelector('.jumbled-words');
            const questionInput = document.getElementById(`unscramble-q-${index}`);
            if (!jumbledWordsEl || !questionInput || !unscrambleData[index]) return;

            questionInput.readOnly = true;
            questionInput.placeholder = 'Drag words into the target area to build your question.';

            const words = unscrambleData[index].jumbled.split(' ');
            const dragBuilder = document.createElement('div');
            dragBuilder.className = 'drag-builder';
            dragBuilder.innerHTML = `
                <p class="builder-label">Word bank (drag or tap):</p>
                <div class="word-bank" id="word-bank-${index}" aria-label="Word bank ${index + 1}"></div>
                <p class="builder-label">Question builder:</p>
                <div class="drop-zone" id="drop-zone-${index}" aria-label="Question builder ${index + 1}"></div>
                <button type="button" class="builder-clear-btn" data-index="${index}">Clear arrangement</button>
            `;

            jumbledWordsEl.insertAdjacentElement('afterend', dragBuilder);

            const wordBank = document.getElementById(`word-bank-${index}`);
            const dropZone = document.getElementById(`drop-zone-${index}`);
            const clearBtn = dragBuilder.querySelector('.builder-clear-btn');
            if (!wordBank || !dropZone || !clearBtn) return;

            const tokens = words.map((word, tokenIndex) => createWordToken(word, `${index}-${tokenIndex}`, index));
            tokens.forEach((token) => wordBank.appendChild(token));

            [wordBank, dropZone].forEach((container) => {
                container.addEventListener('dragover', (event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                });
                container.addEventListener('drop', (event) => {
                    handleTokenDrop(event, container);
                });
            });

            clearBtn.addEventListener('click', () => {
                tokens.forEach((token) => wordBank.appendChild(token));
                updateUnscrambleQuestionInput(index);
            });
        });
    }

    /**
     * Normalizes a string for comparison (lowercase, trims whitespace, removes punctuation).
     * @param {string} str The string to normalize.
     * @returns {string} The normalized string.
     */
    function normalizeString(str) {
        if (typeof str !== 'string') return '';
        return str.toLowerCase().trim().replace(/[?.!,]/g, '');
    }

    /**
     * Checks whether a normalized answer includes required keywords.
     * Uses `all` mode when every keyword is mandatory; otherwise accepts any keyword.
     * @param {string} normalizedAnswer Normalized user answer.
     * @param {string[]} keywords Keywords that can/should appear in the answer.
     * @param {'any'|'all'} matchMode Matching mode.
     * @returns {boolean}
     */
    function matchesKeywords(normalizedAnswer, keywords = [], matchMode = 'any') {
        if (!Array.isArray(keywords) || keywords.length === 0) return false;
        if (matchMode === 'all') {
            return keywords.every(keyword => normalizedAnswer.includes(keyword));
        }
        return keywords.some(keyword => normalizedAnswer.includes(keyword));
    }

    /**
     * Handles the click event for any 'Check' button within a specified section.
     * @param {Event} e The click event.
     */
    function checkAnswer(e) {
        if (!e.target.matches('.check-btn')) return;

        const button = e.target;
        const type = button.dataset.type;
        const index = parseInt(button.dataset.index, 10);
        
        let feedbackText = '';
        let isCorrect = false;

        if (type === 'unscramble') {
            const data = unscrambleData[index];
            const userQuestion = document.getElementById(`unscramble-q-${index}`).value;
            const userAnswer = document.getElementById(`unscramble-a-${index}`).value;
            const feedbackEl = document.getElementById(`feedback-unscramble-${index}`);

            const normalizedUserQ = normalizeString(userQuestion);
            const normalizedCorrectQ = normalizeString(data.correctQuestion);
            const normalizedUserA = normalizeString(userAnswer);

            if (!normalizedUserQ) {
                feedbackText = 'First, drag the words to build the complete question.';
            } else if (normalizedUserQ === normalizedCorrectQ) {
                if (matchesKeywords(normalizedUserA, data.answerKeywords, data.answerMatchMode)) {
                    feedbackText = 'Excellent! Both parts are correct.';
                    isCorrect = true;
                } else {
                    feedbackText = 'Your question is correct, but check your answer about the story.';
                }
            } else {
                feedbackText = 'Not quite. Please check the word order of your question.';
            }
            updateFeedback(feedbackEl, feedbackText, isCorrect);

        } else if (type === 'quiz') {
            const data = quizData[index];
            const userAnswer = document.getElementById(`quiz-a-${index}`).value;
            const feedbackEl = document.getElementById(`feedback-quiz-${index}`);
            
            const normalizedUserA = normalizeString(userAnswer);

            const mainAnswerMatches = matchesKeywords(normalizedUserA, data.answerKeywords, data.answerMatchMode);
            const contextMatches = data.contextKeywords ? matchesKeywords(normalizedUserA, data.contextKeywords, 'any') : true;

            if (mainAnswerMatches && contextMatches) {
                feedbackText = 'Correct!';
                isCorrect = true;
            } else {
                feedbackText = 'Incorrect. Try reading the story again!';
            }
            updateFeedback(feedbackEl, feedbackText, isCorrect);
        }

        grammarStats.checked += 1;
        if (isCorrect) {
            grammarStats.correct += 1;
            grammarStats.streak += 1;
            if (window.labProgress) {
                window.labProgress.addPoints(2);
            }
        } else {
            grammarStats.streak = 0;
            if (window.labProgress) {
                window.labProgress.recordAction(0);
            }
        }

        writeGrammarStats(grammarStats);
        updateGrammarStatsUI(grammarStats);
    }

    /**
     * Updates the feedback element with a message and styles it for correctness.
     * @param {HTMLElement} element The feedback element to update.
     * @param {string} text The message to display.
     * @param {boolean} isCorrect Whether the answer was correct.
     */
    function updateFeedback(element, text, isCorrect) {
        element.textContent = text;
        element.className = 'feedback-area visible'; // Make it visible
        if (isCorrect) {
            element.classList.add('feedback-correct');
            element.classList.remove('feedback-incorrect');
        } else {
            element.classList.add('feedback-incorrect');
            element.classList.remove('feedback-correct');
        }
    }

    // --- INITIALIZATION ---
    // Attach listeners only if the sections exist on the page
    if (unscrambleSection) {
        initializeUnscrambleBuilders();
        unscrambleSection.addEventListener('click', checkAnswer);
    }
    if (quizSection) {
        quizSection.addEventListener('click', checkAnswer);
    }

    if (resetGrammarProgressBtn) {
        resetGrammarProgressBtn.addEventListener('click', () => {
            grammarStats = { checked: 0, correct: 0, streak: 0 };
            writeGrammarStats(grammarStats);
            updateGrammarStatsUI(grammarStats);

            document.querySelectorAll('.feedback-area').forEach((feedbackEl) => {
                feedbackEl.textContent = '';
                feedbackEl.className = 'feedback-area';
            });
        });
    }
});
