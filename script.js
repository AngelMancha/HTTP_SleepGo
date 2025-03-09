const mymap = L.map('sample_map').setView([40.416454203747655, -3.7051120305568914], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  
}).addTo(mymap);

mymap.on('click', function(e) {
  console.log(e);
})

// Definimos el nuevo icono usando la imagen green.png
const greenIcon = L.icon({
    iconUrl: 'images/green.png',
    iconSize: [45, 60], // tamaño del icono
    iconAnchor: [22, 60], // punto del icono que corresponderá a la posición del marcador
    popupAnchor: [-3, -76] // punto desde el cual se abrirá el popup relativo al icono
});

const redIcon = L.icon({
  iconUrl: 'images/Pin-location.png',
  iconSize: [45, 60], // tamaño del icono
  iconAnchor: [22, 60], // punto del icono que corresponderá a la posición del marcador
  popupAnchor: [-3, -76] // punto desde el cual se abrirá el popup relativo al icono
});

// Variables globales que representarán las coordenadas del marcador del destino
let latitud_destino;
let longitud_destino;
let marcado = false;
var modal = document.getElementById("modal-ventana");
var modal2 = document.getElementById("modal-ventana2");
let seguimiento = null;
let polyline = null;
let circle = null;

document.querySelector('.boton2.detener').style.display = 'none';

comenzar();

function comenzar() {
  // Definimos la ubicación actual del usuario representada con el marcador "marcador_posicion" inicializado con coordenadas 0,0
  marcador_posicion = L.marker([0, 0], { icon: redIcon }).addTo(mymap);
  polyline = L.polyline([], { color: 'red' }).addTo(mymap);

  // Llamamos a la función marcador() que da valor a las coordenadas del marcador
  marcador();
}

// Función que crea un marcador en el destino del usuario
function marcador() {
  // Creamos un marcador en el mapa que representa el destino del usuario
  mymap.once('click', function(e) {
    console.log(e.latlng);
    let marcador_destino = L.marker(e.latlng, { icon: greenIcon }).addTo(mymap);

    // Obtenemos las coordenandas del marcador
    latitud_destino = marcador_destino.getLatLng().lat;
    longitud_destino = marcador_destino.getLatLng().lng;
    marcado = true;

    // Círculo alrededor del marcador con 1 km de radio
    circle = L.circle([latitud_destino, longitud_destino], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.2,
      radius: 1000
    }).addTo(mymap);
  });
}

// Función que busca el destino y muestra las opciones en una lista
function buscarDestino() {
  const destino = document.getElementById('destino-input').value;
  if (!destino) {
    alert("Por favor, escribe un destino.");
    return;
  }

  // Usamos la API de Nominatim para buscar la ubicación
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${destino}`)
    .then(response => response.json())
    .then(data => {
      const listaOpciones = document.getElementById('lista-opciones');
      listaOpciones.innerHTML = ''; // Limpiar la lista de opciones anteriores

      if (data.length > 0) {
        data.forEach((item, index) => {
          const li = document.createElement('li');
          li.textContent = item.display_name;
          li.onclick = () => seleccionarDestino(item.lat, item.lon);
          listaOpciones.appendChild(li);
        });
      } else {
        alert("Destino no encontrado.");
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert("Error al buscar el destino.");
    });
}

// Función que selecciona un destino de la lista y coloca el marcador en el mapa
function seleccionarDestino(lat, lon) {
  const latlng = [lat, lon];
  let marcador_destino = L.marker(latlng, { icon: greenIcon }).addTo(mymap);

  // Obtenemos las coordenandas del marcador
  latitud_destino = marcador_destino.getLatLng().lat;
  longitud_destino = marcador_destino.getLatLng().lng;
  marcado = true;

  // Círculo alrededor del marcador con 1 km de radio
  circle = L.circle([latitud_destino, longitud_destino], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.2,
    radius: 1000
  }).addTo(mymap);

  // Centrar el mapa en el marcador
  mymap.setView(latlng, 15);

  // Limpiar la lista de opciones
  document.getElementById('lista-opciones').innerHTML = '';
}

// Función que se ejecuta cada vez que el usuario se mueve y cuando esté a menos de 1km del destino hará vibrar el dispositivo móvil
function vibrar() {
  // Verificar si se ha seleccionado un destino
  if (!marcado) {
    alert("Por favor, selecciona un destino en el mapa antes de comenzar.");
    return;
  }

  // Se hace visible la ventana modal que muestra las indicaciones
  let modal = document.getElementById("modal-ventana");
  modal.style.display = "block";
  
  // Ocultar el botón "Comenzar"
  document.querySelector('.boton2.comenzar').style.display = 'none';
  document.querySelector('.boton2.lupa').style.display = 'none';
  document.querySelector('.boton.destino').style.display = 'none';
  document.querySelector('.boton2.detener').style.display = 'block';

  // Si el marcador del destino ha sido creado:
  if (marcado == true) {
    // Obtenemos las coordenadas actuales del usuario en movimiento
    if ("geolocation" in navigator) {
      seguimiento = navigator.geolocation.watchPosition(function(position) {
        // El marcador "marcador_posicion" se mueve con el usuario
        marcador_posicion.setLatLng([position.coords.latitude, position.coords.longitude]);

        // En todo momento el mapa se centra en el marcador de la ubicación del usuario "marcador_posicion" y el marcador del destino "marcador_destino"
        const latLngs = [marcador_posicion.getLatLng(), [latitud_destino, longitud_destino]];
        const bounds = L.latLngBounds(latLngs);
        mymap.fitBounds(bounds);

        // También se añade una recta que una ambos marcadores
        polyline.setLatLngs([[position.coords.latitude, position.coords.longitude], [latitud_destino, longitud_destino]]);
        // Calculamos si la ubicación actual está dentro del radio de 1km
        var dentro_del_radio = dentro_radio(position.coords.latitude, position.coords.longitude, latitud_destino, longitud_destino, 1);

        // Si el usuario está a menos de 1km del destino, se mostrará un mensaje y el dispositivo vibrará
        if (dentro_del_radio == true) {
          let mensaje = document.getElementById("mensaje");
          mensaje.innerHTML = ("");
          modal.style.display = "none";
          modal2.style.display = "block";
          navigator.vibrate(3000);
        } else {
          let mensaje = document.getElementById("mensaje");
          mensaje.innerHTML = ("Todavía estás a más de 1km de tu destino");
          modal2.style.display = "none";
          mensaje.style.color = "black";
        }
      });
    }
  }
}

function dentro_radio(latitud1, longitud1, latitud2, longitud2, radio) {
  const radio_tierra = 6371; // Radio de la Tierra en km

  // Convertir las coordenadas a radianes
  const latitud1_rad = latitud1 * Math.PI / 180;
  const longitud1_rad = longitud1 * Math.PI / 180;
  const latitud2_rad = latitud2 * Math.PI / 180;
  const longitud2_rad = longitud2 * Math.PI / 180;

  // Calcular la distancia entre las dos ubicaciones utilizando la fórmula de Haversine
  const distancia = 2 * radio_tierra * Math.asin(Math.sqrt(Math.pow(Math.sin((latitud2_rad - latitud1_rad) / 2), 2) + Math.cos(latitud1_rad) * Math.cos(latitud2_rad) * Math.pow(Math.sin((longitud2_rad - longitud1_rad) / 2), 2)));

  // Verificar si la distancia está dentro del radio
  if (distancia <= radio) {
    return true;
  } else {
    return false;
  }
}

// Función que elimina los marcadores destino y ubicación y el círculo de 1km
function detener() {
  marcado = false;
  modal2.style.display = "none";
  
  // Mostrar el botón "Comenzar"
  document.querySelector('.boton2.comenzar').style.display = 'block';
  document.querySelector('.boton2.detener').style.display = 'none';
  document.querySelector('.boton2.lupa').style.display = 'block';
  document.querySelector('.boton.destino').style.display = 'block';

  // Detenemos la obtención de la ubicación actual del usuario
  if (seguimiento !== null) {
    navigator.geolocation.clearWatch(seguimiento); // Esto detiene el seguimiento
    seguimiento = null; // Limpiar la variable para que no quede con valor residual
  }
  // Eliminamos el marcador y el círculo
  if (circle) {
    mymap.removeLayer(circle);
    circle = null;
  }
  mymap.eachLayer(function(layer) {
    if (layer instanceof L.Marker) {
      mymap.removeLayer(layer);
    }
  });

  // Eliminamos la recta que une los marcadores
  if (polyline) {
    mymap.removeLayer(polyline);
    polyline = null;
  }

  // Llamamos a la función marcador() que da valor a las coordenadas del marcador
  comenzar();
}

// Función que cierra la ventana modal
function cerrar() {
  modal = document.getElementById("modal-ventana");
  modal.style.display = "none";
}