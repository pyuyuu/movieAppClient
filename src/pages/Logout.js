import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from '../UserContext';
import { toast } from 'react-hot-toast';

export default function Logout() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    useEffect(() => {
        setUser(null);
        localStorage.removeItem('token');
        navigate('/');
        toast.success('Logout successful');
    }, [setUser, navigate]);

    return null;
}