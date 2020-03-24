import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';

import { useQuery } from "@apollo/react-hooks";
import gql from 'graphql-tag';

const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const mapCenter = [11.5024338, 17.7578122];
const zoomLevel = 4;

const GET_OBJECT_WITH_CONTEXT = gql`
    query giveInfo($arachneId: ID!) {
        entity(id: $arachneId) {
            name
            spatial {
                coordinates
            }
            temporalArachne {
                begin
            }
            related {
                identifier
                name
                spatial {
                    name
                    coordinates
                }
            }
        }
    }
`;

export const OurMap = () => {
    const {t, i18n} = useTranslation();

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
    };

    const { data, loading, error } = useQuery(GET_OBJECT_WITH_CONTEXT, {variables: { arachneId: 1189042 }});

    const [activeLocation, setActiveLocation] = useState(null);
    //const [mapData, setMapData] = useState({entity: { name: "hallo"}});

    console.log(data?.entity?.spatial?.coordinates?.split(", "))

    /*
    useEffect( () => {
        setMapData(data);
    })
    */

    const fakeData = { key: "234", coordinates: [11.5024338, 17.7578122] }

    return(
        <div>
            <h2>{t('Map')}</h2>
            {data? data.entity?.name :  <p>no data found</p>}
            <Map
                center={mapCenter}
                zoom={zoomLevel}
            >
                <TileLayer
                    attribution={osmAttr}
                    url={osmTiles}
                />
                {/*data.entity.related.map(related =>
                    <Marker
                        key={related.identifier}
                        position={related.spatial.coordinates.split(",")}
                    />)*/}
                {<Marker
                    key={data?.entity?.name}
                    //position={data?.entity?.spatial?.coordinates?.split(", ")}
                    position={fakeData.coordinates}
                    onClick={() =>
                        alert(data?.entity?.name)
                    }
                    //key={mapData.entity.name}
                    //position={data.entity.spatial.coordinates.split(",")}
                />}
            </Map>
        </div>
    );
};