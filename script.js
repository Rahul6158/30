document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const horizontalLinesContainer = document.querySelector('.horizontal-lines');
    const LINES_PER_PAGE = 30;
    let currentJournalId = null;
    let currentPageIndex = 0;

    function initializeLines() {
        if (!horizontalLinesContainer.innerHTML.trim()) {
            horizontalLinesContainer.innerHTML = '<p>Start writing your journal...</p>';
        }
    }

    function getJournals() {
        return JSON.parse(localStorage.getItem('journals') || '[]');
    }

    function saveJournals(journals) {
        localStorage.setItem('journals', JSON.stringify(journals));
    }

    // Function to enable/disable tools panel
    function updateToolsPanelState(enabled) {
        const newTodoInput = document.getElementById('new-todo');
        const addTodoBtn = document.getElementById('add-todo-btn');
        const dataNoteInput = document.getElementById('data-note');
        const saveDataBtn = document.getElementById('save-data-btn');

        if (enabled) {
            newTodoInput.disabled = false;
            addTodoBtn.disabled = false;
            dataNoteInput.disabled = false;
            saveDataBtn.disabled = false;
            newTodoInput.placeholder = 'Add a new task...';
            dataNoteInput.placeholder = 'Enter important information...';
        } else {
            newTodoInput.disabled = true;
            addTodoBtn.disabled = true;
            dataNoteInput.disabled = true;
            saveDataBtn.disabled = true;
            newTodoInput.placeholder = 'Create a journal first...';
            dataNoteInput.placeholder = 'Create a journal first...';
        }
    }

    // Initialize with disabled state
    updateToolsPanelState(false);

    // Todo List Logic
    const todoList = document.getElementById('todo-list');
    const newTodoInput = document.getElementById('new-todo');
    const addTodoBtn = document.getElementById('add-todo-btn');

    function renderTodos(todos) {
        // Sort: incomplete first, completed last
        const sortedTodos = [...todos].sort((a, b) => {
            if (a.done === b.done) return 0;
            return a.done ? 1 : -1;
        });

        todoList.innerHTML = '';
        sortedTodos.forEach((todo, originalIndex) => {
            const actualIndex = todos.indexOf(todo);
            const li = document.createElement('li');
            li.className = `todo-item ${todo.done ? 'completed' : ''}`;

            // Check if in edit mode
            const isEditing = todo.editing || false;

            li.innerHTML = `
                <button class="todo-tick" title="${todo.done ? 'Mark incomplete' : 'Mark complete'}">${todo.done ? '✓' : '○'}</button>
                ${isEditing
                    ? `<input type="text" class="todo-edit-input" value="${todo.text}">
                       <button class="todo-save">💾</button>`
                    : `<span class="todo-text">${todo.text}</span>
                       <button class="todo-edit-btn">✏️</button>`
                }
                <button class="delete-todo">🗑️</button>
            `;

            // Tick button handler
            li.querySelector('.todo-tick').addEventListener('click', () => {
                const journals = getJournals();
                const journal = journals.find(j => j.id === currentJournalId);
                if (journal && journal.todos && journal.todos[actualIndex]) {
                    journal.title = document.querySelector('.page-header').textContent;
                    journal.pages[currentPageIndex] = horizontalLinesContainer.innerHTML;
                    journal.lastModified = new Date().toISOString();

                    journal.todos[actualIndex].done = !journal.todos[actualIndex].done;

                    saveJournals(journals);
                    renderTodos(journal.todos);
                    saveCurrentPage();
                }
            });

            // Edit button handler
            if (!isEditing) {
                li.querySelector('.todo-edit-btn').addEventListener('click', () => {
                    const journals = getJournals();
                    const journal = journals.find(j => j.id === currentJournalId);
                    if (journal && journal.todos && journal.todos[actualIndex]) {
                        journal.todos[actualIndex].editing = true;
                        saveJournals(journals);
                        renderTodos(journal.todos);
                    }
                });
            } else {
                // Save button handler
                li.querySelector('.todo-save').addEventListener('click', () => {
                    const journals = getJournals();
                    const journal = journals.find(j => j.id === currentJournalId);
                    const input = li.querySelector('.todo-edit-input');
                    if (journal && journal.todos && journal.todos[actualIndex] && input.value.trim()) {
                        journal.title = document.querySelector('.page-header').textContent;
                        journal.pages[currentPageIndex] = horizontalLinesContainer.innerHTML;
                        journal.lastModified = new Date().toISOString();

                        journal.todos[actualIndex].text = input.value.trim();
                        journal.todos[actualIndex].editing = false;

                        saveJournals(journals);
                        renderTodos(journal.todos);
                        saveCurrentPage();
                    }
                });

                // Enter key to save
                li.querySelector('.todo-edit-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        li.querySelector('.todo-save').click();
                    }
                });
            }

            // Delete button handler
            li.querySelector('.delete-todo').addEventListener('click', () => {
                const journals = getJournals();
                const journal = journals.find(j => j.id === currentJournalId);
                if (journal && journal.todos) {
                    journal.title = document.querySelector('.page-header').textContent;
                    journal.pages[currentPageIndex] = horizontalLinesContainer.innerHTML;
                    journal.lastModified = new Date().toISOString();

                    journal.todos.splice(actualIndex, 1);

                    saveJournals(journals);
                    renderTodos(journal.todos);
                    saveCurrentPage();
                }
            });

            todoList.appendChild(li);
        });
    }

    addTodoBtn.addEventListener('click', () => {
        const text = newTodoInput.value.trim();
        if (text && currentJournalId) {
            const journals = getJournals();
            const journal = journals.find(j => j.id === currentJournalId);
            if (journal) {
                journal.title = document.querySelector('.page-header').textContent;
                journal.pages[currentPageIndex] = horizontalLinesContainer.innerHTML;
                journal.lastModified = new Date().toISOString();

                if (!journal.todos) journal.todos = [];
                journal.todos.push({ text, done: false, editing: false });

                saveJournals(journals);
                newTodoInput.value = '';
                renderTodos(journal.todos);
                saveCurrentPage();
            }
        }
    });

    // Data Saver Logic
    const savedDataList = document.getElementById('saved-data-list');
    const saveDataBtn = document.getElementById('save-data-btn');
    const dataNoteInput = document.getElementById('data-note');

    function renderSavedData(dataList) {
        savedDataList.innerHTML = '';
        dataList.forEach((data, index) => {
            const div = document.createElement('div');
            div.className = 'saved-data-item';

            div.innerHTML = `
                <div class="data-content">${data.note}</div>
                <button class="delete-data">🗑️</button>
            `;

            div.querySelector('.delete-data').addEventListener('click', () => {
                const journals = getJournals();
                const journal = journals.find(j => j.id === currentJournalId);
                if (journal && journal.savedData) {
                    journal.title = document.querySelector('.page-header').textContent;
                    journal.pages[currentPageIndex] = horizontalLinesContainer.innerHTML;
                    journal.lastModified = new Date().toISOString();

                    journal.savedData.splice(index, 1);

                    saveJournals(journals);
                    renderSavedData(journal.savedData);
                    saveCurrentPage();
                }
            });

            savedDataList.appendChild(div);
        });
    }

    saveDataBtn.addEventListener('click', () => {
        if (!currentJournalId) return;

        const note = dataNoteInput.value.trim();

        if (note) {
            const journals = getJournals();
            const journal = journals.find(j => j.id === currentJournalId);
            if (journal) {
                journal.title = document.querySelector('.page-header').textContent;
                journal.pages[currentPageIndex] = horizontalLinesContainer.innerHTML;
                journal.lastModified = new Date().toISOString();

                if (!journal.savedData) journal.savedData = [];
                journal.savedData.push({ note, timestamp: new Date().toISOString() });

                dataNoteInput.value = '';

                saveJournals(journals);
                renderSavedData(journal.savedData);
                saveCurrentPage();
            }
        }
    });

    function createDailyJournal() {
        const journals = getJournals();
        const dateKey = today.toDateString();

        // Always create a new journal
        const journal = {
            id: Date.now().toString(),
            dateKey: dateKey,
            title: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            pages: ['<p>Start writing your journal...</p>'],
            todos: [],
            savedData: [],
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

    function loadJournal(journal) {
        currentJournalId = journal.id;
        currentPageIndex = 0;
        document.querySelector('.page-header').textContent = journal.title;
        loadCurrentPage();
        updatePageInfo();

        // Initialize arrays if missing (backward compatibility)
        if (!journal.todos) journal.todos = [];
        if (!journal.savedData) journal.savedData = [];

        renderTodos(journal.todos);
        renderSavedData(journal.savedData);

        document.getElementById('editor-buttons').style.display = 'flex';
        document.getElementById('formatting-toolbar').style.display = 'block';
        document.getElementById('page-navigation').style.display = 'block';

        // Enable tools panel
        updateToolsPanelState(true);
    }

    function loadCurrentPage() {
        const journals = getJournals();
        const journal = journals.find(j => j.id === currentJournalId);
        if (journal && journal.pages[currentPageIndex]) {
            horizontalLinesContainer.innerHTML = journal.pages[currentPageIndex] || '<p>Start writing...</p>';
        }
        document.querySelector('.page-footer').textContent = `Page ${currentPageIndex + 1}`;
    }

    async function saveCurrentPage() {
        if (!currentJournalId) return;
        const journals = getJournals();
        const journal = journals.find(j => j.id === currentJournalId);
        if (journal) {
            journal.title = document.querySelector('.page-header').textContent;
            journal.pages[currentPageIndex] = horizontalLinesContainer.innerHTML;
            journal.lastModified = new Date().toISOString();

            // Ensure todos and savedData are up to date in the journal object
            // Note: We are modifying the journal object directly in the event listeners, 
            // so we just need to save the 'journals' array to localStorage here.

            saveJournals(journals);

            // Save to JSONBin
            if (!journal.binId) {
                const newBinId = await JSONBinAPI.createBin(journal, journal.title);
                if (newBinId) {
                    journal.binId = newBinId;
                    saveJournals(journals);
                    await updateJournalsIndex(journal);
                } else {
                    console.error('Failed to create bin on JSONBin');
                }
            } else {
                await JSONBinAPI.updateBin(journal.binId, journal);
                await updateJournalsIndex(journal);
            }
        }
    }

    async function updateJournalsIndex(journal) {
        try {
            let journalsIndexBinId = localStorage.getItem('journals_index_bin_id');
            let journalsIndex = [];

            if (journalsIndexBinId) {
                journalsIndex = await JSONBinAPI.getBin(journalsIndexBinId) || [];
            }

            const existingIndex = journalsIndex.findIndex(j => j.id === journal.id);

            const indexEntry = {
                id: journal.id,
                binId: journal.binId,
                title: journal.title,
                created: journal.created,
                lastModified: journal.lastModified,
                pages: journal.pages.length,
                todoCount: (journal.todos || []).length,
                todoDone: (journal.todos || []).filter(t => t.done).length,
                savedDataCount: (journal.savedData || []).length
            };

            if (existingIndex >= 0) {
                journalsIndex[existingIndex] = indexEntry;
            } else {
                journalsIndex.unshift(indexEntry);
            }

            if (journalsIndexBinId) {
                // Update existing bin
                await JSONBinAPI.updateBin(journalsIndexBinId, journalsIndex);
            } else {
                // Create new index bin
                journalsIndexBinId = await JSONBinAPI.createBin(journalsIndex, 'journals-index');
                if (journalsIndexBinId) {
                    localStorage.setItem('journals_index_bin_id', journalsIndexBinId);
                }
            }
        } catch (error) {
            console.error('Error updating journals index:', error);
        }
    }

    function addNewPage() {
        const journals = getJournals();
        const journal = journals.find(j => j.id === currentJournalId);
        if (journal) {
            journal.pages.push('<p>New page...</p>');
            currentPageIndex = journal.pages.length - 1;
            saveJournals(journals);
            loadCurrentPage();
            updatePageInfo();
        }
    }

    function updatePageInfo() {
        const journals = getJournals();
        const journal = journals.find(j => j.id === currentJournalId);
        if (journal) {
            document.getElementById('page-info').textContent = `Page ${currentPageIndex + 1} of ${journal.pages.length}`;
            document.getElementById('prev-page').disabled = currentPageIndex === 0;
            document.getElementById('next-page').disabled = currentPageIndex === journal.pages.length - 1;
        }
    }

    // Event listeners
    document.getElementById('view-journals').addEventListener('click', () => {
        window.location.href = 'journals.html';
    });

    document.getElementById('back-to-journals').addEventListener('click', () => {
        window.location.href = 'journals.html';
    });

    document.getElementById('new-journal').addEventListener('click', () => {
        const journal = createDailyJournal();
        loadJournal(journal);
    });

    document.getElementById('add-page').addEventListener('click', addNewPage);

    document.getElementById('save-journal').addEventListener('click', () => {
        saveCurrentPage();
        // Visual feedback
        const saveBtn = document.getElementById('save-journal');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        setTimeout(() => {
            saveBtn.textContent = originalText;
        }, 2000);
    });

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPageIndex > 0) {
            saveCurrentPage();
            currentPageIndex--;
            loadCurrentPage();
            updatePageInfo();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const journals = getJournals();
        const journal = journals.find(j => j.id === currentJournalId);
        if (journal && currentPageIndex < journal.pages.length - 1) {
            saveCurrentPage();
            currentPageIndex++;
            loadCurrentPage();
            updatePageInfo();
        }
    });

    // Formatting functions
    function execCommand(command, value = null) {
        document.execCommand(command, false, value);
        horizontalLinesContainer.focus();
    }

    // Formatting event listeners
    document.getElementById('bold-btn').addEventListener('click', () => execCommand('bold'));
    document.getElementById('italic-btn').addEventListener('click', () => execCommand('italic'));
    document.getElementById('underline-btn').addEventListener('click', () => execCommand('underline'));
    document.getElementById('heading-btn').addEventListener('click', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const parentElement = range.commonAncestorContainer.nodeType === 3 ?
                range.commonAncestorContainer.parentElement : range.commonAncestorContainer;

            if (parentElement.tagName === 'H2') {
                execCommand('formatBlock', 'p');
                document.getElementById('heading-btn').classList.remove('active');
            } else {
                execCommand('formatBlock', 'h2');
                document.getElementById('heading-btn').classList.add('active');
            }
        }
    });
    document.getElementById('bullet-btn').addEventListener('click', () => execCommand('insertUnorderedList'));
    document.getElementById('number-btn').addEventListener('click', () => execCommand('insertOrderedList'));

    // Update formatting button states
    function updateFormatButtons() {
        document.getElementById('bold-btn').classList.toggle('active', document.queryCommandState('bold'));
        document.getElementById('italic-btn').classList.toggle('active', document.queryCommandState('italic'));
        document.getElementById('underline-btn').classList.toggle('active', document.queryCommandState('underline'));
    }

    horizontalLinesContainer.addEventListener('mouseup', updateFormatButtons);
    horizontalLinesContainer.addEventListener('keyup', updateFormatButtons);

    // Auto-save
    let saveTimeout;
    horizontalLinesContainer.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveCurrentPage, 2000);
    });

    document.querySelector('.page-header').addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveCurrentPage, 2000);
    });

    // Initialize
    initializeLines();

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

    // Check if coming from journals page with selected journal
    const selectedJournalId = localStorage.getItem('selectedJournalId');
    if (selectedJournalId) {
        const journals = getJournals();
        const journal = journals.find(j => j.id === selectedJournalId);
        if (journal) {
            loadJournal(journal);
        }
        localStorage.removeItem('selectedJournalId');
    }
});