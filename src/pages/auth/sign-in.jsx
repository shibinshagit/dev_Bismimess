import React, { useEffect } from 'react';
import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/reducers/authSlice';
import { login } from '@/services/apiCalls';

export function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      navigate('/dashboard/home');
    }
  }, [token, navigate]);


  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const email = event.target.email.value;
    const password = event.target.password.value;
  
    try {
      const response = await login(email, password)
      if (response.success === true) {
        const  token  = response.token;
        dispatch(loginSuccess({ token }));
        alert('Login successful');
        navigate('/dashboard/home');
      } else {
        alert('Login failed');
        console.error('Error during login:', response);
      }
    } catch (error) {
      alert('An error occurred during login');
      console.error('Error during login:', error);
    }
  };
  
  return (
    <>
      <section className="m-8 flex gap-4 justify-center">
        <div className="w-full lg:w-3/5 mt-24">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-4">Admin-BismiMess</Typography>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
            <div className="mb-1 flex flex-col gap-6">
           




              <Input
                size="lg" 
                type='email'
                name="email"
                label="Email"
                required
              />   
              <Input
                type="password"
                size="lg"
                placeholder="********"
                name="password"
                label="Password"
               
                required
              />
            </div>
            <Button type="submit" className="mt-6" fullWidth>
              Log In
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}

export default SignIn;
