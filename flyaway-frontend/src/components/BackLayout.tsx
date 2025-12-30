import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

export default function BackLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <div className="mb-3 d-flex justify-content-start">
        <Button color="link" className="p-0 text-decoration-none" onClick={() => navigate(-1)} >
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>
      </div>

      {children}
    </div>
  );
}