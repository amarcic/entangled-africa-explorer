import React from 'react';
import {
    Checkbox, FormControlLabel, FormGroup, FormLabel, Grid, IconButton, Radio, RadioGroup, Switch, TextField, Tooltip
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ClearIcon from "@material-ui/icons/Clear";
import { useStyles } from '../../styles';
import { useTranslation } from "react-i18next";


export const Filters = (props) => {
    const [input, dispatch] = props.reducer;
    const { chronOntologyTerms, regions, arachneTypes } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const updateBBoxValue = (event) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: "bbox"}});
        // only create bbox if entered values have valid format (floats with at least one decimal place)
        if(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(event.currentTarget.value)) {
            dispatch({type: "MANUAL_BBOX", payload: {field: event.currentTarget.name, valueString: event.currentTarget.value}})
        }
        else {
            dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})
        }
    }


    return (
        <>
            {<Grid /*className={classes.dashboardTileContent}*/ item container direction="column" spacing={2}>
                <Grid item container direction="row" spacing={2}>
                    {/*radio buttons for selecting mode*/
                        <Grid item>
                            <FormGroup>
                                <FormLabel component="legend">Search mode</FormLabel>
                                <RadioGroup
                                    name="mapMode"
                                    value={input.mode}
                                    onChange={(event, newValue) => {
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: newValue}})
                                        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showArchaeoSites"}})
                                        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showSearchResults"}})
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "selectedMarker", value: undefined}}) // Is this a good place to clear selectedMarker?
                                    }}
                                >
                                    <FormControlLabel value="archaeoSites" control={<Radio />} label="Archaeological Sites"/>
                                    <FormControlLabel value="objects" control={<Radio />} label="Objects"/>
                                </RadioGroup>
                            </FormGroup>
                        </Grid>}

                    {/*checkboxes for filter by entity type; only active in object search mode*/
                        !input.showArchaeoSites && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend" disabled={input.showArchaeoSites}>Filter by Arachne entity type</FormLabel>
                                {arachneTypes && arachneTypes.map(type => {
                                    return (type.id
                                        && <FormControlLabel
                                            key={type.id}
                                            control={
                                                <Checkbox
                                                    checked={input.arachneTypesCheckedIds.includes(type.id)}
                                                    onChange={() => {
                                                        dispatch({
                                                            type: input.arachneTypesCheckedIds.includes(type.id)
                                                                ? "UNCHECK_ITEM"
                                                                : "CHECK_ITEM",
                                                            payload: {field: "arachneTypesCheckedIds", toggledItem: type.id}
                                                        });
                                                        dispatch({
                                                            type: "UPDATE_INPUT",
                                                            payload: {
                                                                field: "arachneTypesCheckedLabels",
                                                                value: input.arachneTypesCheckedLabels.includes(type.label)
                                                                    ? [...input.arachneTypesCheckedLabels.filter(label => label !== type.label)]
                                                                    : [...input.arachneTypesCheckedLabels, type.label]
                                                            }
                                                        })
                                                    }}
                                                    name={String(type.id)}
                                                    key={type.id}
                                                    disabled={input.showArchaeoSites}
                                                />
                                            }
                                            label={type.label}
                                        />
                                    )
                                })}
                            </FormGroup>
                        </Grid>}

                    {/*input field for string query*/
                        <Grid item>
                            <FormGroup>
                                <FormLabel component="legend">Filter by search term</FormLabel>
                                <TextField
                                    type="text"
                                    variant="outlined"
                                    size="small"
                                    name="searchStr"
                                    value={input.searchStr}
                                    placeholder="*"
                                    onChange={event => dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})}
                                    InputProps={{
                                        endAdornment: (
                                            input.searchStr!==""
                                            &&<IconButton
                                                onClick={() => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "searchStr", value: ""}});
                                                }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )
                                    }}
                                />
                            </FormGroup>
                        </Grid>}

                    {/*dropdown for filter by period; only active in object search mode*/
                        !input.showArchaeoSites && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend" disabled={input.showArchaeoSites}>Filter by time</FormLabel>
                                <Autocomplete
                                    name="chronOntologyTerm"
                                    value={input.chronOntologyTerm}
                                    options={chronOntologyTerms}
                                    onChange={(event, newValue) =>
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "chronOntologyTerm", value: newValue}})
                                    }
                                    renderInput={(params) =>
                                        <TextField {...params} label="iDAI.chronontology term" variant="outlined" />
                                    }
                                    autoSelect={true}
                                    disabled={input.showArchaeoSites}
                                    size="small"
                                />
                            </FormGroup>
                        </Grid>}

                    {/*dropdown for filter by region; only active in site search mode*/
                        input.showArchaeoSites && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend">Filter by region</FormLabel>
                                <Autocomplete
                                    name="regionId"
                                    //value={input.regionTitle}
                                    options={regions}
                                    getOptionLabel={(option) => option.title}
                                    getOptionSelected={(option, value) => {
                                        return (option.id === value.id)
                                    }}
                                    onChange={(event, newValue) => {
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: "region"}});
                                        newValue === null
                                            ? (dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: ""}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "regionId", value: 0}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "regionTitle", value: null}}))
                                            : (dispatch({type: "UPDATE_INPUT", payload: {field: "regionId", value: newValue.id}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "regionTitle", value: newValue.title}}));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Filter by region" variant="outlined" />}
                                    autoSelect={true}
                                    disabled={input.sitesMode==="bbox"}
                                    size="small"
                                />
                            </FormGroup>
                        </Grid>}

                    {/*switch and input fields for filter by coordinates*/
                        <Grid item>
                            <FormGroup>
                                <FormLabel>Filter by coordinates (bounding box)
                                    <Tooltip title="Activate the switch to select a bounding box directly on the map. Click the map in two places to select first the north-east corner, then the south-west corner." arrow placement="right-start">
                                        <Switch
                                            name="drawBBox"
                                            checked={input.drawBBox}
                                            color="primary"
                                            onChange={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "drawBBox"}})}
                                            disabled={input.sitesMode==="region"}
                                        />
                                    </Tooltip>
                                </FormLabel>
                                <TextField
                                    type="text"
                                    variant="outlined"
                                    size="small"
                                    name="boundingBoxCorner1"
                                    value={input.boundingBoxCorner1}
                                    placeholder="North, East decimal degrees"
                                    label="North, East decimal degrees"
                                    /*onChange={(event) => {
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: "bbox"}});
                                        // only create bbox if entered values have valid format (floats with at least one decimal place)
                                        if(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(event.currentTarget.value)) {
                                            dispatch({type: "MANUAL_BBOX", payload: {field: event.currentTarget.name, valueString: event.currentTarget.value}})
                                        }
                                        else {
                                            dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})
                                        }
                                    }}*/
                                    onChange={updateBBoxValue}
                                    InputProps={{
                                        endAdornment: (
                                            input.boundingBoxCorner1.length!==0
                                            &&<IconButton
                                                onClick={() => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: ""}});
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner1", value: []}})}
                                                }
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )
                                    }}
                                    disabled={input.sitesMode==="region"}
                                />
                                <TextField
                                    type="text"
                                    variant="outlined"
                                    size="small"
                                    name="boundingBoxCorner2"
                                    value={input.boundingBoxCorner2}
                                    placeholder="South, West decimal degrees"
                                    label="South, West decimal degrees"
                                    /*onChange={(event) => {
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: "bbox"}});
                                        // only create bbox if entered values have valid format (floats with at least one decimal place)
                                        if(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(event.currentTarget.value)) {
                                            dispatch({type: "MANUAL_BBOX", payload: {field: event.currentTarget.name, valueString: event.currentTarget.value}})
                                        }
                                        else {
                                            dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})
                                        }
                                    }}*/
                                    onChange={updateBBoxValue}
                                    InputProps={{
                                        endAdornment: (
                                            input.boundingBoxCorner2.length!==0
                                            &&<IconButton
                                                onClick={() => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: ""}});
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner2", value: []}})
                                                }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )
                                    }}
                                    disabled={input.sitesMode==="region"}
                                />
                            </FormGroup>
                        </Grid>}

                    {/*checkboxes for filter by catalogs; only active in object search mode*/
                        !input.showArchaeoSites && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend" disabled={input.showArchaeoSites}>Filter by catalogs</FormLabel>
                                {input.catalogIdsList && input.catalogIdsList.map(project => {
                                    return (project
                                        && <FormControlLabel
                                            key={project.catalogId}
                                            control={
                                                <Checkbox
                                                    checked={input.checkedCatalogIds.includes(project.catalogId)}
                                                    onChange={() => {
                                                        dispatch({
                                                            type: input.checkedCatalogIds.includes(project.catalogId)
                                                                ? "UNCHECK_ITEM"
                                                                : "CHECK_ITEM",
                                                            payload: {field: "checkedCatalogIds", toggledItem: project.catalogId}
                                                        });
                                                        dispatch({
                                                            type: "UPDATE_INPUT",
                                                            payload: {
                                                                field: "checkedCatalogLabels",
                                                                value: input.checkedCatalogLabels.includes(project.catalogLabel)
                                                                    ? [...input.checkedCatalogLabels.filter(catalogLabel => catalogLabel !== project.catalogLabel)]
                                                                    : [...input.checkedCatalogLabels, project.catalogLabel]
                                                            }
                                                        })
                                                    }}
                                                    name={String(project.catalogId)}
                                                    key={project.catalogId}
                                                    disabled={input.showArchaeoSites}
                                                />
                                            }
                                            label={project.catalogLabel}
                                        />
                                    )
                                })}
                            </FormGroup>
                        </Grid>}
                </Grid>
            </Grid>}
        </>
    );
};
