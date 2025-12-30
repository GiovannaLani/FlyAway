import { useEffect, useState } from "react";
import client from "../api/client";
import ProfileHeader from "../components/ProfileHeader";
import TripsGrid from "../components/TripsGrid";
import { useParams } from "react-router-dom";

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [friendStatus, setFriendStatus] = useState< "me" | "friend" | "requested" | "none" >("none");

  useEffect(() => {
    async function load() {
      const u = await client.get(`/users/${userId}`);
      setUser(u.data);
      const t = await client.get(`/users/${userId}/trips`);
      setTrips(t.data);
      setFriendStatus(u.data.friendStatus);
    }
    load();
  }, [userId]);

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="container mt-4">
      <ProfileHeader user={user} friendStatus={friendStatus} setFriendStatus={setFriendStatus} />
      <hr />
      <TripsGrid trips={trips} canCreate={friendStatus === "me"} />
    </div>
  );
}