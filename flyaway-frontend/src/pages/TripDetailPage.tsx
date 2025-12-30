import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import client from "../api/client";
import TabPaneParticipants from "../components/TabPaneParticipants";
import TabPaneItinerary from "../components/TabPaneItinerary";
import TabPaneImages from "../components/TabPaneImages";
import TabPaneSettings from "../components/TabPaneSettings";

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [activeTab, setActiveTab] = useState<string>("");
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<"admin" | "member" | null>(null);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canViewItinerary: false,
    canViewParticipants: false,
    canViewImages: false,
    canViewExpenses: false,
  });

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await client.get(`/trips/${tripId}`);
        setTripName(res.data.name);
        setDescription(res.data.description || "");
        setIsPublic(res.data.isPublic);
        setImageUrl(res.data.imageUrl);
        setRole(res.data.role);
        setTripName(res.data.name);
        setPermissions(res.data.permissions);
      } catch (err: any) {
        alert(err.response?.data?.message || err.message);
      }
    }

    async function fetchItinerary() {
      setLoading(true);
      try {
        const res = await client.get(`/itinerary/trips/${tripId}/itinerary`);
        setDays(res.data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (tripId) {
      fetchTrip();
      fetchItinerary();
    }
  }, [tripId]);

  useEffect(() => {
    const firstTab = permissions.canViewItinerary
      ? "itinerary"
      : permissions.canViewParticipants
      ? "participants"
      : permissions.canViewImages
      ? "images"
      : permissions.canViewExpenses
      ? "expenses"
      : "";

    setActiveTab(firstTab);
  }, [permissions]);

  if (!tripId) return <p>ID del viaje no encontrado</p>;

  return (
    <div className="container mt-4 pb-4">
      
      <h1 className="text-center mb-4">{tripName || "Cargando..."}</h1>
      <Nav tabs>
        {permissions.canViewItinerary && (
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "itinerary" })} onClick={() => setActiveTab("itinerary")} style={{ cursor: "pointer" }} >
              Itinerario
            </NavLink>
          </NavItem>
        )}

        {permissions.canViewParticipants && (
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "participants" })} onClick={() => setActiveTab("participants")} style={{ cursor: "pointer" }} >
              Participantes
            </NavLink>
          </NavItem>
        )}

        {permissions.canViewExpenses && (
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "expenses" })} onClick={() => setActiveTab("expenses")} style={{ cursor: "pointer" }} >
              Gastos
            </NavLink>
          </NavItem>
        )}

        {permissions.canViewImages && (
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "images" })} onClick={() => setActiveTab("images")} style={{ cursor: "pointer" }} >
              Imágenes
            </NavLink>
          </NavItem>
        )}

        {role === "admin" && permissions.canEdit && (
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "settings" })} onClick={() => setActiveTab("settings")} style={{ cursor: "pointer" }} >
              Ajustes
            </NavLink>
          </NavItem>
        )}
      </Nav>

      <TabContent activeTab={activeTab} className="mt-4">
        <TabPane tabId="itinerary">
          <TabPaneItinerary tripId={Number(tripId)} days={days} setDays={setDays} loading={loading}/>
        </TabPane>

        <TabPane tabId="participants">
          <TabPaneParticipants />
        </TabPane>

        <TabPane tabId="expenses">
          <p>Gastos (pendiente)</p>
        </TabPane>

        <TabPane tabId="images">
          <TabPaneImages days={days} />
        </TabPane>

        <TabPane tabId="settings">
          <TabPaneSettings tripId={Number(tripId)} tripName={tripName} setTripName={setTripName} description={description} setDescription={setDescription} isPublic={isPublic} setIsPublic={setIsPublic} imageUrl={imageUrl} />
        </TabPane>
      </TabContent>
    </div>
  );
}