import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    card: {
        padding: theme.spacing(2),
        height: "100%",
        width: "100%"
    },
    gridBody: {
        height: "85vh"
    },
    gridContent: {
        height: "85%",
        overflow: "scroll"
    },
    fullHeightTile: {
        height: "calc(100vh - 35px)" //35px is the height of the ShowNext bar
    },
    halfHeightTile: {
        height: "calc(45vh - 35px)" //35px is the height of the ShowNext bar
    },
    "gridBody || fullHeightTile || halfHeightTile": {
        //justifyContent: "space-between",
        //alignItems: "center"
    },
    gridHead: {
        //minHeight: "5%",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    h1: {
        fontSize: "1.25rem"
    },
    h2: {
        fontSize: "1rem"
    },
    h3: {
        fontSize: "0.8rem",
        textTransform: "uppercase"
    },
    paper: {
        marginRight: theme.spacing(2),
    },
}));

export { useStyles };