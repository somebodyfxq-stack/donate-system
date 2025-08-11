import React from 'react';
import {Badge as ReactBadge} from 'react-bootstrap';

const Badge = (props) => {
    return <span style={{float: props?.float, marginTop: props?.marginTop}}>
      <ReactBadge style={{backgroundColor: '#FFF2CA', color: '#E2A417', marginRight: 5}} variant={props?.variant || 'warning'}>
        {props?.label || 'New'}
      </ReactBadge>
    </span>;
};

export default Badge;
