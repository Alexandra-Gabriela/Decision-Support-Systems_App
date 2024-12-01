import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import ModalCartograma from './ModalCartograma';
import FilterModal from './FilterModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Cartograma = () => {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    const exampleSalesData = [
      { id: 'Moldova', name: 'Moldova', coords: [45.5, 27.5], productType: 'Skincare', gender: 'Female', salesAmount: 100 },
      { id: 'Banat', name: 'Banat', coords: [45.7495, 21.2087], productType: 'Makeup', gender: 'Male', salesAmount: 200 },
      { id: 'Muntenia', name: 'Muntenia', coords: [44.4268, 26.1025], productType: 'Fragrance', gender: 'Female', salesAmount: 300 },
      { id: 'Dobrogea', name: 'Dobrogea', coords: [44.035, 28.66], productType: 'Nails', gender: 'Male', salesAmount: 150 },
      { id: 'Ardeal', name: 'Ardeal', coords: [46.7704, 23.5897], productType: 'Skincare', gender: 'Female', salesAmount: 180 },
      { id: 'Maramureș', name: 'Maramureș', coords: [47.6462, 24.3817], productType: 'Makeup', gender: 'Male', salesAmount: 220 },
      { id: 'Bucovina', name: 'Bucovina', coords: [47.6401, 25.5889], productType: 'Fragrance', gender: 'Female', salesAmount: 250 },
      { id: 'Transilvania', name: 'Transilvania', coords: [46.1, 25], productType: 'Nails', gender: 'Male', salesAmount: 170 },
    ];
    setSalesData(exampleSalesData);
    setFilteredData(exampleSalesData);
  }, []);

  // Aplică filtrele din modal
  const handleApplyFilters = (filters) => {
    let data = salesData;

    if (filters.date) {
      data = data.filter((sale) => sale.date === filters.date);
    }
    if (filters.productType) {
      data = data.filter((sale) => sale.productType === filters.productType);
    }
    if (filters.gender) {
      data = data.filter((sale) => sale.gender === filters.gender);
    }

    setFilteredData(data);
  };

  // Exportă datele în Excel (simulare)
  const handleExportExcel = () => {
    alert('Exporting data to Excel...');
    setExportModalOpen(false);
  };

  return (
    <div>
      <h2>Harta Vânzărilor</h2>

      {/* Butoane pentru filtre și export */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setFilterModalOpen(true)}>Filtrează Date</button>
        <button onClick={() => setExportModalOpen(true)}>Exportă Date</button>
      </div>

      {/* Harta */}
      <MapContainer center={[45.9432, 24.9668]} zoom={6} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        {/* Marker pentru fiecare locație */}
        {filteredData.map((sale) => (
          <Marker
            key={sale.id}
            position={sale.coords}
            icon={new L.Icon({
              iconUrl: 'https://example.com/push-pin.png', // Înlocuiește cu URL-ul corect al imaginii
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            })}
          >
            <Popup>
              <strong>Regiune:</strong> {sale.name} <br />
              <strong>Produs:</strong> {sale.productType} <br />
              <strong>Gen:</strong> {sale.gender} <br />
              <strong>Vânzări:</strong> {sale.salesAmount} <br />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal pentru filtre */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Modal pentru export */}
      <ModalCartograma
        isOpen={isExportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExportExcel={handleExportExcel}
        jsonData={filteredData}
      />
    </div>
  );
};

export default Cartograma;
