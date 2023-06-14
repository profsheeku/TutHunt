import Layout from "../../components/Layout";
import Link from "next/link";
import Router from "next/router";
import axios from "axios";
import { API } from "../../config";
import { getCookie } from "../../helpers/auth";
import withUser from "../withUser";

const User = ({ user, userLinks, token }) => {
    const confirmDelete = (event, id) => {
        event.preventDefault();
        let answer = window.confirm("Are you sure you want to delete?");
        if (answer) {
            handleDelete(id);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${API}/link/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            Router.replace("/user");
        } catch (error) {
            console.log("Link Delete", error);
        }
    };

    const listOfLinks = () =>
        userLinks.map((l, idx) => (
            <div className="row alert alert-primary p-2" key={idx}>
                <div className="col-md-8">
                    <a href={l.url} target="_blank">
                        <h5 className="pt-2">{l.title}</h5>
                        <h6
                            className="pt-2 text-danger"
                            style={{ fontSize: "12px" }}
                        >
                            {l.url}
                        </h6>
                    </a>
                </div>
                <div className="col-md-4 pt-2">
                    <span className="pull-right">
                        {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="col-md-12">
                    <span className="badge text-dark">{l.type}</span>
                    {l.categories.map((c, i) => (
                        <span key={i} className="badge text-success">
                            {c.name}
                        </span>
                    ))}
                    <span className="badge text-secondary">
                        {l.clicks} clicks
                    </span>

                    <Link href={`/user/link/${l._id}`}>
                        <span className="badge text-primary pull-right">
                            Update
                        </span>
                    </Link>

                    <span
                        onClick={(e) => confirmDelete(e, l._id)}
                        className="badge text-danger pull-right"
                    >
                        Delete
                    </span>
                </div>
            </div>
        ));

    return (
        <Layout>
            <h1>
                {user.name}'s Dashboard{" "}
                <span className="text-success">/{user.role}</span>
            </h1>
            <hr />
            <div className="row">
                <div className="col-md-4">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link href="/user/link/create">
                                <a className="nav link">
                                    Submit a new tutorial
                                </a>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/user/profile/update">
                                <a className="nav link">Update profile</a>
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="col-md-8">
                    <h2>Your Links</h2>
                    <br />
                    {listOfLinks()}
                </div>
            </div>
        </Layout>
    );
};

export default withUser(User);
