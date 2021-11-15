/**
 *
 * Home
 *
 */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Slider, Select } from 'antd';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';

import makeSelectHome from './selectors';
import reducer from './reducer';
import saga from './saga';
import Paginate from '../Paginate';
import './index.css';
import Caret from '../Caret';

const { Option } = Select;

export function Home() {
  useInjectReducer({ key: 'home', reducer });
  useInjectSaga({ key: 'home', saga });
  const [duration, setDuration] = useState(null);
  const [listOfAgents, setListOfAgents] = useState(null);
  const [currentDuration, setCurrentDuration] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [callList, setCallList] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    agentId: '',
    callId: '',
    callTime: '',
  });
  useEffect(() => {
    fetch('https://damp-garden-93707.herokuapp.com/getdurationrange')
      .then(response => response.json())
      .then(({ data: { maximum, minimum } }) => {
        setDuration({
          max: maximum,
          min: minimum,
        });
        setCurrentDuration([minimum, maximum]);
      });
  }, []);

  useEffect(() => {
    fetch('https://damp-garden-93707.herokuapp.com/getlistofagents')
      .then(response => response.json())
      .then(({ data: { listofagents } }) => {
        setListOfAgents(listofagents);
      });
  }, []);

  const formatter = value =>
    `${Math.ceil((value / 100) * (duration.max - duration.min))}`;
  const changeToActualTime = ([min, max]) => [
    Math.ceil((min / 100) * (duration.max - duration.min)),
    Math.ceil((max / 100) * (duration.max - duration.min)),
  ];

  const stringSortAsc = (a, b) => {
    if (a.agent_id < b.agent_id) {
      return -1;
    }
    if (a.agent_id > b.agent_id) {
      return 1;
    }
    return 0;
  };

  const stringSortDesc = (a, b) => {
    if (a.agent_id > b.agent_id) {
      return -1;
    }
    if (a.agent_id < b.agent_id) {
      return 1;
    }
    return 0;
  };

  const handleSort = field => {
    const data = [...callList];
    const order = { ...sortOrder };
    if (order[field] === '' || order[field] === 'down') order[field] = 'up';
    else order[field] = 'down';

    Object.keys(order).forEach(key => {
      if (key !== field) order[key] = '';
    });

    if (field === 'agentId' && order[field] === 'up') data.sort(stringSortAsc);
    else if (field === 'agentId' && order[field] === 'down')
      data.sort(stringSortDesc);
    else if (field === 'callId' && order[field] === 'up')
      data.sort((a, b) => a.call_id - b.call_id);
    else if (field === 'callId' && order[field] === 'down')
      data.sort((a, b) => b.call_id - a.call_id);
    else if (field === 'callTime' && order[field] === 'up')
      data.sort((a, b) => a.call_time - b.call_time);
    else if (field === 'callTime' && order[field] === 'down')
      data.sort((a, b) => b.call_time - a.call_time);

    setCallList(data);
    setSortOrder(order);
  };

  const renderList = pageNumber => {
    const renderedCallList = callList.slice(
      (pageNumber - 1) * 25,
      pageNumber * 25,
    );
    return (
      <>
        <div
          style={{ backgroundColor: 'lightblue', cursor: 'pointer' }}
          className="home-call"
        >
          <div
            className="home-call-header"
            onClick={e => handleSort('agentId', e)}
            role="button"
            tabIndex={0}
          >
            <b>Agent ID</b>
            <div
              style={{
                position: 'absolute',
                right: '5px',
                top: sortOrder.agentId === 'up' ? '0' : '10px',
              }}
            >
              <Caret direction={sortOrder.agentId} />
            </div>
          </div>
          <div
            className="home-call-header"
            onClick={e => handleSort('callId', e)}
            role="button"
            tabIndex={0}
          >
            <b>Call ID</b>
            <div
              style={{
                position: 'absolute',
                right: '5px',
                top: sortOrder.callId === 'up' ? '0' : '10px',
              }}
            >
              <Caret direction={sortOrder.callId} />
            </div>
          </div>
          <div
            className="home-call-header"
            onClick={handleSort.bind(null, 'callTime')}
            role="button"
            tabIndex={0}
          >
            <b>Call Time</b>
            <div
              style={{
                position: 'absolute',
                right: '5px',
                top: sortOrder.callTime === 'up' ? '0' : '10px',
              }}
            >
              <Caret direction={sortOrder.callTime} />
            </div>
          </div>
        </div>
        {renderedCallList.map(call => (
          <div key={call.call_id} className="home-call">
            <div>{call.agent_id}</div>
            <div>{call.call_id}</div>
            <div>{call.call_time}</div>
          </div>
        ))}
      </>
    );
  };
  const handleChange = async (type, value) => {
    if (
      type === 'slider' &&
      value[0] === currentDuration[0] &&
      value[1] === currentDuration[1]
    ) {
      return;
    }
    if (type === 'select') setSelectedAgents(value);
    else if (type === 'slider') setCurrentDuration(value);
    const res = await fetch(
      'https://damp-garden-93707.herokuapp.com/getfilteredcalls',
      {
        method: 'POST',
        body: JSON.stringify({
          info: {
            filter_agent_list: type === 'select' ? value : selectedAgents,
            filter_time_range:
              type === 'slider'
                ? changeToActualTime(value)
                : changeToActualTime(currentDuration),
          },
        }),
      },
    );
    if (!res.ok) throw new Error('Something went wrong');
    const { data } = await res.json();
    if (sortOrder.agentId === 'up') data.sort(stringSortAsc);
    else if (sortOrder.agentId === 'down') data.sort(stringSortDesc);
    else if (sortOrder.callId === 'up')
      data.sort((a, b) => a.call_id - b.call_id);
    else if (sortOrder.callId === 'down')
      data.sort((a, b) => b.call_id - a.call_id);
    else if (sortOrder.callTime === 'up')
      data.sort((a, b) => a.call_time - b.call_time);
    else if (sortOrder.callTime === 'down')
      data.sort((a, b) => b.call_time - a.call_time);
    setCallList(data);
  };

  if (!duration || !listOfAgents) return null;
  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-select">
          <p style={{ fontWeight: 'bold' }}>Agent(s)</p>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select agent(s)"
            onChange={e => handleChange('select', e)}
          >
            {listOfAgents.map(agent => (
              <Option key={agent}>{agent}</Option>
            ))}
          </Select>
        </div>
        <div className="home-slider">
          <p style={{ fontWeight: 'bold' }}>Call Time</p>
          <Slider
            range
            defaultValue={[0, 100]}
            tipFormatter={formatter}
            onAfterChange={e => handleChange('slider', e)}
          />
        </div>
      </div>

      {!!callList.length && (
        <div className="home-call-list">
          <Paginate data={callList} render={renderList} />
        </div>
      )}
    </div>
  );
}

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Home);
