import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import axios from "axios";
import Resizer from "react-image-file-resizer";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { API } from "../../../config";
import { showErrorMessage, showSuccessMessage } from "../../../helpers/alerts";
import Layout from "../../../components/Layout";
import withAdmin from "../../withAdmin";
import "react-quill/dist/quill.bubble.css";

const Update = ({ oldCategory, token }) => {
    const [state, setState] = useState({
        name: oldCategory.name,
        error: "",
        success: "",
        buttonText: "Update",
        imagePreview: oldCategory.image.url,
        imageUri: "",
    });

    const [content, setContent] = useState(oldCategory.content);

    const { name, success, error, buttonText, imagePreview, imageUri } = state;

    const handleChange = (updatedField) => (e) => {
        setState({
            ...state,
            [updatedField]: e.target.value,
            error: "",
            success: "",
        });
    };

    const handleContent = (e) => {
        setContent(e);
        setState({ ...state, success: "", error: "" });
    };

    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                300,
                300,
                "JPEG",
                100,
                0,
                (uri) => {
                    resolve(uri);
                },
                "base64"
            );
        });

    const handleImage = async (event) => {
        let fileInput = false;
        if (event.target.files[0]) {
            fileInput = true;
        }

        if (fileInput) {
            const base64Image = await resizeFile(event.target.files[0]);
            setState({
                ...state,
                imageUri: base64Image,
                success: "",
                error: "",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState({ ...state, buttonText: "Updating..." });

        try {
            const response = await axios.put(
                `${API}/category/${oldCategory.slug}`,
                { name, content, imageUri },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setState({
                ...state,
                imagePreview: response.data.image.url,
                buttonText: "Create",
                success: "Category updated successfully",
            });
        } catch (error) {
            console.log(error);
            setState({
                ...state,
                buttonText: "Create",
                error: error.response.data.error,
            });
        }
    };

    const updateCategoryForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input
                    onChange={handleChange("name")}
                    type="text"
                    className="form-control"
                    value={name}
                    required
                />
            </div>
            <div className="form-group">
                <label className="text-muted">Content</label>
                <ReactQuill
                    value={content}
                    onChange={handleContent}
                    placeholder="Description"
                    theme="bubble"
                    className="pb-5 mb-3"
                    style={{ border: "1px solid #666" }}
                />
            </div>
            <div className="form-group">
                <label className="text-muted">Image Preview</label>
                <span>
                    <img
                        src={imagePreview}
                        alt="image preview"
                        className="ml-2"
                        style={{ height: "50px" }}
                    />
                </span>
                <input
                    onChange={handleImage}
                    type="file"
                    className="form-control"
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
                    <h1>Update category</h1>
                    <br />
                    {success && showSuccessMessage(success)}
                    {error && showErrorMessage(error)}
                    {updateCategoryForm()}
                </div>
            </div>
        </Layout>
    );
};

Update.getInitialProps = async ({ req, query, token }) => {
    const response = await axios.post(`${API}/category/${query.slug}`);
    return { oldCategory: response.data.category, token };
};

export default withAdmin(Update);
