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

class ArticleController {
    constructor() {
        this.modal = document.getElementById('article-modal');
        this.contentContainer = document.getElementById('full-article-content');
        this.closeBtn = this.modal.querySelector('.close-modal');
        this.researchBtns = document.querySelectorAll('.read-research');
        
        this.articleText = `
            <p>Nearly a century after one of the earliest known “lagu Raya” recordings, Malaysians have enjoyed a joyful multitude of Hari Raya songs, in all kinds of music genres. How and when did this festive song tradition take root? And who tops the charts?</p>
            <p>It’s become a conditioned reflex – radio and TV stations and shopping malls playing the songs of the season. All this magic from a few musical notes in the air. But it wasn’t always this way. How did the lagu Raya tradition come about, and become so popular?</p>

            <h2 id="para-1">1930s: Bangsawan roots of early ‘pop stars’</h2>
            <p>Some music history buffs and record collectors claim that the earliest documented Hari Raya song was in 1936 by bangsawan singer Miss Aminah. The song was <em>Selamat Hari Raya</em>, written by Tengku Alibasha (also known as Che Ara Bangsawan), and released by the HMV record label.</p>
            <p>In fact, the early recording stars of the Malayan Archipelago were the who’s who in bangsawan vaudeville opera, household names in the pre-World War II days. The prima donnas of these touring troupes often had their names affixed with “Miss”, in recognition of their status.</p>
            <p>According to Dr Raja Iskandar Raja Halid, an ethnomusicologist with Universiti Malaysia Kelantan: “Bangsawan provided the platform for Malay composers and musicians to express themselves using modern Western musical instruments and popular genres while retaining a ‘Malay’ feel to the songs.”</p>
            <p>HMV dominated the recording scene in the 1930s and early 1940s, setting up sister companies Chap Kuching, Chap Anjing, and Chap Singa and organising events with “almost all the famous singers and bands in Malaya” to sell their records. (Even the Malayan movie industry capitalised on bangsawan – our first movie in 1933 was <em>Laila Majnun</em>, adapted from a popular bangsawan tale and featuring bangsawan stars.)</p>
            <p>The lyrics of Miss Aminah’s 1936 <em>Selamat Hari Raya</em> reflect simpler times and a focus on fundamentals. Rather than merriment and gratitude for abundance, the song highlights Aidilfitri as the pinnacle and closure to Ramadan, a time for prayer, forgiveness, and mindfulness of the afterlife. The singer wishes listeners a long life with good provision, and hopes they will meet again next year – simple things which, after the last couple of years, we too may be less likely to take for granted.</p>

            <h2 id="para-2">1930s - 1940s: ‘Like a huge jigsaw puzzle!’</h2>
            <p>After that, documentation has been a bit of a mess. “Currently not much material and documentation is available on Malaya’s pre-war and even post-war Malaysia’s popular music history. Research on subjects such as ‘Hari Raya songs’ has to be more in-depth and wider in the sense that it is not just the song but also the channels used to play the song (radio, cinema, television). When Raya songs were played back in those early days of recorded local music, it was not so much as to promote the song and singer but to celebrate the occasion,” says Paul Augustin, the director of the Penang House of Music.</p>
            <p>There is also debate that the first Raya song of the 1940s may have been Ahmad CB in 1940, or A. Rahman in 1941, both with a song titled <em>Selamat Hari Raya</em> – they may or may not have been singing the same song. Things came to a standstill because of the war (among other things, radios were banned). However, it also reflects gaps in documentation, resources lost to time, and that not everyone could afford radios, let alone record players.</p>
            <p>Datuk Dr Hajjah Azizan Aiyub Ghazali, 84, former director of Kuala Lumpur Hospital, grew up without “Raya music” until she was nine or 10. “It was only the more well-off, educated or ‘important’ people who would have radios – maybe the ketua kampung, or teachers, or district officers,” she recalls. “My father was an engineer, so we had one. But even then, listening to the radio was something special – only on weekends, or during special events like the Thomas Cup.”</p>
            <p>For theatre veteran and KLPac co-founder Datuk Faridah Merican, 84, who had a broadcasting stint on Radio Malaya in the early 1960s, her earliest memory of hearing lagu Raya on the radio was the call to prayer from the mosque. “It was and still is my favourite – a beautiful memory of Raya,” she says.</p>

            <h2 id="para-3">1950s: Timeless songs, timeless singers</h2>
            <p>According to Dr Shazlin Amir Hamzah, an ethnomusicologist with Universiti Kebangsaan Malaysia, while there were Raya songs recorded in the 1940s, “the Raya song culture never really took place until the late 1950s.”</p>
            <p>Dr Adil Johan, senior lecturer in music at University Malaya, points to radio and films as early mediums for dissemination of Hari Raya songs. Radio Malaya was established in 1946, Radio Sarawak in 1954 and Radio Sabah in 1952. However, although numerous online users have shared information about early film releases (including films as early as 1940 released in conjunction with the Aidilfitri season), there has been little compilation of data on actual Raya songs.</p>
            <p>Sabah and Sarawak have long had local musicians infusing Raya songs with traditional elements, but during this time the state radio broadcasts still aired music sent from headquarters. According to Lailah Elok, Head of RTM Sabah’s Show Management and Recording Library Unit, “it was in the 2000s that we began sourcing local content, which we then passed to Angkasapuri for centralised approval”.</p>
            <p>The late 1950s saw the emergence of stars more well known from the movies and less for bangsawan, into the Raya songbook. Crucially, from the mid-1950s onwards, it saw the emergence of iconic songs, iconic singers, and in some cases, an unofficial “handover” of the reins from the old generation to the new.</p>
            <p>A case in point is bangsawan veteran Nona Asiah, who originated two famous Raya songs – <em>Selamat Hari Raya</em> by Ahmad Jaafar and <em>Aidilfitri</em> by Zubir Said. The songs are still famous today, but the versions we know and love are covers – in 1955 by Salmah Ismail (who later became famous as Saloma) and in 1973 by Sanisah Huri.</p>
            <p>In fact, the 1950s saw the emergence of P. Ramlee and Saloma, Malaysia’s King and Queen of Song to this day. In the mid-1950s, P. Ramlee recorded his two earliest Raya hits: <em>Suara Takbir</em> and <em>Dendang Perantau</em> (a gently moving orchestral version, in keeping with the musical trend popularised by Orkes Radio Malaya). By the time 1960 rolled around, P Ramlee and Saloma were superstars who had several hits, separately and together.</p>

            <h2 id="para-4">1960s: The energy of youth!</h2>
            <p>While there was a stronger element of merriment, Raya still tended to be a private and homely celebration within the family, not an event associated with public entertainment. Faridah recalls: “It was in the late 1950s when I was in Penang and our family would be in the kitchen bobbing our heads together to Raya songs played on the radio.”</p>
            <p>This ecosystem of film, records and radio was joined in the 1960s by entrepreneurs - market and coffeeshop operators who invested in speakers to lure customers with radio, as well as kenduri “service providers” who operated much like event organisers today.</p>
            <p>Composer Shamsul Cairel, 54, recalls his childhood Raya days in Bagan Serai, Perak, a little boy gawping wide-eyed at operators setting up their sound systems and bringing crates of vinyl records with all kinds of bright coloured covers. “There would be a deejay playing the records all day, and the band would only come on at night,” he says. “These event operators would go from village to village, servicing different kenduri.”</p>
            <p>The 1960s saw more popular singers making their mark in the Raya songbook – S.M. Salim, S. Jibeng, Fazidah Joned, Ahmad Jais and Jeffrydin, to name a few. Adil Johan points to the evolution of Raya music to incorporate “popular ‘pop-yeh-yeh’ or danceable pop rock style that was the musical trend amongst Malay youth at the time” – as seen in P. Ramlee’s 1967 version of <em>Dendang Perantau</em>, with its iconic opening riff. However, jazz and pop influences were also infused, as in the songs of Ahmad Jais and Fazidah Joned.</p>
            <p>“Every Raya, you will see more vinyl collectors looking for obscure Raya tunes. The vinyl scene in Malaysia, I feel, has reached the next level, with collectors now more interested in tracking down ‘lost’ recordings. Ordinary people are also curious and looking to dig deeper into Malaysia’s music history and Raya songs, especially those from the early 1950s and 1960s are highly coveted,” says Naza Mohamad, the owner of Sputnik Rekordz.</p>

            <h2 id="para-5">After the 1960s</h2>
            <p>As technology, musical tastes, and lifestyles continued to evolve over the next few decades, so did the Raya songbook. As Adil Johan puts it, the sounds of a favourite <em>lagu Raya</em> is associated with “... something nostalgic and endearing; as part of a cycle of festivity that is also marked by the joyous reunion of families separated and the bittersweet remembrance of those deceased.”</p>
            <p>For disco, rock, and punk musicians, this has meant finding creative ways of expressing this feeling, in the genres closest to their heart – innovative covers which, when well done, have been well received. Clearly, for the 1970s onwards, there are vast and exciting resources to deep-dive into!</p>
            <blockquote>“It may be ‘every song writer’s dream to have a Raya song to be remembered for eternity’... few achieve this. Saloma and P. Ramlee still rule the playlists.”</blockquote>
            <p>Ultimately, two things are clear: Firstly, while it may be “every song writer’s dream to have a Raya song to be remembered for eternity”, as Raja Iskandar put it, few achieve this. Saloma and P. Ramlee still rule the playlists, though Sharifah Aini, DJ Dave, and of course Sudirman are some other icons still holding strong today.</p>
            <p>Secondly, there are huge gaps in documentation of the early years, occasional confusion with similar song titles, and inconsistencies in details, requiring additional fact-checking. There has, to date, never been an official research project into lagu Raya. Clearly, the Raya journey, particularly its origins and evolution, is a rich, untapped field for future study, with potential treasures in the hands of ordinary people like us all!</p>
        `;
        
        this.init();
    }
    
    init() {
        this.contentContainer.innerHTML = this.articleText;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.researchBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-article-target');
                this.openArticle(targetId);
            });
        });
        
        this.closeBtn.addEventListener('click', () => this.toggleModal(false));
        this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.toggleModal(false));
    }
    
    openArticle(targetId) {
        this.toggleModal(true);
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Wait for the modal transition or simple timeout
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }
    
    toggleModal(show) {
        this.modal.style.display = show ? 'flex' : 'none';
        document.body.style.overflow = show ? 'hidden' : 'auto';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const archive = new AudioArchive();
    new ChronicleController();
    new IndexController(archive);
    new ArticleController();
});
