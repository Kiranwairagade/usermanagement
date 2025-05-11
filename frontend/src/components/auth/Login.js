import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "./Login.css";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card small-card">
        <div className="login-logo">
          <span className="logo-circle">⚪⚪⚪</span>
        </div>
        <h3>Login to your account</h3>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="login-form">
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`input-field small-input ${
                    touched.email && errors.email ? "is-invalid" : ""
                  }`}
                  placeholder="Username@gmail.com"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`input-field small-input ${
                    touched.password && errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="Password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              {loginError && <div className="error-msg">{loginError}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-btn small-btn"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              <div className="login-links">
                <Link to="/signup">Signup</Link>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
