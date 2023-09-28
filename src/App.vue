<script setup lang="ts">
import { onMounted } from "vue";
import { Map, Popup } from "maplibre-gl";
import congtrinh3d from './assets/congtrinh3d-may44.json'
import indoor3D from './assets/indoor-3d-map.json'
// import { select } from "d3";
onMounted(() => {
  const map = new Map({
    container: 'map',
    style: {
      'version': 8,
      'name': 'Raster tiles',
      'center': [0, 0],
      'zoom': 0,
      'sources': {
        'raster-tiles': {
          'type': 'raster',
          'tiles': ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          'tileSize': 256,
          'minzoom': 0,
          'maxzoom': 19
        }
      },
      'layers': [
        {
          'id': 'background',
          'type': 'background',
          'paint': {
            'background-color': '#e0dfdf'
          }
        },
        {
          'id': 'simple-tiles',
          'type': 'raster',
          'source': 'raster-tiles'
        }
      ],
      "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    },
    center: [106.692544335513603, 10.770398465053876],
    zoom: 15,
    pitch: 40,
    bearing: 20,
    antialias: true
  });

  map.on('load', () => {
    map.addSource('floorplan', {
      // GeoJSON Data source used in vector tiles, documented at
      // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
      'type': 'geojson',
      'data': indoor3D
    });

    map.addLayer({
      'id': 'room-extrusion',
      'type': 'fill-extrusion',
      'source': 'floorplan',
      'paint': {
        // See the MapLibre Style Specification for details on data expressions.
        // https://maplibre.org/maplibre-style-spec/expressions/

        // Get the fill-extrusion-color from the source 'color' property.
        'fill-extrusion-color': ['get', 'color'],

        // Get fill-extrusion-height from the source 'height' property.
        'fill-extrusion-height': ['get', 'height'],

        // Get fill-extrusion-base from the source 'base_height' property.
        'fill-extrusion-base': ['get', 'base_height'],

        // Make extrusions slightly opaque for see through indoor walls.
        'fill-extrusion-opacity': 1
      }
    });

    map.addLayer({
      "id": "text-labels",
      "type": "symbol",
      "source": "floorplan",

      "layout": {
        "text-field": ['get', 'name'], // Use your attribute with text data here
        "text-size": 14,
      },
      "paint": {
        "text-color": "black",
      }
    })
    map.on('click', 'room-extrusion', (e) => {
      if (!e.features || e.features.length == 0) return;

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<p>${JSON.stringify(e.features[0].properties, null, 2)}</p>`)
        .addTo(map);
    });

    map.on('mouseenter', 'room-extrusion', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'room-extrusion', () => {
      map.getCanvas().style.cursor = '';
    });

    map.addSource('room-data-source', {
      type: 'vector',
      url: '/sample.json'
    });

    map.addLayer({
      'id': 'room-extrude1',
      'type': 'fill-extrusion',
      'source': 'room-data-source',
      "source-layer": "room_cleaned-b0ndmw",
      'paint': {
        'fill-extrusion-color': {
          'property': 'RMTYP',
          'type': 'categorical',
          "default": "#cfcfda",
          "stops": [
            ["010", "#afafbe"],
            ["020", "#eeeeee"], // circulation
            ["030", "#cfcfda"],
            ["040", "#d62728"], // restroom

            ["250", "#fc8d62"], //lab
            ["255", "#fc8d62"],

            ["850", "#B04E69"], // hospital
            ["835", "#B04E69"],
            ["810", "#B04E69"],
            ["855", "#B04E69"],
            ["830", "#B04E69"],
            ["820", "#B04E69"],

            ["910", "#80b192"],  // residential
            ["920", "#80b192"],
            ["950", "#80b192"],

            ["310", "#8da0cb"],  // office 
            ["315", "#8da0cb"],

            ["350", "#7B6698"],  // conference
            ["610", "#7B6698"],

            ["630", "#2ca02c"],  // food, shop, recreation
            ["635", "#2ca02c"],
            ["650", "#2ca02c"],
            ["655", "#2ca02c"],
            ["660", "#2ca02c"],
            ["665", "#2ca02c"],
            ["670", "#2ca02c"],
            ["675", "#2ca02c"],
            ["720", "#2ca02c"],
            ["725", "#2ca02c"],

            ["110", "#e6b74c"],  // classroom
            ["115", "#e6b74c"],
            ["210", "#e6b74c"],  // class lab
            ["215", "#e6b74c"],

            ["410", "#4EB091"],  // study room
            ["420", "#4EB091"],
            ["430", "#4EB091"],

          ]
        },
        'fill-extrusion-height': {
          'property': 'ceiling_height',
          'type': 'identity'
        },
        'fill-extrusion-base': {
          'property': 'floor_height',
          'type': 'identity'
        },
        // 'fill-extrusion-opacity': 1,
      }
    });

    map.on('mouseenter', 'room-extrude1', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'room-extrude1', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('click', 'room-extrude1', (e) => {
      if (!e.features || e.features.length == 0) return;
      let content = '';
      const properties = e.features[0].properties;
      for (const key in properties) {
        content += `<p>${key}: ${properties[key]}</p>`
      }

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(content)
        .addTo(map);
    });



    // let currentFloors = ["0A", "0B", "0G", "01", "02", "03", "04", "05", "06",
    //   "07", "08", "09"].reverse();
    // currentFloors.unshift("all");
    // select("#floorControl")
    //   .selectAll("button")
    //   .data(currentFloors)
    //   .enter()
    //   .append("button")
    //   .attr("type", "button")
    //   .attr("class", "btn btn-default")
    //   .html(function (d) {
    //     return d;
    //   })
    //   .on("click", function (d: PointerEvent) {
    //     const target = d.target as HTMLElement;
    //     const value = target.textContent ?? ''

    //     if (value == "all") {
    //       map.setFilter('room-extrude1', ['!=', 'Floor', value]);
    //     } else {
    //       map.setFilter('room-extrude1', ['==', 'Floor', value]);
    //     }


    //     select("#floorControl")
    //       .selectAll("button").attr("class", "btn btn-default")
    //     target.classList.add("active")
    //   });
    // document.querySelector('#floorControl button')?.classList.add('active')

    // Du lieu anh DUC
    map.addSource('congtrinh3d', {
      type: 'geojson',
      data: congtrinh3d
    });

    map.addLayer({
      'id': 'id-congtrinh3d',
      'type': 'fill-extrusion',
      'source': 'congtrinh3d',
      'paint': {
        // See the MapLibre Style Specification for details on data expressions.
        // https://maplibre.org/maplibre-style-spec/expressions/

        // Get the fill-extrusion-color from the source 'color' property.
        'fill-extrusion-color': {
          'property': 'stt',
          'type': 'categorical',
          "default": "#cfcfda",
          "stops": [
            [1, "#afafbe"],
            [2, "#eeeeee"], // circulation
            [3, "#cfcfda"],
            [4, "#d62728"], // restroom

            [5, "#fc8d62"], //lab
            // [6, "#fc8d62"],

            [6, "#B04E69"], // hospital
            // ["835", "#B04E69"],
            // ["810", "#B04E69"],
            // ["855", "#B04E69"],
            // ["830", "#B04E69"],
            // ["820", "#B04E69"],

            [7, "#80b192"],  // residential
            // ["920", "#80b192"],
            // ["950", "#80b192"],

            [8, "#8da0cb"],  // office 
            // ["315", "#8da0cb"],

            [9, "#7B6698"],  // conference
            // ["610", "#7B6698"],

            [10, "#2ca02c"],  // food, shop, recreation
            [13, "#2ca02c"],
            // ["650", "#2ca02c"],
            // ["655", "#2ca02c"],
            // ["660", "#2ca02c"],
            // ["665", "#2ca02c"],
            // ["670", "#2ca02c"],
            // ["675", "#2ca02c"],
            // ["720", "#2ca02c"],
            // ["725", "#2ca02c"],

            [11, "#e6b74c"],  // classroom
            // ["115", "#e6b74c"],
            // ["210", "#e6b74c"],  // class lab
            // ["215", "#e6b74c"],

            [12, "#4EB091"],  // study room
            // ["420", "#4EB091"],
            // ["430", "#4EB091"],

          ]
        },

        // Get fill-extrusion-height from the source 'height' property.
        'fill-extrusion-height': ['get', 'chieucao'],

        // Get fill-extrusion-base from the source 'base_height' property.
        'fill-extrusion-base': ['get', 'chieucaode'],

        // Make extrusions slightly opaque for see through indoor walls.
        'fill-extrusion-opacity': 1
      }
    });
    map.on('mouseenter', 'id-congtrinh3d', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'id-congtrinh3d', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('click', 'id-congtrinh3d', (e) => {
      if (!e.features || e.features.length == 0) return;
      let content = '';
      const properties = e.features[0].properties;
      for (const key in properties) {
        content += `<p>${key}: ${properties[key]}</p>`
      }

      // content += `<a href="/detail?id=${properties.congtrinh_id}">Xem chi tiết</a>`

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(content)
        .addTo(map);
    });
  });
})
</script>

<template>
  <div id="map"></div>
  <div id="floorControl" class="btn-group-vertical btn-group-xs" role="group"></div>
</template>

<style scoped>
#floorControl {
  position: absolute;
  top: 30%;
  left: 0px;
  display: flex;
  flex-direction: column;
}



:global(.active) {
  background-color: rgb(34, 87, 185);
  color: white;
}
</style>
