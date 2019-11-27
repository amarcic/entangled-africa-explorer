import React from 'react';

export const HelloComputerButton = props => {

    return(
        <button onClick={ (ev) => alert("Hi " + ev.type) }>Hello Computer</button>
    );
}