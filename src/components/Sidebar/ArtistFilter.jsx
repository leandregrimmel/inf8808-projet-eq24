import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFilter } from "../../context/FilterContext";
import useData from "../../hooks/useData";

const ArtistFilter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [artists, setArtists] = useState([]);
  const dropdownRef = useRef(null);
  const { selectedArtists, setSelectedArtists } = useFilter();
  const data = useData();

  useEffect(() => {
    if (Array.isArray(data)) {
      const uniqueArtists = [...new Set(data.map((item) => item.artist))]
        .filter(
          (artist) =>
            typeof artist === "string" && /^[\p{L}0-9\s\-'/&]+$/u.test(artist)
        )
        .sort();

      setArtists(uniqueArtists);
    }
  }, [data]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const filteredArtists = artists.filter((artist) =>
    artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleArtist = (artist) => {
    if (selectedArtists.includes(artist)) {
      setSelectedArtists(selectedArtists.filter((a) => a !== artist));
    } else {
      setSelectedArtists([...selectedArtists, artist]);
    }
    setSearchQuery("");
  };

  const removeArtist = (artistToRemove) => {
    setSelectedArtists(selectedArtists.filter((artist) => artist !== artistToRemove));
  };

  const clearAllArtists = () => {
    setSelectedArtists([]);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un artiste..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {filteredArtists.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">Aucun artiste trouvé</div>
          ) : (
            filteredArtists.map((artist) => (
              <div
                key={artist}
                className={`relative cursor-pointer select-none px-4 py-2 ${
                  selectedArtists.includes(artist)
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => toggleArtist(artist)}
              >
                {artist}
                {selectedArtists.includes(artist) && (
                  <span className="absolute right-2 top-2 text-blue-500">✓</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {selectedArtists.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Artistes sélectionnés:
            </span>
            <button
              onClick={clearAllArtists}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Tout effacer
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedArtists.map((artist) => (
              <div
                key={artist}
                className="flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm text-blue-800"
              >
                {artist}
                <button
                  onClick={() => removeArtist(artist)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistFilter;