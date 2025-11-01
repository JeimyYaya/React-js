let points = [];
let userColor;

function setup() {
  createCanvas(640, 480);
  background(255);

  userColor = getRandomColor();

  loadPoints();

  setInterval(loadPoints, 1000);
}

function draw() {
  background(255);

for (let p of points) {
    fill(p.color);
    noStroke();
    ellipse(p.x, p.y, 12, 12);
  }
}

function mouseDragged() {
  const point = { x: mouseX, y: mouseY, color: userColor };
  points.push(point);
  sendPoint(point);
}

function sendPoint(point) {
  fetch('/board/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(point)
  }).catch(err => console.error('Error enviando punto:', err));
}

function loadPoints() {
  fetch('/board/points')
    .then(res => res.json())
    .then(data => (points = data))
    .catch(err => console.error('Error cargando puntos:', err));
}

function clearBoard() {
  fetch('/board/clear', { method: 'DELETE' })
    .then(() => {
      points = [];
      background(255);
    })
    .catch(err => console.error('Error al borrar:', err));
}

function getRandomColor() {
  const r = floor(random(50, 255));
  const g = floor(random(50, 255));
  const b = floor(random(50, 255));
  return `rgb(${r},${g},${b})`;
}
