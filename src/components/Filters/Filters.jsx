import React from 'react';
import {
    Checkbox, FormControlLabel, FormGroup, FormLabel, Grid, IconButton, Radio, RadioGroup, Switch, TextField, Tooltip
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ClearIcon from "@material-ui/icons/Clear";
import { useStyles } from '../../styles';
import { useTranslation } from "react-i18next";
import { arachneTypes } from "../../config";


export const Filters = (props) => {
    const [input, dispatch] = props.reducer;
    const { catalogs, periods, regions } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const updateBBoxValue = (event) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: "sites"}});
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
                                    name="searchMode"
                                    value={input.mode}
                                    onChange={(event, newValue) => {
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: newValue}})
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "selectedMarker", value: undefined}}) // Is this a good place to clear selectedMarker?
                                    }}
                                >
                                    <FormControlLabel value="sites" checked={(input.mode === "sites" || input.mode === "sitesByRegion")} control={<Radio />} label="Archaeological Sites"/>
                                    <FormControlLabel value="objects" control={<Radio />} label="Objects"/>
                                </RadioGroup>
                            </FormGroup>
                        </Grid>}

                    {/*checkboxes for filter by entity type; only active in object search mode*/
                        input.mode === "objects" && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend" >Filter by Arachne entity type</FormLabel>
                                {arachneTypes && arachneTypes(t).map(type => {
                                    return (type && type.id
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
                                                    }}
                                                    name={String(type.id)}
                                                    key={type.id}
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
                        input.mode === "objects" && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend">Filter by period</FormLabel>
                                <Autocomplete
                                    name="chronOntologyTerm"
                                    value={input.chronOntologyTerm}
                                    options={periods}
                                    onChange={(event, newValue) =>
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "chronOntologyTerm", value: newValue}})
                                    }
                                    renderInput={(params) =>
                                        <TextField {...params} label="iDAI.chronontology term" variant="outlined" />
                                    }
                                    autoSelect={true}
                                    size="small"
                                />
                            </FormGroup>
                        </Grid>}

                    {/*dropdown for filter by region; only active in site search mode*/
                        (input.mode === "sites" || input.mode === "sitesByRegion") && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend">Filter by region</FormLabel>
                                <Autocomplete
                                    //todo: this Autocomplete should have a value to retain the selected region(s?) --> right now they disappear when filters are closed or modes are switched
                                    name="region"
                                    options={regions}
                                    getOptionLabel={(option) => option.title}
                                    getOptionSelected={(option, value) => {
                                        return (option.id === value.id)
                                    }}
                                    onChange={(event, newValue) => {
                                        newValue === null
                                            ? (dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: "sites"}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "gazetteerRegionId", value: null}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "gazetteerRegionTitle", value: null}}))
                                            : (dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: "sitesByRegion"}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "gazetteerRegionId", value: newValue.id}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "gazetteerRegionTitle", value: newValue.title}}));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Filter by region" variant="outlined" />}
                                    autoSelect={true}
                                    disabled={(input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0)}
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
                                            onChange={() => {
                                                dispatch({type: "TOGGLE_STATE", payload: {toggledField: "drawBBox"}})
                                            }}
                                            disabled={input.gazetteerRegionId!==null}
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
                                    onChange={updateBBoxValue}
                                    InputProps={{
                                        endAdornment: (
                                            input.boundingBoxCorner1.length!==0
                                            &&<IconButton
                                                onClick={() => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner1", value: []}})}
                                                }
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )
                                    }}
                                    disabled={input.mode==="sitesByRegion"}
                                />
                                <TextField
                                    type="text"
                                    variant="outlined"
                                    size="small"
                                    name="boundingBoxCorner2"
                                    value={input.boundingBoxCorner2}
                                    placeholder="South, West decimal degrees"
                                    label="South, West decimal degrees"
                                    onChange={updateBBoxValue}
                                    InputProps={{
                                        endAdornment: (
                                            input.boundingBoxCorner2.length!==0
                                            &&<IconButton
                                                onClick={() => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner2", value: []}})
                                                }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )
                                    }}
                                    disabled={input.mode==="sitesByRegion"}
                                />
                            </FormGroup>
                        </Grid>}

                    {/*checkboxes for filter by catalogs; only active in object search mode*/
                        input.mode === "objects" && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend">Filter by catalogs</FormLabel>
                                {catalogs && catalogs.map(catalog => {
                                    return (catalog
                                        && <FormControlLabel
                                            key={catalog.id}
                                            control={
                                                <Checkbox
                                                    checked={input.catalogsCheckedIds.includes(catalog.id)}
                                                    onChange={() => {
                                                        dispatch({
                                                            type: input.catalogsCheckedIds.includes(catalog.id)
                                                                ? "UNCHECK_ITEM"
                                                                : "CHECK_ITEM",
                                                            payload: {field: "catalogsCheckedIds", toggledItem: catalog.id}
                                                        });
                                                    }}
                                                    name={String(catalog.id)}
                                                    key={catalog.id}
                                                />
                                            }
                                            label={catalog.label}
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
