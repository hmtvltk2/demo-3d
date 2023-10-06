<script setup lang="ts">
import { onMounted } from "vue";
import { Map, Popup } from "maplibre-gl";
// import StylesControl from '@mapbox-controls/styles';
// import '@mapbox-controls/styles/src/index.css';
// import congtrinh3d from './assets/congtrinh3d-may44.json'
import indoor3D from './assets/indoor-3d-map.json'
import hoasenKhachsan3d from './assets/hoasen_khachsan.json'


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

  // map.addControl(new StylesControl({
  //   styles: [{
  //     label: 'Streets',
  //     styleName: 'Mapbox Streets',
  //     styleUrl: 'mapbox://styles/mapbox/streets-v12',
  //   }, {
  //     label: 'Satellite',
  //     styleName: 'Mapbox Satellite Streets',
  //     styleUrl: 'mapbox://sprites/mapbox/satellite-streets-v12',
  //   }],
  //   compact: true
  // }), 'top-left');

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
    const patternImage = new Image();
    patternImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgAHngARngAAAABJRU5ErkJggg==';
    map.addImage('brick_pattern', patternImage);

    const getColor = (chucnangId: number) => {
      if (chucnangId == 1) return "#eeeeee"
      if (chucnangId == 2) return "#d62728"
      if (chucnangId == 3) return "#fc8d62"
      if (chucnangId == 4) return "#B04E69"
      if (chucnangId == 5) return "#80b192"
      if (chucnangId == 6) return "#8da0cb"
      if (chucnangId == 7) return "#2ca02c"
      return "#cfcfda"
    }
    const features = hoasenKhachsan3d.features.map(feature => {
      const { properties } = feature
      // @ts-ignore
      properties.color = getColor(properties.chucnang_id)
      return { ...feature, properties }
    })
    const newHoasenKhachsan3d = { ...hoasenKhachsan3d, features }
    map.addSource('congtrinh3d', {
      type: 'geojson',
      data: newHoasenKhachsan3d
    });

    map.addLayer({
      'id': 'id-congtrinh3d',
      'type': 'fill-extrusion',
      'source': 'congtrinh3d',
      'paint': {
        // See the MapLibre Style Specification for details on data expressions.
        // https://maplibre.org/maplibre-style-spec/expressions/

        // Get the fill-extrusion-color from the source 'color' property.
        'fill-extrusion-color': ["get", "color"],

        // Get fill-extrusion-height from the source 'height' property.
        'fill-extrusion-height': ['get', 'height'],

        // Get fill-extrusion-base from the source 'base_height' property.
        'fill-extrusion-base': ['get', 'base_heigh'],

        // Make extrusions slightly opaque for see through indoor walls.
        'fill-extrusion-opacity': 1,
        "fill-extrusion-pattern": "brick_pattern"
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
      delete properties.height
      delete properties.base_heigh
      delete properties.Shape_Leng
      delete properties.Shape_Area
      delete properties.color
      delete properties.chucnang_id
      content += `<p class="badge">${properties.Chucnangta}<p>`
      for (const key in properties) {
        content += `<p><b>${key}</b>: ${properties[key]}</p>`
      }

      // content += `<a href="/detail?id=${properties.congtrinh_id}">Xem chi tiết</a>`

      new Popup({ maxWidth: '800px' })
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

:global(.maplibregl-popup-content p) {
  margin-top: 0.2rem !important;
  margin-bottom: 0 !important;
}

:global(.active) {
  background-color: rgb(34, 87, 185);
  color: white;
}
</style>
