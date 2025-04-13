import { useMemo } from "react";
import useData from "./useData";
import { useFilter } from "../context/FilterContext";

const useFilteredData = () => {
  const data = useData();
  const { selectedArtist } = useFilter();

  const filteredData = useMemo(() => {
    if (!data) return null;
    return selectedArtist
      ? data.filter((track) => track.artist === selectedArtist)
      : data;
  }, [data, selectedArtist]);

  return filteredData;
};

export default useFilteredData;
