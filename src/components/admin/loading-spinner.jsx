// Loading component for admin sections
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="text-center py-20">
      <div className="text-white">{message}</div>
    </div>
  );
};

export default LoadingSpinner;
