export function initializeImageZoom() {
    // This function will be called after the component mounts to set up zoom tracking
    document.addEventListener('mousemove', function (e: MouseEvent) {
      // Get all elements with the class 'image-zoom-container'
      const zoomContainers = document.querySelectorAll('.image-zoom-container');
      
      zoomContainers.forEach((container) => {
        if (!(container instanceof HTMLElement)) return; // Ensure the container is an HTMLElement
  
        if (!container.contains(e.target as Node)) return;
        
        // Get the relative position within the container
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to percentage
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // Apply these as CSS variables that the hover zoom effect uses
        const img = container.querySelector('.gallery-image') as HTMLElement; // Type assertion here
        if (img && img instanceof HTMLElement) {
          img.style.setProperty('--x', `${xPercent}%`);
          img.style.setProperty('--y', `${yPercent}%`);
        }
      });
    });
  }
  