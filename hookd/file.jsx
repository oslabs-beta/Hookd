import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../actions/actions.js';
import BusinessResultCard from './BusinessResultCard.jsx';
import ResultCard from './ResultCard.jsx';
import Map from './Map.jsx';
import mockdata from '../mockdata/mockdata.js';

const ResultsWrapper = props => {
  // const isActive = useSelector(state => state.dumbletour);
  // const dispatch = useDispatch();
  const [active, setActive] = useState('EVENTS');
  const events = [];
  const maps = [];
  const businesses = [];
  props.eventBriteResults ? props.eventBriteResults.forEach((r, idx) => {
    const description = !r.descriptionText ? null : r.descriptionText.length > 250 ? r.descriptionText.slice(0, 250) + '...' : r.description;
    maps.push({ ...r
    });
    events.push(<ResultCard key={'event-result' + idx} description={description} {...r} />);
  }) : events.push('no results found');
  props.yelpResults ? props.yelpResults.forEach((results, idx) => {
    maps.push({ ...results
    });
    businesses.push(<BusinessResultCard key={'bus-result' + idx} {...results}></BusinessResultCard>);
  }) : businesses.push('no businesses found');
  return <section className='results-wrapper'>
    <nav className='results-nav'>
      <div className={active === 'EVENTS' ? 'tab-active results-tab' : 'results-tab'} onClick={() => setActive('EVENTS')}>Events</div>
      <div className={active === 'BUSINESSES' ? 'tab-active results-tab' : 'results-tab '} onClick={() => setActive('BUSINESSES')}>Businesses</div>
    </nav>
    {active === 'EVENTS' ? <section className="result-cards">
    {events}
    </section> : active === 'BUSINESSES' ? <section className='business-result-cards'>
      {businesses}
    </section> : null}
  </section>;
};

export default ResultsWrapper;