import Layout from '../components/Layout';
import Navigation from '../components/Navbar';
import { Container, Row, Col, Button } from 'react-bootstrap';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Absent = () => {
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [isCheckOut, setIsCheckOut] = useState(false);

  useEffect(() => {
    // Fetch userId and name from token
    const token = localStorage.getItem('token');
    if (token) {
      const userIdx = JSON.parse(atob(token.split('.')[1])).id;
      setUserId(userIdx);

      const fetchUser = async () => {
        try {
          const response = await axios.get(`http://localhost:3020/users/${userIdx}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setName(response.data.user.name);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to fetch user data");
        }
      };
      
      fetchUser();

      const fetchAbsentData = async () => {
        try {
          const response = await axios.get(`http://localhost:3030/absents/user-id/${userIdx}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const absentData = response.data;
          const todayAbsent = absentData.absent[absentData.absent.length - 1];
          setIsCheckIn(todayAbsent && todayAbsent.check_in);
          setIsCheckOut(todayAbsent && todayAbsent.check_out);
        } catch (error) {
          console.error("Error fetching absent data:", error);
          toast.error("Failed to fetch absent data");
        }
      };

      fetchAbsentData();
    }
  }, []);

  useEffect(() => {
    if (status === 'masuk') {
      setIsCheckIn(true);
    } else if (status === 'keluar'){
      setIsCheckOut(true)
    }
  }, [status]);


  const handleCheckIn = async (status) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');

    setStatus(status);
    setDate(currentDate);
    setTime(currentTime);

    try {
      const token = localStorage.getItem('token');
      const checkResponse = await axios.post('http://localhost:3030/absents', {
        name: name,
        check_in: `${currentDate} ${currentTime}`,
        userId: userId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (checkResponse.status === 200) {
        console.log(`Check-${status} successful`);
        if (status === 'masuk') {
          setIsCheckIn(true);
        }
      } else {
        console.error(`Check-${status} failed`);
        toast.error(`Check-${status} failed`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Check-${status} failed`);
    }
  };

  const handleCheckOut = async (status) => {
    try {
      const currentDate = moment().format('YYYY-MM-DD');
      const currentTime = moment().format('HH:mm:ss');

      setStatus(status);
      setDate(currentDate);
      setTime(currentTime);

      const token = localStorage.getItem('token');
      const checkResponse = await axios.get(`http://localhost:3030/absents/user-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const todayCheck = checkResponse.data.absent[checkResponse.data.absent.length-1];
      
      if (!todayCheck || (todayCheck && !todayCheck.check_in)) {
        toast.error("Harus Check-in terlebih dahulu");
        alert("Harus Check-in terlebih dahulu")
        return;
      }

      if (todayCheck.check_out && status === 'pulang') {
        toast.error('Anda sudah check-out hari ini');
        alert("Anda sudah check-out hari ini")
        return;
      }

      const checkOutResponse = await axios.put(`http://localhost:3030/absents/${todayCheck.id}`, {
        name: name,
        check_in: todayCheck.check_in,
        userId: userId,
        check_out: moment().format('YYYY-MM-DD HH:mm:ss'),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (checkOutResponse.status === 200) {
        console.log("Check-out successful");
        setStatus('');
        setIsCheckOut(true);
      } else {
        console.error("Check-out failed");
        toast.error("Check-out failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Check-${status} failed`);
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

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '30px',
  };

  const statusStyles = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: status === 'masuk' ? '#28a745' : '#dc3545',
    marginBottom: '0',
  };

  const dateStyles = {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '0',
  };

  const timeStyles = {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '1rem',
  };

  const absentButtonStyles = {
    marginRight: '1rem',
  };

  return (
    <Layout>
      <Navigation/>
      <Container className="mt-5">
        <Row>
          <Col>
            <div style={containerStyles}>
              <h1 style={titleStyles}>Absent</h1>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button onClick={() => handleCheckIn('masuk')} style={absentButtonStyles} className="btn btn-primary mb-3 me-3" disabled={isCheckIn}>Check In</Button>
                <Button onClick={() => handleCheckOut('pulang')} style={absentButtonStyles} className="btn btn-danger mb-3" disabled={isCheckOut}>Check Out</Button>
              </div>
              <p style={statusStyles}>Status: {status === 'masuk' ? 'Masuk' : 'Pulang'}</p>
              <p style={dateStyles}>Date: {date}</p>
              <p style={timeStyles}>Time: {time}</p>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Absent;
