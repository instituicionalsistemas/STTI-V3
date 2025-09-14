import React from 'react';
import ReactECharts from 'echarts-for-react';

interface LogChartProps {
    data: [number, number][]; // [timestamp, count]
}

const LogChart: React.FC<LogChartProps> = ({ data }) => {
    const option = {
        useUTC: true,
        title: {
            text: 'Atividade de Logs ao Longo do Tempo',
            left: 'center',
            textStyle: {
                color: '#E0E0E0',
                fontWeight: 'bold',
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(16, 24, 44, 0.8)',
            borderColor: '#243049',
            textStyle: {
                color: '#E0E0E0'
            },
            formatter: (params: any) => {
                if (!params || params.length === 0) return '';
                const date = new Date(params[0].value[0]);
                const value = params[0].value[1];
                return `${date.toLocaleString('pt-BR')}<br /><strong>Logs: ${value}</strong>`;
            }
        },
        xAxis: {
            type: 'time',
            axisLabel: {
                color: '#8A93A3',
                hideOverlap: true,
            },
            axisLine: {
                lineStyle: {
                    color: '#243049'
                }
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            axisLabel: {
                color: '#8A93A3'
            },
            splitLine: {
                lineStyle: {
                    color: '#243049',
                    type: 'dashed'
                }
            }
        },
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'weakFilter'
            },
            {
                type: 'slider',
                xAxisIndex: 0,
                backgroundColor: 'rgba(16, 24, 44, 0.5)',
                borderColor: '#243049',
                fillerColor: 'rgba(0, 209, 255, 0.2)',
                dataBackground: {
                    lineStyle: { color: '#8A93A3' },
                    areaStyle: { color: '#10182C' }
                },
                handleStyle: {
                    color: '#00D1FF',
                    borderColor: '#00AEEF'
                },
                textStyle: {
                    color: '#E0E0E0'
                },
                bottom: '5%',
            }
        ],
        series: [{
            name: 'Logs',
            type: 'line',
            symbol: 'circle',
            symbolSize: 4,
            data: data,
            smooth: true,
            itemStyle: {
                color: '#00D1FF'
            },
            lineStyle: {
                width: 2,
                color: '#00D1FF'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(0, 209, 255, 0.4)'
                    }, {
                        offset: 1, color: 'rgba(0, 209, 255, 0)'
                    }]
                }
            }
        }],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '20%',
            containLabel: true
        }
    };

    if (data.length === 0) {
        return (
            <div style={{ height: '400px', width: '100%' }} className="flex items-center justify-center">
                <p className="text-dark-secondary">Nenhum dado para exibir no gráfico.</p>
            </div>
        )
    }

    return (
        <ReactECharts 
            option={option} 
            style={{ height: '400px', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
};

export default LogChart;