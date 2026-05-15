let currentEvents = [];
let currentGallery = [];

// Section switching
document.querySelectorAll('.admin-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        
        document.querySelectorAll('.admin-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`${section}Section`).classList.add('active');
        
        if (section === 'events') loadEvents();
        if (section === 'gallery') loadGallery();
    });
});

// Event Management
document.getElementById('addEventBtn')?.addEventListener('click', () => {
    document.getElementById('addEventForm').style.display = 'block';
});

document.getElementById('cancelEventBtn')?.addEventListener('click', () => {
    document.getElementById('addEventForm').style.display = 'none';
});

document.getElementById('eventForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('php/admin/add_event.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.success) {
            alert('Event added successfully!');
            document.getElementById('addEventForm').style.display = 'none';
            e.target.reset();
            loadEvents();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Failed to add event.');
    }
});

async function loadEvents() {
    try {
        const response = await fetch('php/admin/get_events.php');
        currentEvents = await response.json();
        renderEventsList();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function renderEventsList() {
    const container = document.getElementById('eventsList');
    if (!container) return;
    
    if (currentEvents.length === 0) {
        container.innerHTML = '<div class="loading">No events found. Create your first event!</div>';
        return;
    }
    
    container.innerHTML = currentEvents.map(event => `
        <div class="event-admin-card">
            <div class="event-info">
                <h4>${escapeHtml(event.title)}</h4>
                <p>${event.date} | ${event.time} | ${escapeHtml(event.location)}</p>
                <p>Status: <strong>${event.status}</strong></p>
            </div>
            <div class="event-actions">
                <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        const response = await fetch(`php/admin/delete_event.php?id=${eventId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            loadEvents();
        } else {
            alert('Failed to delete event.');
        }
    } catch (error) {
        alert('Error deleting event.');
    }
}

// Gallery Management
document.getElementById('uploadImageBtn')?.addEventListener('click', () => {
    document.getElementById('uploadForm').style.display = 'block';
});

document.getElementById('cancelUploadBtn')?.addEventListener('click', () => {
    document.getElementById('uploadForm').style.display = 'none';
});

document.getElementById('galleryUploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('php/admin/upload_gallery.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.success) {
            alert('Image uploaded successfully!');
            document.getElementById('uploadForm').style.display = 'none';
            e.target.reset();
            loadGallery();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Failed to upload image.');
    }
});

async function loadGallery() {
    try {
        const response = await fetch('php/admin/get_gallery.php');
        currentGallery = await response.json();
        renderGalleryList();
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

function renderGalleryList() {
    const container = document.getElementById('galleryList');
    if (!container) return;
    
    if (currentGallery.length === 0) {
        container.innerHTML = '<div class="loading">No images in gallery. Upload your first image!</div>';
        return;
    }
    
    container.innerHTML = currentGallery.map(img => `
        <div class="gallery-admin-card">
            <img src="${img.url}" alt="${escapeHtml(img.caption)}">
            <div class="gallery-info">
                <p>${escapeHtml(img.caption || 'No caption')}</p>
                <p>Category: ${img.category}</p>
                <button class="delete-gallery" onclick="deleteGalleryItem(${img.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteGalleryItem(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
        const response = await fetch(`php/admin/delete_gallery.php?id=${imageId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            loadGallery();
        } else {
            alert('Failed to delete image.');
        }
    } catch (error) {
        alert('Error deleting image.');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

// Make functions global for onclick handlers
window.deleteEvent = deleteEvent;
window.deleteGalleryItem = deleteGalleryItem;