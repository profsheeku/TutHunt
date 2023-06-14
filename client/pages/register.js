import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Router from "next/router";
import axios from "axios";
import { showErrorMessage, showSuccessMessage } from "../helpers/alerts";
import { API } from "../config";
import { isAuth } from "../helpers/auth";

const Register = () => {
    const [state, setState] = useState({
        name: "",
        email: "",
        password: "",
        error: "",
        success: "",
        buttonText: "Register",
    });

    const { name, email, password, error, success, buttonText } = state;

    useEffect(() => {
        isAuth() && Router.push("/");
    }, []);

    const handleChange = (value) => (e) => {
        setState({
            ...state,
            [value]: e.target.value,
            error: "",
            success: "",
            buttonText: "Register",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState({
            ...state,
            error: "",
            success: "",
            buttonText: "Registering",
        });

        try {
            const response = await axios.post(`${API}/register`, {
                name,
                email,
                password,
            });
            setState({
                ...state,
                name: "",
                email: "",
                password: "",
                error: "",
                buttonText: "Submitted",
                success: response.data.message,
            });
        } catch (error) {
            setState({
                ...state,
                buttonText: "Register",
                error: error.response.data.error,
            });
        }
    };

    const registerForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    value={name}
                    onChange={handleChange("name")}
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    required
                />
            </div>
            <div className="form-group">
                <input
                    value={email}
                    onChange={handleChange("email")}
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    required
                />
            </div>
            <div className="form-group">
                <input
                    value={password}
                    onChange={handleChange("password")}
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    required
                />
            </div>
            <div className="form-group">
                <button className="btn btn-outline-warning">
                    {buttonText}
                </button>
            </div>
        </form>
    );

    return (
        <Layout>
            <div className="col-md-6 offset-md-3">
                <h1>Register</h1>
                <br />
                {success && showSuccessMessage(success)}
                {error && showErrorMessage(error)}
                {registerForm()}
            </div>
        </Layout>
    );
};

export default Register;
