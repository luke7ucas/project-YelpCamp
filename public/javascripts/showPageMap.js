// public/javascripts/showPageMap.js

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 9 // starting zoom

});


    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());    

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)

    // add popup to the marker
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )

    


    .addTo(map);

