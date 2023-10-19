import Head from 'next/head';
import { useState,useContext } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { Context } from "@/context/context";
import { TextField,Button,CircularProgress } from "@mui/material";
import style from '../styles/Home.module.css'

const apiKey = 'QXqHO13HVjyg9sYe0EhGdBXs5dVcTOEm'

export default function Home(props) {
  const Ctx = useContext(Context)
  const [isLoading, setIsLoading] = useState(false);
  // console.log(props.initialETFList)

  async function searchETFHandler(userInputKeyword) {
    setIsLoading(true);
    const response = await fetch(`https://financialmodelingprep.com/api/v3/search?query=${userInputKeyword}&apikey=${apiKey}`)
    const data = await response.json();
    const filteredData = await data.map(item => ({
      name: item.name,
      symbol: item.symbol
    }))
    Ctx.setFilteredData(filteredData);
    console.log(filteredData);
    setIsLoading(false);
    return filteredData
  }

  return (
  <>
  <Head>
    <title>Find Ticker</title>
    <meta name="description" content="Search the ticker with symbol keywords." />
  </Head>
  <SearchInput searchETFHandler={searchETFHandler}/>
  <SearchOutcomeList isLoading={isLoading}/>
  </>
  )
}

//


export const SearchInput = (props) => {
  const [userInputKeyword,setUserInputKeyword] = useState('');

  return (
    <div className={style.SearchInputDiv}>
    <h2>Search ticker with symbol keywords</h2>
    <form onSubmit={(event) => {
      event.preventDefault();
      props.searchETFHandler(userInputKeyword);
      setUserInputKeyword('')
      }}>
      <TextField
        // className={style.SearchInputFormTextField}
        label="Symbol of Ticker"
        color="primary"
        margin="normal"
        value={userInputKeyword}
        autoComplete="off"
        onChange={(event) => {setUserInputKeyword(event.target.value);}}
      />
      <br />
      <Button className={style.SearchInputFormButton} type="submit" variant="contained">
        Search
      </Button>
    </form>
    </div>
  )
}

export const SearchOutcomeList = (props) => {
  const Ctx = useContext(Context);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;//第0筆資料開始
  const endIndex = startIndex + itemsPerPage;//每10筆資料分割成一個陣列呈現
  const currentData = Ctx.filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(Ctx.filteredData.length / itemsPerPage);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
  <>
    {
      props.isLoading ? 
      <div className={style.SearchOutcomeListProgress}>
        <CircularProgress />
      </div> :
      <ul className={style.SearchOutcomeListUl}>
      {Ctx.filteredData.length !==0 ? currentData.map((item, index) => (
        <li 
        key={index}
        className={style.SearchOutcomeListLi}
        >
          <SearchOutcomeItem symbol={item.symbol} name={item.name}/>
        </li>
        )) : null
      }
      </ul>
    }

    { currentData.length !==0 && !props.isLoading ?
    <section className={style.SearchOutcomeListButtonSection}>
      <Button variant="contained" onClick={prevPage} disabled={currentPage === 1} className={style.SearchOutcomeListButton}>
        Previous
      </Button>
      <span className={style.SearchOutcomeListPageText}>{currentPage}</span>
      <Button variant="contained" onClick={nextPage} disabled={currentPage === totalPages} className={style.SearchOutcomeListButton}>
        Next
      </Button>
    </section> : null
    }

  </>
  )
}

export const SearchOutcomeItem = (props) => {
  const router = useRouter();
  function goDetailPage() {
    router.push({
      pathname:`/${props.name}`,
      query: {
        symbol: props.symbol,
        name: props.name,
      }
    })
  }
  return (
    <div className={style.SearchOutcomeItemDiv}>
      <section>
        <label>Symbol: {props.symbol}</label>
        <label>Name: {props.name}</label>
      </section>
      <Button
      variant="outlined"
      onClick={goDetailPage}
      >
        View Detail
      </Button>
    </div>
  )
}