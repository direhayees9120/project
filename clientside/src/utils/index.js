import axios from "axios";

const API_URL = "http://localhost:5500/api-v1/";

export const API = axios.create({
    baseURL: API_URL,
    responseType: "json",
});

export const apiRequest = async ({ method = "GET", token, data, url = "" }) => {
    try {
        const result = await API({
            method,
            data,
            url,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
        return result.data; // Return response data
    } catch (error) {
        const err = error.response?.data || { success: false, message: "Unknown error occurred" };
        console.log(err);
        return { status: err.success, message: err.message };
    }
};

export const handleFileUpload = async (uploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("upload_preset", "jobhunt");

    try {
        const response = await axios.post(
            "https://api.cloudinary.com/v1_1/dtsbb2h3e/image/upload",
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error(error);
        return null; // Return null on error
    }
};

export const updateURL = ({
    pageNum,
    cmpLoc,
    sort,
    navigate,
    location,
    query,
    jType,
    exp,
}) => {
    const params = new URLSearchParams();

    if (pageNum && pageNum > 1) {
        params.set("page", pageNum);
    }
    if (cmpLoc) {
        params.set("cmpLoc", cmpLoc);
    }
    if (sort) {
        params.set("sort", sort);
    }
    if (location) {
        params.set("location", location);
    }
    if (query) {
        params.set("searchQuery", query);
    }
    if (jType) {
        params.set("jType", jType);
    }
    if (exp) {
        params.set("exp", exp);
    }

    const newURL = `${location.pathname}?${params.toString()}`;
    navigate(newURL, { replace: true });
    return newURL;
};
