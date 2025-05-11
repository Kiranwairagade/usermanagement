import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import './Login.css';

const signupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Must contain uppercase, lowercase, number & special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  terms: Yup.boolean().oneOf([true], 'Accept terms and conditions')
});

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      };
      const result = await register(userData);
      if (result.success) {
        toast.success('Registration successful! Please log in.');
        resetForm();
        navigate('/login');
      } else {
        setSignupError(result.message);
      }
    } catch (error) {
      setSignupError('Something went wrong. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card small-card">
        <div className="login-logo">
          <div className="logo-circle">S</div>
        </div>
        <h3 style={{ marginBottom: '15px' }}>Create Account</h3>

        {signupError && <div className="error-msg">{signupError}</div>}

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false
          }}
          validationSchema={signupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="login-form">
              <div className="row-group">
                <div className="input-group " style={{ width : '50%' }}>
                  <label htmlFor="firstName">First Name</label>
                  <Field
                    type="text"
                    name="firstName"
                    id="firstName"
                    className={`input-field small-input  ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`}
                    placeholder="First Name"
                  />
                  <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                </div>

                <div className="input-group " style={{ width : '50%' }}>
                  <label htmlFor="lastName">Last Name</label>
                  <Field
                    type="text"
                    name="lastName"
                    id="lastName"
                    className={`input-field small-input ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`}
                    placeholder="Last Name"
                  />
                  <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`input-field small-input ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  placeholder="Enter email"
                />
                <ErrorMessage name="email" component="div" className="invalid-feedback" />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`input-field small-input ${touched.password && errors.password ? 'is-invalid' : ''}`}
                  placeholder="Password"
                />
                <ErrorMessage name="password" component="div" className="invalid-feedback" />
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className={`input-field small-input ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm Password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
              </div>

              <div className="form-check">
                <Field
                  type="checkbox"
                  name="terms"
                  id="terms"
                  className={`form-check-input ${touched.terms && errors.terms ? 'is-invalid' : ''}`}
                />
                <label className="form-check-label" htmlFor="terms">
                  I accept <Link to="/terms">terms & conditions</Link>
                </label>
                <ErrorMessage name="terms" component="div" className="invalid-feedback" />
              </div>

              <button type="submit" className="login-btn small-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Sign Up'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="login-links" >
        Already have an account?<Link to="/login" style={{paddingRight:'260px'}}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
