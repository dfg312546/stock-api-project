import { useRouter } from "next/router";
import { useEffect,useState } from "react";
import { useQuery } from "react-query";
import { Button } from "@mui/material";
import ReactApexChart from 'react-apexcharts';
import style from './tickerDetail.module.css'

const apiKey = 'QXqHO13HVjyg9sYe0EhGdBXs5dVcTOEm'

function DetailPage() {
  const router = useRouter();
  const { tickerDetail,symbol,name } = router.query;
  console.log(tickerDetail);

  const [dataVolume,setDataVolume] = useState(60);
  const [chartData,setChartData] = useState([]);
  const [chartDataDividend,setChartDataDividend] = useState([])

  useEffect(() => {
    async function fetchChartData() {
      const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${apiKey}`);
      const data = await response.json();

      if (data['Error Message']) {
        return
      }
      
      const dailyData = data.historical.slice(0, dataVolume);

      const candlestickData = dailyData.map((item) => ({
        x: new Date(item.date).getTime(),
        y: [
          parseFloat(item.open),
          parseFloat(item.high),
          parseFloat(item.low),
          parseFloat(item.close),
        ],
      }));

      setChartData(candlestickData);
    };
    fetchChartData()
  },[dataVolume]);

  const { data: tickerInfoData, isSuccess: isSuccessTickerInfo } = useQuery('tickerInfo',fetchTickerInfo); 
  async function fetchTickerInfo() {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`);
    const data = await response.json();
    return data;
  };
  if (isSuccessTickerInfo) {
    console.log(tickerInfoData,isSuccessTickerInfo);
  }

  const { data: tickerDividendData, isSuccess: isSuccessTickerDividend } = useQuery('tickerDividend', fetchTickerDividend);
  async function fetchTickerDividend() {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${apiKey}`)
    const data = await response.json();
    return data;
  };
  useEffect(() => {
    if (isSuccessTickerDividend && chartData.length > 0 ) {
      const filteredTickerDividendData = tickerDividendData.historical.filter((item) => new Date(item.date) >= chartData[dataVolume - 1].x)
      console.log(filteredTickerDividendData)
      const candlestickDividendData = filteredTickerDividendData.map((item) => ({
        x: new Date(item.date).getTime(),
        y: item.dividend
      }))
      setChartDataDividend(candlestickDividendData)
    }
  },[dataVolume]);


  function goBack() {
    router.back();
  };

  const chartOptions = {
    xaxis: {
      type: 'datetime',
      // title: {
      //   text: '日期',
      //   style: {
      //     fontSize: '16px',
      //     fontWeight: 600,
      //   },
      // },
    },
    yaxis: [
      {
      tooltip: {
        enabled: true,
      },
      // title: {
      //   text: '價格',
      //   rotate: 0,
      //   style: {
      //     fontSize: '16px',
      //     fontWeight: 600,
      //   },
      // },
      labels: {
        formatter: function (value) {
          return value.toFixed(0); // 移除小数部分
        },
      },
    },
    {
      // 第二个 y 轴的设置
      tooltip: {
        enabled: true,
      },
      opposite: true,
      labels: {
        formatter: function (value) {
          return value.toFixed(2); // 这里可以指定第二个 y 轴的格式
        },
      },
    },
  ]
  };

  const chartSeries = [
    {
      name: 'Price',
      data: chartData,
    },
    {
      name:'Dividend',
      data: chartDataDividend,
      yAxisIndex: 1,
    }
  ];

  return (
    <>
    { isSuccessTickerInfo && tickerInfoData['Error Message'] && 
      (<div>
        <p>{tickerInfoData['Error Message']}</p>
        <Button
          onClick={goBack}
        >
          Go Back
        </Button>
      </div>)  
    }
    { isSuccessTickerInfo && !tickerInfoData['Error Message'] && 
      (<div className={style.tickerDetailPageContainer}>
        <section className={style.tickerHeader}>
          <h2 className={style.tickerHeaderTitle}>Symbol is {tickerInfoData[0].symbol},and name is {tickerInfoData[0].companyName}</h2>
          {isSuccessTickerInfo && tickerInfoData[0].image ? <img className={style.tickerHeaderImage} src={tickerInfoData[0].image} /> : <p>No ticker image</p>}
        </section>

        <section className={style.tickerMain}>
          <p className={style.tickerDescription}>{tickerInfoData[0].description}</p>
          <ReactApexChart options={chartOptions} series={chartSeries} type="candlestick" height={400} />
        </section>

        <section className={style.tickerFooter}>
          <Button
            variant="outlined"
            onClick={goBack}
          >
            Go Back
          </Button>
        </section>

      </div>)

    }
    
    </>
  )
}

export default DetailPage