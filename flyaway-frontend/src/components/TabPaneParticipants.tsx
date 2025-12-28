import { useEffect, useState } from "react";
import AddParticipants from "./AddParticipants"
import ParticipantsList from "./ParticipantsList";
import client from "../api/client";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type Participant = {
    id: number;
    name: string;
    email: string;
    role: "admin" | "member";
};

type Friend = {
    id: number;
    name: string;
    email: string;
};

export default function TabPaneParticipants() {
    const nav = useNavigate();
    const { me } = useAuth();
    if (!me) return null;

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const { tripId: tripId } = useParams();
    const [friends, setFriends] = useState<Friend[]>([]);
    const currentUser = participants.find(p => p.id === me.id);
    const isAdmin = currentUser?.role === "admin";

    useEffect(() => {
        async function loadParticipants() {
            setLoading(true);
            try {
                const res = await client.get(`/trips/${tripId}/participants`);
                setParticipants(res.data);
            } catch (err: any) {
                alert(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        }
        loadParticipants();
    }, [tripId]);

    useEffect(() => {
        async function loadFriends() {
            try {
                const res = await client.get("/users/friends");
                setFriends(res.data);
            } catch (err: any) {
                alert(err.response?.data?.message || err.message);
            }
        }
        loadFriends();
    }, []);

    const changeRole = async (userId: number, newRole: "admin" | "member") => {
        try {
            await client.patch(`/trips/${tripId}/participants/${userId}/role`, { role: newRole } );
            setParticipants(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p ));
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const addParticipant = async (friend: Friend) => {
        try {
            await client.post(`/trips/${tripId}/participants`, {email: friend.email});
            setParticipants(prev => [...prev, { ...friend, role: "member" }]);
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const removeParticipant = async (userId: number) => {
        try {
            await client.delete(`/trips/${tripId}/participants/${userId}`);
            setParticipants(prev => prev.filter(p => p.id !== userId));
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const leaveTrip = async () => {
        try {
            await client.delete(`/trips/${tripId}/participants/${me.id}`);
            nav("/trips");
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div>
            {isAdmin && (
                <>
                    <h5>Añadir participantes</h5>
                    <AddParticipants friends={friends} excludedIds={participants.map(p => p.id)} onAdd={addParticipant} />
                    <hr />
                </>
            )}

            <h5>Participantes</h5>
            {loading ? ( <p>Cargando participantes...</p> ) : (
                <ParticipantsList participants={participants} currentUserId={me.id} onChangeRole={(userId, role) => changeRole(userId, role)} onRemove={removeParticipant}  onLeave={leaveTrip}/>
            )}
        </div>
    );
}
