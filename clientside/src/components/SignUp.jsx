import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import { Login } from "../redux/userSlice";
import { apiRequest } from "../utils";

const SignUp = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(true);
  const [accountType, setAccountType] = useState("seeker");
  const [errMsg, setErrMsg] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  let from = location.state?.from?.pathname || "/";

  const closeModal = () => setOpen(false);

  const onSubmit = async (data) => {
    let URL = null;

    if (isRegister) {
      if (accountType === "seeker") {
        URL = "auth/register";
      } else URL = "companies/register";
    } else {
      if (accountType === "seeker") {
        URL = "auth/login";
      } else {
        URL = "companies/login";
      }
    }

    try {
      const res = await apiRequest({ 
        method: "POST",
         url: URL, 
         data: data
         });

      if (res.status === "failed") {
        setErrMsg(res?.message);
      } else {
        setErrMsg("");
        const data = {
          token: res?.token,
          user: res?.user,
        };
        dispatch(Login(data));
        localStorage.setItem("userInfo", JSON.stringify(data));
        window.location.replace(from);
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Transition appear show={open || false}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-xl font-semibold leading-6 text-gray-900">
                  {isRegister ? "Create Account" : "Account Sign In"}
                </Dialog.Title>

                {/* Account Type Toggle */}
                <div className="w-full flex items-center justify-center py-4">
                  <button
                    className={`flex-1 px-4 py-2 rounded text-sm outline-none ${
                      accountType === "seeker"
                        ? "bg-[#1d4fd862] text-blue-900 font-semibold"
                        : "bg-white border border-blue-400"
                    }`}
                    onClick={() => setAccountType("seeker")}
                  >
                    User Account
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded text-sm outline-none ${
                      accountType !== "seeker"
                        ? "bg-[#1d4fd862] text-blue-900 font-semibold"
                        : "bg-white border border-blue-400"
                    }`}
                    onClick={() => setAccountType("company")}
                  >
                    Company Account
                  </button>
                </div>

                {/* Form */}
                <form
                  className="w-full flex flex-col gap-5"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <TextInput
                    name="email"
                    label="Email Address"
                    placeholder="email@example.com"
                    type="email"
                    register={register("email", {
                      required: "Email is required!",
                    })}
                    error={errors.email?.message}
                  />

                  {/* Conditional Fields */}
                  {isRegister && (
                    <div className="w-full flex gap-2">
                      <div
                        className={`${
                          accountType === "seeker" ? "w-1/2" : "w-full"
                        }`}
                      >
                        <TextInput
                          name={accountType === "seeker" ? "firstName" : "name"}
                          label={
                            accountType === "seeker"
                              ? "First Name"
                              : "Company Name"
                          }
                          placeholder={
                            accountType === "seeker" ? "James" : "Company"
                          }
                          type="text"
                          register={register(
                            accountType === "seeker" ? "firstName" : "name",
                            {
                              required: `${
                                accountType === "seeker"
                                  ? "First Name"
                                  : "Company Name"
                              } is required!`,
                            }
                          )}
                          error={
                            accountType === "seeker"
                              ? errors.firstName?.message
                              : errors.name?.message
                          }
                        />
                      </div>
                      {accountType === "seeker" && (
                        <div className="w-1/2">
                          <TextInput
                            name="lastName"
                            label="Last Name"
                            placeholder="Wagonner"
                            type="text"
                            register={register("lastName", {
                              required: "Last Name is required!",
                            })}
                            error={errors.lastName?.message}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Password Fields */}
                  <div className="w-full flex gap-2">
                    <TextInput
                      name="password"
                      label="Password"
                      placeholder="Password"
                      type="password"
                      register={register("password", {
                        required: "Password is required!",
                      })}
                      error={errors.password?.message}
                    />
                    {isRegister && (
                      <TextInput
                        name="cPassword"
                        label="Confirm Password"
                        placeholder="Password"
                        type="password"
                        register={register("cPassword", {
                          validate: (value) =>
                            value === getValues("password") ||
                            "Passwords do not match",
                        })}
                        error={errors.cPassword?.message}
                      />
                    )}
                  </div>

                  {/* Error Message */}
                  {errMsg && (
                    <span className="text-red-500 text-sm">{errMsg}</span>
                  )}

                  {/* Submit Button */}
                  <div className="mt-4">
                    <CustomButton
                      type="submit"
                      containerStyles="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded"
                      title={isRegister ? "Create Account" : "Login"}
                    />
                  </div>
                </form>

                {/* Toggle between Register and Login */}
                <p className="text-sm mt-4 text-gray-600">
                  {isRegister
                    ? "Already have an account?"
                    : "Don't have an account?"}
                  <span
                    className="text-blue-600 ml-2 cursor-pointer"
                    onClick={() => setIsRegister(!isRegister)}
                  >
                    {isRegister ? "Login" : "Sign Up"}
                  </span>
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SignUp;
