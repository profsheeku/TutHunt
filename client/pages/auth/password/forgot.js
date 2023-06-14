import { useState } from "react";
import axios from "axios";
import { showErrorMessage, showSuccessMessage } from "../../../helpers/alerts";
import { API } from "../../../config";
import Router from "next/router";
import Layout from "../../../components/Layout";

const ForgotPassword = () => {
    const [state, setState] = useState({
        email: "",
        buttonText: "Send reset link",
        success: "",
        error: "",
    });

    const { email, buttonText, success, error } = state;

    const handleChange = (e) => {
        setState({ ...state, email: e.target.value, success: "", error: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState({
            ...state,
            buttonText: "Sending...",
        });
        try {
            const response = await axios.put(`${API}/forgot-password`, {
                email,
            });
            setState({
                ...state,
                email: "",
                buttonText: "Done",
                success: response.data.message,
            });
        } catch (error) {
            setState({
                ...state,
                buttonText: "Send reset link",
                error: error.response.data.error,
            });
        }
    };

    const passwordForgotForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    type="email"
                    className="form-control"
                    onChange={handleChange}
                    value={email}
                    placeholder="Type your email"
                    required
                />
            </div>
            <div>
                <button className="btn btn-outline-danger">{buttonText}</button>
            </div>
        </form>
    );

    return (
        <Layout>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h1>Forgot Password</h1>
                    <br />
                    {success && showSuccessMessage(success)}
                    {error && showErrorMessage(error)}
                    {passwordForgotForm()}
                </div>
            </div>
        </Layout>
    );
};

export default ForgotPassword;
