import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InputForm from "../Element/Input";
import Button from "../Element/Button";
import { login } from "../../api/authService";
import { useAuth } from "../../context/useAuth";

const FormLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthToken, refreshCurrentUser, isAuthenticated, authLoading } =
    useAuth();
  const redirectTo = location.state?.from || "/";

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await login(username, password);
      const token =
        response?.token ||
        response?.access_token ||
        response?.data?.token ||
        response?.data?.access_token;

      if (!token) {
        throw new Error("Token login tidak ditemukan pada respons API.");
      }

      setAuthToken(token, rememberMe);
      await refreshCurrentUser(token);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const apiMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Username atau password salah.";
      setErrorMsg(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {errorMsg && (
        <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-400 p-2 rounded">
          {errorMsg}
        </div>
      )}
      <InputForm
        label="Username"
        type="text"
        placeholder="Masukan Username"
        name="username"
      />
      <InputForm
        label="Password"
        type="password"
        placeholder="Masukan Password"
        name="password"
      />

      <div className="flex items-center mb-6 mt-2">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="remember" className="ml-2 text-base text-slate-800">
          Remember Me
        </label>
      </div>

      <Button type="submit" classname="bg-primary hover:bg-opacity-90 mt-2">
        {isLoading ? "LOADING..." : "SIGN IN"}
      </Button>
    </form>
  );
};

export default FormLogin;
