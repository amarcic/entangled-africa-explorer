import React, { useState, useEffect } from 'react';
import { FormGroup, FormControlLabel, Checkbox, FormLabel, Button } from '@material-ui/core';
//import { Switch } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
//import { Icon } from 'leaflet';

import { useQuery } from "@apollo/react-hooks";
import gql from 'graphql-tag';

const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const mapCenter = [11.5024338, 17.7578122];
const zoomLevel = 4;

/*
const GET_OBJECT_BY_ID = gql`
    query giveInfo($arachneId: ID!) {
        entity(id: $arachneId) {
            identifier
            name
            spatial {
                identifier
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
*/

const GET_CONTEXT_BY_ID = gql`
    query giveInf($arachneId: ID!) {
        entity(id: $arachneId) {
            identifier
            name
            spatial {
                identifier
                name
                coordinates
            }
            temporalArachne {
                title
                begin
                end
            }
            related(types: [Einzelobjekte]) {
                identifier
                name
                type
                spatial {
                    identifier
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
                identifier
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
    const [input, setInput] = useState({
        objectId: 0,
        searchStr: "Gemme",
        projectList: [{"projectLabel": "African Archaeology Archive Cologne", "projectBestandsname": "AAArC"},
            {"projectLabel": "Syrian Heritage Archive Project", "projectBestandsname": "Syrian-Heritage-Archive-Project"},
            {"projectLabel": "Friedrich Rakob’s Bequest", "projectBestandsname": "dai-rom-nara"}],
        checkedProjects: [],
        showSearchResults: true,
        showRelatedObjects: false,
        timeBegin: "",
        timeEnd: "",
        chronOntologyId: "",
        boundingBoxCorner1: "",
        boundingBoxCorner2: ""
    });
    //const [mapData, setMapData] = useState({});
    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjectsByString, setMapDataObjectsByString] = useState({});

    //const { data, loading, error } = useQuery(GET_OBJECT_BY_ID, {variables: { arachneId: input.objectId }});
    //console.log("is data defined?", data);
    const { data: dataContext, loading: loadingContext, error: errorContext } = useQuery(GET_CONTEXT_BY_ID, {variables: { arachneId: input.objectId }});
    const { data: dataObjectsByString, loading: loadingObjectsByString, error: errorObjectsByString } =
        useQuery(GET_OBJECTS_BY_STRING, {variables: {searchTerm: input.searchStr, project: input.checkedProjects}});
    //console.log("is dataContext defined? why not? >:(", dataContext);
    //console.log(data)


    const handleInputChange = (event) => {
        setInput({
            ...input,
            [event.currentTarget.name]: event.currentTarget.value
        });
        console.log("handleInputChange!");
    };

    /*const handleSwitchChange = (event) => {
        setInput({
            ...input,
            [event.target.name]: event.target.checked
        });
        console.log("handleSwitchChange!");
    };*/

    const handleRelatedObjects = (id) => {
        console.log(id);
        setInput({
            ...input,
            objectId: id ? Number(id) : input.objectId,
            showSearchResults: !input.showSearchResults,
            showRelatedObjects: !input.showRelatedObjects
        });
        // first failed attempt to close popup on click on handle related objects button
        // if (activeLocation) {setActiveLocation(null)}
        console.log("handleRelatedObjects!");
    };

    const handleCheck = (project) => {
        setInput({
            ...input,
            checkedProjects: input.checkedProjects.includes(project.projectBestandsname)
                ? input.checkedProjects.filter(checked => checked !== project.projectBestandsname)
                : [...input.checkedProjects, project.projectBestandsname]
        });
        console.log("handleCheck!");
    };

    const createBoundingBox = (event) => {
        setInput({
            ...input,
            boundingBoxCorner2: input.boundingBoxCorner1 == "" ? input.boundingBoxCorner2 : event.latlng.lat + ',' + event.latlng.lng,
            boundingBoxCorner1: input.boundingBoxCorner1 == "" ? event.latlng.lat + ',' + event.latlng.lng : input.boundingBoxCorner1
        })
    }

    /*
    useEffect( () => {
        //check if amount of re-renders is reasonable from time to time
        if(data) {
            setMapData(data);
            console.log("rerender data!");
            console.log("rerender data --> data: ", data);
            console.log("rerender data --> input:", input);
        }
    }, [data]);
    */

    useEffect( () => {
        if(dataContext&&input.showRelatedObjects) {
            setMapDataContext(dataContext);
            //why set mapdata?
            //setMapData(data);
            //console.log(mapData);
            console.log("rerender dataContext!");
            console.log("rerender dataContext --> dataContext: ", dataContext);
            console.log("rerender dataContext --> input:", input);
        }
    }, [dataContext, input.showRelatedObjects]);

    useEffect( () => {
        if (dataObjectsByString && input.searchStr && input.checkedProjects && input.showSearchResults) {
            setMapDataObjectsByString(dataObjectsByString);
            console.log("rerender dataObjectsByString!");
            console.log("rerender dataObjectsByString --> dataObjectsByString: ", dataObjectsByString);
            console.log("rerender dataObjectsByString --> input:", input);
        }
    }, [dataObjectsByString, input.searchStr, input.checkedProjects, input.showSearchResults]);


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
                <FormControlLabel
                    control={
                        <input
                            type="text"
                            name="searchStr"
                            defaultValue={input.searchStr}
                            onChange={handleInputChange}
                            //onChange={(event) => {setObjectId(event.target.value)}}
                        />
                    }
                    label="Search term"
                    labelPlacement="start"
                    />
                <FormGroup>
                    <FormLabel component="legend">Filter by projects</FormLabel>
                    {input.projectList && input.projectList.map(project => {
                        return (project
                            && <FormControlLabel
                                key={project.projectBestandsname}
                                control={
                                    <Checkbox
                                        checked={input.checkedProjects.includes(project.projectBestandsname)}
                                        onChange={() => handleCheck(project)}
                                        name={project.projectBestandsname}
                                        key={project.projectBestandsname}
                                    />
                                }
                                label={project.projectLabel}
                            />
                        )
                    })}
                </FormGroup>
                <FormGroup>
                    <FormLabel component="legend">Filter by time</FormLabel>
                    <FormControlLabel
                        control={
                            <input
                                type="text"
                                name="timeBegin"
                                //defaultValue={input.timeBegin}
                                onChange={handleInputChange}
                            />
                        }
                        label="Begin"
                        labelPlacement="start"
                    />
                    <FormControlLabel
                        control={
                            <input
                                type="text"
                                name="timeEnd"
                                //defaultValue={input.timeEnd}
                                onChange={handleInputChange}
                            />
                        }
                        label="End"
                        labelPlacement="start"
                    />
                    <FormControlLabel
                        control={
                            <input
                                type="text"
                                name="chronOntologyId"
                                //defaultValue={input.chronOntologyId}
                                onChange={handleInputChange}
                            />
                        }
                        label="ChronOntology ID"
                        labelPlacement="start"
                    />
                </FormGroup>
                <FormGroup>
                    <FormLabel component="legend">Filter by coordinates</FormLabel>
                    <input
                        type="text"
                        name="boundingBoxCorner1"
                        //defaultValue={input.boundingBoxCorner1}
                        value={input.boundingBoxCorner1}
                        placeholder="Enter comma-separated coordinates or click on map to set first corner of bounding box"
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="boundingBoxCorner2"
                        //defaultValue={input.boundingBoxCorner2}
                        value={input.boundingBoxCorner2}
                        placeholder="Enter comma-separated coordinates or click on map to set second corner of bounding box"
                        onChange={handleInputChange}
                    />
                </FormGroup>
                {/*<FormGroup>
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
                </FormGroup>*/}
                {console.log("mapDataContext: ", mapDataContext)}
                {input.showRelatedObjects&&mapDataContext&&mapDataContext.entity&&<p>{mapDataContext.entity.name}</p>}

                {input.showSearchResults && <span>Showing search results</span>}
                {input.showRelatedObjects && <span>Showing related objects</span>}
                {/*loading && <span>...loading</span>*/}
                {/*error && <span>...error</span> && console.log(error)*/}
                {loadingContext && <span>...loadingContext</span>}
                {errorContext && <span>...errorContext: {errorContext.message}</span> && console.log(errorContext.message)}
                {loadingObjectsByString && <span>...loadingObjectsByString</span>}
                {errorObjectsByString && <span>...errorObjectsByString</span> && console.log(errorObjectsByString.message)}
                {input.showRelatedObjects && <Button
                    onClick={() => handleRelatedObjects()}
                    name="hideRelatedObjects"
                    variant="contained"
                    color="primary">
                    Return to search results (hide related objects)
                </Button>}
            </div>
            {/*mapData? mapData.entity?.name :  <p>no data found</p>*/}
            <Map
                center={mapCenter}
                zoom={zoomLevel}
                onClick={createBoundingBox}
            >
                <TileLayer
                    attribution={osmAttr}
                    url={osmTiles}
                />
                {input.showRelatedObjects&&input.objectId&&mapDataContext&&mapDataContext.entity
                &&mapDataContext.entity.spatial.map( (place, indexPlace) =>
                {return(place
                    &&<Marker
                        key={`${place.identifier}-${indexPlace}`}
                        //position={fakeData.coordinates}
                        //coordinates need to be reversed because of different standards between geojson and leaflet
                        position={place.coordinates.split(", ").reverse()}
                        opacity={1}
                        onClick={() => {
                            setActiveLocation({...mapDataContext.entity, spatial: place});
                        }}
                    />
                )})
                }
                {input.showRelatedObjects&&input.objectId&&mapDataContext&&mapDataContext.entity&&mapDataContext.entity.related
                &&mapDataContext.entity.related.map( (relatedObj, indexRelatedObj) =>
                {
                    if(relatedObj===null) return;
                    return(relatedObj.spatial
                    &&relatedObj.spatial.map( (place, indexPlace) =>
                    {return(place
                        &&<Marker
                            key={`${place.identifier}-${indexPlace}-${indexRelatedObj}`}
                            //position={fakeData.coordinates}
                            //coordinates need to be reversed because of different standards between geojson and leaflet
                            position={place.coordinates.split(", ").reverse()}
                            opacity={0.5}
                            onClick={() => {
                                setActiveLocation({...relatedObj, spatial: place});
                            }}
                        />
                    )})
                )
                })}
                {/*activeLocation&&<Popup
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
                </Popup>*/}
                {input.showSearchResults&&input.searchStr&&input.projectList&&mapDataObjectsByString
                &&mapDataObjectsByString.entitiesByString&&mapDataObjectsByString.entitiesByString.map( (entity, indexEntity) =>
                {return(entity.spatial
                    && entity.spatial.map( (place, indexPlace) =>
                        { return( place
                            && <Marker
                                key={`${place.identifier}-${indexPlace}-${indexEntity}`}
                                //position={fakeData.coordinates}
                                //coordinates need to be reversed because of different standards between geojson and leaflet
                                position={place.coordinates.split(", ").reverse()}
                                onClick={() => {
                                    setActiveLocation({...entity, spatial: place});
                                }}
                            />
                        )}
                    )
                )})}
                {activeLocation&&<Popup
                    position={activeLocation.spatial.coordinates.split(", ").reverse()}
                    onClose={() => {
                        setActiveLocation(null);
                    }}
                >
                    <div>
                        <h2>{activeLocation.name}</h2>
                        <p>{activeLocation.spatial.name}</p>
                        {input.showRelatedObjects&&mapDataContext&&mapDataContext.entity
                        &&<ul>{
                            (mapDataContext.entity.related
                                &&mapDataContext.entity.related.map( relatedObj =>
                                    <li>{relatedObj
                                        ? `${relatedObj.name} (${relatedObj.type})`
                                        : "no access"
                                    }</li>
                                ))
                        }
                        </ul>}
                        <Button
                            onClick={() => handleRelatedObjects(activeLocation.identifier)}
                            name="showRelatedObjects"
                            variant="contained"
                            color="primary"
                            disabled={input.showRelatedObjects}
                        >
                            Show related objects
                        </Button>
                    </div>
                </Popup>}
            </Map>
        </div>
    );
};