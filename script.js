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
        const richTextElement = block.querySelector('.changelog_rich_txt');
        
        if (!readMoreBtn) {
            console.warn(`No .read_more_btn found in changelog block ${index}`);
            return;
        }

        if (!richTextElement) {
            console.warn(`No .changelog_rich_txt found in changelog block ${index}`);
            return;
        }

        // Get the original HTML content from the rich text element
        const originalHtml = richTextElement.innerHTML;
        
        // Count words in the text content
        const textContent = richTextElement.textContent || richTextElement.innerText || '';
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        
        console.log(`Block ${index}: Found ${words.length} words`);
        
        // Check if content needs truncation (more than 100 words)
        if (words.length <= 100) {
            // Content is short enough, hide the read more button
            console.log(`Block ${index}: Content is short enough (${words.length} words), hiding button`);
            readMoreBtn.style.visibility = 'hidden';
            block.setAttribute('data-expanded', 'true');
            return;
        }

        // Store original content
        block.setAttribute('data-original-html', originalHtml);
        block.setAttribute('data-expanded', 'false');

        // Truncate to 100 words while preserving HTML structure
        console.log(`Block ${index}: Truncating from ${words.length} to 100 words`);
        const truncatedHtml = this.truncateHtmlPreservingTags(originalHtml, 100);
        console.log('Truncated HTML:', truncatedHtml);
        richTextElement.innerHTML = truncatedHtml;

        // Add click event listener to the read more button
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.expandBlock(block, readMoreBtn);
        });

        // Position button at the end of content
        this.positionButtonInline(block, readMoreBtn);
    }

    extractTextContent(block) {
        // Clone the block to avoid modifying the original
        const clone = block.cloneNode(true);
        // Remove the read more button from the clone
        const readMoreBtn = clone.querySelector('.read_more_btn');
        if (readMoreBtn) {
            readMoreBtn.remove();
        }
        // Get text content
        return clone.textContent || clone.innerText || '';
    }

    truncateHtmlPreservingTags(htmlContent, wordLimit) {
        console.log('truncateHtmlPreservingTags called with word limit:', wordLimit);
        
        // Create a temporary container to work with the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Get all text content to count words
        const allText = tempDiv.textContent || tempDiv.innerText || '';
        const allWords = allText.trim().split(/\s+/).filter(word => word.length > 0);
        
        console.log(`Total words found: ${allWords.length}`);
        
        // If content is already short enough, return as is
        if (allWords.length <= wordLimit) {
            console.log('Content is already short enough, returning original');
            return htmlContent;
        }
        
        // Get all text nodes using TreeWalker
        const walker = document.createTreeWalker(
            tempDiv,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let wordCount = 0;
        let truncated = false;
        let truncationNode = null;
        const textNodes = [];
        
        // Collect all text nodes
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        console.log(`Found ${textNodes.length} text nodes to process`);
        
        // Process each text node
        for (let i = 0; i < textNodes.length; i++) {
            const textNode = textNodes[i];
            
            if (truncated) {
                // Remove all remaining text nodes after truncation
                textNode.textContent = '';
                continue;
            }
            
            const nodeText = textNode.textContent.trim();
            if (!nodeText) continue;
            
            const words = nodeText.split(/\s+/).filter(word => word.length > 0);
            const remainingWords = wordLimit - wordCount;
            
            console.log(`Processing text node ${i}: "${nodeText.substring(0, 30)}...", ${words.length} words, ${remainingWords} remaining`);
            
            if (words.length <= remainingWords) {
                // Keep all words in this node
                wordCount += words.length;
                console.log(`Keeping all ${words.length} words, total: ${wordCount}`);
            } else {
                // Truncate this node
                const truncatedWords = words.slice(0, remainingWords);
                textNode.textContent = truncatedWords.join(' ') + '...';
                console.log(`Truncated to ${truncatedWords.length} words: "${truncatedWords.join(' ')}..."`);
                truncated = true;
                truncationNode = textNode;
                break;
            }
        }
        
        // Now remove all HTML elements that come after the truncation point
        if (truncated && truncationNode) {
            this.removeElementsAfterTruncation(tempDiv, truncationNode);
        }
        
        const result = tempDiv.innerHTML;
        console.log('Final result length:', result.length);
        return result;
    }

    removeElementsAfterTruncation(container, truncationNode) {
        // Find the parent element of the truncation node
        let currentElement = truncationNode.parentElement;
        
        // Walk up the DOM tree to find the container
        while (currentElement && currentElement !== container) {
            // Get all siblings after the current element
            const nextSiblings = [];
            let nextSibling = currentElement.nextSibling;
            while (nextSibling) {
                nextSiblings.push(nextSibling);
                nextSibling = nextSibling.nextSibling;
            }
            
            // Remove all next siblings
            nextSiblings.forEach(sibling => {
                if (sibling.nodeType === Node.ELEMENT_NODE) {
                    sibling.remove();
                }
            });
            
            // Move to parent element
            currentElement = currentElement.parentElement;
        }
        
        // Also remove any remaining text nodes after the truncation node within the same parent
        const parent = truncationNode.parentElement;
        if (parent) {
            const walker = document.createTreeWalker(
                parent,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let foundTruncationNode = false;
            let node;
            while (node = walker.nextNode()) {
                if (node === truncationNode) {
                    foundTruncationNode = true;
                    continue;
                }
                
                if (foundTruncationNode) {
                    // Remove this text node
                    node.remove();
                }
            }
        }
    }

    replaceRichTextContent(richTextElement, newContent) {
        // Replace the content of the rich text element (can be HTML or text)
        richTextElement.innerHTML = newContent;
    }

    replaceTextContent(block, newText) {
        // Find all text nodes and replace their content
        const walker = document.createTreeWalker(
            block,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            // Skip text nodes that are part of the read more button
            if (!node.parentElement.classList.contains('read_more_btn')) {
                textNodes.push(node);
            }
        }

        // Replace the first text node with new content, remove others
        if (textNodes.length > 0) {
            textNodes[0].textContent = newText;
            // Remove other text nodes to avoid duplication
            for (let i = 1; i < textNodes.length; i++) {
                textNodes[i].remove();
            }
        }
    }

    positionButtonInline(block, readMoreBtn) {
        // Reset any absolute positioning
        readMoreBtn.style.position = '';
        readMoreBtn.style.bottom = '';
        readMoreBtn.style.left = '';
        readMoreBtn.style.right = '';
        readMoreBtn.style.transform = '';
        readMoreBtn.style.zIndex = '';
        
        // Add some spacing before the button
        readMoreBtn.style.marginLeft = '4px';
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

        // Get the original full HTML content
        const originalHtml = block.getAttribute('data-original-html');
        const richTextElement = block.querySelector('.changelog_rich_txt');
        
        if (!originalHtml) {
            console.warn('No original HTML content found for block');
            return;
        }

        if (!richTextElement) {
            console.warn('No .changelog_rich_txt found in block');
            return;
        }

        // Hide the read more button completely after expansion
        readMoreBtn.style.display = 'none';
        block.setAttribute('data-expanded', 'true');

        // Replace truncated content with full HTML content
        richTextElement.innerHTML = originalHtml;

        // Reset block height to auto to fit content
        block.style.height = 'auto';
        block.style.overflow = '';
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


    // Method to reset all blocks to collapsed state (useful for testing)
    resetAllBlocks() {
        this.changelogBlocks.forEach(block => {
            const readMoreBtn = block.querySelector('.read_more_btn');
            const richTextElement = block.querySelector('.changelog_rich_txt');
            const originalHtml = block.getAttribute('data-original-html');
            
            if (readMoreBtn && richTextElement && originalHtml) {
                readMoreBtn.style.visibility = 'visible';
                readMoreBtn.style.marginLeft = '4px';
                
                // Count words in original content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = originalHtml;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
                
                if (words.length > 100) {
                    const truncatedHtml = this.truncateHtmlPreservingTags(originalHtml, 100);
                    richTextElement.innerHTML = truncatedHtml;
                    block.setAttribute('data-expanded', 'false');
                } else {
                    block.setAttribute('data-expanded', 'true');
                }
            }
            
            // Reset block styles
            block.style.height = 'auto';
            block.style.overflow = '';
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
