# Applying Styles

## Layout 
- Use "px" values for layout so that the size of the UI doesn't change when the text size changes.

## Text Styling
- Use "em" for styles related to text.
- Text styles should not be nested. If so, "em" values will be multiplied.
- Use `Prose` container as a parent for all text to ensure that text resizes proportionally.
- If the text on a page needs to be scaled up use the `scale` prop of the `Prose` component.

