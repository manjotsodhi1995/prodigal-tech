import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import './index.css';

function Navbar({ history }) {
  const {
    location: { pathname },
  } = history;
  return (
    <div className="navbar-container">
      <Link to="/">
        <div className={`navbar-item ${pathname === '/' ? 'active' : ''}`}>
          Home
        </div>
      </Link>
      <Link to="/labels">
        <div
          className={`navbar-item ${pathname === '/labels' ? 'active' : ''}`}
        >
          Labels
        </div>
      </Link>
    </div>
  );
}

Navbar.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(Navbar);
