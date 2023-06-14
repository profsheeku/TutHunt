import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import axios from "axios";
import { showErrorMessage, showSuccessMessage } from "../../../helpers/alerts";
import { API } from "../../../config";
import { withRouter } from "next/router";
import Layout from "../../../components/Layout";

const ActivateAccount = ({ router }) => {
    const [state, setState] = useState({
        name: "",
        token: "",
        buttonText: "Activate account",
        success: "",
        error: "",
    });

    const { name, token, buttonText, success, error } = state;

    useEffect(() => {
        let token = router.query.id;
        if (token) {
            const { name } = jwt.decode(token);
            setState({ ...state, name, token });
        }
    }, [router]);

    const clickSubmit = async (e) => {
        e.preventDefault();

        setState({ ...state, buttonText: "Activating..." });

        try {
            const response = await axios.post(`${API}/register/activate`, {
                token,
            });
            setState({
                ...state,
                name: "",
                token: "",
                buttonText: "Activated!",
                success: response.data.message,
            });
        } catch (error) {
            setState({
                ...state,
                buttonText: "Activate account",
                error: error.response.data.error,
            });
        }
    };

    return (
        <Layout>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h1>We are all set to activate your account, {name}</h1>
                    <br />
                    {success && showSuccessMessage(success)}
                    {error && showSuccessMessage(error)}
                    <button
                        className="btn btn-outline-danger btn-block"
                        onClick={clickSubmit}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default withRouter(ActivateAccount);
