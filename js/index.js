// js/index.js - Interactive logic for the vocabulary page (index.html).

document.addEventListener('DOMContentLoaded', () => {
    const imageContainers = document.querySelectorAll('.image-container');
    const exploredCountEl = document.getElementById('cardsExploredCount');
    const choiceButtons = document.querySelectorAll('.choice-btn');
    const vocabFeedback = document.getElementById('vocabFeedback');

    const exploredStorageKey = 'vocabExploredWords';
    const quickCheckStorageKey = 'vocabQuickCheckSolved';
    const correctQuickCheckAnswer = 'talkative';

    function readExploredWords() {
        try {
            const raw = localStorage.getItem(exploredStorageKey);
            if (!raw) return new Set();
            const parsed = JSON.parse(raw);
            return new Set(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            return new Set();
        }
    }

    function writeExploredWords(wordsSet) {
        localStorage.setItem(exploredStorageKey, JSON.stringify(Array.from(wordsSet)));
    }

    function updateExploredUI(wordsSet) {
        if (!exploredCountEl) return;
        exploredCountEl.textContent = String(wordsSet.size);
    }

    const exploredWords = readExploredWords();
    updateExploredUI(exploredWords);

    imageContainers.forEach(container => {
        const handleInteraction = () => {
            imageContainers.forEach(c => c.classList.remove('highlight'));
            container.classList.add('highlight');

            const word = container.dataset.word;
            if (word && !exploredWords.has(word)) {
                exploredWords.add(word);
                writeExploredWords(exploredWords);
                updateExploredUI(exploredWords);
                if (window.labProgress) {
                    window.labProgress.addPoints(2);
                }
            } else if (window.labProgress) {
                window.labProgress.recordAction(0);
            }

            setTimeout(() => {
                container.classList.remove('highlight');
            }, 1200);
        };

        container.addEventListener('click', handleInteraction);

        container.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleInteraction();
            }
        });
    });

    choiceButtons.forEach(button => {
        button.addEventListener('click', () => {
            choiceButtons.forEach(btn => {
                btn.classList.remove('is-correct', 'is-wrong');
            });

            const selectedChoice = button.dataset.choice;
            const isCorrect = selectedChoice === correctQuickCheckAnswer;

            if (isCorrect) {
                button.classList.add('is-correct');
                if (vocabFeedback) {
                    vocabFeedback.textContent = 'Great job. Sofia at age 30 is talkative.';
                    vocabFeedback.classList.remove('error');
                }

                if (localStorage.getItem(quickCheckStorageKey) !== 'true') {
                    localStorage.setItem(quickCheckStorageKey, 'true');
                    if (window.labProgress) {
                        window.labProgress.addPoints(4);
                    }
                } else if (window.labProgress) {
                    window.labProgress.recordAction(0);
                }
            } else {
                button.classList.add('is-wrong');
                if (vocabFeedback) {
                    vocabFeedback.textContent = 'Try again. Look at the Sofia cards one more time.';
                    vocabFeedback.classList.add('error');
                }
                if (window.labProgress) {
                    window.labProgress.recordAction(0);
                }
            }
        });
    });
});
