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

    const { data, loading, error } = useQuery(GET_OBJECT_WITH_CONTEXT, {variables: { arachneId: 1189040 }});

    const [activeLocation, setActiveLocation] = useState(null);
    //const [mapData, setMapData] = useState({entity: { name: "hallo"}});

    //console.log(data?.entity?.spatial?.coordinates?.split(", "))

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
                {data&&data.entity&&<Marker
                    key={data.entity.name}
                    //position={data?.entity?.spatial?.coordinates?.split(", ")}
                    position={data.entity.spatial.coordinates.split(", ")}
                    onClick={() =>
                        alert(data.entity.name)
                    }
                />
                }
                {data&&data.entity
                    &&data.entity.related
                    &&data.entity.related.map( relatedObj =>
                    {return(relatedObj.spatial
                        &&<Marker
                            key={relatedObj.name}
                            //position={fakeData.coordinates}
                            position={relatedObj.spatial.coordinates.split(", ")}
                            onClick={() => {
                                console.log(relatedObj);
                                setActiveLocation(relatedObj);
                            }}
                        />
                    )}
                 )}
                {activeLocation&&<Popup
                    position={activeLocation.spatial.coordinates.split(", ")}
                    onClose={() => {
                        setActiveLocation(null);
                    }}
                >
                    <div>
                        <h2>{activeLocation.name}</h2>
                        <p>{activeLocation.spatial.name}</p>
                    </div>
                </Popup>}
            </Map>
        </div>
    );
};