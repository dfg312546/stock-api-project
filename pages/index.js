import { useState,useContext } from "react";
import { useRouter } from "next/router";
import { Context } from "@/context/context";
import { TextField,Button } from "@mui/material";
import style from '../styles/Home.module.css'

const apiKey = 'QXqHO13HVjyg9sYe0EhGdBXs5dVcTOEm'

export default function Home(props) {
  const Ctx = useContext(Context)
  // console.log(props.initialETFList)

  async function searchETFHandler(userInputKeyword) {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/search?query=${userInputKeyword}&apikey=${apiKey}`)
    const data = await response.json();
    const filteredData = await data.map(item => ({
      name: item.name,
      symbol: item.symbol
    }))
    Ctx.setFilteredData(filteredData);
    console.log(filteredData)
    return filteredData
  }

  return (
  <>
  <SearchInput searchETFHandler={searchETFHandler}/>
  <SearchOutcomeList/>
  </>
  )
}


// export async function getStaticProps() {
//   try {
//     const response = await fetch (`https://financialmodelingprep.com/api/v3/etf/list?&apikey=${apiKey}`,{
//       method: 'GET',
//     });
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const data = await response.json();
//     const filteredData = data.map(item => ({
//       name: item.name,
//       price: item.price,
//       symbol: item.symbol
//     }))

//     return {
//       props: {
//         initialETFList: filteredData,
//       },
//     };
//   } catch (error) {
//     console.error('There was a problem with the fetch operation:', error);
//     return {
//       props: {
//         initialData: [],
//       },
//     };
//   }
// }

//


export const SearchInput = (props) => {
  const [userInputKeyword,setUserInputKeyword] = useState('');

  return (
    <div className={style.SearchInputDiv}>
    <h2>Search ticker with keywords</h2>
    <form onSubmit={(event) => {
      event.preventDefault();
      props.searchETFHandler(userInputKeyword);
      setUserInputKeyword('')
      }}>
      <TextField
        className={style.SearchInputFormTextField}
        label="Symbol of Ticker"
        color="primary"
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

export const SearchOutcomeList = () => {
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
    { currentData.length !==0 ?
    <section>
      <Button variant="contained" onClick={prevPage} disabled={currentPage === 1}>
        Previous
      </Button>
      {currentPage}
      <Button variant="contained" onClick={nextPage} disabled={currentPage === totalPages}>
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