import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Hapus token dari local storage jika ada
    localStorage.removeItem('token');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3020/users/login', {
        email,
        password,
      });

      if (response.status === 200) {
        // Simpan token ke local storage
        localStorage.setItem('token', response.data.token);

        // Redirect ke halaman profil jika login berhasil
        router.push('/profile');
      } else {
        // Tampilkan pesan error jika login gagal
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="text-center mt-5">
      <ToastContainer />
      <h1>Login</h1>
      <p>Please sign in to continue.</p>
      <Form onSubmit={handleSubmit} className="card bg-light p-3 mx-auto" style={{ maxWidth: '300px' }}>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" className="btn btn-primary mt-3">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
