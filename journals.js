document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const journalsContainer = document.getElementById('journals-container');

    function getJournals() {
        return JSON.parse(localStorage.getItem('journals') || '[]');
    }

    function saveJournals(journals) {
        localStorage.setItem('journals', JSON.stringify(journals));
    }

    function createDailyJournal() {
        const journals = getJournals();
        const dateKey = today.toDateString();

        // Always create a new journal
        const journal = {
            id: Date.now().toString(),
            dateKey: dateKey,
            title: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            pages: ['<p>Start writing your journal...</p>'],
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // If a journal with the same title exists, append a number
        let titleCount = 1;
        let baseTitle = journal.title;
        while (journals.some(j => j.title === journal.title)) {
            titleCount++;
            journal.title = `${baseTitle} (${titleCount})`;
        }

        journals.unshift(journal);
        saveJournals(journals);
        return journal;
    }

    function renderJournalsGrid() {
        const journals = getJournals();
        journalsContainer.innerHTML = '';

        if (journals.length === 0) {
            journalsContainer.innerHTML = '<p style="text-align: center; color: #666; margin-top: 50px;">No journals yet. Create your first journal!</p>';
            return;
        }

        journals.forEach(journal => {
            const card = document.createElement('div');
            card.className = 'journal-card';

            // Generate preview from HTML content
            let preview = 'Empty journal...';
            try {
                if (journal.pages && Array.isArray(journal.pages) && journal.pages.length > 0) {
                    const pageContent = journal.pages[0];
                    if (typeof pageContent === 'string') {
                        // Strip HTML tags for preview
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = pageContent;
                        const textContent = tempDiv.textContent || tempDiv.innerText || '';
                        preview = textContent.substring(0, 100) + (textContent.length > 100 ? '...' : '');
                    }
                }
            } catch (e) {
                console.error('Error generating preview:', e);
            }

            // Format date as requested: Day, Month Date, Year
            const dateObj = new Date(journal.created);
            const dateString = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            card.innerHTML = `
                <div class="rich-media">
                    <span>📝</span>
                </div>
                <div class="card-content">
                    <h3>${journal.title}</h3>
                    ${journal.title !== dateString ? `<div class="date">${dateString}</div>` : ''}
                    <div class="stats">
                        <span>📄 ${journal.pages.length}</span>
                        <span>✅ ${(journal.todos || []).filter(t => t.done).length}/${(journal.todos || []).length}</span>
                        <span>💾 ${(journal.savedData || []).length}</span>
                    </div>
                    <div class="journal-actions">
                        <button class="btn-edit">Edit</button>
                        <button class="btn-delete">Delete</button>
                    </div>
                </div>
            `;

            // Edit Action
            card.querySelector('.btn-edit').addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.setItem('selectedJournalId', journal.id);
                window.location.href = 'index.html';
            });

            // Delete Action
            card.querySelector('.btn-delete').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${journal.title}"? This cannot be undone.`)) {
                    // Remove from local storage
                    const updatedJournals = journals.filter(j => j.id !== journal.id);
                    saveJournals(updatedJournals);

                    // Remove from UI
                    renderJournalsGrid();

                    // Remove from JSONBin Index (Best effort)
                    try {
                        let journalsIndexBinId = localStorage.getItem('journals_index_bin_id');
                        if (journalsIndexBinId) {
                            // We need to fetch the full index, filter, and update
                            // Since we don't have the JSONBinAPI class imported here directly in the same scope easily without module system,
                            // we rely on the global JSONBinAPI if available or we might need to refactor.
                            // Yes, it is.

                            let journalsIndex = await JSONBinAPI.getBin(journalsIndexBinId) || [];
                            const newIndex = journalsIndex.filter(j => j.id !== journal.id);
                            await JSONBinAPI.updateBin(journalsIndexBinId, newIndex);
                        }
                    } catch (error) {
                        console.error("Error removing from cloud index:", error);
                    }
                }
            });

            // Card click (default to edit)
            card.addEventListener('click', () => {
                localStorage.setItem('selectedJournalId', journal.id);
                window.location.href = 'index.html';
            });

            journalsContainer.appendChild(card);
        });
    }

    // Event listeners
    document.getElementById('back-to-main').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('new-journal').addEventListener('click', () => {
        const journal = createDailyJournal();
        localStorage.setItem('selectedJournalId', journal.id);
        window.location.href = 'index.html';
    });

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        setTheme('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    renderJournalsGrid();
});