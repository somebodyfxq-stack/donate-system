import React, {useRef, useState} from 'react';
import {DiagramWidgetV6} from './DiagramWidgetV6';
import {goalWidgetV3} from './goalWidgets';
import {ProgressBarWidget} from './ProgressBarWidget';
import {ProgressBarWidgetV4} from './ProgressBarWidgetV4';
import {usePresets} from './usePresets';

const buildGradient = (data) => {
  let gradientParts = [];
  let gradientPersentage = {
    small: ['0%', '100%'],
    big: ['0%', '50%', '100%']
  };
  let gradientSize = data.gradientColors.length === 3 ? 'big' : 'small';

  data.gradientColors.forEach((c, i) => {
    gradientParts.push(`rgba(${c.r}, ${c.g}, ${c.b}) ${gradientPersentage[gradientSize][i]}`);
  });

  return `linear-gradient(${data.gradientAngle || 90}deg, ${gradientParts.join()})`;
};

const getBackground = (item, c) => {
  let background = `rgba(${c.r},${c.g},${c.b},${c.a})`;

  if (item.gradient) {
    background = buildGradient(item);
  }

  return background;
};

const ExamplesGoal = ({ onExampleClick, widget }) => {
  const [active, setActive] = useState(-1);
  const { exampleGoals, removeUsersGoalPreset } = usePresets();

  const innerCircleV3Ref = useRef();
  const circleV3Ref = useRef();
  const innerCircleV6Ref = useRef();
  const circleV6Ref = useRef();
  const circleInternalV6Ref = useRef();
  const markerV6Ref = useRef();

  const getGoalExample = (item, i) => {
    const cf = item.colorFont;
    const c = item.color;
    const b = item.colorBorder || { r: '50', g: '50', b: '50', a: '1' };

    return (
      <div className="col-md-4 mb-3" key={i}>
        <div className={`col-md-12 example-goal ${active === i ? 'active' : ''} ${item.isNinetyDegree ? 'rotated' : ''}`} onClick={() => { setActive(i); onExampleClick(item) }}>
          {item.goalWidgetType === '2' && goalWidgetV3({ widget: { ...widget, ...item }, innerCircleV3Ref, circleV3Ref, i })}

          {item.goalWidgetType === '3' && ProgressBarWidget({ widget: { ...widget, ...item } })}

		  {item.goalWidgetType === '4' && DiagramWidgetV6({ widget: { ...widget, ...item }, innerCircleV6Ref, circleV6Ref, circleInternalV6Ref, markerV6Ref, i })}

		  {item.goalWidgetType === '5' && ProgressBarWidgetV4({ widget: { ...widget, ...item } })}

          {!item.goalWidgetType && (
            <div className="row" style={{ borderRadius: item.borderRadius + "px", overflow: 'hidden', position: 'relative', border: `${item.borderWidth}px solid rgba(${b.r},${b.g},${b.b},${b.a})` }}>
              <span className="percentage" style={{ color: `rgba(${cf.r},${cf.g},${cf.b},${cf.a})` }}>
                60%
              </span>
              <span className={`received ${item.gradientAnimation === 'always' && 'gradient-animation'}`} style={{
                width: '100%',
                background: getBackground(item, c)
              }} />
              <span className="amount" style={{
                background: `rgba(${cf.r},${cf.g},${cf.b},${cf.a})`,
                width: '40%',
              }} />
            </div>
          )}
          вибрати
        </div>
        {item.removable && (
          <div className="delete-item-button mt-2" onClick={(e) => removeUsersGoalPreset(e, item.presetId)}>
            <i className='fas fa-trash-alt'></i>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="form-group row mb-lg-4"></div>
      <div className="d-flex flex-row justify-content-around flex-wrap align-items-center">
        {exampleGoals.map(getGoalExample)}
      </div>
    </>
  )
}

export default ExamplesGoal;
