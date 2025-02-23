import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">Advanced Meet</Link>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:text-gray-200">Home</Link>
          <Link to="/meeting" className="text-white hover:text-gray-200">Join Meeting</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;