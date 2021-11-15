import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Input } from 'antd';

import Loader from '../Loader';
import Paginate from '../Paginate';
import './index.css';

function Labels() {
  const [callList, setCallList] = useState(null);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [labels, setLabels] = useState(null);
  const [filteredLabels, setFilteredLabels] = useState([]);
  const [search, setSearch] = useState('');
  const [opList, setOpList] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch('https://damp-garden-93707.herokuapp.com/getlistoflabels', {
      method: 'GET',
      headers: {
        user_id: '24b456',
      },
    })
      .then(res => res.json())
      .then(({ data: { unique_label_list: uniqueLabelList } }) => {
        setLabels(uniqueLabelList);
        setFilteredLabels(uniqueLabelList);
      });
  }, []);

  const fetchCallList = async () =>
    fetch('https://damp-garden-93707.herokuapp.com/getcalllist', {
      method: 'GET',
      headers: {
        user_id: '24b456',
      },
    }).then(res => res.json());

  useEffect(() => {
    fetchCallList().then(({ data: { call_data: callData } }) => {
      setCallList(callData);
    });
  }, []);

  const handleChange = (call, e) => {
    setAllSelected(false);
    if (e.target.checked) setSelectedCalls(prev => [...prev, call]);
    else {
      const calls = [...selectedCalls];
      const index = selectedCalls.findIndex(
        value => value.call_id === call.call_id,
      );
      setSelectedCalls([...calls.slice(0, index), ...calls.slice(index + 1)]);
    }
  };
  const getCheckedValue = call => {
    if (
      selectedCalls.findIndex(value => value.call_id === call.call_id) === -1
    ) {
      return false;
    }
    return true;
  };

  const handleLabelOperation = (label, type) => {
    const ops = [...opList];
    const index = ops.findIndex(op => op.name === label);
    if (index === -1) {
      setOpList(prev => [...prev, { name: label, op: type }]);
    } else {
      if (ops[index].op === type) {
        ops.splice(index, 1);
        setOpList(ops);
        return;
      }
      ops[index].op = type;
      setOpList(ops);
    }
  };

  const getType = (label, type) => {
    const index = opList.findIndex(op => op.name === label);
    if (index === -1) return '';
    if (opList[index].op === 'add' && opList[index].op === type)
      return 'primary';
    if (opList[index].op === 'remove' && opList[index].op === type)
      return 'danger';
    return '';
  };

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedCalls(callList);
      setAllSelected(true);
    } else {
      setAllSelected(false);
      setSelectedCalls([]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const data = {
      operation: {
        callList: selectedCalls.map(call => call.call_id),
        label_ops: opList,
      },
    };
    await fetch('https://damp-garden-93707.herokuapp.com/applyLabels', {
      method: 'POST',
      headers: {
        user_id: '24b456',
      },
      body: JSON.stringify(data),
    });
    const {
      data: { call_data: callData },
    } = await fetchCallList();
    setCallList(callData);
    setLoading(false);
  };

  const deleteTag = async (call, label) => {
    setLoading(true);
    const data = {
      operation: {
        callList: [call.call_id],
        label_ops: [{ name: label, op: 'remove' }],
      },
    };
    await fetch('https://damp-garden-93707.herokuapp.com/applyLabels', {
      method: 'POST',
      headers: {
        user_id: '24b456',
      },
      body: JSON.stringify(data),
    });
    const {
      data: { call_data: callData },
    } = await fetchCallList();
    setCallList(callData);
    setLoading(false);
  };

  const handleSearch = e => {
    const { value } = e.target;
    setFilteredLabels(
      labels.filter(label =>
        label.toLowerCase().startsWith(value.toLowerCase()),
      ),
    );
    setSearch(value);
  };

  const renderCallList = pageNumber => {
    const renderedCallList = callList.slice(
      (pageNumber - 1) * 25,
      pageNumber * 25,
    );
    return (
      <>
        <div
          style={{
            backgroundColor: 'lightblue',
            cursor: 'pointer',
            marginTop: '2rem',
          }}
          className="label-call"
        >
          <div>
            <b>Select</b>
          </div>
          <div>
            <b>Call ID</b>
          </div>
          <div>
            <b>Label ID</b>
          </div>
        </div>
        {renderedCallList.map(call => (
          <div key={call.call_id} className="label-call">
            <div>
              <Checkbox
                name={call.call_id.toString()}
                onChange={e => handleChange(call, e)}
                checked={getCheckedValue(call)}
              />
            </div>
            <div>{call.call_id}</div>
            <div className="label-call-tags">
              {call.label_id.map(label => (
                <div
                  key={label}
                  className="label-call-tag"
                  onClick={e => deleteTag(call, label, e)}
                  role="button"
                  tabIndex={0}
                >
                  {label}{' '}
                  <span>
                    <b>x</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  };

  const disableSave = () => !opList.length || !selectedCalls.length || loading;

  if (!callList || !labels) return null;
  return (
    <>
      {loading && <Loader />}
      <div className="label-operation">
        <Button type="primary" onClick={handleSave} disabled={disableSave()}>
          Save
        </Button>
        <Checkbox onChange={handleSelectAll} checked={allSelected}>
          Select All
        </Checkbox>
      </div>
      <div className="label-container">
        <div className="label-change">
          <Input
            placeholder="Search label"
            onChange={handleSearch}
            value={search}
            style={{ marginBottom: '1rem' }}
          />
          {filteredLabels.map(label => (
            <div key={label} className="label-cell">
              {label}{' '}
              <span>
                <Button
                  onClick={e => handleLabelOperation(label, 'add', e)}
                  type={getType(label, 'add')}
                >
                  Add
                </Button>{' '}
                <Button
                  onClick={e => handleLabelOperation(label, 'remove', e)}
                  type={getType(label, 'remove')}
                >
                  Remove
                </Button>
              </span>
            </div>
          ))}
        </div>
        <div className="label-call-container">
          <Paginate
            data={callList}
            render={renderCallList}
            style={{ textAlign: 'center' }}
          />
        </div>
      </div>
    </>
  );
}

export default Labels;
