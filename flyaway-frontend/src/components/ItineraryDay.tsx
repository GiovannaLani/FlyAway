import { AccordionItem, AccordionHeader, AccordionBody, Input, Button } from "reactstrap";
import classnames from "classnames";
import { useEffect, useState } from "react";
import client from "../api/client";

export type Activity = {
  id: number;
  name: string;
  startTime?: string;
  endTime?: string;
  place?: string;
  price?: number;
  description?: string;
  images?: string[];
};

export type Day = {
  id: number;
  date: string;
  destinationPlaceId?: string;
  destinationName?: string;
  activities: Activity[];
};

export type Recommendation = {
  name: string;
  type: string;
  image?: string;
  wiki_url?: string;
};

type Props = {
  day: Day;
  days: Day[];
  openDeleteModal: (id: number) => void;
  updateLocalDestination: (id: number, v: string, placeId: string) => void;
  saveDestination: (id: number, destinationId: string, destinationName: string) => void;
  selectedActivity: Activity | null;
  setSelectedActivity: (a: Activity) => void;
  addActivity: (day: Day) => void;
};

export default function ItineraryDay({ day, days, openDeleteModal, updateLocalDestination, saveDestination, selectedActivity, setSelectedActivity, addActivity }: Props) {
    const formatTime = (time?: string) => time ? time.slice(0, 5) : "";
    const isLastDay = (days: Day[], dayId: number) => days.at(-1)?.id === dayId;
    const isNotFirstDay = (days: Day[], dayId: number) => days[0]?.id !== dayId;

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [weather, setWeather] = useState<any>(null);

    const fetchWeather = async (placeId: string, date: string) => {
      try {
        const res = await client.get(
          `/external/weather/${placeId}?date=${date}`
        );
        setWeather(res.data);
      } catch (e) {
        setWeather({ available: false });
      }
    };

    function getWeatherUI(weathercode: number) {
      if ([0].includes(weathercode)) {
        return { icon: "bi-sun-fill", label: "Despejado" };
      }
      if ([1, 2].includes(weathercode)) {
        return { icon: "bi-cloud-sun-fill", label: "Parcialmente nublado" };
      }
      if ([3, 45, 48].includes(weathercode)) {
        return { icon: "bi-cloud-fill", label: "Nublado" };
      }
      if ([51, 53, 55, 61, 63, 65].includes(weathercode)) {
        return { icon: "bi-cloud-rain-fill", label: "Lluvia" };
      }
      if ([71, 73, 75, 77].includes(weathercode)) {
        return { icon: "bi-snow", label: "Nieve" };
      }
      if ([95, 96, 99].includes(weathercode)) {
        return { icon: "bi-cloud-lightning-fill", label: "Tormenta" };
      }

      return { icon: "bi-cloud", label: "Clima desconocido" };
    }

    function isPastDate(date: string) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      return d < today;
    }

    useEffect(() => {
      if (!day.destinationPlaceId) return;
      if (isPastDate(day.date)) {
        return;
      }
      fetchWeather(day.destinationPlaceId, day.date);
    }, [day.destinationPlaceId, day.date]);


    const searchPlaces = async (query: string) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await client.get("/external/places/search", { params: { q: query } });
            setSearchResults(res.data);
        } catch (err) {
            console.error("Error searching places", err);
        } finally {
            setIsSearching(false);
        }
    };
    
    return (
        <AccordionItem>
            <AccordionHeader targetId={day.id.toString()}>
                {new Date(day.date).toLocaleDateString()}
                {day.destinationName && ` - ${day.destinationName}`}
                {isLastDay(days, day.id) && isNotFirstDay(days, day.id) && (
                    <Button color="link" className="p-0 text-danger ms-2" onClick={e => { e.stopPropagation(); openDeleteModal(day.id); }}>
                        <i className="bi bi-trash-fill" />
                    </Button>
                )}
            </AccordionHeader>

            <AccordionBody accordionId={day.id.toString()}>
                <Input
                  id="search-input"
                  bsSize="sm"
                  className="mb-2"
                  placeholder="Ciudad / lugar principal"
                  value={searchValue}
                  onChange={e => {
                    const value = e.target.value;
                    setSearchValue(value);
                    searchPlaces(value);
                  }}
                />
                {isSearching && <small className="d-flex mb-3 justify-content-center">Buscando...</small>}

                {searchResults.length > 0 && (
                  <div className="border rounded bg-white mb-3">
                    {searchResults.map((place, idx) => (
                      <div
                        key={idx}
                        className="p-2 place-item"
                        style={{ cursor: "pointer" }}
                        onClick={async () => {
                          const res = await client.post("/external/places/select", {
                            name: place.name,
                            lat: place.lat,
                            lon: place.lon,
                            external_id: place.id.toString(),
                          });

                          const placeId = res.data._id;

                          updateLocalDestination(day.id, place.name, placeId);
                          setSearchValue("");
                          setSearchResults([]);

                          saveDestination(day.id, placeId , place.name);

                          if (!isPastDate(day.date)) {
                            fetchWeather(placeId, day.date);
                          } else {
                            setWeather({ available: false });
                          }
                        }}
                      >
                        {place.name}
                      </div>
                    ))}
                  </div>
                )}

                {weather && (
                  <div className="border rounded p-3 bg-light mb-3">
                    {weather.available ? (() => {
                      const ui = getWeatherUI(weather.weathercode);

                      return (
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <i className={`bi ${ui.icon}`} style={{ fontSize: "2rem" }} />
                            <div>
                              <div className="fw-semibold">{ui.label}</div>
                              <small className="text-muted">Previsión estimada</small>
                            </div>
                          </div>

                          <div className="text-end">
                            <div className="fw-semibold">
                              <i className="bi bi-arrow-up me-1"></i>
                              {weather.temp_max}°C
                            </div>
                            <div className="text-muted">
                              <i className="bi bi-arrow-down me-1"></i>
                              {weather.temp_min}°C
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="text-center text-muted">
                        <i className="bi bi-cloud-slash fs-4 d-block mb-1"></i>
                        <small>Previsión meteorológica no disponible</small>
                      </div>
                    )}
                  </div>
                )}

                {day.activities.map(activity => (
                    <div key={activity.id}
                        className={classnames("p-2 rounded mb-2", {
                            "bg-light": selectedActivity?.id === activity.id,
                        })}
                        style={{
                            cursor: "pointer",
                            border: "1px solid #dee2e6",
                        }}
                        onClick={() => setSelectedActivity(activity)}
                    >
                        <small className="text-muted">
                            {formatTime(activity.startTime)}
                            {activity.endTime && ` - ${formatTime(activity.endTime)}`}
                        </small>
                        <div>{activity.name}</div>
                    </div>
                ))}

                <Button size="sm" color="secondary" outline onClick={() => addActivity(day)} >
                    + Añadir actividad
                </Button>
            </AccordionBody>
        </AccordionItem>
    );
}