function Footer() {
    return (
      <div className="footer bg-dark text-light text-center py-3 mt-auto">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              <h5>Contact Us</h5>
              <ul className="list-unstyled">
                <li>Phone: 123-456-7890</li>
                <li>Email: contact@example.com</li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><a href="/home" className="text-light">Home</a></li>
                <li><a href="/about" className="text-light">About</a></li>
                <li><a href="/services" className="text-light">Services</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Address</h5>
              <ul className="list-unstyled">
                <li>123 Some Street</li>
                <li>Some City, Some Country</li>
              </ul>
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-0">&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }
  
  export default Footer;