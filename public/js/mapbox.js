// Client-side js file to integrate map box
console.log('Hello');

const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoic21hbmFuMyIsImEiOiJja2FqcHNqZmMwY3k0MnRtbmUyaTA3c3k0In0.7AdKPQUF4xS4_WlTI1eO6Q';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/smanan3/ckajq9tqn24u31inrrpticug3',
  scrollZoom: false,
  // zoom: 4,
  // interactive: false,
  // center: [longitude, latitude]
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create a marker element
  const marker = document.createElement('div');
  marker.className = 'marker';

  new mapboxgl.Marker({
    element: marker,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 50,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 200,
    left: 100,
    right: 100,
  },
});
