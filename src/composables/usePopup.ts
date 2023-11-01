import { Map, Popup } from "maplibre-gl";

export function usePopup(map: Map) {
    function registerPopup(layerId: string, getPopupContent: Function) {
        map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', layerId, (e) => {
            const content = getPopupContent(e)

            new Popup({ maxWidth: '800px' })
                .setLngLat(e.lngLat)
                .setHTML(content)
                .addTo(map);
        });
    }

    return { registerPopup }
}