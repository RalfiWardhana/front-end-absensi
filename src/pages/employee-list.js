import Layout from '../components/Layout';
import Navigation from '../components/Navbar';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState({
        id: '',
        name: '',
        email: '',
        role: '',
        phone: '',
        photo: '',
        position: ''
    });

    const photoStyles = {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginBottom: '1rem',
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3020/users', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setEmployees(response.data.users);
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to fetch employees');
            }
        };

        fetchEmployees();
    }, []);

    useEffect(() => {
        if (!showModal) {
            const fetchEmployees = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:3020/users', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setEmployees(response.data.users);
                } catch (error) {
                    console.error('Error:', error);
                    toast.error('Failed to fetch employees');
                }
            };

            fetchEmployees();
        }
    }, [showModal]);

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSaveChanges = async () => {
        try {
            const { id, name, email, role, phone, position, photo } = selectedEmployee;
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
    
            let photoFileName = photo;
            if (photo instanceof File) {
                const uploadData = new FormData();
                uploadData.append('photo', photo);
                const uploadResponse = await axios.post('http://localhost:3020/users/upload', uploadData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                photoFileName = uploadResponse.data.fileName;
            }
    
            const userData = {
                name,
                email,
                role,
                phone,
                position,
                photo: photoFileName
            };
    
            await axios.put(`http://localhost:3020/users/${id}`, userData, config);
    
            toast.success('Employee data updated successfully');
            setShowModal(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update employee data');
        }
    };
    

    return (
        <Layout>
            <Navigation />
            <Container className="mt-5">
                <Row>
                    <Col>
                        <h1>Employee List</h1>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Position</th>
                                    <th>Phone</th>
                                    <th>Photo</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee, index) => (
                                    <tr key={index}>
                                        <td>{employee.name}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.role}</td>
                                        <td>{employee.position}</td>
                                        <td>{employee.phone}</td>
                                        <td>
                                            <img
                                                src={`http://localhost:3020/uploads/${employee.photo}`}
                                                alt={employee.name}
                                                style={{ width: '100px', height: 'auto' }}
                                            />
                                        </td>
                                        <td>
                                            <Button variant="primary" onClick={() => handleEdit(employee)}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={selectedEmployee.name} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={selectedEmployee.email} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="role">
                            <Form.Label>Role</Form.Label>
                            <Form.Control as="select" name="role" value={selectedEmployee.role} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, role: e.target.value })}>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="position">
                            <Form.Label>Position</Form.Label>
                            <Form.Control type="text" name="position" value={selectedEmployee.position} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, position: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="phone">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control type="text" name="phone" value={selectedEmployee.phone} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="photo">
                            <Form.Label>Photo</Form.Label>
                            <Form.Control type="file" name="photo" onChange={(e) => setSelectedEmployee({ ...selectedEmployee, photo: e.target.files[0] })} />
                            {selectedEmployee && selectedEmployee.photo && <img src={`http://localhost:3020/uploads/${selectedEmployee.photo}`} style={photoStyles} alt={selectedEmployee.name} />}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
};

export default EmployeeList;
