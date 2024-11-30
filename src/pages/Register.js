import { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import { toast } from 'react-hot-toast';

export default function Register () {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isActive, setIsActive ] = useState(false);

    function registerUser(e) {
        e.preventDefault();

        fetch(`https://movieapp-api-lms1.onrender.com/users/register`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === "Registered Successfully") {
                setEmail('');
                setPassword('');
                toast.success('Registration successful!');
                navigate('/login');
            } else {
                toast.error('Registration failed. Please try again.');
            }
        });
    };

    useEffect(() => {
        const isFormValid = 
            email.includes('@') &&
            password.length >= 8;

        setIsActive(isFormValid);
    }, [email, password]);
    
    return (
        <Form onSubmit={registerUser}>
            <h1 className="text-center my-5">Register</h1>
            <Form.Group className='mb-3'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='text' placeholder='Enter email' required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' placeholder='Enter password' required value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Button type='submit' disabled={!isActive}>Register</Button>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </Form>
    )
}