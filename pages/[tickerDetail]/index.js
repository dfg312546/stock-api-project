import { useRouter } from "next/router";
import { useEffect,useState } from "react";
import { useQuery } from "react-query";
import { Button,CircularProgress } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import style from './tickerDetail.module.css'

import dynamic from 'next/dynamic';
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiKey = 'QXqHO13HVjyg9sYe0EhGdBXs5dVcTOEm'

function DetailPage() {
  const router = useRouter();
  const { symbol,name } = router.query;

  const [dataVolume,setDataVolume] = useState(120);
  const [chartData,setChartData] = useState([]);
  const [dividendDataVolume,setDividendDataVolume] = useState(8)
  const [chartDataDividend,setChartDataDividend] = useState([])
  const [YTMdata,setYTMdata] = useState([])

  const { data: tickerPriceData, isSuccess: isSuccessTickerPrice } = useQuery('tickerPrice',fetchTickerChartData); 
  async function fetchTickerChartData () {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${apiKey}`);
    const data = await response.json();
    return data
  }
  useEffect(() => {
    function loadChartData() {
      if ( isSuccessTickerPrice && tickerPriceData['Error Message']) {
        return
      } else {
        const dailyData = tickerPriceData.historical.slice(0, dataVolume);
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
        }
    };

    if ( isSuccessTickerPrice ) {
      loadChartData()
    }


  },[isSuccessTickerPrice,tickerPriceData]);

  const { data: tickerInfoData, isSuccess: isSuccessTickerInfo } = useQuery('tickerInfo',fetchTickerInfo); 
  async function fetchTickerInfo() {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`);
    const data = await response.json();
    return data;
  };

  const { data: tickerDividendData, isSuccess: isSuccessTickerDividend } = useQuery('tickerDividend', fetchTickerDividend);
  async function fetchTickerDividend() {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${apiKey}`)
    const data = await response.json();
    return data;
  };
  useEffect(() => {
    if ( isSuccessTickerDividend ) {
      const filteredTickerDividendData = tickerDividendData.historical.slice(0,dividendDataVolume);
      console.log(filteredTickerDividendData);
      const candlestickDividendData = filteredTickerDividendData.map((item) => ({
        x: new Date(item.date).getTime(),
        y: item.dividend
      }));
      setChartDataDividend(candlestickDividendData);
    };
  },[isSuccessTickerDividend,tickerDividendData]);
  console.log(chartDataDividend);

  useEffect(() => {
    if ( isSuccessTickerDividend && isSuccessTickerPrice ) {
      handleYTM();
    }
    

  },[ isSuccessTickerDividend,isSuccessTickerPrice,tickerDividendData]);

  function handleYTM() {
    const dataYTM = []
    for ( let i=0; i<dividendDataVolume ; i++ ) {
      const startDate = tickerDividendData.historical[i].date;
      const endDate = tickerDividendData.historical[i+1].date;
      console.log(startDate,endDate)

      const filteredPriceData = tickerPriceData.historical.filter((item) => {
        return  item.date <= startDate && item.date >= endDate
      })
      const vwapData = filteredPriceData.map((priceData) => ({
        vwap: priceData.vwap
      }));
      // console.log(vwapData)

      const totalVWAP = vwapData.reduce((sum, data) => sum + data.vwap, 0);
      const averageVWAP = totalVWAP / vwapData.length;

      const YTM = (( tickerDividendData.historical[i].adjDividend / averageVWAP ) * 100 ) .toFixed(2)
      console.log(YTM,totalVWAP,averageVWAP)
      dataYTM.push({
        x: tickerDividendData.historical[i].date,
        y: parseFloat(YTM),
      })
    }
    console.log(dataYTM)
    setYTMdata(dataYTM)
    return dataYTM
  };




  function goBack() {
    // setDataVolume(120);
    // setDividendDataVolume(8);
    setChartData([]);
    setChartDataDividend([]);
    setYTMdata([]);
    router.back();
  };

  function handlePriceDataVolumeChange(event) {
    event.preventDefault();
    const dailyData = tickerPriceData.historical.slice(0, dataVolume);
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

  function handleDivedendDataVolumeChange(event) {
    event.preventDefault();
    const filteredTickerDividendData = tickerDividendData.historical.slice(0,dividendDataVolume)
    console.log(filteredTickerDividendData)
    const candlestickDividendData = filteredTickerDividendData.map((item) => ({
      x: new Date(item.date).getTime(),
      y: item.dividend
    }))
    setChartDataDividend(candlestickDividendData);
    handleYTM();
  };

const chartOptions = {
  xaxis: {
    type: 'datetime',
  },
  yaxis: [
    {
    tooltip: {
      enabled: true,
    },
    labels: {
      formatter: function (value) {
        return value.toFixed(0); // 移除小数部分
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
];

const barChartOptions = {
  xaxis: {
    type: 'datetime',
  },
  yaxis: [
    {
    tooltip: {
      enabled: true,
    },
  },
]
};

const barChartSeries = [
  {
    name: 'Dividend',
    data: chartDataDividend,
  },
  {
    name: 'Yield to Maturity ( % )',
    data: YTMdata,
  }
];

return (
  <>
  { (!isSuccessTickerInfo || !isSuccessTickerPrice || !isSuccessTickerDividend ) && <CircularProgress className={style.tickerDetailPageLoadingProgress}/>}
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
        <div className={style.tickerDescriptionFooter}>
          <h4>Type : 
            {tickerInfoData[0].isEtf && <span>ETF</span>}
            {tickerInfoData[0].isAdr && <span>ADR</span>}
            {tickerInfoData[0].isFund && <span>Fund</span>}
            {(!tickerInfoData[0].isEtf && !tickerInfoData[0].isAdr && !tickerInfoData[0].isFund) && <span> Stock</span>}
          </h4>
          <h4>
            Sector : {tickerInfoData[0].sector}
          </h4>
          <h4>
            Industry : {tickerInfoData[0].industry}
          </h4>
          <h4>
            Company web : {tickerInfoData[0].website && <a href={tickerInfoData[0].website} target="_blank">{tickerInfoData[0].companyName}</a>}<OpenInNewIcon className={style.openInNewIcon}/>
          </h4>
        </div>
        <form className={style.tickerDataVolumeForm} onSubmit={handlePriceDataVolumeChange}>
          <div>
          我想要尋找近
          <input
            value={dataVolume}
            onChange={(event) => {setDataVolume(event.target.value)}}
            className={style.tickerDataVolumeInput}
          />
          個交易日資料
          </div>
          <Button
            variant="contained"
            type='submit'
          >
            Search
          </Button>
        </form>
        <ApexCharts options={chartOptions} series={chartSeries} type="candlestick" height={400} />

        <form className={style.tickerDataVolumeForm} onSubmit={handleDivedendDataVolumeChange}>
          <div>
          我想要尋找近
          <input
            value={dividendDataVolume}
            onChange={(event) => {setDividendDataVolume(event.target.value)}}
            className={style.tickerDataVolumeInput}
          />
          次股利發放資料
          </div>
          <Button
            variant="contained"
            type='submit'
          >
            Search
          </Button>
        </form>
        <ApexCharts options={barChartOptions} series={barChartSeries} type="bar" height={400} />
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

export default DetailPage;
