import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";
import Head from "next/head";
import axios from "axios";
import renderHTML from "react-render-html";
import InfiniteScroll from "react-infinite-scroller";
import { API, APP_NAME } from "../../config";

const Links = ({
    query,
    category,
    links,
    totalLinks,
    linksLimit,
    linksSkip,
}) => {
    const [allLinks, setAllLinks] = useState(links);
    const [limit, setLimit] = useState(linksLimit);
    const [skip, setSkip] = useState(0);
    const [size, setSize] = useState(totalLinks);
    const [popular, setPopular] = useState([]);

    const stripHTML = (data) => data.replace(/<\/?[^>]+(>|$)/g, "");

    const head = () => (
        <Head>
            <title>
                {category.name} | {APP_NAME}
            </title>
            <meta
                name="description"
                content={stripHTML(category.content.substring(0, 160))}
            />
            <meta property="og:title" content={category.name} />
            <meta
                property="og:description"
                content={stripHTML(category.content.substring(0, 160))}
            />
            <meta property="og:image" content={category.image.url} />
            <meta property="og:image:secure_url" content={category.image.url} />
        </Head>
    );

    useEffect(() => {
        loadPopular();
    }, []);

    const loadPopular = async () => {
        const response = await axios.get(
            `${API}/link/popular/${category.slug}`
        );
        setPopular(response.data);
    };

    const handleClick = async (linkId) => {
        const response = await axios.put(`${API}/click-count`, { linkId });
        loadUpdatedLinks();
        loadPopular();
    };

    const loadUpdatedLinks = async () => {
        const response = await axios.post(`${API}/category/${query.slug}`);
        setAllLinks(response.data.links);
    };

    const listOfPopularLinks = () =>
        popular.map((l, idx) => (
            <div className="row alert alert-secondary p-2" key={idx}>
                <div className="col-md-8" onClick={() => handleClick(l._id)}>
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
                        {new Date(l.createdAt).toLocaleDateString()} by{" "}
                        {l.postedBy.name}
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
                </div>
            </div>
        ));

    const listOfLinks = () =>
        allLinks.map((l, idx) => (
            <div key={idx} className="row alert alert-primary p-2">
                <div className="col-md-8" onClick={(e) => handleClick(l._id)}>
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
                        {new Date(l.createdAt).toLocaleDateString()} by{" "}
                        {l.postedBy.name}
                    </span>
                    <br />
                    <span className="badge text-secondary pull-right">
                        {l.clicks} clicks
                    </span>
                </div>
                <div className="col-md-12">
                    <span className="badge text-dark">{l.type}</span>
                    {l.categories.map((c, i) => (
                        <span key={i} className="badge text-success">
                            {c.name}
                        </span>
                    ))}
                </div>
            </div>
        ));

    const loadMore = async () => {
        let toSkip = skip + limit;
        const response = await axios.post(`${API}/category/${query.slug}`, {
            skip: toSkip,
            limit,
        });
        setAllLinks([...allLinks, ...response.data.links]);
        setSize(response.data.links.length);
        setSkip(toSkip);
    };

    // const loadMoreButton = () => {
    //     return (
    //         size > 0 &&
    //         size >= limit && (
    //             <button
    //                 onClick={loadMore}
    //                 className="btn btn-outline-primary btn-lg"
    //             >
    //                 Load More
    //             </button>
    //         )
    //     );
    // };

    return (
        <React.Fragment>
            {head()}
            <Layout>
                <div className="row">
                    <div className="col-md-8">
                        <h1 className="display-4 font-weight-bold">
                            {category.name} - Tutorials
                        </h1>
                        <div className="lead alert alert-secondary pt-4">
                            {renderHTML(category.content)}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <img
                            src={category.image.url}
                            alt={category.name}
                            style={{ width: "auto", maxHeight: "200px" }}
                        />
                    </div>
                </div>
                <br />
                {/* <div className="row">
                <div className="col-md-8">{listOfLinks()}</div>
                <div className="col-md-4">
                    <h2 className="lead">Most popular in {category.name}</h2>
                    <p>Show popular links</p>
                </div>
            </div> */}
                {/* <div className="text-center pt-4 pb-5">{loadMoreButton()}</div> */}

                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    hasMore={size > 0 && size >= limit}
                    loader={
                        <h5 style={{ textAlign: "center" }}>Loading ...</h5>
                    }
                >
                    <div className="row">
                        <div className="col-md-8">{listOfLinks()}</div>
                        <div className="col-md-4">
                            <h2 className="lead">
                                Most popular in {category.name}
                            </h2>
                            <div className="p-3">{listOfPopularLinks()}</div>
                        </div>
                    </div>
                </InfiniteScroll>
            </Layout>
        </React.Fragment>
    );
};

Links.getInitialProps = async ({ query, req }) => {
    let skip = 0;
    let limit = 1;

    const response = await axios.post(`${API}/category/${query.slug}`, {
        skip,
        limit,
    });

    return {
        query,
        category: response.data.category,
        links: response.data.links,
        totalLinks: response.data.links.length,
        linksLimit: limit,
        linksSkip: skip,
    };
};

export default Links;
