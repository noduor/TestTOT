let allImages = [];

async function fetchGallery() {
    try {
        const response = await fetch('php/admin/get_gallery.php');
        const images = await response.json();
        allImages = images;
        renderGallery('all');
    } catch (error) {
        // Demo gallery images
        allImages = getDemoGallery();
        renderGallery('all');
    }
}

function getDemoGallery() {
    const categories = ['worship', 'events', 'community', 'missions'];
    const images = [];
    for (let i = 1; i <= 24; i++) {
        images.push({
            id: i,
            url: `../assets/images/gallery/demo_${i}.jpg`,
            category: categories[i % categories.length],
            caption: `Beautiful moment at TOT Church - Photo ${i}`
        });
    }
    return images;
}

function renderGallery(category) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    let filtered = category === 'all' ? allImages : allImages.filter(img => img.category === category);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-images">No images found in this category. Photos coming soon!</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(img => `
        <div class="gallery-item" data-id="${img.id}">
            <img data-src="${img.url}" src="../assets/images/placeholder.jpg" alt="${escapeHtml(img.caption)}" loading="lazy">
            <div class="gallery-overlay">
                <p>${escapeHtml(img.caption)}</p>
            </div>
        </div>
    `).join('');
    
    // Lazy load images
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.gallery-item').forEach(item => {
        imageObserver.observe(item);
        item.addEventListener('click', () => openLightbox(item.dataset.id));
    });
}

function openLightbox(imageId) {
    const image = allImages.find(img => img.id == imageId);
    if (!image) return;
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = image.url;
    lightbox.style.display = 'flex';
    
    // Navigation between images
    const currentIndex = allImages.findIndex(img => img.id == imageId);
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    prevBtn.onclick = () => {
        const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        lightboxImg.src = allImages[newIndex].url;
        imageId = allImages[newIndex].id;
    };
    
    nextBtn.onclick = () => {
        const newIndex = (currentIndex + 1) % allImages.length;
        lightboxImg.src = allImages[newIndex].url;
        imageId = allImages[newIndex].id;
    };
}

// Close lightbox
document.querySelector('.lightbox-close')?.addEventListener('click', () => {
    document.getElementById('lightbox').style.display = 'none';
});

// Category filters
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(btn.dataset.cat);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchGallery();
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}