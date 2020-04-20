import React, { useState, useEffect } from 'react';
import { FormGroup, FormControlLabel, Switch, Checkbox, FormLabel, Button } from '@material-ui/core';
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

const GET_CONTEXT_BY_ID = gql`
    query giveInf($arachneId: ID!) {
        entity(id: $arachneId) {
            related {
                identifier
                name
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
    //if you want to use or change the Id of the displayed object use the state constants below
    //const [objectId, setObjectId] = useState(1189040);
    const [input, setInput] = useState({
        objectId: 1189999,
        searchStr: "Wand",
        //projectList: ["Syrian-Heritage-Archive-Project", "AAArC", "dai-rom-nara"],
        projectList: [{"projectLabel": "African Archaeology Archive Cologne", "projectBestandsname": "AAArC"},
            {"projectLabel": "Syrian Heritage Archive Project", "projectBestandsname": "Syrian-Heritage-Archive-Project"},
            {"projectLabel": "Friedrich Rakob’s Bequest", "projectBestandsname": "dai-rom-nara"}],
        checkedProjects: ["Syrian-Heritage-Archive-Project"],
        showSearchResults: true,
        showRelatedObjects: false
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
            objectId: id,
            showSearchResults: false,
            showRelatedObjects: true
        });
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
            setMapDataObjectsByString(null); //is this okay?
        }
    }, [dataContext, input.showRelatedObjects]);

    useEffect( () => {
        console.log("rerender dataObjectsByString!");
        console.log("rerender dataObjectsByString --> dataObjectsByString: ", dataObjectsByString);
        console.log("rerender dataObjectsByString --> input:", input);
        if (dataObjectsByString && input.searchStr && input.checkedProjects && input.showSearchResults) {
            setMapDataObjectsByString(dataObjectsByString);
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
                {/*<input
                    type="text"
                    name="projectList"
                    defaultValue={input.projectList}
                    onChange={handleInputChange}
                    //onChange={(event) => {setObjectId(event.target.value)}}
                />*/}
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
                {input.showSearchResults && <span>Showing search results</span>}
                {input.showRelatedObjects && <span>Showing related objects</span>}
                {loading && <span>...loading</span>}
                {error && <span>...error</span> && console.log(error)}
                {loadingContext && <span>...loadingContext</span>}
                {errorContext && <span>...errorContext</span> && console.log(errorContext)}
                {loadingObjectsByString && <span>...loadingObjectsByString</span>}
                {errorObjectsByString && <span>...errorObjectsByString</span> && console.log(errorObjectsByString)}
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
                {/*mapData&&mapData.entity&&mapData.entity.spatial&&<Marker
                    key={mapData.entity.identifier}
                    //position={data?.entity?.spatial?.coordinates?.split(", ")}
                    //coordinates need to be reversed because of different standards between geojson and leaflet
                    position={mapData.entity.spatial.coordinates.split(", ").reverse()}
                    onClick={() =>{
                        setActiveLocation(mapData.entity);
                    }}
                />*/}
                {input.showRelatedObjects&&input.objectId&&mapDataContext&&mapDataContext.entity&&mapDataContext.entity.related
                &&mapDataContext.entity.related.map( (relatedObj, indexRelatedObj) =>
                {return(relatedObj.spatial
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
                )})}
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
                {mapDataObjectsByString&&input.searchStr&&input.projectList
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
                        <Button
                            onClick={() => handleRelatedObjects(activeLocation.identifier)}
                            name="showRelatedObjects"
                            variant="contained"
                            color="primary">
                            Show related objects
                        </Button>
                    </div>
                </Popup>}
            </Map>
        </div>
    );
};