import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { Line } from "./types";

export interface StepsChartProps {
  data: any[];
  lines: Line[];
  identifier: string;
  title?: string;
  externalLegendItemHtmlRenderer?: (dataContext: any) => string;
}

am4core.useTheme(am4themes_animated);

const StepsChart = ({
  identifier,
  data,
  lines,
  title,
  externalLegendItemHtmlRenderer
}: StepsChartProps) => {
  const chartLegendDivId = `${identifier}-legend`;
  const legendHeight: any = 45 * lines.length;
  const chart: any = useRef<am4charts.XYChart>(null);
  const isChartReady = useRef(false);

  // will be used to initialize the chart and to clean up after the component is unmounted
  useEffect(() => {
    if (chart.current) {
      chart.current.dispose();
    }
    chart.current = getChart(data);
    return () => {
      if (chart.current) {
        chart.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSeries = (chart: any, line: Line) => {
    const series: am4charts.StepLineSeries = chart.series.push(
      new am4charts.StepLineSeries()
    );
    series.dataFields.dateX = "date";
    series.dataFields.valueY = line.dataField;
    series.strokeWidth = line.strokeWidth;
    series.name = line.title;

    if (line.color) {
      series.fill = series.stroke = am4core.color(line.color);
    }

    const segment = series.segments.template;
    segment.interactionsEnabled = true;

    const hoverState = segment.states.create("hover");
    hoverState.properties.strokeWidth = line.hoveredStrokeWidth;

    const dimmed = segment.states.create("dimmed");
    dimmed.properties.stroke = am4core.color("#dadada");
    return series;
  };

  const getChart = (data: any) => {
    isChartReady.current = false;
    const chart = am4core.create(identifier, am4charts.XYChart);
    chart.data = data;

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.baseInterval = { timeUnit: "minute", count: 1 };
    dateAxis.tooltipDateFormat = "eee, dd MMM, HH:mm";
    dateAxis.dataFields.date = "date";

    // configuring the min and max of the dates axis
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    if (title) {
      valueAxis.title.text = title;
      valueAxis.title.marginLeft = 10;
      valueAxis.title.fontWeight = "bold";
    }

    // creating the scrollbar
    chart.scrollbarX = new am4core.Scrollbar();

    // creating the lines (series)
    lines.forEach(line => {
      createSeries(chart, line);
    });

    // Create a legend for the chart
    const legendContainer = am4core.create(chartLegendDivId, am4core.Container);
    legendContainer.width = am4core.percent(100);
    legendContainer.height = am4core.percent(100);

    chart.legend = new am4charts.Legend();
    const chartLegend = chart.legend;
    //chartLegend.labels.template.html
    if (externalLegendItemHtmlRenderer) {
      chartLegend.labels.template.adapter.add(
        "html",
        (label: any, target: { dataItem: { dataContext: any } }, key: any) => {
          //@ts-ignore
          const dataContext = target.dataItem.dataContext;
          if (dataContext) {
            console.log(dataContext);
            if (externalLegendItemHtmlRenderer(dataContext)) {
              return externalLegendItemHtmlRenderer(dataContext);
            }
          }
          return label;
        }
      );
    } else {
      chartLegend.useDefaultMarker = true;
    }
    chartLegend.contentHeight = legendHeight;
    chartLegend.parent = legendContainer;

    chartLegend.labels.template.adapter.add(
      "html",
      (label: any, target: any, key: any) => {
        //@ts-ignore
        const text = target.currentText;
        if(text && text.length === 17){
            return `<div class="grid-device-tile" id="bla">
                    <img src="./UNKNOWN.png" title="bla" alt="bla" class="tile-image unknown"/>
                    <div class="first-line">${text}</div>
                    <div class="second-line">unknown</div>
                    <div class="third-line">unknown</div>
                  </div>`;
        }
        return text;
      }
    );

    //chart.scrollbarX = new am4core.Scrollbar();
    chart.cursor = new am4charts.XYCursor();

    // when the chart is ready and animated to the view set the isChartReady to true which will be used to control external events
    chart.events.on("ready", (ev: any) => {
      setTimeout(() => {
        isChartReady.current = true;
      }, chart.defaultState.transitionDuration + 100);
    });
    return chart;
  };

  return (
    <div>
      <div id={identifier} className="chart" />
      <div className="chart-legend-wrapper">
        <div
          id={chartLegendDivId}
          className="chart-legend"
          style={{ minHeight: legendHeight, overflow: "auto" }}
        />
      </div>
    </div>
  );
};

export default React.memo(StepsChart);
