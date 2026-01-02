import { useEffect, useState } from "react";
import client from "../api/client";

export type Recommendation = {
  name: string;
  type: string;
  lat?: number;
  lon?: number;
  image?: string;
  wiki_url?: string;
};

type Props = {
  placeId?: string | null;
};

export default function RecommendationsPanel({ placeId }: Props) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!placeId) {
        setRecommendations([]);
        return;
        }

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            console.log("Fetching recommendations for placeId:", placeId);
            const res = await client.get(`/external/recommendations/${placeId}`);
            setRecommendations(res.data.items || []);
        } catch (err) {
            console.error("Error fetching recommendations:", err);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    fetchRecommendations();
  }, [placeId]);

  if (!placeId) return null;

  return (
    <div className="border rounded p-3 bg-white mt-3">
        <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
            <i className="bi bi-map-fill text-primary"></i>
            Recomendaciones
        </div>

        {loading ? (
            <p className="text-center text-muted">Cargando recomendaciones...</p>
        ) : recommendations.length === 0 ? (
            <p className="text-center text-muted">No hay recomendaciones disponibles</p>
        ) : (
            <div className="row g-2">
            {recommendations.map((rec, idx) => (
                <div key={idx} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                    {rec.image ? (
                    <img src={rec.image} className="card-img-top" alt={rec.name} style={{ height: "150px", objectFit: "cover" }}/>
                    ) : (
                    <div className="d-flex align-items-center justify-content-center bg-secondary text-white" style={{ height: "150px" }} >
                        <i className="bi bi-image fs-1"></i>
                    </div>
                    )}
                    <div className="card-body p-2">
                    <h6 className="card-title mb-1">{rec.name}</h6>
                    <small className="text-muted">{rec.type}</small>
                    </div>
                    {rec.wiki_url && (
                    <div className="card-footer p-1 text-end">
                        <a href={rec.wiki_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                        Más info
                        </a>
                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
    </div>
  );
}