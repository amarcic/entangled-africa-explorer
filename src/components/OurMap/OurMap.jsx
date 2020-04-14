import React, { useState, useEffect } from 'react';
import { FormGroup, FormControlLabel, Switch, Checkbox } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';

import { useQuery } from "@apollo/react-hooks";
import gql from 'graphql-tag';

const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const mapCenter = [11.5024338, 17.7578122];
const zoomLevel = 4;

const GET_OBJECT_BY_ID = gql`
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
                end
            }
        }
    }
`;

const GET_CONTEXT_BY_ID = gql`
    query giveInf($arachneId: ID!) {
        entity(id: $arachneId) {
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

const GET_OBJECTS_BY_STRING = gql`
    query searchByString ($searchTerm: String, $project: [String]) {
        entitiesByString(searchString: $searchTerm, filters:$project) {
            identifier
            name
            spatial {
                name
                coordinates
            }
        }
    }
`

export const OurMap = () => {
    const {t, i18n} = useTranslation();

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
    };

    //state
    const [activeLocation, setActiveLocation] = useState(null);
    //if you want to use or change the Id of the displayed object use the state constants below
    //const [objectId, setObjectId] = useState(1189040);
    const [input, setInput] = useState({
        objectId: 1189999,
        searchStr: "Stein",
        projectList: ["Syrian-Heritage-Archive-Project", "AAArC"],
        checkedProjects: [],
        showRelatedObjects: true
    });
    const [mapData, setMapData] = useState({});
    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjectsByString, setMapDataObjectsByString] = useState({});

    const { data, loading, error } = useQuery(GET_OBJECT_BY_ID, {variables: { arachneId: input.objectId }});
    //console.log("is data defined?", data);
    const { data: dataContext, loading: loadingContext, error: errorContext } = useQuery(GET_CONTEXT_BY_ID, {variables: { arachneId: input.objectId }});
    const { data: dataObjectsByString, loading: loadingObjectsByString, error: errorObjectsByString } =
        useQuery(GET_OBJECTS_BY_STRING, {variables: {searchTerm: input.searchStr, project: input.checkedProjects}});
    //console.log("is dataContext defined? why not? >:(", dataContext);
    //console.log(data)
    //for testing
    //const fakeData = { key: "234", coordinates: [11.5024338, 17.7578122] }
    //console.log(data?.entity?.spatial?.coordinates?.split(", "))

    const handleInputChange = (event) => {
        setInput({
            ...input,
            [event.currentTarget.name]: event.currentTarget.value
        });
        console.log("handleInputChange!");
    };

    const handleSwitchChange = (event) => {
        setInput({
            ...input,
            [event.target.name]: event.target.checked
        });
        console.log("handleSwitchChange!");
    };

    const handleCheck = (event, x) => {
        setInput({
            ...input,
            checkedProjects: input.checkedProjects.includes(x) ? input.checkedProjects.filter(c => c !== x) : [...input.checkedProjects, x]
        });
        console.log("handleCheck!");
    };

    useEffect( () => {
        //check if amount of re-renders is reasonable from time to time
        console.log("rerender data!");
        //console.log("rerender data --> data: ", data);
        //console.log("rerender data --> input:", input);
        if(data) {
            setMapData(data);
        }
    }, [data]);

    useEffect( () => {
        console.log("rerender dataContext!");
        //console.log("rerender dataContext --> dataContext: ", dataContext);
        //console.log("rerender dataContext --> input:", input);
        if(dataContext&&input.showRelatedObjects) {
            setMapDataContext(dataContext);
        }
    }, [dataContext, input.showRelatedObjects]);

    useEffect( () => {
        console.log("rerender dataObjectsByString!");
        console.log("rerender dataObjectsByString --> dataObjectsByString: ", dataObjectsByString);
        console.log("rerender dataObjectsByString --> input:", input);
        if (dataObjectsByString && input.searchStr && input.checkedProjects) {
            setMapDataObjectsByString(dataObjectsByString);
        }
    }, [dataObjectsByString, input.searchStr, input.checkedProjects]);


    return(
        <div>
            <h2>{t('Map')}</h2>
            <div>
                {/*<input
                    type="text"
                    name="objectId"
                    defaultValue={input.objectId}
                    onChange={handleInputChange}
                    //onChange={(event) => {setObjectId(event.target.value)}}
                />*/}
                <input
                    type="text"
                    name="searchStr"
                    defaultValue={input.searchStr}
                    onChange={handleInputChange}
                    //onChange={(event) => {setObjectId(event.target.value)}}
                />
                {/*<input
                    type="text"
                    name="projectList"
                    defaultValue={input.projectList}
                    onChange={handleInputChange}
                    //onChange={(event) => {setObjectId(event.target.value)}}
                />*/}
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                defaultChecked={false}
                            />
                        }
                        label="All projects"
                    />
                    {input.projectList && input.projectList.map(project => {
                        return (project
                            && <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={input.checkedProjects.includes(project)}
                                        onChange={event => handleCheck(event, project)}
                                        name={project}
                                        key={project}
                                    />
                                }
                                label={project}
                            />
                        )
                    })}
                </FormGroup>
                {loading && <span>...loading</span>}
                {error && <span>...error</span>}
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={input.showRelatedObjects}
                                onChange={handleSwitchChange}
                                name="showRelatedObjects"
                                color="primary"
                            />
                        }
                        label="Show/hide related objects"
                    />
                </FormGroup>
                {loadingContext && <span>...loading</span>}
                {errorContext && <span>...error</span>}
            </div>
            {/*mapData? mapData.entity?.name :  <p>no data found</p>*/}
            <Map
                center={mapCenter}
                zoom={zoomLevel}
            >
                <TileLayer
                    attribution={osmAttr}
                    url={osmTiles}
                />
                {/*{mapData&&mapData.entity&&mapData.entity.spatial&&<Marker
                    key={mapData.entity.identifier}
                    //position={data?.entity?.spatial?.coordinates?.split(", ")}
                    //coordinates need to be reversed because of different standards between geojson and leaflet
                    position={mapData.entity.spatial.coordinates.split(", ").reverse()}
                    onClick={() =>{
                        setActiveLocation(mapData.entity);
                    }}
                />
                }
                {input.showRelatedObjects&&mapDataContext&&mapDataContext.entity&&mapDataContext.entity.related&&mapDataContext.entity.related.map( relatedObj =>
                    {return(relatedObj.spatial
                        &&<Marker
                            key={relatedObj.identifier}
                            //position={fakeData.coordinates}
                            //coordinates need to be reversed because of different standards between geojson and leaflet
                            position={relatedObj.spatial.coordinates.split(", ").reverse()}
                            opacity={0.5}
                            onClick={() => {
                                setActiveLocation(relatedObj);
                            }}
                        />
                    )}
                )}
                {activeLocation&&<Popup
                    position={activeLocation.spatial.coordinates.split(", ").reverse()}
                    onClose={() => {
                        setActiveLocation(null);
                    }}
                >
                    <div>
                        <h2>{activeLocation.name}</h2>
                        <p>{activeLocation.spatial.name}</p>
                        {activeLocation.temporalArachne&&<p>{activeLocation.temporalArachne.title}</p>}
                    </div>
                </Popup>}*/}
                {mapDataObjectsByString&&input.searchStr&&input.projectList
                &&mapDataObjectsByString.entitiesByString&&mapDataObjectsByString.entitiesByString.map( entities =>
                    {return(entities.spatial
                        &&<Marker
                            key={entities.identifier}
                            //position={fakeData.coordinates}
                            //coordinates need to be reversed because of different standards between geojson and leaflet
                            position={entities.spatial.coordinates.split(", ").reverse()}
                            onClick={() => {
                                setActiveLocation(entities);
                            }}
                        />
                    )}
                )}
                {activeLocation&&<Popup
                    position={activeLocation.spatial.coordinates.split(", ").reverse()}
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