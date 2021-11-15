import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

function Caret({ direction }) {
  if (!direction) return null;
  return (
    <div>
      <span className={`caret ${direction}`} />
    </div>
  );
}

Caret.propTypes = {
  direction: PropTypes.oneOf(['up', 'down', '']).isRequired,
};

export default Caret;
