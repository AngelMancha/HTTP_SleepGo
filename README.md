Ángel José Manch Núñez 100451302 Grupo 82

Descripción e instrucciones de uso de la aplicación:

Sleep&Go es una aplicación con la que los usuarios podrán dormirse en el transporte público hasta que estén dentro del radio de
un kilómetro alrededor del destino que introdujeron al principio.

Para hacer uso de la aplicación basta con seleccionar pinchando directamente en el mapa el destino deseado y posteriormente presionar
el botón "comenzar", lo que pondrá en funcionamiento la obtención de la ubicación en tiempo real del usuario. En todo momento en el mapa habrá dos
marcadores, uno que representa la ubicación en tiempo real del usuario y otro marcador estático el cual tiene un círculo de un kilómetro alrededor de él 
para simular el destino. Ambos marcadores están unidos por una recta y a medida que el usuario se vaya acercando al destino, el marcador de la ubicación 
se irá arcercando también hasta que entre en el radio del destino, lo que hará que aparezca una alerta en patalla y el dispositivo movil comience a vibrar.

El botón "detner" detiene la obtención en tiempo real de la ubicación y elimina los marcadores del mapa

Descripción del código:

En lo que se refiere a la implementación de las funcionalidades mencionadas en javascript, se ha dividido principamente en dos funciones.
La primera de ellas, "marcador()", se encarga de capturar el evento "click" del usuario sobre el mapa para dar coordenadas al marcado que repesentará el
destino del usuario.
La función "vibrar()", se encarga de actualizar en todo momento las coordenadas del marcador que representa la ubicación en tiempo real del usuario a través
del método "watchPosition()" del servicio de Leaflet para obtener las coordenadas cuando se produce un cambio en la ubicación. De esta manera, y mediante la 
función "dentro_radio()", en el momento en que las coordenadas del usuario estén contenidas en el radio de un kilómetro que rodea el marcador del destino se 
mostrará una ventana modal y se usará "navigator.vibrate" para hacer vibrar el dispositivo movil mientras que no se salga del radio.

