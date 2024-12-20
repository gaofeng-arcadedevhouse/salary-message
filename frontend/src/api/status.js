export const showMessage = (status) => {
    let message = "";
    switch (status) {
        case 400:
            message = "Bad Request (400)";
            break;
        case 401:
            message = "Unauthorized, please log in again (401)";
            break;
        case 403:
            message = "Access Denied (403)";
            break;
        case 404:
            message = "Request Error (404)";
            break;
        case 408:
            message = "Request Timeout (408)";
            break;
        case 500:
            message = "Internal Server Error (500)";
            break;
        case 501:
            message = "Not Implemented (501)";
            break;
        case 502:
            message = "Network Error (502)";
            break;
        case 503:
            message = "Service Unavailable (503)";
            break;
        case 504:
            message = "Network Timeout (504)";
            break;
        case 505:
            message = "HTTP Version Not Supported (505)";
            break;
        default:
            message = `Connection Error (${status})!`;
    }
    return `${message}, please check your network or contact the administrator!`;
};
 
