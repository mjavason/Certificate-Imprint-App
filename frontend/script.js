// document.body.style.display = 'hidden'; //hide everything
// document.body.style.display = 'block'; //show the page
const documentElement = document.getElementById('document');
const xAxis = document.getElementById('xAxis');
const yAxis = document.getElementById('yAxis');
const fontSize = document.getElementById('fontSize');
const pointerColor = document.getElementById('pointerColor');
const imageURLInput = document.getElementById('imageURLInput');
const loadImageButton = document.getElementById('loadImage');
let imageHeight = 0;
let imageWidth = 0;

loadImageButton.addEventListener('click', () => {
  const imageUrl = imageURLInput.value; // Path to your image
  loadImage(imageUrl);
});

function loadImage(imageUrl = 'document.jpg') {
  console.log('inside loadImage');
  documentElement.style.aspectRatio = 0;
  documentElement.style.backgroundImage = `url(${imageUrl})`; // Provide the path to your image
  documentElement.style.backgroundSize = 'cover';
  documentElement.style.position = 'relative';
  //   console.log('computed styles', getComputedStyle(documentElement));

  try {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Set the container's aspect ratio based on the image's dimensions
      // const aspectRatio = img.width / img.height;
      // documentElement.style.aspectRatio = `${aspectRatio}`;

      //testing actual width and height
      documentElement.style.width = `${img.width}px`;
      documentElement.style.height = `${img.height}px`;
      imageHeight = img.height;
      imageWidth = img.width;
    };
  } catch (e) {
    window.alert(e.message);
  }
}

//#region drag region
document.addEventListener('DOMContentLoaded', () => {
  const draggableElement = document.getElementById('draggableElement');
  const verticalLine = document.getElementById('verticalLine');
  const horizontalLine = document.getElementById('horizontalLine');
  loadImage();

  let offsetX = 0,
    offsetY = 0;
  let isDragging = false;

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
    event.preventDefault();
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
      const viewportWidth = imageWidth;
      const viewportHeight = imageHeight;

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

      // Define a range around the middle of the screen
      const centerRange = 20; // Width in pixels of the center zone

      // Check if the element is in the middle of the screen within the range
      const isCenteredHorizontally =
        Math.abs(x + elementWidth / 2 - viewportWidth / 2) <= centerRange;
      const isCenteredVertically =
        Math.abs(y + elementHeight / 2 - viewportHeight / 2) <= centerRange;

      // Show the vertical line if centered within range horizontally and accurately position the element
      //   verticalLine.style.display = isCenteredHorizontally ? 'block' : 'none';
      if (isCenteredHorizontally) {
        verticalLine.style.display = 'block';
        draggableElement.style.left = `${Math.abs(
          elementWidth / 2 - viewportWidth / 2
        )}px`;
      } else {
        verticalLine.style.display = 'none';
      }

      // Show the horizontal line if centered within range vertically
      horizontalLine.style.display = isCenteredVertically ? 'block' : 'none';
      if (isCenteredVertically) {
        horizontalLine.style.display = 'block';
        draggableElement.style.top = `${Math.abs(
          elementHeight / 2 - viewportHeight / 2
        )}px`;
      } else {
        horizontalLine.style.display = 'none';
      }
    }
  }

  // Function to handle the end of dragging
  function endDrag() {
    isDragging = false;
    draggableElement.style.cursor = 'grab';
    verticalLine.style.display = 'none'; // Hide vertical line when dragging ends
    horizontalLine.style.display = 'none'; // Hide horizontal line when dragging ends
  }

  // Mouse events
  draggableElement.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);

  // Touch events
  draggableElement.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', drag);
  document.addEventListener('touchend', endDrag);
});
//#endregion drag region
