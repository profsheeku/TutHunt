import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../config";
import Link from "next/link";
import { showErrorMessage, showSuccessMessage } from "../../../helpers/alerts";
import Layout from "../../../components/Layout";
import withAdmin from "../../withAdmin";

const Read = ({ user, token }) => {
    const [state, setState] = useState({
        error: "",
        success: "",
        categories: [],
    });

    const { success, error, categories } = state;

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const response = await axios.get(`${API}/categories`);
        setState({ ...state, categories: response.data });
    };

    const confirmDelete = (event, slug) => {
        event.preventDefault();
        let answer = window.confirm("Are you sure you want to delete?");
        if (answer) {
            handleDelete(slug);
        }
    };

    const handleDelete = async (slug) => {
        try {
            const response = await axios.delete(`${API}/category/${slug}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            loadCategories();
        } catch (error) {
            console.log("Category Delete", error);
        }
    };

    const listCategories = () =>
        categories.map((c, idx) => (
            <Link href={`/links/${c.slug}`} key={c._id}>
                <a
                    style={{ border: "1px solid red" }}
                    className="bg-light p-3 col-md-6"
                >
                    <div>
                        <div className="row">
                            <div className="col-md-3">
                                <img
                                    src={c.image && c.image.url}
                                    alt={c.name}
                                    style={{ width: "100px", height: "100px" }}
                                    className="pr-3"
                                />
                            </div>
                            <div className="col-md-6">
                                <h3>{c.name}</h3>
                            </div>
                            <div className="col-md-3">
                                <Link href={`/admin/category/${c.slug}`}>
                                    <button className="btn btn-sm btn-outline-success btn-block mb-1">
                                        Update
                                    </button>
                                </Link>
                                <button
                                    onClick={(e) => confirmDelete(e, c.slug)}
                                    className="btn btn-sm btn-outline-danger btn-block"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </a>
            </Link>
        ));

    return (
        <Layout>
            <div className="row">
                <div className="col">
                    <h1>List of categories</h1>
                    <br />
                </div>
            </div>

            <div className="row">{listCategories()}</div>
        </Layout>
    );
};

export default withAdmin(Read);
