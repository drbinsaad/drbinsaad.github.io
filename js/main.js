// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Throttle function to limit execution rate
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Consolidated scroll handler for better performance
const handleScroll = throttle(() => {
    const scrollY = window.scrollY;
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Parallax effect for header
    const header = document.querySelector('header');
    if (header) {
        header.style.transform = `translateY(${scrollY * 0.5}px)`;
    }
    
    // Active navigation links
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
    
    // Fade effect for header and profile image
    const profileImage = document.querySelector('.profile-image-container');
    const headerContent = document.querySelector('.header-content');
    const researchSection = document.querySelector('#research');
    
    if (researchSection && profileImage && headerContent) {
        const researchPosition = researchSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (researchPosition < windowHeight) {
            const opacity = Math.max(0, Math.min(1, researchPosition / windowHeight));
            headerContent.style.opacity = opacity;
            profileImage.style.opacity = opacity;
            headerContent.style.transform = `translateY(${(1 - opacity) * -50}px)`;
            profileImage.style.transform = `translateY(${(1 - opacity) * -50}px)`;
        } else {
            headerContent.style.opacity = 1;
            profileImage.style.opacity = 1;
            headerContent.style.transform = 'translateY(0)';
            profileImage.style.transform = 'translateY(0)';
        }
    }
    
    // Back to top button visibility
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        if (scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }
}, 100);

// Single scroll event listener
window.addEventListener('scroll', handleScroll);

// Scholar stats and publications functions with improved error handling
async function updateScholarStats() {
    try {
        const response = await fetch('./assets/data/scholar_stats.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const citationCount = document.getElementById('citation-count');
        const publicationCount = document.getElementById('publication-count');
        const hIndex = document.getElementById('h-index');
        const lastUpdated = document.getElementById('last-updated');
        
        if (citationCount) citationCount.textContent = data.citations;
        if (publicationCount) publicationCount.textContent = data.publications;
        if (hIndex) hIndex.textContent = data.h_index;
        if (lastUpdated) lastUpdated.textContent = data.last_updated;
    } catch (error) {
        console.error('Error fetching scholar stats:', error);
        
        // Provide user feedback
        const citationCount = document.getElementById('citation-count');
        const publicationCount = document.getElementById('publication-count');
        const hIndex = document.getElementById('h-index');
        const lastUpdated = document.getElementById('last-updated');
        
        if (citationCount) citationCount.textContent = 'N/A';
        if (publicationCount) publicationCount.textContent = 'N/A';
        if (hIndex) hIndex.textContent = 'N/A';
        if (lastUpdated) lastUpdated.textContent = 'Data unavailable';
    }
}

async function updatePublications() {
    const publicationList = document.getElementById('recent-publications');
    if (!publicationList) {
        return;
    }
    
    // Show loading spinner
    publicationList.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const response = await fetch('./assets/data/scholar_stats.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        publicationList.innerHTML = '';
        
        if (data.recent_publications && data.recent_publications.length > 0) {
            // Use slice to get the first three publications
            const recentPublications = data.recent_publications.slice(0, 3);
            
            recentPublications.forEach((pub, index) => {
                const pubDiv = document.createElement('div');
                pubDiv.className = 'publication-item';
                pubDiv.setAttribute('data-aos', 'fade-up');
                
                pubDiv.innerHTML = `
                    <div class="publication-year">${pub.year}</div>
                    <h3><a href="${pub.url}" target="_blank">${pub.title}</a></h3>
                    <p class="Journal">${pub.citation || 'Citation not available'}</p>
                    <button class="abstract-toggle" onclick="PublicationManager.toggleAbstract(${index})">
                        Show Abstract
                    </button>
                    <div class="abstract" id="abstract-${index}" style="display: none;">
                        ${pub.abstract || 'Abstract not available'}
                    </div>
                `;
                
                publicationList.appendChild(pubDiv);
            });
        }
    } catch (error) {
        console.error('Error updating publications:', error);
        publicationList.innerHTML = '<p class="error-message">Failed to load publications. Please try again later.</p>';
    }
}

async function updatePublications_all() {
    const publicationList = document.getElementById('all-publications');
    if (!publicationList) {
        return;
    }
    
    // Show loading spinner
    publicationList.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const response = await fetch('./assets/data/scholar_stats.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        publicationList.innerHTML = '';
        
        if (data.recent_publications && data.recent_publications.length > 0) {
            // Display all publications
            data.recent_publications.forEach((pub, index) => {
                const pubDiv = document.createElement('div');
                pubDiv.className = 'publication-item';
                pubDiv.setAttribute('data-aos', 'fade-up');
                
                pubDiv.innerHTML = `
                    <div class="publication-year">${pub.year}</div>
                    <h3><a href="${pub.url}" target="_blank">${pub.title}</a></h3>
                    <p class="Journal">${pub.citation || 'Citation not available'}</p>
                    <button class="abstract-toggle" onclick="PublicationManager.toggleAbstract(${index})">
                        Show Abstract
                    </button>
                    <div class="abstract" id="abstract-${index}" style="display: none;">
                        ${pub.abstract || 'Abstract not available'}
                    </div>
                `;
                
                publicationList.appendChild(pubDiv);
            });
        }
    } catch (error) {
        console.error('Error updating publications:', error);
        publicationList.innerHTML = '<p class="error-message">Failed to load publications. Please try again later.</p>';
    }
}

// Publication Manager object to avoid global function pollution
const PublicationManager = {
    toggleAbstract: function(index) {
        const abstractDiv = document.getElementById(`abstract-${index}`);
        const button = abstractDiv.previousElementSibling;
        
        if (abstractDiv.style.display === 'none') {
            abstractDiv.style.display = 'block';
            button.textContent = 'Hide Abstract';
        } else {
            abstractDiv.style.display = 'none';
            button.textContent = 'Show Abstract';
        }
    }
};

// Single DOMContentLoaded event listener for all initializations
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinksItems.forEach(item => {
            item.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (hamburger && navLinks) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        }
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Keyboard navigation for dropdowns
    document.querySelectorAll('.nav-links > li').forEach(item => {
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const dropdown = this.querySelector('.dropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            }
        });
    });

    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Update scholar stats and publications
    updateScholarStats();
    updatePublications();
});

// Optional: Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});
