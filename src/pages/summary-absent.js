import Layout from '../components/Layout';
import Navigation from '../components/Navbar';
import { Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Summaryabsent = () => {
  const [startDate, setStartDate] = useState(moment().startOf('month'));
  const [endDate, setEndDate] = useState(moment().endOf('month'));
  const [absentData, setAbsentData] = useState([]);

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

        const response = await axios.get(`http://localhost:3030/absents/user-id/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            start_date: `${startDate.format('YYYY-MM-DD')} 00:00:00`,
            end_date: `${endDate.format('YYYY-MM-DD')} 23:59:59`
          }
        });
        if (response.status === 200) {
          setAbsentData(response.data.absent);
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
          const response = await axios.get(`http://localhost:3030/absents/user-id/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.status === 200) {
            setAbsentData(response.data.absent);
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

  return (
    <Layout>
      <Navigation />
      <Container className="mt-5">
        <Row>
          <Col>
            <h1>Summary Absent</h1>
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
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {absentData.map((item, index) => (
                  <tr key={index}>
                    <td>{moment(item.check_in).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td>{item.check_out ? moment(item.check_out).format('YYYY-MM-DD HH:mm:ss') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Summaryabsent;
