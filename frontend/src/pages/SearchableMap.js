
// import React, { useState } from "react";
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// // Fix default marker issue in Leaflet
// import L from "leaflet";
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// function LocationMarker({ setLocation }) {
//   const [position, setPosition] = useState(null);

//   useMapEvents({
//     async click(e) {
//       setPosition(e.latlng);

//       // Reverse geocode to get area name
//       try {
//         const res = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
//         );
//         const data = await res.json();

//         const address = data.display_name || `${e.latlng.lat}, ${e.latlng.lng}`;
//         setLocation(address);
//       } catch (err) {
//         console.error("Error fetching address:", err);
//         setLocation(`${e.latlng.lat}, ${e.latlng.lng}`);
//       }
//     },
//   });

//   return position === null ? null : <Marker position={position} />;
// }

// function SearchableMap({ setLocation }) {
//   return (
//     <MapContainer
//       center={[20.5937, 78.9629]} // Center India
//       zoom={5}
//       style={{ height: "300px", width: "100%", marginTop: "10px" }}
//     >
//       <TileLayer
//         attribution="&copy; OpenStreetMap contributors"
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       <LocationMarker setLocation={setLocation} />
//     </MapContainer>
//   );
// }

// export default SearchableMap;
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      setPosition(e.latlng);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
        );
        const data = await res.json();

        let address = data.display_name || `${e.latlng.lat}, ${e.latlng.lng}`;

        // ✅ Always force string
        if (Array.isArray(address)) {
          address = address.join(", ");
        }

        setLocation({
          address: String(address),
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      } catch (err) {
        console.error("Error fetching address:", err);
        setLocation({
          address: `${e.latlng.lat}, ${e.latlng.lng}`,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function SearchableMap({ setLocation }) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Center India
      zoom={5}
      style={{ height: "300px", width: "100%", marginTop: "10px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setLocation={setLocation} />
    </MapContainer>
  );
}

export default SearchableMap;
