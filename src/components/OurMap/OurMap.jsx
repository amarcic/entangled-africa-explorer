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
            identifier
            name
            spatial {
                name
                coordinates
            }
            temporalArachne {
                title
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

    //state
    const [activeLocation, setActiveLocation] = useState(null);
    //if you want to use or change the Id of the displayed object use the state constants below
    const [objectId, setObjectId] = useState(1189040);
    const [input, setInput] = useState({objectId: 1189040});
    const [mapData, setMapData] = useState({});

    const { data, loading, error } = useQuery(GET_OBJECT_WITH_CONTEXT, {variables: { arachneId: input.objectId }});
    //console.log(data)
    //for testing
    //const fakeData = { key: "234", coordinates: [11.5024338, 17.7578122] }
    //console.log(data?.entity?.spatial?.coordinates?.split(", "))

    const handleInputChange = (event) => setInput({
        ...input,
        [event.currentTarget.name]: event.currentTarget.value
    })

    useEffect( () => {
        //check if amount of re-renders is reasonable from time to time
        //console.log("rerender!");
        setMapData(data);
    })

    return(
        <div>
            <h2>{t('Map')}</h2>
            <div>
                <input
                    type="text"
                    name="objectId"
                    defaultValue={input.objectId}
                    onChange={handleInputChange}
                    //onChange={(event) => {setObjectId(event.target.value)}}
                />
            </div>
            {mapData? mapData.entity?.name :  <p>no data found</p>}
            <Map
                center={mapCenter}
                zoom={zoomLevel}
            >
                <TileLayer
                    attribution={osmAttr}
                    url={osmTiles}
                />
                {mapData&&mapData.entity&&mapData.entity.spatial&&<Marker
                    key={mapData.entity.identifier}
                    //position={data?.entity?.spatial?.coordinates?.split(", ")}
                    position={mapData.entity.spatial.coordinates.split(", ")}
                    onClick={() =>{
                        setActiveLocation(mapData.entity);
                    }}
                />
                }
                {mapData&&mapData.entity
                    &&mapData.entity.related
                    &&mapData.entity.related.map( relatedObj =>
                    {return(relatedObj.spatial
                        &&<Marker
                            key={relatedObj.identifier}
                            //position={fakeData.coordinates}
                            position={relatedObj.spatial.coordinates.split(", ")}
                            opacity={0.5}
                            onClick={() => {
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
                        {activeLocation.temporalArachne&&<p>{activeLocation.temporalArachne.title}</p>}
                    </div>
                </Popup>}
            </Map>
        </div>
    );
};