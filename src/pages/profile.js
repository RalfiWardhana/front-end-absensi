import Layout from '../components/Layout';
import Navigation from '../components/Navbar';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profil = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    photo: '',
    position: '',
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mendapatkan token dari localStorage
        const token = localStorage.getItem('token');
        if (token) {
          // Mendapatkan ID dari token
          const userId = JSON.parse(atob(token.split('.')[1])).id;
          const response = await axios.get(`http://localhost:3020/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const userData = response.data.user;
          setUser(userData);
          setFormData(userData); // Mengatur data pengguna sebagai nilai awal formData
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Mengatur data pengguna sebagai nilai awal formData setiap kali user berubah
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
        position: user.position,
      });
    }
  }, [user]);

  useEffect(() => {
    // Mengatur password dalam formData setiap kali newPassword berubah
    setFormData((prevData) => ({
      ...prevData,
      password: newPassword
    }));
  }, [newPassword]);

  const handleShow = () => {
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      photo: file, // Menyimpan file gambar dalam formData
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      let userData = { ...formData };
      delete userData._id; // Hapus _id dari userData
  
      if (userData.photo && formData.photo instanceof File) {
        // Hanya panggil API upload jika ada file yang diunggah
        const uploadData = new FormData();
        uploadData.append('photo', userData.photo); // Menggunakan 'photo' sebagai nama field
        const uploadResponse = await axios.post('http://localhost:3020/users/upload', uploadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
  
        // Mengganti nama foto dengan nama yang dikembalikan oleh API upload
        userData.photo = uploadResponse.data.fileName;
      }

      // Kirim data pengguna yang diperbarui ke server
      await axios.put(`http://localhost:3020/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Ambil data pengguna yang diperbarui
      const response = await axios.get(`http://localhost:3020/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedUser = response.data.user;
      setUser(updatedUser);
      setNewPassword('')
      setShowModal(false);
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error("Failed to update user data");
    }
  };
  

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.1)',
  };

  const nameStyles = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0',
  };

  const positionStyles = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '0',
  };

  const emailStyles = {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '1rem',
  };

  const phoneStyles = {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '1rem',
  };

  const photoStyles = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '1rem',
  };

  return (
    <Layout>
      <Navigation />
      <Container className="mt-5">
        <Row>
          <Col>
            <div style={containerStyles}>
              {user && (
                <>
                  <img src={`http://localhost:3020/uploads/${user.photo}`} style={photoStyles} alt={user.name} />
                  <h1 style={nameStyles}>{user.name}</h1>
                  <p style={positionStyles}>{user.position}</p>
                  <p style={emailStyles}>{user.email}</p>
                  <p style={phoneStyles}>{user.phone}</p>
                  <Button variant="primary" onClick={handleShow}>Edit</Button>
                </>
              )}
            </div>
            <Modal show={showModal} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Profile</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Photo</Form.Label>
                    <Form.Control type="file" name="photo" onChange={handleFileChange} />
                    {user && user.photo && <img src={`http://localhost:3020/uploads/${user.photo}`} style={photoStyles} alt={user.name} />}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type="password" name="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </Form.Group>
                  <Button type="submit">Save</Button>
                </Form>
              </Modal.Body>
            </Modal>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Profil;
