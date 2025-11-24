document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const journalsContainer = document.getElementById('journals-container');
    const journalsList = document.getElementById('journals-list');
    const journalsGrid = document.getElementById('journals-grid');
    const notebookView = document.getElementById('notebook-view');
    const journalContent = document.getElementById('journal-content');
    const journalTitle = document.getElementById('journal-title');

    let currentJournal = null;
    let currentPageIndex = 0;



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

    async function fetchJournalsList() {
        const journalsIndexBinId = localStorage.getItem('journals_index_bin_id');
        if (!journalsIndexBinId) return [];

        // Use the shared JSONBinAPI class
        const journalsIndex = await JSONBinAPI.getBin(journalsIndexBinId);
        return journalsIndex || [];
    }

    async function fetchJournal(binId) {
        // Use the shared JSONBinAPI class
        const journal = await JSONBinAPI.getBin(binId);
        return journal;
    }

    async function renderJournalsGrid(journalsIndex) {
        journalsContainer.innerHTML = '';
        journalsList.innerHTML = '';

        if (!journalsIndex || journalsIndex.length === 0) {
            journalsContainer.innerHTML = '<p style="text-align: center; color: #666; margin-top: 50px;">No journals available.</p>';
            return;
        }

        for (const journalInfo of journalsIndex) {
            // Grid card
            const card = document.createElement('div');
            card.className = 'journal-card';
            card.innerHTML = `
                <div class="rich-media">
                    <span>📝</span>
                </div>
                <div class="card-content">
                    <h3>${journalInfo.title}</h3>
                    ${journalInfo.title !== new Date(journalInfo.created).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) ? `<div class="date">${new Date(journalInfo.created).toLocaleDateString()}</div>` : ''}
                    <div class="stats">
                        <span>📄 ${journalInfo.pages}</span>
                        <span>✅ ${journalInfo.todoDone || 0}/${journalInfo.todoCount || 0}</span>
                        <span>💾 ${journalInfo.savedDataCount || 0}</span>
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
                // We need to set the ID so script.js can load it
                localStorage.setItem('selectedJournalId', journalInfo.id);
                window.location.href = 'index.html';
            });

            // Delete Action
            card.querySelector('.btn-delete').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${journalInfo.title}"? This cannot be undone.`)) {
                    card.style.opacity = '0.5';
                    try {
                        // Update Cloud Index
                        const journalsIndexBinId = localStorage.getItem('journals_index_bin_id');
                        if (journalsIndexBinId) {
                            // Filter out the deleted journal from the current list
                            const newIndex = journalsIndex.filter(j => j.id !== journalInfo.id);
                            await JSONBinAPI.updateBin(journalsIndexBinId, newIndex);

                            // Also try to delete the individual bin if we have the ID (optional, but good cleanup)
                            // JSONBin doesn't support deleting bins via this simple API wrapper easily without the ID, 
                            // and we only have the binId in the index.
                            // For now, just updating the index is sufficient to "hide" it.
                        }

                        // Update Local Storage (if it exists there too)
                        const localJournals = JSON.parse(localStorage.getItem('journals') || '[]');
                        const updatedLocal = localJournals.filter(j => j.id !== journalInfo.id);
                        localStorage.setItem('journals', JSON.stringify(updatedLocal));

                        // Refresh Grid
                        renderJournalsGrid(await fetchJournalsList());
                    } catch (error) {
                        console.error("Error deleting journal:", error);
                        alert("Failed to delete journal.");
                        card.style.opacity = '1';
                    }
                }
            });

            card.addEventListener('click', async () => {
                try {
                    card.style.opacity = '0.5';
                    const fullJournal = await fetchJournal(journalInfo.binId);
                    card.style.opacity = '1';
                    if (fullJournal) loadJournal(fullJournal);
                } catch (error) {
                    console.error("Error loading journal", error);
                    card.style.opacity = '1';
                    alert("Failed to load journal. Check console.");
                }
            });
            journalsContainer.appendChild(card);

            // Sidebar list
            const li = document.createElement('li');
            li.textContent = journalInfo.title;
            li.addEventListener('click', async () => {
                const fullJournal = await fetchJournal(journalInfo.binId);
                if (fullJournal) loadJournal(fullJournal);
            });
            journalsList.appendChild(li);
        }
    }

    function loadJournal(journal) {
        currentJournal = journal;
        currentPageIndex = 0;
        journalTitle.textContent = journal.title;
        loadCurrentPage();
        showNotebookView();
    }

    function loadCurrentPage() {
        if (currentJournal && currentJournal.pages[currentPageIndex]) {
            journalContent.innerHTML = currentJournal.pages[currentPageIndex];
        }
        document.getElementById('page-footer').textContent = `Page ${currentPageIndex + 1}`;
        updatePageInfo();
    }

    function updatePageInfo() {
        if (currentJournal) {
            document.getElementById('page-info').textContent = `Page ${currentPageIndex + 1} of ${currentJournal.pages.length}`;
            document.getElementById('prev-page').disabled = currentPageIndex === 0;
            document.getElementById('next-page').disabled = currentPageIndex === currentJournal.pages.length - 1;
        }
    }

    function showJournalsGrid() {
        journalsGrid.classList.add('active');
        notebookView.classList.remove('active');
        document.getElementById('page-navigation').style.display = 'none';
    }

    function showNotebookView() {
        journalsGrid.classList.remove('active');
        notebookView.classList.add('active');
        document.getElementById('page-navigation').style.display = 'block';
    }

    // Event listeners
    document.getElementById('refresh-journals').addEventListener('click', async () => {
        const btn = document.getElementById('refresh-journals');
        btn.textContent = 'Refreshing...';
        const journalsIndex = await fetchJournalsList();
        await renderJournalsGrid(journalsIndex);
        btn.textContent = '🔄 Refresh';
    });

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            loadCurrentPage();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentJournal && currentPageIndex < currentJournal.pages.length - 1) {
            currentPageIndex++;
            loadCurrentPage();
        }
    });

    // Initial load
    fetchJournalsList().then(journalsIndex => {
        renderJournalsGrid(journalsIndex);
    });
});