import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedArtists, setSelectedArtists] = useState([]);
  
  return (
    <FilterContext.Provider value={{ selectedArtists, setSelectedArtists }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);