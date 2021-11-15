import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';

function Paginate({ data, render = () => {}, style = {} }) {
  const [pageNumber, setPageNumber] = useState(1);
  useEffect(() => {
    if (Math.ceil(data.length / 25) < pageNumber) setPageNumber(1);
  }, [data, pageNumber]);
  const handleChange = number => {
    setPageNumber(number);
  };
  return (
    <>
      {render(pageNumber)}
      <Pagination
        total={data.length}
        pageSize={25}
        onChange={handleChange}
        style={{ marginTop: '2rem', paddingBottom: '2rem', ...style }}
      />
    </>
  );
}

Paginate.propTypes = {
  data: PropTypes.array.isRequired,
  render: PropTypes.func,
  style: PropTypes.object,
};

export default Paginate;
