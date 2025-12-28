import EditActivity from "./EditActivity";
import ViewActivity from "./ViewActivity";

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

type Props = {
  selectedActivity: Activity | null;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  saveActivity: any;
  deleteActivity: () => void;
  updateActivityInDays: (a: Activity) => void;
  setSelectedActivity: React.Dispatch<React.SetStateAction<Activity | null>>;
};

export default function ActivityPanel({ selectedActivity, isEditing, setIsEditing, saveActivity, deleteActivity, updateActivityInDays, setSelectedActivity }: Props) {
  
    if (!selectedActivity)
        return <p className="text-muted">Selecciona una actividad</p>;

    return isEditing ? (
        <EditActivity activity={selectedActivity} onCancel={() => setIsEditing(false)} onSave={saveActivity} onDelete={deleteActivity}/>
    ) : (
        <ViewActivity activity={selectedActivity} onEdit={() => setIsEditing(true)} setSelectedActivity={setSelectedActivity} updateActivityInDays={updateActivityInDays}/>
    );
}