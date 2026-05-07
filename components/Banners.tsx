"use client";
import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";

type Banner = {
  _id?: string;
  desktopImage: string;
  mobileImage: string;
  isActive: boolean;
};

type FieldProps = { label: string; children: ReactNode };

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([
    { desktopImage: "", mobileImage: "", isActive: true },
    { desktopImage: "", mobileImage: "", isActive: true },
    { desktopImage: "", mobileImage: "", isActive: true },
  ]);
  const [loading, setLoading] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; 

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${api}/banner`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.banners && data.banners.length > 0) {
        // Pad or trim to exactly 3 banners
        const fetchedBanners = data.banners;
        const newBanners = [
          fetchedBanners[0] || { desktopImage: "", mobileImage: "", isActive: true },
          fetchedBanners[1] || { desktopImage: "", mobileImage: "", isActive: true },
          fetchedBanners[2] || { desktopImage: "", mobileImage: "", isActive: true },
        ];
        setBanners(newBanners);
      }
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      // Optional: alert("Could not connect to the backend server.");
    }
  }, [api]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    
    setBanners(prev => {
      const newBanners = [...prev];
      if (type === "desktop") {
        newBanners[index].desktopImage = b64;
      } else {
        newBanners[index].mobileImage = b64;
      }
      return newBanners;
    });
  };

  const saveBanners = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("token") || "";
      const res = await fetch(`${api}/banner/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authToken },
        body: JSON.stringify({ banners }),
      });
      if (res.ok) {
        alert("Banners updated successfully!");
        fetchBanners();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update banners");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number, type: "desktop" | "mobile") => {
    setBanners(prev => {
      const newBanners = [...prev];
      if (type === "desktop") {
        newBanners[index].desktopImage = "";
      } else {
        newBanners[index].mobileImage = "";
      }
      return newBanners;
    });
  };

  return (
    <div>
      <style>{`
        .card { background: #13131a; border: 1px solid #1e1e2e; border-radius: 12px; }
        .btn-primary { background: #db2777; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-primary:hover { background: #be185d; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #555570; border: 1px solid #1e1e2e; border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; }
        .btn-ghost:hover { color: #ef4444; border-color: #ef444440; }
        .upload-input { display: none; }
        .banner-slot { padding: 24px; margin-bottom: 24px; }
        .banner-images-container { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .image-box { flex: 1; min-width: 280px; border: 1px dashed #2a2a35; border-radius: 8px; padding: 16px; text-align: center; position: relative; }
        .preview-img { width: 100%; height: 160px; object-fit: cover; border-radius: 6px; }
        .remove-btn { position: absolute; top: 24px; right: 24px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; }
        .remove-btn:hover { background: #ef4444; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12, width: "100%" }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: "#e8e8f0", margin: 0 }}>Manage Banners</h1>
          <p style={{ fontSize: 13, color: "#44445a", margin: "4px 0 0 0" }}>Upload exactly 3 banners for the homepage hero slider.</p>
        </div>
        <button className="btn-primary" onClick={saveBanners} disabled={loading}>
          {loading ? "Saving..." : "Save All Banners"}
        </button>
      </div>

      {/* 3 Banner Slots */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {banners.map((banner, index) => (
          <div key={index} className="card banner-slot">
            <h2 style={{ color: "#e8e8f0", fontSize: "18px", margin: "0 0 8px 0" }}>Banner {index + 1}</h2>
            
            <div className="banner-images-container">
              {/* Desktop */}
              <div className="image-box">
                <Field label="Desktop Image (1920x800px)">
                  {banner.desktopImage ? (
                    <div style={{ position: "relative", marginTop: "12px" }}>
                      <Image src={banner.desktopImage} alt="Desktop" width={400} height={160} className="preview-img" unoptimized />
                      <button className="remove-btn" onClick={() => removeImage(index, "desktop")}>✕</button>
                    </div>
                  ) : (
                    <label style={{ cursor: "pointer", display: "block", padding: "40px 0", marginTop: "12px", background: "#1a1a24", borderRadius: "6px" }}>
                      <div style={{ fontSize: 13, color: "#555570", fontWeight: 500 }}>📁 Click to upload Desktop</div>
                      <input className="upload-input" type="file" accept="image/*" onChange={(e) => handleFile(e, index, "desktop")} />
                    </label>
                  )}
                </Field>
              </div>

              {/* Mobile */}
              <div className="image-box">
                <Field label="Mobile Image (800x1200px)">
                  {banner.mobileImage ? (
                    <div style={{ position: "relative", marginTop: "12px" }}>
                      <Image src={banner.mobileImage} alt="Mobile" width={200} height={160} className="preview-img" style={{ objectFit: 'contain' }} unoptimized />
                      <button className="remove-btn" onClick={() => removeImage(index, "mobile")}>✕</button>
                    </div>
                  ) : (
                    <label style={{ cursor: "pointer", display: "block", padding: "40px 0", marginTop: "12px", background: "#1a1a24", borderRadius: "6px" }}>
                      <div style={{ fontSize: 13, color: "#555570", fontWeight: 500 }}>📱 Click to upload Mobile</div>
                      <input className="upload-input" type="file" accept="image/*" onChange={(e) => handleFile(e, index, "mobile")} />
                    </label>
                  )}
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: FieldProps) {
  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#8f8fb1" }}>{label}</div>
      {children}
    </div>
  );
}
