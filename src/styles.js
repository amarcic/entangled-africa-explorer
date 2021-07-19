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
    "gridBody || fullHeightTile || mediumTile || shortTile || tallTile": {
        justifyContent: "space-between",
        alignItems: "center"
    },
    fullHeightTile: {
        height: "100vh"
    },
    mediumTile: {
        height: "45vh"
    },
    shortTile: {
        height: "30vh"
    },
    tallTile: {
        height: "75vh"
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