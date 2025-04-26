// "use client";
// import React, { useState, useEffect } from 'react';

// interface Location {
//   latitude: number;
//   longitude: number;
// }

// export default function Dashboard() {
//   const [location, setLocation] = useState<Location | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const requestLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           });
//           setError(null);
//         },
//         (err) => {
//           setError(err.message);
//           setLocation(null);
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by this browser.");
//     }
//   };

//   useEffect(() => {
//     requestLocation();
//   }, []);

//   return (
//     <div className="h-screen flex items-center justify-center">
//       {location ? (
//         <div className="text-center">
//           <p>Latitude: {location.latitude}</p>
//           <p>Longitude: {location.longitude}</p>
//         </div>
//       ) : error ? (
//         <div className="text-center">
//           <p className="text-red-500 mb-4">{error}</p>
//           <button
//             onClick={requestLocation}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Try Again
//           </button>
//         </div>
//       ) : (
//         <p>Requesting location...</p>
//       )}
//     </div>
//   );
// }

import DashboardPage from '@/features/users/components/dashboar-page'
import React from 'react'

export default function Page() {
  return (
    <DashboardPage />
  )
}
