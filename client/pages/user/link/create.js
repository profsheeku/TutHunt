import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import axios from "axios";
import { getCookie, isAuth } from "../../../helpers/auth";
import { API } from "../../../config";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";

const Create = ({ token }) => {
    const [state, setState] = useState({
        title: "",
        url: "",
        categories: [],
        loadedCategories: [],
        type: "",
        success: "",
        error: "",
    });

    const { title, url, categories, loadedCategories, type, success, error } =
        state;

    useEffect(() => {
        loadCategories();
    }, [success]);

    const loadCategories = async () => {
        const response = await axios.get(`${API}/categories`);
        setState({ ...state, loadedCategories: response.data });
    };

    const handleTitleChange = (e) => {
        setState({ ...state, title: e.target.value, error: "", success: "" });
    };

    const handleURLChange = (e) => {
        setState({ ...state, url: e.target.value, error: "", success: "" });
    };

    const handleTypeClick = (e) => {
        setState({ ...state, type: e.target.value, success: "", error: "" });
    };

    const showTypes = () => (
        <React.Fragment>
            <div className="form-check ml-4">
                <label className="form-check-label">
                    <input
                        type="radio"
                        onClick={handleTypeClick}
                        checked={type === "free"}
                        value="free"
                        className="form-check-input"
                        name="type"
                    />
                    Free
                </label>
            </div>
            <div className="form-check ml-4">
                <label className="form-check-label">
                    <input
                        type="radio"
                        onClick={handleTypeClick}
                        checked={type === "paid"}
                        value="paid"
                        className="form-check-input"
                        name="type"
                    />
                    Paid
                </label>
            </div>
        </React.Fragment>
    );

    const handleToggle = (c) => {
        // return the first index or -1
        const clickedCategory = categories.indexOf(c);
        const all = [...categories];

        if (clickedCategory === -1) {
            all.push(c);
        } else {
            all.splice(clickedCategory, 1);
        }

        setState({ ...state, categories: all, success: "", error: "" });
    };

    const showCategories = () => {
        return (
            loadedCategories &&
            loadedCategories.map((c, idx) => (
                <li className="list-unstyled" key={c._id}>
                    <input
                        type="checkbox"
                        onChange={() => handleToggle(c._id)}
                        className="mr-2"
                    />
                    <label className="form-check-label">{c.name}</label>
                </li>
            ))
        );
    };

    const submitLinkForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="text-muted">Title</label>
                <input
                    type="text"
                    className="form-control"
                    onChange={handleTitleChange}
                    value={title}
                />
            </div>
            <div className="form-group">
                <label className="text-muted">URL</label>
                <input
                    type="url"
                    className="form-control"
                    onChange={handleURLChange}
                    value={url}
                />
            </div>
            <div>
                <button
                    disabled={!token}
                    className="btn btn-outline-danger"
                    type="submit"
                >
                    {isAuth() || token ? "Post" : "Login to Post"}
                </button>
            </div>
        </form>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = axios.post(
                `${API}/link`,
                {
                    title,
                    url,
                    categories,
                    type,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setState({
                ...state,
                title: "",
                url: "",
                success: "Link has been created",
                error: "",
                loadedCategories: [],
                categories: [],
                type: "",
            });
        } catch (error) {
            setState({ ...state, error: error.response.data.error });
        }
    };

    return (
        <Layout>
            <div className="row">
                <div className="col-md-12">
                    <h1>Submit Tutorial Link</h1>
                    <br />
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label className="text-muted mr-4">Category</label>
                        <ul style={{ maxHeight: "100px", overflowY: "scroll" }}>
                            {showCategories()}
                        </ul>
                    </div>
                    <div className="form-group">
                        <label className="text-muted mr-4">Type</label>
                        {showTypes()}
                    </div>
                </div>
                <div className="col-md-8">
                    {success && showSuccessMessage(success)}
                    {error && showErrorMessage(error)}
                    {submitLinkForm()}
                </div>
            </div>
        </Layout>
    );
};

Create.getInitialProps = ({ req }) => {
    const token = getCookie("token", req);
    return { token };
};

export default Create;
