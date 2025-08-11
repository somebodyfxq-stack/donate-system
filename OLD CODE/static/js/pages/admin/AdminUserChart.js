import React, { useEffect, useCallback } from 'react';
import '../../css/userStatus.css';
import { api } from '../../services/api';
import moment from 'moment';

import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';


const AdminUserChart = props => {
  const createStackedColumnChart = (users, divId, summarizeAllUsers) => {
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(divId, am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    const userData = {};
    let prevMonth = 0;

    users.forEach(user => {
      prevMonth++
      if (userData[moment(user.createdAt).format('MM-YYYY')]) {
        userData[moment(user.createdAt).format('MM-YYYY')] += 1;
      } else {
        userData[moment(user.createdAt).format('MM-YYYY')] = summarizeAllUsers ? prevMonth : 1;
      }
    })

    Object.keys(userData).forEach(user => {
      chart.data.push({
        month: user,
        users: userData[user]
      })
    })

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "month";
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.fontSize = 11;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minGridDistance = 30;

    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "month";
    series.dataFields.valueY = "users";
    series.columns.template.tooltipText = "{valueY.value} - {categoryX}";
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 0;

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarY = new am4core.Scrollbar();

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });
  }

  const getData = useCallback(async () => {
    const data = await api.getAllUsers();

    createStackedColumnChart(data.users, 'chartStacked', true)
    createStackedColumnChart(data.users, 'chartStacked2', false)
  }, [])

  useEffect(() => {
    getData();
  }, [getData])

  return <div className="payouts user-status">
    <section className="col-sm-12 mt-4">
      <h3>Користувачі загалом</h3>
      <div id="chartStacked" style={{ width: '100%', height: '400px' }} />
      
      <h3>Користувачі за місяць</h3>
      <div id="chartStacked2" style={{ width: '100%', height: '400px' }} />
    </section>
  </div>
};

export default AdminUserChart;
