import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import Router from "next/router";
import axios from "axios";
import { showErrorMessage, showSuccessMessage } from "../../../helpers/alerts";
import { API } from "../../../config";
import { isAuth, updateUser } from "../../../helpers/auth";
import withUser from "../../withUser";

const Profile = ({ user, token }) => {
    const [state, setState] = useState({
        name: user.name,
        email: user.email,
        password: "",
        error: "",
        success: "",
        buttonText: "Update",
    });

    const { name, email, password, error, success, buttonText } = state;

    const handleChange = (value) => (e) => {
        setState({
            ...state,
            [value]: e.target.value,
            error: "",
            success: "",
            buttonText: "Update",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState({
            ...state,
            error: "",
            success: "",
            buttonText: "Updating...",
        });

        try {
            const response = await axios.put(
                `${API}/user`,
                {
                    name,
                    password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            updateUser(response.data, () => {
                setState({
                    ...state,
                    error: "",
                    buttonText: "Updated",
                    success: "Profile updated",
                });
            });
        } catch (error) {
            setState({
                ...state,
                buttonText: "Update",
                error: error.response.data.error,
            });
        }
    };

    const updateForm = () => (
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
                    disabled
                />
            </div>
            <div className="form-group">
                <input
                    value={password}
                    onChange={handleChange("password")}
                    type="password"
                    className="form-control"
                    placeholder="Password"
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
                <h1>Update Profile</h1>
                <br />
                {success && showSuccessMessage(success)}
                {error && showErrorMessage(error)}
                {updateForm()}
            </div>
        </Layout>
    );
};

export default withUser(Profile);
