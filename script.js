// Read More Functionality for Changelog Blocks using GSAP
// This script handles dynamic height expansion for changelog blocks

class ChangelogReadMore {
    constructor() {
        this.changelogBlocks = document.querySelectorAll('.changelog_block');
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupBlocks());
        } else {
            this.setupBlocks();
        }
    }

    setupBlocks() {
        this.changelogBlocks.forEach((block, index) => {
            this.setupSingleBlock(block, index);
        });
    }

    setupSingleBlock(block, index) {
        // Find the read more button within this block
        const readMoreBtn = block.querySelector('.read_more_btn');
        
        if (!readMoreBtn) {
            console.warn(`No .read_more_btn found in changelog block ${index}`);
            return;
        }

        // Store original dimensions
        const originalHeight = block.scrollHeight;
        const originalOverflow = block.style.overflow;
        
        // Set initial collapsed state - use a reasonable percentage
        const collapsedHeight = Math.min(originalHeight * 0.6, Math.max(200, originalHeight * 0.4));
        
        // Position the button absolutely at the bottom of the block
        this.positionButtonAbsolutely(block, readMoreBtn, collapsedHeight);
        
        // Set initial styles
        block.style.height = `${collapsedHeight}px`;
        block.style.overflow = 'hidden';
        block.style.transition = 'none'; // Disable CSS transitions to avoid conflicts with GSAP
        block.style.position = 'relative'; // Ensure relative positioning for absolute button
        
        // Add a data attribute to track state
        block.setAttribute('data-expanded', 'false');
        block.setAttribute('data-original-height', originalHeight);
        block.setAttribute('data-collapsed-height', collapsedHeight);

        // Add click event listener to the read more button
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.expandBlock(block, readMoreBtn);
        });

        // Add visual indicator that content is truncated
        this.addTruncationIndicator(block, collapsedHeight < originalHeight);
    }

    positionButtonAbsolutely(block, readMoreBtn, collapsedHeight) {
        // Store original button styles
        const originalPosition = readMoreBtn.style.position;
        const originalBottom = readMoreBtn.style.bottom;
        const originalLeft = readMoreBtn.style.left;
        const originalRight = readMoreBtn.style.right;
        const originalTransform = readMoreBtn.style.transform;
        const originalZIndex = readMoreBtn.style.zIndex;
        
        // Position button absolutely at the bottom left of the block
        readMoreBtn.style.position = 'absolute';
        readMoreBtn.style.bottom = '20px';
        readMoreBtn.style.left = '32px';
        readMoreBtn.style.transform = 'none';
        readMoreBtn.style.zIndex = '10';
        
       
        
        // Store original styles for restoration
        readMoreBtn.setAttribute('data-original-position', originalPosition);
        readMoreBtn.setAttribute('data-original-bottom', originalBottom);
        readMoreBtn.setAttribute('data-original-left', originalLeft);
        readMoreBtn.setAttribute('data-original-right', originalRight);
        readMoreBtn.setAttribute('data-original-transform', originalTransform);
        readMoreBtn.setAttribute('data-original-zindex', originalZIndex);
    }

    expandBlock(block, readMoreBtn) {
        const isExpanded = block.getAttribute('data-expanded') === 'true';
        
        if (isExpanded) {
            return; // Already expanded
        }

        const originalHeight = parseFloat(block.getAttribute('data-original-height'));
        const collapsedHeight = parseFloat(block.getAttribute('data-collapsed-height'));

        // Hide the read more button immediately when clicked
        readMoreBtn.style.display = 'none';
        block.setAttribute('data-expanded', 'true');

        // Hide the truncation overlay
        const overlay = block.querySelector('.changelog-truncation-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }

        // Animate to full height using GSAP
        gsap.to(block, {
            height: originalHeight,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                // Reset height to auto after animation
                block.style.height = 'auto';
                block.style.overflow = originalOverflow || '';
            }
        });
    }

    restoreButtonPosition(readMoreBtn) {
        // Restore original button styles
        readMoreBtn.style.position = readMoreBtn.getAttribute('data-original-position') || '';
        readMoreBtn.style.bottom = readMoreBtn.getAttribute('data-original-bottom') || '';
        readMoreBtn.style.left = readMoreBtn.getAttribute('data-original-left') || '';
        readMoreBtn.style.right = readMoreBtn.getAttribute('data-original-right') || '';
        readMoreBtn.style.transform = readMoreBtn.getAttribute('data-original-transform') || '';
        readMoreBtn.style.zIndex = readMoreBtn.getAttribute('data-original-zindex') || '';
    }

    addTruncationIndicator(block, isTruncated) {
        if (!isTruncated) return;

        // Add a solid color overlay at the bottom to indicate more content
        const overlay = document.createElement('div');
        overlay.className = 'changelog-truncation-overlay';
        overlay.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 25%;
            background: linear-gradient(to bottom, transparent 0%, transparent 30%, #eaeffb 70%, #eaeffb 100%);
            pointer-events: none;
            z-index: 1;
        `;
        
        // Make sure the block has relative positioning
        if (getComputedStyle(block).position === 'static') {
            block.style.position = 'relative';
        }
        
        block.appendChild(overlay);
    }

    // Method to reset all blocks to collapsed state (useful for testing)
    resetAllBlocks() {
        this.changelogBlocks.forEach(block => {
            const readMoreBtn = block.querySelector('.read_more_btn');
            const collapsedHeight = parseFloat(block.getAttribute('data-collapsed-height'));
            
            if (readMoreBtn) {
                readMoreBtn.style.display = '';
                readMoreBtn.style.opacity = '1';
                // Re-position button absolutely
                this.positionButtonAbsolutely(block, readMoreBtn, collapsedHeight);
            }
            
            block.style.height = `${collapsedHeight}px`;
            block.style.overflow = 'hidden';
            block.style.position = 'relative';
            block.setAttribute('data-expanded', 'false');
            
            // Remove any existing overlay
            const overlay = block.querySelector('.changelog-truncation-overlay');
            if (overlay) {
                overlay.remove();
            }
            
            // Re-add truncation indicator if needed
            const originalHeight = parseFloat(block.getAttribute('data-original-height'));
            this.addTruncationIndicator(block, collapsedHeight < originalHeight);
        });
    }

    // Method to expand all blocks at once
    expandAllBlocks() {
        this.changelogBlocks.forEach(block => {
            const readMoreBtn = block.querySelector('.read_more_btn');
            if (readMoreBtn && block.getAttribute('data-expanded') === 'false') {
                this.expandBlock(block, readMoreBtn);
            }
        });
    }
}

// Initialize the functionality when the script loads
const changelogReadMore = new ChangelogReadMore();

// Optional: Expose methods globally for external control
window.changelogReadMore = changelogReadMore;

// Optional: Add keyboard support for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('read_more_btn')) {
            e.preventDefault();
            focusedElement.click();
        }
    }
});

// Optional: Add intersection observer for performance optimization
// This will only initialize blocks when they come into view
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const block = entry.target;
                // Block is now visible, ensure it's properly set up
                if (block.getAttribute('data-setup') !== 'true') {
                    // Re-setup if needed
                    block.setAttribute('data-setup', 'true');
                }
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all changelog blocks
    document.querySelectorAll('.changelog_block').forEach(block => {
        observer.observe(block);
    });
}

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChangelogReadMore;
}
