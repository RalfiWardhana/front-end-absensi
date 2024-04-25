// components/Navigation.js
import { useState, useEffect } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'next/link';
import { useRouter } from 'next/router';

const Navigation = () => {
  const [expanded, setExpanded] = useState(false);
  const [userRole, setUserRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
    } else {
      const userRole = JSON.parse(atob(token.split('.')[1])).role;
      setUserRole(userRole);
    }

  }, []);

  return (
    <Navbar
      expanded={expanded}
      expand="lg"
      bg="dark"
      variant="dark"
    >
      <Navbar.Toggle onClick={() => setExpanded(!expanded)} aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center"> {/* Add className here */}
        <Nav className="ml-auto">
          <Navbar.Brand as={Link} href="/">
            Next.js Absents
          </Navbar.Brand>
          {userRole === 'admin' && (
            <>
              <Nav.Link as={Link} href="/absent-list">
                Absent List
              </Nav.Link>
              <Nav.Link as={Link} href="/employee-list">
                Employee List
              </Nav.Link>
            </>
          )}
          {userRole === 'user' && (
            <>
              <Nav.Link as={Link} href="/profile">
                Profile Employee
              </Nav.Link>
              <Nav.Link as={Link} href="/absent">
                Absent
              </Nav.Link>
              <Nav.Link as={Link} href="/summary-absent">
                Summary Absent
              </Nav.Link>
            </>
          )}
          <Nav.Link as={Link} href="/login">
            Log out
          </Nav.Link>

        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
