import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMemo } from 'react';
import './WorldMap.css';

const WorldMap = ({ visitedCodes = [], onCountryClick }) => {
    
    const countriesLayer = useMemo(() => ({
        id: 'countries-fill',
        type: 'fill',
        paint: {
            'fill-color': [
                'case',
                ['in', ['get', 'iso_a3'], ['literal', visitedCodes]], 
                '#4F7942',        
                'transparent'      
            ],
            'fill-opacity': 0.6,
            'fill-outline-color': '#333'
        }
    }), [visitedCodes]);

    return (
        <div className="map-container">
            <Map
                initialViewState={{
                    longitude: 10,
                    latitude: 50,
                    zoom: 1.5
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                interactiveLayerIds={['countries-fill']}
                onClick={(e) => {
                    if (e.features && e.features.length > 0) {
                        const feature = e.features[0];
                        const countryCode = feature.properties.iso_a3;
                        if (countryCode && onCountryClick) {
                            onCountryClick(countryCode);
                        }
                    }
                }}
            >
                <Source 
                    id="world-data" 
                    type="geojson" 
                    data="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson"
                >
                    <Layer {...countriesLayer} />
                </Source>
            </Map>
            <div className="map-hint">
                👇 Click to mark visited
            </div>
        </div>
    );
};

export default WorldMap;