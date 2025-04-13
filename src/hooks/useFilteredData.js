import { useMemo } from "react";
import useData from "./useData";
import { useFilter } from "../context/FilterContext";

const useFilteredData = () => {
  const data = useData();
  const { selectedArtists } = useFilter();

  const filteredData = useMemo(() => {
    if (!data) return null;
    return selectedArtists && selectedArtists.length > 0
      ? data.filter((track) => selectedArtists.includes(track.artist))
      : data;
  }, [data, selectedArtists]);

  return filteredData;
};

export default useFilteredData;
