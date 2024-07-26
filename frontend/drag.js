// if the element youre making draggable has content within that you wish to interact with, you need to ensure the parent elements z-index is lower than its child/children.

document.addEventListener('DOMContentLoaded', () => {
  function isMobileDevice() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  if (isMobileDevice()) {
    window.alert('For best experience please use a PC');
  }

  const draggableElement = document.getElementById('draggable');

  draggableElement.style.position = 'absolute';
  draggableElement.style.zIndex = 1; //send to the back and allow the children come forward.
  draggableElement.style.cursor = 'grab';
  draggableElement.style.top = '0px';
  draggableElement.style.left = `${
    window.innerWidth - draggableElement.offsetWidth
  }px`; //default position
  disableTextSelection(draggableElement);

  let offsetX = 0,
    offsetY = 0;
  let isDragging = false;

  // Function to apply user-select: none
  function disableTextSelection(targetElement) {
    targetElement.style.userSelect = 'none'; // Modern browsers
    targetElement.style.webkitUserSelect = 'none'; // Safari
    targetElement.style.mozUserSelect = 'none'; // Firefox
    targetElement.style.msUserSelect = 'none'; // Internet Explorer/Edge
  }

  // Function to re-enable text selection
  function enableTextSelection() {
    targetElement.style.userSelect = 'auto'; // Restore default behavior
    targetElement.style.webkitUserSelect = 'auto';
    targetElement.style.mozUserSelect = 'auto';
    targetElement.style.msUserSelect = 'auto';
  }

  // Function to handle the start of dragging
  function startDrag(event) {
    const clientX =
      event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    const clientY =
      event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;

    offsetX = clientX - draggableElement.getBoundingClientRect().left;
    offsetY = clientY - draggableElement.getBoundingClientRect().top;
    isDragging = true;
    draggableElement.style.cursor = 'grabbing';
    // event.preventDefault();
  }

  // Function to handle the dragging motion
  function drag(event) {
    if (isDragging) {
      const clientX =
        event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
      const clientY =
        event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;

      let x = clientX - offsetX;
      let y = clientY - offsetY;

      // Get the dimensions of the viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get the dimensions of the draggable element
      const elementWidth = draggableElement.offsetWidth;
      const elementHeight = draggableElement.offsetHeight;

      // Ensure the element stays within the viewport boundaries
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + elementWidth > viewportWidth) x = viewportWidth - elementWidth;
      if (y + elementHeight > viewportHeight)
        y = viewportHeight - elementHeight;

      draggableElement.style.left = `${x}px`;
      draggableElement.style.top = `${y}px`;
    }
  }

  // Function to handle the end of dragging
  function endDrag() {
    isDragging = false;
    draggableElement.style.cursor = 'grab';
  }

  // Mouse events
  draggableElement.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);

  // Touch events
  draggableElement.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', drag);
  document.addEventListener('touchend', endDrag);
  // }
});
