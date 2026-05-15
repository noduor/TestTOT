let allEvents = [];

// Fetch events from backend
async function fetchEvents() {
    try {
        const response = await fetch('php/admin/get_events.php');
        const events = await response.json();
        allEvents = events;
        renderEvents('all');
    } catch (error) {
        console.error('Error fetching events:', error);
        // Demo data for testing
        allEvents = getDemoEvents();
        renderEvents('all');
    }
}

function getDemoEvents() {
    return [
        { id: 1, title: "Sunday Celebration Service", date: "2026-06-15", time: "09:00 AM", location: "TOT Church Sanctuary", status: "upcoming", description: "Join us for a powerful worship experience and life-changing message." },
        { id: 2, title: "Midweek Bible Study", date: "2026-06-18", time: "6:00 PM", location: "Fellowship Hall", status: "upcoming", description: "Deep dive into Scripture with interactive discussion." },
        { id: 3, title: "Youth Conference 2026", date: "2026-05-20", time: "9:00 AM", location: "Main Auditorium", status: "completed", description: "Three days of empowerment for young people." },
        { id: 4, title: "Prayer Marathon", date: "2026-06-10", time: "5:00 AM", location: "Online & Church", status: "ongoing", description: "40 days of prayer and fasting." }
    ];
}

function renderEvents(filter) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    
    let filtered = allEvents;
    if (filter === 'upcoming') filtered = allEvents.filter(e => e.status === 'upcoming');
    else if (filter === 'ongoing') filtered = allEvents.filter(e => e.status === 'ongoing');
    else if (filter === 'completed') filtered = allEvents.filter(e => e.status === 'completed');
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-events">No events found in this category.</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(event => `
        <div class="event-card" data-id="${event.id}">
            <div class="event-card-header">
                <span class="event-status ${event.status}">${event.status.toUpperCase()}</span>
            </div>
            <div class="event-card-body">
                <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
                <p class="event-card-date"><i class="far fa-calendar-alt"></i> ${formatDate(event.date)}</p>
                <p class="event-card-time"><i class="far fa-clock"></i> ${event.time}</p>
                <p class="event-card-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</p>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for event cards
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => showEventDetails(card.dataset.id));
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function showEventDetails(eventId) {
    const event = allEvents.find(e => e.id == eventId);
    if (!event) return;
    
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');
    
    // Sample gallery images (20 placeholders)
    const galleryImages = Array(20).fill().map((_, i) => ({
        url: `../assets/images/gallery/event_${eventId}_${i+1}.jpg`,
        caption: `Event photo ${i+1}`
    }));
    
    modalBody.innerHTML = `
        <div class="event-detail">
            <h2>${escapeHtml(event.title)}</h2>
            <div class="event-meta">
                <p><i class="far fa-calendar-alt"></i> ${formatDate(event.date)}</p>
                <p><i class="far fa-clock"></i> ${event.time}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</p>
            </div>
            <div class="event-description">
                <h3>About This Event</h3>
                <p>${escapeHtml(event.description)}</p>
            </div>
            <div class="event-gallery">
                <h3>Event Gallery (20 Photos)</h3>
                <div class="gallery-grid">
                    ${galleryImages.map(img => `
                        <div class="gallery-thumb">
                            <img src="${img.url}" alt="${img.caption}" onerror="this.src='../assets/images/placeholder.jpg'">
                            <span class="gallery-caption">${img.caption}</span>
                        </div>
                    `).join('')}
                </div>
                <p class="gallery-note"><i class="fas fa-info-circle"></i> 20 photos will be uploaded for each event in the next update.</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Close modal handler
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderEvents(btn.dataset.filter);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
});