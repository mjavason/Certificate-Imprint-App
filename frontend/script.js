// document.body.style.display = 'hidden'; //hide everything
// document.body.style.display = 'block'; //show the page
const documentElement = document.getElementById('document');
const pointerTextInput = document.getElementById('pointerTextInput');
const xAxisInput = document.getElementById('xAxis');
const yAxisInput = document.getElementById('yAxis');
const fontSizeInput = document.getElementById('fontSizeInput');
const pointerColorInput = document.getElementById('pointerColor');
const pointerFontStyleSelect = document.getElementById('pointerFontStyle');
const pointerWidthInput = document.getElementById('pointerWidth');
const imageURLInput = document.getElementById('imageURLInput');
const settingsTextArea = document.getElementById('settingsTextArea');
const loadImageButton = document.getElementById('loadImage');
const draggableElement = document.getElementById('draggableElement');
const verticalLine = document.getElementById('verticalLine');
const horizontalLine = document.getElementById('horizontalLine');

let imageHeight = 0;
let imageWidth = 0;

let data = ['string'];
let settingsValues = {
  width: '200',
  // text: '[text]',
  xAxis: '0',
  yAxis: '0',
  fontSize: '70',
  color: '#000',
  fontStyle: ``,
  alignment: 'center',
};
let template = 'https://via.placeholder.com/1500';

loadImageButton.addEventListener('click', () => {
  const imageUrl = imageURLInput.value; // Path to your image
  loadImage(imageUrl);
});

function previewFontOptions() {
  // Iterate over each option element
  Array.from(pointerFontStyleSelect.options).forEach((option) => {
    if (option.value) {
      option.style.fontFamily = option.value; // Apply font family
    }
  });
}

function loadImage(imageUrl = 'document.jpg') {
  template = imageUrl;
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

      draggableElement.style.left = `${Math.abs(imageWidth / 2)}px`;
      draggableElement.style.top = `${Math.abs(imageHeight / 2)}px`;

      updateSettingsTextArea();
      draggableElement.style.display = 'block';
    };
  } catch (e) {
    window.alert(e.message);
  }
}

function updateText(update) {
  draggableElement.innerText = update;
  // settingsValues.text = update;
  // updateSettingsTextArea();
}

function updateXAxis(update) {
  draggableElement.style.left = `${update}px`;
  settingsValues.xAxis = update;
  updateSettingsTextArea();
}

function updateYAxis(update) {
  draggableElement.style.top = `${update}px`;
  settingsValues.yAxis = update;
  updateSettingsTextArea();
}

function updateFontSize(update) {
  draggableElement.style.fontSize = `${update}px`;
  settingsValues.fontSize = update;
  updateSettingsTextArea();
}

function updateWidth(update) {
  draggableElement.style.width = `${update}px`;
  settingsValues.width = update;
  updateSettingsTextArea();
}

function updateColor(update) {
  draggableElement.style.color = update;
  settingsValues.color = update;
  updateSettingsTextArea();
}

function updateSettingsTextArea() {
  settingsTextArea.innerText = JSON.stringify({
    data,
    template,
    coordinates: settingsValues,
  });
}

function updateFontStyle(update) {
  draggableElement.style.fontFamily = update;
  settingsValues.fontStyle = update;
  updateSettingsTextArea();
}

//#region drag region
document.addEventListener('DOMContentLoaded', () => {
  loadImage();
  previewFontOptions();

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

      updateXAxis(x.toString());
      updateYAxis(y.toString());
      xAxisInput.value = x;
      yAxisInput.value = y;

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

  draggableElement.addEventListener('click', () => {
    pointerTextInput.select();
    pointerTextInput.focus();
  });

  // Mouse events
  draggableElement.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);

  // Touch events
  draggableElement.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', drag);
  document.addEventListener('touchend', endDrag);

  // Updates
  pointerColorInput.addEventListener('input', function (event) {
    const colorValue = event.target.value;
    updateColor(colorValue);
  });

  settingsTextArea.addEventListener('click', function () {
    // Get the inner text of the element
    const textToCopy = this.value;

    // Use the Clipboard API to write text to the clipboard
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        window.alert('Config copied');
      })
      .catch((err) => {
        // Error in copying text
        window.alert('Failed to copy text: ' + err);
      });
  });

  pointerTextInput.addEventListener('input', (event) => {
    const textValue = event.target.value;
    updateText(textValue);
  });

  xAxisInput.addEventListener('input', (event) => {
    const xAxisValue = event.target.value;
    updateXAxis(xAxisValue);
  });

  yAxisInput.addEventListener('input', (event) => {
    const yAxisValue = event.target.value;
    updateYAxis(yAxisValue);
  });

  fontSizeInput.addEventListener('input', (event) => {
    const fontSizeValue = event.target.value;
    updateFontSize(fontSizeValue);
  });

  pointerFontStyleSelect.addEventListener('change', (event) => {
    const fontStyleValue = event.target.value;
    updateFontStyle(fontStyleValue);
  });

  pointerWidthInput.addEventListener('input', (event) => {
    const width = event.target.value;
    updateWidth(width);
  });
});
//#endregion drag region
