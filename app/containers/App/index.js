/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'containers/Home/Loadable';

import Labels from '../Labels';
import './index.css';
import Navbar from '../Navbar';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/labels" component={Labels} />
      </Switch>
    </div>
  );
}
