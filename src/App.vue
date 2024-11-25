<script setup lang="ts">
import { onMounted } from "vue";
import { Map, MapGeoJSONFeature, MapMouseEvent, NavigationControl } from "maplibre-gl";
import BasemapsControl from 'maplibre-gl-basemaps';
import 'maplibre-gl-basemaps/lib/basemaps.css';
// import StylesControl from '@mapbox-controls/styles';
// import '@mapbox-controls/styles/src/index.css';
// import congtrinh3d from './assets/congtrinh3d-may44.json'
import hoasenKhachsan3d from './assets/Floor45.json'
import { usePopup } from './composables/usePopup'
import { useLogin } from "./composables/useLogin";
// import { select } from "d3";
const { login } = useLogin()

onMounted(() => {
  const map = new Map({
    container: 'map',
    style: {
      'version': 8,
      'name': 'Raster tiles',
      'center': [0, 0],
      'zoom': 0,
      'sources': {
        // 'raster-tiles': {
        //   'type': 'raster',
        //   'tiles': ['https://thuduc-maps.hcmgis.vn/thuducserver/gwc/service/wmts?layer=thuduc:thuduc_maps&style=&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}'],
        //   'tileSize': 256,
        // }
      },
      'layers': [
        // {
        //   'id': 'background',
        //   'type': 'background',
        //   'paint': {
        //     'background-color': '#e0dfdf'
        //   }
        // },
        // {
        //   'id': 'simple-tiles',
        //   'type': 'raster',
        //   'source': 'raster-tiles'
        // }
      ],
      "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    },
    center: [106.692544335513603, 10.770398465053876],
    zoom: 15,
    minZoom: 8,
    pitch: 40,
    bearing: 20,
    antialias: true
  });

  map.addControl(new NavigationControl(), 'bottom-right');
  map.addControl(new BasemapsControl({
    initialBasemap: 'hcmgis',
    basemaps: [
      {
        id: 'hcmgis',
        tiles: ['https://thuduc-maps.hcmgis.vn/thuducserver/gwc/service/wmts?layer=thuduc:thuduc_maps&style=&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}'],
        sourceExtraParams: { attribution: '<a href="https://hcmgis.vn/">&copy; HCMGIS</a>' }
      },

    ]
  }), 'bottom-left');

  const { registerPopup } = usePopup(map)

  map.on('load', () => {




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



    const getColor = (chucnangId: number) => {
      if (chucnangId == null) return "#cfcfda"
      if (chucnangId % 10 == 1) return "#03A9F4"
      if (chucnangId % 10 == 2) return "#d62728"
      if (chucnangId % 10 == 3) return "#fc8d62"
      if (chucnangId % 10 == 4) return "#B04E69"
      if (chucnangId % 10 == 5) return "#80b192"
      if (chucnangId % 10 == 6) return "#8da0cb"
      if (chucnangId % 10 == 7) return "#2ca02c"
      if (chucnangId % 10 == 8) return "#3F51B5"
      if (chucnangId % 10 == 9) return "#9C27B0"
      if (chucnangId % 10 == 0) return "#009688"
      return "#cfcfda"
    }
    const features = hoasenKhachsan3d.features.map(feature => {
      const { properties } = feature
      // @ts-ignore
      properties.color = getColor(properties.Chucnangid)
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
        'fill-extrusion-color': ["get", "color"],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'base_heigh'],
        'fill-extrusion-opacity': 1,
      }
    });

    const getCongtrinhPopupContent = (e: MapMouseEvent & {
      features?: MapGeoJSONFeature[] | undefined;
    } & Object) => {
      if (!e.features || e.features.length == 0) return;
      let content = '';
      const properties = e.features[0].properties;
      const titles = {
        ID: 'Mã ID',
        Mahs: 'Mã hồ sơ',
        GPXD: 'Giấy phép xây dựng',
        Soto: 'Số tờ',
        Sothua: 'Số thửa',
        Sonha: 'Số nhà',
        Tenduong: 'Tên đường',
        Phuongxa: 'Phường xã',
        Quanhuyen: 'Quận huyện',
        Tenduan: 'Tên dự án',
        Loaicongt: 'Loại công trình',
        ChieucaoCT: 'Chiều cao công trình',
        Chudautu: 'Chủ đầu tư',
        Dtdatxd: 'Diện tích đất xây dựng',
        Dtdatcayxa: 'Diện tích đất cây xanh',
        DtsanxdCT: 'Diện tích sàn xây dựng công trình',
        LoaiDuLieu: 'Loại dữ liệu',
        LoaiTaiLie: 'Loại tài liệu',
        SapXep: 'Sắp xếp',
        Tongsotang: 'Tổng số tầng',
        Tentang: 'Tên từng tầng',
        Chucnangta: 'Chức năng của tầng',
        Dtsanxdtan: 'Diện tích sàn xây dựng từng tầng',
        Chieucaota: 'Chiều cao từng tầng',

      }

      content += `<p class="badge">${properties.Chucnangta ?? 'Chưa có dữ liệu chức năng tầng'}<p>`
      for (const [key, title] of Object.entries(titles)) {
        content += `<p><b>${title}</b>: ${properties[key]}</p>`
      }

      return content;
    }

    registerPopup('id-congtrinh3d', getCongtrinhPopupContent)

  });
})
</script>

<template>
  <div id="map"></div>
  <div id="floorControl" class="btn-group-vertical btn-group-xs" role="group"></div>
  <div id="login">
    <button type="button" class="btn btn-primary" @click="login">Login SSO</button>
  </div>
</template>

<style scoped lang="scss">
#floorControl {
  position: absolute;
  top: 30%;
  left: 0px;
  display: flex;
  flex-direction: column;
}

#login {
  position: absolute;
  top: 10px;
  right: 0px;
  display: flex;
  flex-direction: column;
}

:global(.maplibregl-popup-content p) {
  margin-top: 0.1rem !important;
  margin-bottom: 0 !important;
}

:global(.maplibregl-popup-content) {
  max-height: 400px;
  overflow-y: auto;
}


:global(.active) {
  background-color: rgb(34, 87, 185);
  color: white;
}
</style>
