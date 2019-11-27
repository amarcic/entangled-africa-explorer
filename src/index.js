import React from 'react';
import ReactDOM from 'react-dom';
import { HelloComputerButton } from './components/';
import './index.css';

class App extends React.Component{
    render(){
        return(
            <div>
                <span>Hello World</span><br />
                <HelloComputerButton />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'))
