const Dashboard = () => {
    const fakeReservations = [
      {
        id: 1,
        name: 'Max Mustermann',
        carPlate: 'BL AB 1234',
        date: '2025-06-22',
        time: '09:00',
        confirmed: true,
      },
      {
        id: 2,
        name: 'Anna Schmidt',
        carPlate: 'M XY 7890',
        date: '2025-06-23',
        time: '10:30',
        confirmed: false,
      },
    ];
  
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Reservierungen</h2>
  
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kennzeichen</th>
                <th>Datum</th>
                <th>Uhrzeit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fakeReservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.carPlate}</td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td>
                    {r.confirmed ? (
                      <span className="badge badge-success">Bestätigt</span>
                    ) : (
                      <span className="badge badge-warning">Offen</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  