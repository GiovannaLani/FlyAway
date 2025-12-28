import { AccordionItem, AccordionHeader, AccordionBody, Input, Button } from "reactstrap";
import classnames from "classnames";

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
  destination?: string;
  activities: Activity[];
};

type Props = {
  day: Day;
  days: Day[];
  openDeleteModal: (id: number) => void;
  updateLocalDestination: (id: number, v: string) => void;
  saveDestination: (id: number, v: string) => void;
  selectedActivity: Activity | null;
  setSelectedActivity: (a: Activity) => void;
  addActivity: (day: Day) => void;
};

export default function ItineraryDay({ day, days, openDeleteModal, updateLocalDestination, saveDestination, selectedActivity, setSelectedActivity, addActivity }: Props) {
    const formatTime = (time?: string) => time ? time.slice(0, 5) : "";
    const isLastDay = (days: Day[], dayId: number) => days.at(-1)?.id === dayId;
    const isNotFirstDay = (days: Day[], dayId: number) => days[0]?.id !== dayId;
    
    return (
        <AccordionItem>
            <AccordionHeader targetId={day.id.toString()}>
                {new Date(day.date).toLocaleDateString()}
                {day.destination && ` - ${day.destination}`}
                {isLastDay(days, day.id) && isNotFirstDay(days, day.id) && (
                    <Button color="link" className="p-0 text-danger ms-2" onClick={e => { e.stopPropagation(); openDeleteModal(day.id); }}>
                        <i className="bi bi-trash-fill" />
                    </Button>
                )}
            </AccordionHeader>

            <AccordionBody accordionId={day.id.toString()}>
                <Input value={day.destination ?? ""} bsSize="sm" className="mb-2" placeholder="Ciudad / lugar principal"
                    onChange={e =>
                        updateLocalDestination(day.id, e.target.value)
                    }
                    onBlur={e =>
                        saveDestination(day.id, e.target.value)
                    }
                />

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