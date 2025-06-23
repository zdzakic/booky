import BookingForm from "../components/BookingForm";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="card w-full max-w-md bg-white shadow-xl border border-secondary p-6">
        <h1 className="text-3xl font-bold text-secondary mb-4">Buchung starten</h1>
        <BookingForm />
      </div>
    </div>
  );
};

export default Home;
