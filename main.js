document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const auth = document.getElementById('auth');
    const mainApp = document.getElementById('mainApp');

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    const createNoteBtn = document.getElementById('createNoteBtn');
    const searchInput = document.getElementById('searchInput');
    const archivedNotesBtn = document.getElementById('archivedNotesBtn');
    const trashedNotesBtn = document.getElementById('trashedNotesBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const homeBtn = document.getElementById('homeBtn');

    const notesContainer = document.getElementById('notesContainer');

    const noteModal = document.getElementById('noteModal');
    const noteForm = document.getElementById('noteForm');
    const closeNoteModalBtn = document.getElementById('closeNoteModalBtn');

    let token = localStorage.getItem('token');

    if (token) {
        showMainApp();
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const res = await fetch('https://apsonabackend-nlku.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            localStorage.setItem('token', data.token);
            token = data.token;
            showMainApp();
        } catch (err) {
            console.error(err);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch('https://apsonabackend-nlku.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            localStorage.setItem('token', data.token);
            token = data.token;
            showMainApp();
        } catch (err) {
            console.error(err);
        }
    });

    createNoteBtn.addEventListener('click', () => {
        showNoteModal();
    });

    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;
        const tags = document.getElementById('noteTags').value.split(',').map(tag => tag.trim());
        const color = document.getElementById('noteColor').value;
        const dueDate = document.getElementById('noteDueDate').value;

        try {
            const res = await fetch('https://apsonabackend-nlku.onrender.com/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({ title, content, tags, color, dueDate }),
            });
            const note = await res.json();
            addNoteToDOM(note);
            closeNoteModal();
        } catch (err) {
            console.error(err);
        }
    });

    closeNoteModalBtn.addEventListener('click', () => {
        closeNoteModal();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        token = null;
        showAuth();
    });


    searchInput.addEventListener('change', async (e) => {
        const query = e.target.value;
        try {
            const res = await fetch(`https://apsonabackend-nlku.onrender.com/api/notes/search?query=${query}`, {
                headers: {
                    'token': token,
                },
            });
            const notes = await res.json();
            renderNotes(notes);
        } catch (err) {
            console.error(err);
        }
    });

    archivedNotesBtn.addEventListener('click', async () => {
        try {

            const res = await fetch('https://apsonabackend-nlku.onrender.com/api/notes/archived', {
                headers: {
                    'token': token,
                },
            });
            const notes = await res.json();
            renderNotes(notes);
        } catch (err) {
            console.error(err);
        }
    });

    trashedNotesBtn.addEventListener('click', async () => {
        // console.log(token);
        try {
            const res = await fetch('https://apsonabackend-nlku.onrender.com/api/notes/trashed', {
                headers: {
                    'token': token,
                },
            });
            const notes = await res.json();
            renderNotes(notes);
        } catch (err) {
            console.error(err);
        }
    });

    async function fetchNotes() {
        try {
            const res = await fetch('https://apsonabackend-nlku.onrender.com/api/notes', {
                headers: {
                    'token': token,
                },
            });
            const notes = await res.json();
            renderNotes(notes);
        } catch (err) {
            console.error(err);
        }
    }



    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        notes.forEach(note => addNoteToDOM(note));
    }

    function addNoteToDOM(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        //console.log(note);
        noteElement.style.backgroundColor = note.color;
        let tagsHTML = '';
        note.tags.forEach(each => {
            tagsHTML += `<span class="tag">${each}</span>`;
        });
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p class="content">${note.content}</p>
            ${tagsHTML}
            <br />
            <button onclick="archiveNote('${note._id}')">Archive</button>
            <button onclick="trashNote('${note._id}')">Trash</button>
             <button onclick="deleteNote('${note._id}')">Delete</button>
        `;
        notesContainer.appendChild(noteElement);
    }

    window.archiveNote = async (id) => {
        try {
            const res = await fetch(`https://apsonabackend-nlku.onrender.com/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({ archived: true }),
            });
            const note = await res.json();
            //console.log(note);
            fetchNotes();
        } catch (err) {
            console.error(err);
        }
    };
    window.deleteNote = async (id) => {
        try {
            const res = await fetch(`https://apsonabackend-nlku.onrender.com/api/notes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                }
            });
            const note = await res.json();
            console.log(note);
            fetchNotes();
        } catch (err) {
            console.error(err);
        }
    };

    window.trashNote = async (id) => {
        try {
            const res = await fetch(`https://apsonabackend-nlku.onrender.com/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({ trash: true }),
            });
            const note = await res.json();
            console.log(note);
            fetchNotes();
        } catch (err) {
            console.error(err);
        }
    };

    function showAuth() {
        auth.style.display = 'block';
        mainApp.style.display = 'none';
    }

    function showMainApp() {
        auth.style.display = 'none';
        mainApp.style.display = 'block';
        //console.log("sm");
        fetchNotes();
    }
    homeBtn.addEventListener('click', () => {
        fetchNotes();
    });

    function showNoteModal() {
        noteModal.style.display = 'block';
    }

    function closeNoteModal() {
        noteModal.style.display = 'none';
    }
});
