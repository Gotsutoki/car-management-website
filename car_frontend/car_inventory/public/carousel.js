// Car Image Carousel JavaScript
function initCarCarousels() {
    // Select all car cards
    const carCards = document.querySelectorAll('.car-card');
    
    // For each car card
    carCards.forEach(card => {
      const images = card.querySelectorAll('.car-image');
      if (images.length <= 1) return; // Skip if only one or no images
      
      let currentIndex = 0;
      
      // Initial setup - show first image, hide others
      images[0].classList.remove('hidden');
      for (let i = 1; i < images.length; i++) {
        images[i].classList.add('hidden');
      }
      
      // Set interval to switch images
      setInterval(() => {
        // Hide current image
        images[currentIndex].classList.add('hidden');
        
        // Update index
        currentIndex = (currentIndex + 1) % images.length;
        
        // Show next image
        images[currentIndex].classList.remove('hidden');
      }, 3000); // Switch every 3 seconds
    });
  }
  
  // Initialize carousels when DOM is loaded
  document.addEventListener('DOMContentLoaded', initCarCarousels);
  
  // Add scroll event to change navbar appearance
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });