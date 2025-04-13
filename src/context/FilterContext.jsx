import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  
  return (
    <FilterContext.Provider value={{ selectedArtist, setSelectedArtist }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);