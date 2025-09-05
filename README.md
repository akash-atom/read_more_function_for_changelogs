# Changelog Read More Functionality

A dynamic "read more" functionality for changelog blocks using GSAP animations. This solution automatically calculates the optimal collapsed height for each block and provides smooth animations when expanding content.

## Features

- **Dynamic Height Calculation**: Automatically determines the best collapsed height for each block based on content
- **Smooth GSAP Animations**: Professional-grade animations for height expansion and button fade-out
- **Multiple Block Support**: Handles multiple changelog blocks on the same page
- **Accessibility**: Keyboard support and proper focus management
- **Performance Optimized**: Uses Intersection Observer for better performance
- **Visual Indicators**: Subtle gradient overlay to indicate truncated content

## Installation

### For Webflow Projects

1. Add the GSAP CDN to your Webflow project:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
   ```

2. Add the custom script to your project:
   ```html
   <script src="path/to/script.js"></script>
   ```

### For Other Projects

1. Install GSAP via npm:
   ```bash
   npm install gsap
   ```

2. Import and use the script:
   ```javascript
   import { ChangelogReadMore } from './script.js';
   new ChangelogReadMore();
   ```

## HTML Structure

Your HTML should follow this structure:

```html
<div class="changelog_block">
    <!-- Your changelog content -->
    <h3>Version 2.1.0</h3>
    <p>Your changelog content here...</p>
    
    <!-- The read more button (can be anywhere within the block) -->
    <button class="read_more_btn">Read More</button>
</div>
```

## CSS Requirements

The script works with minimal CSS requirements. Here are the recommended styles:

```css
.changelog_block {
    position: relative; /* Required for overlay positioning */
    overflow: hidden; /* Will be set by the script */
}

.read_more_btn {
    /* Your button styles */
    cursor: pointer;
}
```

## How It Works

1. **Initialization**: The script automatically finds all `.changelog_block` elements on the page
2. **Height Calculation**: For each block, it calculates the natural content height and sets a collapsed height (60% of content or minimum 200px)
3. **Collapsed State**: Blocks are initially set to the collapsed height with `overflow: hidden`
4. **Visual Indicator**: A subtle gradient overlay is added to indicate truncated content
5. **Expansion**: When the "Read More" button is clicked, GSAP animates the height to full size
6. **Button Removal**: The button fades out and is hidden after expansion

## Configuration Options

The script automatically handles most scenarios, but you can customize the behavior:

### Collapsed Height Calculation

The script uses this formula for collapsed height:
```javascript
const collapsedHeight = Math.min(originalHeight * 0.6, Math.max(200, originalHeight * 0.4));
```

This ensures:
- Maximum 60% of original height
- Minimum 200px height
- At least 40% of original height

### Animation Settings

Default animation settings:
- **Duration**: 0.6 seconds
- **Easing**: "power2.out"
- **Button Fade**: 0.3 seconds

## API Methods

The script exposes several methods for external control:

```javascript
// Expand all blocks
changelogReadMore.expandAllBlocks();

// Reset all blocks to collapsed state
changelogReadMore.resetAllBlocks();

// Access individual block methods (advanced usage)
const block = document.querySelector('.changelog_block');
// Methods are available on the class instance
```

## Browser Support

- Modern browsers with ES6+ support
- Requires GSAP 3.x
- Uses Intersection Observer (with fallback for older browsers)

## Performance Considerations

- **Intersection Observer**: Blocks are only processed when they come into view
- **Efficient DOM Queries**: Minimal DOM manipulation during animations
- **Memory Management**: Proper cleanup of event listeners and observers

## Accessibility Features

- **Keyboard Support**: Enter and Space keys trigger the read more functionality
- **Focus Management**: Proper focus handling for screen readers
- **Semantic HTML**: Works with proper button elements

## Troubleshooting

### Common Issues

1. **Blocks not collapsing**: Ensure your content has enough height to be truncated
2. **Animations not working**: Verify GSAP is loaded before the custom script
3. **Buttons not hiding**: Check that the button has the correct class name `.read_more_btn`

### Debug Mode

You can access the instance globally for debugging:
```javascript
console.log(window.changelogReadMore);
```

## Customization

### Custom Animation Easing

Modify the GSAP animation in the `expandBlock` method:
```javascript
gsap.to(block, {
    height: originalHeight,
    duration: 0.8, // Custom duration
    ease: "elastic.out(1, 0.3)", // Custom easing
    // ... rest of options
});
```

### Custom Collapsed Height

Override the height calculation in `setupSingleBlock`:
```javascript
// Custom collapsed height (e.g., fixed 150px)
const collapsedHeight = 150;
```

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!
