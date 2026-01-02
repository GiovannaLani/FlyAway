import { useEffect, useState } from "react";
import { Row, Col, Accordion, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import client from "../api/client";
import ItineraryDay from "./ItineraryDay";
import ActivityPanel from "./ActivityPanel";
import RecommendationsPanel from "./RecommendationsPanel";

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

type Props = {
  tripId: number;
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  loading: boolean;
};

export default function TabPaneItinerary({ tripId, days, setDays, loading}: Props) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [openDays, setOpenDays] = useState<string[]>([]);
  const [deleteDayId, setDeleteDayId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const startDate = days[0]?.date;
  const endDate = days.at(-1)?.date;
  const [editingStart, setEditingStart] = useState(false);
  const [newStartDate, setNewStartDate] = useState(startDate);

  useEffect(() => {
    if (startDate) setNewStartDate(startDate);
  }, [startDate]);

  const toggleDay = (id: string) => {
    setOpenDays(prev =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const openDeleteModal = (id: number) => setDeleteDayId(id);
  const closeDeleteModal = () => setDeleteDayId(null);

  const addDay = async () => {
    if (!days.length) return;

    const nextDate = addOneDay(days.at(-1)!.date);
    const res = await client.post(`/itinerary/trips/${tripId}/days`,{ date: nextDate });
    setDays(prev => [...prev, { ...res.data, activities: [] }]);
    setOpenDays(prev => [...prev, res.data.id.toString()]);
  };

  const addOneDay = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const deleteDay = async () => {
    if (!deleteDayId) return;

    await client.delete(`/itinerary/days/${deleteDayId}`);
    setDays(prev => prev.slice(0, -1));
    setOpenDays(prev => prev.filter(id => id !== deleteDayId.toString()));
    closeDeleteModal();
  };

  const updateLocalDestination = (id: number, value: string, placeId: string) => {
    setDays(prev =>prev.map(d => d.id === id ? { ...d, destinationName: value, destinationPlaceId: placeId } : d));
  };

  const saveDestination = async (id: number, destinationPlaceId: string, destinationName: string) => {
    await client.patch(`/itinerary/days/${id}`, { destinationPlaceId: destinationPlaceId, destinationName: destinationName } );
  };

  const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + minutes, 0, 0);
  
    return `${String(date.getHours()).padStart(2, "0")}:${String( date.getMinutes() ).padStart(2, "0")}`;
  };

  const getNextActivityTimes = (activities: Activity[]) => {
    if (activities.length === 0) {
      return { startTime: "00:00", endTime: "00:30" };
    }

    const last = [...activities].sort((a, b) => (a.endTime ?? "").localeCompare(b.endTime ?? "")).at(-1)!;

    const start = last.endTime ?? "00:00";
    let end = addMinutes(start, 30);
    if (end > "23:59") end = "23:59";

    return { startTime: start, endTime: end };
  };

  const addActivity = async (day: Day) => {
    const { startTime, endTime } = getNextActivityTimes(day.activities);

    const res = await client.post( `/itinerary/days/${day.id}/activities`,
      {
        name: `Actividad ${day.activities.length + 1}`,
        startTime,
        endTime,
      }
    );

    setDays(prev => prev.map(d =>d.id === day.id ? { ...d, activities: [...d.activities, res.data] } : d));
    setSelectedActivity(res.data);
    setIsEditing(true);
  };

  const saveActivity = async ( data: Partial<Activity>, images?: File[]
  ) => {
    if (!selectedActivity) return;

    await client.patch(`/itinerary/activities/${selectedActivity.id}`, data);
    const updated = { ...selectedActivity, ...data };

    setSelectedActivity(updated);
    setDays(prev =>
      prev.map(day => ({
        ...day,
        activities: day.activities.map(act =>
          act.id === updated.id ? updated : act
        ),
      }))
    );

    if (images?.length) {
      const fd = new FormData();
      images.forEach(i => fd.append("images", i));
      await client.post(
        `/itinerary/activities/${updated.id}/images`,
        fd
      );
    }

    setIsEditing(false);
  };

  const deleteActivity = async () => {
    if (!selectedActivity) return;

    await client.delete(`/itinerary/activities/${selectedActivity.id}`);
    setDays(prev =>
      prev.map(day => ({
        ...day,
        activities: day.activities.filter(
          a => a.id !== selectedActivity.id
        ),
      }))
    );

    setSelectedActivity(null);
    setIsEditing(false);
  };

  const updateActivityInDays = (updated: Activity) => {
    setDays(prev =>
      prev.map(day => ({
        ...day,
        activities: day.activities.map(act =>
          act.id === updated.id ? updated : act
        ),
      }))
    );
  };

  return (
    <Row>
      <Col md={4} className="itinerary-scroll">
        <div className="mb-3 text-center">
          {!editingStart ? (
            <>
              <small className="text-muted">
                {startDate && new Date(startDate).toLocaleDateString()}
                {" "}–{" "}
                {endDate && new Date(endDate).toLocaleDateString()}
              </small>
              <Button size="sm" color="link" onClick={() => setEditingStart(true)}>
                <i className="bi bi-pencil-fill" />
              </Button>
            </>
          ) : (
            <div className="d-flex gap-2">
              <Input type="date" bsSize="sm" value={newStartDate} onChange={e => setNewStartDate(e.target.value)}/>
              <Button size="sm" color="primary"
                onClick={async () => {
                  await client.patch( `/trips/${tripId}/start-date`, { startDate: newStartDate } );
                  const diff = (new Date(newStartDate).getTime() - new Date(startDate!).getTime()) / 86400000;

                  setDays(prev =>
                    prev.map(d => {
                      const date = new Date(d.date);
                      date.setDate(date.getDate() + diff);
                      return {...d,date: date.toISOString().split("T")[0],
                      };
                    })
                  );

                  setEditingStart(false);
                }}
              >
                Guardar
              </Button>
              <Button size="sm" outline onClick={() => { setNewStartDate(startDate); setEditingStart(false); }}>
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {loading ? ( <p>Cargando días...</p>
        ) : (
          <Accordion open={openDays} toggle={toggleDay} flush >
            {days.map(day => (
              <ItineraryDay
                key={day.id}
                day={day}
                days={days}
                openDeleteModal={openDeleteModal}
                updateLocalDestination={
                  updateLocalDestination
                }
                saveDestination={saveDestination}
                selectedActivity={selectedActivity}
                setSelectedActivity={a => {
                  setSelectedActivity(a);
                  setIsEditing(false);
                }}
                addActivity={addActivity}
              />
            ))}
            <Button size="sm" outline className="w-100 mt-3" onClick={addDay}>
              + Añadir día
            </Button>
          </Accordion>
        )}
      </Col>

      <Col md={8}>
        <div>
          <ActivityPanel
            selectedActivity={selectedActivity}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            saveActivity={saveActivity}
            deleteActivity={deleteActivity}
            updateActivityInDays={updateActivityInDays}
            setSelectedActivity={setSelectedActivity}
          />
        </div>
      </Col>
      {selectedActivity && (() => {
        console.log("Selected Activity:", selectedActivity);
        const dayOfSelectedActivity = days.find(d => {
          console.log("Checking day:", d);
          return d.activities.some(a => a.id === selectedActivity.id);
        });
        console.log("Day of Selected Activity:", dayOfSelectedActivity);

        return dayOfSelectedActivity?.destinationPlaceId ? (
          <RecommendationsPanel placeId={dayOfSelectedActivity.destinationPlaceId} />
        ) : null;
      })()}

      <Modal isOpen={deleteDayId !== null} toggle={closeDeleteModal} centered>
        <ModalHeader toggle={closeDeleteModal}>
          Eliminar día
        </ModalHeader>
        <ModalBody>
          ¿Seguro que quieres eliminar el último día del viaje?
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button color="danger" onClick={deleteDay}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </Row>
  );
}
