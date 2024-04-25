import Layout from '../components/Layout';
import Navigation from '../components/Navbar';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AbsentList = () => {
  const [startDate, setStartDate] = useState(moment().startOf('month'));
  const [endDate, setEndDate] = useState(moment().endOf('month'));
  const [absentData, setAbsentData] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    photo: '',
    position: ''
  });
  const [photoFile, setPhotoFile] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const date = moment(value);

    if (name === 'startDate') {
      if (date.isSameOrAfter(endDate)) {
        toast.error('The start date must be less than the end date.');
        return;
      }
      setStartDate(date);
    } else if (name === 'endDate') {
      if (date.isSameOrBefore(startDate)) {
        toast.error('The end date must be greater than the start date');
        return;
      }
      setEndDate(date);
    }
  };

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).id;

        const response = await axios.get(`http://localhost:3030/absents`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            start_date: `${startDate.format('YYYY-MM-DD')} 00:00:00`,
            end_date: `${endDate.format('YYYY-MM-DD')} 23:59:59`
          }
        });
        if (response.status === 200) {
          setAbsentData(response.data.absents);
        } else {
          console.error("Failed to fetch absent data");
          toast.error("Failed to fetch absent data");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch absent data");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userId = JSON.parse(atob(token.split('.')[1])).id;

      const fetchAbsentData = async () => {
        try {
          const response = await axios.get(`http://localhost:3030/absents`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.status === 200) {
            setAbsentData(response.data.absents);
          } else {
            console.error("Failed to fetch absent data");
            toast.error("Failed to fetch absent data");
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Failed to fetch absent data");
        }
      };

      fetchAbsentData();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleAddEmployee = async () => {
    const { name, email, password, phone, position } = formData;
    if (!name || !email || !password || !phone || !position) {
      toast.error('All fields are required');
      return;
    }
    
    try {
      let photoUrl = '';
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const photoResponse = await axios.post(`http://localhost:3020/users/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        photoUrl = photoResponse.data.fileName;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3020/users`, {
        ...formData,
        photo: photoUrl
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        toast.success("Employee added successfully");
        setShow(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user',
          phone: '',
          photo: '',
          position: ''
        });
        setPhotoFile(null);
      } else {
        console.error("Failed to add employee");
        toast.error("Failed to add employee");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add employee");
    }
  };

  return (
    <Layout>
      <Navigation />
      <Container className="mt-5">
        <Row className="justify-content-between mb-3">
          <Col>
            <h1>List All Absent</h1>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={handleShow}>Add Employee</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <form>
              <div className="d-flex mb-3">
                <div className="me-3">
                  <label htmlFor="startDate" className="form-label">Date Filter (From)</label>
                  <input type="date" name="startDate" className="form-control" value={startDate.format('YYYY-MM-DD')} onChange={handleFilterChange} />
                </div>
                <div>
                  <label htmlFor="endDate" className="form-label">Date Filter (To)</label>
                  <input type="date" name="endDate" className="form-control" value={endDate.format('YYYY-MM-DD')} onChange={handleFilterChange} />
                </div>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleSearch}>Search</button>
            </form>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {absentData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{moment(item.check_in).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td>{item.check_out ? moment(item.check_out).format('YYYY-MM-DD HH:mm:ss') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Col>
        </Row>
      </Container>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Name" name="name" value={formData.name} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" name="password" value={formData.password} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" placeholder="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPhoto">
              <Form.Label>Upload Photo</Form.Label>
              <Form.Control type="file" name="photo" onChange={handleFileChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPosition">
              <Form.Label>Position</Form.Label>
              <Form.Control type="text" placeholder="Position" name="position" value={formData.position} onChange={handleInputChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddEmployee}>
            Save Employee
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default AbsentList;
