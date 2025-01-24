import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { office1 } from "../assets";
import { SignUp } from "../components/Index";

const Auth = () => {
  const { user } = useSelector((state) => state.user);
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  let from = location?.state?.from?.pathname || "/";

  if (user?.token) {
   return window.location.replace(from);
  }

  return (
    <div className='w-full '>
      <img src={office1} alt='Office' className='object-contain ' />
      <SignUp open={open} setOpen={setOpen} />
    </div>
  );
};

export default Auth;
