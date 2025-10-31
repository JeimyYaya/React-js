# Laboratorio: Introducción a React-JS
- **Jeimy Yaya**

Este laboratorio introduce los conceptos básicos de **React** y su integración con una aplicación **Spring Boot**, sirviendo recursos estáticos y componentes dinámicos.  
Se implementa una pequeña aplicación web que muestra un mensaje dinámico desde el backend y un componente React que renderiza información en el cliente.

---

## Objetivos

- Comprender cómo servir contenido estático desde un proyecto **Spring Boot**.  
- Configurar el entorno para usar **React + Babel** sin herramientas externas (como Webpack o Vite).  
- Crear componentes React simples (`FirstComponent.jsx` y `StatusComponent.jsx`).  
- Establecer comunicación entre el frontend (React) y el backend (Spring Boot).  

---

## Tecnologías utilizadas

- **Java 11+**
- **Spring Boot 2.3.1**
- **Maven**
- **React 16 (via CDN)**
- **Babel Standalone (para JSX en navegador)**

---

## Estructura del proyecto
```
REACT-JS/
│
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/
        │        └── example/
        │            └── WebSiteController.java
        └── resources/
            └── static/
                ├── index.html
                └── js/
                    ├── FirstComponent.jsx
                    └── StatusComponent.jsx
```


---

## Contenido principal

### `WebSiteController.java`
Controlador principal con endpoint `/status` y método `main` que inicia Spring Boot.

```java
@GetMapping("/status")
public String status() {
    return "{\"status\":\"Greetings from Spring Boot. "
           + LocalDate.now() + ", "
           + LocalTime.now()
           + ". The server is Running!\"}";
}
```
### `index.html`
Archivo estático que carga React, ReactDOM y Babel desde CDNs, y monta los componentes en el DOM:

```
<div id="root"></div>
<div id="status"></div>

<script src="https://unpkg.com/react@16/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
<script src="js/FirstComponent.jsx" type="text/babel"></script>
<script src="js/StatusComponent.jsx" type="text/babel"></script>
```

### `FirstComponent.jsx`

Primer componente React, renderiza un saludo o la hora actual cada segundo:


```
function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  );
  ReactDOM.render(element, document.getElementById('root'));
}
setInterval(tick, 1000);
```
### `StatusComponent.jsx`

Componente React que consulta periódicamente el endpoint /status y muestra la respuesta del servidor:
```
fetch("/status")
  .then(res => res.json())
  .then(result => this.setState({ status: result.status }));
```

## Ejecución
1. Compilar y ejecutar el proyecto:
```
mvn spring-boot:run
```
2. Abrir en el navegador:
- http://localhost:8080/index.html - vista React.
- http://localhost:8080/status - estado JSON desde Spring Boot.

## Resultado esperado
<img width="841" height="273" alt="image" src="https://github.com/user-attachments/assets/750a41a7-40a5-49c4-b3f9-f592d45efd38" />
<img width="854" height="211" alt="image" src="https://github.com/user-attachments/assets/944d4af4-0f97-45c2-8d30-ccd98f09d9e7" />

---

# Segunda parte: Tablero colaborativo con p5.js

En esta parte del laboratorio se implementó un **tablero colaborativo en línea**, utilizando **p5.js** y un backend desarrollado en **Spring Boot**.  
El objetivo es permitir que múltiples usuarios dibujen en tiempo real sobre el mismo lienzo compartido, asignando un color único a cada usuario y ofreciendo la posibilidad de borrar el tablero de forma global.

---

## Objetivos específicos

- Integrar **p5.js** con el proyecto **Spring Boot** existente.  
- Permitir interacción colaborativa entre múltiples usuarios mediante **peticiones periódicas (polling)**.  
- Implementar un botón de borrado que limpie el tablero para todos los usuarios conectados.  
- Asignar automáticamente un color distinto a cada usuario.

---

## Arquitectura general

| Capa | Tecnología | Función |
|------|-------------|---------|
| Backend | Spring Boot | Provee endpoints REST para agregar, consultar y borrar puntos. |
| Frontend | p5.js | Renderiza el tablero y gestiona la interacción del usuario. |
| Comunicación | Fetch API (polling) | Sincroniza los puntos cada segundo entre clientes y servidor. |

---

## Estructura añadida
```
src/
└── main/
    ├── java/com/example/
    │   ├── WebSiteController.java
    │   └── BoardController.java ← nuevo controlador
    └── resources/static/
        ├── index.html ← tablero p5.js
        └── js/
            ├── Board.js ← script principal del tablero
            ├── FirstComponent.jsx
            └── StatusComponent.jsx
```
---

## Backend: `BoardController.java`

```java
@RestController
@RequestMapping("/board")
public class BoardController {

    private final List<Point> points = Collections.synchronizedList(new ArrayList<>());

    @PostMapping("/add")
    public void addPoint(@RequestBody Point p) {
        points.add(p);
    }

    @GetMapping("/points")
    public List<Point> getPoints() {
        return points;
    }

    @DeleteMapping("/clear")
    public void clearPoints() {
        points.clear();
    }

    static class Point {
        public float x;
        public float y;
        public String color;
    }
}
```
## Script principal: sketch.js
```
let points = [];
let userColor;

function setup() {
  createCanvas(640, 480);
  background(255);

  // Asignar un color único a cada usuario
  userColor = getRandomColor();

  // Cargar puntos actuales y actualizarlos cada segundo
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
```

## Ejecución

1. Compilar y ejecuta el proyecto:
```
mvn spring-boot:run
```

2. Abrir en el navegador:
 http://localhost:8080/index.html

3. Dibujar con el mouse.
- Cada usuario tiene un color distinto.
- El tablero se actualiza automáticamente cada segundo.
- Al oprimir “🧹 Limpiar tablero”, se borra para todos los usuarios.

## Resultado
<img width="951" height="819" alt="image" src="https://github.com/user-attachments/assets/3fe5c2a4-8881-474c-99cc-76a2ddce2cf2" />


