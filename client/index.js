import React from 'react';
import App from './containers/App';
import './scss/index.scss'
import Wrapper from './Wrapper';
import { createRoot } from "react-dom/client";


const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Wrapper>
    <App /> 
  </Wrapper>);


  