import { songs } from '../data/songs.js';

class AudioArchive {
    constructor() {
        this.track = document.getElementById('carousel-track');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.progressFill = document.getElementById('progress-fill');
        this.modal = document.getElementById('card-modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeModal = document.querySelector('.close-modal');
        
        this.currentIndex = 0;
        this.totalSongs = songs.length;
        
        this.init();
    }
    
    init() {
        this.renderCards();
        this.updateCarousel();
        this.setupEventListeners();
        
        // Initial progress
        this.updateProgress();
    }
    
    renderCards() {
        songs.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.setAttribute('data-index', index);
            
            // Asset mapping fix: use existing assets
            const imagePath = song.image || 'assets/images/page1_img1.jpeg';
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-top">
                        <div class="card-year">${song.year || '---'}</div>
                        <h3 class="card-title">${song.title.split(' (')[0] || 'Unknown Title'}</h3>
                        <p class="card-performer">${song.performer || 'Unknown Performer'}</p>
                    </div>
                    <div class="card-visual">
                        <img src="${imagePath}" alt="${song.title}">
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => this.openModal(song));
            this.track.appendChild(card);
        });
    }
    
    updateCarousel() {
        const cards = document.querySelectorAll('.song-card');
        
        cards.forEach((card, index) => {
            const offset = index - this.currentIndex;
            const absOffset = Math.abs(offset);
            
            // 3D Perspective Logic
            let x = offset * 120; // Spread x
            let z = -absOffset * 100; // Push back z
            let rotateY = -offset * 15; // Rotate
            let opacity = 1 - (absOffset * 0.3);
            let scale = 1 - (absOffset * 0.1);
            
            if (offset === 0) {
                z = 100; // Pull focus card forward
                opacity = 1;
                scale = 1.1;
                card.style.borderColor = 'var(--clr-orange)';
            } else {
                card.style.borderColor = 'rgba(255,255,255,0.05)';
            }
            
            card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`;
            card.style.opacity = Math.max(opacity, 0);
            card.style.zIndex = 100 - absOffset;
            card.style.pointerEvents = absOffset > 2 ? 'none' : 'auto';
        });
        
        this.updateProgress();
    }
    
    updateProgress() {
        const percentage = ((this.currentIndex + 1) / this.totalSongs) * 100;
        this.progressFill.style.width = `${percentage}%`;
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateCarousel();
            }
        });
        
        this.nextBtn.addEventListener('click', () => {
            if (this.currentIndex < this.totalSongs - 1) {
                this.currentIndex++;
                this.updateCarousel();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevBtn.click();
            if (e.key === 'ArrowRight') this.nextBtn.click();
        });
        
        this.closeModal.addEventListener('click', () => this.toggleModal(false));
        this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.toggleModal(false));
    }
    
    openModal(song) {
        let videoEmbed = '';
        if (song.youtubeLink && song.youtubeLink.includes('youtube.com')) {
            const videoId = song.youtubeLink.split('v=')[1]?.split('&')[0];
            if (videoId) {
                videoEmbed = `
                    <div class="video-container">
                        <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
            }
        }
        
        this.modalBody.innerHTML = `
            <div class="modal-grid">
                <div class="modal-media">
                    ${videoEmbed || '<div class="no-video">Video not available</div>'}
                    <div class="modal-lyrics">
                        <h4>Lyrics</h4>
                        <pre>${song.lyrics}</pre>
                    </div>
                </div>
                <div class="modal-info">
                    <h2 class="modal-title">${song.title} (${song.year})</h2>
                    <p class="modal-performer"><strong>Performer:</strong> ${song.performer}</p>
                    ${song.composer ? `<p class="modal-meta"><strong>Composer:</strong> ${song.composer}</p>` : ''}
                    ${song.lyricist ? `<p class="modal-meta"><strong>Lyricist:</strong> ${song.lyricist}</p>` : ''}
                    ${song.extra ? `<p class="modal-meta"><em>${song.extra}</em></p>` : ''}
                    <div class="info-content">
                        <div class="info-pane">
                            <h4>Konteks Sejarah</h4>
                            <p>${song.infoMalay}</p>
                        </div>
                        <div class="info-pane">
                            <h4>Historical Context</h4>
                            <p>${song.infoEnglish}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.toggleModal(true);
    }
    
    toggleModal(show) {
        this.modal.style.display = show ? 'flex' : 'none';
        document.body.style.overflow = show ? 'hidden' : 'auto';
    }
    
    jumpToIndex(index) {
        this.currentIndex = index;
        this.updateCarousel();
        document.getElementById('history').scrollIntoView({ behavior: 'smooth' });
    }
}

class ChronicleController {
    constructor() {
        this.section = document.getElementById('chronicle');
        this.progressLine = this.section.querySelector('.progress-line');
        this.indicator = this.section.querySelector('.progress-indicator');
        this.chapters = this.section.querySelectorAll('.chapter');
        
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.handleScroll(); // Initial check
    }
    
    handleScroll() {
        const sectionRect = this.section.getBoundingClientRect();
        const sectionHeight = sectionRect.height;
        const scrollStep = Math.max(0, Math.min(1, -sectionRect.top / (sectionHeight - window.innerHeight)));
        
        // Update progress line
        this.progressLine.style.transform = `scaleY(${scrollStep})`;
        this.indicator.style.top = `${scrollStep * 100}%`;
        
        // Chapter reveals
        this.chapters.forEach((chapter, index) => {
            const rect = chapter.getBoundingClientRect();
            const isActive = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
            
            if (isActive) {
                chapter.classList.add('active');
            } else if (rect.top > window.innerHeight) {
                chapter.classList.remove('active');
            }
        });
    }
}

class IndexController {
    constructor(archive) {
        this.archive = archive;
        this.grid = document.getElementById('index-grid');
        this.init();
    }
    
    init() {
        if (!this.grid) return;
        this.renderIndex();
    }
    
    renderIndex() {
        // Group songs by decade columns as per PDF logic
        // PDF Column 1: Songs 1-14 (ID 1-15 in our data due to split #4)
        // PDF Column 2: Songs 15-22 (ID 16-23)
        // PDF Column 3: Songs 23-31 (ID 24-32)
        const decades = {
            "1930s - 1980s (I)": songs.slice(0, 16), // IDs 1-16 (Ends with EON 1988)
            "1989 - 2000s (II)": songs.slice(16, 24), // IDs 17-24 (Starts with Sheila Majid 1989, Ends with MUH 2009)
            "2010s - 2020s (III)": songs.slice(24) // IDs 25-32 (Starts with Yuna 2012)
        };
        
        Object.entries(decades).forEach(([decade, decadeSongs]) => {
            const column = document.createElement('div');
            column.className = 'decade-column';
            
            column.innerHTML = `
                <h3>${decade}</h3>
                <ul class="index-list">
                    ${decadeSongs.map((song, i) => {
                        const globalIndex = songs.indexOf(song);

                        const details = [];
                        if (song.composer) details.push(`<span>C: ${song.composer}</span>`);
                        if (song.lyricist) details.push(`<span>L: ${song.lyricist}</span>`);
                        if (song.extra) details.push(`<span class="index-extra">${song.extra}</span>`);

                        return `
                            <li class="index-item" data-index="${globalIndex}">
                                <div class="index-dot"></div>
                                <div class="index-text">
                                    <span class="index-song-title">${song.title} (${song.year})</span>
                                    <span class="index-song-performer">${song.performer}</span>
                                    ${details.length > 0 ? `<div class="index-song-details">${details.join('')}</div>` : ''}
                                </div>
                            </li>
                        `;
                    }).join('')}
                </ul>
            `;
            
            column.querySelectorAll('.index-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.getAttribute('data-index'));
                    this.archive.jumpToIndex(index);
                });
            });
            
            this.grid.appendChild(column);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const archive = new AudioArchive();
    new ChronicleController();
    new IndexController(archive);
});
