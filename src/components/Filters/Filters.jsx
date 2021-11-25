import React from 'react';
import {
    Checkbox, Divider, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup,
    Switch, TextField, Tooltip
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ClearIcon from "@material-ui/icons/Clear";
import { useStyles } from '../../styles';
import { useTranslation } from "react-i18next";
import { arachneCategories, catalogs } from "../../config";


export const Filters = (props) => {
    const [input, dispatch] = props.reducer;
    const { periods, regions } = props;

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

                    {/*checkboxes for filter by iDAI.objects category; only active in object search mode*/
                        input.mode === "objects" && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend" >Filter by iDAI.objects category</FormLabel>
                                <Autocomplete
                                    multiple
                                    value={input.arachneCategoriesCheckedIds}
                                    options={arachneCategories(t)}
                                    getOptionLabel={(option) => option}
                                    getOptionSelected={(option, value) => option.id === value}
                                    onChange={(event, newValues) => {
                                        dispatch({
                                            type: "UPDATE_INPUT",
                                            payload: {field: "arachneCategoriesCheckedIds",
                                                //todo: is this good? newValues is something like ["1", "2", {id: "3", label: "label for 3"}] and was throwing an error otherwise
                                                value: newValues.map(newValue => newValue.id || newValue)}
                                        })
                                    }}
                                    renderOption={(option, { selected }) => (
                                        /*<>
                                            <Checkbox
                                                checked={selected}
                                            />
                                            {option.label}
                                        </>*/
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selected}
                                                />
                                            }
                                            label={option.label}
                                        />
                                    )}
                                    //using this the selected values' labels are displayed, but not in Chip format...
                                    /*renderTags={(value) => (
                                        arachneCategories(t).filter((category) => value.includes(category.id)).map(category => category.label))
                                    }*/
                                    renderInput={(params) =>
                                        <TextField {...params} variant="outlined" label="iDAI.objects category" />
                                    }
                                    disableCloseOnSelect
                                    size="small"
                                    style={{ width: 300 }} //?
                                />
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
                                    multiple
                                    name="chronOntologyTerms"
                                    value={input.chronOntologyTerms}
                                    options={periods}
                                    getOptionLabel={(option) => option}
                                    getOptionSelected={(option, value) => option === value}
                                    onChange={(event, newValue) =>
                                        dispatch({type: "UPDATE_INPUT", payload: {field: "chronOntologyTerms", value: newValue}})
                                    }
                                    renderInput={(params) =>
                                        <TextField {...params} label="iDAI.chronontology term" variant="outlined" />
                                    }
                                    autoSelect
                                    size="small"
                                    variant="outlined"
                                    style={{ width: 300 }} //?
                                />
                            </FormGroup>
                        </Grid>}

                    {/*dropdown for filter by region; only active in site search mode*/
                        (input.mode === "sites" || input.mode === "sitesByRegion") && <Grid item>
                            <FormGroup>
                                <FormLabel component="legend">Filter by region</FormLabel>
                                <Autocomplete
                                    name="region"
                                    value={input.gazetteerRegion}
                                    options={regions}
                                    getOptionLabel={(option) => option.label}
                                    getOptionSelected={(option, value) => option.id === value}
                                    onChange={(event, newValue) => {
                                        newValue === null
                                            ? (dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: "sites"}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "gazetteerRegion", value: {id: null, label: ""}}}))
                                            : (dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: "sitesByRegion"}}),
                                                dispatch({type: "UPDATE_INPUT", payload: {field: "gazetteerRegion", value: newValue}}));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Filter by region" variant="outlined" />}
                                    autoSelect
                                    disabled={(input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0)}
                                    size="small"
                                    style={{ width: 300 }} //?
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
                                            disabled={input.gazetteerRegion.id!==null}
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
                                {//if there are non-public catalogs, tell users this by displaying the FormHelperText specified below
                                    catalogs.map(catalog => catalog.public).includes(false)
                                    && <FormHelperText error>{t("Some catalogs are not yet publicly accessible")}</FormHelperText>
                                }
                                {/*todo: format so it is clear that there is one checkbox that controls the others */}
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={input.catalogsCheckedIds.length === catalogs.filter(catalog => catalog.public).length} //if all public catalogs are selected
                                            onChange={() => {
                                                input.catalogsCheckedIds.length === catalogs.filter(catalog => catalog.public).length //if all public catalogs are selected
                                                    ? dispatch({type: "UPDATE_INPUT",
                                                        payload: {field: "catalogsCheckedIds", value: []}})
                                                    : dispatch({type: "UPDATE_INPUT",
                                                        payload: {field: "catalogsCheckedIds", value: catalogs.filter(catalog => catalog.public).map(catalog => catalog.id)}
                                                    })
                                            }}
                                            name="All catalogs"
                                        />
                                    }
                                    label={t("All catalogs")}
                                />
                                <Divider/>
                                {catalogs && catalogs.map(catalog => {
                                    return (catalog
                                        &&
                                        <FormControlLabel
                                            key={catalog.id}
                                            control={
                                                <Checkbox
                                                    checked={input.catalogsCheckedIds.includes(catalog.id)}
                                                    disabled={!catalog.public}
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
