// Instagram Video Enhancer - Content Script
class InstagramVideoEnhancer {
  constructor() {
    this.currentRotation = 0;
    this.currentScale = 100;
    this.currentX = 0;
    this.currentY = 0;
    this.enhancedVideos = new Set();
    this.isInFullscreen = false;
    
    this.init();
  }

  init() {
    console.log('Instagram Video Enhancer initialized');
    this.addVideoObserver();
    this.setupKeyboardShortcuts();
  }

  addVideoObserver() {
    const observer = new MutationObserver(() => {
      this.findAndEnhanceVideos();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial scan
    this.findAndEnhanceVideos();
  }

  findAndEnhanceVideos() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      if (!this.enhancedVideos.has(video) && this.isInstagramVideo(video)) {
        this.enhanceVideo(video);
        this.enhancedVideos.add(video);
      }
    });
  }

  isInstagramVideo(video) {
    // Check if it's a valid Instagram video
    const rect = video.getBoundingClientRect();
    const isVisible = rect.width > 100 && rect.height > 100;
    const hasValidSrc = video.src || video.currentSrc;
    
    return isVisible && hasValidSrc;
  }

  enhanceVideo(video) {
    const container = video.closest('div');
    if (!container) return;

    // Create control bar
    const controlBar = document.createElement('div');
    controlBar.className = 'ive-control-bar';
    controlBar.innerHTML = `
      <div class="ive-left">
        <input type="range" class="ive-slider ive-timeline" min="0" max="100" value="0" />
      </div>
      <div class="ive-right">
        <button class="ive-btn ive-rotate" title="Rotate">↻</button>
        <input type="range" class="ive-slider ive-scale" min="50" max="300" value="100" />
        <span class="ive-value">100%</span>
        <button class="ive-btn ive-fullscreen" title="Fullscreen">⛶</button>
      </div>
    `;

    // Position control bar
    if (container.style.position !== 'relative' && container.style.position !== 'absolute') {
      container.style.position = 'relative';
    }
    
    container.appendChild(controlBar);

    // Bind events
    this.bindVideoEvents(video, controlBar);
  }

  bindVideoEvents(video, controlBar) {
    const timeline = controlBar.querySelector('.ive-timeline');
    const rotateBtn = controlBar.querySelector('.ive-rotate');
    const scaleSlider = controlBar.querySelector('.ive-scale');
    const scaleValue = controlBar.querySelector('.ive-value');
    const fullscreenBtn = controlBar.querySelector('.ive-fullscreen');

    // Timeline sync
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        timeline.value = (video.currentTime / video.duration) * 100;
      }
    });

    timeline.addEventListener('input', () => {
      if (video.duration) {
        video.currentTime = (timeline.value / 100) * video.duration;
      }
    });

    // Rotate button
    rotateBtn.addEventListener('click', () => {
      this.currentRotation = (this.currentRotation + 90) % 360;
      this.applyTransformToVideo(video);
    });

    // Scale slider
    scaleSlider.addEventListener('input', () => {
      this.currentScale = parseInt(scaleSlider.value);
      scaleValue.textContent = `${this.currentScale}%`;
      this.applyTransformToVideo(video);
    });

    // Fullscreen button
    fullscreenBtn.addEventListener('click', () => {
      this.toggleFullscreen(video);
    });
  }

  applyTransformToVideo(video) {
    const transform = `rotate(${this.currentRotation}deg) scale(${this.currentScale/100}) translate(${this.currentX}px, ${this.currentY}px)`;
    
    try {
      video.style.setProperty('transform', transform, 'important');
      video.style.setProperty('transform-origin', 'center center', 'important');
      video.style.transition = 'transform 0.3s ease';
    } catch (e) {
      video.style.transform = transform;
      video.style.transformOrigin = 'center center';
      video.style.transition = 'transform 0.3s ease';
    }
  }

  toggleFullscreen(video) {
    if (!document.fullscreenElement) {
      this.enterFullscreen(video);
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen(video) {
    const container = video.closest('div[class*="reel"], div[class*="video"], article') || video.parentElement;
    
    if (container && container.requestFullscreen) {
      container.requestFullscreen().then(() => {
        this.isInFullscreen = true;
        // Reapply transform after fullscreen
        setTimeout(() => this.applyTransformToVideo(video), 100);
      }).catch(console.error);
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        this.isInFullscreen = false;
      }).catch(console.error);
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        const activeVideo = this.getActiveVideo();
        if (!activeVideo) return;

        switch (e.key.toLowerCase()) {
          case 'r':
            e.preventDefault();
            this.currentRotation = (this.currentRotation + 90) % 360;
            this.applyTransformToVideo(activeVideo);
            break;
          case 'l':
            e.preventDefault();
            this.currentRotation = (this.currentRotation - 90) % 360;
            if (this.currentRotation < 0) this.currentRotation += 360;
            this.applyTransformToVideo(activeVideo);
            break;
          case '0':
            e.preventDefault();
            this.currentRotation = 0;
            this.currentScale = 100;
            this.currentX = 0;
            this.currentY = 0;
            this.applyTransformToVideo(activeVideo);
            break;
          case 'f':
            e.preventDefault();
            this.toggleFullscreen(activeVideo);
            break;
        }
      }
    });
  }

  getActiveVideo() {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.find(video => {
      const rect = video.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0 && !video.paused;
    }) || videos[0];
  }

}

// Initialize the enhancer when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new InstagramVideoEnhancer();
  });
} else {
  new InstagramVideoEnhancer();
}
