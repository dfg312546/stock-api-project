import { createContext,useState } from 'react';


export const Context = createContext({
  filteredData:[],
  setFilteredData:() => {},
});

function ContextProvider(props) {
  const [filteredData,setFilteredData] = useState([])

  const context = {
    filteredData: filteredData,
    setFilteredData: setFilteredData,
  }

  return (
    <>
      <Context.Provider value={context}>
        {props.children}
      </Context.Provider>
    </>
  )
}

export default ContextProvider;