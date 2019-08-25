let currentCol = null;
let activeTool = null;
let bucket = null;
let colorPicker = null;
let moveTool = null;
let transformTool = null;
let currentDroppable = null;
let currentFigureLeft = null;
let currentFigureTop = null;
let savedLocally = null;

// Restore state after load(reload) if saved in localStorage
savedLocally = localStorage.getItem('bodyHTML');

if (savedLocally) {
  document.querySelector('body').innerHTML = savedLocally;
  activeTool = document.querySelector('.active');
  if (activeTool) {
    activeTool.classList.toggle('active');
  }
  activeTool = null;
}

currentCol = getComputedStyle(document.getElementById('current-color').firstElementChild).backgroundColor;
bucket = document.getElementById('paint-bucket');
colorPicker = document.getElementById('choose-color');
moveTool = document.getElementById('move');
transformTool = document.getElementById('transform');

function activeToolSwitch(tool) {
  if (activeTool) {
    activeTool.classList.toggle('active');
  }
  activeTool = tool;
  activeTool.classList.toggle('active');
}

function calculateFiguresTopLeft() {
  const figures = document.querySelectorAll('.figure');
  for (let i = 0; i < figures.length; i += 1) {
    figures[i].style.left = `${figures[i].getBoundingClientRect().left}px`;
    figures[i].style.top = `${figures[i].getBoundingClientRect().top}px`;
    document.body.append(figures[i]);
  }
}

// Append figures to body and calculate their top and left
if (!savedLocally) {
  calculateFiguresTopLeft();
}

// Choose tool with mouse click
document.addEventListener('mousedown', (event) => {
  if (!event.target.closest('.tools')) return;
  if (event.target.closest('#paint-bucket')) {
    if (activeTool !== bucket) {
      activeToolSwitch(bucket);
    }
  } else if (event.target.closest('#choose-color')) {
    if (activeTool !== colorPicker) {
      activeToolSwitch(colorPicker);
    }
  } else if (event.target.closest('#move')) {
    if (activeTool !== moveTool) {
      activeToolSwitch(moveTool);
    }
  } else if (event.target.closest('#transform')) {
    if (activeTool !== transformTool) {
      activeToolSwitch(transformTool);
    }
  }
});

// Choose tool with hotkeys
document.addEventListener('keydown', (event) => {
  function defocusActiveTool(toolActive) {
    if (toolActive) {
      toolActive.blur();
    }
  }

  if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey)) {
    if (activeTool !== bucket) {
      defocusActiveTool(activeTool);
      activeToolSwitch(bucket);
    }
  } else if (event.code === 'KeyC' && event.altKey) {
    if (activeTool !== colorPicker) {
      defocusActiveTool(activeTool);
      activeToolSwitch(colorPicker);
    }
  } else if (event.code === 'KeyV' && (event.ctrlKey || event.metaKey)) {
    if (activeTool !== moveTool) {
      defocusActiveTool(activeTool);
      activeToolSwitch(moveTool);
    }
  } else if (event.code === 'KeyV' && event.altKey) {
    if (activeTool !== transformTool) {
      defocusActiveTool(activeTool);
      activeToolSwitch(transformTool);
    }
  }
});

// Paint, transform figures
document.addEventListener('click', (event) => {
  const ev = event;
  if (!ev.target.classList.contains('figure')) return;

  if (activeTool === bucket) {
    ev.target.style.backgroundColor = currentCol;
  } else if (activeTool === moveTool) {
    ev.target.style.backgroundColor = currentCol;
  } else if (activeTool === transformTool) {
    ev.target.classList.toggle('round');
  }
});

// Choose color
document.addEventListener('click', (event) => {
  if (activeTool === colorPicker && !event.target.closest('.tools') && !event.target.closest('header')) {
    if (getComputedStyle(event.target).backgroundColor) {
      const bufferColor = getComputedStyle(event.target).backgroundColor;
      if (currentCol === bufferColor) return;
      document.getElementById('prev-color').firstElementChild.style.backgroundColor = currentCol;
      currentCol = bufferColor;
      document.getElementById('current-color').firstElementChild.style.backgroundColor = currentCol;
    }
  }
});

//  Move and D&D figures
function dragAndDrop(event) {
  const figure = event.target;

  currentFigureLeft = figure.getBoundingClientRect().left;
  currentFigureTop = figure.getBoundingClientRect().top;

  const shiftX = event.clientX - figure.getBoundingClientRect().left;
  const shiftY = event.clientY - figure.getBoundingClientRect().top;

  document.body.append(figure);

  function moveAt(pageX, pageY) {
    figure.style.left = `${pageX - shiftX}px`;
    figure.style.top = `${pageY - shiftY}px`;
  }

  moveAt(event.pageX, event.pageY);

  function onMouseMove(ev) {
    moveAt(ev.pageX, ev.pageY);

    figure.hidden = true;
    const elemBelow = document.elementFromPoint(ev.clientX, ev.clientY);
    figure.hidden = false;

    if (!elemBelow) return;

    function enterDroppable(elem) {
      elem.classList.toggle('half-opacity');
    }

    function leaveDroppable(elem) {
      elem.classList.toggle('half-opacity');
    }

    const droppableBelow = elemBelow.closest('.figure');
    if (currentDroppable !== droppableBelow) {
      if (currentDroppable) {
        leaveDroppable(currentDroppable);
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        enterDroppable(currentDroppable);
      }
    }
  }

  document.addEventListener('mousemove', onMouseMove);

  figure.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', onMouseMove);

    if (currentDroppable) {
      figure.style.left = `${currentDroppable.getBoundingClientRect().left}px`;
      figure.style.top = `${currentDroppable.getBoundingClientRect().top}px`;

      document.body.append(currentDroppable);
      currentDroppable.style.left = `${currentFigureLeft}px`;
      currentDroppable.style.top = `${currentFigureTop}px`;
      currentDroppable.classList.toggle('half-opacity');
      currentDroppable = null;
    }

    figure.onmouseup = null;
  });
  event.preventDefault();
}

document.addEventListener('mousedown', (ev) => {
  if (activeTool === moveTool && ev.target.classList.contains('figure')) {
    dragAndDrop(ev);
  }
});

// Save or reset the page
document.addEventListener('click', (event) => {
  if (event.target.closest('.save')) {
    const bodyHTML = document.querySelector('body').innerHTML;
    localStorage.setItem('bodyHTML', bodyHTML);
    event.target.blur();
  } else if (event.target.closest('.reset')) {
    if (savedLocally) {
      localStorage.removeItem('bodyHTML');
      document.location.reload(true);
    }
  }
});
